import requests
import time
time.sleep(2) # Wait for backend to be fully up
try:
    print("Testing Auth...")
    resp = requests.post("http://localhost:8002/auth/login", data={"username": "shopesenseadmin@gmail.com", "password": "shopsensepassword"})
    admin_token = resp.json()["access_token"]
    print("Admin logged in successfully.")
    
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get("http://localhost:8002/admin/vendors", headers=admin_headers)
    print("Admin Vendors Response:")
    print(resp.json())
except Exception as e:
    print("Error:", e)
