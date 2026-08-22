import { today } from "./tenders";

export type TieredPrice = {
  /** e.g. "Year 1-2, Qty 1-4" or "Tier 1, Qty 1-10 units" */
  label: string;
  unitPrice: number;
};

export type MaintenanceSchedule = {
  /** e.g. "Preventive Maintenance only (per system)" */
  name: string;
  rows: { year: string; unitPrice: number }[];
};

export type RepairCharge = {
  description: string;
  uom: string;
  /** String so values like "Free-of-charge" are representable. */
  unitPrice: string;
};

export type SparePart = {
  description: string;
  partNumber: string;
  unitPrice: number;
  uom: string;
  /** e.g. "6 years after warranty" */
  priceHeldFirm: string;
};

/** Provenance of a single field: AI-extracted until a human edits it. */
export type FieldMeta = { source: "ai" } | { source: "edited"; by: string; date: string };

export type LineItem = {
  sku: string;
  productName: string;
  brandModel?: string | null;
  manufacturer?: string | null;
  /** First-order quantity, if applicable. */
  qty: number | null;
  /** SGD, excl. GST. */
  unitPrice: number | null;
  warranty: string;
  dimensions?: string | null;
  deliveryTerms?: string | null;
  notes?: string | null;
  tieredPricing?: TieredPrice[];
};

export type ContractStatus = "Active" | "Expiring Soon" | "Expired" | "Under Warranty";

