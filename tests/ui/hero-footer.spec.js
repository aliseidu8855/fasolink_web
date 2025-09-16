import { test, expect } from '@playwright/test';

// Assumes dev server already running at baseURL.
// For CI you could start server in a globalSetup or via npm script.

test.describe('Hero & Footer visual', () => {
  test('desktop hero snapshot', async ({ page }) => {
    await page.goto('/');
    // Wait for hero title and category pills
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.waitForTimeout(200); // allow layout settle
    const hero = page.locator('.hero-section');
    expect(await hero.screenshot()).toMatchSnapshot('hero-desktop.png');
  });

  test('mobile hero snapshot', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.waitForTimeout(200);
    const hero = page.locator('.hero-section');
    expect(await hero.screenshot()).toMatchSnapshot('hero-mobile.png');
  });

  test('footer snapshot', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').waitFor();
    const footer = page.locator('footer');
    expect(await footer.screenshot()).toMatchSnapshot('footer.png');
  });
});
