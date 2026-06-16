/**
 * Issuance form seed — mirrors the 5 wizard steps and sub-screens
 * shown in the citizen preview (`ApplicationForm.tsx` SUB_SCREENS).
 *
 * The "Business Category" / "Sub Category" fields in step 2 are derived from
 * the categories/subcategories the user uploaded during template setup.
 * If nothing was uploaded, those fields are omitted entirely.
 */
import type { WizardField, WizardStep } from "./wizardForm";
import { CITY_ZONE_MAP } from "./tradeLicenseTemplate";

export interface FormSeedSetup {
  categoriesList?: string[];
  subcategoriesList?: { name: string; parent: string }[];
}

const buildCategoryFields = (setup: FormSeedSetup): WizardField[] => {
  const cats = (setup.categoriesList ?? []).filter(Boolean);
  const subs = (setup.subcategoriesList ?? []).filter((s) => s && s.name);
  const fields: WizardField[] = [];
  if (cats.length > 0) {
    fields.push({
      id: "businessCategory",
      type: "dropdown",
      label: "Business Category",
      placeholder: "Select business category",
      helpText: "",
      required: true,
      options: [...cats],
    });
  }
  if (cats.length > 0 && subs.length > 0) {
    const map: Record<string, string[]> = {};
    for (const s of subs) {
      if (!map[s.parent]) map[s.parent] = [];
      map[s.parent].push(s.name);
    }
    fields.push({
      id: "subCategory",
      type: "dropdown",
      label: "Sub Category",
      placeholder: "Select a business category first",
      helpText: "",
      required: true,
      dependsOn: "businessCategory",
      dependsValueMap: map,
    });
  }
  return fields;
};

