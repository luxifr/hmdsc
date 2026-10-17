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
  await expect(page.locator('#fill')).toHaveValue('90');
  await expect(page.locator('#fill-output')).toHaveText('90%');
  await expect(page.locator('#mug-mass')).toHaveValue('1.32');
  expect(await page.locator('#mug-mass').evaluate((input) => input.checkValidity())).toBe(true);
  await expect(page.locator('#uncertainty')).toHaveValue('50');
  await expect(page.locator('#density')).toHaveValue('1010');
  await expect(page.locator('#density-unit')).toHaveText('g/L');
  await expect(page.locator('#density-uncertainty')).toHaveValue('2');
  await expect(page.locator('#uncertainty-unit')).toHaveText('± g');
  await expect(page.locator('#density-uncertainty-unit')).toHaveText('± g/L');
  await expect(page.locator('#beer-uncertainty')).toHaveCount(0);
  await expect(page.locator('#total')).toHaveText('26.7');
  await expect(page.locator('#total-uncertainty')).toHaveText('±0.6');
  await expect(page.locator('#total-uncertainty')).toHaveAttribute('aria-label', 'Total-load uncertainty: ±0.6 kg');
  await expect(page.locator('#per-stein')).toHaveText('2.23 kg');
  await expect(page.locator('#per-stein-icon svg')).toHaveCount(1);
  const heights = await page.evaluate(() => ({
    stein: document.querySelector('#per-stein-icon svg').getBoundingClientRect().height,
    text: document.querySelector('.per-stein-display>div').getBoundingClientRect().height,
  }));
  expect(Math.abs(heights.stein - heights.text)).toBeLessThanOrEqual(1);
  await expect(page.locator('#per-stein-uncertainty')).toHaveText('±0.05 kg');
  await expect(page.locator('#secondary-total')).toHaveText("That's 59.0 ±1.4 lb on the other side of the pond");
  await expect(page.locator('#range')).toHaveCount(0);
  await expect(page.locator('.assumption-note a')).toHaveCount(8);
});

test('keeps the per-stein result clear of the total on desktop screens', async ({ page }) => {
  await page.goto('/');

  const bounds = await page.evaluate(() => {
    const rect = (selector) => {
      const { left, right } = document.querySelector(selector).getBoundingClientRect();
      return { left, right };
    };
    return {
      total: rect('.total-primary'),
      perStein: rect('.per-stein'),
    };
  });
  expect(bounds.total.right).toBeLessThanOrEqual(bounds.perStein.left);
});

test('keeps the per-stein result below the total on narrow screens', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/');

  const bounds = await page.evaluate(() => {
    const rect = (selector) => {
      const { left, right, top, bottom } = document.querySelector(selector).getBoundingClientRect();
      return { left, right, top, bottom };
    };
    return {
      total: rect('.total-primary'),
      perStein: rect('.per-stein'),
      card: rect('.result-card'),
    };
  });
  expect(bounds.total.bottom).toBeLessThan(bounds.perStein.top);
  expect(bounds.perStein.right).toBeLessThanOrEqual(bounds.card.right);
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

test('stein fill slider updates beer, foam, and its accessible value', async ({ page }) => {
  await page.goto('/');
  const fill = page.locator('#fill');
  const beer = page.locator('#fill-beer');
  const foam = page.locator('#fill-foam');
  const foamOverflow = page.locator('.fill-stein > path').nth(2);
  const foamCap = page.locator('#fill-foam-cap');
  const capBubbles = page.locator('#fill-foam-cap-bubbles circle');
  const beerBubbles = page.locator('#fill-beer-bubbles circle');
  const glass = page.locator('.fill-stein > path').nth(1);

  await expect(fill).toHaveAttribute('aria-describedby', 'fill-output');
  await expect(fill).toHaveCSS('opacity', '0');
  await expect(page.locator('.fill-handle')).toHaveCount(0);
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(34.6);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(6.6);
  await expect(capBubbles).toHaveCount(9);
  await expect(beerBubbles).toHaveCount(18);
  await expect(page.locator('#fill-foam-cap')).toHaveAttribute('fill', '#f3ead6');
  const capAndRim = await page.evaluate(() => {
    const box = (selector) => {
      const { y, height } = document.querySelector(selector).getBBox();
      return { top: y, bottom: y + height };
    };
    return { cap: box('#fill-foam-cap'), rim: box('.fill-stein > path:last-child') };
  });
  expect(capAndRim.cap.bottom).toBe(capAndRim.rim.top);
  const overflowBounds = await foamOverflow.boundingBox();
  const glassBounds = await glass.boundingBox();
  expect(overflowBounds.y).toBeLessThan(glassBounds.y);

  await fill.fill('85');
  await expect(page.locator('#fill-output')).toHaveText('85%');
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(37.9);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(9.9);

  await fill.scrollIntoViewIfNeeded();
  const bounds = await fill.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 4);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 4, { steps: 10 });
  await page.mouse.up();
  await expect(fill).toHaveValue('70');
  await expect(page.locator('#fill-output')).toHaveText('70%');
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(47.8);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(19.8);

  await fill.focus();
  await fill.press('ArrowUp');
  await expect(fill).toHaveValue('71');
});

