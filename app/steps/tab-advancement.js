import { el, counterRow, renderMarkdown } from '../ui.js';
import {
  subStatPoolRemaining,
  descriptorSlots,
  skillTierName,
  giftLevelCost,
  xpSpent,
  xpRemaining,
  buyAdvancementAttributePoint,
  refundAdvancementAttributePoint,
  buyAdvancementSkillTier,
  refundAdvancementSkillTier,
  buyAdvancementResourceLevel,
  refundAdvancementResourceLevel,
  buyAdvancementDescriptor,
  refundAdvancementDescriptor,
  advancementGiftLevelCostAt,
  buyAdvancementGiftLevel,
  refundAdvancementGiftLevel,
  buyAdvancementGiftAdder,
  refundAdvancementGiftAdder,
} from '../state.js';
import { renderBoonPicker } from './07-boons.js';

function descriptorInputs(container, state, data, subName, refresh) {
  const slots = descriptorSlots(state, subName);
  const arr = state.descriptors[subName];
  while (arr.length < slots) arr.push('');
  while (arr.length > slots) arr.pop();
  if (slots === 0) return;
  container.append(el('div', { class: 'field-label' }, `${subName} Descriptors`));
  arr.forEach((val, i) => {
    container.append(
      el('input', {
        type: 'text',
        value: val,
        placeholder: `Descriptor ${i + 1}`,
        style: 'display:block;margin:0.15rem 0;',
        onInput: (e) => {
          arr[i] = e.target.value;
        },
      }),
    );
  });
}

function attributesSection(state, data, refresh) {
  const section = el('div', {});
  section.append(el('h3', {}, `Attributes (current rating × ${data.advancement.attributeXpMultiplier} XP)`));
  data.attributes.forEach((a) => {
    const rating = state.attributes[a.name];
    const cost = rating * data.advancement.attributeXpMultiplier;
    const remaining = xpRemaining(state, data);
    const bought = state.advancementPurchases.Attributes[a.name] ?? 0;
    const card = el('div', { class: 'pick-card' });
    card.append(
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center;gap:0.5rem;' }, [
        el('strong', {}, `${a.name}: ${rating}`),
        el('div', {}, [
          bought > 0
            ? el('button', {
                type: 'button',
                text: 'Undo raise',
                onClick: () => {
                  refundAdvancementAttributePoint(state, a.name);
                  refresh();
                },
              })
            : null,
          el('button', {
            type: 'button',
            text: `Raise to ${rating + 1} (${cost} XP)`,
            disabled: cost > remaining ? '' : undefined,
            onClick: () => {
              buyAdvancementAttributePoint(state, a.name);
              refresh();
            },
          }),
        ]),
      ]),
    );

    const subRemaining = subStatPoolRemaining(state, data, a.name);
    const [subA, subB] = a.splitsInto;
    if (subRemaining > 0) {
      card.append(el('p', { class: 'detail' }, `${subRemaining} Sub-Stat point(s) to allocate (free, from Attribute raises):`));
      [subA, subB].forEach((subName) => {
        // min is pinned to the sub-stat's own current value - a split is
        // permanent once spent (see rules.md#sub-category-allocation), so
        // this control can only ever place the newly-granted point, never
        // pull an already-spent one back off.
        const floor = state.subStats[subName];
        card.append(
          counterRow({
            name: subName,
            get: () => state.subStats[subName],
            set: (v) => {
              state.subStats[subName] = v;
            },
            min: () => floor,
            max: () => state.subStats[subName] + subStatPoolRemaining(state, data, a.name),
            onChange: refresh,
          }),
        );
      });
    }
    [subA, subB].forEach((subName) => descriptorInputs(card, state, data, subName, refresh));
    section.appendChild(card);
  });
  return section;
}

function skillsSection(state, data, refresh) {
  const section = el('div', {});
  section.append(el('h3', {}, `Skills (current tier × ${data.advancement.skillTierXpMultiplier} XP)`));
  const filterInput = el('input', { type: 'text', placeholder: 'Filter skills...' });
  const listEl = el('div', { class: 'pick-list' });
  section.append(filterInput, listEl);

  function renderList() {
    listEl.innerHTML = '';
    const filter = filterInput.value.toLowerCase();
    data.skillCatalog
      .filter((s) => s.name.toLowerCase().includes(filter))
      .forEach((s) => {
        const tier = state.skills[s.name];
        const cost = tier * data.advancement.skillTierXpMultiplier;
        const bought = state.advancementPurchases.Skills[s.name] ?? 0;
        const row = counterRow({
          name: s.name,
          hint: tier < 5 ? `${cost} XP` : 'maxed',
          get: () => tier,
          set: (v) => {
            if (v > tier) buyAdvancementSkillTier(state, s.name);
            else refundAdvancementSkillTier(state, s.name);
          },
          min: tier - bought,
          max: () => (tier < 5 && cost <= xpRemaining(state, data) ? tier + 1 : tier),
          format: (v) => skillTierName(data, v),
          onChange: refresh,
        });
        row.classList.add('counter-row-compact');
        listEl.appendChild(row);
      });
  }
  filterInput.addEventListener('input', renderList);
  renderList();
  return section;
}

