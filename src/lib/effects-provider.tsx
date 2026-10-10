import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';
type EffectsContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  playClick: () => void;
  playKey: () => void;
  matrixEnabled: boolean;
  toggleMatrix: () => void;
};

const EffectsContext = createContext<EffectsContextValue>({
  theme: 'light',
  toggleTheme: () => {},
  soundEnabled: false,
  toggleSound: () => {},
  playClick: () => {},
  playKey: () => {},
  matrixEnabled: true,
  toggleMatrix: () => {},
});

const THEME_KEY = 'islom-sec-theme';
const SOUND_KEY = 'islom-sec-sound';
const MATRIX_KEY = 'islom-sec-matrix';

export function EffectsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [matrixEnabled, setMatrixEnabled] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
      const savedSound = localStorage.getItem(SOUND_KEY);
      if (savedSound === 'true') setSoundEnabled(true);
      const savedMatrix = localStorage.getItem(MATRIX_KEY);
      if (savedMatrix === 'false') setMatrixEnabled(false);
    } catch { /* storage blocked */ }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* storage blocked */ }
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem(SOUND_KEY, soundEnabled ? 'true' : 'false'); } catch { /* storage blocked */ }
  }, [soundEnabled]);

  useEffect(() => {
    try { localStorage.setItem(MATRIX_KEY, matrixEnabled ? 'true' : 'false'); } catch { /* storage blocked */ }
  }, [matrixEnabled]);

  const toggleTheme = useCallback(() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark')), []);
  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);
  const toggleMatrix = useCallback(() => setMatrixEnabled(prev => !prev), []);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const baseFreq = 700 + Math.random() * 300;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'square';
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
      filter.Q.setValueAtTime(2, ctx.currentTime);
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch { /* audio unavailable */ }
  }, [soundEnabled]);

  const playKey = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const baseFreq = 1200 + Math.random() * 800;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'triangle';
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.03);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch { /* audio unavailable */ }
  }, [soundEnabled]);

  return (
    <EffectsContext.Provider value={{ theme, toggleTheme, soundEnabled, toggleSound, playClick, playKey, matrixEnabled, toggleMatrix }}>
      {children}
    </EffectsContext.Provider>
  );
}

export function useEffects() {
  return useContext(EffectsContext);
}
