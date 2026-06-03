import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URI: str
    MONGODB_DB_NAME: str = "scholarbee"
    MODEL_PATH: str = "./models/recommendation_model.joblib"
    METADATA_PATH: str = "./models/model_metadata.json"
    MIN_TRAINING_SAMPLES: int = 200
    MIN_POSITIVE_RATE: float = 0.03
    HOST: str = "0.0.0.0"
    PORT: int = 8002

    class Config:
        env_file = ".env"

config = Settings()
