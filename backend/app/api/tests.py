import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, KitProfile, TestSession, TestResult, EvidenceRecord, AuditEvent
from app.schemas.schemas import AnalyzeRequest, AnalysisResponse
from app.cv.pipeline import CVPipeline
from app.evidence.hashing import EvidenceHasher
from app.evidence.signing import DigitalSigner
from app.config import settings

router = APIRouter(prefix="/tests", tags=["Test Analysis & Records"])

@router.post("/analyze", response_model=AnalysisResponse)
def analyze_and_record_test(req: AnalyzeRequest, db: Session = Depends(get_db)):
    # 1. Fetch active kit profile
    kit = db.query(KitProfile).filter((KitProfile.id == req.kit_id) | (KitProfile.kit_code == req.kit_id)).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Selected Kit Profile not found.")
        
    # 2. Fetch or default operator
    operator = db.query(User).filter(User.id == req.operator_id).first()
    if not operator:
        operator = db.query(User).first()
        if not operator:
            raise HTTPException(status_code=400, detail="Operator record not found.")

    # 3. Run Computer Vision Pipeline (Quality Gate -> Calibration -> Features -> Classifier)
    kit_dict = {
        "kit_code": kit.kit_code,
        "test_type": kit.test_type,
        "target_substances": kit.target_substances,
        "reference_card_profile": kit.reference_card_profile,
        "classification_profile": kit.classification_profile
    }
    
    cv_out = CVPipeline.process_field_image(req.base64_image, kit_dict)
    
    quality = cv_out["quality_result"]
    calibration = cv_out["calibration_result"]
    features = cv_out["features"]
    classification = cv_out["classification"]

    # 4. Generate unique Test ID & Session
    seq_count = db.query(EvidenceRecord).count() + 1
    unique_suffix = uuid.uuid4().hex[:4].upper()
    test_id = f"TEST-2026-{datetime.utcnow().strftime('%m%d')}-{seq_count:03d}-{unique_suffix}"
    now = datetime.utcnow()

    t_session = TestSession(
        test_id=test_id,
        operator_id=operator.id,
        kit_profile_id=kit.id,
        kit_profile_version=kit.version,
        created_at=now
    )
    db.add(t_session)
    db.commit()

    # 5. Store Test Result
    t_result = TestResult(
        test_id=test_id,
        presumptive_result=classification["category"],
        target_substance=classification["detected_substance"],
        confidence_score=classification["confidence_score"],
        quality_score=quality["quality_score"],
        quality_details=quality,
        calibration_details=calibration or {},
        color_analysis=features or {},
        explanation=classification,
        cv_pipeline_version=settings.CV_PIPELINE_VERSION,
        classifier_version=settings.CLASSIFIER_VERSION,
        created_at=now
    )
    db.add(t_result)

    # 6. Generate Cryptographic Evidence Record & Sign Payload
    image_sha256 = EvidenceHasher.calculate_image_hash(req.base64_image)
    
    metadata_dict = {
        "test_id": test_id,
        "operator_id": operator.id,
        "operator_name": operator.full_name,
        "kit_code": kit.kit_code,
        "kit_version": kit.version,
        "presumptive_result": classification["category"],
        "target_substance": classification["detected_substance"],
        "confidence_score": classification["confidence_score"],
        "quality_score": quality["quality_score"],
        "timestamp": now.isoformat(),
        "latitude": req.latitude,
        "longitude": req.longitude,
        "gps_accuracy_m": req.gps_accuracy_m,
        "cv_pipeline_version": settings.CV_PIPELINE_VERSION,
        "classifier_version": settings.CLASSIFIER_VERSION
    }
    
    metadata_hash = EvidenceHasher.calculate_metadata_hash(metadata_dict)
    
    # Get previous record for tamper-evident hash chain linking
    last_record = db.query(EvidenceRecord).order_by(EvidenceRecord.sequence_number.desc()).first()
    prev_hash = last_record.evidence_hash if last_record else None
    
    evidence_hash = EvidenceHasher.calculate_evidence_hash(image_sha256, metadata_hash, prev_hash)
    
    # Asymmetrically sign evidence fingerprint using officer's private RSA key
    digital_sig = DigitalSigner.sign_payload(evidence_hash, operator.private_key_pem)

    ev_record = EvidenceRecord(
        test_id=test_id,
        operator_id=operator.id,
        latitude=req.latitude,
        longitude=req.longitude,
        gps_accuracy_m=req.gps_accuracy_m,
        location_acquired_at=now if req.latitude else None,
        image_data_base64=req.base64_image,
        image_sha256=image_sha256,
        metadata_hash=metadata_hash,
        evidence_hash=evidence_hash,
        previous_evidence_hash=prev_hash,
        sequence_number=seq_count,
        digital_signature=digital_sig,
        signer_public_key=operator.public_key_pem,
        is_tampered_demo=False,
        created_at=now
    )
    db.add(ev_record)

    # 7. Audit Event
    audit = AuditEvent(
        test_id=test_id,
        event_type="TEST_CREATED_AND_SIGNED",
        actor_id=operator.id,
        details={"presumptive_result": classification["category"], "evidence_hash": evidence_hash},
        timestamp=now
    )
    db.add(audit)
    db.commit()

    return {
        "test_id": test_id,
        "timestamp": now.isoformat(),
        "operator_id": operator.id,
        "operator_name": operator.full_name,
        "kit_name": kit.name,
        "kit_version": kit.version,
        "presumptive_result": classification["category"],
        "target_substance": classification["detected_substance"],
        "confidence_score": classification["confidence_score"],
        "quality_result": quality,
        "calibration_result": calibration or {
            "calibration_successful": False, "lighting_condition": "N/A", "estimated_color_cast": "N/A",
            "transformation_matrix": [[1,0,0],[0,1,0],[0,0,1]], "patches_analyzed": [],
            "average_delta_e_before": 0.0, "average_delta_e_after": 0.0
        },
        "explanation": classification,
        "image_sha256": image_sha256,
        "metadata_hash": metadata_hash,
        "evidence_hash": evidence_hash,
        "previous_evidence_hash": prev_hash,
        "sequence_number": seq_count,
        "digital_signature": digital_sig,
        "signer_public_key": operator.public_key_pem,
        "cv_pipeline_version": settings.CV_PIPELINE_VERSION,
        "classifier_version": settings.CLASSIFIER_VERSION,
        "is_tampered_demo": False
    }

