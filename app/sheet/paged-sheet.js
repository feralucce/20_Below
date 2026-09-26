// Which of the four armour Zones an item's Zone text covers. Characters saved
// before the Zones were split still say "Body", "Body (arms)", "Body + Head".
function coversZone(zone, which) {
  const z = String(zone || '').toLowerCase();
  if (/all four/.test(z)) return true;
  if (which === 'com') return /center of mass/.test(z) || (/\bbody\b/.test(z) && !/\((arms|legs)\)/.test(z));
  if (which === 'head') return /head/.test(z);
  if (which === 'arms') return /arms/.test(z);
  if (which === 'legs') return /legs/.test(z);
  return false;
}

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
  applyRest,
  applyVitalFloor,
  healthStatus,
  poiseStatus,
  sanityStatus,
  boonNotes,
  flawNotes,
  giftNotes,
  computeFiguredCharacteristics,
  effectiveResourceLevel,
  fateTokenCap,
  skillTierName,
  xpSpent,
} from '../state.js';

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
// reading the character
//
// Every block on the sheet is a fixed number of slots, and a character
// has as many entries as they have. These collect the entries once, in
// the order they should print, so slot N on the page is entry N here.
// ---------------------------------------------------------------------------

function takenSkills(state, data) {
  return data.skillCatalog
    .filter((s) => state.skills[s.name] > 0)
    .map((s) => ({ name: s.name, tier: state.skills[s.name] }));
}

function takenResources(state, data) {
  return data.resources
    .filter((r) => state.resources[r.name] > 0)
    .map((r) => ({
      name: r.name,
      level: state.resources[r.name],
      now: effectiveResourceLevel(state, r.name),
      zeroed: !!state.resourceZeroed[r.name],
      // Only six Resources can be pushed; every other one is a standing
      // fact with nothing to roll about (rules/resources.md).
      pushable: !!r.pushable,
    }));
}

function takenGifts(state) {
  return state.gifts.filter((g) => g.level > 0);
}

// The Gift card has room for what a conjured weapon looks like; a cell in
// the Weapons table does not, and a description that runs past the column
// is clipped mid-word. That answer asks for a name and a look together, so
// take the name off the front of it: up to the first dash, sentence end or
// comma, and never more than a cell's worth.
function shortName(text) {
  const first = text.split(/\s+[-–]\s+|(?<=[.!?])\s+|,\s+/)[0].trim();
  const name = first || text.trim();
  return name.length > 40 ? `${name.slice(0, 39).trimEnd()}…` : name;
}

// The gear the character bought, split the way the pages are: anything
// from an Armor table goes to the Armour block, anything with a Damage
// column goes to Weapons, everything else is just carried.
//
// Conjured Armory's weapon is a real item from the catalogue, and its
// Damage is that item's listed rating plus the Gift's Level, uncapped -
// so an Armory attack keeps pace with the Gifts that attack directly
// rather than stalling at the weapon table's ceiling of 5 while
// Onslaught and the rest climb past it. Bonded Blade adds one more, for
// the signature weapon specifically.
const CONJURED_BASE = 3;

