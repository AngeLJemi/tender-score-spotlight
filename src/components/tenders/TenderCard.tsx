import { Activity, Ambulance, BedDouble, CalendarDays, ExternalLink, HeartPulse, Scissors, Star, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysToClose, formatDateTime, type Tender } from "@/lib/tenders";
import { KeywordChip, RelevanceBadge, Tag } from "./RelevanceBadge";

export function categoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("emergency")) return Ambulance;
  if (c.includes("ward")) return BedDouble;
  if (c.includes("laboratory")) return Activity;
  if (c.includes("medical equipment")) return HeartPulse;
  if (c.includes("maintenance")) return Scissors;
  return Stethoscope;
}

export function TenderCard({
  tender,
  selected,
  onSelect,
  starred,
  onToggleStar,
  variant = "list",
}: {
  tender: Tender;
  selected: boolean;
  onSelect: () => void;
  starred: boolean;
  onToggleStar: () => void;
  variant?: "list" | "grid";
}) {
  const days = daysToClose(tender.closingDate);
  const isClosed = tender.status === "CLOSED" || days < 0;
  const closingSoon = !isClosed && days <= 3;
  const keywords = tender.relevance.matchedKeywords;
  const Icon = categoryIcon(tender.category);
  const isGrid = variant === "grid";

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
          <p className="min-w-0 truncate text-sm text-muted-foreground">{tender.agency}</p>
        </div>
        {!isGrid && (
          <span className="flex shrink-0 items-center gap-1">
            <StarButton starred={starred} onToggleStar={onToggleStar} />
            <OpenLink url={tender.tenderUrl} />
          </span>
        )}
      </div>

      {tender.sourcePortals.length > 1 && (
        <p className="mt-1 text-xs text-muted-foreground/80">
          Also on: {tender.sourcePortals.join(", ")}
        </p>
      )}

      <h3
        className={cn(
          "mt-2 leading-snug font-semibold",
          isGrid ? "text-base" : "text-lg",
          isClosed ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {tender.title}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {keywords.slice(0, 3).map((k) => (
          <KeywordChip key={k} tone="primary">
            {k}
          </KeywordChip>
        ))}
        {keywords.length > 3 && <KeywordChip>+{keywords.length - 3} more</KeywordChip>}
        <RelevanceBadge relevance={tender.relevance} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Tag>{tender.category}</Tag>
        <Tag tone="method">{tender.procurementMethod}</Tag>
      </div>

      <div
        className={cn(
          "mt-4 flex flex-wrap items-center gap-2",
          isGrid && "mt-auto pt-4",
        )}
      >
        <span
          className={cn(
            "flex min-w-0 items-center gap-1.5 text-sm",
            isClosed ? "text-muted-foreground/70" : "text-muted-foreground",
          )}
        >
          <CalendarDays className="size-4 shrink-0" />
          <span className="truncate">
            {isClosed ? "Closed" : "Closes"} {formatDateTime(tender.closingDate)}
          </span>
        </span>
        {closingSoon && (
          <span className="inline-flex shrink-0 items-center rounded-full bg-urgent/12 px-2 py-0.5 text-[11px] font-semibold text-urgent">
            Closing soon
          </span>
        )}
        {isGrid && (
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <StarButton starred={starred} onToggleStar={onToggleStar} />
            <OpenLink url={tender.tenderUrl} />
          </span>
        )}
      </div>
    </button>
  );
}

function StarButton({
  starred,
  onToggleStar,
}: {
  starred: boolean;
  onToggleStar: () => void;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={starred ? "Remove from watchlist" : "Add to watchlist"}
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
      className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <Star className={cn("size-4", starred && "fill-primary text-primary")} />
    </span>
  );
}

function OpenLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label="Open on source portal"
      onClick={(e) => e.stopPropagation()}
      className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ExternalLink className="size-4" />
    </a>
  );
}
