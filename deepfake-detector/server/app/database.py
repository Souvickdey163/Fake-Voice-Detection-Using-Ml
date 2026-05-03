import os

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB_NAME", "deepfake_audio_db")

_client = None
_db = None
_indexes_ready = False


def get_client():
    global _client

    if _client is None:
        if not MONGO_URI:
            raise RuntimeError("MONGO_URI not set in environment variables")

        _client = MongoClient(
            MONGO_URI,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )

    return _client


def get_db():
    global _db

    if _db is None:
        _db = get_client()[DB_NAME]

    return _db


class LazyCollection:
    def __init__(self, name):
        self.name = name

    @property
    def collection(self):
        return get_db()[self.name]

    def __getattr__(self, attr):
        return getattr(self.collection, attr)


def ensure_indexes():
    global _indexes_ready

    if _indexes_ready:
        return

    users_collection.create_index("email", unique=True)
    _indexes_ready = True


users_collection = LazyCollection("users")
predictions_collection = LazyCollection("predictions")
otp_collection = LazyCollection("otp_codes")
