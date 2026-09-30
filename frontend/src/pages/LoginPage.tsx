import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Eye, EyeOff, AlertCircle, Lock, ArrowRight,
  ShieldCheck, CheckCircle2, Scan, Database, Key,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t, languages, lang, setLang } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your officer username and password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password.trim());
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] flex flex-col lg:flex-row text-slate-100">
      {/* ── Left side: PRAMANIRIKSH Branding & Evidence Verification Motif ── */}
      <div className="lg:w-1/2 bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0A1628] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle grid and glow background */}
        <div className="absolute inset-0 bg-field-grid opacity-30 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl text-white tracking-wider font-mono">PRAMANIRIKSH</span>
              <p className="text-[11px] text-cyan-400 font-mono">AI-Powered Field Test Verification</p>
            </div>
          </div>
        </div>

        {/* Central Visual: Evidence Chain & Security Workflow */}
        <div className="my-10 lg:my-0 relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Presumptive Field Testing & Cryptographic Custody
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              From field test to <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                verifiable evidence.
              </span>
            </h2>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Standardized colorimetric CV interpretation, reference card calibration, asymmetric digital signatures, and tamper-evident hash chaining for investigating officers.
            </p>
          </div>

          {/* Technical Evidence Flow Node Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3 max-w-md">
            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Verification Engine Architecture
            </p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                <Scan className="w-4 h-4 text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-300 font-bold">01 CAPTURE</span>
                <span className="text-[9px] text-slate-500">Ref Card</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-300 font-bold">02 CHECK</span>
                <span className="text-[9px] text-slate-500">CV Quality</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                <Database className="w-4 h-4 text-blue-400 mb-1" />
                <span className="text-[10px] text-slate-300 font-bold">03 ANALYSE</span>
                <span className="text-[9px] text-slate-500">Lab Space</span>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex flex-col items-center">
                <Key className="w-4 h-4 text-purple-400 mb-1" />
                <span className="text-[10px] text-slate-300 font-bold">04 SIGN</span>
                <span className="text-[9px] text-slate-500">RSA-2048</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Narcotics Control Bureau (NCB)</span>
          <span>Ministry of Home Affairs · Govt of India</span>
        </div>
      </div>

      {/* ── Right side: Clean Login Form ── */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-6">

          {/* Top language selector in login */}
          <div className="flex justify-end items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">Language:</span>
            <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    lang === l.code
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l.native_name || l.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-7 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider mb-1">
                <Lock className="w-3.5 h-3.5" />
                <span>Authorized Officer Access</span>
              </div>
              <h2 className="text-2xl font-black text-white">Sign In</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered official officer credentials. Role and permissions are detected automatically.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-username" className="block text-xs font-mono font-bold text-slate-300 mb-1.5">
                  Officer Username / Official Email
                </label>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(null); }}
                  placeholder="e.g. rajesh.sharma@narcotics.gov.in"
                  className="w-full bg-slate-950 text-white text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder:text-slate-600 transition-all font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-mono font-bold text-slate-300">
                    Security Passcode / Token
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(null); }}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 text-white text-sm px-4 py-3 pr-11 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder:text-slate-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-rose-950/60 border border-rose-700/50 rounded-xl text-xs text-rose-300 animate-fade">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials & Keypair…</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Officer</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* 1-Tap Quick Demo Role Logins */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Quick Officer Demo Logins:</span>
                <span className="text-cyan-400">1-Tap Sign In</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-left">
                {[
                  { name: 'Field Officer', user: 'rajesh.sharma', role: 'OPERATOR' as const, badge: 'NCB-DEL-742', color: 'border-blue-500/40 text-blue-400' },
                  { name: 'Lab Supervisor', user: 'priya.patel', role: 'SUPERVISOR' as const, badge: 'NCB-MUM-108', color: 'border-emerald-500/40 text-emerald-400' },
                  { name: 'Forensic Analyst', user: 'vikram.singh', role: 'FORENSIC' as const, badge: 'CFSL-CH-554', color: 'border-purple-500/40 text-purple-400' },
                  { name: 'Judicial Auditor', user: 'ananya.deshmukh', role: 'AUDITOR' as const, badge: 'JUD-DEL-019', color: 'border-amber-500/40 text-amber-400' },
                  { name: 'System Admin', user: 'suresh.kumar', role: 'ADMIN' as const, badge: 'NCB-HQ-001', color: 'border-rose-500/40 text-rose-400' },
                ].map((officer) => (
                  <button
                    key={officer.user}
                    type="button"
                    onClick={async () => {
                      setUsername(officer.user);
                      setPassword('password123');
                      setSubmitting(true);
                      try {
                        await login(officer.user, 'password123', officer.role);
                        navigate('/', { replace: true });
                      } catch {
                        // handled by context
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className={`p-2 rounded-lg bg-slate-950/80 border ${officer.color} hover:bg-slate-800/80 transition-all text-xs font-mono text-left group`}
                  >
                    <div className="font-bold text-slate-200 group-hover:text-white truncate">{officer.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{officer.user}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-center space-y-1 text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-400">NCB Section 42 NDPS Presumptive Testing Portal</p>
            <p className="text-[11px] text-slate-600">
              Presumptive field screening only. Does NOT replace CFSL/CRCL confirmatory laboratory analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
