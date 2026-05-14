from datetime import datetime

from fastapi import APIRouter, Depends
from ..dependencies import get_current_user
from ..database import predictions_collection, ratings_collection, users_collection
from ..plan_utils import build_credit_summary
from ..schemas import RatingCreate

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/stats")
def get_public_site_stats():
    total_users = users_collection.count_documents({})
    rating_stats = list(ratings_collection.aggregate([
        {
            "$group": {
                "_id": None,
                "average_rating": {"$avg": "$score"},
                "total_ratings": {"$sum": 1},
            }
        }
    ]))
    stats = rating_stats[0] if rating_stats else {}

    return {
        "total_users": total_users,
        "average_rating": round(float(stats.get("average_rating", 0)), 1) if stats else 0,
        "total_ratings": int(stats.get("total_ratings", 0)) if stats else 0,
    }


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


@router.post("/ratings")
def submit_site_rating(
    rating: RatingCreate,
    current_user: dict = Depends(get_current_user)
):
    now = datetime.utcnow()
    rating_doc = {
        "user_id": current_user["_id"],
        "user_name": current_user.get("name", ""),
        "user_email": current_user.get("email", ""),
        "score": rating.score,
        "comment": rating.comment.strip() if rating.comment else "",
        "updated_at": now,
    }

    ratings_collection.update_one(
        {"user_id": current_user["_id"]},
        {
            "$set": rating_doc,
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

    return {
        "message": "Thanks for rating NeuroVoice.",
        "rating": {
            "score": rating.score,
            "comment": rating_doc["comment"],
        },
    }
