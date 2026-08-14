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
    // Pool-points'-worth of extra capacity bought via Discretionary, added
    // on top of each target's base pool total. Gifts is tracked separately
    // (see giftsDiscretionaryContribution) since its per-unit cost varies
    // with Limiters chosen after purchase.
    discretionaryExtra: {
      Resources: 0,
      Skills: 0,
      Descriptors: 0,
      'Fate Tokens': 0,
      Boons: 0,
      Attributes: 0,
    },
    discretionaryCap: null, // GM-set cap on Flaw-earned Discretionary points, null = uncapped
    // Tracks how many pool-points'-worth of each scalar target (Attributes/
    // Skills/Resources/Gifts) were funded specifically through step 12's
    // Discretionary pickers, keyed by item name. Lets step 12 offer real
    // +/- controls on the actual items (not just an abstract pool bump)
    // while still letting the item's own step show/adjust the same value.
    discretionaryPurchases: { Attributes: {}, Skills: {}, Resources: {}, Gifts: {} },
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
  const total = data.giftsPoolTotal + giftsDiscretionaryContribution(state, data);
  return total - giftsPointsSpent(state, data);
}

// ---- Discretionary purchases of real items (step 12) ----
// Attributes/Skills/Resources use a flat per-unit cost, so their
// discretionaryExtra counters can just be incremented/decremented directly
// alongside the real state change. Gifts are the exception - a Gift's
// per-Level cost depends on how many Limiters it has, which can change
// after the purchase - so Gifts track levels-bought-here per Gift and
// recompute their pool contribution live instead of a static increment.

export function buyAttributePoint(state, attrName) {
  state.attributes[attrName] += 1;
  state.discretionaryPurchases.Attributes[attrName] =
    (state.discretionaryPurchases.Attributes[attrName] ?? 0) + 1;
  state.discretionaryExtra.Attributes += 1;
}

export function refundAttributePoint(state, attrName) {
  const bought = state.discretionaryPurchases.Attributes[attrName] ?? 0;
  if (bought <= 0) return;
  state.attributes[attrName] -= 1;
  state.discretionaryPurchases.Attributes[attrName] = bought - 1;
  state.discretionaryExtra.Attributes -= 1;
}

export function buySkillTier(state, skillName) {
  state.skills[skillName] += 1;
  state.discretionaryPurchases.Skills[skillName] =
    (state.discretionaryPurchases.Skills[skillName] ?? 0) + 1;
  state.discretionaryExtra.Skills += 1;
}

export function refundSkillTier(state, skillName) {
  const bought = state.discretionaryPurchases.Skills[skillName] ?? 0;
  if (bought <= 0) return;
  state.skills[skillName] -= 1;
  state.discretionaryPurchases.Skills[skillName] = bought - 1;
  state.discretionaryExtra.Skills -= 1;
}

export function buyResourceLevel(state, data, resourceName) {
  state.resources[resourceName] += 1;
  state.discretionaryPurchases.Resources[resourceName] =
    (state.discretionaryPurchases.Resources[resourceName] ?? 0) + 1;
  state.discretionaryExtra.Resources += data.resourceLevelCost;
}

export function refundResourceLevel(state, data, resourceName) {
  const bought = state.discretionaryPurchases.Resources[resourceName] ?? 0;
  if (bought <= 0) return;
  state.resources[resourceName] -= 1;
  state.discretionaryPurchases.Resources[resourceName] = bought - 1;
  state.discretionaryExtra.Resources -= data.resourceLevelCost;
}

export function buyGiftLevel(state, giftName) {
  let g = state.gifts.find((x) => x.name === giftName);
  if (!g) {
    g = { name: giftName, level: 0, adders: [], limiters: [] };
    state.gifts.push(g);
  }
  g.level += 1;
  state.discretionaryPurchases.Gifts[giftName] = (state.discretionaryPurchases.Gifts[giftName] ?? 0) + 1;
}

export function refundGiftLevel(state, giftName) {
  const bought = state.discretionaryPurchases.Gifts[giftName] ?? 0;
  if (bought <= 0) return;
  const g = state.gifts.find((x) => x.name === giftName);
  g.level -= 1;
  state.discretionaryPurchases.Gifts[giftName] = bought - 1;
}

export function giftsDiscretionaryContribution(state, data) {
  let total = 0;
  Object.entries(state.discretionaryPurchases.Gifts).forEach(([name, levels]) => {
    if (!levels) return;
    const g = state.gifts.find((x) => x.name === name);
    total += levels * giftLevelCost(data, g ? g.limiters.length : 0);
  });
  return total;
}

export function addBoon(state, name, cost, source) {
  state.boons.push({ name, points: cost.points, tier: cost.tier, source });
  if (source === 'discretionary') {
    state.discretionaryExtra.Boons += cost.points;
  }
}

export function removeBoon(state, index) {
  const [removed] = state.boons.splice(index, 1);
  if (removed?.source === 'discretionary') {
    state.discretionaryExtra.Boons -= removed.points;
  }
}

// Every Flaw in flaws.md is Leveled; points granted equal the level taken.
export function flawsPointsGranted(state) {
  return state.flaws.reduce((sum, f) => sum + f.level, 0);
}

