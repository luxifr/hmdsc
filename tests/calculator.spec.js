import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function parseSourceDocument(fileName) {
  const markdown = readFileSync(new URL(`../docs/${fileName}`, import.meta.url), 'utf8');
  const title = markdown.match(/^# (.+)$/m)?.[1];
  if (!title) throw new Error(`Expected a title in docs/${fileName}`);

  const body = markdown
    .replace(/^# [^\r\n]*\r?\n/, '')
    .replace(/^```[^\r\n]*\r?\n|^```\s*$/gm, '')
    .replace(/^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\((?:[^()]|\([^()]*\))*\)/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\|(.+)\|\s*$/gm, (_, row) => row.replace(/\|/g, ' '));

  return { title, body: normalizeText(body) };
}

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
  await page.getByRole('button', { name: /share your scenario/i }).click();
  await page.getByRole('button', { name: /share your scenario/i }).click();
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
  const expectedReferrer = new URL('/referrer-source?campaign=beer', page.url()).href;
  await expect.poll(() => page.evaluate(() => window.goatcounter.referrer())).toBe(expectedReferrer);
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

  let positions;
  for (const width of [320, 390, 650]) {
    await page.setViewportSize({ width, height: 844 });
    positions = await layout();
    expect(positions.primary.bottom).toBeLessThan(positions.result.top);
    expect(positions.result.bottom).toBeLessThan(positions.secondary.top);
    expect(positions.mobileOrder).toBeTruthy();
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  positions = await layout();
  expect(positions.primary.left).toBe(positions.secondary.left);
  expect(positions.primary.left).toBeLessThan(positions.result.left);
  expect(positions.result.top).toBeLessThan(positions.secondary.top);
});

test('desktop fine-tune spacing does not resize the result card', async ({ page }) => {
  await page.goto('/');

  const bounds = async () => page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      const { left, top, right, bottom, width, height } = element.getBoundingClientRect();
      return { left, top: top + window.scrollY, right, bottom: bottom + window.scrollY, width, height };
    };
    return {
      primary: rect('.primary-controls'),
      result: rect('.result-card'),
      secondary: rect('.secondary-controls'),
    };
  });

  for (const width of [651, 900, 1280]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const unit of ['METRIC', 'IMPERIAL']) {
      await page.getByRole('button', { name: unit }).click();
      const closed = await bounds();
      expect(closed.primary.left).toBe(closed.secondary.left);
      expect(closed.primary.left).toBeLessThan(closed.result.left);
      expect(closed.secondary.top - closed.primary.bottom).toBeLessThanOrEqual(24);

      await page.locator('.advanced summary').click();
      const open = await bounds();
      expect(open.secondary.top - open.primary.bottom).toBeLessThanOrEqual(24);
      expect(open.result).toEqual(closed.result);
      await page.locator('.advanced summary').click();
    }
  }
});

