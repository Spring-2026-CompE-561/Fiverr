from fastapi import APIRouter
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])