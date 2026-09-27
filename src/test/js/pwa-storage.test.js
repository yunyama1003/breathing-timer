const test = require('node:test');
const assert = require('node:assert/strict');
const storage = require('../../../site/storage.js');
const preset = { name: 'いつもの呼吸', inhale: 4, hold: 0, exhale: 6, cycles: 5 };
test('backup round trip preserves every setting', () => {
  assert.deepEqual(storage.parse(storage.encode([preset])), [preset]);
});
test('cycle count boundaries apply to settings and backup imports', () => {
  for (const cycles of [1, 20, 30, 60]) {
    const value = { ...preset, cycles };
    assert.deepEqual(storage.validate(value), value);
    assert.deepEqual(storage.parse(storage.encode([value])), [value]);
  }
  const invalid = { ...preset, cycles: 61 };
  assert.throws(() => storage.validate(invalid));
  assert.throws(() => storage.parse(JSON.stringify({ version: 1, presets: [invalid] })));
});
test('rejects malformed, oversized and out-of-range imports', () => {
  for (const value of [null, {}, { ...preset, hold: -1 }, { ...preset, inhale: '4' }, { ...preset, cycles: 1.5 }, { ...preset, name: ' ' }]) assert.throws(() => storage.validate(value));
  assert.throws(() => storage.parse('{'));
  assert.throws(() => storage.parse(JSON.stringify({ version: 2, presets: [preset] })));
  assert.throws(() => storage.parse(JSON.stringify({ version: 1, presets: Array(101).fill(preset) })));
});
test('import validates whole batch and drops unexpected fields', () => {
  assert.throws(() => storage.parse(JSON.stringify({ version: 1, presets: [preset, { ...preset, cycles: 999 }] })));
  assert.deepEqual(storage.validate({ ...preset, id: 'untrusted', password: 'discard' }), preset);
});
