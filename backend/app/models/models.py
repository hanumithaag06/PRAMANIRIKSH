import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    badge_id = Column(String, nullable=False)
    role = Column(String, default="OPERATOR") # OPERATOR, SUPERVISOR, AUDITOR, ADMIN
    department = Column(String, default="Narcotics Control Bureau (NCB)")
    password_hash = Column(String, nullable=False)
    public_key_pem = Column(Text, nullable=True)
    private_key_pem = Column(Text, nullable=True) # Stored encrypted in prod, plain for prototype key signing demo
    created_at = Column(DateTime, default=datetime.utcnow)

class KitProfile(Base):
    __tablename__ = "kit_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    kit_code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    manufacturer = Column(String, nullable=False)
    test_type = Column(String, nullable=False) # e.g. Marquis Reagent, Cobalt Thiocyanate, Duquenois-Levine
    version = Column(String, default="1.0")
    is_active = Column(Boolean, default=True)
    target_substances = Column(JSON, nullable=False) # list of targeted drugs
    reference_card_profile = Column(JSON, nullable=False) # standard patch RGB/LAB values
    classification_profile = Column(JSON, nullable=False) # color ranges & thresholds
    instructions = Column(Text, nullable=True)
    source_reference = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class TestSession(Base):
    __tablename__ = "test_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    test_id = Column(String, unique=True, index=True, nullable=False)
    operator_id = Column(String, ForeignKey("users.id"), nullable=False)
    kit_profile_id = Column(String, ForeignKey("kit_profiles.id"), nullable=False)
    kit_profile_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    operator = relationship("User")
    kit_profile = relationship("KitProfile")
    result = relationship("TestResult", uselist=False, back_populates="session")
    evidence = relationship("EvidenceRecord", uselist=False, back_populates="session")

class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    test_id = Column(String, ForeignKey("test_sessions.test_id"), nullable=False)
    presumptive_result = Column(String, nullable=False) # POSITIVE, NEGATIVE, INCONCLUSIVE, RETAKE_REQUIRED
    target_substance = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=False)
    quality_score = Column(Float, nullable=False)
    quality_details = Column(JSON, nullable=False)
    calibration_details = Column(JSON, nullable=False)
    color_analysis = Column(JSON, nullable=False)
    explanation = Column(JSON, nullable=False)
    cv_pipeline_version = Column(String, nullable=False)
    classifier_version = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("TestSession", back_populates="result")

class EvidenceRecord(Base):
    __tablename__ = "evidence_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    test_id = Column(String, ForeignKey("test_sessions.test_id"), nullable=False)
    operator_id = Column(String, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    gps_accuracy_m = Column(Float, nullable=True)
    location_acquired_at = Column(DateTime, nullable=True)
    image_data_base64 = Column(Text, nullable=False) # Data URI or stored image ref
    image_sha256 = Column(String, nullable=False)
    metadata_hash = Column(String, nullable=False)
    evidence_hash = Column(String, nullable=False)
    previous_evidence_hash = Column(String, nullable=True)
    sequence_number = Column(Integer, nullable=False)
    digital_signature = Column(Text, nullable=False)
    signer_public_key = Column(Text, nullable=False)
    is_tampered_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("TestSession", back_populates="evidence")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    test_id = Column(String, nullable=True)
    event_type = Column(String, nullable=False) # TEST_CREATED, CALIBRATION_PASSED, SIGNED, VERIFIED, TAMPER_DETECTED
    actor_id = Column(String, nullable=False)
    details = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    doc_code = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    publisher = Column(String, nullable=False)
    section = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    source_url = Column(String, nullable=True)
    content_hash = Column(String, nullable=False)
    version = Column(String, default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)
