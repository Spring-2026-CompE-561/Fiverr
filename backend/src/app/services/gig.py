"""Business logic for gig endpoints."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_seller
from app.models.user import User
from app.repository import gig as gig_repo
from app.schemas.gig import GigCreate, GigUpdate


def list_gigs_service(
    db: Session,
    search: str | None = None,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
):
    return gig_repo.get_all_gigs(
        db,
        search=search,
        category=category,
        min_price=min_price,
        max_price=max_price,
    )


def get_gig_service(db: Session, gig_id: str):
    gig = gig_repo.get_gig_by_id(db, gig_id)
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found",
        )
    return gig


def create_gig_service(db: Session, payload: GigCreate, current_user: User):
    require_seller(current_user)
    return gig_repo.create_gig(db, seller_id=current_user.id, gig_data=payload)


def update_gig_service(db: Session, gig_id: str, payload: GigUpdate, current_user: User):
    require_seller(current_user)

    gig = gig_repo.get_gig_by_id(db, gig_id)
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found",
        )

    if gig.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own gigs",
        )

    return gig_repo.update_gig(db, gig, payload)


def delete_gig_service(db: Session, gig_id: str, current_user: User) -> None:
    require_seller(current_user)

    gig = gig_repo.get_gig_by_id(db, gig_id)
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found",
        )

    if gig.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own gigs",
        )

    gig_repo.delete_gig(db, gig)
