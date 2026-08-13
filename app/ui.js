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

// A labeled +/- counter row. `get`/`set` read and write the current value;
// `min`/`max` may be numbers or functions of no args (re-evaluated on every
// render so they can depend on pool remaining elsewhere in the app).
export function counterRow({ name, hint, get, set, min = 0, max = 99, onChange }) {
  const row = el('div', { class: 'counter-row' });
  const nameEl = el('span', { class: 'name' }, hint ? `${name} (${hint})` : name);
  const valueEl = el('span', { class: 'value' }, String(get()));
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
  return row;
}

export function renderMarkdown(md) {
  if (window.marked) return window.marked.parse(md);
  return `<pre>${md}</pre>`;
}

export function poolBadge(label, remaining) {
  const cls = remaining < 0 ? 'pool negative' : 'pool';
  return el('span', { class: cls }, `${label}: ${remaining}`);
}
