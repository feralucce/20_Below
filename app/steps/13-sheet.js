import { el, renderMarkdown } from '../ui.js';
import {
  computeFiguredCharacteristics,
  skillTierName,
  initPlayState,
  healthStatus,
  poiseStatus,
  sanityStatus,
  applyRest,
  effectiveResourceLevel,
} from '../state.js';
import { downloadJson } from '../export/toJson.js';
import buildAdvancementTab from './tab-advancement.js';
import buildScarsTab from './tab-scars.js';
import {
  buildAttackRollSection,
  buildDamageRollSection,
  buildSkillRollSection,
  buildGiftCheckSection,
  buildResourceCheckSection,
} from './roller-panel.js';

function inline(md) {
  return window.marked ? window.marked.parseInline(md) : md;
}

// Click a pip to set the fill level there (clicking a filled pip drops the
// count to that pip; clicking an empty one heals up to and including it).
// Pips only ever show the 0..max range - the "-1"/"+1" buttons cover the
// below-0 range (Health/Sanity only) that a fixed row of boxes can't.
function damageTracker(label, current, max, color, statusFn, onChange, interactive) {
  const clamped = Math.max(0, Math.min(max, current));
  const pips = [];
  for (let i = 0; i < max; i++) {
    const filled = i < clamped;
    pips.push(
      el('div', {
        class: filled ? 'pip' : 'pip pip-empty',
        style: `--pip-color:${color}`,
        onClick: interactive ? () => onChange(i < current ? i : i + 1) : null,
      }),
    );
  }
  const status = statusFn(current);
  return el('div', { class: 'field-box' }, [
    el('span', { class: 'field-label' }, label),
    el('div', { class: 'pip-row' }, pips),
    el('div', { class: 'tracker-row' }, [
      interactive ? el('button', { type: 'button', class: 'step-btn', text: '−', onClick: () => onChange(current - 1) }) : null,
      el('span', { class: 'pip-fraction' }, `${current}/${max}`),
      interactive ? el('button', { type: 'button', class: 'step-btn', text: '+', onClick: () => onChange(current + 1) }) : null,
      status ? el('span', { class: 'status-badge' }, status) : null,
    ]),
  ]);
}

// Ki and Fate Tokens don't fit the pip-boxes model - Ki's max can run well
// past what's reasonable to draw as boxes, and Fate Tokens has no max at
// all - so both get a plain stepping counter instead.
function counterTracker(label, current, max, onChange, interactive) {
  return el('div', { class: 'field-box' }, [
    el('span', { class: 'field-label' }, label),
    el('div', { class: 'tracker-row' }, [
      interactive ? el('button', { type: 'button', class: 'step-btn', text: '−', onClick: () => onChange(current - 1) }) : null,
      el('div', { class: 'tracker-value' }, max == null ? String(current) : `${current}/${max}`),
      interactive ? el('button', { type: 'button', class: 'step-btn', text: '+', onClick: () => onChange(current + 1) }) : null,
    ]),
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
      const effective = effectiveResourceLevel(state, r.name);
      const desc = r.levels[effective] ?? '';
      const label = effective < level ? `${r.name}: Level ${effective} (reduced from ${level})` : `${r.name}: Level ${level}`;
      return el('li', {}, [
        el('strong', {}, label),
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
        : giftData?.menu
          ? g.buildPurchases?.length
            ? el(
                'ul',
                {},
                g.buildPurchases.map((p) =>
                  el(
                    'li',
                    {},
                    `${p.option} (${p.cost} pt${p.cost === 1 ? '' : 's'})${p.note ? ` - ${p.note}` : ''}`,
                  ),
                ),
              )
            : el('p', { class: 'detail' }, 'No build-menu purchases yet - see Gift Menus.')
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
      'One Descriptor per point allocated to a sub-stat. Point to one when you challenge a Skill\'s default Attribute/Element.',
    ),
  ];
}

function buildSkillsTab(state, data, refresh, refreshHeader) {
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
    buildSkillRollSection(state, data, refreshHeader),
  ];
}

function buildGiftsTab(state, data, refresh, refreshHeader, refreshKiDependents) {
  return [
    el('ul', {}, buildGiftEntries(state, data)),
    el('p', { class: 'attr-caption', html: inline(data.giftCheckText) }),
    buildGiftCheckSection(state, data, refreshKiDependents ?? refreshHeader),
  ];
}

function buildBoonsFlawsTab(state, data) {
  return [
    el('h3', {}, 'Boons'),
    el('ul', {}, buildBoonEntries(state, data)),
    el('h3', {}, 'Flaws'),
    el('ul', {}, buildFlawEntries(state, data)),
  ];
}

function buildResourcesTab(state, data) {
  return [
    el('ul', {}, buildResourceEntries(state, data)),
    buildResourceCheckSection(state, data),
  ];
}

function buildGearPurchaseEntries(state) {
  if (!state.gearPurchases.length) {
    return [el('p', { class: 'detail' }, 'No gear purchased at creation.')];
  }
  return [
    el(
      'ul',
      {},
      state.gearPurchases.map((p) =>
        el('li', {}, `${p.name} (${p.category}, Wealth ${p.wealth})${p.loss ? ` - cost ${p.loss} creation-Wealth` : ''}`),
      ),
    ),
  ];
}

function buildEverymanGearEntry(state) {
  const pkg = state.everymanGearPackage;
  if (!pkg) return [];
  return [
    el('h3', {}, 'Everyman Gear Package'),
    el('p', {}, [el('strong', {}, `${pkg.name} `), `(Level ${pkg.level}) - ${pkg.contents}`]),
  ];
}

function buildEquipmentTab(state, data) {
  return [
    ...buildEverymanGearEntry(state),
    el('h3', {}, 'Gear'),
    ...buildGearPurchaseEntries(state),
  ];
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
  { id: 'skills', label: 'Skills', build: buildSkillsTab, interactive: true },
  { id: 'gifts', label: 'Gifts', build: buildGiftsTab, interactive: true },
  { id: 'traits', label: 'Boons/Flaws', build: buildBoonsFlawsTab },
  { id: 'resources', label: 'Resources', build: buildResourcesTab },
  { id: 'gear', label: 'Equipment', build: buildEquipmentTab },
  { id: 'scars', label: 'Scars', build: buildScarsTab, interactive: true },
  { id: 'biography', label: 'Biography', build: buildBiographyTab },
  { id: 'advancement', label: 'Advancement', build: buildAdvancementTab, interactive: true },
];

// interactive=false renders a plain read-only snapshot (used by the hidden
// print copy, which only ever needs to be captured, never clicked).
function buildHeader(state, data, figured, { interactive = false, refresh = () => {} } = {}) {
  const natureLabel = state.nature.picked ?? state.nature.custom?.label ?? '';
  const healthSubStat = state.subStats.Health;

  const setHealth = (v) => {
    state.currentHealth = Math.min(figured['Health Levels'], v);
    refresh();
  };
  const setPoise = (v) => {
    state.currentPoise = Math.min(figured.Poise, v);
    refresh();
  };
  const setSanity = (v) => {
    state.currentSanity = Math.min(figured.Sanity, v);
    refresh();
  };
  const setKi = (v) => {
    state.currentKi = Math.max(0, Math.min(figured.Ki, v));
    refresh();
  };
  const setFate = (v) => {
    state.currentFateTokens = Math.max(0, v);
    refresh();
  };

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
      damageTracker(
        'Health Levels',
        state.currentHealth,
        figured['Health Levels'],
        'var(--ok)',
        (c) => healthStatus(c, healthSubStat),
        setHealth,
        interactive,
      ),
      damageTracker('Poise', state.currentPoise, figured.Poise, 'var(--gold)', poiseStatus, setPoise, interactive),
      damageTracker('Sanity', state.currentSanity, figured.Sanity, 'var(--air)', sanityStatus, setSanity, interactive),
      counterTracker('Ki', state.currentKi, figured.Ki, setKi, interactive),
      counterTracker('Fate Tokens', state.currentFateTokens, null, setFate, interactive),
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
      interactive
        ? el('button', {
            type: 'button',
            class: 'rest-btn',
            text: 'Short rest',
            onClick: () => {
              applyRest(state, false);
              refresh();
            },
          })
        : null,
      interactive
        ? el('button', {
            type: 'button',
            class: 'rest-btn',
            text: "Full night's rest",
            onClick: () => {
              applyRest(state, true);
              refresh();
            },
          })
        : null,
    ]),
  ];
}