export const buildIssuanceFormSteps = (setup: FormSeedSetup = {}): WizardStep[] => [
  {
    id: "step-1",
    name: "Applicant Details",
    subScreens: [
      {
        id: "s1-1",
        title: "Let's start with your name",
        fields: [
          {
            id: "fullName", type: "text", label: "Full Name",
            placeholder: "e.g. Anita Sharma", helpText: "", required: true,
            validation: { minLength: 3, pattern: "^[A-Za-z ]+$", patternMessage: "Alphabets only" },
          },
        ],
      },
      {
        id: "s1-2",
        title: "How can we reach you?",
        fields: [
          {
            id: "mobile", type: "number", label: "Mobile Number",
            placeholder: "10-digit mobile", helpText: "", required: true,
            validation: { pattern: "^\\d{10}$", patternMessage: "Enter a valid 10-digit mobile" },
          },
          {
            id: "email", type: "text", label: "Email",
            placeholder: "name@example.com", helpText: "", required: false,
            validation: { pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", patternMessage: "Enter a valid email" },
          },
        ],
      },
      {
        id: "s1-3",
        title: "Add your ID details",
        subtitle: "Helper text changes based on the selected ID type",
        fields: [
          {
            id: "idType", type: "dropdown", label: "ID Type",
            placeholder: "Select ID type", helpText: "", required: true,
            options: ["Aadhaar", "Passport", "Driving License"],
          },
          {
            id: "idNumber", type: "text", label: "ID Number",
            placeholder: "Enter ID number", required: true,
            helpText: "Format depends on the selected ID type",
          },
        ],
      },
    ],
  },
  {
    id: "step-2",
    name: "Business Details",
    subScreens: [
      {
        id: "s2-1",
        title: "What kind of business are you running?",
        fields: [
          {
            id: "businessName", type: "text", label: "Business Name",
            placeholder: "Registered business name", helpText: "", required: true,
            validation: { minLength: 3 },
          },
          ...buildCategoryFields(setup),
        ],
      },
      {
        id: "s2-2",
        title: "Who owns the business?",
        fields: [
          {
            id: "ownershipType", type: "dropdown", label: "Ownership Type",
            placeholder: "Select ownership", helpText: "", required: true,
            options: ["Individual", "Partnership", "Company"],
          },
        ],
      },
      {
        id: "s2-3",
        title: "Add a few more details",
        optional: true,
        fields: [
          {
            id: "employees", type: "number", label: "Number of Employees",
            placeholder: "0", helpText: "", required: false,
            validation: { min: 0 },
          },
          {
            id: "turnover", type: "number", label: "Annual Turnover (₹)",
            placeholder: "0", helpText: "", required: false,
            validation: { min: 0 },
          },
        ],
      },
    ],
  },
  {
    id: "step-3",
    name: "Business Location",
    subScreens: [
      {
        id: "s3-1",
        title: "Where is your business located?",
        subtitle: "Long press to drop a pin, or search by pincode/area.",
        optional: true,
        isMap: true,
        fields: [],
      },
      {
        id: "s3-2",
        title: "Is this your business address?",
        helperBanner: "We've filled this based on your location. You can edit if needed.",
        fields: [
          { id: "addr1", type: "text", label: "Address Line 1", placeholder: "Street, building", helpText: "", required: true },
          { id: "addr2", type: "text", label: "Address Line 2", placeholder: "Locality (optional)", helpText: "", required: false },
          {
            id: "city", type: "dropdown", label: "City",
            placeholder: "Select city", helpText: "", required: true,
            options: ["City A", "City B"],
          },
          {
            id: "zone", type: "dropdown", label: "Zone / Ward",
            placeholder: "Select a city first", helpText: "", required: true,
            dependsOn: "city", dependsValueMap: CITY_ZONE_MAP,
          },
          {
            id: "pincode", type: "number", label: "Pincode",
            placeholder: "6-digit pincode", helpText: "", required: true,
            validation: { pattern: "^\\d{6}$", patternMessage: "Enter a valid 6-digit pincode" },
          },
        ],
      },
    ],
  },
  {
    id: "step-4",
    name: "Operational Details",
    subScreens: [
      {
        id: "s4-1",
        title: "When did your business start?",
        fields: [
          {
            id: "startDate", type: "date", label: "Business Start Date",
            placeholder: "", helpText: "", required: true,
            validation: { pastDateOnly: true },
          },
        ],
      },
      {
        id: "s4-2",
        title: "What is the size of your shop (in sq ft)?",
        fields: [
          {
            id: "shopArea", type: "number", label: "Shop Area (sq ft)",
            placeholder: "e.g. 250", required: true,
            helpText: "Used to calculate licence fees",
            validation: { min: 1 },
          },
        ],
      },
      {
        id: "s4-3",
        title: "Does your business involve any safety risks?",
        fields: [
          {
            id: "isHazardous", type: "radio", label: "Is Hazardous Activity?",
            placeholder: "", helpText: "", required: true,
            options: ["No", "Yes"],
          },
          {
            id: "hazardType", type: "dropdown", label: "Hazard Type",
            placeholder: "Select hazard type", helpText: "", required: true,
            options: ["Chemical", "Electrical", "Fire Risk"],
            showIf: { field: "isHazardous", equals: "Yes" },
          },
        ],
      },
    ],
  },
  {
    id: "step-5",
    name: "Documents",
    subScreens: [
      {
        id: "s5-1",
        title: "Upload documents to complete your application",
        fields: [
          { id: "docId", type: "file", label: "ID Proof", placeholder: "", helpText: "", required: true },
          { id: "docAddr", type: "file", label: "Address Proof", placeholder: "", helpText: "", required: true },
          { id: "docBusiness", type: "file", label: "Business Proof", placeholder: "", helpText: "", required: true },
        ],
      },
    ],
  },
];

/** @deprecated Prefer `buildIssuanceFormSteps(setup)` so category fields reflect template-setup uploads. */
export const ISSUANCE_FORM_STEPS: WizardStep[] = buildIssuanceFormSteps();