from fastapi import APIRouter

# main router that connects all routes
router = APIRouter()

# placeholder until everyone finishes their routes
@router.get("/health")
def health_check():
    return {"status": "ok"}

# add your routes as you finish(uncomment your routes)
# from routes.auth import router as auth_router
# from routes.users import router as users_router
# from routes.gigs import router as gigs_router
# from routes.orders import router as orders_router
# from routes.reviews import router as reviews_router

# router.include_router(auth_router, prefix="/auth", tags=["auth"])
# router.include_router(users_router, prefix="/users", tags=["users"])
# router.include_router(gigs_router, prefix="/gigs", tags=["gigs"])
# router.include_router(orders_router, prefix="/orders", tags=["orders"])
# router.include_router(reviews_router, prefix="/reviews", tags=["reviews"])