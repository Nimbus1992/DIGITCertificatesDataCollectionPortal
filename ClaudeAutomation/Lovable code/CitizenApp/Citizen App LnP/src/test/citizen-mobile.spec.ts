import { test, expect, Page } from "@playwright/test";

// ─── Seed data (mirrored from citizen-qa.spec.ts) ──────────────────────────────
const NOW = Date.now();
const DAY = 86_400_000;

const CITIZEN_SESSION = {
  id: "c_qa001",
  phone: "821234567",
  name: "Thandiwe Mbeki",
  createdAt: NOW - 7 * DAY,
};

const BASE_VALUES = {
  fullName: "Thandiwe Mbeki",
  mobile: "821234567",
  email: "thandiwe.mbeki@example.co.za",
  idType: "sa_id",
  idNumber: "8501015800086",
  businessName: "Table Bay Traders",
  businessCategory: "retail",
  subCategory: "general",
  ownershipType: "proprietorship",
  numEmployees: 4,
  annualTurnover: 1250000,
  addressLine1: "12 Long Street",
  addressLine2: "",
  city: "cape_town",
  zone: "cpt_sc16",
  postalCode: "8001",
  businessStartDate: "2026-04-28",
  shopArea: 250,
  hazardous: "no",
};

const DEMO_DOCS = [
  {
    fieldId: "doc_id_proof",
    name: "south-african-id.svg",
    size: 24500,
    type: "image/svg+xml",
    dataUrl: "data:image/svg+xml;utf8,%3Csvg/%3E",
    uploadedAt: NOW - 12 * DAY,
  },
  {
    fieldId: "doc_address_proof",
    name: "proof-of-address.svg",
    size: 31200,
    type: "image/svg+xml",
    dataUrl: "data:image/svg+xml;utf8,%3Csvg/%3E",
    uploadedAt: NOW - 12 * DAY,
  },
  {
    fieldId: "doc_business_proof",
    name: "business-registration.svg",
    size: 41800,
    type: "image/svg+xml",
    dataUrl: "data:image/svg+xml;utf8,%3Csvg/%3E",
    uploadedAt: NOW - 12 * DAY,
  },
];

const ISSUED_ARN = "TL-business-license-qa-0001";
const REJECTED_ARN = "TL-business-license-qa-0002";

const ISSUED_APP = {
  id: ISSUED_ARN,
  serviceId: "trade-license",
  applicantName: "Thandiwe Mbeki",
  phone: "821234567",
  values: BASE_VALUES,
  documents: DEMO_DOCS,
  currentStateId: "issued",
  licenseNo: "TL/2026/10001",
  history: [
    { stateId: "submitted", at: NOW - 12 * DAY, note: "Application submitted" },
    { stateId: "doc_verification", at: NOW - 11 * DAY, note: "Send for Verification" },
    { stateId: "inspection", at: NOW - 9 * DAY, note: "Schedule Inspection" },
    { stateId: "payment_due", at: NOW - 7 * DAY, note: "Payment due" },
    { stateId: "approval", at: NOW - 5 * DAY, note: "Payment Received" },
    { stateId: "issued", at: NOW - 4 * DAY, note: "Licence issued" },
  ],
  payments: [{ stageId: "payment_due", amount: 3850, paidAt: NOW - 6 * DAY, receiptId: "RCPT-26052812" }],
  createdAt: NOW - 12 * DAY,
  updatedAt: NOW - 4 * DAY,
};

const REJECTED_APP = {
  id: REJECTED_ARN,
  serviceId: "trade-license",
  applicantName: "Thandiwe Mbeki",
  phone: "821234567",
  values: BASE_VALUES,
  documents: DEMO_DOCS,
  currentStateId: "rejected",
  history: [
    { stateId: "submitted", at: NOW - 6 * DAY, note: "Application submitted" },
    { stateId: "doc_verification", at: NOW - 5 * DAY, note: "Send for Verification" },
    { stateId: "rejected", at: NOW - 3 * DAY, note: "Rejected (documents)" },
  ],
  payments: [],
  createdAt: NOW - 6 * DAY,
  updatedAt: NOW - 3 * DAY,
};

async function seedCitizen(page: Page) {
  await page.goto("/");
  await page.evaluate(
    ({ session, apps }) => {
      localStorage.setItem("citizen:session:v1", JSON.stringify(session));
      localStorage.setItem("citizen:applications:v1", JSON.stringify(apps));
      localStorage.setItem("citizen:seeded:v2", "true");
      localStorage.setItem("citizen:notifications:v1", JSON.stringify([]));
      localStorage.setItem("citizen:drafts:v1", JSON.stringify({}));
    },
    { session: CITIZEN_SESSION, apps: [ISSUED_APP, REJECTED_APP] }
  );
  await page.reload();
  await page.waitForLoadState("networkidle");
}

// ─── Mobile smoke tests ────────────────────────────────────────────────────────

test.describe("Mobile smoke tests", () => {
  test("Auth page renders on mobile", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 390;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    await page.screenshot({ path: "screenshots/mobile-cit-01-auth.png", fullPage: true });
  });

  test("Home page renders on mobile", async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-cit-02-home.png", fullPage: true });
  });

  test("Services page renders on mobile", async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-cit-03-services.png", fullPage: true });
  });

  test("Apply wizard renders on mobile", async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/apply/trade-license");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-cit-04-apply.png", fullPage: true });
  });

  test("Applications list renders on mobile", async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/applications");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-cit-05-apps.png", fullPage: true });
  });

  test("Profile renders on mobile", async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-cit-06-profile.png", fullPage: true });
  });
});
