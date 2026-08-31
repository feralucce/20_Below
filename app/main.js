import { createInitialState, mergeCharacterState, allPoolsSummary } from './state.js';
import { el, poolBadge } from './ui.js';
import { loadRulesData } from './rules-data.js';
import { isDesktopApp } from './desktop-storage.js';
import { isServingBundledRules } from './parse/markdown.js';

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

// Order is deliberately not the same as the file numbering (01-14, historical
// build order) - this is the actual wizard sequence shown to the user, last
// changed to move Boons/Flaws ahead of Skills so both point-granting steps
// land before the pools they can feed.
const STEPS = [
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

const panel = document.getElementById('step-panel');
const nav = document.getElementById('step-nav');
const poolSummary = document.getElementById('pool-summary');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const btnReset = document.getElementById('btn-reset');

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
    if (latest === current) {
      ledEl.textContent = 'Up to date';
      ledEl.className = 'version-led ok';
    } else {
      ledEl.textContent = 'Needs updating';
      ledEl.className = 'version-led needs-update';
    }
  } catch (err) {
    console.error('Failed to check version status', err);
  }
}

// Where the rules the app just parsed actually came from. The desktop build
// fetches live from main and only falls back to the snapshot bundled into the
// installer when that fails (offline, DNS, timeout) - which is silent by
// design, and shouldn't be. The browser build is served alongside the repo and
// is always live, so it gets no indicator.
function showRulesSource() {
  if (!isDesktopApp) return;
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

  const state = loadSavedState(data);
  let currentStep = 0;

  function rerenderPools() {
    poolSummary.innerHTML = '';
    allPoolsSummary(state, data).forEach((p) => poolSummary.appendChild(poolBadge(p.label, p.remaining)));
    saveState(state);
  }

  function rerenderStep() {
    panel.innerHTML = '';
    const ctx = { state, data, rerenderStep, rerenderPools };
    STEPS[currentStep].render(panel, ctx);
    renderNav();
    btnBack.disabled = currentStep === 0;
    btnNext.disabled = currentStep === STEPS.length - 1;
    rerenderPools();
  }

  function renderNav() {
    nav.innerHTML = '';
    STEPS.forEach((step, i) => {
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

  btnBack.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep -= 1;
      rerenderStep();
    }
  });
  btnNext.addEventListener('click', () => {
    if (currentStep < STEPS.length - 1) {
      currentStep += 1;
      rerenderStep();
    }
  });
  let resetArmed = false;
  let resetTimer = null;
  btnReset.addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true;
      btnReset.textContent = 'Click again to confirm';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        resetArmed = false;
        btnReset.textContent = 'Reset';
      }, 4000);
      return;
    }
    clearTimeout(resetTimer);
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  });

  rerenderStep();
}

main();
