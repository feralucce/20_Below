import { el } from '../ui.js';
import { performCoreRoll, SKILL_TIERS } from '../roller/core.js';
import { performGiftCheck } from '../roller/giftCheck.js';
import { performResourceCheck } from '../roller/resourceCheck.js';
import { rollDamagePool, applyBoosts, worthBoosting } from '../roller/damage.js';
import {
  skillTierName,
  effectiveResourceLevel,
  applyResourceCheckFailure,
  applyResourceCheckZeroOut,
  clearResourcePenalty,
  fateTokenCap,
} from '../state.js';

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
    'catastrophic-failure': 'Catastrophic Failure',
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

// Skill Roll - the character sheet's Skills tab embeds this directly (see
// tab.interactive wiring in 13-sheet.js). Only Skills the character is
// actually Trained in (tier > 0) populate the dropdown, plus "Untrained" at
// the top - a from-scratch roll against an unpurchased Skill is already
// covered by that Untrained option, so listing every unpurchased Skill by
// name too would just be a long wall of redundant Untrained entries.
export function buildSkillRollSection(state, data, refreshHeader = () => {}) {
  const section = el('div', { class: 'roller-gift-check' });
  const resultEl = el('div', { class: 'roller-result' });

  // A Skill rolls against its own Default Element unless the player
  // challenges it (rules.md#sub-stat-descriptors, skills.md#skills-default-to-an-element)
  // - picking the Skill sets the radio group to that default, but the group
  // stays a free choice underneath so a challenge is just picking a
  // different Attribute before rolling.
  function defaultElementFor(skillName) {
    if (skillName === UNTRAINED_VALUE) return data.attributes[0].name;
    const skill = data.skillCatalog.find((s) => s.name === skillName);
    const el = skill?.defaultElement;
    return el && el !== 'Context-dependent' ? el : data.attributes[0].name;
  }

  let selectedSkill = UNTRAINED_VALUE;
  let selectedAttribute = defaultElementFor(selectedSkill);
  let selectedDifficulty = 5;
  let advantageOn = false;
  let disadvantageOn = false;
  // Jack of All Trades (boons.md): Tier 1 grants a Trained baseline in
  // every Skill. Rather than tracking which Boons a character owns, this
  // is a manual override - checking it floors the roll's effective Tier at
  // Trained (2), same as buying the Boon would, without touching the
  // Skill's own purchased Tier or requiring the app to model Boon effects.
  let joatOn = false;

  const skillSelect = el(
    'select',
    {
      onChange: (e) => {
        selectedSkill = e.target.value;
        selectedAttribute = defaultElementFor(selectedSkill);
        renderAttributeGroup();
        renderAttributeVisibility();
        renderTierGrantNote();
      },
    },
    [
      el('option', { value: UNTRAINED_VALUE }, 'No Skill (Untrained)'),
      ...data.skillCatalog
        .filter((s) => state.skills[s.name] > 0)
        .map((s) => el('option', { value: s.name }, `${s.name} - ${skillTierName(data, state.skills[s.name])}`)),
    ],
  );

  const attributeNote = el('p', { class: 'roller-tier-note' });
  function renderAttributeNote() {
    const defaultEl = defaultElementFor(selectedSkill);
    attributeNote.textContent =
      selectedAttribute === defaultEl
        ? `Using ${defaultEl}, this Skill's default.`
        : `Challenging the default (${defaultEl}) with ${selectedAttribute} - needs a matching Descriptor.`;
  }

  const attributeGroup = el('div', { class: 'attribute-radio-group' });
  function renderAttributeGroup() {
    attributeGroup.innerHTML = '';
    const defaultEl = defaultElementFor(selectedSkill);
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
              renderAttributeNote();
            },
          }),
          ` ${a.name} (${state.attributes[a.name]})${a.name === defaultEl ? ' - default' : ''}`,
        ]),
      );
    });
    renderAttributeNote();
  }
  renderAttributeGroup();

  // Jack of All Trades floors the effective Tier at Trained (2) - it never
  // lowers an already-better Tier, it only lifts Untrained/Novice up.
  function currentTier() {
    const purchasedTier = selectedSkill === UNTRAINED_VALUE ? 0 : state.skills[selectedSkill];
    return joatOn ? Math.max(purchasedTier, 2) : purchasedTier;
  }

  function renderAttributeVisibility() {
    const visible = currentTier() !== 0;
    attributeGroup.style.display = visible ? 'flex' : 'none';
    attributeNote.style.display = visible ? '' : 'none';
  }
  renderAttributeVisibility();

  const joatCheckbox = el('label', { class: 'roller-row' }, [
    el('input', {
      type: 'checkbox',
      checked: joatOn ? '' : undefined,
      onChange: (e) => {
        joatOn = e.target.checked;
        renderAttributeVisibility();
        renderTierGrantNote();
      },
    }),
    ' Jack of All Trades (treat this Skill as at least Trained)',
  ]);

  // The effective Tier can already grant Advantage or Disadvantage
  // (Adept/Expert/Master, Novice respectively) before either toggle box is
  // touched - the toggles are an *additional* source that stacks with the
  // Tier's own grant via the binary cancellation rule
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
        // A Token earned at the holding cap is lost, not banked
        // (rules/fate.md#holding-fate-tokens).
        state.currentFateTokens = Math.min(fateTokenCap(state), state.currentFateTokens + 1);
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

  section.append(
    el('h4', {}, 'Skill Roll'),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Skill'), skillSelect]),
    attributeGroup,
    attributeNote,
    joatCheckbox,
    el('div', { class: 'roller-row' }, [el('label', {}, 'Difficulty'), difficultySelect]),
    tierGrantNote,
    togglesRow,
    rollBtn,
    resultEl,
  );

  return section;
}

