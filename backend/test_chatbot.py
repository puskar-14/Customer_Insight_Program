import requests

# Test 1: Discount query
r1 = requests.post('http://localhost:8010/shop/ai-assistant', json={'query': 'Show me discount products'})
d1 = r1.json()
print('=== 1. DISCOUNT QUERY ===')
print('Reply:\n', d1.get('reply', '').encode('ascii', errors='replace').decode())
print('Products returned:')
for p in d1.get('recommended_products', []):
    print(f" - {p['title']} | Discount: {p['discount']}% | Price: Rs.{p['price']}")

# Test 2: Budget query
r2 = requests.post('http://localhost:8010/shop/ai-assistant', json={'query': 'watch under 500'})
d2 = r2.json()
print('\n=== 2. BUDGET QUERY (watch under 500) ===')
print('Reply:\n', d2.get('reply', '').encode('ascii', errors='replace').decode())
print('Products returned:')
for p in d2.get('recommended_products', []):
    print(f" - {p['title']} | Price: Rs.{p['price']}")
