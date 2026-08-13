import { el, renderMarkdown } from '../ui.js';
import { computeFiguredCharacteristics, startingFateTokens, skillTierName } from '../state.js';
import { downloadMarkdown } from '../export/toMarkdown.js';
import { downloadPdf } from '../export/toPdf.js';

function inline(md) {
  return window.marked ? window.marked.parseInline(md) : md;
}

export default {
  id: 'sheet',
  title: '13-14. Sheet & Export',
  render(container, { state, data }) {
    const figured = computeFiguredCharacteristics(state);
    const fate = startingFateTokens(state, data);

    const boonEntries = state.boons.map((b) =>
      el('li', {}, b.tier ? `${b.name} (${b.tier})` : `${b.name} (${b.points} pts)`),
    );

    const resourceEntries = data.resources
      .filter((r) => state.resources[r.name] > 0)
      .map((r) => {
        const level = state.resources[r.name];
        const desc = r.levels[level] ?? '';
        return el('li', {}, [
          el('strong', {}, `${r.name}: Level ${level}`),
          el('div', { class: 'detail', html: renderMarkdown(desc) }),
        ]);
      });

    const giftEntries = state.gifts
      .filter((g) => g.level > 0)
      .map((g) =>
        el(
          'li',
          {},
          `${g.name} (Level ${g.level})${g.adders.length ? ' - Adders: ' + g.adders.join(', ') : ''}${g.limiters.length ? ' - Limiters: ' + g.limiters.join(', ') : ''}`,
        ),
      );

    const sheet = el('div', { class: 'sheet', id: 'character-sheet' }, [
      el('h2', {}, state.name || 'Unnamed Character'),
      state.concept ? el('p', {}, state.concept) : null,
      el('p', {}, `Nature: ${state.nature.picked ?? state.nature.custom?.label ?? '(none)'}`),

      el('h3', {}, 'Attributes'),
      el(
        'p',
        {},
        data.attributes.map((a) => `${a.name} ${state.attributes[a.name]}`).join('  |  '),
      ),

      el('h3', {}, 'Sub-Stats & Descriptors'),
      el(
        'ul',
        {},
        data.subStats
          .filter((s) => state.subStats[s.name] > 0 || state.descriptors[s.name].some(Boolean))
          .map((s) =>
            el(
              'li',
              {},
              `${s.name} ${state.subStats[s.name]} - ${state.descriptors[s.name].filter(Boolean).join(', ') || 'no Descriptors'}`,
            ),
          ),
      ),

      el('h3', {}, 'Skills'),
      el(
        'ul',
        {},
        data.skillCatalog
          .filter((s) => state.skills[s.name] > 0)
          .map((s) => el('li', {}, `${s.name}: ${skillTierName(data, state.skills[s.name])}`)),
      ),
      el('table', {}, [
        el('tr', {}, [el('th', {}, 'Tier'), el('th', {}, 'Roll')]),
        ...data.skillTiers.map((t) =>
          el('tr', {}, [el('td', {}, t.name), el('td', { html: inline(t.roll) })]),
        ),
      ]),

      el('h3', {}, 'Boons'),
      el('ul', {}, boonEntries),

      el('h3', {}, 'Resources'),
      el('ul', {}, resourceEntries),

      el('h3', {}, 'Gifts'),
      el('ul', {}, giftEntries),

      el('h3', {}, 'Flaws'),
      el(
        'ul',
        {},
        state.flaws
          .filter((f) => f.level > 0)
          .map((f) => el('li', {}, `${f.name} (Level ${f.level})`)),
      ),

      el('h3', {}, 'Figured Characteristics'),
      el(
        'ul',
        {},
        Object.entries(figured).map(([name, value]) => el('li', {}, `${name}: ${value}`)),
      ),

      el('h3', {}, 'Finishing Touches'),
      el('p', {}, `Starting Fate Tokens: ${fate}`),
    ]);

    const notesField = el('div', { class: 'field' }, [
      el('label', {}, 'Finishing Touches notes (equipment, appearance, anything else)'),
      el('textarea', {
        rows: 4,
        text: state.finishingNotes,
        onInput: (e) => {
          state.finishingNotes = e.target.value;
        },
      }),
    ]);

    const exportRow = el('div', { style: 'display:flex;gap:0.75rem;margin-top:1rem;' }, [
      el('button', {
        type: 'button',
        text: 'Download Markdown',
        onClick: () => downloadMarkdown(state, data),
      }),
      el('button', {
        type: 'button',
        text: 'Download PDF',
        onClick: () => downloadPdf(sheet, state.name),
      }),
    ]);

    container.append(el('h2', {}, '13-14. Figured Characteristics & Finishing Touches'), notesField, sheet, exportRow);
  },
};
