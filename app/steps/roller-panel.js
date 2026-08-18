import { el } from '../ui.js';
import { performCoreRoll, SKILL_TIERS } from '../roller/core.js';
import { performGiftCheck } from '../roller/giftCheck.js';
import { performResourceCheck } from '../roller/resourceCheck.js';
import { rollDamagePool } from '../roller/damage.js';
import { skillTierName, effectiveResourceLevel, applyResourceCheckFailure, clearResourcePenalty } from '../state.js';

// Physical/Social/Mental each pair a wall stat (what the target's dice are
// checked against), the attacker's own matching Ki Infusion boost sub-stat,
// and which of the character's own trackers absorbs a connecting die - see
// rules.md#the-passive-wall-triad---soak-presence-psyche and #ki-infusion.
const ATTACK_TYPES = {
  Physical: { wallStat: 'Soak', boostStat: 'Ferocity', track: 'health' },
  Social: { wallStat: 'Presence', boostStat: 'Presence', track: 'poise' },
  Mental: { wallStat: 'Psyche', boostStat: 'Psyche', track: 'sanity' },
};

const UNTRAINED_VALUE = '__untrained__';

function toggleBox(label, checked, onClick) {
  return el('div', { class: 'toggle-box', onClick }, [
    el('div', { class: checked ? 'pip' : 'pip pip-empty', style: '--pip-color:var(--accent)' }),
    el('span', {}, label),
  ]);
}

function outcomeLabel(outcome) {
  return {
    'critical-success': 'Critical Success',
    success: 'Success',
    failure: 'Failure',
    'critical-failure': 'Critical Failure',
  }[outcome];
}

function outcomeClass(outcome) {
  return outcome === 'critical-success' || outcome === 'success' ? 'status-ok' : 'status-bad';
}

function diceSummary(rollResult) {
  const { dice, kept } = rollResult;
  if (dice.length === kept.length) {
    return `Rolled ${dice.join(', ')} → ${kept[0] + kept[1]}`;
  }
  return `Rolled ${dice.join(', ')} → kept ${kept.join(', ')} = ${kept[0] + kept[1]}`;
}

