"""Comprehensive feature test for Shop Sense - tests ALL endpoints the frontend uses."""
import requests
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, auth
from datetime import timedelta

BASE = "http://localhost:8006"
PASS = 0
FAIL = 0

engine = create_engine('postgresql://postgres:Puskar%402005@localhost:5432/shopsense_db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()
vendor = db.query(models.User).filter(models.User.email == 'happy@gmail.com').first()
admin = db.query(models.User).filter(models.User.email == 'shopesenseadmin@gmail.com').first()
vendor_token = auth.create_access_token(data={'sub': vendor.email}, expires_delta=timedelta(minutes=30))
admin_token = auth.create_access_token(data={'sub': admin.email}, expires_delta=timedelta(minutes=30))
db.close()

def test(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print("  [PASS] " + name)
    else:
        FAIL += 1
        print("  [FAIL] " + name + " -- " + detail)

print("=" * 60)
print("SHOP SENSE - COMPREHENSIVE FEATURE TEST")
print("=" * 60)

# --- 1. AUTH ---
print("\n--- 1. AUTHENTICATION ---")
headers_v = {"Authorization": "Bearer " + vendor_token}
headers_a = {"Authorization": "Bearer " + admin_token}

res = requests.get(BASE + "/auth/me", headers=headers_v)
test("GET /auth/me (vendor)", res.status_code == 200, str(res.status_code))

res = requests.get(BASE + "/auth/me", headers=headers_a)
test("GET /auth/me (admin)", res.status_code == 200, str(res.status_code))

res = requests.post(BASE + "/auth/reset-password", json={"email": "fake@x.com", "new_password": "x"})
test("POST /auth/reset-password (bad email -> 404)", res.status_code == 404, str(res.status_code))

# --- 2. VENDOR PRODUCTS CRUD ---
print("\n--- 2. VENDOR PRODUCTS CRUD ---")

res = requests.post(BASE + "/vendor/products", headers=headers_v, data={
    "title": "Test Widget", "category": "Electronics", "price": "29.99",
    "quantity": "25", "discount": "5", "sku": "TW-01", "status": "active",
    "description": "Automated test product"
}, timeout=30)
test("POST /vendor/products (create)", res.status_code == 200, str(res.status_code) + " " + res.text[:200])
pid = None
if res.status_code == 200:
    p = res.json()
    pid = p["id"]
    test("  - auto sales > 0", p.get("sales", 0) > 0, "sales=" + str(p.get("sales")))
    test("  - AI tagline", bool(p.get("tagline")), "missing")
    test("  - AI description", "AI Enhanced" in p.get("description", ""), "missing")

res = requests.get(BASE + "/vendor/products", headers=headers_v)
test("GET /vendor/products (list)", res.status_code == 200, str(res.status_code))
if res.status_code == 200:
    test("  - is list with items", isinstance(res.json(), list) and len(res.json()) > 0)

if pid:
    res = requests.put(BASE + "/vendor/products/" + str(pid), headers=headers_v, json={"title": "Updated Widget", "price": 39.99})
    test("PUT /vendor/products/:id (update)", res.status_code == 200, str(res.status_code) + " " + res.text[:200])

if pid:
    res = requests.delete(BASE + "/vendor/products/" + str(pid), headers=headers_v)
    test("DELETE /vendor/products/:id (delete)", res.status_code == 200, str(res.status_code) + " " + res.text[:200])

# --- 3. VENDOR ANALYTICS ---
print("\n--- 3. VENDOR ANALYTICS ---")

res = requests.get(BASE + "/vendor/analytics/advanced?time_range=30days", headers=headers_v)
test("GET /vendor/analytics/advanced", res.status_code == 200, str(res.status_code) + " " + res.text[:200])
if res.status_code == 200:
    a = res.json()
    test("  - has total_products", "total_products" in a)
    test("  - has revenue", "revenue" in a)

# --- 4. VENDOR PROFILE ---
print("\n--- 4. VENDOR PROFILE ---")

res = requests.put(BASE + "/vendor/profile", headers=headers_v, json={"first_name": "Happy"})
test("PUT /vendor/profile (update)", res.status_code == 200, str(res.status_code) + " " + res.text[:200])

# --- 5. VENDOR NOTIFICATIONS ---
print("\n--- 5. VENDOR NOTIFICATIONS ---")

res = requests.get(BASE + "/vendor/notifications", headers=headers_v)
test("GET /vendor/notifications", res.status_code == 200, str(res.status_code) + " " + res.text[:200])

# --- 6. ADMIN FEATURES ---
print("\n--- 6. ADMIN FEATURES ---")

res = requests.get(BASE + "/admin/vendors", headers=headers_a)
test("GET /admin/vendors", res.status_code == 200, str(res.status_code))

res = requests.get(BASE + "/admin/products", headers=headers_a)
test("GET /admin/products", res.status_code == 200, str(res.status_code))

res = requests.get(BASE + "/admin/analytics", headers=headers_a)
test("GET /admin/analytics", res.status_code == 200, str(res.status_code))

res = requests.get(BASE + "/admin/vendor-activities", headers=headers_a)
test("GET /admin/vendor-activities", res.status_code == 200, str(res.status_code))

# --- SUMMARY ---
print("\n" + "=" * 60)
total = PASS + FAIL
print("RESULTS: " + str(PASS) + "/" + str(total) + " passed, " + str(FAIL) + " failed")
if FAIL == 0:
    print("ALL TESTS PASSED! Everything is working perfectly.")
else:
    print("WARNING: " + str(FAIL) + " test(s) failed.")
print("=" * 60)
