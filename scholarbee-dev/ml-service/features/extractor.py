import numpy as np
from dataclasses import dataclass

FEATURE_COLUMNS = [
    'degree_match', 'field_similarity', 'city_match', 'fee_match',
    'is_partner', 'has_active_deadline', 'program_popularity',
    'student_city_weight', 'student_field_weight',
    'student_degree_weight', 'student_fee_weight',
    'prior_clicks_on_field', 'prior_clicks_on_city', 'position_in_list'
]

class DatasetError(Exception):
    pass

@dataclass
class ValidationReport:
    n_samples: int
    n_features: int
    positive_rate: float
    has_variance: dict[str, bool]

class FeatureExtractor:
    @staticmethod
    def _extract_vector(features: dict) -> np.ndarray:
        vec = []
        for col in FEATURE_COLUMNS:
            val = features.get(col, 0.0)
            if val is None:
                val = 0.0
            elif isinstance(val, bool):
                val = 1.0 if val else 0.0
            vec.append(float(val))
        return np.array(vec)

    @classmethod
    def impression_to_vector(cls, impression: dict) -> np.ndarray:
        features = impression.get('features', {})
        return cls._extract_vector(features)

    @classmethod
    def impressions_to_matrix(cls, impressions: list[dict]) -> tuple[np.ndarray, np.ndarray]:
        valid_impressions = [imp for imp in impressions if imp.get('label') is not None]
        if not valid_impressions:
            raise DatasetError("No valid impressions with non-null labels found.")

        X = np.array([cls.impression_to_vector(imp) for imp in valid_impressions])
        y = np.array([float(imp['label']) for imp in valid_impressions])
        
        return X, y

    @classmethod
    def build_scoring_vector(cls, features: dict) -> np.ndarray:
        return cls._extract_vector(features)

    @classmethod
    def validate(cls, X: np.ndarray, y: np.ndarray) -> ValidationReport:
        n_samples = X.shape[0]
        n_features = X.shape[1]
        positive_rate = float(np.mean(y)) if n_samples > 0 else 0.0
        
        has_variance = {}
        if n_samples > 0:
            variances = np.var(X, axis=0)
            for i, col in enumerate(FEATURE_COLUMNS):
                has_variance[col] = bool(variances[i] > 0)
        else:
            for col in FEATURE_COLUMNS:
                has_variance[col] = False

        return ValidationReport(
            n_samples=n_samples,
            n_features=n_features,
            positive_rate=positive_rate,
            has_variance=has_variance
        )
