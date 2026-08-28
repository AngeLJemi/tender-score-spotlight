import { useState, useMemo } from "react";
import {
  Archive,
  Building2,
  CalendarDays,
  Calculator,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Info,
  Layers,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "@/components/tenders/RelevanceBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatMoney,
  formatMoneyCents,
  getItemPrimaryPrice,
  type LineItem,
  type PricingTier,
  type TenderLibraryItem,
} from "@/lib/library";

/** Clean Pricing & Warranty Display Component (replaces interactive slider) */
function PricingAndWarrantyView({ item }: { item: LineItem }) {
  const tiers = item.pricing?.tiers ?? [];
  const multiYear = item.pricing?.multiYear ?? [];
  const warranty = item.warranty;

  return (
    <div className="space-y-4">
      {/* Warranty Coverage */}
      {warranty && (warranty.duration || warranty.type) && (
        <div className="rounded-xl border border-border bg-surface/50 p-4">
          <div className="flex items-start gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary mt-0.5">
              <ShieldCheck className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Warranty &amp; Coverage
              </h4>
              <p className="mt-1 text-xs font-semibold text-foreground leading-relaxed">
                {warranty.duration ? `${warranty.duration} ${warranty.unit || "months"}` : ""}
                {warranty.type ? ` · ${warranty.type}` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contract Pricing & Volume Tiers Section */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Package className="size-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-foreground">Contract Pricing</h4>
              <p className="text-xs text-muted-foreground">
                Official contracted unit pricing and volume tiers (excl. GST).
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Unit Price (excl. GST)
            </span>
            <span className="font-display text-lg font-extrabold text-foreground">
              {formatMoneyCents(item.pricing?.unitPrice)} {item.pricing?.currency || "SGD"}
            </span>
          </div>
        </div>

        {/* Volume Tier Matrix */}
        {tiers.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Contract Volume Tier Matrix
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((t) => (
                <div
                  key={t.tier}
                  className="rounded-xl border border-border bg-surface/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Tier {t.tier}</span>
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      Qty: {t.quantityMin} {t.quantityMax ? `– ${t.quantityMax} units` : "+ units"}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-base font-extrabold text-foreground">
                    {formatMoneyCents(t.unitPrice)}
                    <span className="text-[10px] font-normal text-muted-foreground"> / unit</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Year Escalation Ladder */}
        {multiYear.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
              Multi-Year Fixed Price Escalation
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {multiYear.map((my) => (
                <div
                  key={my.year}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3"
                >
                  <span className="text-xs font-medium text-muted-foreground">{my.year}</span>
                  <span className="font-display text-sm font-bold text-foreground">
                    {formatMoneyCents(my.unitPrice)} {my.currency} / unit
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Interactive Accessory Quoter with Checkboxes & Running Total */
function AccessoriesQuoter({
  accessories,
}: {
  accessories: { description: string; unitPrice: number; currency: string }[];
}) {
  const [filter, setFilter] = useState("");
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const filtered = useMemo(() => {
    if (!filter) return accessories.map((item, idx) => ({ ...item, originalIdx: idx }));
    return accessories
      .map((item, idx) => ({ ...item, originalIdx: idx }))
      .filter((a) => a.description.toLowerCase().includes(filter.toLowerCase()));
  }, [accessories, filter]);

  const toggleAccessory = (originalIdx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(originalIdx) ? prev.filter((i) => i !== originalIdx) : [...prev, originalIdx],
    );
  };

  const selectedTotal = useMemo(() => {
    return selectedIndices.reduce((sum, idx) => sum + (accessories[idx]?.unitPrice ?? 0), 0);
  }, [accessories, selectedIndices]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search accessories &amp; add-ons..."
            className="h-9 w-full rounded-full border border-border bg-card pr-3 pl-9 text-xs outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {selectedIndices.length > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3.5 py-1 text-xs">
            <span className="font-semibold text-primary">
              {selectedIndices.length} Selected Add-on{selectedIndices.length === 1 ? "" : "s"}:
            </span>
            <span className="font-display font-bold text-foreground">
              +{formatMoneyCents(selectedTotal)} SGD
            </span>
            <button
              type="button"
              onClick={() => setSelectedIndices([])}
              className="ml-1 text-[10px] text-muted-foreground underline hover:text-foreground"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-muted/90 text-[10px] font-bold tracking-wider text-muted-foreground uppercase backdrop-blur-sm">
            <tr>
              <th className="w-10 px-3 py-2.5 text-center">Select</th>
              <th className="px-3 py-2.5 font-semibold">Accessory Description</th>
              <th className="px-3 py-2.5 text-right font-semibold">Contract Unit Price (excl. GST)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item) => {
              const isChecked = selectedIndices.includes(item.originalIdx);
              return (
                <tr
                  key={item.originalIdx}
                  onClick={() => toggleAccessory(item.originalIdx)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-surface/80",
                    isChecked && "bg-primary/5 font-medium",
                  )}
                >
                  <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleAccessory(item.originalIdx)}
                      className="size-4 cursor-pointer rounded accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2.5 text-xs">
                    {item.description}
                  </td>
                  <td className="px-3 py-2.5 text-right font-display text-xs font-bold text-foreground whitespace-nowrap">
                    {formatMoneyCents(item.unitPrice)} {item.currency}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AwardedDetail({
  entry,
  onEdit,
  onAdd,
  backLink,
}: {
  entry: TenderLibraryItem;
  onEdit?: () => void;
  onAdd?: () => void;
  backLink?: React.ReactNode;
}) {
  const primaryPrice = getItemPrimaryPrice(entry);
  const spareParts = entry.commercialPricing?.spareParts ?? [];
  const accessories = entry.commercialPricing?.optionalAccessories ?? [];
  const pmSchedules = entry.commercialPricing?.maintenanceAndService?.preventiveMaintenance ?? [];
  const breakdownRepairs = entry.commercialPricing?.maintenanceAndService?.breakdownRepair ?? [];
  const terms = entry.termsAndConditions ?? {};
  const firstLine = entry.lineItems[0];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Dossier Header */}
      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {backLink}

        {/* Top Badges & LOA / ITQ references */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 font-mono text-xs font-bold text-foreground">
              LOA: {entry.loaNumber}
            </span>
            {entry.itqNumber && (
              <span className="inline-flex items-center rounded-md bg-surface border border-border px-2 py-1 font-mono text-xs text-muted-foreground">
                ITQ Ref: {entry.itqNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-open/15 px-3 py-1 text-xs font-bold text-open">
              <CheckCircle2 className="size-3.5" /> {entry.status}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-bold tracking-wider text-accent-foreground uppercase">
              <Archive className="size-3" /> Contract Dossier
            </span>
          </div>
        </div>

        {/* Contract Title & Institution Hierarchy */}
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground">
          {firstLine?.productName || entry.category}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="size-4 text-primary" />
            <strong className="font-semibold text-foreground">{entry.awardingAgency}</strong>
          </span>
          <span>•</span>
          <span className="truncate">End Customer: {entry.endCustomer}</span>
        </div>

        {/* Key Contract Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag>{entry.category}</Tag>
          {entry.contract?.duration && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="size-3.5" /> Term: {entry.contract.duration}
            </span>
          )}
          {entry.contract?.startDate && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <CalendarDays className="size-3.5" /> {entry.contract.startDate}
              {entry.contract.endDate ? ` → ${entry.contract.endDate}` : ""}
            </span>
          )}
        </div>

        {/* Financial KPI Banner */}
        <div className="mt-5 grid gap-4 rounded-xl border border-border bg-surface/70 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {primaryPrice.label}
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold text-foreground">
              {formatMoney(primaryPrice.amount, entry.contractValue?.currency)}
            </p>
            <p className="text-[11px] text-muted-foreground">Excl. GST · Applicable under ALPS Master Contract</p>
          </div>

          <div className="border-t border-border pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Warranty &amp; Service Coverage
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-display text-lg font-bold text-foreground">
              <ShieldCheck className="size-5 text-primary" />
              {firstLine?.warranty?.duration
                ? `${firstLine.warranty.duration} ${firstLine.warranty.unit || "months"}`
                : "On-Site Comprehensive"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {firstLine?.warranty?.type || "Includes preventive maintenance and parts warranty"}
            </p>
          </div>
        </div>

      </header>

      {/* 5-Tab Structured Intelligence Workspace */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1 sm:grid-cols-5">
          <TabsTrigger value="products" className="rounded-lg text-xs font-semibold">
            <Package className="mr-1.5 size-3.5" /> Line Items
          </TabsTrigger>
          <TabsTrigger value="commercial" className="rounded-lg text-xs font-semibold">
            <Wrench className="mr-1.5 size-3.5" /> Spares &amp; Add-ons
          </TabsTrigger>
          <TabsTrigger value="service" className="rounded-lg text-xs font-semibold">
            <ShieldCheck className="mr-1.5 size-3.5" /> Maintenance (PM)
          </TabsTrigger>
          <TabsTrigger value="terms" className="rounded-lg text-xs font-semibold">
            <FileText className="mr-1.5 size-3.5" /> Contract Terms
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-lg text-xs font-semibold">
            <Download className="mr-1.5 size-3.5" /> Source PDF
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Products & Tiered Pricing */}
        <TabsContent value="products" className="mt-4 space-y-5">
          {entry.lineItems.map((item, idx) => (
            <div key={idx} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">
                    Item #{idx + 1} {item.skuPartNumber ? `· SKU: ${item.skuPartNumber}` : ""}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-bold">{item.productName}</h3>
                  {(item.brand || item.model || item.manufacturer) && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Brand: <span className="font-semibold text-foreground">{item.brand || "—"}</span> · Model:{" "}
                      <span className="font-semibold text-foreground">{item.model || "—"}</span>
                      {item.manufacturer ? ` · Mfg: ${item.manufacturer}` : ""}
                    </p>
                  )}
                </div>

                {item.quantity != null && (
                  <span className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground">
                    First Order Qty: {item.quantity} units
                  </span>
                )}
              </div>

              {item.description && (
                <p className="rounded-xl border border-border/70 bg-surface/50 p-3.5 text-xs leading-relaxed text-foreground/90">
                  {item.description}
                </p>
              )}

              {/* Technical Specifications */}
              {item.specifications && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Specifications
                  </p>
                  <div className="grid gap-2.5 rounded-xl border border-border bg-surface/50 p-3.5 sm:grid-cols-2 lg:grid-cols-4">
                    {item.specifications.dimensions && (
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Dimensions</p>
                        <p className="mt-0.5 text-xs font-medium text-foreground">{item.specifications.dimensions}</p>
                      </div>
                    )}
                    {item.specifications.delivery && (
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Delivery SLA</p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-foreground">
                          <Truck className="size-3.5 text-primary" /> {item.specifications.delivery}
                        </p>
                      </div>
                    )}
                    {item.specifications.installation && (
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Installation</p>
                        <p className="mt-0.5 text-xs font-medium text-foreground">{item.specifications.installation}</p>
                      </div>
                    )}
                    {item.specifications.commissioning && (
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Commissioning</p>
                        <p className="mt-0.5 text-xs font-medium text-foreground">{item.specifications.commissioning}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pricing & Warranty View */}
              <PricingAndWarrantyView item={item} />
            </div>
          ))}
        </TabsContent>

        {/* TAB 2: Commercial Pricing (Spare Parts & Accessories) */}
        <TabsContent value="commercial" className="mt-4 space-y-6">
          {/* Spare Parts Catalogue */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Contract Spare Parts Price Schedule</h3>
                  <p className="text-xs text-muted-foreground">
                    Fixed price spare parts held firm under contract terms.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                {spareParts.length} Parts Listed
              </span>
            </div>

            {spareParts.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground italic">
                No specific spare parts catalogue attached to this tender record.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/70 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3 py-2.5">Part No.</th>
                      <th className="px-3 py-2.5">Description</th>
                      <th className="px-3 py-2.5 text-right">Contract Price</th>
                      <th className="px-3 py-2.5">Lead Time</th>
                      <th className="px-3 py-2.5">Price Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {spareParts.map((sp) => (
                      <tr key={sp.partNumber} className="hover:bg-surface/50">
                        <td className="px-3 py-2.5 font-mono font-bold text-foreground">{sp.partNumber}</td>
                        <td className="px-3 py-2.5 font-medium">{sp.description}</td>
                        <td className="px-3 py-2.5 text-right font-display font-bold text-foreground whitespace-nowrap">
                          {formatMoneyCents(sp.pricing.unitPrice)} <span className="text-[10px] text-muted-foreground">{sp.pricing.unit}</span>
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{sp.delivery.leadTime}</td>
                        <td className="px-3 py-2.5 text-primary font-medium">{sp.priceValidity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Optional Accessories Quoter */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Package className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">Optional Accessories &amp; Upgrades Catalogue</h3>
                  <p className="text-xs text-muted-foreground">
                    Select optional accessories to calculate an instant add-on quote total.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                {accessories.length} Accessories
              </span>
            </div>

            {accessories.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground italic">
                No optional accessories listed for this contract.
              </p>
            ) : (
              <div className="mt-3">
                <AccessoriesQuoter accessories={accessories} />
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: Maintenance & Service (PM/CM) */}
        <TabsContent value="service" className="mt-4 space-y-6">
          {/* Preventive Maintenance */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">Preventive Maintenance (PM) Schedule</h3>
                <p className="text-xs text-muted-foreground">
                  Scheduled preventive servicing rates per system across the multi-year contract term.
                </p>
              </div>
            </div>

            {pmSchedules.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground italic">
                No preventive maintenance schedule specified in this contract record.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {pmSchedules.map((pm, idx) => (
                  <div key={idx} className="rounded-xl border border-border bg-surface/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
                      <p className="text-xs font-bold text-foreground">{pm.serviceType}</p>
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                        Basis: {pm.pricingBasis}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-5">
                      {pm.yearlyPricing.map((yp) => (
                        <div key={yp.year} className="rounded-lg border border-border bg-card p-2.5 text-center">
                          <span className="block text-[11px] font-medium text-muted-foreground">{yp.year}</span>
                          <span className="mt-1 block font-display text-sm font-bold text-foreground">
                            {formatMoneyCents(yp.unitPrice)}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{yp.currency} / system</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Breakdown Repair Charges */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Zap className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">Breakdown Repair &amp; Corrective Maintenance Rates</h3>
                <p className="text-xs text-muted-foreground">
                  Standard labour and response SLA rates based on service contract status.
                </p>
              </div>
            </div>

            {breakdownRepairs.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground italic">
                Standard institutional hospital rates apply.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/70 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    <tr>
                      <th className="px-3 py-2.5">Service Condition &amp; Response SLA</th>
                      <th className="px-3 py-2.5">Unit of Measurement</th>
                      <th className="px-3 py-2.5 text-right">Contracted Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {breakdownRepairs.map((br, idx) => (
                      <tr key={idx} className="hover:bg-surface/50">
                        <td className="px-3 py-2.5 font-medium">{br.description}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{br.unitOfMeasurement}</td>
                        <td className="px-3 py-2.5 text-right font-display font-bold text-foreground whitespace-nowrap">
                          {br.unitPrice === 0 ? (
                            <span className="text-open">Free-of-charge ($0.00)</span>
                          ) : (
                            `${formatMoneyCents(br.unitPrice)} ${br.currency}`
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* TAB 4: Contract Terms & Conditions */}
        <TabsContent value="terms" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {terms.commitment?.description && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Info className="size-3.5 text-primary" /> Annual Commitment &amp; Aggregation
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {terms.commitment.description}
                </p>
              </div>
            )}

            {terms.orderTerms?.description && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <CalendarDays className="size-3.5 text-primary" /> Planned Orders &amp; Deadlines
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {terms.orderTerms.description}
                </p>
              </div>
            )}

            {terms.pricingTerms?.description && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Calculator className="size-3.5 text-primary" /> Tier Consolidation Across PHIs
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {terms.pricingTerms.description}
                </p>
              </div>
            )}

            {terms.reconciliation && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <TrendingDown className="size-3.5 text-primary" /> Year-End Reconciliation &amp; Rebates
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {terms.reconciliation.frequency && <p>• <strong>Frequency:</strong> {terms.reconciliation.frequency}</p>}
                  {terms.reconciliation.rebateCondition && <p>• <strong>Rebate:</strong> {terms.reconciliation.rebateCondition}</p>}
                  {terms.reconciliation.rebateTimeline && <p>• <strong>Rebate SLA:</strong> {terms.reconciliation.rebateTimeline}</p>}
                  {terms.reconciliation.underpaymentCondition && <p>• <strong>Adjustment:</strong> {terms.reconciliation.underpaymentCondition}</p>}
                </div>
              </div>
            )}

            {terms.delivery && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Truck className="size-3.5 text-primary" /> Delivery &amp; Lead Time SLAs
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {terms.delivery.leadTime && <p>• <strong>Standard Lead Time:</strong> {terms.delivery.leadTime}</p>}
                  {terms.delivery.condition && <p>• <strong>Terms:</strong> {terms.delivery.condition}</p>}
                </div>
              </div>
            )}

            {terms.training && (
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Sparkles className="size-3.5 text-primary" /> Training &amp; Application Support
                </p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {terms.training.initialTraining && <p>• <strong>Initial Training:</strong> {terms.training.initialTraining}</p>}
                  {terms.training.additionalTraining && <p>• <strong>Additional:</strong> {terms.training.additionalTraining}</p>}
                </div>
              </div>
            )}
          </div>

          {terms.warrantyDisclaimer?.description && (
            <div className="rounded-2xl border border-border bg-surface/50 p-4">
              <p className="text-xs font-semibold text-foreground">Warranty Disclaimer &amp; Consumables Scope</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {terms.warrantyDisclaimer.description}
              </p>
            </div>
          )}
        </TabsContent>

        {/* TAB 5: Source Document & Provenance */}
        <TabsContent value="documents" className="mt-4 space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold">Attached Source Agreement / Award Letter</h3>
            <p className="text-xs text-muted-foreground">
              Official legal document from which this library record was indexed.
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface/60 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </span>
                <div>
                  <p className="font-semibold text-sm text-foreground">{entry.sourceDocument?.fileName || "Award-Agreement.pdf"}</p>
                  <p className="text-xs text-muted-foreground">Official Award LOA &amp; Price Schedule</p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted"
                onClick={() => alert(`Opening ${entry.sourceDocument?.fileName}`)}
              >
                <Download className="size-3.5" /> Download PDF
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-border/80 bg-surface/40 p-4 text-xs text-muted-foreground space-y-1.5">
              <p className="font-semibold text-foreground">Record Integrity &amp; Provenance</p>
              <p>• Indexed from official LOA issued by {entry.awardingAgency}.</p>
              <p>• Price validity and terms held firm as per contract schedule.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
