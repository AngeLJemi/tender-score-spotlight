import { cn } from "@/lib/utils";
import { relevanceStyles, type Relevance } from "@/lib/tenders";

export function RelevanceBadge({
  relevance,
  size = "sm",
  className,
}: {
  relevance: Relevance;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold whitespace-nowrap",
        relevanceStyles[relevance.label],
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <span className="font-display tabular-nums">{relevance.score}</span>
      <span className="opacity-60">·</span>
      <span>{relevance.label} Match</span>
    </span>
  );
}

export function KeywordChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function Tag({
  children,
  tone = "category",
}: {
  children: React.ReactNode;
  tone?: "category" | "method";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "category"
          ? "bg-tag-category text-tag-category-foreground"
          : "bg-tag-method text-tag-method-foreground",
      )}
    >
      {children}
    </span>
  );
}
