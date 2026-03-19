from sqlalchemy.orm import Session
from models.order import Order


def create_order(db: Session, gig_id: int, buyer_id: int, message: str):
    order = Order(
        gig_id=gig_id,
        buyer_id=buyer_id,
        message=message,
        status="pending"
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


def get_order_by_id(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()


def get_orders_by_buyer(db: Session, buyer_id: int):
    return db.query(Order).filter(Order.buyer_id == buyer_id).all()


def get_all_orders(db: Session):
    return db.query(Order).all()


def update_order_status(db: Session, order: Order, status: str):
    order.status = status
    db.commit()
    db.refresh(order)
    return order


def delete_order(db: Session, order: Order):
    db.delete(order)
    db.commit()
