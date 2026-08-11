# Combat

## Combat Order

1. **Initiative** — rolled **once at the start of combat**, not re-rolled each round: **1d10 + Initiative** (sub-stat). Higher total acts first. This base order holds for the whole fight.
2. **Declare Action Band** — each character declares which of the three bands they're acting in this round: **Fast**, **Normal**, or **Slow** (see below).
3. **Resolve band by band** — all **Fast**-band characters act first, then all **Normal**-band characters, then all **Slow**-band characters. Within each band, characters act in Initiative order.

### Action Bands

| Band | Also called | Actions | Notes |
|---|---|---|---|
| **Fast** | Reactive | One action | A snap shot, a move, a single Skill use. Acts first, but only gets the one action. |
| **Normal** | Active | Two actions | E.g. a move and an attack. Acts second. |
| **Slow** | Measured | One action, with concentration | Acts last, but the single action is empowered: allows called shots, grants **Advantage** on the attack, and (once magic exists) all spellcasting is always a Slow action. |

The tradeoff across all three: **Fast trades action count for going first**, **Normal is the balanced middle (two actions, middling position)**, **Slow trades speed for a single, more powerful, concentrated action**.

A player can spend **1 Ki per step** to bump their declared band up (Slow → Normal, or Normal → Fast) — buying back speed at the cost of the resource. Spending 2 Ki moves two steps at once (Slow → Fast).

### Movement & Range

**Range Bands**: four abstract bands — **Melee, Close, Near, Far** — used for weapon reach, targeting, and spotting. The GM assigns them loosely per scene rather than measuring a map; no grid.

**Movement Rate**: `5 + Air`, in **meters** — the same flat-floor-plus-Attribute shape as [Health Levels](core-mechanic.md#health-levels). A character can move up to their Movement Rate as part of a Fast action's one action or a Normal action's move component. As a rough conversion (not a strict count), **spending a full Movement Rate shifts one Range Band**; the GM can also just narrate a shift directly when the fiction obviously calls for it, without making players do the math.

### Distracted

A character who loses a Health Level or is the target of a Kotodama effect while resolving a **Slow** Action Band action becomes **Distracted**, and must roll **Warp + Difficulty** to hold focus.

- **Success** — the action resolves as declared.
- **Failure** — the action downgrades to a **Normal** action (loses the called-shot/Advantage benefit).

**Other sources can impose Distracted too** — a Gift, an environmental hazard (a collapsing building, a deafening explosion), or GM fiat, whether or not a Slow action is involved. The same **Warp + Difficulty** roll applies; outside a Slow action, failure instead imposes **Disadvantage** on the triggering roll. [Concentration](boons.md) grants immunity to being Distracted regardless of source.

### Surprise

A character who hasn't noticed a threat before combat begins is **Surprised** — typically because an opposing Stealth roll succeeded against their Perception, or the GM judges the fiction warrants it.

**A Surprised character rolls at Disadvantage on everything** — attacks, and any other roll where the defender's readiness matters — for the remainder of the round they're caught in. Ends automatically once that round ends. [Alertness](boons.md) grants immunity to being Surprised while conscious.

