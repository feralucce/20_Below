/* Set the Skill List as cards rather than as a table.
 *
 * rules/skills.md holds the catalog as a markdown table, and that is
 * deliberate: the character creator and the desktop app parse it
 * straight out of the file, it diffs one Skill per line, and it is the
 * shape the data actually is. What it is not is the shape a reader
 * wants - 88 rows of three columns is a spreadsheet, and everywhere
 * else in the project a Skill is a card with the Element on its edge.
 *
 * So the table stays the source and this turns it into cards on the
 * way to the screen. The alternative was authoring the blocks and
 * teaching the rules pages a renderer, which means a build step
 * GitHub Pages cannot run, and a parser that reads HTML instead of a
 * table. Not worth it for a presentation change.
 *
 * With JavaScript off the reader gets the table, which is a perfectly
 * good way to read a Skill list and exactly what they get today.
 */
(function () {
  'use strict';

  var ELEMENTS = ['earth', 'air', 'fire', 'water', 'moira'];

  function cardFor(row, columns) {
    var cells = row.querySelectorAll('td');
    if (cells.length < columns.definition + 1) return null;

    var name = cells[columns.name].textContent.trim();
    var element = cells[columns.element].textContent.trim();
    if (!name) return null;

    var card = document.createElement('div');
    card.className = 'skill';
    // An Element the stylesheet has no colour for - "per character",
    // say, which is what Special Weapons carries - leaves the card on
    // the default accent rather than inventing a hue for it.
    var key = element.toLowerCase();
    if (ELEMENTS.indexOf(key) !== -1) card.className += ' skill--' + key;

    var title = document.createElement('p');
    title.className = 'block-title';
    title.textContent = name;
    if (element) {
      var pill = document.createElement('span');
      pill.className = 'skill-elem';
      pill.textContent = element;
      title.appendChild(pill);
    }

    var body = document.createElement('p');
    // innerHTML rather than textContent: the definitions carry links
    // and emphasis, and flattening them would lose the cross-references
    // to the rest of the ruleset.
    body.innerHTML = cells[columns.definition].innerHTML;

    card.appendChild(title);
    card.appendChild(body);
    return card;
  }

  function headingIndex(table, wanted) {
    var heads = table.querySelectorAll('thead th');
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].textContent.trim().toLowerCase() === wanted) return i;
    }
    return -1;
  }

  function convert(table) {
    var columns = {
      name: headingIndex(table, 'skill'),
      element: headingIndex(table, 'default element'),
      definition: headingIndex(table, 'definition'),
    };
    // Only this one table. Every other table on a rules page - the
    // tiers, the weapon ladder, the Everyman list - is a table because
    // it is one, and turning those into cards would be worse.
    if (columns.name < 0 || columns.element < 0 || columns.definition < 0) return;

    var holder = document.createElement('div');
    holder.className = 'skill-list';
    var rows = table.querySelectorAll('tbody tr');
    for (var i = 0; i < rows.length; i++) {
      var card = cardFor(rows[i], columns);
      if (card) holder.appendChild(card);
    }
    // If nothing converted, leave the table alone rather than replacing
    // it with an empty div.
    if (!holder.children.length) return;
    table.parentNode.replaceChild(holder, table);
  }

  function run() {
    var tables = document.querySelectorAll('main table');
    for (var i = 0; i < tables.length; i++) convert(tables[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