test('beer density switches units and preserves its value', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();

  const density = page.getByLabel('Beer density', { exact: true });
  await expect(page.locator('#density-unit')).toHaveText('g/L');
  await expect(density).toHaveValue('1010');
  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  await expect(page.locator('#density-unit')).toHaveText('lb/gal');
  await expect(density).toHaveValue('8.429');

  const imperialDensity = 0.95 * 2.2046226218 * 3.785411784;
  await density.fill(String(imperialDensity));
  await page.getByRole('button', { name: 'METRIC' }).click();
  await expect.poll(async () => Number(await density.inputValue())).toBe(950);
  await expect(page.locator('#density-unit')).toHaveText('g/L');
  await expect(page.locator('#beer-equation')).toContainText('0.950 kg/L');
});

test('reset restores defaults and clears the scenario URL', async ({ page }) => {
  await page.goto('/?count=8');
  await expect(page.locator('#stein-count')).toHaveValue('8');

  await page.getByRole('button', { name: /reset defaults/i }).click();
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#total')).toHaveText('26.7');
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => localStorage.getItem('carry-calc'))).toBeNull();

  await page.locator('#remember-inputs').check();
  await page.locator('#stein-count').fill('8');
  await page.getByRole('button', { name: /reset defaults/i }).click();
  await page.reload();
  await expect(page.locator('#stein-count')).toHaveValue('12');
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
  await page.goto('/?count=8&fill=85&volume=1.5&mugMass=2&density=1.05&uncertainty=0.2&densityUncertainty=0.004');
  await expect(page.locator('#stein-count')).toHaveValue('8');
  await expect(page.locator('#fill')).toHaveValue('85');
  await expect(page.locator('#beer-volume')).toHaveValue('1.5');
  await expect(page.locator('#mug-mass')).toHaveValue('2');
  await expect(page.locator('#density')).toHaveValue('1050');
  await expect(page.locator('#uncertainty')).toHaveValue('200');
  await expect(page.locator('#density-uncertainty')).toHaveValue('4');
  await expect(page.locator('#beer-uncertainty')).toHaveCount(0);

  await page.goto('/?count=0&fill=110&volume=99&mugMass=-2&density=2&uncertainty=-1&densityUncertainty=1');
  await expect(page.locator('#stein-count')).toHaveValue('1');
  await expect(page.locator('#fill')).toHaveValue('100');
  await expect(page.locator('#beer-volume')).toHaveValue('2');
  await expect(page.locator('#mug-mass')).toHaveValue('0.1');
  await expect(page.locator('#density')).toHaveValue('1200');
  await expect(page.locator('#uncertainty')).toHaveValue('0');
  await expect(page.locator('#density-uncertainty')).toHaveValue('100');
  await expect(page.locator('#beer-uncertainty')).toHaveCount(0);

  await page.goto('/?count=invalid&fill=80');
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#fill')).toHaveValue('80');
});

