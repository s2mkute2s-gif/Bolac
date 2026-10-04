import test from 'node:test';
import assert from 'node:assert/strict';
import { HUD_ICON_RECTS } from '../dist/hud-icons.js';

test('HUD icon atlas keeps key mappings', () => {
  assert.equal(HUD_ICON_RECTS['114,93,14,9'], 'bell');
  assert.equal(HUD_ICON_RECTS['39,113,9,8'], 'heart');
  assert.equal(HUD_ICON_RECTS['114,24,13,13'], 'spear');
});

test('HUD icon atlas has broad preserved coverage', () => {
  assert.ok(Object.keys(HUD_ICON_RECTS).length >= 50);
  assert.ok(new Set(Object.values(HUD_ICON_RECTS)).size >= 20);
});
