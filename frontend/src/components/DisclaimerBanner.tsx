import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/60 border-b border-amber-600/30 px-4 py-2 text-xs text-amber-200">
      <div className="flex items-center gap-2 max-w-3xl mx-auto">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          <strong className="text-amber-300">Notice:</strong>{' '}
          This gives a <strong>preliminary field result only</strong>. Confirmatory laboratory testing is always required before legal proceedings.
        </span>
      </div>
    </div>
  );
};
