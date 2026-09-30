import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Layers, Shield } from 'lucide-react';
import { fetchKitProfiles } from '../services/api';
import { KitProfile } from '../types';
import { useTranslation } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { WorkflowProgress } from '../components/WorkflowProgress';

export const PreparePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [kits, setKits] = useState<KitProfile[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);

  useEffect(() => {
    const preselect = (location.state as any)?.kitId;
    fetchKitProfiles()
      .then((data) => {
        const active = data.filter((k) => k.is_active);
        setKits(active);
        setSelectedKitId(preselect || active[0]?.id || '');
      })
      .catch(() => setError('Could not load analysis configurations. Check your network or local cache.'))
      .finally(() => setLoading(false));
  }, [location.state]);

  const selectedKit = kits.find((k) => k.id === selectedKitId);

  const handleContinue = () => {
    if (!selectedKitId) return;
    navigate('/test/capture', {
      state: { kitId: selectedKitId, operatorId: user?.id },
      replace: false,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p>Loading active field test configurations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Configuration Unavailable</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-slate-800 border border-slate-700 text-cyan-400 font-mono text-xs rounded-xl hover:bg-slate-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Visual Workflow Stepper ── */}
        <WorkflowProgress current="PREPARE" className="mb-8" />

        {/* ── Page Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Step 01 of 06
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">Reagent Selection & SOP Guidance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Prepare Field Test</h1>
          <p className="text-xs text-slate-400 font-mono">
            Select the approved colorimetric kit profile and review mandatory reference card placement guidelines.
          </p>
        </div>

        {/* ── Configuration Selector (Data-Driven from DB) ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div>
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
              Active Kit Profile
            </label>
            <div className="space-y-2.5">
              {kits.map((kit) => {
                const isSelected = selectedKitId === kit.id;
                return (
                  <label
                    key={kit.id}
                    htmlFor={`kit-${kit.id}`}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                    }`}
                  >
                    <input
                      id={`kit-${kit.id}`}
                      type="radio"
                      name="kit"
                      value={kit.id}
                      checked={isSelected}
                      onChange={() => setSelectedKitId(kit.id)}
                      className="mt-1 accent-cyan-500"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{kit.name}</span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">
                          v{kit.version}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{kit.test_type}</p>

                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {(kit.target_substances || []).map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Capture Readiness Checklist ── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xl">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Mandatory Preparation Checklist
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-base">🎨</span>
              <div>
                <p className="font-bold text-white">Color Reference Card</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Place standard NCB reference card adjacent on same plane.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-base">💡</span>
              <div>
                <p className="font-bold text-white">Lighting Geometry</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Indirect white daylight or diffuse illumination. Avoid glare.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-base">⏱️</span>
              <div>
                <p className="font-bold text-white">Reaction Window</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Allow 30–60 seconds for colorimetric reaction stabilization.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <span className="text-base">📍</span>
              <div>
                <p className="font-bold text-white">GPS Coordinate Tag</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Device location will be cryptographically bound to test hash.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Kit SOP Instructions (Progressive Disclosure) ── */}
        {selectedKit?.instructions && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <button
              onClick={() => setInstructionsOpen((v) => !v)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-xs font-mono"
            >
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <BookOpen className="w-4 h-4" />
                <span>Field SOP Instructions ({selectedKit.kit_code})</span>
              </div>
              <span className="text-slate-500 font-bold">{instructionsOpen ? '▲ Hide' : '▼ View'}</span>
            </button>
            {instructionsOpen && (
              <div className="p-4 pt-1 border-t border-slate-800 text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/60">
                {selectedKit.instructions}
              </div>
            )}
          </div>
        )}

        {/* ── Primary CTA ── */}
        <button
          id="prepare-continue-btn"
          onClick={handleContinue}
          disabled={!selectedKitId}
          className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-cyan-500/20 disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          <span>Launch Camera Capture</span>
          <ChevronRight className="w-5 h-5" />
        </button>

        <p className="text-center text-[11px] font-mono text-slate-500">
          NDPS Section 42 Field Screening • Presumptive Only • Laboratory Confirmation Required
        </p>
      </div>
    </div>
  );
};
