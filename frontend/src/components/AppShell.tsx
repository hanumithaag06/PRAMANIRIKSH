import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Shield, Home, Camera, History, ShieldCheck, BookOpen,
  Database, LogOut, Globe, ChevronDown, Menu, X,
  Wifi, WifiOff, RefreshCw, User, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/I18nContext';
import { getOfflineTests } from '../services/offlineDb';
import { DisclaimerBanner } from './DisclaimerBanner';

function getNavForRole(role: UserRole): { label: string; path: string; icon: React.FC<any>; exact?: boolean }[] {
  const base = [
    { label: 'Home', path: '/', icon: Home, exact: true },
  ];
  const operatorItems = [
    { label: 'Start Test', path: '/test/prepare', icon: Camera },
    { label: 'Test Log',   path: '/history',      icon: History },
  ];
  const reviewItems = [
    { label: 'Evidence Ledger', path: '/history', icon: History },
    { label: 'Verification',    path: '/verify',  icon: ShieldCheck },
  ];
  const knowledgeItem = { label: 'Field SOP', path: '/knowledge', icon: BookOpen };
  const kitsItem       = { label: 'Kit Profiles', path: '/kits',  icon: Database };

  switch (role) {
    case 'OPERATOR':
      return [...base, ...operatorItems, knowledgeItem];
    case 'SUPERVISOR':
      return [...base, ...operatorItems, ...reviewItems, knowledgeItem];
    case 'FORENSIC':
      return [...base, ...reviewItems, knowledgeItem];
    case 'AUDITOR':
      return [...base, ...reviewItems];
    case 'ADMIN':
      return [...base, ...operatorItems, ...reviewItems, kitsItem, knowledgeItem];
    default:
      return [...base, ...operatorItems, knowledgeItem];
  }
}

function getRoleBadge(role: UserRole): { label: string; color: string } {
  const map: Record<UserRole, { label: string; color: string }> = {
    OPERATOR:   { label: 'Field Operator',   color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/40' },
    SUPERVISOR: { label: 'Supervisor',       color: 'text-blue-400 bg-blue-950/80 border-blue-500/40' },
    FORENSIC:   { label: 'Forensic Review',  color: 'text-purple-400 bg-purple-950/80 border-purple-500/40' },
    AUDITOR:    { label: 'Auditor',          color: 'text-amber-400 bg-amber-950/80 border-amber-500/40' },
    ADMIN:      { label: 'Administrator',    color: 'text-rose-400 bg-rose-950/80 border-rose-500/40' },
  };
  return map[role] ?? { label: role, color: 'text-slate-400 bg-slate-800 border-slate-700' };
}

export const AppShell: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, languages, setLang, loadingLangs } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = useMemo(() => getNavForRole(user?.role ?? 'OPERATOR'), [user?.role]);
  const roleBadge = useMemo(() => getRoleBadge(user?.role ?? 'OPERATOR'), [user?.role]);
  const currentLang = languages.find((l) => l.code === lang);

  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    const check = async () => {
      try { setOfflineCount((await getOfflineTests()).length); } catch {}
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setLangOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1220] text-slate-100 font-sans">
      <DisclaimerBanner />

      {/* ── Top Header Bar ── */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="PRAMANIRIKSH Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="font-black text-sm text-white tracking-wider font-mono">PRAMANIRIKSH</span>
              <p className="text-[9px] text-cyan-400 font-mono">NCB Presumptive Testing</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 px-4" aria-label="Main Navigation">
            {navItems.map(({ label, path, icon: Icon, exact }) => {
              const active = isActive(path, exact);
              return (
                <Link
                  key={path}
                  to={path}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Indicators & Dropdowns */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Online / Offline Indicator */}
            <div
              aria-label={isOnline ? 'Connected to NCB server' : 'Working offline'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border ${
                isOnline
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-600/40'
                  : 'bg-amber-950/60 text-amber-400 border-amber-600/50'
              }`}
            >
              {isOnline ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </div>

            {/* Offline Pending Sync Count */}
            {offlineCount > 0 && (
              <div className="hidden sm:flex items-center gap-1 bg-cyan-950/80 text-cyan-300 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border border-cyan-500/40">
                <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                <span>{offlineCount} QUEUED</span>
              </div>
            )}

            {/* Global Language Selector (Data-Driven from GET /i18n/languages) */}
            <div className="relative" ref={langMenuRef}>
              <button
                id="lang-selector-btn"
                onClick={() => setLangOpen((v) => !v)}
                disabled={loadingLangs}
                aria-label="Select Language"
                aria-expanded={langOpen}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200 transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentLang?.native_name || currentLang?.name || 'Language'}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-fade">
                  <p className="text-[10px] text-slate-500 font-mono font-bold px-3 py-2 border-b border-slate-800 uppercase tracking-wider">
                    Select Interface Language
                  </p>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      id={`lang-opt-${l.code}`}
                      onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-mono text-left transition-colors ${
                        lang === l.code ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <span>{l.native_name || l.name}</span>
                      </div>
                      {lang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Officer Profile & Sign Out Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                id="user-menu-btn"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="User profile menu"
                aria-expanded={userMenuOpen}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition-all"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs font-mono">
                  {user?.full_name?.[0] ?? 'O'}
                </div>
                <span className="hidden sm:block text-slate-300 font-mono font-bold max-w-[90px] truncate">
                  {user?.full_name?.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[9999] animate-fade">
                  <div className="p-4 border-b border-slate-800 space-y-1">
                    <p className="text-xs font-bold text-white leading-tight">{user?.full_name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{user?.badge_id}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{user?.department}</p>
                    <span className={`inline-block mt-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                  <button
                    id="logout-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-mono font-bold text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out Officer Session</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Navigation Drawer Toggle */}
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
              className="md:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <nav className="md:hidden bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-1.5 animate-fade" aria-label="Mobile Navigation">
            {navItems.map(({ label, path, icon: Icon, exact }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-mono font-bold transition-colors ${
                  isActive(path, exact) ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {isActive(path, exact) && <ChevronRight className="w-4 h-4 ml-auto text-cyan-400" />}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-mono font-bold text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* ── Main Page Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Professional Footer ── */}
      <footer className="border-t border-slate-900/90 py-5 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600 font-mono">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-700" />
            <span className="font-bold text-slate-400">PRAMANIRIKSH</span>
            <span>· Narcotics Control Bureau / Ministry of Home Affairs</span>
          </div>
          <span>Presumptive colorimetric screening · Laboratory confirmatory analysis required</span>
        </div>
      </footer>

      {/* ── Field Operator Mobile Bottom Bar ── */}
      {(user?.role === 'OPERATOR' || user?.role === 'SUPERVISOR') && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-40 px-2 pb-safe"
          aria-label="Mobile bottom navigation"
        >
          <div className="grid grid-cols-4 gap-1 py-1">
            {navItems.slice(0, 4).map(({ label, path, icon: Icon, exact }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center gap-1 py-2 px-1 text-[10px] font-mono font-bold transition-colors ${
                  isActive(path, exact) ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};
