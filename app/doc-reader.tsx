'use client';
/** Source documents read inside the site (/resources/read?doc=<key>), replacing the generated
 *  /downloads/*.html pages that had their own fonts, no navigation and raw document titles
 *  (docs/v6/story-pack-depth.md §7). The markdown edition is fetched and rendered with raw HTML
 *  escaped; headings get the same slugs doc-links.ts produces, so a citation lands on its section. */
import {useEffect, useMemo, useState} from 'react';
import {Marked} from 'marked';
import {ArrowUpRight, Download, FileText} from 'lucide-react';
import {useQuery} from './shell';
import {url, asset} from './routes';
import {headingSlug, readHref} from './doc-links';
import {groundedDocuments} from './documents-data';
import './doc-reader.css';

const escape = (s: string) => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]!));
/** Raw document titles carry em dashes; the site's house style does not. */
const clean = (s: string) => s.replace(/\s+[—–]\s+/g, ': ').replace(/[*`]/g, '');

/** The sources write symbols and short formulas as inline LaTeX ($\\Sigma\\Delta$, $f_{\\max}$, 25 $\\mu\\text{m}$,
 *  $\\ge 130\\ \\text{nm}$, $$...$$). Render them as plain text. Commands match by known name, longest first,
 *  because the sources run a command straight into the next token (\\mum after \\text{m} is unwrapped). */
const TEX: Record<string, string> = {
  rightarrow: '→', Rightarrow: '⇒', leftarrow: '←', approx: '≈', partial: '∂', lambda: 'λ', Lambda: 'Λ', Sigma: 'Σ', Delta: 'Δ', Omega: 'Ω',
  omega: 'ω', alpha: 'α', theta: 'θ', infty: '∞', oplus: '⊕', otimes: '⊗', times: '×', cdot: '·', ldots: '…', cdots: '…', delta: 'δ',
  sigma: 'σ', beta: 'β', gamma: 'γ', circ: '°', degree: '°', land: '∧', lor: '∨', neg: '¬', sum: 'Σ', prod: 'Π', sqrt: '√', max: 'max',
  min: 'min', log: 'log', exp: 'exp', mid: '|', geq: '≥', leq: '≤', neq: '≠', sim: '~', tau: 'τ', rho: 'ρ', eta: 'η', mu: 'µ', pi: 'π',
  pm: '±', ll: '<<', gg: '>>', ge: '≥', le: '≤', ne: '≠', to: '→', in: '∈', '%': '%', '$': '$', ',': ' ', ';': ' ', ' ': ' ', '{': '{', '}': '}', '_': '_',
};
const CMD = new RegExp('\\\\(' + Object.keys(TEX).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\%]/g, '\\$&')).join('|') + ')', 'g');
/** Unwrap \\text{..} and friends innermost first, so \\mathbf{300\\text{ cycles}} unwraps fully. */
const unwrap = (m: string): string => { const n = m.replace(/\\(?:text|mathrm|mathbf|mathit|operatorname|textrm)\{([^{}]*)\}/g, '$1'); return n === m ? n : unwrap(n); };
const math = (m: string) => unwrap(m)
  .replace(/\\(?:text|mathrm)\s+/g, '')
  .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
  .replace(/\\(?:left|right)(?![A-Za-z])/g, '')
  .replace(CMD, (_, k: string) => TEX[k])
  .replace(/_\{([^}]*)\}|_(\w)/g, (_, a, b) => a ?? b).replace(/\^\{([^}]*)\}|\^(\S)/g, (_, a, b) => a ?? b)
  .replace(/[{}]/g, '').replace(/\s{2,}/g, ' ').trim();
// A span is math when it carries a backslash, _ or ^, or is a short symbol ($Z$, $P, Q, S$, $>$);
// one that starts with a number ("$2–5 ASP ... $9B") is currency and stays as written.
const detex = (s: string) => s
  .replace(/\\\$([^$\n]{1,40}?)\$/g, (_, m: string) => '$' + math(m))
  .replace(/\$\$([\s\S]{1,400}?)\$\$/g, (_, m: string) => math(m))
  .replace(/\$([^$\n]{1,240}?)\$/g, (whole, m: string) => (/[\\_^]/.test(m) || (m.length <= 12 && !/^\s*[\d.,]/.test(m)) ? math(m) : whole));

function render(raw: string) {
  const text = detex(raw);
  const headings: {id: string; label: string}[] = [];
  const ids = new Map<string, number>();
  const md = new Marked({gfm: true});
  md.use({renderer: {
    html: ({text}) => escape(text),
    heading({tokens, depth}) {
      const label = clean(tokens.map(t => ('text' in t ? t.text : t.raw) || '').join(''));
      const key = headingSlug(label) || 'section';
      const n = ids.get(key) || 0; ids.set(key, n + 1);
      const id = key + (n ? '-' + n : '');
      if (depth === 2) headings.push({id, label});
      if (depth === 1) return '';
      return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>`;
    },
    link({href, title, tokens}) {
      let h = href || '#';
      if (/^(javascript|data|vbscript):/i.test(h)) h = '#';
      else if (/^\/?downloads\/.*\.md(#.*)?$/.test(h) || /^[\w./-]+\.md(#.*)?$/.test(h)) {
        const [file, hash] = h.split('#');
        h = readHref(file.startsWith('/') ? file : '/downloads/' + file.replace(/^\.?\//, '')) + (hash ? '#' + hash : '');
      }
      return `<a href="${escape(h)}"${title ? ` title="${escape(title)}"` : ''}>${this.parser.parseInline(tokens)}</a>`;
    },
    table(token) {
      const head = token.header.map(c => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('');
      const body = token.rows.map(r => `<tr>${r.map(c => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('');
      return `<div class="rd-table" tabindex="0" role="region" aria-label="Scrollable table"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    },
  }});
  const title = clean(text.match(/^#\s+(.+)$/m)?.[1] || '');
  return {title, html: md.parse(text) as string, headings};
}

export default function DocReader() {
  const [params] = useQuery();
  const key = params.get('doc') || '';
  const [state, setState] = useState<{status: 'idle' | 'loading' | 'ok' | 'missing'; text?: string}>({status: 'idle'});
  const registered = groundedDocuments.find(d => d.specFile === '/downloads/' + key + '.md');

  useEffect(() => {
    if (!key) { setState({status: 'idle'}); return; }
    if (!/^[\w/-]+$/.test(key)) { setState({status: 'missing'}); return; }
    setState({status: 'loading'});
    fetch(asset('/downloads/' + key + '.md'))
      .then(r => (r.ok ? r.text() : Promise.reject(r.status)))
      .then(text => setState({status: 'ok', text}))
      .catch(() => setState({status: 'missing'}));
  }, [key]);

  const doc = useMemo(() => (state.text ? render(state.text) : null), [state.text]);

  // Land on the cited section once the document has rendered.
  useEffect(() => {
    if (!doc || !location.hash) return;
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) el.scrollIntoView({block: 'start'});
  }, [doc]);

  if (!key || state.status === 'missing') {
    return (
      <section className="rd-empty">
        <h1>{key ? 'That document is not in the library.' : 'Choose a document from the library.'}</h1>
        <p>Every source document is listed on the Resources page with its PDF and its readable edition.</p>
        <a className="primary" href={url('/resources')}>Open the document library <ArrowUpRight size={16} aria-hidden="true"/></a>
      </section>
    );
  }
  if (!doc) return <p className="rd-loading" role="status">Loading the document…</p>;

  return (
    <div className="rd">
      <aside className="rd-toc" aria-label="In this document">
        <p className="dr-kicker">In this document</p>
        <ol>{doc.headings.map(h => <li key={h.id}><a href={'#' + h.id}>{h.label}</a></li>)}</ol>
        <div className="rd-files">
          {registered && <a href={url(registered.pdfFile)}><Download size={14} aria-hidden="true"/> PDF · {registered.pdfPageCount}</a>}
          <a href={asset('/downloads/' + key + '.md')} download><FileText size={14} aria-hidden="true"/> Markdown source</a>
        </div>
      </aside>
      <article className="rd-body">
        <p className="dr-kicker">Source document</p>
        <h1>{registered?.title || doc.title}</h1>
        {registered && registered.title !== doc.title && <p className="rd-sub">{doc.title}</p>}
        <p className="rd-banner">The source edition, unchanged. Architecture targets, proposals and dated plans are preserved as written; they do not establish measured silicon, qualification or certification. <a href={url('/evidence')}>How each figure on this site is graded</a>.</p>
        <div className="rd-content" dangerouslySetInnerHTML={{__html: doc.html}}/>
      </article>
    </div>
  );
}
