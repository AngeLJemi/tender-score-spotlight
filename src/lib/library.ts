export interface ContractDuration {
  startDate: string | null;
  endDate: string | null;
  duration: string;
}

export interface ContractValue {
  amount: number | null;
  currency: string;
  type: string | null;
  taxIncluded: boolean;
}

export interface Specifications {
  dimensions: string | null;
  delivery: string | null;
  installation: string | null;
  commissioning: string | null;
}

export interface WarrantyInfo {
  duration: string | number | null;
  unit: string | null;
  type: string | null;
}

export interface PricingTier {
  tier: number;
  quantityMin: number;
  quantityMax: number | null;
  unitPrice: number;
}

export interface MultiYearPricing {
  year: string;
  unitPrice: number;
  currency: string;
}

export interface LineItemPricing {
  unitPrice: number;
  currency: string;
  taxIncluded: boolean;
  tiers: PricingTier[];
  multiYear: MultiYearPricing[];
}

export interface LineItem {
  skuPartNumber: string | null;
  productName: string;
  description: string;
  brand: string | null;
  model: string | null;
  manufacturer: string | null;
  quantity: number | null;
  specifications: Specifications;
  warranty: WarrantyInfo;
  pricing: LineItemPricing;
}

export interface SparePartItem {
  partNumber: string;
  description: string;
  pricing: {
    unitPrice: number;
    currency: string;
    unit: string;
  };
  delivery: {
    leadTime: string;
    basis: string | null;
  };
  priceValidity: string;
}

export interface OptionalAccessory {
  description: string;
  unitPrice: number;
  currency: string;
}

export interface YearlyPricing {
  year: string;
  unitPrice: number;
  currency: string;
}

export interface PreventiveMaintenanceItem {
  serviceType: string;
  pricingBasis: string;
  yearlyPricing: YearlyPricing[];
}

export interface BreakdownRepairItem {
  description: string;
  unitOfMeasurement: string;
  unitPrice: number;
  currency: string;
}

export interface CommercialPricing {
  spareParts: SparePartItem[];
  optionalAccessories: OptionalAccessory[];
  maintenanceAndService: {
    preventiveMaintenance: PreventiveMaintenanceItem[];
    breakdownRepair: BreakdownRepairItem[];
  };
}

export interface TermsAndConditions {
  commitment?: { description: string | null } | undefined;
  orderTerms?: { description: string | null } | undefined;
  pricingTerms?: { description: string | null; minimumOrderPeriod?: string | null | undefined } | undefined;
  reconciliation?: {
    frequency: string | null;
    rebateCondition: string | null;
    rebateTimeline: string | null;
    underpaymentCondition: string | null;
    underpaymentTimeline: string | null;
  } | undefined;
  priceValidity?: { duration: string | null; basis: string | null } | undefined;
  delivery?: { leadTime: string | null; condition: string | null } | undefined;
  warrantyDisclaimer?: { description: string | null } | undefined;
  software?: { description: string | null } | undefined;
  training?: { initialTraining: string | null; additionalTraining: string | null } | undefined;
}

export interface SourceDocument {
  fileName: string;
  documentId: string | null;
}

export interface ExtractionMetadata {
  method: string | null;
  lastEditedBy: string | null;
  lastEditedAt: string | null;
}

export interface TenderLibraryItem {
  id: string; // convenient identifier (maps to loaNumber)
  itqNumber: string;
  loaNumber: string;
  awardingAgency: string;
  endCustomer: string;
  contract: ContractDuration;
  contractValue: ContractValue;
  category: string;
  status: "AWARDED" | "ACTIVE" | "EXPIRED" | "UNDER_WARRANTY" | string;
  lineItems: LineItem[];
  commercialPricing: CommercialPricing;
  termsAndConditions: TermsAndConditions;
  serialNumbers: string[];
  sourceDocument: SourceDocument;
  extraction: ExtractionMetadata;
}

// Backward compatibility alias for existing code
export type AwardedTender = TenderLibraryItem;

export const libraryCategories = [
  "All",
  "Medication Trolley",
  "Automatic Arm Barrel Electronic Sphygmomanometer",
  "ICU",
  "Hospital Ward",
  "Operating Theatre",
  "Medical Equipment",
];

export const priceRanges = [
  { label: "All", min: 0, max: Infinity },
  { label: "Under $5k Unit Price", min: 0, max: 5_000 },
  { label: "$5k – $50k", min: 5_000, max: 50_000 },
  { label: "Above $50k", min: 50_000, max: Infinity },
];

