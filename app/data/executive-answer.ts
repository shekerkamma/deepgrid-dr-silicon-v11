import type { Retrieval, IndexChunk } from './graph-retrieval';
import raw from './graphrag-unified-index.json';
import profiles from '../executive-products.json';
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
  return code
    ? `sku${code[1]}`
    : /\bd100\b/i.test(q)
      ? 'd100'
      : /dg32[- ]max/i.test(q)
        ? 'sku10'
        : null;
};
export function executiveAnswer(query: string, r: Retrieval): ExecutiveAnswer {
  const key = keyFor(query),
    p = key ? profiles[key as keyof typeof profiles] : null;
  const compare = r.comparison && r.comparison.length > 1;
  const business =
    /business|opportunity|value|invest|adopt|choose|replac|fund|buyer|buy|customer|status|ready|readiness|market|cost|margin|risk|why|what (is|does)/i.test(
      query,
    );
  const cert = /certif|qualif|approved|guarantee|immune|compliant/i.test(query);
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
  if (compare) {
    const parts = r
      .comparison!.map((code) => ({ key: keyFor(code), code }))
      .filter((x) => x.key && profiles[x.key as keyof typeof profiles]);
    const beats = parts.map((x) => {
      const v = profiles[x.key as keyof typeof profiles];
      return {
        title: `${x.code}: ${v.headline}`,
        body: v.context + ' ' + v.implication,
        refs: ref(own(x.key!, 'What it is')),
      };
    });
    return {
      title: 'Choose by the responsibility each product carries.',
      answer:
        'These products address different system needs. The comparison should start with the job you need done and the evidence required for adoption.',
      answerRefs: [],
      beats: [
        ...beats,
        {
          title: 'Make the evaluation specific to your product.',
          body: 'Agree the required function, interfaces and acceptance evidence for each candidate. Shared technology does not make the products interchangeable.',
          refs: [],
        },
      ],
      sources,
      supported: true,
    };
  }
  const established =
    r.answerable ||
    (!!p &&
      /business (case|value)|commercial opportunity/.test(query.toLowerCase()));
  if (!established || (key && !p))
    return {
      title: 'There is not enough evidence for that conclusion.',
      answer:
        'The published material does not establish an answer to this question. A business commitment would need additional information.',
      answerRefs: [],
      beats: [
        {
          title: 'Make the missing evidence the next question.',
          body: 'Clarify the product, customer requirement or commercial assumption you need confirmed, and ask the team for current supporting evidence.',
          refs: [],
        },
      ],
      sources: [],
      supported: false,
    };
  let answer = r.bluf
    .replace(/The closest material is below\./g, '')
    .replace(
      /(SKU-\d+[^:]*|Track B[^:]*), (what it is|what it replaces|who buys it|status): /gi,
      '',
    );
  let title = 'What this means for your decision.';
  let answerRefs = direct.slice(0, 2).flatMap((e) => ref(e.chunk));
  const beats: ExecutiveAnswer['beats'] = [];
  if (p && key) {
    const contextRefs = ref(
      own(key, 'What it replaces') || own(key, 'What it is'),
    );
    title = p.headline;
    if (
      /fund|financ|investment|budget/.test(query.toLowerCase()) &&
      key === 'd100'
    ) {
      title =
        'D100 follows mature-node revenue; it has a separate funding plan.';
      answer =
        'The October 2026 Blueprint proposes a separate ₹50 Cr round for D100 after the eleven mature-node products generate revenue. D100 is outside the FY31 ₹1,000 Cr portfolio plan.';
      answerRefs = ref(own(key, 'Where it sits in the plan'));
    } else if (
      business &&
      /replac|business (case|value)|commercial opportunity|what is/i.test(
        query,
      ) &&
      !cert
    ) {
      answer = p.context;
      answerRefs = contextRefs;
    }
    if (cert) {
      title = 'Treat qualification as an adoption gate.';
      answer =
        'The published designs and development targets do not establish that this product holds the qualification you need. Confirm the required standard and request current evidence before committing.';
      answerRefs = ref(own(key, 'Status'));
    }
    beats.push({ title: p.valueTitle, body: p.implication, refs: contextRefs });
    beats.push({
      title: p.gateTitle,
      body: p.gate,
      refs: [
        ...ref(own(key, 'Status')),
        ...(key === 'd100' ? ref(own(key, 'What it earns')) : []),
      ],
    });
    beats.push({
      title: 'The next decision',
      body:
        key === 'd100'
          ? 'Review D100 as a separate investment decision, with a funding trigger, development milestones and a qualification plan.'
          : `Define the customer requirement and acceptance criteria for ${key === 'sku10' ? 'DG32-Max' : key.toUpperCase().replace('SKU', 'SKU-')}. Use an evaluation to close the evidence gap before a production commitment.`,
      refs: [],
    });
  } else {
    beats.push({
      title: 'What this supports today',
      body: 'Use this finding to frame an evaluation. It does not, by itself, establish delivery readiness, customer adoption or qualification.',
      refs: [],
    });
    beats.push({
      title: 'The next decision',
      body: 'Ask which result must be demonstrated in your operating environment before you proceed. Keep that acceptance criterion separate from the design target.',
      refs: [],
    });
  }
  return { title, answer, answerRefs, beats, sources, supported: true };
}
