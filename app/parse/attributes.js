import { extractTableAfter, extractNumberNear, findSection } from './markdown.js';

// Parses steps 4, 5, 12, 13, 14 of character-creation.md: the five
// Attributes, their sub-stats, the point-buy pool/cap, the Discretionary
// conversion table, the Figured Characteristics formulas, and starting
// Fate Tokens.
export function parseAttributes(creationMd) {
  const attrTable = extractTableAfter(creationMd, '## 4. Attributes');
  const attributes = attrTable.rows.map((row) => ({
    name: row.Attribute,
    description: row.Description,
    splitsInto: row['Splits into'].split('/').map((s) => s.trim()),
  }));

  const attributePoolTotal = extractNumberNear(
    creationMd,
    '## 4. Attributes',
    /have \*\*(\d+) points\*\* to spend/,
  );
  const attributeCap = extractNumberNear(
    creationMd,
    '## 4. Attributes',
    /maximum of \*\*(\d+)\*\*/,
  );
  const attributeFloor = extractNumberNear(
    creationMd,
    '## 4. Attributes',
    /starts at \*\*(\d+)\*\* for free/,
  );

  const subStatTable = extractTableAfter(creationMd, '## 5. Sub-Stat Division');
  const subStats = subStatTable.rows.map((row) => ({
    attribute: row.Attribute,
    name: row['Sub-stat'],
    description: row['What it does'],
  }));

  const skillsPoolTotal = extractNumberNear(
    creationMd,
    'Beyond Everyman',
    /\*\*(\d+)-point Skills Pool\*\*/,
  );
  const boonsPoolTotal = extractNumberNear(
    creationMd,
    '## 8. Boons',
    /\*\*(\d+)-point Boons Pool\*\*/,
  );
  const resourcesPoolTotal = extractNumberNear(
    creationMd,
    '## 9. Resources',
    /\*\*(\d+)-point Resources Pool\*\*/,
  );
  const giftsPoolTotal = extractNumberNear(
    creationMd,
    '## 10. Gifts',
    /\*\*(\d+)-point Gifts Pool\*\*/,
  );
  const giftLevelCost = extractNumberNear(
    creationMd,
    '## 10. Gifts',
    /flat \*\*(\d+) points\*\*/,
  );

  const discretionaryBase = extractNumberNear(
    creationMd,
    '## 12. Discretionary Points',
    /\*\*(\d+) Discretionary points\*\*/,
  );
  const discretionaryTable = extractTableAfter(creationMd, '## 12. Discretionary Points');
  const discretionaryRates = {};
  discretionaryTable.rows.forEach((row) => {
    discretionaryRates[row.Target] = Number(row['Discretionary points per point']);
  });

  const figuredTable = extractTableAfter(creationMd, '## 13. Figured Characteristics');
  const figuredCharacteristics = figuredTable.rows.map((row) => ({
    name: row.Characteristic,
    formula: row.Formula,
  }));

  const startingFateTokens = extractNumberNear(
    creationMd,
    '## 14. Finishing Touches',
    /begins play with \*\*(\d+)\*\*/,
  );

  return {
    attributes,
    attributePoolTotal,
    attributeCap,
    attributeFloor,
    subStats,
    skillsPoolTotal,
    boonsPoolTotal,
    resourcesPoolTotal,
    giftsPoolTotal,
    giftLevelCost,
    discretionaryBase,
    discretionaryRates,
    figuredCharacteristics,
    startingFateTokens,
  };
}

// Everyman Skills table, also from character-creation.md step 7.
export function parseEverymanSkills(creationMd) {
  const section = findSection(creationMd, '7. Skills', '##');
  const table = extractTableAfter(section, '| Skill | Why');
  return table.rows.map((row) => row.Skill);
}
