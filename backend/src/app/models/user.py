"""SQLAlchemy user model for authentication and profile data."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import Boolean, DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class UserRole(str, enum.Enum):
    """Allowed user roles in the system."""

    BUYER = "buyer"
    SELLER = "seller"


class User(Base):
    """Database model for application users."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)

    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
    )

    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole),
        nullable=False,
    )

    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    email_verification_token: Mapped[str | None] = mapped_column(
        String(128),
        nullable=True,
        index=True,
    )

    email_verification_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    gigs: Mapped[List["Gig"]] = relationship(
        "Gig",
        back_populates="seller",
        cascade="all, delete-orphan",
    )

    orders: Mapped[List["Order"]] = relationship(
        "Order",
        back_populates="buyer",
    )
    reviews: Mapped[List["Review"]] = relationship(
        "Review",
        back_populates="buyer",
    )
