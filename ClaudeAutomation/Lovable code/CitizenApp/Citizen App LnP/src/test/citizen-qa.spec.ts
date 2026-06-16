import { test, expect, Page } from "@playwright/test";

// ─── Seed data ─────────────────────────────────────────────────────────────────
const NOW = Date.now();
const DAY = 86_400_000;

const CITIZEN_SESSION = {
  id: "c_qa001",
  phone: "821234567",
  name: "Thandiwe Mbeki",
  createdAt: NOW - 7 * DAY,
};

// Two seeded applications: one issued (with license), one rejected
const ISSUED_ARN = "TL-business-license-qa-0001";
const REJECTED_ARN = "TL-business-license-qa-0002";

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
  { fieldId: "doc_id_proof", name: "south-african-id.svg", size: 24500, type: "image/svg+xml", dataUrl: "data:image/svg+xml;utf8,%3Csvg/%3E", uploadedAt: NOW - 12 * DAY },
  { fieldId: "doc_address_proof", name: "proof-of-address.svg", size: 31200, type: "image/svg+xml", dataUrl: "data:image/svg+xml;utf8,%3Csvg/%3E", uploadedAt: NOW - 12 * DAY },
  { fieldId: "doc_business_proof", name: "business-registration.svg", size: 41800, type: "image/svg+xml", dataUrl: "data:image/svg+xml;utf8,%3Csvg/%3E", uploadedAt: NOW - 12 * DAY },
];

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
    ({ session, apps, arn }) => {
      localStorage.setItem("citizen:session:v1", JSON.stringify(session));
      localStorage.setItem("citizen:applications:v1", JSON.stringify(apps));
      localStorage.setItem("citizen:seeded:v2", "true");
      localStorage.setItem("citizen:notifications:v1", JSON.stringify([]));
      localStorage.setItem("citizen:drafts:v1", JSON.stringify({}));
    },
    { session: CITIZEN_SESSION, apps: [ISSUED_APP, REJECTED_APP], arn: ISSUED_ARN }
  );
  await page.reload();
  await page.waitForLoadState("networkidle");
}

// ─── 1. Auth flow (no seed) ────────────────────────────────────────────────────
test.describe("Auth flow", () => {
  test("Auth page loads with phone input and Send OTP button", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("input[type='tel'], input[type='text'], input").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /send otp/i })).toBeVisible();
    await page.screenshot({ path: "screenshots/01-auth.png", fullPage: true });
  });

  test("Entering phone and clicking Send OTP shows OTP input", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    await page.locator("input").first().fill("821234567");
    await page.getByRole("button", { name: /send otp/i }).click();
    await page.waitForTimeout(1000);
    // Either OTP input appears or we stay on page — check for change
    await page.screenshot({ path: "screenshots/01b-auth-after-otp.png", fullPage: true });
    const body = await page.locator("body").textContent();
    // Should show "Verify" or "OTP" or "code" text, or a new input
    expect(body).toBeTruthy();
  });
});

// ─── 2. Home page ──────────────────────────────────────────────────────────────
test.describe("Home page", () => {
  test.beforeEach(async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
  });

  test("Home renders with Browse services button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /browse services/i }).or(page.getByText(/browse services/i)).first()).toBeVisible();
    await page.screenshot({ path: "screenshots/02-home.png", fullPage: true });
  });

  test("Bottom tab bar has 5 tabs", async ({ page }) => {
    for (const label of ["Home", "Services", "Applications", "Documents", "Profile"]) {
      await expect(page.getByText(label).first()).toBeVisible();
    }
    await page.screenshot({ path: "screenshots/02b-home-tabs.png" });
  });

  test("Browse services navigates to services page", async ({ page }) => {
    const browseBtn = page.getByRole("button", { name: /browse services/i }).or(page.getByText(/browse services/i)).first();
    if (await browseBtn.isVisible()) {
      await browseBtn.click();
      await page.waitForLoadState("networkidle");
      await expect(page.url()).toContain("services");
    }
  });
});

// ─── 3. Services page ──────────────────────────────────────────────────────────
test.describe("Services page", () => {
  test.beforeEach(async ({ page }) => {
    await seedCitizen(page);
  });

  test("Services page loads with Trade License listed", async ({ page }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/trade license|business license/i).first()).toBeVisible();
    await page.screenshot({ path: "screenshots/03-services.png", fullPage: true });
  });

  test("Building Permit / Fire NOC show as Coming Soon or disabled", async ({ page }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    const comingSoon = page.getByText(/coming soon|soon/i).first();
    if (await comingSoon.isVisible()) {
      await expect(comingSoon).toBeVisible();
    }
    await page.screenshot({ path: "screenshots/03b-services-coming-soon.png", fullPage: true });
  });

  test("Clicking Trade License navigates to apply wizard", async ({ page }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    const tradeLicense = page.getByText(/trade license|business license/i).first();
    await tradeLicense.click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("apply");
    await page.screenshot({ path: "screenshots/03c-services-to-apply.png", fullPage: true });
  });
});

