# LOG

- 2026-10-16: story, look (3 frames) and storyboard (8 panels) approved by the owner. Look fixes before approval: ground read #101014 (kit captured STYLE.paper before the PAL override; set STYLE.paper), meter and motor off-frame, ring overflow, per-world anchor drift (one HERO_AT now).
- Build + review (tools/review.mjs): all 13 cuts on the 120 BPM grid within 1 frame; story arc PASS 4/4 (payoff loudest, p90 −11.9 dBFS; rush has the highest cut rate, 2.67/s; payoff held); anchor PASS (chip measured from the drawing via SPARK_AT, ≥95 % of frames on (1180, 560) ±40 px); text PASS (0 cut off / overlapping); silence 1.0 s ≤ −40 dBFS before the loudest hit at 15.5 s; −14.5 LUFS.
- Open items: dead-beats WARN 16.75–20 s (the role-name reveals and caveat are text-sized, below the whole-frame change threshold); true peak −0.7 dBFS vs −1 target (the composed score normalises in the browser; the site plays the loop muted).
- Review caught and fixed: the hero chip dropped in on a spring at each world start (moved the anchor; removed); the meter label sat under its cable; the payoff ring ran off frame at u 1.3.
- Shipped: public/media/loops/applications-opener.mp4 (1600 px, silent, faststart, 623 KB) + .jpg poster, via MotionLoop at the top of /applications with a visible concept caption.

| shot | world | PASS |
|---|---|---|
| 1–2 | ring → chip alone | yes |
| 3 | motors and drives | yes |
| 4 | vehicles | yes (re-laid out after board review) |
| 5 | metering, mains cut | yes |
| 6–8 | drone wide/close, motor close | yes |
| 9–12 | board rush (16ths) | yes |
| 13 | silence | yes |
| 14 | payoff ring + role names | yes (dead-beat WARN noted) |
