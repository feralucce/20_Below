import { el } from '../ui.js';
import { performCoreRoll, SKILL_TIERS } from '../roller/core.js';
import { performGiftCheck } from '../roller/giftCheck.js';
import { rollDamagePool, applyThrottledDamage, applyPoiseDamage } from '../roller/damage.js';
import { skillTierName } from '../state.js';

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

export default function buildRollerPanel(state, data, { refreshHeader }) {
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

  wrap.append(
    el('h4', {}, 'Core Roll'),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Skill'), skillSelect]),
    attributeGroup,
    el('div', { class: 'roller-row' }, [el('label', {}, 'Difficulty'), difficultySelect]),
    tierGrantNote,
    togglesRow,
    rollBtn,
    resultEl,
    buildGiftCheckSection(state, data, refreshHeader),
    buildDamageRollSection(state, data, refreshHeader),
  );

  return wrap;
}

// Damage dice pool - weapon/Gift attacks, per-die resolution against a
// wall stat with an optional pre-committed Ki Infusion boost (see
// rules.md#the-passive-wall-triad---soak-presence-psyche and #ki-infusion).
// Dice count and the target's wall value are typed in directly rather than
// looked up from a weapon/Gift catalog - see the discussion in
// character-creator.notes.md for why that's out of scope for this pass.
function buildDamageRollSection(state, data, refreshHeader) {
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

  const boostRow = el('div', { class: 'roller-boost-row' });
  function renderBoostRow() {
    const info = ATTACK_TYPES[attackType];
    boostRow.innerHTML = '';
    boostRow.append(el('span', { class: 'boost-label' }, `Ki Infusion (+${state.subStats[info.boostStat]} ${info.boostStat} per boosted die, 1 Ki each):`));
    for (let i = 0; i < diceCount; i++) {
      const checked = boostedDice.has(i);
      boostRow.append(
        el('label', { class: 'boost-die' }, [
          el('input', {
            type: 'checkbox',
            checked: checked ? '' : undefined,
            onChange: (e) => {
              if (e.target.checked) boostedDice.add(i);
              else boostedDice.delete(i);
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
      const info = ATTACK_TYPES[attackType];
      const boostAmount = state.subStats[info.boostStat];
      const kiSpent = boostedDice.size;
      state.currentKi = Math.max(0, state.currentKi - kiSpent);

      const result = rollDamagePool({ diceCount, wall, boostedDice: [...boostedDice], boostAmount });

      const before = state.currentHealth != null ? { health: state.currentHealth, poise: state.currentPoise, sanity: state.currentSanity } : null;
      if (info.track === 'health') {
        state.currentHealth = applyThrottledDamage(state.currentHealth, result.connectCount);
      } else if (info.track === 'sanity') {
        state.currentSanity = applyThrottledDamage(state.currentSanity, result.connectCount);
      } else {
        state.currentPoise = applyPoiseDamage(state.currentPoise, result.connectCount);
      }
      refreshHeader();

      resultEl.innerHTML = '';
      resultEl.append(
        ...[
          el(
            'p',
            {},
            `Rolled: ${result.dice.map((d) => (d.boosted ? `${d.raw}+${boostAmount}=${d.result}` : `${d.result}`)).join(', ')} vs wall ${wall}`,
          ),
          el('p', {}, [el('strong', {}, `${result.connectCount} of ${diceCount} connect`)]),
          kiSpent > 0 ? el('p', {}, `${kiSpent} Ki spent on boosted dice.`) : null,
          before
            ? el(
                'p',
                { class: 'status-bad' },
                info.track === 'health'
                  ? `Health Levels: ${before.health} → ${state.currentHealth}`
                  : info.track === 'poise'
                    ? `Poise: ${before.poise} → ${state.currentPoise}`
                    : `Sanity: ${before.sanity} → ${state.currentSanity}`,
              )
            : null,
        ].filter((n) => n != null),
      );
    },
  });

  section.append(
    el('h4', {}, 'Damage Roll'),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Attack Type'), typeSelect]),
    el('div', { class: 'roller-row' }, [el('label', {}, 'Dice'), diceInput]),
    el('div', { class: 'roller-row' }, [el('label', {}, "Target's Wall"), wallInput]),
    boostRow,
    summaryEl,
    rollBtn,
    resultEl,
  );
  return section;
}

// Gift Check (rules.md#resolution, gifts.md#resolution): 2d10 roll-under
// against current Ki + Stamina. Success is free; failure costs 1 Ki,
// deducted here immediately since there's no separate confirmation step
// for a cost this small and automatic.
function buildGiftCheckSection(state, data, refreshHeader) {
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
        refreshHeader();
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
