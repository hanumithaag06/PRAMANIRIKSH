import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/70 border-b border-amber-600/40 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between shadow-inner">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold text-amber-300 uppercase tracking-wide mr-1.5">Official NCB Mandatory Notice:</span>
          <span>This application produces a <strong>presumptive field-test result</strong> and tamper-evident digital record. It <strong>does not replace confirmatory laboratory testing</strong> (CFSL/CRCL).</span>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-1.5 bg-amber-900/60 text-amber-300 px-2.5 py-1 rounded border border-amber-700/50 text-[11px] font-mono shrink-0">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>SHA-256 + RSA Signed</span>
      </div>
    </div>
  );
};