export function formatMoney(value: number | null | undefined, currency = "SGD"): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: currency || "SGD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMoneyCents(value: number | null | undefined, currency = "SGD"): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: currency || "SGD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getItemPrimaryPrice(item: TenderLibraryItem): { amount: number | null; label: string } {
  if (item.contractValue.amount != null) {
    return {
      amount: item.contractValue.amount,
      label: item.contractValue.type === "first-order" ? "Contract Value (First Order)" : "Contract Value",
    };
  }
  const firstLine = item.lineItems[0];
  if (firstLine?.pricing?.unitPrice != null) {
    const hasTiers = (firstLine.pricing.tiers?.length ?? 0) > 0;
    return {
      amount: firstLine.pricing.unitPrice,
      label: hasTiers ? "Unit Price (Tier 1)" : "Unit Price",
    };
  }
  return { amount: null, label: "Price Pending" };
}

export function getItemWarrantySummary(item: TenderLibraryItem): string {
  const firstLine = item.lineItems[0];
  if (!firstLine?.warranty) return "—";
  const { duration, unit, type } = firstLine.warranty;
  if (duration && unit) return `${duration} ${unit}`;
  if (type) return type;
  return "Standard Warranty";
}

export const sampleLibraryData: TenderLibraryItem[] = [
  {
    id: "GPMQ11820-E",
    itqNumber: "GPMQ11820",
    loaNumber: "GPMQ11820-E",
    awardingAgency: "ALPS",
    endCustomer: "Public Healthcare Institutions (PHIs)",
    contract: {
      startDate: null,
      endDate: null,
      duration: "3+2 years",
    },
    contractValue: {
      amount: null,
      currency: "SGD",
      type: null,
      taxIncluded: false,
    },
    category: "Medication Trolley",
    status: "AWARDED",
    lineItems: [
      {
        skuPartNumber: null,
        productName: "Capsa Avalo ACS Medication Cart 10-High",
        description:
          "Medication cart with keyless locking system and standard configuration including drawers, 2-tier and 3-tier cassettes with 5.5 inch bins, slide-out writing surface, chart holder, handle, colour bumper and internal waste receptacle.",
        brand: "Capsa Healthcare",
        model: "Capsa Avalo ACS Medication Cart 10-High",
        manufacturer: "Capsa Healthcare",
        quantity: null,
        specifications: {
          dimensions: "109 (H) x 61 (D) x 66 (W) cm",
          delivery: "120 days from date of order",
          installation: "7 days",
          commissioning: "7 days",
        },
        warranty: {
          duration: "24 / 30 / 36",
          unit: "months",
          type: "on-site comprehensive warranty from date of successful commissioning",
        },
        pricing: {
          unitPrice: 3990.0,
          currency: "SGD",
          taxIncluded: false,
          tiers: [
            {
              tier: 1,
              quantityMin: 1,
              quantityMax: 10,
              unitPrice: 3990.0,
            },
            {
              tier: 2,
              quantityMin: 11,
              quantityMax: 15,
              unitPrice: 3890.0,
            },
          ],
          multiYear: [],
        },
      },
    ],
    commercialPricing: {
      spareParts: [
        {
          partNumber: "12260",
          description: "Drawer Slide",
          pricing: {
            unitPrice: 95.0,
            currency: "SGD",
            unit: "1/box",
          },
          delivery: {
            leadTime: "30 days",
            basis: null,
          },
          priceValidity: "6 years after warranty",
        },
        {
          partNumber: "12787",
          description: "Relock assembly",
          pricing: {
            unitPrice: 1528.0,
            currency: "SGD",
            unit: "1/box",
          },
          delivery: {
            leadTime: "30 days",
            basis: null,
          },
          priceValidity: "6 years after warranty",
        },
        {
          partNumber: "12788",
          description: "Motor assembly",
          pricing: {
            unitPrice: 550.0,
            currency: "SGD",
            unit: "1/box",
          },
          delivery: {
            leadTime: "30 days",
            basis: null,
          },
          priceValidity: "6 years after warranty",
        },
        {
          partNumber: "9367TP",
          description: "Caster - Swivel",
          pricing: {
            unitPrice: 200.0,
            currency: "SGD",
            unit: "1/box",
          },
          delivery: {
            leadTime: "30 days",
            basis: null,
          },
          priceValidity: "6 years after warranty",
        },
        {
          partNumber: "9368TP",
          description: "Caster - Locking",
          pricing: {
            unitPrice: 200.0,
            currency: "SGD",
            unit: "1/box",
          },
          delivery: {
            leadTime: "30 days",
            basis: null,
          },
          priceValidity: "6 years after warranty",
        },
      ],
      optionalAccessories: [
        {
          description: "AX Articulating arm with laptop tray (To be purchased with A&E Mount Bracket Assembly)",
          unitPrice: 297.0,
          currency: "SGD",
        },
        {
          description: "A&E Mount Bracket Assembly",
          unitPrice: 78.0,
          currency: "SGD",
        },
        {
          description: "Avalo Multi-cavity storage module",
          unitPrice: 135.0,
          currency: "SGD",
        },
        {
          description: "Tracking castor, 5 inch",
          unitPrice: 110.0,
          currency: "SGD",
        },
        {
          description: "Avalo AC Top mat – ACS",
          unitPrice: 57.0,
          currency: "SGD",
        },
        {
          description: "Avalo Patient Name tag (500pcs)",
          unitPrice: 21.0,
          currency: "SGD",
        },
        {
          description: "AV AC 3 inch Main Drawer, Med Crème",
          unitPrice: 198.0,
          currency: "SGD",
        },
        {
          description: "Avalo AC 6 inch Main Drawer, Med Crème",
          unitPrice: 279.0,
          currency: "SGD",
        },
        {
          description: "Avalo AC 10 inch Main Drawer, Med Crème",
          unitPrice: 390.0,
          currency: "SGD",
        },
        {
          description: "Avalo AC 3 inch Main Drawer Divider Kit",
          unitPrice: 81.0,
          currency: "SGD",
        },
        {
          description: "Avalo AC 6/10 inch Main Drawer Divider Kit",
          unitPrice: 81.0,
          currency: "SGD",
        },
        {
          description: "AC Two-Tier Cassette Package, 5.5 inch Bins",
          unitPrice: 339.0,
          currency: "SGD",
        },
        {
          description: "AC Three-Tier Cassette Package, 5.5 Bins",
          unitPrice: 438.0,
          currency: "SGD",
        },
        {
          description: "AC Two Tier Cassette Package, 8 inch Bin",
          unitPrice: 312.0,
          currency: "SGD",
        },
        {
          description: "AC Three-Tier Cassette Package, 8 inch Bins",
          unitPrice: 408.0,
          currency: "SGD",
        },
        {
          description: "Avalo AC I.V. Pole - Complete",
          unitPrice: 207.0,
          currency: "SGD",
        },
        {
          description: "Waste Container W/Lid, No Ladder",
          unitPrice: 225.0,
          currency: "SGD",
        },
        {
          description: "Avalo LTC STG Cont - Comp, No Ladder",
          unitPrice: 210.0,
          currency: "SGD",
        },
        {
          description: "Avalo Multi-Cavity Storage-Complete",
          unitPrice: 210.0,
          currency: "SGD",
        },
        {
          description: "Avalo AC Writing Surface, ACS, Champ Met",
          unitPrice: 204.0,
          currency: "SGD",
        },
      ],
      maintenanceAndService: {
        preventiveMaintenance: [],
        breakdownRepair: [],
      },
    },
    termsAndConditions: {
      commitment: {
        description:
          "The computation of Commitment Amount (total order quantity) shall be on an annual year basis, based on ALPS financial year which commences on 1 April to 31 March of the following year.",
      },
      orderTerms: {
        description:
          "A Planned List Of Orders will be placed with Vendor by 15 Sep in each financial year. Purchase orders will be issued directly from each hospital to Vendor with the endorsement from ALPS in the respective financial year.",
      },
      pricingTerms: {
        description:
          "Purchase orders are priced based on the applicable tier pricing table based on the Planned List Of Orders. Tier quantity can be consolidated across Public Healthcare Institutions for the same financial year. Multiple Purchase Orders are allowed.",
        minimumOrderPeriod: null,
      },
      reconciliation: {
        frequency: "Within 30 days of the end of each financial year",
        rebateCondition:
          "If the applicable tier pricing is lower than the invoiced unit price, Vendor will issue rebate to each respective hospital.",
        rebateTimeline: "Within 60 days from the end of each financial year",
        underpaymentCondition:
          "If the applicable tier pricing is higher than the invoiced unit price, Vendor will issue an invoice for the underpayment.",
        underpaymentTimeline: "Within 60 days from the end of each financial year",
      },
      priceValidity: {
        duration: "3+2 years",
        basis: "As per ALPS Term Contract",
      },
      delivery: {
        leadTime: "120 days from date of order",
        condition: "Standard 16 to 20 weeks upon receipt of confirmed Purchase Order",
      },
      warrantyDisclaimer: {
        description:
          "Warranty of consumables, accessories & 3rd party supplies shall be covered by 3rd party vendors where applicable.",
      },
      software: {
        description:
          "Software updates, when available, to originally purchased functionalities shall be provided at no additional charge provided the system is on service contract. Upgrades with added new features and functionalities are chargeable.",
      },
      training: {
        initialTraining: "1 day(s) on-site application training",
        additionalTraining: "Additional training can be provided upon request with sufficient notice",
      },
    },
    serialNumbers: [],
    sourceDocument: {
      fileName: "GPMQ11820E - Medication Cart details - till 11 Nov 2026 (1)(1).pdf",
      documentId: null,
    },
    extraction: {
      method: null,
      lastEditedBy: null,
      lastEditedAt: null,
    },
  },
  {
    id: "HQ2024025A",
    itqNumber: "HQ2024025",
    loaNumber: "HQ2024025A",
    awardingAgency: "ALPS Pte. Ltd.",
    endCustomer: "Public healthcare institutions in the Republic of Singapore",
    contract: {
      startDate: "01 December 2024",
      endDate: "30 November 2029",
      duration: "5 years",
    },
    contractValue: {
      amount: 10283.0,
      currency: "SGD",
      type: "first-order",
      taxIncluded: false,
    },
    category: "Automatic Arm Barrel Electronic Sphygmomanometer",
    status: "AWARDED",
    lineItems: [
      {
        skuPartNumber: "AND.TM2657P",
        productName: "AUTOMATIC ARM BARREL ELECTRONIC SPHYGMOMANOMETER",
        description:
          "Automatic Arm Barrel Electronic Sphygmomanometer. Each set includes integrated thermal printer, 1 roll of thermal paper, 1 pc antibacterial arm cuff, power adapter, patient instructional diagram panel and user manual.",
        brand: "A&D Medical",
        model: "TM-2657P",
        manufacturer: "A&D Medical, Japan",
        quantity: 4,
        specifications: {
          dimensions: "241 (W) x 324 (H) x 390 (D) mm",
          delivery: "Ex-stock or 4-6 weeks upon order confirmation",
          installation: "Included on delivery",
          commissioning: "Included on delivery",
        },
        warranty: {
          duration: 1,
          unit: "year",
          type: "warranty against manufacturing defects (unit only)",
        },
        pricing: {
          unitPrice: 2550.0,
          currency: "SGD",
          taxIncluded: false,
          tiers: [
            {
              tier: 1,
              quantityMin: 1,
              quantityMax: 4,
              unitPrice: 2550.0,
            },
            {
              tier: 2,
              quantityMin: 5,
              quantityMax: 9,
              unitPrice: 2525.0,
            },
            {
              tier: 3,
              quantityMin: 10,
              quantityMax: null,
              unitPrice: 2500.0,
            },
          ],
          multiYear: [
            {
              year: "Year 1 to Year 2",
              unitPrice: 2550.0,
              currency: "SGD",
            },
            {
              year: "Year 3 to Year 5",
              unitPrice: 2680.0,
              currency: "SGD",
            },
          ],
        },
      },
      {
        skuPartNumber: "AX-PP147-S",
        productName: "Printer paper roll",
        description: "Printer paper roll (5 rolls/box) (paper width: 5.5cm)",
        brand: "A&D Medical",
        model: "AX-PP147-S",
        manufacturer: "A&D Medical",
        quantity: 1,
        specifications: {
          dimensions: "Width: 5.5 cm",
          delivery: "Ex-stock",
          installation: null,
          commissioning: null,
        },
        warranty: {
          duration: null,
          unit: null,
          type: null,
        },
        pricing: {
          unitPrice: 83.0,
          currency: "SGD",
          taxIncluded: false,
          tiers: [],
          multiYear: [],
        },
      },
    ],
    commercialPricing: {
      spareParts: [],
      optionalAccessories: [
        {
          description: "External input/output unit RS + Bluetooth",
          unitPrice: 610.0,
          currency: "SGD",
        },
        {
          description: "External input/output unit RS 2 channels",
          unitPrice: 450.0,
          currency: "SGD",
        },
        {
          description: "Anti-bacteria arm cuff cover (5 pcs/pack)",
          unitPrice: 180.0,
          currency: "SGD",
        },
        {
          description: "Printer paper roll (5 rolls/box) (paper width: 5.5cm)",
          unitPrice: 83.0,
          currency: "SGD",
        },
        {
          description: "Disposable Arm Cover (500 pcs/roll)",
          unitPrice: 36.0,
          currency: "SGD",
        },
        {
          description: "Dedicated stand for TM-2657P",
          unitPrice: 650.0,
          currency: "SGD",
        },
        {
          description: "Adjustable stool without wheel",
          unitPrice: 190.0,
          currency: "SGD",
        },
      ],
      maintenanceAndService: {
        preventiveMaintenance: [
          {
            serviceType: "CHARGES FOR PREVENTIVE MAINTENANCE (PM ONLY) - PER SYSTEM",
            pricingBasis: "per system",
            yearlyPricing: [
              {
                year: "Year 1",
                unitPrice: 165.0,
                currency: "SGD",
              },
              {
                year: "Year 2",
                unitPrice: 175.0,
                currency: "SGD",
              },
              {
                year: "Year 3",
                unitPrice: 185.0,
                currency: "SGD",
              },
              {
                year: "Year 4",
                unitPrice: 195.0,
                currency: "SGD",
              },
              {
                year: "Year 5",
                unitPrice: 205.0,
                currency: "SGD",
              },
            ],
          },
        ],
        breakdownRepair: [
          {
            description:
              "Service Charges for Breakdown Repair, Equipment Not On Service Contract - During Office Hours (within 48 hours)",
            unitOfMeasurement: "Per hour",
            unitPrice: 100.0,
            currency: "SGD",
          },
          {
            description:
              "Service Charges for Breakdown Repair, Equipment On Service Contract - During Office Hours (within 24 hours)",
            unitOfMeasurement: "Per hour",
            unitPrice: 0.0,
            currency: "SGD",
          },
        ],
      },
    },
    termsAndConditions: {
      commitment: {
        description: null,
      },
      orderTerms: {
        description: null,
      },
      pricingTerms: {
        description: null,
        minimumOrderPeriod: null,
      },
      reconciliation: {
        frequency: null,
        rebateCondition: null,
        rebateTimeline: null,
        underpaymentCondition: null,
        underpaymentTimeline: null,
      },
      priceValidity: {
        duration: null,
        basis: null,
      },
      delivery: {
        leadTime: null,
        condition: null,
      },
      warrantyDisclaimer: {
        description: "1 year warranty against manufacturing defects (unit only)",
      },
      software: {
        description: null,
      },
      training: {
        initialTraining: null,
        additionalTraining: null,
      },
    },
    serialNumbers: [],
    sourceDocument: {
      fileName: "ALPS - HQ2024025A - TM2657P - till 30 Nov 2029.pdf",
      documentId: null,
    },
    extraction: {
      method: null,
      lastEditedBy: null,
      lastEditedAt: null,
    },
  },
];

