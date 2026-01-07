"""
Redis-Based Rate Limiter for Distributed Systems
⚠️ CRITICAL: Uses Redis for shared state across multiple server instances
"""

import os
import time
from typing import Optional
from datetime import datetime, timedelta

from fastapi import HTTPException, Request, status


# Redis configuration
REDIS_URL = os.getenv("REDIS_URL")
ENABLE_RATE_LIMITING = os.getenv("ENABLE_RATE_LIMITING", "True").lower() == "true"

# Initialize Redis client (None if Redis not configured)
redis_client: Optional[any] = None

if REDIS_URL and ENABLE_RATE_LIMITING:
    try:
        import redis.asyncio as redis
        redis_client = redis.from_url(
            REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )
        print("✓ Redis rate limiter initialized")
    except ImportError:
        print("⚠️  redis package not installed. Install with: pip install redis")
        redis_client = None
    except Exception as e:
        print(f"⚠️  Redis connection failed: {e}")
        print("⚠️  Rate limiting will use in-memory fallback (not suitable for production)")
        redis_client = None
else:
    print("WARNING: REDIS_URL not configured. Rate limiting using in-memory fallback.")


# In-memory fallback for development (NOT suitable for production with multiple instances)
_memory_store: dict[str, list[datetime]] = {}


def get_client_ip(request: Request) -> str:
    """Get client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"


async def check_rate_limit(
    key: str,
    max_requests: int,
    window_seconds: int,
    identifier: str = "unknown"
) -> tuple[bool, dict]:
    """
    Check if a rate limit has been exceeded
    
    Args:
        key: Rate limit key (e.g., "login:192.168.1.1")
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds
        identifier: Human-readable identifier for logging
        
    Returns:
        Tuple of (is_allowed, info_dict)
        info_dict contains: remaining, reset_time, limit
    """
    if not ENABLE_RATE_LIMITING:
        return True, {"limit": max_requests, "remaining": max_requests, "reset": 0}
    
    current_time = time.time()
    window_start = current_time - window_seconds
    
    if redis_client:
        # Redis-based rate limiting (production)
        try:
            # Use Redis sorted set to track requests
            pipe = redis_client.pipeline()
            
            # Remove old requests outside the window
            pipe.zremrangebyscore(key, 0, window_start)
            
            # Count requests in current window
            pipe.zcard(key)
            
            # Add current request
            pipe.zadd(key, {str(current_time): current_time})
            
            # Set expiration on the key
            pipe.expire(key, window_seconds)
            
            # Execute pipeline
            results = await pipe.execute()
            request_count = results[1]  # Count from zcard
            
            is_allowed = request_count < max_requests
            remaining = max(0, max_requests - request_count - 1)
            reset_time = int(current_time + window_seconds)
            
            return is_allowed, {
                "limit": max_requests,
                "remaining": remaining,
                "reset": reset_time,
                "identifier": identifier
            }
            
        except Exception as e:
            print(f"⚠️  Redis error in rate limiter: {e}")
            # Fall through to in-memory fallback
    
    # In-memory fallback (development only)
    now = datetime.now()
    
    if key not in _memory_store:
        _memory_store[key] = []
    
    # Remove old requests outside the window
    _memory_store[key] = [
        req_time for req_time in _memory_store[key]
        if now - req_time < timedelta(seconds=window_seconds)
    ]
    
    # Check limit
    request_count = len(_memory_store[key])
    is_allowed = request_count < max_requests
    
    if is_allowed:
        _memory_store[key].append(now)
    
    remaining = max(0, max_requests - request_count - 1)
    reset_time = int(current_time + window_seconds)
    
    return is_allowed, {
        "limit": max_requests,
        "remaining": remaining,
        "reset": reset_time,
        "identifier": identifier,
        "warning": "Using in-memory rate limiting (not suitable for production)"
    }


# Predefined rate limiters for FastAPI dependencies
async def rate_limit_login(request: Request):
    """Rate limit for login endpoint: 5 requests per 15 minutes"""
    ip = get_client_ip(request)
    key = f"login:{ip}"
    is_allowed, info = await check_rate_limit(key, max_requests=5, window_seconds=900, identifier=ip)
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": f"Too many login attempts. Please try again in {info['reset'] - int(time.time())} seconds.",
                "limit": info["limit"],
                "reset": info["reset"]
            }
        )


async def rate_limit_register(request: Request):
    """Rate limit for registration endpoint: 3 requests per hour"""
    ip = get_client_ip(request)
    key = f"register:{ip}"
    is_allowed, info = await check_rate_limit(key, max_requests=3, window_seconds=3600, identifier=ip)
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": f"Too many registration attempts. Please try again in {info['reset'] - int(time.time())} seconds.",
                "limit": info["limit"],
                "reset": info["reset"]
            }
        )


async def rate_limit_password_reset(request: Request):
    """Rate limit for password reset endpoint: 3 requests per hour"""
    ip = get_client_ip(request)
    key = f"password_reset:{ip}"
    is_allowed, info = await check_rate_limit(key, max_requests=3, window_seconds=3600, identifier=ip)
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": f"Too many password reset attempts. Please try again in {info['reset'] - int(time.time())} seconds.",
                "limit": info["limit"],
                "reset": info["reset"]
            }
        )


async def cleanup_redis():
    """Cleanup Redis connection on shutdown"""
    if redis_client:
        await redis_client.close()
        print("✓ Redis connection closed")
