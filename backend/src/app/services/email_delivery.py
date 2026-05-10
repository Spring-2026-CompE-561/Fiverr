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


def _send(msg: MIMEMultipart, to_email: str, label: str) -> None:
    """Internal helper: send a MIME message or log when SMTP is not configured."""
    if not settings.SMTP_HOST:
        logger.info("SMTP not configured — skipping %s email to %s", label, to_email)
        return
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.ehlo()
            smtp.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
    except Exception as exc:
        logger.error("Failed to send %s email to %s: %s", label, to_email, exc)


def send_new_order_email(
    to_email: str,
    seller_name: str,
    buyer_name: str,
    gig_title: str,
    message: str,
) -> None:
    """Notify a seller that a buyer has requested their service."""
    orders_url = f"{settings.FRONTEND_URL}/orders"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"New order request: {gig_title}"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email

    plain = (
        f"Hi {seller_name},\n\n"
        f"{buyer_name} has requested your service \"{gig_title}\".\n\n"
        f"Their message:\n{message}\n\n"
        f"Log in to accept or reject the request:\n{orders_url}"
    )
    html = (
        "<html><body>"
        f"<p>Hi {seller_name},</p>"
        f"<p><strong>{buyer_name}</strong> has requested your service <em>\"{gig_title}\"</em>.</p>"
        f"<p><strong>Their message:</strong><br>{message}</p>"
        f'<p><a href="{orders_url}">View and respond to the request</a></p>'
        "</body></html>"
    )
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))
    _send(msg, to_email, "new-order")


def send_order_accepted_email(
    to_email: str,
    buyer_name: str,
    seller_name: str,
    gig_title: str,
) -> None:
    """Notify a buyer that their order has been accepted by the seller."""
    orders_url = f"{settings.FRONTEND_URL}/orders"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your order for \"{gig_title}\" was accepted!"
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email

    plain = (
        f"Hi {buyer_name},\n\n"
        f"Great news! {seller_name} has accepted your order for \"{gig_title}\".\n\n"
        f"View your orders here:\n{orders_url}"
    )
    html = (
        "<html><body>"
        f"<p>Hi {buyer_name},</p>"
        f"<p>Great news! <strong>{seller_name}</strong> has accepted your order for <em>\"{gig_title}\"</em>.</p>"
        f'<p><a href="{orders_url}">View your orders</a></p>'
        "</body></html>"
    )
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))
    _send(msg, to_email, "order-accepted")
