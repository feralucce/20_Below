// The character sheet as the five printed pages, filled in live.
//
// The art and the field map are generated together from one set of
// numbers (scratchpad/build.py emits both), so nothing here knows where
// anything sits on the page - it reads fields.json and lays a control
// over each named rectangle. Move a block in the generator and this
// follows without being touched.
//
// Coordinates in the map are the page's own 2550 x 3300 space, and a
// page is drawn at exactly that size - the stylesheet fixes --u, one
// page unit, at one pixel, and the panel scrolls. Sizes below are
// therefore written in page units throughout and need no conversion.

import { el } from '../ui.js';
import {
  adderLabels,
  optionWithChoice,
  boonNotes,
  flawNotes,
  giftNotes,
  fateTokenCap,
  xpSpent,
} from '../state.js';
import {
  coversZone,
  SKILL_ELEMENT_COLOURS,
  scarsOfKind,
  named,
  FIGURED_KEYS,
  movementFigures,
  sheetContext,
  vitalStatuses,
  sheetActions,
} from './sheet-model.js';

export const PAGE_W = 2550;
export const PAGE_H = 3300;
const PAGES = 5;

let fieldMap = null;
let repeats = [];
// The build the map came from. Hung off every image URL below, because
// the map is fetched fresh and an <img> is not: without it a browser
// pairs the new field positions with the page art it already had, and
// the result looks like a layout bug rather than a stale file.
let artVersion = '';

export async function loadFieldMap() {
  if (fieldMap) return fieldMap;
  // Always revalidate. The map says where every control goes and the
  // page art says where everything is drawn; a cached map paired with
  // fresh art puts every value in the wrong place, and it looks like a
  // layout bug rather than a stale file.
  const res = await fetch(new URL('./fields.json', import.meta.url), { cache: 'no-cache' });
  const doc = await res.json();
  fieldMap = doc.fields;
  artVersion = doc.version || '';
  // Pages that are templates rather than fixed pages, e.g. Gifts, which
  // repeats when a character has more than one page of them.
  repeats = doc.repeat || [];
  return fieldMap;
}

// How many sheets to draw, and what each one is. A repeating page appears
// as many times as the character needs it, at least once, and each copy
// carries the slot offset its fields should read from.
function pageSequence(counts) {
  const views = [];
  for (let page = 1; page <= PAGES; page += 1) {
    const rule = repeats.find((r) => r.page === page);
    if (!rule) {
      views.push({ page, offset: 0 });
      continue;
    }
    const held = counts[rule.group] ?? 0;
    const copies = Math.max(1, Math.ceil(held / rule.slots));
    for (let c = 0; c < copies; c += 1) {
      views.push({ page, offset: c * rule.slots, group: rule.group, copy: c, copies });
    }
  }
  return views;
}

// ---------------------------------------------------------------------------
// what goes in each named rectangle
// ---------------------------------------------------------------------------

