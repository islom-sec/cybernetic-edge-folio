import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from '@tanstack/react-router';

const SELECTOR = '.section-heading, .value-item, .skill-card, .project-card, .real-project-card, .strategy-card, .chess-stats, .contact-item, .about-copy';

/** Fade + 16px rise, staggered 80ms, once per element. */
export function Reveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(SELECTOR)).filter(i => !i.classList.contains('is-visible'));
    const observer = new IntersectionObserver(entries => {
      let n = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        target.style.transitionDelay = `${n++ * 80}ms`;
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    }, { threshold: 0.12 });
    items.forEach(i => { i.classList.add('reveal-item'); observer.observe(i); });
    return () => observer.disconnect();
  }, [pathname]);
  return <div ref={root}>{children}</div>;
}