test('scenario saving is opt-in, restores when enabled, and clears when disabled', async ({ page }) => {
  await page.goto('/');
  const remember = page.locator('#remember-inputs');
  await expect(remember).not.toBeChecked();
  await page.locator('#stein-count').fill('9');
  await page.locator('#fill').fill('82');
  expect(await page.evaluate(() => localStorage.getItem('carry-calc'))).toBeNull();
  await page.reload();
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#fill')).toHaveValue('90');

  await remember.check();
  await page.locator('#stein-count').fill('9');
  await page.locator('#fill').fill('82');
  await page.reload();
  await expect(remember).toBeChecked();
  await expect(page.locator('#stein-count')).toHaveValue('9');
  await expect(page.locator('#fill')).toHaveValue('82');

  await page.goto('/?count=5');
  await expect(page.locator('#stein-count')).toHaveValue('5');
  await expect(page.locator('#fill')).toHaveValue('90');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).count)).toBe(5);

  await remember.uncheck();
  expect(await page.evaluate(() => localStorage.getItem('carry-calc'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('carry-calc-remember'))).toBeNull();
  await page.goto('/');
  await page.reload();
  await expect(remember).not.toBeChecked();
  await expect(page.locator('#stein-count')).toHaveValue('12');
});

test('volume and mass inputs convert when switching units', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();
  const volume = page.locator('#beer-volume');
  const mugMass = page.locator('#mug-mass');
  const density = page.locator('#density');
  const uncertainty = page.locator('#uncertainty');
  const densityUncertainty = page.locator('#density-uncertainty');

  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  await expect(page.locator('#volume-unit')).toHaveText('fl oz');
  await expect(page.locator('#mass-unit')).toHaveText('lb');
  await expect(page.locator('#uncertainty-unit')).toHaveText('± lb');
  await expect(page.locator('#density-unit')).toHaveText('lb/gal');
  await expect(page.locator('#density-uncertainty-unit')).toHaveText('± lb/gal');
  await expect(page.locator('#total-uncertainty')).toHaveText('±1.4');
  await expect(page.locator('#total-uncertainty')).toHaveAttribute('aria-label', 'Total-load uncertainty: ±1.4 lb');
  await expect(page.locator('#per-stein')).toHaveText('4.91 lb');
  await expect(page.locator('#per-stein-uncertainty')).toHaveText('±0.11 lb');
  await expect(page.locator('#secondary-total')).toHaveText("That's 26.7 ±0.6 kg on the other side of the pond");
  expect(Number(await volume.inputValue())).toBe(33.814);
  expect(Number(await mugMass.inputValue())).toBe(2.91);
  expect(Number(await uncertainty.inputValue())).toBe(0.11);
  expect(Number(await density.inputValue())).toBe(8.429);
  expect(Number(await densityUncertainty.inputValue())).toBe(0.017);
  for (const input of [volume, mugMass, density, uncertainty, densityUncertainty]) {
    expect(await input.evaluate((element) => element.checkValidity())).toBe(true);
  }

  await page.getByRole('button', { name: 'METRIC' }).click();
  await expect(page.locator('#volume-unit')).toHaveText('L');
  await expect(page.locator('#mass-unit')).toHaveText('kg');
  await expect(page.locator('#uncertainty-unit')).toHaveText('± g');
  await expect(page.locator('#density-unit')).toHaveText('g/L');
  await expect(page.locator('#density-uncertainty-unit')).toHaveText('± g/L');
  expect(Number(await volume.inputValue())).toBe(1);
  expect(Number(await mugMass.inputValue())).toBe(1.32);
  expect(Number(await uncertainty.inputValue())).toBe(50);
  expect(Number(await density.inputValue())).toBe(1010);
  expect(Number(await densityUncertainty.inputValue())).toBe(2);
});

