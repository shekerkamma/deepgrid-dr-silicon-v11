"""Build the SKU architecture diagrams, their reading guides and their notes from one spec per part.

Each spec in specs.py describes one SKU's architecture as the SKU Blueprint (October 2026) states it.
Certification wording becomes the page's "designed toward" line.

    python3 scripts/sku-diagrams/build.py            # writes .drawio, guide .md, app/sku-diagram-notes.ts
    then export each .drawio to public/diagrams/<slug>-architecture.svg with the draw.io CLI
    (scripts/sku-diagrams/export.sh), and re-run build.py so the TS picks up the SVG sizes.
"""
import json, math, os, re, sys
from xml.sax.saxutils import quoteattr, escape

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.dirname(__file__))
from specs import SPECS  # noqa: E402
from specs_native import NATIVE  # noqa: E402

PAL = {  # zone fill, stroke
    'teal': ('#E8F6F5', '#0A9396'), 'blue': ('#F4F8FE', '#8DB4D4'), 'cyan': ('#E8F8FC', '#00B4D8'),
    'red': ('#FEF3F2', '#B42318'), 'grey': ('#F5F5F5', '#6B7280'), 'amber': ('#FFFAEB', '#B54708'),
    'purple': ('#F4F3FF', '#6941C6'), 'green': ('#ECFDF3', '#067647'),
}
W, X0, INNER = 1560, 40, 1480
ZGAP, RGAP, HEAD, PAD, BGAP = 20, 28, 34, 12, 10


class Doc:
    def __init__(self):
        self.cells, self.n, self.ids = [], 1, {}

    def nid(self):
        self.n += 1
        return f'c{self.n}'

    def v(self, label, style, x, y, w, h, key=None):
        i = self.nid()
        if key: self.ids[key] = i
        self.cells.append(f'<mxCell id="{i}" value={quoteattr(label)} style="{style}" vertex="1" parent="1">'
                          f'<mxGeometry x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" as="geometry"/></mxCell>')
        return i

    def e(self, a, b, label='', color='#0A1628', extra=''):
        i = self.nid()
        self.cells.append(f'<mxCell id="{i}" value={quoteattr(label)} style="edgeStyle=orthogonalEdgeStyle;rounded=1;html=1;'
                          f'strokeColor={color};strokeWidth=2;fontSize=13;fontStyle=1;fontColor={color};labelBackgroundColor=#FFFFFF;{extra}" '
                          f'edge="1" parent="1" source="{self.ids[a]}" target="{self.ids[b]}"><mxGeometry relative="1" as="geometry"/></mxCell>')


def box(stroke): return f'rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor={stroke};strokeWidth=2;fontSize=12;fontColor=#1E293B;arcSize=6;'
def zone(fill, stroke, dashed=False): return (f'rounded=0;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};verticalAlign=top;align=left;'
                                              f'spacingLeft=10;spacingTop=4;fontSize=14;fontStyle=1;fontColor=#1E293B;{"dashed=1;" if dashed else ""}')
OFF = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#6B7280;dashed=1;fontSize=12;fontColor=#1E293B;arcSize=6;'
TEXT = 'text;html=1;align=left;verticalAlign=middle;whiteSpace=wrap;fontSize={s};fontColor={c};{x}'
BUS = 'rounded=0;whiteSpace=wrap;html=1;fillColor=#0A1628;strokeColor=#0A1628;fontSize=14;fontColor=#FFFFFF;'
ECOL = {'main': '#0A1628', 'teal': '#0A9396', 'cyan': '#00B4D8', 'red': '#B42318', 'blue': '#5B8DB8', 'amber': '#B54708', 'purple': '#6941C6', 'green': '#067647'}


def label(b): return f'<b>{escape(b[1])}</b>' + (f'<br>{escape(b[2])}' if len(b) > 2 and b[2] else '')


