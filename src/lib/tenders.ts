export type RelevanceLabel = "High" | "Medium" | "Low";

export type Relevance = {
  score: number;
  label: RelevanceLabel;
  reason: string;
  matchedKeywords: string[];
};

export type Tender = {
  tenderId: string;
  title: string;
  agency: string;
  publishedDate: string;
  closingDate: string;
  category: string;
  status: "OPEN" | "CLOSED";
  procurementMethod: string;
  procurementNature: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  tenderUrl: string;
  tenderPortal: string;
  relevance: Relevance;
  aiSummary: string;
  eligibilityNotes: string | null;
  sourcePortals: string[];
};

export const relevanceStyles: Record<RelevanceLabel, string> = {
  High: "bg-relevance-high/15 text-relevance-high border-relevance-high/25",
  Medium: "bg-relevance-medium/15 text-relevance-medium border-relevance-medium/30",
  Low: "bg-relevance-low/15 text-relevance-low border-relevance-low/25",
};

/** Visual strength: 3 = Strong, 2 = Possible, 1 = Low. No numeric score is shown. */
export const relevanceStrength: Record<RelevanceLabel, { segments: number; text: string }> = {
  High: { segments: 3, text: "Strong Match" },
  Medium: { segments: 2, text: "Possible Match" },
  Low: { segments: 1, text: "Low Match" },
};

/** "Matches ICU, Ventilators and Operating Theatre keywords" */
export function keywordSentence(keywords: string[]): string | null {
  if (keywords.length === 0) return null;
  const list =
    keywords.length === 1
      ? keywords[0]
      : `${keywords.slice(0, -1).join(", ")} and ${keywords[keywords.length - 1]}`;
  return `Matches ${list} keyword${keywords.length === 1 ? "" : "s"}`;
}

export const quickFilters = [
  "ICU",
  "Operating Theatre",
  "Emergency & Rescue",
  "Hospital Ward",
  "Medical Equipment",
];

export function matchesQuickFilter(tender: Tender, term: string): boolean {
  const haystack = [tender.category, tender.title, ...tender.relevance.matchedKeywords]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

const NOW = new Date("2026-08-04T10:00:00Z");

export function daysToClose(closingDate: string): number {
  return Math.ceil((new Date(closingDate).getTime() - NOW.getTime()) / 86_400_000);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  });
  const time = d
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Singapore",
    })
    .toUpperCase()
    .replace(" ", "");
  return `${date} ${time}`;
}

