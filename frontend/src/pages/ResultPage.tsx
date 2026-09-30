import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  ArrowRight, ShieldCheck, ChevronRight, Clock,
  RotateCcw, Camera, Shield, FileText, AlertOctagon,
} from 'lucide-react';
import { fetchTestDetail } from '../services/api';
import { TestAnalysisResponse } from '../types';
import { WorkflowProgress } from '../components/WorkflowProgress';
import { ConfidencePill } from '../components/PlainPills';

type Result = 'POSITIVE' | 'NEGATIVE' | 'INCONCLUSIVE' | 'RETAKE_REQUIRED';

const RESULT_STYLES: Record<Result, {
  label: string;
  badge: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
  description: string;
  icon: React.FC<any>;
}> = {
  POSITIVE: {
    label: 'POSITIVE PRESUMPTIVE REACTION',
    badge: 'PRESUMPTIVE POSITIVE',
    color: 'text-rose-400',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/60',
    glow: 'shadow-rose-950/50',
    description: 'Chemical reagent color shift aligns with reference threshold for the target scheduled substance.',
    icon: AlertOctagon,
  },
  NEGATIVE: {
    label: 'NO TARGET REACTION DETECTED',
    badge: 'PRESUMPTIVE NEGATIVE',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/60',
    glow: 'shadow-emerald-950/50',
    description: 'No characteristic color reaction observed. Sample baseline reagent remains unreacted.',
    icon: CheckCircle2,
  },
  INCONCLUSIVE: {
    label: 'INCONCLUSIVE COLOR SHIFT',
    badge: 'INCONCLUSIVE',
    color: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/60',
    glow: 'shadow-amber-950/50',
    description: 'Atypical or ambiguous color change detected that does not meet confidence thresholds.',
    icon: AlertTriangle,
  },
  RETAKE_REQUIRED: {
    label: 'IMAGE QUALITY GATE REJECTED',
    badge: 'RETAKE MANDATED',
    color: 'text-purple-400',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/60',
    glow: 'shadow-purple-950/50',
    description: 'Optical quality failed (excessive blur, glare reflection, or missing color calibration card).',
    icon: Camera,
  },
};

export const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [record, setRecord] = useState<TestAnalysisResponse | null>(
    (location.state as any)?.result ?? null
  );
  const [loading, setLoading] = useState(!record);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record || !id) return;
    fetchTestDetail(id)
      .then((data) => setRecord(data as any))
      .catch(() => setError("Could not retrieve test record."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p>Loading field test result…</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">{error}</p>
        <Link to="/history" className="text-cyan-400 text-xs font-mono font-bold hover:underline">
          Return to Test History
        </Link>
      </div>
    );
  }

  const result = (record.presumptive_result || 'INCONCLUSIVE') as Result;
  const cfg = RESULT_STYLES[result] || RESULT_STYLES['INCONCLUSIVE'];
  const ResultIcon = cfg.icon;
  const needsRetake = result === 'RETAKE_REQUIRED';
  const quality = record.quality_result;

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Workflow Stepper ── */}
        <WorkflowProgress current="RESULT" />

        {/* ── Level 1 Hero Banner ── */}
        <div className={`rounded-3xl border-2 p-6 sm:p-7 ${cfg.bg} ${cfg.border} ${cfg.glow} shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-sm`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className={`p-3 rounded-2xl bg-slate-950/80 border ${cfg.border} shrink-0`}>
                <ResultIcon className={`w-8 h-8 ${cfg.color}`} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  PRESUMPTIVE FIELD TEST RESULT
                </span>
                <h1 className={`text-xl sm:text-2xl font-black ${cfg.color} tracking-tight`}>
                  {cfg.label}
                </h1>
                {record.target_substance && result !== 'RETAKE_REQUIRED' && (
                  <p className="text-sm text-slate-200 font-sans pt-1">
                    Detected Substance Profile:{' '}
                    <span className="font-black text-white font-mono">{record.target_substance}</span>
                  </p>
                )}
              </div>
            </div>

            {record.explanation?.confidence_level && !needsRetake && (
              <ConfidencePill level={record.explanation.confidence_level} />
            )}
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed border-t border-slate-800/80 pt-3">
            {cfg.description}
          </p>

          {/* Test ID & Signature Indicator */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/70 px-3.5 py-2 rounded-xl border border-slate-800">
            <span>Test ID: <strong className="text-cyan-400">{record.test_id}</strong></span>
            <span>Seq #{record.sequence_number || 1} · RSA Signed</span>
          </div>
        </div>

        {/* ── Level 2: Quality Gates & Verification Breakdown ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Verification Pipeline Gates
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                label: 'Image Quality Gate',
                ok: quality?.classification_allowed ?? false,
                desc: quality?.classification_allowed ? 'Passed blur & lighting metrics' : 'Image quality below threshold',
              },
              {
                label: 'Reference Card Calibration',
                ok: quality?.reference_card_detected ?? false,
                desc: quality?.reference_card_detected ? 'Color calibration applied' : 'Reference card not detected',
              },
              {
                label: 'Colorimetric Analysis',
                ok: !needsRetake,
                desc: !needsRetake ? 'Hue & ΔE color distance evaluated' : 'Classification inhibited due to quality',
              },
              {
                label: 'Tamper-Evident Evidence',
                ok: !!record.test_id && !needsRetake,
                desc: record.test_id && !needsRetake ? 'SHA-256 fingerprint generated' : 'Pending acceptable capture',
              },
            ].map(({ label, ok, desc }) => (
              <div
                key={label}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs font-mono ${
                  ok
                    ? 'bg-emerald-950/20 border-emerald-600/30 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-600/40 text-rose-300'
                }`}
              >
                {ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-white text-[11px]">{label}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Match Details Explanation ── */}
        {record.explanation?.match_quality && !needsRetake && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2 shadow-xl">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Interpretation Context
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {record.explanation.match_quality}
            </p>
            {record.explanation.observed_hue_range && (
              <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>Observed Hue: <strong className="text-slate-200">{record.explanation.observed_hue_range}</strong></span>
                {record.explanation.color_distance && (
                  <span>ΔE Distance: <strong className="text-cyan-400">{record.explanation.color_distance}</strong></span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Mandatory Legal Disclaimer ── */}
        <div className="flex items-start gap-3 p-4 bg-amber-950/30 border border-amber-600/40 rounded-2xl text-xs text-amber-200 shadow-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-white">Confirmatory Laboratory Testing Required</p>
            <p className="text-amber-300/80 leading-relaxed text-[11px]">
              This is a preliminary presumptive chemical test for on-site screening under NDPS Act Section 42. It does NOT replace definitive forensic identification by CFSL/CRCL.
            </p>
          </div>
        </div>

        {/* ── Primary Action CTAs ── */}
        {needsRetake ? (
          <div className="space-y-3">
            <button
              id="result-retake-btn"
              onClick={() => navigate('/test/prepare', { replace: true })}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 text-white font-mono font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-purple-950/50"
            >
              <RotateCcw className="w-5 h-5" />
              <span>RETAKE FIELD PHOTO</span>
            </button>
            <Link
              to="/history"
              className="block text-center text-xs font-mono text-slate-400 hover:text-slate-200 py-2"
            >
              Back to Test History
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              id="result-view-evidence-btn"
              to={`/test/evidence/${record.test_id}`}
              state={{ result: record }}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-cyan-500/25"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>VIEW EVIDENCE & CRYPTOGRAPHIC CHAIN</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/test/prepare', { replace: true })}
                className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Start New Test</span>
              </button>
              <Link
                to="/history"
                className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Clock className="w-4 h-4" />
                <span>Test History</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
