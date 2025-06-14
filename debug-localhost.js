const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // コンソールログを記録
  page.on('console', msg => console.log('Console:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('Page error:', error.message));
  
  try {
    console.log('Navigating to http://localhost:3000...');
    const response = await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('Response status:', response?.status());
    console.log('Response URL:', response?.url());
    
    // スクリーンショットを撮る
    await page.screenshot({ path: 'localhost-debug.png' });
    console.log('Screenshot saved as localhost-debug.png');
    
    // ページのタイトルとコンテンツを確認
    const title = await page.title();
    console.log('Page title:', title);
    
    const bodyText = await page.textContent('body');
    console.log('Body text (first 200 chars):', bodyText?.substring(0, 200));
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // 別のポートも試す
    console.log('\nTrying port 3001...');
    try {
      const response = await page.goto('http://localhost:3001', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      console.log('Port 3001 status:', response?.status());
      await page.screenshot({ path: 'localhost-3001-debug.png' });
    } catch (e) {
      console.error('Port 3001 also failed:', e.message);
    }
  }
  
  await browser.close();
})();