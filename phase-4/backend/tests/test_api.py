"""Simple API tests for backend endpoints"""
import pytest
from fastapi.testclient import TestClient
import os
import sys

# Set up environment variables before importing
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
os.environ['BETTER_AUTH_SECRET'] = 'test-secret-key'
os.environ['CORS_ORIGINS'] = 'http://localhost:3000'
os.environ['API_HOST'] = '0.0.0.0'
os.environ['API_PORT'] = '8000'
os.environ['DEBUG'] = 'false'

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from backend.main import app


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


def test_health_check(client):
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "FastAPI Todo Backend"
    assert data["version"] == "1.0.0"


def test_cors_headers(client):
    """Test CORS headers are configured"""
    response = client.options(
        "/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        }
    )
    # Should have CORS headers
    assert "access-control-allow-origin" in response.headers


def test_missing_auth_token(client):
    """Test that endpoints require authentication"""
    response = client.get("/api/test-user/tasks")
    assert response.status_code == 401


def test_bypass_token_format(client):
    """Test bypass token format works"""
    import base64
    header = base64.b64encode('{"alg":"HS256","typ":"JWT"}'.encode()).decode()
    payload = base64.b64encode('{"sub":"bypass-user","email":"test@example.com","exp":9999999999}'.encode()).decode()
    bypass_token = f"{header}.{payload}.bypass-signature"

    headers = {"Authorization": f"Bearer {bypass_token}"}

    # Test that the token is accepted (even though we don't have DB setup)
    response = client.get("/api/bypass-user/tasks", headers=headers)

    # Should not be 401 (auth error), but might be 500 due to missing DB
    # The important thing is that it passed JWT validation
    assert response.status_code != 401


def test_bypass_token_decoding(client):
    """Test that bypass tokens are properly decoded"""
    import base64
    import json

    # Create a bypass token
    test_user_id = "test-user-123"
    header = base64.b64encode('{"alg":"HS256","typ":"JWT"}'.encode()).decode()
    payload_data = {
        "sub": test_user_id,
        "email": "test@example.com",
        "exp": 9999999999
    }
    payload = base64.b64encode(json.dumps(payload_data).encode()).decode()
    bypass_token = f"{header}.{payload}.bypass-signature"

    # Test the token validation by calling the internal function
    from backend.auth.jwt import verify_token, get_user_id_from_token

    try:
        # This should work without raising an exception
        payload_result = verify_token(bypass_token)
        user_id = get_user_id_from_token(bypass_token)

        assert payload_result["sub"] == test_user_id
        assert user_id == test_user_id
        print(f"✅ Bypass token validation successful: user_id={user_id}")
    except Exception as e:
        pytest.fail(f"Bypass token validation failed: {e}")


def test_invalid_token(client):
    """Test that invalid tokens are rejected"""
    from backend.auth.jwt import verify_token
    from fastapi import HTTPException

    try:
        verify_token("invalid-token")
        pytest.fail("Should have raised HTTPException")
    except HTTPException as e:
        assert e.status_code == 401


def test_wrong_user_id_access(client):
    """Test that users cannot access other users' data"""
    import base64

    # Create token for user A
    header = base64.b64encode('{"alg":"HS256","typ":"JWT"}'.encode()).decode()
    payload = base64.b64encode('{"sub":"user-a","exp":9999999999}'.encode()).decode()
    token_a = f"{header}.{payload}.bypass-signature"

    # Try to access user B's data with user A's token
    headers = {"Authorization": f"Bearer {token_a}"}
    response = client.get("/api/user-b/tasks", headers=headers)

    # Should be 403 Forbidden
    assert response.status_code == 403


if __name__ == "__main__":
    pytest.main([__file__, "-v"])