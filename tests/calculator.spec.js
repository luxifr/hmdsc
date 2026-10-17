import { expect, test } from '@playwright/test';

test('announces the total without making the entire result card live', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#total')).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator('.result-card')).not.toHaveAttribute('aria-live');
  await expect(page.locator('#visualizer')).toHaveAttribute('role', 'img');
  await expect(page.locator('#visualizer')).toHaveAttribute('aria-label', '12 beer steins');
});

test('shows sourced median assumptions as the initial defaults', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#mug-mass')).toHaveValue('1.32');
  expect(await page.locator('#mug-mass').evaluate((input) => input.checkValidity())).toBe(true);
  await expect(page.locator('#density')).toHaveValue('1.01');
  await expect(page.locator('#total')).toHaveText('28.0');
  await expect(page.locator('#total-uncertainty')).toHaveText('±1.2');
  await expect(page.locator('#total-uncertainty')).toHaveAttribute('aria-label', 'Total-load uncertainty: ±1.2 kg');
  await expect(page.locator('#range')).toHaveCount(0);
  await expect(page.locator('.assumption-note a')).toHaveCount(8);
});

test('uses a valid inline SVG favicon', async ({ page }) => {
  await page.goto('/');
  const favicon = page.locator('link[rel="icon"]');
  const href = await favicon.getAttribute('href');
  expect(href.startsWith('data:image/svg+xml,')).toBe(true);
  await expect.poll(() => page.evaluate(async (src) => {
    const image = new Image();
    image.src = src;
    await image.decode();
    return image.naturalWidth;
  }, href)).toBeGreaterThan(0);
});

test('fill slider updates its displayed value', async ({ page }) => {
  await page.goto('/');
  await page.locator('#fill').fill('85');
  await expect(page.locator('#fill-output')).toHaveText('85%');
});

test('beer density switches units and preserves its value', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();

  const density = page.getByLabel('Beer density');
  await expect(page.locator('#density-unit')).toHaveText('kg/L');
  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  await expect(page.locator('#density-unit')).toHaveText('lb/US gal');
  expect(Number(await density.inputValue())).toBeCloseTo(1.01 * 2.2046226218 * 3.785411784, 3);

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
  await expect(page.locator('#total')).toHaveText('28.0');
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


test('scenario URLs restore all inputs and clamp out-of-range values', async ({ page }) => {
  await page.goto('/?count=8&fill=85&volume=1.5&mugMass=2&density=1.05&uncertainty=0.2');
  await expect(page.locator('#stein-count')).toHaveValue('8');
  await expect(page.locator('#fill')).toHaveValue('85');
  await expect(page.locator('#beer-volume')).toHaveValue('1.5');
  await expect(page.locator('#mug-mass')).toHaveValue('2');
  await expect(page.locator('#density')).toHaveValue('1.05');
  await expect(page.locator('#uncertainty')).toHaveValue('0.2');

  await page.goto('/?count=0&fill=110&volume=99&mugMass=-2&density=2&uncertainty=-1');
  await expect(page.locator('#stein-count')).toHaveValue('1');
  await expect(page.locator('#fill')).toHaveValue('100');
  await expect(page.locator('#beer-volume')).toHaveValue('2');
  await expect(page.locator('#mug-mass')).toHaveValue('0.1');
  await expect(page.locator('#density')).toHaveValue('1.2');
  await expect(page.locator('#uncertainty')).toHaveValue('0');

  await page.goto('/?count=invalid&fill=80');
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#fill')).toHaveValue('80');
});

test('saved scenario survives reload and URL values take precedence', async ({ page }) => {
  await page.goto('/');
  await page.locator('#stein-count').fill('9');
  await page.locator('#fill').fill('82');
  await page.reload();
  await expect(page.locator('#stein-count')).toHaveValue('9');
  await expect(page.locator('#fill')).toHaveValue('82');

  await page.goto('/?count=5');
  await expect(page.locator('#stein-count')).toHaveValue('5');
  await expect(page.locator('#fill')).toHaveValue('100');
});

test('volume and mass inputs convert when switching units', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();
  const volume = page.locator('#beer-volume');
  const mugMass = page.locator('#mug-mass');
  const density = page.locator('#density');
  const uncertainty = page.locator('#uncertainty');

  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  await expect(page.locator('#volume-unit')).toHaveText('fl oz');
  await expect(page.locator('#mass-unit')).toHaveText('lb');
  await expect(page.locator('#uncertainty-unit')).toHaveText('± lb');
  await expect(page.locator('#total-uncertainty')).toHaveText('±2.6');
  await expect(page.locator('#total-uncertainty')).toHaveAttribute('aria-label', 'Total-load uncertainty: ±2.6 lb');
  expect(Number(await volume.inputValue())).toBeCloseTo(33.8140227, 6);
  expect(Number(await mugMass.inputValue())).toBeCloseTo(1.32 * 2.2046226218, 6);
  expect(Number(await uncertainty.inputValue())).toBeCloseTo(0.1 * 2.2046226218, 6);
  for (const input of [volume, mugMass, density, uncertainty]) {
    expect(await input.evaluate((element) => element.checkValidity())).toBe(true);
  }

  await page.getByRole('button', { name: 'METRIC' }).click();
  await expect(page.locator('#volume-unit')).toHaveText('L');
  await expect(page.locator('#mass-unit')).toHaveText('kg');
  await expect(page.locator('#uncertainty-unit')).toHaveText('± kg');
  expect(Number(await volume.inputValue())).toBeCloseTo(1, 6);
  expect(Number(await mugMass.inputValue())).toBeCloseTo(1.32, 6);
  expect(Number(await uncertainty.inputValue())).toBeCloseTo(0.1, 6);
});

