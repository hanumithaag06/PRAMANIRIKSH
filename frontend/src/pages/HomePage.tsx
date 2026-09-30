import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Camera, History, ShieldCheck, ArrowRight, RefreshCw,
  CheckCircle2, AlertTriangle, Wifi, WifiOff, Clock,
  ChevronRight, Sparkles, Shield, Database,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { fetchTestHistory } from '../services/api';
import { getOfflineTests } from '../services/offlineDb';
import { FirstTimeIntro } from '../components/FirstTimeIntro';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [offlineTests, setOfflineTests] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(
    (location.state as any)?.offlineNotice ?? null
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.full_name || user?.username || 'Officer';

  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [tests, offline] = await Promise.allSettled([
          fetchTestHistory(),
          getOfflineTests(),
        ]);
        if (tests.status === 'fulfilled') {
          setRecentTests(tests.value.slice(0, 5));
        }
        if (offline.status === 'fulfilled') {
          setOfflineTests(offline.value);
        }
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  // Derive dynamic attention items from real data
  const attentionItems: { icon: React.FC<any>; color: string; text: string; link?: string; badge?: string }[] = [];

  if (!isOnline) {
    attentionItems.push({
      icon: WifiOff,
      color: 'text-amber-400',
      text: `You're currently offline. ${offlineTests.length > 0 ? `${offlineTests.length} test record${offlineTests.length > 1 ? 's are' : ' is'} stored locally and will sync upon reconnection.` : 'Captured tests will be securely saved locally.'}`,
      badge: 'OFFLINE CACHE',
    });
  } else if (offlineTests.length > 0) {
    attentionItems.push({
      icon: RefreshCw,
      color: 'text-cyan-400',
      text: `${offlineTests.length} offline test record${offlineTests.length > 1 ? 's are' : ''} syncing to the secure evidence chain…`,
      badge: 'SYNCING',
    });
  }

  const tamperedTests = recentTests.filter((t) => t.is_tampered_demo);
  if (tamperedTests.length > 0) {
    attentionItems.push({
      icon: AlertTriangle,
      color: 'text-rose-400',
      text: `${tamperedTests.length} evidence record${tamperedTests.length > 1 ? 's have' : ' has'} been flagged for integrity review.`,
      link: '/verify',
      badge: 'INTEGRITY ALERT',
    });
  }

  const isOperator = user?.role === 'OPERATOR';
  const isSupervisor = user?.role === 'SUPERVISOR';
  const isForensic = user?.role === 'FORENSIC';
  const isAuditor = user?.role === 'AUDITOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[#0B1220] bg-ambient-glow text-slate-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-7 pb-24 md:pb-12">

        {/* First-time onboarding popup */}
        <FirstTimeIntro userRole={user?.role ?? 'OPERATOR'} />

        {/* Offline saved notice banner */}
        {offlineNotice && (
          <div className="flex items-start gap-3.5 p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl text-xs text-cyan-200 shadow-xl animate-fade">
            <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-white text-sm">Test Stored Offline ({offlineNotice})</p>
              <p className="text-cyan-300/80 mt-0.5 leading-relaxed">
                Your test photo, location coordinates, and metadata have been cryptographically buffered on this device. They will automatically be submitted to the evidence ledger as soon as an internet connection is established.
              </p>
            </div>
            <button
              onClick={() => setOfflineNotice(null)}
              className="text-cyan-400 hover:text-white text-xs font-bold px-2 py-1 bg-cyan-900/40 rounded-lg"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ── Personalized Greeting & Role Indicator ── */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                {greeting()},
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-sans">
                {firstName}
              </h1>
              {user?.department && (
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user.department}</span>
                </p>
              )}
            </div>

            <div className="flex sm:flex-col items-start sm:items-end gap-1.5">
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                {user?.role || 'FIELD OPERATOR'}
              </span>
              {user?.badge_id && (
                <span className="text-[11px] font-mono text-slate-500">Badge: {user.badge_id}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Dominant Primary Action ── */}
        {(isOperator || isSupervisor || isAdmin) && (
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
            <Link
              id="home-start-test-btn"
              to="/test/prepare"
              className="relative flex items-center justify-between p-6 bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 rounded-2xl transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                  <Camera className="w-7 h-7 text-slate-950" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    Presumptive Test Workflow
                  </span>
                  <p className="text-xl font-black text-white leading-tight mt-0.5">Start New Field Test</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    PREPARE → CAPTURE → CHECK → ANALYSE → EVIDENCE
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </div>
        )}

        {/* ── Needs Attention Section ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Needs Attention
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-400">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              Evaluating system & sync status…
            </div>
          ) : attentionItems.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-slate-900/90 border border-emerald-600/30 rounded-2xl text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-300">You're all caught up</p>
                <p className="text-slate-400 text-[11px] mt-0.5 font-mono">
                  All local evidence records are synchronized. No pending integrity anomalies detected.
                </p>
              </div>
            </div>
          ) : (
            attentionItems.map((item, i) => {
              const Icon = item.icon;
              return item.link ? (
                <Link
                  key={i}
                  to={item.link}
                  className="flex items-start gap-3.5 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-xs transition-all group"
                >
                  <Icon className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-300 group-hover:text-white font-semibold transition-colors">
                        {item.text}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-600/40 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                </Link>
              ) : (
                <div key={i} className="flex items-start gap-3.5 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
                  <Icon className={`w-4 h-4 ${item.color} shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <p className="text-slate-300">{item.text}</p>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-950/80 text-amber-300 border border-amber-600/40 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Recent Activity ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Recent Field Tests
            </span>
            <Link
              to="/history"
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              View Test Log <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 p-5 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-mono text-slate-400">
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              Loading cryptographic evidence log…
            </div>
          ) : recentTests.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
              <p className="text-slate-400 text-sm font-semibold">No tests recorded yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Execute your first on-site chemical presumptive test to generate a signed tamper-evident evidence entry.
              </p>
              <Link
                to="/test/prepare"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 pt-2"
              >
                <Camera className="w-4 h-4" /> Start your first test
              </Link>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
              {recentTests.map((test) => {
                const isPositive = test.presumptive_result === 'POSITIVE';
                const isNegative = test.presumptive_result === 'NEGATIVE';
                const isInconclusive = test.presumptive_result === 'INCONCLUSIVE';

                return (
                  <Link
                    key={test.test_id}
                    to={`/test/evidence/${test.test_id}`}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          isPositive ? 'bg-rose-400 shadow-sm shadow-rose-400/50' :
                          isNegative ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' :
                          isInconclusive ? 'bg-amber-400' : 'bg-purple-400'
                        }`}
                      />
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-bold text-white font-mono truncate">{test.test_id}</p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(test.timestamp).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="truncate">{test.operator_name}</span>
                          {test.target_substance && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">{test.target_substance}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          isPositive ? 'bg-rose-950/80 text-rose-300 border border-rose-600/40' :
                          isNegative ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40' :
                          isInconclusive ? 'bg-amber-950/80 text-amber-300 border border-amber-600/40' :
                          'bg-purple-950/80 text-purple-300 border border-purple-600/40'
                        }`}
                      >
                        {test.presumptive_result}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Quick Role Action Tiles ── */}
        {(isSupervisor || isForensic || isAuditor || isAdmin) && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Link
              to="/verify"
              className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-600/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Verify Evidence</p>
                <p className="text-[10px] text-slate-500 font-mono">Check hash integrity</p>
              </div>
            </Link>

            <Link
              to="/history"
              className="flex items-center gap-3 p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-600/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Full Test History</p>
                <p className="text-[10px] text-slate-500 font-mono">Tamper-evident chain</p>
              </div>
            </Link>
          </div>
        )}

        {/* ── Sync & Connectivity Status Pill ── */}
        <div className={`flex items-center justify-between px-4 py-3 rounded-2xl border text-xs font-mono ${
          isOnline
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
            <span>{isOnline ? 'Online Engine Connected' : 'Offline Mode Active — Local Storage Enabled'}</span>
          </div>
          <span className="text-[10px] opacity-70">SIH-2026</span>
        </div>
      </div>
    </div>
  );
};