test('scenario sharing sits in the top-right of the result card, above the stein visual', async ({ page }) => {
  await page.goto('/');
  const share = page.getByRole('button', { name: /share your scenario/i });
  await expect(share).toBeVisible();
  await expect(page.locator('.result-card #reset')).toHaveCount(0);
  expect(await share.evaluate((button) => button.parentElement.classList.contains('result-top'))).toBe(true);
  expect(await share.evaluate((button) => Math.abs(button.getBoundingClientRect().right - button.parentElement.getBoundingClientRect().right))).toBeLessThanOrEqual(1);
  expect(await page.locator('.result-card .result-details').evaluate((details) => details.lastElementChild.id)).toBe('visualizer');
  for (const width of [430, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
  await share.click();
  await expect(page).toHaveURL(/#scenario=count=12/);
});

test('result breakdown is left-aligned without dividers and biomechanics labels stay full', async ({ page }) => {
  await page.goto('/');

  for (const width of [1280, 900, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const tops = (selector) => [...document.querySelectorAll(selector)].map((element) => element.getBoundingClientRect().top);
      const result = document.querySelector('.biomechanics-result');
      return {
        breakdownRows: tops('.breakdown-item'),
        breakdownValues: tops('.breakdown-item strong'),
        biomechanicsItems: tops('.biomechanics-result > *'),
        totalBottom: document.querySelector('.total-line').getBoundingClientRect().bottom,
        breakdownTop: document.querySelector('.breakdown').getBoundingClientRect().top,
        detailGaps: (() => { const items = [...document.querySelector('.result-details').children]; return items.slice(1).map((item, index) => Math.round(item.getBoundingClientRect().top - items[index].getBoundingClientRect().bottom)); })(),
        illustrationBottomGap: Math.round(document.querySelector('.result-card').getBoundingClientRect().bottom - document.querySelector('.visualizer').getBoundingClientRect().bottom),
        documentWidth: document.documentElement.scrollWidth,
        resultBorder: getComputedStyle(result).borderTopStyle,
        breakdownBorders: [...document.querySelectorAll('.breakdown-item')].map((element) => getComputedStyle(element).borderLeftStyle),
        breakdownAligned: [...document.querySelectorAll('.breakdown-item')].every((element) => getComputedStyle(element).justifyContent !== 'flex-end'),
        firstLabelStyle: (() => { const style = getComputedStyle(document.querySelector('#result-biomechanics-hand')); return [style.fontFamily, style.fontSize, style.fontWeight, style.letterSpacing, style.textTransform]; })(),
        momentLabelStyle: (() => { const style = getComputedStyle(document.querySelector('.biomechanics-result [aria-label="Elbow joint moment"]')); return [style.fontFamily, style.fontSize, style.fontWeight, style.letterSpacing, style.textTransform]; })(),
      };
    });
    expect(Math.max(...layout.breakdownRows) - Math.min(...layout.breakdownRows)).toBeLessThanOrEqual(1);
    expect(Math.max(...layout.breakdownValues) - Math.min(...layout.breakdownValues)).toBeLessThanOrEqual(1);
    if (width === 1280) expect(Math.max(...layout.biomechanicsItems) - Math.min(...layout.biomechanicsItems)).toBeLessThanOrEqual(3);
    expect(layout.breakdownTop).toBeGreaterThanOrEqual(layout.totalBottom);
    expect(layout.documentWidth).toBe(width);
    expect(layout.resultBorder).toBe('none');
    expect(layout.breakdownBorders).toEqual(['none', 'none']);
    expect(layout.breakdownAligned).toBe(true);
    expect(layout.detailGaps).toEqual([8, 8, 8]);
    expect(layout.illustrationBottomGap).toBe(8);
    expect(layout.momentLabelStyle).toEqual(layout.firstLabelStyle);
  }
  await expect(page.locator('.result-divider')).toHaveCount(0);
  await expect(page.locator('#result-biomechanics-hand')).toContainText('Heavier hand');
  await expect(page.locator('.biomechanics-result')).toContainText('Elbow');
  await expect(page.locator('.biomechanics-result')).toContainText('Shoulder');
  await expect(page.locator('.biomechanics-result')).toContainText('Shoulder swing ±25°');
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
  await expect(page.locator('#fill-output')).toHaveValue('90');
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
  await expect(page.locator('#per-stein-icon svg use[href="#stein-body-shape"]')).toHaveAttribute('fill', '#B77932');
  await expect(page.locator('#per-stein-icon svg use[href="#stein-body-shape"]')).toHaveAttribute('stroke', '#E4C781');
  await expect(page.locator('#per-stein-icon svg rect[fill="#E0A743"]')).toHaveCount(1);
  await expect(page.locator('#per-stein-icon svg use[href="#stein-foam-cap-shape"]')).toHaveCount(1);
  const heights = await page.evaluate(() => ({
    stein: document.querySelector('#per-stein-icon svg').getBoundingClientRect().height,
    text: document.querySelector('.per-stein-display>div').getBoundingClientRect().height,
  }));
  expect(Math.abs(heights.stein - heights.text)).toBeLessThanOrEqual(1);
  await expect(page.locator('#per-stein-uncertainty')).toHaveText('±0.05 kg');
  await expect(page.locator('#secondary-total')).toHaveText("That's 59.0 ±1.4 lb on the other side of the pond");
  await expect(page.locator('#range')).toHaveCount(0);
  await expect(page.locator('.rationale-list a')).toHaveCount(7);
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

test('fill and visualization steins reuse shared SVG shapes without duplicate ids', async ({ page }) => {
  await page.goto('/');

  const referencesResolve = await page.evaluate(() => {
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    const hrefs = [...document.querySelectorAll('use[href]')].map((element) => element.getAttribute('href'));
    return new Set(ids).size === ids.length && hrefs.every((href) => document.getElementById(href.slice(1)));
  });
  expect(referencesResolve).toBe(true);
  await expect(page.locator('.fill-stein use[href="#stein-handle-shape"]')).toHaveCount(1);
  await expect(page.locator('.fill-stein use[href="#stein-body-shape"]')).toHaveCount(2);
  await expect(page.locator('.mini-stein').first()).toHaveAttribute('viewBox', '0 0 80 110');
  await expect(page.locator('#visualizer .mini-stein use[href="#stein-handle-shape"]')).toHaveCount(12);
  await expect(page.locator('#visualizer .mini-stein use[href="#stein-body-shape"]')).toHaveCount(12);
});

test('biomechanics estimates update with uneven hand counts, units, and the existing count limit', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#biomechanics');
  await expect(page.locator('.method-section .eyebrow')).toContainText('03');
  await expect(section).toHaveRole('region');
  await expect(section).toHaveAttribute('aria-labelledby', 'biomechanics-label');
  await expect(section.locator('.eq-number')).toHaveText('04');
  await expect(section.locator('.eq-title')).toHaveText('Joint moments');
  await expect(section.locator('p')).toContainText('in the heavier hand');
  await expect(section.locator('p')).toContainText('forearm held level');
  await expect(section.locator('.biomechanics-values')).toContainText('Elbow');
  await expect(section.locator('.biomechanics-values')).toContainText('Shoulder ±25°');
  await expect(section.locator('.biomechanics-values')).not.toContainText('N·m N·m');
  await expect(section).toHaveCSS('border-bottom-width', '0px');
  await expect(section.locator('.eyebrow')).toHaveCount(0);
  await expect(section.locator('.biomechanics-note')).toHaveCount(0);
  await expect(section.getByRole('link', { name: /Full methods, assumptions, sources, and limitations/ })).toHaveCount(0);
  await expect(section.locator('#biomechanics-heavy-count')).toHaveText('6 steins');
  await expect(section.locator('#biomechanics-heavy-load')).toContainText('kg');
  await expect(section.locator('#biomechanics-light-count, #biomechanics-grip')).toHaveCount(0);
  await expect(page.locator('#result-biomechanics-hand')).toHaveText('Heavier hand · 6 steins');
  await page.locator('#stein-count').fill('13');
  await expect(section.locator('#biomechanics-heavy-count')).toHaveText('7 steins');
  await expect(page.locator('#result-biomechanics-hand')).toHaveText('Heavier hand · 7 steins');
  const elbowMoment = await section.locator('#biomechanics-elbow').textContent();
  const shoulderAtThirteen = await section.locator('#biomechanics-shoulder-swing').textContent();
  await page.getByRole('button', { name: 'IMPERIAL' }).click();
  await expect(section.locator('#biomechanics-heavy-load')).toContainText('lb');
  await expect(section.locator('#biomechanics-elbow')).toHaveText(elbowMoment);
  await expect(section.locator('#biomechanics-shoulder-swing')).toHaveText(shoulderAtThirteen);

  await page.locator('#stein-count').fill('40');
  await expect(section.locator('#biomechanics-heavy-count')).toHaveText('20 steins');
  await expect(section.locator('#biomechanics-elbow')).not.toHaveText(elbowMoment);

  await page.goto('/?count=1');
  await expect(page.locator('#biomechanics-heavy-count')).toHaveText('1 stein');
});

test('hero stein has beer and foam bubbles matching the fill control', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero-beer-bubbles circle')).toHaveCount(12);
  await expect(page.locator('.hero-foam-bubbles circle')).toHaveCount(9);
  await expect(page.locator('.hero-stein circle[fill="#8B332B"]')).toHaveCount(0);
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
  await expect(page.locator('.hero-beer-bubbles circle').first()).toHaveCSS('animation-iteration-count', 'infinite');
  await expect(page.locator('.hero-beer-bubbles circle').first()).toHaveCSS('animation-duration', '2.4s');
  await expect(page.locator('.hero-foam-bubbles circle').first()).toHaveCSS('animation-duration', '1.8s');
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
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const fill = page.locator('#fill');
  const beer = page.locator('#fill-beer');
  const foam = page.locator('#fill-foam');
  const foamCap = page.locator('#fill-foam-cap');
  const capBubbles = page.locator('#fill-foam-cap-bubbles circle');
  const beerBubbles = page.locator('#fill-beer-bubbles circle');
  const glass = page.locator('.fill-stein > use[href="#stein-body-shape"]').first();

  await expect(fill).toHaveAttribute('aria-describedby', 'fill-output');
  await expect(page.locator('.fill-stein > use[href="#stein-handle-shape"]')).toHaveAttribute('stroke', '#D8C69F');
  await expect(page.locator('.fill-stein > use[href="#stein-body-shape"]').first()).toHaveAttribute('fill', '#B77932');
  await expect(page.locator('.fill-stein > use[href="#stein-body-shape"]').first()).toHaveAttribute('stroke', '#E4C781');
  await expect(page.locator('#stein-glass-clip use')).toHaveAttribute('href', '#stein-glass-interior');
  await expect(page.locator('#stein-glass-interior')).toHaveAttribute('d', 'M15 22h45l-6 77H21Z');
  await expect(beer).toHaveAttribute('x', '15');
  await expect(beer).toHaveAttribute('width', '45');
  await expect(foam).toHaveAttribute('x', '15');
  await expect(foam).toHaveAttribute('y', '22');
  await expect(foam).toHaveAttribute('width', '45');
  await expect(page.locator('.fill-stein use[stroke="#FFF9ED"][stroke-width="2.4"]')).toHaveCount(0);
  await expect(foamCap).toHaveAttribute('transform', 'translate(1 0)');
  await expect(page.locator('#fill-foam-cap-bubbles')).toHaveAttribute('transform', 'translate(1 0)');
  await expect(beerBubbles.first()).toHaveCSS('animation-name', 'fill-bubble-rise');
  await expect(beerBubbles.first()).toHaveCSS('r', '1.15px');
  await expect(page.locator('.fill-stein path[stroke="#8F592A"]')).toHaveCount(1);
  await expect(page.locator('.fill-stein path[stroke="#F6D77F"]')).toHaveCount(1);
  await expect(fill).toHaveCSS('opacity', '0');
  await expect(page.locator('.fill-handle')).toHaveCount(0);
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(34.6);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(12.6);
  expect(Number(await foam.getAttribute('y')) + Number(await foam.getAttribute('height'))).toBeCloseTo(Number(await beer.getAttribute('y')));
  await expect(capBubbles).toHaveCount(9);
  await expect(capBubbles.first()).toHaveCSS('animation-name', 'fill-foam-bubble');
  await expect(capBubbles.first()).toHaveCSS('animation-play-state', 'running');
  await expect(capBubbles.first()).toHaveCSS('r', '1.5px');
  const initialBubbleTime = await capBubbles.first().evaluate((element) => element.getAnimations()[0].currentTime);
  await page.waitForTimeout(120);
  expect(await capBubbles.first().evaluate((element) => element.getAnimations()[0].currentTime)).toBeGreaterThan(initialBubbleTime);
  await expect(beerBubbles).toHaveCount(18);
  await expect(page.locator('#fill-foam-cap')).toHaveAttribute('fill', '#F0E9D9');
  const capAndRim = await page.evaluate(() => {
    const box = (selector) => {
      const { y, height } = document.querySelector(selector).getBBox();
      return { top: y, bottom: y + height };
    };
    return { cap: box('#fill-foam-cap'), rim: box('.fill-stein > use[href="#stein-body-shape"]:last-child') };
  });
  expect(capAndRim.cap.bottom).toBe(capAndRim.rim.top);
  const overflowBounds = await foamCap.boundingBox();
  const glassBounds = await glass.boundingBox();
  expect(overflowBounds.y).toBeLessThan(glassBounds.y);

  await fill.fill('85');
  await expect(page.locator('#fill-output')).toHaveValue('85');
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(37.9);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(15.9);
  expect(Number(await foam.getAttribute('y')) + Number(await foam.getAttribute('height'))).toBeCloseTo(Number(await beer.getAttribute('y')));

  await fill.scrollIntoViewIfNeeded();
  const bounds = await fill.boundingBox();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 4);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 4, { steps: 10 });
  await page.mouse.up();
  await expect(fill).toHaveValue('70');
  await expect(page.locator('#fill-output')).toHaveValue('70');
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(47.8);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(25.8);
  expect(Number(await foam.getAttribute('y')) + Number(await foam.getAttribute('height'))).toBeCloseTo(Number(await beer.getAttribute('y')));

  await fill.focus();
  await fill.press('ArrowUp');
  await expect(fill).toHaveValue('71');
});

