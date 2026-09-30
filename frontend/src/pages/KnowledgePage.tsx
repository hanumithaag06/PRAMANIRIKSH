import React, { useState } from 'react';
import { HelpCircle, Search, BookOpen, Sparkles, AlertTriangle, Shield, FileText } from 'lucide-react';
import { queryKnowledgeAssistant } from '../services/api';
import { KnowledgeQueryResult } from '../types';
import { useTranslation } from '../contexts/I18nContext';

const SAMPLE_QUERIES_EN = [
  'What are the documented limitations of field colorimetric testing under NDPS Section 42?',
  'What is the mandatory reference color card procedure during field drug testing?',
  'What lighting conditions are required to avoid spectral distortion during kit photo capture?',
  'What are the mandatory chain of custody guidelines for on-site evidence preservation?'
];

export const KnowledgePage: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KnowledgeQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await queryKnowledgeAssistant(searchQuery);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Knowledge query failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Page Header ── */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl sm:text-3xl font-black text-white">{t('knowledge.title')}</h1>
            </div>
            <span className="bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold px-3 py-1 rounded-full border border-cyan-500/40">
              {t('knowledge.badge')}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {t('knowledge.subtitle')}
          </p>
        </div>

        {/* ── Query Search Bar ── */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex flex-col sm:flex-row items-center gap-2.5"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder={t('knowledge.placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 text-white font-mono text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs font-mono rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? t('knowledge.retrieving') : t('knowledge.queryButton')}</span>
            </button>
          </form>

          {/* Preset Sample Queries */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              {t('knowledge.sampleQueries')}
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES_EN.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q);
                    handleSearch(q);
                  }}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-xl text-xs text-rose-200 font-mono flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Grounded Answer Result ── */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl animate-fade">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
                <FileText className="w-4 h-4" />
                <span>{t('knowledge.groundedAnswer')}</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/40 self-start sm:self-auto">
                {t('knowledge.confidence')}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
              {result.answer}
            </div>

            {/* Official Source Citation */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider">{t('knowledge.citation')}</span>
              <p className="text-cyan-400 font-bold">{result.citation}</p>
              <p className="text-slate-400">{result.publisher} • Document Code: {result.document_title}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
