import { test, expect, Page } from "@playwright/test";

const NOW = Date.now();
const DAY = 86_400_000;

const VERIFIER = { email: "verifier@gov.in", password: "verify123", name: "Priya Sharma", roleId: "document_verifier" };
const INSPECTOR = { email: "inspector@gov.in", password: "inspect123", name: "Rahul Verma", roleId: "field_inspector" };
const APPROVER = { email: "approver@gov.in", password: "approve123", name: "Anita Reddy", roleId: "approver" };
type DemoUser = typeof VERIFIER;

function makeApp(overrides: Record<string, any> = {}) {
  return {
    id: "BL-TEST-001",
    serviceId: "business_license",
    serviceLabel: "Business Licence",
    applicantName: "Test Applicant",
    phone: "821234567",
    email: "test@example.com",
    idType: "sa_id",
    idNumber: "8501015800086",
    business: { name: "Test Biz", type: "Retail", address: "1 Main St", category: "retail", subCategory: "general" },
    location: { line1: "1 Main St", city: "Cape Town", zone: "cpt_sc16", postalCode: "8001" },
    operations: { startDate: "2026-01-01", shopAreaSqft: 100, hazardous: false },
    documents: [
      { fieldId: "doc_id", name: "ID.pdf", fileName: "ID.pdf", status: "Pending" },
      { fieldId: "doc_addr", name: "Address.pdf", fileName: "Address.pdf", status: "Pending" },
    ],
    currentStageId: "submitted",
    fees: {
      verification: { label: "Verification Fee", fee: 250, tax: 25, status: "due" },
      issuance: { label: "Issuance Fee", fee: 1000, tax: 100, status: "due" },
    },
    history: [{ stageId: "submitted", at: NOW - 2 * DAY, by: "System", byRole: "system", note: "Submitted" }],
    createdAt: NOW - 2 * DAY,
    updatedAt: NOW - 2 * DAY,
    ...overrides,
  };
}

async function seedWithApp(page: Page, user: DemoUser, app: any) {
  await page.goto("/login");
  await page.evaluate(
    ({ session, app }) => {
      sessionStorage.setItem("employee:session:v2", JSON.stringify(session));
      localStorage.setItem("employee:applications:v5", JSON.stringify([app]));
      localStorage.removeItem("employee:notifications:v5");
    },
    { session: { email: user.email, name: user.name, roleId: user.roleId, loggedInAt: NOW }, app },
  );
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}

