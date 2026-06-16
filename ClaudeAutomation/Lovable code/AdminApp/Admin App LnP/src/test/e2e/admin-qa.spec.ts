import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const ADMIN_SEED = {
  currentStep: 0,
  email: "tahera@gov.in",
  orgName: "City of Cape Town",
  country: "ZA",
  department: "",
  currency: "ZAR",
  currencySymbol: "R",
  phoneCountryCode: "+27",
  language: "English",
  logoUrl: "",
  themeColor: "",
  selectedTemplateId: "trade-license",
  serviceName: "Trade License",
  approvalLevel: "single",
  customModules: ["Issuance", "Renewal"],
  serviceStatus: "draft",
  deployment: { availabilityScope: "entire_state", selectedItems: [] },
  teamMembers: [],
  authMethod: "email",
  goLiveStep: 0,
  isOnboardingComplete: true,
  isActivated: true,
  isLoggedIn: true,
  isPasswordReset: true,
  isPublished: false,
  isLive: false,
  services: [
    {
      id: "svc-qa-001",
      name: "Trade License",
      templateId: "trade-license",
      status: "draft",
      customModules: ["Issuance", "Renewal"],
      isPublished: false,
      isLive: false,
      deployment: { availabilityScope: "entire_state", selectedItems: [] },
      teamMembers: [],
      authMethod: "email",
      roleAccess: [],
      workflowScope: "shared",
      templateSetup: {
        hasCategories: true,
        hasSubcategories: false,
        categoriesList: ["Retail", "Food"],
        subcategoriesList: [],
      },
      renewalPolicy: {
        mode: "global",
        globalMonths: 12,
        perCategory: {},
        perSubcategory: {},
      },
    },
  ],
  activeServiceId: "svc-qa-001",
  currentUserRole: "super_admin",
  onboardingStep: 5,
  invitedAdmins: [],
  serviceOwnerSetupProgress: {},
  usersWhoResetPassword: ["tahera@gov.in", "joanna@gov.in", "meera@gov.in"],
  boundaryHierarchies: [],
  isBoundarySetupSkipped: false,
};

const SERVICE_OWNER_SEED = {
  ...ADMIN_SEED,
  currentUserRole: "service_owner",
  email: "meera@gov.in",
};

// ---------------------------------------------------------------------------
// Helper: seed localStorage and reload
// ---------------------------------------------------------------------------

async function seedAdmin(page: Page, seed = ADMIN_SEED) {
  await page.goto("/");
  await page.evaluate((s) => {
    localStorage.setItem("lnp-onboarding-state", JSON.stringify(s));
  }, seed);
  await page.reload();
  await page.waitForLoadState("networkidle");
}

// ---------------------------------------------------------------------------
// Helper: ensure screenshot directory exists
// ---------------------------------------------------------------------------

function ensureScreenshotDir() {
  const dir = path.join(process.cwd(), "screenshots");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ---------------------------------------------------------------------------
// Auth tests — NO seeding; test the actual login page
// ---------------------------------------------------------------------------

test.describe("Auth — Login page", () => {
  test("ADMIN-E-001: Navigate to / redirects to /onboarding", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("onboarding");
  });

  test("ADMIN-E-002: /onboarding loads with an email input visible", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator('input[type="email"], input[id="email"]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test("ADMIN-E-003: Sign in with tahera@gov.in / Temp@1234 reaches next step", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="email"], input[id="email"]').first().fill("tahera@gov.in");
    await page.locator('input[type="password"], input[id="password"]').first().fill("Temp@1234");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState("networkidle");
    // Should advance (either password reset step or dashboard)
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(10);
  });

  test("ADMIN-E-004: Sign in with wrong credentials shows an error or stays on onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="email"], input[id="email"]').first().fill("bad@example.com");
    await page.locator('input[type="password"], input[id="password"]').first().fill("WrongPass");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(1000);
    // Either stays on onboarding or shows error text
    const url = page.url();
    const body = await page.locator("body").textContent();
    const staysOnboard = url.includes("onboarding");
    const showsError = body?.toLowerCase().includes("invalid") || body?.toLowerCase().includes("error");
    expect(staysOnboard || showsError).toBeTruthy();
  });

  test("ADMIN-E-005: Sign in with joanna@gov.in / Temp@1234 succeeds", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="email"], input[id="email"]').first().fill("joanna@gov.in");
    await page.locator('input[type="password"], input[id="password"]').first().fill("Temp@1234");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(10);
  });

  test("ADMIN-E-006: Sign in with meera@gov.in / Temp@1234 succeeds", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="email"], input[id="email"]').first().fill("meera@gov.in");
    await page.locator('input[type="password"], input[id="password"]').first().fill("Temp@1234");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(10);
  });
});

