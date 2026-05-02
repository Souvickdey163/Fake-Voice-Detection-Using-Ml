import os
import random
import secrets
import smtplib
from urllib.parse import urlencode

import requests
from fastapi import APIRouter, HTTPException, Request, status, Depends
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email_validator import validate_email, EmailNotValidError
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow
from jose import JWTError, jwt

from ..schemas import UserCreate, UserLogin, Token, GoogleAuthRequest
from ..auth import (
    get_password_hash,
    verify_password,
    verify_google_token,
    create_access_token,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..database import users_collection, otp_collection

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM") or EMAIL_USER
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
SMTP_TIMEOUT_SECONDS = int(os.getenv("SMTP_TIMEOUT_SECONDS", "20"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173").rstrip("/")
BACKEND_URL = os.getenv("BACKEND_URL") or os.getenv("RENDER_EXTERNAL_URL")
OAUTH_STATE_SECRET = os.getenv("OAUTH_STATE_SECRET") or os.getenv("JWT_SECRET", "supersecretkey")
GOOGLE_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]


# =========================
# HELPER: SEND EMAIL OTP
# =========================
def build_otp_email(otp: str):
    subject = "Your NeuroVoice OTP Code"
    body = f"""
Hello,

Your OTP code is: {otp}

This OTP will expire in 5 minutes.

If you did not request this, please ignore this email.

- NeuroVoice Team
"""

    return subject, body


def send_email_with_resend(receiver_email: str, subject: str, body: str):
    if not RESEND_API_KEY or not EMAIL_FROM:
        return False

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": EMAIL_FROM,
            "to": [receiver_email],
            "subject": subject,
            "text": body,
        },
        timeout=20,
    )

    if response.status_code >= 400:
        print(
            f"Resend OTP email failed for {receiver_email}: "
            f"{response.status_code} {response.text}",
            flush=True,
        )
        response.raise_for_status()

    return True


def send_email_with_smtp(receiver_email: str, subject: str, body: str):
    if not EMAIL_USER or not EMAIL_PASS:
        raise HTTPException(
            status_code=500,
            detail="Email OTP is not configured. Set RESEND_API_KEY/EMAIL_FROM or EMAIL_USER/EMAIL_PASS on the backend."
        )

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = receiver_email

    email_password = EMAIL_PASS.strip()
    smtp_errors = []

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=SMTP_TIMEOUT_SECONDS) as server:
            server.login(EMAIL_USER, email_password)
            server.sendmail(EMAIL_USER, receiver_email, msg.as_string())
            return
    except Exception as e:
        smtp_errors.append(f"SSL/465: {type(e).__name__}: {str(e)}")

    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=SMTP_TIMEOUT_SECONDS) as server:
            server.starttls()
            server.login(EMAIL_USER, email_password)
            server.sendmail(EMAIL_USER, receiver_email, msg.as_string())
            return
    except Exception as e:
        smtp_errors.append(f"STARTTLS/587: {type(e).__name__}: {str(e)}")

    print(f"OTP email failed for {receiver_email}: {' | '.join(smtp_errors)}", flush=True)
    raise HTTPException(
        status_code=500,
        detail="Failed to send OTP email. Render cannot reach SMTP from this service; configure RESEND_API_KEY and EMAIL_FROM."
    )


def send_email_otp(receiver_email: str, otp: str):
    subject, body = build_otp_email(otp)

    if RESEND_API_KEY:
        try:
            if send_email_with_resend(receiver_email, subject, body):
                return
        except Exception as e:
            print(f"OTP email API failed for {receiver_email}: {type(e).__name__}: {str(e)}", flush=True)
            raise HTTPException(
                status_code=500,
                detail="Failed to send OTP email through email API. Check RESEND_API_KEY and EMAIL_FROM."
            )

    send_email_with_smtp(receiver_email, subject, body)


def get_google_redirect_uri(request: Request) -> str:
    if BACKEND_URL:
        return f"{BACKEND_URL.rstrip('/')}/api/auth/google/callback"

    forwarded_proto = request.headers.get("x-forwarded-proto")
    forwarded_host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    if forwarded_proto and forwarded_host:
        return f"{forwarded_proto}://{forwarded_host}/api/auth/google/callback"

    return str(request.url_for("google_auth_callback"))


def create_google_oauth_flow(request: Request, code_verifier: str | None = None) -> Flow:
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET on the backend.",
        )

    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=GOOGLE_SCOPES,
        redirect_uri=get_google_redirect_uri(request),
        code_verifier=code_verifier,
    )


def frontend_redirect(params: dict) -> RedirectResponse:
    return RedirectResponse(f"{FRONTEND_URL}/auth?{urlencode(params)}", status_code=302)


def google_error(message: str, code: str) -> RedirectResponse:
    return frontend_redirect({"error": message, "code": code})


def get_google_user_info(credentials):
    if credentials.id_token:
        idinfo = verify_google_token(credentials.id_token)
        if idinfo:
            return idinfo

    response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {credentials.token}"},
        timeout=15,
    )
    response.raise_for_status()
    profile = response.json()

    return {
        "email": profile.get("email"),
        "name": profile.get("name"),
        "picture": profile.get("picture"),
    }


