import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://gc.zgo.at/count.js', (route) => route.fulfill({
    contentType: 'application/javascript',
    body: `window.__goatcounterLoadedSearch = location.search;
    window.goatcounter.count = (data) => {
      window.__goatcounterEvents ||= [];
      window.__goatcounterEvents.push({ path: typeof data.path === 'function' ? data.path() : data.path, event: !!data.event });
    };`,
  }));
});

test('GoatCounter receives only fixed events and scenario data stays out of query strings', async ({ page }) => {
  await page.goto('/?count=6&fill=82&volume=1.5');
  await expect(page.locator('#stein-count')).toHaveValue('6');
  await expect(page.locator('#fill')).toHaveValue('82');
  await expect(page).toHaveURL(/#scenario=count=6/);

  const analyticsConfig = await page.evaluate(() => ({
    search: location.search,
    path: window.goatcounter.path(),
    referrer: window.goatcounter.referrer(),
    title: window.goatcounter.title(),
    loadedSearch: window.__goatcounterLoadedSearch,
    cookie: document.cookie,
    endpoint: document.querySelector('#goatcounter-script').dataset.goatcounter,
  }));
  expect(analyticsConfig).toEqual({
    search: '',
    path: '/',
    referrer: '',
    title: null,
    loadedSearch: '',
    cookie: '',
    endpoint: 'https://hmdsc.goatcounter.com/count',
  });

  await page.locator('#stein-count').fill('7');
  await page.locator('#stein-count').fill('8');
  await page.getByRole('button', { name: /copy link/i }).click();
  await page.getByRole('button', { name: /copy link/i }).click();
  await expect.poll(() => page.evaluate(() => window.__goatcounterEvents)).toEqual([
    { path: 'calculator_used', event: true },
    { path: 'share_clicked', event: true },
  ]);
  await expect(page).toHaveURL(/^[^?]+#/);
});

test('forwards the browser referrer to GoatCounter', async ({ page }) => {
  await page.route('**/referrer-source?campaign=beer', (route) => route.fulfill({
    contentType: 'text/html',
    body: '<a href="/">Continue</a>',
  }));
  await page.goto('/referrer-source?campaign=beer');
  await page.getByRole('link', { name: 'Continue' }).click();
  await expect.poll(() => page.evaluate(() => window.goatcounter.referrer())).toBe('http://127.0.0.1:4173/referrer-source?campaign=beer');
});

test('mobile places secondary controls after results while desktop keeps them in the controls column', async ({ page }) => {
  await page.goto('/');
  const layout = () => page.evaluate(() => {
    const bounds = (selector) => {
      const { left, top, bottom } = document.querySelector(selector).getBoundingClientRect();
      return { left, top, bottom };
    };
    return {
      primary: bounds('.primary-controls'),
      result: bounds('.result-card'),
      secondary: bounds('.secondary-controls'),
      mobileOrder: document.querySelector('.primary-controls').compareDocumentPosition(document.querySelector('.result-card')) & Node.DOCUMENT_POSITION_FOLLOWING
        && document.querySelector('.result-card').compareDocumentPosition(document.querySelector('.secondary-controls')) & Node.DOCUMENT_POSITION_FOLLOWING,
    };
  });

  await page.setViewportSize({ width: 390, height: 844 });
  let positions = await layout();
  expect(positions.primary.bottom).toBeLessThan(positions.result.top);
  expect(positions.result.bottom).toBeLessThan(positions.secondary.top);
  expect(positions.mobileOrder).toBeTruthy();

  await page.setViewportSize({ width: 1280, height: 900 });
  positions = await layout();
  expect(positions.primary.left).toBe(positions.secondary.left);
  expect(positions.primary.left).toBeLessThan(positions.result.left);
  expect(positions.result.top).toBeLessThan(positions.secondary.top);
});

test('copy-link action is integrated at the bottom of the result card', async ({ page }) => {
  await page.goto('/');
  const share = page.locator('.result-card #share');
  await expect(share).toBeVisible();
  await expect(page.locator('.result-card #reset')).toHaveCount(0);
  await share.click();
  await expect(page).toHaveURL(/#scenario=count=12/);
});

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
  await expect(page.locator('#per-stein-icon svg path').nth(1)).toHaveAttribute('fill', '#B77932');
  await expect(page.locator('#per-stein-icon svg path').nth(1)).toHaveAttribute('stroke', '#E4C781');
  await expect(page.locator('#per-stein-icon svg path').nth(2)).toHaveAttribute('fill', '#E0A743');
  await expect(page.locator('#per-stein-icon svg path').nth(3)).toHaveAttribute('fill', '#F0E9D9');
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

test('hero stein has beer and foam bubbles matching the fill control', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-beer-bubbles circle')).toHaveCount(12);
  await expect(page.locator('.hero-foam-bubbles circle')).toHaveCount(9);
  await expect(page.locator('.hero-beer-bubbles')).toHaveAttribute('fill', '#F4C66C');
  await expect(page.locator('.hero-beer-bubbles')).toHaveAttribute('opacity', '.85');
  await expect(page.locator('.hero-foam-bubbles')).toHaveAttribute('fill', '#FFF8E9');
  await expect(page.locator('.hero-foam-bubbles')).toHaveAttribute('opacity', '.9');
  await expect(page.locator('.hero-beer-bubbles circle').first()).toHaveAttribute('r', '3.8');
  await expect(page.locator('.hero-foam-bubbles circle').first()).toHaveAttribute('r', '3.8');
  await expect(page.locator('.hero-beer-bubbles circle').first()).toHaveCSS('animation-name', 'bubble-rise');
  await expect(page.locator('.hero-beer-bubbles circle').first()).toHaveCSS('animation-duration', '2.4s');
  await expect(page.locator('.hero-beer-bubbles circle').first()).toHaveCSS('animation-timing-function', 'linear');
  await expect(page.locator('.hero-foam-bubbles circle').first()).toHaveCSS('animation-name', 'foam-bubble');
  await expect(page.locator('.hero-foam-bubbles circle').first()).toHaveCSS('animation-duration', '1.8s');

  const beerBubbleMotion = await page.locator('.hero-beer-bubbles circle').nth(1).evaluate(element => {
    const animation = element.getAnimations()[0];
    return [0, 600, 1200, 1800, 2399].map(time => {
      animation.currentTime = time;
      return new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
    });
  });
  expect(beerBubbleMotion[0]).toBe(0);
  expect(beerBubbleMotion[1]).toBeLessThan(beerBubbleMotion[0]);
  expect(beerBubbleMotion[2]).toBeLessThan(beerBubbleMotion[1]);
  expect(beerBubbleMotion[3]).toBeLessThan(beerBubbleMotion[2]);
  expect(beerBubbleMotion[4]).toBeLessThan(beerBubbleMotion[3]);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.hero-beer-bubbles circle').first()).toHaveCSS('animation-iteration-count', '1');
  await expect(page.locator('.hero-foam-bubbles circle').first()).toHaveCSS('animation-duration', '1e-05s');
});

test('uses a valid inline SVG favicon', async ({ page }) => {
  await page.goto('/');
  const favicon = page.locator('link[rel="icon"]');
  const href = await favicon.getAttribute('href');
  expect(href.startsWith('data:image/svg+xml,')).toBe(true);
  const faviconSvg = decodeURIComponent(href.slice('data:image/svg+xml,'.length));
  expect(faviconSvg).toContain("fill='#B77932'");
  expect(faviconSvg).toContain("stroke='#E4C781'");
  expect(faviconSvg).toContain("stroke='#D8C69F'");
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
  await expect(page.locator('.fill-stein > path').nth(0)).toHaveAttribute('stroke', '#D8C69F');
  await expect(page.locator('.fill-stein > path').nth(1)).toHaveAttribute('fill', '#B77932');
  await expect(page.locator('.fill-stein > path').nth(1)).toHaveAttribute('stroke', '#E4C781');
  await expect(fill).toHaveCSS('opacity', '0');
  await expect(page.locator('.fill-handle')).toHaveCount(0);
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(34.6);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(6.6);
  await expect(capBubbles).toHaveCount(9);
  await expect(beerBubbles).toHaveCount(18);
  await expect(page.locator('#fill-foam-cap')).toHaveAttribute('fill', '#F0E9D9');
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

test('clicking either unit control always toggles the display units', async ({ page }) => {
  await page.goto('/');
  const metric = page.getByRole('button', { name: 'METRIC' });
  const imperial = page.getByRole('button', { name: 'IMPERIAL' });
  const expectUnits = async (active, inactive, unit) => {
    await expect(active).toHaveAttribute('aria-pressed', 'true');
    await expect(inactive).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#total-unit')).toHaveText(unit);
  };

  await expectUnits(metric, imperial, 'kg');
  await metric.click();
  await expectUnits(imperial, metric, 'lb');
  await metric.click();
  await expectUnits(metric, imperial, 'kg');
  await imperial.click();
  await expectUnits(imperial, metric, 'lb');
  await imperial.click();
  await expectUnits(metric, imperial, 'kg');
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

test('share puts the scenario in a fragment and the shared scenario loads', async ({ page }) => {
  await page.goto('/');
  await page.locator('#stein-count').fill('7');
  await page.getByRole('button', { name: /copy link/i }).click();

  await expect.poll(() => new URL(page.url()).hash).toContain('#scenario=count=7');
  await expect(page).toHaveURL(/^[^?]+#/);

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

test('URL scenario takes precedence over remembered data and updates the remembered scenario', async ({ page }) => {
  await page.goto('/');
  await page.locator('#remember-inputs').check();
  await page.locator('#stein-count').fill('9');
  await page.locator('#fill').fill('82');

  await page.goto('/?count=5');
  await expect(page.locator('#stein-count')).toHaveValue('5');
  await expect(page.locator('#fill')).toHaveValue('90');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).count)).toBe(5);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).fill)).toBe(90);

  await page.goto('/');
  await expect(page.locator('#stein-count')).toHaveValue('5');
  await expect(page.locator('#fill')).toHaveValue('90');
});

test('invalid remembered JSON falls back to defaults without breaking the calculator', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('carry-calc-remember', 'true');
    localStorage.setItem('carry-calc', '{not valid json');
  });

  await page.reload();
  await expect(page.locator('#remember-inputs')).toBeChecked();
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#total')).toHaveText('26.7');

  await page.locator('#stein-count').fill('8');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('carry-calc')).count)).toBe(8);
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

  await expect.poll(() => new URLSearchParams(new URL(page.url()).hash.slice('#scenario='.length)).get('volume')).toBe('1.23456789');
  await expect.poll(() => new URLSearchParams(new URL(page.url()).hash.slice('#scenario='.length)).get('density')).toBe('1.01234567');
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

