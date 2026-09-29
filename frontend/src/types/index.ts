export interface KitProfile {
  id: string;
  kit_code: string;
  name: string;
  manufacturer: string;
  test_type: string;
  version: string;
  is_active: boolean;
  target_substances: string[];
  reference_card_profile: any;
  classification_profile: any;
  instructions?: string;
  source_reference?: string;
}

export interface QualityResult {
  quality_score: number;
  blur_score: number;
  blur_ok: boolean;
  brightness_score: number;
  exposure_ok: boolean;
  glare_detected: boolean;
  glare_ok: boolean;
  reference_card_detected: boolean;
  roi_detected: boolean;
  classification_allowed: boolean;
  rejection_reasons: string[];
}

export interface ColorPatchMatch {
  patch_name: string;
  expected_rgb: number[];
  observed_rgb: number[];
  calibrated_rgb: number[];
  delta_e: number;
}

export interface CalibrationResult {
  calibration_successful: boolean;
  lighting_condition: string;
  estimated_color_cast: string;
  transformation_matrix: number[][];
  patches_analyzed: ColorPatchMatch[];
  average_delta_e_before: number;
  average_delta_e_after: number;
}

export interface ClassificationExplanation {
  category: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'RETAKE_REQUIRED';
  detected_substance: string | null;
  confidence_score: number;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'N/A';
  color_distance: number;
  observed_hue_range: string;
  observed_lab: number[];
  match_quality: string;
  disclaimer: string;
}

export interface TestAnalysisResponse {
  test_id: string;
  timestamp: string;
  operator_id: string;
  operator_name: string;
  kit_name: string;
  kit_version: string;
  presumptive_result: 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'RETAKE_REQUIRED';
  target_substance: string | null;
  confidence_score: number;
  quality_result: QualityResult;
  calibration_result: CalibrationResult;
  explanation: ClassificationExplanation;
  image_sha256: string;
  metadata_hash: string;
  evidence_hash: string;
  previous_evidence_hash: string | null;
  sequence_number: number;
  digital_signature: string;
  signer_public_key: string;
  cv_pipeline_version: string;
  classifier_version: string;
  is_tampered_demo: boolean;
}

export interface VerificationResponse {
  test_id: string;
  is_valid: boolean;
  image_hash_valid: boolean;
  metadata_hash_valid: boolean;
  evidence_hash_valid: boolean;
  signature_valid: boolean;
  chain_valid: boolean;
  status_label: 'VERIFIED' | 'INTEGRITY CHECK FAILED';
  details: {
    image_sha256: string;
    recalculated_image_sha256: string;
    stored_metadata_hash: string;
    recalculated_metadata_hash: string;
    stored_evidence_hash: string;
    recalculated_evidence_hash: string;
    previous_evidence_hash: string | null;
    sequence_number: number;
    failure_reasons: string[];
  };
  timeline: { step: number; title: string; timestamp: string; status: string }[];
  verified_at: string;
}

export interface KnowledgeQueryResult {
  query: string;
  answer: string;
  document_title: string;
  publisher: string;
  section: string;
  document_version: string;
  citation: string;
  confidence_score: number;
}