function conjuredWeapon(state, catalog) {
  const gift = (state.gifts || []).find((g) => g.name === 'Conjured Armory' && g.level > 0);
  if (!gift) return null;

  // Bonded Blade's edge starts where the Gift's own bonus used to, at
  // Level 3 - the adder is written as "+1 higher than any other weapon
  // you conjure", and below Level 3 there is nothing yet to be higher
  // than.
  const bonded = gift.level >= 3 && (gift.adders || []).includes('Bonded Blade');
  const bonus = gift.level + (bonded ? 1 : 0);

  const notes = (gift.notes || []).filter(Boolean);
  const wanted = (notes[0] || '').trim().toLowerCase();
  const item = wanted && wanted !== 'needs name'
    ? [...catalog.values()].find((x) => x.name.toLowerCase() === wanted)
    : null;

  // A weapon nobody has named yet, or one the catalogue has never heard
  // of. Either way the character still swings something, and a row that
  // cannot be rolled is worse than one carrying the catalogue's own
  // middle rating until the real weapon is filled in. Three is that
  // middle: the most common Damage across the 91 weapons in the tables,
  // and their median.
  const base = item ? Number(item.Damage) : CONJURED_BASE;
  const damage = String((Number.isFinite(base) ? base : CONJURED_BASE) + bonus);

  const called = notes[1] ? notes[1].trim() : '';
  const named = notes[0] && wanted !== 'needs name';
  const label = named
    ? (called ? `${notes[0].trim()} - ${shortName(called)}` : notes[0].trim())
    : 'Conjured Armory - needs name';

  return {
    name: label,
    damage,
    range: item ? (item['Range (Normal / Long)'] || item.Range || '') : 'as listed',
    // Level 1 already says it never runs dry, whatever the weapon is.
    ammo: 'never dry',
    reload: item ? (item.Reload || '') : '-',
  };
}

// Which sub-stat a Gift's dice come from, and which wall they land on.
// Read out of the Gift's own rules text rather than listed here, so a
// Gift added or reworded in the book arrives on the sheet without this
// file being touched. The fallback pairing is the rule's own: Ferocity
// against Soak, Presence against Presence, Psyche against Psyche.
const WALL_FOR = { Ferocity: 'Soak', Presence: 'Presence', Psyche: 'Psyche' };

// No Gift carries a Ki cost as a field - it is written into the level
// that charges it, so the number is read back out of that sentence.
// Nothing to find means nothing to show, not a zero.
function giftKi(gift, data) {
  const entry = (data.gifts || []).find((d) => d.name === gift.name);
  const row = (entry?.levels || []).find((l) => l.level === gift.level);
  // The cost is stated once, at the Level that introduces it - Onslaught
  // says "spend 1 Ki" at Level 1 and never repeats itself - so a Level 3
  // character reading only their own row finds nothing. Fall back to the
  // Gift's whole text rather than leaving a blank where a cost belongs.
  const find = (t) => /(\d+)\s*Ki\b/i.exec(t || '')?.[1];
  return find(row?.effect) || find(entry?.markdown) || '';
}

function giftAttack(entry, gift, subStats) {
  const text = entry?.markdown || '';
  const source = /half (?:your |their )?(Ferocity|Presence|Psyche)/.exec(text)?.[1];
  if (!source) return null;
  const wall = /(?:vs\.?|against) \*\*(Soak|Presence|Psyche)\*\*/.exec(text)?.[1]
    || WALL_FOR[source];
  const range = /\*\*(Melee|Close|Near|Far)\*\* range/.exec(text)?.[1] || '';
  // Level plus half the sub-stat that powers it, rounded down.
  const dice = gift.level + Math.floor((subStats[source] || 0) / 2);
  return { dice, wall, range };
}

// A Signature Move is built rather than looked up: the player picks the
// sub-stat the dice come from and the wall they land on, and the two do
// not have to match - which is how a scream ends up breaking composure.
function signatureAttacks(state, subStats) {
  const gift = (state.gifts || []).find((g) => g.name === 'Signature Move' && g.level > 0);
  if (!gift) return [];
  const moves = Array.isArray(gift.moves) ? gift.moves : [];
  return moves
    .filter((m) => m.source && m.wall)
    .map((m) => ({
      name: m.name ? `${m.name} (Move)` : 'Signature Move',
      damage: `${(m.level || gift.level) + Math.floor((subStats[m.source] || 0) / 2)} vs ${m.wall}`,
      range: '',
      ammo: '1 Ki',
      reload: '-',
    }));
}

