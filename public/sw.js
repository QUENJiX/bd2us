const shellCache = "bd2us-shell-v2";
const readingCache = "bd2us-reading-v1";
const shell = ["/", "/roadmap", "/colleges", "/resources", "/faq", "/about", "/dashboard"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(shellCache).then((cache) => cache.addAll(shell)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => ![shellCache, readingCache].includes(key)).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CACHE_READING_PAGE" && event.data.url) {
    event.waitUntil(caches.open(readingCache).then((cache) => cache.add(event.data.url)));
  }
  if (event.data?.type === "REMOVE_READING_PAGE" && event.data.url) {
    event.waitUntil(caches.open(readingCache).then((cache) => cache.delete(event.data.url)));
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && shell.includes(url.pathname)) {
            caches.open(shellCache).then((cache) => cache.put(event.request, response.clone()));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(event.request)
            .then((cached) => cached || caches.match(url.pathname))
            .then((cached) => cached || new Response("This page is not saved for offline reading.", { status: 503 }))
        )
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok && shell.includes(url.pathname)) caches.open(shellCache).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }))
  );
});
