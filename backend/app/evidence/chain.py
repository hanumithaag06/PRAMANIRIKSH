from app.evidence.hashing import EvidenceHasher
from app.evidence.signing import DigitalSigner

class TamperEvidentChainEngine:
    """
    Manages and verifies append-only evidence hash chains.
    Checks image SHA-256, canonical metadata hash, evidence hash, RSA digital signature,
    and sequence hash chain integrity.
    """
    
    @staticmethod
    def verify_record_integrity(evidence_record: dict, previous_record: dict = None) -> dict:
        image_sha256 = evidence_record.get("image_sha256")
        stored_metadata_hash = evidence_record.get("metadata_hash")
        stored_evidence_hash = evidence_record.get("evidence_hash")
        stored_signature = evidence_record.get("digital_signature")
        public_key_pem = evidence_record.get("signer_public_key")
        is_tampered_demo = evidence_record.get("is_tampered_demo", False)
        
        # 1. Image hash check
        base64_img = evidence_record.get("image_data_base64", "")
        recalculated_img_hash = EvidenceHasher.calculate_image_hash(base64_img) if base64_img else image_sha256
        image_hash_valid = (recalculated_img_hash == image_sha256) and not is_tampered_demo
        
        # 2. Metadata hash check
        canonical_meta = evidence_record.get("metadata", {})
        recalculated_meta_hash = EvidenceHasher.calculate_metadata_hash(canonical_meta) if canonical_meta else stored_metadata_hash
        metadata_hash_valid = (recalculated_meta_hash == stored_metadata_hash) and not is_tampered_demo
        
        # 3. Evidence fingerprint check
        prev_hash = evidence_record.get("previous_evidence_hash")
        recalculated_evidence_hash = EvidenceHasher.calculate_evidence_hash(
            image_sha256, stored_metadata_hash, prev_hash
        )
        evidence_hash_valid = (recalculated_evidence_hash == stored_evidence_hash) and not is_tampered_demo
        
        # 4. Digital Signature verification
        signature_valid = DigitalSigner.verify_signature(
            stored_evidence_hash, stored_signature, public_key_pem
        ) and not is_tampered_demo
        
        # 5. Chain link check
        chain_valid = True
        if previous_record:
            expected_prev_hash = previous_record.get("evidence_hash")
            chain_valid = (prev_hash == expected_prev_hash)
            
        overall_valid = (
            image_hash_valid and
            metadata_hash_valid and
            evidence_hash_valid and
            signature_valid and
            chain_valid and
            not is_tampered_demo
        )
        
        failure_reasons = []
        if is_tampered_demo:
            failure_reasons.append("DEMO TAMPERING DETECTED: Record payload was modified after signing!")
        if not image_hash_valid:
            failure_reasons.append("Image SHA-256 hash mismatch! Image pixel binary has been altered.")
        if not metadata_hash_valid:
            failure_reasons.append("Metadata hash mismatch! GPS/Timestamp/Operator data modified.")
        if not evidence_hash_valid:
            failure_reasons.append("Evidence fingerprint mismatch! Record payload integrity check failed.")
        if not signature_valid:
            failure_reasons.append("RSA Digital Signature verification failed! Cryptographic signature invalid or key forged.")
        if not chain_valid:
            failure_reasons.append("Hash chain sequence broken! Previous hash does not link to preceding block.")
            
        status_label = "VERIFIED" if overall_valid else "INTEGRITY CHECK FAILED"
        
        return {
            "test_id": evidence_record.get("test_id"),
            "is_valid": overall_valid,
            "image_hash_valid": image_hash_valid,
            "metadata_hash_valid": metadata_hash_valid,
            "evidence_hash_valid": evidence_hash_valid,
            "signature_valid": signature_valid,
            "chain_valid": chain_valid,
            "status_label": status_label,
            "details": {
                "image_sha256": image_sha256,
                "recalculated_image_sha256": recalculated_img_hash,
                "stored_metadata_hash": stored_metadata_hash,
                "recalculated_metadata_hash": recalculated_meta_hash,
                "stored_evidence_hash": stored_evidence_hash,
                "recalculated_evidence_hash": recalculated_evidence_hash,
                "previous_evidence_hash": prev_hash,
                "sequence_number": evidence_record.get("sequence_number", 1),
                "failure_reasons": failure_reasons
            }
        }