function readField(id, ctx) {
  const { state, data, figured } = ctx;
  const part = id.split('.');

  switch (part[0]) {
    case 'attribute':
      return state.attributes[part[1]];
    case 'substat':
      return part[2] === 'value'
        ? state.subStats[part[1]]
        : (state.descriptors[part[1]] || []).filter(Boolean).join(', ');
    case 'descriptors':
      return (state.descriptors[part[1]] || []).filter(Boolean).join(', ');
    case 'figured':
      if (part[1] === 'Movement') return movementFigures(state, figured, ctx.armour).rate;
      return figured[FIGURED_KEYS[part[1]]];
    case 'nature': {
      // A picked Nature keeps its Drive and its example trigger in the
      // rules rather than on the character, so only a custom one carries
      // its own. Reading just the custom half left both blank for every
      // character who took one off the list.
      const n = state.nature;
      const picked = n.picked ? (data.natures || []).find((x) => x.name === n.picked) : null;
      if (part[1] === 'nature') return n.picked ?? n.custom?.label ?? '';
      if (part[1] === 'the_drive') return picked?.drive ?? n.custom?.drive ?? '';
      // Every trigger in the book opens "Take a Fate Token when ..." -
      // true, and a waste of the only line the sheet can spare for it.
      // The block is already captioned with what it is.
      return (picked?.example ?? n.custom?.trigger ?? '')
        .replace(/^\s*take a fate token when\s*/i, '')
        .replace(/^./, (c) => c.toUpperCase());
    }
    case 'vital': {
      const map = {
        health: ['currentHealth', 'Health Levels'],
        poise: ['currentPoise', 'Poise'],
        sanity: ['currentSanity', 'Sanity'],
      }[part[1]];
      if (part[2] === 'max') return figured[map[1]];
      return state[map[0]];
    }
    case 'pool': {
      if (part[1] === 'ki') {
        return part[2] === 'max' ? figured.Ki : state.currentKi;
      }
      if (part[2] === 'spent') return state.fateSpentThisScene ?? 0;
      return part[2] === 'max' ? fateTokenCap(state, data) : state.currentFateTokens;
    }
    case 'exhausted':
      return state.exhausted ?? 0;
    case 'skill': {
      const s = ctx.skills[Number(part[1])];
      if (!s) return part[2] === 'tier' ? 0 : '';
      // The Jack of all Trades row, first on the list, stands for every
      // Skill not bought; its name is the Boon's, which fits the row.
      if (part[2] !== 'tier' && s.joat) return 'Jack of all Trades';
      return part[2] === 'tier' ? s.tier : s.name;
    }
    case 'boon': {
      const b = state.boons[Number(part[1])];
      if (!b) return '';
      return part[2] === 'points' ? b.points : named(b.name, boonNotes(b));
    }
    case 'flaw': {
      const f = ctx.flaws[Number(part[1])];
      if (!f) return part[2] === 'level' ? 0 : '';
      if (part[2] === 'level') return f.level;
      return named(f.name, flawNotes(f));
    }
    case 'resource': {
      const r = ctx.resources[Number(part[1])];
      if (!r) return part[2] === 'level' ? 0 : '';
      if (part[2] === 'level') return r.level;
      if (part[2] === 'now') return r.now;
      if (part[2] === 'spent') return r.zeroed;
      return r.name;
    }
    case 'gift': {
      const g = ctx.gifts[Number(part[1])];
      if (!g) return part[2] === 'level' ? 0 : '';
      if (part[2] === 'level') return g.level;
      if (part[2] === 'name') return named(g.name, giftNotes(g));
      if (part[2] === 'ki') return ctx.giftKi(g);
      if (part[2] === 'does') return ctx.giftText(g);
      // An option that made a choice at creation says what it chose.
      if (part[2] === 'adders') {
        return adderLabels(g.adders).map((l) => optionWithChoice(g, l, l.replace(/ ×\d+$/, ''))).join(', ');
      }
      return (g.limiters || []).map((l) => optionWithChoice(g, l)).join(', ');
    }
    case 'weapon': {
      const w = ctx.weapons[Number(part[1])];
      return w ? (w[part[2]] ?? '') : '';
    }
    case 'armour': {
      const a = ctx.armour[Number(part[1])];
      if (!a) return part[2] === 'health' ? 0 : '';
      if (part[2] === 'health') return a.current ?? a.health;
      if (['com', 'head', 'arms', 'legs'].includes(part[2])) return coversZone(a.zone, part[2]);
      if (part[2] === 'broken') return !!a.broken;
      if (part[2] === 'hardness') return a.hardness;
      return a.name;
    }
    case 'gear':
      return ctx.gear[Number(part[1])] ?? '';
    case 'scar': {
      const s = scarsOfKind(state, part[1])[Number(part[2])];
      if (!s) return part[3] === 'below' ? false : '';
      return part[3] === 'below' ? !!s.belowZero : (s.title || s.description || '');
    }
    case 'name':
      return state.name || '';
    case 'concept':
      return state.concept || '';
    case 'backstory':
      return state.backstory || '';
    case 'notes':
      return state.finishingNotes || '';
    case 'xp':
      if (part[1] === 'earned') return state.xpEarned;
      if (part[1] === 'spent') return xpSpent(state, data);
      return state.xpEarned - xpSpent(state, data);
    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// drawing a control over a rectangle
// ---------------------------------------------------------------------------

// The pages are the whole sheet now, so anything that used to be typed
// into a tab has to be typeable here. These are the fields a player
// writes rather than builds: the free text, and the scar log, which is
// the one thing on the sheet that is only ever earned in play.
function editableFor(id, ctx) {
  const { state } = ctx;
  if (id === 'backstory') {
    return { get: () => state.backstory || '', set: (v) => { state.backstory = v; } };
  }
  if (id === 'notes') {
    return { get: () => state.finishingNotes || '', set: (v) => { state.finishingNotes = v; } };
  }
  if (id === 'xp.earned') {
    return {
      get: () => String(state.xpEarned ?? 0),
      set: (v) => { state.xpEarned = Math.max(0, Number(v) || 0); },
      numeric: true,
    };
  }
  const scar = id.match(/^scar\.(\w+)\.(\d+)\.text$/);
  if (scar) {
    const [, kind, idx] = scar;
    const i = Number(idx);
    return {
      get: () => scarsOfKind(state, kind)[i]?.title || '',
      set: (v) => {
        const list = scarsOfKind(state, kind);
        const existing = list[i];
        if (existing) {
          if (v.trim()) existing.title = v;
          else state.scars = state.scars.filter((s2) => s2 !== existing);
          return;
        }
        if (!v.trim()) return;
        const nextId = (state.scars || []).reduce((m, s2) => Math.max(m, s2.id || 0), 0) + 1;
        state.scars.push({
          id: nextId, kind, physical: kind === 'battle', title: v, description: '',
          belowZero: false,
        });
      },
    };
  }
  return null;
}

function editControl(f, binding, persist, rebuild) {
  const multi = f.kind === 'para';
  const node = el(multi ? 'textarea' : 'input', {
    class: multi ? 'sf sf-para sf-edit' : 'sf sf-text sf-edit',
    type: multi ? undefined : (binding.numeric ? 'number' : 'text'),
    onInput: (e) => { binding.set(e.target.value); persist(); },
    // Typing cannot redraw the sheet - that would take the caret with it -
    // so anything the new text should bring with it lands on the way out.
    onChange: rebuild ? () => rebuild() : null,
  });
  node.value = binding.get();
  if (multi) {
    const pitch = f.h / (f.lines || 1);
    node.style.fontSize = typeSize(pitch * 0.52, 9, pitch * 0.8);
    node.style.lineHeight = `calc(var(--u) * ${pitch})`;
  } else {
    // Sized for two figures at least, so typing a second digit does not
    // make the box jump.
    const sample = binding.numeric ? String(binding.get()).padStart(2, '0') : binding.get();
    node.style.fontSize = fitSize(f, Math.min(f.h * 0.7, 42), sample);
  }
  return place(node, f);
}

// The art already prints what 0 and below mean beside each Vital. This
// lights the word that is true right now, in the Vital's own colour, by
// laying an identical line over the printed one with every other word
// left transparent - so it lines up to the letter without the art
// having to know anything. Dead has no word of its own on the line and
// is added to the end of it.
const VITAL_LINES = [
  { y: 2766, colour: '#6FBF73', words: ['UNCONSCIOUS', ', ', 'DYING'] },
  { y: 2886, colour: '#E0A85C', words: ['FLUSTERED', ', ', 'HUMILIATED'] },
  { y: 3006, colour: '#6FB8E0', words: ['OVERWHELMED', ', ', 'SHATTERED'] },
];
const SVG_NS = 'http://www.w3.org/2000/svg';

function vitalStatusLayer(state, figured) {
  const v = vitalStatuses(state, figured);
  const statuses = [v.health, v.poise, v.sanity];

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 2550 3300');
  svg.setAttribute('class', 'sheet-status');
  svg.setAttribute('aria-hidden', 'true');
  VITAL_LINES.forEach((line, i) => {
    const status = statuses[i];
    if (!status) return;
    const text = document.createElementNS(SVG_NS, 'text');
    Object.entries({
      x: 867, y: line.y, 'font-size': 29, 'letter-spacing': 2.7,
      'font-family': "'Segoe UI', Montserrat, system-ui, sans-serif",
    }).forEach(([k, v]) => text.setAttribute(k, v));
    const lit = status === 'Dead' ? 'DYING' : status.toUpperCase();
    line.words.forEach((word) => {
      const span = document.createElementNS(SVG_NS, 'tspan');
      span.textContent = word;
      if (word === lit && status !== 'Dead') {
        span.setAttribute('fill', line.colour);
        span.style.color = line.colour;
        span.setAttribute('class', 'sheet-status-lit');
      } else {
        span.setAttribute('fill', 'transparent');
      }
      text.appendChild(span);
    });
    if (status === 'Dead') {
      const dead = document.createElementNS(SVG_NS, 'tspan');
      dead.textContent = '  DEAD';
      dead.setAttribute('fill', '#E0685C');
      dead.style.color = '#E0685C';
      dead.setAttribute('class', 'sheet-status-lit');
      text.appendChild(dead);
    }
    svg.appendChild(text);
  });
  return svg;
}

function sheetNotice(text) {
  document.querySelector('.sheet-notice')?.remove();
  const node = el('div', { class: 'sheet-notice', role: 'status' }, text);
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 6000);
}

function place(node, f) {
  node.style.left = `calc(var(--u) * ${f.x})`;
  node.style.top = `calc(var(--u) * ${f.y})`;
  node.style.width = `calc(var(--u) * ${f.w})`;
  node.style.height = `calc(var(--u) * ${f.h})`;
  return node;
}

// What a character actually is has to stay readable however small the
// page is drawn, so every value carries a floor in real pixels. It is a
// low one on purpose: raise it much past the height of the box the value
// sits in and the text starts overrunning the art around it, which costs
// more than the size gains.

const FLOOR = 10;

// The floor is for a page drawn at a readable size. On a phone the whole
// page shrinks with the screen, and a 10px floor there is taller and wider
// than the box it sits in - a two-digit number came out as "1..". So the
// floor never wins against the box: `cap` is the largest the value can be
// and still fit, and it is measured in page units, so it shrinks with the
// page like everything else.
function typeSize(units, floor = FLOOR, cap = units) {
  return `min(calc(var(--u) * ${cap}), max(${floor}px, calc(var(--u) * ${units})))`;
}

// Montserrat's figures run a little over 0.6em wide. A value is sized to
// its own length, so "10" in an Element panel shrinks to fit rather than
// losing its second digit. Short values only - anything longer than a
// number is a name, and a name is allowed its ellipsis rather than being
// shrunk to nothing.
const FIGURE_EM = 0.64;
function fitSize(f, units, text) {
  let fit = f.h * 0.85;
  const chars = String(text).length;
  if (chars > 0 && chars <= 4) fit = Math.min(fit, (f.w * 0.92) / (chars * FIGURE_EM));
  return typeSize(Math.min(units, fit), FLOOR, fit);
}

function textControl(f, value) {
  const text = String(value ?? '');
  // The whole value stays reachable on hover even when the box cannot
  // hold it - a name that ends in an ellipsis should still be readable.
  const node = el('div', { class: 'sf sf-text', title: text }, el('span', { class: 'sf-clip' }, text));
  // A field can ask for its own size - an Element's rating is the whole
  // point of its panel and is set far larger than a row of text.
  node.style.fontSize = fitSize(f, f.size ?? Math.min(f.h * 0.7, 42), text);
  if (f.align === 'end') node.classList.add('sf-right');
  else if (f.centre || f.w <= 120) node.classList.add('sf-centre');
  return place(node, f);
}

function paraControl(f, value) {
  const node = el('div', { class: 'sf sf-para' }, String(value ?? ''));
  const pitch = f.h / (f.lines || 1);
  node.style.fontSize = typeSize(pitch * 0.52, 9, pitch * 0.8);
  node.style.lineHeight = `calc(var(--u) * ${pitch})`;
  return place(node, f);
}

// Pips show where the character is; they do not set it. The - and +
// beside each Vital do that, because a row of fifteen boxes is a poor
// place to land a precise click and an easy place to lose a Health Level
// by brushing the trackpad.
function pipControl(f, filled) {
  const wrap = el('div', { class: 'sf sf-pips' });
  if (f.color) wrap.style.color = f.color;
  for (let i = 0; i < f.n; i += 1) {
    const pip = el('div', { class: i < filled ? 'sf-pip on' : 'sf-pip' });
    pip.style.left = `calc(var(--u) * ${i * (f.size + f.gap)})`;
    pip.style.width = `calc(var(--u) * ${f.size})`;
    pip.style.height = `calc(var(--u) * ${f.size})`;
    wrap.appendChild(pip);
  }
  return place(wrap, f);
}

// Tier boxes start at Trained, so a tier of 3 fills the first two.
function tierControl(f, tier) {
  const wrap = el('div', { class: 'sf sf-pips' });
  if (f.color) wrap.style.color = f.color;
  for (let i = 0; i < f.n; i += 1) {
    const on = tier >= f.base + i;
    const pip = el('div', { class: on ? 'sf-pip on' : 'sf-pip' });
    pip.style.left = `calc(var(--u) * ${i * (f.size + f.gap)})`;
    pip.style.width = `calc(var(--u) * ${f.size})`;
    pip.style.height = `calc(var(--u) * ${f.size})`;
    wrap.appendChild(pip);
  }
  return place(wrap, f);
}

function checkControl(f, on) {
  const node = el('div', { class: on ? 'sf sf-check on' : 'sf sf-check' });
  if (f.color) node.style.color = f.color;
  return place(node, f);
}

// ---------------------------------------------------------------------------
// the page stack
// ---------------------------------------------------------------------------

export function buildPagedSheet(state, data, opts = {}) {
  const {
    refresh = () => {}, persist = () => {}, onRoll = () => {}, onAddItem = () => {},
  } = opts;
  if (!fieldMap) throw new Error('loadFieldMap() must resolve before building the sheet');

  const ctx = sheetContext(state, data);
  const { figured, armour } = ctx;

  const set = (fn) => { fn(); persist(); refresh(); };
  const act = sheetActions(state, data, figured, sheetNotice);
  const STEPPERS = act.steppers;

  function decorate(f, host) {
    const id = f.id;

    // A Gift's description box opens the whole Gift as this character has
    // it - the Level's effect, what was bought from a build menu, and each
    // Adder and Limiter with its rules - because the box only has room for
    // a line of it.
    const giftDoes = id.match(/^gift\.(\d+)\.does$/);
    if (giftDoes) {
      const g = ctx.gifts[Number(giftDoes[1])];
      if (!g) return;
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll sf-explain',
        title: `What ${g.name} does`,
        onClick: () => onRoll('gift-info', g.name, { gift: g }),
      }), f));
      return;
    }

    // Movement Rate is one number on the page and seven at the table.
    // Clicking it opens the rest, worked out for this character.
    if (id === 'figured.Movement') {
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: 'Movement: Dash, Sprint, jumps and travel',
        onClick: () => onRoll('movement', 'Movement', movementFigures(state, figured, armour)),
      }), f));
      return;
    }

    // Armour loses at most one Health Level an attack and breaks at 0
    // (rules.md, Armor & Called Shots). The - takes one, the + repairs one.
    const dent = id.match(/^armour\.(\d+)\.health\.(minus|plus)$/);
    if (dent) {
      const a = armour[Number(dent[1])];
      if (!a || !a.health) return;
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-step',
        title: dent[2] === 'minus' ? 'take one Health Level' : 'repair one Health Level',
        onClick: () => set(() => act.dentArmour(a, dent[2] === 'minus' ? 1 : -1)),
      }), f));
      return;
    }

    // A new Scene clears the tally. The box is the one thing on the page
    // that is only ever about this Scene, so it is what gets clicked.
    if (id === 'pool.fate.spent') {
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: 'New Scene: reset the Fate Tokens spent this Scene to 0',
        onClick: () => set(() => { state.fateSpentThisScene = 0; }),
      }), f));
      return;
    }

    const step = id.match(/^(.*)\.(minus|plus)$/);
    if (step && STEPPERS[step[1]]) {
      const by = step[2] === 'plus' ? 1 : -1;
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-step',
        title: step[2] === 'plus' ? 'up one' : 'down one',
        onClick: () => set(() => act.step(step[1], by)),
      }), f));
      return;
    }

    // Adding kit belongs in the block the kit lands in. The art draws
    // the pill; this is only the hit target over it.
    const ADDS = {
      'weapon.add': ['weapon', 'Add a weapon'],
      'armour.add': ['armour', 'Add armour'],
      'equipment.add': ['equipment', 'Add equipment'],
    };
    if (ADDS[id]) {
      const [kind, title] = ADDS[id];
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title,
        onClick: () => onAddItem(kind),
      }), f));
      return;
    }

    // Resting is the one thing that moves several tracks at once, so it
    // is a button on the sheet rather than a number to walk down by hand.
    // A new Scene clears the Fate Token tally - the per-Scene limit is
    // Stamina spends, and this is where the count starts over.
    // The one roller, on every page. Which page opened it goes along, so
    // the roller can start on what that page is about.
    if (id === 'dice.roll') {
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: 'Roll dice',
        onClick: () => onRoll('dice', 'Roll dice', { page: f.page }),
      }), f));
      return;
    }

    if (id === 'scene.new') {
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: 'New Scene: Fate Tokens spent this Scene back to 0',
        onClick: () => set(() => act.newScene()),
      }), f));
      return;
    }

    if (id === 'rest.short' || id === 'rest.long') {
      const full = id === 'rest.long';
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: full ? "A full night's rest" : 'A short rest',
        onClick: () => {
          if (act.rest(full)) { persist(); refresh(); }
        },
      }), f));
      return;
    }

    const below = id.match(/^scar\.(\w+)\.(\d+)\.below$/);
    if (below) {
      // The box means one thing: this scar went below zero, so it carries
      // a Flaw until it heals. It never creates a scar and never fills
      // itself - write the scar in the row first, then tick it if that is
      // what happened. Every crossing leaves a scar; only some go below.
      const entry = scarsOfKind(state, below[1])[Number(below[2])];
      if (!entry) return;
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: 'This scar went below 0 - it carries a Flaw until it heals',
        onClick: () => set(() => { entry.belowZero = !entry.belowZero; }),
      }), f));
    }
  }

  // Whether a field is something you can roll, and what rolling it means.
  // Asked twice: once to reserve room at the end of the row for the dice,
  // and once to put them there. One answer, so the two cannot disagree.
  //
  const stack = el('div', { class: 'sheet-pages' });
  const views = pageSequence({ gift: ctx.gifts.length });

  // A repeated page shows the same slots again, reading further down the
  // character's list. Rewriting the index here means every field, every
  // roll target and every control follows without knowing repeats exist.
  const shift = (id, view) => {
    if (!view.group || !id.startsWith(`${view.group}.`)) return id;
    const part = id.split('.');
    part[1] = String(Number(part[1]) + view.offset);
    return part.join('.');
  };

  views.forEach((view, index) => {
    const { page } = view;
    const pageEl = el('div', { class: 'sheet-page' });
    // Which printed page this is, and which copy of it - the tabs name
    // pages by what is on them.
    pageEl.dataset.page = String(page);
    if (view.copies > 1) {
      pageEl.dataset.copy = String(view.copy + 1);
      pageEl.dataset.copies = String(view.copies);
    }
    const stamp = artVersion ? `?v=${artVersion}` : '';
    pageEl.style.backgroundImage = `url(${new URL(`./bg${page}.jpg${stamp}`, import.meta.url)})`;
    pageEl.appendChild(el('img', {
      class: 'sheet-art',
      src: String(new URL(`./page${page}.svg${stamp}`, import.meta.url)),
      alt: `Character sheet page ${index + 1}`,
    }));

    const overlay = el('div', { class: 'sheet-overlay' });
    const onPage = fieldMap.filter((f) => f.page === page);

    onPage.forEach((f) => {
      // The page number is the one thing that cannot be printed into the
      // art, because how many pages there are depends on the character.
      if (f.id === 'page.number') {
        overlay.appendChild(textControl(f, `PAGE ${index + 1} OF ${views.length}`));
        return;
      }
      const id = shift(f.id, view);
      const value = readField(id, ctx);
      const editable = editableFor(id, ctx);
      if (editable) {
        // A scar written into an empty row is a new scar, and its own
        // tick box only exists once the sheet has been drawn again.
        overlay.appendChild(editControl(f, editable, persist,
          id.startsWith('scar.') ? refresh : null));
      }
      else if (f.kind === 'text') {
        const node = textControl(f, value);
        // A Skill says which Element it rolls on, beside its name - the
        // number a player adds is the Element's, so it has to be in reach.
        const skillRow = id.match(/^skill\.(\d+)\.name$/);
        const skill = skillRow && ctx.skills[Number(skillRow[1])];
        if (skill?.joat) node.title = 'Jack of all Trades: every Skill not listed here rolls at Trained';
        if (skill?.element) {
          const known = SKILL_ELEMENT_COLOURS[skill.element];
          const tag = el('span', { class: 'sf-el' }, known || skill.retired ? skill.element : 'Any');
          tag.title = skill.retired ? `${skill.name} is ${skill.note}`
            : known ? `Rolls on ${skill.element}` : 'Rolls on whichever Element fits';
          if (known) tag.style.color = known;
          node.classList.add('sf-skill');
          node.appendChild(tag);
          // Name and tag share the row. A long name gives up
          // type size rather than letters, so "Combat Driving/Piloting"
          // is read whole instead of ending in an ellipsis. The widths are
          // Montserrat's average letter and the tag's small capitals, in em.
          const room = f.w;
          const ems = String(value).length * 0.62 + 0.5 + tag.textContent.length * 0.6 * 0.8;
          const base = Math.min(f.h * 0.7, 42);
          const fit = Math.min(base, (room * 0.97) / ems);
          if (fit < base) node.style.fontSize = typeSize(fit, 7, fit);
        }
        overlay.appendChild(node);
      }
      else if (f.kind === 'para') overlay.appendChild(paraControl(f, value));
      else if (f.kind === 'pips') overlay.appendChild(pipControl(f, Number(value) || 0));
      else if (f.kind === 'tiers') overlay.appendChild(tierControl(f, Number(value) || 0));
      else if (f.kind === 'check') overlay.appendChild(checkControl(f, !!value));
      decorate({ ...f, id }, overlay);
    });

    if (page === 1) pageEl.appendChild(vitalStatusLayer(state, figured));
    pageEl.appendChild(overlay);
    stack.appendChild(pageEl);
  });

  // Every size on the page is written in page units; this is what a unit
  // is worth right now.
  // Nothing to measure: a page is drawn at its own size and the
  // stylesheet fixes one page unit at one pixel.

  return stack;
}

export { readField };
