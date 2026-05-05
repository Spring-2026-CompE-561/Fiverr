import random

PLACEHOLDER_GIGS = [
    {
        "title": "I will design a professional logo",
        "description": "High-quality logo design with unlimited revisions.",
        "price": 49.99,
        "tags": ["design", "logo", "branding"],
    },
    {
        "title": "I will build a responsive React website",
        "description": "Modern mobile-friendly React website with clean code.",
        "price": 199.99,
        "tags": ["development", "react", "frontend"],
    },
    {
        "title": "I will write SEO-optimized blog posts",
        "description": "Engaging keyword-rich blog content that ranks on Google.",
        "price": 29.99,
        "tags": ["writing", "seo", "content"],
    },
    {
        "title": "I will create a social media marketing strategy",
        "description": "Complete social media plan with content calendar.",
        "price": 79.99,
        "tags": ["marketing", "social media", "strategy"],
    },
    {
        "title": "I will edit your video professionally",
        "description": "Professional video editing with color grading.",
        "price": 89.99,
        "tags": ["video", "editing", "youtube"],
    },
]


def random_placeholder_gig() -> dict:
    """Return a random realistic gig payload for use in tests."""
    gig = random.choice(PLACEHOLDER_GIGS).copy()
    # Add a random suffix to avoid title conflicts between test runs
    gig["title"] = f"{gig['title']} {random.randint(1000, 9999)}"
    return gig