function resourcesSection(state, data, refresh) {
  const section = el('div', {});
  const flat = data.advancement.resourceXpPerLevel;
  section.append(el('h3', {}, `Resources (flat ${flat} XP/level)`));
  data.resources.forEach((r) => {
    const level = state.resources[r.name];
    const remaining = xpRemaining(state, data);
    const bought = state.advancementPurchases.Resources[r.name] ?? 0;
    section.append(
      el('div', { class: 'counter-row' }, [
        el('span', { class: 'name' }, `${r.name} - Level ${level}`),
        bought > 0
          ? el('button', {
              type: 'button',
              text: 'Undo',
              onClick: () => {
                refundAdvancementResourceLevel(state, r.name);
                refresh();
              },
            })
          : null,
        level < 5
          ? el('button', {
              type: 'button',
              text: `Raise (${flat} XP)`,
              disabled: flat > remaining ? '' : undefined,
              onClick: () => {
                buyAdvancementResourceLevel(state, r.name);
                refresh();
              },
            })
          : null,
      ]),
    );
  });
  return section;
}

function giftsSection(state, data, refresh) {
  const section = el('div', {});
  section.append(
    el(
      'h3',
      {},
      `Gifts (new Gift ${data.advancement.newGiftBaseXp} XP, raise = current level × ${data.advancement.giftLevelXpMultiplier} XP, both reduced by Limiters, floored at ${data.advancement.giftLimiterFloor}; Adders: Lesser ${data.advancement.giftAdderXp.Lesser} / Greater ${data.advancement.giftAdderXp.Greater} XP)`,
    ),
  );
  data.gifts.forEach((gift) => {
    const gState = state.gifts.find((g) => g.name === gift.name);
    const level = gState?.level ?? 0;
    const limiterCount = gState?.limiters.length ?? 0;
    const cost = advancementGiftLevelCostAt(data, level, limiterCount);
    const remaining = xpRemaining(state, data);
    const boughtLevels = state.advancementPurchases.Gifts[gift.name] ?? 0;
    const card = el('details', { class: 'pick-card' });
    card.append(
      el('summary', {}, `${gift.name} - Level ${level}`),
      el('div', { class: 'detail', html: renderMarkdown(gift.markdown) }),
    );
    const btnRow = el('div', { style: 'display:flex;gap:0.5rem;flex-wrap:wrap;margin:0.5rem 0;' }, [
      boughtLevels > 0
        ? el('button', {
            type: 'button',
            text: 'Undo last raise',
            onClick: () => {
              refundAdvancementGiftLevel(state, gift.name);
              refresh();
            },
          })
        : null,
      level < 5
        ? el('button', {
            type: 'button',
            text: `${level === 0 ? 'Acquire' : 'Raise'} to Level ${level + 1} (${cost} XP)`,
            disabled: cost > remaining ? '' : undefined,
            onClick: () => {
              buyAdvancementGiftLevel(state, gift.name);
              refresh();
            },
          })
        : null,
    ]);
    card.appendChild(btnRow);

    if (level > 0 && gift.adders.length) {
      const addersRow = el('div', { style: 'margin:0.25rem 0 0.5rem 0.5rem;' });
      gift.adders.forEach((adder) => {
        const owned = gState.adders.includes(adder.name);
        const boughtHere = (state.advancementPurchases.GiftAdders?.[gift.name] ?? []).includes(adder.name);
        addersRow.appendChild(
          el('div', { style: 'display:flex;gap:0.5rem;align-items:center;margin:0.15rem 0;' }, [
            el('span', {}, `${adder.name} (${adder.tier}, ${adder.points} XP)${owned ? ' - owned' : ''}`),
            !owned
              ? el('button', {
                  type: 'button',
                  text: 'Buy',
                  disabled: adder.points > remaining ? '' : undefined,
                  onClick: () => {
                    buyAdvancementGiftAdder(state, gift.name, adder.name);
                    refresh();
                  },
                })
              : null,
            owned && boughtHere
              ? el('button', {
                  type: 'button',
                  text: 'Undo',
                  onClick: () => {
                    refundAdvancementGiftAdder(state, gift.name, adder.name);
                    refresh();
                  },
                })
              : null,
          ]),
        );
      });
      card.appendChild(addersRow);
    }
    section.appendChild(card);
  });
  return section;
}

function boonsSection(state, data, refresh) {
  const section = el('div', {});
  section.append(el('h3', {}, `Boons (× ${data.advancement.boonXpMultiplier} creation cost)`));
  renderBoonPicker(section, { state, rerenderStep: refresh, rerenderPools: () => {} }, data.boons, {
    source: 'advancement',
    getRemaining: () => xpRemaining(state, data),
    toCurrency: (points) => points * data.advancement.boonXpMultiplier,
    currencyLabel: 'XP',
  });
  return section;
}

export default function buildAdvancementTab(state, data, refresh) {
  const wrap = el('div', {});
  const summary = el('p', {});
  function updateSummary() {
    summary.textContent = `XP Earned: ${state.xpEarned}. Spent: ${xpSpent(state, data)}. Remaining: ${xpRemaining(state, data)}.`;
  }
  updateSummary();

  wrap.append(
    el('h2', {}, 'Advancement'),
    el('p', { class: 'detail' }, 'Post-creation XP spend, see rules/advancement.md. Award XP per session at the table, enter the running total below.'),
    el('div', { class: 'field' }, [
      el('label', {}, 'XP Earned (total, running)'),
      el('input', {
        type: 'number',
        min: '0',
        value: state.xpEarned,
        onInput: (e) => {
          state.xpEarned = Math.max(0, Number(e.target.value) || 0);
          refresh();
        },
      }),
    ]),
    summary,
  );

  if (!refresh) return [wrap];
  wrap.append(
    attributesSection(state, data, refresh),
    skillsSection(state, data, refresh),
    resourcesSection(state, data, refresh),
    giftsSection(state, data, refresh),
    boonsSection(state, data, refresh),
  );
  return [wrap];
}
