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
  /* Bumped when the guard below changes, because sessionStorage outlives
     a reload - a hard one included - so a reader mid-session would keep
     being served the cached feed the old guard failed to protect them
     from. -v2 dropped everything written before the guard existed; -v3
     drops everything written while it could only read the Character
     Creator's version out of the markup. */
  var CACHE = '20below-releases-v3';
  var CACHE_TTL = 15 * 60 * 1000;

  var PRODUCTS = {
    creator: { tag: /^v(\d+\.\d+\.\d+)$/,                asset: /^20-below-desktop_.*\.exe$/ },
    tracker: { tag: /^combat-tracker-v(\d+\.\d+\.\d+)$/, asset: /^20-below-combat-tracker_.*\.exe$/ },
    brewery: { tag: /^brewery-v(\d+\.\d+\.\d+)$/,        asset: /^20-below-brewery_.*\.exe$/ },
    /* Released as encounter-prep before the rename, so both asset names are
       accepted - otherwise the older release would match the tag, find no
       asset, and leave the link untouched for no visible reason. */
    prep:    { tag: /^prep-v(\d+\.\d+\.\d+)$/,           asset: /^20-below-encounter-(difficulty-calculator|prep)_.*\.exe$/ },
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

  /* The feed is NOT ordered newest-first, whatever the API docs imply.
     Asked for the Brewery on 2026-09-09 it returned 0.3.9 ahead of
     0.3.10, which is tag order, not release order - so taking the first
     match served a version older than the one that existed. Every
     candidate is compared instead. A draft or prerelease is skipped
     rather than offered. */
  function pick(releases, spec) {
    var best = null;
    for (var i = 0; i < releases.length; i++) {
      var r = releases[i];
      if (r.draft || r.prerelease) continue;
      if (!spec.tag.test(r.tag_name || '')) continue;
      for (var j = 0; j < (r.assets || []).length; j++) {
        if (spec.asset.test(r.assets[j].name)) {
          var found = {
            version: spec.tag.exec(r.tag_name)[1],
            url: r.assets[j].browser_download_url,
            published: r.published_at,
          };
          if (!best || older(best.version, found.version)) best = found;
          break;
        }
      }
    }
    return best;
  }

  /* "0.9.5" is older than "0.10.1", and "0.3.9" is older than "0.3.10" -
     string comparison gets both wrong, so
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
         only ever move a link forward.

         And it only half worked. The tag sits between /download/ and the
         asset, and three products out of four prefix it with their own
         name - brewery-v0.3.20, combat-tracker-v0.2.7, prep-v0.2.4.
         Allowing only an optional "v" ahead of the digits read the
         version for the Character Creator, whose tag is a bare v0.10.14,
         and for none of the others: the guard could not fire on the three
         links most likely to need it, and a stale cache went on
         downgrading them. The page served v0.3.19 on the day v0.3.20
         shipped, from markup that already said v0.3.20. */
      var inMarkup = (el.getAttribute('href') || '')
        .match(/\/download\/[^/]*?v?(\d+\.\d+\.\d+)\//);
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
