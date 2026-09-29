// Encounter weighing: is what the GM just put on the table a bad afternoon
// or a funeral?
//
// The whole thing rests on two facts about how this system fights.
//
// Soak is a threshold, not a subtraction. Every damage die is checked
// against it alone, and a die that doesn't beat it does nothing at all - so
// Soak deletes a fixed share of every attack forever, and (10 - Soak) is
// literally the fraction of dice that land.
//
// A creature's danger is how hard it hits multiplied by how long it lasts,
// because it keeps hitting for as long as it's up. Both halves scale with
// the size of the pack, so danger climbs with the SQUARE of the count.
// Four wolves are a fight; eight are not that fight twice.
//
// Calibrated against round-by-round simulation of real parties under the
// real at-zero rules (a single attack can never carry someone past 0, and
// an attack on someone already at 0 removes one Level however many dice
// connect). Bands agree with that simulation to +0.94.
//
// Everything here is pure - hand it character states, get numbers back.

import { computeFiguredCharacteristics } from '../state.js';

// A creature's natural weapons live in its entry prose rather than in
// structured fields, in the same shape the bestiary prints them:
// "**Bite**: 3 dice, Melee" (older cards: "**Bite**: 3, Melee", sometimes
// with a condition first). Character exports carry that text in
// finishingNotes. Social and Mental lines are not damage dice.
const NATURAL_WEAPON = /^\*\*([A-Z][^*]*)\*\*\s*(?:\([^)]*\))?:\s*(\d+)(?:\s+(?:dice|die)\b)?\s*,([^\n]*)/gm;

// Fallback when nothing else can be worked out. Fists and feet are 1 die
// in weapons.md, and someone carrying nothing really is swinging at that -
// guessing higher would quietly inflate every party's Budget.
export const DEFAULT_DICE = 1;

export const BANDS = [
  { limit: 0.35, name: 'trivial', says: 'nobody goes down' },
  { limit: 0.75, name: 'standard', says: 'about one character drops' },
  { limit: 1.4, name: 'hard', says: 'two or three drop' },
  { limit: 3.0, name: 'deadly', says: 'most of the party ends up on the floor' },
  { limit: Infinity, name: 'overwhelming', says: 'all of them' },
];

export function bandFor(ratio) {
  return BANDS.find((b) => ratio < b.limit) || BANDS[BANDS.length - 1];
}

// The biggest natural weapon printed in a creature's own text. Creatures
// with several attacks use the worst one: the GM is asking what this thing
// can do to someone, not what it does on average.
export function naturalDice(state) {
  // A creature from the Battle Tracker's library carries its attacks already read.
  const attacks = state && state.creature && state.creature.attacks;
  if (Array.isArray(attacks)) {
    const dice = attacks.filter((a) => a.kind === 'Physical').map((a) => Number(a.dice))
      .filter((n) => Number.isFinite(n) && n > 0);
    return dice.length ? Math.max(...dice) : null;
  }
  const text = (state && state.finishingNotes) || '';
  // Only read this as a creature block. A player's notes are free prose and
  // can happen to start a line with a bold word and a number, which would
  // otherwise be taken as a bite.
  if (!text.includes('**Soak**')) return null;
  const found = [...text.matchAll(NATURAL_WEAPON)]
    .filter((m) => !/\*\*(Social|Mental)\*\*/.test(m[3]))
    .map((m) => Number(m[2]))
    .filter((n) => Number.isFinite(n) && n > 0);
  return found.length ? Math.max(...found) : null;
}

// A creature's natural weapons are boosted: each die adds its Ferocity
// against Soak, the way a character's Ki Infusion does (encounters.md,
// Attack by Role). Weapons a creature or person carries are not, so the
// boost only counts when the natural-weapon text is what supplies the dice.
export function ferocityOf(state, weaponDice = null) {
  if (!state) return 0;
  if (Number.isFinite(state.encounterDice) && state.encounterDice > 0) return 0;
  if (weaponDice) {
    const carried = (state.gearPurchases || []).some((g) => Number(weaponDice[g.name]) > 0);
    if (carried) return 0;
  }
  if (naturalDice(state) === null) return 0;
  const f = Number(state.subStats && state.subStats.Ferocity);
  return Number.isFinite(f) && f > 0 ? f : 0;
}

// A player character's dice come from what they are carrying, which needs
// weapons.md to price. `weaponDice` is a name -> dice lookup the caller
// supplies (null when the rules could not be fetched); anything unmatched
// falls through to the natural-weapon text, then to the default.
export function diceFor(state, weaponDice) {
  if (state && Number.isFinite(state.encounterDice) && state.encounterDice > 0) {
    return state.encounterDice; // an explicit override always wins
  }
  if (weaponDice) {
    const carried = (state.gearPurchases || [])
      .map((g) => weaponDice[g.name])
      .filter((n) => Number.isFinite(n) && n > 0);
    if (carried.length) return Math.max(...carried);
  }
  return naturalDice(state) || DEFAULT_DICE;
}

