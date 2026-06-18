#!/usr/bin/env python
"""
Comprehensive backend testing script.
Tests:
1. Database connectivity
2. User model creation
3. Password hashing
4. JWT token generation
5. Auth service functions
6. Adding test data
"""

import sys
import os

# Add the backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings
from app.database import SessionLocal, create_tables, init_db, drop_tables
from app.models import User, RoleEnum
from app.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.services.auth_service import AuthService
from app.schemas import SignupRequest, LoginRequest
from sqlalchemy.orm import Session

def test_database_connection():
    """Test database connectivity."""
    print("\n" + "="*60)
    print("TEST 1: DATABASE CONNECTIVITY")
    print("="*60)
    
    try:
        db = SessionLocal()
        # Try to execute a simple query
        result = db.execute("SELECT 1")
        print("✅ Database connection successful")
        db.close()
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {str(e)}")
        return False


def test_database_initialization():
    """Test database table creation."""
    print("\n" + "="*60)
    print("TEST 2: DATABASE INITIALIZATION")
    print("="*60)
    
    try:
        # Create all tables
        init_db()
        print("✅ Database tables initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {str(e)}")
        return False


def test_password_hashing():
    """Test password hashing and verification."""
    print("\n" + "="*60)
    print("TEST 3: PASSWORD HASHING")
    print("="*60)
    
    try:
        password = "TestPassword123!"
        hashed = hash_password(password)
        print(f"✅ Password hashed: {hashed[:50]}...")
        
        # Verify password
        if verify_password(password, hashed):
            print("✅ Password verification successful")
        else:
            print("❌ Password verification failed")
            return False
        
        # Verify wrong password
        if not verify_password("WrongPassword", hashed):
            print("✅ Wrong password correctly rejected")
        else:
            print("❌ Wrong password incorrectly accepted")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Password hashing test failed: {str(e)}")
        return False


def test_jwt_tokens():
    """Test JWT token generation and decoding."""
    print("\n" + "="*60)
    print("TEST 4: JWT TOKEN GENERATION")
    print("="*60)
    
    try:
        # Create tokens
        user_id = "test-user-123"
        role = "doctor"
        
        access_token = create_access_token(user_id, role)
        refresh_token = create_refresh_token(user_id)
        
        print(f"✅ Access token created: {access_token[:50]}...")
        print(f"✅ Refresh token created: {refresh_token[:50]}...")
        
        # Decode tokens
        access_payload = decode_token(access_token, token_type="access")
        refresh_payload = decode_token(refresh_token, token_type="refresh")
        
        if access_payload and refresh_payload:
            print("✅ Token decoding successful")
            print(f"   Access token payload: {access_payload}")
            print(f"   Refresh token payload: {refresh_payload}")
        else:
            print("❌ Token decoding failed")
            return False
        
        return True
    except Exception as e:
        print(f"❌ JWT token test failed: {str(e)}")
        return False


def test_user_creation():
    """Test creating a user in the database."""
    print("\n" + "="*60)
    print("TEST 5: USER CREATION")
    print("="*60)
    
    try:
        db = SessionLocal()
        
        # Create a test user
        password = "TestPassword123!"
        user = User(
            email="testuser@hospital.com",
            name="Test User",
            password_hash=hash_password(password),
            role="doctor",
            status="active",
            email_verified=False,
            specialization="Cardiology",
            department="Cardiology"
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        print(f"✅ User created successfully")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.name}")
        print(f"   Role: {user.role}")
        
        db.close()
        return True
    except Exception as e:
        print(f"❌ User creation failed: {str(e)}")
        return False


def test_user_retrieval():
    """Test retrieving user from database."""
    print("\n" + "="*60)
    print("TEST 6: USER RETRIEVAL")
    print("="*60)
    
    try:
        db = SessionLocal()
        
        # Retrieve user by email
        user = db.query(User).filter(User.email == "testuser@hospital.com").first()
        
        if user:
            print(f"✅ User retrieved successfully")
            print(f"   ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Name: {user.name}")
            print(f"   Role: {user.role}")
            print(f"   Specialization: {user.specialization}")
        else:
            print("❌ User not found")
            db.close()
            return False
        
        db.close()
        return True
    except Exception as e:
        print(f"❌ User retrieval failed: {str(e)}")
        return False


