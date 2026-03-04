import { defineConfig } from '@playwright/test';

const backendBaseUrl = 'http://127.0.0.1:3000';
const frontendBaseUrl = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  timeout: 30_000,
  use: {
    baseURL: frontendBaseUrl,
    trace: 'on-first-retry'
  },
  webServer: [
    {
      command: 'npm run dev',
      cwd: './backend',
      url: `${backendBaseUrl}/test`,
      timeout: 120_000,
      reuseExistingServer: true
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4173',
      cwd: './frontend',
      url: frontendBaseUrl,
      timeout: 120_000,
      reuseExistingServer: true
    }
  ]
});
