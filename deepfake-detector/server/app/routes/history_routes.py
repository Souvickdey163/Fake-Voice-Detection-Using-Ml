from fastapi import APIRouter, Depends
from ..dependencies import get_current_user
from ..database import predictions_collection

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("/")
def get_user_history(current_user: dict = Depends(get_current_user)):
    user_id = current_user["_id"]
    
    # Sort by nearest timestamp first
    history_cursor = predictions_collection.find({"user_id": user_id}).sort("timestamp", -1)
    
    results = []
    for doc in history_cursor:
        doc["_id"] = str(doc["_id"])
        
        results.append({
            "id": doc["_id"],
            "filename": doc["filename"],
            "prediction": doc["prediction"],
            "confidence": doc["confidence"],
            "timestamp": doc["timestamp"]
        })
        
    return results
