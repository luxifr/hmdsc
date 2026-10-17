import { expect, test } from '@playwright/test';

test('beer density switches units and preserves its value', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();

  const density = page.getByLabel('Beer density');
  await expect(page.locator('#density-unit')).toHaveText('kg/L');
  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  await expect(page.locator('#density-unit')).toHaveText('lb/US gal');
  expect(Number(await density.inputValue())).toBeCloseTo(0.998 * 2.2046226218 * 3.785411784, 3);

  const imperialDensity = 0.95 * 2.2046226218 * 3.785411784;
  await density.fill(String(imperialDensity));
  await page.getByRole('button', { name: 'METRIC' }).click();
  await expect.poll(async () => Number(await density.inputValue())).toBeCloseTo(0.95, 6);
  await expect(page.locator('#density-unit')).toHaveText('kg/L');
  await expect(page.locator('#beer-equation')).toContainText('0.950 kg/L');
});

test('reset restores defaults and clears the scenario URL', async ({ page }) => {
  await page.goto('/?count=8');
  await expect(page.locator('#stein-count')).toHaveValue('8');

  await page.getByRole('button', { name: /reset defaults/i }).click();
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#total')).toHaveText('27.6');
  await expect(page).toHaveURL(/\/$/);
});

test('share updates the URL and the shared scenario loads', async ({ page }) => {
  await page.goto('/');
  await page.locator('#stein-count').fill('7');
  await page.getByRole('button', { name: /copy link/i }).click();

  await expect.poll(() => new URL(page.url()).searchParams.get('count')).toBe('7');

  await page.reload();
  await expect(page.locator('#stein-count')).toHaveValue('7');
});
