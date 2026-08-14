import { el, renderMarkdown } from '../ui.js';
import { computeFiguredCharacteristics, startingFateTokens, skillTierName } from '../state.js';
import { downloadMarkdown } from '../export/toMarkdown.js';
import { downloadHtml, printToPdf } from '../export/toHtml.js';
import { downloadRtf } from '../export/toRtf.js';

function inline(md) {
  return window.marked ? window.marked.parseInline(md) : md;
}

function pipTracker(label, count, color) {
  const pips = [];
  for (let i = 0; i < count; i++) {
    pips.push(el('div', { class: 'pip', style: `--pip-color:${color}` }));
  }
  return el('div', { class: 'field-box' }, [
    el('span', { class: 'field-label' }, label),
    el('div', { class: 'pip-row' }, pips),
    el('span', { class: 'pip-fraction' }, `${count}/${count}`),
  ]);
}

function buildBoonEntries(state, data) {
  return state.boons.map((b) => {
    const boonData = data.boons.find((d) => d.name === b.name);
    const label = b.tier ? `${b.name} (${b.tier})` : `${b.name} (${b.points} pts)`;
    return el('li', {}, [
      el('strong', {}, label + ': '),
      boonData ? el('span', { html: inline(boonData.effect) }) : null,
    ]);
  });
}

function buildResourceEntries(state, data) {
  return data.resources
    .filter((r) => state.resources[r.name] > 0)
    .map((r) => {
      const level = state.resources[r.name];
      const desc = r.levels[level] ?? '';
      return el('li', {}, [
        el('strong', {}, `${r.name}: Level ${level}`),
        el('div', { class: 'detail', html: renderMarkdown(desc) }),
      ]);
    });
}

function buildGiftEntries(state, data) {
  return state.gifts
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
}

function buildFlawEntries(state, data) {
  return state.flaws
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
}

const ATTR_COLORS = { Earth: 'var(--earth)', Air: 'var(--air)', Fire: 'var(--fire)', Water: 'var(--water)', Moira: 'var(--moira)' };

function buildAttributesTab(state, data) {
  return [
    el(
      'div',
      { class: 'attr-grid' },
      data.attributes.map((a) => {
        const [subA, subB] = a.splitsInto;
        const color = ATTR_COLORS[a.name] ?? 'var(--accent)';
        return el('div', { class: 'attr-card', style: `--attr-color:${color}` }, [
          el('div', { class: 'attr-card-header' }, [
            el('span', { class: 'attr-name' }, a.name),
            el('span', { class: 'attr-value' }, String(state.attributes[a.name])),
          ]),
          el('div', { class: 'attr-substats' }, [
            el('div', { class: 'attr-substat' }, [
              el('div', { class: 'sub-label' }, subA),
              el('div', { class: 'sub-value' }, String(state.subStats[subA])),
            ]),
            el('div', { class: 'attr-substat' }, [
              el('div', { class: 'sub-label' }, subB),
              el('div', { class: 'sub-value' }, String(state.subStats[subB])),
            ]),
          ]),
        ]);
      }),
    ),
    el('h3', {}, 'Descriptors'),
    el(
      'ul',
      {},
      data.subStats
        .filter((s) => state.subStats[s.name] > 0 || state.descriptors[s.name].some(Boolean))
        .map((s) =>
          el(
            'li',
            {},
            `${s.name}: ${state.descriptors[s.name].filter(Boolean).join(', ') || 'no Descriptors'}`,
          ),
        ),
    ),
    el(
      'p',
      { class: 'attr-caption' },
      'One Descriptor per point allocated to a sub-stat. Point to one when you argue a Skill and Attribute pairing.',
    ),
  ];
}

function buildSkillsTab(state, data) {
  return [
    el(
      'ul',
      {},
      data.skillCatalog
        .filter((s) => state.skills[s.name] > 0)
        .map((s) => el('li', {}, `${s.name}: ${skillTierName(data, state.skills[s.name])}`)),
    ),
    el('h3', {}, 'Training Tiers'),
    el('table', {}, [
      el('tr', {}, [el('th', {}, 'Tier'), el('th', {}, 'Roll')]),
      ...data.skillTiers.map((t) => el('tr', {}, [el('td', {}, t.name), el('td', { html: inline(t.roll) })])),
    ]),
  ];
}

function buildGiftsTab(state, data) {
  return [
    el('ul', {}, buildGiftEntries(state, data)),
    el('p', { class: 'attr-caption', html: inline(data.giftCheckText) }),
  ];
}

function buildTraitsTab(state, data) {
  return [
    el('h3', {}, 'Boons'),
    el('ul', {}, buildBoonEntries(state, data)),
    el('h3', {}, 'Flaws'),
    el('ul', {}, buildFlawEntries(state, data)),
  ];
}

function buildGearTab(state, data) {
  return [el('ul', {}, buildResourceEntries(state, data))];
}

function buildBiographyTab(state) {
  const nature = state.nature.custom;
  return [
    el('h3', {}, 'Concept'),
    el('p', {}, state.concept || '(none written)'),
    nature
      ? [
          el('h3', {}, 'Nature'),
          el('p', {}, [el('strong', {}, nature.label + ': '), nature.drive]),
          nature.trigger ? el('p', { class: 'detail' }, nature.trigger) : null,
        ]
      : null,
    el('h3', {}, 'Notes'),
    el('p', {}, state.finishingNotes || '(none written)'),
  ].flat();
}

const TABS = [
  { id: 'attributes', label: 'Attributes', build: buildAttributesTab },
  { id: 'skills', label: 'Skills', build: buildSkillsTab },
  { id: 'gifts', label: 'Gifts', build: buildGiftsTab },
  { id: 'traits', label: 'Traits', build: buildTraitsTab },
  { id: 'gear', label: 'Gear', build: buildGearTab },
  { id: 'biography', label: 'Biography', build: buildBiographyTab },
];

