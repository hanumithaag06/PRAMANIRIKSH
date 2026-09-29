import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-8 px-4 text-slate-400 text-xs font-mono">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">PRAMANIRIKSH</span>
          <span>• Ministry of Home Affairs / Narcotics Control Bureau (NCB)</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> Asymmetric RSA Digital Signature</span>
          <span>•</span>
          <span>SHA-256 Tamper-Evident Hash Chain</span>
          <span>•</span>
          <span>Offline-First PWA</span>
        </div>
      </div>
    </footer>
  );
};
