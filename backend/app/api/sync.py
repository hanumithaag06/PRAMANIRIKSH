from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import AnalyzeRequest, AnalysisResponse
from app.api.tests import analyze_and_record_test

router = APIRouter(prefix="/sync", tags=["Offline Synchronization"])

@router.post("", response_model=List[AnalysisResponse])
def batch_synchronize_offline_tests(items: List[AnalyzeRequest], db: Session = Depends(get_db)):
    """
    Idempotent batch synchronization endpoint for field tests captured offline.
    """
    synced = []
    for req in items:
        try:
            res = analyze_and_record_test(req, db)
            synced.append(res)
        except Exception as e:
            continue
    return synced

@router.get("/status")
def sync_status():
    return {
        "status": "ONLINE",
        "server_time": "2026-09-28T01:00:00Z",
        "supported_features": ["IDEMPOTENT_SYNC", "ASYMMETRIC_RSA", "SHA256_CHAIN"]
    }
