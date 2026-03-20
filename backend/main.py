from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base
from api.v1.routes import router
from core.error_handlers import http_exception_handler, validation_exception_handler
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fiverr API", version="1.0.0")

# allow frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# health check endpoint
@app.get("/")
def root():
    return {"message": "Fiverr API is running"}

app.include_router(router, prefix="/api/v1")

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)