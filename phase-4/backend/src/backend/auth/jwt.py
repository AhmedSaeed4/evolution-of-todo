"""JWT validation utilities using JWKS from Better Auth"""
import jwt as pyjwt
from jwt import PyJWKClient, PyJWK
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import HTTPException, status
from datetime import datetime
import os
import json
import base64
import httpx
import time

from ..config import settings


# Better Auth frontend URL for JWKS
BETTER_AUTH_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")

# PyJWT JWKS client for fetching and caching keys
_jwks_client = None


def get_jwks_client() -> PyJWKClient:
    """Get or create JWKS client."""
    global _jwks_client
    if _jwks_client is None:
        jwks_uri = f"{BETTER_AUTH_URL}/api/auth/jwks"
        _jwks_client = PyJWKClient(jwks_uri, cache_keys=True, lifespan=300)
    return _jwks_client


async def verify_token(token: str) -> dict:
    """
    Verify JWT token and return claims.
    Supports:
    - EdDSA tokens from Better Auth (validated via JWKS)
    - Bypass tokens for development

    Args:
        token: JWT token string

    Returns:
        dict: Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No token provided"
        )

    # Handle bypass tokens for development (format: header.payload.bypass-signature)
    if token.endswith('.bypass-signature'):
        try:
            parts = token.split('.')
            if len(parts) != 3:
                raise ValueError("Invalid bypass token format")

            # Decode the payload
            payload_json = parts[1]
            # Add padding if needed for base64 decoding
            padding = 4 - len(payload_json) % 4
            if padding != 4:
                payload_json += '=' * padding

            payload_bytes = base64.b64decode(payload_json)
            return json.loads(payload_bytes)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid bypass token: {str(e)}"
            )

    # Validate JWT from Better Auth using JWKS
    try:
        # Get the signing key from JWKS
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token (signature only)
        # Skip audience/issuer validation for local development with minikube tunnel
        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["EdDSA", "ES256", "RS256"],
            options={"verify_aud": False, "verify_iss": False}
        )
        
        return payload
        
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )


def get_user_id_from_token(payload: dict) -> str:
    """
    Extract user_id from decoded JWT payload.

    Args:
        payload: Decoded JWT payload

    Returns:
        str: User ID from token

    Raises:
        HTTPException: If token is missing user_id
    """
    user_id = payload.get("sub") or payload.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing user_id"
        )
    return user_id


def validate_token_user_match(payload: dict, path_user_id: str) -> None:
    """
    Validate that token user_id matches path user_id.

    Args:
        payload: Decoded JWT payload
        path_user_id: User ID from URL path

    Raises:
        HTTPException: If user_id mismatch or unauthorized
    """
    token_user_id = get_user_id_from_token(payload)
    if token_user_id != path_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this user's resources"
        )