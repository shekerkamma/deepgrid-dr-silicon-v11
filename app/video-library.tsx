'use client';
// The videos page as a streaming library, after the Stitch CLI + Loop demo (youtube.com/watch?v=_IHQ-LoGl9I) and Stitch
// design A (2026-10-26): a banner for the featured film beside a four-film Start here track, search and topic chips,
// then one row per topic with duration and topic badges on every thumbnail. Every video, ours or YouTube's, plays in
// the same on-page player beside its timestamped transcript; nothing on the page sends a visitor to youtube.com to watch. YouTube loads only after a click, from youtube-nocookie.com.
// Copy is the site's own data (resources-data.ts, explainers.ts); the design's placeholder figures were not used.
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Play, Search, X } from 'lucide-react';
import { explainers, type Explainer } from './explainers';
import transcriptIds from '../public/transcripts/index.json';
import { CHANNEL, type Video, type VideoGroup } from './resources-data';
import { url } from './routes';

type Item = { kind: 'yt'; v: Video } | { kind: 'film'; f: Explainer };
type Row = { key: string; title: string; lede?: string; items: Item[]; short?: boolean; badge?: string };
type Playing = { item: Item; row: Item[] } | null;

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
const keyOf = (i: Item) => (i.kind === 'yt' ? i.v.id : i.f.id);
const titleOf = (i: Item) => (i.kind === 'yt' ? i.v.title : `${i.f.code} · ${i.f.title}`);
const lengthOf = (i: Item) => (i.kind === 'yt' ? (i.v.secs ? mmss(i.v.secs) : i.v.short ? 'Short' : '') : i.f.length);
const thumb = (id: string, size: 'hqdefault' | 'sddefault' = 'hqdefault') => `https://i.ytimg.com/vi/${id}/${size}.jpg`;

/** The banner still: YouTube's 640-wide frame. A size YouTube does not have comes back as a 120×90 grey placeholder,
 *  not an error, and the page is pre-rendered, so the image can finish before React attaches onLoad: the check also
 *  runs once the page is live, and falls back to the 480-wide frame every video has. */
function BannerImage({ id }: { id: string }) {
  const img = useRef<HTMLImageElement>(null);
  const check = () => { const i = img.current; if (i && i.complete && i.naturalWidth <= 120 && !i.src.endsWith('/hqdefault.jpg')) i.src = thumb(id); };
  useEffect(check, [id]);
  return <img ref={img} className="vl-hero-img" src={thumb(id, 'sddefault')} alt="" width={640} height={480} decoding="async" onLoad={check} onError={check} />;
}

function Card({ item, short, topic, onPlay }: { item: Item; short?: boolean; topic?: string; onPlay: () => void }) {
  const len = lengthOf(item);
  const src = item.kind === 'yt' ? thumb(item.v.id) : item.f.poster;
  return (
    <li className={'vl-card' + (short ? ' is-short' : '')}>
      <button type="button" className="vl-card-btn" onClick={onPlay} aria-label={`Play ${titleOf(item)}${len && len !== 'Short' ? ', ' + len : ''}`}>
        <span className="vl-thumb">
          <img src={src} alt="" loading="lazy" decoding="async" width={480} height={short ? 853 : 270} />
          <span className="vl-play" aria-hidden="true"><Play size={18} fill="currentColor" /></span>
          {len && <em className="vl-dur">{len}</em>}
          {topic && <span className="vl-badge">{topic}</span>}
          {(item.kind === 'film' || hasTranscript.has(item.v.id)) && <span className="vl-badge vl-badge-tr">Transcript</span>}
        </span>
        <span className="vl-card-text">
          {item.kind === 'film' && <span className="vl-code">{item.f.code}</span>}
          <strong>{item.kind === 'yt' ? item.v.title : item.f.title}</strong>
          {item.kind === 'yt' && item.v.text && !short && <span className="vl-card-sub">{item.v.text}</span>}
        </span>
      </button>
    </li>
  );
}

function RowView({ row, onPlay }: { row: Row; onPlay: (i: Item) => void }) {
  return (
    <section className="vl-row" id={row.key} aria-labelledby={row.key + '-h'}>
      <header className="vl-row-head">
        <h2 id={row.key + '-h'}>{row.title}</h2>
        <span className="vl-row-n">{row.items.length} {row.items.length === 1 ? 'video' : 'videos'}</span>
      </header>
      {row.lede && <p className="vl-row-lede">{row.lede}</p>}
      <ul className={'vl-strip' + (row.short ? ' is-short' : '')} tabIndex={0} aria-label={`${row.title}, scroll for more`}>
        {row.items.map((i) => <Card key={keyOf(i)} item={i} short={row.short} topic={row.badge} onPlay={() => onPlay(i)} />)}
      </ul>
    </section>
  );
}

