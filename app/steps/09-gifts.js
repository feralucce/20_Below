import { el, counterRow, renderMarkdown, renderSelectedAvailable, describeBoxes } from '../ui.js';
import {
  describeFields, describePrompt, describePrompts, describeOptionSlots,
} from '../describe-spec.js';
import {
  setGiftNote,
  giftNotes,
  forcefieldForms,
  giftsPoolRemaining,
  giftLevelCost,
  giftPointsSpent,
  giftCheckTarget,
  computeFiguredCharacteristics,
  SIGNATURE_MOVE,
  ATTACK_SOURCES,
  ATTACK_WALLS,
  signatureMoves,
  setSignatureField,
  addSignatureMove,
  removeSignatureMove,
  adderCount,
  removeOneAdder,
  optionBlock,
} from '../state.js';

function getOrCreateGiftState(state, name) {
  let g = state.gifts.find((x) => x.name === name);
  if (!g) {
    g = { name, level: 0, adders: [], limiters: [] };
    state.gifts.push(g);
  }
  return g;
}

// The lists a describe slot can pick from. Only weapons so far, and
// only the entries that actually carry Damage - a first-aid kit is in
// the equipment tables too and is not something anyone conjures.
function catalogueFor(kind, data) {
  if (kind === 'forcefield-form') return { list: forcefieldForms(data), strict: true };
  if (kind !== 'weapons' || !data) return null;
  const names = [];
  (data.equipment || []).forEach((cat) => {
    cat.items.forEach((item) => {
      if (item.Damage && !names.includes(item.name)) names.push(item.name);
    });
  });
  return names.sort();
}

// The describe slots a Gift cannot do without. Only the first slot, and
// only when it is empty: this is a prompt made visible, not a value.
const PLACEHOLDER = { 'Conjured Armory': 'needs name' };

function fillPlaceholders(state, giftName) {
  const text = PLACEHOLDER[giftName];
  if (!text) return false;
  const g = state.gifts.find((x) => x.name === giftName);
  if (!g) return false;
  const notes = g.notes || (g.notes = []);
  if (notes[0]) return false;
  setGiftNote(state, giftName, 0, text);
  return true;
}

