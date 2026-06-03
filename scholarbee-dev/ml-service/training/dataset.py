import logging
from dataclasses import dataclass
from typing import Any
import numpy as np
from sklearn.model_selection import train_test_split
from features.extractor import FeatureExtractor, DatasetError, FEATURE_COLUMNS

logger = logging.getLogger(__name__)

@dataclass
class DatasetResult:
    X_train: np.ndarray
    X_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray
    n_samples: int
    positive_rate: float
    n_students: int
    n_programs: int
    feature_columns: list[str]
    bootstrap_mode: bool

class DatasetLoader:
    @classmethod
    async def load(cls, db, config: Any) -> DatasetResult:
        logger.info("Loading dataset from MongoDB impressions...")
        
        cursor = db.impressions.find(
            {"label": {"$in": [0, 1]}},
            {"features": 1, "label": 1, "student_id": 1, "program_id": 1, "shown_at": 1, "_id": 0}
        )
        impressions = await cursor.to_list(length=None)
        
        n_samples = len(impressions)
        logger.info(f"Loaded {n_samples} labeled impressions.")

        if n_samples < 50:
            raise DatasetError(f"Only {n_samples} labeled impressions found. Minimum 50 required.")

        X, y = FeatureExtractor.impressions_to_matrix(impressions)
        positive_rate = float(np.mean(y))
        
        students = set(imp.get('student_id') for imp in impressions if imp.get('student_id'))
        programs = set(imp.get('program_id') for imp in impressions if imp.get('program_id'))

        bootstrap_mode = False
        if n_samples < config.MIN_TRAINING_SAMPLES:
            logger.warning(f"Bootstrap mode: {n_samples} samples < {config.MIN_TRAINING_SAMPLES} minimum threshold.")
            bootstrap_mode = True

        if positive_rate < config.MIN_POSITIVE_RATE:
            logger.warning(f"Low positive rate: {positive_rate:.2%} < {config.MIN_POSITIVE_RATE:.2%} threshold.")

        test_size = 0.2
        if n_samples < 100:
            test_size = 0.1

        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, stratify=y, random_state=42
            )
        except ValueError as e:
            logger.warning(f"Stratified split failed (likely only 1 class). Falling back to random split. {e}")
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size, random_state=42
            )

        return DatasetResult(
            X_train=X_train,
            X_test=X_test,
            y_train=y_train,
            y_test=y_test,
            n_samples=n_samples,
            positive_rate=positive_rate,
            n_students=len(students),
            n_programs=len(programs),
            feature_columns=FEATURE_COLUMNS,
            bootstrap_mode=bootstrap_mode
        )
