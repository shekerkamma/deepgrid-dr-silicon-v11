'use client';
/** One pinned scroll act driven by the vendored scrollcraft engine (public/vendor/scrollcraft, unedited).
 *  The engine pins the [data-sc-stage] child for `span` viewport heights and publishes act progress as --sc-p;
 *  this component reads it once per frame and hands the children a progress value.
 *  Pinned only where it can be read: desktop widths (the stage must fit one screen) and motion allowed. Elsewhere
 *  the children render unpinned with progress null and keep their own click-driven behaviour. */
import {useEffect, useRef, useState} from 'react';
import {url} from './routes';

declare global { interface Window { ScrollCraft?: { mount: (root: Element) => unknown; reduce: boolean } } }

let engine: Promise<void> | null = null;
function loadEngine(): Promise<void> {
  if (window.ScrollCraft) return Promise.resolve();
  engine ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url('/vendor/scrollcraft/scrollcraft.js');
    s.onload = () => resolve(); s.onerror = () => reject(new Error('scrollcraft engine failed to load'));
    document.head.appendChild(s);
  });
  return engine;
}

export function ScrollAct({span, minWidth = 1100, className, children}: {span: number; minWidth?: number; className?: string; children: (progress: number | null) => React.ReactNode}) {
  const root = useRef<HTMLDivElement>(null), act = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  useEffect(() => {
    const wide = matchMedia(`(min-width: ${minWidth}px)`), still = matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setPinned(wide.matches && !still.matches);
    apply(); wide.addEventListener('change', apply); still.addEventListener('change', apply);
    return () => { wide.removeEventListener('change', apply); still.removeEventListener('change', apply); };
  }, [minWidth]);
  useEffect(() => {
    // The engine mounts on every device, so scroll-craft's harness can verify the phone and reduced-motion pages
    // too; it pins only where the act carries data-sc-act (desktop width, motion allowed).
    if (!pinned) setProgress(null);
    let raf = 0, live = true, last = -1;
    loadEngine().then(() => {
      if (!live || !root.current || !window.ScrollCraft) return;
      window.ScrollCraft.mount(root.current);              // the engine finds [data-sc-act] inside the root
      if (!pinned || !act.current) return;
      const tick = () => {
        if (!live || !act.current) return;
        const p = parseFloat(getComputedStyle(act.current).getPropertyValue('--sc-p')) || 0;
        const q = Math.round(p * 200) / 200;                 // re-render on visible change only
        if (q !== last) { last = q; setProgress(q); }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }).catch(() => setProgress(null));
    return () => { live = false; cancelAnimationFrame(raf); };
  }, [pinned]);
  // key: a mode change swaps in a fresh root, so a resize across the breakpoint never mounts the engine twice on one node.
  if (!pinned) return <div key="flat" ref={root} className={className}>{children(null)}</div>;
  return <div key="pinned" ref={root} className={className}>
    <div ref={act} className="dgs-scroll-act" data-sc-act="pin" data-sc-span={span}>
      <div data-sc-stage className="dgs-scroll-stage">{children(progress)}</div>
    </div>
  </div>;
}
