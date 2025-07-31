import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('File Upload and Download Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should upload file and create project', async ({ page }) => {
    // Navigate to upload page
    await page.click('text=ファイルをアップロード');
    await expect(page).toHaveURL('/upload');

    // Fill project name
    await page.fill('#projectName', 'テストプロジェクト');

    // Upload a test file
    const testFilePath = path.resolve(__dirname, '../public/next.svg');
    await page.setInputFiles('#file-upload', testFilePath);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success page
    await expect(page).toHaveURL(/\/upload\/success/);
    await expect(page.locator('text=アップロード完了')).toBeVisible();

    // Get the project ID from the share URL input
    const shareUrlInput = page.locator('input[value*="/share/"]');
    const shareUrl = await shareUrlInput.inputValue();
    expect(shareUrl).toContain('share');
  });

  test('should download files with correct password', async ({ page }) => {
    // First, create a project with a file
    await page.goto('/upload');
    await page.fill('#projectName', 'ダウンロードテスト');
    
    const testFilePath = path.resolve(__dirname, '../public/next.svg');
    await page.setInputFiles('#file-upload', testFilePath);
    await page.click('button[type="submit"]');

    // Get the share URL and password from success page
    await expect(page).toHaveURL(/\/upload\/success/);
    const shareUrlInput = page.locator('input[value*="/share/"]');
    const shareUrl = await shareUrlInput.inputValue();
    const passwordInput = page.locator('input[type="password"], input[type="text"]').nth(1);
    const password = await passwordInput.inputValue();
    
    const projectId = shareUrl?.match(/share\/([^?]+)/)?.[1];

    if (projectId && password) {
      // Navigate to share page
      await page.goto(`/share/${projectId}`);
      
      // Enter password
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Verify file list is displayed
      await expect(page.locator('text=next.svg')).toBeVisible();
      
      // Test download functionality
      const downloadPromise = page.waitForDownload();
      await page.click('text=ダウンロード');
      const download = await downloadPromise;
      
      expect(download.suggestedFilename()).toBe('next.svg');
    }
  });

  test('should reject invalid password', async ({ page }) => {
    // First, create a project
    await page.goto('/upload');
    await page.fill('#projectName', '認証テスト');
    
    const testFilePath = path.resolve(__dirname, '../public/next.svg');
    await page.setInputFiles('#file-upload', testFilePath);
    await page.click('button[type="submit"]');

    // Get project ID
    await expect(page).toHaveURL(/\/upload\/success/);
    const shareUrlInput = page.locator('input[value*="/share/"]');
    const shareUrl = await shareUrlInput.inputValue();
    const projectId = shareUrl?.match(/share\/([^?]+)/)?.[1];

    if (projectId) {
      // Try with wrong password
      await page.goto(`/share/${projectId}`);
      await page.fill('input[type="password"]', 'wrong123');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('text=パスワードが正しくありません')).toBeVisible();
    }
  });

  test('should handle file upload validation', async ({ page }) => {
    await page.goto('/upload');

    // Try to submit without files - button should be disabled
    await page.fill('#projectName', 'バリデーションテスト');
    
    // Button should be disabled when no files selected
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeDisabled();
  });

  test('should display project information correctly', async ({ page }) => {
    // Create project
    await page.goto('/upload');
    await page.fill('#projectName', '情報表示テスト');
    
    const testFilePath = path.resolve(__dirname, '../public/next.svg');
    await page.setInputFiles('#file-upload', testFilePath);
    await page.click('button[type="submit"]');

    // Get project ID and password, then navigate to share page
    await expect(page).toHaveURL(/\/upload\/success/);
    const shareUrlInput = page.locator('input[value*="/share/"]');
    const shareUrl = await shareUrlInput.inputValue();
    const passwordInput = page.locator('input[type="password"], input[type="text"]').nth(1);
    const password = await passwordInput.inputValue();
    const projectId = shareUrl?.match(/share\/([^?]+)/)?.[1];

    if (projectId && password) {
      await page.goto(`/share/${projectId}`);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Verify project information
      await expect(page.locator('text=情報表示テスト')).toBeVisible();
      await expect(page.locator('text=next.svg')).toBeVisible();
      await expect(page.locator('text=ファイル数: 1')).toBeVisible();
    }
  });
});