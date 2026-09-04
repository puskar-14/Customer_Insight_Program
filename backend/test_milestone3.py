import sys
from fastapi.testclient import TestClient
from main import app, get_db
import models, database

client = TestClient(app)

def run_tests():
    print("Testing Milestone 3 Endpoints...")

    # 1. Test RAG Shopping Assistant
    res = client.post("/shop/ai-assistant", json={"query": "smart watch under 1000"})
    print("1. RAG Assistant Status:", res.status_code)
    assert res.status_code == 200
    rag_data = res.json()
    print("   RAG Reply Preview:", rag_data.get("reply")[:90] + "...")
    print("   RAG Recommended Items:", len(rag_data.get("recommended_products", [])))

    # 2. Test Text-to-SQL logic in ai_service directly
    import ai_service
    db = database.SessionLocal()
    try:
        analyst_res = ai_service.text_to_sql_analyst("What is my top selling product?", 1, db)
        print("2. Text-to-SQL Analyst Generated SQL:\n  ", analyst_res.get("generated_sql").strip())
        print("   Text-to-SQL AI Answer:\n  ", analyst_res.get("ai_answer"))
    finally:
        db.close()

    print("\nAll Milestone 3 unit tests passed successfully!")

if __name__ == "__main__":
    run_tests()
