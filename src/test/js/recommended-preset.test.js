const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const PresetStorage = require('../../../site/storage.js');

test('recommended preset fills the form and current selection without saving or starting', () => {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', textContent: '', listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; },
      replaceChildren() {}, focus() { this.focused = true; }
    });
    return elements.get(id);
  };
  for (const [key, value] of Object.entries({ name: 'いつもの呼吸', inhale: '4', hold: '0', exhale: '6', cycles: '5' })) element(key).value = value;
  let saves = 0, starts = 0;
  class Timer {
    constructor(config) { this.config = config; this.state = 'ready'; }
    reset() { this.state = 'ready'; }
    start() { starts++; }
    pause() {}
  }
  const context = {
    document: { getElementById: element, addEventListener() {}, querySelectorAll: () => [] },
    window: { addEventListener() {} }, navigator: {},
    localStorage: { getItem: () => null, setItem: () => { saves++; } },
    PresetStorage, BreathingTimer: Timer
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../../site/app.js'), 'utf8'), context);
  element('use-recommended').listeners.click();

  assert.deepEqual(Object.fromEntries(['name', 'inhale', 'hold', 'exhale', 'cycles'].map(key => [key, String(element(key).value)])), {
    name: 'リラックス 5分', inhale: '4', hold: '0', exhale: '6', cycles: '30'
  });
  assert.equal(element('duration').textContent, '合計 5分0秒');
  assert.equal((Number(element('inhale').value) + Number(element('hold').value) + Number(element('exhale').value)) * Number(element('cycles').value), 300);
  assert.equal(element('chosen').textContent, 'リラックス 5分');
  assert.equal(element('start').focused, true);
  assert.equal(saves, 0);
  assert.equal(starts, 0);
});
