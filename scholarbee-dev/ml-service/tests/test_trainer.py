import pytest
import numpy as np
from unittest.mock import AsyncMock, patch, MagicMock
from training.trainer import ModelTrainer, ModelQualityError
from config import config

@pytest.mark.asyncio
async def test_bootstrap_training():
    # Mock dataset loader
    mock_dataset = MagicMock()
    mock_dataset.bootstrap_mode = True
    mock_dataset.X_train = np.random.rand(60, 14)
    # create deterministic labels to pass the 0.50 AUC test trivially (or fail predictably)
    # Let's make it easily linearly separable so AUC is 1.0
    mock_dataset.y_train = np.array([1]*30 + [0]*30)
    mock_dataset.X_train[:30, 0] = 1.0
    mock_dataset.X_train[30:, 0] = 0.0
    
    mock_dataset.X_test = np.copy(mock_dataset.X_train)
    mock_dataset.y_test = np.copy(mock_dataset.y_train)
    
    mock_dataset.n_samples = 60
    mock_dataset.positive_rate = 0.5
    mock_dataset.feature_columns = ['test']*14
    
    # We will use temp files for testing model save
    import tempfile
    with tempfile.TemporaryDirectory() as tmpdir:
        config.MODEL_PATH = f"{tmpdir}/model.joblib"
        config.METADATA_PATH = f"{tmpdir}/meta.json"
        
        with patch('training.dataset.DatasetLoader.load', return_value=mock_dataset):
            result = await ModelTrainer.train(None, config)
            assert result.bootstrap_mode == True
            assert result.auc_roc >= 0.50
