'use client';
import {useEffect,useState} from 'react';
import {
  FileText,
  Download,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Network,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import {executeGraphRAG,type SemanticScores} from './data/graphrag-engine';
import {getSemantic} from './data/semantic';
import {readHref} from './doc-links';
import {asset} from './routes';

interface GroundedAnswerViewProps {
  query: string;
  onSelectQuery: (q: string) => void;
  go: (hash: string) => void;
}

const DEFAULT_QUESTION = 'What does SKU-10 DG32-Max replace, and how does it boot only signed firmware?';

// Semantic scores for the question on screen, once the in-browser model has them. Loading starts when
// Ask opens; each question is embedded 250 ms after typing pauses, so fast typing costs nothing. Until
// then (or if the model cannot load) this returns null and the engine answers by TF-IDF.
function useSemanticScores(question: string): SemanticScores | null {
  const [state, setState] = useState<{q: string; s: SemanticScores} | null>(null);
  useEffect(() => { void getSemantic(); }, []);
  useEffect(() => {
    if (question.trim().length < 3) return;
    let live = true;
    const t = setTimeout(async () => {
      const sem = await getSemantic();
      if (!sem || !live) return;
      try { const s = await sem.scores(question); if (live) setState({q: question, s}); } catch { /* stay on TF-IDF */ }
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [question]);
  return state && state.q === question ? state.s : null;
}

/** PDF link to the cited page: "p. 37" becomes #page=37. */
function pageHref(pdfPath: string, pageLabel: string): string {
  pdfPath = asset(pdfPath.replace(/^\./, ''));
  const n = pageLabel.match(/\d+/)?.[0];
  return pdfPath.endsWith('.pdf') && n ? `${pdfPath}#page=${n}` : pdfPath;
}

export default function GroundedAnswerView({query, onSelectQuery, go}: GroundedAnswerViewProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const question = query || DEFAULT_QUESTION;
  const sem = useSemanticScores(question);
  const result = executeGraphRAG(question, sem);
  const r = result.retrieval;

  return (
    <div className="dr-grounded-answer-wrap" data-semantic={sem ? 'on' : 'off'}>
      {/* 1. Contextual Architectural Answer Card */}
      <article className="dr-answer-card">
        {/* Dynamic Contextual Header (replaces generic 'Verified Answer' label) */}
        <div className="dr-answer-header">
          <div className="dr-answer-badge">
            <span className="dr-bullet-pulse" />
            <span className="mono dr-domain-tag">{result.domainTag}</span>
          </div>
          <span className="dr-answer-source-ref">
            Grounded in {result.citation.documentTitle} ({result.citation.page})
          </span>
        </div>

        {/* Query-Contextual Title */}
        <h2 className="dr-contextual-title">{result.contextualTitle}</h2>

        {/* Direct answer (story-architect BLUF): a sentence quoted from the best evidence, or a plain statement
            that the sources do not establish it. */}
        <span className="mono dr-facts-heading">{r.answerable ? 'DIRECT ANSWER' : 'NOT ESTABLISHED'}</span>
        <p className="dr-answer-lead">{result.answer}{r.answerable && result.explanation.length === 0 && r.evidence.length > 0 && <sup className="dr-ev-ref">{r.blufRefs.map(n => `[${n}]`).join('')}</sup>}</p>

        {/* In-Depth Explanation & Architectural Breakdown */}
        <div className="dr-answer-explanation">
          {result.explanation.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Numbered evidence: each passage the graph and the question selected, quoted and cited. */}
        {r.evidence.length > 0 && (
          <section className="dr-evidence" aria-label="Evidence">
            <span className="mono dr-facts-heading">{r.answerable ? 'EVIDENCE' : 'CLOSEST MATERIAL (DOES NOT ANSWER THE QUESTION)'}</span>
            <ol className="dr-evidence-list">
              {r.evidence.map(e => (
                <li key={e.n} className="dr-evidence-item" data-kind={e.kind}>
                  <span className="mono dr-evidence-n">[{e.n}]</span>
                  <div>
                    <blockquote className="dr-evidence-quote">{e.quote}</blockquote>
                    <p className="dr-evidence-cite">
                      {e.chunk.docTitle} · {e.chunk.section} · {e.chunk.pageLabel}
                      {' · '}<a href={readHref(e.chunk.specPath.replace(/^\./, ''), e.chunk.section)}>Read in site</a>
                      {' · '}<a href={pageHref(e.chunk.pdfPath, e.chunk.pageLabel)}>PDF page</a>
                    </p>
                    {e.via.length > 0 && <p className="dr-evidence-via">Reached through: {e.via.join(', ')}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* What the sources do not establish. */}
        {r.limits.length > 0 && (
          <section className="dr-limits" aria-label="Evidence limits">
            <span className="mono dr-facts-heading">WHAT THE SOURCES DO NOT ESTABLISH</span>
            <ul className="dr-facts-list">{r.limits.map((l, i) => <li key={i}><span className="dr-bullet-dot" /><span>{l}</span></li>)}</ul>
          </section>
        )}

        {/* Catalog facts, only when the question is about that part. */}
        {result.keyBusinessFacts.length > 0 && (
        <div className="dr-answer-facts">
          <span className="mono dr-facts-heading">KEY FACTS:</span>
          <ul className="dr-facts-list">
            {result.keyBusinessFacts.map((fact, idx) => (
              <li key={idx}>
                <span className="dr-bullet-dot" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* Retrieval trace: why these passages, and what the graph contributed. */}
        <details className="dr-trace">
          <summary>How this answer was found</summary>
          <div className="dr-trace-body">
            <p><strong>Starting points.</strong> {r.seeds.map(sd => `${sd.name} (${sd.why})`).join('; ') || 'none'}.</p>
            {r.hops.length > 0 && (
              <ul className="dr-trace-hops">
                {r.hops.map((h, i) => <li key={i}>{h.from} <span className="mono">─{h.relation}→</span> {h.to} <span className="dr-trace-conf">{h.confidence.toLowerCase()} · {h.weight.toFixed(2)}</span></li>)}
              </ul>
            )}
            <p>Passages are ranked by {r.byMeaning ? 'meaning' : 'shared words (the meaning model is still loading)'} plus the graph score of the entities they mention. The graph changed {r.graphChanged} of {r.evidence.length} evidence passages compared with that ranking alone.</p>
            <ul className="dr-trace-hops">
              {r.evidence.map(e => <li key={e.n}>[{e.n}] {r.byMeaning ? 'meaning' : 'word match'} {e.semantic.toFixed(2)} · graph {e.graph.toFixed(2)} · {e.kind === 'direct' ? 'answers the question' : 'closest material'}</li>)}
            </ul>
          </div>
        </details>

        {/* Further References & Deep Dives */}
        <div className="dr-answer-references">
          {result.referenceLinks.length > 0 && <div className="dr-ref-header">
            <span className="mono dr-ref-title">FURTHER REFERENCES:</span>
          </div>}

          <div className="dr-ref-links-grid">
            {result.referenceLinks.map((link, idx) => (
              <button
                key={idx}
                type="button"
                className="dr-ref-link-card"
                onClick={() => go(link.hash)}
              >
                <div className="dr-ref-link-top">
                  <strong>{link.label}</strong>
                  <ArrowUpRight size={15} />
                </div>
                <p>{link.description}</p>
              </button>
            ))}
          </div>

          {/* Primary Whitepaper PDF & Specification Access */}
          <div className="dr-citation-card">
            <div className="dr-citation-content">
              <div className="dr-citation-icon-wrap">
                <FileText size={20} style={{color: 'var(--copper)'}} />
              </div>
              <div className="dr-citation-meta">
                <span className="mono dr-citation-tag">PRIMARY SOURCE</span>
                <strong className="dr-citation-title">
                  {result.citation.documentTitle} · {result.citation.section}
                </strong>
                <span className="dr-citation-loc">{result.citation.page}</span>
              </div>
            </div>

            <div className="dr-citation-actions">
              <a 
                href={asset(result.citation.pdfPath.replace(/^\./, ''))}
                download
                className="dr-citation-btn primary"
                title={`Download the source (${result.citation.pdfSize})`}
              >
                <Download size={14} />
                {/* Not every source is a PDF: the STM32G0 comparison lives only in the Markdown guide. */}
                <span>{result.citation.pdfPath.endsWith('.pdf') ? 'Download PDF' : 'Download guide'} ({result.citation.pdfSize})</span>
              </a>
              <a 
                href={asset(result.citation.specPath.replace(/^\./, ''))}
                download
                className="dr-citation-btn outline"
                title="Download full Markdown specification"
              >
                <BookOpen size={14} />
                <span>Full Spec</span>
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* 1.5 Grounded Visual & Schematic Evidence Card */}
      {result.visualEvidence && (
        <section className="dr-visual-evidence-card">
          <div className="dr-visual-card-header">
            <div className="dr-visual-badge-group">
              <span className="dr-visual-chip">
                <Sparkles size={12} /> {result.visualEvidence.type}
              </span>
              <span className="dr-visual-title">{result.visualEvidence.title}</span>
            </div>
            <a
              href={`./${result.visualEvidence.filePath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="dr-visual-link-btn"
              title="Open full resolution in new tab"
            >
              <span>Full Resolution</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="dr-visual-img-container">
            <img
              src={`./${result.visualEvidence.filePath}`}
              alt={result.visualEvidence.title}
              className="dr-visual-img"
              loading="lazy"
              width={800}
              height={450}
            />
          </div>

          <div className="dr-visual-footer">
            <p className="dr-visual-caption">
              <strong>Figure:</strong> {result.visualEvidence.caption}
            </p>
          </div>
        </section>
      )}

      {/* 2. Progressive Disclosure: Deeper Technical Specifications */}
      {result.technicalDetails && (
        <div className="dr-tech-disclosure">
          <button 
            type="button"
            className="dr-tech-toggle-btn"
            onClick={() => setShowTechnical(!showTechnical)}
            aria-expanded={showTechnical}
          >
            <span>Where this answer comes from</span>
            <span className="dr-tech-toggle-label">
              {showTechnical ? 'Hide' : 'Show'}
              {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {showTechnical && (
            <div className="dr-tech-panel">
              <div className="dr-tech-specs">
                <span className="mono dr-specs-heading">{result.technicalDetails.summary.toUpperCase()}</span>
                <ul className="dr-specs-list">
                  {result.technicalDetails.specPoints.map((spec, i) => (
                    <li key={i}>{spec}</li>
                  ))}
                </ul>
              </div>

              <div className="dr-tech-action">
                <button
                  type="button"
                  className="primary"
                  onClick={() => go(result.technicalDetails!.deepLink.hash)}
                >
                  {result.technicalDetails.deepLink.label} <ArrowUpRight size={16} />
                </button>
                <span className="dr-tech-action-context">
                  {result.technicalDetails.deepLink.context}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Suggested Follow-Up Questions */}
      <div className="dr-related-wrap">
        <span className="mono dr-related-heading">RELATED QUESTIONS:</span>
        <div className="dr-related-chips">
          {result.relatedTopics.map((topic, i) => (
            <button
              key={i}
              type="button"
              className="dr-related-chip"
              onClick={() => onSelectQuery(topic.query)}
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