@router.get("")
def list_tests(
    result: Optional[str] = None,
    operator_id: Optional[str] = None,
    kit_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(TestSession)
    if operator_id:
        query = query.filter(TestSession.operator_id == operator_id)
    if kit_id:
        query = query.filter(TestSession.kit_profile_id == kit_id)
        
    sessions = query.order_by(TestSession.created_at.desc()).all()
    
    results_list = []
    for s in sessions:
        r = s.result
        e = s.evidence
        if not r or not e:
            continue
            
        if result and r.presumptive_result != result.upper():
            continue
            
        results_list.append({
            "test_id": s.test_id,
            "timestamp": s.created_at.isoformat(),
            "operator_name": s.operator.full_name if s.operator else "Unknown",
            "kit_name": s.kit_profile.name if s.kit_profile else "Unknown Kit",
            "presumptive_result": r.presumptive_result,
            "target_substance": r.target_substance,
            "confidence_score": r.confidence_score,
            "quality_score": r.quality_score,
            "evidence_hash": e.evidence_hash,
            "is_tampered_demo": e.is_tampered_demo,
            "sequence_number": e.sequence_number,
            "latitude": e.latitude,
            "longitude": e.longitude
        })
    return results_list

@router.get("/{test_id}")
def get_test_detail(test_id: str, db: Session = Depends(get_db)):
    session = db.query(TestSession).filter(TestSession.test_id == test_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Test record not found")
        
    r = session.result
    e = session.evidence
    k = session.kit_profile
    u = session.operator

    return {
        "test_id": session.test_id,
        "timestamp": session.created_at.isoformat(),
        "operator_id": u.id if u else "N/A",
        "operator_name": u.full_name if u else "N/A",
        "badge_id": u.badge_id if u else "N/A",
        "department": u.department if u else "N/A",
        "kit_id": k.id if k else "N/A",
        "kit_code": k.kit_code if k else "N/A",
        "kit_name": k.name if k else "N/A",
        "kit_version": session.kit_profile_version,
        "presumptive_result": r.presumptive_result,
        "target_substance": r.target_substance,
        "confidence_score": r.confidence_score,
        "quality_score": r.quality_score,
        "quality_details": r.quality_details,
        "calibration_details": r.calibration_details,
        "color_analysis": r.color_analysis,
        "explanation": r.explanation,
        "image_data_base64": e.image_data_base64,
        "image_sha256": e.image_sha256,
        "metadata_hash": e.metadata_hash,
        "evidence_hash": e.evidence_hash,
        "previous_evidence_hash": e.previous_evidence_hash,
        "sequence_number": e.sequence_number,
        "digital_signature": e.digital_signature,
        "signer_public_key": e.signer_public_key,
        "latitude": e.latitude,
        "longitude": e.longitude,
        "gps_accuracy_m": e.gps_accuracy_m,
        "cv_pipeline_version": r.cv_pipeline_version,
        "classifier_version": r.classifier_version,
        "is_tampered_demo": e.is_tampered_demo
    }

@router.post("/{test_id}/tamper-demo")
def tamper_test_record_demo(test_id: str, db: Session = Depends(get_db)):
    """
    Simulates deliberate record tampering in a controlled demo environment.
    Sets is_tampered_demo = True on the evidence record so verification will fail.
    """
    evidence = db.query(EvidenceRecord).filter(EvidenceRecord.test_id == test_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence record not found")
        
    evidence.is_tampered_demo = True
    
    # Audit tampering event
    audit = AuditEvent(
        test_id=test_id,
        event_type="DEMO_RECORD_TAMPERED",
        actor_id=evidence.operator_id,
        details={"reason": "Simulated tampering for integrity check demo"},
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()

    return {"message": f"Record {test_id} has been intentionally tampered with for demonstration.", "test_id": test_id, "is_tampered_demo": True}
