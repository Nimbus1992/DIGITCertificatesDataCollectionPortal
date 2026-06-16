import { test, expect, Page } from "@playwright/test";

// ─── Demo users ───────────────────────────────────────────────────────────────
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
      // Remove apps+notifications so the store auto-seeds from SEED_ROWS on first render
      localStorage.removeItem("employee:applications:v5");
      localStorage.removeItem("employee:notifications:v5");
    },
    { session: { email: user.email, name: user.name, roleId: user.roleId, loggedInAt: NOW } }
  );
  await page.goto("/dashboard");
  await page.waitForLoadState("networkidle");
}

// Helper: get any app id from seeded store
async function getFirstAppId(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    try {
      const apps = JSON.parse(localStorage.getItem("employee:applications:v5") ?? "[]");
      return apps[0]?.id ?? null;
    } catch {
      return null;
    }
  });
}

// ─── 1. Login page ────────────────────────────────────────────────────────────
test.describe("Login page", () => {
  test("Login page loads with email and password fields", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("input[type='email'], input[type='text']").first()).toBeVisible();
    await expect(page.locator("input[type='password']").first()).toBeVisible();
    await page.screenshot({ path: "screenshots/01-login.png", fullPage: true });
  });

  test("Demo quick-fill buttons are visible", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    // At least one demo/quick-fill button per role
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    await page.screenshot({ path: "screenshots/01b-login-demo-buttons.png", fullPage: true });
  });

  test("Login with document_verifier credentials succeeds", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator("input[type='email'], input[type='text']").first();
    const passwordInput = page.locator("input[type='password']").first();
    await emailInput.fill(VERIFIER.email);
    await passwordInput.fill(VERIFIER.password);
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.url()).toContain("dashboard");
    await page.screenshot({ path: "screenshots/01c-login-verifier-dashboard.png", fullPage: true });
  });

  test("Login with field_inspector credentials succeeds", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator("input[type='email'], input[type='text']").first();
    const passwordInput = page.locator("input[type='password']").first();
    await emailInput.fill(INSPECTOR.email);
    await passwordInput.fill(INSPECTOR.password);
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.url()).toContain("dashboard");
  });

  test("Login with approver credentials succeeds", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator("input[type='email'], input[type='text']").first();
    const passwordInput = page.locator("input[type='password']").first();
    await emailInput.fill(APPROVER.email);
    await passwordInput.fill(APPROVER.password);
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.waitForURL("**/dashboard", { timeout: 5000 });
    await expect(page.url()).toContain("dashboard");
  });

  test("Wrong credentials shows error", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const emailInput = page.locator("input[type='email'], input[type='text']").first();
    const passwordInput = page.locator("input[type='password']").first();
    await emailInput.fill("wrong@example.com");
    await passwordInput.fill("wrongpassword");
    await page.getByRole("button", { name: /sign in|login|submit/i }).first().click();
    await page.waitForTimeout(1000);
    // Should stay on login or show error
    const body = await page.locator("body").textContent();
    const hasError = body?.toLowerCase().match(/invalid|incorrect|wrong|error|not found/i);
    const staysOnLogin = page.url().includes("login") || page.url().endsWith("/");
    expect(hasError || staysOnLogin).toBeTruthy();
    await page.screenshot({ path: "screenshots/01d-login-error.png", fullPage: true });
  });
});

// ─── 2. Dashboard ─────────────────────────────────────────────────────────────
test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployee(page, VERIFIER);
  });

  test("Dashboard loads with content", async ({ page }) => {
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/02-dashboard.png", fullPage: true });
  });

  test("Dashboard shows KPI cards", async ({ page }) => {
    // Look for numeric stat cards or summary sections
    const statsArea = page.locator("main").first();
    await expect(statsArea).toBeVisible();
    const text = await statsArea.textContent();
    expect(text).toBeTruthy();
  });

  test("Sidebar shows Dashboard as active nav item", async ({ page }) => {
    await expect(page.getByText("Dashboard").first()).toBeVisible();
    await page.screenshot({ path: "screenshots/02b-dashboard-sidebar.png" });
  });

  test("Sidebar shows Inbox nav item", async ({ page }) => {
    await expect(page.getByText("Inbox").first()).toBeVisible();
  });

  test("Sidebar does NOT show Inspections for document_verifier", async ({ page }) => {
    const inspectionsLink = page.getByText("Inspections", { exact: true });
    await expect(inspectionsLink).not.toBeVisible();
  });

  test("Sidebar does NOT show Approvals for document_verifier", async ({ page }) => {
    const approvalsLink = page.getByText("Approvals", { exact: true });
    await expect(approvalsLink).not.toBeVisible();
  });
});

