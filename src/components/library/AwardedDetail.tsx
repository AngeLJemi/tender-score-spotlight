import { Fragment } from "react";
import {
  Archive,
  CalendarDays,
  Download,
  FileText,
  Pencil,
  Plus,
  Sparkle,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/tenders/RelevanceBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "./LibraryCard";
import {
  formatDate,
  formatMoney,
  formatMoneyCents,
  type AwardedTender,
  type FieldMeta,
  type LineItem,
} from "@/lib/library";

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

/** Provenance tag: "AI-extracted" until a human edits the field. */
export function FieldTag({ meta, className }: { meta?: FieldMeta; className?: string }) {
  if (!meta) return null;
  if (meta.source === "ai") {
    return (
      <span
        className={cn(
          "ml-1.5 inline-flex items-center gap-1 rounded-full bg-ai/10 px-1.5 py-0.5 align-middle text-[9px] font-semibold tracking-wide text-ai uppercase",
          className,
        )}
      >
        <Sparkle className="size-2.5" /> AI-extracted
      </span>
    );
  }
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex items-center rounded-full bg-open/10 px-1.5 py-0.5 align-middle text-[9px] font-semibold tracking-wide text-open uppercase",
        className,
      )}
    >
      Edited by {meta.by} on {meta.date}
    </span>
  );
}

function HeaderField({
  label,
  value,
  meta,
}: {
  label: string;
  value: React.ReactNode;
  meta?: FieldMeta;
}) {
  return (
    <div>
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-medium">
        {value}
        <FieldTag meta={meta} />
      </p>
    </div>
  );
}

