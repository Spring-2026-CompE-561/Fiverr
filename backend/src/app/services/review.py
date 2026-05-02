from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.gig import Gig
from app.models.order import Order
from app.models.user import User
import app.repository.review as review_repo


def _get_order_status_column():
    order_status_col = getattr(Order, "order_status", None)
    if order_status_col is None:
        order_status_col = getattr(Order, "status", None)
    return order_status_col


def create_review_service(
    db: Session,
    current_user: User,
    gig_id: str,
    rating: int,
    comment: str | None,
):
    if current_user.role != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create reviews",
        )

    gig = db.query(Gig).filter(Gig.id == gig_id).first()
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found",
        )

    existing_review = review_repo.get_review_by_gig_and_buyer(db, gig_id, current_user.id)
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this gig",
        )

    order_status_col = _get_order_status_column()
    if order_status_col is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Order model is missing a status field",
        )

    completed_order = (
        db.query(Order)
        .filter(
            Order.gig_id == gig_id,
            Order.buyer_id == current_user.id,
            order_status_col == "completed",
        )
        .first()
    )

    if not completed_order:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review a gig after a completed order",
        )

    return review_repo.create_review(
        db,
        gig_id=gig_id,
        buyer_id=current_user.id,
        rating=rating,
        comment=comment,
    )


def list_gig_reviews_service(db: Session, gig_id: str):
    gig = db.query(Gig).filter(Gig.id == gig_id).first()
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found",
        )

    return review_repo.get_reviews_for_gig(db, gig_id)


def delete_review_service(db: Session, review_id: str, current_user: User):
    review = review_repo.get_review_by_id(db, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    if review.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this review",
        )

    review_repo.delete_review(db, review)