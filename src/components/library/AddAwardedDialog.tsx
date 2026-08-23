import { useRef, useState } from "react";
import { Loader2, Sparkle, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { libraryCategories, type AwardedTender, type FieldMeta, type LineItem } from "@/lib/library";

type ExtractedRow = LineItem & { tenderId: string };

const EXTRACTED_PREVIEW: {
  tenderId: string;
  itqRef: string;
  agency: string;
  customer: string;
  rows: ExtractedRow[];
} = {
  tenderId: "HQ20260311A",
  itqRef: "HQ20260311",
  agency: "ALPS Pte Ltd",
  customer: "Khoo Teck Puat Hospital",
  rows: [
    {
      tenderId: "HQ20260311A",
      sku: "EM-VENT-9200",
      productName: "ICU Ventilator V9200",
      brandModel: "Aeris Medical V9200",
      qty: 6,
      unitPrice: 47_900,
      warranty: "5 years",
      notes: null,
    },
    {
      tenderId: "HQ20260311A",
      sku: "EM-MON-540",
      productName: "Patient Monitor M540",
      brandModel: "Aeris Medical M540",
      qty: 8,
      unitPrice: 12_100,
      warranty: "3 years",
      notes: null,
    },
  ],
};

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input id={id} className="h-10 rounded-xl" {...props} />
    </div>
  );
}