export default function buildRollerPanel(state, data, { refreshHeader = () => {} } = {}) {
  const wrap = el('div', { class: 'roller-panel' });
  const resultEl = el('div', { class: 'roller-result' });

  let selectedSkill = UNTRAINED_VALUE;
  let selectedAttribute = data.attributes[0].name;
  let selectedDifficulty = 5;
  let advantageOn = false;
  let disadvantageOn = false;

  const skillSelect = el(
    'select',
    {
      onChange: (e) => {
        selectedSkill = e.target.value;
        renderAttributeVisibility();
        renderTierGrantNote();
      },
    },
    [
      el('option', { value: UNTRAINED_VALUE }, 'No Skill (Untrained)'),
      ...data.skillCatalog.map((s) =>
        el('option', { value: s.name }, `${s.name} - ${skillTierName(data, state.skills[s.name])}`),
      ),
    ],
  );

  const attributeGroup = el('div', { class: 'attribute-radio-group' });
  function renderAttributeGroup() {
    attributeGroup.innerHTML = '';
    data.attributes.forEach((a) => {
      const id = `roller-attr-${a.name}`;
      attributeGroup.append(
        el('label', { class: 'attribute-radio', for: id }, [
          el('input', {
            type: 'radio',
            id,
            name: 'roller-attribute',
            value: a.name,
            checked: selectedAttribute === a.name ? '' : undefined,
            onChange: () => {
              selectedAttribute = a.name;
            },
          }),
          ` ${a.name} (${state.attributes[a.name]})`,
        ]),
      );
    });
  }
  renderAttributeGroup();

  function currentTier() {
    if (selectedSkill === UNTRAINED_VALUE) return 0;
    return state.skills[selectedSkill];
  }

  function renderAttributeVisibility() {
    attributeGroup.style.display = currentTier() === 0 ? 'none' : 'flex';
  }
  renderAttributeVisibility();

  // The selected Skill's own Tier can already grant Advantage or
  // Disadvantage (Adept/Expert/Master, Novice respectively) before either
  // toggle box is touched - the toggles are an *additional* source that
  // stacks with the Tier's own grant via the binary cancellation rule
  // (rules.md#advantage--disadvantage), not a direct override. This note
  // makes that visible so a toggle that seems to "do nothing" (because it
  // canceled the Tier's own grant back to Normal) isn't mistaken for a bug.
  const tierGrantNote = el('p', { class: 'roller-tier-note' });
  function renderTierGrantNote() {
    const grant = SKILL_TIERS[currentTier()].grantsAdvantage;
    tierGrantNote.textContent = grant
      ? `${SKILL_TIERS[currentTier()].name} already grants ${grant === 'advantage' ? 'Advantage' : 'Disadvantage'} from its Tier - checking the opposite box below cancels it back to Normal, it doesn't reverse it.`
      : '';
  }
  renderTierGrantNote();

  const difficultySelect = el(
    'select',
    {
      onChange: (e) => {
        selectedDifficulty = Number(e.target.value);
      },
    },
    data.difficultyChart.map((d) =>
      el(
        'option',
        { value: d.difficulty, selected: d.difficulty === selectedDifficulty ? '' : undefined },
        `${d.difficulty} - ${d.label}`,
      ),
    ),
  );

  // Advantage/Disadvantage are mutually exclusive click-toggle boxes (same
  // interaction as the sheet header's Health/Poise/Sanity pips) - clicking
  // one on forces the other off. Rebuilt whole on every toggle rather than
  // diffed in place, simplest way to keep each box's pip class in sync.
  const togglesRow = el('div', { class: 'roller-toggles' });
  function renderToggles() {
    togglesRow.innerHTML = '';
    togglesRow.append(
      toggleBox('Advantage', advantageOn, () => {
        advantageOn = !advantageOn;
        if (advantageOn) disadvantageOn = false;
        renderToggles();
      }),
      toggleBox('Disadvantage', disadvantageOn, () => {
        disadvantageOn = !disadvantageOn;
        if (disadvantageOn) advantageOn = false;
        renderToggles();
      }),
    );
  }
  renderToggles();

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll',
    onClick: () => {
      const tier = currentTier();
      const attributeValue = tier === 0 ? 0 : state.attributes[selectedAttribute];
      const result = performCoreRoll({
        attribute: attributeValue,
        difficulty: selectedDifficulty,
        skillTier: tier,
        extraAdvantage: advantageOn ? 1 : 0,
        extraDisadvantage: disadvantageOn ? 1 : 0,
        klotho: state.subStats.Klotho,
      });

      if (result.luckyNumber) {
        state.currentFateTokens += 1;
        refreshHeader();
      }

      renderResult(result);
    },
  });

  function renderResult(result) {
    resultEl.innerHTML = '';
    const skillLabel = selectedSkill === UNTRAINED_VALUE ? 'Untrained' : `${selectedSkill} (${result.tierName})`;
    resultEl.append(
      ...[
        el('p', {}, [
          el('strong', {}, `${skillLabel} vs target ${result.target}`),
          result.mode !== 'normal' ? ` (${result.mode === 'advantage' ? 'Advantage' : 'Disadvantage'})` : '',
        ]),
        el('p', {}, diceSummary(result.roll)),
        el('p', { class: outcomeClass(result.outcome) }, [el('strong', {}, outcomeLabel(result.outcome))]),
        result.reroll ? el('p', {}, `Master's reroll: ${diceSummary(result.reroll)}`) : null,
        result.luckyNumber ? el('p', { class: 'status-ok' }, 'Lucky Number! +1 Fate Token.') : null,
      ].filter((n) => n != null),
    );
  }

  const damageSection = buildDamageRollSection(state, data, refreshHeader);
  const attackRollSection = buildAttackRollSection(state, data, refreshHeader, refreshHeader);
  // The damage rollers' Ki Infusion checkboxes (the standalone one and the
  // one nested inside Attack Roll) need to reflect the character's
  // *current* Ki, which can change from outside either section entirely
  // (a Gift Check failure, most directly) - each already refreshes its own
  // boost row after spending Ki itself, so the only other spot that needs
  // to reach in here is Gift Check, wired below.
  function refreshKiDependents() {
    refreshHeader();
    damageSection.refreshBoostRow();
    attackRollSection.refreshBoostRow();
  }

  wrap.append(
    el('h4', {}, 'Core Roll'),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Skill'), skillSelect]),
    attributeGroup,
    el('div', { class: 'roller-row' }, [el('label', {}, 'Difficulty'), difficultySelect]),
    tierGrantNote,
    togglesRow,
    rollBtn,
    resultEl,
    attackRollSection,
    buildGiftCheckSection(state, data, refreshKiDependents),
    damageSection,
    buildResourceCheckSection(state, data),
  );

  return wrap;
}

