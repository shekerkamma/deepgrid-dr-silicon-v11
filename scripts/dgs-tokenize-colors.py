"""One-time codemod (2026-10-10, deepgridsemi.com look): replace hard-coded colour literals in the site
stylesheets with role tokens (--t-*), so a band (light page / dark stage) decides the colour, not the rule.
Renderer material stylesheets (portfolio-workbench.css, die-stage.css) are excluded: they stay dark stages.
Custom-property definitions are left alone; app/theme-dgs.css redefines them. Writes docs/v11/dgs-tokenize-map.tsv."""
import re, sys, colorsys, collections
FILES = ['app/dr.css','app/globals.css','app/ux.css','app/portfolio-v6.css','app/v3.css','app/product-page.css',
         'app/route-journey.css','app/executive-story.css','app/company-pages.css','app/applications-portfolio.css',
         'app/contact.css','app/site-refinement.css','app/story.css','app/visual-refinement.css','app/products-story.css',
         'app/related.css','app/company.css','app/evidence-clip.css','app/doc-reader.css','app/overview.css',
         'app/semiconductor-v5.css','app/product-tiles.css','app/home-refined.css','app/modern-v11.css']
HEX = re.compile(r'#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b')
def parse(h):
    if len(h) in (3, 4): h = ''.join(c*2 for c in h)
    r, g, b = (int(h[i:i+2], 16)/255 for i in (0, 2, 4)); a = int(h[6:8], 16)/255 if len(h) == 8 else 1
    return r, g, b, a
def lum(r, g, b):
    f = lambda c: c/12.92 if c <= .04045 else ((c+.055)/1.055)**2.4
    return .2126*f(r)+.7152*f(g)+.0722*f(b)
def role(kind, r, g, b):
    h, l, s = colorsys.rgb_to_hls(r, g, b); hue = h*360; L = lum(r, g, b)
    if s > .55 and 140 <= hue <= 175 and l > .3: return 'ok' if hue < 160 else 'safe'
    if s > .35 and 165 <= hue <= 200: return 'safe'
    if s > .3 and (hue < 22 or hue > 340) and l > .45: return 'danger'
    if s > .3 and 22 <= hue <= 46 and .3 < l < .9: return 'accent'
    if s > .45 and 195 <= hue <= 260: return 'accent'  # stray blues become the accent
    if kind == 'c':
        if L > .45: return 'fg'
        if L > .12: return 'fg-2'
        return 'on-accent'
    if kind == 'bg':
        if L < .006: return 'bg'
        if L < .014: return 'surface'
        if L < .05: return 'surface-2'
        if L > .7: return 'plate'
        return 'muted'
    if kind == 'bd':
        if L > .5: return 'fg'
        if L < .05: return 'line'
        return 'border'
    return None
def repl(kind, m, log):
    r, g, b, a = parse(m.group(1)); t = role(kind, r, g, b)
    if t is None: return m.group(0)
    log[(m.group(0).lower(), kind)] = t
    v = f'var(--t-{t})'
    return v if a > .985 else f'color-mix(in srgb,{v} {round(a*100)}%,transparent)'
log = {}; changed = collections.Counter()
for f in FILES:
    src = open(f, encoding='utf8', newline='').read()
    def decl(m):
        prop, val = m.group(1), m.group(2)
        if prop.startswith('--'): return m.group(0)
        kind = 'bg' if prop.startswith('background') else 'bd' if prop.startswith(('border', 'outline', 'column-rule', 'text-decoration')) \
            else 'c' if prop in ('color', 'caret-color', 'fill', 'stroke', '-webkit-text-fill-color', 'accent-color') else None
        if prop in ('box-shadow', 'text-shadow', 'filter'): return m.group(0)  # shadows stay black-alpha
        if prop == 'scrollbar-color': kind = 'bd'
        if kind is None: return m.group(0)
        new = HEX.sub(lambda mm: repl(kind, mm, log), val)
        if new == val: return m.group(0)
        changed[f] += 1
        return m.group(0)[:m.start(2)-m.start(0)] + new
    out = re.sub(r'(?<![\w-])([a-z-]+)\s*:\s*([^;{}]*)', lambda m: (lambda r: m.group(0) if r is None else r)(decl(m)), src)
    # keep original spacing where nothing changed
    if out != src: open(f, 'w', encoding='utf8', newline='').write(out)
with open('docs/v11/dgs-tokenize-map.tsv', 'w') as fh:
    for (h, k), t in sorted(log.items()): fh.write(f'{h}\t{k}\t--t-{t}\n')
print(dict(changed), len(log), 'literal/kind pairs mapped')
