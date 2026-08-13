// Owns the character build state, all pool math, validation, and the
// Figured Characteristics formulas from character-creation.md step 13.
// Every pool size/rate/cost used here comes from the parsed rules data
// (see main.js), nothing is hardcoded twice.

const TIER_COST = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };

export function createInitialState(data) {
  const attributes = {};
  data.attributes.forEach((a) => {
    attributes[a.name] = data.attributeFloor;
  });

  const subStats = {};
  data.subStats.forEach((s) => {
    subStats[s.name] = 0;
  });

  const descriptors = {}; // subStatName -> string[]
  data.subStats.forEach((s) => {
    descriptors[s.name] = [];
  });
  const extraDescriptors = {}; // subStatName -> count bought via Discretionary
  data.subStats.forEach((s) => {
    extraDescriptors[s.name] = 0;
  });

  const skills = {}; // skillName -> tier (0-5). Everyman skills start at tier 2.
  data.skillCatalog.forEach((s) => {
    skills[s.name] = data.everymanSkills.includes(s.name) ? 2 : 0;
  });

  const resources = {};
  data.resources.forEach((r) => {
    resources[r.name] = 0;
  });

  return {
    name: '',
    concept: '',
    nature: { picked: null, custom: null }, // picked = name from starter list; custom = { label, drive, trigger }
    attributes,
    subStats,
    descriptors,
    extraDescriptors,
    skills,
    boons: [], // [{ name, points, tier }] - Special Movement (repeatable) can appear more than once
    resources,
    gifts: [], // [{ name, level, adders: string[], limiters: string[] }]
    flaws: [], // [{ name, level }]
    discretionaryExtra: {
      Resources: 0,
      Skills: 0,
      Descriptors: 0,
      'Fate Tokens': 0,
      Boons: 0,
      Gifts: 0,
      Attributes: 0,
    },
    discretionaryCap: null, // GM-set cap on Flaw-earned Discretionary points, null = uncapped
    finishingNotes: '',
  };
}

// ---- Pools ----

export function attributePointsSpent(state, data) {
  let spent = 0;
  data.attributes.forEach((a) => {
    spent += state.attributes[a.name] - data.attributeFloor;
  });
  return spent;
}

export function attributePoolRemaining(state, data) {
  const total = data.attributePoolTotal + state.discretionaryExtra.Attributes;
  return total - attributePointsSpent(state, data);
}

// Each raised Attribute generates a sub-stat pool equal to its own rating,
// split between its two sub-stats however the player likes.
export function subStatPoolRemaining(state, data, attributeName) {
  const attr = data.attributes.find((a) => a.name === attributeName);
  const [subA, subB] = attr.splitsInto;
  const spent = state.subStats[subA] + state.subStats[subB];
  return state.attributes[attributeName] - spent;
}

export function skillPointCost(tier, baselineTier) {
  return Math.max(0, TIER_COST[tier] - TIER_COST[baselineTier]);
}

export function skillsPointsSpent(state, data) {
  let spent = 0;
  data.skillCatalog.forEach((s) => {
    const baseline = data.everymanSkills.includes(s.name) ? 2 : 0;
    spent += skillPointCost(state.skills[s.name], baseline);
  });
  return spent;
}

export function skillsPoolRemaining(state, data) {
  const total = data.skillsPoolTotal + state.discretionaryExtra.Skills;
  return total - skillsPointsSpent(state, data);
}

export function boonsPointsSpent(state) {
  return state.boons.reduce((sum, b) => sum + b.points, 0);
}

export function boonsPoolRemaining(state, data) {
  const total = data.boonsPoolTotal + state.discretionaryExtra.Boons;
  return total - boonsPointsSpent(state);
}

export function resourcesPointsSpent(state, data) {
  let spent = 0;
  data.resources.forEach((r) => {
    spent += state.resources[r.name] * data.resourceLevelCost;
  });
  return spent;
}

export function resourcesPoolRemaining(state, data) {
  const total = data.resourcesPoolTotal + state.discretionaryExtra.Resources;
  return total - resourcesPointsSpent(state, data);
}

// A Limiter drops the cost of every Level of its Gift by 1 point, floored
// at 1 point/Level, stacking with no ceiling on how many can be taken.
export function giftLevelCost(data, limiterCount) {
  return Math.max(1, data.giftLevelCost - limiterCount);
}

export function giftPointsSpent(gift, data) {
  const perLevel = giftLevelCost(data, gift.limiters.length);
  const levelCost = gift.level * perLevel;
  const adderCost = gift.adders.reduce((sum, adderName) => {
    const giftData = data.gifts.find((g) => g.name === gift.name);
    const adder = giftData.adders.find((a) => a.name === adderName);
    return sum + (adder ? adder.points : 0);
  }, 0);
  return levelCost + adderCost;
}

export function giftsPointsSpent(state, data) {
  return state.gifts.reduce((sum, g) => sum + giftPointsSpent(g, data), 0);
}

export function giftsPoolRemaining(state, data) {
  const total = data.giftsPoolTotal + state.discretionaryExtra.Gifts;
  return total - giftsPointsSpent(state, data);
}

// Every Flaw in flaws.md is Leveled; points granted equal the level taken.
export function flawsPointsGranted(state) {
  return state.flaws.reduce((sum, f) => sum + f.level, 0);
}

export function discretionaryTotal(state, data) {
  const earned = data.discretionaryBase + flawsPointsGranted(state);
  return state.discretionaryCap != null
    ? Math.min(earned, data.discretionaryBase + state.discretionaryCap)
    : earned;
}

export function discretionaryPointsSpent(state, data) {
  let spent = 0;
  Object.entries(state.discretionaryExtra).forEach(([target, extra]) => {
    spent += extra * (data.discretionaryRates[target] ?? 0);
  });
  const extraDescriptorCount = Object.values(state.extraDescriptors).reduce((a, b) => a + b, 0);
  spent += extraDescriptorCount * (data.discretionaryRates.Descriptors ?? 0);
  return spent;
}

export function discretionaryRemaining(state, data) {
  return discretionaryTotal(state, data) - discretionaryPointsSpent(state, data);
}

// ---- Descriptors ----

export function descriptorSlots(state, subStatName) {
  return state.subStats[subStatName] + state.extraDescriptors[subStatName];
}

// ---- Figured Characteristics (computed live, formulas parsed but applied here) ----

export function computeFiguredCharacteristics(state) {
  const s = state.subStats;
  const ki =
    ((s.Soak + s.Initiative + s.Ferocity + s.Stamina + s.Atropos) / 5) * 2;
  return {
    'Health Levels': 5 + s.Health,
    Poise: 5 + s.Presence,
    Sanity: 5 + s.Psyche,
    Defense: 10 - s.Atropos,
    'Movement Rate': 5 + state.attributes.Air,
    'Carrying Capacity': Math.pow(s.Potence, 2) * 10,
    Ki: ki,
  };
}

export function startingFateTokens(state, data) {
  return data.startingFateTokens + state.discretionaryExtra['Fate Tokens'];
}

export function allPoolsSummary(state, data) {
  return [
    { label: 'Attributes', remaining: attributePoolRemaining(state, data) },
    { label: 'Skills', remaining: skillsPoolRemaining(state, data) },
    { label: 'Boons', remaining: boonsPoolRemaining(state, data) },
    { label: 'Resources', remaining: resourcesPoolRemaining(state, data) },
    { label: 'Gifts', remaining: giftsPoolRemaining(state, data) },
    { label: 'Discretionary', remaining: discretionaryRemaining(state, data) },
  ];
}
