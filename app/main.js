import { fetchText } from './parse/markdown.js';
import { parseAttributes, parseEverymanSkills } from './parse/attributes.js';
import { parseNatures } from './parse/nature.js';
import { parseSkillTiers, parseSkillCatalog } from './parse/skills.js';
import { parseBoons } from './parse/boons.js';
import { parseResources } from './parse/resources.js';
import { parseGifts } from './parse/gifts.js';
import { parseFlaws } from './parse/flaws.js';
import { createInitialState, allPoolsSummary } from './state.js';
import { el, poolBadge } from './ui.js';

import stepIdentity from './steps/01-identity.js';
import stepNature from './steps/02-nature.js';
import stepAttributes from './steps/03-attributes.js';
import stepSubstats from './steps/04-substats.js';
import stepDescriptors from './steps/05-descriptors.js';
import stepSkills from './steps/06-skills.js';
import stepBoons from './steps/07-boons.js';
import stepResources from './steps/08-resources.js';
import stepGifts from './steps/09-gifts.js';
import stepFlaws from './steps/10-flaws.js';
import stepDiscretionary from './steps/11-discretionary.js';
import stepSheet from './steps/12-sheet.js';

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
  stepFlaws,
  stepDiscretionary,
  stepSheet,
];

const STORAGE_KEY = '20below-character-draft';

const panel = document.getElementById('step-panel');
const nav = document.getElementById('step-nav');
const poolSummary = document.getElementById('pool-summary');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const btnReset = document.getElementById('btn-reset');

async function loadRulesData() {
  const [creationMd, fateMd, skillsMd, premadeMd, boonsMd, resourcesMd, giftsMd, flawsMd] =
    await Promise.all(
      [
        '../rules/character-creation.md',
        '../rules/fate.md',
        '../rules/skills.md',
        '../rules/premade-skills.md',
        '../rules/boons.md',
        '../rules/resources.md',
        '../rules/gifts.md',
        '../rules/flaws.md',
      ].map(fetchText),
    );

  return {
    ...parseAttributes(creationMd),
    everymanSkills: parseEverymanSkills(creationMd),
    natures: parseNatures(fateMd),
    skillTiers: parseSkillTiers(skillsMd),
    skillCatalog: parseSkillCatalog(premadeMd),
    boons: parseBoons(boonsMd),
    resources: parseResources(resourcesMd),
    gifts: parseGifts(giftsMd),
    flaws: parseFlaws(flawsMd),
  };
}

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
        text: `${i + 1}`,
        class: i === currentStep ? 'active' : i < currentStep ? 'visited' : '',
        title: step.title,
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
