import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LANGUAGE_STORAGE_KEY, LanguageProvider, useLanguage, detectLanguage } from '@/lib/language';
import { languages, translations } from '@/lib/portfolio-content';

beforeEach(() => { localStorage.clear(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function LanguageProbe() {
  const { language, setLanguage, t } = useLanguage();
  return <><output data-testid="language">{language}</output><output data-testid="catalog">{t === translations[language] ? language : 'wrong'}</output>{languages.map(value => <button key={value} onClick={() => setLanguage(value)}>{value}</button>)}</>;
}
describe('Portfolio language rule', () => {
  it.each([['EN', 'en'], ['RU', 'ru'], ['UZ', 'uz']] as const)('selects the %s catalog and document language', (language, locale) => {
    render(<LanguageProvider><LanguageProbe /></LanguageProvider>);
    fireEvent.click(screen.getByRole('button', { name: language }));
    expect(screen.getByTestId('language').textContent).toBe(language);
    expect(screen.getByTestId('catalog').textContent).toBe(language);
    expect(document.documentElement.lang).toBe(locale);
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(language);
  });
  it('restores the saved choice before using browser language', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'UZ');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ru-RU']);
    render(<LanguageProvider><LanguageProbe /></LanguageProvider>);
    expect(screen.getByTestId('language').textContent).toBe('UZ');
    expect(document.documentElement.lang).toBe('uz');
  });
  it('detects browser language on the first visit', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ru-RU', 'en-US']);
    render(<LanguageProvider><LanguageProbe /></LanguageProvider>);
    expect(screen.getByTestId('language').textContent).toBe('RU');
    expect(document.documentElement.lang).toBe('ru');
  });
  it('ignores an invalid saved choice', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'FR');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['uz-Latn-UZ']);
    render(<LanguageProvider><LanguageProbe /></LanguageProvider>);
    expect(screen.getByTestId('language').textContent).toBe('UZ');
  });
  it.each([['ru-RU', 'RU'], ['uz-Latn-UZ', 'UZ'], ['en-US', 'EN']] as const)('recognizes %s', (locale, expected) => {
    expect(detectLanguage([locale])).toBe(expected);
  });
  it('defaults to English for unsupported languages', () => {
    expect(detectLanguage(['fr-FR', 'de-DE'])).toBe('EN');
  });
  it('switches even when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked'); });
    render(<LanguageProvider><LanguageProbe /></LanguageProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'RU' }));
    expect(document.documentElement.lang).toBe('ru');
  });
});