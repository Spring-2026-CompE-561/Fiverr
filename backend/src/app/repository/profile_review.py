from typing import Optional

from sqlalchemy.orm import Session

from app.models.profile_review import ProfileReview


def create_profile_review(
    db: Session,
    *,
    seller_id: str,
    buyer_id: str,
    rating: int,
    comment: Optional[str] = None,
) -> ProfileReview:
    review = ProfileReview(
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=rating,
        comment=comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_profile_review_by_id(db: Session, review_id: str) -> Optional[ProfileReview]:
    return db.query(ProfileReview).filter(ProfileReview.id == review_id).first()


def get_profile_review_by_seller_and_buyer(db: Session, seller_id: str, buyer_id: str) -> Optional[ProfileReview]:
    return (
        db.query(ProfileReview)
        .filter(ProfileReview.seller_id == seller_id, ProfileReview.buyer_id == buyer_id)
        .first()
    )


def get_profile_reviews_for_seller(db: Session, seller_id: str) -> list[ProfileReview]:
    return (
        db.query(ProfileReview)
        .filter(ProfileReview.seller_id == seller_id)
        .order_by(ProfileReview.created_at.desc())
        .all()
    )


def delete_profile_review(db: Session, review: ProfileReview) -> None:
    db.delete(review)
    db.commit()