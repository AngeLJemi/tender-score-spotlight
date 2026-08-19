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
import { libraryCategories, type AwardedTender, type LineItem } from "@/lib/library";

type ExtractedRow = LineItem & { tenderId: string };

const EXTRACTED_PREVIEW: { tenderId: string; customer: string; rows: ExtractedRow[] } = {
  tenderId: "AWD-2026-0031",
  customer: "Khoo Teck Puat Hospital",
  rows: [
    {
      tenderId: "AWD-2026-0031",
      sku: "EM-VENT-9200",
      productName: "ICU Ventilator V9200",
      qty: 6,
      unitPrice: 47_900,
      warranty: "5 years",
      maintenanceCharges: "$3,100 / unit / year",
      notes: null,
    },
    {
      tenderId: "AWD-2026-0031",
      sku: "EM-MON-540",
      productName: "Patient Monitor M540",
      qty: 8,
      unitPrice: 12_100,
      warranty: "3 years",
      maintenanceCharges: "$760 / unit / year",
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
    onSave({
      id: get("tenderId") || `AWD-NEW-${Date.now().toString().slice(-4)}`,
      loaNumber: get("tenderId") || "LOA (pending)",
      customer: get("customer") || "Unspecified agency",
      category: get("category") || libraryCategories[0]!,
      awardDate: new Date(get("awardDate") || Date.now()).toISOString(),
      contractEnd: new Date(
        new Date(get("awardDate") || Date.now()).getTime() + 730 * 86_400_000,
      ).toISOString(),
      warrantyPeriod: get("warranty") || "1 year",
      totalPrice: qty * unitPrice,
      lineItems: [
        {
          sku: get("sku") || "—",
          productName: get("productName") || "Unnamed product",
          qty,
          unitPrice,
          warranty: get("warranty") || "1 year",
          maintenanceCharges: get("maintenance") || "Not applicable",
          notes: null,
        },
      ],
      documents: [],
      notes: null,
    });
    onOpenChange(false);
  };

  const saveExtracted = () => {
    if (!extracted) return;
    const total = extracted.rows.reduce((sum, r) => sum + r.qty * r.unitPrice, 0);
    onSave({
      id: extracted.tenderId,
      loaNumber: `LOA/${extracted.tenderId}`,
      customer: extracted.customer,
      category: "ICU",
      awardDate: new Date().toISOString(),
      contractEnd: new Date(Date.now() + 730 * 86_400_000).toISOString(),
      warrantyPeriod: "5 years",
      totalPrice: total,
      lineItems: extracted.rows.map(({ tenderId: _t, ...rest }) => rest),
      documents: [{ name: "Imported-contract.pdf", size: "1.1 MB" }],
      notes: "Imported from contract PDF via AI extraction.",
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
            Record a past win manually, or import a contract PDF and let AI extract the details.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList className="rounded-full">
            <TabsTrigger value="manual" className="rounded-full">
              Manual entry
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-full">
              AI import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <form onSubmit={handleManualSave} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Tender ID / LOA"
                  name="tenderId"
                  defaultValue={editing?.loaNumber ?? ""}
                  placeholder="LOA/NHG/2026/0001"
                />
                <Field
                  label="Customer / Agency"
                  name="customer"
                  defaultValue={editing?.customer ?? ""}
                  placeholder="National Healthcare Group"
                />
                <Field
                  label="SKU / Product ID"
                  name="sku"
                  defaultValue={editing?.lineItems[0]?.sku ?? ""}
                  placeholder="EM-VENT-9200"
                />
                <Field
                  label="Product name"
                  name="productName"
                  defaultValue={editing?.lineItems[0]?.productName ?? ""}
                  placeholder="ICU Ventilator"
                />
                <Field
                  label="Quantity"
                  name="qty"
                  type="number"
                  min={1}
                  defaultValue={editing?.lineItems[0]?.qty ?? 1}
                />
                <Field
                  label="Contracted unit price (SGD)"
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
                  label="Maintenance charges"
                  name="maintenance"
                  defaultValue={editing?.lineItems[0]?.maintenanceCharges ?? ""}
                  placeholder="$800 / unit / year"
                />
                <Field
                  label="Award date"
                  name="awardDate"
                  type="date"
                  defaultValue={editing ? editing.awardDate.slice(0, 10) : ""}
                />
                <Field label="Category" name="category" defaultValue={editing?.category ?? "ICU"} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Attach document</Label>
                <Input type="file" accept="application/pdf" className="h-10 rounded-xl" />
              </div>

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
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {editing ? "Save changes" : "Add to library"}
                </button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="ai">
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <Upload className="mx-auto size-6 text-primary" />
                <p className="mt-2 text-sm font-medium">Upload a contract, LOA or award PDF</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  AI extracts Tender ID, SKUs, prices, warranty and maintenance charges.
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
                  className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
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
                    <Sparkle className="size-3.5" /> Editable preview
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Tender ID" defaultValue={extracted.tenderId} />
                    <Field label="Customer" defaultValue={extracted.customer} />
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full min-w-[34rem] text-left text-sm">
                      <thead className="bg-muted/60 text-xs tracking-wide text-muted-foreground uppercase">
                        <tr>
                          <th className="px-3 py-2.5">SKU</th>
                          <th className="px-3 py-2.5">Product</th>
                          <th className="px-3 py-2.5">Qty</th>
                          <th className="px-3 py-2.5">Unit price</th>
                          <th className="px-3 py-2.5">Warranty</th>
                          <th className="px-3 py-2.5">Maintenance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extracted.rows.map((row) => (
                          <tr key={row.sku} className="border-t border-border">
                            <td className="px-3 py-2 font-mono text-xs">{row.sku}</td>
                            <td className="px-3 py-2">{row.productName}</td>
                            <td className="px-3 py-2">{row.qty}</td>
                            <td className="px-3 py-2">{row.unitPrice.toLocaleString()}</td>
                            <td className="px-3 py-2 text-muted-foreground">{row.warranty}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {row.maintenanceCharges}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={saveExtracted}
                      className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Save to library
                    </button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
