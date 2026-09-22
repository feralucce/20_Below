// Service worker for the Character Creator, so it installs to a phone's
// home screen and opens without a signal.
//
// Deliberately no precache list. The app is a few dozen ES modules that get
// added to and renamed; a hardcoded manifest would silently fall out of
// date and cache a half-app, which is worse than no offline support at all.
// Instead the shell is cached on install and everything else is cached as
// it's actually used - after one online visit the app is complete offline.
//
// Rules go network-first. rules/*.md is the live source the whole app is
// built around: editing a rules file and pushing updates every copy
// without a release, and a cache-first worker would quietly undo that.
// Offline, the last-seen copy is served instead.
//
// So does the code, and for the same reason. A parser and the file it
// parses are one thing in two places: app/parse/nature.js reads a heading
// out of rules/character-creation.md and breaks if that heading moves.
// Caching the rules fresh and the code a load behind guarantees a window
// where new rules meet the old parser - which is exactly what happened
// when the Natures table moved out of fate.md, and every visitor whose
// worker had not updated yet got "Anchor text not found" instead of an
// app. Bumping VERSION only clears it once the browser re-fetches this
// file, which is too late to be a fix.
//
// Images and fonts stay stale-while-revalidate. They are heavy, they do
// not parse anything, and a one-load-old icon breaks nothing.

const VERSION = "v11";
const SHELL = `20below-shell-${VERSION}`;
const ASSETS = `20below-assets-${VERSION}`;
const RULES = `20below-rules-${VERSION}`;

// Enough to paint something on a cold offline start. Everything else
// arrives through runtime caching below.
const SHELL_URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL)
      // addAll is all-or-nothing, and one 404 would leave the worker
      // uninstalled with no explanation, so each is added on its own.
      .then((cache) => Promise.all(SHELL_URLS.map((u) => cache.add(u).catch(() => null))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL, ASSETS, RULES]);
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => !keep.has(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    // "no-store", not a bare fetch. A plain fetch() in here is still
    // allowed to come out of the browser's own HTTP cache, so this asked
    // the network for the rules and got handed a copy from disk that was
    // two edits old - network-first in name only. It served a
    // character-creation.md of 13,982 bytes while the real file was
    // 22,122, which is how the Natures table went missing from an app
    // whose worker cache held the correct file all along.
    const fresh = await fetch(request, { cache: "no-store" });
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const fetching = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return hit || (await fetching) || fetch(request);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Someone else's server - never cache it. The desktop build's live rules
  // fetch goes to raw.githubusercontent.com and should always be a real
  // request or a real failure.
  if (url.origin !== self.location.origin) return;

  // Anything under rules/ is live source, not an asset: the .md files
  // the app is built from and rules/flavour.json, the descriptions
  // generated from the book. Matching on ".md" alone sent the JSON
  // through stale-while-revalidate, so a prose edit would have shown
  // up one launch late - the exact thing network-first is here to stop.
  if (url.pathname.includes("/rules/")) {
    event.respondWith(networkFirst(request, RULES));
    return;
  }

  // A navigation that can't reach the network falls back to the cached
  // shell rather than the browser's offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("./index.html", { ignoreSearch: true })),
    );
    return;
  }

  // Code, and the stylesheet that lays it out. Network-first so it can
  // never be older than the rules it reads; the cache is the offline
  // copy, not the default answer.
  if (/\.(?:m?js|css)$/.test(url.pathname)) {
    event.respondWith(networkFirst(request, ASSETS));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, ASSETS));
});
