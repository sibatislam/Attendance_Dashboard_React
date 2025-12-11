"""Migration script to add from_month and to_month columns to teams_uploaded_file table"""
from sqlalchemy import create_engine, Column, String
from sqlalchemy.orm import sessionmaker
from sqlalchemy.inspection import inspect
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection details
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3310")
DB_NAME = os.getenv("DB_NAME", "attendance_db")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def add_column_if_not_exists(engine, table_name, column_name, column_type, nullable=True):
    inspector = inspect(engine)
    
    # Check if table exists
    if table_name not in inspector.get_table_names():
        print(f"✓ Table '{table_name}' does not exist yet (will be created automatically)")
        return
    
    columns = [col['name'] for col in inspector.get_columns(table_name)]
    
    print(f"Existing columns in {table_name}: {columns}")

    if column_name not in columns:
        with engine.connect() as connection:
            nullable_sql = "NULL" if nullable else "NOT NULL"
            alter_sql = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type.compile(dialect=engine.dialect)} {nullable_sql}"
            print(f"Adding '{column_name}' column with SQL: {alter_sql}")
            connection.execute(alter_sql)
            connection.commit()
        print(f"✓ Added '{column_name}' column")
    else:
        print(f"✓ Column '{column_name}' already exists")

def migrate_teams_table():
    print("\n================================================================")
    print("Starting MS Teams table migration...")
    print("================================================================\n")
    
    # Add from_month column
    add_column_if_not_exists(engine, "teams_uploaded_file", "from_month", String(7), nullable=True)
    
    # Add to_month column
    add_column_if_not_exists(engine, "teams_uploaded_file", "to_month", String(7), nullable=True)
    
    print("\n================================================================")
    print("✅ Migration completed successfully!")
    print("================================================================\n")

if __name__ == "__main__":
    migrate_teams_table()

