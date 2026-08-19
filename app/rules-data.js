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

// Shared between main.js (the character creator) and file.js (Save/Load/
// Import) - both need the same parsed rules shape to build createInitialState
// against, so this lives on its own rather than duplicated in each entry point.
export async function loadRulesData() {
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
