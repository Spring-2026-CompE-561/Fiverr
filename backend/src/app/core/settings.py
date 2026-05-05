import os
from pydantic_settings import BaseSettings

_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "giglink.db")
_DB_PATH = os.path.abspath(_DB_PATH)


class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{_DB_PATH}"
    JWT_SECRET: str = "dev-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # SMTP — leave SMTP_HOST empty to disable real email and log links instead
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@giglink.dev"
    FRONTEND_URL: str = "http://localhost:3000"
    VERIFICATION_TOKEN_EXPIRE_MINUTES: int = 60

    @property
    def email_verification_enabled(self) -> bool:
        return bool(self.SMTP_HOST)

    class Config:
        env_file = ".env"


settings = Settings()
