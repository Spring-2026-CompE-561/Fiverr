"""Top-level API router for version 1 endpoints."""

from fastapi import APIRouter

from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.gig import router as gigs_router
from app.routes.orders import router as orders_router
from app.routes.reviews import router as reviews_router
from app.routes.health import router as health_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(gigs_router)
api_router.include_router(orders_router)
api_router.include_router(reviews_router)

router = api_router