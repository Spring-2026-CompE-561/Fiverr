from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./giglink.db"
    JWT_SECRET: str = "dev-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    SMTP_HOST: str = ""
    SMTP_FROM_EMAIL: str = ""

    @property
    def email_verification_enabled(self) -> bool:
        return bool(self.SMTP_HOST and self.SMTP_FROM_EMAIL)

    class Config:
        env_file = ".env"


settings = Settings()
