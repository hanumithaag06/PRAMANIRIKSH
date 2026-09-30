import React from 'react';
import { Camera, Search, Sparkles, FileCheck, RefreshCcw } from 'lucide-react';

export type WorkflowStep = 'CAPTURE' | 'CHECK' | 'ANALYSE' | 'REVIEW' | 'RECORD';

interface WorkflowStepperProps {
  current: WorkflowStep;
  compact?: boolean;
}

const STEPS: { key: WorkflowStep; label: string; icon: React.FC<any> }[] = [
  { key: 'CAPTURE', label: 'Capture',  icon: Camera },
  { key: 'CHECK',   label: 'Check',    icon: Search },
  { key: 'ANALYSE', label: 'Analyse',  icon: Sparkles },
  { key: 'REVIEW',  label: 'Review',   icon: FileCheck },
  { key: 'RECORD',  label: 'Record',   icon: RefreshCcw },
];

const stepIndex = (s: WorkflowStep) => STEPS.findIndex((x) => x.key === s);

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({ current, compact }) => {
  const ci = stepIndex(current);

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs font-mono">
        <span className="text-cyan-400 font-bold">{current}</span>
        <span className="text-slate-500 mx-1">›</span>
        {STEPS.slice(ci + 1)
          .slice(0, 3)
          .map((s) => (
            <span key={s.key} className="text-slate-500">
              {s.label}
            </span>
          ))
          .reduce((acc: React.ReactNode[], el, i) => [
            ...acc,
            i > 0 ? <span key={`sep-${i}`} className="text-slate-700 mx-0.5">›</span> : null,
            el,
          ], [])}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 w-full max-w-lg" role="navigation" aria-label="Test workflow steps">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < ci;
        const active = i === ci;
        const future = i > ci;
        return (
          <React.Fragment key={step.key}>
            {/* Step node */}
            <div className="flex flex-col items-center" style={{ minWidth: 48 }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${active ? 'bg-cyan-500 border-cyan-400 shadow-lg shadow-cyan-500/40' : ''}
                  ${done  ? 'bg-emerald-600 border-emerald-500' : ''}
                  ${future? 'bg-slate-800 border-slate-700' : ''}
                `}
                aria-current={active ? 'step' : undefined}
              >
                <Icon
                  className={`w-4 h-4 ${active ? 'text-slate-950' : done ? 'text-white' : 'text-slate-500'}`}
                />
              </div>
              <span
                className={`text-[10px] mt-1 font-bold font-mono
                  ${active ? 'text-cyan-400' : done ? 'text-emerald-400' : 'text-slate-600'}
                `}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mb-4 transition-colors
                  ${i < ci ? 'bg-emerald-600' : 'bg-slate-700'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