test('unit toggles keep the original scenario without cumulative rounding drift', async ({ page }) => {
  await page.goto('/?volume=1.23456789&mugMass=1.23456789&density=1.01234567&uncertainty=0.12345678&densityUncertainty=0.00234567');
  await page.locator('#remember-inputs').check();
  const initialTotal = await page.locator('#total').textContent();
  const initialEquation = await page.locator('#total-equation').textContent();

  const inputs = ['#beer-volume', '#mug-mass', '#density', '#uncertainty', '#density-uncertainty'];
  const expectThreeDecimalsAtMost = async () => {
    for (const selector of inputs) {
      expect((await page.locator(selector).inputValue()).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(3);
    }
  };
  await expectThreeDecimalsAtMost();
  for (let i = 0; i < 8; i += 1) {
    await page.getByRole('button', { name: 'IMPERIAL' }).click();
    await expectThreeDecimalsAtMost();
    await page.getByRole('button', { name: 'METRIC' }).click();
    await expectThreeDecimalsAtMost();
  }

  await expect(page.locator('#total')).toHaveText(initialTotal);
  await expect(page.locator('#total-equation')).toHaveText(initialEquation);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).volume)).toBe(1.23456789);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).mugMass)).toBe(1.23456789);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).density)).toBe(1.01234567);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).densityUncertainty)).toBe(0.00234567);
});

test('share links preserve full calculation precision', async ({ page }) => {
  await page.goto('/?volume=1.23456789&density=1.01234567');
  await page.getByRole('button', { name: /copy link/i }).click();

  await expect.poll(() => new URL(page.url()).searchParams.get('volume')).toBe('1.23456789');
  await expect.poll(() => new URL(page.url()).searchParams.get('density')).toBe('1.01234567');
});

test('input displays cap decimals while retaining scenario precision', async ({ page }) => {
  await page.goto('/?density=1.01234567');
  await page.locator('#remember-inputs').check();
  await page.getByText('Fine-tune the assumptions').click();
  const density = page.locator('#density');

  await density.fill('1000.123456');
  await density.press('Tab');
  await expect(density).toHaveValue('1000.123');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).density)).toBe(1.000123456);

  await page.locator('#mug-mass').fill('1.111119');
  await page.locator('#mug-mass').press('Tab');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).density)).toBe(1.000123456);
});

test('main and fine-tune values, units, and buttons align independently', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();
  await expect(page.locator('.advanced-fields > label')).toHaveText([
    'Beer per stein',
    'Empty glass weight',
    'Glass weight uncertainty',
    'Beer density',
    'Beer density uncertainty',
  ]);
  await expect(page.locator('#beer-volume')).toHaveValue('1');
  const measure = () => page.evaluate(() => {
    const bounds = (element) => {
      const { left, right, width } = element.getBoundingClientRect();
      return [left, right, width].map((value) => Math.round(value * 100) / 100);
    };
    const one = (selector) => bounds(document.querySelector(selector));
    const many = (selector) => [...document.querySelectorAll(selector)].map(bounds);
    return {
      mainLabels: many('.count-row > :first-child'),
      mainControls: many('.count-row > :last-child'),
      mainValues: [one('#stein-count')],
      stepButtons: many('.stepper .step-button'),
      fineTuneLabels: many('.advanced-fields > label'),
      fineTuneControls: many('.advanced-fields > .input-with-unit'),
      fineTuneValues: many('.advanced-fields input'),
      fineTuneUnits: many('.advanced-fields .input-with-unit span'),
      fineTunePlusButtons: many('.advanced-fields .input-with-unit > .step-button:last-child'),
      suffixesFit: [...document.querySelectorAll('.input-with-unit span')].every((element) => element.scrollWidth <= element.clientWidth),
    };
  });
  const expectSameColumn = (items, index) => expect(new Set(items.map((item) => item[index])).size).toBe(1);
  const expectLayoutAligned = (layout) => {
    expectSameColumn(layout.mainLabels, 0);
    expectSameColumn(layout.mainControls, 1);
    expectSameColumn(layout.mainControls, 2);
    expect(layout.stepButtons[0][1]).toBe(layout.mainValues[0][0]);
    expect(Math.abs(layout.stepButtons[1][1] - layout.mainControls[0][1])).toBeLessThanOrEqual(1);
    expectSameColumn(layout.fineTuneLabels, 0);
    expectSameColumn(layout.fineTuneControls, 1);
    expectSameColumn(layout.fineTuneControls, 2);
    expect(layout.fineTuneValues[1]).toEqual(layout.fineTuneValues[0]);
    expect(layout.fineTuneValues[2]).toEqual(layout.fineTuneValues[0]);
    expect(layout.fineTuneValues[3]).toEqual(layout.fineTuneValues[0]);
    expect(layout.fineTuneValues[4]).toEqual(layout.fineTuneValues[0]);
    expect(layout.fineTuneUnits[1]).toEqual(layout.fineTuneUnits[0]);
    expect(layout.fineTuneUnits[2]).toEqual(layout.fineTuneUnits[0]);
    expect(layout.fineTuneUnits[3]).toEqual(layout.fineTuneUnits[0]);
    expect(layout.fineTuneUnits[4]).toEqual(layout.fineTuneUnits[0]);
    expect(layout.fineTunePlusButtons).toHaveLength(5);
    layout.fineTuneControls.forEach((control, index) => {
      expect(Math.abs(layout.fineTunePlusButtons[index][1] - control[1])).toBeLessThanOrEqual(1);
      expect(Math.abs(layout.fineTuneUnits[index][0] - (control[0] + control[1]) / 2)).toBeLessThanOrEqual(1);
    });
    expect(layout.mainValues[0][0]).not.toBe(layout.fineTuneValues[0][0]);
    expect(layout.suffixesFit).toBe(true);
  };

  for (const width of [1280, 900, 650, 380, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const metricLayout = await measure();
    expectLayoutAligned(metricLayout);

    await page.getByRole('button', { name: 'IMPERIAL' }).click();
    const imperialLayout = await measure();
    expectLayoutAligned(imperialLayout);
    expect(imperialLayout).toEqual(metricLayout);
    await page.getByRole('button', { name: 'METRIC' }).click();
  }
});

