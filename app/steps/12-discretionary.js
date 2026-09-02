import { el, counterRow, renderMarkdown } from '../ui.js';
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
  buyDiscretionaryGiftAdder,
  refundDiscretionaryGiftAdder,
  giftLevelCost,
  skillTierName,
  unspentBoonsPoolPoints,
  unspentGiftsPoolPoints,
  fateTokenCap,
  fateTokensBuyable,
  startingFateTokens,
} from '../state.js';
import { renderBoonPicker } from './07-boons.js';

// A brief, always-visible reminder of what an item is, under its
// counterRow - distinct from the full-description twirls Gifts/Boons
// already have (those stay click-to-open; this is short enough to just show).
function briefDetail(text) {
  return el('p', { class: 'detail', style: 'color:var(--text-dim);font-size:0.85rem;margin:0 0 0.75rem;' }, text);
}

export default {
  id: 'discretionary',
  title: 'Discretionary Points',
  render(container, ctx) {
    const { state, data, rerenderStep, rerenderPools } = ctx;
    function summaryText() {
      const t = discretionaryTotal(state, data);
      const s = discretionaryPointsSpent(state, data);
      const r = discretionaryRemaining(state, data);
      const giftsLeftover = unspentGiftsPoolPoints(state, data);
      const giftsLeftoverPoints = giftsLeftover * data.giftsLeftoverRate;
      return `Base ${data.discretionaryBase} + ${flawsPointsGranted(state)} from Flaws + ${unspentBoonsPoolPoints(state, data)} unspent from Boons + ${giftsLeftoverPoints} unspent from Gifts (${giftsLeftover} pt${giftsLeftover === 1 ? '' : 's'} at ${data.giftsLeftoverRate}:1) = ${t} total. Spent: ${s}. Remaining: ${r}.`;
    }
    const summaryEl = el('p', {}, summaryText());

    container.append(
      el('h2', {}, 'Discretionary Points'),
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
        'Buy real Boons, Resources, Gifts, Skills, Attribute points, or Fate Tokens directly below, priced at the conversion rate.',
      ),
    );

    // A collapsed-by-default category - click its name to twirl the whole
    // section (every item inside it) open, same idea as the name-click
    // twirls elsewhere, just scoped to a whole section instead of one item.
    function section(titleText) {
      const details = el('details', { class: 'pick-card' });
      const content = el('div', { style: 'margin-top:0.75rem;' });
      details.append(el('summary', {}, titleText), content);
      container.appendChild(details);
      return content;
    }

    // ---- Fate Tokens (pure count, no separate item to pick) ----
    const rateFate = data.discretionaryRates['Fate Tokens'];
    const fateContent = section(`Fate Tokens (${rateFate} Discretionary/token)`);
    const fateBuyable = fateTokensBuyable(state, data);
    fateContent.append(
      briefDetail('Spent via Kotodama to assert a fact into the fiction directly - bend the world to make a claim true. See Fate Tokens.'),
      el(
        'p',
        { class: 'hint' },
        fateBuyable === 0
          ? `Stamina ${state.subStats.Stamina} caps you at ${fateTokenCap(state)} Fate Token${fateTokenCap(state) === 1 ? '' : 's'} (Stamina x 3), which the flat starting Token already covers. Raise Stamina first if you want more.`
          : `Holding ${startingFateTokens(state, data)} / ${fateTokenCap(state)} - Stamina x 3 caps how many Fate Tokens you can hold, so points spent past that buy nothing.`,
      ),
      counterRow({
        name: 'Extra Fate Tokens',
        get: () => state.discretionaryExtra['Fate Tokens'],
        set: (v) => {
          state.discretionaryExtra['Fate Tokens'] = v;
        },
        min: 0,
        // Two ceilings at once: what's affordable, and what Stamina lets the
        // character actually hold (rules/fate.md#holding-fate-tokens).
        max: () =>
          Math.min(
            state.discretionaryExtra['Fate Tokens'] + Math.floor(discretionaryRemaining(state, data) / rateFate),
            fateTokensBuyable(state, data),
          ),
        onChange: () => {
          rerenderStep();
          rerenderPools();
        },
      }),
    );

    // ---- Attributes ----
    const rateAttr = data.discretionaryRates.Attributes;
    const attrContent = section(`Attributes (${rateAttr} Discretionary/point)`);
    data.attributes.forEach((a) => {
      const bought = state.discretionaryPurchases.Attributes[a.name] ?? 0;
      attrContent.append(
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
        briefDetail(a.description),
      );
    });

    // ---- Resources ----
    const rateRes = data.discretionaryRates.Resources;
    const resContent = section(`Resources (${data.resourceLevelCost * rateRes} Discretionary/level)`);
    data.resources.forEach((r) => {
      const bought = state.discretionaryPurchases.Resources[r.name] ?? 0;
      const unitCost = data.resourceLevelCost * rateRes;
      resContent.append(
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
        briefDetail(r.scales),
      );
    });

    // ---- Gifts (Level, Adders, and Limiters, all from this one page) ----
    const rateGifts = data.discretionaryRates.Gifts;
    const giftsContent = section(`Gifts (${rateGifts} Discretionary/pool-point)`);
    data.gifts.forEach((gift) => {
      const gState = state.gifts.find((g) => g.name === gift.name);
      const level = gState?.level ?? 0;
      const bought = state.discretionaryPurchases.Gifts[gift.name] ?? 0;
      const perLevelPool = giftLevelCost(data, gState?.limiters.length ?? 0);
      const unitCost = perLevelPool * rateGifts;
      const card = el('details', { class: 'pick-card' });
      card.append(
        el('summary', {}, `${gift.name}${gift.flagged ? ' [flagged, not final]' : ''}`),
        el('div', { class: 'detail', html: renderMarkdown(gift.markdown) }),
      );
      giftsContent.appendChild(card);
      giftsContent.append(
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

      if (level > 0 || gState?.adders.length || gState?.limiters.length) {
        if (gift.adders.length) {
          const addersRow = el('div', { style: 'margin:0.25rem 0 0.5rem 0.5rem;' });
          gift.adders.forEach((adder) => {
            const owned = gState?.adders.includes(adder.name);
            const boughtHere = (state.discretionaryPurchases.GiftAdders[gift.name] ?? []).includes(adder.name);
            const adderCost = adder.points * rateGifts;
            addersRow.appendChild(
              el('div', { style: 'display:flex;gap:0.5rem;align-items:center;margin:0.15rem 0;font-size:0.85rem;' }, [
                el('span', {}, `${adder.name} (${adder.tier}, ${adderCost} Discretionary)${owned ? ' - owned' : ''}`),
                !owned
                  ? el('button', {
                      type: 'button',
                      text: 'Buy',
                      disabled: adderCost > discretionaryRemaining(state, data) ? '' : undefined,
                      onClick: () => {
                        buyDiscretionaryGiftAdder(state, gift.name, adder.name);
                        rerenderStep();
                        rerenderPools();
                      },
                    })
                  : null,
                owned && boughtHere
                  ? el('button', {
                      type: 'button',
                      text: 'Undo',
                      onClick: () => {
                        refundDiscretionaryGiftAdder(state, gift.name, adder.name);
                        rerenderStep();
                        rerenderPools();
                      },
                    })
                  : null,
              ]),
            );
          });
          giftsContent.appendChild(addersRow);
        }
        if (gift.limiters.length) {
          const limitersRow = el('div', { style: 'margin:0 0 1rem 0.5rem;' });
          gift.limiters.forEach((limiter) => {
            const checked = gState?.limiters.includes(limiter.name);
            limitersRow.appendChild(
              el('label', { style: 'display:block;font-size:0.85rem;' }, [
                el('input', {
                  type: 'checkbox',
                  checked: checked ? '' : undefined,
                  onChange: (e) => {
                    if (e.target.checked) gState.limiters.push(limiter.name);
                    else gState.limiters = gState.limiters.filter((l) => l !== limiter.name);
                    rerenderStep();
                    rerenderPools();
                  },
                }),
                ` ${limiter.name} (free, -1 pt/Level)`,
              ]),
            );
          });
          giftsContent.appendChild(limitersRow);
        }
      }
    });

    // ---- Skills ----
    const rateSkills = data.discretionaryRates.Skills;
    const skillsContent = section(`Skills (${rateSkills} Discretionary/tier)`);
    skillsContent.append(
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
    skillsContent.appendChild(skillListEl);
    let skillFilter = '';

    function renderSkillList() {
      skillListEl.innerHTML = '';
      data.skillCatalog
        .filter((s) => s.name.toLowerCase().includes(skillFilter))
        .forEach((s) => {
          const bought = state.discretionaryPurchases.Skills[s.name] ?? 0;
          const row = el('div', {});
          row.append(
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
            briefDetail(s.definition),
          );
          skillListEl.appendChild(row);
        });
    }
    renderSkillList();

    // ---- Boons ----
    const rateBoons = data.discretionaryRates.Boons;
    const boonsContent = section(`Boons (${rateBoons}x Discretionary cost)`);
    renderBoonPicker(boonsContent, ctx, data.boons, {
      source: 'discretionary',
      getRemaining: () => discretionaryRemaining(state, data),
      toCurrency: (points) => points * rateBoons,
      currencyLabel: 'Discretionary',
    });
  },
};