def drawio(s):
    d = Doc()
    d.v(escape(s['title']), TEXT.format(s=24, c='#1E293B', x='fontStyle=1;'), X0, 10, 1200, 36)
    d.v(escape(s['subtitle']), TEXT.format(s=13, c='#6B7280', x=''), X0, 44, INNER, 24)
    y = 78
    if s.get('banner'):
        d.v(escape(s['banner']), 'rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFAEB;strokeColor=#B54708;align=left;spacingLeft=12;fontSize=12;fontColor=#1E293B;', X0, y, INNER, 40)
        y += 54
    if s.get('input'):
        d.v(f'<b>{escape(s["input"])}</b>', OFF, X0 + 20, y, 520, 36, key='IN')
        y += 52
    top = y
    y += 40  # frame label
    for row in s['rows']:
        if 'bus' in row:
            d.v(f'<b>{escape(row["bus"])}</b>', BUS, X0 + 20, y, INNER - 40, 38, key=row.get('key', 'BUS'))
            y += 38 + RGAP
            continue
        zones = row['zones']
        tot = sum(z.get('w', 1) for z in zones)
        avail = INNER - 40 - ZGAP * (len(zones) - 1)
        x = X0 + 20
        rh = row['h']
        for z in zones:
            zw = avail * z.get('w', 1) / tot
            fill, stroke = PAL[z['color']]
            d.v(escape(z['name']), zone(fill, stroke, z.get('dashed')), x, y, zw, rh, key=z['key'])
            cols = z.get('cols', 2)
            blocks = z['blocks']
            nrow = math.ceil(sum(((b[3] if len(b) > 3 else 1) if b else 1) for b in blocks) / cols)
            bw = (zw - 2 * PAD - BGAP * (cols - 1)) / cols
            bh = (rh - HEAD - PAD - BGAP * (nrow - 1)) / nrow
            pos = 0
            for b in blocks:
                span = (b[3] if len(b) > 3 else 1) if b else 1
                if pos % cols + span > cols: pos += cols - pos % cols
                r, c = divmod(pos, cols)
                if b:
                    d.v(label(b), box(stroke), x + PAD + c * (bw + BGAP), y + HEAD + r * (bh + BGAP), bw * span + BGAP * (span - 1), bh, key=b[0])
                pos += span
            x += zw + ZGAP
        y += rh + RGAP
    frame_h = y - top - RGAP + 16
    d.cells.insert(2, '')  # placeholder keeps frame behind content
    fid = d.nid()
    d.cells[2] = (f'<mxCell id="{fid}" value={quoteattr(escape(s["frame"]))} style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FBFCFE;strokeColor=#0A1628;'
                  f'strokeWidth=2;dashed=1;verticalAlign=top;align=right;spacingRight=14;spacingTop=6;fontSize=15;fontStyle=1;fontColor=#0A1628;" vertex="1" parent="1">'
                  f'<mxGeometry x="{X0}" y="{top}" width="{INNER}" height="{frame_h}" as="geometry"/></mxCell>')
    y = top + frame_h + 16
    if s.get('output'):
        d.v(f'<b>{escape(s["output"])}</b>', OFF, X0 + INNER - 560, y, 540, 36, key='OUT')
        y += 52
    if s.get('strip'):
        d.v(f'<b>PROTOTYPE</b>  {escape(s["strip"][0])}', OFF, X0, y, 560, 40, key='PROTO')
        d.v(f'<b>PRODUCT</b>  {escape(s["strip"][1])}', box('#0A9396'), X0 + 620, y, INNER - 620, 40, key='PROD')
        d.e('PROTO', 'PROD', '', '#6B7280')
        y += 56
    for ed in s['edges']:
        a, b, lab, col, sty = (list(ed) + ['', 'main', ''])[:5]
        extra = ('dashed=1;strokeWidth=3;' if col == 'red' and lab == 'F' else '') + sty
        d.e(a, b, lab, ECOL[col], extra)
    legend = '<b>Reading path</b>   ' + '   '.join(f'{m}  {escape(t)}' for m, t in s['markers'])
    legend += '   ·   dashed boxes are off-chip   ·   pre-silicon architecture; values are design targets'
    d.v(legend, TEXT.format(s=12, c='#1E293B', x=''), X0, y, INNER, 58)
    y += 70
    toward = 'Designed toward (targets, not certificates): ' + ', '.join(s['toward'])
    d.v(escape(toward), TEXT.format(s=12, c='#6B7280', x='fontStyle=2;'), X0, y, INNER, 22)
    y += 34
    body = ''.join(c for c in d.cells if c)
    return (f'<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="drawio" version="26.0.0"><diagram name="{escape(s["code"])} architecture">'
            f'<mxGraphModel dx="{W}" dy="{y:.0f}" grid="1" gridSize="10" page="1" pageWidth="{W}" pageHeight="{y:.0f}" background="#FFFFFF">'
            f'<root><mxCell id="0"/><mxCell id="1" parent="0"/>{body}</root></mxGraphModel></diagram></mxfile>\n')


