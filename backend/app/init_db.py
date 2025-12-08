"""Initialize database with default admin user."""

def init_db():
    """Create tables and add default admin user if not exists."""
    try:
        from sqlalchemy.orm import Session
        from .db import SessionLocal
        from .models import User
        from .auth import get_password_hash
    except ImportError as e:
        print(f"⚠ Import error in init_db: {e}")
        return
    
    # Create default admin user
    db: Session = SessionLocal()
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                username="admin",
                full_name="System Administrator",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin_user)
            db.commit()
            print("✓ Default admin user created (username: admin, password: admin123)")
        else:
            print("✓ Admin user already exists")
    except Exception as e:
        print(f"⚠ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