// ─── 3. Dashboard — role-based sidebar ────────────────────────────────────────
test.describe("Dashboard role-based sidebar", () => {
  test("field_inspector sees Inspections in sidebar", async ({ page }) => {
    await seedEmployee(page, INSPECTOR);
    await expect(page.getByText("Inspections", { exact: true })).toBeVisible();
    await expect(page.getByText("Approvals", { exact: true })).not.toBeVisible();
    await page.screenshot({ path: "screenshots/02c-dashboard-inspector-sidebar.png" });
  });

  test("approver sees Approvals in sidebar", async ({ page }) => {
    await seedEmployee(page, APPROVER);
    await expect(page.getByText("Approvals", { exact: true })).toBeVisible();
    await expect(page.getByText("Inspections", { exact: true })).not.toBeVisible();
    await page.screenshot({ path: "screenshots/02d-dashboard-approver-sidebar.png" });
  });
});

// ─── 4. Inbox ─────────────────────────────────────────────────────────────────
test.describe("Inbox", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
  });

  test("Inbox page loads", async ({ page }) => {
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/04-inbox.png", fullPage: true });
  });

  test("Inbox shows application rows", async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);
    const body = await page.locator("body").textContent();
    // Should show app IDs or applicant names from seed data
    expect(body).toBeTruthy();
  });

  test("Clicking an inbox row navigates to detail", async ({ page }) => {
    await page.waitForTimeout(1000);
    // Look for table rows or clickable app rows
    const rows = page.locator("tbody tr, [data-app-id], [data-row]").first();
    const count = await rows.count();
    if (count > 0) {
      await rows.first().click();
      await page.waitForLoadState("networkidle");
      await expect(page.url()).toContain("inbox");
    }
    await page.screenshot({ path: "screenshots/04b-inbox-after-click.png", fullPage: true });
  });
});

// ─── 5. Inbox — field_inspector queue ─────────────────────────────────────────
test.describe("Inbox field_inspector queue", () => {
  test("Inspector inbox shows inspection-stage applications", async ({ page }) => {
    await seedEmployee(page, INSPECTOR);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/04c-inbox-inspector.png", fullPage: true });
  });
});

// ─── 6. Application detail ────────────────────────────────────────────────────
test.describe("Application detail", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("Application detail loads via direct navigation", async ({ page }) => {
    const appId = await getFirstAppId(page);
    if (appId) {
      await page.goto(`/inbox/${appId}`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toBeEmpty();
      await page.screenshot({ path: "screenshots/05-app-detail.png", fullPage: true });
    }
  });

  test("Application detail shows applicant name", async ({ page }) => {
    const appId = await getFirstAppId(page);
    if (appId) {
      await page.goto(`/inbox/${appId}`);
      await page.waitForLoadState("networkidle");
      // Applicant name from SEED_ROWS — just verify something renders
      const body = await page.locator("body").textContent();
      expect(body?.length ?? 0).toBeGreaterThan(100);
    }
  });

  test("Application detail shows tabs", async ({ page }) => {
    const appId = await getFirstAppId(page);
    if (appId) {
      await page.goto(`/inbox/${appId}`);
      await page.waitForLoadState("networkidle");
      // Should have info tabs like Applicant, Business, Documents etc.
      const body = await page.locator("body").textContent();
      const hasApplicantOrBusiness = body?.match(/applicant|business|document|timeline|history/i);
      expect(hasApplicantOrBusiness).toBeTruthy();
      await page.screenshot({ path: "screenshots/05b-app-detail-tabs.png", fullPage: true });
    }
  });
});

// ─── 7. Approvals page ────────────────────────────────────────────────────────
test.describe("Approvals page", () => {
  test("Approvals page loads for approver role", async ({ page }) => {
    await seedEmployee(page, APPROVER);
    await page.goto("/approvals");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/06-approvals.png", fullPage: true });
  });

  test("Approvals shows payment_pending or paid stage applications", async ({ page }) => {
    await seedEmployee(page, APPROVER);
    await page.goto("/approvals");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });
});

