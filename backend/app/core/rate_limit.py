"""
Redis-backed distributed rate limiter.
Tracks requests per IP per window and rejects with 429 when exceeded.
Falls back to allowing requests if Redis is unavailable.
"""
import logging
from fastapi import Request, HTTPException
from app.core.redis_client import redis_client

logger = logging.getLogger("rate_limiter")


class RateLimiter:
    def __init__(self, max_calls: int = 10, window_seconds: int = 60):
        self.max_calls = max_calls
        self.window = window_seconds

    def _get_key(self, request: Request) -> str:
        ip = request.client.host if request.client else "unknown"
        return f"rate_limit:{ip}"

    async def check(self, request: Request):
        key = self._get_key(request)
        try:
            current_count = await redis_client.get(key)

            if current_count and int(current_count) >= self.max_calls:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Max {self.max_calls} requests per {self.window}s.",
                )

            # Increment and set expiry if it's the first request
            async with redis_client.pipeline(transaction=True) as pipe:
                pipe.incr(key)
                if not current_count:
                    pipe.expire(key, self.window)
                await pipe.execute()

        except HTTPException:
            # Re-raise rate limit 429s — don't swallow them
            raise
        except Exception as e:
            # Redis unavailable — log and allow the request through (fail open)
            logger.warning(f"Rate limiter Redis error (fail-open): {e}")

    async def remaining(self, request: Request) -> dict:
        key = self._get_key(request)
        try:
            current_count = await redis_client.get(key)
            used = int(current_count) if current_count else 0
        except Exception as e:
            logger.warning(f"Rate limiter Redis error on remaining(): {e}")
            used = 0
        return {
            "limit": self.max_calls,
            "remaining": max(0, self.max_calls - used),
            "window_seconds": self.window,
        }


# Singleton — 10 requests per minute
limiter = RateLimiter(max_calls=10, window_seconds=60)
