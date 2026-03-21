"""Reusable authorization dependencies and helpers."""

from __future__ import annotations

from fastapi import HTTPException, status

from app.models.user import User, UserRole


def require_same_user(path_user_id: str, current_user: User) -> None:
    """Ensure a user may only modify their own account."""
    if current_user.id != path_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own account",
        )


def require_buyer(current_user: User) -> None:
    """Ensure the current user is a buyer."""
    if current_user.role != UserRole.BUYER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Buyer role required",
        )


def require_seller(current_user: User) -> None:
    """Ensure the current user is a seller."""
    if current_user.role != UserRole.SELLER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller role required",
        )