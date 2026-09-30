import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Shield, Camera, History, CheckCircle, HelpCircle,
  Wifi, WifiOff, RefreshCw, Globe, ChevronDown,
  Menu, X,
} from 'lucide-react';
import { getOfflineTests } from '../services/offlineDb';
import { useTranslation } from '../contexts/I18nContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const { lang, languages, setLang, t, loadingLangs } = useTranslation();

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkQueue = async () => {
      try {
        const tests = await getOfflineTests();
        setOfflineCount(tests.length);
      } catch {}
    };
    checkQueue();
    const interval = setInterval(checkQueue, 5000);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const navItems = [
    { labelKey: 'nav.newTest',       path: '/capture', icon: Camera,       plain: 'New test' },
    { labelKey: 'nav.testHistory',   path: '/history',  icon: History,      plain: 'Test history' },
    { labelKey: 'nav.verifyEvidence',path: '/verify',   icon: CheckCircle,  plain: 'Verify record' },
    { labelKey: 'nav.knowledgeBase', path: '/knowledge',icon: HelpCircle,   plain: 'Help' },
  ];

  const currentLang = languages.find((l) => l.code === lang);

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="PRAMANIRIKSH home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base text-white tracking-wide font-mono">PRAMANIRIKSH</span>
              <p className="text-[10px] text-slate-500 leading-none">Field evidence companion</p>
            </div>
            <span className="sm:hidden font-extrabold text-sm text-white font-mono">PRAMANIRIKSH</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
            {navItems.map(({ path, icon: Icon, plain, labelKey }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t(labelKey) || plain}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Connection status */}
            <div
              aria-label={isOnline ? 'Connected' : 'Offline mode'}
              className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/30'
                  : 'bg-amber-950/60 text-amber-400 border-amber-600/30'
              }`}
            >
              {isOnline
                ? <Wifi className="w-3 h-3 text-emerald-400" />
                : <WifiOff className="w-3 h-3 text-amber-400" />
              }
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Pending sync badge */}
            {offlineCount > 0 && (
              <div
                aria-label={`${offlineCount} test${offlineCount > 1 ? 's' : ''} waiting to sync`}
                className="flex items-center gap-1 bg-indigo-950/80 text-indigo-300 px-2 py-1 rounded-full text-[11px] font-medium border border-indigo-700/40"
              >
                <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
                <span>{offlineCount} syncing</span>
              </div>
            )}

            {/* Language selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                id="nav-lang-btn"
                onClick={() => setLangMenuOpen((v) => !v)}
                disabled={loadingLangs}
                aria-label="Select language"
                aria-expanded={langMenuOpen}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-200 transition-all disabled:opacity-50"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{currentLang ? currentLang.flag : '🌐'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-[9999]">
                  <p className="text-[10px] text-slate-500 font-mono font-bold px-3 py-2 border-b border-slate-800 uppercase">
                    Language
                  </p>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      id={`lang-${language.code}`}
                      onClick={() => { setLang(language.code); setLangMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs transition-colors text-left ${
                        lang === language.code
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{language.flag}</span>
                      <span className="font-semibold">{language.native_name}</span>
                      {lang === language.code && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              id="nav-mobile-menu-btn"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileMenuOpen && (
        <nav
          className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-1"
          aria-label="Mobile navigation"
        >
          {navItems.map(({ path, icon: Icon, plain, labelKey }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {t(labelKey) || plain}
              </Link>
            );
          })}

          {/* Offline indicator in mobile menu */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
            isOnline ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isOnline ? 'Connected' : `Offline${offlineCount > 0 ? ` · ${offlineCount} test${offlineCount > 1 ? 's' : ''} waiting to sync` : ''}`}
          </div>
        </nav>
      )}
    </header>
  );
};