// Pushing a Resource (resources.md#pushing-a-resource): 2d10 against
// Resource Level + Difficulty, ordinary critical success/failure rule, no
// Skill involved. A failed check never denies the ask - it only drops the
// Resource's effective Level (state.resourcePenalties) until manually
// cleared, since the app has no in-game calendar to auto-expire "a Month"
// against.
function buildResourceCheckSection(state, data) {
  const section = el('div', { class: 'roller-gift-check' });

  const ownedResources = data.resources.filter((r) => state.resources[r.name] > 0);
  let selectedResource = ownedResources[0]?.name ?? null;
  let selectedDifficulty = 5;

  const resourceSelect = el(
    'select',
    {
      onChange: (e) => {
        selectedResource = e.target.value;
        renderSummary();
      },
    },
    ownedResources.map((r) =>
      el('option', { value: r.name }, `${r.name} (Level ${state.resources[r.name]})`),
    ),
  );

  const difficultySelect = el(
    'select',
    {
      onChange: (e) => {
        selectedDifficulty = Number(e.target.value);
      },
    },
    data.difficultyChart.map((d) =>
      el(
        'option',
        { value: d.difficulty, selected: d.difficulty === selectedDifficulty ? '' : undefined },
        `${d.difficulty} - ${d.label}`,
      ),
    ),
  );

  const summaryEl = el('p', {});
  const clearBtn = el('button', {
    type: 'button',
    text: 'Clear penalty (a Month has passed)',
    onClick: () => {
      clearResourcePenalty(state, selectedResource);
      renderSummary();
    },
  });

  function renderSummary() {
    if (!selectedResource) {
      summaryEl.textContent = 'No Resources owned yet.';
      clearBtn.disabled = true;
      return;
    }
    const effective = effectiveResourceLevel(state, selectedResource);
    const penalty = state.resourcePenalties[selectedResource] ?? 0;
    summaryEl.textContent = penalty
      ? `Effective Level ${effective} (reduced from ${state.resources[selectedResource]} by a prior failure).`
      : `Current Level ${effective}.`;
    clearBtn.disabled = !penalty;
  }
  renderSummary();

  const resultEl = el('div', { class: 'roller-result' });

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll Resource Check',
    disabled: selectedResource ? undefined : '',
    onClick: () => {
      const resourceLevel = effectiveResourceLevel(state, selectedResource);
      const result = performResourceCheck({ resourceLevel, difficulty: selectedDifficulty });
      if (result.resourceReduced) {
        applyResourceCheckFailure(state, selectedResource);
      }
      renderSummary();
      resultEl.innerHTML = '';
      resultEl.append(
        el('p', {}, `Rolled ${result.roll.dice.join(', ')} → ${result.roll.sum} vs target ${result.target}`),
        el('p', { class: outcomeClass(result.outcome) }, [el('strong', {}, outcomeLabel(result.outcome))]),
        el('p', {}, result.resourceReduced
          ? `${selectedResource} drops to Level ${effectiveResourceLevel(state, selectedResource)} until a Month passes.`
          : `${selectedResource} is unaffected - you got what you were after.`),
      );
    },
  });

  section.append(
    el('h4', {}, 'Resource Check'),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Resource'), resourceSelect]),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Difficulty'), difficultySelect]),
    summaryEl,
    el('div', { style: 'display:flex;gap:0.5rem;' }, [rollBtn, clearBtn]),
    resultEl,
  );
  return section;
}

