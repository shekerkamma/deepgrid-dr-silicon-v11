# DeepGrid v11 site

Static Next-compatible site (Vinext) published to GitHub Pages at
https://shekerkamma.github.io/deepgrid-dr-silicon-v11/ (repo `shekerkamma/deepgrid-dr-silicon-v11`): the
mature-node silicon portfolio, with DG32 as the detailed pre-silicon proof point. The same code also
publishes v12 (https://shekerkamma.github.io/deepgrid-dr-silicon-v12/). Read `AGENTS.md` and
`WORKSPACE_MAP.md` before broad discovery.

This folder is the one home for v11 work, with one pinned Claude session named "DeepGrid v11". The folder
name says v10 because it began as a v10 clone; remotes are `origin` = v10, `v11`, `v12`. Work on branch
`v11-master`, which tracks `v11/main`. `~/content-ideas/deepgrid-dr-silicon-v11` is a stale clone; do not
work there.

## Build and verify

- `npm run typecheck`, then build with the same settings CI uses:
  `DGS_PLAN=1 PAGES_BASE=/deepgrid-dr-silicon-v11/ NEXT_PUBLIC_PAGES_BASE=/deepgrid-dr-silicon-v11/ npm run build:pages`
  (runs the content and class checks, then packages `dist/pages`). Without both base variables packaging
  fails with `Unprefixed link: /`. Without `DGS_PLAN=1` the business-plan data is stubbed and
  `verify-plan` / `verify-ask-panels` take a different path than CI. Never `npm run build` alone: it
  clears `dist/` without producing `dist/pages`.
- Read a build's exit code directly (`; echo "exit $?"`); a piped build hides failure.
- `bash qa/dgs/gates.sh` (from WSL) is the full local gate run: it builds through Windows node, snapshots
  `dist/pages` to WSL, serves it and runs the gates. Prefer it to a hand-rolled sequence. From the
  Windows Claude install, run it as `wsl.exe -e bash /mnt/c/Users/sheke/Documents/Codex/2026-10-04/please-open-a-codex-chat-in-2/work/deepgrid-dr-silicon-v10/qa/dgs/gates.sh`
  (Git Bash cannot run it).
- Serve a build the way Pages does:
  `python3 ~/.claude/skills/e2e-qa-review/scripts/serve_pages.py dist/pages deepgrid-dr-silicon-v11 8790`
  (WSL). A Windows browser cannot reach WSL `localhost`; open `http://<hostname -I address>:8790/...`.
- CI (`.github/workflows/pages.yml`) builds with the repository name as base and `DGS_PLAN=1`, serves with
  `scripts/serve-dist.py 8768`, then runs 17 `scripts/verify-*.mjs` gates (routes, v6-interactions,
  reading, ask, ask-panels, layout, v11, nav, navigation-design, text-fit, plan, portfolio, use-cases,
  applications-tabs, investor-journey, engineering-visuals, brand-imagery). Before a push, run every gate
  that tests what you changed; when you remove something, grep the gates for it first.

## Design and content authority

- `DESIGN.md` owns colours, type (Newsreader display, Inter text, JetBrains Mono labels), layout and
  components. Use the CSS tokens in `app/v3.css` and `app/globals.css`; no raw hex, px or font stacks.
- `PRODUCT.md` and the corrective claim register `app/claims.ts` govern what the site may assert: nine core
  SKU architectures plus D100 (architecture breadth, not ten shipping products); DG32 evidence is pre-silicon;
  simulation, estimates, measured silicon and qualification stay distinct; illustrations establish no
  certification, traction or production status. No em dashes in copy.
- Titles state a fact (a part, a system or a number), never advice: `DESIGN.md` "Titles". `npm run check:titles` runs in every build. Peer items go in the Lattice (`app/lattice.ts`), never a same-size card grid.
- Dashboards: nothing below 14px, SVG charts drawn at 1:1 with `useWidth()`, cut test and wireframe before a new metric, blind second-agent review before the owner sees one: `DESIGN.md` "Dashboards". `scripts/check-dashboard-type.mjs` runs in every build.
- Client code ships in every build: a label or figure kept out of the page but present in a component's
  JS is still public. `scripts/check-withheld-output.mjs` runs at the end of `build:pages`.

## Repository operations

- This worktree is on a Windows drive: run git through Windows (`cmd.exe /c "cd /d <path> && git ..."` or
  `powershell.exe -NoProfile -Command`); WSL git reports every file as changed (CRLF).
- `qa/dgs/push.ps1` pushes `HEAD` to `main` on both v11 and v12, so one push deploys both sites. Push only
  with the owner's go-ahead for this repo; a go-ahead for another DeepGrid repo does not cover this one.
- A hung Pages run blocks the deploy queue. Cancel it as the owner: Windows `gh` is `shekerkamma`; the WSL
  `gh` account `sheker-deepgrid` gets HTTP 403. After a push, `/pages-watch` waits for both runs and runs
  the live leak scan.
- Ask answers come from the Cloudflare Worker `deepgrid-rerank` (`services/ask/`), deployed separately from
  Pages, so it can drift from git. Deploy from Windows with
  `$env:XDG_CONFIG_HOME="\\wsl$\Ubuntu-24.04\home\sheke\.config"; node node_modules/wrangler/bin/wrangler.js deploy --config services/ask/wrangler.jsonc`.
  The Worker is shared: its CORS origins must keep every site that calls it.

## Long sessions

This is a long-running session. When context fills, it is summarised and this file is read again, so any
fact that must survive belongs here or in `docs/`, not only in the chat. Hand one-off jobs (a sweep, a
search) to subagents, long waits (builds, gate runs, Pages deploys) to background tasks, and side
questions to `/btw`.

## Visual development

### Quick visual check
Right after any front-end change, before saying it is done:
1. **List what changed** and the routes it affects (a shared file affects every route).
2. **Build** as above and serve it.
3. **Open each affected route** with the Playwright MCP (`mcp__playwright__browser_navigate`) at 1440×900
   and again at 390×844 (`browser_resize`); take a screenshot at each width and look at it.
4. **Compare with `DESIGN.md`** and with what was asked for: tokens, type roles, spacing, the Don'ts.
5. **Check the console** (`browser_console_messages`) and failed requests: errors are defects.
6. **Say what you checked**, with the screenshot paths, and anything you could not check.

### Full design review
Run `/site-review` (or the `site-review` subagent) before pushing significant UI work to `main`:
it measures every affected route at 1440/768/390 with axe-core, runs the menu gate when navigation
changed, inspects the live pages and reports Blockers / High / Medium / Nitpicks with evidence.
The review is read-only; fixes happen afterwards, in this session.
