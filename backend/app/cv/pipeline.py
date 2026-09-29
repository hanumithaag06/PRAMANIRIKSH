import base64
import cv2
import numpy as np
from app.cv.quality import ImageQualityEvaluator
from app.cv.calibration import AdaptiveColorCalibrator
from app.cv.feature_extraction import FeatureExtractor
from app.cv.classifier import KitAwareClassifier

def to_python_primitives(obj):
    if isinstance(obj, dict):
        return {k: to_python_primitives(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [to_python_primitives(v) for v in obj]
    elif isinstance(obj, (np.bool_, np.generic)):
        return obj.item()
    return obj

class CVPipeline:
    """
    Complete Explainable Computer Vision Pipeline.
    Converts raw field capture base64 -> image array -> quality gate -> adaptive calibration -> feature extraction -> kit classification.
    """
    
    @staticmethod
    def base64_to_image(base64_str: str) -> np.ndarray:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_bytes = base64.b64decode(base64_str)
        img_np = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_COLOR)
        return img_np

    @classmethod
    def process_field_image(cls, base64_image: str, kit_profile: dict) -> dict:
        try:
            image_np = cls.base64_to_image(base64_image)
        except Exception as e:
            return to_python_primitives({
                "quality_result": {
                    "quality_score": 0.0,
                    "blur_score": 0.0,
                    "blur_ok": False,
                    "brightness_score": 0.0,
                    "exposure_ok": False,
                    "glare_detected": True,
                    "glare_ok": False,
                    "reference_card_detected": False,
                    "roi_detected": False,
                    "classification_allowed": False,
                    "rejection_reasons": [f"Failed to decode image data: {str(e)}"]
                },
                "calibration_result": None,
                "features": None,
                "classification": {
                    "category": "RETAKE_REQUIRED",
                    "detected_substance": None,
                    "confidence_score": 0.0,
                    "confidence_level": "N/A",
                    "color_distance": 0.0,
                    "observed_hue_range": "N/A",
                    "observed_lab": [0,0,0],
                    "match_quality": "Corrupted or Invalid Image Binary",
                    "disclaimer": "PRESUMPTIVE FIELD-TEST RESULT ONLY. DOES NOT REPLACE CONFIRMATORY LABORATORY TESTING."
                }
            })
            
        # 1. Image Quality Gate
        quality_res = ImageQualityEvaluator.evaluate(image_np)
        
        if not quality_res["classification_allowed"]:
            return to_python_primitives({
                "quality_result": quality_res,
                "calibration_result": None,
                "features": None,
                "classification": {
                    "category": "RETAKE_REQUIRED",
                    "detected_substance": None,
                    "confidence_score": 0.0,
                    "confidence_level": "N/A",
                    "color_distance": 0.0,
                    "observed_hue_range": "N/A",
                    "observed_lab": [0,0,0],
                    "match_quality": "Image Quality Gate Failed - Retake Required",
                    "disclaimer": "PRESUMPTIVE FIELD-TEST RESULT ONLY. DOES NOT REPLACE CONFIRMATORY LABORATORY TESTING."
                }
            })
            
        # 2. Adaptive Reference Card Calibration
        ref_profile = kit_profile.get("reference_card_profile", {})
        calibrated_img, calibration_res = AdaptiveColorCalibrator.calibrate(image_np, ref_profile)
        
        # 3. Color Feature Extraction
        features = FeatureExtractor.extract_roi_features(calibrated_img)
        
        # 4. Dynamic Kit-Aware Classification
        classification = KitAwareClassifier.classify(features, kit_profile)
        
        return to_python_primitives({
            "quality_result": quality_res,
            "calibration_result": calibration_res,
            "features": features,
            "classification": classification
        })

