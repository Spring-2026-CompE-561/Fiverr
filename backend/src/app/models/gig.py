from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from src.app.core.database import Base


class Gig(Base):
    __tablename__ = "gigs"

    id = Column(String, primary_key=True, index=True)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)

    # store tags as comma-separated string for simplicity
    tags = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    seller = relationship("User", back_populates="gigs")