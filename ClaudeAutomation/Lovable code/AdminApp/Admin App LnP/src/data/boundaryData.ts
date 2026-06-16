import type { BoundaryLevel, BoundaryHierarchy } from "@/contexts/OnboardingContext";

// Sample boundary names per level
export const MOCK_BOUNDARY_NAMES: Record<string, string[]> = {
  country: ["South Africa"],
  state: ["Western Cape", "Gauteng", "KwaZulu-Natal", "Eastern Cape", "Limpopo"],
  city: ["Cape Town", "Johannesburg", "Durban", "Port Elizabeth", "Pretoria"],
  district: [
    "City Bowl", "Atlantic Seaboard", "Southern Suburbs", "Northern Suburbs",
    "West Coast", "Winelands", "Overberg", "Garden Route",
  ],
  ward: [
    "Ward 57 – Bo-Kaap", "Ward 58 – De Waterkant", "Ward 59 – Green Point",
    "Ward 60 – Fresnaye", "Ward 61 – Sea Point", "Ward 62 – Three Anchor Bay",
    "Ward 63 – Clifton", "Ward 64 – Bantry Bay", "Ward 115 – Bellville South",
    "Ward 116 – Parow", "Ward 117 – Goodwood", "Ward 23 – Mitchell's Plain",
  ],
  sub_ward: [
    "Bo-Kaap North", "Bo-Kaap South", "De Waterkant East", "De Waterkant West",
    "Green Point Central", "Green Point Harbour",
  ],
};

// Hierarchy levels for pre-loaded (OSM) data — 4-level Admin hierarchy
export const PRELOADED_LEVELS: BoundaryLevel[] = [
  { id: "l1", label: "Province", originalLabel: "Province", count: 9, sampleNames: MOCK_BOUNDARY_NAMES.state },
  { id: "l2", label: "District Municipality", originalLabel: "District Municipality", count: 52, sampleNames: MOCK_BOUNDARY_NAMES.district },
  { id: "l3", label: "Local Municipality", originalLabel: "Local Municipality", count: 213, sampleNames: MOCK_BOUNDARY_NAMES.city },
  { id: "l4", label: "Ward", originalLabel: "Ward", count: 4468, sampleNames: MOCK_BOUNDARY_NAMES.ward },
];

// Hierarchy levels returned after shapefile parse (slightly different depth)
export const SHAPEFILE_LEVELS: BoundaryLevel[] = [
  { id: "l1", label: "State", originalLabel: "ADM1", count: 9, sampleNames: MOCK_BOUNDARY_NAMES.state },
  { id: "l2", label: "District", originalLabel: "ADM2", count: 52, sampleNames: MOCK_BOUNDARY_NAMES.district },
  { id: "l3", label: "Sub-district", originalLabel: "ADM3", count: 284, sampleNames: MOCK_BOUNDARY_NAMES.sub_ward },
  { id: "l4", label: "Ward", originalLabel: "ADM4", count: 4468, sampleNames: MOCK_BOUNDARY_NAMES.ward },
];

// Hierarchy levels for Excel upload (non-geographic, fewer levels common)
export const EXCEL_LEVELS: BoundaryLevel[] = [
  { id: "l1", label: "Region", originalLabel: "Region", count: 4, sampleNames: ["North Region", "South Region", "East Region", "West Region"] },
  { id: "l2", label: "Zone", originalLabel: "Zone", count: 18, sampleNames: ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F"] },
  { id: "l3", label: "Area", originalLabel: "Area", count: 97, sampleNames: ["Area 1", "Area 2", "Area 3", "Area 4", "Area 5", "Area 6", "Area 7"] },
];

export const MOCK_LEVELS_BY_SOURCE: Record<string, BoundaryLevel[]> = {
  preloaded: PRELOADED_LEVELS,
  shapefile: SHAPEFILE_LEVELS,
  excel: EXCEL_LEVELS,
};

// Excel template columns for CSV download
export const EXCEL_TEMPLATE_CSV = `boundary_name,hierarchy_level,parent_boundary_name
North Region,1,
South Region,1,
Zone A,2,North Region
Zone B,2,North Region
Zone C,2,South Region
Area 1,3,Zone A
Area 2,3,Zone A
Area 3,3,Zone B
`;

// Seed hierarchy shown to new Super Admin (demo: one pre-loaded hierarchy already set up)
export const SEED_HIERARCHY: BoundaryHierarchy = {
  id: "bh_seed",
  name: "Administrative Hierarchy",
  isDefault: true,
  status: "active",
  dataMode: "geographic",
  source: "preloaded",
  levels: PRELOADED_LEVELS,
  operationalLevelId: "l4",
  usedByServices: ["Trade License"],
  createdBy: "admin",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
};
