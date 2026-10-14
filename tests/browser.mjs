import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const output = process.env.QA_OUTPUT || '/tmp/keroro-qa';
await mkdir(output, { recursive: true });
const errors = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
page.on('pageerror', error => errors.push(error.message));
try {
  const heldRequests = [];
  await page.route('**/assets/tamama.png', route => { heldRequests.push(route); });
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'commit' });
  await page.waitForFunction(() => document.querySelectorAll('.character').length === 5);
  assert.equal(await page.locator('.title-lockup').evaluate(element => element.inert), true, 'Loading title is not focusable');
  assert.equal(await page.locator('.character').evaluateAll(elements => elements.every(element => element.inert)), true, 'Loading characters are not interactive');
  await Promise.all(heldRequests.map(route => route.continue()));
  await page.unroute('**/assets/tamama.png');
  await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelector('#scene').dataset.state === 'complete');
  assert.equal(await page.locator('.character').count(), 5);
  assert.equal(await page.locator('.crew-card').count(), 5);
  assert.equal(await page.locator('.progress-track').getAttribute('aria-valuenow'), '100');
  assert.equal(await page.locator('.character img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
  await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });

  await page.locator('#replay').click();
  await page.waitForTimeout(1600);
  await page.locator('#pause').click();
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'paused');
  const progress = await page.locator('.progress-track').getAttribute('aria-valuenow');
  const poses = await page.locator('.character').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform));
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.progress-track').getAttribute('aria-valuenow'), progress);
  assert.deepEqual(await page.locator('.character').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform)), poses);
  await page.screenshot({ path: `${output}/mid-flight.png` });
  await page.locator('#pause').click();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'playing');
  await page.locator('#skip').click();
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'complete');

  await page.locator('#pause').click();
  assert.equal(await page.locator('.title-lockup').evaluate(element => element.inert), false, 'Paused complete scene keeps its CTA interactive');
  assert.equal(await page.locator('.character-keroro').evaluate(element => element.inert), false, 'Paused complete scene keeps character profiles interactive');
  await page.locator('.character-keroro button').click();
  assert.equal(await page.locator('#profile-dialog').evaluate(dialog => dialog.open), true);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1360, height: 1050 });
  await page.waitForTimeout(100);
  await page.locator('#pause').click();
  assert.equal(await page.locator('.character-keroro button').evaluate(element => getComputedStyle(element).animationName), 'float', 'Floating resumes after paused resize');
  await page.setViewportSize({ width: 1440, height: 1050 });

  for (const id of ['keroro', 'tamama', 'giroro', 'kururu', 'dororo']) {
    await page.locator(`.crew-card[data-profile="${id}"]`).click();
    assert.equal(await page.locator('#profile-dialog').evaluate(dialog => dialog.open), true);
    assert.ok((await page.locator('#profile-image').getAttribute('src')).includes(id));
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#profile-dialog').evaluate(dialog => dialog.open), false);
  }
  await page.locator('.sound-button').click();
  assert.equal(await page.locator('.sound-button').getAttribute('aria-pressed'), 'true');
  await page.locator('.sound-button').click();
  assert.equal(await page.locator('.sound-button').getAttribute('aria-pressed'), 'false');
  await page.locator('.nav-about').click();
  assert.equal(await page.locator('#about-dialog').evaluate(dialog => dialog.open), true);
  await page.locator('#about-dialog .dialog-close').click();

  for (let i = 0; i < 5; i++) await page.locator('#replay').click();
  await page.locator('#skip').click();
  assert.equal(await page.locator('.character').evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  console.log('PASS: desktop load, 5 images, finale, pause/resume, skip, 5 profiles, sound, about, rapid replay');

  for (const width of [375, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.locator('#skip:not([disabled])').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Horizontal overflow at ${width}`);
    assert.equal(await page.locator('#scene').getAttribute('data-state'), 'complete');
    await page.screenshot({ path: `${output}/mobile-${width}.png`, fullPage: true });
    await page.locator('.crew-card[data-profile="keroro"]').click();
    assert.equal(await page.locator('#profile-dialog').evaluate(dialog => dialog.open), true);
    await page.locator('#profile-dialog .dialog-close').click();
    console.log(`PASS: ${width}px responsive layout, no overflow, profile dialog`);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'complete');
  assert.equal(await page.locator('#pause').isDisabled(), true);
  assert.equal(await page.locator('.character').evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), true);
  console.log('PASS: reduced motion immediately shows the finished composition');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(100);
  assert.equal(await page.locator('#pause').isDisabled(), false, 'Motion can be paused after OS preference changes');
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.route('**/assets/tamama.png', route => route.abort());
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'complete');
  assert.equal(await page.locator('.error-note').count(), 1);
  console.log('PASS: asset failure exits loading and reports the problem');
  assert.deepEqual(errors, [], 'Unexpected browser runtime errors');
  console.log('PASS: no browser runtime errors');
} finally { await browser.close(); }
