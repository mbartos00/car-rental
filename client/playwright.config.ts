import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
});
