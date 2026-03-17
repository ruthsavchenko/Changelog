import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5174',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Locally: reuse the already-running dev server (npm run dev)
  // In CI: build once and serve the production bundle via vite preview
  webServer: {
    command: process.env.CI ? 'npm run build && npm run preview' : 'npm run dev',
    url: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000, // build can take a while in CI
  },
})