export function AddAwardedDialog({
  open,
  onOpenChange,
  onSave,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: AwardedTender) => void;
  editing?: AwardedTender | null;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [extracted, setExtracted] = useState<typeof EXTRACTED_PREVIEW | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const runExtraction = () => {
    setExtracted(null);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setExtracted(EXTRACTED_PREVIEW);
    }, 1600);
  };

  const handleManualSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const qty = Number(get("qty")) || 1;
    const unitPrice = Number(get("price")) || 0;
    const start = new Date(get("startDate") || Date.now());
    const end = get("endDate")
      ? new Date(get("endDate"))
      : new Date(start.getTime() + 730 * 86_400_000);
    const loa = get("tenderId") || "LOA (pending)";
    onSave({
      id: editing?.id ?? (get("tenderId") || `AWD-NEW-${Date.now().toString().slice(-4)}`),
      loaNumber: loa,
      itqRef: get("itqRef") || null,
      awardingAgency: get("agency") || "Unspecified agency",
      endCustomer: get("customer") || "Unspecified institution",
      category: get("category") || libraryCategories[0]!,
      contractStart: start.toISOString(),
      contractEnd: end.toISOString(),
      contractDuration: get("duration") || "—",
      warrantyPeriod: get("warranty") || "1 year",
      totalPrice: qty * unitPrice,
      lineItems: [
        {
          sku: get("sku") || "—",
          productName: get("productName") || "Unnamed product",
          brandModel: get("brandModel") || null,
          qty,
          unitPrice,
          warranty: get("warranty") || "1 year",
          notes: null,
        },
      ],
      documents: editing?.documents ?? [],
      notes: null,
    });
    onOpenChange(false);
  };

  const saveExtracted = () => {
    if (!extracted) return;
    const total = extracted.rows.reduce((sum, r) => sum + (r.qty ?? 0) * (r.unitPrice ?? 0), 0);
    const fieldMeta: Record<string, FieldMeta> = Object.fromEntries(
      [
        "loaNumber",
        "itqRef",
        "awardingAgency",
        "endCustomer",
        "totalPrice",
        "lineItems",
      ].map((k) => [k, { source: "ai" as const }]),
    );
    onSave({
      id: extracted.tenderId,
      loaNumber: extracted.tenderId,
      itqRef: extracted.itqRef,
      awardingAgency: extracted.agency,
      endCustomer: extracted.customer,
      category: "ICU",
      contractStart: new Date().toISOString(),
      contractEnd: new Date(Date.now() + 730 * 86_400_000).toISOString(),
      contractDuration: "2 years",
      warrantyPeriod: "5 years",
      totalPrice: total,
      lineItems: extracted.rows.map(({ tenderId: _t, ...rest }) => rest),
      documents: [{ name: "Imported-contract.pdf", size: "1.1 MB" }],
      notes: "Imported from contract PDF via AI extraction.",
      fieldMeta,
    });
    setExtracted(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit awarded tender" : "Add awarded tender"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Manual field editing only — the source document is locked and cannot be replaced. To record a renewal or amendment, create a new entry instead."
              : "Record a past win manually, or import a contract PDF and let AI extract the details."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList className="rounded-full">
            <TabsTrigger value="manual" className="rounded-full">
              Manual entry
            </TabsTrigger>
            {!editing && (
              <TabsTrigger value="ai" className="rounded-full">
                AI import
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleManualSave} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Tender ID / LOA Number"
                  name="tenderId"
                  defaultValue={editing?.loaNumber ?? ""}
                  placeholder="HQ2024025A"
                />
                <Field
                  label="ITQ / Reference Number"
                  name="itqRef"
                  defaultValue={editing?.itqRef ?? ""}
                  placeholder="HQ2024025"
                />
                <Field
                  label="Awarding Agency"
                  name="agency"
                  defaultValue={editing?.awardingAgency ?? ""}
                  placeholder="ALPS Pte Ltd"
                />
                <Field
                  label="End Customer / Institution"
                  name="customer"
                  defaultValue={editing?.endCustomer ?? ""}
                  placeholder="National Heart Centre Singapore"
                />
                <Field
                  label="SKU / Part Number"
                  name="sku"
                  defaultValue={editing?.lineItems[0]?.sku ?? ""}
                  placeholder="AND.TM2657P"
                />
                <Field
                  label="Product name / Description"
                  name="productName"
                  defaultValue={editing?.lineItems[0]?.productName ?? ""}
                  placeholder="Electronic Sphygmomanometer"
                />
                <Field
                  label="Brand & Model"
                  name="brandModel"
                  defaultValue={editing?.lineItems[0]?.brandModel ?? ""}
                  placeholder="A&D Medical TM2657P"
                />
                <Field
                  label="Quantity (first order)"
                  name="qty"
                  type="number"
                  min={1}
                  defaultValue={editing?.lineItems[0]?.qty ?? 1}
                />
                <Field
                  label="Unit Price (SGD, excl. GST)"
                  name="price"
                  type="number"
                  min={0}
                  defaultValue={editing?.lineItems[0]?.unitPrice ?? ""}
                />
                <Field
                  label="Warranty period"
                  name="warranty"
                  defaultValue={editing?.warrantyPeriod ?? ""}
                  placeholder="3 years"
                />
                <Field
                  label="Contract Start Date"
                  name="startDate"
                  type="date"
                  defaultValue={editing ? editing.contractStart.slice(0, 10) : ""}
                />
                <Field
                  label="Contract End Date"
                  name="endDate"
                  type="date"
                  defaultValue={editing ? editing.contractEnd.slice(0, 10) : ""}
                />
                <Field
                  label="Contract Duration"
                  name="duration"
                  defaultValue={editing?.contractDuration ?? ""}
                  placeholder="5 years / 3+2 years"
                />
                <Field label="Category" name="category" defaultValue={editing?.category ?? "ICU"} />
              </div>

              {!editing && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Attach document</Label>
                  <Input type="file" accept="application/pdf" className="h-10 rounded-xl" />
                  <p className="text-xs text-muted-foreground">
                    The document is locked to this entry once saved and cannot be replaced later.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-library px-5 py-2.5 text-sm font-semibold text-library-foreground hover:bg-library/90"
                >
                  {editing ? "Save changes" : "Add to library"}
                </button>
              </div>
            </form>
          </TabsContent>

          {!editing && (
            <TabsContent value="ai">
              <div className="space-y-4">
                <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                  <Upload className="mx-auto size-6 text-library" />
                  <p className="mt-2 text-sm font-medium">Upload a contract, LOA or award PDF</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    AI will extract Tender ID, SKU/part numbers, prices, warranty, and maintenance
                    charges into an editable table below. Please review every field before saving —
                    extraction is not always 100% accurate.
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={runExtraction}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-4 rounded-full bg-library px-5 py-2.5 text-sm font-semibold text-library-foreground hover:bg-library/90"
                  >
                    Choose file
                  </button>
                </div>

                {analyzing && (
                  <p className="flex items-center justify-center gap-2 rounded-xl border border-ai/20 bg-ai/6 p-4 text-sm font-medium text-ai">
                    <Loader2 className="size-4 animate-spin" /> Analyzing document...
                  </p>
                )}

                {extracted && (
                  <div className="space-y-3">
                    <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-ai uppercase">
                      <Sparkle className="size-3.5" /> Editable preview — review before saving
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Tender ID / LOA Number" defaultValue={extracted.tenderId} />
                      <Field label="ITQ / Reference Number" defaultValue={extracted.itqRef} />
                      <Field label="Awarding Agency" defaultValue={extracted.agency} />
                      <Field label="End Customer / Institution" defaultValue={extracted.customer} />
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full min-w-[34rem] text-left text-sm">
                        <thead className="bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
                          <tr>
                            <th className="px-3 py-2.5">SKU / Part No.</th>
                            <th className="px-3 py-2.5">Product</th>
                            <th className="px-3 py-2.5">Brand &amp; Model</th>
                            <th className="px-3 py-2.5">Qty</th>
                            <th className="px-3 py-2.5">Unit price (excl. GST)</th>
                            <th className="px-3 py-2.5">Warranty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extracted.rows.map((row) => (
                            <tr key={row.sku} className="border-t border-border">
                              <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                              <td className="px-3 py-2">{row.productName}</td>
                              <td className="px-3 py-2 text-muted-foreground">{row.brandModel}</td>
                              <td className="px-3 py-2">{row.qty}</td>
                              <td className="px-3 py-2">
                                {row.unitPrice?.toLocaleString("en-SG", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{row.warranty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={saveExtracted}
                        className="rounded-full bg-library px-5 py-2.5 text-sm font-semibold text-library-foreground hover:bg-library/90"
                      >
                        Save to library
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
