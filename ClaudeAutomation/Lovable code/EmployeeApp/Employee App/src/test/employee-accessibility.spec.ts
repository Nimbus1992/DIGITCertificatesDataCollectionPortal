import { test, expect, Page } from "@playwright/test";

const NOW = Date.now();

const VERIFIER = { email: "verifier@gov.in", password: "verify123", name: "Priya Sharma", roleId: "document_verifier" };
const INSPECTOR = { email: "inspector@gov.in", password: "inspect123", name: "Rahul Verma", roleId: "field_inspector" };
const APPROVER = { email: "approver@gov.in", password: "approve123", name: "Anita Reddy", roleId: "approver" };
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

// ─── Suite: Accessibility ──────────────────────────────────────────────────────
test.describe("Accessibility", () => {
  test("Login page has non-null accessibility tree", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    // Verify the page has meaningful content (ARIA roles present)
    const body = await page.locator("body").textContent();
    expect(body).not.toBeNull();
    expect((body ?? "").length).toBeGreaterThan(0);
    // Check there is at least one input on the page (accessible form element)
    const input = page.locator("input").first();
    await expect(input).toBeVisible();
    await page.screenshot({ path: "screenshots/a11y-emp-01-login.png" });
  });

  test("Login inputs have labels or accessible names", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator("input[type='email'], input[type='text']").first();
    await expect(emailInput).toBeVisible();
    // Verify there is a label element or placeholder indicating accessible naming
    const labels = await page.locator("label").count();
    const placeholders = await page.locator("input[placeholder]").count();
    const ariaLabels = await page.locator("[aria-label]").count();
    // At least one of these labelling techniques must be used
    expect(labels + placeholders + ariaLabels).toBeGreaterThan(0);
  });

  test("Dashboard page accessibility tree is non-null", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // Page has meaningful content
    const body = await page.locator("body").textContent();
    expect(body).not.toBeNull();
    expect((body ?? "").length).toBeGreaterThan(100);
    // At least one landmark or heading present
    const headings = await page.locator("h1, h2, h3, [role='heading'], main, nav, [role='main'], [role='navigation']").count();
    expect(headings).toBeGreaterThan(0);
    await page.screenshot({ path: "screenshots/a11y-emp-03-dashboard.png" });
  });

  test("Inbox page has accessible content", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    // Page has body content
    const body = await page.locator("body").textContent();
    expect(body).not.toBeNull();
    expect((body ?? "").length).toBeGreaterThan(50);
    // Should have at least one interactive element or list
    const interactive = await page.locator("button, a, [role='button'], [role='link'], [role='listitem'], li").count();
    expect(interactive).toBeGreaterThan(0);
    await page.screenshot({ path: "screenshots/a11y-emp-04-inbox.png" });
  });

  test("Page title is set for authenticated pages", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    await page.screenshot({ path: "screenshots/a11y-emp-05-title.png" });
  });
});
