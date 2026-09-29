import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertTriangle, Search, RefreshCw, Lock, ArrowRight } from 'lucide-react';
import { fetchTestHistory, verifyEvidence, tamperTestRecordDemo } from '../services/api';
import { VerificationResponse } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const VerificationPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [verification, setVerification] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [tampering, setTampering] = useState(false);

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
    try {
      const res = await verifyEvidence(id);
      setVerification(res);
    } catch (err) {
      setVerification(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTest = (id: string) => {
    setSelectedTestId(id);
    runVerify(id);
  };

  const handleTamperDemo = async () => {
    if (!selectedTestId) return;
    setTampering(true);
    try {
      await tamperTestRecordDemo(selectedTestId);
      await runVerify(selectedTestId);
    } catch (err) {}
    setTampering(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" /> CRYPTOGRAPHIC EVIDENCE INTEGRITY VERIFICATION
        </h1>
        <p className="text-xs text-slate-400 font-mono">
          Independent cryptographic recalculation of Image SHA-256, Canonical Metadata Hash, RSA Digital Signature, and Append-Only Hash Chain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Test Selection List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-mono text-slate-400 font-bold uppercase">Select Record to Verify:</span>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {tests.map((t) => (
              <button
                key={t.test_id}
                onClick={() => handleSelectTest(t.test_id)}
                className={`w-full text-left p-3.5 rounded-xl border font-mono transition-all ${
                  selectedTestId === t.test_id
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{t.test_id}</span>
                  <StatusBadge type="result" value={t.presumptive_result} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>{t.operator_name}</span>
                  <span>Seq #{t.sequence_number}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Verification Inspection Panel */}
        <div className="lg:col-span-8">
          {verification ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
              {/* Status Header & Interactive Tamper Demo Trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white font-mono">{verification.test_id}</h2>
                    <StatusBadge type="verification" value={verification.status_label} />
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-1">Verified at: {new Date(verification.verified_at).toLocaleTimeString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTamperDemo}
                    disabled={tampering}
                    className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-mono font-bold text-xs rounded-xl border border-rose-600/50 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>{tampering ? 'Tampering...' : 'SIMULATE TAMPERING'}</span>
                  </button>

                  <button
                    onClick={() => runVerify(selectedTestId)}
                    disabled={loading}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>RE-CHECK</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              {verification.is_valid ? (
                <div className="bg-emerald-950/90 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 font-mono text-xs flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-sm text-emerald-300 uppercase block">CRYPTOGRAPHIC INTEGRITY CONFIRMED</span>
                    <span>Image SHA-256, metadata fingerprint, RSA signature, and append-only sequence chain match perfectly.</span>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/90 border-2 border-rose-600 p-4 rounded-xl text-rose-200 font-mono text-xs space-y-2 animate-pulse">
                  <div className="flex items-center gap-2 font-black text-sm text-rose-300">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span>INTEGRITY CHECK FAILED — EVIDENCE TAMPERING DETECTED!</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] opacity-90 space-y-1">
                    {verification.details.failure_reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cryptographic Check Breakdown Table */}
              <div className="space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase">Verification Sub-System Diagnostics:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl border ${verification.image_hash_valid ? 'bg-slate-950 border-emerald-500/40' : 'bg-rose-950/60 border-rose-500/60'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-[11px]">Image SHA-256 Check</span>
                      <span className={verification.image_hash_valid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {verification.image_hash_valid ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{verification.details.image_sha256}</p>
                  </div>

                  <div className={`p-3 rounded-xl border ${verification.metadata_hash_valid ? 'bg-slate-950 border-emerald-500/40' : 'bg-rose-950/60 border-rose-500/60'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-[11px]">Metadata Canonical Hash</span>
                      <span className={verification.metadata_hash_valid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {verification.metadata_hash_valid ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{verification.details.stored_metadata_hash}</p>
                  </div>

                  <div className={`p-3 rounded-xl border ${verification.signature_valid ? 'bg-slate-950 border-emerald-500/40' : 'bg-rose-950/60 border-rose-500/60'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-[11px]">RSA Digital Signature</span>
                      <span className={verification.signature_valid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {verification.signature_valid ? 'VALID' : 'INVALID'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Asymmetric Officer Signature Verified</p>
                  </div>

                  <div className={`p-3 rounded-xl border ${verification.chain_valid ? 'bg-slate-950 border-emerald-500/40' : 'bg-rose-950/60 border-rose-500/60'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-[11px]">Append-Only Hash Chain</span>
                      <span className={verification.chain_valid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {verification.chain_valid ? 'INTACT' : 'BROKEN'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">Previous Hash Linked (Seq #{verification.details.sequence_number})</p>
                  </div>
                </div>
              </div>

              <Link
                to={`/tests/${verification.test_id}`}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors font-mono"
              >
                <span>OPEN DETAILED RECORD & EVIDENCE TIMELINE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
              <Lock className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p>Select a test record from the left to execute cryptographic verification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
