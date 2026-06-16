import { describe, it, expect } from "vitest";
import { generateArn, generateLicenseNo } from "@/lib/citizen/arn";

describe("generateArn", () => {
  // Test 1: generateArn("TL") matches regex /^TL-\d{8}-\d{4}-\d{4}$/
  it('matches regex /^TL-\\d{8}-\\d{4}-\\d{4}$/ for prefix "TL"', () => {
    const arn = generateArn("TL");
    expect(arn).toMatch(/^TL-\d{8}-\d{4}-\d{4}$/);
  });

  // Test 2: generateArn("BP") starts with "BP-"
  it('starts with "BP-" for prefix "BP"', () => {
    const arn = generateArn("BP");
    expect(arn.startsWith("BP-")).toBe(true);
  });

  // Test 3: Two calls return different values — generate 5 and check at least 2 are different
  it("generates non-deterministic values across multiple calls", () => {
    const arns = Array.from({ length: 5 }, () => generateArn("TL"));
    const unique = new Set(arns);
    expect(unique.size).toBeGreaterThan(1);
  });

  // Test 4: Year component of ARN is the current year (4-digit)
  it("contains the current year as a 4-digit component", () => {
    const arn = generateArn("TL");
    const currentYear = new Date().getFullYear().toString();
    // ARN format: TL-YYYYMMDD-HHMM-SSSS
    // Extract the YYYY part from the date segment (chars after "TL-")
    const datePart = arn.split("-")[1]; // "YYYYMMDD"
    const yearFromArn = datePart.substring(0, 4);
    expect(yearFromArn).toBe(currentYear);
  });

  // Test 5: generateLicenseNo("TL") matches regex /^TL\/\d{4}\/\d{6}$/
  it('generateLicenseNo("TL") matches regex /^TL\\/\\d{4}\\/\\d{6}$/', () => {
    const licNo = generateLicenseNo("TL");
    expect(licNo).toMatch(/^TL\/\d{4}\/\d{6}$/);
  });

  // Test 6: generateLicenseNo("BP") starts with "BP/"
  it('generateLicenseNo("BP") starts with "BP/"', () => {
    const licNo = generateLicenseNo("BP");
    expect(licNo.startsWith("BP/")).toBe(true);
  });

  // Test 7: Two calls to generateLicenseNo return different values
  it("generateLicenseNo generates non-deterministic values across multiple calls", () => {
    const licNos = Array.from({ length: 5 }, () => generateLicenseNo("TL"));
    const unique = new Set(licNos);
    expect(unique.size).toBeGreaterThan(1);
  });

  // Test 8: License number year equals new Date().getFullYear().toString()
  it("license number year equals current year", () => {
    const licNo = generateLicenseNo("TL");
    const currentYear = new Date().getFullYear().toString();
    // License format: TL/YYYY/NNNNNN
    const parts = licNo.split("/");
    expect(parts[1]).toBe(currentYear);
  });
});
