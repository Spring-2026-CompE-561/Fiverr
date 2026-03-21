from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    gig_id = Column(String, ForeignKey("gigs.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)

    message = Column(Text, nullable=False)

    status = Column(String, default="pending")
    valid_statuses = ["pending", "accepted", "rejected", "completed"]

    created_at = Column(DateTime, default=datetime.timezone.utc)
    updated_at = Column(DateTime, default=datetime.timezone.utc, onupdate=datetime.timezone.utc)

    # Relationships
    gig = relationship("Gig", back_populates="orders")
    buyer = relationship("User", back_populates="orders")
