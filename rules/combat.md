# Combat

## Combat Order

**Revised 2026-07-22**, replacing the earlier "declare intent slowest-to-fastest, act fastest-to-slowest" structure with three **Action Bands**:

1. **Initiative** — rolled **once at the start of combat**, not re-rolled each round: **1d10 + Initiative** (sub-stat). **Confirmed: higher total acts first** — a deliberate departure from the roll-under convention used everywhere else, kept simple specifically for this roll. This base order holds for the whole fight.
   - **At any point during combat**, a player may spend a Fate Token to move their character **up one step** in the order **for that turn only** — next turn, they settle back to their original rolled position. No pre-roll Advantage option (scrapped — didn't fit a single d10 roll cleanly).
2. **Declare Action Band** — each character declares which of the three bands they're acting in this round: **Fast**, **Normal**, or **Slow** (see below).
3. **Resolve band by band** — all **Fast**-band characters act first, then all **Normal**-band characters, then all **Slow**-band characters. Within each band, characters act in Initiative order.

### Action Bands

| Band | Also called | Actions | Notes |
|---|---|---|---|
| **Fast** | Reactive | One action | A snap shot, a move, a single Skill use. Acts first, but only gets the one action. |
| **Normal** | Active | Two actions | E.g. a move and an attack. Acts second. |
| **Slow** | Measured | One action, with concentration | Acts last, but the single action is empowered: allows called shots, grants **Advantage** on the attack, and (once magic exists) all spellcasting is always a Slow action. |

The tradeoff across all three: **Fast trades action count for going first**, **Normal is the balanced middle (two actions, middling position)**, **Slow trades speed for a single, more powerful, concentrated action**.

A player can spend **1 Fate Token per step** to bump their declared band up (Slow → Normal, or Normal → Fast) — buying back speed at the cost of the resource. Spending 2 Fate Tokens moves two steps at once (Slow → Fast). See [fate.md](fate.md#fate-spend).

### Interrupted Plans

Carried forward from the earlier version, adapted to bands: if something that happens during an earlier band's turn **eliminates a not-yet-acted character's plan** (e.g. their intended target is removed before their band goes), that character gets a **reactive roll** — the specific Skill/Attribute pairing and Difficulty are still TBD, but it defaults to **average Difficulty**.

- **Success** — the character forms a **new plan** and acts normally when their band comes up.
- **Failure** — the character forms a **new plan** but acts at **Disadvantage** (see [Advantage/Disadvantage](core-mechanic.md#advantage--disadvantage)).

Open questions and everything else about combat (initiative mechanics, the reactive roll's exact Skill/Attribute/Difficulty, damage application, death/incapacitation) are tracked in [design-log.md](../docs/design-log.md#open-questions).
