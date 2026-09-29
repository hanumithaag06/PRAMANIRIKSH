import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Filter, ShieldCheck, ArrowRight, RefreshCw, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { fetchTestHistory } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const HistoryPage: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('ALL');

  useEffect(() => {
    loadHistory();
  }, [resultFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchTestHistory({
        result: resultFilter === 'ALL' ? undefined : resultFilter
      });
      setTests(data);
    } catch (err) {}
    setLoading(false);
  };

  const filteredTests = tests.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.test_id.toLowerCase().includes(q) ||
      t.operator_name.toLowerCase().includes(q) ||
      t.kit_name.toLowerCase().includes(q) ||
      (t.target_substance && t.target_substance.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" /> SEARCHABLE FIELD TEST LOG
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Complete Audit Trail • Presumptive Classifications • Cryptographic Fingerprints
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Test ID, Operator, Substance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 text-xs font-mono text-white pl-9 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="bg-slate-950 text-cyan-300 text-xs font-mono font-bold px-3 py-2 rounded-xl border border-cyan-500/40 focus:outline-none"
          >
            <option value="ALL">ALL RESULTS</option>
            <option value="POSITIVE">POSITIVE ONLY</option>
            <option value="NEGATIVE">NEGATIVE ONLY</option>
            <option value="INCONCLUSIVE">INCONCLUSIVE ONLY</option>
            <option value="RETAKE_REQUIRED">RETAKE REQUIRED</option>
          </select>
        </div>
      </div>

      {/* Test Log Table */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs space-y-2">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
          <p>Fetching Test History Log...</p>
        </div>
      ) : filteredTests.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Seq #</th>
                  <th className="py-3.5 px-4 font-bold">Test ID</th>
                  <th className="py-3.5 px-4 font-bold">Timestamp</th>
                  <th className="py-3.5 px-4 font-bold">Presumptive Result</th>
                  <th className="py-3.5 px-4 font-bold">Target Substance</th>
                  <th className="py-3.5 px-4 font-bold">Operator</th>
                  <th className="py-3.5 px-4 font-bold">Evidence Integrity</th>
                  <th className="py-3.5 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTests.map((t) => (
                  <tr key={t.test_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-bold">#{t.sequence_number}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{t.test_id}</td>
                    <td className="py-3.5 px-4 text-slate-400">{new Date(t.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="result" value={t.presumptive_result} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{t.target_substance || 'N/A'}</td>
                    <td className="py-3.5 px-4 text-slate-300">{t.operator_name}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge type="verification" value={t.is_tampered_demo ? 'FAILED' : 'VERIFIED'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/tests/${t.test_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-lg border border-slate-700 text-[11px] transition-colors"
                      >
                        <span>DETAILS</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
          <p>No test records match the specified filters.</p>
        </div>
      )}
    </div>
  );
};