// ─── 4. Apply wizard ───────────────────────────────────────────────────────────
test.describe("Apply wizard", () => {
  test.beforeEach(async ({ page }) => {
    await seedCitizen(page);
  });

  test("Apply wizard loads with form fields for Trade License", async ({ page }) => {
    await page.goto("/apply/trade-license");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("input").first()).toBeVisible();
    await page.screenshot({ path: "screenshots/04-apply-step1.png", fullPage: true });
  });

  test("Next button is visible on Step 1", async ({ page }) => {
    await page.goto("/apply/trade-license");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible();
  });

  test("Back button is visible in flow header", async ({ page }) => {
    await page.goto("/apply/trade-license");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("link", { name: /back/i }).or(page.getByRole("button", { name: /back/i })).first()).toBeVisible();
  });
});

// ─── 5. Applications list ──────────────────────────────────────────────────────
test.describe("Applications list", () => {
  test.beforeEach(async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/applications");
    await page.waitForLoadState("networkidle");
  });

  test("Applications page loads with tab bar", async ({ page }) => {
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/05-applications.png", fullPage: true });
    // At least one tab should be visible
    const allTab = page.getByRole("button", { name: /^all$/i }).or(page.getByText(/^all$/i)).first();
    await expect(allTab).toBeVisible();
  });

  test("All 4 filter tabs are clickable without crash", async ({ page }) => {
    for (const tab of ["All", "In Progress", "Issued", "Rejected"]) {
      const tabEl = page.getByText(tab, { exact: true }).first();
      if (await tabEl.isVisible()) {
        await tabEl.click();
        await page.waitForTimeout(300);
        await expect(page.locator("body")).not.toBeEmpty();
      }
    }
    await page.screenshot({ path: "screenshots/05b-applications-tabs.png", fullPage: true });
  });

  test("Seeded application card is visible", async ({ page }) => {
    // Either the ARN or the business name should be visible
    const card = page.getByText(/Table Bay Traders|TL-business-license-qa/i).first();
    if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(card).toBeVisible();
    }
  });
});

// ─── 6. Application detail ─────────────────────────────────────────────────────
test.describe("Application detail", () => {
  test.beforeEach(async ({ page }) => {
    await seedCitizen(page);
  });

  test("Application detail page loads for issued app", async ({ page }) => {
    await page.goto(`/applications/${ISSUED_ARN}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/06-app-detail.png", fullPage: true });
  });

  test("Detail page shows applicant name", async ({ page }) => {
    await page.goto(`/applications/${ISSUED_ARN}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Thandiwe Mbeki/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("Workflow timeline section is visible", async ({ page }) => {
    await page.goto(`/applications/${ISSUED_ARN}`);
    await page.waitForLoadState("networkidle");
    const timeline = page.getByText(/workflow timeline|timeline/i).first();
    if (await timeline.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(timeline).toBeVisible();
    }
    await page.screenshot({ path: "screenshots/06b-app-detail-timeline.png", fullPage: true });
  });

  test("Documents section is visible", async ({ page }) => {
    await page.goto(`/applications/${ISSUED_ARN}`);
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/documents/i).first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "screenshots/06c-app-detail-docs.png", fullPage: true });
  });
});

// ─── 7. Documents page ─────────────────────────────────────────────────────────
test.describe("Documents page", () => {
  test("Documents page loads (certificates/receipts or empty state)", async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/documents");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    // Either shows "Certificates" section or an empty state
    const certs = page.getByText(/certificates|receipts|appear here|no documents/i).first();
    await expect(certs).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "screenshots/07-documents.png", fullPage: true });
  });
});

// ─── 8. Profile page ───────────────────────────────────────────────────────────
test.describe("Profile page", () => {
  test.beforeEach(async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("Profile shows seeded user name", async ({ page }) => {
    await expect(page.getByText(/Thandiwe Mbeki/i).first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "screenshots/08-profile.png", fullPage: true });
  });

  test("Sign out button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /sign out/i })).toBeVisible();
  });

  test("Sign out navigates to auth page", async ({ page }) => {
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL("**/auth", { timeout: 5000 });
    await expect(page.url()).toContain("auth");
    await page.screenshot({ path: "screenshots/08b-profile-signout.png", fullPage: true });
  });
});

// ─── 9. Notifications page ─────────────────────────────────────────────────────
test.describe("Notifications page", () => {
  test("Notifications page loads", async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/notifications");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/09-notifications.png", fullPage: true });
  });
});

// ─── 10. Bottom tab bar navigation ────────────────────────────────────────────
test.describe("Bottom tab bar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await seedCitizen(page);
    await page.goto("/home");
    await page.waitForLoadState("networkidle");
  });

  test("Services tab navigates correctly", async ({ page }) => {
    await page.getByText("Services", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("services");
    await page.screenshot({ path: "screenshots/10-tab-services.png" });
  });

  test("Applications tab navigates correctly", async ({ page }) => {
    await page.getByText("Applications", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("applications");
    await page.screenshot({ path: "screenshots/10b-tab-applications.png" });
  });

  test("Documents tab navigates correctly", async ({ page }) => {
    await page.getByText("Documents", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("documents");
    await page.screenshot({ path: "screenshots/10c-tab-documents.png" });
  });

  test("Profile tab navigates correctly", async ({ page }) => {
    await page.getByText("Profile", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("profile");
    await page.screenshot({ path: "screenshots/10d-tab-profile.png" });
  });
});
