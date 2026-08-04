import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronsUpDown,
  FileText,
  LayoutGrid,
  PanelLeft,
  Search,
  Settings,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { daysToClose, tenders as allTenders, type RelevanceLabel } from "@/lib/tenders";
import { TenderCard } from "@/components/tenders/TenderCard";
import { TenderDetail } from "@/components/tenders/TenderDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tenders · Equip Medical Tender Portal" },
      {
        name: "description",
        content:
          "Discover, score and act on Singapore healthcare tenders with AI relevance scoring, summaries and contact details in one place.",
      },
      { property: "og:title", content: "Tenders · Equip Medical Tender Portal" },
      {
        property: "og:description",
        content:
          "AI-scored tender discovery for hospital ward, ICU, operating theatre and emergency equipment opportunities.",
      },
    ],
  }),
  component: TendersPage,
});

type StatusFilter = "All" | "Open" | "Closed";
type SortKey = "recent" | "relevance";

const navItems = [
  { label: "Dashboard", icon: LayoutGrid, active: false },
  { label: "Tenders", icon: FileText, active: true },
  { label: "Settings", icon: Settings, active: false },
];

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar p-4 lg:flex">
      <div>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
            <Stethoscope className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold italic">Equip Medical</span>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors",
                item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          CN
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">Angel</span>
          <span className="block truncate text-xs text-muted-foreground">angel@inextlabs.com</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </div>
    </aside>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "h-9 w-auto min-w-[9rem] rounded-full border-border bg-card text-sm",
          value !== "All" && "border-primary/40 bg-accent text-accent-foreground",
        )}
        aria-label={label}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o === "All" ? `${label}: All` : o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function TendersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [sort, setSort] = useState<SortKey>("recent");
  const [relevance, setRelevance] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [portal, setPortal] = useState<string>("All");
  const [starred, setStarred] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>(allTenders[0].tenderId);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(allTenders.map((t) => t.category)))],
    [],
  );
  const portals = useMemo(
    () => ["All", ...Array.from(new Set(allTenders.flatMap((t) => t.sourcePortals)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allTenders.filter((t) => {
      const isClosed = t.status === "CLOSED" || daysToClose(t.closingDate) < 0;
      if (status === "Open" && isClosed) return false;
      if (status === "Closed" && !isClosed) return false;
      if (relevance !== "All" && t.relevance.label !== (relevance as RelevanceLabel)) return false;
      if (category !== "All" && t.category !== category) return false;
      if (portal !== "All" && !t.sourcePortals.includes(portal)) return false;
      if (!q) return true;
      return [t.title, t.agency, t.tenderId, t.category, ...t.relevance.matchedKeywords]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    return [...list].sort((a, b) =>
      sort === "relevance"
        ? b.relevance.score - a.relevance.score
        : new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime(),
    );
  }, [query, status, sort, relevance, category, portal]);

  const selected = filtered.find((t) => t.tenderId === selectedId) ?? filtered[0];

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-card px-5 py-4">
          <PanelLeft className="size-5 shrink-0 text-muted-foreground" />
          <span className="h-6 w-px bg-border" />
          <h1 className="truncate text-xl font-semibold">Tenders</h1>
        </header>

        <div className="min-w-0 flex-1 p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
            <div className="relative min-w-0 md:w-96">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter these results..."
                aria-label="Filter tenders"
                className="h-11 w-full rounded-full bg-muted pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
              />
            </div>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger
                className="h-11 w-auto min-w-[13rem] rounded-full border-border bg-card"
                aria-label="Sort tenders"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently published</SelectItem>
                <SelectItem value="relevance">Highest relevance first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div
              role="tablist"
              aria-label="Status filter"
              className="inline-flex rounded-full bg-muted p-1"
            >
              {(["All", "Open", "Closed"] as StatusFilter[]).map((s) => (
                <button
                  key={s}
                  role="tab"
                  aria-selected={status === s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                    status === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            <FilterSelect
              label="Relevance"
              value={relevance}
              onChange={setRelevance}
              options={["All", "High", "Medium", "Low"]}
            />
            <FilterSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={categories}
            />
            <FilterSelect label="Source" value={portal} onChange={setPortal} options={portals} />
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Showing {filtered.length} of {allTenders.length} tenders
          </p>

          <div className="mt-4 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
              {filtered.length === 0 ? (
                <p className="p-10 text-center text-sm text-muted-foreground">
                  No tenders match these filters.
                </p>
              ) : (
                filtered.map((t) => (
                  <TenderCard
                    key={t.tenderId}
                    tender={t}
                    selected={selected?.tenderId === t.tenderId}
                    onSelect={() => setSelectedId(t.tenderId)}
                    starred={starred.includes(t.tenderId)}
                    onToggleStar={() =>
                      setStarred((prev) =>
                        prev.includes(t.tenderId)
                          ? prev.filter((id) => id !== t.tenderId)
                          : [...prev, t.tenderId],
                      )
                    }
                  />
                ))
              )}
            </div>

            {selected && (
              <div className="min-w-0 self-start rounded-2xl border border-border bg-card xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
                <TenderDetail tender={selected} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
