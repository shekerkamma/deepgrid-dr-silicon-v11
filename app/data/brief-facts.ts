/** The published investor and buyer brief (app/brief-content.ts) as passages Ask DeepGrid may cite.
 *  One passage per answered question and per finding section; a question picks at most two, by shared words. */
import type { IndexChunk } from './graph-retrieval';
import { brief, type Block } from '../brief-content';

const STOP = new Set(['what', 'which', 'when', 'where', 'does', 'with', 'that', 'this', 'from', 'have', 'your', 'they', 'their', 'there', 'about', 'into', 'will', 'would', 'could', 'should', 'deepgrid', 'chip', 'chips']);
const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z0-9₹.\- ]+/g, ' ').split(/\s+/).filter(w => w.length >= 4 && !STOP.has(w)));
const text = (b: Block): string => 'p' in b ? (b.lead ? b.lead + ' ' : '') + b.p
  : 'list' in b ? b.list.map(i => (i.lead ? i.lead + ' ' : '') + i.text).join(' ')
  : 'table' in b ? [b.table.head.join(' | '), ...b.table.rows.map(r => r.join(' | ')), ...(b.table.total ? [b.table.total.join(' | ')] : [])].join('; ') + (b.note ? ' ' + b.note : '')
  : '';

export const briefChunks: IndexChunk[] = brief.flatMap(tab => {
  const out: IndexChunk[] = [];
  let section = '', body: string[] = [];
  const flush = () => { if (section && body.length) out.push({id: `brief_${tab.id}_${out.length}`, docTitle: `Investor and buyer brief: ${tab.title} (${tab.dated})`, docNum: 'portfolio-brief',
    pdfPath: '/portfolio/brief', pdfSize: '', specPath: '', pageLabel: tab.title, section, text: body.join(' ').slice(0, 2400)}); body = []; };
  for (const b of tab.blocks) {
    if ('h2' in b || 'h3' in b) { flush(); section = 'h2' in b ? b.h2 : b.h3; }
    else if (section) body.push(text(b));
  }
  flush();
  return out;
});

export function selectBrief(question: string): IndexChunk[] {
  const q = words(question);
  return briefChunks
    .map(c => ({c, s: [...words(c.section)].filter(w => q.has(w)).length * 2 + [...words(c.text)].filter(w => q.has(w)).length}))
    .filter(x => x.s >= 4)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map(x => x.c);
}
