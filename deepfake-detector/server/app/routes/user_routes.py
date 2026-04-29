from fastapi import APIRouter, Depends
from ..dependencies import get_current_user
from ..database import predictions_collection
from ..plan_utils import build_credit_summary

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    used_credits = predictions_collection.count_documents({"user_id": current_user["_id"]})
    credit_summary = build_credit_summary(current_user.get("plan"), used_credits)

    return {
        "id": current_user["_id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "picture": current_user.get("picture", ""),
        "plan": credit_summary["plan"],
        "credits": credit_summary["credits"],
        "created_at": current_user["created_at"]
    }