test('empty count uses the minimum without jumping to defaults and zero is normalized', async ({ page }) => {
  await page.goto('/');
  const count = page.locator('#stein-count');

  await count.fill('');
  await expect(count).toHaveValue('');
  await expect(page.locator('#total')).toHaveText('2.2');

  await count.fill('0');
  await expect(count).toHaveValue('1');
  await expect(page.locator('#total')).toHaveText('2.2');
});

test('fine-tune stepper buttons update each value and respect input bounds', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Fine-tune the assumptions').click();
  const cases = [
    ['Increase beer per stein', 'Decrease beer per stein', '#beer-volume', '1.05', '1'],
    ['Increase empty glass weight', 'Decrease empty glass weight', '#mug-mass', '1.33', '1.32'],
    ['Increase glass weight uncertainty', 'Decrease glass weight uncertainty', '#uncertainty', '51', '50'],
    ['Increase beer density', 'Decrease beer density', '#density', '1011', '1010'],
    ['Increase beer density uncertainty', 'Decrease beer density uncertainty', '#density-uncertainty', '2.1', '2'],
  ];
  for (const [increase, decrease, selector, nextValue, originalValue] of cases) {
    await page.getByRole('button', { name: increase, exact: true }).click();
    await expect(page.locator(selector)).toHaveValue(nextValue);
    await page.getByRole('button', { name: decrease, exact: true }).click();
    await expect(page.locator(selector)).toHaveValue(originalValue);
  }
  await page.getByRole('button', { name: 'Decrease glass weight uncertainty' }).click();
  await expect(page.locator('#uncertainty')).toHaveValue('49');

  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  await page.getByRole('button', { name: 'Increase beer per stein', exact: true }).click();
  await expect(page.locator('#beer-volume')).toHaveValue('35.505');
  expect((await page.locator('#beer-volume').inputValue()).split('.')[1]?.length ?? 0).toBeLessThanOrEqual(3);
});

test('stein stepper recalculates and respects count limits', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add one stein' }).click();
  await expect(page.locator('#stein-count')).toHaveValue('13');
  await expect(page.locator('#total')).toHaveText('29.0');

  await page.goto('/?count=40');
  await page.getByRole('button', { name: 'Add one stein' }).click();
  await expect(page.locator('#stein-count')).toHaveValue('40');

  await page.goto('/?count=1');
  await page.getByRole('button', { name: 'Remove one stein' }).click();
  await expect(page.locator('#stein-count')).toHaveValue('1');
});
