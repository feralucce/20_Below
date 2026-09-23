import { el, renderMarkdown, renderMarkdownInline as inline } from '../ui.js';
import {
  boonNotes,
  giftNotes,
  flawNotes,
  applyVitalFloor,
  computeFiguredCharacteristics,
  skillTierName,
  initPlayState,
  healthStatus,
  poiseStatus,
  sanityStatus,
  applyRest,
  effectiveResourceLevel,
  elementCritSteps,
  elementAutoSuccesses,
  fateTokenCap,
} from '../state.js';
import { SIGNATURE_MOVE, signatureMoves } from '../state.js';
import buildAdvancementTab from './tab-advancement.js';
import buildItemPicker from './add-item.js';
import { buildPagedSheet, loadFieldMap } from '../sheet/paged-sheet.js';
import {
  buildAttackRollSection,
  buildDamageRollSection,
  buildSkillRollSection,
  buildGiftCheckSection,
  buildResourceCheckSection,
} from './roller-panel.js';

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
// past what's reasonable to draw as boxes, and Fate Tokens caps at Stamina x 3,
// which is low enough that boxes would look odd next to Health's row - so
// both get a plain stepping counter instead.
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


// The Vitals are rows an attack takes off you; Ki and Fate Tokens are pools
// you choose to spend. Five boxes in one flat row said they were all the
// same kind of thing, so each set gets its own caption.
function trackerGroup(label, items) {
  return el('div', { class: 'tracker-group' }, [
    el('span', { class: 'tracker-group-label' }, label),
    el('div', { class: 'tracker-group-items' }, items),
  ]);
}
function buildBoonEntries(state, data) {
  return state.boons.map((b) => {
    const boonData = data.boons.find((d) => d.name === b.name);
    const label = b.tier ? `${b.name} (${b.tier})` : `${b.name} (${b.points} pts)`;
    // What the player named goes before the rules text, not after it: on
    // a sheet, "Familiar - Bartholomew, a talking barometer" is the useful
    // half, and the effect is the reference underneath it.
    return el('li', {}, [
      el('strong', {}, label + ': '),
      boonNotes(b).filter(Boolean).length
        ? el('em', {}, boonNotes(b).filter(Boolean).join('; ') + ' - ')
        : null,
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
      // Signature Moves carry a build no other Gift does, and a character
      // can hold several - each with its own name, Level, source and wall.
      const moves = g.name === SIGNATURE_MOVE ? signatureMoves(g) : [];
      const sigLine = moves.length
        ? el('div', {}, moves.map((mv) => el('p', {}, [
            el('strong', {}, `${mv.name || 'Unnamed Move'} (Level ${mv.level}): `),
            `${mv.source || 'source not set'} vs ${mv.wall || 'wall not set'}`,
          ])))
        : null;
      const sigText = moves.length
        ? el('div', {}, moves.filter((mv) => mv.description)
            .map((mv) => el('p', { class: 'detail' }, mv.description)))
        : null;
      const named = giftNotes(g).filter(Boolean);
      return el('li', {}, [
        el('strong', {}, moves.length
          ? `${g.name} (${moves.length} Move${moves.length === 1 ? '' : 's'})`
          : `${g.name} (Level ${g.level})`),
        named.length ? el('em', {}, ' - ' + named.join('; ')) : null,
        sigLine,
        sigText,
        moves.length ? null : levelRows,
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
      const said = flawNotes(f).filter(Boolean);
      return el('li', {}, [
        el('strong', {}, `${f.name} (Level ${f.level}): `),
        said.length ? el('em', {}, said.join('; ') + ' - ') : null,
        effect,
      ]);
    });
}

const ATTR_COLORS = { Earth: 'var(--earth)', Air: 'var(--air)', Fire: 'var(--fire)', Water: 'var(--water)', Moira: 'var(--moira)' };

// The Element-over-cap payouts worth showing on the sheet. The Fate ceiling
// already shows up in the header's Fate Token tracker, so it is not repeated
// here; the critical band and the per-Scene auto-successes have nowhere else
// to appear. Returns null below the cap, which `el` skips.
function overCapNote(state, data, attrName) {
  const crit = elementCritSteps(state, data, attrName);
  const auto = elementAutoSuccesses(state, data, attrName);
  if (!crit && !auto) return null;
  const bits = [];
  if (auto) bits.push(`${auto} auto-success${auto === 1 ? '' : 'es'} per Scene at Difficulty 6+`);
  if (crit) bits.push(`critical on 2-${2 + crit}`);
  return el('div', { class: 'detail', style: 'margin-top:0.4rem;' }, bits.join(' · '));
}

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
          // Past its roll cap an Element pays out on its own steps, and the
          // auto-successes in particular are a per-Scene resource the player
          // has no other way to see. Only rendered when there is one.
          overCapNote(state, data, a.name),
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
      { class: 'gear-list' },
      state.gearPurchases.map((p) => el('li', {}, [
        el('strong', {}, p.name),
        ` - ${p.category}, Wealth ${p.wealth}`,
        p.free ? ' (free)' : '',
        p.loss ? ` - cost ${p.loss} creation-Wealth` : '',
      ])),
    ),
  ];
}

function buildFlavorItemEntries(state) {
  if (!state.flavorItems?.length) return [];
  return [
    el('h3', {}, 'Odds and Ends'),
    el('ul', { class: 'gear-list' }, state.flavorItems.map((t) => el('li', {}, t))),
  ];
}

function buildEverymanGearEntry(state) {
  // One package per Wealth Level, so this is a list. Flattening them into
  // a single line printed "(Level undefined)", since the merged object had
  // no Level of its own - each package carries its own and always did.
  const pkgs = Object.values(state.everymanGearPackages || {})
    .sort((a, b) => a.level - b.level);
  if (!pkgs.length) return [];
  return [
    el('h3', {}, pkgs.length > 1 ? 'Starting Packages' : 'Starting Package'),
    el('ul', { class: 'gear-list' }, pkgs.map((p) => el('li', {}, [
      el('strong', {}, `Level ${p.level} - ${p.name}`),
      `: ${p.contents}`,
    ]))),
  ];
}

function buildEquipmentTab(state, data) {
  return [
    ...buildEverymanGearEntry(state),
    el('h3', {}, 'Gear'),
    ...buildGearPurchaseEntries(state),
    ...buildFlavorItemEntries(state),
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
    el('h3', {}, 'Backstory'),
    textField('Backstory', state.backstory, (v) => { state.backstory = v; },
      { interactive: true, multiline: true }),
    el('h3', {}, 'Notes'),
    textField('Notes', state.finishingNotes, (v) => { state.finishingNotes = v; },
      { interactive: true, multiline: true }),
  ].flat();
}

// The trackers are live, so this tab redraws itself rather than a header
// that no longer exists.
function buildVitalsTab(state, data, refresh) {
  return [
    // Concept, the descriptive fields, the trackers, then the derived
    // numbers - buildVitals ends on the mini row of Defenses.
    ...buildVitals(state, data, computeFiguredCharacteristics(state), {
      interactive: true,
      refresh,
    }),
    // The Attributes those Defenses are derived from, so the number and
    // what produces it are on one page.
    el('h3', {}, 'Attributes'),
    ...buildAttributesTab(state, data),
    // Scars are damage that stuck, which is what this tab is about.
    buildScarsTab(state, data, refresh),
  ].flat();
}

const TABS = [
  { id: 'vitals', label: 'Vitals', build: buildVitalsTab, interactive: true },
  { id: 'skills', label: 'Skills', build: buildSkillsTab, interactive: true },
  { id: 'gifts', label: 'Gifts', build: buildGiftsTab, interactive: true },
  { id: 'traits', label: 'Boons/Flaws', build: buildBoonsFlawsTab },
  { id: 'resources', label: 'Resources', build: buildResourcesTab },
  { id: 'gear', label: 'Equipment', build: buildEquipmentTab },
  { id: 'biography', label: 'Biography', build: buildBiographyTab },
  { id: 'advancement', label: 'XP', build: buildAdvancementTab, interactive: true },
];

// interactive=false renders a plain read-only snapshot (used by the hidden
// print copy, which only ever needs to be captured, never clicked).
// The one thing that never moves. Everything else about a character is
// behind a tab; their name is not.
// Saving the draft after a keystroke. main.js hands every step a persist
// callback; the sheet never took it, so the Finishing Touches textarea has
// always relied on some later pool re-render happening to flush it. The
// new Age/Height/Appearance/Backstory fields would have inherited that.
let persistSheet = () => {};

// A labelled free-text field on the sheet. Read-only when the sheet is
// being exported rather than played.
function textField(label, value, onChange, { interactive = false, multiline = false } = {}) {
  if (!interactive) {
    return el('div', { class: 'field-box' }, [
      el('span', { class: 'field-label' }, label),
      el('div', { class: 'field-value' }, value || '\u2014'),
    ]);
  }
  const input = el(multiline ? 'textarea' : 'input', {
    class: 'sheet-text',
    rows: multiline ? 4 : undefined,
    type: multiline ? undefined : 'text',
    value: multiline ? undefined : (value ?? ''),
    onInput: (e) => {
      onChange(e.target.value);
      persistSheet();
    },
  });
  if (multiline) input.value = value ?? '';
  return el('div', { class: 'field-box' }, [
    el('span', { class: 'field-label' }, label),
    input,
  ]);
}

function buildNameBar(state) {
  return el('div', { class: 'sheet-topbar' }, [
    el('div', { class: 'sheet-logo' }, '20'),
    el('div', { class: 'field-box' }, [
      el('span', { class: 'field-label' }, 'Name'),
      el('div', { class: 'field-value' }, state.name || 'Unnamed Character'),
    ]),
  ]);
}

// Everything the old header held except the name: the fields, the
// trackers and the derived numbers. It is a tab now.
function buildVitals(state, data, figured, { interactive = false, refresh = () => {} } = {}) {
  const natureLabel = state.nature.picked ?? state.nature.custom?.label ?? '';
  const healthLevels = figured['Health Levels'];

  const setHealth = (v) => {
    state.currentHealth = Math.min(figured['Health Levels'], v);
    refresh();
  };
  const setPoise = (v) => {
    state.currentPoise = Math.min(figured.Poise, v);
    applyVitalFloor(state, 'Poise', figured.Poise, figured);
    refresh();
  };
  const setSanity = (v) => {
    state.currentSanity = Math.min(figured.Sanity, v);
    applyVitalFloor(state, 'Sanity', figured.Sanity, figured);
    refresh();
  };
  const setKi = (v) => {
    state.currentKi = Math.max(0, Math.min(figured.Ki, v));
    refresh();
  };
  const setFate = (v) => {
    state.currentFateTokens = Math.max(0, Math.min(fateTokenCap(state, data), v));
    refresh();
  };

  return [
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

    el('div', { class: 'sheet-fields-row' }, [
      textField('Age', state.age, (v) => { state.age = v; }, { interactive }),
      textField('Height', state.height, (v) => { state.height = v; }, { interactive }),
    ]),

    el('div', { class: 'sheet-fields-row' }, [
      textField('Appearance', state.appearance, (v) => { state.appearance = v; },
        { interactive, multiline: true }),
    ]),

    el('div', { class: 'sheet-trackers-row' }, [
      trackerGroup('Vitals', [
        damageTracker(
          'Health Levels',
          state.currentHealth,
          figured['Health Levels'],
          'var(--ok)',
          (c) => healthStatus(c, healthLevels),
          setHealth,
          interactive,
        ),
        damageTracker('Poise', state.currentPoise, figured.Poise, 'var(--gold)', poiseStatus, setPoise, interactive),
        damageTracker('Sanity', state.currentSanity, figured.Sanity, 'var(--air)', sanityStatus, setSanity, interactive),
      ]),
      trackerGroup('Pools', [
        counterTracker('Ki', state.currentKi, figured.Ki, setKi, interactive),
        counterTracker('Fate Tokens', state.currentFateTokens, fateTokenCap(state, data), setFate, interactive),
      ]),
    ]),

    el('div', { class: 'sheet-mini-row' }, [
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Defense'),
        el('div', { class: 'mini-value' }, String(figured.Defense)),
      ]),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Social Def'),
        el('div', { class: 'mini-value' }, String(figured['Social Defense'])),
      ]),
      el('div', { class: 'field-box' }, [
        el('span', { class: 'field-label' }, 'Mental Def'),
        el('div', { class: 'mini-value' }, String(figured['Mental Defense'])),
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
  title: 'Character Sheet',

  // The sheet is the five printed pages now, filled in live from the
  // character. Rolls fire from the pages themselves - a Skill row, a Gift
  // card, a Resource row, a weapon - each opening the roller it needs over
  // the sheet rather than sitting in a panel the player has to find.
  //
  // Advancement stays below the pages: spending XP is building a
  // character, not playing one, and there is nowhere on a printed page to
  // put it.
  async render(container, { state, data, persist }) {
    persistSheet = persist ?? (() => {});
    initPlayState(state, data);
    // A page wants the window, not the reading column the forms use.
    container.classList.add('step-panel-sheet');

    const pagesHost = el('div', {});
    const advancementHost = el('div', { class: 'sheet-advancement' });
    const tabBar = el('div', { class: 'sheet-tabs' });
    // Which tab is open has to outlive a redraw: every - and + rebuilds
    // the sheet, and landing back on page 1 each time would be unusable.
    let activeTab = 0;
    let modal = null;

    function closeRoller() {
      modal?.remove();
      modal = null;
      draw();
    }

    // A weapon's Damage is written as a bare number for a catalogue item
    // and as "4 vs Soak" for a Gift that attacks, so the roller takes the
    // first number it finds and leaves anything it cannot read alone.
    function damageDice(extra) {
      const found = String(extra?.damage ?? '').match(/\d+/);
      return found ? Number(found[0]) : null;
    }

    function rollerPanel(kind, label, extra) {
      switch (kind) {
        case 'skill':
          return [el('h3', {}, `Roll ${label}`),
            buildSkillRollSection(state, data, draw, label)];
        case 'gift':
          return [el('h3', {}, `${label} - Gift Check`),
            el('p', { class: 'attr-caption', html: inline(data.giftCheckText) }),
            buildGiftCheckSection(state, data, draw)];
        case 'resource':
          return [el('h3', {}, `${label} - Resource Check`),
            buildResourceCheckSection(state, data, label)];
        case 'weapon': {
          const damage = buildDamageRollSection(state, data, draw, 'Damage Roll',
            damageDice(extra));
          return [el('h3', {}, `Attack with ${label}`),
            buildAttackRollSection(state, data, draw, (crit) => damage?.armCritical?.(crit)),
            damage];
        }
        case 'attack': {
          // Straight off the Element panel: no weapon named, because the
          // Element is what the to-hit rolls on either way.
          const damage = buildDamageRollSection(state, data, draw);
          return [el('h3', {}, `Attack on ${label}`),
            buildAttackRollSection(state, data, draw,
              (crit) => damage?.armCritical?.(crit), label),
            damage];
        }
        default:
          return [];
      }
    }

    function openRoller(kind, label, extra) {
      openModal(rollerPanel(kind, label, extra));
    }

    // Kit acquired after creation. The same overlay the roller uses -
    // there is no reason for a second kind of window on one sheet.
    function openPicker(kind) {
      openModal(buildItemPicker(state, data, kind, (name) => {
        // The draft is written on a redraw, and a redraw is not a save -
        // without this the item was on the sheet and gone on reload.
        persistSheet();
        closeRoller();
        say(`${name} added.`);
      }));
    }

    function openModal(contents) {
      modal?.remove();
      const panel = el('div', { class: 'sheet-roller-panel' }, [
        ...contents,
        el('button', { type: 'button', text: 'Close', onClick: closeRoller }),
      ]);
      modal = el('div', {
        class: 'sheet-roller',
        onClick: (e) => { if (e.target === modal) closeRoller(); },
      }, [panel]);
      document.body.appendChild(modal);
    }

    const added = el('span', { class: 'sheet-added-note' });
    let addedTimer = null;
    function say(text) {
      added.textContent = text;
      clearTimeout(addedTimer);
      addedTimer = setTimeout(() => { added.textContent = ''; }, 4000);
    }

    function draw() {
      pagesHost.innerHTML = '';
      const stack = buildPagedSheet(state, data, {
        refresh: draw,
        persist: persistSheet,
        onRoll: openRoller,
        onAddItem: openPicker,
      });
      pagesHost.appendChild(stack);

      advancementHost.innerHTML = '';
      advancementHost.append(
        el('h3', {}, 'Advancement'),
        ...buildAdvancementTab(state, data, draw, draw).filter((n) => n != null),
      );

      // Five pages, then the one thing that is building a character
      // rather than playing one.
      const pages = [...stack.querySelectorAll('.sheet-page')];
      const panes = [...pages, advancementHost];
      const labels = [...pages.map((p, i) => `Page ${i + 1}`), 'Advancement'];
      if (activeTab >= panes.length) activeTab = 0;

      function show(i) {
        activeTab = i;
        panes.forEach((pane, n) => { pane.hidden = n !== i; });
        [...tabBar.children].forEach((b, n) => {
          b.className = n === i ? 'tab-btn active' : 'tab-btn';
        });
        // The page just revealed had no width while it was hidden.
        stack.syncUnits?.();
      }

      tabBar.innerHTML = '';
      labels.forEach((label, i) => {
        tabBar.appendChild(el('button', {
          type: 'button', text: label, class: 'tab-btn', onClick: () => show(i),
        }));
      });
      show(activeTab);
    }

    await loadFieldMap();
    draw();

    container.append(
      el('h2', {}, 'Character Sheet'),
      el('p', { class: 'attr-caption' },
        'Click a Skill, a Gift, a Resource or a weapon to roll it. The − and + '
        + 'beside each Vital and pool move it by one.'),
      tabBar,
      pagesHost,
      advancementHost,
      el('div', { class: 'sheet-actions' }, [added]),
    );

  },
};
