// A character sheet on the web, with nothing around it.
//
// This is what a personal sheet page calls. Hand it a character and it
// draws the five pages, wires the dice, and keeps what gets tracked in
// the reader's own browser. No file to choose, no character to look up,
// no settings: the page is one person's sheet and opening it is the
// whole interaction.
//
// Play state is kept per character name in localStorage, so two people
// opening the same link keep their own Health and Ki. The character
// itself is read and never written back.

import { loadRulesData } from '../rules-data.js';
import { mergeCharacterState } from '../state.js';
import { buildPagedSheet, loadFieldMap } from './paged-sheet.js';
import { el, renderMarkdownInline as inline } from '../ui.js';
import {
  buildAttackRollSection,
  buildDamageRollSection,
  buildSkillRollSection,
  buildGiftCheckSection,
  buildResourceCheckSection,
} from '../steps/roller-panel.js';

const PLAY_KEYS = [
  'currentHealth', 'currentPoise', 'currentSanity', 'currentKi',
  'currentFateTokens', 'fateSpentThisScene', 'exhausted',
  'scars', 'backstory', 'finishingNotes', 'xpEarned',
];

function storageKey(name) {
  return `20below.sheet.${name}`;
}

function loadPlayState(state, name) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(name)) || 'null');
    if (saved) PLAY_KEYS.forEach((k) => { if (saved[k] != null) state[k] = saved[k]; });
  } catch (err) {
    // A blocked or full store is not worth failing a sheet over: the
    // character still reads correctly, it just forgets between visits.
  }
}

function savePlayState(state, name) {
  try {
    const out = {};
    PLAY_KEYS.forEach((k) => { out[k] = state[k]; });
    localStorage.setItem(storageKey(name), JSON.stringify(out));
  } catch (err) {
    // same
  }
}

function render(host, state, data, name, note) {
  let activeTab = 0;
  let modal = null;
  const pagesHost = el('div', {});
  const tabBar = el('div', { class: 'sheet-tabs' });

  const closeRoller = () => { modal?.remove(); modal = null; draw(); };

  function rollerPanel(kind, label) {
    switch (kind) {
      case 'skill':
        return [el('h3', {}, `Roll ${label}`),
          buildSkillRollSection(state, data, draw, label)];
      case 'gift':
        return [el('h3', {}, `${label} - Gift Check`),
          el('p', { class: 'attr-caption', html: inline(data.giftCheckText) }),
          buildGiftCheckSection(state, data, draw)];
      case 'resource':
        return [el('h3', {}, `${label} - Resource Check`),
          buildResourceCheckSection(state, data, label)];
      case 'weapon': {
        const damage = buildDamageRollSection(state, data, draw);
        return [el('h3', {}, `Attack with ${label}`),
          buildAttackRollSection(state, data, draw, (crit) => damage?.armCritical?.(crit)),
          damage];
      }
      default:
        return [];
    }
  }

  function openRoller(kind, label) {
    modal?.remove();
    const panel = el('div', { class: 'sheet-roller-panel' }, [
      ...rollerPanel(kind, label),
      el('button', { type: 'button', text: 'Close', onClick: closeRoller }),
    ]);
    modal = el('div', {
      class: 'sheet-roller',
      onClick: (e) => { if (e.target === modal) closeRoller(); },
    }, [panel]);
    document.body.appendChild(modal);
  }

  function draw() {
    pagesHost.innerHTML = '';
    const stack = buildPagedSheet(state, data, {
      refresh: draw,
      persist: () => savePlayState(state, name),
      onRoll: openRoller,
    });
    pagesHost.appendChild(stack);

    const pages = [...stack.querySelectorAll('.sheet-page')];
    if (activeTab >= pages.length) activeTab = 0;

    const show = (i) => {
      activeTab = i;
      pages.forEach((p, n) => { p.hidden = n !== i; });
      [...tabBar.children].forEach((b, n) => {
        b.className = n === i ? 'tab-btn active' : 'tab-btn';
      });
    };

    tabBar.innerHTML = '';
    pages.forEach((p, i) => {
      tabBar.appendChild(el('button', {
        type: 'button', text: `Page ${i + 1}`, class: 'tab-btn', onClick: () => show(i),
      }));
    });
    show(activeTab);
  }

  host.innerHTML = '';
  host.append(note ? el('p', { class: 'sheet-status' }, note) : null, tabBar, pagesHost);
  draw();
}

/**
 * Draw one person's sheet into `host`.
 *
 * `character` is the JSON the Character Creator saves, as an object -
 * embedded in the page rather than fetched, so there is nothing to go
 * missing and nothing to wait for.
 */
export async function mountSheet(host, character, note) {
  try {
    const data = await loadRulesData();
    const state = mergeCharacterState(data, character);
    const name = state.name || 'character';
    loadPlayState(state, name);
    await loadFieldMap();
    render(host, state, data, name, note);
  } catch (err) {
    host.innerHTML = '';
    host.append(el('p', { class: 'sheet-status' },
      `The sheet could not open: ${err.message}`));
  }
}
