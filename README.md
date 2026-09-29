# PRAMANIRIKSH — AI-Powered Field Test Verification Companion
### Smart India Hackathon 2026 Prototype
**Problem Statement ID:** 26231  
**Project Name:** Digital Companion for Field Drug Testing  
**Organization:** Narcotics Control Bureau (NCB), Ministry of Home Affairs  
**Category:** Software  
**Theme:** MedTech / BioTech / HealthTech  

---

## 📌 Executive Summary
**PRAMANIRIKSH** is a software-only digital companion designed for field narcotics officers using existing colorimetric field-test kits (e.g., Marquis reagent, Cobalt Thiocyanate, Duquenois-Levine). It transforms physical visual color interpretation into a standardized, evidence-aware, cryptographically verifiable, and tamper-evident digital workflow **without requiring any new hardware**.

> **Mandatory Disclaimer:** The output produced by PRAMANIRIKSH is a **presumptive field-test result** and supporting digital evidence record. It does NOT replace laboratory confirmatory testing (CFSL / CRCL).

---

## 🚀 Key Architectural Innovations & Novelties

1. **Adaptive Reference-Card Calibration**: Detects color calibration patches on standard cards, computes 3x3 gain matrices, compensates for ambient lighting variations and white balance casts, and normalizes test ROI images prior to classification.
2. **Evidence Quality Gate**: Automatically evaluates Laplacian blur, specular glare, exposure distribution, and card/ROI visibility before classification. Rejects bad photos as `RETAKE_REQUIRED` rather than forcing inaccurate predictions.
3. **Data-Driven Kit Profiles**: Extensible kit configuration system stored in the database. No drug names, hue thresholds, or reagent rules are hardcoded in application logic.
4. **Reproducible Analysis Snapshot**: Stores the exact version of the active Kit Profile, CV Pipeline, Classifier Model, and Calibration Profile used to generate each result.
5. **Cryptographic Tamper-Evident Hash Chain**: Generates SHA-256 hashes of Image + Canonical Metadata + Evidence Fingerprint linked in an append-only sequence block structure.
6. **Asymmetric RSA Digital Signatures**: Digitally signs evidence fingerprints using officers' private RSA key pairs, allowing instant public-key verification of authenticity.
7. **Offline-First PWA Field Architecture**: Stores records locally in IndexedDB when network connectivity is lost and synchronizes via an idempotent queue upon reconnection.
8. **Interactive Evidence Verification & Tampering Demo**: Dedicated inspection tool that recalculates hashes and signatures, demonstrating immediate `INTEGRITY CHECK FAILED` warnings if record data or pixels are tampered with.

---

## 🛠 Tech Stack

- **Backend**: Python 3.10+, FastAPI, OpenCV, NumPy, scikit-image, scikit-learn, Cryptography (RSA/SHA-256), SQLAlchemy, SQLite / PostgreSQL.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, IndexedDB (Offline Storage).

---

## 🏃 Quick Start Instructions

### 1. Run Backend Server
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*The backend automatically seeds initial users, active kit profiles, NCB SOP knowledge base documents, and initial sample evidence records on startup at `http://localhost:8000`.*

### 2. Run Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 🏆 SIH 2026 Live Demonstration Workflow

1. **Capture & Preset Selection**:
   - Navigate to **New Test** (`/capture`).
   - Select an active Kit Profile (e.g., Marquis Reagent or Cobalt Thiocyanate).
   - Use live WebRTC camera or select one of the pre-configured field sample test cards (Positive Morphine, Positive Cocaine, Positive Cannabis, Negative Control, Blurry Fail, Glare Fail).

2. **Computer Vision & Calibration Execution**:
   - Click **ANALYZE & GENERATE EVIDENCE RECORD**.
   - View the Image Quality Gate evaluation, Adaptive Reference Calibration matrix, color spectrum features, and presumptive classification score.

3. **Cryptographic Signing & Detail Inspection**:
   - Click **VIEW FULL EVIDENCE TIMELINE & RECORD DETAILS**.
   - Inspect the officer badge metadata, GPS coordinates, SHA-256 image hash, evidence fingerprint, and asymmetric RSA digital signature.

4. **Tampering & Verification Demo**:
   - Click **DEMO: SIMULATE TAMPERING** on any record to simulate unauthorized record modification.
   - Click **RE-VERIFY INTEGRITY**.
   - Observe the bold warning: **`INTEGRITY CHECK FAILED — TAMPERING DETECTED!`** with exact diagnostic reasons.
