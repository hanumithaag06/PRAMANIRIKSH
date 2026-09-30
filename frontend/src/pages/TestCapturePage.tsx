import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Camera, Upload, ChevronRight, RotateCcw,
  CheckCircle2, RefreshCw, MapPin, Sparkles, AlertTriangle,
} from 'lucide-react';
import { CameraGuide } from '../components/CameraGuide';
import { SAMPLE_TEST_CASES, generateTestSampleCanvas } from '../services/sampleImages';
import { fetchKitProfiles } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { KitProfile } from '../types';
import { WorkflowProgress } from '../components/WorkflowProgress';

type CaptureMode = 'CAMERA' | 'DEMO' | 'UPLOAD';

export const TestCapturePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const state = (location.state as any) ?? {};
  const [kitId, setKitId] = useState<string>(state.kitId ?? '');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [mode, setMode] = useState<CaptureMode>('CAMERA');
  const [gps, setGps] = useState<{ lat?: number; lng?: number; acc?: number }>({});
  const [kits, setKits] = useState<KitProfile[]>([]);
  const [selectedSampleIdx, setSelectedSampleIdx] = useState<number>(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Acquire GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
        () => {} // silent fallback
      );
    }
  }, []);

  // Fetch kits if not provided in router state
  useEffect(() => {
    if (!kitId) {
      fetchKitProfiles().then((data) => {
        const active = data.filter((k) => k.is_active);
        setKits(active);
        if (active.length > 0) setKitId(active[0].id);
      }).catch(() => {});
    }
  }, [kitId]);

  const handleCameraCapture = (base64: string) => {
    setCapturedImage(base64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCapturedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDemoSelect = (idx: number) => {
    setSelectedSampleIdx(idx);
    const sample = SAMPLE_TEST_CASES[idx];
    setCapturedImage(generateTestSampleCanvas(sample.type));
  };

  const handleAnalyse = () => {
    if (!capturedImage) return;
    navigate('/test/analyse', {
      state: {
        base64Image:  capturedImage,
        kitId:        kitId || state.kitId,
        operatorId:   state.operatorId ?? user?.id ?? '',
        latitude:     gps.lat,
        longitude:    gps.lng,
        gpsAccuracy:  gps.acc,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Workflow Stepper ── */}
        <WorkflowProgress current="CAPTURE" />

        {/* ── Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Step 02 of 06
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Optical Acquisition</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Capture Field Test</h1>
          <p className="text-xs text-slate-400 font-mono">
            Ensure the color calibration card is visible and aligned with the test reaction spot.
          </p>
        </div>

        {/* ── Mode Selection Tabs ── */}
        <div className="flex rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/90 p-1.5 gap-1.5 shadow-xl">
          {([
            { key: 'CAMERA', label: 'Live Optical HUD', icon: Camera },
            { key: 'DEMO',   label: 'NCB Preset Samples', icon: RefreshCw },
            { key: 'UPLOAD', label: 'Upload Photo',       icon: Upload },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              id={`capture-mode-${key.toLowerCase()}`}
              onClick={() => { setMode(key); setCapturedImage(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
                mode === key
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Live Camera Mode ── */}
        {mode === 'CAMERA' && (
          <CameraGuide onCapture={handleCameraCapture} />
        )}

        {/* ── Demo Sample Scenarios Mode ── */}
        {mode === 'DEMO' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SAMPLE_TEST_CASES.map((s, i) => (
                <button
                  key={s.id}
                  id={`demo-${s.id}`}
                  onClick={() => handleDemoSelect(i)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-mono transition-all ${
                    selectedSampleIdx === i && capturedImage
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500 shadow-lg shadow-cyan-950/50'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-[11px]">{s.title.split('—')[0].trim()}</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">DEMO</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{s.title.split('—')[1]?.trim()}</p>
                </button>
              ))}
            </div>

            {capturedImage && (
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center p-2 shadow-2xl relative">
                <img src={capturedImage} alt="Demo field test" className="w-full h-full object-contain" />
                <div className="absolute bottom-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] font-mono text-cyan-400">
                  ✓ Synthetic Field Reference Generated
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Upload Photo Mode ── */}
        {mode === 'UPLOAD' && (
          <div className="space-y-4">
            <button
              id="upload-photo-btn"
              onClick={() => fileRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-900/50 hover:border-cyan-500 hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-slate-200 shadow-xl"
            >
              <Upload className="w-8 h-8 text-cyan-400" />
              <div className="text-center">
                <p className="text-sm font-mono font-bold text-white">Select Image File</p>
                <p className="text-xs text-slate-500 font-mono mt-1">PNG, JPG, WEBP formats supported</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

            {capturedImage && (
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center p-2 shadow-2xl">
                <img src={capturedImage} alt="Uploaded field capture" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        )}

        {/* ── Metadata & Geo Location Acquisition Status ── */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${gps.lat ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-300">
              {gps.lat
                ? `GPS Fixed: ${gps.lat.toFixed(4)}°, ${gps.lng?.toFixed(4)}° (±${gps.acc ? Math.round(gps.acc) : 5}m)`
                : 'Acquiring GPS location lock…'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">SHA-256 TAG</span>
        </div>

        {/* Retake button if captured */}
        {capturedImage && (
          <button
            onClick={() => setCapturedImage('')}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Re-acquire Photo
          </button>
        )}

        {/* ── Primary CTA: Proceed to Analysis ── */}
        <button
          id="capture-analyse-btn"
          onClick={handleAnalyse}
          disabled={!capturedImage}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-cyan-500/25"
        >
          <Sparkles className="w-5 h-5" />
          <span>RUN COMPUTER VISION ANALYSIS</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        {!capturedImage && (
          <p className="text-center text-xs font-mono text-slate-500">
            Awaiting optical frame capture before executing CV pipeline
          </p>
        )}
      </div>
    </div>
  );
};
