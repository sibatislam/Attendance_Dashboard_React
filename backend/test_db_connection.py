"""Test MySQL database connection on different ports"""
import pymysql
import os
from dotenv import load_dotenv

load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "attendance_db")

# Try both ports
ports_to_test = [3310, 3306]

print("="*80)
print("Testing MySQL Connection")
print("="*80)
print(f"Host: {DB_HOST}")
print(f"User: {DB_USER}")
print(f"Database: {DB_NAME}")
print(f"Password: {'(set)' if DB_PASSWORD else '(empty)'}")
print("="*80)
print()

for port in ports_to_test:
    print(f"\nTesting port {port}...")
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=port,
            connect_timeout=5
        )
        
        print(f"[SUCCESS] Connected to MySQL on port {port}!")
        
        # Check if database exists
        with connection.cursor() as cursor:
            cursor.execute("SHOW DATABASES")
            databases = [db[0] for db in cursor.fetchall()]
            
            print(f"   Available databases: {', '.join(databases)}")
            
            if DB_NAME in databases:
                print(f"   [OK] Database '{DB_NAME}' EXISTS")
                
                # Try to use the database
                cursor.execute(f"USE {DB_NAME}")
                cursor.execute("SHOW TABLES")
                tables = cursor.fetchall()
                print(f"   [OK] Database '{DB_NAME}' is accessible")
                print(f"   Tables found: {len(tables)}")
                if tables:
                    print(f"   Table names: {', '.join([t[0] for t in tables])}")
            else:
                print(f"   [WARNING] Database '{DB_NAME}' does NOT exist")
                print(f"   You need to create it with:")
                print(f"   CREATE DATABASE {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        
        connection.close()
        print(f"\n[INFO] MySQL is running on port {port}")
        print(f"   Update your .env file: DB_PORT={port}")
        break
        
    except pymysql.err.OperationalError as e:
        error_code, error_msg = e.args
        if error_code == 2003:  # Can't connect to MySQL server
            print(f"   [FAIL] Cannot connect to MySQL on port {port}")
            print(f"   Error: {error_msg}")
        elif error_code == 1045:  # Access denied
            print(f"   [FAIL] Access denied on port {port}")
            print(f"   Error: {error_msg}")
        else:
            print(f"   [FAIL] Error on port {port}: {error_msg}")
    except Exception as e:
        print(f"   [FAIL] Unexpected error on port {port}: {e}")

print("\n" + "="*80)
print("Connection Test Complete")
print("="*80)
