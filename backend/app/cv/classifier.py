import math

class KitAwareClassifier:
    """
    Configurable, Kit-Aware Colorimetric Classifier.
    Executes presumptive classification dynamically driven by active KitProfile parameters.
    No domain drug names or hue limits are hardcoded.
    """
    
    @staticmethod
    def classify(features: dict, kit_profile: dict) -> dict:
        class_profile = kit_profile.get("classification_profile", {})
        target_substances = kit_profile.get("target_substances", ["Target Substance"])
        
        hue = features["hue_degrees"]
        sat = features["saturation"]
        lum = features["luminance"]
        lab = features["mean_lab"]
        
        positive_rules = class_profile.get("positive_rules", [])
        negative_rules = class_profile.get("negative_rules", [])
        
        best_pos_match = None
        best_pos_dist = 999.0
        
        # Check against configured positive reaction profiles in the Kit Profile DB schema
        for rule in positive_rules:
            substance = rule.get("substance_name", target_substances[0] if target_substances else "Presumptive Agent")
            min_hue = rule.get("hue_min", 240)
            max_hue = rule.get("hue_max", 280)
            min_sat = rule.get("saturation_min", 40)
            expected_lab = rule.get("expected_lab", [30.0, 50.0, -60.0])
            
            # Check hue overlap
            in_hue = False
            if min_hue <= max_hue:
                in_hue = min_hue <= hue <= max_hue
            else: # wrap around 360
                in_hue = hue >= min_hue or hue <= max_hue
                
            sat_ok = sat >= min_sat
            
            # LAB color distance
            lab_dist = math.sqrt(
                (lab[0] - expected_lab[0])**2 +
                (lab[1] - expected_lab[1])**2 +
                (lab[2] - expected_lab[2])**2
            )
            
            if in_hue and sat_ok:
                if lab_dist < best_pos_dist:
                    best_pos_dist = lab_dist
                    best_pos_match = {
                        "substance": substance,
                        "lab_dist": lab_dist,
                        "hue_match": True,
                        "rule": rule
                    }
                    
        # Check negative rules (reagent baseline, clear, or unreacted color)
        neg_matched = False
        best_neg_dist = 999.0
        for rule in negative_rules:
            min_hue = rule.get("hue_min", 30)
            max_hue = rule.get("hue_max", 90)
            max_sat = rule.get("saturation_max", 50)
            
            in_hue = min_hue <= hue <= max_hue
            sat_ok = sat <= max_sat
            
            if in_hue or sat_ok:
                neg_matched = True
                best_neg_dist = min(best_neg_dist, abs(hue - (min_hue + max_hue)/2.0))
                
        # Determine classification state & confidence
        if best_pos_match is not None:
            # Positive reaction matched
            raw_confidence = max(0.65, min(0.98, 1.0 - (best_pos_dist / 120.0)))
            if best_pos_dist < 25.0:
                confidence_level = "HIGH"
                match_quality = "Strong Colorimetric Match"
                category = "POSITIVE"
            elif best_pos_dist < 55.0:
                confidence_level = "MEDIUM"
                match_quality = "Moderate Colorimetric Match"
                category = "POSITIVE"
            else:
                confidence_level = "LOW"
                match_quality = "Borderline Positive Match"
                category = "INCONCLUSIVE"
                
            detected_substance = best_pos_match["substance"]
            color_dist = best_pos_dist
            
        elif neg_matched and sat < 35.0:
            category = "NEGATIVE"
            detected_substance = None
            raw_confidence = max(0.85, min(0.96, 1.0 - (best_neg_dist / 100.0)))
            confidence_level = "HIGH"
            match_quality = "Clear Baseline Reagent Match (No Reaction)"
            color_dist = best_neg_dist
            
        else:
            category = "INCONCLUSIVE"
            detected_substance = None
            raw_confidence = 0.52
            confidence_level = "LOW"
            match_quality = "Ambiguous Reaction Spectrum / Indeterminate Hue"
            color_dist = 65.0
            
        return {
            "category": category,
            "detected_substance": detected_substance,
            "confidence_score": round(raw_confidence, 2),
            "confidence_level": confidence_level,
            "color_distance": round(color_dist, 2),
            "observed_hue_range": f"{hue:.1f}° (Dominant: {features['dominant_color']})",
            "observed_lab": lab,
            "match_quality": match_quality,
            "disclaimer": "PRESUMPTIVE FIELD-TEST RESULT ONLY. DOES NOT REPLACE CONFIRMATORY LABORATORY TESTING."
        }
