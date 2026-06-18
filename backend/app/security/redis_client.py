"""Redis client and utilities."""

import redis
import json
from typing import Optional
from app.config import settings
from app.security.jwt import decode_token


# Redis client singleton
_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> redis.Redis:
    """Get or create Redis client."""
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
            _redis_client.ping()
            print("✅ Redis connected")
        except Exception as e:
            print(f"⚠️ Redis connection warning: {e}")
            return None
    return _redis_client


def add_token_to_blacklist(token: str, expiry_seconds: int = None) -> bool:
    """
    Add token to blacklist on logout.
    
    Args:
        token: JWT token to blacklist
        expiry_seconds: TTL for blacklist entry (defaults to token expiry)
        
    Returns:
        True if successful, False if Redis unavailable
    """
    try:
        client = get_redis_client()
        if client is None:
            return False
        
        # Decode token to get expiry time
        payload = decode_token(token, token_type="access")
        if payload is None:
            return False
        
        # Use token expiry as TTL, or default to 24 hours
        ttl = expiry_seconds or 86400
        
        # Store blacklist entry: key = "blacklist:{token_jti}", value = "1"
        # Use token's "jti" (JWT ID) if available, otherwise use hash of token
        jti = payload.get("jti") or hash(token)
        blacklist_key = f"blacklist:{jti}"
        
        client.setex(blacklist_key, ttl, "1")
        return True
    except Exception as e:
        print(f"⚠️ Token blacklist error: {e}")
        return False


def is_token_blacklisted(token: str) -> bool:
    """
    Check if token is blacklisted.
    
    Args:
        token: JWT token to check
        
    Returns:
        True if blacklisted, False otherwise
    """
    try:
        client = get_redis_client()
        if client is None:
            return False
        
        payload = decode_token(token, token_type="access")
        if payload is None:
            return False
        
        jti = payload.get("jti") or hash(token)
        blacklist_key = f"blacklist:{jti}"
        
        return client.exists(blacklist_key) > 0
    except Exception as e:
        print(f"⚠️ Token blacklist check error: {e}")
        return False


def close_redis_client():
    """Close Redis client connection."""
    global _redis_client
    if _redis_client is not None:
        try:
            _redis_client.close()
            _redis_client = None
            print("✅ Redis connection closed")
        except Exception as e:
            print(f"⚠️ Error closing Redis: {e}")
