"""User profile routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.app.core.auth import get_current_user
from src.app.core.database import get_db
from src.app.core.dependencies import require_same_user
from src.app.models.user import User
from src.app.repository.user import delete_user, get_user_by_email, get_user_by_id, update_user
from src.app.schemas.user import MessageResponse, UserPublic, UserUpdate, UserUpdateResponse

router = APIRouter()


@router.get("/{id}", response_model=UserPublic, status_code=status.HTTP_200_OK)
def get_user_profile(id: str, db: Session = Depends(get_db)) -> UserPublic:
    """Return a user's public profile by ID."""
    db_user = get_user_by_id(db, id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return db_user


@router.put("/{id}", response_model=UserUpdateResponse, status_code=status.HTTP_200_OK)
def update_user_profile(
    id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserUpdateResponse:
    """Update the authenticated user's own profile."""
    require_same_user(id, current_user)

    db_user = get_user_by_id(db, id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user_update.email and user_update.email != db_user.email:
        existing_user = get_user_by_email(db, user_update.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already in use",
            )

    updated_user = update_user(db, db_user, user_update)
    return UserUpdateResponse(success=True, user=updated_user)


@router.delete("/{id}", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def delete_user_account(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    """Delete the authenticated user's own account."""
    require_same_user(id, current_user)

    db_user = get_user_by_id(db, id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    delete_user(db, db_user)
    return MessageResponse(success=True, message="User account deleted successfully")