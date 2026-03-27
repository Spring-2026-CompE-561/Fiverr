from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator


class GigCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    price: float = Field(..., ge=0)
    category: str = Field(..., min_length=1)
    tags: List[str] = []


class GigUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, ge=0)
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


class GigPublic(BaseModel):
    id: str
    seller_id: str
    title: str
    description: str
    price: float
    category: str
    tags: List[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @field_validator("tags", mode="before")
    @classmethod
    def normalize_tags(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [tag.strip() for tag in value.split(",") if tag.strip()]
        return value


class SuccessGigResponse(BaseModel):
    success: bool = True
    gig: GigPublic


class SuccessResponse(BaseModel):
    success: bool = True
    message: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict | None = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail