from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    username: str
    full_name: str
    badge_id: str
    role: str
    department: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str
    public_key_pem: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class KitProfileBase(BaseModel):
    kit_code: str
    name: str
    manufacturer: str
    test_type: str
    version: str
    is_active: bool
    target_substances: List[str]
    reference_card_profile: Dict[str, Any]
    classification_profile: Dict[str, Any]
    instructions: Optional[str] = None
    source_reference: Optional[str] = None

class KitProfileResponse(KitProfileBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class QualityResult(BaseModel):
    quality_score: float
    blur_score: float
    blur_ok: bool
    brightness_score: float
    exposure_ok: bool
    glare_detected: bool
    glare_ok: bool
    reference_card_detected: bool
    roi_detected: bool
    classification_allowed: bool
    rejection_reasons: List[str]

class ColorPatchMatch(BaseModel):
    patch_name: str
    expected_rgb: List[int]
    observed_rgb: List[int]
    calibrated_rgb: List[int]
    delta_e: float

class CalibrationResult(BaseModel):
    calibration_successful: bool
    lighting_condition: str
    estimated_color_cast: str
    transformation_matrix: List[List[float]]
    patches_analyzed: List[ColorPatchMatch]
    average_delta_e_before: float
    average_delta_e_after: float

class ClassificationExplanation(BaseModel):
    category: str # POSITIVE, NEGATIVE, INCONCLUSIVE, RETAKE_REQUIRED
    detected_substance: Optional[str]
    confidence_score: float
    confidence_level: str # HIGH, MEDIUM, LOW, N/A
    color_distance: float
    observed_hue_range: str
    observed_lab: List[float]
    match_quality: str
    disclaimer: str = "PRESUMPTIVE FIELD-TEST RESULT ONLY. DOES NOT REPLACE CONFIRMATORY LABORATORY TESTING."

class AnalyzeRequest(BaseModel):
    base64_image: str
    kit_id: str
    operator_id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    gps_accuracy_m: Optional[float] = None

class AnalysisResponse(BaseModel):
    test_id: str
    timestamp: str
    operator_id: str
    operator_name: str
    kit_name: str
    kit_version: str
    presumptive_result: str
    target_substance: Optional[str]
    confidence_score: float
    quality_result: QualityResult
    calibration_result: CalibrationResult
    explanation: ClassificationExplanation
    image_sha256: str
    metadata_hash: str
    evidence_hash: str
    previous_evidence_hash: Optional[str]
    sequence_number: int
    digital_signature: str
    signer_public_key: str
    cv_pipeline_version: str
    classifier_version: str
    is_tampered_demo: bool = False

class VerificationResponse(BaseModel):
    test_id: str
    is_valid: bool
    image_hash_valid: bool
    metadata_hash_valid: bool
    evidence_hash_valid: bool
    signature_valid: bool
    chain_valid: bool
    status_label: str # VERIFIED or INTEGRITY CHECK FAILED
    details: Dict[str, Any]
    timeline: List[Dict[str, Any]]
    verified_at: str

class KnowledgeQueryRequest(BaseModel):
    query: str

class KnowledgeQueryResult(BaseModel):
    query: str
    answer: str
    document_title: str
    publisher: str
    section: str
    document_version: str
    citation: str
    confidence_score: float
