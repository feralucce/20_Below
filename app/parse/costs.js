import { extractTableAfter } from './markdown.js';

// Parses rules/costs.md, the single source of truth for every tunable
// number in the system. Returns a flat object using the same field names
// the app already used when these numbers were scraped out of
// character-creation.md's prose (attributePoolTotal, discretionaryRates,
// etc.) plus new fields for values that previously had no file backing at
// all (skillTierPointCost, gift Limiter discount/floor, Adder tier costs,
// Boon tier costs, and every Advancement XP rate). Spread this object over
// parseAttributes()'s output in main.js so these values win.
export function parseCosts(costsMd) {
  const pools = {};
  extractTableAfter(costsMd, '## Creation Pools').rows.forEach((row) => {
    pools[row.Pool] = Number(row['Total Points']);
  });

  const rates = {};
  extractTableAfter(costsMd, '## Creation Rates').rows.forEach((row) => {
    rates[row.Item] = Number(row.Value);
  });

  const discretionaryRates = {};
  extractTableAfter(costsMd, '## Discretionary Rates').rows.forEach((row) => {
    discretionaryRates[row.Target] = Number(row['Discretionary points per point']);
  });

  const caps = {};
  extractTableAfter(costsMd, '## Universal Caps').rows.forEach((row) => {
    caps[row.Cap] = Number(row.Value);
  });

  const adv = {};
  extractTableAfter(costsMd, '## Advancement (XP) Rates').rows.forEach((row) => {
    adv[row.Item] = Number(row.Value);
  });

  return {
    attributePoolTotal: pools.Attributes,
    skillsPoolTotal: pools.Skills,
    boonsPoolTotal: pools.Boons,
    resourcesPoolTotal: pools.Resources,
    giftsPoolTotal: pools.Gifts,

    attributeFloor: rates['Attribute Floor (starting free rating)'],
    attributeCap: rates['Attribute Cap (creation-time max)'],
    skillTierPointCost: rates['Skill Tier Point Cost (per tier)'],
    resourceLevelCost: rates['Resource Level Cost'],
    giftLevelCost: rates['Gift Level Cost'],
    giftLimiterDiscount: rates['Gift Limiter Discount (per Limiter, per Level)'],
    giftLimiterFloor: rates['Gift Limiter Floor (minimum points/Level)'],
    giftAdderCost: { Lesser: rates['Gift Adder Cost - Lesser'], Greater: rates['Gift Adder Cost - Greater'] },
    giftsLeftoverRate: rates['Gifts Pool Leftover Rate (Discretionary per unspent point)'],
    boonTierCost: {
      Trivial: rates['Boon Cost - Trivial'],
      Lesser: rates['Boon Cost - Lesser'],
      Greater: rates['Boon Cost - Greater'],
      Legendary: rates['Boon Cost - Legendary'],
    },
    startingFateTokens: rates['Starting Fate Tokens'],

    discretionaryRates,

    attributeRollCap: caps['Attribute contribution to a roll'],
    subStatCap: caps['Sub-Stat maximum'],
    attributeMax: caps['Attribute maximum'],

    advancement: {
      xpPerSession: adv['XP per Session (max)'],
      newResourceXp: adv['New Resource (Level 0 → 1) - flat XP'],
      resourceLevelXpMultiplier: adv['Resource Level - XP multiplier (current level × N)'],
      skillTierXpMultiplier: adv['Skill Training Tier - XP multiplier (current tier × N)'],
      attributeXpMultiplier: adv['Attribute - XP multiplier (current rating × N)'],
      boonXpMultiplier: adv['Boon - XP multiplier (× creation cost)'],
      newGiftBaseXp: adv['New Gift - base XP (before Limiter discount)'],
      giftLevelXpMultiplier: adv['Gift Level raise - XP multiplier (current level × N)'],
      giftLimiterDiscount: adv['Gift Limiter Discount, Advancement (per Limiter)'],
      giftLimiterFloor: adv['Gift Limiter Floor, Advancement (minimum XP)'],
      giftAdderXp: { Lesser: adv['Gift Adder XP - Lesser'], Greater: adv['Gift Adder XP - Greater'] },
      newSkillXp: adv['New Skill (Untrained → Novice) - flat XP'],
      flawBuyoffXpMultiplier: adv['Flaw Buy-off - XP multiplier (× points granted)'],
      attributeOverCapFateStep: adv['Attribute over 10 - Fate ceiling +1 per N points'],
      attributeOverCapAutoSuccessStep: adv['Attribute over 10 - auto-success per scene per N points'],
      attributeOverCapCritStep: adv['Attribute over 10 - critical band +1 per N points'],
    },
  };
}
