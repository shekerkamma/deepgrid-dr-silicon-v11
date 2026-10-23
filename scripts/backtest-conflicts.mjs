// Backtest of data/portfolio/conflicts.csv against git history: for each logged conflict, the first commit
// where both contradicting sides were in the repo, the commit that logged it, and the days between.
// Writes data/portfolio/conflict-backtest.csv, which the internal founder report charts.
//
//   node scripts/backtest-conflicts.mjs           regenerate the CSV (needs full history: git fetch --unshallow)
//   node scripts/backtest-conflicts.mjs --check   recompute and fail if the committed CSV disagrees
//
// The evidence for each side is listed in SIDES below: a file's first commit, or the first commit whose
// diff matches a pattern in a path. A side with no evidence in git (e.g. a file that only ever lived in
// someone's Downloads folder) makes the conflict unmeasurable rather than guessed.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'data/portfolio/conflict-backtest.csv');
const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8', maxBuffer: 1 << 26}).trim();

if (git('rev-parse', '--is-shallow-repository') === 'true') {
  console.error('backtest-conflicts: shallow clone; run `git fetch --unshallow` first');
  process.exit(2);
}

const WP = 'public/downloads/docs/deepgrid-mature-node-silicon-master-whitepaper-v3.pdf';
const BP = 'public/downloads/docs/deepgrid-sku-blueprint-oct2026.pdf';
const QFN = 'public/downloads/docs/deepgrid-datasheets-qfn64.pdf';
const LITE = 'public/downloads/docs/deepgrid-dg32-lite-preliminary-datasheet.pdf';
const file = p => ({file: p});
const diff = (pattern, p) => ({pattern, path: p});
const SIDES = {
  'ADC trim (DG32-2DOM)': [{missing: 'DG32-2DOM datasheet 08:34 was never committed'}, file(LITE)],
  'ADC trim inside one document': [file(QFN), file(QFN)],
  'Page count': [diff("pages:\\s*28|28[ -]page|28 pp|'28'", 'app/'), file(QFN)],
  'Processor clock': [file(WP), file(BP)],
  'SKU-10 clock': [diff('100 MHz lockstep|lockstep pair', 'app/'), file(LITE)],
  'Chip count': [file(WP), file(BP)],
  'Orders': [file(WP), file(BP)],
  'Raise': [file(WP), file(BP)],
  'FY31 revenue': [diff('1,000 Cr', 'app/'), file(BP)],
  'Confidential marking': [file(WP), file(WP)],
  'Ramp rounding': [file(BP), file(BP)],
};

// The first commit (oldest) satisfying a side, as {sha, date}.
const first = side => {
  if (side.missing) return null;
  const args = side.file
    ? ['log', '--diff-filter=A', '--format=%h %ad', '--date=short', '--', side.file]
    : ['log', `-G${side.pattern}`, '--format=%h %ad', '--date=short', '--', side.path];
  const line = git(...args).split('\n').filter(Boolean).at(-1);
  if (!line) return null;
  const [sha, date] = line.split(' ');
  return {sha, date};
};

const parse = rel => {
  const [head, ...rows] = fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n').trim().split('\n').map(line => {
    const cells = []; let cur = '', q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) { if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true; else if (c === ',') { cells.push(cur); cur = ''; } else cur += c;
    }
    cells.push(cur); return cells;
  });
  return rows.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
};

const topics = parse('data/portfolio/conflicts.csv').map(r => r.topic);
const unknown = topics.filter(t => !SIDES[t]);
if (unknown.length) { console.error(`backtest-conflicts: no evidence listed for ${unknown.join(', ')}; add them to SIDES`); process.exit(1); }

const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const rows = topics.map(topic => {
  const sides = SIDES[topic].map(first);
  const logLine = git('log', `-S${topic}`, '--format=%h %ad', '--date=short', '--', 'data/portfolio/conflicts.csv').split('\n').filter(Boolean).at(-1);
  const [loggedSha, loggedDate] = logLine.split(' ');
  if (sides.some(s => !s)) return {topic, both_present_commit: '', both_present_date: '', logged_commit: loggedSha, logged_date: loggedDate, lag_days: '', note: SIDES[topic].find(s => s.missing)?.missing ?? 'a side has no commit in git'};
  const both = sides.reduce((a, b) => (a.date >= b.date ? a : b));
  return {topic, both_present_commit: both.sha, both_present_date: both.date, logged_commit: loggedSha, logged_date: loggedDate, lag_days: String(days(both.date, loggedDate)), note: ''};
});

const cols = ['topic', 'both_present_commit', 'both_present_date', 'logged_commit', 'logged_date', 'lag_days', 'note'];
const esc = v => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const csv = [cols.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n') + '\n';

if (process.argv.includes('--check')) {
  const committed = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').replace(/\r\n/g, '\n') : '';
  if (committed !== csv) {
    console.error('backtest-conflicts --check FAILED: data/portfolio/conflict-backtest.csv differs from git history. Recomputed:\n' + csv);
    process.exit(1);
  }
  console.log(`backtest-conflicts --check: PASS (${rows.length} conflicts match git history)`);
} else {
  fs.writeFileSync(out, csv);
  console.log(`backtest-conflicts: wrote ${rows.length} rows to data/portfolio/conflict-backtest.csv`);
}
