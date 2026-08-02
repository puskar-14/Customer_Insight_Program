import random

time_range = "6months"
vendor_id = 1

products = [{"price": 100.0}]

revenue = 0

random.seed(vendor_id + len(time_range))

product_sales = []
generated_revenue = 0
generated_orders = 0
for p in products:
    sales = random.randint(0, 50)
    prod_rev = sales * p["price"]
    generated_revenue += prod_rev
    generated_orders += sales
    
revenue = max(revenue, generated_revenue)
print("After max:", revenue)

sales_trend = []
points = 6
for i in range(points):
    val = (revenue/points * random.uniform(0.5, 1.5)) if revenue > 0 else random.uniform(100, 1000)
    sales_trend.append({"name": "Month", "revenue": val})
    
print("sales_trend:", sales_trend)
