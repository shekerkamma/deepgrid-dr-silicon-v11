# Public titles and navigation

Owner direction, 14 October 2026: section titles, component titles and menu labels must describe an engineering function, customer outcome or business decision. Site implementation and data-processing machinery are not the message.

- Name the subject: hardware fault response, motor-control timing, qualification lead times, unit economics, funding milestones.
- Use specific, supported assertions for result headings. Preserve simulation, estimate, target and pre-silicon qualifiers.
- Replace internal labels such as “What the data says”, “3D silicon model”, “build option”, “storyboard” and document-copy housekeeping with the product or investment question they support.
- Use consistent names in primary menus, breadcrumbs, dashboard tabs and footer links. Keep route paths and identifiers stable.
- Retain technical terms where they describe the product: RTL, firmware, data paths, timing closure and electrical specifications are engineering subjects. Retain exact source-document names and citation/download details so evaluation remains traceable.
- Keep functional controls direct: search, download, motion and slide navigation describe actions and should remain usable.

`scripts/audit-titles.mjs` inventories rendered headings, component tabs, summaries, table captions and navigation across the route map and selectable product/dashboard states. It also checks heading and page overflow at desktop and phone widths. The inventory requires editorial review; geometry checks cannot establish whether a message is useful or supported.
