from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.app.core.auth import get_current_user
from src.app.core.database import get_db
from src.app.schemas.order import OrderCreate, OrderUpdate, OrderPublic
from src.app.services.order import (
    create_order_service,
    list_orders_service,
    get_order_service,
    update_order_service,
    cancel_order_service,
)

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("", response_model=OrderPublic)
def create_order(order: OrderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return create_order_service(db, current_user, order)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=list[OrderPublic])
def list_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return list_orders_service(db, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{id}", response_model=OrderPublic)
def get_order(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return get_order_service(db, id, current_user)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{id}", response_model=OrderPublic)
def update_order(id: str, order_update: OrderUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return update_order_service(db, id, order_update.status, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}")
def delete_order(id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return cancel_order_service(db, id, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
