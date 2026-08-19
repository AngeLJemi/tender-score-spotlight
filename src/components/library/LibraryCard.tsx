import { CalendarDays, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryIcon } from "@/components/tenders/TenderCard";
import { Tag } from "@/components/tenders/RelevanceBadge";
import {
  contractStatus,
  contractStatusStyles,
  formatDate,
  formatMoney,
  type AwardedTender,
} from "@/lib/library";

export function StatusBadge({ entry }: { entry: AwardedTender }) {
  const status = contractStatus(entry);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        contractStatusStyles[status],
      )}
    >
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
  variant = "list",
}: {
  entry: AwardedTender;
  selected: boolean;
  onSelect: () => void;
  starred: boolean;
  onToggleStar: () => void;
  variant?: "list" | "grid";
}) {
  const Icon = categoryIcon(entry.category);
  const isGrid = variant === "grid";
  const items = entry.lineItems;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={cn(
        "w-full text-left transition-all",
        isGrid
          ? "flex h-full flex-col rounded-2xl border border-border bg-card p-6 hover:-translate-y-0.5 hover:shadow-lg"
          : "border-b border-border px-6 py-6 last:border-b-0 hover:shadow-[inset_3px_0_0_0_var(--color-primary)]",
        !isGrid && (selected ? "bg-accent" : "bg-card hover:bg-surface"),
        isGrid && selected && "border-primary/40 bg-accent",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
              isGrid ? "size-11" : "size-8",
            )}
          >
            <Icon className={isGrid ? "size-5" : "size-4"} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-mono text-xs tracking-wide text-muted-foreground">
              {entry.id}
            </span>
            <span className="block truncate text-sm text-muted-foreground">{entry.customer}</span>
          </span>
        </div>
        <span
          role="button"
          tabIndex={0}
          aria-label={starred ? "Remove from saved" : "Save entry"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onToggleStar();
            }
          }}
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary"
        >
          <Star className={cn("size-4", starred && "fill-primary text-primary")} />
        </span>
      </div>

      <p className="mt-3 font-display text-base leading-snug font-semibold">{entry.loaNumber}</p>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Tag>{entry.category}</Tag>
        <Tag tone="method">
          {items.length} line item{items.length === 1 ? "" : "s"}
        </Tag>
        <StatusBadge entry={entry} />
      </div>

      <p className="mt-3 truncate text-sm text-muted-foreground">
        {items.map((i) => i.productName).join(" · ")}
      </p>

      <div
        className={cn(
          "mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm",
          isGrid && "mt-auto pt-4",
        )}
      >
        <span className="font-display text-lg font-semibold">{formatMoney(entry.totalPrice)}</span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <ShieldCheck className="size-4" /> {entry.warrantyPeriod} warranty
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="size-4" /> Awarded {formatDate(entry.awardDate)}
        </span>
        <span className="ml-auto text-sm font-semibold text-primary">View Details</span>
      </div>
    </button>
  );
}
