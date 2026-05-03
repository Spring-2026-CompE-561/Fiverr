from types import SimpleNamespace

import pytest
from fastapi import HTTPException, status

from app.models.gig import Gig
from app.models.order import Order
from app.models.user import User
from app.repository import review as review_repo
from app.services.review import (
    create_review_service,
    delete_review_service,
    list_gig_reviews_service,
)

try:
    from app.models.profile_review import ProfileReview
    from app.repository import profile_review as profile_review_repo
    from app.services.profile_review import (
        create_profile_review_service,
        delete_profile_review_service,
        list_profile_reviews_service,
    )

    PROFILE_REVIEW_AVAILABLE = True
except Exception:
    PROFILE_REVIEW_AVAILABLE = False
    ProfileReview = object
    profile_review_repo = None
    create_profile_review_service = None
    delete_profile_review_service = None
    list_profile_reviews_service = None


class FakeQuery:
    def __init__(self, result):
        self.result = result

    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return self.result

    def all(self):
        return self.result


class FakeDB:
    """
    Minimal fake DB that supports:
      db.query(Model).filter(...).first()
      db.query(Model).filter(...).all()
    """

    def __init__(self, model_results=None):
        self.model_results = model_results or {}

    def query(self, model):
        result = self.model_results.get(model)
        return FakeQuery(result)


def make_user(user_id="user-1", role="buyer"):
    return SimpleNamespace(id=user_id, role=role)


def make_gig(gig_id="gig-1", seller_id="seller-1"):
    return SimpleNamespace(id=gig_id, seller_id=seller_id)


def make_order(order_id="order-1", gig_id="gig-1", buyer_id="buyer-1", seller_id="seller-1", status_value="completed"):
    # includes both "status" and "order_status" in case your service/model uses either
    return SimpleNamespace(
        id=order_id,
        gig_id=gig_id,
        buyer_id=buyer_id,
        seller_id=seller_id,
        status=status_value,
        order_status=status_value,
    )


def make_review(review_id="review-1", gig_id="gig-1", buyer_id="buyer-1", rating=5, comment="Great"):
    return SimpleNamespace(
        id=review_id,
        gig_id=gig_id,
        buyer_id=buyer_id,
        rating=rating,
        comment=comment,
        created_at="2025-01-01T00:00:00",
    )


def make_profile_review(review_id="profile-review-1", seller_id="seller-1", buyer_id="buyer-1", rating=5, comment="Excellent seller"):
    return SimpleNamespace(
        id=review_id,
        seller_id=seller_id,
        buyer_id=buyer_id,
        rating=rating,
        comment=comment,
        created_at="2025-01-01T00:00:00",
    )


# ============================
# Gig / Item Review Tests
# ============================

def test_create_gig_review_success(monkeypatch):
    db = FakeDB(
        {
            Gig: make_gig(gig_id="gig-1"),
            Order: make_order(gig_id="gig-1", buyer_id="buyer-1", status_value="completed"),
        }
    )
    current_user = make_user(user_id="buyer-1", role="buyer")
    created_review = make_review(gig_id="gig-1", buyer_id="buyer-1", rating=5, comment="Awesome")

    monkeypatch.setattr(review_repo, "get_review_by_gig_and_buyer", lambda db, gig_id, buyer_id: None)
    monkeypatch.setattr(
        review_repo,
        "create_review",
        lambda db, gig_id, buyer_id, rating, comment: created_review,
    )

    result = create_review_service(
        db=db,
        current_user=current_user,
        gig_id="gig-1",
        rating=5,
        comment="Awesome",
    )

    assert result.id == "review-1"
    assert result.gig_id == "gig-1"
    assert result.buyer_id == "buyer-1"
    assert result.rating == 5


def test_create_gig_review_rejects_non_buyer(monkeypatch):
    db = FakeDB()
    current_user = make_user(user_id="seller-1", role="seller")

    with pytest.raises(HTTPException) as exc:
        create_review_service(
            db=db,
            current_user=current_user,
            gig_id="gig-1",
            rating=5,
            comment="Should fail",
        )

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "Only buyers can create reviews" in exc.value.detail


def test_create_gig_review_rejects_missing_gig(monkeypatch):
    db = FakeDB({Gig: None})
    current_user = make_user(user_id="buyer-1", role="buyer")

    with pytest.raises(HTTPException) as exc:
        create_review_service(
            db=db,
            current_user=current_user,
            gig_id="missing-gig",
            rating=5,
            comment="Should fail",
        )

    assert exc.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Gig not found" in exc.value.detail


def test_create_gig_review_rejects_duplicate(monkeypatch):
    db = FakeDB(
        {
            Gig: make_gig(gig_id="gig-1"),
            Order: make_order(gig_id="gig-1", buyer_id="buyer-1", status_value="completed"),
        }
    )
    current_user = make_user(user_id="buyer-1", role="buyer")
    existing_review = make_review(gig_id="gig-1", buyer_id="buyer-1")

    monkeypatch.setattr(review_repo, "get_review_by_gig_and_buyer", lambda db, gig_id, buyer_id: existing_review)

    with pytest.raises(HTTPException) as exc:
        create_review_service(
            db=db,
            current_user=current_user,
            gig_id="gig-1",
            rating=4,
            comment="Duplicate",
        )

    assert exc.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "already reviewed" in exc.value.detail.lower()


