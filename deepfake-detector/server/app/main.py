from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth_routes, predict_routes, history_routes, user_routes

app = FastAPI(title="Deepfake Audio Detection API")

import os

# Configure CORS for local development with React and Production Vercel App
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", frontend_url], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(predict_routes.router)
app.include_router(history_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Deepfake Audio Detection API"}
