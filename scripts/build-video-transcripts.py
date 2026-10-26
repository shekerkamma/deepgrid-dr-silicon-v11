#!/usr/bin/env python3
"""Timestamped transcripts for the YouTube videos on /resources/videos, from YouTube's own captions.

For every video id in app/resources-data.ts, take the caption track in the language the video is spoken in: one the
uploader added first, then YouTube's automatic captions of the original audio ("<lang>-orig"). Machine translations of
those captions are never used. Write public/transcripts/<id>.json as [[seconds, text], ...] and public/transcripts/
index.json mapping each id that has one to its language code. The page shows these beside the player
(app/video-library.tsx) and names the language when it is not English.

Only real speech reaches the page. English automatic captions need at least 25 words: below
that they are a few misheard sounds. A track in another language needs a second, independent hearing recorded in
CROSS_CHECKED. On 2026-10-26 speech-to-text over the uncaptioned clips returned song lyrics from background music,
invented sentences over digital silence and unrelated chatter, none of which may appear on this site. The page says a
video without a transcript has no narration.

Run from the repo root:  python3 scripts/build-video-transcripts.py   (needs yt-dlp on PATH)
"""
import json, re, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'transcripts'
IDS = re.findall(r"id: '([^']+)'", (ROOT / 'app' / 'resources-data.ts').read_text())

# Tracks outside English that a second, independent hearing agrees with. Checked 2026-10-26 by running Silero VAD and
# faster-whisper `small` locally on each clip's audio and comparing with YouTube's track.
CROSS_CHECKED = {
    # Whisper: 'अभी माँ लोग क्या करते है, बाडी बनाखे, बाडी लाए आखे, अभी चेख ... बस' against YouTube's
    # 'अभी हम लोग क्या करते हैं? बॉडी बना के बॉडी लगा के अभी चेक ... बस हो गया।': the same sentence.
    '75G6kkpDopw': 'hi',
}
# Reviewed and refused, so a later run cannot let them in on word count alone:
#   -iY2KLMsZqw  hi-orig: 48 scattered words in two scripts ('Facebook', Telugu 'హల్లెలూయ'); Silero finds no speech in 654 s.
#   eCAw60kV01Q  te-orig: 8 words; Whisper hears a different language.


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


def pick(info: dict):
    """(language, track) in the language the video is spoken in: uploaded first, then automatic. None if neither."""
    lang = (info.get('language') or 'en').split('-')[0]
    for pool, keys in ((info.get('subtitles') or {}, [lang, f'{lang}-orig']),
                       (info.get('automatic_captions') or {}, [f'{lang}-orig', lang])):
        for k in keys:
            vtt = next((f for f in pool.get(k, []) if f.get('ext') == 'vtt'), None)
            if vtt:
                return lang, vtt['url']
    return None


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    have = {}
    for vid in IDS:
        for attempt in range(3):   # YouTube answers bursts with HTTP 429; wait and ask again
            r = subprocess.run(['yt-dlp', '-J', '--no-warnings', '--', vid], check=False, capture_output=True, text=True)
            if r.returncode == 0 or '429' not in r.stderr:
                break
            time.sleep(20 * (attempt + 1))
        if r.returncode != 0:
            print(f'{vid}: yt-dlp failed: {r.stderr.strip()[-200:]}', file=sys.stderr)
            return 1   # a silent skip here would drop a real transcript from the page
        got = pick(json.loads(r.stdout))
        if not got:
            continue
        lang, src = got
        segs = parse(urllib.request.urlopen(src, timeout=60).read().decode('utf-8'))
        words = sum(len(x[1].split()) for x in segs)
        if CROSS_CHECKED.get(vid) == lang or (lang == 'en' and words >= 25):
            (OUT / f'{vid}.json').write_text(json.dumps(segs, ensure_ascii=False, separators=(',', ':')) + '\n')
            have[vid] = lang
        else:
            (OUT / f'{vid}.json').unlink(missing_ok=True)
        time.sleep(2)
    (OUT / 'index.json').write_text(json.dumps(dict(sorted(have.items())), ensure_ascii=False) + '\n')
    print(f'{len(have)} of {len(IDS)} videos have a transcript in their spoken language -> public/transcripts/')
    return 0


if __name__ == '__main__':
    sys.exit(main())