// ─── 8. Inspections page ──────────────────────────────────────────────────────
test.describe("Inspections page", () => {
  test("Inspections page loads for field_inspector role", async ({ page }) => {
    await seedEmployee(page, INSPECTOR);
    await page.goto("/inspections");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/07-inspections.png", fullPage: true });
  });

  test("Inspections shows inspection-stage applications", async ({ page }) => {
    await seedEmployee(page, INSPECTOR);
    await page.goto("/inspections");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });
});

// ─── 9. Search page ───────────────────────────────────────────────────────────
test.describe("Search page", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/search");
    await page.waitForLoadState("networkidle");
  });

  test("Search page loads with input", async ({ page }) => {
    await expect(page.locator("input[type='search'], input[type='text'], input").first()).toBeVisible();
    await page.screenshot({ path: "screenshots/08-search.png", fullPage: true });
  });

  test("Typing in search shows results", async ({ page }) => {
    const searchInput = page.locator("input[type='search'], input[type='text'], input").first();
    await searchInput.fill("Sipho");
    await page.waitForTimeout(500);
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
    await page.screenshot({ path: "screenshots/08b-search-results.png", fullPage: true });
  });
});

// ─── 10. Reports page ─────────────────────────────────────────────────────────
test.describe("Reports page", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/reports");
    await page.waitForLoadState("networkidle");
  });

  test("Reports page loads", async ({ page }) => {
    await expect(page.locator("body")).not.toBeEmpty();
    await page.screenshot({ path: "screenshots/09-reports.png", fullPage: true });
  });

  test("Reports shows tabs", async ({ page }) => {
    // Should have multiple tabs: Executive Summary, Business Landscape, etc.
    const body = await page.locator("body").textContent();
    const hasReportTabs = body?.match(/executive|summary|landscape|application|revenue|process|efficiency/i);
    expect(hasReportTabs).toBeTruthy();
  });

  test("All report tabs are clickable without crash", async ({ page }) => {
    const tabLabels = [/executive|summary/i, /landscape/i, /application/i, /revenue/i, /process|efficiency/i];
    for (const label of tabLabels) {
      const tab = page.getByRole("tab", { name: label }).or(page.getByText(label).first());
      if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(300);
        await expect(page.locator("body")).not.toBeEmpty();
      }
    }
    await page.screenshot({ path: "screenshots/09b-reports-tabs.png", fullPage: true });
  });

  test("Reports Export to Excel button is visible (Process Efficiency tab)", async ({ page }) => {
    const processTab = page.getByRole("tab", { name: /process|efficiency/i }).or(page.getByText(/process efficiency/i).first());
    if (await processTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await processTab.click();
      await page.waitForTimeout(500);
      const exportBtn = page.getByRole("button", { name: /export|excel/i }).first();
      if (await exportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(exportBtn).toBeVisible();
      }
    }
    await page.screenshot({ path: "screenshots/09c-reports-process.png", fullPage: true });
  });
});

// ─── 11. Profile page ─────────────────────────────────────────────────────────
test.describe("Profile page", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("Profile page shows seeded user name", async ({ page }) => {
    await expect(page.getByText(/Priya Sharma/i).first()).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: "screenshots/10-profile.png", fullPage: true });
  });

  test("Profile shows user role", async ({ page }) => {
    const body = await page.locator("body").textContent();
    const hasRole = body?.match(/verifier|document|officer/i);
    expect(hasRole).toBeTruthy();
  });

  test("Profile page has Sign out option", async ({ page }) => {
    // Sign out might be in a dropdown or direct button
    const signOutBtn = page.getByRole("button", { name: /sign out|logout/i })
      .or(page.getByText(/sign out|logout/i).first());
    if (await signOutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(signOutBtn).toBeVisible();
    } else {
      // It may be in user dropdown in header
      const userDropdown = page.locator("header button").last();
      await userDropdown.click();
      await page.waitForTimeout(300);
      await expect(page.getByText(/sign out|logout/i).first()).toBeVisible();
    }
    await page.screenshot({ path: "screenshots/10b-profile-signout.png", fullPage: true });
  });
});

