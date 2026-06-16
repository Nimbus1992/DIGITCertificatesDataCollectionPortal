const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export async function fetchSheetRows(
  spreadsheetId: string,
  tabName: string,
  accessToken: string
): Promise<string[][]> {
  const range = encodeURIComponent(`${tabName}!A1:Z500`);
  const url = `${BASE}/${spreadsheetId}/values/${range}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.values ?? [];
}

export async function testConnection(
  spreadsheetId: string,
  accessToken: string
): Promise<string[]> {
  const url = `${BASE}/${spreadsheetId}?fields=sheets.properties.title`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Cannot access spreadsheet. HTTP ${res.status}`);
  const data = await res.json();
  return (data.sheets ?? []).map((s: { properties: { title: string } }) => s.properties.title);
}
