from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Default matches docker-compose Postgres service (local dev).
    DATABASE_URL: str = (
        "postgresql+psycopg://giglink:giglink@127.0.0.1:5432/giglink"
    )
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


settings = Settings()
