import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Database, LayoutGrid, PanelLeft, Plus, Rows3, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import {
  awardDateRanges,
  awardedTenders as seedAwarded,
  contractStatus,
  contractStatuses,
  libraryCategories,
  monthsSince,
  priceRanges,
  type AwardedTender,
} from "@/lib/library";
import { LibraryCard } from "@/components/library/LibraryCard";
import { AwardedDetail } from "@/components/library/AwardedDetail";
import { AddAwardedDialog } from "@/components/library/AddAwardedDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      { title: "Tenders Library · Equip Medical" },
      {
        name: "description",
        content:
          "Searchable repository of awarded tenders and contracts: line items, SKUs, contracted prices, warranty and maintenance terms.",
      },
      { property: "og:title", content: "Tenders Library · Equip Medical" },
      {
        property: "og:description",
        content:
          "Reference past wins before quoting — awarded contracts, SKUs, contracted prices and warranty terms in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

type ViewMode = "list" | "grid";

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
          value !== "All" && "border-library/40 bg-library-band text-library",
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
  const [entries, setEntries] = useState<AwardedTender[]>(seedAwarded);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [customer, setCustomer] = useState("All");
  const [dateRange, setDateRange] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [price, setPrice] = useState("All");
  const [view, setView] = useState<ViewMode>("list");
  const [starred, setStarred] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>(search.entry ?? seedAwarded[0]?.id ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AwardedTender | null>(null);

  const customers = useMemo(
    () => ["All", ...Array.from(new Set(entries.map((e) => e.endCustomer)))],
    [entries],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category !== "All" && e.category !== category) return false;
      if (customer !== "All" && e.endCustomer !== customer) return false;
      if (statusFilter !== "All" && contractStatus(e) !== statusFilter) return false;
      const range = priceRanges.find((r) => r.label === price);
      const value = e.totalPrice ?? e.lineItems.find((l) => l.unitPrice != null)?.unitPrice ?? 0;
      if (range && range.label !== "All" && (value < range.min || value > range.max)) return false;
      const dr = awardDateRanges.find((r) => r.label === dateRange);
      if (dr && Number.isFinite(dr.months) && monthsSince(e.contractStart) > dr.months)
        return false;
      if (!q) return true;
      return [
        e.id,
        e.loaNumber,
        e.itqRef ?? "",
        e.awardingAgency,
        e.endCustomer,
        e.category,
        ...e.lineItems.flatMap((l) => [l.sku, l.productName, l.brandModel ?? ""]),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [entries, query, category, customer, statusFilter, price, dateRange]);

  const selected = filtered.find((e) => e.id === selectedId) ?? filtered[0];

  const toggleStar = (id: string) =>
    setStarred((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = (entry: AwardedTender) => {
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev];
    });
    setSelectedId(entry.id);
    setDialogOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-library/15 bg-library-band/70 px-5 py-4">
          <div className="flex items-center gap-4">
            <PanelLeft className="size-5 shrink-0 text-library/70" />
            <span className="h-6 w-px bg-library/20" />
            <Database className="size-5 shrink-0 text-library" />
            <h1 className="truncate text-xl font-semibold text-library">Tenders Library</h1>
          </div>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-library px-3 py-1 text-[10px] font-bold tracking-[0.14em] text-library-foreground uppercase">
            Internal — awarded contracts
          </p>
        </header>

        <div className="min-w-0 flex-1 p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:flex md:justify-between">
            <div className="group relative min-w-0 md:w-[30rem]">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-library" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by Tender ID, SKU, product, customer or keyword..."
                aria-label="Search awarded tenders"
                className="h-12 w-full rounded-full border border-border bg-card pr-4 pl-11 text-sm shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus:border-library/40 focus:shadow-md focus:ring-4 focus:ring-library/10"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-library px-4 text-sm font-semibold text-library-foreground transition-colors hover:bg-library/90"
              >
                <Plus className="size-4" />
                Add Awarded Tender
              </button>

              <div
                role="tablist"
                aria-label="View mode"
                className="inline-flex shrink-0 rounded-full border border-border bg-card p-1"
              >
                {[
                  { key: "list" as ViewMode, icon: Rows3, label: "List view" },
                  { key: "grid" as ViewMode, icon: LayoutGrid, label: "Grid view" },
                ].map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    role="tab"
                    aria-selected={view === v.key}
                    aria-label={v.label}
                    onClick={() => setView(v.key)}
                    className={cn(
                      "grid size-9 place-items-center rounded-full transition-colors",
                      view === v.key
                        ? "bg-library text-library-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <v.icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {["All", ...libraryCategories].map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={category === f}
                onClick={() => setCategory(f)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  category === f
                    ? "border-library/40 bg-library-band text-library"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Customer"
              value={customer}
              onChange={setCustomer}
              options={customers}
            />
            <FilterSelect
              label="Award date"
              value={dateRange}
              onChange={setDateRange}
              options={awardDateRanges.map((r) => r.label)}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All", ...contractStatuses]}
            />
            <FilterSelect
              label="Price"
              value={price}
              onChange={setPrice}
              options={priceRanges.map((r) => r.label)}
            />
          </div>

          <p className="mt-5 text-sm text-muted-foreground">
            Showing {filtered.length} of {entries.length} awarded tenders
          </p>

          <div className="mt-4 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="min-w-0">
              {entries.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No awarded tenders yet — add one manually or import a contract PDF.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDialogOpen(true)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-library px-4 py-2.5 text-sm font-semibold text-library-foreground hover:bg-library/90"
                  >
                    <Plus className="size-4" />
                    Add Awarded Tender
                  </button>
                </div>
              ) : filtered.length === 0 ? (
                <p className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                  No awarded tenders match these filters.
                </p>
              ) : view === "grid" ? (
                <div className="grid min-w-0 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {filtered.map((e) => (
                    <LibraryCard
                      key={e.id}
                      variant="grid"
                      entry={e}
                      selected={selected?.id === e.id}
                      onSelect={() => setSelectedId(e.id)}
                      starred={starred.includes(e.id)}
                      onToggleStar={() => toggleStar(e.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
                  {filtered.map((e) => (
                    <LibraryCard
                      key={e.id}
                      entry={e}
                      selected={selected?.id === e.id}
                      onSelect={() => setSelectedId(e.id)}
                      starred={starred.includes(e.id)}
                      onToggleStar={() => toggleStar(e.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {selected && (
              <div className="min-w-0 self-start overflow-hidden rounded-2xl border border-library/20 bg-card shadow-sm xl:sticky xl:top-5 xl:max-h-[calc(100vh-2.5rem)] xl:overflow-y-auto">
                <AwardedDetail
                  entry={selected}
                  {...(search.fromTender
                    ? {
                        backLink: (
                          <Link
                            to="/"
                            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-library/25 bg-card px-3 py-1.5 text-xs font-semibold text-library transition-colors hover:bg-library/10"
                          >
                            <ArrowLeft className="size-3.5" /> Back to Tender
                          </Link>
                        ),
                      }
                    : {})}
                  onEdit={() => {
                    setEditing(selected);
                    setDialogOpen(true);
                  }}
                  onAdd={() => {
                    setEditing(null);
                    setDialogOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>

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
