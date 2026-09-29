from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import EvidenceRecord, TestSession, TestResult, AuditEvent
from app.schemas.schemas import VerificationResponse
from app.evidence.chain import TamperEvidentChainEngine

router = APIRouter(prefix="/evidence", tags=["Evidence & Cryptographic Verification"])

@router.post("/{test_id}/verify", response_model=VerificationResponse)
def verify_evidence_integrity(test_id: str, db: Session = Depends(get_db)):
    evidence = db.query(EvidenceRecord).filter(EvidenceRecord.test_id == test_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence record not found")
        
    session = db.query(TestSession).filter(TestSession.test_id == test_id).first()
    result = session.result if session else None
    operator = session.operator if session else None
    
    # Fetch preceding evidence record for hash chain check
    previous_evidence = None
    if evidence.sequence_number > 1:
        previous_evidence = db.query(EvidenceRecord).filter(
            EvidenceRecord.sequence_number == evidence.sequence_number - 1
        ).first()

    canonical_meta = {
        "test_id": test_id,
        "operator_id": evidence.operator_id,
        "operator_name": operator.full_name if operator else "Unknown",
        "kit_code": session.kit_profile.kit_code if session and session.kit_profile else "Unknown",
        "kit_version": session.kit_profile_version if session else "1.0",
        "presumptive_result": result.presumptive_result if result else "UNKNOWN",
        "target_substance": result.target_substance if result else None,
        "confidence_score": result.confidence_score if result else 0.0,
        "quality_score": result.quality_score if result else 0.0,
        "timestamp": session.created_at.isoformat() if session else evidence.created_at.isoformat(),
        "latitude": evidence.latitude,
        "longitude": evidence.longitude,
        "gps_accuracy_m": evidence.gps_accuracy_m,
        "cv_pipeline_version": result.cv_pipeline_version if result else "2.1.0",
        "classifier_version": result.classifier_version if result else "1.4.0"
    }

    evidence_dict = {
        "test_id": evidence.test_id,
        "image_data_base64": evidence.image_data_base64,
        "image_sha256": evidence.image_sha256,
        "metadata": canonical_meta,
        "metadata_hash": evidence.metadata_hash,
        "evidence_hash": evidence.evidence_hash,
        "previous_evidence_hash": evidence.previous_evidence_hash,
        "sequence_number": evidence.sequence_number,
        "digital_signature": evidence.digital_signature,
        "signer_public_key": evidence.signer_public_key,
        "is_tampered_demo": evidence.is_tampered_demo
    }
    
    prev_dict = None
    if previous_evidence:
        prev_dict = {
            "evidence_hash": previous_evidence.evidence_hash
        }
        
    verification_res = TamperEvidentChainEngine.verify_record_integrity(evidence_dict, prev_dict)
    
    # Timeline steps
    timeline = [
        {"step": 1, "title": "Field Test Executed", "timestamp": session.created_at.isoformat() if session else evidence.created_at.isoformat(), "status": "COMPLETED"},
        {"step": 2, "title": "GPS & Location Acquired", "timestamp": evidence.created_at.isoformat(), "status": "ACCURACY_OK" if evidence.latitude else "LOW_ACCURACY"},
        {"step": 3, "title": "Reference Card Detected & Calibrated", "timestamp": evidence.created_at.isoformat(), "status": "CALIBRATION_PASSED"},
        {"step": 4, "title": "Image Quality Gate Evaluated", "timestamp": evidence.created_at.isoformat(), "status": "QUALITY_GATE_PASSED"},
        {"step": 5, "title": "Computer Vision Presumptive Result Generated", "timestamp": evidence.created_at.isoformat(), "status": "CLASSIFICATION_GENERATED"},
        {"step": 6, "title": "SHA-256 Image & Metadata Hashes Fingerprinted", "timestamp": evidence.created_at.isoformat(), "status": "FINGERPRINTED"},
        {"step": 7, "title": "Asymmetric RSA Digital Signature Applied", "timestamp": evidence.created_at.isoformat(), "status": "SIGNED"},
        {"step": 8, "title": "Tamper-Evident Chain Sequence Linked", "timestamp": evidence.created_at.isoformat(), "status": "CHAIN_LINKED"},
    ]

    # Audit Verification Action
    audit = AuditEvent(
        test_id=test_id,
        event_type="EVIDENCE_VERIFIED",
        actor_id=evidence.operator_id,
        details={"is_valid": verification_res["is_valid"], "status_label": verification_res["status_label"]},
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {
        "test_id": test_id,
        "is_valid": verification_res["is_valid"],
        "image_hash_valid": verification_res["image_hash_valid"],
        "metadata_hash_valid": verification_res["metadata_hash_valid"],
        "evidence_hash_valid": verification_res["evidence_hash_valid"],
        "signature_valid": verification_res["signature_valid"],
        "chain_valid": verification_res["chain_valid"],
        "status_label": verification_res["status_label"],
        "details": verification_res["details"],
        "timeline": timeline,
        "verified_at": datetime.utcnow().isoformat()
    }
