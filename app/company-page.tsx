'use client';
import {useRouteStory} from './executive-story';
// Renders a Software / Use case / About / Contact page from app/company-pages.ts, in the showcase's
// look: the showcase's SectionHead, its tokens, and a small set of section shapes taken from
// deepgridsemi.com's templates (split, card grid, steps, stats, people, figures, contact, CTA).
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, BookOpen, Boxes, Check, CircleCheck, Cpu, Download, Film, Gauge, Hand, Layers, Library, Loader, Mail, MapPin, Mic, Play, ScanEye, SlidersHorizontal, Terminal } from 'lucide-react';
import type { FlowStep } from './company-pages';
import { url } from './routes';
import { useReduced } from './shell';
import { MotorScene } from './three/scenes';
import AppModel3D from './app-model-3d';
import { films } from './dg32-films';
import { explainers } from './explainers';
import { FilmPlayer as Player } from './film-player';
import { CHANNEL, type Video } from './resources-data';
import type { CompanyPage, Person, Section } from './company-pages';

// Scenes are concept renders; posters are stills from DeepGrid’s simulators; apexgrid-* are stills from the
// company's own video; the rest are illustrations.
const captionFor = (src: string) =>
  src.includes('/apexgrid') ? 'Stills from DeepGrid Semi’s Apexgrid video' : src.includes('/scenes/') || src.includes('/media/deepgrid_') ? 'Concept render' : src.includes('/posters/') ? 'Simulation still' : 'Illustration';

function Figure({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={'cp-figure ' + className}>
      <img src={src} alt={alt} width={1600} height={900} loading="lazy" decoding="async" />
      <figcaption>{captionFor(src)}</figcaption>
    </figure>
  );
}

function PersonCard({ p }: { p: Person }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="cp-person">
      <div className="cp-person-head">
        {p.photo ? <img src={p.photo} alt={'Portrait of ' + p.name} width={72} height={72} loading="lazy" /> : <span className="cp-initials" aria-hidden="true">{p.initials}</span>}
        <div>
          <h3>{p.name}</h3>
          <p className="cp-role">{p.role}</p>
        </div>
      </div>
      {p.detail && <p className="cp-detail">{p.detail}</p>}
      {p.bio && (
        <>
          <button type="button" className="text-link cp-bio-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? 'Hide bio' : 'See bio'}
          </button>
          {open && <ul className="cp-bio">{p.bio.map((b) => <li key={b}>{b}</li>)}</ul>}
        </>
      )}
    </article>
  );
}

const INTERESTS = ['AI Accelerators', 'Software Solutions', 'Complete Systems', 'Partnership Opportunities', 'Other'];
const OFFICE_MAP = 'https://www.openstreetmap.org/search?query=T-Hub%2C%20Knowledge%20City%2C%20Hyderabad';

// deepgridsemi.com's contact page: a message form, contact information, a demo booking and the office.
// This site is static, so the form composes an email to group@deepgrid.in in the visitor's own mail app.
function ContactBlock() {
  const [sent, setSent] = useState(false);
  return (
    <section className="cp-sec cp-contact-page">
      <form
        className="cp-card cp-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const get = (k: string) => String(f.get(k) || '').trim();
          const subject = 'Enquiry' + (get('interest') ? ': ' + get('interest') : '') + (get('company') ? ' · ' + get('company') : '');
          const body = [get('message'), '', '—', get('name'), get('email'), get('company')].filter((x, i) => x || i < 3).join('\n');
          location.href = 'mailto:group@deepgrid.in?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          setSent(true);
        }}
      >
        <h2>Send Us a Message</h2>
        <label><span className="cp-field">Name <b aria-hidden="true">*</b></span><input name="name" required autoComplete="name" /></label>
        <label><span className="cp-field">Email <b aria-hidden="true">*</b></span><input name="email" type="email" required autoComplete="email" spellCheck={false} /></label>
        <label>Company<input name="company" autoComplete="organization" /></label>
        <label>Interest
          <select name="interest" defaultValue="">
            <option value="">Select an option</option>
            {INTERESTS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <label><span className="cp-field">Message <b aria-hidden="true">*</b></span><textarea name="message" required rows={5} /></label>
        <button type="submit" className="primary">Send Message</button>
        <p className="cp-detail" role="status">{sent ? 'Your email app should now be open with the message ready to send.' : 'Opens your email app with the message addressed to group@deepgrid.in.'}</p>
      </form>
      <div className="cp-contact-side">
        <div className="cp-card">
          <Mail size={20} aria-hidden="true" />
          <h2>Contact Information</h2>
          <p><span className="cp-meta">Email</span><br /><a className="text-link" href="mailto:group@deepgrid.in">group@deepgrid.in</a></p>
          <p><span className="cp-meta">Headquarters</span><br />T-Hub, Floor-7<br />Hyderabad, India</p>
        </div>
        <div className="cp-card">
          <ArrowUpRight size={20} aria-hidden="true" />
          <h2>Schedule a Demo</h2>
          <p>See our AI accelerators in action with a personalized demonstration</p>
          <p><a className="primary" href="mailto:group@deepgrid.in?subject=Demo%20request">Book Demo</a></p>
        </div>
        <div className="cp-card">
          <MapPin size={20} aria-hidden="true" />
          <h2>Visit Our Office</h2>
          <p>T-Hub, Floor-7, Knowledge City, Hyderabad, India</p>
          <p><a className="text-link" href={OFFICE_MAP} target="_blank" rel="noopener noreferrer">Find us on the map <ArrowUpRight size={14} aria-hidden="true" /></a></p>
        </div>
      </div>
    </section>
  );
}

