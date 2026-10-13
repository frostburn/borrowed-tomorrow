import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',timeout:180_000,fullyParallel:false,workers:1,
  use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1280,height:800},headless:true,trace:{mode:'retain-on-failure',screenshots:false,snapshots:true},
    launchOptions:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader']}:undefined},
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 5173',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},
});
