"""Email delivery service for transactional emails (verification, orders, etc.)."""

from __future__ import annotations

import html as html_escape
import logging
import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.settings import settings

logger = logging.getLogger(__name__)


def generate_verification_token() -> tuple[str, datetime]:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.VERIFICATION_TOKEN_EXPIRE_MINUTES
    )
    return token, expires_at


def render_email_template(
    title: str,
    body: str,
    button_text: str,
    button_url: str,
) -> str:
    return f"""
    <html>
      <body style="margin:0; padding:0; background-color:#f3f4f6; font-family:Arial, sans-serif;">
        <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:12px; padding:28px;">
          <h2 style="margin:0 0 20px; color:#111827;">GigLink</h2>

          <h3 style="color:#111827; margin-bottom:16px;">{title}</h3>

          <div style="color:#374151; font-size:15px; line-height:1.6;">
            {body}
          </div>

          <div style="margin:28px 0;">
            <a href="{button_url}"
               style="background:#2563eb; color:#ffffff; padding:12px 20px;
                      text-decoration:none; border-radius:8px; display:inline-block;">
              {button_text}
            </a>
          </div>

          <hr style="border:none; border-top:1px solid #e5e7eb; margin:24px 0;" />

          <p style="font-size:12px; color:#6b7280;">
            You're receiving this email because you use GigLink.
          </p>
        </div>
      </body>
    </html>
    """


def _send(msg: MIMEMultipart, to_email: str, label: str) -> None:
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


def send_verification_email(to_email: str, token: str) -> None:
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "[GigLink] Verify your email"
    msg["From"] = f"\"GigLink\" <{settings.EMAIL_FROM}>"
    msg["To"] = to_email

    plain = (
        "Click the link below to verify your email address:\n\n"
        f"{verification_url}\n\n"
        f"This link expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes."
    )

    body = (
        "<p>Click the button below to verify your email address.</p>"
        f"<p>This link expires in {settings.VERIFICATION_TOKEN_EXPIRE_MINUTES} minutes.</p>"
    )

    html = render_email_template(
        title="Verify your email",
        body=body,
        button_text="Verify Email",
        button_url=verification_url,
    )

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    _send(msg, to_email, "verification")


def send_new_order_email(
    to_email: str,
    seller_name: str,
    buyer_name: str,
    gig_title: str,
    message: str,
) -> None:
    orders_url = f"{settings.FRONTEND_URL}/orders"

    safe_seller_name = html_escape.escape(seller_name or "there")
    safe_buyer_name = html_escape.escape(buyer_name or "A buyer")
    safe_gig_title = html_escape.escape(gig_title or "your gig")
    safe_message = html_escape.escape(message or "No message provided.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"[GigLink] New order request: {gig_title}"
    msg["From"] = f"\"GigLink\" <{settings.EMAIL_FROM}>"
    msg["To"] = to_email

    plain = (
        f"Hi {seller_name},\n\n"
        f"{buyer_name} has requested your service \"{gig_title}\".\n\n"
        f"Their message:\n{message or 'No message provided.'}\n\n"
        f"Log in to accept or reject the request:\n{orders_url}"
    )

    body = (
        f"<p>Hi {safe_seller_name},</p>"
        f"<p><strong>{safe_buyer_name}</strong> has requested your service "
        f"<em>\"{safe_gig_title}\"</em>.</p>"
        f"<p><strong>Their message:</strong><br>{safe_message}</p>"
    )

    html = render_email_template(
        title="New Order Request",
        body=body,
        button_text="View Request",
        button_url=orders_url,
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
    orders_url = f"{settings.FRONTEND_URL}/orders"

    safe_buyer_name = html_escape.escape(buyer_name or "there")
    safe_seller_name = html_escape.escape(seller_name or "The seller")
    safe_gig_title = html_escape.escape(gig_title or "your order")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "[GigLink] Your order was accepted!"
    msg["From"] = f"\"GigLink\" <{settings.EMAIL_FROM}>"
    msg["To"] = to_email

    plain = (
        f"Hi {buyer_name},\n\n"
        f"Great news! {seller_name} has accepted your order for \"{gig_title}\".\n\n"
        f"View your orders here:\n{orders_url}"
    )

    body = (
        f"<p>Hi {safe_buyer_name},</p>"
        f"<p>Great news! <strong>{safe_seller_name}</strong> has accepted your order "
        f"for <em>\"{safe_gig_title}\"</em>.</p>"
    )

    html = render_email_template(
        title="Order Accepted 🎉",
        body=body,
        button_text="View Order",
        button_url=orders_url,
    )

    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html, "html"))

    _send(msg, to_email, "order-accepted")