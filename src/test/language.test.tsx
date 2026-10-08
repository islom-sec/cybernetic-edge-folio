import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageProvider, useLanguage } from '@/lib/language';
import { languages, translations } from '@/lib/portfolio-content';

afterEach(cleanup);
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
  });
});