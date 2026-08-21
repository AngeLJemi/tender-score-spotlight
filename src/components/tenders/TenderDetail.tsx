import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  Link as LinkIcon,
  CalendarClock,
  ExternalLink,
  Mail,
  Phone,
  Sparkle,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { daysToClose, formatDateTime, keywordSentence, type Tender } from "@/lib/tenders";
import { relevanceStrength } from "@/lib/tenders";
import { matchedContracts, matchStrengthStyles } from "@/lib/library";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KeywordChip, RelevanceBadge, Tag } from "./RelevanceBadge";

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-border pt-5", className)}>
      <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function TenderDetail({ tender }: { tender: Tender }) {
  const days = daysToClose(tender.closingDate);
  const isClosed = tender.status === "CLOSED" || days < 0;

  return (
    <div className="flex flex-col gap-5 p-6">
      <header>
        <p className="font-mono text-xs tracking-wide text-muted-foreground">{tender.tenderId}</p>
        <h2 className="mt-1.5 text-2xl leading-tight font-semibold">{tender.title}</h2>
        <p className="mt-1.5 text-muted-foreground">{tender.agency}</p>
        {tender.sourcePortals.length > 1 && (
          <p className="mt-0.5 text-xs text-muted-foreground/80">
            Also on: {tender.sourcePortals.join(", ")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag>{tender.category}</Tag>
          <Tag tone="method">{tender.procurementMethod}</Tag>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
              isClosed ? "bg-muted text-muted-foreground" : "bg-open/12 text-open",
            )}
          >
            {isClosed ? "CLOSED" : "OPEN"}
          </span>
          {!isClosed && days <= 3 && (
            <span className="inline-flex items-center rounded-full bg-urgent/12 px-2.5 py-1 text-xs font-semibold text-urgent">
              Closing in {days <= 0 ? "under a day" : `${days} day${days === 1 ? "" : "s"}`}
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tender.sourcePortals.map((portal) => (
            <a
              key={portal}
              href={tender.tenderUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="size-4" />
              {tender.sourcePortals.length > 1 ? `Open on ${portal}` : "Open on source portal"}
            </a>
          ))}
        </div>
      </header>

      <Section title="AI relevance">
        <div className="rounded-xl border border-border bg-surface-strong/60 p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-base font-semibold">
              {keywordSentence(tender.relevance.matchedKeywords) ?? "No keyword matches"}
            </p>
            <RelevanceBadge relevance={tender.relevance} />
          </div>
          {tender.relevance.matchedKeywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tender.relevance.matchedKeywords.map((k) => (
                <KeywordChip key={k} tone="primary">
                  {k}
                </KeywordChip>
              ))}
            </div>
          )}
          <p className="mt-3 text-sm text-muted-foreground">{tender.relevance.reason}</p>

          <RelevanceControl tender={tender} />
        </div>

        <MatchedContracts tender={tender} />
      </Section>



      <Section title="AI summary">
        <div className="rounded-xl border border-ai/20 bg-ai/6 p-4">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ai uppercase">
            <Sparkle className="size-3.5" />
            AI generated
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{tender.aiSummary}</p>
        </div>
      </Section>

      {tender.eligibilityNotes && (
        <Section title="Eligibility notes">
          <div className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p>{tender.eligibilityNotes}</p>
          </div>
        </Section>
      )}

      <Section title="Key dates">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarDays className="size-4" /> Published
            </p>
            <p className="mt-1 font-display text-base font-medium">
              {formatDateTime(tender.publishedDate)}
            </p>
          </div>
          <div>
            <p
              className={cn(
                "flex items-center gap-1.5 text-sm",
                isClosed ? "text-muted-foreground" : "text-urgent",
              )}
            >
              <CalendarClock className="size-4" /> Closes
            </p>
            <p className="mt-1 font-display text-base font-medium">
              {formatDateTime(tender.closingDate)}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Procurement details">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Method</dt>
            <dd className="mt-1 font-medium">{tender.procurementMethod}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Nature</dt>
            <dd className="mt-1 font-medium">{tender.procurementNature}</dd>
          </div>
        </dl>
      </Section>

      <Section title="Contact">
        <div className="space-y-2.5 rounded-xl border border-border bg-card p-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <User className="size-4 shrink-0 text-muted-foreground" />
            {tender.contactPerson}
          </p>
          <a
            href={`mailto:${tender.contactEmail}`}
            className="flex min-w-0 items-center gap-2 text-primary hover:underline"
          >
            <Mail className="size-4 shrink-0" />
            <span className="truncate">{tender.contactEmail}</span>
          </a>
          <a
            href={`tel:${tender.contactPhone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Phone className="size-4 shrink-0" />
            {tender.contactPhone}
          </a>
        </div>
      </Section>

      <Section title="Description">
        <p className="text-sm leading-relaxed text-foreground/90">{tender.description}</p>
      </Section>
    </div>
  );
}

type OverrideLabel = "Strong Match" | "Possible Match" | "Not Relevant" | "Unrated";

const overrideOptions: OverrideLabel[] = [
  "Strong Match",
  "Possible Match",
  "Not Relevant",
  "Unrated",
];

function RelevanceControl({ tender }: { tender: Tender }) {
  const suggested = relevanceStrength[tender.relevance.label].text as OverrideLabel;
  const [value, setValue] = useState<OverrideLabel>(suggested);
  const [draft, setDraft] = useState<OverrideLabel>(suggested);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [changedAt, setChangedAt] = useState<Date | null>(null);

  useEffect(() => {
    setValue(suggested);
    setDraft(suggested);
    setNote("");
    setSavedNote("");
    setChangedAt(null);
  }, [tender.tenderId, suggested]);

  const dirty = draft !== value || note !== savedNote;

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Relevance</span>
        <Select value={draft} onValueChange={(v) => setDraft(v as OverrideLabel)}>
          <SelectTrigger
            className="h-9 w-auto min-w-[11rem] rounded-full border-border bg-card text-sm"
            aria-label="Override relevance"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {overrideOptions.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">AI suggested: {suggested}</span>
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted-foreground">
          Why did this change? (optional)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="e.g. Scope is facilities management, not medical equipment."
          className="mt-1.5 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => {
            setValue(draft);
            setSavedNote(note);
            setChangedAt(new Date());
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          <Check className="size-4" />
          Save
        </button>
        {changedAt && (
          <span className="text-xs text-muted-foreground">
            Last changed by Angel on {formatDateTime(changedAt.toISOString())}
          </span>
        )}
      </div>
      {changedAt && savedNote && (
        <p className="mt-2 text-xs text-muted-foreground italic">“{savedNote}”</p>
      )}
    </div>
  );
}

function MatchedContracts({ tender }: { tender: Tender }) {
  const matches = matchedContracts({
    title: tender.title,
    category: tender.category,
    keywords: tender.relevance.matchedKeywords,
  });

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Matched awarded contracts
      </p>

      {matches.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          No awarded contracts matched automatically.
        </p>
      ) : (
        <ul className="mt-2 space-y-2">
          {matches.map((m) => (
            <li
              key={m.entry.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-card p-3"
            >
              <span className="font-mono text-xs text-muted-foreground">{m.entry.id}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {m.matchedOn.join(", ")}
              </span>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                  matchStrengthStyles[m.strength],
                )}
              >
                {m.strength} Match
              </span>
              <Link
                to="/library"
                search={{ entry: m.entry.id, fromTender: tender.tenderId }}
                className="shrink-0 text-sm font-semibold text-library hover:underline"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/library"
        search={{ fromTender: tender.tenderId }}
        className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:bg-surface"
      >
        <LinkIcon className="size-4 text-muted-foreground" />
        Link to Library
      </Link>
    </div>
  );
}
