import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("❌ MONGO_URI not set in environment variables")

client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

# Database
db = client["deepfake_audio_db"]

# Collections
users_collection = db["users"]
predictions_collection = db["predictions"]
otp_collection = db["otp_codes"]

# Ensure unique emails for users
try:
    users_collection.create_index("email", unique=True)
except Exception as e:
    print("MongoDB connection error:", e)
