import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, RefreshCw, Clock, User, AlertTriangle,
  ShieldCheck, Filter, ChevronRight, MapPin, Database,
} from 'lucide-react';
import { fetchTestHistory } from '../services/api';
import { ResultPill, VerificationPill } from '../components/PlainPills';

function parseNaturalSearch(q: string) {
  const lq = q.toLowerCase().trim();
  const resultMap: Record<string, string> = {
    'positive': 'POSITIVE',
    'negative': 'NEGATIVE',
    'inconclusive': 'INCONCLUSIVE',
    'retake': 'RETAKE_REQUIRED',
    'failed': 'RETAKE_REQUIRED',
  };
  for (const [key, val] of Object.entries(resultMap)) {
    if (lq === key) return { resultFilter: val, textSearch: '' };
  }
  return { resultFilter: '', textSearch: lq };
}

export const HistoryPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('ALL');

  useEffect(() => { loadHistory(); }, [resultFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchTestHistory({
        result: resultFilter === 'ALL' ? undefined : resultFilter,
      });
      setTests(data);
    } catch {}
    setLoading(false);
  };

  const { resultFilter: parsedFilter, textSearch } = parseNaturalSearch(searchQuery);

  const filteredTests = tests.filter((t) => {
    if (parsedFilter && t.presumptive_result !== parsedFilter) return false;
    if (textSearch) {
      const q = textSearch;
      return (
        t.test_id.toLowerCase().includes(q) ||
        t.operator_name?.toLowerCase().includes(q) ||
        t.kit_name?.toLowerCase().includes(q) ||
        (t.target_substance && t.target_substance.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const FILTERS = [
    { value: 'ALL',             label: 'All Results' },
    { value: 'POSITIVE',        label: 'Positive' },
    { value: 'NEGATIVE',        label: 'Negative' },
    { value: 'INCONCLUSIVE',    label: 'Inconclusive' },
    { value: 'RETAKE_REQUIRED', label: 'Retake Required' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Cryptographic Evidence Ledger
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">Append-Only Audit Chain</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Test History & Evidence Log</h1>
            <p className="text-xs text-slate-400 font-mono">
              Immutable record of presumptive field tests with asymmetric signatures and GPS hashes.
            </p>
          </div>

          <Link
            to="/test/prepare"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 self-start sm:self-auto"
          >
            <span>+ New Field Test</span>
          </Link>
        </div>

        {/* ── Search Bar & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              id="history-search"
              type="text"
              placeholder='Search by Test ID, Operator, Substance, or "Positive"…'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-xs font-mono text-white pl-10 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-600 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 hidden sm:block" />
            <select
              id="history-filter"
              value={resultFilter}
              onChange={(e) => { setResultFilter(e.target.value); setSearchQuery(''); }}
              className="bg-slate-900 text-xs font-mono font-bold text-slate-300 px-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Evidence Records List ── */}
        {loading ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center gap-3 text-slate-400 font-mono text-xs">
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
            <span>Loading verifiable test records…</span>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
            <ShieldCheck className="w-10 h-10 mx-auto text-slate-700" />
            <p className="text-sm font-bold text-white">No Matching Evidence Records</p>
            <p className="text-xs text-slate-400 font-mono">
              {searchQuery ? `No records matched "${searchQuery}". Try a different filter.` : 'Start a new field test to create your first signed evidence entry.'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-2xl">
            {filteredTests.map((t) => (
              <Link
                key={t.test_id}
                id={`history-row-${t.test_id}`}
                to={`/tests/${t.test_id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-800/50 transition-colors group gap-3"
              >
                {/* Left Identity & Details */}
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{t.test_id}</span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                      Seq #{t.sequence_number || 1}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(t.timestamp).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.operator_name}</span>
                    </span>
                    {t.target_substance && (
                      <>
                        <span>•</span>
                        <span className="text-slate-200 font-semibold">{t.target_substance}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Status Badges & Nav Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <ResultPill result={t.presumptive_result} size="sm" />
                    <VerificationPill valid={!t.is_tampered_demo} size="sm" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Record count footer */}
        {!loading && filteredTests.length > 0 && (
          <p className="text-center text-xs font-mono text-slate-500">
            Displaying {filteredTests.length} of {tests.length} immutable field test record{tests.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};
