PLAN_CREDITS = {
    "free": 5,
    "pro": 25,
    "team": 100,
}


def normalize_plan(plan: str | None) -> str:
    if not plan:
        return "free"

    plan_key = str(plan).strip().lower()
    if plan_key in PLAN_CREDITS:
        return plan_key

    return "free"


def build_credit_summary(plan: str | None, used_credits: int) -> dict:
    normalized_plan = normalize_plan(plan)
    total_credits = PLAN_CREDITS[normalized_plan]
    safe_used = max(0, int(used_credits))
    credits_left = max(total_credits - safe_used, 0)

    return {
        "plan": normalized_plan,
        "credits": {
            "used": safe_used,
            "total": total_credits,
            "left": credits_left,
            "percent_used": round((safe_used / total_credits) * 100, 2) if total_credits else 0,
        },
    }
