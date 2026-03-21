from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.app.core.dependencies import require_buyer, require_seller
from src.app.models.gig import Gig
from src.app.models.order import Order
from src.app.models.user import User, UserRole
from src.app.repository.order import (
    create_order,
    delete_order,
    get_order_by_id,
    get_orders_by_buyer,
    get_orders_by_seller,
    update_order_status,
)
from src.app.schemas.order import OrderCreate


def create_order_service(
    db: Session,
    current_user: User,
    order_data: OrderCreate,
) -> Order:
    """Create a new order for a gig. Buyers only."""
    require_buyer(current_user)

    gig = db.query(Gig).filter(Gig.id == order_data.gig_id).first()
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found",
        )

    return create_order(
        db=db,
        gig_id=order_data.gig_id,
        buyer_id=current_user.id,
        message=order_data.message,
    )


def list_orders_service(
    db: Session,
    current_user: User,
    status_filter: str | None = None,
) -> list[Order]:
    """List orders for the logged-in user."""
    if current_user.role == UserRole.BUYER:
        return get_orders_by_buyer(db, current_user.id, status_filter)

    if current_user.role == UserRole.SELLER:
        return get_orders_by_seller(db, current_user.id, status_filter)

    return []


def get_order_service(
    db: Session,
    order_id: str,
    current_user: User,
) -> Order:
    """Get one order if the current user is allowed to view it."""
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    is_buyer_owner = order.buyer_id == current_user.id
    is_seller_owner = order.gig.seller_id == current_user.id

    if not is_buyer_owner and not is_seller_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view this order",
        )

    return order


def update_order_service(
    db: Session,
    order_id: str,
    new_status: str,
    current_user: User,
) -> Order:
    """Update order status. Seller only, and only for their own gig."""
    require_seller(current_user)

    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.gig.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update orders for your own gigs",
        )

    allowed_statuses = {"accepted", "rejected", "completed"}
    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order status",
        )

    return update_order_status(db, order, new_status)


def cancel_order_service(
    db: Session,
    order_id: str,
    current_user: User,
) -> dict[str, str]:
    """Cancel an order. Buyer only, and only their own pending order."""
    require_buyer(current_user)

    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own orders",
        )

    if order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only pending orders can be cancelled",
        )

    delete_order(db, order)
    return {"message": "Order cancelled successfully"}