function TieredPricingTable({ item }: { item: LineItem }) {
  if (!item.tieredPricing?.length) return null;
  return (
    <div className="mt-2 rounded-lg border border-library/15 bg-library-tint/60 p-3">
      <p className="text-[11px] font-semibold tracking-wide text-library uppercase">
        Tiered / multi-year pricing (SGD, excl. GST)
      </p>
      <table className="mt-2 w-full text-left text-xs">
        <thead className="text-[10px] tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="pr-3 pb-1.5 font-semibold">Tier / Year</th>
            <th className="pb-1.5 font-semibold">Unit price</th>
          </tr>
        </thead>
        <tbody>
          {item.tieredPricing.map((t) => (
            <tr key={t.label} className="border-t border-library/10">
              <td className="py-1.5 pr-3">{t.label}</td>
              <td className="py-1.5 font-medium">{formatMoneyCents(t.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AwardedDetail({
  entry,
  onEdit,
  onAdd,
  backLink,
}: {
  entry: AwardedTender;
  onEdit: () => void;
  onAdd: () => void;
  backLink?: React.ReactNode;
}) {
  const meta = entry.fieldMeta ?? {};
  const firstUnit = entry.lineItems.find((l) => l.unitPrice != null)?.unitPrice ?? null;

  return (
    <div className="flex flex-col gap-5">
      <header className="border-b border-library/15 bg-library-band/60 p-6">
        {backLink}
        <div className="flex items-start justify-between gap-3">
          <p className="inline-flex items-center rounded-md bg-library/10 px-2 py-0.5 font-mono text-[11px] tracking-wide text-library">
            {entry.id}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-library/25 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-library/70 uppercase">
            <Archive className="size-3" /> Awarded contract
          </span>
        </div>
        <h2 className="mt-1.5 text-2xl leading-tight font-semibold text-library">
          {entry.loaNumber}
        </h2>
        <p className="mt-1.5 text-muted-foreground">
          {entry.awardingAgency} · {entry.endCustomer}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag>{entry.category}</Tag>
          <StatusBadge entry={entry} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-3.5" /> {formatDate(entry.contractStart)} –{" "}
            {formatDate(entry.contractEnd)}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {entry.contractDuration}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-library/15 bg-card p-4">
          <div>
            <p className="text-sm text-muted-foreground">
              {entry.totalPrice != null ? "Contract Value (First Order)" : "Unit Price (Tier 1)"}
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-library">
              {formatMoney(entry.totalPrice ?? firstUnit ?? 0)}
            </p>
            <p className="text-[11px] text-muted-foreground">excl. GST</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Warranty</p>
            <p className="mt-1 font-display text-lg font-semibold">{entry.warrantyPeriod}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-full bg-library px-4 py-2.5 text-sm font-semibold text-library-foreground transition-colors hover:bg-library/90"
          >
            <Plus className="size-4" /> Add to Library
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            <Pencil className="size-4" /> Edit Entry
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-6 pb-6">
        <p className="flex items-start gap-2.5 rounded-xl border border-ai/25 bg-ai/6 p-3.5 text-xs leading-relaxed text-foreground/85">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-ai" />
          <span>
            This record was extracted by AI from the source document. AI extraction can
            occasionally misread values — please verify fields against the source PDF before using
            them in a quotation. Edits here update this record only and do not re-run extraction.
          </span>
        </p>

        <Section title="Contract header" className="border-t-0 pt-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
            <HeaderField label="Tender ID / LOA Number" value={entry.loaNumber} meta={meta["loaNumber"]} />
            <HeaderField label="ITQ / Reference Number" value={entry.itqRef ?? "—"} meta={meta["itqRef"]} />
            <HeaderField label="Awarding Agency" value={entry.awardingAgency} meta={meta["awardingAgency"]} />
            <HeaderField label="End Customer / Institution" value={entry.endCustomer} meta={meta["endCustomer"]} />
            <HeaderField label="Contract Start Date" value={formatDate(entry.contractStart)} meta={meta["contractStart"]} />
            <HeaderField label="Contract End Date" value={formatDate(entry.contractEnd)} meta={meta["contractEnd"]} />
            <HeaderField label="Contract Duration" value={entry.contractDuration} meta={meta["contractDuration"]} />
            <HeaderField label="Category" value={entry.category} />
            <HeaderField label="Status" value={<StatusBadge entry={entry} />} />
          </div>
        </Section>

        <Section title="Line items">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">SKU / Part Number</th>
                  <th className="px-3 py-2.5 font-semibold">Product / Description</th>
                  <th className="px-3 py-2.5 font-semibold">Qty</th>
                  <th className="px-3 py-2.5 font-semibold">
                    Unit Price (SGD, excl. GST)
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Warranty Period</th>
                  <th className="px-3 py-2.5 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {entry.lineItems.map((item) => (
                  <Fragment key={item.sku}>
                    <tr className="border-t border-border align-top">
                      <td className="px-3 py-3 font-mono text-xs">{item.sku}</td>
                      <td className="px-3 py-3">
                        <span className="font-medium">{item.productName}</span>
                        {item.brandModel && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Brand &amp; Model: {item.brandModel}
                          </span>
                        )}
                        {item.manufacturer && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Manufacturer: {item.manufacturer}
                          </span>
                        )}
                        {item.dimensions && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Dimensions: {item.dimensions}
                          </span>
                        )}
                        {item.deliveryTerms && (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {item.deliveryTerms}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">{item.qty ?? "—"}</td>
                      <td className="px-3 py-3 font-medium whitespace-nowrap">
                        {item.unitPrice != null ? (
                          <>
                            {formatMoneyCents(item.unitPrice)}
                            <FieldTag meta={meta["lineItems"]} />
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{item.warranty}</td>
                      <td className="max-w-56 px-3 py-3 text-xs text-muted-foreground">
                        {item.notes ?? "—"}
                      </td>
                    </tr>
                    {item.tieredPricing?.length ? (
                      <tr className="border-t border-border/60 bg-library-tint/30">
                        <td colSpan={6} className="px-3 py-2.5">
                          <TieredPricingTable item={item} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {(entry.maintenanceSchedules?.length ||
          entry.repairCharges?.length ||
          entry.spareParts?.length) && (
          <Section title="Maintenance & Service Charges">
            <div className="space-y-4">
              {entry.maintenanceSchedules?.map((schedule) => (
                <div
                  key={schedule.name}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <p className="border-b border-border bg-muted/60 px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                    Preventive Maintenance — {schedule.name}
                    <FieldTag meta={meta["maintenanceSchedules"]} />
                  </p>
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {schedule.rows.map((row) => (
                        <tr key={row.year} className="border-t border-border/60 first:border-t-0">
                          <td className="px-3 py-2 text-muted-foreground">{row.year}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatMoneyCents(row.unitPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {entry.repairCharges?.length ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <p className="border-b border-border bg-muted/60 px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                    Breakdown Repair Charges
                    <FieldTag meta={meta["repairCharges"]} />
                  </p>
                  <table className="w-full text-left text-sm">
                    <thead className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Description</th>
                        <th className="px-3 py-2 font-semibold">Unit of Measurement</th>
                        <th className="px-3 py-2 text-right font-semibold">Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.repairCharges.map((r) => (
                        <tr key={r.description} className="border-t border-border/60">
                          <td className="px-3 py-2">{r.description}</td>
                          <td className="px-3 py-2 text-muted-foreground">{r.uom}</td>
                          <td className="px-3 py-2 text-right font-medium">{r.unitPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {entry.spareParts?.length ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <p className="border-b border-border bg-muted/60 px-3 py-2 text-xs font-semibold tracking-wide uppercase">
                    Spare Parts Pricing (SGD, excl. GST)
                    <FieldTag meta={meta["spareParts"]} />
                  </p>
                  <table className="w-full text-left text-sm">
                    <thead className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Part Description</th>
                        <th className="px-3 py-2 font-semibold">Part Number</th>
                        <th className="px-3 py-2 text-right font-semibold">Unit Price</th>
                        <th className="px-3 py-2 font-semibold">Price held firm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.spareParts.map((p) => (
                        <tr key={p.partNumber} className="border-t border-border/60">
                          <td className="px-3 py-2">{p.description}</td>
                          <td className="px-3 py-2 font-mono text-xs">{p.partNumber}</td>
                          <td className="px-3 py-2 text-right font-medium whitespace-nowrap">
                            {formatMoneyCents(p.unitPrice)} {p.uom}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{p.priceHeldFirm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </Section>
        )}

        {entry.accessoriesNote && (
          <details className="group rounded-xl border border-border bg-card">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-library select-none">
              Optional Accessories{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (click to expand)
              </span>
            </summary>
            <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-muted-foreground">
              {entry.accessoriesNote}
            </p>
          </details>
        )}

        <Section title="Serial numbers">
          <Tabs defaultValue="serials">
            <TabsList className="rounded-full">
              <TabsTrigger value="serials" className="rounded-full">
                Serial numbers
              </TabsTrigger>
            </TabsList>
            <TabsContent value="serials">
              <div className="rounded-xl border border-ai/20 bg-ai/6 p-4">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ai uppercase">
                  <Sparkle className="size-3.5" /> Coming soon
                </p>
                <p className="mt-2 text-sm text-foreground/90">
                  Coming soon: AI mapping of sold items to serial numbers.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Source documents">
          <div className="space-y-2">
            {entry.documents.map((doc) => (
              <div
                key={doc.name}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm"
              >
                <FileText className="size-4 shrink-0 text-library" />
                <span className="min-w-0 flex-1 truncate font-medium">{doc.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{doc.size}</span>
                <button
                  type="button"
                  aria-label={`Download ${doc.name}`}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-library/10 hover:text-library"
                >
                  <Download className="size-4" />
                </button>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              Source documents are locked once the entry is saved. To record a renewal or
              amendment, create a new Library entry via “Add Awarded Tender”.
            </p>
          </div>
        </Section>

        {entry.notes && (
          <Section title="Notes">
            <p className="text-sm leading-relaxed text-foreground/90">{entry.notes}</p>
          </Section>
        )}
      </div>
    </div>
  );
}
