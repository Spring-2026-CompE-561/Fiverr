import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.app.models.gig import Gig
from src.app.schemas.gig import GigCreate, GigUpdate


def get_all_gigs(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    query = db.query(Gig)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Gig.title.ilike(pattern),
                Gig.description.ilike(pattern),
                Gig.category.ilike(pattern),
                Gig.tags.ilike(pattern),
            )
        )

    if category:
        query = query.filter(Gig.category.ilike(category))

    if min_price is not None:
        query = query.filter(Gig.price >= min_price)

    if max_price is not None:
        query = query.filter(Gig.price <= max_price)

    return query.order_by(Gig.created_at.desc()).all()


def get_gig_by_id(db: Session, gig_id: str):
    return db.query(Gig).filter(Gig.id == gig_id).first()


def create_gig(db: Session, seller_id: str, gig_data: GigCreate):
    db_gig = Gig(
        id=str(uuid.uuid4()),
        seller_id=seller_id,
        title=gig_data.title,
        description=gig_data.description,
        price=gig_data.price,
        category=gig_data.category,
        tags=",".join(gig_data.tags) if gig_data.tags else "",
    )
    db.add(db_gig)
    db.commit()
    db.refresh(db_gig)
    return db_gig


def update_gig(db: Session, gig: Gig, gig_data: GigUpdate):
    updates = gig_data.model_dump(exclude_unset=True)

    if "tags" in updates and updates["tags"] is not None:
        updates["tags"] = ",".join(updates["tags"])

    for key, value in updates.items():
        setattr(gig, key, value)

    db.commit()
    db.refresh(gig)
    return gig


def delete_gig(db: Session, gig: Gig):
    db.delete(gig)
    db.commit()