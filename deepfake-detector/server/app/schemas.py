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
class PredictionBreakdown(BaseModel):
    authenticity: float
    fakeProbability: float
    modelConfidence: float


class PredictionDetails(BaseModel):
    vocalConsistency: str
    backgroundNoise: str
    spectrogram: str


class PredictionResponse(BaseModel):
    id: str
    filename: str
    prediction: str
    confidence: float
    spoof_probability: float
    score: float
    label: str
    summary: str
    breakdown: PredictionBreakdown
    details: PredictionDetails
    timestamp: datetime

class GoogleAuthRequest(BaseModel):
    token: str
