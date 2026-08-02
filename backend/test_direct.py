
import sys, os, json
from main import get_advanced_analytics
from database import SessionLocal
import models

db = SessionLocal()
vendor = db.query(models.User).filter(models.User.role == "vendor").first()

res = get_advanced_analytics(time_range="year", start_date=None, end_date=None, db=db, vendor=vendor)

# Remove insight string to avoid emoji encoding error in windows console
for p in res["product_sales"]:
    p["insight"] = ""

print(json.dumps(res, indent=2))

