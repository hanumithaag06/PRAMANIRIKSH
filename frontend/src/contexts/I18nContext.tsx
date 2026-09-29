/**
 * i18n Context — fetches supported languages and translations dynamically from the backend.
 * NO hardcoded language strings or language lists exist in the frontend.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_BASE = '/api/v1';

export interface Language {
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

// Flat translation map - keys use dot notation resolved at runtime
type TranslationMap = Record<string, any>;

interface I18nContextValue {
  lang: string;
  languages: Language[];
  setLang: (code: string) => void;
  t: (key: string, vars?: Record<string, string>) => string;
  direction: 'ltr' | 'rtl';
  loadingLangs: boolean;
  loadingTranslations: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  languages: [],
  setLang: () => {},
  t: (key) => key,
  direction: 'ltr',
  loadingLangs: true,
  loadingTranslations: false,
});

const LANG_STORAGE_KEY = 'pramaniriksh_lang';

/** Resolve a dot-notation key (e.g. "nav.newTest") from a nested object */
function resolveDot(obj: TranslationMap, key: string): string | undefined {
  const parts = key.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/** Replace {varName} placeholders in a string */
function interpolate(str: string, vars?: Record<string, string>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<string>(
    () => localStorage.getItem(LANG_STORAGE_KEY) || 'en'
  );
  const [languages, setLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<TranslationMap>({});
  const [loadingLangs, setLoadingLangs] = useState(true);
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  // Fetch available language list from backend
  useEffect(() => {
    fetch(`${API_BASE}/i18n/languages`)
      .then((r) => r.json())
      .then((data: Language[]) => {
        setLanguages(data);
      })
      .catch(() => {
        // Minimal fallback if backend is unreachable
        setLanguages([{ code: 'en', name: 'English', native_name: 'English', direction: 'ltr', flag: '🇬🇧' }]);
      })
      .finally(() => setLoadingLangs(false));
  }, []);

  // Fetch translations whenever lang changes
  useEffect(() => {
    setLoadingTranslations(true);
    fetch(`${API_BASE}/i18n/translations/${lang}`)
      .then((r) => {
        if (!r.ok) throw new Error('Translation not found');
        return r.json();
      })
      .then((data: TranslationMap) => setTranslations(data))
      .catch(() => {
        // Fall back to English if target language file is missing
        if (lang !== 'en') {
          fetch(`${API_BASE}/i18n/translations/en`)
            .then((r) => r.json())
            .then(setTranslations)
            .catch(() => {});
        }
      })
      .finally(() => setLoadingTranslations(false));
  }, [lang]);

  const setLang = useCallback((code: string) => {
    localStorage.setItem(LANG_STORAGE_KEY, code);
    setLangState(code);
    // Update document direction for RTL languages
    const found = languages.find((l) => l.code === code);
    document.documentElement.dir = found?.direction ?? 'ltr';
    document.documentElement.lang = code;
  }, [languages]);

  const t = useCallback(
    (key: string, vars?: Record<string, string>): string => {
      const raw = resolveDot(translations, key);
      if (raw === undefined) return key; // Return key as fallback
      return interpolate(raw, vars);
    },
    [translations]
  );

  const currentLang = languages.find((l) => l.code === lang);
  const direction = currentLang?.direction ?? 'ltr';

  return (
    <I18nContext.Provider value={{ lang, languages, setLang, t, direction, loadingLangs, loadingTranslations }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
