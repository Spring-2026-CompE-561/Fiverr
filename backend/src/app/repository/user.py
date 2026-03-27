"""Database access functions for users."""

from __future__ import annotations

from sqlalchemy.orm import Session

from src.app.models.user import User
from src.app.schemas.user import UserRegister, UserUpdate


def get_user_by_email(db: Session, email: str) -> User | None:
    """Return a user by email, or None if not found."""
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: str) -> User | None:
    """Return a user by ID, or None if not found."""
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserRegister, password_hash: str) -> User:
    """Create and persist a new user."""
    db_user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=password_hash,
        role=user_data.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, db_user: User, update_data: UserUpdate) -> User:
    """Apply partial updates to a user and persist changes."""
    update_dict = update_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, db_user: User) -> None:
    """Delete a user from the database."""
    db.delete(db_user)
    db.commit()