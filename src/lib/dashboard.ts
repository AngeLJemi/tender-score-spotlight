import {
  daysSincePublished,
  daysToClose,
  relevanceStrength,
  tenders,
  today,
  type Tender,
} from "@/lib/tenders";

export function isOpen(t: Tender): boolean {
  return t.status === "OPEN" && daysToClose(t.closingDate) >= 0;
}

export const openTenders = tenders.filter(isOpen);

export const kpis = {
  open: openTenders.length,
  strong: openTenders.filter((t) => t.relevance.label === "High").length,
  closingThisWeek: openTenders.filter((t) => daysToClose(t.closingDate) <= 7).length,
  newThisWeek: tenders.filter((t) => daysSincePublished(t.publishedDate) <= 7).length,
};

export const relevanceBreakdown = (["High", "Medium", "Low"] as const).map((label) => ({
  label: relevanceStrength[label].text,
  value: openTenders.filter((t) => t.relevance.label === label).length,
  color:
    label === "High"
      ? "var(--relevance-high)"
      : label === "Medium"
        ? "var(--relevance-medium)"
        : "var(--relevance-low)",
}));

const CORE_CATEGORIES = [
  "ICU",
  "Operating Theatre",
  "Emergency & Rescue",
  "Hospital Ward",
  "Medical Equipment",
];

function bucketCategory(t: Tender): string {
  const haystack = [t.category, t.title, ...t.relevance.matchedKeywords].join(" ").toLowerCase();
  const hit = CORE_CATEGORIES.find((c) => haystack.includes(c.toLowerCase()));
  return hit ?? "Others";
}

export const byCategory = [...CORE_CATEGORIES, "Others"]
  .map((name) => ({ name, count: tenders.filter((t) => bucketCategory(t) === name).length }))
  .filter((r) => r.count > 0)
  .sort((a, b) => b.count - a.count);

export const bySource = Array.from(
  tenders.reduce((map, t) => {
    for (const p of t.sourcePortals) map.set(p, (map.get(p) ?? 0) + 1);
    return map;
  }, new Map<string, number>()),
)
  .map(([name, count]) => ({ name, count }))
  .sort((a, b) => b.count - a.count);

/** Count of tenders published per week, oldest → newest, over the last 8 weeks. */
export const weeklyTrend = Array.from({ length: 8 }, (_, i) => {
  const weeksAgo = 7 - i;
  const end = today.getTime() - weeksAgo * 7 * 86_400_000;
  const start = end - 7 * 86_400_000;
  const count = tenders.filter((t) => {
    const p = new Date(t.publishedDate).getTime();
    return p > start && p <= end;
  }).length;
  return {
    label: weeksAgo === 0 ? "This wk" : `-${weeksAgo}w`,
    count,
  };
});

export const closingSoon = [...openTenders]
  .sort((a, b) => daysToClose(a.closingDate) - daysToClose(b.closingDate))
  .slice(0, 5);

export const topAgencies = Array.from(
  tenders.reduce((map, t) => map.set(t.agency, (map.get(t.agency) ?? 0) + 1), new Map<string, number>()),
)
  .map(([agency, count]) => ({ agency, count }))
  .sort((a, b) => b.count - a.count || a.agency.localeCompare(b.agency))
  .slice(0, 5);
