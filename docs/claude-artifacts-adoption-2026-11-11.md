# Claude Whiteboards, Sheets and Data: what v11 takes from them

Checked 2026-11-11 against Brock Mesarich, "Anthropic Just Dropped Claude Whiteboard, Sheets and Data"
(https://www.youtube.com/watch?v=7LLCexpekZI, 9:49), and Anthropic's launch note of 10 Nov 2026
(https://claude.com/resources/articles/sheets-whiteboards-data). The full timestamped watch report is below.
The video's notes come from a Gemini watch pass, not from frames we inspected ourselves.

## Verdict

The v11 dashboards already meet every data rule the Claude Data demo shows, and are stricter on two
(build-time identity checks and a 14px floor). Nothing in the site's code needs to change. Two habits are
worth keeping in mind for the next dashboard pass; they are now in `DESIGN.md` "Dashboards".

| Claude Data / Sheets habit in the video | v11 today | Where |
|---|---|---|
| A one-sentence headline that states the finding ("Your list has 20,462 people, and 77.3% can still get your emails") | Yes: every dashboard opens with a `dg-lede` finding sentence | `app/plan-dashboard.tsx:598`, `app/portfolio-dashboard.tsx:262`, `app/use-case-dashboard.tsx:148` |
| A plain-words line under each big number ("A workflow sends emails for you on its own") | Yes: each KPI has `context` and a `def` | `app/plan-dashboard.tsx:39`, `scripts/build-plan-data.mjs:360` |
| Each number backed by its source | Yes, and downloadable: `pd-source` links plus `data-source` on every KPI and row | `app/plan-dashboard.tsx:87`, `:390` |
| "Certified metrics" | Stronger: accounting identities re-checked on every build and listed on the page | `app/plan-dashboard.tsx:610` |
| Live data with a read time | Yes: /portfolio reads the team's public Google Sheets at load and says when | `app/portfolio-dashboard.tsx:264`, `app/data/use-portfolio.ts:20` |
| A comparison on each count ("-323 vs September") | Covered by the cut test: a count with no comparison is cut | `DESIGN.md` "Dashboards" |
| Mark an unfinished period ("November, not finished yet") | Not needed today: /plan and /portfolio are annual forecasts with no running period. Applies if a dashboard ever shows a month in progress | `DESIGN.md` "Dashboards" |
| Data stories (Scrollyteller, Visual short) | Yes in substance: the portfolio and applications stories and the DG32 films | `app/portfolio-story.tsx`, `app/applications-story.tsx`, `docs/films/` |

## Not taken, and why

- **Public "anyone with the link" sharing of a Claude Data or Sheets artifact built from plan data.** The plan
  figures are withheld from builds without `DGS_PLAN=1`, and a shared artifact is outside every leak gate
  (`scripts/check-withheld-output.mjs`, the live scan). Keep plan numbers on the site, behind its gates.
- **A style picker (Clay, Ocean, Meadow).** `DESIGN.md` owns the look; one house style, no per-page themes.
- **Whiteboards for the site.** Useful for planning work (a content map grouped into "Double down / Stop
  making / Test next", as in the video's YouTube example), not as a page type.
- **Zapier MCP for sources without a native connector.** A working route for a private ops dashboard; the
  public site reads only files checked at build and the team's public sheets.

---


# watch: video report

- **Source:** https://www.youtube.com/watch?v=7LLCexpekZI (URL sent to Google)
- **Engine:** gemini-4-argon (agentic)
- **Ignored local options:** --max-frames, --no-whisper (these only apply with --engine local)
- **Gemini tokens:** 49668

## Answer (from Gemini)

_These are Gemini's observations of the video, not frames you viewed yourself. Relay them as such; rerun with `--engine local` to inspect frames directly._

Here is a chronological summary of the video, detailing what is shown on screen, the on-screen text/prompts, and what the presenter says.

---

### **1. Introduction & Overview of New Claude Artifacts (00:00 – 01:08)**
* **00:00 – 00:19 (Audio & Visuals):** 
  * **Heard:** The presenter introduces three new types of artifacts released by Anthropic inside of Claude: **Claude Whiteboard**, **Claude Sheets**, and **Claude Data**. He states he will break down what each artifact type is, how to use them, and who gets access to them.
  * **Seen:** Promotional UI animations from Anthropic appear first: a "Claude" cursor typing "Artifacts" (00:00), a sample whiteboard titled *"Huckleberry Pie: Launch Timeline"* with illustrated sticky notes and a delivery truck timeline from Day 1 to Day 7 (00:03), and a sample data dashboard titled *"Holiday pre-orders"* showing metrics like *"58,500 Pre-orders"*, *"+17% Vs last year"*, *"Huckleberry Top flavor this week"*, and *"6,064 Boxes left"* (00:06). At 00:10, the presenter appears on camera, followed by a brief close-up of the Claude "Share" button UI (00:13).
* **00:20 – 00:42 (Audio & Visuals):**
  * **Heard:** The presenter explains he is using the Claude desktop app, noting that these features are also available on the web app (`claude.ai`) and mobile app. Referencing Anthropic's announcement on Twitter/X, he notes that the features are rolling out in beta on every paid plan (Pro, Max, Team, or Enterprise).
  * **Seen:** The presenter's screen shows the Claude desktop app (`Good afternoon, brock`, model set to `Opus 4.6 Medium`) alongside his webcam feed on the right (00:20–00:26). At 00:30–00:40, he switches to a browser tab showing an X (Twitter) post by `@claudeai`:
    > *"With Claude Whiteboards, talk through a messy plan and Claude lays it out on a board your team can edit. With Claude Sheets, ask for a tracker or a budget and you get a working spreadsheet you can all keep building. In beta on paid plans."*
* **00:43 – 01:08 (Audio & Visuals):**
  * **Heard:** He demonstrates how to access the new tools by clicking **Artifacts** in the left-hand sidebar of Claude, which displays previously created artifacts and buttons to create new artifact types—highlighting **Sheets**, **Data**, and **Whiteboard** in beta.
  * **Seen:** Clicking **Artifacts** in the left navigation bar (00:46–00:50) opens the Artifacts hub showing six options under *"Make something new"*:
    * **Docs**
    * **Slides**
    * **Sheets (Beta):** Tooltip reads *"A grid with formulas and formatting that you and Claude fill in together. Start with a prompt."* (01:03)
    * **Design**
    * **Data (Beta):** Tooltip reads *"Charts, numbers and tables from your data, each backed up by its source. Start with a prompt."* (00:56)
    * **Whiteboard (Beta):** Tooltip reads *"Boxes, arrows and sticky notes you and Claude both draw on. Start with a prompt."* (01:00)

---

### **2. Feature 1: Claude Whiteboard (01:09 – 05:05)**

#### **A. Basic Prompt Use Case: Tesla Stock Growth (01:09 – 03:52)**
* **01:09 – 02:15 (Audio & Visuals):**
  * **Heard:** The presenter clicks on **Whiteboard** and compares it to tools like Miro or Excalidraw. He explains that users can either describe a concept for Claude to visualize or upload a CSV/PDF file to turn into a whiteboard. Using voice dictation, he gives Claude a basic prompt: *"Hey, I want you to create a whiteboard explaining the growth of Tesla stock over the last five years. I want you to add some necessary statistics and just make a cool visual whiteboard for me to basically see how the stock has changed."*
  * **Seen:** After brief promo animations of Claude Whiteboards (01:26–01:30), the blank Whiteboard canvas opens in the Claude app with a bottom toolbar (`Describe a change`, selection tool, hand pan tool, text `T`, sticky note, shapes, arrow, pen, color palette, and `Ask Claude`) (01:40–01:43). From 01:46 to 02:00, a voice-dictation waveform icon appears at the bottom as he speaks the prompt. At 02:00–02:03, an orange border labeled `Claude` and a status badge reading `Working` appear on the canvas.
* **02:16 – 03:03 (Audio & Visuals):**
  * **Heard:** Once generated, he demonstrates that all text and cards on the whiteboard are directly editable (like changing text or card colors). He then dictates a follow-up change: *"I want you to make the graph a little bit more interesting, so take that graph that you have and create another one below it that has more data points for us."* He points out how you can watch Claude choreograph and build the new graph on screen, adding quarter-end closing prices.
  * **Seen:** At 02:16, the generated whiteboard appears, titled **"Tesla (TSLA): a 5-year roller coaster"** (*"Roughly +72% from end-2020 to end-2024, with a 65% crash in the middle"*). It displays:
    * A line graph of year-end closing prices (split-adjusted, approximate): **2020 ($235)**, **2021 ($352)**, **2022 ($123)**, **2023 ($248)**, **2024 ($404)**.
    * Four colored summary cards on the right:
      * Green: `+72% end-2020 to end-2024`
      * Yellow: `~$410 all-time high, Nov 2021`
      * Pink: `-65% 2022 drawdown (rates, Twitter, demand worries)`
      * Blue: `+102% in 2023, +63% in 2024: the rebound`
    * The presenter clicks on `$352` to show text formatting options (02:23) and clicks the green card to show color palette options (02:26).
    * After dictating the second prompt (02:36–02:47), Claude's orange workspace box appears below the first graph (02:47–02:50) and generates a second chart titled **"Zoomed in: 17 quarter-end closes"** highlighting `Q3'21 peak ~$359`, `Q4'22 low ~$123`, and `$404` at the end of 2024 (02:53–03:03).
* **03:04 – 03:52 (Audio & Visuals):**
  * **Heard:** He highlights the team collaboration and export options: users can share the whiteboard via email invite or public/team link, export it as a PNG image, or send it directly to Miro or other apps. He downloads it as a PNG image and opens it to show the clean output.
  * **Seen:** Clicking **Share** in the top-right corner opens a modal with two tabs: **Share** and **Export** (03:06, 03:20). Under **Share**, he changes General access from `Only you` to `Anyone with the link` and clicks `Copy link` (03:23–03:26). Switching to the **Export** tab (03:30–03:36), options shown are **PNG Image** (download icon), **Send to Miro**, and **More formats and apps**. At 03:43–03:50, he opens the downloaded `Whiteboard.png` file in macOS Preview.

#### **B. Advanced CSV Use Case: YouTube Analytics Content Map (03:53 – 05:05)**
* **03:53 – 04:19 (Audio & Visuals):**
  * **Heard:** Next, he starts a new chat to test uploading a messy zip/CSV file containing his YouTube analytics data from his last 50 videos, pasting in a structured prompt to visualize it as a content strategy whiteboard.
  * **Seen:** He drags and drops a file named `Content 2026-10-13_2026-11-10 Brock Techies.zip` into the Claude prompt box (04:03–04:06) and pastes the following prompt (04:10):
    ```text
    Here's my YouTube analytics export for my last 50 videos. Turn it into a Whiteboard:
    1. Group every video into topic clusters (sticky notes, one color per cluster)
    2. Put each cluster's average views and CTR on it
    3. Draw arrows from my best-performing videos to the topics they could spin off into
    4. Make a "Double down" section, a "Stop making" section, and a "Test next" section
    5. Add 5 new video ideas as sticky notes in "Test next," each linked to the winning video that inspired it
    ```
* **04:20 – 05:05 (Audio & Visuals):**
  * **Heard:** Once Claude finishes generating the whiteboard, he expands it to full screen and reviews the categorized sticky-note clusters (GrokBot deep dives, launch/feature breakdowns, AI news roundups, head-to-head tests, short-form content) and strategic action sections ("What to do next", "Test next", and top winners). He notes that all created whiteboards are automatically saved in the **Artifacts** tab.
  * **Seen:** The resulting whiteboard is titled **"YouTube Content Map — Last 50 Videos"** with the subtitle **"Grok Bot + big Claude launches win. Repo shorts don't."** (04:20–04:30). It organizes sticky notes into color-coded boxes with average views and CTR percentages:
    * *Grok Bot Deep Dives (7)* — Blue (`Avg views: 22.9K · Avg CTR: 4.5% · 160.1K total views · +1,871 net subs`)
    * *Launch & Feature Breakdowns (11)* — Orange (`Avg views: 12.1K · Avg CTR: 4.9% · 133.2K total views · +1,012 net subs`)
    * *Weekly AI News Roundups (9)* — Grey (`Avg views: 24.3K · Avg CTR: 5.5% · 218.5K total views · +1,226 net subs`)
    * *Head-to-Head Tests (3)* — Pink
    * *Shorts: Free GitHub Repos (12)* — Green (`Avg views: 2.3K · Avg CTR: 2.8%`)
    * *Shorts: Free Tools & Prompts (7)* — Purple (`Avg views: 2.0K · Avg CTR: 3.4%`)
    * A bottom section titled **"What to do next"** containing *Double down*, *Stop making*, *Test next* (yellow sticky notes), and *Top 4 winners* (orange sticky notes with connecting arrows) (04:40–04:43).
    * At 05:00–05:03, he returns to the **Artifacts** menu, showing `YouTube Content Map - Last 50 Videos` and `Whiteboard` saved under his recent artifacts.

---

### **3. Feature 2: Claude Sheets (05:06 – 06:46)**
* **05:06 – 05:55 (Audio & Visuals):**
  * **Heard:** The presenter introduces **Claude Sheets**, comparing its interface to Excel and Google Sheets. He points out the one-click import buttons at the bottom of an empty sheet (**Import CSV**, **Import from Excel**, **Import from Google Sheets**). Since his Google account is connected to Claude, he clicks **Import from Google Sheets** and selects his `Following Tracker` spreadsheet, which Claude begins populating automatically.
  * **Seen:** Clicking **Sheets (Beta)** opens an empty spreadsheet grid (`Untitled`) with a formula bar (`Type a value, = for a formula, or @ to insert a person, date, or dropdown`) and bottom action buttons: `Ask Claude`, `Import CSV`, `Import from Excel`, and `Import from Google Sheets` (05:13, 05:20–05:30). Clicking `Import from Google Sheets` opens a Google Drive file picker modal showing recent spreadsheets (`Following Tracker`, `YouTube Short Resource Links`, `YouTube Comment Tracker`, etc.) (05:33–05:43). After selecting `Following Tracker`, an orange badge (`Claude is working...` / `Select any cells to ask Claude about them`) appears on the grid while `Working on it` displays at the bottom (05:46–05:53).
* **05:56 – 06:46 (Audio & Visuals):**
  * **Heard:** While Claude loads the sheet, he switches to his browser to show the original Google Sheet, explaining that he manually tracked daily subscriber/follower growth across YouTube, Instagram, TikTok, and Skool over several months. Switching back to Claude, he shows the completed Claude Sheet, noting it looks identical to the Google Sheet, allows users to highlight cells and click `Describe a change` for Claude to update data, and supports one-click link sharing with teammates.
  * **Seen:** 
    * From 05:56 to 06:13, his browser shows `docs.google.com` with the `Following Tracker` spreadsheet containing color-coded columns: `Date` (blue), `YT Subscribers` / `YT Increase` / `YT % Increase` (pink/red), `IG Followers` / `IG Increase` / `IG % Increase` (green), `TikTok Followers` / `TikTok Increase` / `TikTok % Increase` (yellow), and `Skool Members` / `Skool Increase` (light blue).
    * At 06:16–06:33, back inside Claude Sheets, the imported `Following Tracker` artifact displays the exact same data, column headers, percentages, and row colors down to row 420+ (`02/25/2026`).
    * At 06:36–06:43, he clicks **Share** in the top-right corner, changes access from `Only you` to `Anyone with the link`, and clicks `Share publicly` in the confirmation prompt (*"Share with anyone who has the link? Anyone signed in to Claude with this link can view this artifact."*).

---

### **4. Feature 3: Claude Data & Zapier MCP Integration (06:47 – 09:35)**
* **06:47 – 07:15 (Audio & Visuals):**
  * **Heard:** Moving to the third artifact type, **Claude Data**, the presenter notes that it is a repackaged and upgraded version of the previous Claude Dashboards feature. It turns raw data (from CSVs or connected apps) into visual dashboards, data stories, or animations without manually copying and pasting across tools.
  * **Seen:** An Anthropic slide titled **"CLAUDE DATA: New since Dashboards"** lists four bullet points (`Source: Anthropic, Nov 10, 2026`) (06:53–06:56):
    * *Data stories and narrated videos*
    * *Live sharing (beta)*
    * *Certified metrics (beta)*
    * *Tracked changes and caching*
    Promotional clips also show format options: **Scrollyteller** and **Visual short** (07:03), followed by icons of supported app integrations (Google Sheets, Excel, Airtable, BigQuery, Grafana, etc.) (07:06).
* **07:16 – 08:09 (Audio & Visuals):**
  * **Heard:** Inside the **Data** artifact creation screen, he explains how to connect business apps via **Connectors**. He wants to pull data from his email marketing platform, **Drip**, and searches for it in Claude's native Connectors menu, where it isn't available. To solve this, he uses **Zapier MCP** (noting a link is in the description), which connects Claude to over 9,000 apps. He shows his Zapier MCP server interface where Drip is connected.
  * **Seen:** 
    * At 07:16–07:20, the Claude Data interface shows *"Where do your numbers come from?"* (`Use a connector`, `Import a file`, `Choose design system...`) on the left, and four format cards on the right: **Dashboard**, **Visual analysis**, **Scrollyteller**, and **Visual short**.
    * Clicking `Use a connector` opens Claude's **Settings > Connectors** window (07:23). He types `drip` into the search bar (07:26–07:40), which returns no direct native Drip app (showing `PostDrip` and `Chora` instead).
    * At 07:43–07:53, he displays the Zapier MCP landing page (`zapier.com`, *"Go from AI chat to AI action"*).
    * At 07:56–08:06, he opens his Zapier dashboard (`MCP Server 2`), showing **Drip** listed under connected Apps alongside an `+ Add apps` modal with thousands of integrations (Microsoft Outlook, HubSpot, Slack, Asana, Salesforce, Jira, etc.).
* **08:10 – 08:59 (Audio & Visuals):**
  * **Heard:** Back in Claude Data, he pastes a prompt instructing Claude to pull statistics from his Drip account via Zapier MCP and turn them into a visual dashboard. He leaves the format selection on **Dashboard** (mentioning the other options: **Visual analysis**, **Scrollyteller**, and **Visual short**). When Claude prompts him to choose a visual design style, he selects **Clay** and clicks **Continue**.
  * **Seen:** 
    * In the left chat pane of the Data artifact, he enters the prompt (08:13–08:36):
      > `Use the Zapier MCP to pull information from my Drip account. I want you to then turn this into a visual dashboard so I can see all of the statistics that you have inside of my account.`
    * Once sent, Claude loads the tool and displays an interactive multiple-choice prompt in the chat pane: *"I'll pull your Drip numbers through Zapier. One quick pick first: How should this look?"* with options: `1. Use the standard look`, `2. Clay`, `3. Ocean`, `4. Meadow`, and `5. Other` (08:43–08:50).
    * He selects `2. Clay` and sends the reply `Look: Clay` (08:50–08:56).
* **09:00 – 09:35 (Audio & Visuals):**
  * **Heard:** He walks through the generated **Drip email stats** dashboard, which displays total subscribers on his email list, active subscribers, unsubscribed and undeliverable counts, monthly email send volume, and new subscriber growth per month. He reiterates that, like the other artifacts, this dashboard can be shared directly with team members.
  * **Seen:** At 09:00–09:23, the completed dashboard titled **"Drip email stats"** (*"Your list has 20,462 people, and 77.3% of them can still get your emails. 1,101 new people joined in October."*) is shown on screen with the following cards and bar charts:
    * **People on your list:** `20,462` (*Everyone, right now*)
    * **Active:** `15,814` (*77.3% of your list. These people get your emails.*)
    * **Unsubscribed:** `3,954` (*19.3% of your list. They asked to stop getting emails.*)
    * **Undeliverable:** `694` (*3.4% of your list. Emails to them bounce back.*)
    * **New people in October:** `1,101` (*-323 vs September*)
    * **New people this month so far:** `544` (*November, not finished yet*)
    * **Emails sent to your list:** `38` (*One-time emails (broadcasts), all time*)
    * **Workflows turned on:** `6` (*Out of 10 workflows. A workflow sends emails for you on its own.*)
    * **Bar Chart 1 – New people joining each month:** Apr (`157`), May (`3,756`), Jun (`2,703`), Jul (`8,200`), Aug (`2,577`), Sep (`1,424`), Oct (`1,101`), Nov (`544`).
    * **Bar Chart 2 – Emails you sent each month:** Jun (`2`), Jul (`7`), Aug (`5`), Sep (`10`), Oct (`9`), Nov (`4`).
    * At 09:26–09:30, he shows the saved dashboard inside the **Artifacts** menu and opens the **Share** modal one last time.

---

### **5. Conclusion (09:36 – 09:49)**
* **09:36 – 09:49 (Audio & Visuals):**
  * **Heard:** The presenter wraps up the video, asking viewers to subscribe and share their thoughts in the comments before signing off.
  * **Seen:** The presenter speaks directly to the camera in full-screen view until the video ends.
