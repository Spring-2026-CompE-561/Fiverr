"""Authentication routes for registering and logging in users."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, hash_password, verify_password
from app.core.database import get_db
from app.repository.user import create_user, get_user_by_email
from app.schemas.user import AuthResponse, UserLogin, UserRegister

router = APIRouter(prefix="/auth", tags=["Auth"])


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
    db_user = create_user(
        db,
        user_data,
        password_hash,
        email_verified=True,
        verification_token=None,
        verification_expires_at=None,
    )
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