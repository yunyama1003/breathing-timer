const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const PresetStorage = require('../../../site/storage.js');
const settle = () => new Promise(resolve => setImmediate(resolve));

function page() {
  const elements = new Map(), documentListeners = {}, windowListeners = {}, pitches = [];
  let now = 0, frame, requests = 0, releases = 0, phaseSounds = 0;
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', style: {}, dataset: {}, listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; },
      reportValidity: () => true, replaceChildren() {}, focus() {}, setAttribute() {}
    });
    return elements.get(id);
  };
  class AudioContext {
    constructor() { this.state = 'running'; this.currentTime = 0; this.destination = {}; }
    resume() { return Promise.resolve(); }
    createOscillator() { return { frequency: { set value(value) { pitches.push(value); } }, connect() {}, start() {}, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }; }
  }
  const document = {
    hidden: false, getElementById: element, querySelectorAll: () => [],
    addEventListener(type, listener) { documentListeners[type] = listener; }
  };
  const context = vm.createContext({
    document, navigator: { wakeLock: { request: async () => {
      requests++;
      return { addEventListener() {}, release: async () => { releases++; } };
    } } },
    window: { AudioContext, addEventListener(type, listener) { windowListeners[type] = listener; } },
    addEventListener(type, listener) { windowListeners[type] = listener; },
    AudioContext, Audio: class { play() { phaseSounds++; return Promise.resolve(); } },
    performance: { now: () => now },
    requestAnimationFrame: callback => { frame = callback; return 1; },
    cancelAnimationFrame: () => { frame = null; },
    localStorage: { getItem: () => null }, PresetStorage
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../../main/resources/static/js/breathing-timer.js'), 'utf8'), context);
  return {
    context, document, element, documentListeners, windowListeners, pitches,
    get requests() { return requests; }, get releases() { return releases; }, get phaseSounds() { return phaseSounds; },
    advance(ms) { now += ms; const callback = frame; frame = null; callback(now); }
  };
}

test('PWA keeps the screen awake only while running and plays completion tone once', async () => {
  const p = page();
  for (const [key, value] of Object.entries({ name: '呼吸', inhale: '4', hold: '0', exhale: '6', cycles: '1' })) p.element(key).value = value;
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../../../site/app.js'), 'utf8'), p.context);
  p.element('start').listeners.click();
  await settle();
  assert.equal(p.requests, 1);
  p.advance(10000);
  assert.equal(p.element('phase').textContent, '完了 🎉');
  assert.deepEqual(p.pitches, [523, 784]);
  assert.equal(p.phaseSounds, 0);
  assert.equal(p.releases, 1);
  p.element('sound').listeners.click();
  p.element('start').listeners.click();
  await settle();
  p.advance(10000);
  assert.deepEqual(p.pitches, [523, 784]);
  assert.equal(p.requests, 2);
  assert.equal(p.releases, 2);
});

test('Spring Boot timer page uses the same wake and completion behavior', async () => {
  const p = page();
  p.element('timerApp').dataset = { cycleCount: '1', inhaleSeconds: '4', holdSeconds: '0', exhaleSeconds: '6', soundUrl: '/sound/change.mp3' };
  p.documentListeners.DOMContentLoaded();
  p.element('startBtn').listeners.click();
  await settle();
  assert.equal(p.requests, 1);
  p.advance(10000);
  assert.equal(p.element('phase').textContent, '完了 🎉');
  assert.deepEqual(p.pitches, [523, 784]);
  assert.equal(p.phaseSounds, 0);
  assert.equal(p.releases, 1);
  p.element('soundBtn').listeners.click();
  p.element('startBtn').listeners.click();
  await settle();
  p.advance(10000);
  assert.deepEqual(p.pitches, [523, 784]);
  assert.equal(p.requests, 2);
  assert.equal(p.releases, 2);
});

test('PWA pause, reset and page hiding release the wake lock without completion sound', async () => {
  const p = page();
  for (const [key, value] of Object.entries({ name: '呼吸', inhale: '4', hold: '0', exhale: '6', cycles: '1' })) p.element(key).value = value;
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../../../site/app.js'), 'utf8'), p.context);
  p.element('start').listeners.click();
  await settle();
  p.element('pause').listeners.click();
  assert.equal(p.releases, 1);
  p.element('start').listeners.click();
  await settle();
  p.element('reset').listeners.click();
  assert.equal(p.releases, 2);
  p.element('start').listeners.click();
  await settle();
  p.document.hidden = true;
  p.documentListeners.visibilitychange();
  assert.equal(p.releases, 3);
  assert.equal(p.element('phase').textContent, '一時停止中（吸う）');
  assert.deepEqual(p.pitches, []);
});

test('Spring Boot page exit releases the wake lock without completion sound', async () => {
  const p = page();
  p.element('timerApp').dataset = { cycleCount: '1', inhaleSeconds: '4', holdSeconds: '0', exhaleSeconds: '6', soundUrl: '/sound/change.mp3' };
  p.documentListeners.DOMContentLoaded();
  p.element('startBtn').listeners.click();
  await settle();
  p.windowListeners.pagehide();
  assert.equal(p.releases, 1);
  assert.equal(p.element('phase').textContent, '一時停止中（吸う）');
  assert.deepEqual(p.pitches, []);
});
