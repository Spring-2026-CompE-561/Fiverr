"""Authentication routes for registering and logging in users."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, hash_password, verify_password
from app.core.database import get_db
from app.core.settings import settings
from app.repository.user import (
    create_user,
    get_user_by_email,
    get_user_by_verification_token,
)
from app.schemas.user import AuthResponse, UserLogin, UserRegister
from app.services.email_delivery import generate_verification_token, send_verification_email

router = APIRouter(prefix="/auth", tags=["Auth"])


class VerifyEmailRequest(BaseModel):
    token: str


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, summary="Register a new user")
def register(user_data: UserRegister, db: Session = Depends(get_db)) -> AuthResponse:
    """Register a new buyer or seller and return a JWT."""
    existing_user = get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    password_hash = hash_password(user_data.password)

    if settings.email_verification_enabled:
        verification_token, verification_expires_at = generate_verification_token()
        email_verified = False
    else:
        verification_token = None
        verification_expires_at = None
        email_verified = True

    db_user = create_user(
        db,
        user_data,
        password_hash,
        email_verified=email_verified,
        verification_token=verification_token,
        verification_expires_at=verification_expires_at,
    )

    if settings.email_verification_enabled and verification_token:
        send_verification_email(db_user.email, verification_token)

    token = create_access_token(db_user.id, db_user.role.value)

    return AuthResponse(
        success=True,
        token=token,
        user=db_user,
    )


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK, summary="Log in a user")
def login(user_data: UserLogin, db: Session = Depends(get_db)) -> AuthResponse:
    """Authenticate a user and return a JWT."""
    db_user = get_user_by_email(db, user_data.email)
    if not db_user or not verify_password(user_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(db_user.id, db_user.role.value)

    return AuthResponse(
        success=True,
        token=token,
        user=db_user,
    )


@router.post("/verify-email", status_code=status.HTTP_200_OK, summary="Verify a user's email address")
def verify_email(body: VerifyEmailRequest, db: Session = Depends(get_db)) -> dict:
    """Mark a user's email as verified using the token sent during registration."""
    db_user = get_user_by_verification_token(db, body.token)

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    if db_user.email_verified:
        return {"success": True, "message": "Email already verified"}

    if db_user.email_verification_expires_at and db_user.email_verification_expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired",
        )

    db_user.email_verified = True
    db_user.email_verification_token = None
    db_user.email_verification_expires_at = None
    db.commit()

    return {"success": True, "message": "Email verified successfully"}