def test_create_gig_review_requires_completed_order(monkeypatch):
    db = FakeDB(
        {
            Gig: make_gig(gig_id="gig-1"),
            Order: None,
        }
    )
    current_user = make_user(user_id="buyer-1", role="buyer")

    monkeypatch.setattr(review_repo, "get_review_by_gig_and_buyer", lambda db, gig_id, buyer_id: None)

    with pytest.raises(HTTPException) as exc:
        create_review_service(
            db=db,
            current_user=current_user,
            gig_id="gig-1",
            rating=4,
            comment="Too early",
        )

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "completed order" in exc.value.detail.lower()


def test_list_gig_reviews_success(monkeypatch):
    db = FakeDB({Gig: make_gig(gig_id="gig-1")})
    reviews = [
        make_review(review_id="r1", gig_id="gig-1", buyer_id="buyer-1", rating=5),
        make_review(review_id="r2", gig_id="gig-1", buyer_id="buyer-2", rating=4),
    ]

    monkeypatch.setattr(review_repo, "get_reviews_for_gig", lambda db, gig_id: reviews)

    result = list_gig_reviews_service(db=db, gig_id="gig-1")

    assert len(result) == 2
    assert result[0].gig_id == "gig-1"


def test_list_gig_reviews_missing_gig(monkeypatch):
    db = FakeDB({Gig: None})

    with pytest.raises(HTTPException) as exc:
        list_gig_reviews_service(db=db, gig_id="missing-gig")

    assert exc.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Gig not found" in exc.value.detail


def test_delete_gig_review_success(monkeypatch):
    db = FakeDB()
    current_user = make_user(user_id="buyer-1", role="buyer")
    review = make_review(review_id="review-1", gig_id="gig-1", buyer_id="buyer-1")

    deleted = {"called": False}

    monkeypatch.setattr(review_repo, "get_review_by_id", lambda db, review_id: review)

    def fake_delete_review(db, review_obj):
        deleted["called"] = True

    monkeypatch.setattr(review_repo, "delete_review", fake_delete_review)

    delete_review_service(db=db, review_id="review-1", current_user=current_user)

    assert deleted["called"] is True


def test_delete_gig_review_not_found(monkeypatch):
    db = FakeDB()
    current_user = make_user(user_id="buyer-1", role="buyer")

    monkeypatch.setattr(review_repo, "get_review_by_id", lambda db, review_id: None)

    with pytest.raises(HTTPException) as exc:
        delete_review_service(db=db, review_id="missing-review", current_user=current_user)

    assert exc.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Review not found" in exc.value.detail


def test_delete_gig_review_forbidden(monkeypatch):
    db = FakeDB()
    current_user = make_user(user_id="buyer-2", role="buyer")
    review = make_review(review_id="review-1", gig_id="gig-1", buyer_id="buyer-1")

    monkeypatch.setattr(review_repo, "get_review_by_id", lambda db, review_id: review)

    with pytest.raises(HTTPException) as exc:
        delete_review_service(db=db, review_id="review-1", current_user=current_user)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "Not allowed" in exc.value.detail


