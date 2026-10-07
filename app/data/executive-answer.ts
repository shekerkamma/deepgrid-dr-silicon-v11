import type { Retrieval, IndexChunk } from './graph-retrieval';
import raw from './graphrag-unified-index.json';
import { productStories, topicStories, comparisonClose, type Story } from './executive-story';

/** Executive answer for Ask DeepGrid.
 *
 *  Shape is unchanged so `app/ask.tsx` renders it as before, but every answer now follows the
 *  story-architect narrative: `title` is the headline assertion, `answer` is the short answer,
 *  and `beats` run in a fixed order — why it matters now, what DeepGrid brings, where the value
 *  is, what is proven and what is not yet, the trade-off, our recommendation. Sources stay
 *  available through `refs`; they support the story rather than lead it. */
export type ExecutiveAnswer = {
  title: string;
  answer: string;
  beats: { title: string; body: string; refs: number[] }[];
  sources: IndexChunk[];
  answerRefs: number[];
  supported: boolean;
};

const chunks = raw.chunks as IndexChunk[];

const keyFor = (q: string) => {
  const code = q.match(/\bSKU[ -]?(\d+)\b/i);
  if (code) return `sku${code[1]}`;
  if (/\bd100\b/i.test(q)) return 'd100';
  if (/dg32[- ]?max/i.test(q)) return 'sku10';
  if (/dg32([- ]?lite)?\b|lockstep|safety mcu/i.test(q)) return 'sku4';
  return null;
};

const label = (key: string) =>
  key === 'd100' ? 'D100' : key === 'sku10' ? 'DG32-Max' : key === 'sku4' ? 'SKU-4 (DG32-LITE)' : `SKU-${key.slice(3)}`;

/** Strip retrieval scaffolding so evidence text reads as prose. */
const clean = (s: string) =>
  s
    .replace(/The closest material is below\./g, '')
    .replace(/(SKU-\d+[^:]*|Track B[^:]*), (what it is|what it replaces|who buys it|status): /gi, '')
    .replace(/\s+/g, ' ')
    .trim();