test('editable fill percentage stays synchronized with the slider and stein', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const percentage = page.getByLabel('Fill level percentage');
  const slider = page.getByRole('slider', { name: 'Fill level' });
  const beer = page.locator('#fill-beer');
  const foam = page.locator('#fill-foam');

  await percentage.fill('85');
  await expect(slider).toHaveValue('85');
  await expect(page.locator('#fill-output')).toHaveValue('85');
  expect(Number(await beer.getAttribute('y'))).toBeCloseTo(37.9);
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(15.9);
  expect(Number(await foam.getAttribute('y')) + Number(await foam.getAttribute('height'))).toBeCloseTo(Number(await beer.getAttribute('y')));

  await slider.fill('76');
  await expect(percentage).toHaveValue('76');
  expect(Number(await page.locator('#fill-beer').getAttribute('y'))).toBeCloseTo(43.84);

  await percentage.fill('105');
  await percentage.press('Tab');
  await expect(percentage).toHaveValue('100');
  await expect(slider).toHaveValue('100');
  await expect(page.locator('#fill-beer')).toHaveAttribute('height', '66');
  expect(Number(await foam.getAttribute('height'))).toBeCloseTo(6);
  expect(Number(await foam.getAttribute('y')) + Number(await foam.getAttribute('height'))).toBeCloseTo(Number(await beer.getAttribute('y')));
});