function giftWeapons(state, data) {
  const subStats = state.subStats || {};
  const out = [];
  (state.gifts || []).filter((g) => g.level > 0).forEach((g) => {
    if (g.name === 'Conjured Armory' || g.name === 'Signature Move') return;
    const entry = (data.gifts || []).find((d) => d.name === g.name);
    const atk = giftAttack(entry, g, subStats);
    if (!atk) return;
    const told = (g.notes || []).filter(Boolean)[0];
    out.push({
      name: told ? `${g.name} - ${told}` : g.name,
      damage: `${atk.dice} vs ${atk.wall}`,
      range: atk.range,
      ammo: giftKi(g, data) ? `${giftKi(g, data)} Ki` : '',
      reload: '-',
    });
  });
  return out.concat(signatureAttacks(state, subStats));
}

// A package's contents are written as prose: three or four catalogue
// items separated by commas, and on fourteen of the seventy-eight a last
// clause the book marks as flavour - "and a doctor who doesn't file
// paperwork (flavor)". Equipment is a column of slots holding the name of
// a thing, and that clause is not a thing; it is a standing advantage,
// written as a sentence, and it cannot be made to fit one. It stays in
// the package on the Creator's gear step, where there is room to read it,
// and does not take an equipment slot it would run three times over.
function packageItems(contents) {
  return String(contents || '')
    .split(',')
    .map((part) => part.trim().replace(/^and\s+/i, '').replace(/\.$/, '').trim())
    .filter((part) => part && !/\((?:flavor|flavour)\)$/i.test(part));
}

function splitGear(state, data) {
  const catalog = new Map();
  (data.equipment || []).forEach((cat) => {
    cat.items.forEach((item) => {
      if (!catalog.has(item.name)) catalog.set(item.name, { ...item, _cat: cat });
    });
  });

  const weapons = [];
  const armour = [];
  const gear = [];

  // Where one named thing belongs: the Armour block if it is armour, the
  // Weapons block if it has a Damage column, and carried otherwise.
  function file(name, category, own) {
    // Something written in by hand has no catalogue entry to look up, so
    // it brings its own Damage and range with it.
    if (own && own.damage) {
      weapons.push({
        name,
        damage: String(own.damage),
        range: own.range || '',
        ammo: own.ammo || '',
        reload: own.reload || '',
      });
      return;
    }
    if (own && own.hardness) {
      armour.push({
        name,
        zone: own.zone || '',
        hardness: String(own.hardness),
        health: Number(own.health) || 0,
      });
      return;
    }
    const item = catalog.get(name);
    // Armour is whatever has a Zone to cover and a Hardness to cover it
    // with, not whatever sits under a heading called Armor - the Black
    // Market and Beyond the Ordinary suits live under their own headings
    // and were landing in carried gear. Vehicles have a Hardness too, but
    // no Zone, so they stay where they were.
    const parent = item?._cat?.parent || category || '';
    if ((item?.Zone && item?.Hardness) || (!item && /armor|armour/i.test(parent))) {
      armour.push({
        name,
        zone: item?.Zone || '',
        hardness: item?.Hardness || '',
        health: Number(item?.['Health Levels']) || 0,
        // "Movement Rate -2" in the Notes is what the suit costs you.
        slows: Number(String(item?.Notes || '').match(/Movement Rate\s*[-−](\d+)/)?.[1]) || 0,
      });
    } else if (item && item.Damage) {
      weapons.push({
        name,
        damage: item.Damage || '',
        range: item['Range (Normal / Long)'] || item.Range || '',
        ammo: item.Ammo || '',
        reload: item.Reload || '',
      });
    } else {
      gear.push(name);
    }
  }

  (state.gearPurchases || []).forEach((p) => file(p.name, p.category, p));

  // A conjured weapon is not gear a character bought, but it is a weapon
  // they fight with, so it goes where the weapons are - first, because
  // it is the one they call rather than carry.
  const conjured = conjuredWeapon(state, catalog);
  if (conjured) weapons.unshift(conjured);
  // A Gift that attacks is an attack, and attacks belong with the
  // weapons - not buried three pages away on a card.
  weapons.push(...giftWeapons(state, data));

  // A starting package is a list of things, not one thing. Printed as a
  // single line it ran three slots past the edge of the box and was cut
  // off mid-sentence, and the grenade launcher in it never reached the
  // Weapons block. Each entry is filed as though it had been bought.
  Object.values(state.everymanGearPackages || {})
    .sort((a, b) => a.level - b.level)
    .forEach((p) => {
      gear.push(`${p.name} - Level ${p.level} package`);
      packageItems(p.contents).forEach((name) => file(name, ''));
    });
  (state.flavorItems || []).forEach((t) => gear.push(t));

  // Damage is remembered by item, not by row: a row number moves when
  // something is bought or dropped, and the dent would move with it. Two
  // of the same thing are told apart by which one it is.
  const seen = {};
  armour.forEach((a) => {
    seen[a.name] = (seen[a.name] ?? 0) + 1;
    a.key = `${a.name}#${seen[a.name]}`;
    const lost = Number(state.armourDamage?.[a.key]) || 0;
    a.current = Math.max(0, a.health - lost);
    if (a.health > 0 && a.current === 0) a.broken = true;
  });

  return { weapons, armour, gear };
}

