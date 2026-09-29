import { createInitialState, mergeCharacterState, allPoolsSummary, clampFateTokenPurchases, markNpc } from './state.js';
import { el, poolBadge } from './ui.js';
import { loadRulesData } from './rules-data.js';
import { isDesktopApp } from './desktop-storage.js';
import { isServingBundledRules } from './parse/markdown.js';
import {
  listNames,
  loadByName,
  saveCharacter,
  pickCharacterFile,
  adopt,
  downloadJson,
  listTransfers,
  loadTransfer,
  transferFolder,
  changeTransferFolder,
} from './file-actions.js';

import stepBonus from './steps/00-bonus.js';
import stepIdentity from './steps/01-identity.js';
import stepNature from './steps/02-nature.js';
import stepAttributes from './steps/03-attributes.js';
import stepSubstats from './steps/04-substats.js';
import stepDescriptors from './steps/05-descriptors.js';
import stepBoons from './steps/07-boons.js';
import stepFlaws from './steps/11-flaws.js';
import stepSkills from './steps/06-skills.js';
import stepResources from './steps/08-resources.js';
import stepGifts from './steps/09-gifts.js';
import stepGiftMenus from './steps/10-gift-menus.js';
import stepDiscretionary from './steps/12-discretionary.js';
import stepEquipment from './steps/12a-equipment.js';
import stepSheet from './steps/13-sheet.js';
import { addBugReportButton } from './bug-report.js';

// Order is deliberately not the same as the file numbering (01-14, historical
// build order) - this is the actual wizard sequence shown to the user, last
// changed to move Boons/Flaws ahead of Skills so both point-granting steps
// land before the pools they can feed.
const STEPS = [
  stepBonus,
  stepIdentity,
  stepNature,
  stepAttributes,
  stepSubstats,
  stepDescriptors,
  stepBoons,
  stepFlaws,
  stepSkills,
  stepResources,
  stepGifts,
  stepGiftMenus,
  stepDiscretionary,
  stepEquipment,
  stepSheet,
];

const STORAGE_KEY = '20below-character-draft';

// The sheet is both the last step of the wizard and, now, the app's
// resting state - what you see when you open it with a character in hand.
// Creation is somewhere you go, not the front door.
const SHEET_STEP = STEPS.length - 1;
// Creation runs up to Equipment. The sheet is where it comes out, not
// another stop on the way - so it is not a pill, and Next on the last
// step leaves the wizard rather than walking into it with the pills
// still overhead.
const LAST_CREATE_STEP = SHEET_STEP - 1;

const panel = document.getElementById('step-panel');
const nav = document.getElementById('step-nav');
const footer = document.querySelector('.wizard-controls');
const poolSummary = document.getElementById('pool-summary');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const btnNpc = document.getElementById('btn-npc');
const btnNew = document.getElementById('btn-new');
const btnSave = document.getElementById('btn-save');
const loadSelect = document.getElementById('load-select');
const btnImport = document.getElementById('btn-import');
const btnExport = document.getElementById('btn-export');
const btnEdit = document.getElementById('btn-edit');
const fileStatus = document.getElementById('file-status');

let statusTimer = null;
function say(message, isError = false) {
  if (!fileStatus) return;
  fileStatus.textContent = message;
  fileStatus.className = isError ? 'file-status-line error' : 'file-status-line';
  fileStatus.hidden = false;
  clearTimeout(statusTimer);
  // An error is something to read; a confirmation has been read by the
  // time it matters, and lingering turns the header into a changelog.
  if (!isError) statusTimer = setTimeout(() => { fileStatus.hidden = true; }, 4000);
}

