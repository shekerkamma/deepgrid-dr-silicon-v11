// Records the owner-approved wording of each founder decision in data/plan/approved-decisions.json.
// verify-decision-report.mjs fails when a decision's wording differs from its approved entry, so
// reversing advice ("Lock" -> "Postpone") with unchanged numbers cannot ship unnoticed.
// Numbers are masked as "#": the gate's numeric checks already tie them to the CSVs.
//
// Usage: DGS_INTERNAL=1 node scripts/build-plan-data.mjs
//        node scripts/approve-decisions.mjs --by "<who approved>" --on YYYY-MM-DD
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DECISION_FIELDS, LABEL_FIELDS, decisionShape} from './decision-shape.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const by = arg('--by'), on = arg('--on');
if (!by || !/^\d{4}-\d{2}-\d{2}$/.test(on ?? '')) {
  console.error('approve-decisions: pass --by "<who approved>" --on YYYY-MM-DD');
  process.exit(2);
}
const dr = JSON.parse(fs.readFileSync(path.join(root, 'app/plan-data.json'), 'utf8')).decisionReport;
if (!dr?.decisions?.length) {
  console.error('approve-decisions: no decisionReport in app/plan-data.json (run DGS_INTERNAL=1 node scripts/build-plan-data.mjs)');
  process.exit(1);
}
const decisions = dr.decisions.map(d => ({
  id: d.id,
  approvedBy: by,
  approvedOn: on,
  fields: Object.fromEntries(DECISION_FIELDS.map(f => [f, decisionShape(d[f])])),
}));
fs.writeFileSync(path.join(root, 'data/plan/approved-decisions.json'), JSON.stringify({
  note: 'Approved wording of the founder decisions (numbers masked as #). Edit only through scripts/approve-decisions.mjs after the owner approves a change.',
  heading: decisionShape(dr.heading),
  labels: Object.fromEntries(LABEL_FIELDS.map(f => [f, decisionShape(dr.labels?.[f])])),
  decisions,
}, null, 2) + '\n');
console.log(`approve-decisions: recorded ${decisions.length} decisions (${decisions.map(d => d.id).join(', ')}) approved by ${by} on ${on}`);
