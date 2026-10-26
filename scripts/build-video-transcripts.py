#!/usr/bin/env python3
"""Timestamped transcripts for the YouTube videos on /resources/videos, from YouTube's own captions.

For every video id in app/resources-data.ts, ask yt-dlp for English captions (uploaded first, then automatic) and
write public/transcripts/<id>.json as [[seconds, text], ...], plus public/transcripts/index.json listing the ids that
have one. The page shows these beside the player (app/video-library.tsx).

Only captions YouTube already holds are used. Videos without them get no transcript, on purpose: on 2026-10-26
speech-to-text over the uncaptioned clips returned song lyrics from background music, invented sentences over digital
silence and unrelated chatter, none of which may appear on this site. The page says such a video has no narration.

Run from the repo root:  python3 scripts/build-video-transcripts.py   (needs yt-dlp on PATH)
"""
import json, re, subprocess, sys, tempfile, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'transcripts'
IDS = re.findall(r"id: '([^']+)'", (ROOT / 'app' / 'resources-data.ts').read_text())


def secs(stamp: str) -> float:
    h, m, s = stamp.split(':') if stamp.count(':') == 2 else ('0', *stamp.split(':'))
    return int(h) * 3600 + int(m) * 60 + float(s)


def parse(vtt: str) -> list:
    """Cues to [[t, text]]: tags stripped, the lines automatic captions repeat as they roll dropped, then joined into
    segments of about a sentence so the transcript reads as text, each at the time its first line was spoken."""
    lines, recent = [], []
    for block in re.split(r'\n\s*\n', vtt):
        m = re.search(r'(\d[\d:.]+) --> ', block)
        if not m:
            continue
        t = secs(m.group(1))
        for raw in block.split('\n')[1:]:
            text = re.sub(r'<[^>]+>', '', raw).replace('&nbsp;', ' ').strip()
            if not text or '-->' in text or text in recent:
                continue
            recent = (recent + [text])[-4:]
            lines.append([round(t, 1), text])
    segs = []
    for t, text in lines:
        if segs and len(segs[-1][1]) < 140 and not re.search(r'[.?!]$', segs[-1][1]):
            segs[-1][1] += ' ' + text
        else:
            segs.append([t, text])
    return segs


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    have = []
    with tempfile.TemporaryDirectory() as tmp:
        for vid in IDS:
            files = [Path(tmp) / f'{vid}.en.vtt', Path(tmp) / f'{vid}.en-orig.vtt']
            for attempt in range(3):   # YouTube answers bursts with HTTP 429; wait and ask again
                r = subprocess.run(['yt-dlp', '--skip-download', '--write-subs', '--write-auto-subs', '--sub-langs',
                                    'en,en-orig', '--sub-format', 'vtt', '--sleep-subtitles', '2', '--no-warnings', '-q',
                                    '-o', f'{tmp}/%(id)s.%(ext)s', '--', vid], check=False, capture_output=True, text=True)
                if any(f.exists() for f in files) or '429' not in r.stderr:
                    break
                time.sleep(20 * (attempt + 1))
            src = next((f for f in files if f.exists()), None)
            if not src:
                continue
            segs = parse(src.read_text(encoding='utf-8'))
            # Automatic captions of a clip with no narration are a few misheard words (the 10:55 D-Drive follow-me
            # run yields only 'Divider did it seem'); under 25 words is noise, not a transcript.
            if sum(len(x[1].split()) for x in segs) >= 25:
                (OUT / f'{vid}.json').write_text(json.dumps(segs, ensure_ascii=False, separators=(',', ':')) + '\n')
                have.append(vid)
    (OUT / 'index.json').write_text(json.dumps(sorted(have)) + '\n')
    print(f'{len(have)} of {len(IDS)} videos have YouTube captions -> public/transcripts/')
    return 0


if __name__ == '__main__':
    sys.exit(main())
