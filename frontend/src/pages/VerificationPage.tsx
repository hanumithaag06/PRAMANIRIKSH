import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw,
  ArrowRight, ChevronDown, ChevronUp, Info, ShieldAlert,
  Key, Hash, Camera, Link2, AlertOctagon, Check,
} from 'lucide-react';
import { fetchTestHistory, verifyEvidence, tamperTestRecordDemo } from '../services/api';
import { VerificationResponse } from '../types';
import { ResultPill, VerificationPill } from '../components/PlainPills';
import { EvidenceChain } from '../components/EvidenceChain';

export const VerificationPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [techOpen, setTechOpen] = useState(false);

  useEffect(() => {
    fetchTestHistory()
      .then((data) => {
        setTests(data);
        if (data.length > 0) {
          setSelectedTestId(data[0].test_id);
          runVerify(data[0].test_id);
        }
      })
      .catch(() => {});
  }, []);

  const runVerify = async (id: string) => {
    setLoading(true);
    setTechOpen(false);
    try {
      setVerification(await verifyEvidence(id));
    } catch {
      setVerification(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedTestId(id);
    runVerify(id);
  };

  const handleTamperDemo = async () => {
    if (!selectedTestId) return;
    setTampering(true);
    try {
      await tamperTestRecordDemo(selectedTestId);
      await runVerify(selectedTestId);
    } catch {}
    setTampering(false);
  };

  const isIntact = verification?.is_valid ?? true;

  const checks = verification
    ? [
        { label: 'Image SHA-256 Digest Match', valid: verification.image_hash_valid, desc: 'Original optical capture matches stored cryptographic hash.' },
        { label: 'Canonical Metadata Integrity', valid: verification.metadata_hash_valid, desc: 'Operator, kit version, and GPS location unchanged.' },
        { label: 'Asymmetric RSA-2048 Signature', valid: verification.signature_valid, desc: "Officer's cryptographic digital signature verified authentic." },
        { label: 'Sequential Hash Chain Link', valid: verification.chain_valid, desc: 'Block pointer links seamlessly to preceding evidence block.' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Page Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Cryptographic Audit Trail
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Zero-Trust Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Evidence Verification Workspace</h1>
          <p className="text-xs text-slate-400 font-mono">
            Verify asymmetric RSA-2048 signatures, dual SHA-256 digests, and tamper-evident hash chain continuity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left Column: Select Evidence Record ── */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Select Evidence Record
            </span>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {tests.length === 0 ? (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs font-mono text-slate-500">
                  No records in ledger yet.
                </div>
              ) : (
                tests.map((t) => {
                  const isSelected = selectedTestId === t.test_id;
                  return (
                    <button
                      key={t.test_id}
                      id={`verify-select-${t.test_id}`}
                      onClick={() => handleSelect(t.test_id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500 shadow-lg'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-white truncate">{t.test_id}</span>
                        <ResultPill result={t.presumptive_result} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>{t.operator_name}</span>
                        <span className={t.is_tampered_demo ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {t.is_tampered_demo ? 'TAMPERED' : 'INTACT'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right Column: Interactive Verification Audit ── */}
          <div className="lg:col-span-8 space-y-5">
            {loading ? (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-slate-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span>Computing cryptographic digests & verifying signature…</span>
              </div>
            ) : verification ? (
              <div className="space-y-5">

                {/* ── Animated Visual Evidence Chain ── */}
                <EvidenceChain
                  isValid={isIntact}
                  imageHash={verification.details?.image_sha256}
                  metadataHash={verification.details?.stored_metadata_hash}
                  evidenceHash={verification.details?.stored_evidence_hash}
                  signature={(verification.details as any)?.digital_signature}
                  sequenceNumber={verification.details?.sequence_number || 1}
                  interactive={true}
                />

                {/* ── Verification Verdict Banner ── */}
                <div className={`p-6 rounded-2xl border-2 shadow-2xl ${
                  isIntact
                    ? 'bg-emerald-950/30 border-emerald-500/60'
                    : 'bg-rose-950/60 border-rose-600 ring-2 ring-rose-500/50'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        RECORD IDENTIFIER
                      </span>
                      <p className="text-base font-black text-white font-mono">{verification.test_id}</p>
                    </div>

                    <span
                      className={`text-xs font-mono font-black px-3.5 py-1.5 rounded-full border self-start sm:self-auto ${
                        isIntact
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                          : 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                      }`}
                    >
                      {isIntact ? 'VERIFICATION PASSED' : 'INTEGRITY BREACH'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans mt-3 leading-relaxed">
                    {isIntact
                      ? '✓ All cryptographic integrity checks verified successfully. The evidence chain block remains in an unbroken, uncompromised state.'
                      : '⚠ Integrity Alert: The digital signature or SHA-256 hash mismatch indicates deliberate or accidental modification of the stored record.'}
                  </p>
                </div>

                {/* ── Cryptographic Check Items ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Automated Verification Gates
                  </span>

                  <div className="space-y-2">
                    {checks.map(({ label, valid, desc }) => (
                      <div
                        key={label}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs font-mono ${
                          valid
                            ? 'bg-emerald-950/20 border-emerald-600/30 text-emerald-200'
                            : 'bg-rose-950/40 border-rose-600/50 text-rose-200'
                        }`}
                      >
                        {valid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px]">{label}</span>
                            <span className={`text-[10px] font-bold ${valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {valid ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <p className="text-[10px] opacity-75 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Progressive Technical Details ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <button
                    id="verify-tech-toggle"
                    onClick={() => setTechOpen((v) => !v)}
                    className="w-full flex items-center justify-between p-4 text-xs font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                    aria-expanded={techOpen}
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-cyan-400" />
                      <span>CRYPTOGRAPHIC AUDIT METRICS</span>
                    </div>
                    <span>{techOpen ? '▲ Hide' : '▼ View'}</span>
                  </button>

                  {techOpen && (
                    <div className="p-4 pt-0 border-t border-slate-800 space-y-2.5 font-mono text-[11px] bg-slate-950/80">
                      <div>
                        <span className="text-slate-500 font-bold">Image SHA-256:</span>
                        <p className="text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                          {verification.details?.image_sha256}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">Metadata Digest:</span>
                        <p className="text-slate-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                          {verification.details?.stored_metadata_hash}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">Evidence Hash:</span>
                        <p className="text-cyan-300 break-all bg-slate-900 p-2 rounded border border-slate-800">
                          {verification.details?.stored_evidence_hash}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Actions: Full Record & Demo Tamper Simulation ── */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    to={`/tests/${verification.test_id}`}
                    id="verify-open-record-link"
                    className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Inspect Full Test Dossier</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    id="verify-tamper-demo-btn"
                    onClick={handleTamperDemo}
                    disabled={tampering}
                    className="flex-1 py-3.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-mono font-bold text-xs rounded-xl border border-rose-600/40 flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-950/40"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>{tampering ? 'Simulating Tamper…' : 'DEMO: Simulate Tampering'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3 text-slate-500 font-mono text-xs">
                <ShieldCheck className="w-10 h-10 mx-auto text-slate-700" />
                <p>Select a record from the ledger on the left to verify cryptographic custody.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
