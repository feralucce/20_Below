// Small reusable DOM helpers shared by every step module.

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value !== undefined && value !== null) {
      node.setAttribute(key, value);
    }
  });
  (Array.isArray(children) ? children : [children]).forEach((child) => {
    if (child == null) return;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });
  return node;
}

// Wires a name element to show/hide a detail element on click - the "click
// the name, its description twirls out" interaction shared by Boons'
// Available list, Gifts/Resources/Flaws' Available list (description) and
// Gifts' Selected list (adders/limiters). Kept separate from the +/- clicks
// on a counterRow, which live in sibling buttons untouched by this.
export function makeTwirl(nameEl, detailEl, { startOpen = false } = {}) {
  nameEl.classList.add('name-toggle');
  let open = startOpen;
  detailEl.style.display = open ? '' : 'none';
  nameEl.classList.toggle('open', open);
  nameEl.addEventListener('click', () => {
    open = !open;
    detailEl.style.display = open ? '' : 'none';
    nameEl.classList.toggle('open', open);
  });
  return { get open() { return open; } };
}

// A labeled +/- counter row. `get`/`set` read and write the current numeric
// value; `min`/`max` may be numbers or functions of no args (re-evaluated on
// every render so they can depend on pool remaining elsewhere in the app).
// `format`, if given, renders the displayed value (e.g. a tier number as its
// tier name) without changing the underlying numeric get/set/min/max logic.
// `detail`, if given, is an element hidden by default and twirled open by
// clicking the name (via makeTwirl) - the row itself (name + counter) always
// stays visible either way.
export function counterRow({ name, hint, get, set, min = 0, max = 99, format, onChange, detail }) {
  const row = el('div', { class: 'counter-row' });
  const nameEl = el('span', { class: 'name' }, hint ? `${name} (${hint})` : name);
  const valueEl = el('span', { class: 'value' }, format ? format(get()) : String(get()));
  const resolvedMin = typeof min === 'function' ? min() : min;
  const resolvedMax = typeof max === 'function' ? max() : max;
  const minusBtn = el('button', {
    type: 'button',
    text: '−',
    disabled: get() <= resolvedMin ? '' : undefined,
    onClick: () => {
      if (get() > (typeof min === 'function' ? min() : min)) {
        set(get() - 1);
        onChange?.();
      }
    },
  });
  const plusBtn = el('button', {
    type: 'button',
    text: '+',
    disabled: get() >= resolvedMax ? '' : undefined,
    onClick: () => {
      if (get() < (typeof max === 'function' ? max() : max)) {
        set(get() + 1);
        onChange?.();
      }
    },
  });
  row.append(nameEl, minusBtn, valueEl, plusBtn);
  if (!detail) return row;
  makeTwirl(nameEl, detail);
  return el('div', {}, [row, detail]);
}

// Splits a catalog into two headed groups - anything currently "selected"
// (per `isSelected`) pops up to a `Selected {label}` list, everything else
// stays down in `Available {label}`. Mirrors the Boons step's Selected/
// Available split for the simpler "one card per catalog entry, 0-5 counter"
// shape used by Skills, Gifts, Resources, and Flaws. `renderCard` builds the
// Available card (name + counter, description twirled out on click);
// `renderSelectedCard` builds the Selected card and defaults to `renderCard`
// if omitted - pass it explicitly when Selected should look different (e.g.
// Gifts twirl adders/limiters there instead of the description). Returns a
// `render()` you can call again after state changes (e.g. a filter box) or
// wire up to call itself via each card's onChange.
export function renderSelectedAvailable(container, { label, getItems, isSelected, renderCard, renderSelectedCard }) {
  const selectedEl = el('div', { class: 'pick-list' });
  const availableEl = el('div', { class: 'pick-list' });
  container.append(
    el('h3', {}, `Selected ${label}`),
    selectedEl,
    el('h3', {}, `Available ${label}`),
    availableEl,
  );
  const selectedRenderer = renderSelectedCard || renderCard;

  function render() {
    selectedEl.innerHTML = '';
    availableEl.innerHTML = '';
    const items = getItems();
    const selected = items.filter(isSelected);
    const available = items.filter((item) => !isSelected(item));
    if (selected.length === 0) {
      selectedEl.appendChild(el('p', { class: 'detail' }, `No ${label} selected yet.`));
    } else {
      selected.forEach((item) => selectedEl.appendChild(selectedRenderer(item)));
    }
    available.forEach((item) => availableEl.appendChild(renderCard(item)));
  }

  render();
  return { render };
}

export function renderMarkdown(md) {
  if (window.marked) return window.marked.parse(md);
  return `<pre>${md}</pre>`;
}

export function poolBadge(label, remaining) {
  const cls = remaining < 0 ? 'pool negative' : 'pool';
  return el('span', { class: cls }, `${label}: ${remaining}`);
}

// Every re-render rebuilds its container from scratch (innerHTML = ''), which
// silently collapses any <details> the reader had twirled open - so clicking a
// +/- inside one closed the card it lived in. Snapshot which are open before
// the wipe and reopen the same ones after.
//
// Keyed by summary text plus its ordinal among identical summaries, so two
// cards with the same name (a Gift and a Skill both called "Flight", say)
// don't restore each other. Nothing here needs the elements to survive, which
// is the point - the new DOM is matched by label, not by identity.
function detailsKeys(root) {
  const seen = new Map();
  const keys = [];
  root.querySelectorAll('details').forEach((d) => {
    const label = d.querySelector('summary')?.textContent ?? '';
    const n = seen.get(label) ?? 0;
    seen.set(label, n + 1);
    keys.push({ el: d, key: `${label}\u0000${n}` });
  });
  return keys;
}

export function captureOpenDetails(root) {
  return new Set(detailsKeys(root).filter(({ el: d }) => d.open).map(({ key }) => key));
}

export function restoreOpenDetails(root, open) {
  if (!open || !open.size) return;
  detailsKeys(root).forEach(({ el: d, key }) => {
    if (open.has(key)) d.open = true;
  });
}