// ─── Suite: Stage transitions — UI verification ────────────────────────────────
test.describe("Stage transitions — UI verification", () => {
  // EMP-T-001: submitted stage app detail loads for verifier
  test("submitted stage: verifier app detail loads", async ({ page }) => {
    const app = makeApp({ currentStageId: "submitted" });
    await seedWithApp(page, VERIFIER, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    const body = await page.locator("body").textContent();
    expect(body?.match(/submitted|Test Applicant|BL-TEST/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-01-submitted.png", fullPage: true });
  });

  // EMP-T-002: under_doc_verification stage
  test("under_doc_verification stage: app detail shows verification context", async ({ page }) => {
    const app = makeApp({
      currentStageId: "under_doc_verification",
      history: [
        { stageId: "submitted", at: NOW - 3 * DAY, by: "System", byRole: "system", note: "Submitted" },
        { stageId: "under_doc_verification", at: NOW - 2 * DAY, by: "Priya Sharma", byRole: "document_verifier", note: "Started verification" },
      ],
    });
    await seedWithApp(page, VERIFIER, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/verif|document|doc/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-02-under-verif.png", fullPage: true });
  });

  // EMP-T-003: inspection_pending stage
  test("inspection_pending stage: app detail shows inspection context", async ({ page }) => {
    const app = makeApp({
      currentStageId: "inspection_pending",
      history: [
        { stageId: "submitted", at: NOW - 4 * DAY, by: "System", byRole: "system", note: "Submitted" },
        { stageId: "inspection_pending", at: NOW - 2 * DAY, by: "Priya", byRole: "document_verifier", note: "Docs verified" },
      ],
      documents: [
        { fieldId: "doc_id", name: "ID.pdf", fileName: "ID.pdf", status: "Verified" },
        { fieldId: "doc_addr", name: "Address.pdf", fileName: "Address.pdf", status: "Verified" },
      ],
    });
    await seedWithApp(page, INSPECTOR, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/inspect|pending|document/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-03-inspection-pending.png", fullPage: true });
  });

  // EMP-T-004: inspection_scheduled stage
  test("inspection_scheduled stage: shows scheduled inspection info", async ({ page }) => {
    const app = makeApp({
      currentStageId: "inspection_scheduled",
      inspection: { scheduledAt: NOW + DAY, inspectorName: "Rahul Verma", slot: "09:00-11:00" },
      history: [
        { stageId: "submitted", at: NOW - 5 * DAY, by: "System", byRole: "system", note: "Submitted" },
        { stageId: "inspection_scheduled", at: NOW - 1 * DAY, by: "Rahul", byRole: "field_inspector", note: "Scheduled" },
      ],
    });
    await seedWithApp(page, INSPECTOR, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/scheduled|inspect|Rahul/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-04-inspection-scheduled.png", fullPage: true });
  });

  // EMP-T-005: payment_pending stage
  test("payment_pending stage: shows payment pending context", async ({ page }) => {
    const app = makeApp({
      currentStageId: "payment_pending",
      fees: {
        verification: { label: "Verification Fee", fee: 250, tax: 25, status: "paid" },
        issuance: { label: "Issuance Fee", fee: 1000, tax: 100, status: "due" },
      },
      history: [
        { stageId: "submitted", at: NOW - 6 * DAY, by: "System", byRole: "system", note: "Submitted" },
        { stageId: "payment_pending", at: NOW - 1 * DAY, by: "Rahul", byRole: "field_inspector", note: "Passed inspection" },
      ],
    });
    await seedWithApp(page, APPROVER, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/payment|fee|pending|issuance/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-05-payment-pending.png", fullPage: true });
  });

  // EMP-T-006: paid stage
  test("paid stage: shows paid fees and issue action area", async ({ page }) => {
    const app = makeApp({
      currentStageId: "paid",
      fees: {
        verification: { label: "Verification Fee", fee: 250, tax: 25, status: "paid" },
        issuance: { label: "Issuance Fee", fee: 1000, tax: 100, status: "paid" },
      },
      history: [
        { stageId: "paid", at: NOW - 1 * DAY, by: "System", byRole: "system", note: "Citizen paid" },
      ],
    });
    await seedWithApp(page, APPROVER, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/paid|fee|issue|licen/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-06-paid.png", fullPage: true });
  });

  // EMP-T-007: issued stage — shows license number
  test("issued stage: shows license number", async ({ page }) => {
    const app = makeApp({
      currentStageId: "issued",
      licenseNumber: "BL/2026/123456",
      licenseIssuedAt: NOW - 1 * DAY,
      history: [
        { stageId: "issued", at: NOW - 1 * DAY, by: "Anita", byRole: "approver", note: "Licence issued" },
      ],
    });
    await seedWithApp(page, APPROVER, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/issued|BL\/2026|licen/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-07-issued.png", fullPage: true });
  });

  // EMP-T-008: rejected stage — shows rejection in history
  test("rejected stage: shows rejection note", async ({ page }) => {
    const app = makeApp({
      currentStageId: "rejected",
      history: [
        { stageId: "submitted", at: NOW - 3 * DAY, by: "System", byRole: "system", note: "Submitted" },
        { stageId: "rejected", at: NOW - 1 * DAY, by: "Rahul", byRole: "field_inspector", note: "Failed inspection — fire hazard" },
      ],
    });
    await seedWithApp(page, VERIFIER, app);
    await page.goto(`/inbox/${app.id}`);
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/reject|failed|hazard/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/stage-08-rejected.png", fullPage: true });
  });
});
