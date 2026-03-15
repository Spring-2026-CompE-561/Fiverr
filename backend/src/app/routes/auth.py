from fastapi import APIRouter

router = APIRouter()

@router.post("/register")
def register():
    return {"success": True, "message": "register route stub"}