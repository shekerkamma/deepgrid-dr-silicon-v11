#!/usr/bin/env python3
import json, re, math
from pathlib import Path
import fitz


def pack(text, limit=1800):
    """Split a page into passages of at most `limit` characters without losing any of it: break at sentence ends, and
    split a longer sentence at a space, never inside a word or a figure. Pages used to be cut at 1,800 characters and
    the rest dropped. Same packer as the showcase's build-unified-graphrag.py."""
    text = re.sub(r'\s+', ' ', text).strip()
    parts, cur = [], ''
    for seg in re.split(r'(?<=[.!?])\s+(?=[A-Z0-9(₹$|])', text):
        while len(seg) > limit:
            cut = seg.rfind(' ', 0, limit)
            cut = cut if cut > limit // 2 else limit
            if cur:
                parts.append(cur)
                cur = ''
            parts.append(seg[:cut].strip())
            seg = seg[cut:].strip()
        if cur and len(cur) + 1 + len(seg) > limit:
            parts.append(cur)
            cur = seg
        else:
            cur = f'{cur} {seg}'.strip()
    if cur:
        parts.append(cur)
    return parts

# aliases too common to identify an entity on their own
GENERIC = {'chip', 'chips', 'status', 'policy', 'market', 'buyers', 'process', 'node', 'prototype', 'product', 'sku', 'skus',
           'design', 'board', 'boards', 'revenue', 'plan', 'cost', 'price', 'india', 'defence', 'safety', 'security'}


def blueprint_passages(pdf, meta):
    """The Blueprint as passages: one per section of each handout (What it is, What it replaces, ... Status) and
    one per portfolio section, read from the in-site markdown so tables and headings survive. Each passage keeps
    the part it belongs to in its section label and the PDF page it starts on ([pdf p.N] marks where page N
    begins). Diagram placeholders carry no text and are skipped."""
    md = (ROOT / 'public/downloads/docs' / pdf.name.replace('.pdf', '.md')).read_text(encoding='utf-8')
    out, page, part, head, buf, start = [], 1, None, None, [], 1

    def flush():
        body = re.sub(r'\[pdf p\.\d+\]', ' ', '\n'.join(buf))
        body = re.sub(r'[*#>_]', '', body)
        body = re.sub(r'\|[-| ]+\|', ' ', body)
        body = re.sub(r'\s*\|\s*', ' | ', body)
        body = re.sub(r'\s+', ' ', body).strip(' |')
        if head and len(body) > 40 and 'architecture diagram on page' not in body.lower():
            label = f"{part} · {head}" if part and head != part else head
            for n, piece in enumerate(pack(body, 900), 1):
                slug = re.sub(r'[^a-z0-9]+', '-', label.lower()).strip('-')[:60]
                out.append({'id': f"bp_{slug}" + (f"_{n}" if n > 1 else ''), 'docTitle': meta['title'], 'docNum': meta['docNum'],
                            'pdfPath': f"./downloads/docs/{pdf.name}", 'pdfSize': meta['size'], 'specPath': meta['spec'],
                            'pageLabel': f"p. {start}", 'section': label, 'text': piece})

    for line in md.splitlines():
        mk = re.match(r'\s*\[pdf p\.(\d+)\]\s*$', line)
        if mk:
            page = int(mk.group(1))
            buf.append(line)
            continue
        h = re.match(r'#{1,6}\s+\**(.+?)\**\s*$', line)
        if h:
            flush()
            title = h.group(1).strip()
            if re.match(r'(SKU-\d+|Track B) · ', title) and not title.endswith('architecture diagram'):
                part = title
            elif title.endswith('architecture diagram'):
                part = None
            buf, head, start = [], title, page
            continue
        buf.append(line)
    flush()
    return out


# repo root, so the script runs from any checkout and any working directory
ROOT = Path(__file__).resolve().parent.parent

