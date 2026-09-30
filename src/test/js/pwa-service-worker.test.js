const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('updated worker activates and refreshes navigation while retaining offline fallback', async () => {
  const handlers = {}, cacheEntries = new Map();
  const cache = {
    addAll: async files => { assert.ok(files.includes('./app.js?v=5')); assert.ok(files.includes('./breathing-timer.js?v=5')); },
    match: async key => cacheEntries.get(key),
    put: async (key, value) => cacheEntries.set(key, value)
  };
  let skipWaiting = false, online = true;
  const context = {
    self: {
      location: { origin: 'https://example.test' },
      addEventListener: (name, handler) => { handlers[name] = handler; },
      skipWaiting: async () => { skipWaiting = true; },
      clients: { claim: async () => {} }
    },
    caches: { open: async () => cache, keys: async () => [], delete: async () => true },
    fetch: async () => {
      if (!online) throw new Error('offline');
      return { ok: true, body: 'new page', clone() { return this; } };
    },
    URL, Promise
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../../site/sw.js'), 'utf8'), context);
  let pending;
  handlers.install({ waitUntil: promise => { pending = promise; } });
  await pending;
  assert.equal(skipWaiting, true);

  const request = { method: 'GET', url: 'https://example.test/', mode: 'navigate' };
  handlers.fetch({ request, respondWith: promise => { pending = promise; } });
  assert.equal((await pending).body, 'new page');
  online = false;
  handlers.fetch({ request, respondWith: promise => { pending = promise; } });
  assert.equal((await pending).body, 'new page');
});