// Unspent points from the base 10-point Boons Pool convert 1:1 into
// Discretionary rather than being lost. Only counts Boons bought with
// source 'pool' - a Boon bought *with* Discretionary points doesn't feed
// back into this, which would just be moving the same points in a circle.
export function unspentBoonsPoolPoints(state, data) {
  const poolFundedSpent = state.boons
    .filter((b) => b.source !== 'discretionary')
    .reduce((sum, b) => sum + b.points, 0);
  return Math.max(0, data.boonsPoolTotal - poolFundedSpent);
}

// The GM's cap (see step 12) applies only to Flaw-earned Discretionary,
// same as it always has - Boons Pool leftover isn't a stacking-for-profit
// lever the way Flaws can be, it's just "don't lose points you didn't
// spend," so it always converts in full regardless of the cap.
export function discretionaryTotal(state, data) {
  const flawBonus =
    state.discretionaryCap != null
      ? Math.min(flawsPointsGranted(state), state.discretionaryCap)
      : flawsPointsGranted(state);
  return data.discretionaryBase + flawBonus + unspentBoonsPoolPoints(state, data);
}

export function discretionaryPointsSpent(state, data) {
  let spent = 0;
  Object.entries(state.discretionaryExtra).forEach(([target, extra]) => {
    if (target === 'Gifts') return; // computed separately, see giftsDiscretionaryContribution
    spent += extra * (data.discretionaryRates[target] ?? 0);
  });
  spent += giftsDiscretionaryContribution(state, data) * (data.discretionaryRates.Gifts ?? 0);
  const extraDescriptorCount = Object.values(state.extraDescriptors).reduce((a, b) => a + b, 0);
  spent += extraDescriptorCount * (data.discretionaryRates.Descriptors ?? 0);
  return spent;
}

export function discretionaryRemaining(state, data) {
  return discretionaryTotal(state, data) - discretionaryPointsSpent(state, data);
}

export function skillTierName(data, tier) {
  return data.skillTiers.find((t) => t.tier === tier)?.name ?? String(tier);
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
    Ki: Math.ceil(ki),
  };
}

// Gift Check target number: current Ki + Stamina (see rules/gifts.md#resolution).
export function giftCheckTarget(state) {
  return computeFiguredCharacteristics(state).Ki + state.subStats.Stamina;
}

export function startingFateTokens(state, data) {
  return data.startingFateTokens + state.discretionaryExtra['Fate Tokens'];
}

// ---- Play State (post-creation tracking: damage, Fate Tokens, Ki, rest) ----

// state.current* fields don't exist until the character sheet is first
// shown - initialized here to each track's max/starting value rather than
// baked into createInitialState, so they always reflect whatever the build
// actually looked like the moment the player finished it. Safe to call every
// render: only sets a field the first time (`== null`), never resets an
// in-progress character's tracked values on a later visit to the sheet.
export function initPlayState(state, data) {
  const figured = computeFiguredCharacteristics(state);
  if (state.currentHealth == null) state.currentHealth = figured['Health Levels'];
  if (state.currentPoise == null) state.currentPoise = figured.Poise;
  if (state.currentSanity == null) state.currentSanity = figured.Sanity;
  if (state.currentKi == null) state.currentKi = figured.Ki;
  if (state.currentFateTokens == null) state.currentFateTokens = startingFateTokens(state, data);
}

export function healthStatus(current, healthSubStat) {
  if (current > 0) return null;
  // "At 0 Health Levels, a character falls unconscious" is unconditional -
  // death requires actually going negative, not just reaching the death
  // formula's threshold. Without the `current < 0` check, a character with
  // Health sub-stat 0 (death threshold ≤ -0, i.e. ≤ 0) would show Dead the
  // instant they hit 0, skipping Unconscious entirely.
  return current < 0 && current <= -healthSubStat ? 'Dead' : 'Unconscious';
}

export function poiseStatus(current) {
  return current <= 0 ? 'Flustered' : null;
}

export function sanityStatus(current) {
  if (current < 0) return 'Shattered';
  return current === 0 ? 'Overwhelmed' : null;
}

// Short Rest and Full Night's Rest recovery (see rules.md#health-level-recovery,
// #sanity, #ki). Health and Sanity share the same below-0 exception, confirmed
// 2026-08-14: any rest, Short or Full, only recovers 1 Level and caps at 0 -
// never the normal partial rate, never a full heal, while already below 0.
// Poise never goes below 0, so it has no such exception.
function restLevel(current, max, subStatValue, isFullRest) {
  if (current < 0) {
    return Math.min(0, current + 1);
  }
  if (isFullRest) return max;
  return Math.min(max, current + Math.ceil(subStatValue / 2));
}

export function applyRest(state, isFullRest) {
  const figured = computeFiguredCharacteristics(state);
  const s = state.subStats;
  state.currentHealth = restLevel(state.currentHealth, figured['Health Levels'], s.Health, isFullRest);
  state.currentSanity = restLevel(state.currentSanity, figured.Sanity, s.Psyche, isFullRest);
  state.currentPoise = isFullRest
    ? figured.Poise
    : Math.min(figured.Poise, state.currentPoise + Math.ceil(s.Presence / 2));
  state.currentKi = isFullRest ? figured.Ki : Math.min(figured.Ki, state.currentKi + Math.ceil(s.Klotho / 2));
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
