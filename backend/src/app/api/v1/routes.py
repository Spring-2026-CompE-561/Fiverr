"""Top-level API router for version 1 endpoints."""

from fastapi import APIRouter

from src.app.routes.auth import router as auth_router
from src.app.routes.health import router as health_router
from src.app.routes.gig import router as gigs_router
from src.app.routes.users import router as users_router
from src.app.routes.reviews import router as reviews_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(gigs_router, tags=["Gigs"])
api_router.include_router(reviews_router, tags=["Reviews"])

router = api_router