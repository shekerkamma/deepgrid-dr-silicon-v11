# Diligence holdout for Ask DeepGrid

- `questions.json`: 30 data-room questions with the expected outcome (`answer`, `abstain`, `withheld`), written
  and frozen on 2026-10-23 before any answer was seen. The 10 holdout questions are the first 10 by
  sha256 of the question text. `scripts/ask-diligence.mjs` refuses to run if the file no longer matches its hash.
- `answers.json`: raw answers from the live Ask page (one paid Worker call each), run 2026-10-23.
- `results.csv`: verdicts from `scripts/score-diligence.mjs`, which uses no model.

## Score (2026-10-23)

| | Tuning | Holdout |
|---|---|---|
| First scorer run | 6/20 | 3/10 |
| After the citation-resolution fix | 17/20 | 7/10 |

The first run treated Ask's runtime sources (`brief_*`, `portfolio_*`) as unresolved. The fix resolves them by
family and applies to all 30 answers alike; Ask itself was not changed. The fix was made after the holdout
answers had been read, so the holdout is no longer blind. Both numbers are kept. The scorer is frozen from here.

Latency: median 15.7 s, p95 19.1 s (goal 5 s). Three answers (3, 7, 17) cite the superseded whitepaper v3.

## Reviewer reading of the six failures (human judgment, not part of the score)

| # | Set | Verdict | Reading |
|---|---|---|---|
| 16 | holdout | fail | Real. Ask says the team is not in the documents; `/company` describes it. Ask's retrieval does not reach it. |
| 17 | tuning | fail | Real. States the 200 MHz target as current; that figure comes from the superseded whitepaper (the Blueprint lists 100 MHz). |
| 21 | holdout | fail | Ambiguous. Ask quotes 26 Dec 2026 from the public brief as the freeze date, while the internal report says the foundry cutoff is INPUT REQUIRED. One of them is wrong, or they mean different dates. |
| 22 | tuning | fail | Scorer false negative. Ask says the slots are "unconfirmed"; the scorer's unavailability pattern misses that wording. |
| 24 | holdout | fail | Borderline. "None of Tranche 1 is committed" claims more than the documents, which only call it a proposed raise. |
| 26 | tuning | fail | Expectation error. "No POs or LOIs" is documented (`data/portfolio/conflicts.csv`), so the question was answerable. |