export function executiveAnswer(query: string, r: Retrieval): ExecutiveAnswer {
  const sources: IndexChunk[] = [];
  const ref = (c: IndexChunk | undefined) => {
    if (!c) return [];
    let i = sources.findIndex((x) => x.id === c.id);
    if (i < 0) {
      sources.push(c);
      i = sources.length - 1;
    }
    return [i + 1];
  };
  const own = (k: string, section: string) =>
    chunks.find(
      (c) =>
        c.docNum === '07' &&
        (k === 'd100'
          ? c.section.startsWith('Track B')
          : new RegExp(`^SKU-${k.slice(3)}(?![0-9])`).test(c.section)) &&
        c.section.endsWith(section),
    );
  const direct = r.evidence.filter((e) => e.kind === 'direct');
  const directRefs = () => direct.slice(0, 2).flatMap((e) => ref(e.chunk));

  /** The fixed executive arc. */
  const narrate = (s: Story, refs: { context: number[]; status: number[]; plan?: number[] }) => [
    { title: 'Why it matters now', body: s.whyNow, refs: [] as number[] },
    { title: 'What DeepGrid brings', body: s.brings, refs: refs.context },
    { title: 'Where the value is', body: s.value, refs: refs.plan ?? [] },
    { title: 'What is proven — and what is not yet', body: `${s.proven} Still open: ${s.notYet}`, refs: refs.status },
    { title: 'The trade-off', body: s.tradeoff, refs: [] as number[] },
    { title: 'Our recommendation', body: s.recommendation, refs: [] as number[] },
  ];

  // 1. Comparison: one beat per product, then how to choose and what we recommend.
  if (r.comparison && r.comparison.length > 1) {
    const parts = r.comparison
      .map((code) => keyFor(code))
      .filter((k): k is string => !!k && !!productStories[k]);
    const beats = parts.map((k) => {
      const s = productStories[k];
      return {
        title: `${label(k)}: ${s.headline}`,
        body: `${s.value} Adoption gate: ${s.notYet}`,
        refs: ref(own(k, 'What it is')),
      };
    });
    return {
      title: 'Choose by the job each product does — they are not interchangeable.',
      answer:
        'These products answer different business needs. The right comparison starts with the responsibility your product must have covered and the evidence each candidate must produce before you adopt it. All are at the design stage; none is yet measured on silicon.',
      answerRefs: [],
      beats: [
        ...beats,
        { title: 'How to choose', body: comparisonClose.howToChoose, refs: [] },
        { title: 'Our recommendation', body: comparisonClose.recommendation, refs: [] },
      ],
      sources,
      supported: true,
    };
  }

  // 2. A named product: the full product narrative, sharpened by the question's intent.
  const key = keyFor(query);
  if (key && productStories[key]) {
    let s = productStories[key];
    const context = ref(own(key, 'What it replaces') || own(key, 'What it is'));
    const status = ref(own(key, 'Status'));
    const plan = key === 'd100' ? ref(own(key, 'Where it sits in the plan')) : [];
    const cert = topicStories[0];
    if (cert.test.test(query)) {
      s = {
        ...s,
        headline: `${label(key)} is not certified or qualified yet — treat qualification as the adoption gate.`,
        short: `${cert.story.short} ${s.short}`,
        recommendation: `${cert.story.recommendation} ${s.recommendation}`,
      };
    }
    return {
      title: s.headline,
      answer: s.short,
      answerRefs: context,
      beats: narrate(s, { context, status, plan }),
      sources,
      supported: true,
    };
  }

  // 3. A cross-cutting business question: portfolio, readiness, qualification, funding, sourcing.
  //    An unrecognised product code (e.g. SKU-12) skips straight to the honest "not settled" answer.
  const topic = key ? undefined : topicStories.find((t) => t.test.test(query));
  if (topic) {
    const refs = directRefs();
    return {
      title: topic.story.headline,
      answer: topic.story.short,
      answerRefs: refs,
      beats: narrate(topic.story, { context: refs, status: [] }),
      sources,
      supported: true,
    };
  }

  // 4. Anything else the published material answers: lead with the finding, then frame it.
  if (!key && r.answerable && direct.length) {
    const refs = directRefs();
    const finding = clean(r.bluf);
    return {
      title: 'Here is what the published material establishes — and what it means for your decision.',
      answer: finding,
      answerRefs: refs,
      beats: [
        {
          title: 'Why it matters',
          body: 'This finding describes the design as documented. Its business value depends on whether it changes the cost, risk or capability of your own product.',
          refs: [],
        },
        {
          title: 'What is proven — and what is not yet',
          body: 'All DeepGrid evidence is at the design stage: simulated, estimated or analytical. Nothing has been measured on manufactured silicon, and no qualification has been completed.',
          refs,
        },
        {
          title: 'The trade-off',
          body: 'Acting on design evidence gives you lead time and influence; waiting for measured results gives certainty but a later start.',
          refs: [],
        },
        {
          title: 'Our recommendation',
          body: 'Decide which result must be demonstrated in your own operating environment before you proceed, and make it the acceptance criterion for a bounded evaluation.',
          refs: [],
        },
      ],
      sources,
      supported: true,
    };
  }

  // 5. Not established: same narrative shape, honest about the gap.
  return {
    title: 'The published material does not settle this question yet.',
    answer:
      'We would rather say so than guess. DeepGrid’s published evidence covers the portfolio architecture and the DG32 design; it does not establish an answer to this question, and a business commitment would need more information.',
    answerRefs: [],
    beats: [
      {
        title: 'What we can say',
        body: 'DeepGrid builds mature-node silicon for the functions around the main computer — motion, power, sensing, interfaces and safety — with DG32 as the detailed, pre-silicon proof point.',
        refs: [],
      },
      {
        title: 'What is missing',
        body: 'The specific product, customer requirement or commercial assumption behind your question is not covered by the current evidence.',
        refs: [],
      },
      {
        title: 'How to get the answer',
        body: 'Name the product and the outcome you need confirmed, and ask the DeepGrid team for current supporting evidence — or try asking about a specific product, readiness, qualification or the investment plan.',
        refs: [],
      },
    ],
    sources: [],
    supported: false,
  };
}
