import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ContextualAssistantProps {
  /** Context-aware hint text to show. Changes per page/step. */
  hint: string;
  /** Optional quick-action label */
  actionLabel?: string;
  onAction?: () => void;
  /** Collapse assistant by default */
  defaultCollapsed?: boolean;
}

/**
 * Small, non-intrusive contextual assistant (4E).
 * Shows exactly one contextual hint relevant to the current screen/step.
 */
export const ContextualAssistant: React.FC<ContextualAssistantProps> = ({
  hint,
  actionLabel,
  onAction,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [dismissed, setDismissed] = useState(false);

  // Reset on new hint
  useEffect(() => {
    setDismissed(false);
    setCollapsed(defaultCollapsed);
  }, [hint]);

  if (dismissed) return null;

  return (
    <div
      className="fixed bottom-6 right-5 z-50 max-w-xs w-full shadow-2xl"
      role="complementary"
      aria-label="Contextual assistant"
    >
      <div className="bg-slate-900/95 border border-cyan-500/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/10">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300">Need help?</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand assistant' : 'Collapse assistant'}
              className="text-slate-500 hover:text-slate-200 transition-colors p-0.5 rounded"
            >
              {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss assistant"
              className="text-slate-500 hover:text-slate-200 transition-colors p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!collapsed && (
          <div className="p-3">
            <p className="text-xs text-slate-300 leading-relaxed">{hint}</p>
            {actionLabel && onAction && (
              <button
                onClick={onAction}
                className="mt-2 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold rounded-lg border border-cyan-500/30 transition-colors w-full text-center"
              >
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
