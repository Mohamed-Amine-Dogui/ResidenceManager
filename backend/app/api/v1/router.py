from fastapi import APIRouter
from .auth import router as auth_router
from .reservations import router as reservations_router
from .maintenance import router as maintenance_router
from .finance import router as finance_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(reservations_router, prefix="/reservations", tags=["reservations"])
api_router.include_router(maintenance_router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(finance_router, prefix="/finance", tags=["finance"])