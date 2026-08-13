import { fetchText } from './parse/markdown.js';
import { parseAttributes, parseEverymanSkills } from './parse/attributes.js';
import { parseNatures } from './parse/nature.js';
import { parseSkillTiers, parseSkillCatalog } from './parse/skills.js';
import { parseBoons } from './parse/boons.js';
import { parseResources } from './parse/resources.js';
import { parseGifts } from './parse/gifts.js';
import { parseFlaws } from './parse/flaws.js';

const panel = document.getElementById('step-panel');

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

async function main() {
  try {
    const data = await loadRulesData();
    window.__rulesData = data; // temporary: inspect in the console while parsers are being built out
    console.log('Parsed rules data:', data);
    panel.innerHTML = `
      <h2>Parser debug view</h2>
      <p>Rules data loaded. Open the console for the full object. Quick counts:</p>
      <ul>
        <li>Attributes: ${data.attributes.length} (pool ${data.attributePoolTotal}, cap ${data.attributeCap}, floor ${data.attributeFloor})</li>
        <li>Sub-stats: ${data.subStats.length}</li>
        <li>Everyman Skills: ${data.everymanSkills.length}</li>
        <li>Skills Pool: ${data.skillsPoolTotal}</li>
        <li>Skill tiers: ${data.skillTiers.length}</li>
        <li>Skill catalog: ${data.skillCatalog.length}</li>
        <li>Natures: ${data.natures.length}</li>
        <li>Boons: ${data.boons.length} (pool ${data.boonsPoolTotal})</li>
        <li>Resources: ${data.resources.length} (pool ${data.resourcesPoolTotal})</li>
        <li>Gifts: ${data.gifts.length} (pool ${data.giftsPoolTotal}, per-level cost ${data.giftLevelCost})</li>
        <li>Flaws: ${data.flaws.length}</li>
        <li>Discretionary base: ${data.discretionaryBase}, rates: ${JSON.stringify(data.discretionaryRates)}</li>
        <li>Figured Characteristics: ${data.figuredCharacteristics.map((f) => f.name).join(', ')}</li>
        <li>Starting Fate Tokens: ${data.startingFateTokens}</li>
      </ul>
    `;
  } catch (err) {
    console.error(err);
    panel.innerHTML = `<p class="error">Failed to load/parse rules data:\n${err.message}</p>`;
  }
}

main();
