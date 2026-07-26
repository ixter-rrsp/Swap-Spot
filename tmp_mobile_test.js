const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const iphone = devices['iPhone 14'];
  const context = await browser.newContext(iphone);
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/notifications');
  await page.screenshot({ path: 'C:/Users/princ/OneDrive/Desktop/swapSpot/notifications-mobile.png', fullPage: true });
  const bodySize = await page.evaluate(() => ({ w: document.body.clientWidth, h: document.body.clientHeight, scrollH: document.body.scrollHeight, htmlH: document.documentElement.clientHeight, htmlScrollH: document.documentElement.scrollHeight }));
  console.log(JSON.stringify(bodySize));
  await browser.close();
})();
