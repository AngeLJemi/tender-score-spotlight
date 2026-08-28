import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Database,
  Eye,
  FileText,
  Layers,
  LayoutGrid,
  Package,
  PanelLeft,
  Plus,
  Rows3,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Wrench,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  getItemPrimaryPrice,
  libraryCategories,
  sampleLibraryData,
  type TenderLibraryItem,
} from "@/lib/library";
import { LibraryCard, ContractStatusBadge } from "@/components/library/LibraryCard";
import { AwardedDetail } from "@/components/library/AwardedDetail";
import { AddAwardedDialog } from "@/components/library/AddAwardedDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type LibrarySearch = { entry?: string; fromTender?: string };

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): LibrarySearch => {
    const entry = search["entry"];
    const fromTender = search["fromTender"];
    return {
      ...(typeof entry === "string" ? { entry } : {}),
      ...(typeof fromTender === "string" ? { fromTender } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Tenders Library · Equip Medical Commercial Intelligence" },
      {
        name: "description",
        content:
          "Card directory of awarded healthcare tender contracts, pricing tiers, multi-year escalation ladders, and spare parts schedules.",
      },
      { property: "og:title", content: "Tenders Library · Equip Medical" },
      {
        property: "og:description",
        content:
          "Interactive contract cards with instant slide-over drawer dossiers, volume tier calculators, and accessory matrices.",
      },
    ],
  }),
  component: LibraryPage,
});

type CardLayout = "grid" | "list";

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
          "h-9 w-auto min-w-[9rem] rounded-full border-border bg-card text-xs font-medium",
          value !== "All" && "border-primary/40 bg-accent text-accent-foreground font-semibold",
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