// Weapon name -> damage dice, read out of weapons.md.
//
// Only tables with a Damage column are weapons: the gear and armour
// tables have a Wealth column in the same position, and reading those
// as damage would hand a character a tent that hits for two.
export function weaponDamageTable(markdown) {
  const table = {};
  for (const block of markdown.replace(/\r\n/g, '\n').split(/^## /m)) {
    const header = block.match(/^\|[^\n]*\|$/m);
    if (!header || !header[0].includes('Damage')) continue;
    const columns = header[0].split('|').slice(1, -1).map((c) => c.trim());
    const at = columns.indexOf('Damage');
    for (const line of block.split('\n')) {
      if (!line.startsWith('|') || line.includes('---') || line === header[0]) continue;
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      const dice = Number(cells[at]);
      if (cells[0] && Number.isFinite(dice) && dice > 0) table[cells[0]] = dice;
    }
  }
  return Object.keys(table).length ? table : null;
}

// Where the rules actually live. Fetched rather than bundled for the same
// reason the character creator fetches them: an edit to weapons.md should
// reach every tool without any of them being rebuilt.
export const WEAPONS_URL =
  'https://raw.githubusercontent.com/feralucce/20_Below/main/rules/weapons.md';

export async function fetchWeaponDamage() {
  const res = await fetch(WEAPONS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error('weapons.md: ' + res.status);
  return weaponDamageTable(await res.text());
}

function statsOf(state) {
  const f = computeFiguredCharacteristics(state);
  return {
    soak: (state.subStats && state.subStats.Soak) || 0,
    health: f['Health Levels'],
  };
}

// dice x Health Levels / (10 - Soak), then squared by the count.
//
// Soak 10 negates ordinary weapons completely, so the division would blow
// up. That is not a number problem, it is the answer: nothing the party
// swings can touch it, and the caller is told so rather than shown
// Infinity.
export function threatOf(state, count = 1, weaponDice = null) {
  const { soak, health } = statsOf(state);
  const dice = diceFor(state, weaponDice);
  if (soak >= 10) return { value: Infinity, untouchable: true, dice, soak, health };
  const each = (dice * health) / (10 - soak);
  return { value: each * count * count, untouchable: false, each, dice, soak, health };
}

// 0.7 is the party's average chance to connect - to-hit is Attribute
// against the target's Defense, and across the creatures in the book that
// lands near seven rolls in ten. It is the one term not read off a sheet.
export const HIT_RATE = 0.7;

// 0.7 x party dice x party Health Levels / min(10, 10 + Ferocity - average
// party Soak). `ferocity` is the boost on the opposition's natural weapons:
// a boosted die gets past more of the party's Soak, so the party can take
// less. The min holds it at 10, since a die can't connect more than always.
export function budgetOf(states, weaponDice = null, ferocity = 0) {
  const live = states.filter(Boolean);
  if (!live.length) return { value: 0, dice: 0, health: 0, soak: 0, ferocity };
  let dice = 0;
  let health = 0;
  let soakTotal = 0;
  live.forEach((s) => {
    const { soak, health: hp } = statsOf(s);
    dice += diceFor(s, weaponDice);
    health += hp;
    soakTotal += soak;
  });
  const soak = soakTotal / live.length;
  const reach = Math.min(10, 10 + ferocity - soak);
  // Nothing the opposition swings gets past the party's Soak: no fight to weigh.
  const value = reach > 0 ? HIT_RATE * dice * health / reach : Infinity;
  return { value, dice, health, soak, ferocity };
}

// The whole verdict for a table full of creatures against a party.
// `opposition` is [{ state, count }].
//
// Each kind is weighed against the Budget at its own Ferocity, and the
// shares are added. With one kind, or one Ferocity, that is exactly
// Threat / Budget; with a mix, a claw and a carried knife each count at the
// rate they actually get through. `budget.value` is reported as the single
// Budget that gives the same verdict, so the page can show one number.
export function weigh(party, opposition, weaponDice = null) {
  const parts = opposition
    .filter((o) => o.state && o.count > 0)
    .map((o) => {
      const ferocity = ferocityOf(o.state, weaponDice);
      return { ...o, ferocity, threat: threatOf(o.state, o.count, weaponDice),
        budget: budgetOf(party, weaponDice, ferocity) };
    });
  const ferocities = [...new Set(parts.map((p) => p.ferocity))].sort((a, b) => a - b);
  const budget = budgetOf(party, weaponDice, ferocities.length ? ferocities[ferocities.length - 1] : 0);
  budget.ferocities = ferocities;

  if (parts.some((p) => p.threat.untouchable)) {
    return { budget, parts, total: Infinity, ratio: Infinity, untouchable: true };
  }
  const total = parts.reduce((n, p) => n + p.threat.value, 0);
  const ratio = parts.reduce((n, p) => n + (p.budget.value > 0 ? p.threat.value / p.budget.value : 0), 0);
  if (!total || !ratio) {
    return { budget, parts, total, ratio: 0, band: BANDS[0] };
  }
  budget.value = total / ratio;
  return { budget, parts, total, ratio, band: bandFor(ratio) };
}
