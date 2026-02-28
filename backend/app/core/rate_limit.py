"""
Simple in-memory rate limiter (no external dependencies).
Tracks requests per IP per window and rejects with 429 when exceeded.
"""
import time
from collections import defaultdict
from fastapi import Request, HTTPException


class RateLimiter:
    def __init__(self, max_calls: int = 10, window_seconds: int = 60):
        self.max_calls = max_calls
        self.window = window_seconds
        self._hits: dict[str, list[float]] = defaultdict(list)

    def _clean(self, key: str):
        now = time.time()
        self._hits[key] = [t for t in self._hits[key] if now - t < self.window]

    def check(self, request: Request):
        key = request.client.host if request.client else "unknown"
        self._clean(key)
        if len(self._hits[key]) >= self.max_calls:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Max {self.max_calls} requests per {self.window}s.",
            )
        self._hits[key].append(time.time())

    def remaining(self, request: Request) -> dict:
        key = request.client.host if request.client else "unknown"
        self._clean(key)
        used = len(self._hits[key])
        return {
            "limit": self.max_calls,
            "remaining": max(0, self.max_calls - used),
            "window_seconds": self.window,
        }


# Singleton — 10 requests per minute
limiter = RateLimiter(max_calls=10, window_seconds=60)