// The scar log predates the sheet and only recorded physical or not.
// Reading a `kind` when there is one and falling back to that flag keeps
// every character already saved working, and new scars written from the
// sheet carry the finer split.
function scarsOfKind(state, kind) {
  return (state.scars || []).filter(
    (s) => (s.kind ?? (s.physical ? 'battle' : 'mental')) === kind,
  );
}

// ---------------------------------------------------------------------------
// what goes in each named rectangle
// ---------------------------------------------------------------------------

// A Secret is not "Secret", it is the thing you are hiding; a Notable
// Appearance is what people notice. The creator asks, and the answer is
// the useful half - so the sheet prints it beside the name rather than
// leaving the player to remember which secret this was.
function named(name, notes) {
  const written = (notes || []).filter(Boolean).join('; ');
  return written ? `${name} - ${written}` : name;
}

const FIGURED_KEYS = {
  Defence: 'Defense',
  SocialDef: 'Social Defense',
  MentalDef: 'Mental Defense',
  Movement: 'Movement Rate',
  Carry: 'Carrying Capacity',
};

// Everything movement.md derives from Movement Rate, Air and Stamina, with
// what slows it applied: worn armour's Movement Rate penalty first, then
// Exhausted 3 halving what is left (rules.md, Exhausted), rounded up the
// way the book rounds every half.
function movementFigures(state, figured, armour = []) {
  const base = figured['Movement Rate'];
  const slowedBy = armour.filter((a) => a.slows && !a.broken).map((a) => ({ name: a.name, by: a.slows }));
  let rate = Math.max(1, base - slowedBy.reduce((n, a) => n + a.by, 0));
  const exhausted = (Number(state.exhausted) || 0) >= 3;
  if (exhausted) rate = Math.ceil(rate / 2);
  const air = Number(state.attributes?.Air) || 0;
  const stamina = Number(state.subStats?.Stamina) || 0;
  return {
    base, slowedBy, exhausted, rate,
    dash: rate * 2,
    sprint: rate * 5,
    runJump: air,
    standJump: air / 2,
    highRun: air / 2,
    highStand: air / 4,
    pace: 3 + air / 5,
    day: 4 + stamina,
  };
}

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
      if (part[2] === 'adders') return adderLabels(g.adders).join(', ');
      return (g.limiters || []).join(', ');
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
  const unstoppable = (state.boons || []).some((b) => b.name === 'Unstoppable');
  let health = healthStatus(state.currentHealth, figured['Health Levels']);
  // Unstoppable keeps a character on their feet at 0 and below.
  if (unstoppable && health === 'Unconscious') health = null;
  const statuses = [health, poiseStatus(state.currentPoise), sanityStatus(state.currentSanity)];

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

