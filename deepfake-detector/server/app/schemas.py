from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    otp: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User Schemas ---
class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

# --- Prediction Schemas ---
class PredictionResponse(BaseModel):
    id: str
    filename: str
    prediction: str
    confidence: float
    timestamp: datetime

class GoogleAuthRequest(BaseModel):
    token: str