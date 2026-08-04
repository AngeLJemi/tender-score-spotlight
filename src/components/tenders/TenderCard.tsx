import { CalendarDays, ExternalLink, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysToClose, formatDateTime, type Tender } from "@/lib/tenders";
import { KeywordChip, RelevanceBadge, Tag } from "./RelevanceBadge";

export function TenderCard({
  tender,
  selected,
  onSelect,
  starred,
  onToggleStar,
}: {
  tender: Tender;
  selected: boolean;
  onSelect: () => void;
  starred: boolean;
  onToggleStar: () => void;
}) {
  const days = daysToClose(tender.closingDate);
  const isClosed = tender.status === "CLOSED" || days < 0;
  const closingSoon = !isClosed && days <= 3;
  const keywords = tender.relevance.matchedKeywords;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={cn(
        "w-full border-b border-border px-5 py-4 text-left transition-colors last:border-b-0",
        selected ? "bg-accent" : "bg-card hover:bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-sm text-muted-foreground">{tender.agency}</p>
        <RelevanceBadge relevance={tender.relevance} />
      </div>

      {tender.sourcePortals.length > 1 && (
        <p className="mt-0.5 text-xs text-muted-foreground/80">
          Also on: {tender.sourcePortals.join(", ")}
        </p>
      )}

      <h3
        className={cn(
          "mt-1 text-lg leading-snug font-semibold",
          isClosed ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {tender.title}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Tag>{tender.category}</Tag>
        <Tag tone="method">{tender.procurementMethod}</Tag>
      </div>

      {keywords.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {keywords.slice(0, 3).map((k) => (
            <KeywordChip key={k}>{k}</KeywordChip>
          ))}
          {keywords.length > 3 && <KeywordChip>+{keywords.length - 3} more</KeywordChip>}
        </div>
      )}

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
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
        </div>

        <div className="flex shrink-0 items-center gap-1">
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
          <a
            href={tender.tenderUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open on source portal"
            onClick={(e) => e.stopPropagation()}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </button>
  );
}
