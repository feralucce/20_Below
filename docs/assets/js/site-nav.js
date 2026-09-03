/* The site nav's behaviour: the mobile toggle, and the dropdown menus.
 *
 * Was inline in every page that had a nav. Guarded throughout, so it is
 * harmless on a page with no nav and a missing element can never throw
 * and take the rest of a page's scripts down with it.
 */
(function () {
  'use strict';

  /* ---- mobile toggle ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---- dropdowns ----
   *
   * Hover alone was not enough. The menu vanished the instant the pointer
   * left the label - crossing the gap to the panel, clipping a corner, or
   * overshooting an item all dismissed it before it could be used. And a
   * tablet wide enough to miss the mobile breakpoint has no hover at all,
   * so those menus could not be opened by any means.
   *
   * So: open on pointer or focus, and close on a timer that any re-entry
   * cancels. CSS keeps :hover and :focus-within as well, so with
   * JavaScript off the menus still work, just without the grace period.
   */
  var CLOSE_DELAY = 450;
  var items = document.querySelectorAll('.site-nav .has-dropdown');

  function closeAll(except) {
    for (var i = 0; i < items.length; i++) {
      if (items[i] !== except) items[i].classList.remove('open');
    }
  }

  Array.prototype.forEach.call(items, function (li) {
    var timer = null;

    function open() {
      clearTimeout(timer);
      closeAll(li);
      li.classList.add('open');
    }

    function scheduleClose() {
      clearTimeout(timer);
      timer = setTimeout(function () { li.classList.remove('open'); }, CLOSE_DELAY);
    }

    li.addEventListener('mouseenter', open);
    li.addEventListener('mouseleave', scheduleClose);
    /* Keyboard: tabbing into the panel keeps it open, tabbing out closes
       it on the same delay, which also covers moving between siblings. */
    li.addEventListener('focusin', open);
    li.addEventListener('focusout', scheduleClose);
  });

  /* Escape closes whatever is open and returns focus somewhere sensible. */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;

    var openItem = document.querySelector('.site-nav .has-dropdown.open');
    if (openItem) {
      openItem.classList.remove('open');
      var label = openItem.querySelector('a');
      if (label) label.focus();
      return;
    }

    if (links && links.classList.contains('open')) {
      links.classList.remove('open');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    }
  });
})();
