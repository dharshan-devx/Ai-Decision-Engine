"""
AI Status Manager — Event-Driven Health Tracking

This module tracks the AI layer's health status via Redis.
Status is updated passively based on real user requests.
The /api/health endpoint reads from this module.
Falls back to safe defaults if Redis is unavailable.
"""

import time
import logging
from typing import Optional
from app.core.redis_client import redis_client

logger = logging.getLogger("ai_status")

class AIStatusManager:
    """Redis-backed, event-driven AI status tracker with smart quota backoff."""

    def __init__(self):
        self.status_key = "ai_status:status"
        self.last_error_key = "ai_status:last_error"
        self.last_success_time_key = "ai_status:last_success_time"
        self.last_error_time_key = "ai_status:last_error_time"
        self.retry_after_key = "ai_status:retry_after"

    async def get_status(self) -> str:
        try:
            status = await redis_client.get(self.status_key)
            return status if status else "unknown"
        except Exception as e:
            logger.warning(f"ai_status Redis error on get_status(): {e}")
            return "unknown"

    async def get_last_error(self) -> Optional[str]:
        try:
            return await redis_client.get(self.last_error_key)
        except Exception as e:
            logger.warning(f"ai_status Redis error on get_last_error(): {e}")
            return None

    async def can_attempt_request(self) -> bool:
        """Checks if a request can be attempted based on the retry window."""
        try:
            retry_after = await redis_client.get(self.retry_after_key)
            if retry_after and time.time() < float(retry_after):
                return False
            return True
        except Exception as e:
            # If Redis is down, allow the request — don't block users
            logger.warning(f"ai_status Redis error on can_attempt_request() (fail-open): {e}")
            return True

    async def get_retry_remaining_seconds(self) -> int:
        """Returns the number of seconds remaining in the retry window, or 0 if none."""
        try:
            retry_after = await redis_client.get(self.retry_after_key)
            if retry_after:
                remaining = int(float(retry_after) - time.time())
                return max(0, remaining)
            return 0
        except Exception as e:
            logger.warning(f"ai_status Redis error on get_retry_remaining_seconds(): {e}")
            return 0

    async def to_dict(self) -> dict:
        """Serialize current state for the /api/health response."""
        try:
            remaining = await self.get_retry_remaining_seconds()
            status = await self.get_status()
            last_error = await self.get_last_error()
            last_success_time = await redis_client.get(self.last_success_time_key)
            return {
                "status": "ok",
                "ai_layer": status,
                "last_error": last_error,
                "last_success": (
                    time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(float(last_success_time)))
                    if last_success_time else None
                ),
                "retry_remaining_seconds": remaining,
                "quota_backoff_active": remaining > 0,
            }
        except Exception as e:
            logger.warning(f"ai_status Redis error on to_dict(): {e}")
            return {
                "status": "ok",
                "ai_layer": "unknown",
                "last_error": None,
                "last_success": None,
                "retry_remaining_seconds": 0,
                "quota_backoff_active": False,
            }

    async def report_success(self):
        """Called when a real Gemini API call succeeds."""
        try:
            async with redis_client.pipeline(transaction=True) as pipe:
                pipe.set(self.status_key, "active")
                pipe.delete(self.last_error_key)
                pipe.set(self.last_success_time_key, str(time.time()))
                pipe.delete(self.retry_after_key)
                await pipe.execute()
            logger.info("AI status → active")
        except Exception as e:
            logger.warning(f"ai_status Redis error on report_success(): {e}")

    async def report_error(self, error: Exception, retry_delay_seconds: Optional[int] = None):
        """
        Called when a real Gemini API call fails.
        """
        err_str = str(error).lower()
        now_str = str(time.time())

        try:
            async with redis_client.pipeline(transaction=True) as pipe:
                pipe.set(self.last_error_time_key, now_str)

                if "429" in err_str or "quota" in err_str or "exhausted" in err_str or "resource_exhausted" in err_str:
                    pipe.set(self.status_key, "quota_exceeded")
                    pipe.set(self.last_error_key, "Gemini free-tier quota exhausted (429 RESOURCE_EXHAUSTED)")

                    delay = retry_delay_seconds if retry_delay_seconds is not None else 86400  # Default 24h
                    retry_after_time = time.time() + delay
                    pipe.set(self.retry_after_key, str(retry_after_time))
                    logger.warning(f"AI status → quota_exceeded (backoff for {delay}s, until {time.ctime(retry_after_time)})")

                elif "401" in err_str or "403" in err_str or "invalid" in err_str or "api_key" in err_str:
                    pipe.set(self.status_key, "offline")
                    pipe.set(self.last_error_key, "Invalid or unauthorized API key (401/403)")
                    logger.error("AI status → offline (auth error)")

                else:
                    pipe.set(self.status_key, "offline")
                    pipe.set(self.last_error_key, str(error)[:200])
                    logger.error(f"AI status → offline ({str(error)[:200]})")

                await pipe.execute()
        except Exception as redis_err:
            logger.warning(f"ai_status Redis error on report_error(): {redis_err}")

    async def reset(self):
        """Manual reset (e.g., when user provides a new API key)."""
        try:
            async with redis_client.pipeline(transaction=True) as pipe:
                pipe.set(self.status_key, "unknown")
                pipe.delete(self.last_error_key)
                pipe.delete(self.retry_after_key)
                await pipe.execute()
            logger.info("AI status → reset to unknown")
        except Exception as e:
            logger.warning(f"ai_status Redis error on reset(): {e}")


# ── Singleton Instance ──
ai_status = AIStatusManager()
