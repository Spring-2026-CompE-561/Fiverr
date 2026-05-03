from __future__ import annotations

from datetime import datetime
from typing import Literal, cast

from pydantic import BaseModel, ConfigDict

from app.models.order import Order as OrderORM

OrderStatusLiteral = Literal["pending", "accepted", "rejected", "completed"]


def _coerce_order_status(value: str) -> OrderStatusLiteral:
    if value in ("pending", "accepted", "rejected", "completed"):
        return cast(OrderStatusLiteral, value)
    return "pending"


class OrderBase(BaseModel):
    gig_id: str
    message: str


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Literal["pending", "accepted", "rejected", "completed"]


class OrderPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    gig_id: str
    buyer_id: str
    buyer_name: str
    gig_title: str
    message: str
    status: OrderStatusLiteral
    created_at: datetime
    updated_at: datetime


def order_to_public(order: OrderORM) -> OrderPublic:
    buyer_name = order.buyer.name if order.buyer is not None else "Unknown buyer"
    gig_title = order.gig.title if order.gig is not None else "Unknown gig"
    return OrderPublic(
        id=order.id,
        gig_id=order.gig_id,
        buyer_id=order.buyer_id,
        buyer_name=buyer_name,
        gig_title=gig_title,
        message=order.message,
        status=_coerce_order_status(order.status),
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
