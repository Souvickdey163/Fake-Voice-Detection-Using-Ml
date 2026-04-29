import os
import random
import smtplib

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email_validator import validate_email, EmailNotValidError
from dotenv import load_dotenv

from ..schemas import UserCreate, UserLogin, Token, GoogleAuthRequest
from ..auth import (
    get_password_hash,
    verify_password,
    verify_google_token,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..database import users_collection, otp_collection

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") or os.getenv("VITE_GOOGLE_CLIENT_ID")


# =========================
# HELPER: SEND EMAIL OTP
# =========================
def send_email_otp(receiver_email: str, otp: str):
    subject = "Your NeuroVoice OTP Code"
    body = f"""
Hello,

Your OTP code is: {otp}

This OTP will expire in 5 minutes.

If you did not request this, please ignore this email.

- NeuroVoice Team
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = receiver_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, receiver_email, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP email: {str(e)}")


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
        valid = validate_email(email)
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
@router.post("/google")
def google_auth(data: GoogleAuthRequest):
    try:
        # Verify Google ID token
        idinfo = verify_google_token(data.token)

        if not idinfo:
            raise HTTPException(status_code=400, detail="Invalid Google token")

        email = idinfo.get("email")
        name = idinfo.get("name")
        picture = idinfo.get("picture")

        if not email:
            raise HTTPException(status_code=400, detail="Invalid Google account")

        # Check if user exists
        user = users_collection.find_one({"email": email.lower()})

        if not user:
            # Auto-register Google user
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

        # Create JWT token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": email.lower()},
            expires_delta=access_token_expires
        )

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
