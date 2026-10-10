# scrollcraft engine (vendored, unedited)

- Source: Claude plugin `nateherk-design` 0.2.0, `skills/scroll-craft/engine/scrollcraft.js` (Nate Herk). Licence: MIT, per the plugin's plugin.json.
- Copied 2026-10-10 for the home page's pinned fault-path act. scroll-craft's rule: never edit the engine per project. Bespoke behaviour lives in `app/scroll-act.tsx`, driven by the engine's `--sc-p`.
- Not vendored: `engine/scrollcraft.css`. It sets global `html`, `body` and `:root` rules. The one rule the pin needs (`.sc-stage` sticky) lives in `app/theme-dgs.css`.
