import hashlib
import json

class EvidenceHasher:
    """
    Cryptographic SHA-256 Hashing Engine for Evidence Records.
    Computes Image SHA-256, Canonical Metadata SHA-256, and Evidence Fingerprint Hash.
    """
    
    @staticmethod
    def calculate_image_hash(base64_image: str) -> str:
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]
        img_bytes = base64_image.encode('utf-8')
        return hashlib.sha256(img_bytes).hexdigest()

    @staticmethod
    def calculate_metadata_hash(metadata: dict) -> str:
        # Sort keys to ensure deterministic canonical JSON representation
        canonical_str = json.dumps(metadata, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()

    @classmethod
    def calculate_evidence_hash(cls, image_hash: str, metadata_hash: str, previous_hash: str = None) -> str:
        combined = f"{image_hash}:{metadata_hash}:{previous_hash or 'GENESIS_CHAIN_BLOCK'}"
        return hashlib.sha256(combined.encode('utf-8')).hexdigest()
