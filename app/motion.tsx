'use client';
import {useEffect} from 'react';

// Scroll behaviour for the whole site, kept out of the views so the markup stays content.
// useScrollVars publishes the navigation height (for anything that sticks under it) and the
// page progress (for the hairline on the navigation bar). useReveal gives existing blocks one
// restrained entrance: an 8px rise, staggered 60ms among siblings, once, when the block
// is actually in view. Reduced motion keeps the content static.

// Only major narrative headings receive an entrance; reading and comparison content stays still.
const REVEAL = ['.thesis-heading', '.dr-arch-intro'].map(s => 'main ' + s).join(',');

export function useScrollVars() {
  useEffect(() => {
    const root = document.documentElement, nav = document.querySelector<HTMLElement>('.main-nav');
    // The sticky element is the v11 .topbar that wraps .main-nav (hidden on phones), so measure the header itself.
    const header = document.querySelector<HTMLElement>('.topbar') ?? nav;
    let raf = 0;
    const progress = () => { raf = 0; const max = root.scrollHeight - innerHeight; nav?.style.setProperty('--page-p', String(max > 0 ? Math.min(1, scrollY / max) : 0)); };
    const measure = () => { if (header) root.style.setProperty('--nav-h', header.offsetHeight + 'px'); progress(); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(progress); };
    measure();
    const ro = new ResizeObserver(measure); if (header) ro.observe(header); ro.observe(document.body);
    addEventListener('scroll', onScroll, {passive: true});
    return () => { removeEventListener('scroll', onScroll); ro.disconnect(); cancelAnimationFrame(raf); };
  }, []);
}

// A sweep on scroll rather than an IntersectionObserver: a fast fling on a slow device can carry a
// block through the viewport between two observer updates and leave it hidden for good. The sweep
// reveals every pending block whose top has crossed 88% of the viewport, including any already
// scrolled past, so nothing can be skipped.
function settle(el: HTMLElement) {
  for (const a of el.getAnimations?.() ?? []) {
    if (a instanceof CSSTransition && (a.transitionProperty === 'opacity' || a.transitionProperty === 'transform')) a.finish();
  }
}

export function useReveal(key: string) {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    document.documentElement.classList.add('rv-on');
    let pending: HTMLElement[] = [], frame = 0;
    const timers: number[] = [];
    const sweep = () => {
      frame = 0;
      const line = innerHeight * 0.88, counts = new Map<Element, number>();
      // Read geometry together before writing styles, avoiding layout thrashing.
      const positions = new Map(pending.filter(el => el.isConnected).map(el => [el, el.getBoundingClientRect()]));
      pending = pending.filter(el => {
        const r = positions.get(el);
        if (!r) return false;
        if (r.top > line) return true;
        if (r.bottom < 0) { el.classList.add('rv-in', 'rv-done'); return false; }
        const parent = el.parentElement!, i = counts.get(parent) || 0;
        counts.set(parent, i + 1);
        const authoredDelay = Number(el.dataset.rvDelay);
        const delay = reduce ? 0 : Number.isFinite(authoredDelay) && el.dataset.rvDelay ? authoredDelay : Math.min(i, 6) * 60;
        el.style.setProperty('--rv-d', delay + 'ms');
        el.classList.add('rv-in');
        // hand transitions back to the element once the entrance is over, so hover and press stay fast.
        // Then finish any entrance fade still pending: on a page with several live WebGL canvases a
        // starved renderer can leave the transition parked at currentTime 0 for seconds, and the
        // block's visibility must never depend on the renderer getting a frame.
        timers.push(window.setTimeout(() => { el.classList.add('rv-done'); settle(el); }, delay + 700));
        return false;
      });
      if (!pending.length) removeEventListener('scroll', onScroll);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(sweep); };
    const start = requestAnimationFrame(() => {
      // Two kinds of target: elements matching REVEAL, which the sweep marks itself, and elements the
      // page authored `data-rv` on directly. `data-rv` is also the sweep's own "claimed" marker, so a
      // hand-authored one used to be read as already handled and skipped forever — with
      // `[data-rv]{opacity:0}` in the stylesheet that left 46 of the overview's 62 blocks invisible on
      // the live site. Claim with a separate attribute so the two meanings cannot collide.
      const authored = [...document.querySelectorAll<HTMLElement>('[data-rv]')];
      for (const el of [...document.querySelectorAll<HTMLElement>(REVEAL), ...authored]) {
        if (el.dataset.rvClaimed !== undefined || el.closest('[data-rv-skip]')) continue;
        if (!authored.includes(el) && el.parentElement?.closest('[data-rv]')) continue;
        el.dataset.rvClaimed = ''; el.dataset.rv = ''; pending.push(el);
      }
      addEventListener('scroll', onScroll, {passive: true});
      addEventListener('resize', onScroll);
      sweep();
    });
    return () => { cancelAnimationFrame(start); cancelAnimationFrame(frame); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); timers.forEach(clearTimeout); };
  }, [key]);
}
