from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth_routes, predict_routes, history_routes, user_routes
import os

app = FastAPI(title="Deepfake Audio Detection API")

# =========================
# CORS CONFIG
# =========================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://fake-voice-detection-using-ml.vercel.app",
]

# Add production frontend if available.
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins.append(frontend_url.rstrip("/"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ROUTES
# =========================
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(predict_routes.router)
app.include_router(history_routes.router)

# =========================
# ROOT
# =========================
@app.get("/")
def read_root():
    return {"message": "Deepfake Audio Detection API is running 🚀"}


@app.get("/health")
def health_check():
    return {"ok": True, "status": "running"}
