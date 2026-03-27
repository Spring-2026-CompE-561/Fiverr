"""Gig routes for browse and seller CRUD operations."""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.app.core.auth import get_current_user
from src.app.core.database import get_db
from src.app.models.user import User
from src.app.schemas.gig import (
    GigCreate,
    GigPublic,
    GigUpdate,
    SuccessGigResponse,
    SuccessResponse,
)
from src.app.services.gig import (
    create_gig_service,
    delete_gig_service,
    get_gig_service,
    list_gigs_service,
    update_gig_service,
)

router = APIRouter(tags=["Gigs"])


@router.get("/gigs", response_model=List[GigPublic], status_code=status.HTTP_200_OK)
def list_gigs(
    search: str | None = None,
    category: str | None = None,
    minPrice: float | None = None,
    maxPrice: float | None = None,
    db: Session = Depends(get_db),
):
    return list_gigs_service(
        db,
        search=search,
        category=category,
        min_price=minPrice,
        max_price=maxPrice,
    )


@router.get("/gigs/{id}", response_model=GigPublic, status_code=status.HTTP_200_OK)
def get_gig(
    id: str,
    db: Session = Depends(get_db),
):
    return get_gig_service(db, gig_id=id)


@router.post("/gigs", response_model=SuccessGigResponse, status_code=status.HTTP_201_CREATED)
def create_gig(
    payload: GigCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    gig = create_gig_service(db, payload=payload, current_user=current_user)
    return {"success": True, "gig": gig}


@router.put("/gigs/{id}", response_model=SuccessGigResponse, status_code=status.HTTP_200_OK)
def update_gig(
    id: str,
    payload: GigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    gig = update_gig_service(db, gig_id=id, payload=payload, current_user=current_user)
    return {"success": True, "gig": gig}


@router.delete("/gigs/{id}", response_model=SuccessResponse, status_code=status.HTTP_200_OK)
def delete_gig(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_gig_service(db, gig_id=id, current_user=current_user)
    return {"success": True, "message": "Gig deleted successfully"}
