# Character Creation & Advancement — Overview

## Philosophy

Point-based build, no classes or levels. Players build exactly what they want at creation, and advance exactly how they want afterward — there's no fixed progression track.

- **Creation**: characters are built in a fixed order, across five separate currencies — see [Creation Order](#creation-order--confirmed) below.
- **Advancement**: after creation, characters improve by spending **XP directly** — XP is not banked into levels or tied to a class chart, it's spent one purchase at a time on whatever the player wants to improve (raise a Skill, buy a specialty, raise an Attribute, pick up a Perk or Gift), subject to GM approval and any in-fiction justification the system ends up requiring.

This is the same paradigm both at creation and during play — the only difference is the currency (build points up front, XP afterward) and that advancement purchases may need narrative justification (training, practice, a relevant experience in-fiction) at the GM's discretion.

## Creation Order — confirmed

**Resolved 2026-07-14**: character creation proceeds through a fixed sequence, in this order:

1. **Attributes** — spent from a dedicated Attribute point pool. Each point invested also grants an [Attribute Descriptor](../rules/core-mechanic.md#descriptors--confirmed) (a player-chosen flavor word/phrase — see that section).
2. **Skills** — spent from a dedicated Skill point pool.
3. **Perks** — spent from a dedicated Perk point pool.
4. **Gifts** — spent from a dedicated Gift point pool.
5. **Flaws** — chosen last among the "acquiring" steps. Taking a Flaw doesn't cost anything; it **grants Freebie Points** instead (see [flaws.md](../rules/flaws.md)).
6. **Spend Freebies** — the Freebie Points earned from step 5 are spent last, as a final flexible top-up pass.

**The four dedicated pools (Attributes/Skills/Perks/Gifts) are siloed**: points from the Attribute pool can only buy Attributes, Skill pool points can only buy Skills, and so on — nothing carries over or converts between them. **Freebie Points are the exception, confirmed 2026-07-14** — the flexible currency, spent last, usable across all four categories at the per-category rates set out in [Step 6](#calibration) below.

## Resolves

- **Specialty purchases** ([skills.md](../rules/skills.md)): extra specialties beyond the automatic ones (rank 6/8/10) are bought with XP directly, same as any other advancement purchase. Exact XP cost TBD.
- **Point cost per rank for the four dedicated pools, confirmed flat** (2026-07-14): **1 pool point = 1 rank**, for Attributes, Skills, Perks, and Gifts alike. No scaling curve within a pool (a Body 1→2 purchase costs the same 1 point as a Body 9→10 purchase). This still leaves **pool size** itself open — see below.

## Calibration

**Step 1 (2026-07-14): what raw target number represents "average human, average task"?** Needed before pool sizes can be set, since pool size is meaningless without knowing what a point actually buys in success-rate terms. Both D&D and Hero System peg **10 as the average human stat**, so that's the anchor — the question is what a target number on *our* d20-roll-under scale (where target/20 = success%, since the die and the scale are both 1-20) needs to be to represent the same baseline.

Three reference conversions:

| Source | Convention | Average-human success rate | Equivalent raw target (× 20) |
|---|---|---|---|
| **D&D, classic ability check** (0e/1e/B-X: roll d20, succeed if ≤ ability score) | Structurally **identical** to our own roll-under-d20 mechanic — no conversion needed | Ability score 10 → 10/20 | **10** |
| **D&D 5e, DC-based** | d20 + modifier (+0 at score 10) vs. DC 10 ("Easy," the DMG's guideline for a task an average person handles) | Need to roll 10+ → 11/20 | **55%** → **11** |
| **Hero System** | 3d6 roll-under `9 + (Characteristic ÷ 5)`; Characteristic 10 → target 11- | P(3d6 ≤ 11) = 135/216 | **62.5%** → **12.5**, round to **~13** |

**Recommendation: target number 10** as the working "average human, average task" baseline. It's the low end of the 10-13 range the three conventions produce, but it's the cleanest and most structurally honest comparison — the classic D&D ability check uses the *exact same mechanic* we do (roll-under d20 against a 1-20ish human stat), so it converts with zero interpretation needed, unlike the DC-based or 3d6 conversions which both require translating across a different die/comparison shape first. It also has a pleasing property for this system specifically: an average stat of 10 producing a target of 10 means **the human baseline carries over numerically unchanged** — easy to sanity-check at the table.

**Step 2 (2026-07-14): Attribute pool size, confirmed.** **10 points**, with Body/Mind/Soul each **starting at 1** (free floor, not paid from the pool) — a maximum distributable total of **13** across the three Attributes (10 pool + 3 free floor).

This lands deliberately **short of "all three average"**: if Average = 5 (the midpoint this system's 1-10 scale, and the value that reproduces the raw-target-10 baseline from Step 1 when paired with an average Skill — 5 + 5 = 10), then 5+5+5 = 15, which **exceeds** the 13-point maximum. A flat, all-average build is arithmetically impossible under this pool — a character must run above average in at least one Attribute and below in at least one other (or some other uneven split) to spend the full pool. This directly reproduces the "one above, one average, one below — or two above, one abysmal" shape from the original goal, without needing separate hardcoded tiers: the budget itself forces the tradeoff.

**No separate starting-creation cap on individual Attributes** (2026-07-14): unlike WoD's explicit "max 3 dots at creation" rule (the reference point that originally prompted this whole calibration pass), this system deliberately does **not** impose a second ceiling below the Attribute's normal 1-10 range. The only bounds are the universal **min 1, max 10** scale itself, plus whatever the 10-point pool can actually afford — a player could dump 9 of their 10 points into a single Attribute (1→10, maxed) and split the last point elsewhere, if that's the build they want. The pool size is the real constraint; it doesn't need a redundant cap on top of it.

**Attribute pool size is resolved.** Skill/Perk/Gift pool sizes are still open.

**Step 3 (2026-07-14): Skill pool size, confirmed.** **35 points.** Derived by surveying the same source list used for [premade-skills.md](../rules/premade-skills.md) for two comparable data points despite their very different skill economies (dots vs. percentiles vs. skill points):

| Source | Starting skill investment |
|---|---|
| OWoD | 27 dots total (13/9/5 priority split), capped at 3 of a max-5 scale (60%) at creation |
| Call of Cthulhu 7e | Occupation points (≈ EDU×20) spread across ~8 occupation skills, typically reaching 40-70% |
| Pathfinder 1e | 2-8 points/level, landing ranks in ~6-8 skills at low levels |
| Hero System | A deliberate minority of build points, typically 5-10 selected skills |
| Exalted | Ability dots spread across ~8-12 abilities with real investment |

Two consistent patterns: a starting/competent character has real investment in roughly **8-10 skills**, and their "good" skills sit around **60-67% of that system's starting cap** (not the absolute ceiling — that's earned later). Applied to this system's **6-point creation cap** (not the system-wide max of 10, per [skills.md](../rules/skills.md#scoring--confirmed)): a "slightly above average" character invests in **9 skills** at an average rank of **4** (67% of 6) → **9 × 4 = 36**, cross-checked against OWoD's 27 dots scaled by the ratio of creation caps (6 ÷ 5 = 1.2) → **27 × 1.2 = 32**. Both land in the low-to-mid 30s; **35** was chosen as the final number to keep the system's existing **1/3/5/10 numeric convention** (flat modifiers ±1-5, Gift levels 1-5, Power Level/Attributes 1-10) rather than landing on an arbitrary in-between value.

**Skill pool size is resolved.** Perk/Gift pool sizes are still open.

**Step 4 (2026-07-14): Perk pool size, confirmed.** **10 points.** Individual Perk costs aren't set yet — [perks.md](../rules/perks.md#resolved) already established that cost scales with a Perk's strength rather than being flat/uniform, but the exact per-Perk numbers are deferred to a later pass. The pool size is fixed regardless of those numbers; it just bounds the total a character can spend on Perks at creation.

**Perk pool size is resolved.** Individual Perk costs and Gift pool size are still open.

**Step 5 (2026-07-14): Gift pool size, confirmed.** **8 points.** Checked against the same family of sources, narrowed this time to the systems with a **dotted 1-5 supernatural power scale** — the closest structural analog to Gifts' own 5-level design, rather than the full premade-gifts.md source list (Hero System's point-buy and Exalted's per-Charm-pick structures don't reduce to a comparable "dots at creation" number):

| Source | Starting power-dot budget | Relevance |
|---|---|---|
| **OWoD Mage: the Ascension** | **5 dots** across Spheres at creation (plus Arete starting at 1) | The **direct acknowledged inspiration** for this system's own Power Level/Gift Level split (see [gifts.md](../rules/gifts.md#resolution)) — Arete governs raw potency the way Power Level does here, Spheres gate *what's possible* the way Gift Levels do. The single most relevant comparison. |
| **OWoD Vampire** | 3 dots in Disciplines at creation | Lower budget, reflecting a "just Embraced" starting power level — this system isn't going for that low a floor (consistent with the Attribute/Skill pools already being more generous than their WoD equivalents). |
| **OWoD Changeling** | ~5 dots combined across Arts/Realms | Similar range to Mage. |

An 8-point Gift pool is **1.6× Mage's 5-dot baseline** — inside the same generosity range this system has already used relative to WoD elsewhere (Attribute pool is ~3.3× WoD's starting Attribute cap, Skill pool ~1.3× WoD's starting dot total), so 8 is consistent with the pattern rather than an outlier.

**Confirms the specialization/generalization claim mathematically.** Gift-level cost at character creation is now confirmed **flat 1:1** (see [gifts.md](../rules/gifts.md#resolved)), matching every other pool. Since max Gift Level is 5, 8 points supports **one maxed Gift (5) plus a solid secondary (3)** on the specialist end, or **up to 4 Gifts at Level 2 each** (or thinner spreads, e.g. up to 8 different Gifts at Level 1) on the generalist end — a real spectrum between depth and breadth, confirmed rather than assumed.

**Gift pool size and creation-time cost are both resolved.** Individual Perk costs and the XP cost to raise a Gift level after creation are still open.

**Step 6 (2026-07-14): Freebie Points, confirmed.** A **starting pool of 15**, granted automatically regardless of Flaws taken — matching OWoD's own classic (Revised-edition) Freebie allotment, since the per-category costs below are also a direct import of OWoD's ratio. Flaws **add to** this pool on top (see below); Freebies aren't Flaw-gated the way the four dedicated pools are creation-order-gated.

| Category | Cost per level (Freebies) | Cap via Freebies |
|---|---|---|
| Attribute | **7** | Max 2 levels (14 Freebies) |
| Skill | **1** | None beyond the normal 6-point creation cap |
| Perk | **3** | None stated |
| Gift | **5** | Max 3 levels (15 Freebies) |

**Notable interaction**: the 15-point baseline is just barely enough to hit *either* the Attribute cap (14, leaving 1 spare) *or* the Gift cap (exactly 15, leaving nothing) on its own — not both. Reaching both caps, or reaching either cap while still having Freebies left for Skills/Perks, requires additional Freebies from Flaws.

**Flaws grant Freebies on top of the 15 baseline**: non-Leveled Flaws grant **1-7 Freebies** (OWoD's own severity range, GM/player negotiated per Flaw based on how much it actually constrains the character in play), and the 3 Leveled (Resource) Flaws grant **2 × the Flaw's level** (a level-3 Enemy grants 6 Freebies).

**Character creation is now fully resolved.** Everything below is Advancement (XP economy) — tracked separately in [docs/TODO.md](../docs/TODO.md#advancement-xp-economy--character-progression-post-creation), not repeated here.

## Open Questions

None remaining for character creation itself. See the Advancement TODO for what's still open on the XP side (per-rank cost, how XP is earned, justification requirement, Specialty cost, and the after-creation Gift-level cost curve).

## Resolved (creation-specific, not already covered above)

- **Individual Perk costs within the dedicated Perk pool** (2026-07-14): a 3-tier system (Minor 1 / Moderate 2 / Major 3 points), plus flat 1 point per level for the 7 Leveled (Resource) Perks. See [perks.md](../rules/perks.md#resolved).
- **No Attribute Descriptor reassignment, but extra ones are purchasable** (2026-07-14): Descriptors are free at creation (one per Attribute point) and **fixed once chosen** — no drifting away from one later. Post-creation, a character can buy an **additional** Descriptor on an Attribute they already have, as its own XP purchase priced below a full Attribute raise — more versatility without the exorbitant cost of raising the underlying score. Exact XP cost is an Advancement-economy question. See [core-mechanic.md](../rules/core-mechanic.md#descriptors--confirmed).