def main():
    # 1. Load the graphify knowledge graph. Only nodes extracted from the source documents are knowledge;
    #    graphify also maps this repository's code (package.json, UI components), which says nothing about
    #    silicon and used to crowd the graph, so those nodes are left out.
    with open(ROOT / 'graphify-out/graph.json') as f:
        graphify = json.load(f)

    DOCS = 'public/downloads/docs/'
    nodes = {}
    for n in graphify['nodes']:
        nid = n['id']
        src_file = n.get('source_file', '') or ''
        if not src_file.startswith(DOCS):
            continue
        label = n.get('label', nid)
        facts = [n.get(k) for k in ('replaces', 'rationale', 'buyers', 'target_market', 'policy_driver', 'fpga_vs_chip') if n.get(k)]
        page = re.search(r'p\.?\s*(\d+)', n.get('source_location') or '')
        nodes[nid] = {
            'id': nid,
            'name': label,
            'shortName': n.get('sku_code') or label[:30],
            'category': 'sku' if n.get('sku_code') else n.get('file_type', 'concept'),
            'communityId': n.get('community', 0),
            'communityName': n.get('community_name', 'SKU Blueprint'),
            'description': (label + '. ' + ' '.join(facts)).strip() if facts else label,
            'origin': 'blueprint' if 'blueprint' in src_file else 'document',
            'aliases': [x for x in {label, n.get('sku_code') or ''} if x],
            'page': int(page.group(1)) if page else None,
        }

    edges = []
    for l in graphify['links']:
        if l['source'] not in nodes or l['target'] not in nodes:
            continue
        edges.append({
            'from': l['source'],
            'to': l['target'],
            'label': l.get('relation', 'relates_to'),
            'confidence': l.get('confidence', 'EXTRACTED'),
            'weight': round(float(l.get('confidence_score', 1.0)), 2),
        })

    print(f"Graphify base: {len(nodes)} nodes, {len(edges)} edges")

    # 2. Extract domain items from deepgrid-knowledge.ts
    ts_code = (ROOT / 'app/data/deepgrid-knowledge.ts').read_text(encoding='utf-8')
    catalog_blocks = re.findall(
        r"\{\s*id:\s*['\"]([^'\"]+)['\"],\s*name:\s*['\"]([^'\"]+)['\"],.*?tagline:\s*['\"]([^'\"]+)['\"].*?summary:\s*['\"]([^'\"]+)['\"].*?citation:\s*['\"]([^'\"]+)['\"]",
        ts_code,
        re.DOTALL
    )
    print(f"Found {len(catalog_blocks)} catalog items in deepgrid-knowledge.ts")

    domain_communities = {
        'sku': (20, 'SKU Portfolio: eleven SKUs and D100'),
        'ai': (21, '30 Industrial Edge AI Use Cases & Scalar DSP'),
        'strategy': (22, 'Sovereign Dual-Foundry & Mature-Node Economics'),
        'architecture': (23, 'Deterministic Motor Control & Lockstep Safety RTL'),
        'defense': (24, 'Statutory Defence Moats & DAP-2020 Make-II'),
        'finance': (25, 'Seed Capital, Financial Model & Charlie Munger Audits')
    }

    for item_id, name, tagline, summary, citation in catalog_blocks:
        cat = 'architecture'
        if 'sku' in item_id or 'd100' in item_id: cat = 'sku'
        elif 'ai' in item_id or 'usecases' in item_id or 'dsp' in item_id or 'tree' in item_id: cat = 'ai'
        elif 'dap' in item_id or 'boxes' in item_id or 'pil' in item_id: cat = 'defense'
        elif 'fund' in item_id or 'munger' in item_id or 'crash' in item_id or 'price' in item_id: cat = 'finance'
        elif 'three-factory' in item_id or 'import' in item_id or 'loop' in item_id: cat = 'strategy'
        
        cid, cname = domain_communities.get(cat, (23, 'Deterministic Motor Control & Lockstep Safety RTL'))
        nodes[item_id] = {
            'id': item_id,
            'name': name,
            'shortName': name[:30],
            'category': cat,
            'communityId': cid,
            'communityName': cname,
            'description': f"{tagline}. {summary}",
            'citation': citation,
            'origin': 'domain_knowledge',
            'aliases': [x for x in {name, item_id.upper() if re.match(r'sku-\d+$', item_id) else ''} if x],
        }

    edge_matches = re.findall(
        r"\{\s*from:\s*['\"]([^'\"]+)['\"],\s*to:\s*['\"]([^'\"]+)['\"],\s*label:\s*['\"]([^'\"]+)['\"]",
        ts_code
    )
    print(f"Found {len(edge_matches)} domain edges in deepgrid-knowledge.ts")
    for src, dst, lbl in edge_matches:
        if src in nodes and dst in nodes:
            edges.append({'from': src, 'to': dst, 'label': lbl, 'confidence': 'CURATED', 'weight': 1.0})

    # Bridge the curated catalog and the Blueprint graph: SKU-N in one is SKU-N in the other.
    bp_by_code = {n['shortName']: nid for nid, n in nodes.items() if n['origin'] == 'blueprint' and re.match(r'SKU-\d+$', n['shortName'])}
    for nid, n in list(nodes.items()):
        m = re.match(r'sku-(\d+)$', nid)
        if m and n['origin'] == 'domain_knowledge' and f'SKU-{m.group(1)}' in bp_by_code:
            edges.append({'from': nid, 'to': bp_by_code[f'SKU-{m.group(1)}'], 'label': 'same_as', 'confidence': 'EXTRACTED', 'weight': 1.0})
    d100 = next((nid for nid, n in nodes.items() if n['origin'] == 'blueprint' and 'D100' in n['name']), None)
    if d100 and 'track-b-d100' in nodes:
        edges.append({'from': 'track-b-d100', 'to': d100, 'label': 'same_as', 'confidence': 'EXTRACTED', 'weight': 1.0})

    print(f"Total Unified Graph: {len(nodes)} nodes, {len(edges)} edges")

    # 3. Load all 177 PDF Pages from the 8 whitepapers
    pdf_dir = (ROOT / 'public/downloads/docs')
    # The SKU Blueprint (October 2026) is the portfolio source of record; the superseded technical annex is not indexed.
    pdfs = sorted(p for p in pdf_dir.glob('*.pdf') if 'technical-annex' not in p.name)
    pdf_meta = {
        'deepgrid-mature-node-silicon-master-whitepaper-v3.pdf': {'title': 'Master Whitepaper v3 (Mature-Node Silicon)', 'docNum': '05', 'size': '5.4 MB', 'spec': './downloads/docs/deepgrid-mature-silicon-architecture.md'},
        'deepgrid-sku-blueprint-oct2026.pdf': {'title': 'SKU Blueprint, October 2026 (11 SKUs + D100)', 'docNum': '07', 'size': '3.6 MB', 'spec': './downloads/docs/deepgrid-sku-blueprint-oct2026.md'},
        'deepgrid-dg32-ai-30-use-cases.pdf': {'title': 'Thirty Use Cases, No Accelerator', 'docNum': '01', 'size': '414 KB', 'spec': './downloads/docs/deepgrid-dg32-ai-architecture.md'},
        'deepgrid-dshot-rx-block-spec.pdf': {'title': 'Hardware DShot RX Specification', 'docNum': '03', 'size': '345 KB', 'spec': './downloads/docs/deepgrid-dshot-rx-architecture.md'},
        'deepgrid-dg32-2dom-system-architecture.pdf': {'title': 'DG32-2DOM System Architecture', 'docNum': '04', 'size': '77 KB', 'spec': './downloads/docs/deepgrid-2dom-architecture.md'},
        'deepgrid-datasheets-qfn64.pdf': {'title': 'DG32 QFN-64 Engineering Datasheet', 'docNum': '06', 'size': '76 KB', 'spec': './downloads/docs/deepgrid-datasheets-engineering-spec.md'},
        'deepgrid-dg32-2dom-preliminary-datasheet.pdf': {'title': 'DG32-2DOM Preliminary Datasheet', 'docNum': '04', 'size': '40 KB', 'spec': './downloads/docs/deepgrid-2dom-architecture.md'},
        'deepgrid-dg32-lite-preliminary-datasheet.pdf': {'title': 'DG32-LITE Preliminary Datasheet', 'docNum': '06', 'size': '38 KB', 'spec': './downloads/docs/deepgrid-datasheets-engineering-spec.md'}
    }

    corpus_chunks = []
    for p in pdfs:
        meta = pdf_meta.get(p.name, {'title': p.stem, 'docNum': '05', 'size': '1.0 MB', 'spec': './downloads/docs/deepgrid-mature-silicon-architecture.md'})
        if p.name == 'deepgrid-sku-blueprint-oct2026.pdf':
            corpus_chunks += blueprint_passages(p, meta)
            continue
        doc = fitz.open(p)
        for page_idx in range(len(doc)):
            text = doc[page_idx].get_text().strip()
            if len(text) < 60: continue
            # contents pages (dot leaders to page numbers) list headings, they answer nothing
            if len(re.findall(r'(?:\. ){4,}', text)) >= 3: continue
            lines = [l.strip() for l in text.splitlines() if len(l.strip()) > 3]
            section = f"Page {page_idx+1}"
            for l in lines[:5]:
                if re.match(r"^[0-9]+(\.[0-9]+)*\s+[A-Z]", l) or "Section" in l or "Specification" in l:
                    section = re.sub(r'(?:\s*\.){3,}.*$', '', l).strip()
                    break
            # passages of about one paragraph, so a citation points at the sentence that answers, not a page
            for n, part in enumerate(pack(text, 900), 1):
                corpus_chunks.append({
                    'id': f"pdf_{p.stem}_p{page_idx+1}" + (f"_{n}" if n > 1 else ''),
                    'docTitle': meta['title'],
                    'docNum': meta['docNum'],
                    'pdfPath': f"./downloads/docs/{p.name}",
                    'pdfSize': meta['size'],
                    'specPath': meta['spec'],
                    'pageLabel': f"p. {page_idx+1}",
                    'section': section,
                    'text': part
                })

    print(f"Total PDF chunks: {len(corpus_chunks)}")

    # 3b. Link every passage to the entities it names. This is what lets the graph choose evidence: a
    #     passage is reachable from an entity when it mentions that entity, and an entity is reachable from
    #     the question through the typed, confidence-weighted edges above.
    node_ids = list(nodes.keys())
    patterns = []
    for idx, nid in enumerate(node_ids):
        for alias in nodes[nid].get('aliases', []):
            alias = alias.strip()
            if len(alias) < 3 or alias.lower() in GENERIC:
                continue
            m = re.match(r'(?i)SKU-(\d+)$', alias)
            rx = rf'\bSKU-{m.group(1)}(?!\d)' if m else r'(?<![A-Za-z0-9])' + re.escape(alias) + r'(?![A-Za-z0-9])'
            patterns.append((idx, re.compile(rx, re.I)))
    for c in corpus_chunks:
        hay = f"{c['section']} {c['text']}"
        c['entities'] = sorted({idx for idx, rx in patterns if rx.search(hay)})
    linked = sum(1 for c in corpus_chunks if c['entities'])
    print(f"Entity links: {sum(len(c['entities']) for c in corpus_chunks)} across {linked}/{len(corpus_chunks)} passages")

    # 4. Build Global Vocabulary across all Nodes + all PDF Chunks
    all_texts = []
    for nid, n in nodes.items():
        all_texts.append(f"{n['name']} {n['communityName']} {n['description']}")
    for c in corpus_chunks:
        all_texts.append(f"{c['docTitle']} {c['section']} {c['text']}")

    vocab = set()
    for t in all_texts:
        for w in re.findall(r"[a-z0-9_]+", t.lower()):
            if len(w) > 2:
                vocab.add(w)

    vocab = sorted(list(vocab))
    vocab_idx = {w: i for i, w in enumerate(vocab)}
    DIM = len(vocab)
    print(f"Unified vocabulary dimension: {DIM}")

    # Compute IDF
    idf = [0.0] * DIM
    for t in all_texts:
        seen_w = set(re.findall(r"[a-z0-9_]+", t.lower()))
        for w in seen_w:
            if w in vocab_idx:
                idf[vocab_idx[w]] += 1.0

    total_docs = len(all_texts)
    idf = [math.log((total_docs + 1.0) / (cnt + 1.0)) + 1.0 for cnt in idf]

    # Vectorize Nodes
    def vectorize_text(text):
        words = re.findall(r"[a-z0-9_]+", text.lower())
        vec = {}
        for w in words:
            if w in vocab_idx:
                idx = vocab_idx[w]
                vec[idx] = vec.get(idx, 0.0) + 1.0
        norm_sq = 0.0
        for idx, count in vec.items():
            w_val = count * idf[idx]
            vec[idx] = w_val
            norm_sq += w_val * w_val
        norm = math.sqrt(norm_sq)
        if norm > 0:
            return {str(idx): round(val / norm, 4) for idx, val in vec.items()}
        return {}

    node_list = []
    for nid, n in nodes.items():
        v = vectorize_text(f"{n['name']} {n['communityName']} {n['description']}")
        n_copy = dict(n)
        n_copy['vector'] = v
        node_list.append(n_copy)

    # Vectorize Corpus Chunks
    for c in corpus_chunks:
        c['vector'] = vectorize_text(f"{c['docTitle']} {c['section']} {c['text']}")

    unified_index = {
        'nodes': node_list,
        'edges': edges,
        'chunks': corpus_chunks,
        'vocab': vocab,
        'idf': [round(x, 4) for x in idf]
    }

    out_file = (ROOT / 'app/data/graphrag-unified-index.json')
    out_file.write_text(json.dumps(unified_index), encoding='utf-8')
    print(f"Wrote unified GraphRAG index to {out_file} ({round(len(out_file.read_bytes())/1024, 1)} KB)")

if __name__ == '__main__':
    main()
