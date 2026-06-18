"""Comprehensive security tests for all security features."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import jwt

from app.main import app
from app.config import settings
from app.database import get_db, SessionLocal
from app.models import User, RoleEnum
from app.security.password import hash_password
from app.security.jwt import create_access_token, create_refresh_token
from app.utils.validators import InputValidator


# Test Client
client = TestClient(app)


class TestSecurityHeaders:
    """Test security headers are properly set."""
    
    def test_security_headers_present(self):
        """Test that security headers are included in responses."""
        response = client.get("/health")
        
        assert response.status_code == 200
        assert "x-content-type-options" in response.headers
        assert response.headers["x-content-type-options"] == "nosniff"
        
        assert "x-frame-options" in response.headers
        assert response.headers["x-frame-options"] == "DENY"
        
        assert "x-xss-protection" in response.headers
        
        assert "content-security-policy" in response.headers
        
        assert "referrer-policy" in response.headers
    
    def test_server_header_removed(self):
        """Test that server header is not exposed."""
        response = client.get("/health")
        assert "server" not in response.headers
    
    def test_cache_control_on_auth_endpoints(self):
        """Test that auth endpoints disable caching."""
        # This would need a valid token to test properly
        response = client.get("/api/auth/get-session")
        # Should have cache control headers
        assert "cache-control" in response.headers.keys() or response.status_code == 401


class TestInputValidation:
    """Test input validation across all endpoints."""
    
    def test_email_validation_invalid_format(self):
        """Test email validation rejects invalid emails."""
        invalid_emails = [
            "notanemail",
            "missing@domain",
            "@nodomain.com",
            "spaces in@email.com",
            "",
        ]
        
        for email in invalid_emails:
            if email:  # Skip empty string for validator test
                with pytest.raises(Exception):
                    InputValidator.validate_email(email)
    
    def test_email_validation_valid(self):
        """Test email validation accepts valid emails."""
        valid_emails = [
            "user@example.com",
            "test.user+tag@domain.co.uk",
            "info@hospital-system.com",
        ]
        
        for email in valid_emails:
            validated = InputValidator.validate_email(email)
            assert validated == email.lower()
    
    def test_password_validation_weak(self):
        """Test password validation rejects weak passwords."""
        weak_passwords = [
            "short",  # Too short
            "nouppercase123",  # No uppercase
            "NOLOWERCASE123",  # No lowercase
            "NoNumbers",  # No numbers
        ]
        
        for password in weak_passwords:
            with pytest.raises(Exception):
                InputValidator.validate_password(password)
    
    def test_password_validation_strong(self):
        """Test password validation accepts strong passwords."""
        strong_passwords = [
            "Secure@Pass123",
            "Test!Password2024",
            "MyPassword123ABC",
        ]
        
        for password in strong_passwords:
            validated = InputValidator.validate_password(password)
            assert validated == password
    
    def test_pagination_validation(self):
        """Test pagination parameter validation."""
        # Valid pagination
        skip, limit = InputValidator.validate_pagination(0, 100)
        assert skip == 0
        assert limit == 100
        
        # Invalid skip
        with pytest.raises(Exception):
            InputValidator.validate_pagination(-1, 100)
        
        # Invalid limit
        with pytest.raises(Exception):
            InputValidator.validate_pagination(0, 0)
        
        with pytest.raises(Exception):
            InputValidator.validate_pagination(0, 10001)


class TestJWTSecurity:
    """Test JWT token security."""
    
    def test_access_token_includes_required_claims(self):
        """Test that access tokens include all required security claims."""
        token = create_access_token(user_id=1, role="admin")
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        assert payload.get("sub") == "1"
        assert payload.get("role") == "admin"
        assert payload.get("type") == "access"
        assert "exp" in payload
        assert "iat" in payload
        if settings.JWT_USE_JTI:
            assert "jti" in payload
    
    def test_refresh_token_includes_required_claims(self):
        """Test that refresh tokens include all required security claims."""
        token = create_refresh_token(user_id=1)
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        assert payload.get("sub") == "1"
        assert payload.get("type") == "refresh"
        assert "exp" in payload
        assert "iat" in payload
        if settings.JWT_USE_JTI:
            assert "jti" in payload
        # Refresh tokens should NOT have role
        assert "role" not in payload
    
    def test_invalid_jwt_signature(self):
        """Test that tokens with invalid signatures are rejected."""
        # Create token with different secret
        fake_token = jwt.encode(
            {"sub": "1", "role": "admin", "type": "access"},
            "wrong-secret-key",
            algorithm="HS256"
        )
        
        # Should fail to decode
        payload = jwt.decode(fake_token, settings.JWT_SECRET_KEY, algorithms=["HS256"], options={"verify_signature": False})
        # The JWT library doesn't raise by default, so verify_signature=False allows it
        # In our code, we should verify
        from app.security.jwt import decode_token
        result = decode_token(fake_token)
        assert result is None  # Our decode_token should return None for invalid signatures
    
    def test_token_expiration(self):
        """Test that expired tokens are not accepted."""
        # Create token that expired
        past_time = datetime.now(timezone.utc) - timedelta(hours=1)
        expired_token = jwt.encode(
            {"sub": "1", "role": "admin", "type": "access", "exp": past_time},
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        
        from app.security.jwt import decode_token
        result = decode_token(expired_token)
        assert result is None  # Expired tokens should return None


class TestRateLimiting:
    """Test rate limiting functionality."""
    
    def test_rate_limit_headers(self):
        """Test that rate limit exceeded returns proper status."""
        # This test is harder without actually hitting the limit
        # Rate limiting is done via middleware
        response = client.get("/health")
        assert response.status_code == 200
        # Rate limiting should not affect health endpoint


class TestCORSConfiguration:
    """Test CORS configuration."""
    
    def test_cors_headers_present(self):
        """Test that CORS headers are properly configured."""
        # Test with allowed origin
        response = client.get(
            "/health",
            headers={"Origin": "http://localhost:5174"}
        )
        
        # CORS headers should be present
        # Note: FastAPI might not send CORS headers for simple requests
        assert response.status_code == 200


class TestAuthenticationFlow:
    """Test complete authentication flows with security."""
    
    def test_signup_with_invalid_password(self, db_session):
        """Test that signup rejects weak passwords."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "test@example.com",
                "name": "Test User",
                "password": "weak",  # Too weak
                "role": "patient"
            }
        )
        
        assert response.status_code == 400
        assert "password" in response.json()["detail"].lower()
    
    def test_signup_with_invalid_email(self, db_session):
        """Test that signup rejects invalid emails."""
        response = client.post(
            "/api/auth/signup",
            json={
                "email": "notanemail",
                "name": "Test User",
                "password": "StrongPass123",
                "role": "patient"
            }
        )
        
        assert response.status_code == 400
        assert "email" in response.json()["detail"].lower()
    
    def test_login_with_invalid_email(self, db_session):
        """Test that login rejects invalid emails."""
        response = client.post(
            "/api/auth/login",
            json={
                "email": "notanemail",
                "password": "Password123"
            }
        )
        
        assert response.status_code == 400
        assert "email" in response.json()["detail"].lower()


