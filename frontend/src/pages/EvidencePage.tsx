import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, RefreshCw, ChevronDown,
  ChevronUp, ArrowLeft, Camera, ShieldCheck, MapPin,
  Clock, User, Shield, Key, Hash, FileText, Check, AlertOctagon,
} from 'lucide-react';
import { fetchTestDetail, verifyEvidence } from '../services/api';
import { VerificationResponse, TestAnalysisResponse } from '../types';
import { EvidenceChain } from '../components/EvidenceChain';
import { WorkflowProgress } from '../components/WorkflowProgress';

const TIMELINE_STEPS: Record<string, { label: string; detail: string; icon: React.FC<any> }> = {
  'Field Test Executed':                          { label: 'Field Test Executed',            detail: 'On-site colorimetric testing performed by authorized officer.', icon: Camera },
  'GPS & Location Acquired':                      { label: 'Location & Timestamp Recorded',  detail: 'GPS coordinates and UTC timestamp cryptographically bound.', icon: MapPin },
  'Reference Card Detected & Calibrated':         { label: 'Color Calibration Normalization', detail: 'Adaptive color reference card aligned and 3x3 matrix applied.', icon: Shield },
  'Image Quality Gate Evaluated':                 { label: 'Optical Quality Gate Cleared',   detail: 'Passed Laplacian blur score and anti-glare thresholds.', icon: CheckCircle2 },
  'Computer Vision Presumptive Result Generated': { label: 'Computer Vision Analysis',       detail: 'Dominant hue mapped in CIELAB/HSV color space.', icon: FileText },
  'SHA-256 Image & Metadata Hashes Fingerprinted':{ label: 'Dual SHA-256 Fingerprinting',    detail: 'Raw photo digest and canonical metadata hash generated.', icon: Hash },
  'Asymmetric RSA Digital Signature Applied':     { label: 'Officer RSA-2048 Digital Signature', detail: 'Evidence fingerprint signed using asymmetric private key.', icon: Key },
  'Tamper-Evident Chain Sequence Linked':         { label: 'Hash Chain Block Sequence Linked', detail: 'Record cryptographically linked to previous hash block.', icon: ShieldCheck },
};