export default {
  id: 'gifts',
  title: 'Gifts',
  render(container, { state, data, rerenderStep, rerenderPools, persist }) {
    const remaining = giftsPoolRemaining(state, data);
    container.append(
      el('h2', {}, 'Gifts'),
      el('div', { class: 'detail', style: 'margin-bottom:1rem;', html: renderMarkdown(data.giftCheckText) }),
      el(
        'p',
        {},
        `Your Gift Check target is your current Ki: ${giftCheckTarget(state)} (max ${computeFiguredCharacteristics(state).Ki}).`,
      ),
      el(
        'p',
        {},
        `Each Gift Level costs a flat ${data.giftLevelCost} points from a ${data.giftsPoolTotal}-point pool (Limiters reduce this per-Gift, floored at 1). Remaining: ${remaining}. Anything left unspent converts into Discretionary points (the Discretionary Points step) at ${data.giftsLeftoverRate}:1.`,
      ),
    );

    function counterCfg(gift) {
      const gState = getOrCreateGiftState(state, gift.name);
      const perLevel = giftLevelCost(data, gState.limiters.length);
      return {
        name: `${gift.name}${gift.flagged ? ' [flagged, not final]' : ''}`,
        hint: `${perLevel} pts/level, ${giftPointsSpent(gState, data)} pts spent`,
        get: () => gState.level,
        set: (v) => {
          gState.level = v;
          // A slot that has to be filled in before the sheet can say
          // anything is a slot that should say so on the sheet. Taking
          // the Gift writes the placeholder; typing over it is the whole
          // interaction, and leaving it still leaves a playable row.
          if (v > 0) fillPlaceholders(state, gift.name);
        },
        min: 0,
        max: () => Math.min(5, gState.level + Math.floor(remaining / perLevel)),
        onChange: () => {
          rerenderStep();
          rerenderPools();
        },
      };
    }

    // Adders/limiters checkboxes, plus the "see Gift Menus" note and the
    // Gift's full writeup - twirled out (both Available and Selected) by
    // clicking the Gift's name.
    function detailFor(gift) {
      const gState = getOrCreateGiftState(state, gift.name);
      const wrap = el('div', {});
      if (gift.adders.length) {
        const addersRow = el('div', { style: 'margin:0.25rem 0 0.5rem 0.5rem;' });
        gift.adders.forEach((adder) => {
          // A repeatable Adder is a count, not a tick: each purchase is one
          // more entry (Roll Call's roster grows by one soul per purchase).
          if (adder.repeatable) {
            // The same counter the Gift Levels use, so it looks and behaves
            // like every other count in the creator. The cap is what the pool
            // can still pay for.
            addersRow.appendChild(counterRow({
              name: adder.name,
              hint: `${adder.tier}, ${adder.points} pts each, can be bought more than once${adderCount(gState, adder.name) === 0 && optionBlock(gState, adder) ? ` - ${optionBlock(gState, adder)}` : ''}`,
              get: () => adderCount(gState, adder.name),
              set: (v) => {
                while (adderCount(gState, adder.name) < v) gState.adders.push(adder.name);
                while (adderCount(gState, adder.name) > v) removeOneAdder(gState, adder.name);
              },
              min: 0,
              max: () => (adderCount(gState, adder.name) === 0 && optionBlock(gState, adder)
                ? 0
                : adderCount(gState, adder.name) + Math.floor(remaining / adder.points)),
              onChange: () => { rerenderStep(); rerenderPools(); },
            }));
            return;
          }
          const checked = gState.adders.includes(adder.name);
          // Same guard the Level counter has: nothing the pool can't pay for.
          const cantAfford = !checked && adder.points > remaining;
          // Contradicts something already chosen, or needs a Level or Adder first.
          const blocked = !checked && optionBlock(gState, adder);
          addersRow.appendChild(
            el('label', { style: 'display:block;font-size:0.85rem;' }, [
              el('input', {
                type: 'checkbox',
                checked: checked ? '' : undefined,
                disabled: cantAfford || blocked ? '' : undefined,
                onChange: (e) => {
                  if (e.target.checked) gState.adders.push(adder.name);
                  else gState.adders = gState.adders.filter((a) => a !== adder.name);
                  rerenderStep();
                  rerenderPools();
                },
              }),
              ` ${adder.name} (${adder.tier}, ${adder.points} pts)${blocked ? ` - ${blocked}` : ''}`,
            ]),
          );
        });
        wrap.appendChild(addersRow);
      }
      if (gift.limiters.length) {
        const limitersRow = el('div', { style: 'margin:0 0 0.5rem 0.5rem;' });
        gift.limiters.forEach((limiter) => {
          const checked = gState.limiters.includes(limiter.name);
          // Dropping a Limiter raises the price of every Level already
          // bought, so it is blocked when the pool can't cover the rise.
          const rise = gState.level * (giftLevelCost(data, gState.limiters.length - 1) - giftLevelCost(data, gState.limiters.length));
          const cantDrop = checked && rise > remaining;
          const blockedL = !checked && optionBlock(gState, limiter);
          limitersRow.appendChild(
            el('label', { style: 'display:block;font-size:0.85rem;' }, [
              el('input', {
                type: 'checkbox',
                checked: checked ? '' : undefined,
                disabled: cantDrop || blockedL ? '' : undefined,
                onChange: (e) => {
                  if (e.target.checked) gState.limiters.push(limiter.name);
                  else gState.limiters = gState.limiters.filter((l) => l !== limiter.name);
                  rerenderStep();
                  rerenderPools();
                },
              }),
              ` ${limiter.name} (-1 pt/Level)${blockedL ? ` - ${blockedL}` : ''}`,
            ]),
          );
        });
        wrap.appendChild(limitersRow);
      }
      // Signature Move is built at purchase: which sub-stat powers it,
      // which wall it resolves against, and what it actually looks like.
      // Nothing here touches pool maths, so none of it re-renders the
      // step - a rerender mid-sentence would take the textarea's focus
      // with it.
      // A character can hold more than one Signature Move, and each is its
      // own purchase - own name, own Levels, own source and wall. The Gift's
      // counter is the sum, so the pool charges for all of them.
      if (gift.name === SIGNATURE_MOVE) {
        const moves = signatureMoves(gState);
        const sig = el('div', { style: 'margin:0.25rem 0 0.75rem 0;' }, [
          el('p', { class: 'hint', style: 'margin:0 0 0.4rem 0.5rem;' },
            'Each Move is bought separately - its own Levels, its own name. '
            + 'The source and the wall never have to match.'),
        ]);

        const pick = (i, label, field, options, hint, value) =>
          el('label', { style: 'display:block;margin:0.35rem 0 0;font-size:0.85rem;' }, [
            `${label} `,
            el(
              'select',
              { onChange: (e) => setSignatureField(state, i, field, e.target.value) },
              ['', ...options].map((o) =>
                el('option', {
                  value: o,
                  selected: value === o ? '' : undefined,
                  text: o || `- ${hint} -`,
                }),
              ),
            ),
          ]);

        moves.forEach((mv, i) => {
          sig.appendChild(el('div', {
            style: 'margin:0.5rem 0 0 0.5rem;padding:0.5rem;'
              + 'border-left:3px solid var(--accent,#3d84c4);',
          }, [
            el('label', { style: 'display:block;font-size:0.85rem;' }, [
              'Name ',
              el('input', {
                type: 'text',
                value: mv.name,
                placeholder: 'What do you call it?',
                onInput: (e) => setSignatureField(state, i, 'name', e.target.value),
              }),
            ]),
            el('label', { style: 'display:block;margin-top:0.35rem;font-size:0.85rem;' }, [
              'Level ',
              el(
                'select',
                {
                  onChange: (e) => {
                    setSignatureField(state, i, 'level', Number(e.target.value));
                    rerenderStep();
                    rerenderPools();
                  },
                },
                [1, 2, 3, 4, 5].map((n) =>
                  el('option', { value: String(n), selected: mv.level === n ? '' : undefined, text: String(n) })),
              ),
            ]),
            pick(i, 'Powered by', 'source', ATTACK_SOURCES, 'attack source', mv.source),
            pick(i, 'Resolves against', 'wall', ATTACK_WALLS, 'target wall', mv.wall),
            el('label', { style: 'display:block;margin-top:0.4rem;font-size:0.85rem;' }, [
              'What it looks like',
              el('textarea', {
                rows: 3,
                style: 'display:block;width:100%;margin-top:0.2rem;',
                text: mv.description,
                placeholder: 'Say what happens when you use it.',
                onInput: (e) => setSignatureField(state, i, 'description', e.target.value),
              }),
            ]),
            el('button', {
              type: 'button',
              style: 'margin-top:0.4rem;font-size:0.8rem;',
              text: 'Remove this Move',
              onClick: () => { removeSignatureMove(state, i); rerenderStep(); rerenderPools(); },
            }),
          ]));
        });

        sig.appendChild(el('button', {
          type: 'button',
          style: 'margin:0.5rem 0 0 0.5rem;',
          text: moves.length ? 'Add another Move' : 'Add a Signature Move',
          onClick: () => { addSignatureMove(state); rerenderStep(); rerenderPools(); },
        }));
        wrap.appendChild(sig);
      }
      if (gift.menu) {
        wrap.appendChild(el('p', { class: 'hint' }, 'No standard Level table for this Gift - see Gift Menus.'));
      }
      wrap.appendChild(el('div', { class: 'detail', html: renderMarkdown(gift.markdown) }));
      return wrap;
    }

    // Name + counter, click the name to twirl the entire detail out
    // (adders/limiters, then the full description) - same in both the
    // Selected and Available lists.
    function renderCard(gift) {
      const card = el('div', { class: 'pick-card' });
      card.append(counterRow({ ...counterCfg(gift), key: `gift:${gift.name}`, detail: detailFor(gift) }));
      // Only once a Level is taken, and only for the Gifts that actually
      // ask for something - see app/describe-spec.js.
      const giftState = getOrCreateGiftState(state, gift.name);
      const fields = giftState.level > 0
        ? describeFields('gift', gift.name, giftState) : 0;
      // Builds made before the Gift asked this question have an empty
      // slot and no way to know it matters, so the placeholder goes in
      // on the way past rather than only when a Level is bought.
      if (fields && giftState.level > 0 && fillPlaceholders(state, gift.name)) persist?.();
      if (fields) {
        card.append(describeBoxes({
          count: fields,
          prompt: describePrompt('gift', gift.name),
          prompts: describePrompts('gift', gift.name),
          notes: giftNotes(giftState),
          optionsFor: (slot) => catalogueFor(describeOptionSlots('gift', gift.name)?.[slot], data),
          onChange: (slot, value) => {
            setGiftNote(state, gift.name, slot, value);
            persist?.();
          },
        }));
      }
      return card;
    }

    renderSelectedAvailable(container, {
      label: 'Gifts',
      getItems: () => data.gifts,
      isSelected: (gift) => getOrCreateGiftState(state, gift.name).level > 0,
      renderCard,
    });
  },
};
