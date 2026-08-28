import { useRef, useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
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
import {
  libraryCategories,
  type TenderLibraryItem,
} from "@/lib/library";

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = label.toLowerCase().replace(/\W+/g, "-");
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground font-medium">
        {label}
      </Label>
      <Input id={id} className="h-10 rounded-xl bg-card border-border text-sm" {...props} />
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
  onSave: (entry: TenderLibraryItem) => void;
  editing?: TenderLibraryItem | null;
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState<TenderLibraryItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const runExtraction = () => {
    setExtractedPreview(null);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setExtractedPreview({
        id: "HQ20260311A",
        itqNumber: "HQ20260311",
        loaNumber: "HQ20260311A",
        awardingAgency: "ALPS Pte Ltd",
        endCustomer: "Khoo Teck Puat Hospital (KTPH)",
        contract: {
          startDate: "01 April 2026",
          endDate: "31 March 2029",
          duration: "3 years",
        },
        contractValue: {
          amount: 287400.0,
          currency: "SGD",
          type: "first-order",
          taxIncluded: false,
        },
        category: "ICU",
        status: "AWARDED",
        lineItems: [
          {
            skuPartNumber: "EM-VENT-9200",
            productName: "ICU Ventilator System V9200",
            description: "High-acuity intensive care ventilator with invasive and non-invasive ventilation modes.",
            brand: "Aeris Medical",
            model: "V9200 Pro",
            manufacturer: "Aeris Medical Systems",
            quantity: 6,
            specifications: {
              dimensions: "145 (H) x 58 (W) x 62 (D) cm",
              delivery: "60 days from PO",
              installation: "5 days",
              commissioning: "5 days",
            },
            warranty: {
              duration: 5,
              unit: "years",
              type: "5 years comprehensive on-site warranty",
            },
            pricing: {
              unitPrice: 47900.0,
              currency: "SGD",
              taxIncluded: false,
              tiers: [
                { tier: 1, quantityMin: 1, quantityMax: 5, unitPrice: 47900.0 },
                { tier: 2, quantityMin: 6, quantityMax: 10, unitPrice: 45500.0 },
              ],
              multiYear: [],
            },
          },
        ],
        commercialPricing: {
          spareParts: [
            {
              partNumber: "VENT-FLT-01",
              description: "HEPA Expiratory Filter",
              pricing: { unitPrice: 120.0, currency: "SGD", unit: "1/box" },
              delivery: { leadTime: "14 days", basis: null },
              priceValidity: "5 years",
            },
          ],
          optionalAccessories: [
            { description: "Mobile Trolley with Cylinder Holder", unitPrice: 1850.0, currency: "SGD" },
          ],
          maintenanceAndService: {
            preventiveMaintenance: [
              {
                serviceType: "Annual PM & O2 Sensor Calibration",
                pricingBasis: "per system",
                yearlyPricing: [
                  { year: "Year 1", unitPrice: 850.0, currency: "SGD" },
                  { year: "Year 2", unitPrice: 850.0, currency: "SGD" },
                  { year: "Year 3", unitPrice: 900.0, currency: "SGD" },
                ],
              },
            ],
            breakdownRepair: [],
          },
        },
        termsAndConditions: {
          priceValidity: { duration: "3 years", basis: "ALPS Term Contract" },
          training: { initialTraining: "2 days certified clinical training", additionalTraining: null },
        },
        serialNumbers: [],
        sourceDocument: {
          fileName: "ALPS-KTPH-Ventilator-Award-HQ20260311A.pdf",
          documentId: null,
        },
        extraction: {
          method: "ai_vision",
          lastEditedBy: null,
          lastEditedAt: null,
        },
      });
    }, 1500);
  };

  const handleManualSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const qty = Number(get("qty")) || 1;
    const unitPrice = Number(get("price")) || 0;
    const loa = get("loaNumber") || "LOA-NEW";
    const itq = get("itqNumber") || loa;

    const newItem: TenderLibraryItem = {
      id: editing?.id ?? loa,
      loaNumber: loa,
      itqNumber: itq,
      awardingAgency: get("agency") || "ALPS Pte Ltd",
      endCustomer: get("customer") || "Public Healthcare Institutions",
      category: get("category") || libraryCategories[1] || "Medical Equipment",
      contract: {
        startDate: get("startDate") || null,
        endDate: get("endDate") || null,
        duration: get("duration") || "3 years",
      },
      contractValue: {
        amount: qty * unitPrice,
        currency: "SGD",
        type: "first-order",
        taxIncluded: false,
      },
      status: "AWARDED",
      lineItems: [
        {
          skuPartNumber: get("sku") || null,
          productName: get("productName") || "Healthcare Equipment",
          description: get("description") || "",
          brand: get("brand") || null,
          model: get("model") || null,
          manufacturer: get("manufacturer") || null,
          quantity: qty,
          specifications: {
            dimensions: get("dimensions") || null,
            delivery: get("delivery") || null,
            installation: "Included",
            commissioning: "Included",
          },
          warranty: {
            duration: get("warrantyDuration") || 1,
            unit: "year",
            type: "On-site comprehensive warranty",
          },
          pricing: {
            unitPrice: unitPrice,
            currency: "SGD",
            taxIncluded: false,
            tiers: [
              {
                tier: 1,
                quantityMin: 1,
                quantityMax: null,
                unitPrice: unitPrice,
              },
            ],
            multiYear: [],
          },
        },
      ],
      commercialPricing: editing?.commercialPricing ?? {
        spareParts: [],
        optionalAccessories: [],
        maintenanceAndService: {
          preventiveMaintenance: [],
          breakdownRepair: [],
        },
      },
      termsAndConditions: editing?.termsAndConditions ?? {},
      serialNumbers: [],
      sourceDocument: editing?.sourceDocument ?? {
        fileName: "Contract-Document.pdf",
        documentId: null,
      },
      extraction: {
        method: "manual",
        lastEditedBy: "Angel",
        lastEditedAt: new Date().toISOString(),
      },
    };

    onSave(newItem);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {editing ? "Edit Awarded Contract" : "Add Awarded Contract"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {editing
              ? "Update contract fields, pricing tiers, specifications, and warranty details."
              : "Record a new awarded healthcare contract manually or upload an LOA / Award agreement PDF."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="rounded-full">
            <TabsTrigger value="manual" className="rounded-full text-xs">
              Manual Form Entry
            </TabsTrigger>
            {!editing && (
              <TabsTrigger value="ai" className="rounded-full text-xs">
                AI Contract Extractor
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleManualSave} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="LOA / Award Reference Number"
                  name="loaNumber"
                  defaultValue={editing?.loaNumber ?? ""}
                  placeholder="e.g. GPMQ11820-E"
                  required
                />
                <Field
                  label="ITQ / Tender Reference Number"
                  name="itqNumber"
                  defaultValue={editing?.itqNumber ?? ""}
                  placeholder="e.g. GPMQ11820"
                />
                <Field
                  label="Awarding Agency"
                  name="agency"
                  defaultValue={editing?.awardingAgency ?? "ALPS Pte Ltd"}
                  placeholder="e.g. ALPS Pte Ltd"
                  required
                />
                <Field
                  label="End Customer / Institution"
                  name="customer"
                  defaultValue={editing?.endCustomer ?? ""}
                  placeholder="e.g. National Heart Centre Singapore"
                  required
                />
                <Field
                  label="Category"
                  name="category"
                  defaultValue={editing?.category ?? "Medication Trolley"}
                />
                <Field
                  label="Contract Term Duration"
                  name="duration"
                  defaultValue={editing?.contract?.duration ?? "3+2 years"}
                  placeholder="e.g. 5 years or 3+2 years"
                />
                <Field
                  label="Product Name"
                  name="productName"
                  defaultValue={editing?.lineItems[0]?.productName ?? ""}
                  placeholder="e.g. Avalo ACS Medication Cart 10-High"
                  required
                />
                <Field
                  label="Brand &amp; Model"
                  name="brand"
                  defaultValue={editing?.lineItems[0]?.brand ?? ""}
                  placeholder="e.g. Capsa Healthcare Avalo ACS"
                />
                <Field
                  label="First Order Quantity"
                  name="qty"
                  type="number"
                  min={1}
                  defaultValue={editing?.lineItems[0]?.quantity ?? 1}
                />
                <Field
                  label="Contract Unit Price (SGD excl. GST)"
                  name="price"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={editing?.lineItems[0]?.pricing?.unitPrice ?? ""}
                  required
                />
                <Field
                  label="Warranty Duration"
                  name="warrantyDuration"
                  defaultValue={editing?.lineItems[0]?.warranty?.duration?.toString() ?? "24 / 30 / 36"}
                  placeholder="e.g. 3 years or 24/36 months"
                />
                <Field
                  label="Delivery SLA"
                  name="delivery"
                  defaultValue={editing?.lineItems[0]?.specifications?.delivery ?? "120 days from date of order"}
                  placeholder="e.g. 120 days from date of order"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  {editing ? "Save Changes" : "Save Contract to Library"}
                </button>
              </div>
            </form>
          </TabsContent>

          {!editing && (
            <TabsContent value="ai" className="mt-4 space-y-4">
              <div className="rounded-2xl border border-dashed border-border p-6 text-center bg-surface/40">
                <Upload className="mx-auto size-7 text-primary" />
                <p className="mt-2 text-sm font-semibold">Upload Award LOA or Price Schedule PDF</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                  Antigravity AI will parse LOA numbers, multi-tier pricing, multi-year escalation ladders, spare parts lists, and terms into the dossier format.
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
                  className="mt-4 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Select PDF Agreement
                </button>
              </div>

              {analyzing && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs font-semibold text-primary">
                  <Loader2 className="size-4 animate-spin" />
                  Parsing contract clauses, spare parts, and pricing tables...
                </div>
              )}

              {extractedPreview && (
                <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-open">
                    <Sparkles className="size-3.5" /> Extracted Contract Dossier Preview
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-2">
                    <p><strong>LOA:</strong> {extractedPreview.loaNumber}</p>
                    <p><strong>Agency:</strong> {extractedPreview.awardingAgency}</p>
                    <p><strong>Customer:</strong> {extractedPreview.endCustomer}</p>
                    <p><strong>Product:</strong> {extractedPreview.lineItems[0]?.productName}</p>
                    <p><strong>Unit Price:</strong> SGD {extractedPreview.lineItems[0]?.pricing?.unitPrice?.toLocaleString()}</p>
                    <p><strong>Spare Parts:</strong> {extractedPreview.commercialPricing.spareParts.length} Extracted</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        onSave(extractedPreview);
                        setExtractedPreview(null);
                        onOpenChange(false);
                      }}
                      className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      Accept &amp; Import Dossier
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
