import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import config
from database.mongo import MongoDB
from serving.scorer import MLScorer
from training.trainer import ModelTrainer, ModelQualityError
from features.extractor import DatasetError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global state
scorer = MLScorer(config.MODEL_PATH, config.METADATA_PATH)
is_training = False
last_training_error = None
training_lock = asyncio.Lock()
scheduler = AsyncIOScheduler()

async def scheduled_training():
    logger.info("Running scheduled weekly training job...")
    if not is_training:
        try:
            db = MongoDB.get_database()
            result = await ModelTrainer.train(db, config)
            scorer.load()
            global last_training_error
            last_training_error = None
            logger.info(f"Scheduled training succeeded. Version: {result.version}")
        except Exception as e:
            last_training_error = str(e)
            logger.error(f"Scheduled training failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up ML Microservice...")
    await MongoDB.connect(config.MONGODB_URI, config.MONGODB_DB_NAME)
    
    scheduler.add_job(scheduled_training, 'interval', days=7)
    scheduler.start()
    logger.info("Weekly training schedule started.")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ML Microservice...")
    scheduler.shutdown()
    await MongoDB.close()

app = FastAPI(title="ScholarBee ML Service", lifespan=lifespan)

# Models
class Candidate(BaseModel):
    program_id: str
    features: dict

class ScoreRequest(BaseModel):
    student_id: str
    candidates: list[Candidate]

class TrainRequest(BaseModel):
    force: bool = False

@app.get("/health")
async def health_check():
    status = scorer.get_status()
    return {
        "status": "ok",
        "model_loaded": status["is_ready"],
        "model_version": status["model_version"],
        "bootstrap_mode": status["bootstrap_mode"],
        "auc_roc": status["auc_roc"],
        "n_training_samples": status["n_training_samples"],
        "is_training": is_training,
        "last_training_error": last_training_error
    }

@app.post("/score")
async def score_candidates(req: ScoreRequest):
    if not scorer.is_ready():
        return JSONResponse(
            status_code=503,
            content={
                "error": "model_not_ready",
                "message": "No trained model available. Trigger POST /train first.",
                "suggestion": "Run the warm-up data generator then POST /train"
            }
        )

    try:
        candidates_dict = [{"program_id": c.program_id, "features": c.features} for c in req.candidates]
        scored_candidates = scorer.score(candidates_dict)
        return {
            "student_id": req.student_id,
            "scored_candidates": scored_candidates,
            "model_version": scorer.metadata.get("version"),
            "bootstrap_mode": scorer.metadata.get("bootstrap_mode"),
            "scored_at": datetime.utcnow().isoformat() + "Z"
        }
    except Exception as e:
        logger.error(f"Error during scoring: {e}")
        raise HTTPException(status_code=500, detail="Internal scoring error.")

async def run_training_task(force: bool):
    global is_training, last_training_error
    async with training_lock:
        is_training = True
        try:
            db = MongoDB.get_database()
            result = await ModelTrainer.train(db, config)
            scorer.load()
            last_training_error = None
            logger.info(f"Training task completed successfully. New version: {result.version}")
        except Exception as e:
            last_training_error = str(e)
            logger.error(f"Training task failed: {e}")
        finally:
            is_training = False

@app.post("/train")
async def trigger_training(req: TrainRequest, background_tasks: BackgroundTasks):
    global is_training
    if is_training:
        return JSONResponse(status_code=409, content={"error": "already_training"})

    db = MongoDB.get_database()

    # Check data status if not forced
    if not req.force:
        labeled_count = await db.impressions.count_documents({"label": {"$in": [0, 1]}})
        if labeled_count < 50:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "insufficient_data",
                    "message": f"Only {labeled_count} labeled impressions found. Minimum 50 required.",
                    "suggestion": "Run the warm-up data generator."
                }
            )

    background_tasks.add_task(run_training_task, req.force)
    return {"status": "training_started", "message": "Training pipeline triggered in the background."}

@app.get("/train/status")
async def training_status():
    status = scorer.get_status()
    return {
        "is_training": is_training,
        "last_trained_at": status["trained_at"],
        "last_auc_roc": status["auc_roc"],
        "bootstrap_mode": status["bootstrap_mode"],
        "n_training_samples": status["n_training_samples"],
        "model_version": status["model_version"],
        "last_error": last_training_error
    }

@app.get("/data/status")
async def data_status():
    try:
        db = MongoDB.get_database()
        
        total = await db.impressions.count_documents({})
        labeled = await db.impressions.count_documents({"label": {"$in": [0, 1]}})
        positives = await db.impressions.count_documents({"label": 1})
        negatives = await db.impressions.count_documents({"label": 0})
        
        positive_rate = positives / labeled if labeled > 0 else 0.0
        
        unique_students = len(await db.impressions.distinct("student_id"))
        unique_programs = len(await db.impressions.distinct("program_id"))
        
        ml_ready = (
            labeled >= 500 and
            0.03 <= positive_rate <= 0.60 and
            unique_students >= 20 and
            unique_programs >= 10
        )
        
        # Bootstrap readiness logic
        if not ml_ready and labeled >= 50:
            ml_ready = True # Bootstrap mode allowed
            
        return {
            "total_impressions": total,
            "labeled_impressions": labeled,
            "positive_labels": positives,
            "negative_labels": negatives,
            "positive_rate": positive_rate,
            "unique_students": unique_students,
            "unique_programs": unique_programs,
            "ml_ready": ml_ready
        }
    except Exception as e:
        logger.error(f"Error fetching data status: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch data status")
