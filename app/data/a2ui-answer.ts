/** Turns a checked Ask DeepGrid answer into A2UI v0.9 messages (https://github.com/a2ui-project/a2ui).
 *
 *  A2UI is the agent-to-UI contract: an agent sends a flat list of components by id, and the page draws each one
 *  with its own trusted component from a closed catalog (app/a2ui-answer-catalog.tsx). Nothing the agent sends is
 *  executed or rendered as HTML; a component type that is not in the catalog, or props that fail its schema, are
 *  rejected by the message processor.
 *
 *  The answer is validated by validateAnswer() before it gets here, so these messages carry only checked claims.
 *  The module is plain data with no React or DOM, so the answer Worker (services/ask/worker.ts) can emit the same
 *  messages itself later; until then the page builds them from the Worker's JSON answer. */
import type { ComposedAnswer, Claim } from './answer-evidence';
import type { IndexChunk } from './graph-retrieval';
import type { A2uiMessage } from '@a2ui/web_core/v0_9';

export const A2UI_ANSWER_CATALOG_ID = 'https://deepgridsemi.com/a2ui/catalogs/ask-answer/v0_9/catalog.json';

/** Source numbers ([1], [2] …) a claim cites, in first-cited order, matching the order of the sources list. */
export function claimRefs(claim: Claim, sources: { id: string }[]): number[] {
  const out: number[] = [];
  for (const s of claim.support) {
    const n = sources.findIndex(c => c.id === s.sourceId) + 1;
    if (n > 0 && !out.includes(n)) out.push(n);
  }
  return out;
}

export function answerToA2ui(answer: ComposedAnswer, sources: IndexChunk[], surfaceId: string): A2uiMessage[] {
  const children: string[] = ['lead'];
  const components: Record<string, unknown>[] = [
    { id: 'lead', component: 'AnswerLead', text: answer.lead.text, refs: claimRefs(answer.lead, sources) },
  ];
  answer.sections.forEach((section, i) => {
    const id = 'section-' + (i + 1);
    children.push(id);
    components.push({
      id, component: 'AnswerSection', heading: section.heading,
      paragraphs: section.paragraphs.map(p => ({ text: p.text, refs: claimRefs(p, sources) })),
    });
  });
  if (answer.gaps.length) {
    children.push('gaps');
    components.push({ id: 'gaps', component: 'AnswerGaps', gaps: answer.gaps });
  }
  if (sources.length) {
    children.push('sources');
    components.push({
      id: 'sources', component: 'AnswerSources',
      sources: sources.map(({ id, docTitle, section, pageLabel, text, docNum, pdfPath, specPath }) =>
        ({ id, docTitle, section, pageLabel, text, docNum, pdfPath, specPath: specPath ?? '' })),
    });
  }
  components.unshift({ id: 'root', component: 'AnswerStack', children });
  return [
    { version: 'v0.9', createSurface: { surfaceId, catalogId: A2UI_ANSWER_CATALOG_ID } },
    { version: 'v0.9', updateComponents: { surfaceId, components } },
  ];
}
