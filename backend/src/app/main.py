from fastapi import FastAPI
from src.app.api.v1.routes import api_router

app = FastAPI(title="GigLink Marketplace")

app.include_router(api_router, prefix="/api/v1")