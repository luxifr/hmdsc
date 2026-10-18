import { defineConfig } from '@playwright/test';

const testBuild = process.env.PLAYWRIGHT_BUILD === '1';
const port = testBuild ? 4174 : 4173;
const directory = testBuild ? ' --directory dist' : '';

export default defineConfig({
  testDir: './tests',
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    browserName: 'chromium',
  },
  webServer: {
    command: `python3 -m http.server ${port} --bind 127.0.0.1${directory}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
  },
});
