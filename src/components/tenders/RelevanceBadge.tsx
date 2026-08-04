import { cn } from "@/lib/utils";
import { relevanceStrength, relevanceStyles, type Relevance } from "@/lib/tenders";

function Segments({ filled, size }: { filled: number; size: "sm" | "md" }) {
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full bg-current",
            size === "sm" ? "w-[3px]" : "w-1",
            i <= filled ? "opacity-100" : "opacity-25",
            size === "sm"
              ? ["h-1.5", "h-2", "h-2.5"][i - 1]
              : ["h-2", "h-2.5", "h-3.5"][i - 1],
          )}
        />
      ))}
    </span>
  );
}

export function RelevanceBadge({
  relevance,
  size = "sm",
  className,
}: {
  relevance: Relevance;
  size?: "sm" | "md";
  className?: string;
}) {
  const strength = relevanceStrength[relevance.label];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap",
        relevanceStyles[relevance.label],
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <Segments filled={strength.segments} size={size} />
      <span>{strength.text}</span>
    </span>
  );
}

export function KeywordChip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "primary";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "primary"
          ? "bg-accent text-accent-foreground ring-1 ring-primary/15"
          : "bg-muted text-muted-foreground",
      )}
    >
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
