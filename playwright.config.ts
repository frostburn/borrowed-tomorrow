import { defineConfig } from '@playwright/test';
const production=process.env.BT_PRODUCTION==='1';
export default defineConfig({
  testMatch:production?'**/production.spec.ts':'**/*.spec.ts',testIgnore:production?undefined:'**/production.spec.ts',
  testDir:'./tests/e2e',timeout:180_000,fullyParallel:false,workers:1,
  use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1280,height:800},headless:true,trace:{mode:'retain-on-failure',screenshots:false,snapshots:true},
    launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage']}:undefined},
  webServer:{command:`npm run ${production?'preview':'dev'} -- --host 127.0.0.1 --port 5173`,url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
});
