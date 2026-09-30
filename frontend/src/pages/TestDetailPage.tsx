import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck, MapPin, Clock, User, CheckCircle2,
  AlertTriangle, ArrowLeft, RefreshCw, ChevronDown, ChevronUp,
  Info, FileText, Camera, Shield, Key, Hash, AlertOctagon,
} from 'lucide-react';
import { fetchTestDetail, verifyEvidence, tamperTestRecordDemo } from '../services/api';
import { ResultPill, VerificationPill, ConfidencePill } from '../components/PlainPills';
import { VerificationResponse } from '../types';
import { EvidenceChain } from '../components/EvidenceChain';

export const TestDetailPage: React.FC = () => {
  const { test_id } = useParams<{ test_id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<any>(null);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techOpen, setTechOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(true);

  useEffect(() => {
    if (test_id) loadDetail();
  }, [test_id]);

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await fetchTestDetail(test_id!);
      setRecord(data);
      const verRes = await verifyEvidence(test_id!);
      setVerification(verRes);
    } catch (err: any) {
      setError("Could not load evidence record from database.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    setVerifying(true);
    try {
      setVerification(await verifyEvidence(test_id!));
    } catch {}
    setVerifying(false);
  };

  const handleTamperDemo = async () => {
    if (!test_id) return;
    setTampering(true);
    try {
      await tamperTestRecordDemo(test_id);
      await loadDetail();
    } catch {}
    setTampering(false);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p>Loading full evidence dossier…</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">{error || 'This test record does not exist in the ledger.'}</p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Test History
        </Link>
      </div>
    );
  }

  const isIntact = verification?.is_valid ?? true;

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Back Navigation ── */}
        <button
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Test History</span>
        </button>

        {/* ── LEVEL 1: Evidence Chain Visual Feature ── */}
        <EvidenceChain
          isValid={isIntact}
          imageHash={record.image_sha256}
          metadataHash={record.metadata_hash}
          evidenceHash={record.evidence_hash}
          signature={record.digital_signature}
          sequenceNumber={record.sequence_number || 1}
          previousHash={record.previous_evidence_hash}
          interactive={true}
        />

        {/* ── Level 1: Primary Result & Integrity Status ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                EVIDENCE DOSSIER
              </span>
              <h1 className="text-xl font-black text-white font-mono">{record.test_id}</h1>
            </div>
            {verification && (
              <VerificationPill valid={isIntact} />
            )}
          </div>

          {/* Tamper Alert */}
          {verification && !isIntact && (
            <div className="flex items-start gap-3 p-4 bg-rose-950/60 border-2 border-rose-600 rounded-xl text-xs text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Record Modification Alert</p>
                <p className="text-rose-300/90 mt-1 leading-relaxed">
                  Cryptographic verification failed: The current data fingerprint does not match the signed block in the tamper-evident chain.
                </p>
              </div>
            </div>
          )}

          {/* Result Overview */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Presumptive Classification</span>
              <div className="flex items-center gap-3">
                <ResultPill result={record.presumptive_result} size="lg" />
                {record.target_substance && (
                  <span className="text-xs font-mono text-slate-300">
                    Substance: <strong className="text-white">{record.target_substance}</strong>
                  </span>
                )}
              </div>
            </div>
            {record.explanation?.confidence_level && (
              <ConfidencePill level={record.explanation.confidence_level} />
            )}
          </div>
        </div>

        {/* ── LEVEL 2: Evidence Photo & Field Context ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <button
            id="photo-toggle"
            onClick={() => setPhotoOpen((v) => !v)}
            className="w-full flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/40 transition-colors"
            aria-expanded={photoOpen}
          >
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>CAPTURED OPTICAL EVIDENCE</span>
            </div>
            <span className="text-xs font-mono text-slate-500">{photoOpen ? '▲ Hide' : '▼ View'}</span>
          </button>
          {photoOpen && (
            <div className="p-4 bg-slate-950/70">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center p-2">
                <img
                  src={record.image_data_base64}
                  alt="Evidence field photo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Field Metadata Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Field Testing Context
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500">Timestamp</p>
                <p className="text-slate-200 font-bold">{new Date(record.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500">Authorized Operator</p>
                <p className="text-slate-200 font-bold">{record.operator_name}</p>
                <p className="text-slate-500 text-[10px]">{record.badge_id} · {record.department}</p>
              </div>
            </div>

            {record.latitude && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-500">GPS Location</p>
                  <p className="text-emerald-400 font-bold">
                    {record.latitude.toFixed(4)}°, {record.longitude?.toFixed(4)}° (±{record.gps_accuracy_m || 5}m)
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-slate-500">Reagent Configuration</p>
                <p className="text-slate-200 font-bold">{record.kit_name}</p>
                <p className="text-slate-500 text-[10px]">Version {record.kit_version}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── LEVEL 3: Technical Details (Progressive Disclosure) ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <button
            id="detail-tech-toggle"
            onClick={() => setTechOpen((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            aria-expanded={techOpen}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>CRYPTOGRAPHIC HASHES & METRICS</span>
            </div>
            <span>{techOpen ? '▲ Hide' : '▼ View'}</span>
          </button>

          {techOpen && (
            <div className="p-5 pt-0 border-t border-slate-800 space-y-2.5 font-mono text-[11px] bg-slate-950/80">
              <div>
                <span className="text-slate-500 font-bold">Raw Photo SHA-256 Digest:</span>
                <p className="text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">{record.image_sha256}</p>
              </div>
              <div>
                <span className="text-slate-500 font-bold">Canonical Metadata Hash:</span>
                <p className="text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">{record.metadata_hash}</p>
              </div>
              <div>
                <span className="text-cyan-400 font-bold">Evidence Hash (Block #{record.sequence_number}):</span>
                <p className="text-cyan-300 font-bold break-all bg-cyan-950/40 p-2 rounded border border-cyan-500/40">{record.evidence_hash}</p>
              </div>
              <div>
                <span className="text-emerald-400 font-bold">RSA Digital Signature:</span>
                <p className="text-emerald-300 break-all bg-slate-900 p-2 rounded border border-slate-800">{record.digital_signature}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Actions: Re-verify & Demo Tamper Simulation ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            id="re-verify-btn"
            onClick={handleManualVerify}
            disabled={verifying}
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{verifying ? 'Verifying Integrity…' : 'Re-verify Evidence Fingerprint'}</span>
          </button>

          <button
            id="tamper-demo-btn"
            onClick={handleTamperDemo}
            disabled={tampering}
            className="flex-1 py-3.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-mono font-bold text-xs rounded-xl border border-rose-600/40 flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/40"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{tampering ? 'Simulating…' : 'DEMO: Simulate Tampering'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