export const tenders: Tender[] = [
  {
    tenderId: "ESG000ETT26000009",
    title: "Development of the Food Services Benchmarking Report 2.0",
    agency: "Enterprise Singapore",
    publishedDate: "2026-07-30T09:20:00Z",
    closingDate: "2026-08-13T08:00:00Z",
    category: "Services ⇒ Professional Services",
    status: "OPEN",
    procurementMethod: "Quotation",
    procurementNature: "Services",
    contactPerson: "Tan Wei Ling",
    contactEmail: "weiling_tan@enterprisesg.gov.sg",
    contactPhone: "+65 6898 1800",
    description:
      "Appointment of a consultant to develop a benchmarking report for the food services sector, covering productivity metrics and operational cost baselines.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 18,
      label: "Low",
      reason: "Consultancy scope with no medical equipment or clinical supply component.",
      matchedKeywords: ["Benchmarking"],
    },
    aiSummary:
      "Enterprise Singapore is seeking a consultant to produce version 2.0 of its Food Services Benchmarking Report. The engagement covers data collection across F&B operators, productivity analysis and a published report. There is no equipment supply or clinical component.",
    eligibilityNotes: null,
    sourcePortals: ["GeBiz"],
  },
  {
    tenderId: "HSA000ETT26000114",
    title: "Supply And Delivery Of Thermomixers",
    agency: "Health Sciences Authority",
    publishedDate: "2026-07-28T04:00:00Z",
    closingDate: "2026-08-12T05:00:00Z",
    category: "Dental, Medical & Laboratory ⇒ Laboratory Equipment & Supplies",
    status: "OPEN",
    procurementMethod: "Quotation",
    procurementNature: "Goods",
    contactPerson: "Nurul Aisyah",
    contactEmail: "procurement@hsa.gov.sg",
    contactPhone: "+65 6866 3500",
    description:
      "Supply, delivery, installation and commissioning of benchtop thermomixers for laboratory use, including one year warranty and preventive maintenance.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 76,
      label: "Medium",
      reason: "Laboratory equipment supply aligns with our medical equipment distribution lines.",
      matchedKeywords: ["Laboratory Equipment", "Medical Equipment", "Supply & Delivery"],
    },
    aiSummary:
      "The Health Sciences Authority requires supply and delivery of benchtop thermomixers for its laboratories. Scope includes installation, commissioning, operator training and a one-year warranty with scheduled preventive maintenance. Award is by quotation to a single supplier.",
    eligibilityNotes:
      "Bidders must be an authorised distributor of the offered brand and provide local service support within 24 hours.",
    sourcePortals: ["GeBiz"],
  },
  {
    tenderId: "NHG000ETT26000047",
    title: "Supply, Delivery And Commissioning Of ICU Ventilators And Patient Monitors",
    agency: "National Healthcare Group",
    publishedDate: "2026-08-01T02:30:00Z",
    closingDate: "2026-08-06T09:00:00Z",
    category: "Dental, Medical & Laboratory ⇒ Medical Equipment",
    status: "OPEN",
    procurementMethod: "Open Tender",
    procurementNature: "Goods",
    contactPerson: "Dr Lim Jia Hao",
    contactEmail: "tenders@nhg.com.sg",
    contactPhone: "+65 6716 2000",
    description:
      "Provision of intensive care ventilators, multi-parameter patient monitors and central monitoring stations for a new 24-bed ICU wing.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 94,
      label: "High",
      reason: "Matches ICU equipment, patient monitoring and hospital ward keywords.",
      matchedKeywords: [
        "ICU",
        "Ventilators",
        "Patient Monitoring",
        "Hospital Ward",
        "Medical Equipment",
      ],
    },
    aiSummary:
      "National Healthcare Group is tendering for ICU ventilators, multi-parameter patient monitors and central monitoring stations to fit out a new 24-bed intensive care wing. The supplier must handle delivery, installation, commissioning and clinical training. A five-year service and spares commitment is required.",
    eligibilityNotes:
      "HSA-registered medical devices only. Minimum three comparable ICU installations in the last five years, plus resident biomedical engineers.",
    sourcePortals: ["GeBiz", "NHG Supplier Portal"],
  },
  {
    tenderId: "SGH000ETT26000201",
    title: "Term Contract For Operating Theatre Tables, Lights And Accessories",
    agency: "Singapore General Hospital",
    publishedDate: "2026-07-24T06:00:00Z",
    closingDate: "2026-08-27T08:00:00Z",
    category: "Dental, Medical & Laboratory ⇒ Medical Equipment",
    status: "OPEN",
    procurementMethod: "Open Tender",
    procurementNature: "Goods & Services",
    contactPerson: "Sharifah Nadia",
    contactEmail: "ot.procurement@sgh.com.sg",
    contactPhone: "+65 6222 3322",
    description:
      "Two-year term contract for the supply of operating theatre tables, surgical lights, accessories and associated maintenance across nine theatres.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 91,
      label: "High",
      reason: "Direct match on operating theatre equipment and maintenance services.",
      matchedKeywords: ["Operating Theatre", "Surgical Lights", "Medical Equipment", "Maintenance"],
    },
    aiSummary:
      "Singapore General Hospital is establishing a two-year term contract for operating theatre tables, surgical lighting and accessories across nine theatres. Maintenance, spares and response-time SLAs are part of the scope. Pricing must be submitted as a schedule of rates.",
    eligibilityNotes:
      "Suppliers must demonstrate authorised service capability and hold ISO 13485 certification.",
    sourcePortals: ["GeBiz"],
  },
  {
    tenderId: "SCDF000ETT26000033",
    title: "Supply Of Emergency Rescue Stretchers And Ambulance Immobilisation Sets",
    agency: "Singapore Civil Defence Force",
    publishedDate: "2026-08-02T01:00:00Z",
    closingDate: "2026-08-05T09:30:00Z",
    category: "Dental, Medical & Laboratory ⇒ Emergency & Rescue",
    status: "OPEN",
    procurementMethod: "Quotation",
    procurementNature: "Goods",
    contactPerson: "Kumar Raj",
    contactEmail: "logistics@scdf.gov.sg",
    contactPhone: "+65 6848 1400",
    description:
      "Supply of scoop stretchers, spinal boards and cervical immobilisation sets for frontline ambulances.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 88,
      label: "High",
      reason: "Matches emergency & rescue and pre-hospital equipment keywords.",
      matchedKeywords: ["Emergency & Rescue", "Stretchers", "Ambulance", "Medical Equipment"],
    },
    aiSummary:
      "SCDF requires scoop stretchers, spinal boards and cervical immobilisation sets for frontline ambulance deployment. Delivery is staggered across two tranches with strict conformance to pre-hospital care standards. Quotation closes within days, so response time is critical.",
    eligibilityNotes: "Samples required for evaluation within five working days of award shortlist.",
    sourcePortals: ["GeBiz", "SCDF Portal"],
  },
  {
    tenderId: "MOH000ETT26000078",
    title: "Provision Of Hospital Ward Beds And Bedside Furniture",
    agency: "Ministry of Health",
    publishedDate: "2026-06-18T03:00:00Z",
    closingDate: "2026-07-21T08:00:00Z",
    category: "Dental, Medical & Laboratory ⇒ Hospital Ward",
    status: "CLOSED",
    procurementMethod: "Open Tender",
    procurementNature: "Goods",
    contactPerson: "Chua Mei Xin",
    contactEmail: "procure@moh.gov.sg",
    contactPhone: "+65 6325 9220",
    description:
      "Supply and delivery of electric hospital beds, bedside lockers and overbed tables for community hospital wards.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 85,
      label: "High",
      reason: "Hospital ward furniture and bed supply is a core Equip Medical category.",
      matchedKeywords: ["Hospital Ward", "Beds", "Medical Equipment"],
    },
    aiSummary:
      "The Ministry of Health sought electric hospital beds, bedside lockers and overbed tables for community hospital wards. Scope included delivery to multiple sites and a three-year warranty. This tender has already closed.",
    eligibilityNotes: null,
    sourcePortals: ["GeBiz"],
  },
  {
    tenderId: "NUH000ETT26000156",
    title: "Maintenance Of Central Sterile Supply Department Autoclaves",
    agency: "National University Hospital",
    publishedDate: "2026-07-15T05:00:00Z",
    closingDate: "2026-08-20T08:00:00Z",
    category: "Services ⇒ Maintenance Services",
    status: "OPEN",
    procurementMethod: "Limited Tender",
    procurementNature: "Services",
    contactPerson: "Goh Wei Sheng",
    contactEmail: "cssd.contracts@nuhs.edu.sg",
    contactPhone: "+65 6779 5555",
    description:
      "Comprehensive maintenance of steam sterilisers and washer disinfectors in the central sterile supply department.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 62,
      label: "Medium",
      reason: "Clinical equipment servicing, but outside our primary supply categories.",
      matchedKeywords: ["Sterilisation", "Maintenance"],
    },
    aiSummary:
      "NUH is appointing a contractor for comprehensive maintenance of CSSD steam sterilisers and washer disinfectors. The scope covers planned servicing, breakdown response and validation testing. Only pre-qualified vendors may participate.",
    eligibilityNotes: "Limited tender — invitation restricted to pre-qualified service providers.",
    sourcePortals: ["GeBiz"],
  },
  {
    tenderId: "LTA000ETT26000512",
    title: "Renovation Of Depot Administrative Offices",
    agency: "Land Transport Authority",
    publishedDate: "2026-07-29T07:00:00Z",
    closingDate: "2026-08-25T08:00:00Z",
    category: "Construction ⇒ Building Works",
    status: "OPEN",
    procurementMethod: "Open Tender",
    procurementNature: "Works",
    contactPerson: "Farah Iskandar",
    contactEmail: "tender@lta.gov.sg",
    contactPhone: "+65 6396 1000",
    description: "Addition and alteration works to depot administrative offices and amenities.",
    tenderUrl: "https://www.gebiz.gov.sg/",
    tenderPortal: "GeBiz",
    relevance: {
      score: 6,
      label: "Low",
      reason: "Building works with no medical or clinical equipment scope.",
      matchedKeywords: [],
    },
    aiSummary:
      "The Land Transport Authority is tendering addition and alteration works for depot administrative offices. Scope is general construction, M&E and finishing works. There is no medical equipment element.",
    eligibilityNotes: null,
    sourcePortals: ["GeBiz"],
  },
];