test('unit selector is rectangular and sits beside the primary inputs in a vertical stack', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.unit-switch')).toHaveCSS('border-radius', '0px');
  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const { left, right, top, bottom, width, height } = document.querySelector(selector).getBoundingClientRect();
      return { left, right, top, bottom, width, height };
    };
    return {
      inputs: rect('.fill-slider'),
      primary: rect('.primary-controls'),
      selector: rect('.unit-switch'),
      metric: rect('.unit-switch button[data-unit="metric"]'),
      imperial: rect('.unit-switch button[data-unit="imperial"]'),
    };
  });
  expect(layout.selector.left).toBeGreaterThan(layout.inputs.right);
  expect(layout.selector.top).toBe(layout.inputs.top);
  expect(layout.selector.bottom).toBe(layout.inputs.bottom);
  expect(layout.selector.height).toBe(layout.inputs.height);
  expect(layout.selector.height).toBe(104);
  expect(layout.metric.bottom).toBeLessThanOrEqual(layout.imperial.top);
  expect(Math.abs(layout.metric.left + layout.metric.width / 2 - (layout.selector.left + layout.selector.width / 2))).toBeLessThanOrEqual(1);
  expect(Math.abs(layout.imperial.left + layout.imperial.width / 2 - (layout.selector.left + layout.selector.width / 2))).toBeLessThanOrEqual(1);

  for (const width of [430, 390, 375, 360, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const mobile = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('.count-control, .fill-setting')].map((element) => element.getBoundingClientRect());
      const stein = document.querySelector('.fill-slider').getBoundingClientRect();
      const primary = document.querySelector('.primary-controls').getBoundingClientRect();
      const selector = document.querySelector('.unit-switch').getBoundingClientRect();
      return { inputRight: Math.max(...inputs.map((rect) => rect.right)), selectorLeft: selector.left, selectorRight: selector.right, selectorHeight: selector.height, steinHeight: stein.height, primaryTop: primary.top, primaryBottom: primary.bottom, primaryRight: primary.right, selectorTop: selector.top, selectorBottom: selector.bottom };
    });
    expect(mobile.selectorLeft).toBeGreaterThan(mobile.inputRight);
    expect(mobile.selectorRight).toBeLessThanOrEqual(mobile.primaryRight);
    expect(mobile.selectorHeight).toBe(mobile.steinHeight);
    expect(mobile.selectorTop).toBeGreaterThanOrEqual(mobile.primaryTop);
    expect(mobile.selectorBottom).toBeLessThanOrEqual(mobile.primaryBottom);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
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

