#!/usr/bin/env python
"""
Backend API Test Script
Tests if the running backend server is responding correctly
"""

import requests
import json
import sys

BASE_URL = "http://127.0.0.1:5000"
API_URL = f"{BASE_URL}/api"

def test_root():
    """Test root endpoint"""
    print("\n" + "="*60)
    print("TEST 1: ROOT ENDPOINT")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"✅ Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST 2: HEALTH ENDPOINT")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"✅ Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_signup():
    """Test signup endpoint"""
    print("\n" + "="*60)
    print("TEST 3: SIGNUP ENDPOINT")
    print("="*60)
    
    payload = {
        "email": f"test_{hash('test')%10000}@hospital.com",
        "name": "Test User",
        "password": "TestPass123!",
        "role": "doctor"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/signup",
            json=payload,
            timeout=5
        )
        print(f"✅ Status Code: {response.status_code}")
        print(f"Request: {json.dumps(payload, indent=2)}")
        
        if response.status_code in [200, 201]:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Error Response: {response.text}")
        
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_login():
    """Test login endpoint"""
    print("\n" + "="*60)
    print("TEST 4: LOGIN ENDPOINT")
    print("="*60)
    
    payload = {
        "email": "doctor@hospital.com",
        "password": "SecurePass123!"
    }
    
    try:
        response = requests.post(
            f"{API_URL}/auth/login",
            json=payload,
            timeout=5
        )
        print(f"✅ Status Code: {response.status_code}")
        print(f"Request: {json.dumps(payload, indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"   User ID: {data.get('user_id')}")
            print(f"   Role: {data.get('role')}")
            print(f"   Access Token: {data.get('access_token', 'N/A')[:50]}...")
        else:
            print(f"Error Response: {response.text}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("HMS BACKEND - API ENDPOINT TESTS")
    print(f"Testing backend at: {BASE_URL}")
    print("="*60)
    
    results = []
    results.append(("Root Endpoint", test_root()))
    results.append(("Health Endpoint", test_health()))
    results.append(("Signup Endpoint", test_signup()))
    results.append(("Login Endpoint", test_login()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*60 + "\n")
    
    return all(result for _, result in results)

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        sys.exit(1)
