import { el, counterRow, renderSelectedAvailable, renderMarkdownInline as inline } from '../ui.js';
import {
  skillsPoolRemaining, skillTierName, retiredSkills, removeRetiredSkill, TRAINED_TIER, MASTER_TIER,
  boughtOutsidePool, resetSkills,
} from '../state.js';

export default {
  id: 'skills',
  title: 'Skills',
  render(container, { state, data, rerenderStep, rerenderPools }) {
    const remaining = skillsPoolRemaining(state, data);
    const jackOfAllTrades = state.boons.find((b) => b.name === 'Jack of all Trades');
    const poolBlocked = jackOfAllTrades && jackOfAllTrades.points === 5;
    container.append(
      el('h2', {}, 'Skills'),
      el(
        'p',
        {},
        poolBlocked
          ? `Jack of all Trades (Tier 1) already gives you Trained in every Skill and caps every Skill at Trained - the Skills Pool has nothing left to buy, so it's locked at 0 rather than freed up for anything else. Remaining: ${remaining}.`
          : `Everyman Skills (${data.everymanSkills.join(', ')}) start Trained for free. Beyond that, a ${data.skillsPoolTotal}-point pool, 1 point per tier climbed. Remaining: ${remaining}.`,
      ),
    );

    container.append(el('p', {}, [
      el('button', {
        type: 'button',
        text: 'Reset Skills',
        onClick: () => {
          if (!window.confirm('Put every Skill back where a new character starts - Everyman Skills at Trained, everything else Untrained - and give back every point spent on Skills: the Skills pool, Discretionary points and XP. This can\'t be undone.')) return;
          resetSkills(state, data);
          rerenderStep();
          rerenderPools();
        },
      }),
    ]));

    const tierTable = el('table', {}, [
      el('tr', {}, [el('th', {}, 'Tier'), el('th', {}, 'Roll')]),
      ...data.skillTiers.map((t) => el('tr', {}, [el('td', {}, t.name), el('td', { html: inline(t.roll) })])),
    ]);
    container.append(el('div', { class: 'detail', style: 'margin-bottom:1rem;' }, tierTable));

    // Skills the save still holds that the list no longer has. Nothing
    // changes them but the player: each says what became of it, and goes
    // only when Remove is pressed.
    const retired = retiredSkills(state, data);
    if (retired.length) {
      container.append(el('div', { class: 'migration-notice' }, [
        el('p', { html: '<strong>Skills that have left the rules.</strong> This character still has them, and they still count against the Skills pool. Removing one gives its points back to spend on what replaced it.' }),
        el('ul', {}, retired.map((r) => el('li', {}, [
          el('strong', {}, r.name), ` (${skillTierName(data, r.tier)}) - ${r.note} `,
          el('button', {
            type: 'button',
            text: 'Remove',
            onClick: () => {
              removeRetiredSkill(state, r.name);
              rerenderStep();
              rerenderPools();
            },
          }),
        ]))),
      ]));
    }

    container.append(
      el('div', { class: 'field' }, [
        el('input', {
          type: 'text',
          placeholder: 'Filter skills...',
          onInput: (e) => {
            filterValue = e.target.value.toLowerCase();
            picker.render();
          },
        }),
      ]),
    );

    let filterValue = '';
    const baselineOf = (s) => (data.everymanSkills.includes(s.name) ? TRAINED_TIER : 0);
    const isSelected = (s) => state.skills[s.name] > baselineOf(s);

    function renderCard(s) {
      const baseline = baselineOf(s);
      const rem = skillsPoolRemaining(state, data);
      const row = el('div', { class: 'pick-card' });
      row.append(
        counterRow({
          name: `${s.name}${baseline ? ' (Everyman)' : ''}`,
          get: () => state.skills[s.name],
          set: (v) => {
            state.skills[s.name] = v;
          },
          min: baseline + boughtOutsidePool(state, 'Skills', s.name),
          max: () => Math.min(MASTER_TIER, state.skills[s.name] + rem),
          format: (v) => skillTierName(data, v),
          onChange: () => {
            rerenderPools();
            picker.render();
          },
        }),
      );
      if (s.defaultElement) {
        row.append(
          el(
            'p',
            { class: 'detail', style: 'color:var(--text-dim);font-size:0.85rem;margin:0.15rem 0 0.5rem;' },
            s.defaultElement === 'Context-dependent'
              ? 'Default Element: set for this weapon when defined.'
              : `Default Element: ${s.defaultElement}. Use your Descriptors to argue a different Element.`,
          ),
        );
      }
      return row;
    }

    const picker = renderSelectedAvailable(container, {
      label: 'Skills',
      // Selected skills always show regardless of the search box; unselected
      // ones are filtered so the search box still narrows what you're
      // browsing to pick next.
      getItems: () => data.skillCatalog.filter((s) => isSelected(s) || s.name.toLowerCase().includes(filterValue)),
      isSelected,
      renderCard,
    });
  },
};
