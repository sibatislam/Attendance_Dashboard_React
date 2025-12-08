"""Migration script to add new columns to users table"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection
connection = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "attendance_db"),
    port=int(os.getenv("DB_PORT", 3306))
)

try:
    with connection.cursor() as cursor:
        # Check if columns exist
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'users'
        """, (os.getenv("DB_NAME", "attendance_db"),))
        
        existing_columns = [row[0] for row in cursor.fetchall()]
        print(f"Existing columns: {existing_columns}")
        
        # Add phone column if not exists
        if 'phone' not in existing_columns:
            print("Adding 'phone' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL")
            print("✓ Added 'phone' column")
        
        # Add department column if not exists
        if 'department' not in existing_columns:
            print("Adding 'department' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN department VARCHAR(100) NULL")
            print("✓ Added 'department' column")
        
        # Add position column if not exists
        if 'position' not in existing_columns:
            print("Adding 'position' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN position VARCHAR(100) NULL")
            print("✓ Added 'position' column")
        
        # Add permissions column if not exists
        if 'permissions' not in existing_columns:
            print("Adding 'permissions' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN permissions JSON NULL")
            print("✓ Added 'permissions' column")
        
        # Add last_login column if not exists
        if 'last_login' not in existing_columns:
            print("Adding 'last_login' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN last_login DATETIME NULL")
            print("✓ Added 'last_login' column")
        
        connection.commit()
        print("\n✅ Migration completed successfully!")
        
except Exception as e:
    print(f"\n❌ Error during migration: {e}")
    connection.rollback()
finally:
    connection.close()

