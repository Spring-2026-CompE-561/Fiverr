"""Pydantic schemas related to JWT tokens."""

from __future__ import annotations

from pydantic import BaseModel


class Token(BaseModel):
    """Simple token response model."""

    token: str


class TokenData(BaseModel):
    """Decoded token payload data."""

    sub: str
    role: str