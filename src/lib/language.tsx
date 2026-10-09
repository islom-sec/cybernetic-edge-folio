import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { languages, translations, type Language } from './portfolio-content';
export const LANGUAGE_STORAGE_KEY = 'islom-sec-language';
export function detectLanguage(locales: readonly string[]): Language {
  for (const locale of locales) {
    const candidate = locale.split(/[-_]/)[0]?.toUpperCase();
    if (languages.some(language => language === candidate)) return candidate as Language;
  }
  return 'EN';
}
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: 'EN', setLanguage: () => {} });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch { /* Storage may be blocked. */ }
    const initial = languages.find(value => value === saved) ?? detectLanguage(navigator.languages?.length ? navigator.languages : [navigator.language]);
    setLanguage(initial);
  }, []);
  const chooseLanguage = (value: Language) => {
    setLanguage(value);
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, value); } catch { /* Switching still works without storage. */ }
  };
  useEffect(() => { document.documentElement.lang = { EN: 'en', RU: 'ru', UZ: 'uz' }[language]; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage: chooseLanguage }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const context = useContext(LanguageContext); return { ...context, t: translations[context.language] }; }
