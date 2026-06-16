import { test, expect, Page } from "@playwright/test";

const NOW = Date.now();

const VERIFIER = { email: "verifier@gov.in", password: "verify123", name: "Priya Sharma", roleId: "document_verifier" };
type DemoUser = typeof VERIFIER;

async function seedEmployee(page: Page, user: DemoUser) {
  await page.goto("/login");
  await page.evaluate(
    ({ session }) => {
      sessionStorage.setItem("employee:session:v2", JSON.stringify(session));
      localStorage.removeItem("employee:applications:v5");
      localStorage.removeItem("employee:notifications:v5");
    },
    { session: { email: user.email, name: user.name, roleId: user.roleId, loggedInAt: NOW } },
  );
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}

// ─── Suite: Mobile smoke tests ─────────────────────────────────────────────────
test.describe("Mobile smoke tests", () => {
  test("Login page renders on mobile", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width ?? 390;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);
    await page.screenshot({ path: "screenshots/mobile-emp-01-login.png", fullPage: true });
  });

  test("Dashboard renders on mobile", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-emp-02-dashboard.png", fullPage: true });
  });

  test("Inbox renders on mobile", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-emp-03-inbox.png", fullPage: true });
  });

  test("Reports render on mobile", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-emp-04-reports.png", fullPage: true });
  });

  test("Profile renders on mobile", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-emp-05-profile.png", fullPage: true });
  });

  test("Search renders on mobile", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/mobile-emp-06-search.png", fullPage: true });
  });
});
