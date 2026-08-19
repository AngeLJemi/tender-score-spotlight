import { today } from "./tenders";

export type LineItem = {
  sku: string;
  productName: string;
  qty: number;
  unitPrice: number;
  warranty: string;
  maintenanceCharges: string;
  notes: string | null;
};

export type ContractStatus = "Active" | "Expiring Soon" | "Expired" | "Under Warranty";

export type AwardedTender = {
  id: string;
  loaNumber: string;
  customer: string;
  category: string;
  awardDate: string;
  contractEnd: string;
  warrantyPeriod: string;
  totalPrice: number;
  lineItems: LineItem[];
  documents: { name: string; size: string }[];
  notes?: string | null;
};

export const libraryCategories = [
  "ICU",
  "Operating Theatre",
  "Emergency & Rescue",
  "Hospital Ward",
  "Medical Equipment",
  "Laboratory",
];

export const contractStatuses: ContractStatus[] = [
  "Active",
  "Expiring Soon",
  "Expired",
  "Under Warranty",
];

export const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under $100k", min: 0, max: 100_000 },
  { label: "$100k – $500k", min: 100_000, max: 500_000 },
  { label: "$500k – $1M", min: 500_000, max: 1_000_000 },
  { label: "Above $1M", min: 1_000_000, max: Infinity },
];

export const awardDateRanges = [
  { label: "All", months: Infinity },
  { label: "Last 6 months", months: 6 },
  { label: "Last 12 months", months: 12 },
  { label: "Last 24 months", months: 24 },
];

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  });
}

