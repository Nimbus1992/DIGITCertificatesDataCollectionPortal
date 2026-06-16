import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test/e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://127.0.0.1:8081",
    headless: true,
    screenshot: "on",
    trace: "on-first-retry",
  },
  outputDir: "./playwright-admin-results",
  reporter: [["html", { outputFolder: "playwright-admin-report", open: "never" }], ["list"]],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "iPhone 12",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 664 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
      },
      testMatch: "**/*-mobile.spec.ts",
    },
  ],
});
