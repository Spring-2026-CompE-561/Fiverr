"""Pydantic schemas for user requests and responses."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from src.app.models.user import UserRole


class UserRegister(BaseModel):
    """Request body for user registration."""

    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=255)
    role: UserRole


class UserLogin(BaseModel):
    """Request body for user login."""

    email: EmailStr
    password: str = Field(..., min_length=1, max_length=255)


class UserUpdate(BaseModel):
    """Request body for updating a user's profile."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    bio: str | None = Field(default=None, max_length=2000)


class UserPublic(BaseModel):
    """Public-safe user response model."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: UserRole
    bio: str | None = None
    created_at: datetime
    updated_at: datetime


class AuthResponse(BaseModel):
    """Successful auth response returned on register/login."""

    success: bool = True
    token: str
    user: UserPublic


class UserUpdateResponse(BaseModel):
    """Successful user update response."""

    success: bool = True
    user: UserPublic


class MessageResponse(BaseModel):
    """Generic success response with a message."""

    success: bool = True
    message: str