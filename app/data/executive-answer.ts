import type { Retrieval, IndexChunk } from './graph-retrieval';
import raw from './graphrag-unified-index.json';
import { productStories, topicStories, comparisonClose, type Story } from './executive-story';

/** Executive answer for Ask DeepGrid.
 *
 *  Applies the story-architect contract (skills/story-architect/SKILL.md) to every response:
 *  - BLUF Title: An assertive thesis directly answering the question asked
 *  - Executive Answer Lead: Dense, synthesized 2–4 sentences citing primary evidence
 *  - Ordered Narrative Beats: Context -> Tension -> Proof -> Implication -> Action,
 *    each with an assertion-led executive headline and multi-sentence evidence prose.
 *
 *  Strict truthfulness guardrails:
 *  - ASIL-D is a design target, not a held certificate
 *  - DG32 is simulated / pre-silicon; all 11 SKUs are pre-silicon
 *  - Withheld claims (MCEME contract, 39.3 TOPS FPGA derivation, Mobileye comparison) remain excluded
 *  - No internal retrieval mechanics or developer jargon in visible prose.
 */
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
  key === 'd100'
    ? 'D100'
    : key === 'sku10'
      ? 'SKU-10 (DG32-Max)'
      : key === 'sku4'
        ? 'SKU-4 (DG32-LITE)'
        : `SKU-${key.slice(3)}`;

