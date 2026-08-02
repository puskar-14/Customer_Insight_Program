import requests
import json

BASE_URL = "http://localhost:8000"

def test():
    print("Testing Auth...")
    # Login as admin
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "shopesenseadmin@gmail.com", "password": "shopsensepassword"})
    if resp.status_code != 200:
        print("Admin login failed:", resp.text)
        return
    admin_token = resp.json()["access_token"]
    print("Admin logged in successfully.")

    # Register vendor
    resp = requests.post(f"{BASE_URL}/auth/register", json={"email": "testvendor@gmail.com", "password": "password123"})
    if resp.status_code == 400:
        print("Vendor already registered (expected if testing multiple times)")
    elif resp.status_code != 200:
        print("Vendor registration failed:", resp.text)
        return
    
    # Login vendor
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "testvendor@gmail.com", "password": "password123"})
    vendor_token = resp.json()["access_token"]
    print("Vendor logged in successfully.")
    
    # Add product
    headers = {"Authorization": f"Bearer {vendor_token}"}
    product_data = {
        "title": "Test Product",
        "category": "Electronics",
        "price": 99.99,
        "quantity": 10,
        "description": "A very good product",
        "tagline": "The best product"
    }
    resp = requests.post(f"{BASE_URL}/vendor/products", json=product_data, headers=headers)
    if resp.status_code != 200:
        print("Add product failed:", resp.text)
        return
    print("Product added successfully.")
    
    # Check vendor analytics
    resp = requests.get(f"{BASE_URL}/vendor/analytics", headers=headers)
    print("Vendor Analytics:", resp.json())
    
    # Admin gets vendors
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    resp = requests.get(f"{BASE_URL}/admin/vendors", headers=admin_headers)
    vendors = resp.json()
    print(f"Total Vendors: {len(vendors)}")
    vendor_id = vendors[0]["id"]
    
    # Admin suspends vendor
    resp = requests.put(f"{BASE_URL}/admin/vendors/{vendor_id}/status", json={"status": "suspended"}, headers=admin_headers)
    print("Vendor suspended:", resp.json())
    
    # Vendor tries to add product
    resp = requests.post(f"{BASE_URL}/vendor/products", json=product_data, headers=headers)
    if resp.status_code == 403:
        print("Vendor correctly blocked from adding product!")
    else:
        print("Vendor could still add product?!", resp.status_code)

if __name__ == "__main__":
    test()
