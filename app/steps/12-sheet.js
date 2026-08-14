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

    const boonEntries = state.boons.map((b) => {
      const boonData = data.boons.find((d) => d.name === b.name);
      const label = b.tier ? `${b.name} (${b.tier})` : `${b.name} (${b.points} pts)`;
      return el('li', {}, [
        el('strong', {}, label + ': '),
        boonData ? el('span', { html: inline(boonData.effect) }) : null,
      ]);
    });

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
      .map((g) => {
        const giftData = data.gifts.find((d) => d.name === g.name);
        const levelRows = giftData?.levels
          ? el(
              'ol',
              {},
              giftData.levels
                .filter((l) => l.level <= g.level)
                .map((l) => el('li', { html: inline(l.effect) })),
            )
          : giftData
            ? el('p', { class: 'detail' }, "No standard Level table for this Gift - see gifts.md for its full effect.")
            : null;
        const adderTexts = (giftData?.adders ?? []).filter((a) => g.adders.includes(a.name));
        const limiterTexts = (giftData?.limiters ?? []).filter((l) => g.limiters.includes(l.name));
        return el('li', {}, [
          el('strong', {}, `${g.name} (Level ${g.level})`),
          levelRows,
          adderTexts.length
            ? el('p', {}, [
                el('strong', {}, 'Adders: '),
                el('span', { html: adderTexts.map((a) => `${a.name} (${a.tier}) - ${inline(a.text)}`).join('; ') }),
              ])
            : null,
          limiterTexts.length
            ? el('p', {}, [
                el('strong', {}, 'Limiters: '),
                el('span', { html: limiterTexts.map((l) => `${l.name} - ${inline(l.text)}`).join('; ') }),
              ])
            : null,
        ]);
      });

    const flawEntries = state.flaws
      .filter((f) => f.level > 0)
      .map((f) => {
        const flawData = data.flaws.find((d) => d.name === f.name);
        const thisLevel = flawData?.levels?.find((l) => l.level === f.level);
        const effect = thisLevel
          ? el('span', { html: inline(thisLevel.effect) })
          : flawData
            ? el('span', { class: 'detail' }, "(no standard Level table for this Flaw - see flaws.md for its full effect)")
            : null;
        return el('li', {}, [el('strong', {}, `${f.name} (Level ${f.level}): `), effect]);
      });

    const natureLabel = state.nature.picked ?? state.nature.custom?.label ?? null;

    const sheet = el('div', { class: 'sheet', id: 'character-sheet' }, [
      el('div', { class: 'sheet-header' }, [
        el('h2', {}, state.name || 'Unnamed Character'),
        state.concept ? el('p', { class: 'sheet-concept' }, state.concept) : null,
        natureLabel ? el('span', { class: 'sheet-badge' }, `Nature: ${natureLabel}`) : null,
      ]),

      el('div', { class: 'sheet-body' }, [
        el('h3', {}, 'Attributes'),
        el(
          'div',
          { class: 'stat-row' },
          data.attributes.map((a) =>
            el('div', { class: 'stat-chip' }, [
              el('span', { class: 'stat-label' }, a.name),
              el('span', { class: 'stat-value' }, String(state.attributes[a.name])),
            ]),
          ),
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
        el('ul', {}, flawEntries),

        el('h3', {}, 'Figured Characteristics'),
        el(
          'div',
          { class: 'figured-grid' },
          Object.entries(figured).map(([name, value]) =>
            el('div', { class: 'figured-box' }, [
              el('div', { class: 'value' }, String(value)),
              el('div', { class: 'label' }, name),
            ]),
          ),
        ),

        el('p', {}, `Starting Fate Tokens: ${fate}`),
      ]),
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
        onClick: async (e) => {
          const btn = e.currentTarget;
          const original = btn.textContent;
          btn.disabled = true;
          btn.textContent = 'Generating…';
          try {
            await downloadPdf(sheet, state.name);
          } catch (err) {
            console.error(err);
            alert('PDF generation failed - try the Markdown export instead.');
          } finally {
            btn.disabled = false;
            btn.textContent = original;
          }
        },
      }),
    ]);

    container.append(el('h2', {}, '13-14. Figured Characteristics & Finishing Touches'), notesField, sheet, exportRow);
  },
};
