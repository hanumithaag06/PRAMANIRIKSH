import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Clock, User, CheckCircle, AlertTriangle, ArrowLeft, RefreshCw, Cpu, Layers, Lock, FileText } from 'lucide-react';
import { fetchTestDetail, verifyEvidence, tamperTestRecordDemo } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { QualityBadge } from '../components/QualityBadge';
import { VerificationResponse } from '../types';

export const TestDetailPage: React.FC = () => {
  const { test_id } = useParams<{ test_id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (test_id) {
      loadDetail();
    }
  }, [test_id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchTestDetail(test_id!);
      setRecord(data);
      // Auto run verification check
      const verRes = await verifyEvidence(test_id!);
      setVerification(verRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load test detail');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyEvidence(test_id!);
      setVerification(res);
    } catch (err) {}
    setVerifying(false);
  };

  const handleTamperDemo = async () => {
    if (!test_id) return;
    setTampering(true);
    try {
      await tamperTestRecordDemo(test_id);
      await loadDetail();
    } catch (err) {}
    setTampering(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
        <p>Loading Cryptographic Evidence Record {test_id}...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">{error || 'Requested test record does not exist.'}</p>
        <Link to="/history" className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to Test History
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Test History
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTamperDemo}
            disabled={tampering}
            className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-mono font-bold text-xs rounded-xl border border-rose-600/50 flex items-center gap-2"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{tampering ? 'Tampering Record...' : 'DEMO: SIMULATE TAMPERING'}</span>
          </button>

          <button
            onClick={handleManualVerify}
            disabled={verifying}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{verifying ? 'Verifying Hashes...' : 'RE-VERIFY INTEGRITY'}</span>
          </button>
        </div>
      </div>

      {/* Main Evidence Card Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white font-mono">{record.test_id}</h1>
              {verification && (
                <StatusBadge type="verification" value={verification.status_label} />
              )}
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Captured: {new Date(record.timestamp).toLocaleString()} • Kit: {record.kit_name} ({record.kit_version})
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800">
            <StatusBadge type="result" value={record.presumptive_result} />
            <div className="text-right font-mono">
              <p className="text-[10px] text-slate-500 uppercase">Confidence</p>
              <p className="text-xl font-black text-cyan-400">{(record.confidence_score * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Verification Warning Alert if Tampered */}
        {verification && !verification.is_valid && (
          <div className="bg-rose-950/90 border-2 border-rose-600 p-4 rounded-xl text-rose-200 font-mono text-xs space-y-2 animate-pulse">
            <div className="flex items-center gap-2 font-black text-sm text-rose-300">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>INTEGRITY CHECK FAILED — TAMPERING DETECTED!</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90">
              {verification.details.failure_reasons.map((reason: string, idx: number) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 2-Column Record Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Original Captured Image & Map Coordinates */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">Stored Evidence Photo</span>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                <img src={record.image_data_base64} alt="Evidence" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* GPS & Officer Information */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4" />
                <span>FIELD METADATA & OPERATOR IDENTITY</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Operator:</span>
                  <p className="text-slate-200 font-bold">{record.operator_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Badge ID:</span>
                  <p className="text-slate-200">{record.badge_id}</p>
                </div>
                <div>
                  <span className="text-slate-500">Department:</span>
                  <p className="text-slate-200">{record.department}</p>
                </div>
                <div>
                  <span className="text-slate-500">GPS Coordinates:</span>
                  <p className="text-emerald-400 font-bold">
                    {record.latitude ? `${record.latitude.toFixed(4)}°, ${record.longitude.toFixed(4)}°` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Technical CV & Cryptographic Proof */}
          <div className="lg:col-span-7 space-y-4">
            {/* Quality & Calibration metrics */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-300">EXPLAINABLE CV PIPELINE METRICS</span>
                <span className="text-slate-500">v{record.cv_pipeline_version}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-slate-500">Quality Score:</span>
                  <p className="text-emerald-400 font-bold font-mono">{(record.quality_score * 100).toFixed(0)}% (Passed)</p>
                </div>
                <div>
                  <span className="text-slate-500">Dominant Hue:</span>
                  <p className="text-amber-400 font-bold">{record.explanation?.observed_hue_range}</p>
                </div>
                <div>
                  <span className="text-slate-500">Color Distance (Delta-E):</span>
                  <p className="text-cyan-400 font-bold">{record.explanation?.color_distance}</p>
                </div>
                <div>
                  <span className="text-slate-500">Match Quality:</span>
                  <p className="text-slate-200">{record.explanation?.match_quality}</p>
                </div>
              </div>
            </div>

            {/* Cryptographic Hashes & Signatures */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-gold font-bold border-b border-slate-800 pb-2">
                <Lock className="w-4 h-4" />
                <span>CRYPTOGRAPHIC TAMPER-EVIDENT CHAIN</span>
              </div>
              <div className="space-y-2 text-[11px] break-all">
                <div>
                  <span className="text-slate-500">Image SHA-256:</span>
                  <p className="text-slate-300 font-mono bg-slate-900 p-1.5 rounded">{record.image_sha256}</p>
                </div>
                <div>
                  <span className="text-slate-500">Canonical Metadata Hash:</span>
                  <p className="text-slate-300 font-mono bg-slate-900 p-1.5 rounded">{record.metadata_hash}</p>
                </div>
                <div>
                  <span className="text-slate-500">Evidence Hash (Block #{record.sequence_number}):</span>
                  <p className="text-cyan-400 font-mono bg-slate-900 p-1.5 rounded font-bold">{record.evidence_hash}</p>
                </div>
                <div>
                  <span className="text-slate-500">Previous Chain Hash:</span>
                  <p className="text-slate-400 font-mono bg-slate-900 p-1.5 rounded">{record.previous_evidence_hash || 'GENESIS BLOCK'}</p>
                </div>
                <div>
                  <span className="text-slate-500">RSA Asymmetric Digital Signature:</span>
                  <p className="text-emerald-400 font-mono bg-slate-900 p-1.5 rounded line-clamp-2">{record.digital_signature}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Audit Timeline */}
        {verification && verification.timeline && (
          <div className="space-y-3 pt-4 border-t border-slate-800 font-mono text-xs">
            <span className="font-bold text-slate-300 uppercase">Verifiable Audit Event Timeline</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {verification.timeline.map((step) => (
                <div key={step.step} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-cyan-400">
                    <span>STEP {step.step}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="font-bold text-white text-[11px] leading-tight">{step.title}</p>
                  <p className="text-[10px] text-slate-500">{new Date(step.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