// Two ten-sided dice, drawn inline rather than loaded from
// app/icons/dice-2d10.svg as an image: it takes its colour from the pill
// around it through currentColor, and an <img> cannot.
const DICE_2D10 = `<svg viewBox="0 0 54 42" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round">
  <defs>
    <g id="pill-d10">
      <path d="M17 2 L32.64 17.56 L32.64 22.28 L17 38 L1.36 22.28 L1.36 17.56 Z"/>
      <path d="M17 2 L6.7 20 L17 25.11 L27.3 20 Z"/>
      <path d="M6.7 20 L1.36 22.28"/>
      <path d="M27.3 20 L32.64 22.28"/>
      <path d="M17 25.11 L17 38"/>
    </g>
  </defs>

  <mask id="pill-d10-cut">
    <rect width="54" height="42" fill="white"/>
    <g transform="translate(22 4) scale(0.86)">
      <path d="M17 2 L32.64 17.56 L32.64 22.28 L17 38 L1.36 22.28 L1.36 17.56 Z"
            fill="black" stroke="black" stroke-width="5.5" stroke-linejoin="round"/>
    </g>
  </mask>

  <g mask="url(#pill-d10-cut)">
    <g transform="translate(2 2) scale(0.68) rotate(-14 17 20)">
      <use href="#pill-d10" stroke-width="3.4"/>
    </g>
  </g>

  <g transform="translate(22 4) scale(0.86)">
    <use href="#pill-d10" stroke-width="2.7"/>
  </g>
</svg>`;

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

  const figured = computeFiguredCharacteristics(state);
  const { weapons, armour, gear } = splitGear(state, data);
  const ctx = {
    state,
    data,
    figured,
    skills: takenSkills(state, data),
    flaws: (state.flaws || []).filter((f) => f.level > 0),
    resources: takenResources(state, data),
    gifts: takenGifts(state),
    weapons,
    armour,
    gear,
    // A Gift's levels are rows of {level, effect}; what the character can
    // do is the row they have reached. Gifts built from a menu instead
    // carry no level table at all, so those fall back to their own text.
    giftEffect: (g) => {
      const entry = (data.gifts || []).find((d) => d.name === g.name);
      if (!entry) return '';
      const row = (entry.levels || []).find((l) => l.level === g.level);
      // Gifts built from a menu have no Level table, so their text comes
      // from the body - but the first line of a body is a heading, a rule
      // or a table row as often as it is prose.
      const prose = (line) => {
        const t = line.trim();
        return t && !t.startsWith('#') && !t.startsWith('|') && !t.startsWith('-');
      };
      const raw = row
        ? (row.effect || '')
        : ((entry.markdown || '').split(/\r?\n/).find(prose) || '');
      // The rules are markdown; the sheet is a printed page. Emphasis
      // markers and link brackets are noise once there is no renderer.
      return raw
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/<br\s*\/?>/gi, ' ')
        .trim();
    },
    giftKi: (g) => giftKi(g, data),
    giftText: (g) => ctx.giftEffect(g),
  };

  const set = (fn) => { fn(); persist(); refresh(); };

  // The floor rules live in state.js, shared with the GM's combat
  // tracker. What they did is said out loud for a few seconds, because a
  // Vital that jumps from -7 to 0 looks like a bug otherwise.
  function floor(track, max) {
    state.floorNote = null;
    applyVitalFloor(state, track, max, figured);
    if (state.floorNote) sheetNotice(state.floorNote);
    delete state.floorNote;
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  // The art draws a - and a + beside every count that moves, and the
  // generator registers each glyph as a button field, so the click lands
  // exactly on what the player sees rather than near it.
  const STEPPERS = {
    'vital.health': {
      get: () => state.currentHealth,
      set: (v) => { state.currentHealth = v; },
      lo: () => -figured['Health Levels'], hi: () => figured['Health Levels'],
    },
    // Poise and Sanity run as far below 0 as above it. Reaching the bottom
    // is not a stop but a reset (rules.md, Poise and Sanity): back to 0,
    // and a Poise floor costs a Sanity Level on the way.
    'vital.poise': {
      get: () => state.currentPoise,
      set: (v) => { state.currentPoise = v; floor('Poise', figured.Poise); },
      lo: () => -figured.Poise, hi: () => figured.Poise,
    },
    'vital.sanity': {
      get: () => state.currentSanity,
      set: (v) => { state.currentSanity = v; floor('Sanity', figured.Sanity); },
      lo: () => -figured.Sanity, hi: () => figured.Sanity,
    },
    'pool.ki': {
      get: () => state.currentKi,
      set: (v) => { state.currentKi = v; },
      lo: () => 0, hi: () => figured.Ki,
    },
    // Spending a Fate Token is one move, not two: the held count goes
    // down and the Scene's tally goes up together, and the + undoes both.
    // The cap that matters is per Scene, so the tally has to be right
    // without anyone remembering to keep it.
    // Earning a Token and spending one are different events (fate.md):
    // the - spends, and counts against the Scene's limit of Stamina
    // spends; the + only ever earns. It used to undo a spend, so a Token
    // earned mid-Scene quietly erased one already used.
    'pool.fate': {
      get: () => state.currentFateTokens,
      set: (v) => {
        if (v < state.currentFateTokens) {
          const spent = state.fateSpentThisScene ?? 0;
          const limit = Number(state.subStats?.Stamina) || 0;
          if (spent >= limit) {
            sheetNotice(`Stamina ${limit}: that's ${limit} Fate Token spend${limit === 1 ? '' : 's'} this Scene, the most you can make. Click Spent This Scene to start a new Scene.`);
            return;
          }
          state.fateSpentThisScene = spent + 1;
        }
        state.currentFateTokens = v;
      },
      lo: () => 0, hi: () => fateTokenCap(state, data),
    },
    exhausted: {
      get: () => state.exhausted ?? 0,
      set: (v) => { state.exhausted = v; },
      lo: () => 0, hi: () => 5,
    },
  };

  function decorate(f, host) {
    const id = f.id;

    // Initiative is rolled once a fight, by the player (rules.md, Combat
    // Order). Enhanced Speed 3 rolls it as 2d10, keeping the higher die.
    if (id === 'substat.Initiative.value') {
      const speed = (state.gifts || []).find((g) => g.name === 'Enhanced Speed')?.level || 0;
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: 'Roll Initiative',
        onClick: () => onRoll('initiative', 'Initiative', {
          initiative: Number(state.subStats?.Initiative) || 0, speed,
        }),
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
        onClick: () => set(() => {
          state.armourDamage = state.armourDamage || {};
          const lost = Number(state.armourDamage[a.key]) || 0;
          const next = clamp(lost + (dent[2] === 'minus' ? 1 : -1), 0, a.health);
          if (next) state.armourDamage[a.key] = next;
          else delete state.armourDamage[a.key];
        }),
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
      const t = STEPPERS[step[1]];
      const by = step[2] === 'plus' ? 1 : -1;
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-step',
        title: step[2] === 'plus' ? 'up one' : 'down one',
        onClick: () => set(() => t.set(clamp(t.get() + by, t.lo(), t.hi()))),
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
    if (id === 'scene.new') {
      host.appendChild(place(el('button', {
        type: 'button',
        class: 'sf sf-roll',
        title: 'New Scene: Fate Tokens spent this Scene back to 0',
        onClick: () => set(() => {
          state.fateSpentThisScene = 0;
          sheetNotice('New Scene: Fate Token spends reset.');
        }),
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
          // One Short Rest's worth between full nights (rules.md, Rests).
          if (!full && state.shortRestTaken) {
            sheetNotice("Already had a Short Rest. A Full Night's Rest resets it.");
            return;
          }
          set(() => {
            applyRest(state, full);
            if (!full) {
              state.shortRestTaken = true;
              return;
            }
            state.shortRestTaken = false;
            // A Fate Token comes up with the sun (fate.md), and one earned
            // at the holding cap is lost rather than banked.
            const cap = fateTokenCap(state, data);
            const before = state.currentFateTokens ?? 0;
            state.currentFateTokens = Math.min(cap, before + 1);
            sheetNotice(state.currentFateTokens > before
              ? 'Morning: +1 Fate Token.'
              : `Morning: at the cap of ${cap} Fate Tokens, so the sunrise Token is lost.`);
          });
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
  // An attack's to-hit is the Element you describe swinging with, not a
  // Skill and not the thing in your hand - so the Element panel is where
  // an attack starts. Moira has no attack roll, so it is left alone
  // rather than offering a roller it cannot fill.
  function rollSpecFor(part) {
    // The Element's own roll target, drawn beside its name rather than on
    // the rating - a rating is a number to read, not a button.
    if (part[0] === 'attribute' && part[2] === 'roll') {
      return { kind: 'attack', label: part[1] };
    }
    const [group, idx, leaf] = part;
    if (leaf !== 'name') return null;
    const i = Number(idx);
    if (group === 'skill' && ctx.skills[i]) return { kind: 'skill', label: ctx.skills[i].name };
    if (group === 'gift' && ctx.gifts[i]) return { kind: 'gift', label: ctx.gifts[i].name };
    if (group === 'resource' && ctx.resources[i]?.pushable) {
      return { kind: 'resource', label: ctx.resources[i].name };
    }
    if (group === 'weapon' && ctx.weapons[i]) {
      // The row already knows what it hits for; the roller should not
      // make anyone read it off the sheet and type it back in.
      return { kind: 'weapon', label: ctx.weapons[i].name, damage: ctx.weapons[i].damage };
    }
    return null;
  }

  // Whole-row hit targets that open a roller, laid over the row rather
  // than over any one field in it.
  //
  // The target used to be invisible - the row lit up under the pointer and
  // said nothing before you got there, so nobody knew the sheet rolled at
  // all. The dice sit in it now: a row you can roll looks like a row you
  // can roll, whether or not anyone hovers it.
  function rollTarget(f, spec) {
    const { kind, label } = spec;
    const pill = el('span', { class: 'roll-pill', 'aria-hidden': 'true' });
    pill.innerHTML = DICE_2D10;
    const node = place(el('button', {
      type: 'button',
      class: kind === 'attack' ? 'sf sf-roll sf-roll-attack' : 'sf sf-roll',
      title: `Roll ${label}`,
      onClick: () => onRoll(kind, label, spec),
    }, pill), f);
    // The dice belong to the box they sit in, which the generator already
    // knows the colour of - green for Skills, gold for Resources, the
    // Element's own for an attack.
    const tint = f.color || f.rollColor;
    if (tint) node.style.color = tint;
    return node;
  }

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
        // A row with dice at its end has that much less room for its name.
        if (rollSpecFor(id.split('.'))) node.classList.add('sf-roll-room');
        overlay.appendChild(node);
      }
      else if (f.kind === 'para') overlay.appendChild(paraControl(f, value));
      else if (f.kind === 'pips') overlay.appendChild(pipControl(f, Number(value) || 0));
      else if (f.kind === 'tiers') overlay.appendChild(tierControl(f, Number(value) || 0));
      else if (f.kind === 'check') overlay.appendChild(checkControl(f, !!value));
      decorate({ ...f, id }, overlay);
    });

    // Click a Skill, a Gift, a Resource or a weapon to roll it. The
    // target covers the row's name field, which is the part a finger
    // goes for.
    onPage.forEach((f) => {
      const spec = rollSpecFor(shift(f.id, view).split('.'));
      if (spec) overlay.appendChild(rollTarget(f, spec));
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

export { readField, takenSkills, takenResources, splitGear, scarsOfKind };
