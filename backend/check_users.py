"""Check all users in the database"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

connection = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "attendance_db"),
    port=int(os.getenv("DB_PORT", 3310))
)

try:
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT id, username, email, full_name, role, is_active, 
                   phone, department, position, created_at 
            FROM users 
            ORDER BY id
        """)
        
        users = cursor.fetchall()
        
        print("\n" + "="*80)
        print("ALL USERS IN DATABASE:")
        print("="*80)
        
        if not users:
            print("No users found in database!")
        else:
            for user in users:
                print(f"\nID: {user[0]}")
                print(f"Username: {user[1]}")
                print(f"Email: {user[2]}")
                print(f"Full Name: {user[3]}")
                print(f"Role: {user[4]}")
                print(f"Active: {user[5]}")
                print(f"Phone: {user[6]}")
                print(f"Department: {user[7]}")
                print(f"Position: {user[8]}")
                print(f"Created: {user[9]}")
                print("-" * 80)
        
        print(f"\nTotal users: {len(users)}")
        print("="*80)
        
except Exception as e:
    print(f"Error: {e}")
finally:
    connection.close()

