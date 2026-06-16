import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Seed data (copied from admin-qa.spec.ts)
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
// Mobile smoke tests (run on iPhone 12 project only)
// ---------------------------------------------------------------------------

test.describe("Mobile smoke tests", () => {
  test.beforeEach(() => {
    ensureScreenshotDir();
  });

  test("Onboarding renders on mobile viewport", async ({ page }) => {
    await page.goto("/onboarding");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    // Check no severe horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 390;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // 20px tolerance
    await page.screenshot({ path: "screenshots/mobile-01-onboarding.png", fullPage: true });
  });

  test("Dashboard renders on mobile without crash", async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-02-dashboard.png", fullPage: true });
  });

  test("Services page renders on mobile", async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/services");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-03-services.png", fullPage: true });
  });

  test("Go-live page renders on mobile", async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/go-live");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-04-golive.png", fullPage: true });
  });

  test("Organization setup renders on mobile", async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/setup/organization");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-05-org.png", fullPage: true });
  });

  test("Audit log renders on mobile", async ({ page }) => {
    await seedAdmin(page);
    await page.goto("/audit-log");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-06-audit.png", fullPage: true });
  });
});
