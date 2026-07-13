import type { FormConfig, EffectiveFormField, FieldType } from "../types";

export interface RecommendedField {
  name: string;
  fieldType: FieldType;
  mandatory: boolean;
  validation: string;
  removable: boolean;
}

export interface RecommendedSubsection {
  name: string;
  fields: RecommendedField[];
}

export interface RecommendedSection {
  id: string;
  title: string;
  borderColor: string;
  canAddFields: boolean;
  canAddSubsections: boolean;
  subsections: RecommendedSubsection[];
}

export const RECOMMENDED_SECTIONS: RecommendedSection[] = [
  {
    id: "applicant",
    title: "Applicant Details",
    borderColor: "border-blue-500",
    canAddFields: true,
    canAddSubsections: false,
    subsections: [
      {
        name: "",
        fields: [
          { name: "Full Name",     fieldType: "text",     mandatory: true,  validation: "Min 3 characters", removable: false },
          { name: "Mobile Number", fieldType: "phone",    mandatory: true,  validation: "10-digit number",  removable: false },
          { name: "Email Address", fieldType: "email",    mandatory: false, validation: "—",                removable: false },
          { name: "ID Type",       fieldType: "dropdown", mandatory: true,  validation: "From accepted ID types", removable: false },
          { name: "ID Number",     fieldType: "text",     mandatory: true,  validation: "—",                removable: false },
        ],
      },
      {
        name: "Applicant Address",
        fields: [
          { name: "House No / Apartment Name", fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 1",            fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 2",            fieldType: "text", mandatory: false, validation: "—",              removable: false },
          { name: "Postal Code",               fieldType: "text", mandatory: true,  validation: "6-digit number", removable: false },
        ],
      },
    ],
  },
  {
    id: "business",
    title: "Business Details",
    borderColor: "border-emerald-500",
    canAddFields: true,
    canAddSubsections: true,
    subsections: [
      {
        name: "General",
        fields: [
          { name: "Business / Trade Name",        fieldType: "text",     mandatory: true,  validation: "Min 3 characters",    removable: false },
          { name: "Trade Category",               fieldType: "dropdown", mandatory: true,  validation: "—",                   removable: false },
          { name: "Sub-category",                 fieldType: "dropdown", mandatory: true,  validation: "—",                   removable: false },
          { name: "Business Registration Number", fieldType: "text",     mandatory: false, validation: "15-char alphanumeric", removable: true  },
          { name: "Tax Identification Number",    fieldType: "text",     mandatory: false, validation: "10-char alphanumeric", removable: true  },
          { name: "Year of Establishment",        fieldType: "year",     mandatory: true,  validation: "—",                   removable: false },
        ],
      },
      {
        name: "Business Address",
        fields: [
          { name: "House No / Apartment Name", fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 1",            fieldType: "text", mandatory: true,  validation: "—",              removable: false },
          { name: "Address Line 2",            fieldType: "text", mandatory: false, validation: "—",              removable: false },
          { name: "Postal Code",               fieldType: "text", mandatory: true,  validation: "6-digit number", removable: false },
        ],
      },
      {
        name: "Operations Details",
        fields: [
          { name: "Business Area",          fieldType: "number",   mandatory: true,  validation: "In sq ft, min 1", removable: false },
          { name: "Number of Employees",    fieldType: "number",   mandatory: true,  validation: "Min 1",           removable: false },
          { name: "Operating Hours",        fieldType: "text",     mandatory: false, validation: "—",               removable: true  },
          { name: "Is Business Hazardous?", fieldType: "dropdown", mandatory: true,  validation: "Yes / No",        removable: false },
        ],
      },
    ],
  },
  {
    id: "declaration",
    title: "Declaration",
    borderColor: "border-amber-500",
    canAddFields: false,
    canAddSubsections: false,
    subsections: [
      {
        name: "",
        fields: [
          { name: "I declare all information provided is true", fieldType: "checkbox", mandatory: true, validation: "—", removable: false },
          { name: "I agree to the Terms and Conditions",        fieldType: "checkbox", mandatory: true, validation: "—", removable: false },
        ],
      },
    ],
  },
];

export function computeEffectiveFields(f: FormConfig): EffectiveFormField[] {
  const deleted = f.deletedRecommendedFields ?? [];
  const edited  = f.editedRecommendedFields ?? {};
  const result: EffectiveFormField[] = [];

  for (const section of RECOMMENDED_SECTIONS) {
    for (const sub of section.subsections) {
      for (const field of sub.fields) {
        if (deleted.includes(field.name)) continue;
        const ov = edited[field.name] ?? {};
        result.push({
          sectionId:     section.id,
          sectionTitle:  section.title,
          subsectionName: sub.name,
          name:          ov.name       ?? field.name,
          fieldType:     ov.fieldType  ?? field.fieldType,
          mandatory:     ov.mandatory  ?? field.mandatory,
          validation:    ov.validation ?? field.validation,
          isRecommended: true,
        });
      }
    }
  }

  for (const cf of f.customFields) {
    const section = RECOMMENDED_SECTIONS.find((s) => s.id === cf.sectionId);
    result.push({
      sectionId:     cf.sectionId,
      sectionTitle:  section?.title ?? cf.sectionId,
      subsectionName: cf.subsectionName,
      name:          cf.name,
      fieldType:     cf.fieldType,
      mandatory:     cf.mandatory,
      validation:    cf.validation,
      isRecommended: false,
      dropdownOptions: cf.dropdownOptions,
    });
  }

  return result;
}
