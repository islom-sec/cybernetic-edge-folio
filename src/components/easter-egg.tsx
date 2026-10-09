import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/language';
import { extras } from '@/lib/extras-content';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const FLAG = 'flag{curiosity_is_the_first_exploit}';

export function EasterEgg() {
  const { language } = useLanguage();
  const x = extras[language];
  const [open, setOpen] = useState(false);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log('%c\n  ~/mirislom$ _\n  ┌──────────────────────────┐\n  │  Curious? Good.          │\n  └──────────────────────────┘', 'color:#00ff66;font-family:monospace');
    console.log('%cMini-challenge: decode this → ' + btoa('Try the Konami code or click the logo 5 times.'), 'color:#22d3ee;font-family:monospace');
    let seq: string[] = [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      seq = [...seq, e.key.length === 1 ? e.key.toLowerCase() : e.key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) { setOpen(true); seq = []; }
    };
    let clicks = 0; let timer = 0;
    const onClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.brand')) return;
      clicks++; clearTimeout(timer); timer = window.setTimeout(() => { clicks = 0; }, 1500);
      if (clicks >= 5) { clicks = 0; e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick, true);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick, true); clearTimeout(timer); };
  }, []);

  useEffect(() => { if (open) close.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="egg-overlay" role="dialog" aria-modal="true" aria-labelledby="egg-title" onClick={() => setOpen(false)}>
      <div className="egg-box" onClick={e => e.stopPropagation()}>
        <p id="egg-title" className="egg-title">{x.eggTitle}</p>
        <p>{x.eggBody}</p>
        <code className="egg-flag">{FLAG}</code>
        <button ref={close} type="button" className="egg-close" onClick={() => setOpen(false)}>{x.eggClose}</button>
      </div>
    </div>
  );
}
