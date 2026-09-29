import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, Cpu, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { CameraGuide } from '../components/CameraGuide';
import { QualityBadge } from '../components/QualityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { fetchKitProfiles, analyzeFieldTest } from '../services/api';
import { KitProfile, TestAnalysisResponse } from '../types';
import { SAMPLE_TEST_CASES, generateTestSampleCanvas } from '../services/sampleImages';
import { saveOfflineTest } from '../services/offlineDb';
import { useTranslation } from '../contexts/I18nContext';

export const TestCapturePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [kits, setKits] = useState<KitProfile[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string>('');
  const [captureMode, setCaptureMode] = useState<'PRESET' | 'CAMERA' | 'UPLOAD'>('PRESET');
  const [currentImageBase64, setCurrentImageBase64] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TestAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchKitProfiles()
      .then((data) => {
        setKits(data);
        if (data.length > 0) {
          setSelectedKitId(data[0].kit_code);
        }
      })
      .catch((err) => {
        setErrorMessage(t('capture.failedLoadKits'));
      });

    // Default select first sample test case image
    const initialSample = SAMPLE_TEST_CASES[0];
    const dataUrl = generateTestSampleCanvas(initialSample.type);
    setCurrentImageBase64(dataUrl);
  }, []);

  const handleSelectSample = (sample: typeof SAMPLE_TEST_CASES[0]) => {
    const dataUrl = generateTestSampleCanvas(sample.type);
    setCurrentImageBase64(dataUrl);
    if (sample.kitCode) {
      setSelectedKitId(sample.kitCode);
    }
    setAnalysisResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentImageBase64(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAnalysis = async () => {
    if (!currentImageBase64) {
      setErrorMessage(t('capture.noImage'));
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);

    const payload = {
      base64_image: currentImageBase64,
      kit_id: selectedKitId || 'KIT-MARQUIS-V1',
      operator_id: 'user-rajesh-001',
      latitude: 28.6139,
      longitude: 77.2090,
      gps_accuracy_m: 3.8
    };

    try {
      const result = await analyzeFieldTest(payload);
      setAnalysisResult(result);
    } catch (err: any) {
      // Offline fallback: save to IndexedDB offline queue
      try {
        const tempId = await saveOfflineTest(payload);
        setErrorMessage(`Offline mode detected. Test saved locally to queue (${tempId}) for later server sync.`);
      } catch (offlineErr) {
        setErrorMessage(err.message || 'Analysis failed.');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const activeKit = kits.find((k) => k.kit_code === selectedKitId || k.id === selectedKitId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header & Kit Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-cyan-400" /> {t('capture.title')}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {t('capture.subtitle')}
          </p>
        </div>

        {/* Active Kit Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-300 font-bold shrink-0">{t('capture.activeKitProfile')}</label>
          <select
            value={selectedKitId}
            onChange={(e) => setSelectedKitId(e.target.value)}
            className="bg-slate-950 text-cyan-300 text-xs font-mono font-bold px-3 py-2 rounded-xl border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {kits.map((k) => (
              <option key={k.id} value={k.kit_code}>
                {k.name} ({k.version})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 font-mono text-xs">
        <button
          onClick={() => setCaptureMode('PRESET')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
            captureMode === 'PRESET'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> {t('capture.presetSamples')}
        </button>
        <button
          onClick={() => setCaptureMode('CAMERA')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
            captureMode === 'CAMERA'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" /> {t('capture.liveCamera')}
        </button>
        <button
          onClick={() => setCaptureMode('UPLOAD')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
            captureMode === 'UPLOAD'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" /> {t('capture.uploadFile')}
        </button>
      </div>

      {/* Capture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Source / Camera */}
        <div className="lg:col-span-6 space-y-4">
          {captureMode === 'CAMERA' ? (
            <CameraGuide
              onCapture={(base64) => {
                setCurrentImageBase64(base64);
                setAnalysisResult(null);
              }}
            />
          ) : captureMode === 'UPLOAD' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl transition-colors"
              >
                <Upload className="w-10 h-10 text-cyan-400 mb-2" />
                <span className="text-sm font-bold text-white">Click to Select Test Photo</span>
                <span className="text-xs text-slate-500 font-mono mt-1">PNG, JPG, WEBP formats supported</span>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-mono text-slate-400 font-bold uppercase">
                {t('capture.selectScenario')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_TEST_CASES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="text-left bg-slate-900 hover:bg-slate-800 p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-white">{sample.title}</span>
                    <span className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sample.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Image Preview & Trigger */}
          {currentImageBase64 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{t('capture.capturePreview')}</span>
                <span className="text-cyan-400">{t('capture.referenceDetected')}</span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-700 flex items-center justify-center">
                <img src={currentImageBase64} alt="Test capture" className="w-full h-full object-contain" />
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-3 transition-transform active:scale-98 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                    <span>{t('capture.analyzingButton')}</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-5 h-5" />
                    <span>{t('capture.analyzeButton')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-xl text-xs text-rose-200 font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right Column: CV & Classification Output */}
        <div className="lg:col-span-6">
          {analysisResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              {/* Presumptive Result Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold uppercase">{t('result.presumptiveResult')}</span>
                  <span className="text-xs font-mono text-slate-400">{t('result.testId')} {analysisResult.test_id}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div>
                    <StatusBadge type="result" value={analysisResult.presumptive_result} />
                    {analysisResult.target_substance && (
                      <p className="text-sm font-bold text-slate-200 mt-2">
                        {t('result.targetAgent')} <span className="text-cyan-400">{analysisResult.target_substance}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-xs text-slate-400">Confidence</p>
                    <p className="text-2xl font-black text-cyan-400">
                      {(analysisResult.confidence_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-slate-500">{analysisResult.explanation.confidence_level} LEVEL</p>
                  </div>
                </div>
              </div>

              {/* Quality Gate Card */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 font-bold uppercase">{t('result.qualityGate')}</span>
                <QualityBadge
                  score={analysisResult.quality_result.quality_score}
                  reasons={analysisResult.quality_result.rejection_reasons}
                />
              </div>

              {/* Calibration & CV Explainability */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase">{t('result.calibration')}</span>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{t('result.lightingCondition')}</span>
                    <span className="text-cyan-400 font-bold">{analysisResult.calibration_result.lighting_condition}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{t('result.avgDeltaE')}</span>
                    <span className="text-emerald-400 font-bold">
                      {analysisResult.calibration_result.average_delta_e_before} → {analysisResult.calibration_result.average_delta_e_after} (Normalized)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>{t('result.observedHue')}</span>
                    <span className="text-amber-400 font-bold">{analysisResult.explanation.observed_hue_range}</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Evidence Signatures */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase">{t('result.cryptoFingerprint')}</span>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-[11px] break-all">
                  <div>
                    <span className="text-slate-500">{t('result.imageSha')}</span>
                    <p className="text-slate-300 font-mono">{analysisResult.image_sha256}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('result.evidenceHash')}</span>
                    <p className="text-cyan-400 font-mono">{analysisResult.evidence_hash}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('result.signedRsa')}{analysisResult.sequence_number})</span>
                  </div>
                </div>
              </div>

              {/* View Full Detail Button */}
              <button
                onClick={() => navigate(`/tests/${analysisResult.test_id}`)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <span>{t('result.viewFullRecord')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
              <Cpu className="w-12 h-12 text-slate-700 mx-auto" />
              <p className="text-sm font-mono text-slate-400 font-medium">{t('capture.noResultTitle')}</p>
              <p className="text-xs max-w-sm mx-auto">
                {t('capture.noResultDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
