import { el, counterRow } from '../ui.js';
import {
  discretionaryTotal,
  discretionaryPointsSpent,
  discretionaryRemaining,
  flawsPointsGranted,
  buyAttributePoint,
  refundAttributePoint,
  buySkillTier,
  refundSkillTier,
  buyResourceLevel,
  refundResourceLevel,
  buyGiftLevel,
  refundGiftLevel,
  giftLevelCost,
  skillTierName,
  unspentBoonsPoolPoints,
} from '../state.js';
import { renderBoonPicker } from './07-boons.js';

export default {
  id: 'discretionary',
  title: '12. Discretionary Points',
  render(container, ctx) {
    const { state, data, rerenderStep, rerenderPools } = ctx;
    function summaryText() {
      const t = discretionaryTotal(state, data);
      const s = discretionaryPointsSpent(state, data);
      const r = discretionaryRemaining(state, data);
      return `Base ${data.discretionaryBase} + ${flawsPointsGranted(state)} from Flaws + ${unspentBoonsPoolPoints(state, data)} unspent from Boons = ${t} total. Spent: ${s}. Remaining: ${r}.`;
    }
    const summaryEl = el('p', {}, summaryText());

    container.append(
      el('h2', {}, '12. Discretionary Points'),
      summaryEl,
      el('div', { class: 'field' }, [
        el('label', {}, "GM's per-campaign cap on Flaw-earned Discretionary (optional, blank = uncapped)"),
        el('input', {
          type: 'number',
          min: '0',
          value: state.discretionaryCap ?? '',
          onInput: (e) => {
            state.discretionaryCap = e.target.value === '' ? null : Number(e.target.value);
            rerenderStep();
            rerenderPools();
          },
        }),
      ]),
      el(
        'p',
        {},
        'Buy real Boons, Resources, Gifts, Skills, Attribute points, or Fate Tokens directly below, priced at the conversion rate. Extra Descriptors are bought per sub-stat back on step 6.',
      ),
    );

    // ---- Fate Tokens (pure count, no separate item to pick) ----
    const rateFate = data.discretionaryRates['Fate Tokens'];
    container.append(el('h3', {}, `Fate Tokens (${rateFate} Discretionary/token)`));
    container.append(
      counterRow({
        name: 'Extra Fate Tokens',
        get: () => state.discretionaryExtra['Fate Tokens'],
        set: (v) => {
          state.discretionaryExtra['Fate Tokens'] = v;
        },
        min: 0,
        max: () =>
          state.discretionaryExtra['Fate Tokens'] + Math.floor(discretionaryRemaining(state, data) / rateFate),
        onChange: () => {
          rerenderStep();
          rerenderPools();
        },
      }),
    );

    // ---- Attributes ----
    const rateAttr = data.discretionaryRates.Attributes;
    container.append(el('h3', {}, `Attributes (${rateAttr} Discretionary/point)`));
    data.attributes.forEach((a) => {
      const bought = state.discretionaryPurchases.Attributes[a.name] ?? 0;
      container.append(
        counterRow({
          name: a.name,
          get: () => state.attributes[a.name],
          set: (v) => {
            if (v > state.attributes[a.name]) buyAttributePoint(state, a.name);
            else refundAttributePoint(state, a.name);
          },
          min: state.attributes[a.name] - bought,
          max: () =>
            Math.min(
              data.attributeCap,
              state.attributes[a.name] + Math.floor(discretionaryRemaining(state, data) / rateAttr),
            ),
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
      );
    });

    // ---- Resources ----
    const rateRes = data.discretionaryRates.Resources;
    container.append(
      el('h3', {}, `Resources (${data.resourceLevelCost * rateRes} Discretionary/level)`),
    );
    data.resources.forEach((r) => {
      const bought = state.discretionaryPurchases.Resources[r.name] ?? 0;
      const unitCost = data.resourceLevelCost * rateRes;
      container.append(
        counterRow({
          name: r.name,
          get: () => state.resources[r.name],
          set: (v) => {
            if (v > state.resources[r.name]) buyResourceLevel(state, data, r.name);
            else refundResourceLevel(state, data, r.name);
          },
          min: state.resources[r.name] - bought,
          max: () =>
            Math.min(5, state.resources[r.name] + Math.floor(discretionaryRemaining(state, data) / unitCost)),
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
      );
    });

    // ---- Gifts (Level only; manage Adders/Limiters back on step 10) ----
    const rateGifts = data.discretionaryRates.Gifts;
    container.append(
      el('h3', {}, `Gift Levels (${rateGifts} Discretionary/point - manage Adders/Limiters on step 10)`),
    );
    data.gifts.forEach((gift) => {
      const gState = state.gifts.find((g) => g.name === gift.name);
      const level = gState?.level ?? 0;
      const bought = state.discretionaryPurchases.Gifts[gift.name] ?? 0;
      const perLevelPool = giftLevelCost(data, gState?.limiters.length ?? 0);
      const unitCost = perLevelPool * rateGifts;
      container.append(
        counterRow({
          name: gift.name,
          hint: `${unitCost} Discretionary/level`,
          get: () => level,
          set: (v) => {
            if (v > level) buyGiftLevel(state, gift.name);
            else refundGiftLevel(state, gift.name);
          },
          min: level - bought,
          max: () => Math.min(5, level + Math.floor(discretionaryRemaining(state, data) / unitCost)),
          onChange: () => {
            rerenderStep();
            rerenderPools();
          },
        }),
      );
    });

    // ---- Skills ----
    const rateSkills = data.discretionaryRates.Skills;
    container.append(el('h3', {}, `Skills (${rateSkills} Discretionary/tier)`));
    container.append(
      el('div', { class: 'field' }, [
        el('input', {
          type: 'text',
          placeholder: 'Filter skills...',
          onInput: (e) => {
            skillFilter = e.target.value.toLowerCase();
            renderSkillList();
          },
        }),
      ]),
    );
    const skillListEl = el('div', { class: 'pick-list' });
    container.appendChild(skillListEl);
    let skillFilter = '';

    function renderSkillList() {
      skillListEl.innerHTML = '';
      data.skillCatalog
        .filter((s) => s.name.toLowerCase().includes(skillFilter))
        .forEach((s) => {
          const bought = state.discretionaryPurchases.Skills[s.name] ?? 0;
          skillListEl.appendChild(
            counterRow({
              name: s.name,
              get: () => state.skills[s.name],
              set: (v) => {
                if (v > state.skills[s.name]) buySkillTier(state, s.name);
                else refundSkillTier(state, s.name);
              },
              min: state.skills[s.name] - bought,
              max: () =>
                Math.min(
                  5,
                  state.skills[s.name] + Math.floor(discretionaryRemaining(state, data) / rateSkills),
                ),
              format: (v) => skillTierName(data, v),
              onChange: () => {
                rerenderPools();
                summaryEl.textContent = summaryText();
                renderSkillList();
              },
            }),
          );
        });
    }
    renderSkillList();

    // ---- Boons ----
    const rateBoons = data.discretionaryRates.Boons;
    container.append(el('h3', {}, `Boons (${rateBoons}x Discretionary cost)`));
    renderBoonPicker(container, ctx, data.boons, {
      source: 'discretionary',
      getRemaining: () => discretionaryRemaining(state, data),
      toCurrency: (points) => points * rateBoons,
      currencyLabel: 'Discretionary',
    });
  },
};
