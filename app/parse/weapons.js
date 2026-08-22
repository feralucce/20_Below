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

// Everyman Gear Packages (weapons.md#everyman-gear-packages) is a "###"
// subsection deliberately kept out of parseEquipment's "##"-per-category
// loop above (it has no single flat item table, so it would crash that
// parser). Free-form instead: "**Level N** (description)" headers, each
// followed by a "- **Name** - contents" bullet list.
export function parseEverymanGearPackages(weaponsMd) {
  const marker = '### Everyman Gear Packages';
  const idx = weaponsMd.indexOf(marker);
  if (idx === -1) return [];
  const section = weaponsMd.slice(idx + marker.length);
  const parts = section.split(/\n\*\*Level (\d+)\*\*/).slice(1);
  const levels = [];
  for (let i = 0; i < parts.length; i += 2) {
    const level = Number(parts[i]);
    const body = parts[i + 1];
    const packages = [...body.matchAll(/^- \*\*(.+?)\*\* - (.+)$/gm)].map((m) => ({
      name: m[1].trim(),
      contents: m[2].trim(),
    }));
    levels.push({ level, packages });
  }
  return levels;
}
