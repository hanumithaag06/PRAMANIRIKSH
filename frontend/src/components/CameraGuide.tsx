import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, AlertTriangle, CheckCircle2, Sun, Move, Square, Shield, Eye } from 'lucide-react';

interface CameraGuideProps {
  onCapture: (base64Image: string) => void;
}

type CameraStatus =
  | 'STARTING'
  | 'READY'
  | 'NEED_STEADY'
  | 'POOR_LIGHT'
  | 'NO_REF_CARD'
  | 'CAPTURED'
  | 'ERROR';

interface StatusConfig {
  label: string;
  guidance: string;
  color: string;
  badgeBg: string;
  canCapture: boolean;
  lightingOk: boolean;
  steadyOk: boolean;
  refCardDetected: boolean;
}

const STATUS_CONFIG: Record<CameraStatus, StatusConfig> = {
  STARTING: {
    label: 'Initializing Camera Engine…',
    guidance: 'Accessing high-resolution optical sensor and calibrated focal plane…',
    color: 'text-slate-400',
    badgeBg: 'bg-slate-800 text-slate-400 border-slate-700',
    canCapture: false,
    lightingOk: false,
    steadyOk: false,
    refCardDetected: false,
  },
  READY: {
    label: 'Optimal Alignment — Ready to Capture',
    guidance: 'Reference card in frame. Lighting balanced. Tap "Capture Field Photo" when ready.',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
    canCapture: true,
    lightingOk: true,
    steadyOk: true,
    refCardDetected: true,
  },
  NEED_STEADY: {
    label: 'Motion Detected — Hold Steady',
    guidance: 'Keep device still on the same horizontal plane as the test reagent vial.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    canCapture: false,
    lightingOk: true,
    steadyOk: false,
    refCardDetected: true,
  },
  POOR_LIGHT: {
    label: 'Low Illumination / Shadow Detected',
    guidance: 'Move to a brighter area or direct indirect white light toward the reference card.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    canCapture: false,
    lightingOk: false,
    steadyOk: true,
    refCardDetected: false,
  },
  NO_REF_CARD: {
    label: 'Reference Card Alignment Needed',
    guidance: 'Place standard NCB color calibration card inside the top designated framing box.',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
    canCapture: false,
    lightingOk: true,
    steadyOk: true,
    refCardDetected: false,
  },
  CAPTURED: {
    label: 'High-Res Frame Captured',
    guidance: 'Image acquired. Click "Analyze Field Photo" to run CV and generate evidence record.',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
    canCapture: false,
    lightingOk: true,
    steadyOk: true,
    refCardDetected: true,
  },
  ERROR: {
    label: 'Optical Sensor Access Denied',
    guidance: 'Camera permission denied or camera device in use. Select demo field samples or upload an image.',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
    canCapture: false,
    lightingOk: false,
    steadyOk: false,
    refCardDetected: false,
  },
};

