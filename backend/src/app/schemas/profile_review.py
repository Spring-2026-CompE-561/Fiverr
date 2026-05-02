from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProfileReviewCreate(BaseModel):
    seller_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ProfileReviewPublic(BaseModel):
    id: str
    seller_id: str
    buyer_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SuccessProfileReviewResponse(BaseModel):
    success: bool = True
    review: ProfileReviewPublic