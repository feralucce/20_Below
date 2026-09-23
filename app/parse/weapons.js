import { splitByHeading, extractAllTables } from './markdown.js';

// weapons.md is a table per category (Basic Weapons, Armor, Tech &
// Electronics, ...). Column names differ per category (Weapon/Item, Damage/
// Soak Bonus/Effect, etc.), so rows are kept as-is, keyed by header text -
// only `name` (always the first column) and `wealth` (a number, or null for
// items like Fists/feet that use "-" - not purchasable via this system) are
// normalized across every category for the gear-shop UI to key off of.
//
// A "##" section used to mean exactly one table, and this took the first
// one it found. The Black Market broke both halves of that: its heading
// carries prose and no table of its own, and its goods are split into one
// "###" table per kind of thing so a submachine gun keeps its damage and
// reload columns. Taking the first table silently published one of its
// twenty-seven items.
//
// So: walk every table in the file, and title each one by the nearest
// heading above it at any depth. A section with no table contributes
// nothing instead of throwing.
export function parseEquipment(weaponsMd) {
  const out = [];
  splitByHeading(weaponsMd, '##').forEach(({ title, body }) => {
    const tables = extractAllTables(body);
    if (!tables.length) return;
    const subtitles = [...body.matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
    tables.forEach((table, i) => {
      const nameColumn = table.headers[0];
      const items = table.rows.map((row) => ({
        ...row,
        name: row[nameColumn],
        wealth: row.Wealth === '-' ? null : Number(row.Wealth),
        blackMarket: row['Black Market'] ? Number(row['Black Market']) : null,
      }));
      out.push({
        category: tables.length > 1 && subtitles[i] ? subtitles[i] : title,
        parent: title,
        headers: table.headers,
        items,
      });
    });
  });
  return out;
}

// Starting Packages (weapons.md#starting-packages) is a "##" section that
// parseEquipment above passes over on its own: it holds no table, and a
// section with no table contributes nothing there. It is parsed here
// instead, because its shape is free-form - "**Level N** (description)"
// headers, each followed by a "- **Name** - contents" bullet list.
export function parseEverymanGearPackages(weaponsMd) {
  const marker = '## Starting Packages';
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
