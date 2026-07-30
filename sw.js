// Minimální service worker — hlavně kvůli tomu, aby Android/Chrome nabídl
// "Přidat na plochu" (PWA vyžaduje registrovaný SW s fetch handlerem).
// Necachuje agresivně žádná API data, jen základní shell (HTML/manifest/ikony).
const CACHE_NAME = "investdash-shell-v1";
const SHELL_FILES = ["./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Network-first pro vše — investiční appka potřebuje čerstvá data, ne cache.
  // Jen když je uživatel offline, spadni na shell z cache (aby appka aspoň nabídla UI).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
