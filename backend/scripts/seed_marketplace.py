"""
Seed script: creates a demo seller, 12 realistic gigs, demo buyers, and realistic orders.
Run from the backend/ folder:
    $env:PYTHONPATH="src"
    python scripts/seed_marketplace.py
"""
from __future__ import annotations

import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from app.core.auth import hash_password
from app.core.database import Base, engine
from app.models import gig, review, user  # noqa: F401 — registers ORM models
from app.models.gig import Gig
from app.models.order import Order
from app.models.user import User, UserRole
from sqlalchemy.orm import Session

DEMO_EMAIL = "demo.seller@example.com"
DEMO_PASSWORD = "DemoSeller!2026"
DEMO_NAME = "Demo Seller"

DEMO_BUYERS = [
    {
        "email": "demo.buyer1@example.com",
        "password": "DemoBuyer1!2026",
        "name": "Alex Chen",
    },
    {
        "email": "demo.buyer2@example.com",
        "password": "DemoBuyer2!2026",
        "name": "Jordan Lee",
    },
    {
        "email": "demo.buyer3@example.com",
        "password": "DemoBuyer3!2026",
        "name": "Sam Rivera",
    },
    {
        "email": "demo.buyer4@example.com",
        "password": "DemoBuyer4!2026",
        "name": "Morgan Taylor",
    },
]

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

# One seed order per gig: (buyer by email), status, message, created N days ago, updated M days ago (M <= N)
ORDER_SEEDS: list[dict] = [
    {
        "gig_title": "I will design a professional logo for your brand",
        "buyer_email": "demo.buyer1@example.com",
        "status": "completed",
        "message": (
            "We are launching a B2B SaaS called Northwind Analytics. I need a wordmark + icon "
            "that works on dark dashboards and light marketing pages. Brand colors are navy #0B1F3A "
            "and teal #2DD4BF. Please include 3 concept directions and source files (SVG + PDF)."
        ),
        "created_days_ago": 21,
        "updated_days_ago": 3,
    },
    {
        "gig_title": "I will build a responsive React website",
        "buyer_email": "demo.buyer2@example.com",
        "status": "accepted",
        "message": (
            "Need a marketing site for our mobile app: 6 pages (Home, Features, Pricing, FAQ, "
            "Blog, Contact). We use Next.js elsewhere—happy if you match that stack. "
            "I will provide copy in Google Docs and brand assets in Figma by Friday."
        ),
        "created_days_ago": 9,
        "updated_days_ago": 5,
    },
    {
        "gig_title": "I will write SEO-optimized blog posts",
        "buyer_email": "demo.buyer3@example.com",
        "status": "pending",
        "message": (
            "Looking for 4 posts/month (1500–2000 words) in the project management niche. "
            "Target keyword clusters: 'async standups', 'sprint planning templates', "
            "'engineering metrics'. Please follow our style guide (I can share a sample post)."
        ),
        "created_days_ago": 2,
        "updated_days_ago": 2,
    },
    {
        "gig_title": "I will create a social media marketing strategy",
        "buyer_email": "demo.buyer4@example.com",
        "status": "rejected",
        "message": (
            "We are a local bakery opening two new locations. Need a 90-day plan for Instagram + TikTok "
            "with content pillars, posting cadence, and UGC ideas. Budget for paid boosts is small (~$300/mo)."
        ),
        "created_days_ago": 14,
        "updated_days_ago": 11,
    },
    {
        "gig_title": "I will edit your video professionally",
        "buyer_email": "demo.buyer1@example.com",
        "status": "completed",
        "message": (
            "Conference talk recording: 42 minutes, 1080p. Need intro bumper (5s), lower thirds for speaker "
            "name/title, light color grade, and removal of long pauses. Deliverables: 1080p MP4 + captions SRT."
        ),
        "created_days_ago": 18,
        "updated_days_ago": 4,
    },
    {
        "gig_title": "I will develop a REST API with FastAPI",
        "buyer_email": "demo.buyer2@example.com",
        "status": "pending",
        "message": (
            "MVP API for inventory + orders: JWT auth, Postgres, Alembic migrations, OpenAPI docs. "
            "Roughly 12 endpoints. I have a rough ERD—can share before kickoff. Timeline: 3–4 weeks."
        ),
        "created_days_ago": 1,
        "updated_days_ago": 1,
    },
    {
        "gig_title": "I will design your mobile app UI in Figma",
        "buyer_email": "demo.buyer3@example.com",
        "status": "accepted",
        "message": (
            "Fitness tracking app (iOS first). Need onboarding, home dashboard, workout logging flow, "
            "and settings. Prefer a minimal aesthetic similar to Apple Fitness. I have user flows in Miro."
        ),
        "created_days_ago": 7,
        "updated_days_ago": 6,
    },
    {
        "gig_title": "I will write your business plan",
        "buyer_email": "demo.buyer4@example.com",
        "status": "completed",
        "message": (
            "Seeking a 25–30 page plan for a seed-stage climate hardware startup. Include TAM/SAM/SOM, "
            "competitive matrix, 24-month financial model assumptions, and a 12-month hiring plan."
        ),
        "created_days_ago": 30,
        "updated_days_ago": 8,
    },
    {
        "gig_title": "I will run your Google Ads campaign",
        "buyer_email": "demo.buyer1@example.com",
        "status": "rejected",
        "message": (
            "We sell ergonomic office chairs DTC in the US only. Need search + shopping campaigns. "
            "Current site speed is mediocre—if that's a blocker, tell me upfront."
        ),
        "created_days_ago": 12,
        "updated_days_ago": 10,
    },
    {
        "gig_title": "I will create a 2D animated explainer video",
        "buyer_email": "demo.buyer2@example.com",
        "status": "pending",
        "message": (
            "60–75s explainer for a passwordless auth product. Voiceover script draft is ready. "
            "Style reference: modern flat illustration + subtle motion. Need storyboard before full animation."
        ),
        "created_days_ago": 3,
        "updated_days_ago": 3,
    },
    {
        "gig_title": "I will set up your e-commerce store on Shopify",
        "buyer_email": "demo.buyer3@example.com",
        "status": "completed",
        "message": (
            "Migrate ~120 SKUs from WooCommerce to Shopify. Need theme tweaks (header, PDP sections), "
            "tax/shipping rules for CA + NY, and Klaviyo signup form embedded. Launch target is end of month."
        ),
        "created_days_ago": 25,
        "updated_days_ago": 6,
    },
    {
        "gig_title": "I will translate your document to Spanish",
        "buyer_email": "demo.buyer4@example.com",
        "status": "accepted",
        "message": (
            "Employee handbook: ~18k words, US English → Latin American Spanish (neutral). "
            "Please preserve headings and numbering. We need tracked changes or side-by-side PDF for legal review."
        ),
        "created_days_ago": 5,
        "updated_days_ago": 4,
    },
]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _gig_category(tags: list[str]) -> str:
    return tags[0] if tags else "general"