export const CameraGuide: React.FC<CameraGuideProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const checkIntervalRef = useRef<number>(0);
  const [status, setStatus] = useState<CameraStatus>('STARTING');
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      clearInterval(checkIntervalRef.current);
    };
  }, []);

  const assessFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streamActive) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.videoWidth === 0) return;

    canvas.width = 64;
    canvas.height = 36;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, 64, 36);
    const imageData = ctx.getImageData(0, 0, 64, 36);
    const data = imageData.data;

    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const avgBrightness = totalBrightness / (data.length / 4);

    let laplacianSum = 0;
    let count = 0;
    const w = 64, h = 36;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;
        const tl = (((y-1)*w + (x-1)) * 4);
        const tr = (((y-1)*w + (x+1)) * 4);
        const bl = (((y+1)*w + (x-1)) * 4);
        const br = (((y+1)*w + (x+1)) * 4);
        const lap = Math.abs(4 * data[idx] - data[tl] - data[tr] - data[bl] - data[br]);
        laplacianSum += lap;
        count++;
      }
    }
    const blurScore = laplacianSum / (count || 1);

    if (avgBrightness < 45) {
      setStatus('POOR_LIGHT');
    } else if (blurScore < 2.5) {
      setStatus('NEED_STEADY');
    } else {
      setStatus('READY');
    }
  }, [streamActive]);

  useEffect(() => {
    if (streamActive) {
      checkIntervalRef.current = window.setInterval(assessFrame, 800);
    }
    return () => clearInterval(checkIntervalRef.current);
  }, [streamActive, assessFrame]);

  const startCamera = async () => {
    try {
      setStatus('STARTING');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
        setStatus('READY');
      }
    } catch {
      setStatus('ERROR');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL('image/png'));
      setStatus('CAPTURED');
    }
  };

  const cfg = STATUS_CONFIG[status];

  return (
    <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <canvas ref={canvasRef} className="hidden" />

      {status !== 'ERROR' ? (
        <div className="relative aspect-video sm:aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

          {/* Animated Laser Scanning Line */}
          {streamActive && status !== 'CAPTURED' && <div className="animate-laser" />}

          {/* Optical Framing Overlay HUD */}
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            {/* Top Corner Marks */}
            <div className="flex justify-between items-start">
              <div className="w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-700/80 text-[10px] font-mono text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>NCB CV OPTICAL HUD</span>
              </div>
              <div className="w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
            </div>

            {/* Reference Card Target Zone (Top) */}
            <div className="mx-auto w-[82%] sm:w-[70%] h-14 border-2 border-dashed border-amber-400/80 bg-amber-500/10 rounded-xl flex items-center justify-between px-3 shadow-lg">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-200 uppercase">
                  Reference Card Target
                </span>
              </div>
              <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-950/80 px-1.5 py-0.5 rounded">
                CALIBRATION
              </span>
            </div>

            {/* Test Reaction Spot Zone (Center/Bottom) */}
            <div className="mx-auto w-36 h-36 sm:w-44 sm:h-44 border-2 border-cyan-400/90 bg-cyan-500/10 rounded-2xl flex flex-col items-center justify-center p-2 text-center shadow-lg relative">
              <div className="crosshair-corner top-left" />
              <div className="crosshair-corner top-right" />
              <div className="crosshair-corner bottom-left" />
              <div className="crosshair-corner bottom-right" />
              <span className="text-[11px] font-mono font-bold text-cyan-200 leading-tight">
                TEST REAGENT SPOT
              </span>
              <span className="text-[9px] font-mono text-slate-300 mt-1">
                Align chemical reaction
              </span>
            </div>

            {/* Live CV Quality Gates Indicator Bar */}
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded-full border ${cfg.lightingOk ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40' : 'bg-slate-900/80 text-slate-400 border-slate-700'}`}>
                  {cfg.lightingOk ? '✓ Lighting' : '• Lighting'}
                </span>
                <span className={`px-2 py-0.5 rounded-full border ${cfg.steadyOk ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40' : 'bg-slate-900/80 text-slate-400 border-slate-700'}`}>
                  {cfg.steadyOk ? '✓ Focus' : '• Focus'}
                </span>
                <span className={`px-2 py-0.5 rounded-full border ${cfg.refCardDetected ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40' : 'bg-slate-900/80 text-slate-400 border-slate-700'}`}>
                  {cfg.refCardDetected ? '✓ Ref Card' : '• Ref Card'}
                </span>
              </div>
              <div className="w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
            </div>
          </div>

          {/* Contextual Smart Guidance Ribbon */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-slate-950/90 backdrop-blur-md border-t border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-2 h-2 rounded-full ${cfg.canCapture ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className={`text-xs font-mono font-bold truncate ${cfg.color}`}>{cfg.label}</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${cfg.badgeBg}`}>
                {status}
              </span>
            </div>
            {cfg.guidance && (
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-sans">{cfg.guidance}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center p-8 text-center gap-4">
          <Camera className="w-12 h-12 text-slate-600" />
          <div className="space-y-1 max-w-sm">
            <p className="text-sm font-bold text-white">Camera Access Not Available</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please grant camera permission in your browser or use a preset field test demo scenario below.
            </p>
          </div>
          <button
            onClick={startCamera}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Re-initialize Camera
          </button>
        </div>
      )}

      {/* Capture Control Button */}
      {streamActive && status !== 'CAPTURED' && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
          <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
            Position test & reference card within guidelines
          </p>
          <button
            id="camera-capture-btn"
            onClick={captureFrame}
            disabled={!cfg.canCapture}
            className={`w-full sm:w-auto px-8 py-3.5 font-mono font-black text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${
              cfg.canCapture
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 shadow-xl shadow-cyan-500/25'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{cfg.canCapture ? 'CAPTURE FIELD PHOTO' : cfg.label}</span>
          </button>
        </div>
      )}
    </div>
  );
};
