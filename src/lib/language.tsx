import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Language } from './portfolio-content';
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: 'EN', setLanguage: () => {} });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');
  useEffect(() => { document.documentElement.lang = { EN: 'en', RU: 'ru', UZ: 'uz' }[language]; }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const context = useContext(LanguageContext); return { ...context, t: translations[context.language] }; }
