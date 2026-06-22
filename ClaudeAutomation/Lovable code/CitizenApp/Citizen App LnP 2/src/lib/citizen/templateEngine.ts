export function renderTemplate(template: string, tokens: Record<string, string | number | undefined>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = tokens[key];
    return v === undefined || v === null ? "" : String(v);
  });
}