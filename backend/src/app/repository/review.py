from typing import Optional

from sqlalchemy.orm import Session

from app.models.review import Review


def create_review(
    db: Session,
    *,
    gig_id: str,
    buyer_id: str,
    rating: int,
    comment: Optional[str] = None,
) -> Review:
    review = Review(
        gig_id=gig_id,
        buyer_id=buyer_id,
        rating=rating,
        comment=comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def get_review_by_id(db: Session, review_id: str) -> Optional[Review]:
    return db.query(Review).filter(Review.id == review_id).first()


def get_reviews_for_gig(db: Session, gig_id: str) -> list[Review]:
    return (
        db.query(Review)
        .filter(Review.gig_id == gig_id)
        .order_by(Review.created_at.desc())
        .all()
    )


def get_review_by_gig_and_buyer(db: Session, gig_id: str, buyer_id: str) -> Optional[Review]:
    return (
        db.query(Review)
        .filter(Review.gig_id == gig_id, Review.buyer_id == buyer_id)
        .first()
    )


def delete_review(db: Session, review: Review) -> None:
    db.delete(review)
    db.commit()