export type AwardedTender = {
  id: string;
  /** Tender ID / LOA Number, e.g. "HQ2024025A". */
  loaNumber: string;
  /** ITQ / Reference Number, e.g. "HQ2024025". */
  itqRef?: string | null;
  /** Contracting body, e.g. "ALPS Pte Ltd". */
  awardingAgency: string;
  /** Actual using institution, e.g. "NHCS". */
  endCustomer: string;
  category: string;
  contractStart: string;
  contractEnd: string;
  /** e.g. "5 years", "3+2 years". */
  contractDuration: string;
  /** Summary warranty label for cards/header. */
  warrantyPeriod: string;
  /** Contract value of the first order (SGD, excl. GST); null when not a single total. */
  totalPrice: number | null;
  lineItems: LineItem[];
  maintenanceSchedules?: MaintenanceSchedule[];
  repairCharges?: RepairCharge[];
  spareParts?: SparePart[];
  /** Optional accessories, rendered as a collapsed note. */
  accessoriesNote?: string | null;
  documents: { name: string; size: string }[];
  notes?: string | null;
  /** Per-field provenance; absent key = manually entered. */
  fieldMeta?: Record<string, FieldMeta>;
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
  { label: "Older", months: Infinity },
];

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Two-decimal variant for unit/tier/part prices quoted in source documents. */
export function formatMoneyCents(value: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

/** Mark a list of field keys as AI-extracted (provenance for seeded imports). */
function aiFields(...keys: string[]): Record<string, FieldMeta> {
  return Object.fromEntries(keys.map((k) => [k, { source: "ai" as const }]));
}

export const awardedTenders: AwardedTender[] = [
  {
    id: "HQ2024025A",
    loaNumber: "HQ2024025A",
    itqRef: "HQ2024025",
    awardingAgency: "ALPS Pte Ltd",
    endCustomer: "NHCS (National Heart Centre Singapore) — First Order",
    category: "Medical Equipment",
    contractStart: "2024-12-01T00:00:00Z",
    contractEnd: "2029-11-30T00:00:00Z",
    contractDuration: "5 years",
    warrantyPeriod: "1 year (unit)",
    totalPrice: 10_283,
    lineItems: [
      {
        sku: "AND.TM2657P",
        productName: "Automatic Arm Barrel Electronic Sphygmomanometer",
        brandModel: "A&D Medical TM2657P (Japan, 2021 model)",
        manufacturer: "A&D Medical, Japan",
        qty: 4,
        unitPrice: 2_550,
        warranty: "1 year (against manufacturing defects, unit only)",
        notes:
          "Each set includes integrated thermal printer, 1 roll thermal paper, 1 antibacterial arm cuff, power adapter, patient instructional diagram panel, user manual.",
        tieredPricing: [
          { label: "Year 1-2, Qty 1-4", unitPrice: 2_550 },
          { label: "Year 1-2, Qty 5-9", unitPrice: 2_525 },
          { label: "Year 1-2, Qty ≥10", unitPrice: 2_500 },
          { label: "Year 3-5, Qty 1-4", unitPrice: 2_680 },
          { label: "Year 3-5, Qty 5-9", unitPrice: 2_660 },
          { label: "Year 3-5, Qty ≥10", unitPrice: 2_640 },
        ],
      },
      {
        sku: "AX-PP147-S",
        productName: "Printer paper roll (5 rolls/box, width 5.5cm)",
        brandModel: null,
        manufacturer: null,
        qty: 1,
        unitPrice: 83,
        warranty: "—",
        notes: "Accessory item.",
      },
    ],
    maintenanceSchedules: [
      {
        name: "Preventive Maintenance only (per system)",
        rows: [
          { year: "Year 1", unitPrice: 165 },
          { year: "Year 2", unitPrice: 175 },
          { year: "Year 3", unitPrice: 185 },
          { year: "Year 4", unitPrice: 195 },
          { year: "Year 5", unitPrice: 205 },
        ],
      },
      {
        name: "Preventive Maintenance + Unlimited Breakdown Repair, labour only (per system)",
        rows: [
          { year: "Year 1", unitPrice: 198 },
          { year: "Year 2", unitPrice: 208 },
          { year: "Year 3", unitPrice: 218 },
          { year: "Year 4", unitPrice: 228 },
          { year: "Year 5", unitPrice: 238 },
        ],
      },
    ],
    repairCharges: [
      {
        description: "Not on service contract, during office hours (within 48 hrs)",
        uom: "per hour",
        unitPrice: "$100.00",
      },
      {
        description: "On service contract, during office hours (within 24 hrs)",
        uom: "per visit",
        unitPrice: "Free-of-charge",
      },
    ],
    spareParts: [],
    accessoriesNote:
      "External I/O unit RS+Bluetooth (TM-2657-04-EX) $610 · External I/O unit RS 2-channel (TM-2657-01-EX) $450 · Anti-bacteria arm cuff cover 5pk (AX-134005759-S) $180 · Disposable arm cover 500pcs (AS-134010367) $36 · Dedicated stand (AND.TM-ST520) $650 · Adjustable stool (DF35GSP-1) $190",
    documents: [
      { name: "ALPS-LOA-HQ2024025A.pdf", size: "1.4 MB" },
      { name: "ALPS-Price-Schedule-HQ2024025.pdf", size: "512 KB" },
    ],
    notes: null,
    fieldMeta: aiFields(
      "loaNumber",
      "itqRef",
      "awardingAgency",
      "endCustomer",
      "contractStart",
      "contractEnd",
      "contractDuration",
      "totalPrice",
      "lineItems",
      "maintenanceSchedules",
      "repairCharges",
    ),
  },
  {
    id: "GPMQ11820-E",
    loaNumber: "GPMQ11820-E",
    itqRef: "GPMQ11820",
    awardingAgency: "ALPS Pte Ltd",
    endCustomer: "Public Healthcare Institutions (multiple hospitals)",
    category: "Hospital Ward",
    contractStart: "2021-10-21T00:00:00Z",
    contractEnd: "2026-10-20T00:00:00Z",
    contractDuration: "3+2 years",
    warrantyPeriod: "24 months on-site",
    totalPrice: null,
    lineItems: [
      {
        sku: "Avalo ACS 10-High",
        productName: "Medication Trolley — Avalo ACS Medication Cart 10-High",
        brandModel: "Capsa Healthcare, Avalo ACS (Compact Height)",
        manufacturer: "Capsa Healthcare, USA",
        qty: null,
        unitPrice: 3_990,
        warranty:
          "24 months minimum (up to 36 months option) on-site comprehensive warranty from commissioning date; includes PM, calibration, unlimited breakdown repair, parts (excl. consumables), labour, transport",
        dimensions: "109(H) × 61(D) × 66(W) cm",
        deliveryTerms: "Delivery 120 days from order · Installation 7 days · Commissioning 7 days",
        notes:
          "Standard config: 3\" drawer w/ divider wall, 2-tier cassette x2 (12x 5.5\" bins), 3-tier cassette x1 (21x 5.5\" bins total), 6\" drawer, slide-out writing surface, chart holder, handle, colour bumper Blush Salmon, internal waste receptacle.",
        tieredPricing: [
          { label: "Tier 1, Qty 1-10 units", unitPrice: 3_990 },
          { label: "Tier 2, Qty 11-15 units", unitPrice: 3_890 },
        ],
      },
    ],
    maintenanceSchedules: [],
    repairCharges: [],
    spareParts: [
      {
        description: "Drawer Slide",
        partNumber: "12260",
        unitPrice: 95,
        uom: "per box",
        priceHeldFirm: "6 years after warranty",
      },
      {
        description: "Relock Assembly",
        partNumber: "12787",
        unitPrice: 1_528,
        uom: "per box",
        priceHeldFirm: "6 years after warranty",
      },
      {
        description: "Motor Assembly",
        partNumber: "12788",
        unitPrice: 550,
        uom: "per box",
        priceHeldFirm: "6 years after warranty",
      },
      {
        description: "Caster - Swivel",
        partNumber: "9367TP",
        unitPrice: 200,
        uom: "per box",
        priceHeldFirm: "6 years after warranty",
      },
      {
        description: "Caster - Locking",
        partNumber: "9368TP",
        unitPrice: 200,
        uom: "per box",
        priceHeldFirm: "6 years after warranty",
      },
    ],
    accessoriesNote:
      "Articulating arm w/ laptop tray $297 · A&E Mount Bracket $78 · Multi-cavity storage module $135 · Tracking castor 5\" $110 · AC Top mat $57 · Patient name tag 500pcs $21 · 3\" Main Drawer $198 · 6\" Main Drawer $279 · 10\" Main Drawer $390 · Two-Tier Cassette Package 5.5\" $339 · Three-Tier Cassette Package 5.5\" $438 · I.V. Pole Complete $207 · Waste Container w/Lid $225",
    documents: [{ name: "ALPS-Agreement-GPMQ11820-E.pdf", size: "2.1 MB" }],
    notes:
      "Contract start reflects the 21 Oct 2021 quotation date — confirm actual commencement date if different.",
    fieldMeta: {
      ...aiFields(
        "loaNumber",
        "itqRef",
        "awardingAgency",
        "endCustomer",
        "contractEnd",
        "contractDuration",
        "lineItems",
        "spareParts",
      ),
      contractStart: { source: "edited", by: "Priya", date: "05 Jan 2026" },
    },
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
