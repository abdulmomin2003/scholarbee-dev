from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

class MongoDB:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

    @classmethod
    async def connect(cls, uri: str, db_name: str):
        try:
            logger.info(f"Connecting to MongoDB...")
            cls.client = AsyncIOMotorClient(uri)
            cls.db = cls.client[db_name]
            # Ping the database
            await cls.db.command('ping')
            logger.info("Successfully connected to MongoDB.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e

    @classmethod
    async def close(cls):
        if cls.client is not None:
            cls.client.close()
            logger.info("MongoDB connection closed.")

    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        if cls.db is None:
            raise Exception("Database not initialized. Call connect() first.")
        return cls.db

db = MongoDB()
