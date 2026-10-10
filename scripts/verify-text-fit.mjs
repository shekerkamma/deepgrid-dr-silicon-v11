// Text-fit gate for every declared route: nothing cut off, covered, cropped or unit-uppercased, at 1440, 1100
// and 390, with each "Our products" tile opened in turn. Added 2026-10-10 after the navy restyle clipped open
// product tiles, overlapped library groups on phones and cropped film-still titles with every other check green.
// Usage: node scripts/verify-text-fit.mjs <base-url>
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.argv[2] || 'http://127.0.0.1:8768/deepgrid-dr-silicon-v11/';
const routeSrc = fs.readFileSync(path.join(root, 'app/routes.ts'), 'utf8');
const routes = [...new Set([...routeSrc.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1].replace(/^\//, '')))];
if (routes.length < 8) { console.error(`BLOCKED: only ${routes.length} routes parsed from app/routes.ts`); process.exit(1); }
const cfg = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'textfit-')), 'cfg.json');
fs.writeFileSync(cfg, JSON.stringify({ base, routes, expand: ['.pt-spine'], out: path.join(path.dirname(cfg), 'out.json') }));
const r = spawnSync(process.execPath, [path.join(root, 'scripts/text-fit-gate.mjs'), cfg], { stdio: 'inherit', cwd: root });
process.exit(r.status ?? 1);
