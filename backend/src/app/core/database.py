from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .settings import settings

# SQLite needs check_same_thread=False; Postgres/other drivers must not receive it.
_connect_args = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


# creates sessions to run queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)  # SessionLocal creates sessions to do queries

# base class that all model wil inherit from
Base = declarative_base() 


# opens and closes the DB connection automatically                     
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()