"""
Unit Tests for Email Service Async Functions

Validates that all async email functions properly await their coroutines
and return the expected types. This prevents silent failures where
unawaited coroutines are discarded without executing.

Bug Reference: Missing await in email wrapper functions caused all emails
to silently fail - verification, password reset, and welcome emails never sent.
"""

import pytest
import asyncio
import inspect
from unittest.mock import patch, AsyncMock
import sys
import os

# Add project paths for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from utils.email import (
    send_email,
    send_verification_email,
    send_password_reset_email,
    send_welcome_email,
)


# ============================================================================
# ASYNC VALIDATION TESTS
# ============================================================================

class TestEmailAsyncBehavior:
    """
    Tests that validate async functions are properly awaited.

    These tests catch the specific bug where wrapper functions call
    async functions without await, returning coroutine objects instead
    of actual results.
    """

    @pytest.mark.asyncio
    async def test_send_email_returns_bool_not_coroutine(self):
        """send_email should return bool, not coroutine"""
        result = await send_email(
            to="test@example.com",
            subject="Test",
            html="<p>Test</p>"
        )
        assert isinstance(result, bool), \
            f"send_email returned {type(result).__name__}, expected bool"

    @pytest.mark.asyncio
    async def test_send_verification_email_returns_bool_not_coroutine(self):
        """send_verification_email should return bool, not coroutine"""
        result = await send_verification_email(
            email="test@example.com",
            name="Test User",
            verification_token="test-token-123"
        )
        assert isinstance(result, bool), \
            f"send_verification_email returned {type(result).__name__}, expected bool"
        # Explicitly check it's not a coroutine (the bug we're preventing)
        assert not asyncio.iscoroutine(result), \
            "send_verification_email returned unawaited coroutine - missing await!"

    @pytest.mark.asyncio
    async def test_send_password_reset_email_returns_bool_not_coroutine(self):
        """send_password_reset_email should return bool, not coroutine"""
        result = await send_password_reset_email(
            email="test@example.com",
            name="Test User",
            reset_token="reset-token-456"
        )
        assert isinstance(result, bool), \
            f"send_password_reset_email returned {type(result).__name__}, expected bool"
        assert not asyncio.iscoroutine(result), \
            "send_password_reset_email returned unawaited coroutine - missing await!"

    @pytest.mark.asyncio
    async def test_send_welcome_email_returns_bool_not_coroutine(self):
        """send_welcome_email should return bool, not coroutine"""
        result = await send_welcome_email(
            email="test@example.com",
            name="Test User"
        )
        assert isinstance(result, bool), \
            f"send_welcome_email returned {type(result).__name__}, expected bool"
        assert not asyncio.iscoroutine(result), \
            "send_welcome_email returned unawaited coroutine - missing await!"


class TestEmailFunctionSignatures:
    """
    Static validation of email function signatures.

    These tests run without executing the functions, catching issues
    at import time rather than runtime.
    """

    def test_all_email_functions_are_async(self):
        """All email functions should be async"""
        functions = [
            send_email,
            send_verification_email,
            send_password_reset_email,
            send_welcome_email,
        ]
        for func in functions:
            assert asyncio.iscoroutinefunction(func), \
                f"{func.__name__} should be an async function"

    def test_email_functions_have_correct_return_annotation(self):
        """Email functions should be annotated to return bool"""
        functions = [
            send_email,
            send_verification_email,
            send_password_reset_email,
            send_welcome_email,
        ]
        for func in functions:
            hints = func.__annotations__
            if 'return' in hints:
                assert hints['return'] == bool, \
                    f"{func.__name__} should return bool, annotated as {hints['return']}"


class TestEmailWithMockedSend:
    """
    Tests with mocked send_email to verify wrapper functions properly await.
    """

    @pytest.mark.asyncio
    async def test_verification_email_awaits_send_email(self):
        """Verify send_verification_email actually awaits send_email"""
        mock_send = AsyncMock(return_value=True)

        with patch('utils.email.send_email', mock_send):
            result = await send_verification_email(
                email="test@example.com",
                name="Test User",
                verification_token="token123"
            )

        # If await was missing, mock wouldn't be called properly
        mock_send.assert_called_once()
        assert result is True

    @pytest.mark.asyncio
    async def test_password_reset_email_awaits_send_email(self):
        """Verify send_password_reset_email actually awaits send_email"""
        mock_send = AsyncMock(return_value=True)

        with patch('utils.email.send_email', mock_send):
            result = await send_password_reset_email(
                email="test@example.com",
                name="Test User",
                reset_token="reset123"
            )

        mock_send.assert_called_once()
        assert result is True

    @pytest.mark.asyncio
    async def test_welcome_email_awaits_send_email(self):
        """Verify send_welcome_email actually awaits send_email"""
        mock_send = AsyncMock(return_value=True)

        with patch('utils.email.send_email', mock_send):
            result = await send_welcome_email(
                email="test@example.com",
                name="Test User"
            )

        mock_send.assert_called_once()
        assert result is True

    @pytest.mark.asyncio
    async def test_email_failure_propagates(self):
        """Verify that send_email returning False propagates correctly"""
        mock_send = AsyncMock(return_value=False)

        with patch('utils.email.send_email', mock_send):
            result = await send_verification_email(
                email="test@example.com",
                name="Test User",
                verification_token="token123"
            )

        assert result is False, \
            "Email failure should propagate - if True returned, await may be missing"


# ============================================================================
# STATIC ANALYSIS HELPER (Can be run without pytest-asyncio)
# ============================================================================

def validate_email_module_sync():
    """
    Synchronous validation that can be run at import time or in CI.
    Returns list of issues found.
    """
    issues = []

    functions = [
        ('send_email', send_email),
        ('send_verification_email', send_verification_email),
        ('send_password_reset_email', send_password_reset_email),
        ('send_welcome_email', send_welcome_email),
    ]

    for name, func in functions:
        if not asyncio.iscoroutinefunction(func):
            issues.append(f"{name} is not an async function")

    return issues


if __name__ == "__main__":
    # Run basic validation without pytest
    print("Running email module validation...")
    issues = validate_email_module_sync()

    if issues:
        print("FAILED - Issues found:")
        for issue in issues:
            print(f"  - {issue}")
        sys.exit(1)
    else:
        print("PASSED - All email functions are properly defined as async")
        print("\nRun 'pytest backend/tests/test_email_async.py -v' for full async validation")
        sys.exit(0)
