import { useCallback, useEffect, useRef, useState } from 'react';
import { PageTransitionContext, usePageTransition } from '../context/pageTransition';
import '../styles/pageTransition.css';

const VEIL_SIZE = 40;
const EXPAND_MS = 300;
const FADE_MS = 180;
const SAFETY_MS = 1600;

const prefersReducedMotion = () => (
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches
);

export const PageTransitionProvider = ({ children }) => {
  const [veil, setVeil] = useState(null);
  const activeRef = useRef(false);
  const finishingRef = useRef(false);
  const expandEndRef = useRef(0);
  const timeoutsRef = useRef([]);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn, delay) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const finish = useCallback(() => {
    if (!activeRef.current || finishingRef.current) return;
    finishingRef.current = true;

    const wait = Math.max(0, expandEndRef.current - performance.now());
    schedule(() => {
      setVeil((v) => (v ? { ...v, phase: 'fade' } : v));
      schedule(() => {
        activeRef.current = false;
        setVeil(null);
      }, FADE_MS);
    }, wait);
  }, [schedule]);

  const start = useCallback((el) => {
    if (!el || prefersReducedMotion()) return;

    clearTimers();
    activeRef.current = true;
    finishingRef.current = false;

    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const dx = Math.max(x, window.innerWidth - x);
    const dy = Math.max(y, window.innerHeight - y);
    const scale = (2 * Math.hypot(dx, dy)) / VEIL_SIZE + 0.08;

    expandEndRef.current = performance.now() + EXPAND_MS;
    setVeil({ x, y, scale, phase: 'expand' });
    schedule(finish, SAFETY_MS);
  }, [clearTimers, schedule, finish]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <PageTransitionContext.Provider value={{ start, finish, veil }}>
      {children}
    </PageTransitionContext.Provider>
  );
};

// Rendered inside <Suspense>: its effect fires only when the new (lazy) page
// has actually mounted, so the empty veil stays until the page is ready.
export const PageReady = ({ children }) => {
  const { finish } = usePageTransition();
  useEffect(() => { finish(); }, [finish]);
  return children;
};

export const PageTransitionVeil = () => {
  const { veil } = usePageTransition();
  if (!veil) return null;

  return (
    <div
      className={`page-veil${veil.phase === 'fade' ? ' is-fading' : ''}`}
      style={{
        '--pt-x': `${veil.x}px`,
        '--pt-y': `${veil.y}px`,
        '--pt-scale': veil.scale,
      }}
      aria-hidden="true"
    />
  );
};
