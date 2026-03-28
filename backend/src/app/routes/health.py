from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="Health check")
def health():
    return {"status": "ok"}