/** Timestamped lines for a video: YouTube's own captions, saved by scripts/build-video-transcripts.py, or a part
 *  film's caption file. Videos with no narration have none, and the panel says so instead of guessing. */
type Line = [number, string];
const hasTranscript = new Set<string>(transcriptIds);
function parseVtt(vtt: string): Line[] {
  const out: Line[] = [];
  for (const block of vtt.split(/\n\s*\n/)) {
    const m = block.match(/(\d+):(\d+):(\d+(?:\.\d+)?) -->/) ?? block.match(/(\d+):(\d+(?:\.\d+)?) -->/);
    if (!m) continue;
    const t = m.length === 4 ? +m[1] * 3600 + +m[2] * 60 + +m[3] : +m[1] * 60 + +m[2];
    const text = block.split('\n').filter((l) => l && !l.includes('-->') && !/^\d+$/.test(l.trim())).join(' ').replace(/<[^>]+>/g, '').trim();
    if (text) out.push([t, text]);
  }
  return out;
}
function useTranscript(item: Item | undefined): Line[] | null | undefined {
  const [lines, setLines] = useState<{ key: string; lines: Line[] | null } | null>(null);
  const key = item ? keyOf(item) : '';
  useEffect(() => {
    if (!item) return;
    const src = item.kind === 'film' ? item.f.vtt : hasTranscript.has(item.v.id) ? url(`/transcripts/${item.v.id}.json`) : '';
    if (!src) { setLines({ key, lines: null }); return; }
    let live = true;
    fetch(src).then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((t) => { if (live) setLines({ key, lines: item.kind === 'film' ? parseVtt(t) : JSON.parse(t) as Line[] }); })
      .catch(() => { if (live) setLines({ key, lines: null }); });
    return () => { live = false; };
  }, [key]);
  return lines?.key === key ? lines.lines : undefined;
}

const YT_ORIGIN = 'https://www.youtube-nocookie.com';

/** One player for the whole page, in a modal dialog: the video with its transcript beside it, what it is, and the rest
 *  of its row. Closing the dialog unmounts the frame, so YouTube and our films both stop. */
