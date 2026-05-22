import { expect, test } from '@playwright/test';

test('homepage renders without console errors and shows primary content', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Diseños de autor/i })).toBeVisible();
  await expect(page.locator('.main-nav')).toContainText('Tienda');
  await expect(page.locator('img[src="assets/rocio-aranda.png"]')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('mobile menu opens and closes through navigation', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-only navigation smoke test');

  await page.goto('/');

  const menuButton = page.getByRole('button', { name: /Abrir menu/i });
  await menuButton.click();
  await expect(page.getByRole('navigation', { name: /Navegacion principal/i })).toHaveClass(/is-open/);

  await page.locator('.main-nav').getByRole('link', { name: 'Tienda', exact: true }).click();
  await expect(page.locator('.main-nav')).not.toHaveClass(/is-open/);
});

test('primary CTA links are valid placeholders ready for replacement', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-shop-link]').first()).toHaveAttribute('href', /^https:\/\/www\.instagram\.com\//);
  await expect(page.locator('[data-whatsapp-link]').first()).toHaveAttribute('href', /^https:\/\/wa\.me\//);
});
