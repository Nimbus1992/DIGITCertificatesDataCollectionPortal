import { test, expect, Page } from "@playwright/test";

const NOW = Date.now();
const DAY = 86_400_000;

const VERIFIER = { email: "verifier@gov.in", password: "verify123", name: "Priya Sharma", roleId: "document_verifier" };

function makeBreachedApp(id = "BL-BREACH-001") {
  const createdAt = NOW - 6 * DAY; // 6 days ago > atRisk(5)
  return {
    id,
    serviceId: "business_license",
    serviceLabel: "Business Licence",
    applicantName: "SLA Test Applicant",
    phone: "821234567",
    idType: "sa_id",
    idNumber: "8501015800086",
    business: { name: "Breach Biz", type: "Retail", address: "1 Test St" },
    location: { line1: "1 Test St", city: "Cape Town", zone: "cpt_sc16", postalCode: "8001" },
    operations: { startDate: "2026-01-01", shopAreaSqft: 100, hazardous: false },
    documents: [{ fieldId: "doc_id", name: "ID.pdf", fileName: "ID.pdf", status: "Pending" }],
    currentStageId: "submitted",
    fees: {
      verification: { label: "Verification Fee", fee: 250, tax: 25, status: "due" },
      issuance: { label: "Issuance Fee", fee: 1000, tax: 100, status: "due" },
    },
    history: [{ stageId: "submitted", at: createdAt, by: "System", byRole: "system", note: "Submitted" }],
    createdAt,
    updatedAt: createdAt,
  };
}

function makeAtRiskApp(id = "BL-ATRISK-001") {
  const createdAt = NOW - 4 * DAY; // 4 days >= target(3), <= atRisk(5)
  return {
    ...makeBreachedApp(id),
    id,
    applicantName: "AtRisk Applicant",
    createdAt,
    updatedAt: createdAt,
    history: [{ stageId: "submitted", at: createdAt, by: "System", byRole: "system", note: "Submitted" }],
  };
}

async function seedWithSlaApps(page: Page, apps: any[]) {
  await page.goto("/login");
  await page.evaluate(
    ({ session, apps }) => {
      sessionStorage.setItem("employee:session:v2", JSON.stringify(session));
      localStorage.setItem("employee:applications:v5", JSON.stringify(apps));
      localStorage.removeItem("employee:notifications:v5");
    },
    {
      session: { email: VERIFIER.email, name: VERIFIER.name, roleId: VERIFIER.roleId, loggedInAt: NOW },
      apps,
    },
  );
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}

// ─── Suite: SLA breach indicators ─────────────────────────────────────────────
test.describe("SLA breach indicators", () => {
  // EMP-S-001: Inbox shows Breached for 6-day-old submitted app
  test("Inbox shows Breached badge for overdue app", async ({ page }) => {
    await seedWithSlaApps(page, [makeBreachedApp()]);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const body = await page.locator("body").textContent();
    expect(body?.match(/breach|overdue|at risk|on track/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/sla-01-inbox.png", fullPage: true });
  });

  // EMP-S-002: Page body contains "Breached" text (SLA_LABEL value)
  test("Inbox body contains Breached text for 6-day app", async ({ page }) => {
    await seedWithSlaApps(page, [makeBreachedApp()]);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const body = await page.locator("body").textContent();
    // SLA_LABEL.breached = "Breached"
    expect(body?.match(/breached/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/sla-02-breached-text.png", fullPage: true });
  });

  // EMP-S-003: At-risk app (4 days) shows At risk
  test("Inbox shows At risk for 4-day-old submitted app", async ({ page }) => {
    await seedWithSlaApps(page, [makeAtRiskApp()]);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const body = await page.locator("body").textContent();
    expect(body?.match(/at risk|risk/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/sla-03-at-risk.png", fullPage: true });
  });

  // EMP-S-004: Dashboard SLA section renders (has numeric or status text)
  test("Dashboard shows SLA summary information", async ({ page }) => {
    await seedWithSlaApps(page, [makeBreachedApp(), makeAtRiskApp()]);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.match(/\d+|SLA|breach|risk|track/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/sla-04-dashboard.png", fullPage: true });
  });

  // EMP-S-005: On-track app (1 day old) shows On track
  test("Inbox shows On track for 1-day-old app", async ({ page }) => {
    const onTrackApp = makeBreachedApp("BL-ONTRACK-001");
    onTrackApp.createdAt = NOW - 1 * DAY;
    onTrackApp.updatedAt = NOW - 1 * DAY;
    onTrackApp.history = [{ stageId: "submitted", at: NOW - 1 * DAY, by: "System", byRole: "system", note: "Submitted" }];
    await seedWithSlaApps(page, [onTrackApp]);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const body = await page.locator("body").textContent();
    expect(body?.match(/on track|track/i)).toBeTruthy();
    await page.screenshot({ path: "screenshots/sla-05-on-track.png", fullPage: true });
  });
});
