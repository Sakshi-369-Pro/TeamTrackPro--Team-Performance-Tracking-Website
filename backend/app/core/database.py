"""
MongoDB async connection using Motor.
Provides database instance and collection helpers.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from .config import settings

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_database():
    """Initialize MongoDB connection."""
    global _client, _db
    _client = AsyncIOMotorClient(settings.MONGODB_URI)
    _db = _client[settings.MONGODB_DB_NAME]
    try:
        await _client.admin.command("ping")
        print(f"✅ Connected to MongoDB: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise


async def close_database_connection():
    """Close MongoDB connection."""
    global _client
    if _client:
        _client.close()
        print("🔌 MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_to_database() first.")
    return _db


def get_collection(name: str):
    """Get a specific collection."""
    db = get_database()
    return db[name]
