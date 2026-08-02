import requests
import json
import time
import random

BASE_URL = "http://localhost:8005"

print("--- Logging in as admin to get token ---")
login_data = {
    "username": "shopesenseadmin@gmail.com",
    "password": "shopsensepassword"
}
resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
if resp.status_code != 200:
    print("Admin login failed")
    exit(1)
    
admin_token = resp.json().get("access_token")
admin_headers = {"Authorization": f"Bearer {admin_token}"}

# Create a new vendor
rand_id = random.randint(1000, 9999)
test_email = f"vendortest{rand_id}@test.com"
register_data = {
    "email": test_email,
    "password": "password123",
    "first_name": "Test",
    "last_name": "Vendor",
    "role": "vendor"
}
resp = requests.post(f"{BASE_URL}/auth/register", json=register_data)
vendor_id = resp.json().get("id")

# Activate vendor
requests.put(f"{BASE_URL}/admin/vendors/{vendor_id}/status", json={"status": "active"}, headers=admin_headers)

# Login as vendor
vendor_login = {
    "username": test_email,
    "password": "password123"
}
resp = requests.post(f"{BASE_URL}/auth/login", data=vendor_login)
v_token = resp.json().get("access_token")
v_headers = {"Authorization": f"Bearer {v_token}"}

# Add a mock product
prod_data = {
    "title": "Shoe",
    "category": "Footwear",
    "price": 100.0,
    "quantity": 50
}
requests.post(f"{BASE_URL}/vendor/products", data=prod_data, headers=v_headers)

# Get analytics
print("Fetching analytics...")
resp = requests.get(f"{BASE_URL}/vendor/analytics/advanced?time_range=6months", headers=v_headers)
if resp.status_code != 200:
    print("Analytics error:", resp.text)
else:
    print(json.dumps(resp.json(), indent=2))
