import pytest
from serving.scorer import MLScorer, ModelNotReadyError

def test_scorer_not_ready():
    scorer = MLScorer("invalid_path.joblib", "invalid_meta.json")
    assert scorer.is_ready() == False
    
    with pytest.raises(ModelNotReadyError):
        scorer.score([{"program_id": "123"}])

def test_empty_candidates():
    # Even if ready, empty list should return empty list
    scorer = MLScorer("invalid_path.joblib", "invalid_meta.json")
    scorer.model = "dummy" # bypass ready check
    assert scorer.score([]) == []
