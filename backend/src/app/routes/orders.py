from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.dependencies import require_verified_email
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderUpdate, OrderPublic, order_to_public
from app.services.order import (
    create_order_service,
    list_orders_service,
    get_order_service,
    update_order_service,
    cancel_order_service,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderPublic, summary="Create an order")
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user=Depends(require_verified_email)):
    try:
        row = create_order_service(db, current_user, order)
        return order_to_public(row)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[OrderPublic], summary="List orders")
def list_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        rows = list_orders_service(db, current_user)
        return [order_to_public(o) for o in rows]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}", response_model=OrderPublic, summary="Get order by ID")
def get_order(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        row = get_order_service(db, id, current_user)
        return order_to_public(row)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id}", response_model=OrderPublic, summary="Update an order")
def update_order(id: str, order_update: OrderUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        row = update_order_service(db, id, order_update.status, current_user)
        return order_to_public(row)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}", summary="Delete or cancel an order")
def delete_order(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return cancel_order_service(db, id, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))