// Attack Roll - the full two-step sequence from
// rules.md#the-passive-wall-triad---soak-presence-psyche: a to-hit roll
// (Attribute + Skill vs. the target's Defense, used directly as Difficulty
// since both run 0-10) using the same core roll engine as Core Roll above,
// and only on a success (plain or critical) does the damage dice pool
// reveal itself - a critical failure or plain failure never reaches step
// two. Reuses buildDamageRollSection wholesale for that second step rather
// than duplicating its dice-pool/Ki-Infusion logic.
function buildAttackRollSection(state, data, refreshHeader, refreshDependents) {
  const section = el('div', { class: 'roller-gift-check' });

  let selectedSkill = UNTRAINED_VALUE;
  let selectedAttribute = data.attributes[0].name;
  let selectedDefense = 5;
  let advantageOn = false;
  let disadvantageOn = false;

  const skillSelect = el(
    'select',
    {
      onChange: (e) => {
        selectedSkill = e.target.value;
        renderAttributeVisibility();
        renderTierGrantNote();
      },
    },
    [
      el('option', { value: UNTRAINED_VALUE }, 'No Skill (Untrained)'),
      ...data.skillCatalog.map((s) =>
        el('option', { value: s.name }, `${s.name} - ${skillTierName(data, state.skills[s.name])}`),
      ),
    ],
  );

  const attributeGroup = el('div', { class: 'attribute-radio-group' });
  function renderAttributeGroup() {
    attributeGroup.innerHTML = '';
    data.attributes.forEach((a) => {
      const id = `atk-attr-${a.name}`;
      attributeGroup.append(
        el('label', { class: 'attribute-radio', for: id }, [
          el('input', {
            type: 'radio',
            id,
            name: 'atk-attribute',
            value: a.name,
            checked: selectedAttribute === a.name ? '' : undefined,
            onChange: () => {
              selectedAttribute = a.name;
            },
          }),
          ` ${a.name} (${state.attributes[a.name]})`,
        ]),
      );
    });
  }
  renderAttributeGroup();

  function currentTier() {
    if (selectedSkill === UNTRAINED_VALUE) return 0;
    return state.skills[selectedSkill];
  }

  function renderAttributeVisibility() {
    attributeGroup.style.display = currentTier() === 0 ? 'none' : 'flex';
  }
  renderAttributeVisibility();

  const tierGrantNote = el('p', { class: 'roller-tier-note' });
  function renderTierGrantNote() {
    const grant = SKILL_TIERS[currentTier()].grantsAdvantage;
    tierGrantNote.textContent = grant
      ? `${SKILL_TIERS[currentTier()].name} already grants ${grant === 'advantage' ? 'Advantage' : 'Disadvantage'} from its Tier - checking the opposite box below cancels it back to Normal, it doesn't reverse it.`
      : '';
  }
  renderTierGrantNote();

  // Defense reads directly off the Difficulty Chart (rules.md: "Defense
  // becomes the attacker's Difficulty") - same select and same data source
  // as Core Roll's Difficulty dropdown, just relabeled for what it means
  // here: the target's Defense score, not a GM-picked task difficulty.
  const defenseSelect = el(
    'select',
    {
      onChange: (e) => {
        selectedDefense = Number(e.target.value);
      },
    },
    data.difficultyChart.map((d) =>
      el(
        'option',
        { value: d.difficulty, selected: d.difficulty === selectedDefense ? '' : undefined },
        `${d.difficulty} - ${d.label}`,
      ),
    ),
  );

  const togglesRow = el('div', { class: 'roller-toggles' });
  function renderToggles() {
    togglesRow.innerHTML = '';
    togglesRow.append(
      toggleBox('Advantage', advantageOn, () => {
        advantageOn = !advantageOn;
        if (advantageOn) disadvantageOn = false;
        renderToggles();
      }),
      toggleBox('Disadvantage', disadvantageOn, () => {
        disadvantageOn = !disadvantageOn;
        if (disadvantageOn) advantageOn = false;
        renderToggles();
      }),
    );
  }
  renderToggles();

  const toHitResultEl = el('div', { class: 'roller-result' });
  const damageSubSection = buildDamageRollSection(state, data, refreshDependents, 'Damage (attack connected)');
  damageSubSection.style.display = 'none';

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll to Hit',
    onClick: () => {
      const tier = currentTier();
      const attributeValue = tier === 0 ? 0 : state.attributes[selectedAttribute];
      const result = performCoreRoll({
        attribute: attributeValue,
        difficulty: selectedDefense,
        skillTier: tier,
        extraAdvantage: advantageOn ? 1 : 0,
        extraDisadvantage: disadvantageOn ? 1 : 0,
        klotho: state.subStats.Klotho,
      });

      if (result.luckyNumber) {
        state.currentFateTokens += 1;
        refreshHeader();
      }

      const hit = result.outcome === 'success' || result.outcome === 'critical-success';
      damageSubSection.style.display = hit ? '' : 'none';

      toHitResultEl.innerHTML = '';
      const skillLabel = selectedSkill === UNTRAINED_VALUE ? 'Untrained' : `${selectedSkill} (${result.tierName})`;
      toHitResultEl.append(
        ...[
          el('p', {}, [
            el('strong', {}, `${skillLabel} vs Defense ${result.target}`),
            result.mode !== 'normal' ? ` (${result.mode === 'advantage' ? 'Advantage' : 'Disadvantage'})` : '',
          ]),
          el('p', {}, diceSummary(result.roll)),
          el('p', { class: outcomeClass(result.outcome) }, [
            el('strong', {}, hit ? `${outcomeLabel(result.outcome)} - the attack connects` : `${outcomeLabel(result.outcome)} - the attack misses`),
          ]),
          result.reroll ? el('p', {}, `Master's reroll: ${diceSummary(result.reroll)}`) : null,
          result.luckyNumber ? el('p', { class: 'status-ok' }, 'Lucky Number! +1 Fate Token.') : null,
        ].filter((n) => n != null),
      );
    },
  });

  section.append(
    el('h4', {}, 'Attack Roll'),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Skill'), skillSelect]),
    attributeGroup,
    el('div', { class: 'roller-row' }, [el('label', {}, "Target's Defense"), defenseSelect]),
    tierGrantNote,
    togglesRow,
    rollBtn,
    toHitResultEl,
    damageSubSection,
  );
  section.refreshBoostRow = damageSubSection.refreshBoostRow;
  return section;
}