// Pushing a Resource (resources.md#pushing-a-resource): 2d10 against
// Resource Level + (10 - Resource Index), ordinary critical success/
// failure rule, no Skill involved. A normal-range check never denies the
// ask - it only drops the Resource's effective Level (state.
// resourcePenalties) until manually cleared, since the app has no
// in-game calendar to auto-expire "a Month" against. Reaching beyond your
// means (Resource Index up to 2 higher than the current effective Level,
// or Index 6 always) zeroes the Resource out instead (state.
// resourceZeroed), unless the roll is a critical success - except Index 6
// itself, which is never saved by a crit.
export function buildResourceCheckSection(state, data) {
  const section = el('div', { class: 'roller-gift-check' });

  const ownedResources = data.resources.filter((r) => state.resources[r.name] > 0);
  let selectedResource = ownedResources[0]?.name ?? null;
  let selectedResourceIndex = 3;

  const resourceSelect = el(
    'select',
    {
      onChange: (e) => {
        selectedResource = e.target.value;
        renderSummary();
        renderResourceIndexOptions();
      },
    },
    ownedResources.map((r) =>
      el('option', { value: r.name }, `${r.name} (Level ${state.resources[r.name]})`),
    ),
  );

  // Resource Index is a flat 1-6 scale, its own thing rather than the
  // general Difficulty Chart - bare numbers only, no descriptive labels.
  // An Index more than 2 above the Resource's current effective Level is
  // simply out of reach and disabled, except Index 6, which is always
  // attemptable (resources.md: "always treated as reaching 2 levels
  // beyond the Resource's current Level, no matter how high that Level
  // actually is").
  const resourceIndexSelect = el('select', {
    onChange: (e) => {
      selectedResourceIndex = Number(e.target.value);
    },
  });
  function renderResourceIndexOptions() {
    const effective = selectedResource ? effectiveResourceLevel(state, selectedResource) : 0;
    resourceIndexSelect.innerHTML = '';
    for (let ri = 1; ri <= 6; ri++) {
      const reachable = ri === 6 || ri - effective <= 2;
      resourceIndexSelect.append(
        el(
          'option',
          {
            value: ri,
            selected: ri === selectedResourceIndex ? '' : undefined,
            disabled: reachable ? undefined : '',
          },
          `${ri}`,
        ),
      );
    }
  }
  renderResourceIndexOptions();

  const summaryEl = el('p', {});
  const clearBtn = el('button', {
    type: 'button',
    text: 'Clear penalty (a Month has passed)',
    onClick: () => {
      clearResourcePenalty(state, selectedResource);
      renderSummary();
      renderResourceIndexOptions();
    },
  });

  function renderSummary() {
    if (!selectedResource) {
      summaryEl.textContent = 'No Resources owned yet.';
      clearBtn.disabled = true;
      return;
    }
    const effective = effectiveResourceLevel(state, selectedResource);
    const zeroed = state.resourceZeroed[selectedResource];
    const penalty = state.resourcePenalties[selectedResource] ?? 0;
    summaryEl.textContent = zeroed
      ? `Effective Level 0 (zeroed out by reaching beyond your means).`
      : penalty
        ? `Effective Level ${effective} (reduced from ${state.resources[selectedResource]} by a prior failure).`
        : `Current Level ${effective}.`;
    clearBtn.disabled = !zeroed && !penalty;
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
      const result = performResourceCheck({ resourceLevel, resourceIndex: selectedResourceIndex });
      if (result.resourceZeroed) {
        applyResourceCheckZeroOut(state, selectedResource);
      } else if (result.resourceReduced) {
        applyResourceCheckFailure(state, selectedResource);
      }
      renderSummary();
      renderResourceIndexOptions();
      resultEl.innerHTML = '';
      const costLine = result.resourceZeroed
        ? `${selectedResource} drops to 0 until a Month passes - reaching that far beyond your means always costs everything${result.outcome === 'critical-success' ? ' (Resource Index 6 isn\'t saved by a critical success)' : ''}.`
        : result.resourceReduced
          ? `${selectedResource} drops to Level ${effectiveResourceLevel(state, selectedResource)} until a Month passes.`
          : result.beyondMeans
            ? `Critical success - ${selectedResource} is unaffected even reaching this far beyond your means.`
            : `${selectedResource} is unaffected - you got what you were after.`;
      resultEl.append(
        el('p', {}, `Rolled ${result.roll.dice.join(', ')} → ${result.roll.sum} vs target ${result.target}`),
        el('p', { class: outcomeClass(result.outcome) }, [el('strong', {}, outcomeLabel(result.outcome))]),
        el('p', {}, costLine),
      );
    },
  });

  section.append(
    el('h4', {}, 'Resource Check'),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Resource'), resourceSelect]),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Resource Index'), resourceIndexSelect]),
    summaryEl,
    el('div', { style: 'display:flex;gap:0.5rem;' }, [rollBtn, clearBtn]),
    resultEl,
  );
  return section;
}

