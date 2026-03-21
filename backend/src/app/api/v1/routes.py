"""Top-level API router for version 1 endpoints."""

from fastapi import APIRouter

from app.routes.auth import router as auth_router
from app.routes.health import router as health_router
from app.routes.users import router as users_router

api_router = APIRouter()

api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])