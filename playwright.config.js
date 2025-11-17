// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* Maximum time one test can run for */
  timeout: 30 * 1000,
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel tests on CI for more stable results */
  workers: process.env.CI ? 2 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'https://jsonplaceholder.typicode.com',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* API testing specific */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    
    /* Timeout for each action */
    actionTimeout: 10 * 1000,
  },

  /* Configure projects for different test types */
  projects: [
    {
      name: 'API Tests',
      testMatch: /.*\.spec\.js/,
      use: {
        // API tests don't need browser-specific settings
      },
    },
  ],

  /* Global setup/teardown */
  globalSetup: undefined,
  globalTeardown: undefined,
});