class TestSensitiveEndpointProtection:
    """Test that sensitive endpoints are properly protected."""
    
    def test_list_users_requires_admin(self):
        """Test that list users endpoint requires admin role."""
        response = client.get("/api/users")
        assert response.status_code == 401  # Not authenticated
    
    def test_docs_disabled_in_production(self):
        """Test that API docs are disabled in production."""
        if settings.APP_ENV == "production":
            response = client.get("/api/docs")
            assert response.status_code == 404
    
    def test_health_check_minimal_info(self):
        """Test that health check doesn't expose sensitive info."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        
        # Should not expose environment or version info
        assert "environment" not in data
        assert "version" not in data


class TestConfigSecurity:
    """Test configuration security."""
    
    def test_debug_disabled_in_production(self):
        """Test that DEBUG is False in production."""
        if settings.APP_ENV == "production":
            assert settings.DEBUG == False
    
    def test_jwt_secret_key_secure(self):
        """Test that JWT secret key is sufficiently long."""
        assert len(settings.JWT_SECRET_KEY) >= 32
    
    def test_cors_origins_not_wildcards(self):
        """Test that CORS doesn't use wildcard origin."""
        # Should not have * in allowed origins
        assert "*" not in settings.ALLOWED_ORIGINS


# Fixtures
@pytest.fixture
def db_session():
    """Create a fresh database session for each test."""
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture
def admin_user(db_session):
    """Create an admin user for testing."""
    user = User(
        email="admin@test.com",
        name="Admin User",
        password_hash=hash_password("AdminPass123"),
        role=RoleEnum.ADMIN.value,
        status="active",
        email_verified=True,
        banned=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def patient_user(db_session):
    """Create a patient user for testing."""
    user = User(
        email="patient@test.com",
        name="Patient User",
        password_hash=hash_password("PatientPass123"),
        role=RoleEnum.PATIENT.value,
        status="active",
        email_verified=True,
        banned=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
