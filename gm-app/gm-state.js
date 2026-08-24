// GM Tracker state: a roster of imported characters (PCs and NPCs, both
// just Character Creator JSON exports - this app does no creation of its
// own) plus the live combat round/turn state.
//
// Reuses the Character Creator's own pure logic rather than reimplementing
// it, so the two apps can never quietly drift on what Health/Poise/Sanity/
// Defense/Ki actually are.
import { computeFiguredCharacteristics, healthStatus, poiseStatus, sanityStatus } from '../app/state.js';
import { rollD10 } from '../app/roller/core.js';

const STORAGE_KEY = '20below-gm-tracker';

export function createInitialState() {
  return {
    roster: [], // [{ id, role, name, source, figured, currentHealth, currentPoise, currentSanity, currentKi, initiative, bracket, kiSpentThisRound }]
    combat: {
      started: false,
      round: 0,
      turnIndex: -1, // index into resolutionOrder; -1 = declare phase, not yet resolving
      resolutionOrder: null, // [rosterId, ...] computed each round once brackets are locked
    },
  };
}

let nextId = 1;

// Imports one already-exported character JSON (from the Character
// Creator's own "Download JSON") as a new roster entry. Defaults to NPC -
// the GM flips it to PC per entry, since nothing in the file itself
// distinguishes the two.
export function importCharacter(state, rawJson) {
  const source = JSON.parse(rawJson);
  const figured = computeFiguredCharacteristics(source);
  const entry = {
    id: nextId++,
    role: 'NPC',
    name: source.name || 'Unnamed',
    source,
    figured,
    currentHealth: source.currentHealth ?? figured['Health Levels'],
    currentPoise: source.currentPoise ?? figured.Poise,
    currentSanity: source.currentSanity ?? figured.Sanity,
    currentKi: source.currentKi ?? figured.Ki,
    initiative: null,
    bracket: null,
    kiSpentThisRound: 0,
  };
  state.roster.push(entry);
  return entry;
}

export function removeFromRoster(state, id) {
  state.roster = state.roster.filter((c) => c.id !== id);
}

export function setRole(state, id, role) {
  const c = state.roster.find((x) => x.id === id);
  if (c) c.role = role;
}

export function setInitiative(state, id, value) {
  const c = state.roster.find((x) => x.id === id);
  if (c) c.initiative = value === '' || value == null ? null : Number(value);
}

// NPCs roll their own Initiative (1d10 + their Initiative sub-stat); PCs
// report what they rolled at the table and the GM types it in instead
// (setInitiative), so there's no roll button for PCs.
export function rollInitiativeFor(state, id) {
  const c = state.roster.find((x) => x.id === id);
  if (!c) return;
  const sub = c.source.subStats?.Initiative ?? 0;
  c.initiative = rollD10() + sub;
  return c.initiative;
}

export function allInitiativeSet(state) {
  return state.roster.length > 0 && state.roster.every((c) => c.initiative != null);
}

// Rolled once at the start of combat, per rules.md#combat-order - never
// re-rolled or recomputed once combat starts.
export function beginCombat(state) {
  state.combat.started = true;
  state.combat.round = 1;
  state.combat.turnIndex = -1;
  state.combat.resolutionOrder = null;
  state.roster.forEach((c) => {
    c.bracket = null;
    c.kiSpentThisRound = 0;
  });
}

export function setBracket(state, id, bracket) {
  const c = state.roster.find((x) => x.id === id);
  if (c) c.bracket = bracket;
}

const BRACKET_STEPS = ['Slow', 'Normal', 'Fast'];

// Spends Ki to bump a declared bracket up (Slow -> Normal -> Fast), 1 Ki
// per step, per rules.md#action-brackets. No-ops past Fast or past
// available Ki rather than letting the count go negative or off the end.
export function bumpBracket(state, id) {
  const c = state.roster.find((x) => x.id === id);
  if (!c || !c.bracket || c.currentKi <= 0) return;
  const idx = BRACKET_STEPS.indexOf(c.bracket);
  if (idx >= BRACKET_STEPS.length - 1) return;
  c.bracket = BRACKET_STEPS[idx + 1];
  c.currentKi -= 1;
  c.kiSpentThisRound += 1;
}

export function allBracketsDeclared(state) {
  return state.roster.length > 0 && state.roster.every((c) => c.bracket != null);
}

// Resolution order per rules.md#combat-order: all Fast characters act
// first, then all Normal, then all Slow - Initiative order (already fixed
// for the whole fight) breaks ties within each band.
export function resolveRound(state) {
  const rank = { Fast: 0, Normal: 1, Slow: 2 };
  const order = [...state.roster]
    .sort((a, b) => rank[a.bracket] - rank[b.bracket] || b.initiative - a.initiative)
    .map((c) => c.id);
  state.combat.resolutionOrder = order;
  state.combat.turnIndex = 0;
}

export function currentTurnCombatant(state) {
  const { resolutionOrder, turnIndex } = state.combat;
  if (!resolutionOrder || turnIndex < 0 || turnIndex >= resolutionOrder.length) return null;
  const id = resolutionOrder[turnIndex];
  return state.roster.find((c) => c.id === id) ?? null;
}

// Advances to the next combatant in this round's resolution order. Once
// the order is exhausted, starts a fresh round back at the declare phase -
// brackets are re-declared every round, per rules.md.
export function advanceTurn(state) {
  const { resolutionOrder, turnIndex } = state.combat;
  if (!resolutionOrder) return;
  if (turnIndex + 1 < resolutionOrder.length) {
    state.combat.turnIndex += 1;
    return;
  }
  state.combat.round += 1;
  state.combat.turnIndex = -1;
  state.combat.resolutionOrder = null;
  state.roster.forEach((c) => {
    c.bracket = null;
    c.kiSpentThisRound = 0;
  });
}

export function endCombat(state) {
  state.combat.started = false;
  state.combat.round = 0;
  state.combat.turnIndex = -1;
  state.combat.resolutionOrder = null;
  state.roster.forEach((c) => {
    c.initiative = null;
    c.bracket = null;
    c.kiSpentThisRound = 0;
  });
}

// ---- Damage tracks (Health/Poise/Sanity Levels, Ki) - floor 0, cap at
// the character's own figured max. Negative Health/Sanity (Dead/
// Shattered) are meaningful states in the rules, so those two are only
// floored well below zero as a sanity bound, not clamped at 0 like Poise/Ki.
export function adjustTrack(state, id, track, delta) {
  const c = state.roster.find((x) => x.id === id);
  if (!c) return;
  const max = track === 'Health' ? c.figured['Health Levels'] : c.figured[track];
  const key = `current${track}`;
  const floor = track === 'Poise' ? -99 : track === 'Health' || track === 'Sanity' ? -99 : 0;
  c[key] = Math.max(floor, Math.min(max, c[key] + delta));
}

export function trackStatus(track, value, c) {
  if (track === 'Health') return healthStatus(value, c.source.subStats?.Health ?? 0);
  if (track === 'Poise') return poiseStatus(value);
  if (track === 'Sanity') return sanityStatus(value);
  return null;
}

// ---- Persistence (localStorage, mirrors the Character Creator's own
// autosave pattern) ----

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const loaded = JSON.parse(raw);
    const maxId = loaded.roster.reduce((m, c) => Math.max(m, c.id), 0);
    nextId = maxId + 1;
    return loaded;
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
