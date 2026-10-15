# Product-led navigation and purposeful motion

Review date: 15 October 2026.

The owner requested a sitewide UI review, product/business-facing labels, an order that does not start with Investors, and use of the Watch and Animate skills. Investors and strategic partners still need an obvious discussion/data-room path. This refinement preserves all 40 routes, complete dashboards, engineering demonstrations, source documents and pre-silicon boundaries.

## Decisions

- Navigation: Products, Applications, Technology, Resources, Company, Investors. Phone navigation uses the same order and a stable Menu label. Evidence is under Technology; the financial dashboards are under Investors.
- Home: product-purpose hero, product/application/engineering paths, searchable portfolio, technical proof and demonstrations, evidence, funding, one discussion close. The fault demonstration remains interactive without a 4.5-screen pinned sequence.
- Products and Resources: selection precedes supporting concept imagery. Their compact introductions use two columns on desktop and stack on phones.
- Technical pages: hero backgrounds stop at their own top edge, keeping local Technology links visible. Product pages retain their own closing evaluation rather than adding a second generic close. Related references remain reachable; redundant global investor invitations are removed from these routes.
- Labels: shortened overview headings, business-facing menu names and “Signal path” rather than “Storyboard.” The document library no longer calls Ask DeepGrid “Vector Q&A.”
- Motion: 180 ms diagram/slide transitions and 160 ms link feedback, with stable frames, readable content from the start and reduced-motion overrides. No autoplay or standalone film was added.

## Review basis

The existing 40-route / 75-state heading inventory was reviewed alongside independent visual and detector assessments. The detector's token advisories were distinguished from visible defects; they did not justify a wholesale theme replacement. Existing DeepGrid images and provenance remain unchanged.

[The supplied video](https://www.youtube.com/watch?v=20VU4FQnF-M) was analyzed by Gemini Pro through the Watch workflow. Its observations informed hierarchy, contrast, consistent component styling, feedback and spacing. Navigation strategy comes from the owner's instruction and site review; the video does not establish that strategy. Animate's framing and transition principles were applied to web interactions; its separate film production/export pipeline was not invoked.

## Validation

The release suite covers route delivery, reading, Ask, pointer/keyboard/phone navigation, layout and title fit, product interactions, financial dashboards, use cases, investor/contact journeys, engineering visuals and branded imagery/accessibility. `verify-navigation-design.mjs` adds explicit checks for menu order, selection before imagery, uncovered Technology tabs and reduced-motion behavior at 1440, 1100 and 390 pixels. It runs before and after GitHub Pages deployment.

Detailed logs, screenshots, reviewer findings and confirmation results are retained in the parent workspace run `runs/2026-10-15-deepgrid-site-review`. Published, deployed and live-verified states are recorded separately at release time.