function PlayerDialog({ playing, onPick, onClose }: { playing: Playing; onPick: (i: Item) => void; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (playing && !d.open) d.showModal();
    if (!playing && d.open) d.close();
  }, [playing]);
  const item = playing?.item;
  const lines = useTranscript(item);
  useEffect(() => { setNow(0); }, [item && keyOf(item)]);
  // YouTube reports its playhead to a page that says it is listening (the iframe API's own message channel).
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || typeof e.data !== 'string') return;
      try { const d = JSON.parse(e.data); const t = d?.info?.currentTime; if (typeof t === 'number') setNow(t); } catch { /* not ours */ }
    };
    window.addEventListener('message', on);
    return () => window.removeEventListener('message', on);
  }, []);
  const send = (msg: object) => frame.current?.contentWindow?.postMessage(JSON.stringify(msg), YT_ORIGIN);
  const seek = (t: number) => {
    if (item?.kind === 'film' && video.current) { video.current.currentTime = t; void video.current.play(); }
    else { send({ event: 'command', func: 'seekTo', args: [t, true] }); send({ event: 'command', func: 'playVideo', args: [] }); }
    setNow(t);
  };
  const current = lines ? lines.reduce((at, [t], n) => (t <= now + 0.25 ? n : at), -1) : -1;
  useEffect(() => {
    const el = list.current?.children[current] as HTMLElement | undefined;
    const box = list.current;
    if (el && box) box.scrollTo({ top: el.offsetTop - box.offsetTop - box.clientHeight / 3, behavior: 'smooth' });
  }, [current]);
  const next = playing ? playing.row.filter((i) => keyOf(i) !== keyOf(playing.item)).slice(0, 6) : [];
  return (
    <dialog ref={ref} className="vl-dialog" aria-label={item ? titleOf(item) : 'Video player'} onClose={onClose}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {item && (
        <div className="vl-dialog-body">
          <div className="vl-dialog-bar">
            <p className="vl-dialog-title"><strong>{titleOf(item)}</strong>{lengthOf(item) && <span>{lengthOf(item)}</span>}</p>
            <button type="button" className="vl-close" onClick={onClose} aria-label="Close the player"><X size={20} aria-hidden="true" /></button>
          </div>
          <div className="vl-stage">
            <div className={'vl-screen' + (item.kind === 'yt' && item.v.short ? ' is-short' : '')}>
              {item.kind === 'yt' ? (
                <iframe ref={frame} key={item.v.id}
                  src={`${YT_ORIGIN}/embed/${item.v.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(typeof location === 'undefined' ? '' : location.origin)}`}
                  title={item.v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
                  onLoad={() => send({ event: 'listening', id: item.v.id, channel: 'widget' })} />
              ) : (
                <video ref={video} key={item.f.id} controls autoPlay poster={item.f.poster} playsInline width={1600} height={900}
                  onTimeUpdate={(e) => setNow(e.currentTarget.currentTime)}>
                  <source src={item.f.src} type="video/mp4" />
                  <track kind="captions" src={item.f.vtt} srcLang="en" label="English" default={!item.f.burned} />
                </video>
              )}
            </div>
            <section className="vl-transcript" aria-label="Transcript">
              <p className="vl-transcript-h">Transcript</p>
              {lines === undefined ? <p className="vl-transcript-note">Loading…</p>
                : lines === null ? <p className="vl-transcript-note">This video has no narration, so there is no transcript.</p>
                : (
                  <>
                    <ol ref={list} className="vl-lines">
                      {lines.map(([t, text], n) => (
                        <li key={n}><button type="button" aria-current={n === current ? 'true' : undefined} onClick={() => seek(t)}>
                          <span className="vl-ts">{mmss(Math.floor(t))}</span><span>{text}</span>
                        </button></li>
                      ))}
                    </ol>
                    <p className="vl-transcript-note">{item.kind === 'yt' ? 'From YouTube’s captions, which can mishear names and terms.' : 'From the film’s own captions.'} Select a line to jump to it.</p>
                  </>
                )}
            </section>
          </div>
          <div className="vl-dialog-info">
            <div>
              {item.kind === 'yt' ? item.v.text && <p>{item.v.text}</p> : (
                <>
                  <p>{item.f.sub}. Animations illustrate; they are not simulations. Pre-silicon; every figure is a design target.</p>
                  <p className="vl-dialog-links">
                    <a href={url(`/products/${item.f.slug}`)}>{item.f.code} product page <ArrowRight size={14} aria-hidden="true" /></a>
                    <a href={url('/evidence')}>Evidence register <ArrowRight size={14} aria-hidden="true" /></a>
                  </p>
                </>
              )}
            </div>
            {next.length > 0 && (
              <nav className="vl-next" aria-label="Up next">
                <p>Up next</p>
                <ul>{next.map((i) => (
                  <li key={keyOf(i)}><button type="button" onClick={() => onPick(i)}>
                    <img src={i.kind === 'yt' ? thumb(i.v.id) : i.f.poster} alt="" loading="lazy" width={160} height={90} />
                    <span>{titleOf(i)}{lengthOf(i) && <small>{lengthOf(i)}</small>}</span>
                  </button></li>
                ))}</ul>
              </nav>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}

export function VideoLibrary({ groups, shorts = [], featured, start = [], films, channel }: {
  groups: VideoGroup[]; shorts?: VideoGroup[]; featured?: Video; start?: Video[]; films?: { title: string; lede: string; ids: string[] }; channel?: boolean;
}) {
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState('all');
  const [playing, setPlaying] = useState<Playing>(null);
  const query = q.trim().toLowerCase();
  const has = (t: string) => !query || t.toLowerCase().includes(query);
  const hit = (i: Item) => has(i.kind === 'yt' ? `${i.v.title} ${i.v.text ?? ''}` : `${i.f.code} ${i.f.title} ${i.f.sub}`);

  const parts = (films?.ids ?? []).map((id) => explainers.find((f) => f.id === id)).filter((f): f is Explainer => !!f);
  const rows: Row[] = [
    ...(parts.length ? [{ key: 'vg-films', title: 'Part films', lede: films?.lede, items: parts.map((f) => ({ kind: 'film', f }) as Item) }] : []),
    ...groups.map((g, n) => ({ key: 'vg-' + n, title: g.title, badge: g.title.split(':')[0], lede: g.lede, items: g.videos.map((v) => ({ kind: 'yt', v }) as Item) })),
    ...(shorts.length ? [{ key: 'vg-shorts', title: 'Shorts', short: true, items: shorts.flatMap((g) => g.videos.map((v) => ({ kind: 'yt', v }) as Item)) }] : []),
  ];
  const all = rows.reduce((n, r) => n + r.items.length, 0);
  const shown = rows.filter((r) => topic === 'all' || topic === r.key).map((r) => ({ ...r, items: r.items.filter(hit) })).filter((r) => r.items.length > 0);
  const total = shown.reduce((n, r) => n + r.items.length, 0);
  const filtering = query !== '' || topic !== 'all';
  const home = featured ? rows.find((r) => r.items.some((i) => i.kind === 'yt' && i.v.id === featured.id)) : undefined;
  const play = (item: Item, row: Item[]) => setPlaying({ item, row });

  return (
    <div className="vl">
      {featured && !filtering && (
        <section className="vl-hero" aria-labelledby="vl-hero-h">
          <BannerImage id={featured.id} />
          <div className="vl-hero-copy">
            <p className="vl-hero-tags"><span className="vl-tag">Featured</span>{home && <span>{home.title}</span>}{featured.secs ? <span>{mmss(featured.secs)}</span> : null}</p>
            <h2 id="vl-hero-h">{featured.title}</h2>
            {featured.text && <p className="vl-hero-text">{featured.text}</p>}
            <div className="vl-hero-actions">
              <button type="button" className="primary" onClick={() => play({ kind: 'yt', v: featured }, home?.items ?? [])}>
                <Play size={16} fill="currentColor" aria-hidden="true" /> Play{featured.secs ? ` · ${mmss(featured.secs)}` : ''}
              </button>
              {home && <a className="vl-more" href={'#' + home.key}>More from {home.title} <ArrowRight size={16} aria-hidden="true" /></a>}
            </div>
          </div>
          {start.length > 0 && (
            <nav className="vl-start" aria-labelledby="vl-start-h">
              <p id="vl-start-h">Start here: one film per product line</p>
              <ol>{start.map((v, n) => {
                const row = rows.find((r) => r.items.some((i) => i.kind === 'yt' && i.v.id === v.id));
                return (
                  <li key={v.id}><button type="button" onClick={() => play({ kind: 'yt', v }, start.map((x) => ({ kind: 'yt', v: x }) as Item))}>
                    <span className="vl-start-n">{n + 1}</span>
                    <img src={thumb(v.id)} alt="" loading="lazy" width={160} height={90} />
                    <span className="vl-start-t"><strong>{v.title}</strong><small>{[row?.badge, v.secs ? mmss(v.secs) : ''].filter(Boolean).join(' · ')}</small></span>
                  </button></li>
                );
              })}</ol>
            </nav>
          )}
        </section>
      )}

      <section className="vl-tools" aria-label="Find a video">
        <label className="vl-search">
          <Search size={16} aria-hidden="true" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parts, titles and descriptions" aria-label="Search videos" />
        </label>
        <div className="vl-chips" role="group" aria-label="Filter videos by topic">
          <button type="button" aria-pressed={topic === 'all'} onClick={() => setTopic('all')}>All <small>{all}</small></button>
          {rows.map((r) => <button key={r.key} type="button" aria-pressed={topic === r.key} onClick={() => setTopic(r.key)}>{r.title} <small>{r.items.length}</small></button>)}
        </div>
        <p className="vl-count" aria-live="polite">{filtering ? `${total} of ${all} videos` : `${all} videos`}</p>
        {total === 0 && <p className="vl-empty">No part, title or description contains “{q.trim()}”.</p>}
      </section>

      {shown.map((r) => <RowView key={r.key} row={r} onPlay={(i) => play(i, r.items)} />)}

      {channel && <p className="vl-channel"><a href={CHANNEL} target="_blank" rel="noopener noreferrer">Subscribe to the DeepGrid Semi channel <ArrowUpRight size={14} aria-hidden="true" /></a></p>}

      <PlayerDialog playing={playing} onPick={(i) => playing && setPlaying({ item: i, row: playing.row })} onClose={() => setPlaying(null)} />
    </div>
  );
}
