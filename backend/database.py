from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Changed from SQLite to PostgreSQL
# Note: The @ symbol in the password must be URL encoded as %40
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Puskar%402005@localhost:5432/shopsense_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
