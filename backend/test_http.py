import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, auth
from datetime import timedelta

engine = create_engine('postgresql://postgres:Puskar%402005@localhost:5432/shopsense_db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()
vendor = db.query(models.User).filter(models.User.email == 'happy@gmail.com').first()
access_token = auth.create_access_token(data={'sub': vendor.email}, expires_delta=timedelta(minutes=30))

data = {
    'title': 'HTTP Test Product',
    'category': 'Test',
    'price': '19.99',
    'quantity': '10',
    'discount': '0',
    'sku': 'HTTP-TEST-2',
    'status': 'active',
    'description': 'Test via HTTP on port 8006'
}

res = requests.post(
    'http://localhost:8006/vendor/products',
    headers={'Authorization': 'Bearer ' + access_token},
    data=data,
    timeout=30
)
print('STATUS:', res.status_code)
if res.status_code == 200:
    j = res.json()
    print('SUCCESS: Product id=' + str(j["id"]) + ', title=' + j["title"] + ', sales=' + str(j["sales"]))
else:
    print('BODY:', res.text[:500])
db.close()
