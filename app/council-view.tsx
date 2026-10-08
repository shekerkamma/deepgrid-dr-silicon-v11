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
}: GroundedAnswerViewProps) {
  const question = query;
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const sem = useSemanticScores(question);
  const story = useMemo(
    () => executiveAnswer(question, executeGraphRAG(question, sem).retrieval),
    [question, sem],
  );
  const [sourcesOpen, setSourcesOpen] = useState(false);
  useEffect(() => { setSourcesOpen(false); }, [query]);
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
      data-ready={ready}
      data-semantic={sem ? 'on' : 'off'}
      data-answerable={story.supported}
    >
      {question && <article className="dr-answer-card answer-essay" aria-label="Answer">
        <h2 className="dr-contextual-title">{question}</h2>
        <p className="dr-answer-lead">{story.answer}{refs(story.answerRefs)}</p>
        {story.supported && story.beats.filter(b => b.refs.length > 0).map((b, i) => (
          <p key={i}>{b.body}{refs(b.refs)}</p>
        ))}
        {story.sources.length > 0 && (
          <details
            className="executive-sources"
            open={sourcesOpen}
            onToggle={(e) => setSourcesOpen(e.currentTarget.open)}
          >
            <summary>
              Further details and sources · {story.sources.length}
            </summary>
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
      </article>}
    </div>
  );
}
