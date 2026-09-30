import React, { useState, useEffect } from 'react';
import { Camera, Search, ShieldCheck, X, ArrowRight, Shield, Layers, Key } from 'lucide-react';
import { UserRole } from '../contexts/AuthContext';

const DISMISSED_KEY = 'prm_intro_dismissed_v3';

interface Step {
  num: string;
  icon: React.FC<any>;
  title: string;
  body: string;
}

const UNIVERSAL_STEPS: Step[] = [
  {
    num: '01',
    icon: Camera,
    title: 'CAPTURE',
    body: 'Capture the test with the reference card placed side-by-side on the same focal plane.',
  },
  {
    num: '02',
    icon: Search,
    title: 'CHECK',
    body: 'We check whether the image is suitable for analysis (lighting, blur, glare, reference card detection).',
  },
  {
    num: '03',
    icon: ShieldCheck,
    title: 'VERIFY',
    body: 'Your presumptive result and supporting evidence are securely recorded with SHA-256 and asymmetric RSA signatures.',
  },
];

const ROLE_INFO: Record<UserRole, { welcome: string; roleHeadline: string; ctaText: string; ctaLink: string }> = {
  OPERATOR: {
    welcome: 'Welcome back',
    roleHeadline: "You're ready to perform and record field tests.",
    ctaText: 'Start Your First Test',
    ctaLink: '/test/prepare',
  },
  SUPERVISOR: {
    welcome: 'Welcome back',
    roleHeadline: 'Review field activity and evidence that requires your attention.',
    ctaText: 'Review Field Activity',
    ctaLink: '/history',
  },
  FORENSIC: {
    welcome: 'Welcome back',
    roleHeadline: 'Review presumptive field results and supporting evidence.',
    ctaText: 'Open Review Queue',
    ctaLink: '/history',
  },
  AUDITOR: {
    welcome: 'Welcome back',
    roleHeadline: 'Verify evidence integrity and review the audit trail.',
    ctaText: 'Verify Evidence Integrity',
    ctaLink: '/verify',
  },
  ADMIN: {
    welcome: 'Welcome back',
    roleHeadline: 'Manage users, configurations and system security.',
    ctaText: 'Manage Kit Configurations',
    ctaLink: '/kits',
  },
};

export const FirstTimeIntro: React.FC<{ userRole: UserRole }> = ({ userRole }) => {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  const roleMeta = ROLE_INFO[userRole] || ROLE_INFO.OPERATOR;
  const currentStep = UNIVERSAL_STEPS[step];
  const StepIcon = currentStep.icon;
  const isLast = step === UNIVERSAL_STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9998] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to PRAMANIRIKSH"
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-fade">
        {/* Header with role banner */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  {roleMeta.welcome}
                </p>
                <p className="text-sm font-black text-white">{roleMeta.roleHeadline}</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close introduction"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper pills */}
          <div className="flex gap-2 mt-5">
            {UNIVERSAL_STEPS.map((s, i) => (
              <div
                key={s.num}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : i < step ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Card Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/10">
              <StepIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-slate-500">STEP {currentStep.num} OF 03</span>
              <h3 className="text-xl font-black text-white">{currentStep.title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">{currentStep.body}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-2 border-t border-slate-800/80 flex gap-3">
          {isLast ? (
            <a
              href={roleMeta.ctaLink}
              onClick={dismiss}
              className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <span>{roleMeta.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          ) : (
            <>
              <button
                onClick={dismiss}
                className="py-3 px-4 text-xs font-mono text-slate-400 hover:text-white font-bold transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
