import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)

# Database
db = client["deepfake_audio_db"]

# Collections
users_collection = db["users"]
predictions_collection = db["predictions"]
otp_collection = db["otp_codes"]

# Ensure unique emails for users
users_collection.create_index("email", unique=True)
