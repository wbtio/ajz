import { defineConfig, devices } from '@playwright/test'

/**
 * Two suites:
 *
 *  • `unit` — pure logic extracted from the Applications page (snapshot
 *    builders, list filters, CSV escaping, field encryption). Runs in Node,
 *    needs no server, and is what CI should always run.
 *
 *  • `e2e`  — drives the real Applications page. It needs a signed-in staff
 *    account, so it is skipped unless E2E_EMAIL / E2E_PASSWORD are set.
 */
const E2E_ENABLED = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD)
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'unit',
      testMatch: /.*\.unit\.spec\.ts/,
    },
    ...(E2E_ENABLED
      ? [
          {
            name: 'e2e',
            testMatch: /.*\.e2e\.spec\.ts/,
            use: { ...devices['Desktop Chrome'] },
          },
        ]
      : []),
  ],
  ...(E2E_ENABLED && !process.env.E2E_BASE_URL
    ? {
        // `next start` rather than `next dev`, so the suite does not fight a
        // running dev server for the .next/dev lock.
        webServer: {
          command: 'npm run build && npx next start -p 3000',
          url: BASE_URL,
          reuseExistingServer: true,
          timeout: 180_000,
        },
      }
    : {}),
})
