from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Body
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta, datetime, timedelta as td
import models, schemas, database, auth, ai_service
import os
import shutil
import uuid
import random
import logging

# Set up some basic logging so we aren't completely blind in production
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Make sure our database tables actually exist before we do anything
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Shop Sense API v3", description="The engine powering our multi-vendor platform.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directory for uploads
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# --- Dependency ---
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    """Run some tasks when the server boots up, like ensuring we have an admin user."""
    logger.info("Starting up Shop Sense API... checking for admin user.")
    db = database.SessionLocal()
    admin_email = "shopesenseadmin@gmail.com"
    admin = db.query(models.User).filter(models.User.email == admin_email).first()
    
    if not admin:
        logger.info("No admin found. Creating the default admin account.")
        hashed_pw = auth.get_password_hash("shopsensepassword")
        new_admin = models.User(
            first_name="Admin", last_name="User",
            email=admin_email, hashed_password=hashed_pw, 
            role="admin", status="active"
        )
        db.add(new_admin)
        db.commit()
    db.close()

# --- Authentication Routes ---
@app.post("/auth/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Handles new user registrations. Vendors get set to 'pending' for admin review."""
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        # Don't let them register twice!
        raise HTTPException(status_code=400, detail="Oops, looks like this email is already registered!")
    
    # Hash the password before saving (security first!)
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_pw,
        role=user.role,
        status="pending" if user.role == "vendor" else "active",
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        address=user.address,
        business_name=user.business_name,
        business_category=user.business_category,
        gst_number=user.gst_number,
        joined_date=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log activity for vendors
    if new_user.role == "vendor":
        activity = models.VendorActivity(
            vendor_id=new_user.id, admin_name="System", action="Created",
            new_status="pending", remarks="Vendor registered."
        )
        db.add(activity)
        db.commit()
        
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Logs the user in and hands them a shiny new JWT."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Verify both existence and password in one go
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Failed login attempt for {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/reset-password")
def reset_password(req: schemas.PasswordReset, db: Session = Depends(get_db)):
    """Simple password reset. (In a real app, we'd send an email with a token first!)"""
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="We couldn't find an account with that email.")
    
    user.hashed_password = auth.get_password_hash(req.new_password)
    db.commit()
    logger.info(f"Password reset successfully for {req.email}")
    return {"message": "Your password has been updated successfully."}

@app.get("/auth/me", response_model=schemas.User)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Admin Routes ---
@app.get("/admin/vendors")
def get_vendors(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    vendors = db.query(models.User).filter(models.User.role == "vendor").all()
    
    vendor_data = []
    for vendor in vendors:
        product_count = db.query(models.Product).filter(models.Product.vendor_id == vendor.id).count()
        orders = db.query(models.Order).filter(models.Order.vendor_id == vendor.id).all()
        revenue = sum(o.amount for o in orders)
        
        vendor_data.append({
            "id": vendor.id,
            "first_name": vendor.first_name,
            "last_name": vendor.last_name,
            "email": vendor.email,
            "phone_number": vendor.phone_number,
            "business_name": vendor.business_name,
            "status": vendor.status,
            "rating": vendor.rating,
            "products": product_count,
            "orders": len(orders),
            "revenue": revenue
        })
        
    return {"vendors": vendor_data}

@app.get("/admin/vendor-activities")
def get_vendor_activities(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    activities = db.query(models.VendorActivity).order_by(models.VendorActivity.created_at.desc()).all()
    res = []
    for act in activities:
        vendor = db.query(models.User).filter(models.User.id == act.vendor_id).first()
        res.append({
            "id": act.id,
            "vendor_name": vendor.business_name if vendor else "Unknown",
            "admin_name": act.admin_name,
            "action": act.action,
            "previous_status": act.previous_status,
            "new_status": act.new_status,
            "remarks": act.remarks,
            "created_at": act.created_at
        })
    return res

@app.put("/admin/vendors/{vendor_id}/status")
def update_vendor_status(vendor_id: int, status_update: dict, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    vendor = db.query(models.User).filter(models.User.id == vendor_id).first()
    if not vendor or vendor.role != "vendor":
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    new_status = status_update.get("status")
    remarks = status_update.get("remarks", "Status updated by admin")
    old_status = vendor.status
    
    vendor.status = new_status
    
    # Log activity
    act = models.VendorActivity(
        vendor_id=vendor.id, admin_name=admin.first_name or "Admin",
        action="Status Changed", previous_status=old_status, new_status=new_status, remarks=remarks
    )
    db.add(act)
    db.commit()
    return {"message": "Status updated successfully."}

@app.get("/admin/products")
def get_all_products(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    products = db.query(models.Product).all()
    res = []
    for p in products:
        vendor = db.query(models.User).filter(models.User.id == p.vendor_id).first()
        sales = p.sales or 0
        res.append({
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "price": p.price,
            "quantity": p.quantity,
            "sales": sales,
            "status": p.status,
            "vendor_name": vendor.business_name or f"{vendor.first_name} {vendor.last_name}" if vendor else "Unknown Vendor",
            "picture_url": p.picture_url,
            "tagline": p.tagline,
            "description": p.description,
            "marketing_email": p.marketing_email
        })
    return res

@app.get("/admin/analytics")
def get_platform_analytics(db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    vendors = db.query(models.User).filter(models.User.role == "vendor").all()
    products = db.query(models.Product).all()
    
    total_revenue = 0
    vendor_stats = []
    
    for v in vendors:
        v_products = [p for p in products if p.vendor_id == v.id]
        
        v_revenue = 0
        v_orders = 0
        for p in v_products:
            sales = p.sales or 0
            v_revenue += sales * p.price
            v_orders += sales
        
        total_revenue += v_revenue
        
        vendor_stats.append({
            "vendor_id": v.id,
            "vendor_name": v.business_name or f"{v.first_name} {v.last_name}",
            "email": v.email,
            "phone_number": v.phone_number,
            "joined_date": v.joined_date.strftime("%Y-%m-%d") if v.joined_date else "N/A",
            "rating": v.rating,
            "revenue": v_revenue,
            "orders": v_orders,
            "products": len(v_products),
            "products_list": [{"title": p.title, "price": p.price, "stock": p.quantity} for p in v_products],
            "status": v.status
        })
        
    return {
        "summary": {
            "total_revenue": total_revenue,
            "total_vendors": len(vendors),
            "total_products": len(products),
            "total_orders": sum(vs["orders"] for vs in vendor_stats)
        },
        "vendor_performance": sorted(vendor_stats, key=lambda x: x["revenue"], reverse=True)
    }

@app.post("/admin/products/{product_id}/marketing-email")
def send_marketing_email(product_id: int, req: schemas.MarketingEmailRequest, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    print(f"Simulating sending marketing email for product '{product.title}' to customers:\n{req.content}")
    return {"message": "Marketing email sent to subscribers successfully."}

@app.post("/admin/products/{product_id}/notify-vendor")
def notify_vendor(product_id: int, req: schemas.NotifyVendorRequest, db: Session = Depends(get_db), admin: models.User = Depends(auth.get_current_admin)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    vendor = product.vendor
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
        
    if req.notification_type == "out_of_stock":
        action_text = f"Out of Stock Alert for {product.title}"
    elif req.notification_type == "price_increase":
        action_text = f"Price Increase Suggestion for {product.title}"
    else:
        action_text = f"Notification regarding {product.title}"
        
    activity = models.VendorActivity(
        vendor_id=vendor.id,
        admin_name=f"{admin.first_name} {admin.last_name}" if admin.first_name else "Admin",
        action="Notification Sent",
        remarks=f"Sent email: {action_text}"
    )
    db.add(activity)
    db.commit()
    
    print(f"Simulating sending email to vendor {vendor.email}: {action_text}")
    return {"message": f"Notification '{req.notification_type}' sent to vendor."}

# --- Vendor Routes ---
@app.get("/vendor/notifications")
def get_vendor_notifications(db: Session = Depends(get_db), vendor: models.User = Depends(auth.get_current_active_vendor)):
    activities = db.query(models.VendorActivity).filter(models.VendorActivity.vendor_id == vendor.id).order_by(models.VendorActivity.created_at.desc()).all()
    return activities

# --- Vendor Profile ---
@app.put("/vendor/profile", response_model=schemas.User)
def update_vendor_profile(
    update_data: dict = Body(...),
    db: Session = Depends(get_db), 
    vendor: models.User = Depends(auth.get_current_active_vendor)
):
    allowed_fields = {"first_name", "last_name", "phone_number", "address", "business_name", "business_category", "gst_number", "profile_picture_url"}
    for key, value in update_data.items():
        if key in allowed_fields and hasattr(vendor, key):
            setattr(vendor, key, value)
    db.commit()
    db.refresh(vendor)
    return vendor

# --- Vendor Products ---
@app.post("/vendor/products", response_model=schemas.Product)
async def create_product(
    title: str = Form(...),
    category: str = Form(...),
    price: float = Form(...),
    quantity: int = Form(...),
    discount: Optional[float] = Form(0.0),
    sku: Optional[str] = Form(None),
    status: Optional[str] = Form("active"),
    description: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    vendor: models.User = Depends(auth.get_current_active_vendor)
):
    picture_url = None
    
    # Ensure defaults for optional fields
    if discount is None: discount = 0.0
    if sku is None: sku = ""
    if status is None: status = "active"
    if description is None: description = ""
    
    if image:
        file_ext = image.filename.split('.')[-1]
        file_name = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join("static", "uploads", file_name)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        picture_url = f"/static/uploads/{file_name}"
    
    ai_content = ai_service.generate_ai_content(title, category)
    final_desc = f"{description}\n\n[AI Enhanced]: {ai_content['description']}" if description else ai_content['description']
    
    db_product = models.Product(
        title=title, category=category, price=price, quantity=quantity,
        discount=discount, sku=sku, status=status,
        description=final_desc, tagline=ai_content['tagline'],
        marketing_email=ai_content['marketing_email'],
        picture_url=picture_url, vendor_id=vendor.id,
        sales=0
    )
    
    # Automatically generate sample data for this website
    import random
    sample_sales = random.randint(10, 50)
    db_product.sales = sample_sales
    
    try:
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        
        # Generate a fake order to populate the vendor's revenue
        if sample_sales > 0:
            fake_order = models.Order(
                amount=sample_sales * price,
                vendor_id=vendor.id
            )
            db.add(fake_order)
            db.commit()
    except Exception as e:
        import traceback
        with open("crash.txt", "w") as f:
            f.write(traceback.format_exc())
        raise e
    
    return db_product

@app.get("/vendor/products", response_model=list[schemas.Product])
def get_vendor_products(db: Session = Depends(get_db), vendor: models.User = Depends(auth.get_current_user)):
    return db.query(models.Product).filter(models.Product.vendor_id == vendor.id).all()

@app.put("/vendor/products/{product_id}")
def update_product(
    product_id: int, 
    update_data: dict = Body(...), 
    db: Session = Depends(get_db), 
    vendor: models.User = Depends(auth.get_current_active_vendor)
):
    prod = db.query(models.Product).filter(models.Product.id == product_id, models.Product.vendor_id == vendor.id).first()
    if not prod:
        raise HTTPException(status_code=404)
    for k, v in update_data.items():
        if hasattr(prod, k):
            setattr(prod, k, v)
    db.commit()
    return {"message": "Product updated"}

@app.delete("/vendor/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), vendor: models.User = Depends(auth.get_current_active_vendor)):
    prod = db.query(models.Product).filter(models.Product.id == product_id, models.Product.vendor_id == vendor.id).first()
    if prod:
        db.delete(prod)
        db.commit()
    return {"message": "Deleted"}

# --- Vendor Analytics ---
@app.get("/vendor/analytics/advanced")
def get_advanced_analytics(
    time_range: str = "6months", 
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db), 
    vendor: models.User = Depends(auth.get_current_active_vendor)
):
    orders = db.query(models.Order).filter(models.Order.vendor_id == vendor.id).all()
    products = db.query(models.Product).filter(models.Product.vendor_id == vendor.id).all()
    
    # 1. Summary Cards
    revenue = sum(o.amount for o in orders)
    profit = revenue * 0.75 # mock profit 75%
    total_orders = len(orders)
    listed = len(products)
    
    # 2. Charts (Mock generation based on time range)
    import random
    
    sales_trend = []
    category_sales = []
    product_sales = []
    
    points = 6
    if time_range == "today":
        points = 24
    elif time_range == "week" or time_range == "7days":
        points = 7
    elif time_range == "month" or time_range == "30days":
        points = 30
    elif time_range == "quarter":
        points = 3
    elif time_range == "year" or time_range == "6months":
        points = 12 if time_range == "year" else 6
    elif time_range == "custom":
        points = 14 # default arbitrary points for custom ranges
        
    cats = list(set(p.category for p in products))
    if not cats:
        cats = ["General"]
    
    # Generate product sales first to get accurate revenue
    product_sales = []
    generated_revenue = 0
    generated_orders = 0
    for p in products:
        sales = p.sales or 0
        prod_rev = sales * p.price
        generated_revenue += prod_rev
        generated_orders += sales
        
        # AI Insight logic
        insight = "Analyzing..."
        if sales == 0:
            insight = "💡 AI: No sales yet. Consider running a promo campaign."
        elif sales < 10:
            insight = "💡 AI: Slow mover. Try optimizing your description."
        elif sales < 30:
            insight = "💡 AI: Steady sales. Maintain current strategy."
        else:
            insight = "🚀 AI: High demand! Consider a 5-10% price increase to maximize profit."

        product_sales.append({
            "id": p.id,
            "title": p.title,
            "sales": sales,
            "revenue": prod_rev,
            "status": "Waiting for first sale" if sales == 0 else "Active",
            "insight": insight
        })
        
    revenue = max(revenue, generated_revenue)
    total_orders = max(total_orders, generated_orders)
    profit = revenue * 0.75 # mock profit 75%
    
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    
    for i in range(points):
        # We generate points from past to present
        step = points - 1 - i
        
        if time_range == "today":
            dt = now - timedelta(hours=step)
            label = dt.strftime("%I %p")
        elif time_range in ["week", "7days"]:
            dt = now - timedelta(days=step)
            label = dt.strftime("%a %d")
        elif time_range in ["month", "30days"]:
            dt = now - timedelta(days=step)
            label = dt.strftime("%b %d")
        elif time_range == "quarter":
            dt = now - timedelta(days=step * 30)
            label = dt.strftime("%b %Y")
        elif time_range in ["year", "6months"]:
            dt = now - timedelta(days=step * 30)
            label = dt.strftime("%b %Y")
        elif time_range == "custom":
            dt = now - timedelta(days=step*2) # rough estimate
            label = dt.strftime("%b %d")
        else:
            dt = now - timedelta(days=step*30)
            label = dt.strftime("%b %Y")
            
        # Ensure we don't show sales for dates before the vendor joined
        is_before_join = False
        if dt < vendor.joined_date:
            is_before_join = True
        
        rev_point = 0 if is_before_join else round((revenue/points * random.uniform(0.5, 1.5)) if revenue > 0 else 0, 2)
        ord_point = 0 if is_before_join else max(1, int((total_orders/points * random.uniform(0.5, 1.5)) if total_orders > 0 else 0)) if revenue > 0 else 0
        prof_point = 0 if is_before_join else round(rev_point * random.uniform(0.6, 0.8), 2)
        
        sales_trend.append({
            "name": label, 
            "revenue": rev_point,
            "orders": ord_point,
            "profit": prof_point
        })
        
    for c in cats:
        category_sales.append({"name": c, "value": round((revenue * random.uniform(0.1, 0.4)) if revenue > 0 else 0, 2)})
        
    # Reset seed to avoid affecting other parts of the app
    random.seed()
    
    print(f"DEBUG: get_advanced_analytics called for {vendor.email} with time_range {time_range}")
    print(f"DEBUG: last point revenue is {sales_trend[-1]['revenue']}")
    
    return {
        "summary": {
            "revenue": revenue,
            "profit": profit,
            "orders": total_orders,
            "products": listed
        },
        "sales_trend": sales_trend,
        "category_sales": category_sales,
        "product_sales": product_sales
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8005, reload=True)
