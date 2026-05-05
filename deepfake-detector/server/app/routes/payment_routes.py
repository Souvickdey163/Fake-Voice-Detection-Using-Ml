import hashlib
import hmac
import os
from datetime import datetime

import requests
from fastapi import APIRouter, Depends, HTTPException

from ..database import payments_collection, users_collection
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "").strip()
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
RAZORPAY_BASE_URL = "https://api.razorpay.com/v1"
DEFAULT_CURRENCY = "INR"

PLAN_PRICING = {
    "pro": {
        "name": "Pro",
        "amount": 100,
        "description": "NeuroVoice Pro monthly plan",
    },
    "team": {
        "name": "Team",
        "amount": 399900,
        "description": "NeuroVoice Team monthly plan",
    },
}


def require_razorpay_config():
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the backend.",
        )


@router.get("/plans")
def get_payment_plans():
    return {
        "key": RAZORPAY_KEY_ID,
        "currency": DEFAULT_CURRENCY,
        "plans": PLAN_PRICING,
    }


@router.get("/history")
def get_payment_history(current_user: dict = Depends(get_current_user)):
    payment_cursor = payments_collection.find({"user_id": current_user["_id"]}).sort("created_at", -1)
    results = []

    for doc in payment_cursor:
        results.append(
            {
                "id": str(doc["_id"]),
                "plan": doc.get("plan", "free"),
                "amount": doc.get("amount", 0),
                "currency": doc.get("currency", DEFAULT_CURRENCY),
                "status": doc.get("status", "created"),
                "order_id": doc.get("razorpay_order_id", ""),
                "payment_id": doc.get("razorpay_payment_id", ""),
                "created_at": doc.get("created_at"),
                "paid_at": doc.get("paid_at"),
            }
        )

    return results


@router.post("/create-order")
def create_payment_order(
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    require_razorpay_config()

    plan = str(payload.get("plan", "")).strip().lower()
    plan_config = PLAN_PRICING.get(plan)
    if not plan_config:
        raise HTTPException(status_code=400, detail="Unsupported plan selected.")

    order_payload = {
        "amount": plan_config["amount"],
        "currency": DEFAULT_CURRENCY,
        "receipt": f"{plan}_{current_user['_id']}_{int(datetime.utcnow().timestamp())}",
        "notes": {
            "user_id": current_user["_id"],
            "user_email": current_user["email"],
            "plan": plan,
        },
    }

    response = requests.post(
        f"{RAZORPAY_BASE_URL}/orders",
        auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET),
        json=order_payload,
        timeout=20,
    )

    if response.status_code >= 400:
        detail = "Unable to create Razorpay order."
        try:
            detail = response.json().get("error", {}).get("description") or detail
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail)

    order = response.json()
    payments_collection.insert_one(
        {
            "user_id": current_user["_id"],
            "email": current_user["email"],
            "plan": plan,
            "amount": plan_config["amount"],
            "currency": DEFAULT_CURRENCY,
            "razorpay_order_id": order["id"],
            "status": "created",
            "created_at": datetime.utcnow(),
        }
    )

    return {
        "key": RAZORPAY_KEY_ID,
        "plan": plan,
        "plan_name": plan_config["name"],
        "amount": order["amount"],
        "currency": order["currency"],
        "order_id": order["id"],
        "description": plan_config["description"],
        "prefill": {
            "name": current_user["name"],
            "email": current_user["email"],
        },
    }


@router.post("/verify")
def verify_payment(
    payload: dict,
    current_user: dict = Depends(get_current_user),
):
    require_razorpay_config()

    plan = str(payload.get("plan", "")).strip().lower()
    order_id = str(payload.get("razorpay_order_id", "")).strip()
    payment_id = str(payload.get("razorpay_payment_id", "")).strip()
    signature = str(payload.get("razorpay_signature", "")).strip()

    if plan not in PLAN_PRICING:
        raise HTTPException(status_code=400, detail="Unsupported plan selected.")

    if not order_id or not payment_id or not signature:
        raise HTTPException(status_code=400, detail="Payment verification payload is incomplete.")

    digest = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(digest, signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature.")

    payment_doc = payments_collection.find_one(
        {
            "user_id": current_user["_id"],
            "plan": plan,
            "razorpay_order_id": order_id,
        }
    )
    if not payment_doc:
        raise HTTPException(status_code=404, detail="Payment order not found.")

    payments_collection.update_one(
        {"_id": payment_doc["_id"]},
        {
            "$set": {
                "status": "paid",
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
                "paid_at": datetime.utcnow(),
            }
        },
    )

    users_collection.update_one(
        {"email": current_user["email"]},
        {
            "$set": {
                "plan": plan,
                "plan_updated_at": datetime.utcnow(),
                "last_payment_id": payment_id,
            }
        },
    )

    return {
        "success": True,
        "message": f"{PLAN_PRICING[plan]['name']} plan activated successfully.",
        "plan": plan,
    }
