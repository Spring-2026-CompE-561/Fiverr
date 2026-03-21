from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.review import (
    ReviewCreate,
    ReviewPublic,
    SuccessReviewResponse,
    SuccessResponse,
)
from app.services.review import (
    create_review_service,
    list_gig_reviews_service,
    delete_review_service,
)

router = APIRouter(tags=["Reviews"])


@router.post(
    "/reviews",
    response_model=SuccessReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    review = create_review_service(
        db,
        current_user=current_user,
        gig_id=payload.gigId,
        rating=payload.rating,
        comment=payload.comment,
    )
    return {"success": True, "review": review}


@router.get("/gigs/{id}/reviews", response_model=List[ReviewPublic])
def get_gig_reviews(
    id: str,
    db: Session = Depends(get_db),
):
    return list_gig_reviews_service(db, gig_id=id)


@router.delete("/reviews/{id}", response_model=SuccessResponse)
def delete_review(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_review_service(db, review_id=id, current_user=current_user)
    return {"success": True, "message": "Review deleted"}