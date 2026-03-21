from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.gig import Gig


def create_order(db: Session, gig_id: str, buyer_id: str, message: str) -> Order:
    order = Order(
        gig_id=gig_id,
        buyer_id=buyer_id,
        message=message,
        status="pending",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order_by_id(db: Session, order_id: str) -> Order | None:
    return db.query(Order).filter(Order.id == order_id).first()


def get_orders_by_buyer(
    db: Session,
    buyer_id: str,
    status_filter: str | None = None,
) -> list[Order]:
    query = db.query(Order).filter(Order.buyer_id == buyer_id)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    return query.all()


def get_orders_by_seller(
    db: Session,
    seller_id: str,
    status_filter: str | None = None,
) -> list[Order]:
    query = db.query(Order).join(Gig).filter(Gig.seller_id == seller_id)
    if status_filter:
        query = query.filter(Order.status == status_filter)
    return query.all()


def update_order_status(db: Session, order: Order, new_status: str) -> Order:
    order.status = new_status
    db.commit()
    db.refresh(order)
    return order


def delete_order(db: Session, order: Order) -> None:
    db.delete(order)
    db.commit()
