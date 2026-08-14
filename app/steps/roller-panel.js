import { el } from '../ui.js';
import { performCoreRoll } from '../roller/core.js';
import { skillTierName } from '../state.js';

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
    el('div', { class: 'roller-row' }, [el('label', {}, 'Skill'), skillSelect]),
    attributeGroup,
    el('div', { class: 'roller-row' }, [el('label', {}, 'Difficulty'), difficultySelect]),
    togglesRow,
    rollBtn,
    resultEl,
  );

  return wrap;
}
