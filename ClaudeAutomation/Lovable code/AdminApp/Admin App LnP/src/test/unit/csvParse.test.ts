import { describe, it, expect } from "vitest";
import { parseCategoriesCsv, parseSubcategoriesCsv } from "@/lib/csvParse";

/** Create a File-like object from plain text content.
 *  jsdom 20 does not implement File.prototype.text(), so we attach it manually.
 */
function makeFile(content: string): File {
  const file = new File([content], "test.csv", { type: "text/csv" });
  // Polyfill .text() if missing (jsdom ≤ 20)
  if (typeof file.text !== "function") {
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(content),
      writable: false,
    });
  } else {
    // Even when .text() exists, override it to return the exact content string
    // to avoid any encoding issues in the test environment.
    Object.defineProperty(file, "text", {
      value: () => Promise.resolve(content),
      writable: true,
      configurable: true,
    });
  }
  return file;
}

describe("csvParse — unit tests", () => {
  // ADMIN-U-013
  it("ADMIN-U-013: Basic 2-row CSV returns both data rows as categories", async () => {
    const file = makeFile("Name\nRetail\nFood");
    const result = await parseCategoriesCsv(file);
    expect(result).toEqual(["Retail", "Food"]);
  });

  // ADMIN-U-014
  it("ADMIN-U-014: Strips header row — first row never returned as data", async () => {
    const file = makeFile("Name\nRetail");
    const result = await parseCategoriesCsv(file);
    expect(result).not.toContain("Name");
    expect(result).toEqual(["Retail"]);
  });

  // ADMIN-U-015
  it("ADMIN-U-015: Deduplicates duplicate names, returning only one instance", async () => {
    const file = makeFile("Name\nRetail\nRetail\nFood");
    const result = await parseCategoriesCsv(file);
    expect(result).toEqual(["Retail", "Food"]);
    expect(result.length).toBe(2);
  });

  // ADMIN-U-016
  it("ADMIN-U-016: Quoted value with internal comma is parsed as one field", async () => {
    const file = makeFile('Name\n"Food, Beverage"');
    const result = await parseCategoriesCsv(file);
    expect(result).toEqual(["Food, Beverage"]);
  });

  // ADMIN-U-017
  it("ADMIN-U-017: Escaped double-quote inside quoted field is parsed correctly", async () => {
    const file = makeFile('Name\n"Rock""Roll"');
    const result = await parseCategoriesCsv(file);
    expect(result).toEqual(['Rock"Roll']);
  });

  // ADMIN-U-018
  it("ADMIN-U-018: Empty file content returns an empty array", async () => {
    const file = makeFile("");
    const result = await parseCategoriesCsv(file);
    expect(result).toEqual([]);
  });

  // ADMIN-U-019
  it("ADMIN-U-019: Header-only content (no data rows) returns empty array", async () => {
    const file = makeFile("Name");
    const result = await parseCategoriesCsv(file);
    expect(result).toEqual([]);
  });

  // ADMIN-U-020
  it("ADMIN-U-020: Windows line endings (CRLF) are handled correctly", async () => {
    const file = makeFile("Name\r\nRetail\r\nFood");
    const result = await parseCategoriesCsv(file);
    expect(result).toEqual(["Retail", "Food"]);
  });

  // ADMIN-U-021
  it("ADMIN-U-021: parseSubcategoriesCsv basic parse returns name and parent", async () => {
    const file = makeFile("Sub,Parent\nGeneral,Retail");
    const result = await parseSubcategoriesCsv(file);
    expect(result).toEqual([{ name: "General", parent: "Retail" }]);
  });

  // ADMIN-U-022
  it("ADMIN-U-022: parseSubcategoriesCsv deduplicates identical name+parent pairs", async () => {
    const file = makeFile("Sub,Parent\nGeneral,Retail\nGeneral,Retail");
    const result = await parseSubcategoriesCsv(file);
    expect(result).toEqual([{ name: "General", parent: "Retail" }]);
    expect(result.length).toBe(1);
  });

  // ADMIN-U-023
  it("ADMIN-U-023: parseSubcategoriesCsv uses empty string when parent column is missing", async () => {
    const file = makeFile("Sub\nGeneral");
    const result = await parseSubcategoriesCsv(file);
    expect(result).toEqual([{ name: "General", parent: "" }]);
  });

  // ADMIN-U-024
  it("ADMIN-U-024: parseSubcategoriesCsv skips rows with an empty name", async () => {
    const file = makeFile("Sub,Parent\n,Retail\nGeneral,Retail");
    const result = await parseSubcategoriesCsv(file);
    expect(result).toEqual([{ name: "General", parent: "Retail" }]);
    expect(result.length).toBe(1);
  });

  // ADMIN-U-025
  it("ADMIN-U-025: parseSubcategoriesCsv keeps same name with different parents as two results", async () => {
    const file = makeFile("Sub,Parent\nGeneral,Retail\nGeneral,Food");
    const result = await parseSubcategoriesCsv(file);
    expect(result).toEqual([
      { name: "General", parent: "Retail" },
      { name: "General", parent: "Food" },
    ]);
    expect(result.length).toBe(2);
  });
});
