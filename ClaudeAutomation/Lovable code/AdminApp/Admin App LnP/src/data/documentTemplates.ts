/**
 * Shared document template names used by both DocumentDesigner and PaymentsConfigurator.
 * Keep this in sync when adding new template types.
 */
export const DOCUMENT_TEMPLATE_NAMES = [
  "License Certificate",
  "Application PDF",
  "Acknowledgement",
  "Inspection Report",
  "Demand Notice",
] as const;

export type DocumentTemplateName = (typeof DOCUMENT_TEMPLATE_NAMES)[number];