function buildHeader(state, data, figured, fate) {
  const natureLabel = state.nature.picked ?? state.nature.custom?.label ?? '';

  return [
    el('div', { class: 'sheet-topbar' }, [
      el('div', { class: 'sheet-logo' }, '20'),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Name'),
        el('div', { class: 'field-value' }, state.name || 'Unnamed Character'),
      ]),
    ]),

    el('div', { class: 'sheet-fields-row' }, [
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Concept'),
        el('div', { class: 'field-value' }, state.concept || '—'),
      ]),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Nature'),
        el('div', { class: 'field-value' }, natureLabel || '—'),
      ]),
    ]),

    el('div', { class: 'sheet-trackers-row' }, [
      pipTracker('Health Levels', figured['Health Levels'], 'var(--ok)'),
      pipTracker('Poise', figured.Poise, 'var(--gold)'),
      pipTracker('Sanity', figured.Sanity, 'var(--air)'),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Ki'),
        el('div', { class: 'tracker-value' }, `${figured.Ki}/${figured.Ki}`),
      ]),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Fate Tokens'),
        el('div', { class: 'fate-value' }, String(fate)),
        el('div', { class: 'inert-btn' }, 'Spend token'),
      ]),
    ]),

    el('div', { class: 'sheet-mini-row' }, [
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Defense'),
        el('div', { class: 'mini-value' }, String(figured.Defense)),
      ]),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Movement'),
        el('div', { class: 'mini-value' }, `${figured['Movement Rate']}m`),
      ]),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Carry'),
        el('div', { class: 'mini-value' }, `${figured['Carrying Capacity']}kg`),
      ]),
      el('div', { class: 'inert-btn' }, 'Short rest'),
      el('div', { class: 'inert-btn' }, "Full night's rest"),
    ]),
  ];
}

export default {
  id: 'sheet',
  title: '13-14. Sheet & Export',
  render(container, { state, data }) {
    const figured = computeFiguredCharacteristics(state);
    const fate = startingFateTokens(state, data);

    let activeTab = TABS[0].id;
    const tabContent = el('div', { class: 'tab-content' });
    const tabNav = el('div', { class: 'tab-nav' });

    function renderTabContent() {
      tabContent.innerHTML = '';
      const tab = TABS.find((t) => t.id === activeTab);
      tabContent.append(...tab.build(state, data).filter((n) => n != null));
    }

    function renderTabNav() {
      tabNav.innerHTML = '';
      TABS.forEach((tab) => {
        tabNav.appendChild(
          el('button', {
            type: 'button',
            text: tab.label,
            class: tab.id === activeTab ? 'tab-btn active' : 'tab-btn',
            onClick: () => {
              activeTab = tab.id;
              renderTabNav();
              renderTabContent();
            },
          }),
        );
      });
    }

    renderTabNav();
    renderTabContent();

    const sheet = el('div', { class: 'sheet', id: 'character-sheet' }, [
      ...buildHeader(state, data, figured, fate),
      tabNav,
      tabContent,
    ]);

    // A separate, non-tabbed copy with every section stacked - the PDF needs
    // everything in one document regardless of which tab happens to be open
    // on screen, so it renders from this hidden element instead.
    const printSheet = el(
      'div',
      { class: 'sheet sheet-print-only', id: 'character-sheet-print' },
      [
        ...buildHeader(state, data, figured, fate),
        ...TABS.flatMap((tab) => [
          el('h3', {}, tab.label),
          el('div', {}, tab.build(state, data)),
        ]),
      ],
    );
    // Only one of these should ever exist in the DOM - drop any leftover
    // from a previous visit to this step before adding the fresh one. The
    // wrapper (not the sheet itself) carries the hiding style - clipping
    // an ancestor's height keeps the sheet normally rendered (so html2canvas
    // measures it correctly) while staying invisible to the user, unlike
    // `position: absolute; left: -99999px`, which html2canvas measures as
    // zero-size.
    document.getElementById('character-sheet-print-wrapper')?.remove();
    const printWrapper = el('div', { class: 'print-sheet-wrapper', id: 'character-sheet-print-wrapper' }, [
      printSheet,
    ]);
    document.body.appendChild(printWrapper);

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
        text: 'Download RTF',
        onClick: () => {
          try {
            downloadRtf(state, data);
          } catch (err) {
            console.error(err);
            alert('RTF generation failed - try the Markdown export instead.');
          }
        },
      }),
      el('button', {
        type: 'button',
        text: 'Download HTML',
        onClick: async (e) => {
          const btn = e.currentTarget;
          const original = btn.textContent;
          btn.disabled = true;
          btn.textContent = 'Generating…';
          try {
            await downloadHtml(printSheet, state.name);
          } catch (err) {
            console.error(err);
            alert('HTML generation failed - try the Markdown export instead.');
          } finally {
            btn.disabled = false;
            btn.textContent = original;
          }
        },
      }),
      el('button', {
        type: 'button',
        text: 'Print / Save as PDF',
        onClick: async (e) => {
          const btn = e.currentTarget;
          const original = btn.textContent;
          btn.disabled = true;
          btn.textContent = 'Opening…';
          try {
            await printToPdf(printSheet, state.name);
          } catch (err) {
            console.error(err);
            alert('Could not open the print view - try the Download HTML export instead.');
          } finally {
            btn.disabled = false;
            btn.textContent = original;
          }
        },
      }),
    ]);

    container.append(el('h2', {}, '13-14. Character Sheet & Export'), notesField, sheet, exportRow);
  },
};
