import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/language';

export const CHESS_USERNAME = 'Islom01';
const CACHE_KEY = `chess-stats-${CHESS_USERNAME}`;
const CACHE_MS = 10 * 60 * 1000;

type Mode = { last?: { rating: number }; best?: { rating: number }; record?: { win: number; loss: number; draw: number } };
type Stats = { chess_rapid?: Mode; chess_blitz?: Mode; chess_bullet?: Mode };

export function ChessStats() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async (force = false) => {
    setError(false);
    if (!force) {
      try {
        const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? 'null') as { at: number; data: Stats } | null;
        if (cached && Date.now() - cached.at < CACHE_MS) { setStats(cached.data); return; }
      } catch { /* ignore broken cache */ }
    }
    setStats(null);
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${CHESS_USERNAME.toLowerCase()}/stats`);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as Stats;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
      setStats(data);
    } catch { setError(true); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const modes: [string, Mode | undefined][] = [[t.chessRapid, stats?.chess_rapid], [t.chessBlitz, stats?.chess_blitz], [t.chessBullet, stats?.chess_bullet]];
  return <div className="chess-stats" aria-live="polite">
    <p className="eyebrow">{t.chessStatsTitle} · @{CHESS_USERNAME}</p>
    {error ? <div className="chess-error"><p>{t.chessError}</p><Button variant="outline" size="sm" onClick={() => void load(true)}>{t.chessRetry}</Button></div> :
    <div className="chess-stat-grid">{modes.map(([label, mode]) => <div key={label} className="chess-stat">
      <span className="chess-stat-label">{label}</span>
      {!stats ? <><span className="skeleton skeleton-lg"/><span className="skeleton"/></> : mode?.last ? <>
        <strong>{mode.last.rating}</strong>
        <span className="chess-stat-meta">{t.chessBest}: {mode.best?.rating ?? '—'}</span>
        <span className="chess-stat-meta">{t.chessRecord}: {mode.record ? `${mode.record.win} / ${mode.record.loss} / ${mode.record.draw}` : '—'}</span>
      </> : <span className="chess-stat-meta">{t.chessNoGames}</span>}
    </div>)}</div>}
  </div>;
}
