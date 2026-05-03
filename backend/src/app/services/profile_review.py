from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.user import User
import app.repository.profile_review as profile_review_repo


def _get_order_status_column():
    order_status_col = getattr(Order, "order_status", None)
    if order_status_col is None:
        order_status_col = getattr(Order, "status", None)
    return order_status_col


def create_profile_review_service(
    db: Session,
    current_user: User,
    seller_id: str,
    rating: int,
    comment: str | None,
):
    if current_user.role != "buyer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyers can create profile reviews",
        )

    if current_user.id == seller_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot review yourself",
        )

    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found",
        )

    existing_review = profile_review_repo.get_profile_review_by_seller_and_buyer(
        db, seller_id, current_user.id
    )
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this seller",
        )

    order_status_col = _get_order_status_column()
    if order_status_col is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Order model is missing a status field",
        )

    completed_order_query = db.query(Order).filter(
        Order.buyer_id == current_user.id,
        order_status_col == "completed",
    )

    seller_filter_col = getattr(Order, "seller_id", None)
    if seller_filter_col is not None:
        completed_order_query = completed_order_query.filter(
            seller_filter_col == seller_id
        )

    completed_order = completed_order_query.first()

    if not completed_order:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review a seller after a completed order",
        )

    return profile_review_repo.create_profile_review(
        db,
        seller_id=seller_id,
        buyer_id=current_user.id,
        rating=rating,
        comment=comment,
    )


def list_profile_reviews_service(db: Session, seller_id: str):
    seller = db.query(User).filter(User.id == seller_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found",
        )

    return profile_review_repo.get_profile_reviews_for_seller(db, seller_id)


def delete_profile_review_service(db: Session, review_id: str, current_user: User):
    review = profile_review_repo.get_profile_review_by_id(db, review_id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile review not found",
        )

    if review.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this profile review",
        )

    profile_review_repo.delete_profile_review(db, review)