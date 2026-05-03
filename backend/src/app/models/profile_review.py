from datetime import datetime
from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class ProfileReview(Base):
    __tablename__ = "profile_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()), index=True)
    seller_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("seller_id", "buyer_id", name="uq_profile_reviews_seller_buyer"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_profile_reviews_rating_range"),
    )

    seller = relationship("User", foreign_keys=[seller_id])
    buyer = relationship("User", foreign_keys=[buyer_id])