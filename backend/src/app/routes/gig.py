"""Gig routes for browse and seller CRUD operations."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.dependencies import require_verified_email
from app.core.database import get_db
from app.models.user import User
from app.schemas.gig import (
    GigCreate,
    GigPublic,
    GigUpdate,
    SuccessGigResponse,
    SuccessResponse,
)
from app.services.gig import (
    create_gig_service,
    delete_gig_service,
    get_gig_service,
    list_gigs_service,
    update_gig_service,
)

router = APIRouter(prefix="/gigs", tags=["Gigs"])


@router.get("", response_model=List[GigPublic], status_code=status.HTTP_200_OK, summary="List gigs")
def list_gigs(
    search: str | None = None,
    category: str | None = None,
    minPrice: float | None = None,
    maxPrice: float | None = None,
    sellerId: str | None = None,
    sort: str | None = None,
    db: Session = Depends(get_db),
):
    return list_gigs_service(
        db,
        search=search,
        category=category,
        min_price=minPrice,
        max_price=maxPrice,
        seller_id=sellerId,
        sort=sort,
    )


@router.get("/{id}", response_model=GigPublic, status_code=status.HTTP_200_OK, summary="Get gig by ID")
def get_gig(
    id: str,
    db: Session = Depends(get_db),
):
    return get_gig_service(db, gig_id=id)


@router.post("", response_model=SuccessGigResponse, status_code=status.HTTP_201_CREATED, summary="Create gig")
def create_gig(
    payload: GigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_verified_email),
):
    gig = create_gig_service(db, payload=payload, current_user=current_user)
    return {"success": True, "gig": gig}


@router.put("/{id}", response_model=SuccessGigResponse, status_code=status.HTTP_200_OK, summary="Update gig")
def update_gig(
    id: str,
    payload: GigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_verified_email),
):
    gig = update_gig_service(db, gig_id=id, payload=payload, current_user=current_user)
    return {"success": True, "gig": gig}


@router.delete("/{id}", response_model=SuccessResponse, status_code=status.HTTP_200_OK, summary="Delete gig")
def delete_gig(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_verified_email),
):
    delete_gig_service(db, gig_id=id, current_user=current_user)
    return {"success": True, "message": "Gig deleted successfully"}