def zones_of(s):
    return [z for r in s['rows'] if 'zones' in r for z in r['zones']]


def guide(s):
    out = [f'# {s["code"]}: Architecture Guide', '',
           f'Deepgrid Semi · {s["name"]} · reading guide to the {s["code"]} system architecture diagram · October 2026', '',
           f'> Architecture scope, pre-silicon. Every value is a design target from the SKU Blueprint, October 2026, '
           f'not a measurement. Standards appear only as targets the design is '
           f'developed toward; no certificate exists for any DeepGrid part.', '',
           f'## What is {s["code"]}?', '', s['about'], '', '---', '', '## Architecture Overview', '']
    for i, z in enumerate(zones_of(s), 1):
        out.append(f'{i}. **{z["name"]}**: {z["what"]}')
    for z in zones_of(s):
        out += ['', f'## Component: {z["name"]}', '', f'What it does: {z["what"]}']
        if z.get('why'): out += ['', f'Why it exists: {z["why"]}']
        out.append('')
        for b in [b for b in z['blocks'] if b]:
            out.append(f'- **{b[1]}**' + (f': {b[2]}' if len(b) > 2 and b[2] else ''))
    out += ['', '---', '', '## Key Data Flows', '']
    for m, t in s['markers']:
        out.append(f'- {m} {t}')
    out += ['', '## Designed toward', '', 'Targets the design is developed toward, not certificates held:', '']
    out += [f'- {t}' for t in s['toward']]
    return '\n'.join(out).replace('—', ':') + '\n'


def ts(all_specs, sizes):
    def j(v): return json.dumps(v, ensure_ascii=False)
    lines = ['// GENERATED by scripts/sku-diagrams/build.py from specs.py. Edit the spec, not this file.',
             "import {readHref} from './doc-links';", "import {url} from './routes';",
             "import type {DiagramNotes, ProductDiagram, NativeDiagramData} from './diagram-notes';", '',
             "const BLUEPRINT = url('/downloads/docs/deepgrid-sku-blueprint-oct2026.pdf');", '',
             'export const skuDiagrams: Record<string, ProductDiagram> = {']
    for s in all_specs:
        g = f'/downloads/{s["slug"]}-architecture-guide.md'
        w, h = sizes.get(s['slug'], (1560, 1000))
        zones = [{'name': z['name'], 'what': z['what'], **({'why': z['why']} if z.get('why') else {}), 'section': f'Component: {z["name"]}'} for z in zones_of(s)]
        notes = (f'{{guide: {j(g)}, zones: {j(zones)}, markers: {j([{"mark": m, "text": t} for m, t in s["markers"]])}, '
                 f'primary: [{{title: {j(s["code"] + " architecture guide")}, note: "Every block group, the data flows and the design targets.", href: readHref({j(g)}), meta: "Opens in the site"}}, '
                 f'{{title: "SKU Blueprint, October 2026", note: {j(s["code"] + ": what it replaces, who uses it, its status and its architecture diagram.")}, href: BLUEPRINT, meta: "PDF · 46 pages"}}], '
                 f'background: {j(s["background"])}}} satisfies DiagramNotes')
        note = s.get('note', '')
        lines.append(f'  {s["id"]}: {{notes: {notes}, src: {j("/diagrams/" + s["slug"] + "-architecture.svg")}, title: {j(s["code"] + " system architecture")}, '
                     f'width: {w}, height: {h}, drawio: {j("/downloads/" + s["slug"] + "-architecture.drawio")}, guide: {j(g)}, alt: {j(s["alt"])}, '
                     f'caption: {j(s["caption"])}' + (f', note: {j(note)}' if note else '') + '},')
    lines.append('};')
    lines += ['', '/** Native diagram data for every part, rendered in the site\'s own design (detail.tsx NativeDiagram). */',
              'export const nativeDiagrams: Record<string, NativeDiagramData> = {']
    for s in list(all_specs) + NATIVE:
        lines.append(f'  {j(s["id"])}: {j(native(s))},')
    lines.append('};')
    return '\n'.join(lines) + '\n'


