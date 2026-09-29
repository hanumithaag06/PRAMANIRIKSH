import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Camera, History, CheckCircle, Database, HelpCircle, Wifi, WifiOff, RefreshCw, Globe, ChevronDown } from 'lucide-react';
import { getOfflineTests } from '../services/offlineDb';
import { useTranslation } from '../contexts/I18nContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { lang, languages, setLang, t, loadingLangs } = useTranslation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkOfflineQueue = async () => {
      try {
        const tests = await getOfflineTests();
        setOfflineCount(tests.length);
      } catch (err) {}
    };
    checkOfflineQueue();
    const interval = setInterval(checkOfflineQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Close language menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { labelKey: 'nav.newTest', path: '/capture', icon: Camera },
    { labelKey: 'nav.testHistory', path: '/history', icon: History },
    { labelKey: 'nav.verifyEvidence', path: '/verify', icon: CheckCircle },
    { labelKey: 'nav.kitProfiles', path: '/kits', icon: Database },
    { labelKey: 'nav.knowledgeBase', path: '/knowledge', icon: HelpCircle },
  ];

  const currentLang = languages.find((l) => l.code === lang);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Emblem */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-wider font-mono">PRAMANIRIKSH</span>
                <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/30 font-mono">v1.0</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Narcotics Control Bureau • Field Verification Companion</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Online Status */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/40'
                  : 'bg-amber-950/60 text-amber-400 border-amber-600/40'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isOnline ? t('nav.serverOnline') : t('nav.offlineMode')}</span>
            </div>

            {offlineCount > 0 && (
              <div className="flex items-center gap-1 bg-indigo-950/80 text-indigo-300 px-2.5 py-1 rounded-full text-xs font-mono border border-indigo-700/50">
                <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                <span>{offlineCount} {t('nav.pendingSync')}</span>
              </div>
            )}

            {/* Language Selector — dynamically populated from backend API (no hardcoded languages) */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen((v) => !v)}
                disabled={loadingLangs}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 transition-all disabled:opacity-50"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentLang ? `${currentLang.flag} ${currentLang.native_name}` : '🌐 EN'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/60 overflow-hidden z-[9999]">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-[10px] text-slate-500 font-mono font-bold uppercase px-1">Select Interface Language</p>
                  </div>
                  <div className="py-1">
                    {languages.map((language) => (
                      <button
                        key={language.code}
                        onClick={() => {
                          setLang(language.code);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs transition-colors text-left ${
                          lang === language.code
                            ? 'bg-cyan-500/15 text-cyan-400'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="text-base">{language.flag}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{language.native_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{language.name}</p>
                        </div>
                        {lang === language.code && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Officer Badge */}
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
                RS
              </div>
              <div className="text-left text-[11px]">
                <p className="font-semibold text-slate-200">Insp. Rajesh Sharma</p>
                <p className="text-slate-400 font-mono">NCB-8921</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
