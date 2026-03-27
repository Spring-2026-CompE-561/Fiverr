from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import relationship

from src.app.core.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), index=True)
    gig_id = Column(String(36), ForeignKey("gigs.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("gig_id", "buyer_id", name="uq_reviews_gig_buyer"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
    )

    gig = relationship("Gig", back_populates="reviews")
    buyer = relationship("User", back_populates="reviews")