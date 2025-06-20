const { chromium } = require('playwright');

(async () => {
  console.log('Starting Playwright to capture production site...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    // Capture errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push({
        message: error.message,
        stack: error.stack
      });
    });
    
    // Capture failed requests
    const failedRequests = [];
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()
      });
    });
    
    // Capture network errors (4xx, 5xx responses)
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    console.log('Navigating to https://ageruyo.vercel.app...');
    
    const response = await page.goto('https://ageruyo.vercel.app', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log(`Page loaded with status: ${response.status()}`);
    
    // Take screenshots
    await page.screenshot({ 
      path: 'production-homepage.png',
      fullPage: true 
    });
    console.log('Full page screenshot saved as production-homepage.png');
    
    await page.screenshot({ 
      path: 'production-viewport.png',
      fullPage: false 
    });
    console.log('Viewport screenshot saved as production-viewport.png');
    
    // Get page info
    const title = await page.title();
    const url = page.url();
    
    console.log(`\n=== Page Info ===`);
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);
    
    // Report console messages
    if (consoleMessages.length > 0) {
      console.log('\n=== Console Messages ===');
      consoleMessages.forEach(msg => {
        console.log(`[${msg.type}] ${msg.text}`);
        if (msg.location.url) {
          console.log(`  at ${msg.location.url}:${msg.location.lineNumber}`);
        }
      });
    } else {
      console.log('\n✓ No console messages');
    }
    
    // Report page errors
    if (pageErrors.length > 0) {
      console.log('\n=== Page Errors ===');
      pageErrors.forEach(err => {
        console.error(`Error: ${err.message}`);
        if (err.stack) console.error(err.stack);
      });
    } else {
      console.log('✓ No page errors');
    }
    
    // Report failed requests
    if (failedRequests.length > 0) {
      console.log('\n=== Failed Requests ===');
      failedRequests.forEach(req => {
        console.error(`Failed: ${req.url}`);
        console.error(`Reason: ${req.failure.errorText}`);
      });
    } else {
      console.log('✓ No failed requests');
    }
    
    // Report network errors
    if (networkErrors.length > 0) {
      console.log('\n=== Network Errors ===');
      networkErrors.forEach(err => {
        console.error(`${err.status} ${err.statusText}: ${err.url}`);
      });
    } else {
      console.log('✓ No network errors');
    }
    
    // Also test the local development server if requested
    console.log('\n\nAttempting to test localhost:3000...');
    try {
      const localResponse = await page.goto('http://localhost:3000', { 
        waitUntil: 'domcontentloaded',
        timeout: 5000 
      });
      
      if (localResponse) {
        console.log(`Local server status: ${localResponse.status()}`);
        await page.screenshot({ 
          path: 'localhost-screenshot.png',
          fullPage: true 
        });
        console.log('Local screenshot saved as localhost-screenshot.png');
      }
    } catch (localError) {
      console.log('Local server not available:', localError.message);
      console.log('\nDiagnosis: The local development server is not running or not responding.');
      console.log('To start the local server, run: npm run dev');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
    console.log('\nTest completed.');
  }
})();