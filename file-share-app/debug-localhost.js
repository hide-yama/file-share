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
      waitUntil: 'networkidle',
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
    
    // テキストリンクをクリック
    console.log('\nClicking on テキスト link...');
    await page.click('a[href="/text"]');
    
    // ナビゲーション後のURL確認
    await page.waitForTimeout(2000);
    console.log('Current URL after click:', page.url());
    console.log('Page title after click:', await page.title());
    
    // /textに直接移動
    console.log('\nNavigating directly to /text...');
    const textResponse = await page.goto('http://localhost:3000/text', {
      waitUntil: 'networkidle'
    });
    console.log('Text page status:', textResponse?.status());
    console.log('Text page URL:', page.url());
    
    await page.screenshot({ path: 'localhost-text-debug.png' });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();