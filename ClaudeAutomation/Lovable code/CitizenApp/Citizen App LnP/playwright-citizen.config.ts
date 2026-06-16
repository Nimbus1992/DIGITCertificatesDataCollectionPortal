import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/test",
  testMatch: "**/*.spec.ts",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://127.0.0.1:8082",
    headless: true,
    screenshot: "on",
    trace: "on-first-retry",
  },
  outputDir: "./playwright-citizen-results",
  reporter: [["html", { outputFolder: "playwright-citizen-report", open: "never" }], ["list"]],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "iPhone 12",
      use: {
        ...devices["iPhone 12"],
        // Override defaultBrowserType so WebKit (not installed) is not required
        browserName: "chromium",
      },
      testMatch: "**/*-mobile.spec.ts",
    },
  ],
});
