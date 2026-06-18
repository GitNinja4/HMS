"""Tests for user management endpoints."""

import pytest
from tests.conftest import client


class TestUserEndpoints:
    """Test user CRUD endpoints."""
    
    @staticmethod
    def create_test_users(count=3):
        """Helper to create test users."""
        users = []
        for i in range(count):
            response = client.post(
                "/api/auth/signup",
                json={
                    "email": f"user{i}@example.com",
                    "name": f"User {i}",
                    "password": "TestPass123",
                    "role": "patient"
                }
            )
            users.append(response.json())
        return users
    
    @staticmethod
    def create_admin_user():
        """Create an admin user for testing."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "admin@example.com",
                "name": "Admin User",
                "password": "AdminPass123",
                "role": "admin"
            }
        )
        return response.json()
    
    def test_list_users_admin_only(self):
        """Test listing users - admin only."""
        # Create users
        users = self.create_test_users(2)
        admin = self.create_admin_user()
        
        # Try to list without auth - should fail
        response = client.get("/api/users")
        assert response.status_code == 403  # Forbidden (need auth)
        
        # List with admin token
        response = client.get(
            "/api/users",
            headers={"Authorization": f"Bearer {admin['access_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert len(data["users"]) >= 2
    
    def test_get_user_by_id(self):
        """Test getting user by ID."""
        users = self.create_test_users(1)
        user_token = users[0]["access_token"]
        user_id = users[0]["user_id"]
        
        # Get own profile
        response = client.get(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["email"] == "user0@example.com"
    
    def test_get_user_by_id_non_admin_cannot_view_others(self):
        """Test non-admin users cannot view other users."""
        users = self.create_test_users(2)
        user1_token = users[0]["access_token"]
        user2_id = users[1]["user_id"]
        
        # Try to view another user's profile
        response = client.get(
            f"/api/users/{user2_id}",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 403  # Forbidden
    
    def test_get_user_by_id_admin_can_view_any(self):
        """Test admin users can view any user's profile."""
        users = self.create_test_users(1)
        admin = self.create_admin_user()
        user_id = users[0]["user_id"]
        
        response = client.get(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {admin['access_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
    
    def test_update_user_own_profile(self):
        """Test updating own profile."""
        users = self.create_test_users(1)
        user_token = users[0]["access_token"]
        user_id = users[0]["user_id"]
        
        response = client.put(
            f"/api/users/{user_id}",
            json={
                "name": "Updated Name",
                "age": "30",
                "gender": "M"
            },
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["age"] == "30"
        assert data["gender"] == "M"
    
    def test_update_user_non_admin_cannot_update_others(self):
        """Test non-admin cannot update other users."""
        users = self.create_test_users(2)
        user1_token = users[0]["access_token"]
        user2_id = users[1]["user_id"]
        
        response = client.put(
            f"/api/users/{user2_id}",
            json={"name": "Hacked Name"},
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 403
    
    def test_update_user_admin_can_update_any(self):
        """Test admin can update any user."""
        users = self.create_test_users(1)
        admin = self.create_admin_user()
        user_id = users[0]["user_id"]
        
        response = client.put(
            f"/api/users/{user_id}",
            json={"name": "Admin Updated Name"},
            headers={"Authorization": f"Bearer {admin['access_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Admin Updated Name"
    
    def test_delete_user_admin_only(self):
        """Test deleting user - admin only."""
        users = self.create_test_users(1)
        user_token = users[0]["access_token"]
        user_id = users[0]["user_id"]
        
        # Non-admin cannot delete
        response = client.delete(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403
        
        # Admin can delete
        admin = self.create_admin_user()
        response = client.delete(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {admin['access_token']}"}
        )
        assert response.status_code == 204
    
    def test_get_user_status(self):
        """Test getting user status."""
        users = self.create_test_users(1)
        user_token = users[0]["access_token"]
        user_id = users[0]["user_id"]
        
        response = client.get(
            f"/api/users/{user_id}/status",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user_id
        assert data["role"] == "patient"
        assert data["status"] in ["active", "follow_up"]
    
    def test_get_user_status_any_user_can_view(self):
        """Test any authenticated user can view status."""
        users = self.create_test_users(2)
        user1_token = users[0]["access_token"]
        user2_id = users[1]["user_id"]
        
        # User 1 can view User 2's status
        response = client.get(
            f"/api/users/{user2_id}/status",
            headers={"Authorization": f"Bearer {user1_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == user2_id
    
    def test_ban_user_admin_only(self):
        """Test banning user - admin only."""
        users = self.create_test_users(1)
        user_token = users[0]["access_token"]
        user_id = users[0]["user_id"]
        
        # Non-admin cannot ban
        response = client.post(
            f"/api/users/{user_id}/ban",
            json={"ban": True},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403
        
        # Admin can ban
        admin = self.create_admin_user()
        response = client.post(
            f"/api/users/{user_id}/ban",
            json={"ban": True},
            headers={"Authorization": f"Bearer {admin['access_token']}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["banned"] == True
    
    def test_change_user_status(self):
        """Test changing user status - admin/doctor/nurse only."""
        users = self.create_test_users(1)
        user_id = users[0]["user_id"]
        
        # Create doctor
        doctor_response = client.post(
            "/api/auth/signup",
            json={
                "email": "doctor@example.com",
                "name": "Dr. Test",
                "password": "DocPass123",
                "role": "doctor"
            }
        )
        doctor_token = doctor_response.json()["access_token"]
        
        # Doctor can change status
        response = client.patch(
            f"/api/users/{user_id}/status",
            json={"status": "admitted"},
            headers={"Authorization": f"Bearer {doctor_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "admitted"
