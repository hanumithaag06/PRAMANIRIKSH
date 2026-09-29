import React, { useState, useEffect } from 'react';
import { Database, Plus, CheckCircle, FileText, Layers, Shield } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-purple-400" /> DATA-DRIVEN KIT PROFILES & CONFIGURATION
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero Hardcoded Drug Data • Extensible Field Reagent Profiles • Versioned Interpretation Rules
          </p>
        </div>

        <button
          onClick={() => alert('Custom Kit Profile Creator: Allows adding new colorimetric reagent specifications to the database dynamically!')}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> ADD NEW KIT PROFILE
        </button>
      </div>

      {/* Kit Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <div key={kit.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-mono font-bold text-cyan-400">{kit.kit_code}</span>
                <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-600/40">
                  ACTIVE (v{kit.version})
                </span>
              </div>

              <h3 className="text-base font-bold text-white leading-snug">{kit.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Manufacturer: {kit.manufacturer}</p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                <span className="text-slate-400 font-bold text-[11px] uppercase">Target Substances:</span>
                <div className="flex flex-wrap gap-1.5">
                  {kit.target_substances.map((s, idx) => (
                    <span key={idx} className="bg-slate-900 text-slate-200 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {kit.instructions && (
                <div className="text-xs text-slate-400 space-y-1">
                  <span className="font-mono text-slate-300 font-bold">Field SOP Instructions:</span>
                  <p className="text-[11px] leading-relaxed bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80">
                    {kit.instructions}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>{kit.test_type}</span>
              <span className="text-cyan-400 font-bold">CONFIG LOADED</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