function LibraryPage() {
  const search = Route.useSearch();
  const [entries, setEntries] = useState<TenderLibraryItem[]>(sampleLibraryData);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [agency, setAgency] = useState("All");
  const [duration, setDuration] = useState("All");
  const [cardLayout, setCardLayout] = useState<CardLayout>("grid");
  const [starred, setStarred] = useState<string[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TenderLibraryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TenderLibraryItem | null>(null);

  // Auto-open drawer if entry query param is present
  useEffect(() => {
    if (search.entry) {
      const match = entries.find((e) => e.id === search.entry || e.loaNumber === search.entry);
      if (match) {
        setSelectedEntry(match);
        setDrawerOpen(true);
      }
    }
  }, [search.entry, entries]);

  const agencies = useMemo(
    () => ["All", ...Array.from(new Set(entries.map((e) => e.awardingAgency)))],
    [entries],
  );

  const durations = useMemo(
    () => ["All", ...Array.from(new Set(entries.map((e) => e.contract?.duration).filter(Boolean) as string[]))],
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== "All" && e.category !== category) return false;
      if (agency !== "All" && e.awardingAgency !== agency) return false;
      if (duration !== "All" && e.contract?.duration !== duration) return false;
      if (!q) return true;

      const lineItemTerms = e.lineItems.flatMap((l) => [
        l.productName,
        l.skuPartNumber ?? "",
        l.brand ?? "",
        l.model ?? "",
        l.description,
      ]);
      const sparePartTerms = e.commercialPricing.spareParts.flatMap((sp) => [sp.partNumber, sp.description]);
      const accessoryTerms = e.commercialPricing.optionalAccessories.map((a) => a.description);

      const allSearchable = [
        e.id,
        e.loaNumber,
        e.itqNumber,
        e.awardingAgency,
        e.endCustomer,
        e.category,
        e.status,
        ...lineItemTerms,
        ...sparePartTerms,
        ...accessoryTerms,
      ]
        .join(" ")
        .toLowerCase();

      return allSearchable.includes(q);
    });
  }, [entries, query, category, agency, duration]);

  const toggleStar = (id: string) =>
    setStarred((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const openDrawer = (entry: TenderLibraryItem) => {
    setSelectedEntry(entry);
    setDrawerOpen(true);
  };

  const handleSave = (entry: TenderLibraryItem) => {
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id || e.loaNumber === entry.loaNumber);
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev];
    });
    setSelectedEntry(entry);
    setDialogOpen(false);
    setEditing(null);
  };

    return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Command Bar */}
        <header className="border-b border-border bg-card px-6 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PanelLeft className="size-5 shrink-0 text-muted-foreground" />
              <span className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Database className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">Tenders Library</h1>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {entries.length} Contracts
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awarded contract intelligence cards · Click on any card to open full details in drawer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Controls & Filter Bar */}
        <div className="min-w-0 flex-1 p-6 space-y-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
            {/* Search Input */}
            <div className="group relative min-w-0 md:w-[32rem]">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by LOA, ITQ, product name, brand, model, SKU, or spare part..."
                aria-label="Search awarded tenders"
                className="h-12 w-full rounded-full border border-border bg-card pr-4 pl-11 text-sm shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary/40 focus:shadow-md focus:ring-4 focus:ring-primary/10"
              />
            </div>

            {/* Action Buttons & Layout Toggle */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow"
              >
                <Plus className="size-4" />
                Add Awarded Contract
              </button>

              <div
                role="tablist"
                aria-label="Card layout"
                className="inline-flex shrink-0 rounded-full border border-border bg-card p-1 shadow-sm"
              >
                {[
                  { key: "grid" as CardLayout, icon: LayoutGrid, label: "Grid Cards" },
                  { key: "list" as CardLayout, icon: Rows3, label: "List Cards" },
                ].map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    role="tab"
                    aria-selected={cardLayout === v.key}
                    aria-label={v.label}
                    onClick={() => setCardLayout(v.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      cardLayout === v.key
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <v.icon className="size-3.5" />
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-border">
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground mr-1">
              <SlidersHorizontal className="size-3.5" /> Filter by:
            </span>
            <FilterSelect label="Category" value={category} onChange={setCategory} options={libraryCategories} />
            <FilterSelect label="Agency" value={agency} onChange={setAgency} options={agencies} />
            <FilterSelect label="Term Duration" value={duration} onChange={setDuration} options={durations} />

            {(category !== "All" || agency !== "All" || duration !== "All" || query) && (
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setAgency("All");
                  setDuration("All");
                  setQuery("");
                }}
                className="ml-auto text-xs font-semibold text-primary underline hover:text-primary/80"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Counter Note */}
          <p className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground font-semibold">{filtered.length}</strong> of {entries.length} awarded contracts · Click any card to open the complete details in drawer
          </p>

          {/* MAIN CARDS DIRECTORY VIEW */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <p className="text-sm font-semibold text-foreground">No awarded contracts found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try clearing your search query or filter selections.</p>
              <button
                type="button"
                onClick={() => {
                  setCategory("All");
                  setAgency("All");
                  setDuration("All");
                  setQuery("");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Reset Filters
              </button>
            </div>
          ) : cardLayout === "grid" ? (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filtered.map((e) => (
                <LibraryCard
                  key={e.id}
                  variant="grid"
                  entry={e}
                  selected={selectedEntry?.id === e.id}
                  onSelect={() => openDrawer(e)}
                  starred={starred.includes(e.id)}
                  onToggleStar={() => toggleStar(e.id)}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm divide-y divide-border">
              {filtered.map((e) => (
                <LibraryCard
                  key={e.id}
                  variant="list"
                  entry={e}
                  selected={selectedEntry?.id === e.id}
                  onSelect={() => openDrawer(e)}
                  starred={starred.includes(e.id)}
                  onToggleStar={() => toggleStar(e.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* SLIDE-OVER CONTRACT DOSSIER DRAWER (SHEET) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-4xl p-0 overflow-y-auto bg-surface border-l border-border shadow-2xl"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Contract Dossier: {selectedEntry?.loaNumber}</SheetTitle>
            <SheetDescription>Detailed commercial agreement, tier pricing, spare parts, and terms.</SheetDescription>
          </SheetHeader>

          {selectedEntry && (
            <AwardedDetail
              entry={selectedEntry}
              {...(search.fromTender
                ? {
                    backLink: (
                      <Link
                        to="/"
                        className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-accent"
                      >
                        <ArrowLeft className="size-3.5" /> Back to Live Tender
                      </Link>
                    ),
                  }
                : {})}
              onEdit={() => {
                setEditing(selectedEntry);
                setDialogOpen(true);
              }}
              onAdd={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Add / Edit Contract Modal */}
      <AddAwardedDialog
        open={dialogOpen}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={handleSave}
        editing={editing}
      />
    </div>
  );
}
