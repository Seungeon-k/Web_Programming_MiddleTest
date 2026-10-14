import test from 'node:test';
import assert from 'node:assert/strict';
import { CAST, TIMING, launchTransform } from '../src/scene.js';

test('all five characters finish entering before the title appears', () => {
  assert.equal(CAST.length, 5);
  assert.equal(new Set(CAST.map(character => character.id)).size, 5);
  for (const character of CAST) {
    assert.ok(character.delay + TIMING.flight < TIMING.title, `${character.id} has not landed before title`);
  }
  assert.ok(TIMING.title + TIMING.titleDuration <= TIMING.total);
});

test('characters originate exactly at the monitor center in desktop and mobile layouts', () => {
  for (const [origin, target] of [
    [{ x: 160, y: 610 }, { x: 720, y: 160 }],
    [{ x: 64, y: 560 }, { x: 195, y: 170 }],
  ]) {
    const { x, y } = launchTransform(origin, target);
    assert.equal(target.x + x, origin.x);
    assert.equal(target.y + y, origin.y);
    assert.ok(Number.isFinite(x) && Number.isFinite(y));
  }
});

test('a character already at the origin has no offset', () => {
  assert.deepEqual(launchTransform({ x: 0, y: 0 }, { x: 0, y: 0 }), { x: 0, y: 0 });
});
