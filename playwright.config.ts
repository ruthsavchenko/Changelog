import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // In CI: automatically start the dev server before E2E tests
  // and shut it down after. Locally you can start it manually.
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI, // locally reuse if already running
  },
})
