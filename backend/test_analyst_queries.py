import ai_service, database

db = database.SessionLocal()

# 1. "show me 2 profitable product"
print("=== 1. show me 2 profitable product ===")
res1 = ai_service.text_to_sql_analyst("show me 2 profitable product", 3, db)
print("SQL:\n", res1["generated_sql"])
print("Reply:\n", res1["ai_answer"].encode('ascii', errors='replace').decode())
print("Data rows returned:", len(res1["data"]))
for r in res1["data"]:
    print(" ", r.get("product_name"), "| Profit: Rs.", r.get("total_profit"))

# 2. "give least profitable product"
print("\n=== 2. give least profitable product ===")
res2 = ai_service.text_to_sql_analyst("give least profitable product", 3, db)
print("SQL:\n", res2["generated_sql"])
print("Reply:\n", res2["ai_answer"].encode('ascii', errors='replace').decode())
print("Data rows returned:", len(res2["data"]))
for r in res2["data"]:
    print(" ", r.get("product_name"), "| Profit: Rs.", r.get("total_profit"))

# 3. "product with no sales"
print("\n=== 3. product with no sales ===")
res3 = ai_service.text_to_sql_analyst("product with no sales", 3, db)
print("SQL:\n", res3["generated_sql"])
print("Reply:\n", res3["ai_answer"].encode('ascii', errors='replace').decode())
print("Data rows returned:", len(res3["data"]))
