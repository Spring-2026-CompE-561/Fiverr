from sqlalchemy.orm import Session
from repository.order import (
    create_order,
    get_order_by_id,
    get_orders_by_buyer,
    update_order_status,
    delete_order,
)
from models.gig import Gig


def create_order_service(db: Session, current_user, order_data):
    if current_user.role != "buyer":
        raise Exception("Only buyers can create orders")

    gig = db.query(Gig).filter(Gig.id == order_data.gig_id).first()
    if not gig:
        raise Exception("Gig not found")

    return create_order(
        db=db,
        gig_id=order_data.gig_id,
        buyer_id=current_user.id,
        message=order_data.message
    )


def list_orders_service(db: Session, current_user):
    if current_user.role == "buyer":
        return get_orders_by_buyer(db, current_user.id)
    return []


def get_order_service(db: Session, order_id: int, current_user):
    order = get_order_by_id(db, order_id)
    if not order:
        raise Exception("Order not found")

    return order


def update_order_service(db: Session, order_id: int, status: str, current_user):
    order = get_order_by_id(db, order_id)
    if not order:
        raise Exception("Order not found")
    return update_order_status(db, order, status)


def cancel_order_service(db: Session, order_id: int, current_user):
    order = get_order_by_id(db, order_id)
    if not order:
        raise Exception("Order not found")

    if order.buyer_id != current_user.id:
        raise Exception("Not allowed")

    if order.status != "pending":
        raise Exception("Only pending orders can be cancelled")

    delete_order(db, order)
    return {"message": "Order cancelled"}
