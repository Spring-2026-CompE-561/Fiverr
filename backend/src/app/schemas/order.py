from pydantic import BaseModel
from typing import Literal
from datetime import datetime


class OrderBase(BaseModel):
    gig_id: str
    message: str

class OrderCreate(OrderBase):
    pass

class OrderUpdate(BaseModel):
    status: Literal["pending", "accepted", "rejected", "completed"]

class OrderPublic(BaseModel):
    id: str
    gig_id: str
    buyer_id: str
    message: str
    status: Literal["pending", "accepted", "rejected", "completed"]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
