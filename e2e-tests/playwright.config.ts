import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met
     */
    timeout: 5000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use */
  reporter: [
    ['html'],
    ['json', { outputFile: './test-data/comprehensive-results.json' }],
    ['junit', { outputFile: './test-data/comprehensive-results.xml' }]
  ],
  /* Output directories for test data */
  outputDir: './test-data/artifacts',
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',
    /* Capture video on failure for comprehensive testing */
    video: 'retain-on-failure',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    /* Comprehensive testing project with enhanced error capture */
    {
      name: 'comprehensive',
      testMatch: '**/comprehensive-*.spec.ts',
      timeout: 120 * 1000, // Extended timeout for comprehensive tests (2 minutes)
      use: {
        ...devices['Desktop Chrome'],
        /* Enhanced error capture settings */
        trace: 'on',
        screenshot: 'on',
        video: 'on',
        /* Capture console logs and network activity */
        launchOptions: {
          args: [
            '--enable-logging',
            '--log-level=0',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
          ]
        },
        /* Extended timeouts for comprehensive testing */
        actionTimeout: 30 * 1000,
        navigationTimeout: 60 * 1000,
      },
      expect: {
        timeout: 15 * 1000, // Extended expect timeout for comprehensive tests
      },
      retries: 1, // Always retry comprehensive tests once on failure
    },
  ],
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    cwd: '..',
  },
});