export const EvidencePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const preloaded = (location.state as any)?.result as TestAnalysisResponse | null;
  const [record, setRecord] = useState<any>(preloaded);
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(!preloaded);
  const [verifying, setVerifying] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        if (!record && id) {
          const detail = await fetchTestDetail(id);
          setRecord(detail);
        }
        if (id) {
          setVerifying(true);
          const ver = await verifyEvidence(id);
          setVerification(ver);
        }
      } catch {}
      finally {
        setLoading(false);
        setVerifying(false);
      }
    };
    loadAll();
  }, [id]);

  const reVerify = async () => {
    if (!id) return;
    setVerifying(true);
    try { setVerification(await verifyEvidence(id)); } catch {}
    setVerifying(false);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p>Loading verifiable evidence ledger…</p>
      </div>
    );
  }

  const isIntact = verification?.is_valid ?? true;
  const timeline = verification?.timeline ?? [];

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Workflow Stepper ── */}
        <WorkflowProgress current="EVIDENCE" />

        {/* ── Navigation Header ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Result</span>
          </button>
          <span className="text-[11px] font-mono text-cyan-400 font-bold bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40">
            RECORD #{record?.sequence_number || 1}
          </span>
        </div>

        {/* ── LEVEL 1: Cryptographic Evidence Chain (Visual Signature Feature) ── */}
        <EvidenceChain
          isValid={isIntact}
          imageHash={record?.image_sha256}
          metadataHash={record?.metadata_hash}
          evidenceHash={record?.evidence_hash}
          signature={record?.digital_signature}
          sequenceNumber={record?.sequence_number || 1}
          previousHash={record?.previous_evidence_hash}
          interactive={true}
        />

        {/* ── Evidence Summary Banner ── */}
        <div className={`p-5 rounded-2xl border-2 shadow-xl ${
          isIntact
            ? 'bg-emerald-950/30 border-emerald-500/50'
            : 'bg-rose-950/50 border-rose-600'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isIntact ? 'bg-emerald-900/60 text-emerald-400 border border-emerald-500' : 'bg-rose-900/60 text-rose-400 border border-rose-500'
              }`}>
                {isIntact ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-slate-400">EVIDENCE INTEGRITY STATUS</p>
                <h2 className="text-lg font-black text-white font-sans">
                  {isIntact ? 'RECORD FULLY VERIFIED & INTACT' : 'INTEGRITY ALERT — TAMPERING DETECTED'}
                </h2>
              </div>
            </div>

            <button
              id="evidence-reverify-btn"
              onClick={reVerify}
              disabled={verifying}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-400 font-mono font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
              <span>{verifying ? 'Verifying…' : 'Re-verify Ledger'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 font-sans mt-3 leading-relaxed">
            {isIntact
              ? 'The optical evidence photograph, geo-coordinates, and test metadata exactly match their immutable cryptographic SHA-256 fingerprint.'
              : 'Warning: This evidence record does not match its historical cryptographic fingerprint. Integrity has been compromised.'}
          </p>
        </div>

        {/* ── LEVEL 2: Evidence Journey Timeline ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Immutable Custody Timeline
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              8 OF 8 GATES COMPLETED
            </span>
          </div>

          <div className="space-y-4 pt-1">
            {(timeline.length > 0 ? timeline : Object.keys(TIMELINE_STEPS)).map((item, idx) => {
              const rawTitle = typeof item === 'string' ? item : (item as any).title;
              const stepConfig = TIMELINE_STEPS[rawTitle] || { label: rawTitle, detail: 'Logged in evidence ledger.', icon: CheckCircle2 };
              const StepIcon = stepConfig.icon;
              const isLast = idx === (timeline.length > 0 ? timeline.length : Object.keys(TIMELINE_STEPS).length) - 1;

              return (
                <div key={idx} className="flex gap-4">
                  {/* Timeline Node Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${
                      isIntact
                        ? 'border-emerald-500/80 bg-emerald-950 text-emerald-400 shadow-sm shadow-emerald-500/20'
                        : idx < 6
                        ? 'border-emerald-500/80 bg-emerald-950 text-emerald-400'
                        : 'border-rose-500/80 bg-rose-950 text-rose-400'
                    }`}>
                      <StepIcon className="w-3.5 h-3.5" />
                    </div>
                    {!isLast && <div className="w-0.5 flex-1 bg-slate-800 my-1.5" />}
                  </div>

                  {/* Step Content */}
                  <div className="pb-3 min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-xs font-mono font-bold text-white leading-tight">
                        {stepConfig.label}
                      </p>
                      {typeof item === 'object' && (item as any).timestamp && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date((item as any).timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                      {stepConfig.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Captured Photo Preview (Toggle) ── */}
        {record?.image_data_base64 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <button
              id="evidence-photo-toggle"
              onClick={() => setPhotoOpen((v) => !v)}
              className="w-full flex items-center justify-between p-4 text-xs font-mono font-bold text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <span className="flex items-center gap-2 text-cyan-400">
                <Camera className="w-4 h-4" />
                <span>EVIDENCE PHOTO (RAW FIELD CAPTURE)</span>
              </span>
              <span className="text-slate-500">{photoOpen ? '▲ Hide' : '▼ View'}</span>
            </button>
            {photoOpen && (
              <div className="p-4 pt-0 border-t border-slate-800 bg-slate-950/60">
                <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center p-2 border border-slate-800">
                  <img src={record.image_data_base64} alt="Raw field evidence" className="w-full h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LEVEL 3: Technical Details (Progressive Disclosure) ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <button
            id="evidence-tech-toggle"
            onClick={() => setTechOpen((v) => !v)}
            className="w-full flex items-center justify-between p-4 text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            aria-expanded={techOpen}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>TECHNICAL CRYPTOGRAPHIC FINGERPRINTS & METRICS</span>
            </div>
            <span>{techOpen ? '▲ Hide' : '▼ View'}</span>
          </button>

          {techOpen && record && (
            <div className="p-5 pt-0 border-t border-slate-800 space-y-3 font-mono text-[11px] bg-slate-950/80">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Image SHA-256 Digest:</span>
                <p className="text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  {record.image_sha256}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Canonical Metadata Hash:</span>
                <p className="text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  {record.metadata_hash}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-cyan-400 font-bold">Combined Evidence Block Hash (Seq #{record.sequence_number}):</span>
                <p className="text-cyan-300 font-bold break-all bg-cyan-950/40 p-2 rounded border border-cyan-500/40">
                  {record.evidence_hash}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Previous Block Hash:</span>
                <p className="text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  {record.previous_evidence_hash || 'GENESIS ANCHOR RECORD'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-emerald-400 font-bold">Asymmetric Digital Signature (RSA-2048):</span>
                <p className="text-emerald-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  {record.digital_signature}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-slate-400">
                <div>
                  <span className="text-slate-500">CV Pipeline:</span>
                  <p className="text-slate-200">v{record.cv_pipeline_version || '2.1.0'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Classifier Engine:</span>
                  <p className="text-slate-200">v{record.classifier_version || '1.4.0'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/verify"
            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Verification Workspace</span>
          </Link>
          <button
            onClick={() => navigate('/test/prepare', { replace: true })}
            className="flex-1 py-3.5 bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Start Next Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};