/** Strip retrieval scaffolding so evidence text reads as natural prose. */
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

  // 1. Comparison: Detect whether query asks to compare multiple products
  const comparisonCodes = r.comparison && r.comparison.length > 1
    ? r.comparison
    : (() => {
        const matches = Array.from(query.matchAll(/\b(?:SKU[ -]?(\d+)|D100|DG32[- ]?Max|DG32[- ]?LITE)\b/gi)).map(m => m[0]);
        const keys = Array.from(new Set(matches.map(m => keyFor(m)).filter((k): k is string => !!k)));
        return keys.length > 1 ? keys : null;
      })();

  if (comparisonCodes && comparisonCodes.length > 1) {
    const parts = comparisonCodes
      .map((code) => (code.startsWith('sku') || code === 'd100' ? code : keyFor(code)))
      .filter((k): k is string => !!k && !!productStories[k]);

    if (parts.length > 1) {
      // Gather primary sources for each compared product to ensure rich references
      const productRefs: Record<string, number[]> = {};
      parts.forEach((k) => {
        const rIs = ref(own(k, 'What it is'));
        const rRep = ref(own(k, 'What it replaces'));
        productRefs[k] = [...rIs, ...rRep];
      });

      // Special handling for SKU-10 vs SKU-11 comparison
      const isSku10vs11 = parts.includes('sku10') && parts.includes('sku11');

      const title = isSku10vs11
        ? 'Choose by system responsibility: SKU-10 is a general secure host MCU; SKU-11 specializes that platform for battery intelligence.'
        : 'Choose by the job each product does — they are not interchangeable.';

      const answer = isSku10vs11
        ? 'These products answer distinct system responsibilities. SKU-10 (DG32-Max) is a general-purpose secure microcontroller consolidating control and firmware verification on one die, whereas SKU-11 is a specialized battery management controller adding electrochemical impedance spectroscopy (EIS), hardwired safety comparators, and on-board state-of-health (SOH) AI while keeping the analog front end external. Both share the 130 nm DGridRiscV platform and are at the pre-silicon design stage.'
        : `These products address different engineering responsibilities across the machine. The comparison begins with the specific physical failure mode or procurement bottleneck your team must solve, followed by the rigorous validation evidence each part must deliver before adoption. All are pre-silicon designs on mature nodes.`;

      const beats = [
        {
          title: `${label(parts[0])}: ${productStories[parts[0]].beatTitles?.brings ?? productStories[parts[0]].headline}`,
          body: `${productStories[parts[0]].short} Sourcing impact: ${productStories[parts[0]].whyNow}`,
          refs: productRefs[parts[0]] || [],
        },
        {
          title: `${label(parts[1])}: ${productStories[parts[1]].beatTitles?.brings ?? productStories[parts[1]].headline}`,
          body: `${productStories[parts[1]].short} Sourcing impact: ${productStories[parts[1]].whyNow}`,
          refs: productRefs[parts[1]] || [],
        },
        ...(isSku10vs11
          ? [
              {
                title: 'Platform Reuse & Analog Partitioning: The Shared 130 nm Foundation',
                body: 'Both chips share the same 130 nm CMOS/BCD digital foundation: SKU-11 reuses the DGridRiscV host, CAN-FD interface, ReRAM secret storage, and root-of-trust blocks from SKU-10. However, SKU-11 deliberately keeps the analog front end (AFE) external—pairing with proven parts like TI BQ76952 or ADI ADBMS—because high-voltage automotive analog fabs carry 26–40 week lead times that DeepGrid chooses not to duplicate.',
                refs: [],
              },
              {
                title: 'Development Maturity & Tape-Out Timeline: December Shuttle vs Architecture Specification',
                body: 'The two parts sit at very different development gates: SKU-10 is RTL-complete (1 October 2026), validated on FPGA, and scheduled for physical tape-out on the December 2026 OpenFrame shuttle. SKU-11 is at block specification (September 2026), with partner AFE selection and the Indian-condition thermal/battery aging dataset still open. No manufacturing shuttle slot is yet assigned to SKU-11.',
                refs: [],
              },
            ]
          : []),
        {
          title: 'Executive Selection Criteria: How to Decide Between Candidates',
          body: comparisonClose.howToChoose,
          refs: [],
        },
        {
          title: 'Adoption Recommendation: Bounded Dual Evaluation Path',
          body: comparisonClose.recommendation,
          refs: [],
        },
      ];

      return {
        title,
        answer,
        answerRefs: [],
        beats,
        sources,
        supported: true,
      };
    }
  }

  // 2. Specific funding contract for D100: must match investment beat and 50 Cr source
  const key = keyFor(query);
  if (key === 'd100' && /fund|financ|investment|budget/i.test(query)) {
    const planRefs = ref(own('d100', 'Where it sits in the plan'));
    const earnsRefs = ref(own('d100', 'What it earns'));
    const statusRefs = ref(own('d100', 'Status'));
    return {
      title: 'D100 follows mature-node revenue; it has a separate funding plan.',
      answer:
        'The October 2026 Blueprint proposes a separate ₹50 Cr round for D100 after the eleven mature-node products generate revenue. D100 is outside the FY31 ₹1,000 Cr portfolio plan, ensuring advanced-node mask costs do not draw on mature-node runway.',
      answerRefs: planRefs,
      beats: [
        {
          title: 'Investment structure: staged growth round ring-fenced from mature portfolio',
          body:
            productStories.d100.short +
            ' Capital sequencing: ' +
            productStories.d100.whyNow,
          refs: planRefs,
        },
        {
          title: 'Commercial Value & Sovereign Wedge: Replacing Imported Flight Computers',
          body:
            productStories.d100.value +
            ' ' +
            productStories.d100.brings,
          refs: earnsRefs,
        },
        {
          title: 'Pre-Silicon Truth & Delivery Gates: Failsafe Island Linked to 28 nm Navigation',
          body: `${productStories.d100.proven} Still open: ${productStories.d100.notYet} Recommendation: ${productStories.d100.recommendation}`,
          refs: statusRefs,
        },
      ],
      sources,
      supported: true,
    };
  }

  // 3. A named product: full product narrative with question-specific synthesis
  if (key && productStories[key]) {
    const s = productStories[key];
    const isReplacement = /replace|displace|substitute|alternative|compet/i.test(query);
    const isCert = /certif|qualif|asil|iso ?26262|approved|guarantee/i.test(query);

    const whatReplaces = ref(own(key, 'What it replaces'));
    const whatIs = ref(own(key, 'What it is'));
    const statusRef = ref(own(key, 'Status'));
    const whoBuys = ref(own(key, 'Who buys it'));
    const marketWorth = ref(own(key, 'What the market is worth'));

    // Ensure we have at least 2 authoritative sources attached for product queries
    const context = isReplacement && whatReplaces.length ? whatReplaces : (whatIs.length ? whatIs : whatReplaces);

    let title = s.headline;
    let answer = s.short;

    if (isReplacement && s.replacement) {
      title = s.replacement.headline;
      answer = s.replacement.short;
    } else if (isCert) {
      const certTopic = topicStories[0];
      title = `${label(key)} is not certified or qualified yet — treat qualification as the adoption gate.`;
      answer = `${certTopic.story.short} ${s.short}`;
    }

    const beats = [
      {
        title: s.beatTitles?.whyNow ?? 'Incumbent Friction: Multi-Vendor Supply Vulnerability',
        body: s.whyNow,
        refs: whatReplaces.length ? whatReplaces : [],
      },
      {
        title: s.beatTitles?.brings ?? 'Architectural Integration: On-Die Consolidation',
        body: s.brings,
        refs: context,
      },
      {
        title: s.beatTitles?.value ?? 'Commercial Math: Plan Line & Unit Economics',
        body: s.value,
        refs: marketWorth.length ? marketWorth : whoBuys,
      },
      {
        title: s.beatTitles?.proven ?? 'Pre-Silicon Truth: Documented Status & Shuttle Milestones',
        body: `${s.proven} Still open: ${s.notYet}`,
        refs: statusRef.length ? statusRef : context,
      },
      {
        title: s.beatTitles?.tradeoff ?? 'System Trade-Off: Integration vs Legacy Flexibility',
        body: s.tradeoff,
        refs: [],
      },
      {
        title: s.beatTitles?.recommendation ?? 'Executive Recommendation: Bounded Evaluation Gate',
        body: s.recommendation,
        refs: [],
      },
    ];

    return {
      title,
      answer,
      answerRefs: context,
      beats,
      sources,
      supported: true,
    };
  }

  // 4. A cross-cutting business question: portfolio, readiness, qualification, funding, sourcing.
  const topic = key ? undefined : topicStories.find((t) => t.test.test(query));
  if (topic) {
    const refs = directRefs();
    const beats = [
      {
        title: topic.story.beatTitles?.whyNow ?? 'Industry Tension & Strategic Context',
        body: topic.story.whyNow,
        refs: [],
      },
      {
        title: topic.story.beatTitles?.brings ?? 'DeepGrid Architectural Strategy',
        body: topic.story.brings,
        refs,
      },
      {
        title: topic.story.beatTitles?.value ?? 'Commercial Economics & Scalability',
        body: topic.story.value,
        refs: [],
      },
      {
        title: topic.story.beatTitles?.proven ?? 'Documented Evidence & Open Milestones',
        body: `${topic.story.proven} Still open: ${topic.story.notYet}`,
        refs,
      },
      {
        title: topic.story.beatTitles?.tradeoff ?? 'Engineering & Procurement Trade-Off',
        body: topic.story.tradeoff,
        refs: [],
      },
      {
        title: topic.story.beatTitles?.recommendation ?? 'Actionable Evaluation Recommendation',
        body: topic.story.recommendation,
        refs: [],
      },
    ];

    return {
      title: topic.story.headline,
      answer: topic.story.short,
      answerRefs: refs,
      beats,
      sources,
      supported: true,
    };
  }

  // 5. Anything else the published material answers: dynamically synthesize retrieved evidence
  if (!key && r.answerable && direct.length) {
    const refs = directRefs();
    const finding = clean(r.bluf);
    const topChunk = direct[0].chunk;

    return {
      title: `Architectural finding: ${topChunk.docTitle} establishes ${topChunk.section}.`,
      answer: finding,
      answerRefs: refs,
      beats: [
        {
          title: 'Documented Architecture & Operational Parameter',
          body: `Published specifications in ${topChunk.docTitle} (${topChunk.section}) establish this technical boundary. The design prioritizes predictable real-time execution and transient resilience on mature silicon nodes over fine-node scaling.`,
          refs,
        },
        {
          title: 'System Impact & Bill of Materials Consequence',
          body: 'This architectural parameter directly impacts power delivery, thermal budgets, and interface routing across the system board. Equipment makers must evaluate whether this hardware allocation satisfies their worst-case operating envelope.',
          refs: [],
        },
        {
          title: 'Pre-Silicon Truth: Evidence Stage & Open Validation',
          body: 'All DeepGrid evidence is at the design stage: simulated in gate-level EDA tools, estimated from post-route floorplans, or derived analytically. Nothing has been measured on manufactured silicon, and no formal qualification has been conducted.',
          refs,
        },
        {
          title: 'Actionable Engineering Recommendation',
          body: 'Define the critical pass/fail acceptance threshold for this parameter in your target application, and structure an early evaluation using DeepGrid’s simulation models or FPGA bitstreams.',
          refs: [],
        },
      ],
      sources,
      supported: true,
    };
  }

  // 6. Not established: honest, authoritative executive abstention
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
