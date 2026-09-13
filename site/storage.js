(function (root) {
  'use strict';
  const KEY = 'breathing-timer.presets.v1';
  const limits = { inhale: [1, 30], hold: [0, 30], exhale: [1, 30], cycles: [1, 20] };
  function validate(value) {
    if (!value || typeof value.name !== 'string' || !value.name.trim() || value.name.trim().length > 40) throw new Error('名前は1〜40文字で入力してください。');
    const result = { name: value.name.trim() };
    for (const [key, [min, max]] of Object.entries(limits)) {
      if (!Number.isInteger(value[key]) || value[key] < min || value[key] > max) throw new Error('秒数は吸う・吐く1〜30、止める0〜30、回数1〜20の整数を指定してください。');
      result[key] = value[key];
    }
    return result;
  }
  function parse(text) {
    const data = JSON.parse(text);
    if (data.version !== 1 || !Array.isArray(data.presets) || data.presets.length > 100) throw new Error('このアプリのバックアップではありません（上限100件）。');
    return data.presets.map(validate);
  }
  function encode(presets) { return JSON.stringify({ version: 1, presets: presets.map(validate) }, null, 2); }
  root.PresetStorage = { KEY, validate, parse, encode };
  if (typeof module !== 'undefined') module.exports = root.PresetStorage;
})(globalThis);
