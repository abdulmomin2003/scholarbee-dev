import logging
import json
from datetime import datetime
import joblib
from dataclasses import dataclass
from typing import Any
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

from training.dataset import DatasetLoader
from training.evaluator import ModelEvaluator

logger = logging.getLogger(__name__)

class ModelQualityError(Exception):
    pass

@dataclass
class TrainingResult:
    version: str
    trained_at: str
    n_samples: int
    positive_rate: float
    auc_roc: float
    precision_at_10: float
    bootstrap_mode: bool
    feature_columns: list[str]
    best_params: dict[str, Any]

class ModelTrainer:
    @classmethod
    async def train(cls, db, config: Any) -> TrainingResult:
        logger.info("Starting model training process...")

        # 1. Load dataset
        dataset = await DatasetLoader.load(db, config)

        # 2. Select model and train
        if dataset.bootstrap_mode:
            logger.info("Training in bootstrap mode using simple LogisticRegression.")
            clf = LogisticRegression(
                C=1.0, 
                max_iter=500, 
                class_weight='balanced', 
                random_state=42, 
                solver='liblinear'
            )
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', clf)
            ])
            pipeline.fit(dataset.X_train, dataset.y_train)
            best_params = {}
        else:
            logger.info("Training in production mode using GridSearchCV.")
            base_clf = LogisticRegression(class_weight='balanced', random_state=42, max_iter=500)
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('classifier', base_clf)
            ])
            param_grid = {
                'classifier__C': [0.01, 0.1, 1.0, 10.0],
                'classifier__penalty': ['l1', 'l2'],
                'classifier__solver': ['liblinear']
            }
            grid_search = GridSearchCV(
                pipeline, 
                param_grid=param_grid, 
                cv=min(5, max(2, dataset.n_samples // 100)), 
                scoring='roc_auc', 
                n_jobs=-1
            )
            grid_search.fit(dataset.X_train, dataset.y_train)
            pipeline = grid_search.best_estimator_
            best_params = grid_search.best_params_
            logger.info(f"Best params found: {best_params}")

        # 3. Evaluate
        logger.info("Evaluating trained model...")
        metrics = ModelEvaluator.evaluate(pipeline, dataset.X_test, dataset.y_test)
        logger.info(f"Evaluation metrics: {metrics}")

        # 4. Quality gate
        if dataset.bootstrap_mode:
            if metrics.auc_roc < 0.50:
                raise ModelQualityError(f"Bootstrap model failed quality gate: AUC {metrics.auc_roc:.3f} < 0.50")
            logger.info("Bootstrap model trained — improves as data grows.")
        else:
            if metrics.auc_roc < 0.60:
                raise ModelQualityError(f"Production model failed quality gate: AUC {metrics.auc_roc:.3f} < 0.60")
            logger.info("Production model passed quality gate.")

        # 5. Save model
        version = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        trained_at = datetime.utcnow().isoformat() + "Z"
        
        logger.info(f"Saving model version {version} to {config.MODEL_PATH}...")
        joblib.dump(pipeline, config.MODEL_PATH)
        
        metadata = {
            "version": version,
            "trained_at": trained_at,
            "n_samples": dataset.n_samples,
            "positive_rate": dataset.positive_rate,
            "auc_roc": metrics.auc_roc,
            "precision_at_10": metrics.precision_at_10,
            "bootstrap_mode": dataset.bootstrap_mode,
            "feature_columns": dataset.feature_columns,
            "best_params": best_params,
            "feature_importance": metrics.feature_importance
        }
        
        with open(config.METADATA_PATH, "w") as f:
            json.dump(metadata, f, indent=2)

        # 6. Return TrainingResult (app will handle hot reload of Scorer)
        return TrainingResult(
            version=version,
            trained_at=trained_at,
            n_samples=dataset.n_samples,
            positive_rate=dataset.positive_rate,
            auc_roc=metrics.auc_roc,
            precision_at_10=metrics.precision_at_10,
            bootstrap_mode=dataset.bootstrap_mode,
            feature_columns=dataset.feature_columns,
            best_params=best_params
        )
