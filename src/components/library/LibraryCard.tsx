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
          ? "flex h-full flex-col rounded-2xl border border-library/15 border-l-4 border-l-library/60 bg-library-tint p-6 hover:-translate-y-0.5 hover:shadow-lg"
          : "border-b border-border border-l-4 px-6 py-6 last:border-b-0",
        !isGrid &&
          (selected
            ? "border-l-library bg-library-band/70"
            : "border-l-library/25 bg-library-tint hover:border-l-library/60 hover:bg-library-band/40"),
        isGrid && selected && "border-library/40 bg-library-band/70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-xl bg-library/10 text-library",
              isGrid ? "size-11" : "size-8",
            )}
          >
            <Icon className={isGrid ? "size-5" : "size-4"} />
          </span>
          <span className="min-w-0">
            <span className="inline-flex items-center rounded-md bg-library/10 px-2 py-0.5 font-mono text-[11px] tracking-wide text-library">
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
          className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-library/10 hover:text-library"
        >
          <Star className={cn("size-4", starred && "fill-library text-library")} />
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

      <div className={cn("mt-4", isGrid && "mt-auto pt-4")}>
        <div className="flex flex-wrap items-stretch gap-2">
          <span className="rounded-xl border border-library/15 bg-card px-3 py-2">
            <span className="block text-[11px] tracking-wide text-muted-foreground uppercase">
              Contracted price
            </span>
            <span className="mt-0.5 block font-display text-lg leading-none font-semibold text-library">
              {formatMoney(entry.totalPrice)}
            </span>
          </span>
          <span className="rounded-xl border border-library/15 bg-card px-3 py-2">
            <span className="block text-[11px] tracking-wide text-muted-foreground uppercase">
              Warranty
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 font-display text-lg leading-none font-semibold">
              <ShieldCheck className="size-4 text-library" /> {entry.warrantyPeriod}
            </span>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="size-4" /> Awarded {formatDate(entry.awardDate)}
          </span>
          <span className="ml-auto text-sm font-semibold text-library">View Details</span>
        </div>
      </div>
    </button>
  );
}
