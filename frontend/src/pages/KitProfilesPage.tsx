import React, { useState, useEffect } from 'react';
import { Database, Plus, CheckCircle, FileText, Layers, Shield, Sparkles, BookOpen } from 'lucide-react';
import { fetchKitProfiles } from '../services/api';
import { KitProfile } from '../types';

export const KitProfilesPage: React.FC = () => {
  const [kits, setKits] = useState<KitProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKitProfiles()
      .then((data) => setKits(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Reagent Specifications
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">Database-Driven</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <Database className="w-6 h-6 text-purple-400" />
              <span>Kit Profiles & Configuration</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Versioned colorimetric interpretation rules, CIELAB ranges, and calibration card profiles.
            </p>
          </div>

          <button
            onClick={() => alert('Kit Profile Management: Standardized NCB & CRCL configurations are managed by central system administrators.')}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Kit Configuration</span>
          </button>
        </div>

        {/* ── Kit Profiles Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-mono font-bold text-cyan-400">{kit.kit_code}</span>
                  <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-600/40">
                    ACTIVE (v{kit.version})
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-snug">{kit.name}</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{kit.manufacturer}</p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    Target Substances:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(kit.target_substances || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-900 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {kit.instructions && (
                  <div className="text-xs text-slate-400 space-y-1">
                    <span className="font-mono text-slate-300 font-bold text-[11px] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Field SOP Instruction:</span>
                    </span>
                    <p className="text-[11px] leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 font-sans text-slate-300">
                      {kit.instructions}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="truncate max-w-[150px]">{kit.test_type}</span>
                <span className="text-cyan-400 font-bold">CONFIG LOADED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
