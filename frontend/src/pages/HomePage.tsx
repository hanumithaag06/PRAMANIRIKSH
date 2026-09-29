import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, CheckCircle, History, Database, HelpCircle, Shield, Award, Cpu, AlertTriangle, ArrowRight, Activity, Lock, RefreshCw } from 'lucide-react';
import { fetchTestHistory } from '../services/api';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState({ total: 1, verified: 1, pending: 0 });

  useEffect(() => {
    fetchTestHistory()
      .then((tests) => {
        if (tests && tests.length > 0) {
          setStats({
            total: tests.length,
            verified: tests.filter((t: any) => !t.is_tampered_demo).length,
            pending: 0
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 p-8 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold px-3 py-1 rounded-full mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>SIH 2026 • PS ID: 26231 • MINISTRY OF HOME AFFAIRS</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-3">
            PRAMANIRIKSH
          </h1>
          <p className="text-base md:text-lg text-slate-300 font-medium mb-6 leading-relaxed">
            AI-Powered Evidence-Aware Field Testing & Verification Platform. Standardizing colorimetric field drug tests using computer vision, adaptive reference calibration, and cryptographic tamper-evident records without new hardware.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/capture"
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 text-sm transition-transform active:scale-95"
            >
              <Camera className="w-4 h-4" /> START NEW FIELD TEST
            </Link>
            <Link
              to="/verify"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 flex items-center gap-2 text-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" /> VERIFY RECORD INTEGRITY
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">Field Tests Logged</p>
            <p className="text-3xl font-extrabold text-white font-mono mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">Verified Records</p>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{stats.verified}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase">Offline Queue</p>
            <p className="text-3xl font-extrabold text-cyan-400 font-mono mt-1">{stats.pending}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Novelty Capability Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-gold" /> Architectural Novelty & Core Differentiators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/40 transition-colors">
            <Cpu className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-bold text-white text-sm mb-1">Adaptive Color Calibration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects Reference Card patches to estimate white balance and color cast, executing 3x3 gain normalization before classification.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-emerald-500/40 transition-colors">
            <AlertTriangle className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white text-sm mb-1">Image Quality Gate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates Laplacian blur, brightness, glare, and card visibility. Rejects poor images as RETAKE REQUIRED instead of forced guessing.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-gold/40 transition-colors">
            <Lock className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-bold text-white text-sm mb-1">Tamper-Evident Hash Chain</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              SHA-256 fingerprinting of Image + Metadata + RSA digital signature linked in an append-only sequence for verifiable auditability.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-purple-500/40 transition-colors">
            <Database className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-bold text-white text-sm mb-1">Kit-Agnostic Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Domain logic loaded dynamically from database Kit Profiles. Zero hardcoded drug names or hue limits in source code.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link
          to="/capture"
          className="group bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Capture & Analyze</h3>
          <p className="text-xs text-slate-400">Use live camera or sample cards to evaluate color reactions with explainable CV metrics.</p>
        </Link>

        <Link
          to="/history"
          className="group bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Searchable Test Log</h3>
          <p className="text-xs text-slate-400">Filter past field test records by Test ID, operator, kit profile, date range, or result.</p>
        </Link>

        <Link
          to="/verify"
          className="group bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Evidence Verification</h3>
          <p className="text-xs text-slate-400">Independently re-validate SHA-256 evidence fingerprinting, RSA signature, and tamper detection.</p>
        </Link>
      </div>
    </div>
  );
};
