"""
AI Status Manager — Event-Driven Health Tracking

This module tracks the AI layer's health status WITHOUT making any
external API calls. Status is updated passively based on real user
requests. The /api/health endpoint reads from this module.
"""

import time
import logging
from typing import Optional

logger = logging.getLogger("ai_status")

class AIStatusManager:
    """In-memory, event-driven AI status tracker with smart quota backoff."""

    def __init__(self):
        self._status: str = "unknown"
        self._last_error: Optional[str] = None
        self._last_success_time: Optional[float] = None
        self._last_error_time: Optional[float] = None
        self.retry_after: Optional[float] = None  # timestamp until which we skip retries

    @property
    def status(self) -> str:
        return self._status

    @property
    def last_error(self) -> Optional[str]:
        return self._last_error

    def can_attempt_request(self) -> bool:
        """Checks if a request can be attempted based on the retry window."""
        if self.retry_after and time.time() < self.retry_after:
            return False
        return True

    def get_retry_remaining_seconds(self) -> int:
        """Returns the number of seconds remaining in the retry window, or 0 if none."""
        if self.retry_after:
            remaining = int(self.retry_after - time.time())
            return max(0, remaining)
        return 0

    def to_dict(self) -> dict:
        """Serialize current state for the /api/health response."""
        remaining = self.get_retry_remaining_seconds()
        return {
            "status": "ok",
            "ai_layer": self._status,
            "last_error": self._last_error,
            "last_success": (
                time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(self._last_success_time))
                if self._last_success_time else None
            ),
            "retry_remaining_seconds": remaining,
            "quota_backoff_active": remaining > 0,
        }

    def report_success(self):
        """Called when a real Gemini API call succeeds."""
        self._status = "active"
        self._last_error = None
        self._last_success_time = time.time()
        self.retry_after = None  # clear any backoff window
        logger.info("AI status → active")

    def report_error(self, error: Exception, retry_delay_seconds: Optional[int] = None):
        """
        Called when a real Gemini API call fails.
        """
        err_str = str(error).lower()
        self._last_error_time = time.time()

        if "429" in err_str or "quota" in err_str or "exhausted" in err_str or "resource_exhausted" in err_str:
            self._status = "quota_exceeded"
            self._last_error = "Gemini free-tier quota exhausted (429 RESOURCE_EXHAUSTED)"
            
            # Set retry_after window
            delay = retry_delay_seconds if retry_delay_seconds is not None else 86400  # Default 24h
            self.retry_after = time.time() + delay
            logger.warning(f"AI status → quota_exceeded (backoff for {delay}s, until {time.ctime(self.retry_after)})")

        elif "401" in err_str or "403" in err_str or "invalid" in err_str or "api_key" in err_str:
            self._status = "offline"
            self._last_error = "Invalid or unauthorized API key (401/403)"
            logger.error("AI status → offline (auth error)")

        else:
            self._status = "offline"
            self._last_error = str(error)[:200]
            logger.error(f"AI status → offline ({self._last_error})")

    def reset(self):
        """Manual reset (e.g., when user provides a new API key)."""
        self._status = "unknown"
        self._last_error = None
        self.retry_after = None
        logger.info("AI status → reset to unknown")


# ── Singleton Instance ──
ai_status = AIStatusManager()
