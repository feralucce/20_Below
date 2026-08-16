import { fetchText } from './parse/markdown.js';
import { parseAttributes, parseEverymanSkills } from './parse/attributes.js';
import { parseNatures } from './parse/nature.js';
import { parseSkillTiers, parseSkillCatalog } from './parse/skills.js';
import { parseBoons } from './parse/boons.js';
import { parseResources } from './parse/resources.js';
import { parseGifts, parseGiftCheckText } from './parse/gifts.js';
import { parseFlaws } from './parse/flaws.js';
import { parseSampleDescriptors } from './parse/descriptors.js';
import { parseCosts } from './parse/costs.js';
import { parseDifficultyChart } from './parse/difficulty.js';
import { parseEquipment } from './parse/weapons.js';
import { createInitialState, allPoolsSummary } from './state.js';
import { el, poolBadge } from './ui.js';
import { isDesktopApp, saveCharacterToFile, listSavedCharacters, loadCharacterFromFile } from './desktop-storage.js';

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
const fileControls = document.getElementById('character-file-controls');

async function loadRulesData() {
  const [creationMd, fateMd, skillsMd, premadeMd, boonsMd, resourcesMd, giftsMd, flawsMd, rulesMd, costsMd, weaponsMd] =
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
        '../rules/rules.md',
        '../rules/costs.md',
        '../rules/weapons.md',
      ].map(fetchText),
    );

  const costs = parseCosts(costsMd);

  return {
    // parseAttributes(creationMd) still supplies structural data (the
    // Attribute/sub-stat lists, Figured Characteristics formulas) - every
    // numeric cost it also used to scrape out of character-creation.md's
    // prose is overridden below by costs.md, the app's actual source for
    // tunable numbers now (see rules/costs.md).
    ...parseAttributes(creationMd),
    ...costs,
    everymanSkills: parseEverymanSkills(creationMd),
    natures: parseNatures(fateMd),
    skillTiers: parseSkillTiers(skillsMd),
    skillCatalog: parseSkillCatalog(premadeMd),
    boons: parseBoons(boonsMd),
    resources: parseResources(resourcesMd),
    gifts: parseGifts(giftsMd, costs.giftAdderCost),
    giftCheckText: parseGiftCheckText(giftsMd),
    flaws: parseFlaws(flawsMd),
    sampleDescriptors: parseSampleDescriptors(rulesMd),
    difficultyChart: parseDifficultyChart(rulesMd),
    equipment: parseEquipment(weaponsMd),
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

// Replaces every own key on `target` with `source`'s, in place - `state` is
// a `const` binding closed over everywhere, so loading a saved character
// mutates its contents rather than rebinding the variable.
function replaceStateContents(target, source) {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, source);
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

  async function renderFileControls() {
    if (!isDesktopApp || !fileControls) return;
    fileControls.innerHTML = '';

    const select = el('select', { class: 'character-select' }, [
      el('option', { value: '' }, 'Load a saved character…'),
    ]);
    try {
      (await listSavedCharacters()).forEach((name) => {
        select.appendChild(el('option', { value: name }, name));
      });
    } catch (err) {
      console.error('Failed to list saved characters', err);
    }
    select.addEventListener('change', async () => {
      const name = select.value;
      if (!name) return;
      try {
        const loaded = await loadCharacterFromFile(name);
        replaceStateContents(state, { ...createInitialState(data), ...loaded });
        currentStep = 0;
        rerenderStep();
      } catch (err) {
        console.error(err);
        alert(`Failed to load "${name}".`);
      } finally {
        select.value = '';
      }
    });

    const saveBtn = el('button', {
      type: 'button',
      class: 'save-btn',
      text: 'Save',
      onClick: async () => {
        try {
          await saveCharacterToFile(state);
          await renderFileControls();
        } catch (err) {
          console.error(err);
          alert('Save failed.');
        }
      },
    });

    fileControls.append(select, saveBtn);
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
  renderFileControls();
}

main();
