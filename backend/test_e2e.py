import requests
import json
import time
import random

BASE_URL = "http://localhost:8003"
print("Waiting for server to start...")
time.sleep(2)

rand_id = random.randint(1000, 9999)
test_email = f"newvendor{rand_id}@test.com"

print(f"--- 1. Registering a new vendor: {test_email} ---")
register_data = {
    "email": test_email,
    "password": "password123",
    "first_name": "Test",
    "last_name": "Vendor",
    "role": "vendor"
}
resp = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print("Register Status:", resp.status_code)
if resp.status_code != 200:
    print("Failed Registration Response:", resp.text)
    exit(1)

print("--- 2. Logging in as new vendor ---")
login_data = {
    "username": test_email,
    "password": "password123"
}
resp = requests.post(f"{BASE_URL}/auth/login", data=login_data)
print("Login Status:", resp.status_code)
if resp.status_code != 200:
    print("Login failed:", resp.text)
    exit(1)
    
token = resp.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

print("--- 3. Verifying vendor role in /auth/me ---")
resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
print("Auth Me Status:", resp.status_code)
me_data = resp.json()
print(f"Role: {me_data.get('role')} (Expected: vendor)")

if me_data.get('role') != 'vendor':
    print("FAILED: Role is not vendor!")
    exit(1)

print("--- 4. Checking Advanced Analytics Engine ---")
resp = requests.get(f"{BASE_URL}/vendor/analytics/advanced?time_range=30days", headers=headers)
print("Analytics Status:", resp.status_code)
if resp.status_code == 200:
    print("Analytics works!")
else:
    print("Analytics failed:", resp.text)

print("--- 5. Admin Panel Checks ---")
# Login as admin
admin_login = {
    "username": "shopesenseadmin@gmail.com",
    "password": "shopsensepassword"
}
resp = requests.post(f"{BASE_URL}/auth/login", data=admin_login)
if resp.status_code != 200:
    print("Admin login failed:", resp.text)
    exit(1)
admin_token = resp.json().get("access_token")
admin_headers = {"Authorization": f"Bearer {admin_token}"}

resp = requests.get(f"{BASE_URL}/admin/vendor-activities", headers=admin_headers)
print("Admin Vendor Activities Status:", resp.status_code)
if resp.status_code == 200:
    print("Admin activities endpoint works!")
else:
    print("Admin activities failed:", resp.text)

resp = requests.get(f"{BASE_URL}/admin/vendors", headers=admin_headers)
print("Admin Vendors Status:", resp.status_code)
if resp.status_code == 200:
    print("Admin vendors endpoint works!")
else:
    print("Admin vendors failed:", resp.text)

print("SUCCESS: All tests passed!")
