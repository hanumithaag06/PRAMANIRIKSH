import React from 'react';
import { CheckCircle2, AlertCircle, HelpCircle, XCircle } from 'lucide-react';

interface QualityBadgeProps {
  score: number;
  label?: string;
  reasons?: string[];
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ score, label, reasons }) => {
  let color = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
  let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
  let statusText = 'HIGH QUALITY EVIDENCE';

  if (score < 0.5) {
    color = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
    icon = <XCircle className="w-4 h-4 text-rose-400" />;
    statusText = 'QUALITY GATE REJECTED';
  } else if (score < 0.75) {
    color = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    icon = <AlertCircle className="w-4 h-4 text-amber-400" />;
    statusText = 'MODERATE QUALITY';
  }

  return (
    <div className={`flex flex-col gap-1 p-2.5 rounded-lg border ${color} font-mono text-xs`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold">
          {icon}
          <span>{label || statusText}</span>
        </div>
        <span className="font-extrabold text-sm">{(score * 100).toFixed(0)}%</span>
      </div>
      {reasons && reasons.length > 0 && (
        <ul className="list-disc list-inside text-[11px] opacity-90 mt-1 space-y-0.5 font-sans">
          {reasons.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
