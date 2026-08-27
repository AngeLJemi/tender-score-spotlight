# Tender AI Scout

Lovable Prompt — Equip Medical Tender Portal Enhancement

Context

This is an existing e-procurement tender discovery portal (React app). Tenders are scraped from GeBiz (and later other portals) and each record already has fields like tenderId, title, agency, publishedDate, closingDate, category, status (OPEN/CLOSED), procurementMethod, procurementNature, contactPerson, contactEmail, contactPhone, description, tenderUrl, tenderPortal.

We are now adding an AI/LLM classification layer that scores each tender for relevance to Equip Medical (hospital ward, ICU, operating theatre, emergency & rescue, medical equipment categories), plus richer parsed fields from DocsAI. Enhance the existing Tenders list + detail view to surface this new data. Do not add a separate analytics/dashboard page — everything lives inside the Tenders screen.

New data fields to support in the UI

Assume each tender record now has this shape (extend the existing mock/type):

relevance: {
  score: number,        // 0-100
  label: "High" | "Medium" | "Low",
  reason: string,       // short one-liner, e.g. "Matches ICU equipment and OT keywords"
  matchedKeywords: string[]   // e.g. ["ICU", "Operating Theatre", "Medical Equipment"]
},
aiSummary: string,       // 2-3 sentence plain-English summary of the tender, generated from the raw description
eligibilityNotes: string | null,
sourcePortals: string[], // e.g. ["GeBiz", "Agency Portal"] - for deduped tenders seen on multiple sources
daysToClose: number,     // computed, days remaining until closingDate
contactPerson: string,
contactEmail: string,
contactPhone: string,
procurementMethod: string,
procurementNature: string


1. Status filter (top of Tenders list)

Replace/confirm the sort dropdown area with a simple 3-way status filter as tabs or a segmented control: All | Open | Closed. This maps directly to the existing status field on each tender (no new workflow states). Keep the existing "Recently published" sort dropdown alongside it, and add a second sort option "Highest relevance first".

2. Tender card (list view) — add these elements

Keep the existing layout (source agency, title, category/type tags, closing date, star/open icons) and add:

Relevance badge in the top-right of the card, color-coded:

High = green background

Medium = amber/yellow background

Low = grey background Show the score number and label together, e.g. a pill reading "92 · High Match".

Matched keyword chips below the existing category tags (small, muted style, e.g. "ICU", "Emergency & Rescue") — max 3 shown, with a "+2 more" if there are more.

Days-to-close urgency indicator: if daysToClose <= 3, show a small red/orange "Closing soon" tag next to the closing date. If already closed, grey it out.

If sourcePortals.length > 1, show a small "Also on: GeBiz, [Agency Portal]" line in muted text under the agency name, so duplicates are visibly merged rather than shown as separate cards.

3. Detail panel (right side) — add these sections

Below the existing header (tender ID, title, agency, tags, status):

AI Relevance section: a highlighted card showing the score/label badge (same style as list), the one-line reason, and the full list of matchedKeywords as chips.

AI Summary section: the 2-3 sentence aiSummary, styled as a distinct "AI generated" callout (subtle icon or label so users know this text is machine-generated, not the original tender copy).

Eligibility Notes (if present): short bullet or paragraph under its own heading.

Contact section: a small card with contactPerson, contactEmail (mailto link), contactPhone (tel link) — this should be easy to scan for follow-up.

Procurement details: show procurementMethod and procurementNature as labeled fields near the existing Key Dates block.

Keep the existing "Open on source portal" button, but if sourcePortals.length > 1, show one button per source portal instead of a single button.

4. Filters bar

Extend the existing "Filter these results..." search box behavior by adding filter chips/dropdowns for:

Relevance label (High / Medium / Low / All)

Category (existing taxonomy)

Source portal (GeBiz, others as they're added)

5. Visual style

Match the existing design language already in the app (soft red/orange accent for selected states, light grey card backgrounds, rounded pill tags). New elements (relevance badges, AI summary callout) should feel like a natural extension of the current tag/pill system, not a visually separate module. Use color purposefully: green/amber/grey for relevance, red/orange sparingly only for urgency (closing soon).

Out of scope for this pass

No new dashboard/analytics page

No manual review workflow states (New/Reviewed/Follow Up etc.) — status stays limited to All/Open/Closed

No bulk actions or team assignment features

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tender-score-spotlight.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/274e3acb-b4f8-47b1-a83f-b89c0a2a4121).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
