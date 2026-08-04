"""Direct test of product creation - bypasses FastAPI entirely to isolate the bug."""
import sys
import traceback

# Test 1: Can we even import everything?
print("=" * 60)
print("TEST 1: Import check")
try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    import models, auth, ai_service
    from datetime import timedelta
    import random
    print("  PASS: All imports work")
except Exception as e:
    print(f"  FAIL: {e}")
    sys.exit(1)

# Test 2: Database connection
print("\nTEST 2: Database connection")
try:
    engine = create_engine('postgresql://postgres:Puskar%402005@localhost:5432/shopsense_db')
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    print("  PASS: Connected to database")
except Exception as e:
    print(f"  FAIL: {e}")
    sys.exit(1)

# Test 3: Get vendor
print("\nTEST 3: Get vendor user")
try:
    vendor = db.query(models.User).filter(models.User.email == 'happy@gmail.com').first()
    if vendor:
        print(f"  PASS: Found vendor: {vendor.email}, role={vendor.role}, status={vendor.status}")
    else:
        print("  FAIL: No vendor found with email happy@gmail.com")
        # List all users
        users = db.query(models.User).all()
        for u in users:
            print(f"    User: {u.email}, role={u.role}, status={u.status}")
        sys.exit(1)
except Exception as e:
    print(f"  FAIL: {e}")
    traceback.print_exc()
    sys.exit(1)

# Test 4: AI content generation
print("\nTEST 4: AI content generation")
try:
    ai_content = ai_service.generate_ai_content("Test Product", "Test Category")
    print(f"  PASS: tagline={ai_content['tagline'][:50]}...")
except Exception as e:
    print(f"  FAIL: {e}")
    traceback.print_exc()

# Test 5: Create product in DB directly
print("\nTEST 5: Create product in DB")
try:
    sample_sales = random.randint(10, 50)
    db_product = models.Product(
        title="Direct Test Product",
        category="Test",
        price=19.99,
        quantity=10,
        discount=0.0,
        sku="TEST-DIRECT",
        status="active",
        description="Test description",
        tagline=ai_content['tagline'],
        marketing_email=ai_content['marketing_email'],
        picture_url=None,
        vendor_id=vendor.id,
        sales=sample_sales
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    print(f"  PASS: Product created with id={db_product.id}, sales={db_product.sales}")
except Exception as e:
    print(f"  FAIL: {e}")
    traceback.print_exc()
    db.rollback()

# Test 6: Create order in DB directly
print("\nTEST 6: Create order in DB")
try:
    fake_order = models.Order(
        amount=sample_sales * 19.99,
        vendor_id=vendor.id
    )
    db.add(fake_order)
    db.commit()
    print(f"  PASS: Order created with id={fake_order.id}")
except Exception as e:
    print(f"  FAIL: {e}")
    traceback.print_exc()
    db.rollback()

# Test 7: HTTP test via requests
print("\nTEST 7: HTTP POST /vendor/products")
try:
    import requests
    access_token = auth.create_access_token(data={'sub': vendor.email}, expires_delta=timedelta(minutes=30))
    
    data = {
        'title': 'HTTP Test Product',
        'category': 'Test',
        'price': '19.99',
        'quantity': '10',
        'discount': '0',
        'sku': 'HTTP-TEST',
        'status': 'active',
        'description': 'Test via HTTP'
    }
    
    res = requests.post(
        'http://localhost:8005/vendor/products',
        headers={'Authorization': f'Bearer {access_token}'},
        data=data,
        timeout=30
    )
    print(f"  Status: {res.status_code}")
    if res.status_code == 200:
        print(f"  PASS: {res.json().get('title', 'unknown')}")
    else:
        print(f"  FAIL: {res.text[:500]}")
except Exception as e:
    print(f"  FAIL: {e}")
    traceback.print_exc()

# Test 8: HTTP test on the debug /test/form endpoint
print("\nTEST 8: HTTP POST /test/form")
try:
    res = requests.post(
        'http://localhost:8005/test/form',
        data={'discount': '5.0', 'status': 'active'},
        timeout=10
    )
    print(f"  Status: {res.status_code}")
    print(f"  Body: {res.text}")
except Exception as e:
    print(f"  FAIL: {e}")

db.close()
print("\n" + "=" * 60)
print("DONE")
