import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';
import { languages, paths } from '@/lib/portfolio-content';

export function PortfolioNavigation() {
  const { language, setLanguage, t } = useLanguage();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePath, setActivePath] = useState(pathname);
  const progress = useRef<HTMLDivElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${ratio})`;
      setScrolled(window.scrollY > 24);
      let current = pathname;
      if (pathname === '/') {
        current = '/';
        document.querySelectorAll<HTMLElement>('main [data-section]').forEach(section => {
          if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
            current = section.dataset['section'] ?? current;
          }
        });
      }
      setActivePath(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    const breakpoint = window.matchMedia('(min-width: 851px)');
    const closeOnDesktop = () => { if (breakpoint.matches) setMenuOpen(false); };
    breakpoint.addEventListener('change', closeOnDesktop);
    return () => breakpoint.removeEventListener('change', closeOnDesktop);
  }, []);

  const labels = {
    EN: { menu: 'Open menu', navigation: 'Main navigation', language: 'Language', home: 'Mirislom home' },
    RU: { menu: 'Открыть меню', navigation: 'Главная навигация', language: 'Язык', home: 'Мирислом — главная' },
    UZ: { menu: 'Menyuni ochish', navigation: 'Asosiy navigatsiya', language: 'Til', home: 'Mirislom — bosh sahifa' },
  }[language];
  const languageControl = <div className="language-switch" data-language={language} role="group" aria-label={labels.language}>
    <span className="language-indicator" aria-hidden="true" />
    {languages.map(lang => <Button key={lang} variant="language" size="sm" aria-pressed={language === lang} onClick={() => setLanguage(lang)}>{lang}</Button>)}
  </div>;
  const brand = <Link to="/" className="brand" aria-label={labels.home} onClick={() => setMenuOpen(false)}><span className="brand-prompt">~/mirislom<span className="text-primary">$</span></span><span className="brand-cursor" aria-hidden="true">▍</span></Link>;
  const links = paths.map((path, i) => <Link key={path} to={path} className={activePath === path ? 'nav-active' : undefined} aria-current={activePath === path ? pathname === path ? 'page' : 'location' : undefined} onClick={() => setMenuOpen(false)}>{t.nav[i]}{menuOpen && <ArrowUpRight aria-hidden="true" size={24} />}</Link>);

  return <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div ref={progress} className="scroll-progress" aria-hidden="true" />
      <div className="page-width header-inner">{brand}<nav className="desktop-nav" aria-label={labels.navigation}>{links}</nav><div className="header-tools">{languageControl}<DialogPrimitive.Trigger asChild><Button ref={menuTrigger} variant="ghost" size="icon" className="mobile-menu-button" aria-label={labels.menu}><Menu /></Button></DialogPrimitive.Trigger></div></div>
    </header>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="mobile-menu-backdrop" />
      <DialogPrimitive.Content className="mobile-menu-overlay" aria-describedby={undefined} onCloseAutoFocus={event => { event.preventDefault(); menuTrigger.current?.focus(); }}>
        <DialogPrimitive.Title className="sr-only">{labels.navigation}</DialogPrimitive.Title>
        <div className="mobile-overlay-header"><div className="page-width header-inner">{brand}<div className="header-tools">{languageControl}<DialogPrimitive.Close asChild><Button variant="ghost" size="icon" className="mobile-menu-button" aria-label={t.close}><X /></Button></DialogPrimitive.Close></div></div></div>
        <nav className="mobile-nav page-width" aria-label={labels.navigation}>{links}</nav>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>;
}