test('unit toggles keep the original scenario without cumulative rounding drift', async ({ page }) => {
  await page.goto('/?volume=1.23456789&mugMass=1.23456789&density=1.01234567&uncertainty=0.12345678');
  const initialTotal = await page.locator('#total').textContent();
  const initialEquation = await page.locator('#total-equation').textContent();

  for (let i = 0; i < 8; i += 1) {
    await page.getByRole('button', { name: 'IMPERIAL' }).click();
    for (const selector of ['#beer-volume', '#mug-mass', '#density', '#uncertainty']) {
      expect((await page.locator(selector).inputValue()).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(9);
    }
    await page.getByRole('button', { name: 'METRIC' }).click();
  }

  await expect(page.locator('#total')).toHaveText(initialTotal);
  await expect(page.locator('#total-equation')).toHaveText(initialEquation);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).volume)).toBe(1.23456789);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).mugMass)).toBe(1.23456789);
});

test('input columns and unit suffixes stay aligned across display systems', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();
  const dimensions = async () => page.locator('.control-row > :last-child, .advanced-fields > label, .advanced-fields > .input-with-unit, .input-with-unit span').evaluateAll((elements) => elements.map((element) => {
    const { width, height } = element.getBoundingClientRect();
    return [width, height].map((value) => Math.round(value * 100) / 100);
  }));
  const metricDimensions = await dimensions();

  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  expect(await dimensions()).toEqual(metricDimensions);
});

test('empty count uses the minimum without jumping to defaults and zero is normalized', async ({ page }) => {
  await page.goto('/');
  const count = page.locator('#stein-count');

  await count.fill('');
  await expect(count).toHaveValue('');
  await expect(page.locator('#total')).toHaveText('2.3');

  await count.fill('0');
  await expect(count).toHaveValue('1');
  await expect(page.locator('#total')).toHaveText('2.3');
});

test('stein stepper recalculates and respects count limits', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add one stein' }).click();
  await expect(page.locator('#stein-count')).toHaveValue('13');
  await expect(page.locator('#total')).toHaveText('30.3');

  await page.goto('/?count=40');
  await page.getByRole('button', { name: 'Add one stein' }).click();
  await expect(page.locator('#stein-count')).toHaveValue('40');

  await page.goto('/?count=1');
  await page.getByRole('button', { name: 'Remove one stein' }).click();
  await expect(page.locator('#stein-count')).toHaveValue('1');
});
