import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

_password = os.getenv("SUPABASE_PASSWORD")
_host = "db.owsoropgwbhirosppyro.supabase.co"
DATABASE_URL = f"postgresql://postgres:{_password}@{_host}:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