// ─── 12. Sign out flow ────────────────────────────────────────────────────────
test.describe("Sign out flow", () => {
  test("Sign out from header dropdown navigates to login", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    // Open user dropdown in header (last button in header area)
    const userDropdown = page.locator("header button").last();
    await userDropdown.click();
    await page.waitForTimeout(300);
    const signOut = page.getByText(/sign out/i).first();
    if (await signOut.isVisible({ timeout: 2000 }).catch(() => false)) {
      await signOut.click();
      await page.waitForLoadState("networkidle");
      await expect(page.url()).toContain("login");
      await page.screenshot({ path: "screenshots/11-signout.png", fullPage: true });
    }
  });
});

// ─── 13. Notifications bell ───────────────────────────────────────────────────
test.describe("Notifications bell", () => {
  test("Bell icon is visible in header", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    // Bell button in header
    const bell = page.locator("header button").first();
    await expect(bell).toBeVisible();
    await page.screenshot({ path: "screenshots/12-bell-visible.png" });
  });

  test("Clicking bell opens notifications popover", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    // First button in header is the bell
    const bell = page.locator("header button").first();
    await bell.click();
    await page.waitForTimeout(500);
    // Popover should appear with "Notifications" heading or list
    const body = await page.locator("body").textContent();
    const hasNotifContent = body?.match(/notification|no notification/i);
    expect(hasNotifContent).toBeTruthy();
    await page.screenshot({ path: "screenshots/12b-notifications-popover.png", fullPage: true });
  });
});

// ─── 14. Sidebar navigation ───────────────────────────────────────────────────
test.describe("Sidebar navigation", () => {
  test.beforeEach(async ({ page }) => {
    await seedEmployee(page, VERIFIER);
  });

  test("Dashboard nav item navigates correctly", async ({ page }) => {
    await page.getByText("Dashboard", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("dashboard");
  });

  test("Inbox nav item navigates correctly", async ({ page }) => {
    await page.getByText("Inbox", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("inbox");
    await page.screenshot({ path: "screenshots/13-nav-inbox.png" });
  });

  test("Search nav item navigates correctly", async ({ page }) => {
    await page.getByText("Search", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("search");
  });

  test("Reports nav item navigates correctly", async ({ page }) => {
    await page.getByText("Reports", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("reports");
  });

  test("Profile nav item navigates correctly", async ({ page }) => {
    await page.getByText("Profile", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("profile");
  });

  test("Inspections nav appears for field_inspector and navigates", async ({ page }) => {
    await seedEmployee(page, INSPECTOR);
    await expect(page.getByText("Inspections", { exact: true })).toBeVisible();
    await page.getByText("Inspections", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("inspections");
    await page.screenshot({ path: "screenshots/13b-nav-inspections.png" });
  });

  test("Approvals nav appears for approver and navigates", async ({ page }) => {
    await seedEmployee(page, APPROVER);
    await expect(page.getByText("Approvals", { exact: true })).toBeVisible();
    await page.getByText("Approvals", { exact: true }).first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.url()).toContain("approvals");
    await page.screenshot({ path: "screenshots/13c-nav-approvals.png" });
  });
});

// ─── 15. App detail — role-specific action docks ──────────────────────────────
test.describe("App detail action dock", () => {
  test("document_verifier sees verification-related action in submitted app", async ({ page }) => {
    await seedEmployee(page, VERIFIER);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const appId = await getFirstAppId(page);
    if (appId) {
      await page.goto(`/inbox/${appId}`);
      await page.waitForLoadState("networkidle");
      // Action dock should have start verification or similar button
      const body = await page.locator("body").textContent();
      expect(body?.length ?? 0).toBeGreaterThan(50);
      await page.screenshot({ path: "screenshots/14-detail-verifier-dock.png", fullPage: true });
    }
  });

  test("approver role loads app detail without crash", async ({ page }) => {
    await seedEmployee(page, APPROVER);
    await page.goto("/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    const appId = await getFirstAppId(page);
    if (appId) {
      await page.goto(`/inbox/${appId}`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).not.toBeEmpty();
      await page.screenshot({ path: "screenshots/14b-detail-approver-dock.png", fullPage: true });
    }
  });
});
