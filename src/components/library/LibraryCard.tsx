import {
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Star,
  Wrench,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryIcon } from "@/components/tenders/TenderCard";
import { Tag } from "@/components/tenders/RelevanceBadge";
import { type TenderLibraryItem } from "@/lib/library";

export function ContractStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-open/15 px-2.5 py-0.5 text-xs font-semibold text-open">
      <CheckCircle2 className="size-3" />
      {status}
    </span>
  );
}

export function LibraryCard({
  entry,
  selected,
  onSelect,
  starred,
  onToggleStar,
  variant = "grid",
}: {
  entry: TenderLibraryItem;
  selected: boolean;
  onSelect: () => void;
  starred: boolean;
  onToggleStar: () => void;
  variant?: "grid" | "list";
}) {
  const Icon = categoryIcon(entry.category);
  const isGrid = variant === "grid";
  const sparePartsCount = entry.commercialPricing?.spareParts?.length ?? 0;
  const accessoriesCount = entry.commercialPricing?.optionalAccessories?.length ?? 0;
  const hasPm = (entry.commercialPricing?.maintenanceAndService?.preventiveMaintenance?.length ?? 0) > 0;
  const firstLine = entry.lineItems[0];

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "w-full text-left transition-all group cursor-pointer",
        isGrid
          ? "flex flex-col rounded-2xl border border-border bg-card p-5 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40"
          : "p-5 hover:bg-accent/40 border-b border-border last:border-b-0",
        selected && "border-primary/50 bg-accent/30 ring-2 ring-primary/20",
      )}
    >
      {/* Top Bar: Icon, Reference Numbers, Agency, and Star */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105",
              isGrid ? "size-10" : "size-9",
            )}
          >
            <Icon className={isGrid ? "size-5" : "size-4"} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground">
                {entry.loaNumber}
              </span>
              {entry.itqNumber && entry.itqNumber !== entry.loaNumber && (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground font-medium">
                  ITQ: {entry.itqNumber}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {entry.awardingAgency} · {entry.endCustomer}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label={starred ? "Remove from saved" : "Save entry"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Star className={cn("size-4", starred && "fill-primary text-primary")} />
        </button>
      </div>

      {/* Main Title & Brand / Model */}
      <h3 className="mt-3.5 leading-snug font-bold text-foreground group-hover:text-primary transition-colors text-base">
        {firstLine?.productName || entry.category}
      </h3>

      {firstLine && (firstLine.brand || firstLine.model) && (
        <p className="mt-1 text-xs text-muted-foreground font-medium truncate">
          {firstLine.brand ? `${firstLine.brand} · ` : ""}{firstLine.model || ""}
        </p>
      )}

      {firstLine?.description && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {firstLine.description}
        </p>
      )}

      {/* Category, Status & Duration Tags */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Tag>{entry.category}</Tag>
        <ContractStatusBadge status={entry.status} />
        {entry.contract?.duration && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <Clock className="size-3 text-primary" /> {entry.contract.duration}
          </span>
        )}
      </div>

      {/* Commercial Scope Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-muted-foreground font-medium">
          <Layers className="size-3 text-primary" />
          {entry.lineItems.length} Product{entry.lineItems.length === 1 ? "" : "s"}
        </span>
        {sparePartsCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-muted-foreground font-medium">
            <Wrench className="size-3 text-primary" />
            {sparePartsCount} Spare Parts
          </span>
        )}
        {accessoriesCount > 0 && (
          <span className="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-muted-foreground font-medium">
            <Package className="size-3 text-primary" />
            {accessoriesCount} Add-ons
          </span>
        )}
        {hasPm && (
          <span className="inline-flex items-center gap-1 rounded-md bg-surface border border-border px-2 py-0.5 text-primary font-semibold">
            <ShieldCheck className="size-3 text-primary" />
            PM Schedule
          </span>
        )}
      </div>
    </div>
  );
}
