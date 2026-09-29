import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface CameraGuideProps {
  onCapture: (base64Image: string) => void;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStreamActive(true);
      }
    } catch (err) {
      setCameraError('Camera access unavailable or denied. Please use sample preset cards or file upload.');
      setStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      onCapture(dataUrl);
    }
  };

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video element */}
      {streamActive ? (
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

          {/* Alignment Overlays */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
            {/* Top Bar Status */}
            <div className="flex items-center justify-between bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>REALTIME CAMERA FEED</span>
              </div>
              <span className="text-slate-300">1280x720 HD</span>
            </div>

            {/* Target Alignment Rectangles */}
            <div className="relative flex-1 my-2 border-2 border-dashed border-cyan-400/60 rounded-xl flex flex-col items-center justify-center p-4">
              {/* Reference Card Target Box */}
              <div className="w-4/5 h-16 border-2 border-amber-400/80 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-[11px] font-mono text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded">
                  ALIGN REFERENCE CARD HERE
                </span>
              </div>

              {/* Test ROI Target Box */}
              <div className="w-48 h-48 border-2 border-emerald-400/80 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <span className="text-[11px] font-mono text-emerald-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded">
                  ALIGN TEST REACTION SPOT
                </span>
              </div>
            </div>

            {/* Bottom Guidance */}
            <div className="text-center bg-slate-950/80 backdrop-blur-md px-4 py-1.5 rounded-lg text-xs text-slate-300 font-mono">
              Keep phone parallel • Avoid specular glare • Include Reference Card
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <Camera className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-300 mb-2">{cameraError || 'Camera Initializing...'}</p>
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-mono font-semibold border border-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Camera Access
          </button>
        </div>
      )}

      {/* Capture Control Button */}
      {streamActive && (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center">
          <button
            onClick={captureFrame}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-3 transition-transform active:scale-95"
          >
            <Camera className="w-5 h-5" /> CAPTURE FIELD EVIDENCE
          </button>
        </div>
      )}
    </div>
  );
};
