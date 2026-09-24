// Picking up gear after creation.
//
// The gear step on the creation side is an accounting exercise: free
// bands, splurges, Wealth Checks against creation-Wealth, all of it once
// and only once. None of that applies to the sword a character is handed
// in play - the table already decided they have it, and creation-Wealth
// was settled weeks ago. So this adds the item and charges nothing. The
// entry is marked as picked up in play, which is what keeps it out of the
// creation sums if anyone opens that step again.

import { el } from '../ui.js';
import { addGearPurchase } from '../state.js';

// The three blocks on page 4 take three different things. Armour is the
// one the tables name outright; a weapon is anything carrying a Damage
// column; equipment is what is left. Nobody looks for a shotgun under
// Equipment, and nobody wants the whole catalogue when they are filling
// in the Armour rows.
const isArmour = (cat) => /armou?r/i.test(cat.parent || cat.category || '');

function catalogue(data, kind) {
  const out = [];
  (data.equipment || []).forEach((cat) => {
    const armour = isArmour(cat);
    let items;
    if (kind === 'armour') items = armour ? cat.items : [];
    else if (kind === 'weapon') items = armour ? [] : cat.items.filter((i) => i.Damage);
    else items = armour ? [] : cat.items.filter((i) => !i.Damage);
    if (items.length) out.push({ name: cat.category, parent: cat.parent, items });
  });
  return out;
}

const TITLE = {
  weapon: 'Add a weapon',
  armour: 'Add armour',
  equipment: 'Add equipment',
};

const COLUMNS = {
  weapon: [['Weapon', (i) => i.name], ['Damage', (i) => i.Damage || '-'],
    ['Range', (i) => i['Range (Normal / Long)'] || i.Range || '-']],
  armour: [['Item', (i) => i.name], ['Zone', (i) => i.Zone || '-'],
    ['Hardness', (i) => i.Hardness || '-'], ['Health', (i) => i['Health Levels'] || '-']],
  equipment: [['Item', (i) => i.name]],
};

export default function buildItemPicker(state, data, kind, onAdded) {
  const noun = kind === 'weapon' ? 'weapon' : 'item';
  const groups = catalogue(data, kind);
  const body = el('div', { class: 'item-picker-body' });
  const note = el('p', { class: 'attr-caption' },
    `Picked up in play - this goes straight onto the sheet and costs no `
    + `creation-Wealth. Whether they could afford it is the table's call.`);

  const search = el('input', {
    type: 'search',
    class: 'item-picker-search',
    placeholder: `Search ${kind === 'weapon' ? 'weapons' : kind === 'armour' ? 'armour' : 'equipment'}…`,
    onInput: (e) => draw(e.target.value.trim().toLowerCase()),
  });

  function add(category, item, own) {
    addGearPurchase(state, {
      category,
      name: item.name,
      wealth: item.wealth ?? null,
      loss: 0,
      free: false,
    });
    const entry = state.gearPurchases[state.gearPurchases.length - 1];
    entry.acquired = 'play';
    // Written in by hand: the catalogue has no entry to look these up in,
    // so the numbers travel with the item.
    if (own) Object.assign(entry, own);
    onAdded(item.name);
  }

  // The catalogue is a long list, and the thing somebody is holding is
  // often not in it. So the box to write your own sits first, before the
  // scrolling starts - not buried under it.
  function customForm() {
    const name = el('input', {
      type: 'text',
      class: 'item-picker-field',
      placeholder: { weapon: 'Harpoon gun', armour: 'Riot plate' }[kind]
        || "your brother's jacket",
      maxlength: '120',
    });
    const small = (placeholder) => el('input', {
      type: 'text', class: 'item-picker-field item-picker-small', placeholder,
    });
    const damage = small('Damage');
    const range = small('Range');
    const hardness = small('Hardness');
    const health = small('Health');
    const zone = el('select', { class: 'item-picker-field item-picker-small' }, [
      el('option', { value: 'Center of Mass' }, 'Center of Mass'),
      el('option', { value: 'Head' }, 'Head'),
      el('option', { value: 'Arms' }, 'Arms'),
      el('option', { value: 'Legs' }, 'Legs'),
      el('option', { value: 'All four' }, 'All four'),
    ]);
    const err = el('span', { class: 'item-picker-error' });

    const extras = {
      weapon: [damage, range],
      armour: [zone, hardness, health],
      equipment: [],
    }[kind] || [];

    function commit() {
      const text = name.value.trim();
      if (!text) {
        err.textContent = 'Give it a name first.';
        return;
      }
      let own = null;
      if (kind === 'weapon') {
        own = {
          damage: damage.value.trim() || '-',
          range: range.value.trim() || 'Melee',
          ammo: '',
          reload: '',
        };
      } else if (kind === 'armour') {
        // Hardness is what makes it armour rather than a coat, so a blank
        // one still counts as 1 - the row has to land in the Armour block
        // either way, and 0 would read as no protection at all.
        own = {
          zone: zone.value,
          hardness: hardness.value.trim() || '1',
          health: health.value.trim() || '1',
        };
      }
      add('Custom', { name: text, wealth: null }, own);
    }

    name.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
    });

    const hint = {
      weapon: 'Not in the book? Write it in. Damage and range are whatever your GM says they are.',
      armour: "Not in the book? Write it in. Hardness and Health are your GM's call.",
      equipment: 'Not in the book? Write it in.',
    }[kind] || 'Not in the book? Write it in.';

    return el('div', { class: 'item-picker-custom' }, [
      el('div', { class: 'item-picker-custom-row' }, [
        name,
        ...extras,
        el('button', { type: 'button', class: 'file-link', text: 'Add', onClick: commit }),
      ]),
      el('p', { class: 'attr-caption' }, hint),
      err,
    ]);
  }

  function draw(filter = '') {
    body.innerHTML = '';
    let shown = 0;
    groups.forEach((cat) => {
      const items = filter
        ? cat.items.filter((i) => i.name.toLowerCase().includes(filter))
        : cat.items;
      if (!items.length) return;
      shown += items.length;
      const cols = COLUMNS[kind] || COLUMNS.equipment;
      const rows = items.map((item) => el('tr', {}, [
        ...cols.map(([, read]) => el('td', {}, String(read(item) ?? '-'))),
        el('td', {}, item.wealth != null ? `W${item.wealth}` : '-'),
        el('td', {}, [
          el('button', {
            type: 'button',
            class: 'file-link',
            text: 'Add',
            onClick: () => add(cat.name, item),
          }),
        ]),
      ]));
      body.append(
        el('h4', { class: 'item-picker-cat' }, cat.name),
        el('table', { class: 'item-picker-table' }, [
          el('thead', {}, [el('tr', {}, [
            ...cols.map(([head]) => el('th', {}, head)),
            el('th', {}, 'Wealth'),
            el('th', {}, ''),
          ])]),
          el('tbody', {}, rows),
        ]),
      );
    });
    if (!shown) body.append(el('p', { class: 'attr-caption' }, `No ${noun} matches that.`));
  }

  draw();
  return [
    el('h3', {}, TITLE[kind] || 'Add equipment'),
    note,
    customForm(),
    search,
    body,
  ];
}
