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

    const isMobile = window.innerWidth < 768;
    const fontSize = isMobile ? 18 : 14;
    const charSet = isMobile
      ? '01ABCDEF<>{}[]/$#'
      : '01ABCDEF<>{}[]/$#&%@!?*+=~-_|\\';
    let columns = 0;
    let drops: number[] = [];
    let visible = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(0).map(() => Math.floor(Math.random() * -50));
    };
    resize();

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry) visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    let lastFrame = 0;
    const frameInterval = isMobile ? 67 : 0;

    const draw = (now: number) => {
      if (visible) {
        if (frameInterval === 0 || now - lastFrame >= frameInterval) {
          lastFrame = now;
          const isDark = theme === 'dark';
          ctx.fillStyle = isDark ? 'rgba(13, 17, 23, 0.06)' : 'rgba(248, 249, 250, 0.05)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
          for (let i = 0; i < columns; i++) {
            const text = charSet[Math.floor(Math.random() * charSet.length)] ?? '0';
            const x = i * fontSize;
            const y = (drops[i] ?? 0) * fontSize;
            ctx.fillStyle = isDark
              ? `rgba(0, 255, 102, ${Math.random() * 0.4 + 0.1})`
              : `rgba(0, 77, 26, ${Math.random() * 0.1 + 0.15})`;
            ctx.fillText(text, x, y);
            if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i] = (drops[i] ?? 0) + 1;
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      observer.disconnect();
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