// Damage dice pool - weapon/Gift attacks, per-die resolution against a
// wall stat with an optional pre-committed Ki Infusion boost (see
// rules.md#the-passive-wall-triad---soak-presence-psyche and #ki-infusion).
// Dice count and the target's wall value are typed in directly rather than
// looked up from a weapon/Gift catalog - see the discussion in
// character-creator.notes.md for why that's out of scope for this pass.
function buildDamageRollSection(state, data, refreshHeader, heading = 'Damage Roll') {
  const section = el('div', { class: 'roller-gift-check' });

  let attackType = 'Physical';
  let diceCount = 3;
  let wall = 5;
  let boostedDice = new Set();

  const typeSelect = el(
    'select',
    {
      onChange: (e) => {
        attackType = e.target.value;
        boostedDice = new Set();
        renderBoostRow();
        renderSummary();
      },
    },
    Object.keys(ATTACK_TYPES).map((t) => el('option', { value: t }, t)),
  );

  const diceInput = el('input', {
    type: 'number',
    min: '1',
    max: '15',
    value: diceCount,
    onInput: (e) => {
      diceCount = Math.max(1, Math.min(15, Number(e.target.value) || 1));
      e.target.value = diceCount;
      boostedDice = new Set([...boostedDice].filter((i) => i < diceCount));
      renderBoostRow();
    },
  });

  const wallInput = el('input', {
    type: 'number',
    min: '0',
    max: '10',
    value: wall,
    onInput: (e) => {
      wall = Math.max(0, Math.min(10, Number(e.target.value) || 0));
      e.target.value = wall;
    },
  });

  // Each boosted die costs 1 Ki - can't check more boxes than the
  // character currently has, and at 0 Ki none are checkable at all.
  const boostRow = el('div', { class: 'roller-boost-row' });
  function renderBoostRow() {
    const info = ATTACK_TYPES[attackType];
    boostRow.innerHTML = '';
    boostRow.append(
      el(
        'span',
        { class: 'boost-label' },
        `Ki Infusion (+${state.subStats[info.boostStat]} ${info.boostStat} per boosted die, 1 Ki each - ${state.currentKi} Ki available):`,
      ),
    );
    for (let i = 0; i < diceCount; i++) {
      const checked = boostedDice.has(i);
      const atCap = !checked && boostedDice.size >= state.currentKi;
      boostRow.append(
        el('label', { class: atCap ? 'boost-die boost-die-disabled' : 'boost-die' }, [
          el('input', {
            type: 'checkbox',
            checked: checked ? '' : undefined,
            disabled: atCap ? '' : undefined,
            onChange: (e) => {
              if (e.target.checked) boostedDice.add(i);
              else boostedDice.delete(i);
              renderBoostRow();
            },
          }),
          ` ${i + 1}`,
        ]),
      );
    }
  }
  renderBoostRow();

  const summaryEl = el('p', {});
  function renderSummary() {
    const info = ATTACK_TYPES[attackType];
    summaryEl.textContent = `${attackType}: dice vs target's ${info.wallStat}, connecting dice cost the target a ${info.track === 'health' ? 'Health Level' : info.track === 'poise' ? 'Poise' : 'Sanity Level'}.`;
  }
  renderSummary();

  const resultEl = el('div', { class: 'roller-result' });

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll Damage',
    onClick: () => {
      // This is damage the character is dealing to a target (an NPC or
      // another PC this app doesn't track), not damage to the character's
      // own sheet - only the Ki Infusion spend, which is the attacking
      // character's own resource, touches this character's state. The
      // crossing-zero throttle isn't applied here either: it depends on
      // the target's own current Health/Poise/Sanity, which this app has
      // no visibility into for an NPC - the connect count itself is the
      // damage dealt, for whoever's tracking the target's sheet to apply.
      const info = ATTACK_TYPES[attackType];
      const boostAmount = state.subStats[info.boostStat];
      const kiSpent = boostedDice.size;
      const result = rollDamagePool({ diceCount, wall, boostedDice: [...boostedDice], boostAmount });
      const trackUnit = info.track === 'poise' ? 'Poise' : 'Levels';

      state.currentKi = Math.max(0, state.currentKi - kiSpent);
      refreshHeader();
      boostedDice = new Set();
      renderBoostRow();

      resultEl.innerHTML = '';
      resultEl.append(
        ...[
          el(
            'p',
            {},
            `Rolled: ${result.dice.map((d) => (d.boosted ? `${d.raw}+${boostAmount}=${d.result}` : `${d.result}`)).join(', ')} vs wall ${wall}`,
          ),
          el('p', {}, [el('strong', {}, `${result.connectCount} of ${diceCount} connect`)]),
          el('p', { class: 'status-bad' }, [el('strong', {}, `Damage dealt: ${result.connectCount} ${trackUnit}`)]),
          kiSpent > 0 ? el('p', {}, `${kiSpent} Ki spent on boosted dice.`) : null,
        ].filter((n) => n != null),
      );
    },
  });

  section.append(
    el('h4', {}, heading),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Attack Type'), typeSelect]),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Dice'), diceInput]),
    el('div', { class: 'roller-row' }, [el('label', {}, "Target's Wall"), wallInput]),
    boostRow,
    summaryEl,
    rollBtn,
    resultEl,
  );
  section.refreshBoostRow = renderBoostRow;
  return section;
}

