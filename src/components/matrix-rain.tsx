import { useEffect, useRef } from 'react';
import { useEffects } from '@/lib/effects-provider';

export function MatrixRain() {
  const { matrixEnabled, theme } = useEffects();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !matrixEnabled) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let columns = 0;
    let drops: number[] = [];
    const fontSize = 14;
    const chars = '01ABCDEF<>{}[]/$#&%@!?*+=~-_|\\';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * -50));
    };
    resize();

    const draw = () => {
      const isDark = theme === 'dark';
      ctx.fillStyle = isDark ? 'rgba(13, 17, 23, 0.06)' : 'rgba(248, 249, 250, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)] ?? '0';
        const x = i * fontSize;
        const y = (drops[i] ?? 0) * fontSize;
        ctx.fillStyle = isDark
          ? `rgba(0, 255, 102, ${Math.random() * 0.4 + 0.1})`
          : `rgba(0, 77, 26, ${Math.random() * 0.1 + 0.15})`;
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] = (drops[i] ?? 0) + 1;
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [matrixEnabled, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      aria-hidden="true"
    />
  );
}