const ICONS = { layers: Layers, sliders: SlidersHorizontal, boxes: Boxes, cpu: Cpu, gauge: Gauge, terminal: Terminal, book: BookOpen, library: Library, check: Check, progress: Loader, eye: ScanEye, mic: Mic, hand: Hand, film: Film } as const;
const Icon = ({ name, size = 18 }: { name?: string; size?: number }) => {
  const C = name ? ICONS[name as keyof typeof ICONS] : undefined;
  return C ? <C size={size} aria-hidden="true" /> : null;
};

// A pipeline drawn as connected stages; a pulse travels it once the section is on screen (still under reduced motion).
function Flow({ steps, label }: { steps: FlowStep[]; label?: string }) {
  return (
    <figure className="cp-flow" aria-label={label}>
      {label && <figcaption className="cp-meta">{label}</figcaption>}
      <ol>
        {steps.map((st, i) => (
          <li key={st.label} style={{ ['--i' as string]: i }}>
            <span className="cp-flow-icon"><Icon name={st.icon} size={20} /></span>
            <span className="cp-flow-text"><strong>{st.label}</strong><small>{st.text}</small></span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

// Site paths in the data are written root-relative ('contact', '/evidence'); resolve them under the Pages base.
const link = (h: string) => (/^(https?:|mailto:|#)/.test(h) ? h : url(h.startsWith('/') ? h : '/' + h));


const mmss = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;

// A YouTube video as a thumbnail until it is asked for: no third-party frame, cookie or autoplay before a click.
function YouTube({ v }: { v: Video }) {
  const [on, setOn] = useState(false);
  return (
    <figure className={'cp-yt' + (v.short ? ' is-short' : '')}>
      <div className="cp-yt-frame">
        {on ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
            title={v.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="cp-yt-play" onClick={() => setOn(true)} aria-label={`Play ${v.title}${v.secs ? ', ' + mmss(v.secs) : ''}`}>
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" width={480} height={360} />
            <span className="cp-yt-btn"><Play size={16} fill="currentColor" aria-hidden="true" /></span>
            {v.secs ? <em className="cp-yt-dur">{mmss(v.secs)}</em> : v.short ? <em className="cp-yt-dur">Short</em> : null}
          </button>
        )}
      </div>
      <figcaption>
        <strong>{v.title}</strong>
        {v.text && <span>{v.text}</span>}
        <a className="cp-yt-link" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <ArrowUpRight size={12} aria-hidden="true" /></a>
      </figcaption>
    </figure>
  );
}

function SceneSection({ s }: { s: Extract<Section, { kind: 'scene' }> }) {
  const reduced = useReduced();
  return (
    <section className="cp-sec">
      <div className="s3-block">
        {s.scene === 'motor' ? <MotorScene reduced={reduced} /> : (
          <figure className="s3"><div className="s3-stage s3-app"><AppModel3D type={s.scene} label={`Illustrative 3D model: ${s.title}. Drag to rotate.`} /></div>
            <figcaption className="s3-caption">Illustrative model. Drag to rotate.</figcaption></figure>
        )}
        <div><h2>{s.title}</h2><p>{s.lede}</p></div>
      </div>
    </section>
  );
}

function Block({ s }: { s: Section }) {
  switch (s.kind) {
    case 'split':
      return (
        <section className={'cp-sec cp-split' + (s.image || s.flow ? '' : ' cp-split-solo')}>
          <div className="cp-split-text">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
            {s.lede && <p className="cp-lede">{s.lede}</p>}
            {s.paras.map((p) => <p key={p}>{p}</p>)}
          </div>
          {s.image && <Figure src={s.image} alt={s.imageAlt || ''} />}
          {s.flow && <Flow steps={s.flow} label={s.flowLabel} />}
        </section>
      );
    case 'cards':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
            {s.lede && <p className="cp-lede">{s.lede}</p>}
          </header>
          <div className={'cp-cards cp-cols-' + s.cols + (s.items.every((c) => c.image && !c.href) ? ' cp-tiles' : '')}>
            {s.items.map((c) => {
              const inner = (
                <>
                  {c.image && <img className="cp-card-img" src={c.image} alt="" width={640} height={360} loading="lazy" decoding="async" />}
                  {c.icon && <span className={'cp-card-icon is-' + c.icon}><Icon name={c.icon} /></span>}
                  {c.meta && <p className="cp-meta">{c.meta}</p>}
                  <h3>{c.title}</h3>
                  {c.text && <p>{c.text}</p>}
                  {c.href && <span className="cp-card-go">{c.go || 'Read more'} <ArrowRight size={14} aria-hidden="true" /></span>}
                </>
              );
              return c.href ? <a key={c.title} className="cp-card cp-card-link" href={link(c.href)}>{inner}</a> : <article key={c.title} className="cp-card">{inner}</article>;
            })}
          </div>
        </section>
      );
    case 'steps':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
            {s.lede && <p className="cp-lede">{s.lede}</p>}
          </header>
          <ol className="cp-steps">
            {s.items.map((c, i) => (
              <li key={c.title}><span className="cp-step-n" aria-hidden="true">{i + 1}</span><h3>{c.title}</h3>{c.text && <p>{c.text}</p>}</li>
            ))}
          </ol>
        </section>
      );
    case 'stats':
      return (
        <section className="cp-sec cp-stats" aria-label="Key figures">
          {s.items.map(([v, l]) => <div key={l}><strong>{v}</strong><span>{l}</span></div>)}
        </section>
      );
    case 'people':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
          </header>
          <div className="cp-people">{s.people.map((p) => <PersonCard key={p.name} p={p} />)}</div>
        </section>
      );
    case 'figures':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head"><h2>{s.title}</h2></header>
          <div className="cp-figures">
            {s.items.map((f) => (
              <figure key={f.src} className="cp-figure">
                <img src={f.src} alt={f.alt} width={f.w} height={f.h} loading="lazy" decoding="async" />
                <figcaption>{f.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    case 'contact':
      return <ContactBlock />;
    case 'roster':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
            {s.lede && <p className="cp-lede">{s.lede}</p>}
          </header>
          <div className="cp-roster">
            {s.groups.map((g) => (
              <div key={g.title} className="cp-card">
                <h3>{g.title} <span className="cp-count">{g.people.length}</span></h3>
                <ul>{g.people.map(([n, r]) => <li key={n}><strong>{n}</strong><span>{r}</span></li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      );
    case 'films':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
            {s.lede && <p className="cp-lede">{s.lede}</p>}
          </header>
          <div className={'cp-films' + (s.ids.length > 1 ? ' cp-films-multi' : '')}>
            {s.ids.map((id) => [...films, ...explainers].find((f) => f.id === id)).filter((f) => !!f).map((f) => (
              <figure key={f.id} className="cp-film">
                <Player film={f} />
                <figcaption><strong>{f.title}</strong><span>{f.sub} · {f.length}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    case 'videos':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
            {s.lede && <p className="cp-lede">{s.lede}</p>}
          </header>
          {s.groups.length > 1 && (
            <nav className="cp-vnav" aria-label="Video groups">
              {s.groups.map((g, i) => <a key={g.title} href={'#vg-' + i}>{g.title} <small>{g.videos.length}</small></a>)}
              {s.shorts && <a href="#vg-shorts">Shorts <small>{s.shorts.reduce((n, g) => n + g.videos.length, 0)}</small></a>}
            </nav>
          )}
          {s.groups.map((g, i) => (
            <div key={g.title} className="cp-vgroup" id={s.groups.length > 1 ? 'vg-' + i : undefined}>
              {s.groups.length > 1 && (
                <header className="cp-vgroup-head">
                  <h3>{g.title} <span className="cp-count">{g.videos.length} {g.videos.length === 1 ? 'video' : 'videos'}</span></h3>
                  {g.lede && <p>{g.lede}</p>}
                </header>
              )}
              <div className="cp-yts">{g.videos.map((v) => <YouTube key={v.id} v={v} />)}</div>
            </div>
          ))}
          {s.shorts && (
            <div className="cp-vgroup" id={s.groups.length > 1 ? 'vg-shorts' : undefined}>
              <header className="cp-vgroup-head"><h3>Shorts</h3></header>
              {s.shorts.map((g) => (
                <div key={g.title}>
                  {s.shorts!.length > 1 && <p className="cp-meta cp-shorts-title">{g.title}</p>}
                  <div className="cp-yts cp-yts-short">{g.videos.map((v) => <YouTube key={v.id} v={v} />)}</div>
                </div>
              ))}
            </div>
          )}
          {s.channel && <p className="cp-actions"><a className="primary" href={CHANNEL} target="_blank" rel="noopener noreferrer">The DeepGrid Semi channel on YouTube <ArrowUpRight size={16} aria-hidden="true" /></a></p>}
        </section>
      );
    case 'docs':
      return (
        <section className="cp-sec">
          <div className="cp-docs">
            {s.groups.map((g) => (
              <article key={g.title} className="cp-card cp-docgroup">
                <h2>{g.title}</h2>
                <p>{g.lede}</p>
                <ul>
                  {g.items.map((d) => {
                    const file = d.href?.endsWith('.pdf');
                    const ask = d.href?.startsWith('mailto:');
                    return (
                      <li key={d.title} className={ask ? 'is-ask' : ''}>
                        <a href={link(d.href!)} {...(file ? { download: '' } : {})}>
                          <span className="cp-doc-t">{file ? <Download size={14} aria-hidden="true" /> : ask ? <Mail size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}{d.title}</span>
                          {d.note && <small>{d.note}</small>}
                          {d.meta && <em>{d.meta}</em>}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </article>
            ))}
          </div>
          <p className="cp-detail cp-docs-note">Documents marked “on request” are listed by deepgridsemi.com; they are shared on request rather than published.</p>
        </section>
      );
    case 'scene':
      return <SceneSection s={s} />;
    case 'bullets':
      return (
        <section className="cp-sec">
          <header className="cp-sec-head">
            {s.kicker && <p className="kicker">{s.kicker}</p>}
            <h2>{s.title}</h2>
          </header>
          <ul className="cp-bullets">{s.items.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      );
    case 'cta':
      return (
        <section className="cp-sec cp-cta">
          <h2>{s.title}</h2>
          <p>{s.lede}</p>
          <div className="cp-actions">
            {s.actions.map((a) => <a key={a.label} className={a.primary ? 'primary' : 'text-link'} href={link(a.href)}>{a.label} <ArrowRight size={16} aria-hidden="true" /></a>)}
          </div>
        </section>
      );
    default: {
      // A kind added to Section without a case here fails the type check instead of rendering nothing.
      const missing: never = s;
      return missing;
    }
  }
}

/** Fade-in-up on entry, as deepgridsemi.com's sections do; everything visible from the start under reduced motion. */
function Reveal() {
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>('.cp-page > .cp-sec')];
    els.forEach(e => e.classList.add('cp-reveal'));
    document.documentElement.classList.add('cp-js');      // hidden for the fade only once this runs
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}

/** The page hero, after deepgridsemi.com's page heroes: a dark full-width band with a pill badge, the title
 *  and lede, the page's image behind it (still captioned for what it is), and its key points as cards. */
function PageBand({ page }: { page: CompanyPage }) {
  const story=useRouteStory();
  const bg = page.heroImage && page.heroImage.fit !== 'natural' ? page.heroImage : undefined;
  return (
    <header className={'cp-band' + (page.chips ? '' : ' is-centered')}>
      {bg && <img className="cp-band-bg" src={bg.src} alt="" width={1536} height={864} loading="eager" decoding="async" />}
      <div className="cp-band-inner">
        <div className="cp-band-copy">
          <h1>{story.headline}</h1>
          <p className="cp-band-lede">{story.context}</p>
        </div>
        {page.chips && (
          <ul className="cp-chips">
            {page.chips.map(([t, d]) => <li key={t}><CircleCheck size={18} aria-hidden="true" /><strong>{t}</strong><span>{d}</span></li>)}
          </ul>
        )}
      </div>
      {bg && <p className="cp-band-credit">{bg.alt.toLowerCase().startsWith(captionFor(bg.src).toLowerCase()) ? bg.alt : `${captionFor(bg.src)}: ${bg.alt}`}</p>}
    </header>
  );
}

export default function CompanyPageView({ page }: { page: CompanyPage }) {
  return (
    <div className="page-wrap cp-page" data-sections={page.sections.length}>
      <PageBand page={page} />
      {page.heroImage?.fit === 'natural' && <div className="cp-hero cp-hero-solo"><Figure className="cp-hero-img is-natural" src={page.heroImage.src} alt={page.heroImage.alt} /></div>}
      {page.sections.map((s, i) => <Block key={i} s={s} />)}
      <Reveal />
    </div>
  );
}
