import React, { useState } from 'react';
import { HelpCircle, Search, BookOpen, Sparkles, AlertTriangle } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-black text-white">{t('knowledge.title')}</h1>
          <span className="bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold px-2 py-0.5 rounded border border-cyan-500/30">
            {t('knowledge.badge')}
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          {t('knowledge.subtitle')}
        </p>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={t('knowledge.placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 text-white font-mono text-xs pl-11 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-black text-xs font-mono rounded-xl shadow-lg flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? t('knowledge.retrieving') : t('knowledge.queryButton')}</span>
          </button>
        </form>

        {/* Preset Sample Queries (English only — queries must match knowledge base) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">{t('knowledge.sampleQueries')}</span>
          {SAMPLE_QUERIES_EN.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(q);
                handleSearch(q);
              }}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-xl text-xs text-rose-200 font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Query Result Panel */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-400">
              <BookOpen className="w-4 h-4" />
              <span>{t('knowledge.groundedAnswer')}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
              {t('knowledge.confidence')}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line">
            {result.answer}
          </div>

          {/* Source Citation */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] space-y-1">
            <span className="text-slate-500 font-bold uppercase">{t('knowledge.citation')}</span>
            <p className="text-cyan-400 font-bold">{result.citation}</p>
            <p className="text-slate-400">{result.publisher} • Document Code: {result.document_title}</p>
          </div>
        </div>
      )}
    </div>
  );
};