def _ensure_demo_buyers(session: Session) -> dict[str, User]:
    """Create or refresh demo buyers; return email -> User."""
    buyers: dict[str, User] = {}
    for b in DEMO_BUYERS:
        user_row = session.query(User).filter_by(email=b["email"]).first()
        pw_hash = hash_password(b["password"])
        if not user_row:
            user_row = User(
                name=b["name"],
                email=b["email"],
                password_hash=pw_hash,
                role=UserRole.BUYER,
                email_verified=True,
                email_verification_token=None,
                email_verification_expires_at=None,
            )
            session.add(user_row)
            print(f"Created demo buyer: {b['email']} / {b['password']}")
        else:
            user_row.name = b["name"]
            user_row.password_hash = pw_hash
            user_row.role = UserRole.BUYER
            user_row.email_verified = True
            user_row.email_verification_token = None
            user_row.email_verification_expires_at = None
            print(f"Updated demo buyer: {b['email']}")
        buyers[b["email"]] = user_row
    session.commit()
    for b in DEMO_BUYERS:
        session.refresh(buyers[b["email"]])
    return buyers


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    now = _utc_now()

    with Session(engine) as session:
        # --- Demo seller ---
        seller = session.query(User).filter_by(email=DEMO_EMAIL).first()
        if not seller:
            seller = User(
                name=DEMO_NAME,
                email=DEMO_EMAIL,
                password_hash=hash_password(DEMO_PASSWORD),
                role=UserRole.SELLER,
                email_verified=True,
                email_verification_token=None,
                email_verification_expires_at=None,
            )
            session.add(seller)
            session.commit()
            session.refresh(seller)
            print(f"Created demo seller: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        else:
            seller.password_hash = hash_password(DEMO_PASSWORD)
            seller.role = UserRole.SELLER
            seller.email_verified = True
            seller.email_verification_token = None
            seller.email_verification_expires_at = None
            session.commit()
            session.refresh(seller)
            print(f"Demo seller ready: {DEMO_EMAIL} / {DEMO_PASSWORD}")

        # --- Gigs ---
        added = 0
        for gig_data in GIGS:
            exists = (
                session.query(Gig)
                .filter_by(title=gig_data["title"], seller_id=seller.id)
                .first()
            )
            if not exists:
                tags_list: list[str] = gig_data["tags"]
                gig_obj = Gig(
                    id=str(uuid.uuid4()),
                    seller_id=seller.id,
                    title=gig_data["title"],
                    description=gig_data["description"],
                    price=gig_data["price"],
                    category=_gig_category(tags_list),
                    tags=",".join(tags_list) if tags_list else "",
                )
                session.add(gig_obj)
                added += 1

        session.commit()
        print(f"Added {added} gigs ({len(GIGS) - added} already existed).")

        buyers_by_email = _ensure_demo_buyers(session)

        # --- Orders (idempotent on gig_id + buyer_id) ---
        orders_created = 0
        orders_updated = 0
        for spec in ORDER_SEEDS:
            gig_row = (
                session.query(Gig)
                .filter_by(title=spec["gig_title"], seller_id=seller.id)
                .first()
            )
            if not gig_row:
                print(f"Skip order: gig not found: {spec['gig_title']!r}")
                continue

            buyer = buyers_by_email.get(spec["buyer_email"])
            if not buyer:
                print(f"Skip order: buyer not found: {spec['buyer_email']}")
                continue

            created_at = now - timedelta(days=float(spec["created_days_ago"]))
            updated_at = now - timedelta(days=float(spec["updated_days_ago"]))
            if updated_at < created_at:
                updated_at = created_at

            existing = (
                session.query(Order)
                .filter_by(gig_id=gig_row.id, buyer_id=buyer.id)
                .first()
            )
            if existing:
                existing.message = spec["message"]
                existing.status = spec["status"]
                existing.created_at = created_at
                existing.updated_at = updated_at
                orders_updated += 1
            else:
                session.add(
                    Order(
                        gig_id=gig_row.id,
                        buyer_id=buyer.id,
                        message=spec["message"],
                        status=spec["status"],
                        created_at=created_at,
                        updated_at=updated_at,
                    )
                )
                orders_created += 1

        session.commit()
        print(
            f"Orders: {orders_created} created, {orders_updated} upserted "
            f"(total specs {len(ORDER_SEEDS)}).",
        )


if __name__ == "__main__":
    seed()
