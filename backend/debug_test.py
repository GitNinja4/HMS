from fastapi.testclient import TestClient
from app.main import app
from tests.conftest import override_get_db
from app.database import get_db
import traceback

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

try:
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "test@example.com",
            "name": "Test User",
            "password": "TestPass123",
            "role": "patient"
        }
    )

    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
    if response.status_code != 500:
        print(f"JSON: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()

