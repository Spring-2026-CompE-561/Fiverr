import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    gig_id = Column(String, ForeignKey("gigs.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)

    message = Column(Text, nullable=False)

    status = Column(String, default="pending")
    valid_statuses = ["pending", "accepted", "rejected", "completed"]

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


    # Relationships
    gig = relationship("Gig", back_populates="orders")
    buyer = relationship("User", back_populates="orders")
