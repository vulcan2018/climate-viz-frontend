/**
 * End-to-end tests for the climate visualization app.
 */

import { test, expect } from '@playwright/test';

test.describe('Climate Visualization App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Climate Data Visualisation/);
  });

  test('displays header with view mode toggle', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const globeButton = page.getByRole('radio', { name: /3D Globe/i });
    const mapButton = page.getByRole('radio', { name: /2D Map/i });

    await expect(globeButton).toBeVisible();
    await expect(mapButton).toBeVisible();
  });

  test('can switch between 3D and 2D views', async ({ page }) => {
    const mapButton = page.getByRole('radio', { name: /2D Map/i });
    await mapButton.click();
    await expect(mapButton).toHaveAttribute('aria-checked', 'true');

    const globeButton = page.getByRole('radio', { name: /3D Globe/i });
    await globeButton.click();
    await expect(globeButton).toHaveAttribute('aria-checked', 'true');
  });

  test('sidebar can be toggled', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    const toggleButton = page.getByRole('button', { name: /close sidebar/i });
    await toggleButton.click();

    // Sidebar should be hidden
    await expect(sidebar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -320, 0)');
  });

  test('timeline slider is present', async ({ page }) => {
    const timeline = page.getByRole('group', { name: /timeline controls/i });
    await expect(timeline).toBeVisible();

    const playButton = page.getByRole('button', { name: /play animation/i });
    await expect(playButton).toBeVisible();
  });

  test('has skip link for accessibility', async ({ page }) => {
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeAttached();
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab to first focusable element
    await page.keyboard.press('Tab');

    // Should focus skip link first
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
  });
});

test.describe('Responsive Design', () => {
  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('works on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
  });
});
