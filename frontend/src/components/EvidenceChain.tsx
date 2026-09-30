import React, { useState } from 'react';
import { Camera, Hash, Key, Link2, ShieldCheck, AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface EvidenceChainProps {
  isValid?: boolean;
  imageHash?: string;
  metadataHash?: string;
  evidenceHash?: string;
  signature?: string;
  sequenceNumber?: number;
  previousHash?: string | null;
  interactive?: boolean;
}

interface ChainNode {
  id: 'IMAGE' | 'HASH' | 'SIGN' | 'CHAIN' | 'VERIFY';
  label: string;
  subtitle: string;
  icon: React.FC<any>;
  hashKey?: string;
  hashValue?: string;
}

export const EvidenceChain: React.FC<EvidenceChainProps> = ({
  isValid = true,
  imageHash,
  metadataHash,
  evidenceHash,
  signature,
  sequenceNumber = 1,
  previousHash,
  interactive = true,
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const nodes: ChainNode[] = [
    {
      id: 'IMAGE',
      label: '01 IMAGE',
      subtitle: 'Raw Photo SHA-256',
      icon: Camera,
      hashKey: 'Image SHA-256',
      hashValue: imageHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'HASH',
      label: '02 METADATA',
      subtitle: 'Canonical Fingerprint',
      icon: Hash,
      hashKey: 'Metadata Digest',
      hashValue: metadataHash || 'a7c2934f891bca2309de99435b81a2938475cfae183748291039847192837461',
    },
    {
      id: 'SIGN',
      label: '03 RSA SIGN',
      subtitle: 'Officer Keypair',
      icon: Key,
      hashKey: 'Digital Signature (RSA-2048)',
      hashValue: signature ? `${signature.slice(0, 48)}...` : '4f92...a891 (Signed with Officer RSA Key)',
    },
    {
      id: 'CHAIN',
      label: `04 SEQ #${sequenceNumber}`,
      subtitle: 'Linked Hash Chain',
      icon: Link2,
      hashKey: 'Previous Block Reference',
      hashValue: previousHash || (sequenceNumber === 1 ? 'GENESIS_ANCHOR_RECORD' : 'e839120482918374...'),
    },
    {
      id: 'VERIFY',
      label: isValid ? '05 INTACT' : '05 TAMPERED',
      subtitle: isValid ? 'Chain Validated' : 'Integrity Alert',
      icon: isValid ? ShieldCheck : ShieldAlert,
      hashKey: 'Verification Verdict',
      hashValue: isValid ? 'Cryptographically Verified (All 5 Gates Passed)' : 'Integrity Failure: Evidence Record Modified',
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Subtle background circuit line decoration */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 animate-ping'}`} />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Tamper-Evident Cryptographic Chain
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
            isValid
              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-600/40'
              : 'bg-rose-950/70 text-rose-400 border-rose-600/50'
          }`}
        >
          {isValid ? 'CHAIN INTACT' : 'INTEGRITY BREACH'}
        </span>
      </div>

      {/* Nodes and Connecting Line */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 relative">
        {nodes.map((node, index) => {
          const NodeIcon = node.icon;
          const isNodeValid = isValid || index < 4;
          const isBreachedNode = !isValid && index === 4;
          const isSelected = selectedNode === node.id;

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => interactive && setSelectedNode(isSelected ? null : node.id)}
              className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all relative z-10 text-left ${
                isBreachedNode
                  ? 'bg-rose-950/50 border-rose-500/80 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500'
                  : isNodeValid
                  ? isSelected
                    ? 'bg-cyan-950/50 border-cyan-400 ring-1 ring-cyan-400 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  : 'bg-slate-950 border-slate-800 opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                  isBreachedNode
                    ? 'bg-rose-900/60 text-rose-400 border border-rose-600'
                    : isNodeValid
                    ? 'bg-slate-900 text-cyan-400 border border-slate-700'
                    : 'bg-slate-900 text-slate-600 border border-slate-800'
                }`}
              >
                <NodeIcon className="w-4 h-4" />
              </div>

              <span className={`text-[11px] font-black font-mono tracking-tight ${isBreachedNode ? 'text-rose-400' : 'text-white'}`}>
                {node.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 leading-tight">
                {node.subtitle}
              </span>

              {/* Status indicator dot */}
              <div className="mt-2">
                {isBreachedNode ? (
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Progressive Node Details Preview */}
      {selectedNode && (
        <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl animate-fade">
          {(() => {
            const current = nodes.find((n) => n.id === selectedNode);
            if (!current) return null;
            return (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-bold">
                  <span>{current.hashKey}</span>
                  <span className="text-slate-500">Click node to close</span>
                </div>
                <p className="text-xs font-mono text-slate-300 break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                  {current.hashValue}
                </p>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
