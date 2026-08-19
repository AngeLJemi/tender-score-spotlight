import { CalendarDays, FileText, Paperclip, Pencil, Plus, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/tenders/RelevanceBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "./LibraryCard";
import { formatDate, formatMoney, type AwardedTender } from "@/lib/library";

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

export function AwardedDetail({
  entry,
  onEdit,
  onAdd,
}: {
  entry: AwardedTender;
  onEdit: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 p-6">
      <header>
        <p className="font-mono text-xs tracking-wide text-muted-foreground">{entry.id}</p>
        <h2 className="mt-1.5 text-2xl leading-tight font-semibold">{entry.loaNumber}</h2>
        <p className="mt-1.5 text-muted-foreground">{entry.customer}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag>{entry.category}</Tag>
          <StatusBadge entry={entry} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-3.5" /> Awarded {formatDate(entry.awardDate)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 rounded-xl border border-border bg-surface-strong/60 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Contracted total</p>
            <p className="mt-1 font-display text-lg font-semibold">
              {formatMoney(entry.totalPrice)}
            </p>
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
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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

      <Section title="Line items">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-3 py-2.5 font-semibold">SKU / Product ID</th>
                <th className="px-3 py-2.5 font-semibold">Product name</th>
                <th className="px-3 py-2.5 font-semibold">Qty</th>
                <th className="px-3 py-2.5 font-semibold">Unit price</th>
                <th className="px-3 py-2.5 font-semibold">Warranty</th>
                <th className="px-3 py-2.5 font-semibold">Maintenance</th>
                <th className="px-3 py-2.5 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {entry.lineItems.map((item) => (
                <tr key={item.sku} className="border-t border-border align-top">
                  <td className="px-3 py-3 font-mono text-xs">{item.sku}</td>
                  <td className="px-3 py-3 font-medium">{item.productName}</td>
                  <td className="px-3 py-3">{item.qty}</td>
                  <td className="px-3 py-3">{formatMoney(item.unitPrice)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.warranty}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.maintenanceCharges}</td>
                  <td className="px-3 py-3 text-muted-foreground">{item.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

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
              <FileText className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate font-medium">{doc.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{doc.size}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={onEdit}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            <Paperclip className="size-4" /> Attach contract or LOA document
          </button>
        </div>
      </Section>

      {entry.notes && (
        <Section title="Notes">
          <p className="text-sm leading-relaxed text-foreground/90">{entry.notes}</p>
        </Section>
      )}
    </div>
  );
}
