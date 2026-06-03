import logging
from dataclasses import dataclass
import numpy as np
from sklearn.metrics import roc_auc_score
from features.extractor import FEATURE_COLUMNS

logger = logging.getLogger(__name__)

@dataclass
class EvaluationMetrics:
    auc_roc: float
    precision_at_10: float
    recall_at_10: float
    feature_importance: dict[str, float]
    class_distribution: dict[str, int]

class ModelEvaluator:
    @classmethod
    def evaluate(cls, model, X_test: np.ndarray, y_test: np.ndarray) -> EvaluationMetrics:
        n_samples = len(y_test)
        positives = int(np.sum(y_test))
        negatives = n_samples - positives
        
        class_distribution = {
            "positive": positives,
            "negative": negatives
        }

        # Handle AUC-ROC
        if len(np.unique(y_test)) == 1:
            logger.warning("Only one class present in y_test. AUC-ROC score is not strictly defined, defaulting to 0.5")
            auc_roc = 0.5
        else:
            try:
                y_pred_proba = model.predict_proba(X_test)[:, 1]
                auc_roc = float(roc_auc_score(y_test, y_pred_proba))
            except Exception as e:
                logger.error(f"Error calculating AUC-ROC: {e}")
                auc_roc = 0.5

        # Feature Importance
        feature_importance = {}
        try:
            # Assuming Pipeline with 'classifier' step
            classifier = model.named_steps['classifier']
            if hasattr(classifier, 'coef_'):
                coefs = classifier.coef_[0]
                for i, col in enumerate(FEATURE_COLUMNS):
                    feature_importance[col] = float(abs(coefs[i]))
        except Exception as e:
            logger.warning(f"Could not extract feature importance: {e}")

        # Precision and Recall at 10
        try:
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            indices = np.argsort(y_pred_proba)[::-1]
            
            top_k = min(10, n_samples)
            if top_k > 0:
                top_indices = indices[:top_k]
                top_y = y_test[top_indices]
                
                true_positives_in_top_k = int(np.sum(top_y))
                precision_at_10 = true_positives_in_top_k / top_k
                recall_at_10 = true_positives_in_top_k / positives if positives > 0 else 0.0
            else:
                precision_at_10 = 0.0
                recall_at_10 = 0.0
        except Exception as e:
            logger.error(f"Error calculating ranking metrics: {e}")
            precision_at_10 = 0.0
            recall_at_10 = 0.0

        return EvaluationMetrics(
            auc_roc=auc_roc,
            precision_at_10=precision_at_10,
            recall_at_10=recall_at_10,
            feature_importance=feature_importance,
            class_distribution=class_distribution
        )