test('fine-tune assumptions have no surrounding horizontal dividers', async ({ page }) => {
  await page.goto('/');
  const borderWidths = await page.evaluate(() => [
    getComputedStyle(document.querySelector('.primary-controls')).borderBottomWidth,
    getComputedStyle(document.querySelector('.advanced')).borderBottomWidth,
  ]);
  expect(borderWidths).toEqual(['0px', '0px']);
});

test('reset restores defaults and clears the scenario URL inside fine-tune assumptions', async ({ page }) => {
  await page.goto('/?count=8');
  await expect(page.locator('#stein-count')).toHaveValue('8');
  const reset = page.getByRole('button', { name: /reset defaults/i });
  await expect(reset).toBeHidden();
  await page.getByText('Fine-tune the assumptions').click();
  await expect(reset).toBeVisible();
  await reset.click();
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#total')).toHaveText('26.7');
  await expect(page).toHaveURL(/\/$/);
});

test('share puts the scenario in a fragment and the shared scenario loads', async ({ page }) => {
  await page.goto('/');
  await page.locator('#stein-count').fill('7');
  await page.getByRole('button', { name: /share your scenario/i }).click();

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

test('scenario edits are not saved between page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#remember-inputs')).toHaveCount(0);
  await page.locator('#stein-count').fill('9');
  await page.locator('#fill').fill('82');
  await expect(page.locator('#stein-count')).toHaveValue('9');
  await expect(page.locator('#fill')).toHaveValue('82');

  await page.reload();
  await expect(page.locator('#stein-count')).toHaveValue('12');
  await expect(page.locator('#fill')).toHaveValue('90');
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
});

test('share links preserve full calculation precision', async ({ page }) => {
  await page.goto('/?volume=1.23456789&density=1.01234567');
  await page.getByRole('button', { name: /share your scenario/i }).click();

  await expect.poll(() => new URLSearchParams(new URL(page.url()).hash.slice('#scenario='.length)).get('volume')).toBe('1.23456789');
  await expect.poll(() => new URLSearchParams(new URL(page.url()).hash.slice('#scenario='.length)).get('density')).toBe('1.01234567');
});

test('input displays cap decimals while share links retain scenario precision', async ({ page }) => {
  await page.goto('/?density=1.01234567');
  await page.getByText('Fine-tune the assumptions').click();
  const density = page.locator('#density');

  await density.fill('1000.123456');
  await density.press('Tab');
  await expect(density).toHaveValue('1000.123');
  await page.getByRole('button', { name: /share your scenario/i }).click();
  await expect.poll(() => new URLSearchParams(new URL(page.url()).hash.slice('#scenario='.length)).get('density')).toBe('1.000123456');
});

test('decorative animations run when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const animation = page.locator('.hero-stein');
  await expect.poll(() => animation.evaluate((element) => element.getAnimations()[0]?.playState)).toBe('running');
  const initialTime = await animation.evaluate((element) => element.getAnimations()[0].currentTime);
  await page.waitForTimeout(120);
  const currentTime = await animation.evaluate((element) => element.getAnimations()[0].currentTime);
  expect(currentTime).toBeGreaterThan(initialTime);
  await expect(animation).toHaveCSS('animation-duration', '5s');
});