/** Derived contract status from the contract end date. */
export function contractStatus(entry: AwardedTender): ContractStatus {
  const days = Math.ceil((new Date(entry.contractEnd).getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "Expired";
  if (days <= 90) return "Expiring Soon";
  return "Active";
}

export const contractStatusStyles: Record<ContractStatus, string> = {
  Active: "bg-open/12 text-open",
  "Expiring Soon": "bg-relevance-medium/15 text-relevance-medium",
  Expired: "bg-muted text-muted-foreground",
  "Under Warranty": "bg-ai/10 text-ai",
};

export function monthsSince(iso: string): number {
  return (today.getTime() - new Date(iso).getTime()) / (86_400_000 * 30.44);
}

export const awardedTenders: AwardedTender[] = [
  {
    id: "AWD-2025-0142",
    loaNumber: "LOA/NHG/2025/0142",
    customer: "National Healthcare Group",
    category: "ICU",
    awardDate: "2025-11-18T00:00:00Z",
    contractEnd: "2027-11-17T00:00:00Z",
    warrantyPeriod: "5 years",
    totalPrice: 1_284_000,
    warrantyPeriodNote: undefined,
    lineItems: [
      {
        sku: "EM-VENT-9200",
        productName: "ICU Ventilator V9200 (adult/paediatric)",
        qty: 18,
        unitPrice: 48_500,
        warranty: "5 years parts & labour",
        maintenanceCharges: "$3,200 / unit / year after year 5",
        notes: "Includes clinical training for 40 nurses.",
      },
      {
        sku: "EM-MON-540",
        productName: "Multi-parameter Patient Monitor M540",
        qty: 24,
        unitPrice: 12_400,
        warranty: "3 years",
        maintenanceCharges: "$780 / unit / year",
        notes: null,
      },
      {
        sku: "EM-CMS-CENTRAL",
        productName: "Central Monitoring Station (8-bed)",
        qty: 3,
        unitPrice: 34_000,
        warranty: "3 years",
        maintenanceCharges: "Included for contract term",
        notes: "Networked to ICU nurse stations.",
      },
    ],
    documents: [
      { name: "LOA-NHG-2025-0142.pdf", size: "1.8 MB" },
      { name: "Price-Schedule-Annex-A.pdf", size: "420 KB" },
    ],
    notes: "Fit-out of 24-bed ICU wing at Tan Tock Seng.",
  },
  {
    id: "AWD-2025-0098",
    loaNumber: "LOA/SGH/2025/0098",
    customer: "Singapore General Hospital",
    category: "Operating Theatre",
    awardDate: "2025-07-02T00:00:00Z",
    contractEnd: "2026-09-30T00:00:00Z",
    warrantyPeriod: "3 years",
    totalPrice: 742_500,
    lineItems: [
      {
        sku: "EM-OT-TABLE-7",
        productName: "Operating Theatre Table OT-7 (electro-hydraulic)",
        qty: 9,
        unitPrice: 58_000,
        warranty: "3 years",
        maintenanceCharges: "$2,400 / table / year",
        notes: "Schedule of rates contract.",
      },
      {
        sku: "EM-OT-LIGHT-LED",
        productName: "Surgical LED Light, dual dome",
        qty: 9,
        unitPrice: 22_500,
        warranty: "3 years",
        maintenanceCharges: "$1,100 / unit / year",
        notes: null,
      },
    ],
    documents: [{ name: "SGH-Term-Contract-0098.pdf", size: "2.4 MB" }],
    notes: "Two-year term contract across nine theatres.",
  },
  {
    id: "AWD-2024-0311",
    loaNumber: "LOA/SCDF/2024/0311",
    customer: "Singapore Civil Defence Force",
    category: "Emergency & Rescue",
    awardDate: "2024-09-12T00:00:00Z",
    contractEnd: "2026-09-11T00:00:00Z",
    warrantyPeriod: "2 years",
    totalPrice: 186_400,
    lineItems: [
      {
        sku: "EM-STR-SCOOP",
        productName: "Scoop Stretcher, aluminium",
        qty: 120,
        unitPrice: 780,
        warranty: "2 years",
        maintenanceCharges: "Not applicable",
        notes: null,
      },
      {
        sku: "EM-IMM-CSET",
        productName: "Cervical Immobilisation Set",
        qty: 160,
        unitPrice: 420,
        warranty: "2 years",
        maintenanceCharges: "Not applicable",
        notes: "Delivered in two tranches.",
      },
    ],
    documents: [{ name: "SCDF-Award-0311.pdf", size: "980 KB" }],
    notes: null,
  },
  {
    id: "AWD-2023-0205",
    loaNumber: "LOA/MOH/2023/0205",
    customer: "Ministry of Health",
    category: "Hospital Ward",
    awardDate: "2023-05-22T00:00:00Z",
    contractEnd: "2025-05-21T00:00:00Z",
    warrantyPeriod: "3 years",
    totalPrice: 968_000,
    lineItems: [
      {
        sku: "EM-BED-E4",
        productName: "Electric Hospital Bed E4, 4-section",
        qty: 220,
        unitPrice: 3_600,
        warranty: "3 years",
        maintenanceCharges: "$180 / bed / year",
        notes: "Community hospital wards, six sites.",
      },
      {
        sku: "EM-LOCK-BS2",
        productName: "Bedside Locker with overbed table",
        qty: 220,
        unitPrice: 780,
        warranty: "2 years",
        maintenanceCharges: "Not applicable",
        notes: null,
      },
    ],
    documents: [{ name: "MOH-Award-0205.pdf", size: "1.2 MB" }],
    notes: null,
  },
  {
    id: "AWD-2025-0177",
    loaNumber: "LOA/HSA/2025/0177",
    customer: "Health Sciences Authority",
    category: "Laboratory",
    awardDate: "2025-12-04T00:00:00Z",
    contractEnd: "2027-12-03T00:00:00Z",
    warrantyPeriod: "1 year",
    totalPrice: 62_400,
    lineItems: [
      {
        sku: "EM-LAB-TMX40",
        productName: "Benchtop Thermomixer TMX-40",
        qty: 12,
        unitPrice: 5_200,
        warranty: "1 year + preventive maintenance",
        maintenanceCharges: "$390 / unit / year after year 1",
        notes: "Installation and operator training included.",
      },
    ],
    documents: [{ name: "HSA-Quotation-Award-0177.pdf", size: "640 KB" }],
    notes: null,
  },
] as AwardedTender[];

export type MatchStrength = "Strong" | "Moderate" | "Weak";

export type ContractMatch = {
  entry: AwardedTender;
  strength: MatchStrength;
  matchedOn: string[];
};

export const matchStrengthStyles: Record<MatchStrength, string> = {
  Strong: "bg-relevance-high/15 text-relevance-high border-relevance-high/25",
  Moderate: "bg-relevance-medium/15 text-relevance-medium border-relevance-medium/30",
  Weak: "bg-relevance-low/15 text-relevance-low border-relevance-low/25",
};

/**
 * Heuristic stand-in for AI matching: overlap between the live tender's text
 * and an awarded contract's category / product names.
 */
export function matchedContracts(input: {
  title: string;
  category: string;
  keywords: string[];
}): ContractMatch[] {
  const haystack = `${input.title} ${input.category} ${input.keywords.join(" ")}`.toLowerCase();

  const results: ContractMatch[] = [];
  for (const entry of awardedTenders) {
    const matchedOn: string[] = [];
    if (haystack.includes(entry.category.toLowerCase())) matchedOn.push(entry.category);
    for (const item of entry.lineItems) {
      const words = item.productName
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((w) => w.length > 5);
      if (words.some((w) => haystack.includes(w))) matchedOn.push(item.sku);
    }
    if (matchedOn.length === 0) continue;
    const strength: MatchStrength =
      matchedOn.length >= 3 ? "Strong" : matchedOn.length === 2 ? "Moderate" : "Weak";
    results.push({ entry, strength, matchedOn: Array.from(new Set(matchedOn)).slice(0, 3) });
  }

  const order: Record<MatchStrength, number> = { Strong: 3, Moderate: 2, Weak: 1 };
  return results.sort((a, b) => order[b.strength] - order[a.strength]).slice(0, 3);
}
