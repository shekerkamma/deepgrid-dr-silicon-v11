'use client';
/** The closed A2UI catalog Ask DeepGrid draws answers with. Each component reproduces the answer markup the page
 *  used before A2UI (same elements and class names, so executive-story.css styles it unchanged). An agent can only
 *  name these components and fill their checked props; it cannot send markup, scripts, styles or links. Source
 *  links are built here from the source's paths, the same way the page built them before. */
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Catalog, childList, type ComponentApi } from '@a2ui/web_core/v0_9';
import { createComponentImplementation, type ReactComponentImplementation } from '@a2ui/react/v0_9';
import { A2UI_ANSWER_CATALOG_ID } from './data/a2ui-answer';
import { asset, url } from './routes';
import { readHref } from './doc-links';

/** A [n] reference opens the sources list; the list listens for this event on window. */
const OPEN_SOURCES = 'dg-answer-open-sources';

const Refs = ({ refs }: { refs: number[] }) => <>{refs.map(n => (
  <a key={n} className="executive-ref" href={'#answer-source-' + n}
    onClick={() => window.dispatchEvent(new Event(OPEN_SOURCES))} aria-label={'Source ' + n}>[{n}]</a>
))}</>;

const refs = z.array(z.number().int().positive());
const paragraph = z.object({ text: z.string(), refs }).strict();

const AnswerStackApi = {
  name: 'AnswerStack',
  schema: z.object({ children: childList() }).strict(),
} satisfies ComponentApi;
const AnswerStack = createComponentImplementation(AnswerStackApi, ({ props, buildChild }) => (
  <>{(props.children ?? []).map(c => typeof c === 'string'
    ? <span key={c} style={{ display: 'contents' }}>{buildChild(c)}</span>
    : <span key={c.id + c.basePath} style={{ display: 'contents' }}>{buildChild(c.id, c.basePath)}</span>)}</>
));

const AnswerLeadApi = { name: 'AnswerLead', schema: paragraph } satisfies ComponentApi;
const AnswerLead = createComponentImplementation(AnswerLeadApi, ({ props }) => (
  <p className="dr-answer-lead">{props.text}<Refs refs={props.refs}/></p>
));

const AnswerSectionApi = {
  name: 'AnswerSection',
  schema: z.object({ heading: z.string(), paragraphs: z.array(paragraph) }).strict(),
} satisfies ComponentApi;
const AnswerSection = createComponentImplementation(AnswerSectionApi, ({ props }) => (
  <section>
    <h3>{props.heading}</h3>
    {props.paragraphs.map((p, i) => <p key={i}>{p.text}<Refs refs={p.refs}/></p>)}
  </section>
));

const AnswerGapsApi = {
  name: 'AnswerGaps',
  schema: z.object({ gaps: z.array(z.string()) }).strict(),
} satisfies ComponentApi;
const AnswerGaps = createComponentImplementation(AnswerGapsApi, ({ props }) => (
  <section aria-label="Evidence limitations">
    <h3>What the sources do not establish</h3>
    {props.gaps.map((g, i) => <p key={i}>{g}</p>)}
  </section>
));

const source = z.object({
  id: z.string(), docTitle: z.string(), section: z.string(), pageLabel: z.string(), text: z.string(),
  docNum: z.string(), pdfPath: z.string(), specPath: z.string(),
}).strict();
const AnswerSourcesApi = {
  name: 'AnswerSources',
  schema: z.object({ sources: z.array(source) }).strict(),
} satisfies ComponentApi;
function SourcesList({ sources }: { sources: z.infer<typeof source>[] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_SOURCES, show);
    return () => window.removeEventListener(OPEN_SOURCES, show);
  }, []);
  return <details className="executive-sources" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
    <summary>Further details and sources · {sources.length}</summary>
    <ol>{sources.map((c, i) => <li key={c.id} id={'answer-source-' + (i + 1)}>
      <strong>{c.docTitle} · {c.section} · {c.pageLabel}</strong>
      <blockquote>{c.text}</blockquote>
      {c.docNum === 'portfolio-data' || c.docNum === 'portfolio-brief'
        ? <><a href={url(c.pdfPath)}>{c.docNum === 'portfolio-brief' ? 'Read the brief' : 'See it on the SKU portfolio page'}</a>{c.specPath && <>{' · '}<a href={c.specPath} target="_blank" rel="noopener noreferrer">Open the live table</a></>}</>
        : <><a href={asset(c.pdfPath.replace(/^\./, '')) + (c.pdfPath.endsWith('.pdf') ? '#page=' + (c.pageLabel.match(/\d+/)?.[0] || 1) : '')}>Open source document</a>{' · '}
          <a href={readHref(c.specPath.replace(/^\./, ''), c.docNum === 'primary' ? c.section : undefined)}>Read in site</a></>}
    </li>)}</ol>
  </details>;
}
const AnswerSources = createComponentImplementation(AnswerSourcesApi, ({ props }) => <SourcesList sources={props.sources}/>);

export const answerCatalog = new Catalog<ReactComponentImplementation>(
  A2UI_ANSWER_CATALOG_ID,
  [AnswerStack, AnswerLead, AnswerSection, AnswerGaps, AnswerSources],
);
