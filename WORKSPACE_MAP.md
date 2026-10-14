# Workspace map

- `app/use-case-dashboard.tsx`, `app/use-case-dashboard.css`, `app/data/use-case-model.ts`: complete twelve-use-case dashboard in `/portfolio/brief?view=use-cases`, charts, coverage matrix and implementation drill-downs.
- `data/portfolio/use-cases.json`: sourced use-case/first-market mapping; financial figures remain in the existing CSVs. `app/data/use-portfolio.ts` owns bounded, validated live refresh and checked-snapshot fallback.
- `scripts/verify-use-cases.mjs`, `scripts/analyst/validate_use_cases.py`: responsive interactions, live-data acceptance/rejection, accessibility, and independent mapping/score/financial checks.

- `app/routes.ts`, `app/shell.tsx`, `app/mega-nav.tsx`: 37-route map, navigation and shared page shell.
- `app/home-refined.tsx`, `app/portfolio-v6.css`: portfolio-first homepage storyboard and presentation.
- `app/portfolio-story-data.ts`, `app/portfolio-story.tsx`: source-backed portfolio, qualification, strategy and evaluation register.
- `app/portfolio-workbench.tsx`, `app/portfolio-workbench.css`: persistent material illustration with Three.js functional and fault overlays; reduced-motion/static states.
- `app/route-journey.tsx`, `app/route-journey.css`: specific evaluation guides for the deeper pages.
- `app/applications-story.tsx`, `app/applications-portfolio.tsx`, `app/applications-story-data.ts`: system/task narrative and portfolio filtering.
- `app/claims.ts`, `public/downloads/`: corrective claims and primary architecture documents; publication authority.
- `app/data/deepgrid-knowledge.ts`, `app/data/deepgrid-chapters.json`: indexed discovery corpus; resolve shorthand against the primary documents.
- `app/company/page.tsx`: portfolio strategy and scoped stop rules.
- `docs/v6/story-pack.md`, `docs/v6/direction.md`, `.impeccable/mocks/`: narrative, delegated direction and composition studies.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`: product truth and implemented design system.
- `scripts/package-pages.mjs`, `.github/workflows/pages.yml`: base-aware static export and gated Pages publication.
- `scripts/verify-routes.mjs`, `scripts/verify-nav.mjs`: desktop, mobile, reduced-motion route and navigation gates.
- `scripts/document-readers.mjs`, `scripts/verify-reading.mjs`: generated source-document reading editions, mobile reading checks and light-section foreground regression checks.

Windows: run npm through `node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js'`. Stop preview servers before rebuilding `dist`; Windows can lock the served export. Build with both `PAGES_BASE` and `NEXT_PUBLIC_PAGES_BASE` set to the endpoint path. Do not rebuild during route capture.

- `app/modern-v11.css`, `app/deepgrid-visual.tsx`, `app/portfolio-finder.tsx`: v11 responsive design, sourced imagery, architecture selector and searchable portfolio.
- `docs/v11-direction.md`, `docs/v11/image-provenance.json`: delegated direction and original DeepGrid source records.
- `scripts/verify-v11.mjs`: responsive imagery, filtering and screenshot checks.

- `scripts/verify-layout.mjs`: v12 four-width route geometry, visible navigation, header-height and sticky-control regression checks.

- `app/data/graph-retrieval.ts`, `scripts/eval-graphrag.mjs`: provenance-weighted graph retrieval and lexical/semantic answer evaluation.

- `docs/executive-story-pack-v12.md`, `app/executive-{routes,products}.json`: business audience storyboards and route titles. `app/executive-sections.json` is retired (2026-10-11): sections render their own findings; see `design-plans/2026-10-11-story-arc-and-figures.md` §11.
- `app/data/executive-answer.ts`: legacy authored stories retained for existing story tests; not the Ask answer path. `app/council-view.tsx` renders hosted, query-specific answers and disclosed sources.
- `scripts/check-executive-story.mjs`, `scripts/verify-ask.mjs`: story coverage, grounded answer and browser gates.

- `app/data/answer-evidence.ts`, `app/data/answer-generator.ts`, `services/ask/worker.ts`: general graph-evidence packet, Cloudflare-hosted Gemini synthesis and citation checks; no query-specific answer prose.
- `docs/ask-composition-contract.md`: response quality criteria and real-model release gate.

- `app/site-refinement.css`, `app/motion.tsx`, `docs/v12-site-refinement.md`: shared reading, navigation focus, visible-default motion and sitewide refinement acceptance.

- `scripts/build-primary-answer-evidence.mjs`, `app/data/primary-answer-evidence.json`: deterministic primary-guide passages supplement graph retrieval; regenerate after architecture-guide edits. Build checks source freshness.

- app/investor-journey.tsx and app/investor-journey.css: investor homepage story, contextual diligence links and site directory; contact/page.tsx supports shareable investor/partner/engineering enquiry intent. Use-case dashboard query parameters persist search and market filters.
