import numpy as np
from features.extractor import FeatureExtractor, DatasetError
import pytest

def test_impression_to_vector():
    impression = {
        "features": {
            "degree_match": 1,
            "field_similarity": 0.8,
            "is_partner": True
        }
    }
    vec = FeatureExtractor.impression_to_vector(impression)
    assert vec.shape == (14,)
    assert vec[0] == 1.0
    assert vec[1] == 0.8
    assert vec[4] == 1.0 # is_partner

def test_impressions_to_matrix():
    impressions = [
        {"label": 1, "features": {"degree_match": 1}},
        {"label": 0, "features": {"degree_match": 0}},
        {"features": {"degree_match": 1}} # No label, should be filtered
    ]
    X, y = FeatureExtractor.impressions_to_matrix(impressions)
    assert X.shape == (2, 14)
    assert y.shape == (2,)
    assert y[0] == 1.0
    assert y[1] == 0.0

def test_empty_dataset_error():
    with pytest.raises(DatasetError):
        FeatureExtractor.impressions_to_matrix([{"features": {}}])
