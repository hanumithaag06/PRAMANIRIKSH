import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, RefreshCcw } from 'lucide-react';

interface ResultPillProps {
  result: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Plain-language result display.
 * Replaces raw result codes with human-readable labels and icons.
 * Never shows technical terminology to normal users.
 */
export const ResultPill: React.FC<ResultPillProps> = ({ result, size = 'md' }) => {
  const normalized = (result || '').toUpperCase().replace(/ /g, '_');

  const config: Record<string, { label: string; icon: React.FC<any>; cls: string }> = {
    POSITIVE: {
      label: 'Positive',
      icon: XCircle,
      cls: 'bg-rose-500/15 border-rose-500/50 text-rose-300',
    },
    NEGATIVE: {
      label: 'Negative',
      icon: CheckCircle2,
      cls: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300',
    },
    INCONCLUSIVE: {
      label: 'Inconclusive',
      icon: HelpCircle,
      cls: 'bg-amber-500/15 border-amber-500/50 text-amber-300',
    },
    RETAKE_REQUIRED: {
      label: 'Retake Required',
      icon: RefreshCcw,
      cls: 'bg-purple-500/15 border-purple-500/50 text-purple-300',
    },
  };

  const cfg = config[normalized] ?? {
    label: result || 'Unknown',
    icon: AlertTriangle,
    cls: 'bg-slate-500/15 border-slate-500/50 text-slate-300',
  };

  const Icon = cfg.icon;

  const sizeCls = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2',
  }[size];

  const iconSize = { sm: 'w-3 h-3', md: 'w-3.5 h-3.5', lg: 'w-4 h-4' }[size];

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${cfg.cls} ${sizeCls}`}>
      <Icon className={iconSize} />
      {cfg.label}
    </span>
  );
};

interface VerificationPillProps {
  valid: boolean;
  size?: 'sm' | 'md';
}

/**
 * Plain-language evidence verification status.
 */
export const VerificationPill: React.FC<VerificationPillProps> = ({ valid, size = 'md' }) => {
  const sizeCls = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-3 py-1 gap-1.5';
  const iconSz = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  if (valid) {
    return (
      <span className={`inline-flex items-center font-bold rounded-full border bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ${sizeCls}`}>
        <CheckCircle2 className={iconSz} />
        Evidence verified
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-bold rounded-full border bg-rose-500/15 border-rose-500/50 text-rose-300 ${sizeCls}`}>
      <AlertTriangle className={iconSz} />
      Integrity alert
    </span>
  );
};

interface ConfidencePillProps {
  level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

/**
 * Confidence indicator — uses HIGH/MEDIUM/LOW, never invented percentages (4T).
 */
export const ConfidencePill: React.FC<ConfidencePillProps> = ({ level }) => {
  const cfg: Record<string, { label: string; cls: string }> = {
    HIGH:   { label: 'High confidence',   cls: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' },
    MEDIUM: { label: 'Medium confidence', cls: 'bg-amber-500/15 border-amber-500/40 text-amber-300' },
    LOW:    { label: 'Low confidence',    cls: 'bg-rose-500/15 border-rose-500/40 text-rose-300' },
  };
  const c = cfg[(level || '').toUpperCase()] ?? cfg['MEDIUM'];
  return (
    <span className={`inline-flex items-center text-xs font-bold rounded-full border px-3 py-1 ${c.cls}`}>
      {c.label}
    </span>
  );
};