test('primary stein controls pair a vertical counter with a matching-height fill stein', async ({ page }) => {
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
    const rect = (selector) => {
      const { left, right, top, bottom, width, height } = document.querySelector(selector).getBoundingClientRect();
      return [left, right, top, bottom, width, height].map((value) => Math.round(value * 100) / 100);
    };
    const many = (selector) => [...document.querySelectorAll(selector)].map((element) => {
      const { left, right, top, bottom, width, height } = element.getBoundingClientRect();
      return [left, right, top, bottom, width, height].map((value) => Math.round(value * 100) / 100);
    });
    return {
      counter: rect('.vertical-stepper'),
      count: rect('#stein-count'),
      fillStein: rect('.fill-slider'),
      stepButtons: many('.vertical-stepper .step-button'),
      fineTuneControls: many('.advanced-fields > .input-with-unit'),
      fineTuneValues: many('.advanced-fields input'),
      fineTuneUnits: many('.advanced-fields .input-with-unit span'),
      fineTunePlusButtons: many('.advanced-fields .input-with-unit > .step-button:last-child'),
      suffixesFit: [...document.querySelectorAll('.input-with-unit span')].every((element) => element.scrollWidth <= element.clientWidth),
      pageFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    };
  });
  const expectLayout = (layout) => {
    expect(layout.counter[5]).toBe(layout.fillStein[5]);
    expect(layout.counter[2]).toBe(layout.fillStein[2]);
    expect(layout.counter[3]).toBe(layout.fillStein[3]);
    expect(layout.counter[0]).toBeLessThan(layout.fillStein[0]);
    expect(layout.count[2]).toBeGreaterThan(layout.stepButtons[0][3]);
    expect(layout.count[3]).toBeLessThan(layout.stepButtons[1][2]);
    expect(Math.abs(layout.stepButtons[0][2] - layout.counter[2])).toBeLessThanOrEqual(1);
    expect(Math.abs(layout.stepButtons[1][3] - layout.counter[3])).toBeLessThanOrEqual(1);
    expect(layout.fineTuneControls).toHaveLength(5);
    layout.fineTuneControls.forEach((control, index) => {
      expect(control[0]).toBe(layout.fineTuneControls[0][0]);
      expect(control[1]).toBe(layout.fineTuneControls[0][1]);
      expect(layout.fineTuneValues[index][0]).toBe(layout.fineTuneValues[0][0]);
      expect(layout.fineTuneUnits[index][0]).toBe(layout.fineTuneUnits[0][0]);
      expect(Math.abs(layout.fineTunePlusButtons[index][1] - control[1])).toBeLessThanOrEqual(1);
      expect(Math.abs(layout.fineTuneUnits[index][0] - (control[0] + control[1]) / 2)).toBeLessThanOrEqual(1);
    });
    expect(layout.suffixesFit).toBe(true);
    expect(layout.pageFits).toBe(true);
  };

  for (const width of [1280, 900, 650, 380, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const metricLayout = await measure();
    expectLayout(metricLayout);

    await page.getByRole('button', { name: 'IMPERIAL' }).click();
    const imperialLayout = await measure();
    expectLayout(imperialLayout);
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
