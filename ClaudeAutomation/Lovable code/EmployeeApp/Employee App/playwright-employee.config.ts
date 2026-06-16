import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test",
  testMatch: "**/*.spec.ts",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://127.0.0.1:8083",
    headless: true,
    screenshot: "on",
    trace: "on-first-retry",
  },
  outputDir: "./playwright-employee-results",
  reporter: [["html", { outputFolder: "playwright-employee-report", open: "never" }], ["list"]],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "iPhone 12",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
      testMatch: "**/*-mobile.spec.ts",
    },
  ],
});
