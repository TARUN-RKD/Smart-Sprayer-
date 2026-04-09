from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./smart_sprayer.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_schema():
    inspector = inspect(engine)
    if not inspector.has_table("pesticides"):
        return

    columns = {column["name"] for column in inspector.get_columns("pesticides")}
    with engine.begin() as connection:
        if "disease" not in columns:
            connection.execute(text("ALTER TABLE pesticides ADD COLUMN disease VARCHAR"))
        connection.execute(text("""
            UPDATE pesticides
            SET disease = (
                SELECT group_concat(d.name, ', ')
                FROM disease_pesticide dp
                JOIN diseases d ON d.id = dp.disease_id
                WHERE dp.pesticide_id = pesticides.id
            )
            WHERE disease IS NULL
               OR TRIM(disease) = ''
        """))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
