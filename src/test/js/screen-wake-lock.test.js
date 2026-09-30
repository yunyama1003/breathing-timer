const test = require('node:test');
const assert = require('node:assert/strict');
require('../../main/resources/static/js/breathing-timer.js');
const ScreenWakeLock = globalThis.ScreenWakeLock;

const settle = () => new Promise(resolve => setImmediate(resolve));
function sentinel() {
  return {
    releases: 0,
    addEventListener(type, callback) { if (type === 'release') this.onRelease = callback; },
    async release() { this.releases++; this.onRelease?.(); }
  };
}

test('requests only while running and releases on pause, completion or reset', async () => {
  const sentinels = [];
  const lock = new ScreenWakeLock(() => assert.fail('wake lock should be available'), {
    request: async type => { assert.equal(type, 'screen'); const value = sentinel(); sentinels.push(value); return value; }
  });
  lock.setRunning(true);
  await settle();
  lock.setRunning(true);
  assert.equal(sentinels.length, 1);
  lock.setRunning(false);
  await settle();
  assert.equal(sentinels[0].releases, 1);
  lock.setRunning(true);
  await settle();
  lock.setRunning(false);
  await settle();
  assert.equal(sentinels.length, 2);
  assert.equal(sentinels[1].releases, 1);
});

test('refusal does not throw and unexpected release is retried at most once', async () => {
  let failures = 0, requests = 0;
  const lock = new ScreenWakeLock(() => { failures++; }, {
    request: async () => { requests++; if (requests === 1) throw new Error('denied'); return sentinel(); }
  });
  lock.setRunning(true);
  await settle();
  assert.equal(failures, 1);
  lock.setRunning(false);
  lock.setRunning(true);
  await settle();
  const first = lock.sentinel;
  first.onRelease();
  await settle();
  assert.equal(requests, 3);
  lock.sentinel.onRelease();
  await settle();
  assert.equal(requests, 3);
  assert.equal(failures, 2);
});

test('a request completed after pause is released without retaining the lock', async () => {
  let resolveRequest;
  const lock = new ScreenWakeLock(() => {}, { request: () => new Promise(resolve => { resolveRequest = resolve; }) });
  lock.setRunning(true);
  lock.setRunning(false);
  const late = sentinel();
  resolveRequest(late);
  await settle();
  assert.equal(late.releases, 1);
  assert.equal(lock.sentinel, null);
});

test('completion tone uses two different pitches', () => {
  const pitches = [];
  const context = {
    state: 'running', currentTime: 0, destination: {},
    createOscillator: () => ({ frequency: { set value(value) { pitches.push(value); } }, connect() {}, start() {}, stop() {} }),
    createGain: () => ({ gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} })
  };
  globalThis.playCompletionTone(context);
  assert.deepEqual(pitches, [523, 784]);
});
