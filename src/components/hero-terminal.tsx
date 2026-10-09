import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLanguage } from '@/lib/language';
import { completeCommand, isCommand, terminalCommands, terminalText } from '@/lib/terminal-content';

type Entry = { id: number; cmd: string };
const intro = ['whoami', 'skills'];
const shownCmd = (c: string) => (c === 'skills' ? 'cat skills.txt' : c);

export function HeroTyper({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[index % words.length] ?? '';
  useEffect(() => { setLen(0); setDeleting(false); setIndex(0); }, [words]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setLen(word.length); const t = setTimeout(() => setIndex(i => i + 1), 2500); return () => clearTimeout(t); }
    let delay = deleting ? 35 : 75;
    if (!deleting && len === word.length) delay = 1600;
    const t = setTimeout(() => {
      if (!deleting && len === word.length) setDeleting(true);
      else if (deleting && len === 0) { setDeleting(false); setIndex(i => i + 1); }
      else setLen(l => l + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(t);
  }, [len, deleting, word]);
  return <p className="hero-typer" aria-label={words.join(', ')}><span className="text-primary">&gt;</span> <span aria-hidden="true">{word.slice(0, len)}</span><span className="typer-caret" aria-hidden="true"/></p>;
}

export function HeroTerminal() {
  const { language, t } = useLanguage();
  const text = terminalText[language];
  const [entries, setEntries] = useState<Entry[]>([]);
  const [typing, setTyping] = useState('');
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [pointer, setPointer] = useState(-1);
  const body = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    (async () => {
      await sleep(500);
      for (const cmd of intro) {
        const shown = shownCmd(cmd);
        for (let i = 1; i <= shown.length && !cancelled; i++) { setTyping(shown.slice(0, i)); await sleep(70); }
        if (cancelled) return;
        await sleep(250);
        setTyping('');
        setEntries(e => [...e, { id: nextId.current++, cmd }]);
        await sleep(500);
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { body.current?.scrollTo({ top: body.current.scrollHeight }); }, [entries, typing]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    setHistory(h => [...h, cmd]);
    setPointer(-1);
    if (cmd === 'clear') { setEntries([]); return; }
    setEntries(e => [...e, { id: nextId.current++, cmd }]);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { run(value); setValue(''); }
    else if (e.key === 'Tab') { e.preventDefault(); setValue(v => completeCommand(v)); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const p = pointer === -1 ? history.length - 1 : Math.max(0, pointer - 1);
      setPointer(p); setValue(history[p] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (pointer === -1) return;
      const p = pointer + 1;
      if (p >= history.length) { setPointer(-1); setValue(''); } else { setPointer(p); setValue(history[p] ?? ''); }
    }
  };

  return (
    <div className="hero-terminal" onClick={() => ready && input.current?.focus({ preventScroll: true })}>
      <div className="terminal-top"><span className="terminal-dots"><i/><i/><i/></span><span>{t.terminal}</span></div>
      <div ref={body} className="hero-terminal-body" aria-live="polite">
        {entries.map(entry => (
          <div key={entry.id} className="terminal-entry">
            <p><span className="text-primary">❯</span> {shownCmd(entry.cmd)}</p>
            {(isCommand(entry.cmd) && entry.cmd !== 'clear' ? text.output[entry.cmd] : [text.notFound(entry.cmd)]).map((line, i) => <p key={i} className="terminal-output">{line}</p>)}
          </div>
        ))}
        {!ready && <p><span className="text-primary">❯</span> {typing}<span className="typer-caret"/></p>}
        {ready && (
          <>
            {entries.length === 0 && <p className="terminal-output">{text.hint}</p>}
            <label className="terminal-input-row">
              <span className="text-primary">❯</span>
              <input ref={input} value={value} onChange={e => setValue(e.target.value)} onKeyDown={onKey} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label={text.hint} placeholder="help"/>
            </label>
          </>
        )}
      </div>
      <div className="terminal-chips" aria-label={text.quick}>
        {terminalCommands.map(c => <button key={c} type="button" disabled={!ready} onClick={(e) => { e.stopPropagation(); run(c); }}>{c}</button>)}
      </div>
    </div>
  );
}
