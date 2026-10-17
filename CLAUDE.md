# DeepGrid v6 site

Static Next-compatible site (Vinext) published to GitHub Pages at
https://shekerkamma.github.io/deepgrid-dr-silicon-v6/: the mature-node silicon portfolio, with DG32 as the
detailed pre-silicon proof point. Read `AGENTS.md` and `WORKSPACE_MAP.md` before broad discovery.

## Build and verify

- `npm run typecheck`, then build with the same base path CI uses:
  `PAGES_BASE=/deepgrid-dr-silicon-v6/ NEXT_PUBLIC_PAGES_BASE=/deepgrid-dr-silicon-v6/ npm run build:pages`
  (runs the content and class checks, then packages `dist/pages`). Without both variables packaging fails
  with `Unprefixed link: /`. Never `npm run build` alone: it clears `dist/` without producing `dist/pages`.
- Read a build's exit code directly (`; echo "exit $?"`); a piped build hides failure.
- Serve the build the way Pages does:
  `python3 ~/.claude/skills/e2e-qa-review/scripts/serve_pages.py dist/pages deepgrid-dr-silicon-v6 8790`
- CI (`.github/workflows/pages.yml`) runs verify-routes and verify-nav before and after deploy.

## Design and content authority

- `DESIGN.md` owns colours, type (Newsreader display, Inter text, JetBrains Mono labels), layout and
  components. Use the CSS tokens in `app/v3.css` and `app/globals.css`; no raw hex, px or font stacks.
- `PRODUCT.md` and the corrective claim register `app/claims.ts` govern what the site may assert: nine core
  SKU architectures plus D100 (architecture breadth, not ten shipping products); DG32 evidence is pre-silicon;
  simulation, estimates, measured silicon and qualification stay distinct; illustrations establish no
  certification, traction or production status. No em dashes in copy.
- Titles state a fact (a part, a system or a number), never advice: `DESIGN.md` "Titles". `npm run check:titles` runs in every build. Peer items go in the Lattice (`app/lattice.ts`), never a same-size card grid.
- Dashboards: nothing below 14px, SVG charts drawn at 1:1 with `useWidth()`, cut test and wireframe before a new metric, blind second-agent review before the owner sees one: `DESIGN.md` "Dashboards". `scripts/check-dashboard-type.mjs` runs in every build.

## Repository operations

- This worktree is on a Windows drive: run git through Windows (`cmd.exe /c "cd /d <path> && git ..."`); WSL git reports every file as changed (CRLF).
- `qa/dgs/gates.sh` is the full local gate run (build, sweep, align, nav, lanes, ten verify scripts); `qa/dgs/push.ps1` pushes to the v11 and v12 remotes.
- A hung Pages run blocks the v12 deploy queue. Cancel it as the owner: Windows `gh` is `shekerkamma`; the WSL `gh` account `sheker-deepgrid` gets HTTP 403.

## Visual development

### Quick visual check
Right after any front-end change, before saying it is done:
1. **List what changed** and the routes it affects (a shared file affects every route).
2. **Build** with `npm run build:pages` and serve as above.
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
