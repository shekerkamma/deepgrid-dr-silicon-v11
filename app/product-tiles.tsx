'use client';
/** "Our products" as deepgridsemi.com draws it on its home and Accelerators pages: a row of tall tiles,
 *  each part's name set vertically; one tile at a time opens to its claim, three target figures and its
 *  links. A closed tile is plain (a film poster in a narrow tile showed its title as broken fragments); an
 *  open tile leads with its film still, as the reference's tiles lead with a visual. Every figure is a target.
 *
 *  Each tile's spine is a disclosure button (aria-expanded, aria-controls) that stays visible and focusable
 *  when its tile is open, so keyboard focus is never dropped. Hover opens a tile after a short pause, so a
 *  pointer crossing the row does not set every tile moving. Below 860px the row is a stack of labelled rows,
 *  one open at a time, so the list stays a list rather than six screens of cards. */
import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Play} from 'lucide-react';
import {productPages} from './product-pages-data';
import {portfolioParts} from './portfolio-story-data';
import {explainers} from './explainers';
import {nbspUnits} from './diagram-notes';
import {url} from './routes';
import './product-tiles.css';

const STACK = '(max-width: 860px)';

export default function ProductTiles({title = 'Our products', lede = 'Twelve parts, each built for one physical job. Pre-silicon; every figure is a design target.'}: {title?: string; lede?: string}) {
  const [open, setOpen] = useState(0);
  const [stacked, setStacked] = useState(false);
  const hover = useRef<number | undefined>(undefined);
  useEffect(() => {
    const mq = matchMedia(STACK); const apply = () => setStacked(mq.matches);
    apply(); mq.addEventListener('change', apply); return () => mq.removeEventListener('change', apply);
  }, []);
  const intend = (i: number) => { clearTimeout(hover.current); hover.current = window.setTimeout(() => setOpen(i), 140); };
  return (
    <section className="pt" aria-labelledby="pt-title">
      <header className="pt-head"><h2 id="pt-title">{title}</h2><p>{lede}</p></header>
      <ul className={'pt-row' + (stacked ? ' is-stacked' : '')} onMouseLeave={() => clearTimeout(hover.current)}>
        {productPages.map((p, i) => {
          const part = portfolioParts.find(x => x.id === p.portfolioId)!;
          const film = explainers.find(e => e.slug === p.slug);
          const shown = i === open;
          const body = `pt-body-${p.slug}`;
          return (
            <li key={p.slug} className={'pt-tile' + (shown ? ' is-open' : '')} onMouseEnter={() => intend(i)}>
              <button type="button" className="pt-spine" aria-expanded={i === open} aria-controls={body}
                onClick={() => setOpen(i)} onFocus={stacked ? undefined : () => setOpen(i)}>
                <span>{part.code}</span> {part.name}
              </button>
              <div className="pt-body" id={body} aria-hidden={!shown} inert={!shown ? true : undefined}>
                {film && <img className="pt-still" src={film.poster} alt="" width={1920} height={1080} loading="lazy" decoding="async"/>}
                <p className="pt-code">{part.code} · {nbspUnits(part.process)}</p>
                <h3>{part.name}</h3>
                <p className="pt-claim">{nbspUnits(p.headline)}</p>
                <dl>{p.highlights.map(([fig, label]) => <div key={label}><dt>{label}</dt><dd>{nbspUnits(fig)}</dd></div>)}</dl>
                <div className="pt-actions">
                  <a className="primary" href={url('/products/' + p.slug)}>View details <ArrowUpRight size={14} aria-hidden="true"/></a>
                  {film && <a className="pt-ghost" href={url('/products/' + p.slug) + '#pp-inside'}><Play size={13} aria-hidden="true"/> Film · {film.length}</a>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
