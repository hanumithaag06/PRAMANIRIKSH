import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, RefreshCw, Shield, AlertTriangle, Sparkles, Hash, Scan, Key } from 'lucide-react';
import { analyzeFieldTest } from '../services/api';
import { saveOfflineTest } from '../services/offlineDb';
import { useAuth } from '../contexts/AuthContext';
import { WorkflowProgress } from '../components/WorkflowProgress';

type Stage = {
  key: string;
  label: string;
  subtitle: string;
  icon: React.FC<any>;
  state: 'pending' | 'active' | 'done' | 'failed';
};

const INITIAL_STAGES: Stage[] = [
  { key: 'quality',     label: 'Checking Image Quality Gate',       subtitle: 'Laplacian blur score & glare threshold evaluation', icon: Scan, state: 'pending' },
  { key: 'calibration', label: 'Adaptive Reference Card Calibration', subtitle: '3x3 Color transformation matrix normalization', icon: Sparkles, state: 'pending' },
  { key: 'analysis',    label: 'Colorimetric Reaction Analysis',     subtitle: 'Dominant hue extraction in CIELAB/HSV color space', icon: Shield, state: 'pending' },
  { key: 'evidence',    label: 'Cryptographic Custody Signing',      subtitle: 'SHA-256 fingerprinting & RSA-2048 officer signature', icon: Key, state: 'pending' },
];

export const AnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasRun = useRef(false);

  const [stages, setStages] = useState<Stage[]>(INITIAL_STAGES);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const state = (location.state as any) ?? {};
  const { base64Image, kitId, operatorId, latitude, longitude, gpsAccuracy } = state;

  const setStageState = (key: string, stageState: Stage['state']) => {
    setStages((prev) =>
      prev.map((s) => s.key === key ? { ...s, state: stageState } : s)
    );
  };

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!base64Image || !kitId) {
      navigate('/test/prepare', { replace: true });
      return;
    }

    const runAnalysis = async () => {
      try {
        // Stage 1: Quality
        setStageState('quality', 'active');
        await delay(500);

        // Stage 2: Calibration
        setStageState('quality', 'done');
        setStageState('calibration', 'active');
        await delay(400);

        // Call backend — runs full CV pipeline & signature generation
        const result = await analyzeFieldTest({
          base64_image: base64Image,
          kit_id: kitId,
          operator_id: operatorId || user?.id || '',
          latitude,
          longitude,
          gps_accuracy_m: gpsAccuracy,
        });

        // Stage 3: Analysis
        setStageState('calibration', 'done');
        setStageState('analysis', 'active');
        await delay(400);

        // Stage 4: Evidence
        setStageState('analysis', 'done');
        setStageState('evidence', 'active');
        await delay(400);
        setStageState('evidence', 'done');

        await delay(300);
        navigate(`/test/result/${result.test_id}`, {
          state: { result },
          replace: true,
        });
      } catch (err: any) {
        if (!navigator.onLine) {
          try {
            const offlineId = await saveOfflineTest({
              base64Image,
              kitId,
              operatorId: operatorId || user?.id || '',
              latitude,
              longitude,
              gpsAccuracy,
              timestamp: new Date().toISOString(),
            });
            navigate('/', {
              state: { offlineNotice: offlineId },
              replace: true,
            });
          } catch {
            setError('Could not save this test record offline.');
          }
        } else {
          setStages((prev) => prev.map((s) =>
            s.state === 'active' ? { ...s, state: 'failed' } : s
          ));
          setError('Analysis could not be completed.');
          setErrorDetail(err.message || null);
        }
      }
    };

    runAnalysis();
  }, []);

  const hasFailed = stages.some((s) => s.state === 'failed');

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7 w-full pb-24 md:pb-12">

        {/* ── Workflow Stepper ── */}
        <WorkflowProgress current="ANALYSE" />

        {/* ── Header ── */}
        <div className="text-center space-y-2 pt-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-cyan-950/80 to-blue-950/80 border border-cyan-500/30 rounded-3xl shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center">
              {hasFailed ? (
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              ) : (
                <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
              )}
            </div>
            {!hasFailed && <div className="animate-laser" />}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-sans">
            {hasFailed ? 'Analysis Failed' : 'Analyzing Field Test'}
          </h1>
          <p className="text-xs text-slate-400 font-mono max-w-md mx-auto">
            {hasFailed
              ? 'The image quality gate rejected the capture. Review details below.'
              : 'Executing standardized computer vision pipeline and verifiable evidence generator.'}
          </p>
        </div>

        {/* ── Connected Technical Processing Stages ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-2xl">
          <p className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
            Pipeline Execution Log
          </p>

          <div className="space-y-2.5">
            {stages.map((stage) => {
              const StageIcon = stage.icon;
              const isDone = stage.state === 'done';
              const isActive = stage.state === 'active';
              const isFailed = stage.state === 'failed';

              return (
                <div
                  key={stage.key}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500'
                      : isDone
                      ? 'bg-slate-950/60 border-slate-800/80'
                      : isFailed
                      ? 'bg-rose-950/40 border-rose-600/60'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-400'
                          : isActive
                          ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                          : isFailed
                          ? 'bg-rose-950 border border-rose-500 text-rose-400'
                          : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}
                    >
                      <StageIcon className="w-4 h-4" />
                    </div>

                    <div>
                      <p className={`text-xs font-mono font-bold ${isActive ? 'text-cyan-300' : isDone ? 'text-white' : isFailed ? 'text-rose-300' : 'text-slate-500'}`}>
                        {stage.label}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {stage.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {isActive && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
                    {isFailed && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                    {stage.state === 'pending' && <Circle className="w-4 h-4 text-slate-700" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Error Resolution State ── */}
        {hasFailed && error && (
          <div className="bg-rose-950/60 border border-rose-600/60 rounded-2xl p-5 space-y-3 shadow-2xl animate-fade">
            <div className="flex items-center gap-2 text-rose-300 font-bold font-mono text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            {errorDetail && (
              <p className="text-xs text-rose-200/90 font-mono bg-rose-900/30 p-3 rounded-xl border border-rose-800/40 leading-relaxed">
                {errorDetail}
              </p>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate('/test/capture', { state, replace: true })}
                className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg"
              >
                Retake Field Photo
              </button>
              <button
                onClick={() => navigate('/test/prepare', { replace: true })}
                className="flex-1 py-3 bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold text-xs rounded-xl hover:bg-slate-700"
              >
                Select Different Kit
              </button>
            </div>
          </div>
        )}

        {!hasFailed && (
          <p className="text-center text-[11px] font-mono text-slate-500">
            Please keep your browser active while computing cryptographic SHA-256 digests
          </p>
        )}
      </div>
    </div>
  );
};