// Attack Roll - rules.md#the-passive-wall-triad---soak-presence-psyche's
// to-hit step: a straight Attribute-vs-Defense roll, no Skill involved at
// all. Only Earth/Air/Fire/Water are offered - Moira (Fate/the
// supernatural) isn't a combat Attribute and never applies to a to-hit
// roll. Reuses the core roll engine with a fixed Tier of 2 (Trained): that
// Tier's shape is exactly "use the Attribute, no auto Advantage/
// Disadvantage, no crit widening, no Master reroll" - precisely a plain
// Attribute-vs-Difficulty roll with no Skill-Tier modifiers layered on.
const ATTACK_ATTRIBUTES = ['Earth', 'Air', 'Fire', 'Water'];
const PLAIN_ATTACK_TIER = 2;

export function buildAttackRollSection(state, data, refreshHeader, onCritical = () => {}) {
  const section = el('div', { class: 'roller-gift-check' });

  const attackAttributes = data.attributes.filter((a) => ATTACK_ATTRIBUTES.includes(a.name));
  let selectedAttribute = attackAttributes[0]?.name;
  let selectedDefense = 5;
  let advantageOn = false;
  let disadvantageOn = false;

  const attributeGroup = el('div', { class: 'attribute-radio-group' });
  function renderAttributeGroup() {
    attributeGroup.innerHTML = '';
    attackAttributes.forEach((a) => {
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

  // Defense runs the same 0-10 scale as the Difficulty Chart (rules.md:
  // "Defense becomes the attacker's Difficulty"), but shown as bare
  // numbers here - a Defense score isn't a GM-picked task difficulty, so
  // the Difficulty Chart's descriptive labels ("Nearly Impossible", etc.)
  // don't apply to what this dropdown means.
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
        `${d.difficulty}`,
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

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll to Hit',
    onClick: () => {
      const attributeValue = state.attributes[selectedAttribute];
      const result = performCoreRoll({
        attribute: attributeValue,
        difficulty: selectedDefense,
        skillTier: PLAIN_ATTACK_TIER,
        extraAdvantage: advantageOn ? 1 : 0,
        extraDisadvantage: disadvantageOn ? 1 : 0,
        klotho: state.subStats.Klotho,
      });

      if (result.luckyNumber) {
        // A Token earned at the holding cap is lost, not banked
        // (rules/fate.md#holding-fate-tokens).
        state.currentFateTokens = Math.min(fateTokenCap(state), state.currentFateTokens + 1);
        refreshHeader();
      }

      const hit = result.outcome === 'success' || result.outcome === 'critical-success';
      const crit = result.outcome === 'critical-success';
      // Arm or disarm the damage panel to match this roll, so a critical
      // never has to be remembered and a normal hit never leaves it armed.
      onCritical(crit);

      toHitResultEl.innerHTML = '';
      toHitResultEl.append(
        ...[
          el('p', {}, [
            el('strong', {}, `${selectedAttribute} vs Defense ${result.target}`),
            result.mode !== 'normal' ? ` (${result.mode === 'advantage' ? 'Advantage' : 'Disadvantage'})` : '',
          ]),
          el('p', {}, diceSummary(result.roll)),
          el('p', { class: outcomeClass(result.outcome) }, [
            el('strong', {}, hit ? `${outcomeLabel(result.outcome)} - the attack connects` : `${outcomeLabel(result.outcome)} - the attack misses`),
          ]),
          crit ? el('p', { class: 'status-ok' }, [el('strong', {}, 'Critical hit - damage dice doubled.')]) : null,
          result.luckyNumber ? el('p', { class: 'status-ok' }, 'Lucky Number! +1 Fate Token.') : null,
        ].filter((n) => n != null),
      );
    },
  });

  section.append(
    el('h4', {}, 'Attack Roll'),
    attributeGroup,
    el('div', { class: 'roller-row' }, [el('label', {}, "Target's Defense"), defenseSelect]),
    togglesRow,
    rollBtn,
    toHitResultEl,
  );
  return section;
}

// Damage dice pool - weapon/Gift attacks, per-die resolution against a
// wall stat with an optional pre-committed Ki Infusion boost (see
// rules.md#the-passive-wall-triad---soak-presence-psyche and #ki-infusion).
// Dice count and the target's wall value are typed in directly rather than
// looked up from a weapon/Gift catalog - see the discussion in
// character-creator.notes.md for why that's out of scope for this pass.
export function buildDamageRollSection(state, data, refreshHeader, heading = 'Damage Roll') {
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

  // Ki Infusion is chosen after the roll (rules.md#ki-infusion), so the
  // panel works in two beats: roll the pool, then decide what to spend on
  // it. `pool` holds the rolled dice between those beats; null means
  // nothing has been rolled yet.
  let pool = null;
  let critical = false;

  const critToggle = el('input', {
    type: 'checkbox',
    onChange: (e) => {
      critical = e.target.checked;
      renderSummary();
    },
  });

  const summaryEl = el('p', {});
  function renderSummary() {
    const info = ATTACK_TYPES[attackType];
    const track = info.track === 'health' ? 'Health Level' : info.track === 'poise' ? 'Poise' : 'Sanity Level';
    summaryEl.textContent =
      `${attackType}: ${critical ? diceCount * 2 : diceCount} dice vs the target's ${info.wallStat}` +
      `${critical ? ' (doubled for a critical hit)' : ''}. Each connecting die costs the target a ${track}.`;
  }

  const resultEl = el('div', { class: 'roller-result' });

  // Renders the rolled dice with a boost toggle on each. Toggling spends or
  // refunds Ki immediately, so the running Ki total on the sheet always
  // matches what the panel shows.
  function renderPool() {
    const info = ATTACK_TYPES[attackType];
    const boostAmount = state.subStats[info.boostStat];
    resultEl.innerHTML = '';
    if (!pool) return;

    const applied = applyBoosts(pool, pool.chosen, boostAmount);
    const worth = new Set(worthBoosting(pool, boostAmount));
    const track = info.track === 'health' ? 'Levels' : info.track === 'poise' ? 'Poise' : 'Levels';

    const dieRow = el('div', { class: 'roller-boost-row' });
    applied.dice.forEach((d, i) => {
      const chosen = pool.chosen.has(i);
      // A die is only checkable if boosting it could change the outcome and
      // there is Ki left to pay for it.
      const useful = worth.has(i);
      const atCap = !chosen && pool.chosen.size >= state.currentKi + pool.chosen.size - pool.paid;
      const disabled = !useful || (!chosen && pool.paid >= state.currentKi + pool.paid && state.currentKi <= 0);
      dieRow.append(
        el('label', {
          class: 'boost-die' + (disabled && !chosen ? ' boost-die-disabled' : '') + (d.connects ? ' boost-die-hit' : ''),
          title: d.connects ? 'connects' : useful ? `boost for 1 Ki: ${d.raw}+${boostAmount}` : 'too far under the wall to save',
        }, [
          el('input', {
            type: 'checkbox',
            checked: chosen ? '' : undefined,
            disabled: disabled && !chosen ? '' : undefined,
            onChange: (e) => {
              if (e.target.checked) {
                if (state.currentKi <= 0) { e.target.checked = false; return; }
                pool.chosen.add(i);
                state.currentKi -= 1;
                pool.paid += 1;
              } else {
                pool.chosen.delete(i);
                state.currentKi += 1;
                pool.paid -= 1;
              }
              refreshHeader();
              renderPool();
            },
          }),
          ` ${d.boosted ? `${d.raw}+${boostAmount}=${d.result}` : d.raw}`,
        ]),
      );
    });

    const unspent = worth.size - pool.chosen.size;
    resultEl.append(
      ...[
        el('p', {}, [
          el('strong', {}, `${applied.dice.length} dice vs wall ${pool.wall}`),
          pool.critical ? ' - critical hit, doubled' : '',
        ]),
        dieRow,
        el('p', {}, `Tick a die to spend 1 Ki and add ${boostAmount} ${info.boostStat} to it. ${state.currentKi} Ki left.`),
        unspent > 0
          ? el('p', { class: 'status-warn' }, `${unspent} more die${unspent === 1 ? '' : 's'} could still be carried over the wall.`)
          : null,
        el('p', { class: 'status-bad' }, [
          el('strong', {}, `${applied.connectCount} connect - ${applied.connectCount} ${track} to the target`),
        ]),
        pool.paid > 0 ? el('p', {}, `${pool.paid} Ki spent on this attack.`) : null,
      ].filter((n) => n != null),
    );
  }

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll Damage',
    onClick: () => {
      // Damage the character is dealing to someone else, not to their own
      // sheet - only the Ki spend touches this character's state. The
      // crossing-zero throttle is not applied here: it depends on the
      // target's own current track, which this app cannot see for an NPC.
      // The connect count is the damage dealt, for whoever holds that sheet.
      pool = rollDamagePool({ diceCount, wall, critical });
      pool.chosen = new Set();
      pool.paid = 0;
      renderPool();
    },
  });

  renderSummary();

  section.append(
    el('h4', {}, heading),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Attack Type'), typeSelect]),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Dice'), diceInput]),
    el('div', { class: 'roller-row' }, [el('label', {}, "Target's Wall"), wallInput]),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Critical hit'), critToggle]),
    summaryEl,
    rollBtn,
    resultEl,
  );
  // The to-hit roller arms this when it crits, so the two panels agree.
  section.armCritical = (on) => {
    critical = on;
    critToggle.checked = on;
    renderSummary();
  };
  section.refreshBoostRow = renderPool;
  return section;
}

// Gift Check (rules.md#resolution, gifts.md#resolution): 2d10 roll-under
// against current Ki + Stamina. Success is free; failure costs 1 Ki,
// deducted here immediately since there's no separate confirmation step
// for a cost this small and automatic.
export function buildGiftCheckSection(state, data, refreshKiDependents) {
  const section = el('div', { class: 'roller-gift-check' });
  const summary = el('p', {});
  const resultEl = el('div', { class: 'roller-result' });

  function updateSummary() {
    // Rolls against current Ki alone now, not Ki + Stamina
    // (rules/gifts.md#resolution).
    summary.textContent = `Roll under your current Ki: ${state.currentKi}`;
  }
  updateSummary();

  const rollBtn = el('button', {
    type: 'button',
    class: 'roll-btn',
    text: 'Roll Gift Check',
    onClick: () => {
      const result = performGiftCheck({ ki: state.currentKi });
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
