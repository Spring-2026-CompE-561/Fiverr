"""
Seed script: creates a demo seller and 12 realistic gigs.
Run from the backend/ folder:
    $env:PYTHONPATH="src"
    python scripts/seed_marketplace.py
"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from app.core.database import engine, Base
from app.models import user, gig  # noqa: F401 — registers ORM models
from app.core.auth import get_password_hash
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.gig import Gig

DEMO_EMAIL = "demo.seller@example.com"
DEMO_PASSWORD = "DemoSeller!2026"
DEMO_NAME = "Demo Seller"

GIGS = [
    {
        "title": "I will design a professional logo for your brand",
        "description": "High-quality logo design with unlimited revisions. Delivered in PNG, SVG, and PDF formats.",
        "price": 49.99,
        "tags": ["design", "logo", "branding"],
    },
    {
        "title": "I will build a responsive React website",
        "description": "Modern, mobile-friendly React website with clean code and fast load times.",
        "price": 199.99,
        "tags": ["development", "react", "frontend"],
    },
    {
        "title": "I will write SEO-optimized blog posts",
        "description": "Engaging, keyword-rich blog content that ranks on Google and drives traffic.",
        "price": 29.99,
        "tags": ["writing", "seo", "content"],
    },
    {
        "title": "I will create a social media marketing strategy",
        "description": "Complete social media plan including content calendar, hashtags, and growth tactics.",
        "price": 79.99,
        "tags": ["marketing", "social media", "strategy"],
    },
    {
        "title": "I will edit your video professionally",
        "description": "Professional video editing with color grading, transitions, and background music.",
        "price": 89.99,
        "tags": ["video", "editing", "youtube"],
    },
    {
        "title": "I will develop a REST API with FastAPI",
        "description": "Scalable REST API with authentication, database integration, and full documentation.",
        "price": 249.99,
        "tags": ["development", "api", "python"],
    },
    {
        "title": "I will design your mobile app UI in Figma",
        "description": "Clean, modern mobile app UI design with interactive prototype and design system.",
        "price": 149.99,
        "tags": ["design", "figma", "mobile", "ui"],
    },
    {
        "title": "I will write your business plan",
        "description": "Comprehensive business plan with market analysis, financials, and executive summary.",
        "price": 119.99,
        "tags": ["writing", "business", "startup"],
    },
    {
        "title": "I will run your Google Ads campaign",
        "description": "Setup and manage Google Ads with keyword research, ad copy, and weekly reporting.",
        "price": 99.99,
        "tags": ["marketing", "google ads", "ppc"],
    },
    {
        "title": "I will create a 2D animated explainer video",
        "description": "Eye-catching 2D animation to explain your product or service in 60-90 seconds.",
        "price": 299.99,
        "tags": ["video", "animation", "explainer"],
    },
    {
        "title": "I will set up your e-commerce store on Shopify",
        "description": "Full Shopify store setup with theme customization, products, and payment integration.",
        "price": 179.99,
        "tags": ["development", "shopify", "ecommerce"],
    },
    {
        "title": "I will translate your document to Spanish",
        "description": "Professional English to Spanish translation with native fluency and fast turnaround.",
        "price": 19.99,
        "tags": ["writing", "translation", "spanish"],
    },
]


def seed():
    Base.metadata.create_all(bind=engine)

    with Session(engine) as session:
        # Create demo seller if missing
        seller = session.query(User).filter_by(email=DEMO_EMAIL).first()
        if not seller:
            seller = User(
                name=DEMO_NAME,
                email=DEMO_EMAIL,
                hashed_password=get_password_hash(DEMO_PASSWORD),
                role="seller",
            )
            session.add(seller)
            session.commit()
            session.refresh(seller)
            print(f"Created demo seller: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        else:
            print(f"Demo seller already exists: {DEMO_EMAIL}")

        # Insert gigs
        added = 0
        for gig_data in GIGS:
            exists = (
                session.query(Gig)
                .filter_by(title=gig_data["title"], seller_id=seller.id)
                .first()
            )
            if not exists:
                gig_obj = Gig(
                    title=gig_data["title"],
                    description=gig_data["description"],
                    price=gig_data["price"],
                    tags=gig_data["tags"],
                    seller_id=seller.id,
                )
                session.add(gig_obj)
                added += 1

        session.commit()
        print(f"Added {added} gigs ({len(GIGS) - added} already existed).")


if __name__ == "__main__":
    seed()