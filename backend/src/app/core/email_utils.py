"""Email normalization utilities."""

_GMAIL_DOMAINS = {"gmail.com", "googlemail.com"}


def normalize_email(email: str) -> str:
    """Lowercase email and strip dots from Gmail local parts.

    Gmail treats dots as insignificant: john.doe@gmail.com == johndoe@gmail.com.
    """
    local, _, domain = email.lower().partition("@")
    if domain in _GMAIL_DOMAINS:
        local = local.replace(".", "")
    return f"{local}@{domain}"
