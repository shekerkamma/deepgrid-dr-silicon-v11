# Ask: evidence-backed answer synthesis

## BLUF
Every submitted question is answered by Gemini 3.8 Flash using retrieved DeepGrid evidence, or receives an explicit evidence limitation or service error. No authored answer is substituted when generation fails.

## Audience decision
A business reader should understand the answer, its practical implications, and which technical facts support it. Source pages remain available for further detail.

## Tension
Graph retrieval locates passages; ranking or reformatting those passages does not compose an answer. The previous Worker returned a passage number and the previous frontend used curated prose.

## Argument arc and response spine
The question determines length and structure. Lead with the direct answer, explain its business significance, support it with the relevant technical facts, and state only material limitations. Use short finding-based headings when useful. A narrow factual question may need only a paragraph. Do not force a next-decision block, evaluation checklist, or executive-brief template.

## Evidence map
Browser semantic scores and graph expansion select source IDs. The Worker resolves IDs against its bundled corpus; it never trusts browser-provided passages or links. The model receives original passages, relationship context, and retrieval limitations. Citations require matching source IDs and verbatim supporting quotes. A second model call checks claim support and attribution. This reduces errors but is not a guarantee of factual correctness; live answer review remains necessary.

## Content cuts
No unsupported certification, measured performance, completed funding, equity/debt characterization, commercial availability, or ROI claims. Preserve the corrective claim register. Clearly separate plans and calculations from achieved outcomes. Abstain on questions the evidence does not answer.

## Implementation
- `services/ask/worker.ts`: `/answer` on the existing `deepgrid-rerank` Worker; Gemini API key remains a Cloudflare secret. Existing reranking routes are preserved in `legacy-rerank.js`.
- `services/ask/wrangler.jsonc`: rate limit of 12 requests/minute/IP and a Mumbai placement hint. The hint addresses location-related Gemini rejections; it is not a hard data-residency guarantee.
- `app/data/answer-evidence.ts`: generic evidence collection, response contract and citation validation.
- `app/data/answer-generator.ts`: public endpoint client; sends the question and selected IDs only.
- `app/council-view.tsx`: pending, answer, evidence limitation, error and retry states; aborted/obsolete responses cannot replace a newer question.
- No browser LLM download or private API key in GitHub Pages.

## Validation and release
`node scripts/check-answer-service.mjs` checks trusted sources, citation rejection, origin/body/query bounds, rate limiting and model errors using mocked provider responses. `scripts/verify-ask.mjs` verifies the frontend transport/UI contract with fixtures; it does not prove model quality. Live tests are stored locally in `work/ask-service/live-*.json` and cover funding, accelerator-free diagnostics, product comparison and an undocumented warranty. Deploy the Worker and verify live inference before publishing the frontend. No provider fallback is configured.

Live service validation on 8 October 2026: D100 funding, accelerator-free diagnostics, and a motor-versus-battery comparison returned generated, cited answers in approximately 10-13 seconds; undocumented SKU-10 warranty returned an evidence limitation in 3 seconds. Local browser checks exercised the D100 and SKU comparison flows. Worker version: `44760693-2f7c-4774-a3e9-e0b9d34bcce2`. These are observed samples, not a latency guarantee or universal accuracy claim.
