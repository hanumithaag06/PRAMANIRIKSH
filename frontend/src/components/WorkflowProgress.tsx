import React from 'react';
import { Camera, Search, Sparkles, FileCheck, ShieldCheck, Check, Beaker } from 'lucide-react';

export type FlowStep = 'PREPARE' | 'CAPTURE' | 'CHECK' | 'ANALYSE' | 'RESULT' | 'EVIDENCE';

interface WorkflowProgressProps {
  current: FlowStep;
  className?: string;
}

const FLOW_STEPS: { key: FlowStep; num: string; label: string; icon: React.FC<any> }[] = [
  { key: 'PREPARE', num: '01', label: 'PREPARE', icon: Beaker },
  { key: 'CAPTURE', num: '02', label: 'CAPTURE', icon: Camera },
  { key: 'CHECK',   num: '03', label: 'CHECK',   icon: Search },
  { key: 'ANALYSE', num: '04', label: 'ANALYSE', icon: Sparkles },
  { key: 'RESULT',  num: '05', label: 'RESULT',  icon: FileCheck },
  { key: 'EVIDENCE',num: '06', label: 'EVIDENCE',icon: ShieldCheck },
];

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({ current, className = '' }) => {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === current);

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Continuous connector line in background */}
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0" />
        <div
          className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 -z-0"
          style={{
            width: `${(currentIndex / (FLOW_STEPS.length - 1)) * 100}%`,
          }}
        />

        {FLOW_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isUpcoming = i > currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/30 scale-110'
                    : isDone
                    ? 'bg-emerald-950 border border-emerald-500/60 text-emerald-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-600'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Icon className="w-3.5 h-3.5" />}
              </div>

              <span
                className={`text-[10px] font-mono font-bold mt-2 tracking-wider ${
                  isActive
                    ? 'text-cyan-400'
                    : isDone
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
