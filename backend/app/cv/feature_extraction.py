import cv2
import numpy as np

class FeatureExtractor:
    """
    Extracts quantitative color features from the calibrated Test ROI.
    """
    
    @staticmethod
    def extract_roi_features(image_np: np.ndarray) -> dict:
        h, w, _ = image_np.shape
        # Extract central reaction region (ROI)
        cy, cx = h // 2, w // 2
        ry = max(10, h // 4)
        rx = max(10, w // 4)
        roi = image_np[cy-ry:cy+ry, cx-rx:cx+rx]
        
        if roi.size == 0:
            roi = image_np

        # 1. RGB Features
        mean_bgr = cv2.mean(roi)[:3]
        mean_rgb = [float(mean_bgr[2]), float(mean_bgr[1]), float(mean_bgr[0])]
        
        # 2. HSV Features
        hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        mean_hsv = cv2.mean(hsv_roi)[:3]
        # OpenCv Hue is 0-180, scale to 0-360 for standard colorimetry
        hue_360 = float(mean_hsv[0] * 2.0)
        sat_255 = float(mean_hsv[1])
        val_255 = float(mean_hsv[2])
        
        # 3. LAB Features
        lab_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2LAB)
        mean_lab = cv2.mean(lab_roi)[:3]
        lab_vals = [float(mean_lab[0]), float(mean_lab[1]), float(mean_lab[2])]
        
        # Determine dominant color description
        if sat_255 < 25.0 and val_255 > 200.0:
            dominant_name = "Clear / White"
        elif sat_255 < 25.0 and val_255 < 60.0:
            dominant_name = "Dark / Black"
        elif hue_360 >= 240 and hue_360 <= 285:
            dominant_name = "Deep Purple / Violet"
        elif hue_360 >= 200 and hue_360 < 240:
            dominant_name = "Cobalt Blue"
        elif hue_360 >= 10 and hue_360 < 40:
            dominant_name = "Red-Orange"
        elif hue_360 >= 40 and hue_360 < 75:
            dominant_name = "Golden Yellow"
        elif hue_360 >= 130 and hue_360 < 170:
            dominant_name = "Teal / Emerald Green"
        elif hue_360 >= 285 and hue_360 < 330:
            dominant_name = "Pink / Magenta"
        else:
            dominant_name = "Neutral Brown / Amber"
            
        return {
            "mean_rgb": [round(c, 1) for c in mean_rgb],
            "mean_hsv": [round(hue_360, 1), round(sat_255, 1), round(val_255, 1)],
            "mean_lab": [round(c, 1) for c in lab_vals],
            "hue_degrees": round(hue_360, 1),
            "saturation": round(sat_255, 1),
            "luminance": round(val_255, 1),
            "dominant_color": dominant_name,
            "roi_dimensions": [roi.shape[1], roi.shape[0]]
        }
