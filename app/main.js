import { createInitialState, allPoolsSummary } from './state.js';
import { el, poolBadge } from './ui.js';
import { loadRulesData } from './rules-data.js';

import stepIdentity from './steps/01-identity.js';
import stepNature from './steps/02-nature.js';
import stepAttributes from './steps/03-attributes.js';
import stepSubstats from './steps/04-substats.js';
import stepDescriptors from './steps/05-descriptors.js';
import stepSkills from './steps/06-skills.js';
import stepBoons from './steps/07-boons.js';
import stepResources from './steps/08-resources.js';
import stepGifts from './steps/09-gifts.js';
import stepGiftMenus from './steps/10-gift-menus.js';
import stepFlaws from './steps/11-flaws.js';
import stepDiscretionary from './steps/12-discretionary.js';
import stepEquipment from './steps/12a-equipment.js';
import stepSheet from './steps/13-sheet.js';
import stepRoller from './steps/14-roller.js';

const STEPS = [
  stepIdentity,
  stepNature,
  stepAttributes,
  stepSubstats,
  stepDescriptors,
  stepSkills,
  stepBoons,
  stepResources,
  stepGifts,
  stepGiftMenus,
  stepFlaws,
  stepDiscretionary,
  stepEquipment,
  stepSheet,
  stepRoller,
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
    return { ...createInitialState(data), ...JSON.parse(raw) };
  } catch {
    return createInitialState(data);
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function main() {
  let data;
  try {
    data = await loadRulesData();
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
