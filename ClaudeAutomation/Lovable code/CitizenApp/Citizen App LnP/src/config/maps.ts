import type { FormFieldOption } from "./types";

export const TRADE_CATEGORY_MAP: Record<string, FormFieldOption[]> = {
  manufacturing: [
    { label: "Garment Factory", value: "garment" },
    { label: "Food Processing", value: "food" },
    { label: "Furniture", value: "furniture" },
    { label: "Printing & Packaging", value: "printing" },
  ],
  retail: [
    { label: "General Store", value: "general" },
    { label: "Electronics", value: "electronics" },
    { label: "Clothing & Apparel", value: "clothing" },
    { label: "Pharmacy", value: "pharmacy" },
  ],
  services: [
    { label: "Salon & Spa", value: "salon" },
    { label: "Repair Workshop", value: "repair" },
    { label: "Laundry", value: "laundry" },
    { label: "Travel Agency", value: "travel" },
  ],
  food: [
    { label: "Restaurant", value: "restaurant" },
    { label: "Bakery", value: "bakery" },
    { label: "Cloud Kitchen", value: "cloud_kitchen" },
    { label: "Cafe", value: "cafe" },
  ],
};

export const TRADE_CATEGORY_OPTIONS: FormFieldOption[] = [
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Retail", value: "retail" },
  { label: "Services", value: "services" },
  { label: "Food & Beverage", value: "food" },
];

export const CITY_ZONE_MAP: Record<string, FormFieldOption[]> = {
  cape_town: [
    { label: "Subcouncil 1 — Bloubergstrand", value: "cpt_sc1" },
    { label: "Subcouncil 2 — Durbanville", value: "cpt_sc2" },
    { label: "Subcouncil 7 — Khayelitsha", value: "cpt_sc7" },
    { label: "Subcouncil 12 — Pinelands / Mowbray", value: "cpt_sc12" },
    { label: "Subcouncil 15 — Southern Suburbs", value: "cpt_sc15" },
    { label: "Subcouncil 16 — CBD / Atlantic Seaboard", value: "cpt_sc16" },
    { label: "Subcouncil 19 — Hout Bay / Llandudno", value: "cpt_sc19" },
  ],
  bellville: [
    { label: "Bellville Central", value: "bel_c" },
    { label: "Bellville South", value: "bel_s" },
  ],
  stellenbosch: [
    { label: "Stellenbosch Central", value: "stb_c" },
    { label: "Cloetesville", value: "stb_cv" },
  ],
  paarl: [
    { label: "Paarl Central", value: "pl_c" },
    { label: "Paarl East", value: "pl_e" },
  ],
};

export const CITY_OPTIONS: FormFieldOption[] = [
  { label: "Cape Town", value: "cape_town" },
  { label: "Bellville", value: "bellville" },
  { label: "Stellenbosch", value: "stellenbosch" },
  { label: "Paarl", value: "paarl" },
];

export const ID_TYPE_OPTIONS: FormFieldOption[] = [
  { label: "South African ID", value: "sa_id" },
  { label: "Passport", value: "passport" },
  { label: "Driver's Licence", value: "dl" },
];

export const ID_VALIDATION: Record<string, { regex: string; message: string; minLength?: number; maxLength?: number }> = {
  sa_id: {
    regex: "^\\d{13}$",
    message: "South African ID must be 13 digits",
    minLength: 13,
    maxLength: 13,
  },
  passport: {
    regex: "^[A-Za-z]\\d{8}$",
    message: "Enter a valid 9-character passport number",
    minLength: 9,
    maxLength: 9,
  },
  dl: {
    regex: "^\\d{13}$",
    message: "Enter a valid 13-digit driver's licence number",
    minLength: 13,
    maxLength: 13,
  },
};

export const OWNERSHIP_OPTIONS: FormFieldOption[] = [
  { label: "Proprietorship", value: "proprietorship" },
  { label: "Partnership", value: "partnership" },
  { label: "Private Limited", value: "pvt_ltd" },
  { label: "LLP", value: "llp" },
];

export const HAZARD_TYPE_OPTIONS: FormFieldOption[] = [
  { label: "Chemical handling", value: "chemical" },
  { label: "High-temperature equipment", value: "heat" },
  { label: "Heavy machinery", value: "machinery" },
  { label: "Flammable storage", value: "flammable" },
];

export const BUILDING_TYPE_OPTIONS: FormFieldOption[] = [
  { label: "Residential", value: "residential" },
  { label: "Commercial", value: "commercial" },
  { label: "Mixed Use", value: "mixed" },
  { label: "Industrial", value: "industrial" },
];

export const OCCUPANCY_OPTIONS: FormFieldOption[] = [
  { label: "Assembly (cinema, hall)", value: "assembly" },
  { label: "Educational", value: "educational" },
  { label: "Institutional (hospital)", value: "institutional" },
  { label: "Mercantile (mall, shop)", value: "mercantile" },
  { label: "Industrial", value: "industrial" },
  { label: "Storage / Warehouse", value: "storage" },
];