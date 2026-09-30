'use strict';
const CACHE = 'breathing-pwa-v5';
const FILES = ['./', './index.html', './style.css?v=4', './storage.js', './app.js?v=5', './breathing-timer.js?v=5', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('breathing-pwa-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    if (event.request.mode === 'navigate') {
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put('./index.html', response.clone()).catch(() => {});
        return response;
      } catch { return cache.match('./index.html'); }
    }
    const cached = await cache.match(event.request);
    if (cached) return cached;
    return fetch(event.request);
  }));
});
