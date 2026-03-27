"""SQLAlchemy user model for authentication and profile data."""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from typing import List

from sqlalchemy import DateTime, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.app.core.database import Base


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

    # ---------------------------
    # RELATIONSHIPS
    # ---------------------------

    gigs: Mapped[List["Gig"]] = relationship(
        "Gig",
        back_populates="seller",
        cascade="all, delete-orphan",
    )