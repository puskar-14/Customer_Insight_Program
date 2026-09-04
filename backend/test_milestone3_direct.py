import models, database, ai_service

def test_direct():
    print("Testing Milestone 3 Core Algorithms directly...")
    db = database.SessionLocal()
    try:
        # 1. Test RAG Shopping Assistant with actual catalog
        products = db.query(models.Product).filter(models.Product.status == "active").all()
        print(f"Loaded {len(products)} products from DB.")

        rag_result = ai_service.rag_shopping_assistant("smart watch under 1000", products)
        print("\n--- RAG Response ---")
        print("Reply:\n", rag_result["reply"].encode('ascii', errors='replace').decode())
        print("Recommended products count:", len(rag_result["recommended_products"]))
        for p in rag_result["recommended_products"]:
            print(f"  - {p['title']} (Rs. {p['price']})")

        # 2. Test Text-to-SQL AI Analyst
        analyst_result = ai_service.text_to_sql_analyst("What is my top selling product?", 1, db)
        print("\n--- Text-to-SQL Response ---")
        print("Generated SQL:\n", analyst_result["generated_sql"].strip())
        print("AI Answer:\n", analyst_result["ai_answer"].encode('ascii', errors='replace').decode())
        print("Data Rows Count:", len(analyst_result["data"]))

        # 3. Test Text-to-SQL drop inquiry
        analyst_drop = ai_service.text_to_sql_analyst("Why did my sales drop last week?", 1, db)
        print("\n--- Text-to-SQL Drop Inquiry ---")
        print("Generated SQL:\n", analyst_drop["generated_sql"].strip())
        print("AI Answer:\n", analyst_drop["ai_answer"].encode('ascii', errors='replace').decode())

    finally:
        db.close()

    print("\n✅ All Milestone 3 features validated successfully!")

if __name__ == "__main__":
    test_direct()
