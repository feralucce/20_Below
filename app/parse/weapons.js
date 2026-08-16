import { splitByHeading, extractAllTables } from './markdown.js';

// weapons.md is one table per "##" category (Basic Weapons, Armor, Tech &
// Electronics, ...). Column names differ per category (Weapon/Item, Damage/
// Soak Bonus/Effect, etc.), so rows are kept as-is, keyed by header text -
// only `name` (always the first column) and `wealth` (a number, or null for
// items like Fists/feet that use "-" - not purchasable via this system) are
// normalized across every category for the gear-shop UI to key off of.
export function parseEquipment(weaponsMd) {
  return splitByHeading(weaponsMd, '##').map(({ title, body }) => {
    const table = extractAllTables(body)[0];
    const nameColumn = table.headers[0];
    const items = table.rows.map((row) => ({
      ...row,
      name: row[nameColumn],
      wealth: row.Wealth === '-' ? null : Number(row.Wealth),
    }));
    return { category: title, headers: table.headers, items };
  });
}