test('primary inputs are simplified, enlarged, and fill buttons adjust the hidden slider value', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.count-control label, .fill-setting label, .range-labels')).toHaveCount(0);
  await expect(page.getByLabel('Number of steins')).toHaveValue('12');
  await expect(page.locator('.count-value-row span')).toHaveText('×');
  await expect(page.getByLabel('Fill level percentage')).toHaveValue('90');
  await expect(page.getByRole('slider', { name: 'Fill level' })).toHaveValue('90');
  expect(await page.locator('#stein-count').evaluate((input) => getComputedStyle(input).fontSize)).toBe(await page.locator('#fill-output').evaluate((output) => getComputedStyle(output).fontSize));
  expect(await page.locator('#stein-count').evaluate((input) => getComputedStyle(input).color)).toBe(await page.locator('#fill-output').evaluate((output) => getComputedStyle(output).color));
  expect(await page.locator('#stein-count').evaluate((input) => getComputedStyle(input).textAlign)).toBe('center');
  expect(await page.locator('#fill-output').evaluate((input) => getComputedStyle(input).textAlign)).toBe('center');
  await expect(page.getByRole('button', { name: 'Increase fill level' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Decrease fill level' })).toBeVisible();
  await page.getByLabel('Fill level percentage').focus();
  expect(await page.locator('#fill-output').evaluate((input) => getComputedStyle(input).borderWidth)).toBe('0px');
  expect(await page.locator('#fill-output').evaluate((input) => getComputedStyle(input).outlineStyle)).toBe('none');
  expect(await page.locator('#fill-output').evaluate((input) => getComputedStyle(input).boxShadow)).toBe('none');
  expect(await page.locator('#fill-output').evaluate((input) => getComputedStyle(input).appearance)).toBe('textfield');
  const fillControls = await page.evaluate(() => {
    const rect = (selector) => {
      const { left, top, bottom } = document.querySelector(selector).getBoundingClientRect();
      return { left, top, bottom };
    };
    return {
      stein: rect('.fill-slider'),
      plus: rect('.fill-control .fill-step-button:first-child'),
      value: rect('.fill-value-row'),
      minus: rect('.fill-control .fill-step-button:last-child'),
      valueWidth: document.querySelector('.fill-value-row').getBoundingClientRect().width,
      plusWidth: document.querySelector('.fill-control .fill-step-button:first-child').getBoundingClientRect().width,
      minusWidth: document.querySelector('.fill-control .fill-step-button:last-child').getBoundingClientRect().width,
      inputWidth: document.querySelector('#fill-output').getBoundingClientRect().width,
    };
  });
  expect(fillControls.plus.left).toBeGreaterThanOrEqual(fillControls.stein.left + 68);
  expect(fillControls.plusWidth).toBe(fillControls.valueWidth);
  expect(fillControls.minusWidth).toBe(fillControls.valueWidth);
  expect(fillControls.plus.bottom).toBeLessThanOrEqual(fillControls.value.top);
  expect(fillControls.value.bottom).toBeLessThanOrEqual(fillControls.minus.top);
  await page.getByRole('button', { name: 'Increase fill level' }).click();
  await expect(page.locator('#fill')).toHaveValue('91');
  await expect(page.locator('#fill-output')).toHaveValue('91');
  expect(await page.locator('.fill-value-row').evaluate((row) => row.getBoundingClientRect().width)).toBe(fillControls.valueWidth);
  await expect(page.locator('#beer-total')).not.toHaveText('—');
  await page.getByRole('button', { name: 'Decrease fill level' }).click();
  await expect(page.locator('#fill')).toHaveValue('90');
  await page.goto('/?fill=99');
  const widthBelow100 = await page.locator('.fill-value-row').evaluate((row) => row.getBoundingClientRect().width);
  await page.getByRole('button', { name: 'Increase fill level' }).click();
  await expect(page.locator('#fill-output')).toHaveValue('100');
  expect(await page.locator('.fill-value-row').evaluate((row) => row.getBoundingClientRect().width)).toBe(widthBelow100);
  await page.goto('/?fill=100');
  await page.getByRole('button', { name: 'Increase fill level' }).click();
  await expect(page.locator('#fill')).toHaveValue('100');
  await page.goto('/?fill=70');
  await page.getByRole('button', { name: 'Decrease fill level' }).click();
  await expect(page.locator('#fill')).toHaveValue('70');
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.locator('#stein-count').evaluate((input) => getComputedStyle(input).fontSize)).toBe('24px');
  expect(await page.locator('#fill-output').evaluate((output) => getComputedStyle(output).fontSize)).toBe('24px');
  expect(await page.locator('.vertical-stepper').evaluate((stepper) => getComputedStyle(stepper).borderTopWidth)).toBe('0px');
  expect(await page.locator('.form-actions .text-button').evaluate((button) => getComputedStyle(button).textAlign)).toBe('left');
});

test('unit suffixes sit about one character from two-digit values', async ({ page }) => {
  await page.goto('/?count=12&fill=90');
  const suffixGaps = async () => page.evaluate(() => ['#stein-count', '#fill-output'].map((selector) => {
    const input = document.querySelector(selector);
    const suffix = input.parentElement.querySelector('span');
    const inputRect = input.getBoundingClientRect();
    const suffixRect = suffix.getBoundingClientRect();
    const style = getComputedStyle(input);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const characterWidth = context.measureText('0').width;
    return {
      gap: suffixRect.left - (inputRect.left + inputRect.width / 2 + input.value.length * characterWidth / 2),
      characterWidth,
    };
  }));
  for (const width of [430, 390, 375, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const { gap, characterWidth } of await suffixGaps()) {
      expect(gap).toBeGreaterThan(characterWidth * 0.85);
      expect(gap).toBeLessThan(characterWidth * 1.15);
    }
    await page.locator('#fill-output').fill('100');
    const [{ gap, characterWidth }] = (await suffixGaps()).slice(1);
    expect(gap).toBeGreaterThan(-characterWidth * 0.6);
    await expect(page.locator('#fill')).toHaveValue('100');
    await expect(page.locator('#fill-output')).toHaveValue('100');
    await page.locator('#fill-output').fill('90');
  }
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
    const countValue = document.querySelector('.count-value-row').getBoundingClientRect();
    const countButtonCenterOffset = Math.max(...[...document.querySelectorAll('.vertical-stepper .step-button')].map((button) => {
      const rect = button.getBoundingClientRect();
      return Math.abs(rect.left + rect.width / 2 - (countValue.left + countValue.width / 2));
    }));
    return {
      counter: rect('.vertical-stepper'),
      countValue: rect('.count-value-row'),
      count: rect('#stein-count'),
      countPlus: rect('.vertical-stepper .step-button:first-child'),
      countMinus: rect('.vertical-stepper .step-button:last-child'),
      fillStein: rect('.fill-slider'),
      countButtonCenterOffset,
      fillControlsGap: parseFloat(getComputedStyle(document.querySelector('.fill-control')).columnGap),
      fillPlus: rect('.fill-control .fill-step-button:first-child'),
      fillValue: rect('.fill-value-row'),
      fillInput: rect('#fill-output'),
      fillMinus: rect('.fill-control .fill-step-button:last-child'),
      fillValues: [...document.querySelectorAll('.fill-value-row')].map((element) => {
        const { width } = element.getBoundingClientRect();
        return width;
      }),
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
    expect(layout.fillStein[0] - layout.counter[1]).toBe(layout.fillControlsGap);
    expect(Math.abs(layout.countValue[0] + layout.countValue[4] / 2 - (layout.counter[0] + layout.counter[4] / 2))).toBeLessThanOrEqual(0.02);
    expect(layout.count[2]).toBeGreaterThanOrEqual(layout.stepButtons[0][3]);
    expect(layout.count[3]).toBeLessThanOrEqual(layout.stepButtons[1][2]);
    expect(layout.count[4]).toBe(60);
    expect(layout.countValue[4]).toBe(60);
    expect(layout.countValue[5]).toBe(34);
    expect(layout.fillValue[4]).toBe(60);
    expect(layout.fillValue[5]).toBe(34);
    expect(layout.fillInput[4]).toBe(layout.fillValue[4]);
    expect(layout.fillPlus[4]).toBe(layout.fillValue[4]);
    expect(layout.fillMinus[4]).toBe(layout.fillValue[4]);
    expect(layout.countPlus[4]).toBe(layout.countValue[4]);
    expect(layout.countMinus[4]).toBe(layout.countValue[4]);
    expect(layout.count[4]).toBe(layout.countValue[4]);
    expect(layout.countButtonCenterOffset).toBeLessThanOrEqual(0.02);
    expect(layout.fillStein[0] - layout.counter[1]).toBe(layout.fillControlsGap);
    expect(layout.count[5]).toBe(34);
    expect(Math.abs(layout.countValue[0] + layout.countValue[4] / 2 - (layout.countPlus[0] + layout.countPlus[4] / 2))).toBeLessThanOrEqual(0.02);
    expect(Math.abs(layout.countValue[0] + layout.countValue[4] / 2 - (layout.countMinus[0] + layout.countMinus[4] / 2))).toBeLessThanOrEqual(0.02);
    expect(Math.abs(layout.countValue[2] + layout.countValue[5] / 2 - (layout.counter[2] + layout.counter[5] / 2))).toBeLessThanOrEqual(0.02);
    expect(Math.abs(layout.countValue[2] + layout.countValue[5] / 2 - (layout.countPlus[2] + layout.countPlus[5] / 2 + layout.countMinus[2] + layout.countMinus[5] / 2) / 2)).toBeLessThanOrEqual(0.02);
    expect(Math.abs(layout.fillPlus[0] + layout.fillPlus[4] / 2 - (layout.fillValue[0] + layout.fillValue[4] / 2))).toBeLessThanOrEqual(0.02);
    expect(Math.abs(layout.fillMinus[0] + layout.fillMinus[4] / 2 - (layout.fillValue[0] + layout.fillValue[4] / 2))).toBeLessThanOrEqual(0.02);
    expect(Math.abs(layout.fillValue[2] + layout.fillValue[5] / 2 - (layout.fillPlus[2] + layout.fillPlus[5] / 2 + layout.fillMinus[2] + layout.fillMinus[5] / 2) / 2)).toBeLessThanOrEqual(0.02);
    expect(layout.stepButtons[0][5]).toBe(32);
    expect(layout.stepButtons[1][5]).toBe(32);
    expect(Math.abs(layout.stepButtons[0][2] - layout.counter[2])).toBeLessThanOrEqual(2);
    expect(Math.abs(layout.stepButtons[1][3] - layout.counter[3])).toBeLessThanOrEqual(2);
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

  for (const width of [1280, 900, 650, 430, 414, 390, 375, 360, 320]) {
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

test('sources and model rationale section opens complete source documents', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('#sources');
  await expect(section).toHaveCount(1);
  await expect(section.locator('.eyebrow')).toContainText('04');
  await expect(section.getByRole('heading', { level: 2 })).toHaveText(/How the estimate\s*comes together\./);
  await expect(section.locator('.source-card')).toHaveCount(3);
  const biomechanicsExplainer = section.locator('.biomechanics-explainer');
  await expect(biomechanicsExplainer.getByRole('heading', { name: /The biomechanics estimate/ })).toBeVisible();
  await expect(biomechanicsExplainer).toContainText('elbow moment stays constant');
  await expect(biomechanicsExplainer).toContainText('centered over the grip');
  await expect(biomechanicsExplainer).not.toContainText('safety assessment');
  const biomechanicsTrigger = biomechanicsExplainer.getByRole('button', { name: /Full methods, assumptions, sources, and limitations/ });
  await expect(biomechanicsTrigger).toHaveAttribute('data-open-document', 'biomechanics');
  await expect(biomechanicsTrigger).toHaveAttribute('aria-haspopup', 'dialog');
  const sectionOrder = await page.locator('main > section').evaluateAll((sections) => sections.map((section) => section.id || section.className));
  expect(sectionOrder).not.toContain('biomechanics');
  expect(sectionOrder.indexOf('method-section')).toBeLessThan(sectionOrder.indexOf('sources'));
  await expect(page.locator('.method-section #biomechanics')).toHaveCount(1);
  await expect(page.locator('.method-section .caveat, .method-section .assumption-note')).toHaveCount(0);
  const modelTrigger = section.getByRole('button', { name: /Read the full calculator model/ });
  await expect(modelTrigger).toHaveAttribute('data-open-document', 'model');
  await expect(modelTrigger).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(page.locator('a[href*="github.com/luxifr/hmdsc"]')).toHaveCount(0);

  await expect(page.locator('.method-section .sources-link')).toHaveCount(0);
  await expect(section.locator('.sources-heading')).not.toContainText('biomechanics');

  const dialog = page.getByRole('dialog');
  const dialogTitle = page.locator('#source-document-title');
  const dialogContent = page.locator('#source-document-content');
  const modelDocument = parseSourceDocument('MODEL.md');
  await modelTrigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialogTitle).toHaveText(modelDocument.title);
  expect(normalizeText(await dialogContent.innerText())).toBe(modelDocument.body);

  const biomechanicsDocument = parseSourceDocument('BIOMECHANICS.md');
  await dialogContent.getByRole('button', { name: 'biomechanics research note' }).click();
  await expect(dialogTitle).toHaveText(biomechanicsDocument.title);
  expect(normalizeText(await dialogContent.innerText())).toBe(biomechanicsDocument.body);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(modelTrigger).toBeFocused();

  await biomechanicsTrigger.click();
  await expect(dialogTitle).toHaveText(biomechanicsDocument.title);
  expect(normalizeText(await dialogContent.innerText())).toBe(biomechanicsDocument.body);
  await page.getByRole('button', { name: 'Close source document' }).click();
  await expect(dialog).toBeHidden();
  await expect(biomechanicsTrigger).toBeFocused();

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }

  await page.setViewportSize({ width: 320, height: 640 });
  await modelTrigger.click();
  const dialogBounds = await dialog.boundingBox();
  expect(dialogBounds.width).toBeLessThanOrEqual(320);
  expect(dialogBounds.x).toBeGreaterThanOrEqual(0);
  expect(dialogBounds.x + dialogBounds.width).toBeLessThanOrEqual(320);
  expect(await dialogContent.evaluate((content) => content.scrollHeight > content.clientHeight)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});
