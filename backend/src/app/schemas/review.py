from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    gigId: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewPublic(BaseModel):
    id: str
    gig_id: str
    buyer_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


class SuccessReviewResponse(BaseModel):
    success: bool = True
    review: ReviewPublic


class SuccessResponse(BaseModel):
    success: bool = True
    message: str