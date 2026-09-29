import React from 'react';
import { AlertOctagon, CheckCircle2, HelpCircle, RefreshCcw, ShieldCheck, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  type: 'result' | 'verification';
  value: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const valUpper = value ? value.toUpperCase() : '';

  if (type === 'result') {
    let style = 'bg-slate-800 text-slate-300 border-slate-700';
    let icon = <HelpCircle className="w-4 h-4" />;

    if (valUpper === 'POSITIVE') {
      style = 'bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-lg shadow-rose-950/50';
      icon = <AlertOctagon className="w-5 h-5 text-rose-400" />;
    } else if (valUpper === 'NEGATIVE') {
      style = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-lg shadow-emerald-950/50';
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    } else if (valUpper === 'INCONCLUSIVE') {
      style = 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/50';
      icon = <HelpCircle className="w-5 h-5 text-amber-400" />;
    } else if (valUpper === 'RETAKE_REQUIRED') {
      style = 'bg-purple-950/90 text-purple-300 border-purple-500/60';
      icon = <RefreshCcw className="w-5 h-5 text-purple-400" />;
    }

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold tracking-wider ${style}`}>
        {icon}
        <span>{valUpper.replace('_', ' ')}</span>
      </div>
    );
  }

  // Verification Badge
  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let icon = <ShieldAlert className="w-4 h-4 text-rose-400" />;
  let label = 'UNVERIFIED';

  if (valUpper === 'VERIFIED' || valUpper === 'TRUE') {
    style = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60';
    icon = <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    label = 'VERIFIED INTEGRITY';
  } else if (valUpper.includes('FAILED') || valUpper === 'FALSE') {
    style = 'bg-rose-950/90 text-rose-200 border-rose-500/80 animate-pulse';
    icon = <ShieldAlert className="w-4 h-4 text-rose-400" />;
    label = 'INTEGRITY CHECK FAILED';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono text-xs font-semibold ${style}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
};
