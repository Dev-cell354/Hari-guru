import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLACKOUT_HOLD_MS,
  FADE_IN_DURATION_MS,
  FADE_OUT_DURATION_MS,
  INITIAL_FADE_IN_MS,
  canNavigateToPage,
  clampPageIndex,
  computeFadeInBlackOpacity,
  computeFadeOutOpacity,
  formatAudioTime,
  getProgressInfo,
  resolveSwipeDirection,
} from './letterNavigation';

test('clampPageIndex bounds negative and overflowing indices', () => {
  assert.equal(clampPageIndex(-3, 5), 0);
  assert.equal(clampPageIndex(0, 5), 0);
  assert.equal(clampPageIndex(3, 5), 3);
  assert.equal(clampPageIndex(9, 5), 4);
  assert.equal(clampPageIndex(2, 0), 0);
});

test('canNavigateToPage prevents out-of-range, same-page, and mid-transition jumps', () => {
  assert.equal(canNavigateToPage(1, 0, 5, false), true);
  assert.equal(canNavigateToPage(0, 0, 5, false), false);
  assert.equal(canNavigateToPage(-1, 0, 5, false), false);
  assert.equal(canNavigateToPage(5, 4, 5, false), false);
  assert.equal(canNavigateToPage(2, 1, 5, true), false);
});

test('getProgressInfo formats letter and closing labels accurately', () => {
  const first = getProgressInfo(0, 5, 'pink');
  assert.equal(first.stepLabel, 'SURAT 01');
  assert.equal(first.stepCount, '01 / 05');
  assert.equal(first.percent, 20);
  assert.equal(first.accentColor, '#d98fa7');

  const last = getProgressInfo(4, 5, 'pink');
  assert.equal(last.stepLabel, 'PENUTUP');
  assert.equal(last.stepCount, '05 / 05');
  assert.equal(last.percent, 100);
});

test('resolveSwipeDirection distinguishes horizontal swipes from vertical scrolling', () => {
  assert.equal(resolveSwipeDirection(-80, 10), 'next');
  assert.equal(resolveSwipeDirection(80, 15), 'prev');
  assert.equal(resolveSwipeDirection(-40, 5), null);
  assert.equal(resolveSwipeDirection(-80, 90), null);
});

test('formatAudioTime formats durations cleanly', () => {
  assert.equal(formatAudioTime(0), '0:00');
  assert.equal(formatAudioTime(65), '1:05');
  assert.equal(formatAudioTime(Number.NaN), '0:00');
});

test('fade curves smoothly map 0..1 endpoints and intermediate progression', () => {
  assert.equal(computeFadeOutOpacity(0), 0);
  assert.equal(computeFadeOutOpacity(0.5), 0.5);
  assert.equal(computeFadeOutOpacity(1), 1);

  assert.equal(computeFadeInBlackOpacity(0), 1);
  assert.ok(computeFadeInBlackOpacity(0.5) > 0.6);
  assert.ok(computeFadeInBlackOpacity(0.8) > 0.25);
  assert.equal(computeFadeInBlackOpacity(1), 0);
});

test('cinematic fade transition timings are balanced and ordered', () => {
  assert.ok(INITIAL_FADE_IN_MS >= 1200 && INITIAL_FADE_IN_MS <= 2200);
  assert.ok(FADE_OUT_DURATION_MS >= 450 && FADE_OUT_DURATION_MS <= 900);
  assert.ok(BLACKOUT_HOLD_MS >= 150 && BLACKOUT_HOLD_MS <= 350);
  assert.ok(FADE_IN_DURATION_MS >= 1500 && FADE_IN_DURATION_MS <= 2400);
});
