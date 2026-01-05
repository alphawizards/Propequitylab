"""
Rate limiting utilities for Zapiio
Uses Redis for distributed rate limiting across multiple server instances
"""

import os
from typing import Optional
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta

# Redis configuration
REDIS_URL = os.getenv("REDIS_URL")
ENABLE_RATE_LIMITING = os.getenv("ENABLE_RATE_LIMITING", "True").lower() == "true"

# In-memory fallback (NOT production-safe with multiple instances)
_rate_limit_store = {}


def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host


async def check_rate_limit(
    key: str,
    max_requests: int,
    window_seconds: int
) -> bool:
    """
    Check if rate limit is exceeded
    
    Args:
        key: Unique identifier for rate limiting (e.g., IP address + endpoint)
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        
    Returns:
        True if request is allowed, raises HTTPException if rate limit exceeded
    """
    if not ENABLE_RATE_LIMITING:
        return True
    
    if not REDIS_URL:
        print("⚠️  WARNING: Using in-memory rate limiting (not production-safe)")
        return _check_rate_limit_memory(key, max_requests, window_seconds)
    
    # TODO: Implement Redis-based rate limiting
    # For now, use in-memory fallback
    return _check_rate_limit_memory(key, max_requests, window_seconds)


def _check_rate_limit_memory(key: str, max_requests: int, window_seconds: int) -> bool:
    """In-memory rate limiting (fallback)"""
    now = datetime.now()
    
    if key not in _rate_limit_store:
        _rate_limit_store[key] = []
    
    # Remove old requests outside the window
    _rate_limit_store[key] = [
        req_time for req_time in _rate_limit_store[key]
        if now - req_time < timedelta(seconds=window_seconds)
    ]
    
    # Check if limit exceeded
    if len(_rate_limit_store[key]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Try again in {window_seconds} seconds."
        )
    
    # Add current request
    _rate_limit_store[key].append(now)
    return True


# Predefined rate limiters
async def rate_limit_login(request: Request):
    """Rate limit for login endpoint: 5 requests per 15 minutes"""
    ip = get_client_ip(request)
    await check_rate_limit(f"login:{ip}", max_requests=5, window_seconds=900)


async def rate_limit_register(request: Request):
    """Rate limit for registration endpoint: 3 requests per hour"""
    ip = get_client_ip(request)
    await check_rate_limit(f"register:{ip}", max_requests=3, window_seconds=3600)


async def rate_limit_password_reset(request: Request):
    """Rate limit for password reset endpoint: 3 requests per hour"""
    ip = get_client_ip(request)
    await check_rate_limit(f"password_reset:{ip}", max_requests=3, window_seconds=3600)
