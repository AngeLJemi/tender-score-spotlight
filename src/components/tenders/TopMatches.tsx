import { CalendarClock, Flame } from "lucide-react";
import { formatDateTime, type Tender } from "@/lib/tenders";
import { cn } from "@/lib/utils";
import { RelevanceBadge } from "./RelevanceBadge";
import { categoryIcon } from "./TenderCard";

export function TopMatches({
  tenders,
  selectedId,
  onSelect,
}: {
  tenders: Tender[];
  selectedId?: string | undefined;
  onSelect: (id: string) => void;
}) {
  if (tenders.length === 0) return null;

  return (
    <section className="mt-5" aria-label="Top matches">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        <Flame className="size-4 text-primary" />
        Top matches
      </h2>

      <div className="mt-3 flex snap-x gap-4 overflow-x-auto pb-1">
        {tenders.map((t) => {
          const Icon = categoryIcon(t.category);
          return (
            <button
              key={t.tenderId}
              type="button"
              onClick={() => onSelect(t.tenderId)}
              className={cn(
                "w-[19rem] shrink-0 snap-start rounded-2xl border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg",
                selectedId === t.tenderId ? "border-primary/40 bg-accent" : "border-border",
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <p className="min-w-0 truncate text-sm text-muted-foreground">{t.agency}</p>
              </div>
              <h3 className="mt-2.5 line-clamp-2 text-base leading-snug font-semibold">
                {t.title}
              </h3>
              <div className="mt-3">
                <RelevanceBadge relevance={t.relevance} />
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-4 shrink-0" />
                <span className="truncate">Closes {formatDateTime(t.closingDate)}</span>
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
