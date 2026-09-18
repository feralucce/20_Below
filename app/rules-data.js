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
import { parseEquipment, parseEverymanGearPackages } from './parse/weapons.js';

// Shared between main.js (the character creator) and file.js (Save/Load/
// Import) - both need the same parsed rules shape to build createInitialState
// against, so this lives on its own rather than duplicated in each entry point.
/* The descriptions that don't fit in a table.
 *
 * A Gift keeps its description in rules/gifts.md, as the paragraph under
 * its heading, so the creator has always shown it. Boons, Flaws and
 * Resources are tables with nowhere to put one, so the app showed the
 * mechanical summary and none of the prose the book carries.
 *
 * rules/flavour.json is generated from the print chapters by
 * tools/extract-flavour.py and is not edited by hand. It is fetched the
 * same way the rules are, so later prose edits reach an installed app
 * without a rebuild.
 *
 * Missing or malformed, the creator still works and simply shows what it
 * showed before - the descriptions are worth having, not worth failing
 * a character build over.
 */
async function loadFlavour() {
  try {
    const raw = await fetchText('../rules/flavour.json');
    const parsed = JSON.parse(raw);
    return {
      boon: parsed.boon || {},
      flaw: parsed.flaw || {},
      resource: parsed.resource || {},
      item: parsed.item || {},
    };
  } catch (err) {
    console.warn('No descriptions loaded from rules/flavour.json', err);
    return { boon: {}, flaw: {}, resource: {}, item: {} };
  }
}

const withFlavour = (entries, byName) =>
  entries.map((e) => ({ ...e, flavour: byName[e.name] ?? null }));

export async function loadRulesData() {
  const [creationMd, fateMd, skillsMd, boonsMd, resourcesMd, giftsMd, flawsMd, rulesMd, costsMd, weaponsMd] =
    await Promise.all(
      [
        '../rules/character-creation.md',
        '../rules/fate.md',
        '../rules/skills.md',
        '../rules/boons.md',
        '../rules/resources.md',
        '../rules/gifts.md',
        '../rules/flaws.md',
        '../rules/rules.md',
        '../rules/costs.md',
        '../rules/weapons.md',
      ].map(fetchText),
    );

  // Sequential rather than inside the Promise.all above: this one is
  // allowed to fail, and a rejection there would take the rules with it.
  const flavour = await loadFlavour();
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
    skillCatalog: parseSkillCatalog(skillsMd),
    boons: withFlavour(parseBoons(boonsMd), flavour.boon),
    resources: withFlavour(parseResources(resourcesMd), flavour.resource),
    gifts: parseGifts(giftsMd, costs.giftAdderCost),
    giftCheckText: parseGiftCheckText(giftsMd),
    flaws: withFlavour(parseFlaws(flawsMd), flavour.flaw),
    sampleDescriptors: parseSampleDescriptors(rulesMd),
    difficultyChart: parseDifficultyChart(rulesMd),
    // Equipment is categories of items rather than a flat list, so the
    // descriptions attach a level down from where withFlavour works.
    equipment: parseEquipment(weaponsMd).map((cat) => ({
      ...cat,
      items: cat.items.map((i) => ({ ...i, flavour: flavour.item[i.name] ?? null })),
    })),
    everymanGearPackages: parseEverymanGearPackages(weaponsMd),
  };
}
