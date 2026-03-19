from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from schemas.order import OrderCreate, OrderUpdate, OrderResponse
from services.order import (
    create_order_service,
    list_orders_service,
    get_order_service,
    update_order_service,
    cancel_order_service,
)

router = APIRouter(prefix="/api/orders", tags=["Orders"])

# This is a stub for authentication. In a real application, you would replace this with actual authentication logic.
class FakeUser:
    def __init__(self, id: int, role: str):
        self.id = id
        self.role = role


def get_current_user():
    return FakeUser(id=1, role="buyer")
# To be replaced with actual authentication logic in a real application


@router.post("", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return create_order_service(db, current_user, order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[OrderResponse])
def list_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return list_orders_service(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return get_order_service(db, id, current_user)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id}", response_model=OrderResponse)
def update_order(id: int, order_update: OrderUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return update_order_service(db, id, order_update.status, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}")
def delete_order(id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return cancel_order_service(db, id, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
