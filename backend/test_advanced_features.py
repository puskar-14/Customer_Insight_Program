"""Automated test script for Inventory, Segmentation, Forecasting, Sentiment, and Recommendations."""
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, auth
from datetime import timedelta

BASE = "http://localhost:8008"
engine = create_engine('postgresql://postgres:Puskar%402005@localhost:5432/shopsense_db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

vendor = db.query(models.User).filter(models.User.email == 'happy@gmail.com').first()
admin = db.query(models.User).filter(models.User.email == 'shopesenseadmin@gmail.com').first()
customer = db.query(models.User).filter(models.User.role == 'customer').first()

vendor_token = auth.create_access_token(data={'sub': vendor.email}, expires_delta=timedelta(minutes=30))
admin_token = auth.create_access_token(data={'sub': admin.email}, expires_delta=timedelta(minutes=30))
customer_token = auth.create_access_token(data={'sub': customer.email}, expires_delta=timedelta(minutes=30))
db.close()

headers_v = {"Authorization": "Bearer " + vendor_token}
headers_a = {"Authorization": "Bearer " + admin_token}
headers_c = {"Authorization": "Bearer " + customer_token}

print("=" * 60)
print("TESTING ADVANCED FEATURES API")
print("=" * 60)

# 1. Inventory Tracking
print("\n--- 1. INVENTORY TRACKING ---")
r = requests.get(f"{BASE}/vendor/inventory", headers=headers_v)
print("GET /vendor/inventory:", r.status_code)
if r.status_code == 200:
    inv = r.json()
    print("  Total Units:", inv["summary"]["total_units"], "| Low stock:", inv["summary"]["low_stock_count"])
    if inv["inventory"]:
        pid = inv["inventory"][0]["id"]
        # Test Restock
        r_restock = requests.post(f"{BASE}/vendor/inventory/{pid}/restock", headers=headers_v, json={"quantity": 15})
        print(f"POST /vendor/inventory/{pid}/restock:", r_restock.status_code, r_restock.json().get("message"))

r_adm_inv = requests.get(f"{BASE}/admin/inventory", headers=headers_a)
print("GET /admin/inventory:", r_adm_inv.status_code, "Valuation:", r_adm_inv.json().get("total_inventory_valuation"))

# 2. Customer Segmentation
print("\n--- 2. CUSTOMER SEGMENTATION ---")
r_seg = requests.get(f"{BASE}/admin/analytics/customer-segments", headers=headers_a)
print("GET /admin/analytics/customer-segments:", r_seg.status_code)
if r_seg.status_code == 200:
    segs = r_seg.json().get("segments", [])
    for s in segs:
        print(f"  {s['name']}: {s['count']} customers (${s['revenue']})")

r_vseg = requests.get(f"{BASE}/vendor/analytics/customer-segments", headers=headers_v)
print("GET /vendor/analytics/customer-segments:", r_vseg.status_code, r_vseg.json().get("tier_distribution"))

# 3. Recommendations
print("\n--- 3. RECOMMENDATIONS ---")
r_rule = requests.get(f"{BASE}/shop/recommendations/rule-based")
print("GET /shop/recommendations/rule-based:", r_rule.status_code, f"Found {len(r_rule.json())} recs")

r_sem = requests.get(f"{BASE}/shop/recommendations/semantic?query=modern%20shoes")
print("GET /shop/recommendations/semantic:", r_sem.status_code, f"Found {len(r_sem.json())} semantic matches")

# 4. Data Validation
print("\n--- 4. DATA VALIDATION ---")
r_val = requests.get(f"{BASE}/vendor/analytics/validation", headers=headers_v)
print("GET /vendor/analytics/validation:", r_val.status_code, r_val.json().get("status"), r_val.json().get("message"))

# 5. ML Demand Forecast
print("\n--- 5. ML INVENTORY DEMAND FORECAST ---")
r_fc = requests.get(f"{BASE}/vendor/analytics/inventory-forecast", headers=headers_v)
print("GET /vendor/analytics/inventory-forecast:", r_fc.status_code)
if r_fc.status_code == 200:
    fcs = r_fc.json().get("forecasts", [])
    if fcs:
        f0 = fcs[0]
        print(f"  Forecast for '{f0['product_title']}': Daily Velocity={f0['avg_daily_velocity']}, Days to Sellout={f0['days_to_stockout']}, Urgency={f0['urgency']}")

# 6. LLM Sentiment Analysis & Reviews
print("\n--- 6. LLM SENTIMENT & REVIEWS ---")
# Submit a sample customer review
r_prod = requests.get(f"{BASE}/shop/products")
if r_prod.status_code == 200 and len(r_prod.json()) > 0:
    p0 = r_prod.json()[0]
    r_rev = requests.post(f"{BASE}/shop/reviews", headers=headers_c, json={
        "product_id": p0["id"],
        "rating": 5,
        "comment": "Amazing quality, durable build and arrived super fast! Love it."
    })
    print(f"POST /shop/reviews for '{p0['title']}':", r_rev.status_code, r_rev.json().get("sentiment"))

r_sent = requests.get(f"{BASE}/vendor/analytics/reviews-sentiment", headers=headers_v)
print("GET /vendor/analytics/reviews-sentiment:", r_sent.status_code)
if r_sent.status_code == 200:
    sent = r_sent.json()
    print("  Positive %:", sent.get("positive_percentage"), "| Top Pros:", sent.get("top_pros")[:2])

print("\n" + "=" * 60)
print("ADVANCED FEATURES TEST COMPLETED")
print("=" * 60)
