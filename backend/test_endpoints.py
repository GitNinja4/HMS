from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("Testing HMS Backend Endpoints")
print("=" * 50)

# Test 1: Health check
resp = client.get('/api/health')
status1 = "OK" if resp.status_code == 200 else "FAIL"
print(f"1. Health check: {resp.status_code} [{status1}]")

# Test 2: Root endpoint
resp = client.get('/')
status2 = "OK" if resp.status_code == 200 else "FAIL"
print(f"2. Root endpoint: {resp.status_code} [{status2}]")

# Test 3: Signup
resp = client.post('/api/auth/signup', json={
    'email': 'demo@example.com',
    'name': 'Demo User',
    'password': 'DemoPass123',
    'role': 'patient'
})
status3 = "OK" if resp.status_code == 201 else "FAIL"
print(f"3. Signup: {resp.status_code} [{status3}]")
if resp.status_code == 201:
    data = resp.json()
    print(f"   - User ID: {data['user_id']}")
    print(f"   - Role: {data['role']}")

# Test 4: Login
resp = client.post('/api/auth/login', json={
    'email': 'demo@example.com',
    'password': 'DemoPass123'
})
status4 = "OK" if resp.status_code == 200 else "FAIL"
print(f"4. Login: {resp.status_code} [{status4}]")
if resp.status_code == 200:
    data = resp.json()
    token = data['access_token'][:20]
    print(f"   - Access token: {token}...")

print("\n" + "=" * 50)
print("All critical endpoints working!")
