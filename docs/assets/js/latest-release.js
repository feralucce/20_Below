/* Point the download links at whatever the newest release actually is.
 *
 * The versions used to be typed into the HTML by hand, in two places, and
 * they went stale silently: the site served v0.9.4 for two releases after
 * v0.9.4, including one that taught a rule the book no longer had.
 *
 * This is progressive enhancement, deliberately. The href and the version
 * pill in the markup stay correct-at-time-of-writing and keep working on
 * their own - if GitHub is unreachable, rate-limited, or the visitor has
 * JavaScript off, the page is exactly what it was before. Nothing here
 * can leave a link broken; the worst case is a link that is merely old.
 *
 * Three products share one /releases feed, so each is matched on its own
 * tag shape. The Character Creator's bare vX.Y.Z has to be anchored or it
 * would also match brewery-v0.2.0.
 */
(function () {
  'use strict';

  var API = 'https://api.github.com/repos/feralucce/20_Below/releases';
  /* Bumped to -v2 to drop every cache written before the downgrade guard
     below existed: those entries are what put v0.10.0 back on a page whose
     markup already said v0.10.1. */
  var CACHE = '20below-releases-v2';
  var CACHE_TTL = 15 * 60 * 1000;

  var PRODUCTS = {
    creator: { tag: /^v(\d+\.\d+\.\d+)$/,                asset: /^20-below-desktop_.*\.exe$/ },
    tracker: { tag: /^combat-tracker-v(\d+\.\d+\.\d+)$/, asset: /^20-below-combat-tracker_.*\.exe$/ },
    brewery: { tag: /^brewery-v(\d+\.\d+\.\d+)$/,        asset: /^20-below-brewery_.*\.exe$/ },
  };

  function stamp(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    var h = d.getHours();
    var ampm = h < 12 ? 'AM' : 'PM';
    h = h % 12 || 12;
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(h) + ':' + p(d.getMinutes()) + ' ' + ampm;
  }

  /* Releases come back newest first, so the first tag that matches is the
     one we want. A draft or prerelease is skipped rather than offered. */
  function pick(releases, spec) {
    for (var i = 0; i < releases.length; i++) {
      var r = releases[i];
      if (r.draft || r.prerelease) continue;
      if (!spec.tag.test(r.tag_name || '')) continue;
      for (var j = 0; j < (r.assets || []).length; j++) {
        if (spec.asset.test(r.assets[j].name)) {
          return {
            version: spec.tag.exec(r.tag_name)[1],
            url: r.assets[j].browser_download_url,
            published: r.published_at,
          };
        }
      }
    }
    return null;
  }

  /* "0.9.5" is older than "0.10.1" - string comparison gets that wrong, so
     compare the numbers. */
  function older(a, b) {
    var x = a.split('.');
    var y = b.split('.');
    for (var i = 0; i < 3; i++) {
      var d = (parseInt(x[i], 10) || 0) - (parseInt(y[i], 10) || 0);
      if (d) return d < 0;
    }
    return false;
  }

  function apply(releases) {
    var nodes = document.querySelectorAll('[data-latest]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var spec = PRODUCTS[el.getAttribute('data-latest')];
      if (!spec) continue;
      var hit = pick(releases, spec);
      if (!hit) continue;

      /* This script exists to stop the hand-written links going stale, and
         it was doing the opposite. Its cache lives in sessionStorage, which
         survives as long as a tab is open - so a reader who had the page
         open before a release got that release's own answer overwritten by
         the pre-release one, and saw v0.10.0 on markup that said v0.10.1.
         The rule the file already claimed to follow, now enforced: this can
         only ever move a link forward. */
      var inMarkup = (el.getAttribute('href') || '').match(/\/download\/v?(\d+\.\d+\.\d+)\//);
      if (inMarkup && older(hit.version, inMarkup[1])) continue;

      el.href = hit.url;

      var pill = el.querySelector('[data-latest-pill]');
      if (pill) pill.textContent = 'Windows · v' + hit.version;

      /* The rules-hub call-to-action carries its version and date in a
         sibling line rather than a pill inside the link. */
      var metaSel = el.getAttribute('data-latest-meta');
      var meta = metaSel ? document.querySelector(metaSel) : null;
      if (meta) {
        var when = stamp(hit.published);
        meta.textContent = 'v' + hit.version + (when ? ' · Last updated ' + when : '');
      }
    }
  }

  function run() {
    if (!document.querySelector('[data-latest]')) return;

    try {
      var cached = JSON.parse(sessionStorage.getItem(CACHE));
      if (cached && cached.at && Date.now() - cached.at < CACHE_TTL) {
        apply(cached.releases);
        return;
      }
    } catch (e) { /* private mode, storage disabled, or an older cache shape */ }

    fetch(API, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (releases) {
        if (!releases || !releases.length) return;
        try {
          sessionStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), releases: releases }));
        } catch (e) {}
        apply(releases);
      })
      .catch(function () { /* offline or rate-limited: the markup stands */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
