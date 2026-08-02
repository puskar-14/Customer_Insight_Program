import datetime
import random
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
import auth

# Initialize the new tables
print("Creating tables...")
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    print("Seeding data...")
    
    # 1. Admin
    admin_pw = auth.get_password_hash("shopsensepassword")
    admin = models.User(
        first_name="Admin",
        last_name="User",
        email="shopesenseadmin@gmail.com",
        hashed_password=admin_pw,
        role="admin",
        status="active"
    )
    db.add(admin)
    
    # 2. Customers
    cust_pw = auth.get_password_hash("customer123")
    customers = [
        models.User(
            first_name="Jane", last_name="Doe", email="jane@customer.com",
            hashed_password=cust_pw, role="customer", status="active",
            phone_number="555-0100"
        ),
        models.User(
            first_name="John", last_name="Smith", email="john@customer.com",
            hashed_password=cust_pw, role="customer", status="active",
            phone_number="555-0101"
        )
    ]
    db.add_all(customers)
    db.commit()
    
    # 3. Vendors
    vendor_pw = auth.get_password_hash("vendor123")
    vendors = [
        models.User(
            first_name="Sarah", last_name="Connor", email="sarah@techhaven.com",
            business_name="Tech Haven", business_category="Electronics",
            hashed_password=vendor_pw, role="vendor", status="active",
            rating=4.8, joined_date=datetime.datetime.utcnow() - datetime.timedelta(days=180)
        ),
        models.User(
            first_name="Bruce", last_name="Wayne", email="bruce@wayneenterprises.com",
            business_name="Wayne Accessories", business_category="Fashion",
            hashed_password=vendor_pw, role="vendor", status="active",
            rating=4.9, joined_date=datetime.datetime.utcnow() - datetime.timedelta(days=120)
        ),
        models.User(
            first_name="Clark", last_name="Kent", email="clark@dailydeals.com",
            business_name="Daily Deals", business_category="Home",
            hashed_password=vendor_pw, role="vendor", status="pending",
            rating=0.0, joined_date=datetime.datetime.utcnow() - datetime.timedelta(days=10)
        )
    ]
    db.add_all(vendors)
    db.commit()
    
    # 4. Products & Reviews & Orders for Vendors
    # Tech Haven
    p1 = models.Product(
        title="Quantum Smart Watch", category="Electronics", price=299.99, quantity=50,
        description="Next gen smart watch.", vendor_id=vendors[0].id, rating=4.5,
        sku="QSW-001"
    )
    p2 = models.Product(
        title="Noise Cancelling Earbuds", category="Electronics", price=149.99, quantity=200,
        description="Premium sound.", vendor_id=vendors[0].id, rating=4.8,
        sku="NCE-002"
    )
    # Wayne Accessories
    p3 = models.Product(
        title="Tactical Backpack", category="Fashion", price=89.99, quantity=0, # Out of stock
        description="Durable backpack.", vendor_id=vendors[1].id, rating=5.0,
        sku="TBP-001"
    )
    # Wayne Accessories - never sold
    p4 = models.Product(
        title="Leather Wallet", category="Fashion", price=45.00, quantity=100,
        description="Classic wallet.", vendor_id=vendors[1].id, rating=0.0,
        sku="LW-002"
    )
    db.add_all([p1, p2, p3, p4])
    db.commit()

    # Generate historical orders spread over 6 months
    print("Generating historical orders...")
    orders = []
    now = datetime.datetime.utcnow()
    for m in range(6, -1, -1):
        month_date = now - datetime.timedelta(days=30*m)
        # Tech Haven sales
        for _ in range(random.randint(10, 30)):
            orders.append(models.Order(
                amount=random.choice([299.99, 149.99]),
                created_at=month_date + datetime.timedelta(days=random.randint(1, 28)),
                vendor_id=vendors[0].id
            ))
        # Wayne Accessories sales
        for _ in range(random.randint(5, 15)):
            orders.append(models.Order(
                amount=89.99,
                created_at=month_date + datetime.timedelta(days=random.randint(1, 28)),
                vendor_id=vendors[1].id
            ))
    db.add_all(orders)
    
    # Reviews
    db.add(models.Review(product_id=p1.id, customer_id=customers[0].id, rating=5, comment="Amazing watch!"))
    db.add(models.Review(product_id=p1.id, customer_id=customers[1].id, rating=4, comment="Good, but battery could be better."))
    db.add(models.Review(product_id=p2.id, customer_id=customers[0].id, rating=5, comment="Best earbuds ever."))
    db.add(models.Review(product_id=p3.id, customer_id=customers[1].id, rating=5, comment="Super tough backpack."))
    
    # Vendor Activity Log
    db.add(models.VendorActivity(
        vendor_id=vendors[0].id, admin_name="Admin User", action="Activated",
        previous_status="pending", new_status="active", remarks="Verified business documents"
    ))
    db.add(models.VendorActivity(
        vendor_id=vendors[1].id, admin_name="Admin User", action="Activated",
        previous_status="pending", new_status="active", remarks="Verified business documents"
    ))
    
    db.commit()
    print("Seed complete!")

finally:
    db.close()
