# V12 rebuild from the Claude v11 update

Source: `v11/main` at `1e5c338803a9739168a81311daa068e11d3dfa23`, including the changes attributed to https://claude.ai/code/session_01PpFZJFqXKC7U2p3MwPLpGD in Git commit metadata. The private session itself was not accessible through the web reader.

Merged into the existing v12 release branch. Conflict resolutions use the updated v11 product content, graph, source documents and semantic index. V12 retains its parent-menu state, branding and four-width layout gate. The earlier local Codex GraphRAG draft is preserved in a named Git stash rather than overlaid on Claude's implementation.

The update makes the October 2026 Blueprint the portfolio source of record, removes Technical Annex references, and adds confidence-weighted graph retrieval with numbered source passages, limits and an inspectable retrieval trace. Answers remain extractive; there is no generative LLM service at query time. Story-architect's direct-answer → evidence → limits structure is implemented in the answer panel.

Integration fixes: normalize line endings when hashing retrieval code, and resolve Ask PDF/download citations against the site base so `/ask/` works. A browser gate exercises actual semantic model loading, D100 funding, citation URLs, graph disclosure, unsupported questions, comparison and mobile width.

Validation before publication: TypeScript, source/claim/cross-reference checks, semantic integrity, and 20/20 graph-retrieval cases in semantic and lexical modes. Disabling graph spreading changes evidence in 11/20 cases. The static export includes all 37 public routes (38 prerender entries including the framework entry), with zero skipped routes. Publication remains gated by the complete GitHub Pages workflow, including live verification.