def test_auth_service_signup():
    """Test AuthService.signup method."""
    print("\n" + "="*60)
    print("TEST 7: AUTH SERVICE - SIGNUP")
    print("="*60)
    
    try:
        db = SessionLocal()
        
        # Create signup request
        signup_request = SignupRequest(
            email="doctor@hospital.com",
            name="Dr. Jane Smith",
            password="SecurePass123!",
            role="doctor"
        )
        
        user = AuthService.signup(db, signup_request)
        
        print(f"✅ User signed up successfully")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.name}")
        print(f"   Role: {user.role}")
        
        db.close()
        return True
    except Exception as e:
        print(f"❌ Signup test failed: {str(e)}")
        return False


def test_auth_service_login():
    """Test AuthService.login method."""
    print("\n" + "="*60)
    print("TEST 8: AUTH SERVICE - LOGIN")
    print("="*60)
    
    try:
        db = SessionLocal()
        
        # Create login request
        login_request = LoginRequest(
            email="doctor@hospital.com",
            password="SecurePass123!"
        )
        
        tokens = AuthService.login(db, login_request)
        
        print(f"✅ User logged in successfully")
        print(f"   User ID: {tokens['user_id']}")
        print(f"   Role: {tokens['role']}")
        print(f"   Access Token: {tokens['access_token'][:50]}...")
        print(f"   Refresh Token: {tokens['refresh_token'][:50]}...")
        
        db.close()
        return True
    except Exception as e:
        print(f"❌ Login test failed: {str(e)}")
        return False


def test_add_test_data():
    """Add comprehensive test data to database."""
    print("\n" + "="*60)
    print("TEST 9: ADD TEST DATA")
    print("="*60)
    
    try:
        db = SessionLocal()
        
        test_users = [
            {
                "email": "admin@hospital.com",
                "name": "Admin User",
                "password": "AdminPass123!",
                "role": "admin",
                "status": "active"
            },
            {
                "email": "nurse@hospital.com",
                "name": "Nurse Johnson",
                "password": "NursePass123!",
                "role": "nurse",
                "status": "active",
                "department": "Emergency"
            },
            {
                "email": "patient@hospital.com",
                "name": "Patient Mary",
                "password": "PatientPass123!",
                "role": "patient",
                "status": "admitted"
            }
        ]
        
        for user_data in test_users:
            # Check if user already exists
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                user = User(
                    email=user_data["email"],
                    name=user_data["name"],
                    password_hash=hash_password(user_data["password"]),
                    role=user_data["role"],
                    status=user_data["status"],
                    email_verified=True
                )
                
                # Add optional fields
                if "department" in user_data:
                    user.department = user_data["department"]
                
                db.add(user)
                print(f"   Added: {user_data['email']} ({user_data['role']})")
        
        db.commit()
        print("✅ Test data added successfully")
        
        # Verify all users
        all_users = db.query(User).all()
        print(f"✅ Total users in database: {len(all_users)}")
        for user in all_users:
            print(f"   - {user.email} ({user.role})")
        
        db.close()
        return True
    except Exception as e:
        print(f"❌ Test data addition failed: {str(e)}")
        return False


def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("HMS BACKEND - COMPREHENSIVE TEST SUITE")
    print("="*60)
    
    results = []
    
    # Run all tests
    results.append(("Database Connection", test_database_connection()))
    results.append(("Database Initialization", test_database_initialization()))
    results.append(("Password Hashing", test_password_hashing()))
    results.append(("JWT Tokens", test_jwt_tokens()))
    results.append(("User Creation", test_user_creation()))
    results.append(("User Retrieval", test_user_retrieval()))
    results.append(("Auth Service - Signup", test_auth_service_signup()))
    results.append(("Auth Service - Login", test_auth_service_login()))
    results.append(("Add Test Data", test_add_test_data()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("\n" + "="*60)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("="*60 + "\n")
    
    return all(result for _, result in results)


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