export default {
  id: 'sheet',
  title: 'Character Sheet & Export',
  render(container, { state, data }) {
    initPlayState(state, data);
    const figured = computeFiguredCharacteristics(state);

    let activeTab = TABS[0].id;
    const tabContent = el('div', { class: 'tab-content' });
    const tabNav = el('div', { class: 'tab-nav' });
    const headerEl = el('div', {});
    // Built once, outside the header's own render cycle - a Combat Roller
    // roll needs to update the Ki/Fate Token trackers (via renderHeader),
    // but renderHeader() only ever tears down headerEl itself, so this
    // sibling element (and whatever the roll just displayed) survives that.
    const combatRollerEl = el('div', { class: 'sheet-combat-roller' });

    function renderHeader() {
      headerEl.innerHTML = '';
      headerEl.append(...buildHeader(state, data, figured, { interactive: true, refresh: renderHeader }));
    }

    // The damage roller's Ki Infusion checkboxes need to reflect the
    // character's *current* Ki, which can change from outside the Combat
    // Roller entirely (a Gift Check failure, most directly, from the Gifts
    // tab) - refreshKiDependents is handed to anything that spends Ki
    // elsewhere so it can pull the boost row's available count back in sync.
    let damageSectionRef = null;
    function renderCombatRoller() {
      combatRollerEl.innerHTML = '';
      damageSectionRef = buildDamageRollSection(state, data, renderHeader);
      combatRollerEl.append(
        el('h3', {}, 'Combat Roller'),
        buildAttackRollSection(state, data, renderHeader),
        damageSectionRef,
      );
    }
    function refreshKiDependents() {
      renderHeader();
      damageSectionRef?.refreshBoostRow();
    }

    function renderTabContent() {
      tabContent.innerHTML = '';
      const tab = TABS.find((t) => t.id === activeTab);
      const nodes = tab.interactive
        ? tab.build(state, data, renderTabContent, renderHeader, refreshKiDependents)
        : tab.build(state, data);
      tabContent.append(...nodes.filter((n) => n != null));
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
    renderHeader();
    renderCombatRoller();

    const sheet = el('div', { class: 'sheet', id: 'character-sheet' }, [headerEl, combatRollerEl, tabNav, tabContent]);

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
        text: 'Download JSON',
        onClick: () => downloadJson(state),
      }),
    ]);

    container.append(el('h2', {}, 'Character Sheet & Export'), sheet, notesField, exportRow);
  },
};
