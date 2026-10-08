# A connected question-and-answer workspace
Written against b5a5e2c.

## Evidence chain
- Surface: /ask, app/ask.tsx and app/council-view.tsx.
- User screenshot demonstrates a detached submit button and redundant instruction text. Live reproduction confirms samples fill the field but do not submit.
- Explicit design reference: /about, rendered through app/company-page.tsx PageBand and company-pages.css. Reuse cp-band typography, copper action color, content alignment and section rhythm.
- Shared consumers: the existing heading, source-disclosure and action styles across section pages. Preserve their reading hierarchy; do not impose Ask state on other routes.

## Design decision
One form owns the input, sample choices and adjacent Submit action. Samples submit directly. An answer belongs to the submitted query; editing hides stale results. Optional knowledge tools follow the answer. Remove the instructional sentence.

## Changes and validation
app/ask.tsx owns submission, renders the About-style header and connected action row. council-view.tsx only renders the submitted response. executive-story.css supplies responsive composer and answer layout using existing palette and typefaces. Verify keyboard, sample clicks, button clicks, empty input, changing questions, narrow layouts, sources and unsupported queries. Run typecheck, verify-ask, layout checks and Pages build. Keep the existing source pipeline and its documented synthesis limitations separate from UI correction.

## Scope
Implement the user-selected layout correction now. Apply shared readability, control spacing and focus rules to the traced sections. Preserve existing imagery and factual content. Do not introduce unrelated animation or a different visual identity.