export const awardedTenders = sampleLibraryData;

export type MatchStrength = "Strong" | "Moderate" | "Weak";

export type ContractMatch = {
  entry: TenderLibraryItem;
  strength: MatchStrength;
  matchedOn: string[];
};

export const matchStrengthStyles: Record<MatchStrength, string> = {
  Strong: "bg-relevance-high/15 text-relevance-high border-relevance-high/25",
  Moderate: "bg-relevance-medium/15 text-relevance-medium border-relevance-medium/30",
  Weak: "bg-relevance-low/15 text-relevance-low border-relevance-low/25",
};

export function matchedContracts(input: {
  title: string;
  category: string;
  keywords: string[];
}): ContractMatch[] {
  const haystack = `${input.title} ${input.category} ${input.keywords.join(" ")}`.toLowerCase();

  const results: ContractMatch[] = [];
  for (const entry of sampleLibraryData) {
    const matchedOn: string[] = [];
    if (haystack.includes(entry.category.toLowerCase())) matchedOn.push(entry.category);
    for (const item of entry.lineItems) {
      const words = item.productName
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((w) => w.length > 4);
      if (words.some((w) => haystack.includes(w))) {
        matchedOn.push(item.skuPartNumber || item.productName);
      }
    }
    if (matchedOn.length === 0) continue;
    const strength: MatchStrength =
      matchedOn.length >= 3 ? "Strong" : matchedOn.length >= 1 ? "Moderate" : "Weak";
    results.push({ entry, strength, matchedOn: Array.from(new Set(matchedOn)).slice(0, 3) });
  }

  const order: Record<MatchStrength, number> = { Strong: 3, Moderate: 2, Weak: 1 };
  return results.sort((a, b) => order[b.strength] - order[a.strength]).slice(0, 3);
}
