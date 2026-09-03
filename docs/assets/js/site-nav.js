/* The mobile nav toggle, in one place.
 *
 * Was inline in every page that had a nav. Guarded so it is harmless on
 * a page that has no nav, and so a missing toggle button can never throw
 * and take the rest of a page's scripts down with it.
 */
(function () {
  'use strict';

  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* Close on Escape, and return focus to the button - otherwise an open
     menu on a phone traps you until you find the toggle again. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !links.classList.contains('open')) return;
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  });
})();
