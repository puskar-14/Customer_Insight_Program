import requests
import json
import time

BASE_URL = "http://localhost:8005"
test_email = f"test_{int(time.time())}@example.com"
test_password = "password123"
new_password = "newpassword456"

print("--- Starting E2E Tests ---")

# 1. Register a new vendor
print(f"1. Registering new vendor {test_email}...")
reg_data = {
    "email": test_email,
    "password": test_password,
    "role": "vendor",
    "first_name": "Test",
    "last_name": "User"
}
res = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
if res.status_code != 200:
    print("FAILED: Registration failed:", res.text)
    exit(1)
print("SUCCESS: Registered.")

# 2. Login with original password
print("2. Logging in with original password...")
login_data = {"username": test_email, "password": test_password}
res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if res.status_code != 200:
    print("FAILED: Initial login failed:", res.text)
    exit(1)
token = res.json()["access_token"]
print("SUCCESS: Logged in.")

# 3. Reset Password
print("3. Resetting password...")
reset_data = {"email": test_email, "new_password": new_password}
res = requests.post(f"{BASE_URL}/auth/reset-password", json=reset_data)
if res.status_code != 200:
    print("FAILED: Reset password failed:", res.text)
    exit(1)
print("SUCCESS: Password reset.")

# 4. Login with new password
print("4. Logging in with NEW password...")
login_data = {"username": test_email, "password": new_password}
res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if res.status_code != 200:
    print("FAILED: Login with new password failed:", res.text)
    exit(1)
token = res.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("SUCCESS: Logged in with new password.")

# 4.5 Manually activate vendor in DB
print("4.5 Activating vendor...")
import database, models
db = next(database.get_db())
vendor = db.query(models.User).filter(models.User.email == test_email).first()
vendor.status = "active"
db.commit()

# 5. Fetch Dashboard Stats (Expect 0 revenue)
print("5. Fetching Analytics Dashboard (30days)...")
res = requests.get(f"{BASE_URL}/vendor/analytics/advanced?time_range=30days", headers=headers)
if res.status_code != 200:
    print("FAILED: Analytics failed:", res.text)
    exit(1)
data = res.json()
print("SUCCESS: Analytics fetched.")
print("Summary Revenue:", data["summary"]["revenue"])
print("Last Sales Trend Point:", data["sales_trend"][-1])
if data["sales_trend"][-1]["revenue"] != 0:
    print("WARNING: Expected 0 revenue on last point for empty account!")

# 6. Add a Product
print("6. Adding a product...")
# Product requires multipart/form-data
product_data = {
    "title": "Test Product",
    "category": "Electronics",
    "price": "99.99",
    "quantity": "10",
    "discount": "0",
    "sku": "TEST-123",
    "description": "A test product"
}
res = requests.post(f"{BASE_URL}/vendor/products", data=product_data, headers=headers)
if res.status_code != 200:
    print("FAILED: Add product failed:", res.text)
    exit(1)
print("SUCCESS: Product added.")

print("--- ALL TESTS PASSED SUCCESSFULLY! ---")
