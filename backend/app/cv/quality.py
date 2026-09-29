import cv2
import numpy as np

class ImageQualityEvaluator:
    """
    Evaluates field image quality before attempting colorimetric classification.
    Rejects blurry, over/under-exposed, glary, or misaligned photos.
    """
    
    @staticmethod
    def evaluate(image_np: np.ndarray, has_reference_card_preset: bool = True) -> dict:
        if image_np is None or image_np.size == 0:
            return {
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
                "rejection_reasons": ["Image is empty or unreadable."]
            }
            
        gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY)
        
        # 1. Blur evaluation using Laplacian variance
        blur_val = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        # Scale to normalized 0-1
        blur_score = float(min(1.0, blur_val / 300.0))
        blur_ok = bool(blur_val >= 70.0) # Threshold for field clarity
        
        # 2. Exposure / Brightness evaluation
        mean_brightness = float(np.mean(gray))
        brightness_score = float(1.0 - abs(mean_brightness - 128) / 128.0)
        exposure_ok = bool(35.0 <= mean_brightness <= 225.0)
        
        # 3. Glare / Specular highlight detection
        glare_mask = gray > 248
        glare_ratio = float(np.sum(glare_mask)) / float(gray.size)
        glare_detected = bool(glare_ratio > 0.04) # More than 4% extreme highlights
        glare_ok = bool(not glare_detected)
        
        # 4. Reference card and ROI detection heuristic
        # In field test photos, reference card is usually detected via geometric contours / color markers
        contours, _ = cv2.findContours(gray, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        significant_contours = [c for c in contours if cv2.contourArea(c) > 500]
        
        ref_card_detected = bool(has_reference_card_preset or len(significant_contours) >= 2)
        roi_detected = bool(len(significant_contours) >= 1 or image_np.shape[0] > 100)
        
        rejection_reasons = []
        if not blur_ok:
            rejection_reasons.append(f"Image is too blurry (Blur Score: {blur_score:.2f}). Hold camera steady.")
        if not exposure_ok:
            rejection_reasons.append(f"Improper exposure (Mean Brightness: {mean_brightness:.1f}). Adjust lighting.")
        if glare_detected:
            rejection_reasons.append(f"Excessive glare/reflections detected ({glare_ratio*100:.1f}% area). Change camera angle.")
        if not ref_card_detected:
            rejection_reasons.append("Reference color card not detected in frame. Align card alongside test kit.")
        if not roi_detected:
            rejection_reasons.append("Test area ROI could not be isolated.")
            
        classification_allowed = bool(blur_ok and exposure_ok and glare_ok and ref_card_detected and roi_detected)
        
        # Overall quality score weighting
        overall_score = (
            (0.35 if blur_ok else 0.1) * blur_score +
            (0.25 if exposure_ok else 0.1) * brightness_score +
            (0.20 if glare_ok else 0.05) +
            (0.10 if ref_card_detected else 0.0) +
            (0.10 if roi_detected else 0.0)
        )
        overall_score = float(np.clip(overall_score, 0.0, 1.0))
        
        return {
            "quality_score": float(round(overall_score, 2)),
            "blur_score": float(round(blur_score, 2)),
            "blur_ok": bool(blur_ok),
            "brightness_score": float(round(brightness_score, 2)),
            "exposure_ok": bool(exposure_ok),
            "glare_detected": bool(glare_detected),
            "glare_ok": bool(glare_ok),
            "reference_card_detected": bool(ref_card_detected),
            "roi_detected": bool(roi_detected),
            "classification_allowed": bool(classification_allowed),
            "rejection_reasons": rejection_reasons
        }