MARK_RE = re.compile(r'^[①-⑳F]$')


def native(s):
    """The data the site's native diagram renders: rows of zones of blocks, with numbered markers on blocks."""
    blocks = {b[0]: b for z in zones_of(s) for b in z['blocks'] if b}
    zone_first = {z['key']: next(b[0] for b in z['blocks'] if b) for z in zones_of(s)}
    marks = {k: list(v) for k, v in s.get('marks', {}).items()}
    if 'marks' not in s:
        for ed in s.get('edges', []):
            a, b, lab = (list(ed) + [''])[:3]
            if not MARK_RE.match(lab or ''):
                continue
            at = b if b in blocks else zone_first.get(b) or (a if a in blocks else zone_first.get(a))
            if at:
                marks.setdefault(at, []).append(lab)
    rows = []
    for r in s['rows']:
        if 'bus' in r:
            rows.append({'bus': r['bus'], 'k': r.get('key', 'BUS')})
            continue
        zs = []
        for z in r['zones']:
            t = z.get('tone')  # teal is the safe state only (DESIGN.md); set it explicitly, never from a drawing colour
            zd = {'k': z['key'], 'name': z['name'], 'cols': z.get('cols', 2), 'w': z.get('w', 1), 'blocks': []}
            if t: zd['tone'] = t
            if z.get('mcols'): zd['mcols'] = z['mcols']
            if z.get('note'): zd['note'] = z['note']
            for b in z['blocks']:
                if not b:
                    zd['blocks'].append(None); continue
                bd = {'k': b[0], 't': b[1]}
                if len(b) > 2 and b[2]: bd['s'] = b[2]
                if len(b) > 3 and b[3] > 1: bd['span'] = b[3]
                if b[0] in marks: bd['marks'] = marks[b[0]]
                zd['blocks'].append(bd)
            zs.append(zd)
        rows.append({'zones': zs})
    # Connections for the interactive layer: (from, to, marker, what flows). Endpoints are block or zone keys,
    # or IN / OUT / a bus key. SKU specs carry no data label, so the marker's reading-path text stands in.
    mtext = dict(s.get('markers', []))
    edges = []
    for ed in s.get('edges', []):
        a, b, lab, *rest = list(ed) + ['', '']
        what = rest[0] if rest and isinstance(rest[0], str) and rest[0] and not rest[0] in ECOL else ''
        if not what and lab in mtext: what = mtext[lab]
        edges.append({'a': a, 'b': b, **({'m': lab} if MARK_RE.match(lab or '') else {}), **({'d': what} if what else {})})
    out = {'frame': s['frame'], 'rows': rows, 'edges': edges}
    for k in ('input', 'output', 'banner'):
        if s.get(k): out[k] = s[k]
    if s.get('strip'): out['strip'] = list(s['strip'])
    return out


def svg_size(slug):
    p = os.path.join(ROOT, 'public/diagrams', f'{slug}-architecture.svg')
    if not os.path.exists(p): return None
    head = open(p, encoding='utf-8').read(2000)
    m = re.search(r'width="(\d+)px" height="(\d+)px"', head)
    return (int(m.group(1)), int(m.group(2))) if m else None


if __name__ == '__main__':
    sizes = {}
    for s in SPECS:
        keys = {b[0] for z in zones_of(s) for b in z['blocks'] if b} | {z['key'] for z in zones_of(s)} | {'IN', 'OUT', 'BUS'} | {r.get('key') for r in s['rows'] if 'bus' in r}
        bad = [e for e in s['edges'] if e[0] not in keys or e[1] not in keys]
        assert not bad, (s['id'], bad)
        open(os.path.join(ROOT, 'public/downloads', f'{s["slug"]}-architecture.drawio'), 'w').write(drawio(s))
        open(os.path.join(ROOT, 'public/downloads', f'{s["slug"]}-architecture-guide.md'), 'w').write(guide(s))
        if svg_size(s['slug']): sizes[s['slug']] = svg_size(s['slug'])
    open(os.path.join(ROOT, 'app/sku-diagram-notes.ts'), 'w').write(ts(SPECS, sizes))
    print(f'{len(SPECS)} specs; SVG sizes known for {len(sizes)}')