@pytest.mark.skipif(not PROFILE_REVIEW_AVAILABLE, reason="Profile review module not available yet")
class TestProfileReviews:
    def test_create_profile_review_success(self, monkeypatch):
        db = FakeDB(
            {
                User: make_user(user_id="seller-1", role="seller"),
                Order: make_order(
                    buyer_id="buyer-1",
                    seller_id="seller-1",
                    status_value="completed",
                ),
            }
        )
        current_user = make_user(user_id="buyer-1", role="buyer")
        created_review = make_profile_review(
            seller_id="seller-1",
            buyer_id="buyer-1",
            rating=5,
            comment="Great seller",
        )

        monkeypatch.setattr(
            profile_review_repo,
            "get_profile_review_by_seller_and_buyer",
            lambda db, seller_id, buyer_id: None,
        )
        monkeypatch.setattr(
            profile_review_repo,
            "create_profile_review",
            lambda db, seller_id, buyer_id, rating, comment: created_review,
        )

        result = create_profile_review_service(
            db=db,
            current_user=current_user,
            seller_id="seller-1",
            rating=5,
            comment="Great seller",
        )

        assert result.seller_id == "seller-1"
        assert result.buyer_id == "buyer-1"
        assert result.rating == 5

    def test_create_profile_review_rejects_non_buyer(self, monkeypatch):
        db = FakeDB()
        current_user = make_user(user_id="seller-2", role="seller")

        with pytest.raises(HTTPException) as exc:
            create_profile_review_service(
                db=db,
                current_user=current_user,
                seller_id="seller-1",
                rating=5,
                comment="Should fail",
            )

        assert exc.value.status_code == status.HTTP_403_FORBIDDEN
        assert "Only buyers can create profile reviews" in exc.value.detail

    def test_create_profile_review_rejects_self_review(self, monkeypatch):
        db = FakeDB()
        current_user = make_user(user_id="seller-1", role="buyer")

        with pytest.raises(HTTPException) as exc:
            create_profile_review_service(
                db=db,
                current_user=current_user,
                seller_id="seller-1",
                rating=5,
                comment="Should fail",
            )

        assert exc.value.status_code in {status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN}
        assert "yourself" in exc.value.detail.lower() or "self" in exc.value.detail.lower()

    def test_create_profile_review_rejects_missing_seller(self, monkeypatch):
        db = FakeDB({User: None})
        current_user = make_user(user_id="buyer-1", role="buyer")

        with pytest.raises(HTTPException) as exc:
            create_profile_review_service(
                db=db,
                current_user=current_user,
                seller_id="missing-seller",
                rating=5,
                comment="Should fail",
            )

        assert exc.value.status_code == status.HTTP_404_NOT_FOUND
        assert "seller not found" in exc.value.detail.lower()

    def test_create_profile_review_rejects_duplicate(self, monkeypatch):
        db = FakeDB(
            {
                User: make_user(user_id="seller-1", role="seller"),
                Order: make_order(
                    buyer_id="buyer-1",
                    seller_id="seller-1",
                    status_value="completed",
                ),
            }
        )
        current_user = make_user(user_id="buyer-1", role="buyer")
        existing_review = make_profile_review(seller_id="seller-1", buyer_id="buyer-1")

        monkeypatch.setattr(
            profile_review_repo,
            "get_profile_review_by_seller_and_buyer",
            lambda db, seller_id, buyer_id: existing_review,
        )

        with pytest.raises(HTTPException) as exc:
            create_profile_review_service(
                db=db,
                current_user=current_user,
                seller_id="seller-1",
                rating=4,
                comment="Duplicate",
            )

        assert exc.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "already reviewed" in exc.value.detail.lower()

    def test_create_profile_review_requires_completed_order(self, monkeypatch):
        db = FakeDB(
            {
                User: make_user(user_id="seller-1", role="seller"),
                Order: None,
            }
        )
        current_user = make_user(user_id="buyer-1", role="buyer")

        monkeypatch.setattr(
            profile_review_repo,
            "get_profile_review_by_seller_and_buyer",
            lambda db, seller_id, buyer_id: None,
        )

        with pytest.raises(HTTPException) as exc:
            create_profile_review_service(
                db=db,
                current_user=current_user,
                seller_id="seller-1",
                rating=4,
                comment="Too early",
            )

        assert exc.value.status_code == status.HTTP_403_FORBIDDEN
        assert "completed order" in exc.value.detail.lower()

    def test_list_profile_reviews_success(self, monkeypatch):
        db = FakeDB({User: make_user(user_id="seller-1", role="seller")})
        reviews = [
            make_profile_review(review_id="pr1", seller_id="seller-1", buyer_id="buyer-1", rating=5),
            make_profile_review(review_id="pr2", seller_id="seller-1", buyer_id="buyer-2", rating=4),
        ]

        monkeypatch.setattr(
            profile_review_repo,
            "get_profile_reviews_for_seller",
            lambda db, seller_id: reviews,
        )

        result = list_profile_reviews_service(db=db, seller_id="seller-1")

        assert len(result) == 2
        assert result[0].seller_id == "seller-1"

    def test_delete_profile_review_success(self, monkeypatch):
        db = FakeDB()
        current_user = make_user(user_id="buyer-1", role="buyer")
        review = make_profile_review(review_id="profile-review-1", seller_id="seller-1", buyer_id="buyer-1")

        deleted = {"called": False}

        monkeypatch.setattr(
            profile_review_repo,
            "get_profile_review_by_id",
            lambda db, review_id: review,
        )

        def fake_delete_profile_review(db, review_obj):
            deleted["called"] = True

        monkeypatch.setattr(
            profile_review_repo,
            "delete_profile_review",
            fake_delete_profile_review,
        )

        delete_profile_review_service(db=db, review_id="profile-review-1", current_user=current_user)

        assert deleted["called"] is True

    def test_delete_profile_review_forbidden(self, monkeypatch):
        db = FakeDB()
        current_user = make_user(user_id="buyer-2", role="buyer")
        review = make_profile_review(review_id="profile-review-1", seller_id="seller-1", buyer_id="buyer-1")

        monkeypatch.setattr(
            profile_review_repo,
            "get_profile_review_by_id",
            lambda db, review_id: review,
        )

        with pytest.raises(HTTPException) as exc:
            delete_profile_review_service(db=db, review_id="profile-review-1", current_user=current_user)

        assert exc.value.status_code == status.HTTP_403_FORBIDDEN
        assert "not allowed" in exc.value.detail.lower()