import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const output = process.env.QA_OUTPUT || '/tmp/keroro-qa';
await mkdir(output, { recursive: true });
const errors = [];
// Ignore hover filter transitions when checking actual character movement.
const movementTime = element => element.getAnimations().find(animation => animation.effect.getKeyframes().some(frame => 'transform' in frame))?.currentTime;
// Keroro's square image box overlaps Giroro; click the exposed face instead.
const clickKeroro = async (force = false) => {
  const button = page.locator('.character-keroro button');
  const bounds = await button.boundingBox();
  await button.click({ force, position: { x: bounds.width * .6, y: bounds.height * .3 } });
};
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
  assert.equal(await page.locator('.crew-card, dialog, footer, nav, #platoon').count(), 0, 'Only the interactive poster remains');
  assert.equal(await page.locator('#hero-title img').getAttribute('alt'), '개구리 중사 케로로');
  assert.equal(await page.locator('body').evaluate(element => /[\u3040-\u30ff\u4e00-\u9fff]/u.test(element.innerText)), false, 'Visible copy is Korean');
  assert.equal(await page.locator('.progress-track').getAttribute('aria-valuenow'), '100');
  assert.equal(await page.locator('.character img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
  assert.ok(await page.locator('#scene').evaluate(scene => [...scene.querySelectorAll('.character')].reduce((area, element) => area + element.offsetWidth ** 2, 0) / (scene.clientWidth * scene.clientHeight)) > 1.2, 'Large overlapping characters fill the poster');
  await page.screenshot({ path: `${output}/desktop.png`, fullPage: true });

  await page.locator('#replay').click();
  await page.waitForTimeout(1600);
  await page.locator('#pause').click();
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'paused');
  assert.ok(await page.locator('.character-giroro').evaluate(element => element.getBoundingClientRect().width / element.offsetWidth) > 1.4, 'First character rushes in front of the camera before landing');
  assert.ok(await page.locator('.character-giroro').evaluate(element => Number(getComputedStyle(element).zIndex)) >= 40, 'Rushing character renders in front of the poster');
  const progress = await page.locator('.progress-track').getAttribute('aria-valuenow');
  const camera = await page.locator('#scene').evaluate(element => getComputedStyle(element).transform);
  const poses = await page.locator('.character').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform));
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.progress-track').getAttribute('aria-valuenow'), progress);
  assert.deepEqual(await page.locator('.character').evaluateAll(elements => elements.map(element => getComputedStyle(element).transform)), poses);
  assert.equal(await page.locator('#scene').evaluate(element => getComputedStyle(element).transform), camera, 'Camera shake pauses with the flight');
  await page.screenshot({ path: `${output}/mid-flight.png` });
  await page.locator('#pause').click();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'playing');
  await page.locator('#skip').click();
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'complete');

  await page.locator('#pause').click();
  assert.equal(await page.locator('.character-keroro').evaluate(element => element.inert), false, 'Paused complete scene keeps character controls focusable');
  await clickKeroro();
  assert.equal(await page.locator('dialog').count(), 0);
  await page.setViewportSize({ width: 1360, height: 1050 });
  await page.waitForTimeout(100);
  await page.locator('#pause').click();
  assert.equal(await page.locator('.character-keroro button').evaluate(element => getComputedStyle(element).animationName), 'float', 'Floating resumes after paused resize');
  await page.setViewportSize({ width: 1440, height: 1050 });

  for (const id of ['keroro', 'tamama', 'giroro', 'kururu', 'dororo']) {
    const character = page.locator(`[data-character="${id}"]`);
    if (id === 'keroro') await clickKeroro(true);
    else await character.locator('button').click({ force: true });
    assert.ok(await character.locator('img').evaluate(element => element.getAnimations().some(animation => animation.effect.getKeyframes().some(frame => 'transform' in frame))), `${id} reacts instead of opening a profile`);
  }
  await page.locator('#pause').click();
  const reaction = page.locator('.character-dororo img');
  await reaction.evaluate(element => Promise.all(element.getAnimations().filter(animation => animation.effect.getKeyframes().some(frame => 'transform' in frame)).map(animation => animation.ready)));
  const reactionTime = await reaction.evaluate(movementTime);
  assert.equal(typeof reactionTime, 'number', 'Reaction is still active when paused');
  await page.waitForTimeout(180);
  assert.equal(await reaction.evaluate(movementTime), reactionTime, 'Character reaction pauses with the scene');
  await page.locator('#pause').click();
  await page.waitForTimeout(750);
  assert.equal(await reaction.evaluate(element => element.getAnimations().length), 0, 'Character reaction completes after resuming');
  await page.mouse.move(100, 100);
  await page.waitForTimeout(70);
  assert.notEqual(await page.locator('#scene').evaluate(element => element.style.getPropertyValue('--px')), '0px', 'Mouse movement creates parallax');
  const parallax = await page.locator('.character-keroro img').evaluate(element => getComputedStyle(element).translate);
  await page.locator('#pause').press('Enter');
  await page.mouse.move(0, 0);
  await page.waitForTimeout(350);
  assert.equal(await page.locator('.character-keroro img').evaluate(element => getComputedStyle(element).translate), parallax, 'Pause freezes parallax even when the pointer leaves');
  await page.locator('#pause').click();
  await page.locator('.sound-button').click();
  assert.equal(await page.locator('.sound-button').getAttribute('aria-pressed'), 'true');
  await page.locator('.sound-button').click();
  assert.equal(await page.locator('.sound-button').getAttribute('aria-pressed'), 'false');

  for (let i = 0; i < 5; i++) await page.locator('#replay').click();
  await page.locator('#skip').click();
  assert.equal(await page.locator('.character').evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), true, 'Desktop is a single-screen poster');
  console.log('PASS: Korean single-screen poster, 5 character reactions, finale, pause/resume, skip, sound, rapid replay');

  for (const width of [375, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
    await page.locator('#skip:not([disabled])').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Horizontal overflow at ${width}`);
    assert.equal(await page.locator('#scene').getAttribute('data-state'), 'complete');
    assert.ok(await page.locator('#scene').evaluate(scene => [...scene.querySelectorAll('.character')].reduce((area, element) => area + element.offsetWidth ** 2, 0) / (scene.clientWidth * scene.clientHeight)) > 1.2, `Dense poster composition at ${width}px`);
    await page.screenshot({ path: `${output}/mobile-${width}.png`, fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1), true, `Single-screen layout at ${width}`);
    console.log(`PASS: ${width}px responsive poster, no overflow`);
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: `${output}/landscape.png`, fullPage: true });
  assert.equal(await page.locator('#replay').evaluate(element => { const bounds = element.getBoundingClientRect(); return bounds.right <= innerWidth && bounds.bottom <= innerHeight; }), true, 'Landscape replay remains in the viewport');
  console.log('PASS: landscape playback controls remain visible');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#scene').getAttribute('data-state'), 'complete');
  assert.equal(await page.locator('#pause').isDisabled(), true);
  assert.equal(await page.locator('.character').evaluateAll(elements => elements.every(element => getComputedStyle(element).opacity === '1')), true);
  await page.locator('.character-keroro button').click({ force: true });
  assert.equal(await page.locator('.character-keroro img').evaluate(element => element.getAnimations().length), 0, 'Reduced motion also suppresses click reactions');
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
