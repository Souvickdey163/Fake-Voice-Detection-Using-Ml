from fastapi import APIRouter, Depends
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "created_at": current_user["created_at"]
    }