// Gift Check (rules.md#resolution, gifts.md#resolution): 2d10 roll-under
// against current Ki + Stamina. Success is free; failure costs 1 Ki,
// deducted here immediately since there's no separate confirmation step
// for a cost this small and automatic.
function buildGiftCheckSection(state, data, refreshKiDependents) {
  const section = el('div', { class: 'roller-gift-check' });
  const summary = el('p', {});
  const resultEl = el('div', { class: 'roller-result' });

  function updateSummary() {
    const target = state.currentKi + state.subStats.Stamina;
    summary.textContent = `Current Ki (${state.currentKi}) + Stamina (${state.subStats.Stamina}) = ${target}`;
  }
  updateSummary();

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll Gift Check',
    onClick: () => {
      const result = performGiftCheck({ ki: state.currentKi, stamina: state.subStats.Stamina });
      if (result.outcome === 'failure') {
        state.currentKi = Math.max(0, state.currentKi - 1);
        refreshKiDependents();
      }
      updateSummary();
      resultEl.innerHTML = '';
      resultEl.append(
        el('p', {}, `Rolled ${result.roll.dice.join(', ')} → ${result.roll.sum} vs target ${result.target}`),
        el('p', { class: result.outcome === 'success' ? 'status-ok' : 'status-bad' }, [
          el('strong', {}, result.outcome === 'success' ? 'Success' : 'Failure (1 Ki spent)'),
        ]),
      );
    },
  });

  section.append(el('h4', {}, 'Gift Check'), summary, rollBtn, resultEl);
  return section;
}