function hasDraft() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function loadSavedState(data) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState(data);
    return mergeCharacterState(data, JSON.parse(raw));
  } catch {
    return createInitialState(data);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Desktop-only: the web build has no meaningful "version" of its own, it's
// just whatever's currently on main. window.__TAURI__.app.getVersion() reads
// straight from tauri.conf.json at build time, so this can't drift the way
// the landing page's hand-edited download link/caption did.
async function showAppVersion() {
  if (!isDesktopApp) return;
  const versionEl = document.getElementById('app-version');
  if (!versionEl) return;
  try {
    const version = await window.__TAURI__.app.getVersion();
    versionEl.textContent = `Desktop v${version}`;
  } catch (err) {
    console.error('Failed to read app version', err);
  }
}

// Desktop-only: releases are published as GitHub Releases on the public
// 20_Below repo (not the private desktop mirror), so this is a plain
// anonymous fetch - no auth needed. Silently does nothing if offline or the
// API call fails, rather than risk a false "needs updating" reading.
//
// The repo now also hosts Combat Tracker Desktop releases (tagged
// combat-tracker-vX.Y.Z, 2026-08-24) on the same /releases feed, so
// /releases/latest can point at the wrong product - listing releases and
// picking the first bare vX.Y.Z tag finds this app's own latest instead.
const RELEASES_LIST_URL = 'https://api.github.com/repos/feralucce/20_Below/releases';

async function checkVersionStatus() {
  if (!isDesktopApp) return;
  const ledEl = document.getElementById('version-led');
  if (!ledEl) return;
  try {
    const current = await window.__TAURI__.app.getVersion();
    const res = await fetch(RELEASES_LIST_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const releases = await res.json();
    const ownRelease = releases.find((r) => /^v\d+\.\d+\.\d+$/.test(r.tag_name || ''));
    if (!ownRelease) return;
    const latest = ownRelease.tag_name.replace(/^v/, '');
    if (!latest) return;
    ledEl.hidden = false;
    if (isNewer(latest, current)) {
      ledEl.textContent = `Needs updating - v${latest} is out`;
      ledEl.className = 'version-led needs-update';
      offerUpdate(ownRelease);
    } else {
      ledEl.textContent = 'Up to date';
      ledEl.className = 'version-led ok';
    }
  } catch (err) {
    console.error('Failed to check version status', err);
  }
}

// Knowing an update exists is only half of it - the LED has been telling
// people to update without giving them a way to do it. This opens the
// installer in the real browser rather than in the app's own webview,
// which is what the opener plugin is for: a plain link would navigate the
// window away from the character sheet the user is standing in.
//
// Prefers the .exe asset so the download just starts, and falls back to
// the release page if a release ever has no installer attached.
// Compare numerically, not with ===. A local build is often ahead of the
// newest release - it is right now - and string inequality reads that as
// 'needs updating', which was merely a wrong label until there was a
// button under it offering to download the older installer.
function isNewer(latest, current) {
  const a = String(latest).split('.').map(Number);
  const b = String(current).split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return false;
}

function offerUpdate(release) {
  const btn = document.getElementById('get-update');
  if (!btn) return;
  const installer = (release.assets || [])
    .find((a) => (a.name || '').toLowerCase().endsWith('.exe'));
  const url = (installer && installer.browser_download_url) || release.html_url;
  if (!url) return;
  btn.hidden = false;
  btn.onclick = async () => {
    try {
      await window.__TAURI__.opener.openUrl(url);
    } catch (err) {
      // Nothing useful to fall back to inside the webview, so say so
      // rather than appearing to do nothing.
      console.error('Failed to open the update link', err);
      btn.textContent = 'Could not open the browser';
    }
  };
}

// Where the rules the app just parsed actually came from. The desktop build
// fetches live from main and only falls back to the snapshot bundled into the
// installer when that fails (offline, DNS, timeout) - which is silent by
// design, and shouldn't be. The browser build is served alongside the repo and
// is always live, so it gets no indicator.
// The browser build is served alongside the repo, so its rules are always
// live and the light is free to answer a different question: will this
// still open with no signal? A worker that failed to register is invisible
// otherwise - the app behaves perfectly until the moment you need it to
// work offline, and then looks like an ordinary connection failure.
async function showOfflineSupport() {
  const ledEl = document.getElementById('rules-led');
  if (!ledEl) return;

  let reg = null;
  if ('serviceWorker' in navigator) {
    try {
      reg = await navigator.serviceWorker.getRegistration();
    } catch (err) {
      reg = null; // storage blocked, or a context that forbids workers
    }
  }
  const ready = Boolean(reg && (reg.active || navigator.serviceWorker.controller));

  ledEl.hidden = false;
  if (ready) {
    ledEl.textContent = 'Offline ready';
    ledEl.title =
      'This page is stored on your device, so it opens without a signal. '
      + 'Rules still refresh whenever you are online.';
    ledEl.className = 'version-led ok';
  } else {
    ledEl.textContent = 'Online only';
    ledEl.title =
      'Offline support has not installed, so this page needs a connection to open. '
      + 'Reload once while online; if it stays this way, your browser may be '
      + 'blocking site data.';
    ledEl.className = 'version-led stale';
  }
}

function showRulesSource() {
  if (!isDesktopApp) {
    showOfflineSupport();
    // The worker can take control a moment after the page loads, so the
    // light is refreshed rather than left reading Online only forever.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', showOfflineSupport);
    }
    return;
  }
  const ledEl = document.getElementById('rules-led');
  if (!ledEl) return;
  ledEl.hidden = false;
  if (isServingBundledRules()) {
    ledEl.textContent = 'Offline - bundled rules';
    ledEl.title =
      'No connection to the repo, so the rules bundled with this installer are being used. '
      + 'They are only as current as the version you installed. Reconnect and reopen to get the latest.';
    ledEl.className = 'version-led stale';
  } else {
    ledEl.textContent = 'Live rules';
    ledEl.title = 'Rules loaded live from the repository - up to date.';
    ledEl.className = 'version-led ok';
  }
}

async function main() {
  showAppVersion();
  addBugReportButton(document.querySelector('.header-links'), { app: 'Character Creator' });
  checkVersionStatus();

  let data;
  try {
    data = await loadRulesData();
    showRulesSource();
  } catch (err) {
    console.error(err);
    panel.innerHTML = `<p class="error">Failed to load or parse the rules data. If a rules file's structure changed, the parser in app/parse/ may need a matching update.\n\n${err.message}</p>`;
    return;
  }

  // index.html reports a module that failed to load; from here on the
  // app is running and reports its own failures.
  window.__creatorStarted = true;
  let state = loadSavedState(data);
  let currentStep = 0;
  // 'sheet' is the resting state, 'create' is the wizard, and 'start' is
  // the one screen with no character behind it at all.
  let mode = hasDraft() ? 'sheet' : 'start';

  // A save can carry Boons or Skills that have since been renamed, folded
  // into another, or moved out of the rules entirely. mergeCharacterState
  // fixes the character up; this is where the player finds out it did -
  // on opening the app, and on every Import and Open, which run the same
  // fix-up. Shown once: the notices are cleared as soon as they are drawn,
  // so reloading does not nag about a migration already explained.
  function showMigrationNotices() {
    document.querySelector('.migration-notice.app-level')?.remove();
    if (!Array.isArray(state.migrationNotices) || !state.migrationNotices.length) return;
    const banner = el('div', { class: 'migration-notice app-level' }, [
      el('p', { html: '<strong>Some things on this character have changed with the rules.</strong>' }),
      el('ul', {}, state.migrationNotices.map((text) => el('li', { text }))),
      el('button', {
        type: 'button',
        text: 'Got it',
        onclick: () => banner.remove(),
      }),
    ]);
    panel.parentNode.insertBefore(banner, panel);
    state.migrationNotices = [];
    saveState(state);
  }
  showMigrationNotices();

  // The Fate Token cap moves with Stamina, which is reallocable, so any
  // change can strand Tokens above the new cap - lowering it has to refund
  // them. Re-applied at the top of both render entry points: the step panel
  // has to be built from already-clamped state, or it draws the stale count.
  function rerenderPools() {
    clampFateTokenPurchases(state, data);
    poolSummary.innerHTML = '';
    allPoolsSummary(state, data).forEach((p) => poolSummary.appendChild(poolBadge(p.label, p.remaining)));
    saveState(state);
  }

  function rerenderStep() {
    clampFateTokenPurchases(state, data);
    panel.innerHTML = '';
    // Steps can widen the panel for themselves; none of them should
    // inherit another step's width.
    panel.className = 'step-panel';

    if (mode === 'start') {
      nav.hidden = true;
      footer.hidden = true;
      btnEdit.hidden = true;
      renderStart();
      return;
    }
    btnEdit.hidden = false;

    // The step pills and the Back/Next pair belong to creation. On the
    // sheet they are scenery for a journey the character has finished.
    const creating = mode === 'create';
    nav.hidden = !creating;
    footer.hidden = !creating;
    // Creation is not a one-way door: somebody always finds out at the
    // table that they never spent their Wealth. The same button goes both
    // ways, so it is always obvious which side of it you are on.
    btnEdit.textContent = creating ? 'Back to Sheet' : 'Character Creator';

    // Writing the draft without redrawing. Everything else persists as a
    // side effect of rerenderPools, which is fine when the control that
    // changed is a button. A text field cannot rerender on input without
    // throwing away the caret, so it needs to save on its own.
    const ctx = { state, data, rerenderStep, rerenderPools, persist: () => saveState(state) };
    STEPS[creating ? currentStep : SHEET_STEP].render(panel, ctx);
    if (creating) {
      renderNav();
      btnBack.disabled = currentStep === 0;
      btnNext.disabled = false;
      btnNext.textContent = currentStep === LAST_CREATE_STEP ? 'Finish' : 'Next';
      btnNpc.hidden = currentStep !== LAST_CREATE_STEP;
    }
    rerenderPools();
  }

  // Nothing is open. Either there are saved characters to choose from, or
  // there are not - and if there are not, the way in is an import or a new
  // build, because a character made in the web app arrives as a file.
  async function renderStart() {
    let names = [];
    try {
      names = await listNames();
    } catch (err) {
      console.error('Failed to list saved characters', err);
    }
    let fresh = [];
    try { fresh = await listTransfers(); } catch (err) { fresh = []; }

    const box = el('div', { class: 'start-panel' });
    if (fresh.length) {
      box.append(
        el('h2', {}, 'New from Owlbear'),
        el('p', { class: 'start-note' }, 'Saved from the Owlbear Character Sheet into your Downloads.'),
        el('ul', { class: 'character-list' }, fresh.map((t) => el('li', {}, [
          el('button', {
            type: 'button',
            class: 'character-pick',
            text: `${t.name || 'Unnamed'} (${t.replaces ? 'newer copy' : 'new'}, ${ago(t.modified)})`,
            onClick: () => { transfers = fresh; openTransfer(t.file); },
          }),
        ]))),
      );
    }
    if (names.length) {
      box.append(
        el('h2', {}, 'Open a character'),
        el('p', { class: 'start-note' }, 'Pick one of your saved characters, bring one in from a file, or start from scratch.'),
        characterList(names),
      );
    } else {
      box.append(
        el('h2', {}, 'No characters saved yet'),
        el('p', { class: 'start-note' }, 'Nothing is saved on this device. Import a character you made elsewhere, or build a new one.'),
      );
    }
    box.append(el('div', { class: 'start-actions' }, [
      el('button', { type: 'button', class: 'file-link', text: 'Import Character', onClick: doImport }),
      el('button', { type: 'button', class: 'file-link new-btn', text: 'New Character', onClick: startNew }),
    ]));
    panel.appendChild(box);
  }

  function characterList(names) {
    return el('ul', { class: 'character-list' }, names.map((name) => el('li', {}, [
      el('button', {
        type: 'button',
        class: 'character-pick',
        text: name,
        onClick: () => openSaved(name),
      }),
    ])));
  }

  function renderNav() {
    nav.innerHTML = '';
    STEPS.slice(0, LAST_CREATE_STEP + 1).forEach((step, i) => {
      const btn = el('button', {
        type: 'button',
        text: step.title,
        class: i === currentStep ? 'active' : i < currentStep ? 'visited' : '',
        onClick: () => {
          currentStep = i;
          rerenderStep();
        },
      });
      nav.appendChild(btn);
    });
  }

  async function openSaved(name) {
    try {
      state = adopt(data, await loadByName(name));
      document.querySelector('.load-failure')?.remove();
      showMigrationNotices();
      saveState(state);
      resetLoadSelect();
      mode = 'sheet';
      rerenderStep();
      say(`Opened "${name}".`);
    } catch (err) {
      console.error(err);
      say(`Could not open "${name}".`, true);
      showLoadFailure(`Opening "${name}"`, err);
    }
  }

  // A failed Import or Open used to flash one line in the header and leave
  // the character that was already open on screen - which then looked like
  // the file. That is how a player's imported Viktor came up as an older
  // build with somebody else's Skills. A failure now says so in red, with
  // the reason, and the character underneath is named as what it is.
  function showLoadFailure(what, err) {
    document.querySelector('.load-failure')?.remove();
    const reason = (err && (err.message || String(err))) || 'unknown error';
    const banner = el('div', { class: 'load-failure', role: 'alert' }, [
      el('p', {}, [el('strong', {}, `${what} failed. `),
        mode === 'start'
          ? 'Nothing was opened.'
          : `What is on screen is ${state.name ? `"${state.name}", ` : ''}the character that was already open - not the file.`]),
      el('p', { class: 'load-failure-reason' }, `Reason: ${reason}`),
      el('p', {}, 'Reload the page with Ctrl+Shift+R and try again. If it fails again, send the file and this message.'),
      el('button', { type: 'button', text: 'Dismiss', onclick: () => banner.remove() }),
    ]);
    panel.parentNode.insertBefore(banner, panel);
  }

  async function doImport() {
    try {
      const picked = await pickCharacterFile();
      if (!picked) return;
      state = adopt(data, picked.character);
      document.querySelector('.load-failure')?.remove();
      showMigrationNotices();
      saveState(state);
      resetLoadSelect();
      mode = 'sheet';
      rerenderStep();
      say(`Imported "${state.name || picked.name}".`);
    } catch (err) {
      console.error(err);
      say('That file is not a character the creator can read.', true);
      showLoadFailure('Import', err);
    }
  }

  function startNew() {
    state = createInitialState(data);
    saveState(state);
    resetLoadSelect();
    currentStep = 0;
    mode = 'create';
    rerenderStep();
  }

  // The saved characters, in the bar itself. A menu that had to be opened
  // first hid the one thing somebody comes to this row to do.
  // Characters saved from the Owlbear Character Sheet (desktop only):
  // the newest copy of each one in the download folder that the Creator
  // does not already have. Listed in their own group so it is plain where
  // they came from.
  let transfers = [];
  const TRANSFER = 'transfer:';
  const FOLDER = '__transfer-folder__';

  function ago(ms) {
    const mins = Math.max(0, Math.round((Date.now() - ms) / 60000));
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }

  async function fillLoadSelect() {
    let names = [];
    try {
      names = await listNames();
    } catch (err) {
      console.error('Failed to list saved characters', err);
    }
    try {
      transfers = await listTransfers();
    } catch (err) {
      transfers = [];
      console.error('Failed to read the download folder', err);
    }
    loadSelect.innerHTML = '';
    const any = names.length || transfers.length;
    loadSelect.appendChild(el('option', { value: '' },
      transfers.length ? `Load Character (${transfers.length} new from Owlbear)`
        : any ? 'Load Character' : 'No saved characters'));
    if (transfers.length) {
      loadSelect.appendChild(el('optgroup', { label: 'New in Downloads (from Owlbear)' },
        transfers.map((t) => el('option', { value: TRANSFER + t.file },
          `${t.name || 'Unnamed'} - ${t.replaces ? 'newer copy' : 'new'}, ${ago(t.modified)}`))));
    }
    const saved = names.map((name) => el('option', { value: name }, name));
    if (transfers.length && saved.length) loadSelect.appendChild(el('optgroup', { label: 'Saved' }, saved));
    else saved.forEach((o) => loadSelect.appendChild(o));
    if (isDesktopApp) loadSelect.appendChild(el('option', { value: FOLDER }, 'Where Owlbear saves...'));
    loadSelect.disabled = !any && !isDesktopApp;
  }

  // Opening a character from the download folder keeps it: it is saved
  // into the Creator's own folder at once, so it is there next time even
  // if Downloads is cleared - and it drops off the "new" list.
  async function openTransfer(file) {
    const entry = transfers.find((t) => t.file === file);
    try {
      state = adopt(data, await loadTransfer(file));
      document.querySelector('.load-failure')?.remove();
      showMigrationNotices();
      saveState(state);
      await saveCharacter(state);
      await fillLoadSelect();
      resetLoadSelect();
      mode = 'sheet';
      rerenderStep();
      say(`Opened "${state.name || file}" from Downloads${entry ? `, saved in Owlbear ${ago(entry.modified)}` : ''}. It is in your saved characters now.`);
    } catch (err) {
      console.error(err);
      say(`Could not open "${file}".`, true);
      showLoadFailure(`Opening "${file}" from Downloads`, err);
    }
  }

  // The browser may save somewhere other than Downloads; the player points
  // the Creator at that folder once.
  async function pickTransferFolder() {
    resetLoadSelect();
    let current = '';
    try { current = await transferFolder(); } catch (err) { current = ''; }
    const picked = await window.__TAURI__.dialog.open({
      directory: true,
      defaultPath: current || undefined,
      title: 'The folder your browser saves downloads to',
    });
    if (!picked) {
      if (current) say(`The Creator looks for Owlbear saves in ${current}.`);
      return;
    }
    try {
      const now = await changeTransferFolder(String(picked));
      await fillLoadSelect();
      say(`The Creator now looks for Owlbear saves in ${now}.`);
    } catch (err) {
      say(`That folder can't be used: ${err}`, true);
    }
  }

  // Opening a character leaves its name sitting in the box, which reads
  // as a filter rather than a thing that already happened.
  function resetLoadSelect() {
    loadSelect.value = '';
  }

  btnBack.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      rerenderStep();
    }
  });
  btnNext.addEventListener('click', () => {
    if (currentStep < LAST_CREATE_STEP) {
      currentStep += 1;
      rerenderStep();
      return;
    }
    // The end of the last step is the end of creation.
    mode = 'sheet';
    rerenderStep();
  });
  // An NPC ends creation the same way, minus whatever it did not spend.
  btnNpc.addEventListener('click', () => {
    markNpc(state, data);
    mode = 'sheet';
    rerenderStep();
  });
  // Starting a new character throws away whatever is open, so it asks
  // once - but only when there is something to lose. From the start
  // screen there is nothing behind it and the second click is just a
  // toll on the way in.
  let newArmed = false;
  let newTimer = null;
  function disarmNew() {
    clearTimeout(newTimer);
    newArmed = false;
    btnNew.textContent = 'New Character';
    btnNew.classList.remove('armed');
  }
  btnNew.addEventListener('click', () => {
    if (mode === 'start') {
      startNew();
      return;
    }
    if (!newArmed) {
      newArmed = true;
      btnNew.textContent = 'Discard this one?';
      btnNew.classList.add('armed');
      clearTimeout(newTimer);
      newTimer = setTimeout(disarmNew, 4000);
      return;
    }
    disarmNew();
    startNew();
  });

  btnSave.addEventListener('click', async () => {
    if (mode === 'start') {
      say('There is no character open to save.', true);
      return;
    }
    try {
      const savedAs = await saveCharacter(state);
      await fillLoadSelect();
      // The desktop Save also leaves a copy in the download folder, for the
      // Owlbear Character Sheet's Load.
      say(isDesktopApp ? `Saved as "${savedAs}", with a copy in Downloads for Owlbear.` : `Saved as "${savedAs}".`);
    } catch (err) {
      console.error(err);
      say('Save failed.', true);
    }
  });

  loadSelect.addEventListener('change', () => {
    const name = loadSelect.value;
    if (name === FOLDER) { pickTransferFolder(); return; }
    if (name.startsWith(TRANSFER)) { openTransfer(name.slice(TRANSFER.length)); return; }
    if (name) openSaved(name);
  });

  btnEdit.addEventListener('click', () => {
    if (mode === 'create') {
      mode = 'sheet';
    } else {
      mode = 'create';
      // Back at the beginning, because what was forgotten could be
      // anywhere - and the pills are right there to jump with.
      currentStep = 0;
    }
    resetLoadSelect();
    rerenderStep();
  });

  btnImport.addEventListener('click', doImport);

  btnExport.addEventListener('click', () => {
    if (mode === 'start') {
      say('There is no character open to export.', true);
      return;
    }
    downloadJson(state);
  });

  // Save in Owlbear, switch back here: the new file is already listed.
  if (isDesktopApp) {
    window.addEventListener('focus', () => {
      fillLoadSelect();
      if (mode === 'start') rerenderStep();
    });
  }

  await fillLoadSelect();
  rerenderStep();
}

main();