def upsert_google_user(idinfo: dict):
    email = idinfo.get("email")
    name = idinfo.get("name")
    picture = idinfo.get("picture")

    if not email:
        raise HTTPException(status_code=400, detail="Invalid Google account")

    user = users_collection.find_one({"email": email.lower()})

    if not user:
        user_dict = {
            "name": name,
            "email": email.lower(),
            "password": None,
            "created_at": datetime.utcnow(),
            "provider": "google",
            "picture": picture,
            "plan": "free",
        }
        users_collection.insert_one(user_dict)
        user = users_collection.find_one({"email": email.lower()})

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email.lower()},
        expires_delta=access_token_expires
    )

    return access_token, user


# =========================
# SEND OTP FOR REGISTRATION
# =========================
@router.post("/send-otp")
def send_otp(data: dict):
    email = data.get("email", "").strip().lower()

    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Validate email format
    try:
        valid = validate_email(email, check_deliverability=False)
        email = valid.email
    except EmailNotValidError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Check already registered
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    otp = str(random.randint(100000, 999999))
    expires_at = datetime.utcnow() + timedelta(minutes=5)

    # Delete old OTPs for same email
    otp_collection.delete_many({"email": email})

    otp_collection.insert_one({
        "email": email,
        "otp": otp,
        "expires_at": expires_at,
        "verified": False
    })

    send_email_otp(email, otp)

    return {"message": "OTP sent successfully"}


# =========================
# REGISTER WITH OTP
# =========================
@router.post("/register")
def register_user(user: UserCreate):
    otp = getattr(user, "otp", None)

    if not otp:
        raise HTTPException(status_code=400, detail="OTP is required")

    # Check if user already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    otp_record = otp_collection.find_one({"email": user.email.lower(), "otp": otp})

    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.utcnow() > otp_record["expires_at"]:
        raise HTTPException(status_code=400, detail="OTP expired")

    hashed_password = get_password_hash(user.password)

    user_dict = {
        "name": user.name,
        "email": user.email.lower(),
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "provider": "local",
        "picture": "",
        "plan": "free",
    }

    users_collection.insert_one(user_dict)
    otp_collection.delete_many({"email": user.email.lower()})

    return {"message": "User registered successfully"}


# =========================
# LOGIN
# =========================
@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email
    user = users_collection.find_one({"email": form_data.username.lower()})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If Google account tries password login
    if user.get("provider") == "google" or user.get("password") is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was created with Google. Please login with Google."
        )

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


# =========================
# GOOGLE LOGIN / REGISTER
# =========================
@router.get("/google")
def google_login(request: Request):
    code_verifier = secrets.token_urlsafe(64)
    flow = create_google_oauth_flow(request, code_verifier=code_verifier)
    state = jwt.encode(
        {
            "purpose": "google_oauth",
            "code_verifier": code_verifier,
            "exp": datetime.utcnow() + timedelta(minutes=10),
        },
        OAUTH_STATE_SECRET,
        algorithm=ALGORITHM,
    )
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="select_account",
        state=state,
    )

    return RedirectResponse(authorization_url, status_code=302)


@router.get("/google/callback", name="google_auth_callback")
def google_auth_callback(request: Request, code: str | None = None, state: str | None = None, error: str | None = None):
    if error:
        return google_error("Google authentication was cancelled.", "google_cancelled")

    if not code or not state:
        return google_error("Google authentication failed.", "missing_code_or_state")

    try:
        state_payload = jwt.decode(state, OAUTH_STATE_SECRET, algorithms=[ALGORITHM])
        if state_payload.get("purpose") != "google_oauth":
            raise JWTError("Invalid OAuth state")

        code_verifier = state_payload.get("code_verifier")
        if not code_verifier:
            raise JWTError("Missing OAuth code verifier")

        flow = create_google_oauth_flow(request, code_verifier=code_verifier)
        flow.fetch_token(code=code)
        idinfo = get_google_user_info(flow.credentials)

        if not idinfo:
            return google_error("Invalid Google account.", "invalid_google_account")

        access_token, _ = upsert_google_user(idinfo)
        return frontend_redirect({"token": access_token})
    except JWTError as exc:
        print(f"Google OAuth state error: {repr(exc)}", flush=True)
        return google_error("Google authentication expired. Please try again.", "invalid_state")
    except Exception as exc:
        print(f"Google OAuth callback error: {type(exc).__name__}: {repr(exc)}", flush=True)
        return google_error("Google authentication failed.", "google_callback_failed")


@router.post("/google")
def google_auth(data: GoogleAuthRequest):
    try:
        # Verify Google ID token
        idinfo = verify_google_token(data.token)

        if not idinfo:
            raise HTTPException(status_code=400, detail="Invalid Google token")

        access_token, user = upsert_google_user(idinfo)

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "picture": user.get("picture", "")
            }
        }

    except HTTPException:
        raise
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google authentication failed: {str(e)}")
