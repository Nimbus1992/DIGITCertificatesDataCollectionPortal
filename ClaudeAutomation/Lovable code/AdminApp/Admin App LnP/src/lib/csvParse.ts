// Lightweight CSV parser for setup uploads.
// Handles simple quoted values; not a full RFC 4180 parser.

const splitLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
};

const readRows = (text: string): string[][] => {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map(splitLine);
};

export const parseCategoriesCsv = async (file: File): Promise<string[]> => {
  const text = await file.text();
  const rows = readRows(text);
  if (rows.length === 0) return [];
  // Drop header row if first cell is non-empty text — assume first column is the name.
  const dataRows = rows.slice(1);
  const names = dataRows.map((r) => r[0]).filter(Boolean);
  return Array.from(new Set(names));
};

export const parseSubcategoriesCsv = async (
  file: File,
): Promise<{ name: string; parent: string }[]> => {
  const text = await file.text();
  const rows = readRows(text);
  if (rows.length === 0) return [];
  const dataRows = rows.slice(1);
  const seen = new Set<string>();
  const out: { name: string; parent: string }[] = [];
  for (const r of dataRows) {
    const name = (r[0] || "").trim();
    const parent = (r[1] || "").trim();
    if (!name) continue;
    const key = `${name}__${parent}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, parent });
  }
  return out;
};