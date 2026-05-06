"""Email delivery service for transactional emails (verification, etc.)."""

from __future__ import annotations

import logging
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.settings import settings

logger = logging.getLogger(__name__)


def generate_verification_token() -> tuple[str, datetime]:
    """Return a URL-safe token and its UTC expiry timestamp."""
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES
    )
    return token, expires_at


def send_verification_email(to_email: str, token: str) -> None:
    """Send a verification email via SMTP, or log the link when SMTP is not configured."""
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    if not settings.SMTP_HOST:
        logger.info("SMTP not configured — verification link: %s", verification_url)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Verify your GigLink email"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email

    plain = (
        f"Click the link below to verify your email address:\n\n"
        f"{verification_url}\n\n"
        f"This link expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes."
    )
    html = (
        "<html><body>"
        "<p>Click the link below to verify your email address:</p>"
        f'<p><a href="{verification_url}">Verify Email</a></p>'
        f"<p>This link expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes.</p>"
        "</body></html>"
    )

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.ehlo()
            smtp.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
    except Exception as exc:
        logger.error("Failed to send verification email to %s: %s", to_email, exc)
