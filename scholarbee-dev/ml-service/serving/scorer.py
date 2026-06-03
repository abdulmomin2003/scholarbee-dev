import os
import json
import joblib
import logging
import numpy as np
from typing import Any
from features.extractor import FeatureExtractor

logger = logging.getLogger(__name__)

class ModelNotReadyError(Exception):
    pass

class MLScorer:
    def __init__(self, model_path: str, metadata_path: str):
        self.model_path = model_path
        self.metadata_path = metadata_path
        self.model = None
        self.metadata = {}
        self.load()

    def load(self) -> bool:
        if not os.path.exists(self.model_path) or not os.path.exists(self.metadata_path):
            logger.info("Model files not found. Scorer is not ready.")
            self.model = None
            self.metadata = {}
            return False

        try:
            self.model = joblib.load(self.model_path)
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)
            
            v = self.metadata.get('version', 'unknown')
            auc = self.metadata.get('auc_roc', 'unknown')
            logger.info(f"ML model loaded: version {v}, AUC-ROC {auc}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.model = None
            self.metadata = {}
            return False

    def is_ready(self) -> bool:
        return self.model is not None

    def score(self, candidates: list[dict]) -> list[dict]:
        if not self.is_ready():
            raise ModelNotReadyError("No trained model available.")

        if not candidates:
            return []

        # Build feature matrix
        features_list = [c.get('features', {}) for c in candidates]
        X = np.array([FeatureExtractor.build_scoring_vector(f) for f in features_list])

        # Predict probability of class 1 (engagement)
        try:
            probs = self.model.predict_proba(X)[:, 1]
        except Exception as e:
            logger.error(f"Error during model prediction: {e}")
            raise e

        # Attach scores to candidates and sort
        scored_candidates = []
        for i, candidate in enumerate(candidates):
            scored_candidates.append({
                "program_id": candidate.get('program_id'),
                "ml_score": float(probs[i])
            })
            
        scored_candidates.sort(key=lambda x: x['ml_score'], reverse=True)
        return scored_candidates

    def get_status(self) -> dict:
        return {
            "is_ready": self.is_ready(),
            "model_version": self.metadata.get('version'),
            "trained_at": self.metadata.get('trained_at'),
            "n_training_samples": self.metadata.get('n_samples'),
            "auc_roc": self.metadata.get('auc_roc'),
            "bootstrap_mode": self.metadata.get('bootstrap_mode'),
            "feature_columns": self.metadata.get('feature_columns', [])
        }