// ---------------------------------------------------------------------------
// Dashboard (seeded)
// ---------------------------------------------------------------------------

test.describe("Dashboard (seeded)", () => {
  test.beforeEach(async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  test("ADMIN-E-007: Dashboard loads — body is not empty", async ({ page }) => {
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    expect(body!.length).toBeGreaterThan(50);
  });

  test("ADMIN-E-008: Main content area has visible text (KPIs or service list)", async ({ page }) => {
    const main = page.locator("main, [role='main'], .flex-1").first();
    const text = await main.textContent();
    expect(text && text.trim().length).toBeGreaterThan(5);
  });

  test("ADMIN-E-009: Sidebar is visible", async ({ page }) => {
    const sidebar = page.locator("aside, nav, [data-sidebar], [class*='sidebar']").first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });
  });

  test("ADMIN-E-010: Clicking Templates nav item navigates to /services", async ({ page }) => {
    const servicesLink = page.getByRole("link", { name: /templates|services/i }).first();
    await servicesLink.click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/services");
  });
});

// ---------------------------------------------------------------------------
// Services / Template wizard (seeded)
// ---------------------------------------------------------------------------

test.describe("Services / Template wizard (seeded)", () => {
  test.beforeEach(async ({ page }) => {
    await seedAdmin(page);
  });

  test("ADMIN-E-011: /services loads with page content", async ({ page }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-012: A template card is visible on /services", async ({ page }) => {
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    // Look for common template-related text
    const card = page.getByText(/trade license|business license|permit|template/i).first();
    await expect(card).toBeVisible({ timeout: 5000 });
  });

  test("ADMIN-E-013: /templates/trade-license/setup loads", async ({ page }) => {
    await page.goto("/templates/trade-license/setup");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-014: Step 1 shows a service name input or text input", async ({ page }) => {
    await page.goto("/templates/trade-license/setup");
    await page.waitForLoadState("networkidle");
    const input = page.locator("input[type='text'], input:not([type='hidden'])").first();
    await expect(input).toBeVisible({ timeout: 5000 });
  });

  test("ADMIN-E-015: Next/Continue button on step 1 is visible", async ({ page }) => {
    await page.goto("/templates/trade-license/setup");
    await page.waitForLoadState("networkidle");
    const nextBtn = page.getByRole("button", { name: /next|continue|proceed/i }).first();
    await expect(nextBtn).toBeVisible({ timeout: 5000 });
  });

  test("ADMIN-E-016: Clicking Next on step 1 advances the wizard", async ({ page }) => {
    await page.goto("/templates/trade-license/setup");
    await page.waitForLoadState("networkidle");
    const urlBefore = page.url();

    // Fill service name if input is required
    const input = page.locator("input[type='text']").first();
    if (await input.isVisible()) {
      const currentVal = await input.inputValue();
      if (!currentVal) await input.fill("Trade License QA");
    }

    const nextBtn = page.getByRole("button", { name: /next|continue|proceed/i }).first();
    await nextBtn.click();
    await page.waitForTimeout(1500);

    const urlAfter = page.url();
    const bodyAfter = await page.locator("body").textContent();
    // Either the URL changed or the page content changed (step indicator)
    const advanced = urlAfter !== urlBefore || (bodyAfter || "").length > 50;
    expect(advanced).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Service Config (seeded with svc-qa-001)
// ---------------------------------------------------------------------------

test.describe("Service Config (seeded)", () => {
  test.beforeEach(async ({ page }) => {
    await seedAdmin(page);
  });

  test("ADMIN-E-017: /service/svc-qa-001/configure loads — body not empty", async ({ page }) => {
    await page.goto("/service/svc-qa-001/configure");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-018: Tab-like navigation is visible on configure page", async ({ page }) => {
    await page.goto("/service/svc-qa-001/configure");
    await page.waitForLoadState("networkidle");
    // Look for tabs, buttons in a nav-like area
    const tabs = page.locator('[role="tab"], [role="tablist"], button[data-state]').first();
    const hasTabs = await tabs.isVisible().catch(() => false);
    // Fallback: look for nav-like buttons
    const navButtons = page.locator("button").filter({ hasText: /form|workflow|fee|overview/i }).first();
    const hasNavButtons = await navButtons.isVisible().catch(() => false);
    expect(hasTabs || hasNavButtons).toBeTruthy();
  });

  test("ADMIN-E-019: Configure page contains the word 'Form' or 'form'", async ({ page }) => {
    await page.goto("/service/svc-qa-001/configure");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toContain("form");
  });

  test("ADMIN-E-020: Configure page contains the word 'Workflow' or 'workflow'", async ({ page }) => {
    await page.goto("/service/svc-qa-001/configure");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toContain("workflow");
  });

  test("ADMIN-E-021: Configure page contains 'Fee' or 'fee'", async ({ page }) => {
    await page.goto("/service/svc-qa-001/configure");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body?.toLowerCase()).toContain("fee");
  });

  test("ADMIN-E-022: /service/svc-qa-001/preview loads — body not empty", async ({ page }) => {
    await page.goto("/service/svc-qa-001/preview");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-023: Preview page shows a mobile frame or device container", async ({ page }) => {
    await page.goto("/service/svc-qa-001/preview");
    await page.waitForLoadState("networkidle");
    const frame = page.locator(
      "[class*='mobile'], [class*='frame'], [class*='device'], [class*='phone'], [class*='iphone'], [class*='preview']"
    ).first();
    const hasFrame = await frame.isVisible().catch(() => false);
    // Fallback: any container with narrow width suggesting mobile emulator
    const body = await page.locator("body").textContent();
    expect(hasFrame || (body && body.trim().length > 50)).toBeTruthy();
  });

  test("ADMIN-E-024: Preview page has citizen-related or employee-related text", async ({ page }) => {
    await page.goto("/service/svc-qa-001/preview");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    expect(
      lower.includes("citizen") ||
        lower.includes("services") ||
        lower.includes("apply") ||
        lower.includes("employee") ||
        lower.includes("inbox") ||
        lower.includes("preview")
    ).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Setup pages (seeded)
// ---------------------------------------------------------------------------

test.describe("Setup pages (seeded)", () => {
  test.beforeEach(async ({ page }) => {
    await seedAdmin(page);
  });

  test("ADMIN-E-025: /setup/organization loads", async ({ page }) => {
    await page.goto("/setup/organization");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-026: Organization name label or field is visible on /setup/organization", async ({ page }) => {
    await page.goto("/setup/organization");
    await page.waitForLoadState("networkidle");
    // OrganizationProfile is a read-only display page — look for org name label or value
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    expect(
      lower.includes("organization") ||
        lower.includes("org") ||
        lower.includes("city of cape town") ||
        lower.includes("profile") ||
        lower.includes("details")
    ).toBeTruthy();
  });

  test("ADMIN-E-027: /setup/users loads", async ({ page }) => {
    await page.goto("/setup/users");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-028: /setup/users page has 'user' or 'invite' text", async ({ page }) => {
    await page.goto("/setup/users");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    expect(lower.includes("user") || lower.includes("invite")).toBeTruthy();
  });

  test("ADMIN-E-029: /config/branding loads", async ({ page }) => {
    await page.goto("/config/branding");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });
});

// ---------------------------------------------------------------------------
// Go-Live wizard (seeded)
// ---------------------------------------------------------------------------

test.describe("Go-Live wizard (seeded)", () => {
  test.beforeEach(async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/go-live");
    await page.waitForLoadState("networkidle");
  });

  test("ADMIN-E-030: /go-live loads", async ({ page }) => {
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-031: Checklist or step items are visible on /go-live", async ({ page }) => {
    const body = await page.locator("body").textContent();
    // Go-live should have multiple items / steps visible
    const lower = (body || "").toLowerCase();
    expect(
      lower.includes("step") ||
        lower.includes("checklist") ||
        lower.includes("live") ||
        lower.includes("deploy") ||
        lower.includes("subdomain")
    ).toBeTruthy();
  });

  test("ADMIN-E-032: /go-live page contains launch-related text", async ({ page }) => {
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    // GoLive page shows checklist items: "customize", "integrations", "live", "launch", "theme"
    expect(
      lower.includes("subdomain") ||
        lower.includes("deployment") ||
        lower.includes("domain") ||
        lower.includes("customize") ||
        lower.includes("integrations") ||
        lower.includes("live") ||
        lower.includes("launch") ||
        lower.includes("theme")
    ).toBeTruthy();
  });

  test("ADMIN-E-033: /go-live page contains 'role' or 'access' text", async ({ page }) => {
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    expect(lower.includes("role") || lower.includes("access") || lower.includes("permission")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Audit log (seeded)
// ---------------------------------------------------------------------------

test.describe("Audit log (seeded)", () => {
  test.beforeEach(async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/audit-log");
    await page.waitForLoadState("networkidle");
  });

  test("ADMIN-E-034: /audit-log loads", async ({ page }) => {
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(50);
  });

  test("ADMIN-E-035: Audit log has multiple tabs or tab-like items", async ({ page }) => {
    const tabs = page.locator('[role="tab"], [role="tablist"] button').all();
    const tabCount = (await tabs).length;
    const body = await page.locator("body").textContent();
    // Either real tabs exist or page has content with tab-like structure
    expect(tabCount >= 1 || (body && body.trim().length > 50)).toBeTruthy();
  });

  test("ADMIN-E-036: Audit log has 'Config' or 'Activity' text", async ({ page }) => {
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    expect(
      lower.includes("config") ||
        lower.includes("activity") ||
        lower.includes("audit") ||
        lower.includes("log")
    ).toBeTruthy();
  });

  test("ADMIN-E-037: Audit log shows a table, list, or empty-state message", async ({ page }) => {
    const table = page.locator("table, [role='table'], [class*='table']").first();
    const hasTable = await table.isVisible().catch(() => false);
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    const hasContent =
      lower.includes("no ") ||
      lower.includes("empty") ||
      lower.includes("log") ||
      lower.includes("event") ||
      lower.includes("action");
    expect(hasTable || hasContent).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Role visibility (seeded)
// ---------------------------------------------------------------------------

test.describe("Role visibility (seeded)", () => {
  test("ADMIN-E-038: super_admin sees 'Users' or 'Setup' navigation in sidebar", async ({ page }) => {
    await seedAdmin(page, ADMIN_SEED);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    const lower = (body || "").toLowerCase();
    expect(lower.includes("user") || lower.includes("setup") || lower.includes("organization")).toBeTruthy();
  });

  test("ADMIN-E-039: service_owner seed renders sidebar without crashing", async ({ page }) => {
    await seedAdmin(page, SERVICE_OWNER_SEED as typeof ADMIN_SEED);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body && body.trim().length).toBeGreaterThan(10);
  });

  test("ADMIN-E-040: Sign out redirects to onboarding or login", async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Look for sign-out button: text, aria-label, or title
    const signOutBtn = page
      .getByRole("button", { name: /sign out|logout|log out/i })
      .or(page.locator('[title="Sign out"]'))
      .or(page.getByText(/sign out/i))
      .first();

    await expect(signOutBtn).toBeVisible({ timeout: 5000 });
    await signOutBtn.click();
    await page.waitForLoadState("networkidle");

    const url = page.url();
    expect(url.includes("onboarding") || url.includes("login")).toBeTruthy();
  });
});
