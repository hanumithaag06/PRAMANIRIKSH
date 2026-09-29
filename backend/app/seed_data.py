import json
import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal, Base, engine
from app.models.models import User, KitProfile, TestSession, TestResult, EvidenceRecord, KnowledgeDocument
from app.evidence.signing import DigitalSigner
from app.evidence.hashing import EvidenceHasher

def initialize_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if seed data exists
    if db.query(User).count() > 0:
        db.close()
        return

    print("Initializing PRAMANIRIKSH seed data...")
    
    # 1. Create Users for all 5 Enterprise Roles with RSA Key Pairs
    priv_key1, pub_key1 = DigitalSigner.generate_key_pair()
    priv_key2, pub_key2 = DigitalSigner.generate_key_pair()
    priv_key3, pub_key3 = DigitalSigner.generate_key_pair()
    priv_key4, pub_key4 = DigitalSigner.generate_key_pair()
    priv_key5, pub_key5 = DigitalSigner.generate_key_pair()

    op_field = User(
        username="rajesh.sharma@narcotics.gov.in",
        full_name="Insp. Rajesh Sharma",
        badge_id="NCB-FIELD-8921",
        role="FIELD_OPERATOR",
        department="Narcotics Control Bureau (NCB) - Field Operations Unit",
        password_hash="pbkdf2:sha256:1000$mock_hash_rajesh",
        public_key_pem=pub_key1,
        private_key_pem=priv_key1
    )
    
    op_sup = User(
        username="priya.singh@narcotics.gov.in",
        full_name="Supt. Priya Singh",
        badge_id="NCB-SUP-1042",
        role="SUPERVISOR",
        department="Narcotics Control Bureau - HQ Enforcement Directorate",
        password_hash="pbkdf2:sha256:1000$mock_hash_priya",
        public_key_pem=pub_key2,
        private_key_pem=priv_key2
    )

    op_forensic = User(
        username="vikram.mehta@forensic.gov.in",
        full_name="Dr. Vikram Mehta",
        badge_id="CFSL-LAB-554",
        role="FORENSIC_REVIEWER",
        department="Central Forensic Science Laboratory (CFSL) - Narcotics Division",
        password_hash="pbkdf2:sha256:1000$mock_hash_vikram",
        public_key_pem=pub_key3,
        private_key_pem=priv_key3
    )

    op_audit = User(
        username="ananya.roy@audit.gov.in",
        full_name="Ananya Roy (Senior Auditor)",
        badge_id="AUD-IND-009",
        role="AUDITOR",
        department="National Evidence Compliance & Audit Directorate",
        password_hash="pbkdf2:sha256:1000$mock_hash_ananya",
        public_key_pem=pub_key4,
        private_key_pem=priv_key4
    )

    op_admin = User(
        username="suresh.kumar@narcotics.gov.in",
        full_name="Suresh Kumar",
        badge_id="SYS-ADM-001",
        role="ADMINISTRATOR",
        department="PRAMANIRIKSH System Administration & Governance",
        password_hash="pbkdf2:sha256:1000$mock_hash_suresh",
        public_key_pem=pub_key5,
        private_key_pem=priv_key5
    )
    
    db.add_all([op_field, op_sup, op_forensic, op_audit, op_admin])
    db.commit()

    # 2. Create Configurable Kit Profiles
    marquis_kit = KitProfile(
        kit_code="KIT-MARQUIS-V1",
        name="NCB Marquis Reagent Field Test Kit v1.2",
        manufacturer="Central Revenue Control Laboratory / NCB Approved",
        test_type="Marquis Colorimetric Reagent (Formaldehyde + Sulfuric Acid)",
        version="1.2",
        is_active=True,
        target_substances=["Morphine", "Heroin", "Codeine", "Amphetamine"],
        reference_card_profile={
            "card_id": "STD-NCB-CARD-2026",
            "patches": [
                {"name": "White Reference", "expected_rgb": [245, 245, 245]},
                {"name": "Neutral Gray 50%", "expected_rgb": [128, 128, 128]},
                {"name": "Cyan Reference", "expected_rgb": [0, 180, 220]},
                {"name": "Yellow Reference", "expected_rgb": [230, 200, 30]}
            ]
        },
        classification_profile={
            "positive_rules": [
                {
                    "substance_name": "Morphine / Heroin / Opiates",
                    "hue_min": 240,
                    "hue_max": 285,
                    "saturation_min": 40,
                    "expected_lab": [30.0, 48.0, -58.0]
                },
                {
                    "substance_name": "Amphetamine / Methamphetamine",
                    "hue_min": 15,
                    "hue_max": 45,
                    "saturation_min": 50,
                    "expected_lab": [55.0, 35.0, 45.0]
                }
            ],
            "negative_rules": [
                {
                    "rule_name": "Unreacted Baseline Reagent",
                    "hue_min": 35,
                    "hue_max": 85,
                    "saturation_max": 35
                }
            ]
        },
        instructions="Add 2 drops of Marquis Reagent to sample spot. Observe color change within 30-60 seconds under adequate lighting with calibration card placed side-by-side.",
        source_reference="NCB Technical Field Manual Section 4.2 (2026 Edition)"
    )

    cobalt_kit = KitProfile(
        kit_code="KIT-COBALT-V2",
        name="NCB Cobalt Thiocyanate Reagent Kit v2.0",
        manufacturer="NCB Standard Field Equipment Wing",
        test_type="Cobalt Thiocyanate Colorimetric Reagent",
        version="2.0",
        is_active=True,
        target_substances=["Cocaine HCl", "Cocaine Base (Crack)"],
        reference_card_profile={
            "card_id": "STD-NCB-CARD-2026",
            "patches": [
                {"name": "White Reference", "expected_rgb": [245, 245, 245]},
                {"name": "Neutral Gray 50%", "expected_rgb": [128, 128, 128]},
                {"name": "Cyan Reference", "expected_rgb": [0, 180, 220]},
                {"name": "Yellow Reference", "expected_rgb": [230, 200, 30]}
            ]
        },
        classification_profile={
            "positive_rules": [
                {
                    "substance_name": "Cocaine Hydrochloride",
                    "hue_min": 190,
                    "hue_max": 230,
                    "saturation_min": 55,
                    "expected_lab": [40.0, -15.0, -45.0]
                }
            ],
            "negative_rules": [
                {
                    "rule_name": "Pink / Unreacted Reagent Baseline",
                    "hue_min": 330,
                    "hue_max": 360,
                    "saturation_max": 40
                }
            ]
        },
        instructions="Place small sample in test vial, add 5 drops of Cobalt Thiocyanate. Intense turquoise blue precipitate indicates positive presumptive test.",
        source_reference="NCB SOP 2026-04 Section 7.1"
    )

    duquenois_kit = KitProfile(
        kit_code="KIT-DUQUENOIS-V1",
        name="NCB Duquenois-Levine Cannabis Kit v1.0",
        manufacturer="Central Forensic Science Wing",
        test_type="Modified Duquenois-Levine Reagent",
        version="1.0",
        is_active=True,
        target_substances=["Cannabis Resin (Charas)", "Cannabis Herb (Ganja)", "Hash Oil"],
        reference_card_profile={
            "card_id": "STD-NCB-CARD-2026",
            "patches": [
                {"name": "White Reference", "expected_rgb": [245, 245, 245]},
                {"name": "Neutral Gray 50%", "expected_rgb": [128, 128, 128]},
                {"name": "Cyan Reference", "expected_rgb": [0, 180, 220]},
                {"name": "Yellow Reference", "expected_rgb": [230, 200, 30]}
            ]
        },
        classification_profile={
            "positive_rules": [
                {
                    "substance_name": "Cannabinoids (THC)",
                    "hue_min": 260,
                    "hue_max": 310,
                    "saturation_min": 45,
                    "expected_lab": [28.0, 42.0, -40.0]
                }
            ],
            "negative_rules": [
                {
                    "rule_name": "Clear / Pale Yellow Unreacted Layer",
                    "hue_min": 40,
                    "hue_max": 80,
                    "saturation_max": 30
                }
            ]
        },
        instructions="Add Duquenois reagent and concentrated HCl to organic sample. Shake, then add chloroform. Violet color transferring into lower chloroform layer indicates positive reaction.",
        source_reference="UNODC Recommended Guidelines for Cannabis Testing (ST/NAR/40)"
    )

    db.add_all([marquis_kit, cobalt_kit, duquenois_kit])
    db.commit()

    # 3. Create Seed Official Knowledge Base Documents
    doc1 = KnowledgeDocument(
        doc_code="NCB-SOP-2026-04",
        title="NCB Standard Operating Procedure for Colorimetric Field Drug Testing",
        publisher="Narcotics Control Bureau, Ministry of Home Affairs",
        section="Section 4: Field Testing & Colorimetric Interpretation",
        content="""1. Scope and Legal Limitation: Field colorimetric chemical tests are strictly presumptive screening tools designed to assist investigating officers under NDPS Act Section 42. They do NOT constitute confirmatory scientific proof for court proceedings without CFSL laboratory analysis.
2. Calibration Card Requirement: Every test capture MUST include the standard NCB Reference Color Calibration Card placed on the same focal plane adjacent to the reaction spot.
3. Lighting Conditions: Tests must be photographed under indirect daylight or white LED illumination. Direct sunlight, sodium streetlights, or severe shadow angles cause spectral distortion.
4. Interpretation Rules: Marquis Reagent turning deep purple/violet indicates presumptive presence of Morphine, Heroin, or Codeine. Cobalt Thiocyanate turning cobalt blue indicates presumptive presence of Cocaine.
5. Quality Rejection: If an image fails clarity (blur score < 0.25) or contains over 5% specular glare, the application will mandate RETAKE REQUIRED.""",
        source_url="https://narcoticsindia.nic.in/sop/2026/field-testing.pdf",
        content_hash=EvidenceHasher.calculate_metadata_hash({"doc_code": "NCB-SOP-2026-04"}),
        version="2.1"
    )

    doc2 = KnowledgeDocument(
        doc_code="NDPS-SEC-42-GUIDELINES",
        title="NDPS Act 1985 Guidelines on Seizure and On-Site Presumptive Testing",
        publisher="Ministry of Home Affairs, Government of India",
        section="Chapter III: Procedure for Search, Seizure & Sampling",
        content="""Officers authorized under Section 42 of the NDPS Act 1985 must ensure:
1. Immediate Digital Logging: On-site presumptive test results must be cryptographically logged with tamper-evident SHA-256 fingerprinting, GPS coordinates, and timestamp.
2. Dual Sampling: Two representative samples (Control Sample A and Confirmatory Sample B) must be sealed in accordance with NCB Seizure Form 1 after presumptive field classification.
3. Digital Chain of Custody: The digital companion log signed by the officer's asymmetric RSA key pair provides verifiable auditability of the test event timeline prior to lab dispatch.""",
        source_url="https://mha.gov.in/ndps-act-guidelines",
        content_hash=EvidenceHasher.calculate_metadata_hash({"doc_code": "NDPS-SEC-42-GUIDELINES"}),
        version="1.0"
    )

    db.add_all([doc1, doc2])
    db.commit()

    # 4. Create Initial Seed Test Records with Tamper-Evident Hash Chain
    test_id_1 = "TEST-2026-0928-001"
    t_session = TestSession(
        test_id=test_id_1,
        operator_id=op1.id,
        kit_profile_id=marquis_kit.id,
        kit_profile_version=marquis_kit.version,
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(t_session)
    db.commit()

    t_res = TestResult(
        test_id=test_id_1,
        presumptive_result="POSITIVE",
        target_substance="Morphine / Heroin / Opiates",
        confidence_score=0.94,
        quality_score=0.92,
        quality_details={
            "quality_score": 0.92, "blur_score": 0.88, "blur_ok": True,
            "brightness_score": 0.91, "exposure_ok": True, "glare_detected": False,
            "glare_ok": True, "reference_card_detected": True, "roi_detected": True,
            "classification_allowed": True, "rejection_reasons": []
        },
        calibration_details={
            "calibration_successful": True, "lighting_condition": "Standard Field Lighting",
            "estimated_color_cast": "Balanced White", "transformation_matrix": [[1.02,0,0],[0,0.98,0],[0,0,1.05]],
            "patches_analyzed": [
                {"patch_name": "White Reference", "expected_rgb": [245,245,245], "observed_rgb": [240,240,242], "calibrated_rgb": [245,245,245], "delta_e": 1.2}
            ],
            "average_delta_e_before": 12.4, "average_delta_e_after": 2.1
        },
        color_analysis={
            "mean_rgb": [95.0, 25.0, 140.0],
            "mean_hsv": [262.5, 208.0, 140.0],
            "mean_lab": [28.5, 46.2, -52.4],
            "hue_degrees": 262.5, "saturation": 208.0, "luminance": 140.0,
            "dominant_color": "Deep Purple / Violet", "roi_dimensions": [120, 120]
        },
        explanation={
            "category": "POSITIVE",
            "detected_substance": "Morphine / Heroin / Opiates",
            "confidence_score": 0.94,
            "confidence_level": "HIGH",
            "color_distance": 18.2,
            "observed_hue_range": "262.5° (Dominant: Deep Purple / Violet)",
            "observed_lab": [28.5, 46.2, -52.4],
            "match_quality": "Strong Colorimetric Match",
            "disclaimer": "PRESUMPTIVE FIELD-TEST RESULT ONLY. DOES NOT REPLACE CONFIRMATORY LABORATORY TESTING."
        },
        cv_pipeline_version="2.1.0",
        classifier_version="1.4.0",
        created_at=datetime.utcnow() - timedelta(hours=3)
    )
    db.add(t_res)

    # Seed image (sample solid purple patch base64 image data)
    sample_img_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkBAMAAACC5A2uAAAAD1BMVEUAAAD/gAD/ZgD/AAAAAAD/m/0vAAAAMklEQVR42mNkQAKMDDA0YIDR1A00tQMNbU9TG70g0ND+N7Q9TW30gkBD29PURs+QGgUADB0EG966rnsAAAAASUVORK5CYII="
    
    img_hash = EvidenceHasher.calculate_image_hash(sample_img_b64)
    meta_dict = {
        "test_id": test_id_1,
        "operator_id": op1.id,
        "kit_profile_version": marquis_kit.version,
        "timestamp": t_session.created_at.isoformat(),
        "latitude": 28.6139,
        "longitude": 77.2090
    }
    meta_hash = EvidenceHasher.calculate_metadata_hash(meta_dict)
    ev_hash = EvidenceHasher.calculate_evidence_hash(img_hash, meta_hash, None)
    sig = DigitalSigner.sign_payload(ev_hash, op1.private_key_pem)

    evidence_1 = EvidenceRecord(
        test_id=test_id_1,
        operator_id=op1.id,
        latitude=28.6139,
        longitude=77.2090,
        gps_accuracy_m=4.2,
        location_acquired_at=t_session.created_at,
        image_data_base64=sample_img_b64,
        image_sha256=img_hash,
        metadata_hash=meta_hash,
        evidence_hash=ev_hash,
        previous_evidence_hash=None,
        sequence_number=1,
        digital_signature=sig,
        signer_public_key=op1.public_key_pem,
        is_tampered_demo=False,
        created_at=t_session.created_at
    )
    db.add(evidence_1)
    db.commit()

    print("Seed data successfully populated.")
    db.close()

if __name__ == "__main__":
    initialize_database()
