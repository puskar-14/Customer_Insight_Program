
import sys, os
from backend.main import get_advanced_analytics
from backend.database import SessionLocal
from backend.models import User

db = SessionLocal()
vendor = db.query(User).filter(User.role == "vendor").first()
if not vendor:
    print("No vendor found!")
    sys.exit(1)

res = get_advanced_analytics(time_range="year", start_date=None, end_date=None, db=db, vendor=vendor)
print(res)

