'use client';
import { useEffect, useState, useMemo } from 'react';
import { executeGraphRAG, type SemanticScores } from './data/graphrag-engine';
import { executiveAnswer } from './data/executive-answer';
import { getSemantic } from './data/semantic';
import { asset } from './routes';
import { readHref } from './doc-links';
import './executive-story.css';
interface GroundedAnswerViewProps {
  query: string;
  onSelectQuery: (q: string) => void;
  go: (hash: string) => void;
}
const DEFAULT_QUESTION = 'What does SKU-10 DG32-Max replace?';
function useSemanticScores(question: string): SemanticScores | null {
  const [state, setState] = useState<{ q: string; s: SemanticScores } | null>(
    null,
  );
  useEffect(() => {
    void getSemantic();
  }, []);
  useEffect(() => {
    if (question.trim().length < 3) return;
    let live = true;
    const t = setTimeout(async () => {
      const sem = await getSemantic();
      if (!sem || !live) return;
      try {
        const s = await sem.scores(question);
        if (live) setState({ q: question, s });
      } catch {
        /* stay on TF-IDF */
      }
    }, 250);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [question]);
  return state && state.q === question ? state.s : null;
}

export default function GroundedAnswerView({
  query,
  onSelectQuery,
}: GroundedAnswerViewProps) {
  const question = query || DEFAULT_QUESTION,
    sem = useSemanticScores(question);
  const story = useMemo(
    () => executiveAnswer(question, executeGraphRAG(question, sem).retrieval),
    [question, sem],
  );
  const [sourcesOpen, setSourcesOpen] = useState(false);
  useEffect(() => setSourcesOpen(false), [question]);
  const refs = (ns: number[]) =>
    ns.map((n) => (
      <a
        key={n}
        className="executive-ref"
        href={'#answer-source-' + n}
        onClick={() => setSourcesOpen(true)}
        aria-label={'Source ' + n}
      >
        [{n}]
      </a>
    ));
  return (
    <div
      className="dr-grounded-answer-wrap executive-answer"
      data-semantic={sem ? 'on' : 'off'}
      data-answerable={story.supported}
    >
      <article className="dr-answer-card">
        <div className="dr-answer-header">
          <span className="mono dr-domain-tag">
            {story.supported ? 'EXECUTIVE BRIEF' : 'AN OPEN QUESTION'}
          </span>
        </div>
        <h2 className="dr-contextual-title">{story.title}</h2>
        <p className="dr-answer-lead">
          {story.answer}
          {refs(story.answerRefs)}
        </p>
        <ol className="executive-arc" aria-label="Business implications">
          {story.beats.map((b, i) => (
            <li key={b.title}>
              <span className="dr-kicker">0{i + 1}</span>
              <h3>{b.title}</h3>
              <p>
                {b.body}
                {refs(b.refs)}
              </p>
            </li>
          ))}
        </ol>
        {story.sources.length > 0 && (
          <details
            className="executive-sources"
            open={sourcesOpen}
            onToggle={(e) => setSourcesOpen(e.currentTarget.open)}
          >
            <summary>
              Sources and supporting detail · {story.sources.length}
            </summary>
            <p className="executive-story-note">
              The brief summarises the published material. Implications and next
              steps are evaluation guidance; plans and targets are not achieved
              results.
            </p>
            <ol>
              {story.sources.map((c, i) => (
                <li key={c.id} id={'answer-source-' + (i + 1)}>
                  <strong>
                    {c.docTitle} · {c.section} · {c.pageLabel}
                  </strong>
                  <blockquote>{c.text}</blockquote>
                  <a
                    href={
                      asset(c.pdfPath.replace(/^\./, '')) +
                      '#page=' +
                      (c.pageLabel.match(/\d+/)?.[0] || 1)
                    }
                  >
                    Open source page
                  </a>
                  {' · '}
                  <a href={readHref(c.specPath.replace(/^\./, ''), c.section)}>
                    Read in site
                  </a>
                </li>
              ))}
            </ol>
          </details>
        )}
      </article>
      <div className="dr-related-wrap">
        <span className="mono dr-related-heading">
          Continue the business discussion
        </span>
        <div className="dr-related-chips">
          {[
            ['The D100 investment', 'How is the D100 drone chip funded?'],
            [
              'Secure control or battery intelligence?',
              'What is the difference between SKU-10 and SKU-11?',
            ],
            ['Customer need', 'What does SKU-1 replace?'],
          ].map(([label, q]) => (
            <button
              type="button"
              className="dr-related-chip"
              key={q}
              onClick={() => onSelectQuery(q)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
