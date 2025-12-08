"""Script to create or reset admin user with all new fields"""
import pymysql
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
        # Check if admin user exists
        cursor.execute("SELECT id, role FROM users WHERE username = 'admin'")
        admin = cursor.fetchone()
        
        hashed_password = pwd_context.hash("admin123")
        
        if admin:
            print(f"Admin user found with ID: {admin[0]}, Role: {admin[1]}")
            print("Updating admin user with new fields...")
            
            cursor.execute("""
                UPDATE users 
                SET 
                    email = 'admin@example.com',
                    full_name = 'System Administrator',
                    hashed_password = %s,
                    role = 'admin',
                    is_active = TRUE,
                    phone = NULL,
                    department = 'Administration',
                    position = 'System Administrator',
                    permissions = NULL,
                    last_login = NULL
                WHERE username = 'admin'
            """, (hashed_password,))
            
            connection.commit()
            print("✅ Admin user updated successfully!")
        else:
            print("Admin user not found. Creating new admin user...")
            
            cursor.execute("""
                INSERT INTO users 
                (email, username, full_name, hashed_password, role, is_active, phone, department, position, permissions, last_login, created_at, updated_at)
                VALUES 
                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (
                'admin@example.com',
                'admin',
                'System Administrator',
                hashed_password,
                'admin',
                True,
                None,
                'Administration',
                'System Administrator',
                None,
                None
            ))
            
            connection.commit()
            print("✅ Admin user created successfully!")
        
        print("\n" + "="*50)
        print("Admin Login Credentials:")
        print("="*50)
        print("Username: admin")
        print("Password: admin123")
        print("="*50)
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    connection.rollback()
finally:
    connection.close()

