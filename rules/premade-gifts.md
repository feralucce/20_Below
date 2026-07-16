# Premade Gifts

A fully worked catalog for [gifts.md](gifts.md): every Gift a player can take, organized by
category.

Every Gift below has all **5 levels** defined per [gifts.md](gifts.md): cumulative,
sequential, each level a specific new capability rather than a bigger number. These are
starting points, not commandments — a player and GM can still adjust wording to fit a
specific character or setting.

**Detail pass complete (2026-07-15).** Every Gift level below now carries five mechanical columns alongside its flavor text — Action cost, Range, Duration, and Resolution (Power Level + Attribute vs. the target's Resolve by default, or a full Resisted Roll where flagged, resolving the [Resisted-Roll-vs-Resolve triage](gifts.md#open-questions) per-Gift as part of this pass rather than as a separate future one). Resonance's activation cost is deliberately *not* pinned to a number in the tables below — it's referenced generically as "per the Gift's Level" in [core-mechanic.md](core-mechanic.md#gift-activation-cost--in-playtesting), since that formula is still being playtested; once it's locked, it applies uniformly rather than needing a second pass through every entry here.

**Concrete-mechanics pass complete (2026-07-16).** Every Gift level now carries a bolded, named sub-ability plus a real mechanic drawn from the system's own vocabulary (DoS/DoF bonus-penalty steps, Advantage/Disadvantage, Resisted Rolls, Health Levels, the Weapon Base damage table) instead of narrative-only prose. See [flavor-writing-style.md](../docs/flavor-writing-style.md) for the ruleset that governed this pass, and [gift-review-progress.md](../docs/gift-review-progress.md) for the full log of merges, overlap checks, and design decisions made along the way.

**Reorganized (2026-07-16):** all Gifts now live in one flat set of categories, alphabetized by category name and by Gift name within each category.

## Cybernetics — Note

**Removed 2026-07-15**: the sole cybernetics entry, *Grafted Steel*, was cut from the catalog. Cybernetics currently has **no representation** in the Gift catalog, and is **deliberately deferred to a future expansion** rather than tracked as a near-term open item. When it's picked back up, it still carries the same open question flagged before removal — whether it needs its own acquisition rules (surgery, cost, installation risk) rather than the standard Gift creation process, since it's typically bought and installed rather than trained or awakened into. See [gifts.md](gifts.md#deferred--future-expansion).

## Gift Catalog

### Biological & Shapeshifting

#### Adaptive Flesh (environmental adaptation)
Your body treats hostile environments as a problem to be solved, not a threat to be endured. It quietly reshapes itself to whatever the moment demands.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Early Warning.** You can't be caught unaware by an environmental hazard, cold, gas, unstable ground, radiation, whatever the source. If you're about to walk into one without knowing it's there, you sense it in time to stop before you do. This is scoped to environmental hazards specifically — it doesn't grant immunity to Surprise from an ambush or other combat threat. | Free | Self | Instant | — (no roll, passive) |
| 2 | **Rolls Off You.** A chill that should ache, a fume that should sting: a mild hazard leaves no mark on you at all. | Free | Self | Scene | — (no roll, passive) |
| 3 | **Adjusted.** Take a moment to let your body adjust, and it holds, geared for one specific hostile environment for as long as the scene demands. | Action | Self | Scene | Power Level + Body |
| 4 | **Comfortable, Not Surviving.** Deep cold, crushing pressure, a lungful of poison air: genuinely dangerous conditions, and you're comfortable in them. | Free | Self | Scene | — (no roll, passive) |
| 5 | **Reshaped and Ready.** Given a moment to prepare, there's almost no environment your body can't be reshaped to survive. | Action | Self | Scene | Power Level + Body |

#### Many Shapes
You have an affinity for animals. You have learned how they move and think. Years of observation have given you the ability to take on aspects and forms of the animals you have studied.

*Note: shapeshifting is this Gift's whole domain — the old separate "Skin of the Beast" entry was merged into it 2026-07-16, since the two covered near-identical ground.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Beast's Senses.** Choose one animal when you take this Gift — your first. Gain Advantage on any perception roll matching that animal's signature sense (a wolf's scent-tracking, an owl's night vision, a spider's vibration-sense). | Free | Self | Scene | — (no roll, passive) |
| 2 | **Partial Shift.** Choose a second animal you've studied (you now know 2 total). Spend **1 Resonance** to shift one body part at a time into a feature drawn from an animal you know: claws, a tail, webbed hands, toughened hide. If the shifted part is offensive (claws, fangs), it deals damage as an Improvised weapon (**Base +2**). | Action | Self | Scene | — (no roll, passive) |
| 3 | **The Bonded Shape.** Choose a third animal (3 known). Spend **1 Resonance** to fully transform into one animal you know: its full profile, natural weapons (claws, bite) dealing damage as a Light weapon (**Base +3**), its natural movement mode (swim, climb, and so on). Your own mind stays in control. | Action | Self | Scene | — (no roll, passive) |
| 4 | **Any Beast.** Choose a fourth animal (4 known). The Bonded Shape's cost and effect are unchanged, but the shift is now nearly instant, and for the scene's duration you can lend a partial trait (claws, senses, a burst of speed) to an ally by touch at no extra cost. | Free | Self (or Touch, to share) | Scene | — (no roll, passive) |
| 5 | **War-Form.** Choose a fifth animal (5 known, your full roster). Spend **3 Resonance** for a hybrid form blending traits from up to three animals you know at once. Natural weapon damage rises to **Base +6**. | Action | Self | Scene | — (no roll, passive) |

#### Mimic's Gift
**Reframed 2026-07-16** from physical trait mimicry (which overlapped with [Many Shapes](#many-shapes)) to ability mimicry. Watch someone closely enough, and what makes them exceptional becomes borrowable. Not their body. Whatever it is that actually makes the trick work.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Borrowed Trait.** Watch a target use a Skill, then use that same Skill yourself for the scene, at your own Power Level instead of theirs. Costs **1 Resonance**. | Action | Close | Scene | Power Level + Soul |
| 2 | **Something Functional.** Watch a target's Perk in action, then gain that Perk's benefit yourself for the scene. Costs **1 Resonance**. | Action | Close | Scene | Power Level + Soul |
| 3 | **The Trick of It.** Watch a target use a Gift, then mimic its **Level 1** capability for the scene. If it's offensive, it deals damage as a Light weapon (**Base +3**). Costs **2 Resonance**. | Action | Close | Scene | Power Level + Soul |
| 4 | **It Sticks.** The mimicked Gift capability can now go as high as **Level 3**, and lasts a full day. Costs **3 Resonance**. | Action | Close | Day | Power Level + Soul |
| 5 | **Nothing Held Back.** Mimic a Gift capability up to its full **Level 5**, or hold a Skill, a Perk, and a Gift capability all mimicked at once, for a full day. Costs **5 Resonance**. | Action | Close | Day | Power Level + Soul |

#### Regeneration
**Renamed from "Living Mend," 2026-07-16.** Damage that should linger on you instead gets treated like an inconvenience. Your body works to undo harm at a pace nothing ordinary can match. (For a body that simply doesn't go down or break in the first place, see [Bulwark](#bulwark-damage-resistance--toughness) instead.)

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Stable, and Topped Off.** If you'd drop to Incapacitated, you stabilize at Suffering instead, once per scene, automatically. Spend **1 Resonance** to refill your current Health Level's container back to full. | Free | Self | Instant | — (no roll, passive) |
| 2 | **A Level Regained.** Spend **1 Resonance** to recover a full Health Level outright, not just top off the container. | Free | Self | Instant | — (no roll, passive) |
| 3 | **It Just Closes.** Lost HP in your current Health Level container refills on its own, no Resonance spent, at a rate of **Body ÷ 2 per minute**. This does not recover a fully lost Health Level. | Free | Self | Scene | — (no roll, passive) |
| 4 | **Regrowth.** Spend **1 Resonance** to regrow a severed limb, heal a broken bone, or regenerate a lost eye, outright. | Action | Self | Instant | — (no roll, passive) |
| 5 | **Faster Still, and Total Recovery.** The passive regen rate rises to **Body ÷ 2 per turn**. Spend **3 Resonance** to recover every lost Health Level at once. | Free | Self | Instant | — (no roll, passive) |

#### Undying Vigor (disease/poison resistance)
Poison, sickness, and exhaustion all treat your body as unusually hostile territory. They lose more often than they win.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **No Purchase.** Advantage on any roll to resist poison. Immune outright to ordinary (non-exotic) disease. Fatigue-based exhaustion takes twice as long to set in. | Free | Self | Scene | — (no roll, automatic) |
| 2 | **Shrug It Off.** The Advantage above extends to real, dangerous poisons and illnesses too, not just minor ones, and any roll to resist or recover from one gets **+1 DoS**. | Free | Self | Scene | — (no roll, automatic) |
| 3 | **Expel It.** Spend **1 Resonance** to purge an active poison or disease from your system outright, no roll needed, on your terms. | Action | Self | Instant | — (no roll, automatic) |
| 4 | **Refuses to Comply.** Even a serious toxin or a genuine plague, the kind that should be lethal, doesn't take hold. The resist/recover bonus rises to **+3 DoS**, and fatigue-based exhaustion stops accumulating from ordinary causes entirely. Expel It can now purge a serious disease or toxin too, at a cost of **2 Resonance**. | Free | Self | Scene | — (no roll, automatic) |
| 5 | **Stopped Negotiating.** Immune outright to poison, disease, and exhaustion of natural origin, full stop, no roll needed. A mystical or supernatural affliction can still take hold, but Expel It purges it for **3 Resonance**. | Free | Self | Passive | — (no roll, automatic) |

### Combat & Martial Techniques

#### Body as Weapon
Years of discipline made your own body the only tool and the only armor you've ever needed.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Bare-Handed, Not Unarmed.** Your fists, feet, and elbows count as a real weapon for every purpose: no penalty for going in without one, and nothing can Disarm you. Deals damage as an Unarmed weapon (**Base +1**). | Free | Self | Passive | — (no roll, passive) |
| 2 | **Trained Reflexes.** Years of discipline sharpen your instincts in a fight: **+1 to Defense**, always. | Free | Self | Passive | — (no roll, passive) |
| 3 | **Soft Landing.** A fall that should break bones costs you nothing: treat any fall as though it were half its actual height. | Free | Self | Instant | — (no roll, passive) |
| 4 | **Catch or Deflect.** Once per round, contest an incoming ranged attack as a Free action: win, and it's knocked aside or caught outright. | Free | Self | Instant | Resisted Roll: Power Level + Body vs. the attacker's roll |
| 5 | **Nothing Gets Through.** Catch or Deflect no longer costs an action and can answer more than one attack in the same round if it comes to that. | — | Self | Passive | Resisted Roll: Power Level + Body vs. the attacker's roll |

*Note: meditative-discipline concealment (stillness, going unsensed) lives in [Unseen](#unseen-concealment--evasion) (Illusion & Concealment) as a Special Effect option — the old separate "Empty Body" entry was merged into it 2026-07-16. Its higher-level intangibility (stepping halfway or fully out of the physical world) lives in [Through the Cracks](#through-the-cracks-phasing) instead, since that's a defensive/movement power, not concealment.*

#### Marked for the Hunt
Once you've marked someone, the hunt runs on its own. Part of your attention stays fixed on them even when you're doing something else entirely.

*Natural opposite of [Unseen](#unseen-concealment--evasion): when a marked target evades using that Gift, resolve it as a Resisted Roll — this Gift's DoS bonus and the other's tracking-penalty both apply to their respective sides before comparing margins, rather than either Gift simply overriding the other.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Mark the Quarry.** Spend **1 Resonance** to mark a target you can see. You always know their rough direction, like a compass that only points at one person, and gain Advantage on any roll made to track or locate them specifically. | Action | Close | Scene (extended) | — (no roll, passive) |
| 2 | **The Hunter's Edge.** Any roll made directly against your marked target (an attack, a contested Skill use) gets **+1 to your Degree of Success**. | Free | Self | Scene (extended) | — (no roll, passive) |
| 3 | **Nowhere to Hide.** Your tracking Advantage extends further: the marked target's attempts to hide, disguise themselves, or slip away from you specifically suffer Disadvantage. You also gain Advantage to avoid being surprised by them. | Free | Self | Scene (extended) | — (no roll, passive) |
| 4 | **The Mark Deepens.** The DoS bonus against your marked target rises to **+3**, and the mark itself no longer needs renewing: it holds until the target is dealt with or you deliberately release it, not just for a scene. | Free | Self | Until released | — (no roll, passive) |
| 5 | **The Hunt Is Already Over.** Spend **1 Resonance** to pinpoint your marked target's exact location regardless of concealment, stealth, or any means of hiding they're using. The DoS bonus against them rises to **+5**. | Action | Self | Instant | — (no roll, passive) |

#### Opportunist's Edge
You spot the gap before anyone else does. By the time it registers for them, you've already moved through it.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Read the Gap.** You automatically notice when a target within Close range is surprised, flanked, or distracted, even if it's not obvious. Gain Advantage on your next roll against them. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Cash It In.** Act against a target with an opening (surprised, flanked, or distracted, per Read the Gap) and your roll gets **+1 to Degree of Success**. | Free | Close | Instant | Power Level + Body |
| 3 | **Cunning Step.** Once per round, take an extra Move, or Hide, without spending your Action on it. | Free | Self | Instant | — (no roll, passive) |
| 4 | **No Wasted Openings.** The bonus against an exploitable target rises to **+3 DoS**. | Free | Close | Instant | Power Level + Body |
| 5 | **Already Gone.** The bonus rises to **+5 DoS**. When you use Cunning Step, you may also make an attack without spending an action, once per scene. | Free | Close | Instant | Power Level + Body |

#### Reckless Instinct
You lead with instinct instead of thought when danger erupts. It's a gamble, and it pays off more than caution ever would.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Already Tensing.** You can't be caught flat-footed by a surprise attack. Act with Advantage the instant danger erupts. | Free | Self | Instant | — (no roll, passive) |
| 2 | **All In.** Once per round, go Reckless as an Action: Advantage on your next attack, but attacks against you gain Advantage too until your next turn. | Action | Self | Instant | Power Level + Body |
| 3 | **First Every Time.** The surprise immunity now covers Gift- and Perk-based ambushes too, not just mundane ones. | Free | Self | Instant | — (no roll, passive) |
| 4 | **The Gamble Pays.** Reckless's offense becomes a flat **+3 DoS** instead of Advantage, though the enemy still gets Advantage against you. | Action | Self | Instant | Power Level + Body |
| 5 | **No Hesitation.** The bonus rises to **+5 DoS**, and triggering Reckless costs a Free action instead of your whole turn. | Free | Self | Instant | Power Level + Body |

#### Undying Fury
Once your temper truly lights, something in you refuses to go down. Pain, fatigue, and injury all take a back seat to the fury carrying you forward.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Burn It Off.** Minor pain and fatigue stop imposing Disadvantage on you while your temper's up. | Free | Self | Scene | — (no roll, passive) |
| 2 | **Rising Heat.** Enter a rage as a Free action: physical attacks against you suffer **-1 DoS**, and your own melee attacks gain **+1 DoS**, for the scene. | Free | Self | Scene | — (no roll, passive) |
| 3 | **No Fade.** The rage holds at full strength for the whole scene. No sustain roll, no falling off partway through a long fight. | Free | Self | Scene | — (no roll, passive) |
| 4 | **Fight Through It.** Both bonuses rise to **-3 / +3 DoS**. Once per scene, ignore a hit that would drop you a Health Level. | Free | Self | Scene | — (no roll, passive) |
| 5 | **Refuse to Fall.** Both bonuses rise to **-5 / +5 DoS**. While raging, no single hit can take you below 1 Health Level. | Free | Self | Scene | — (no roll, passive) |

#### Untouchable
**Merged with Iron Mind, 2026-07-16.** Harm has trouble landing on you. Whatever's coming, body or mind, tends to arrive a beat late or an inch wide.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Half a Step Ahead.** Any attack or mental intrusion aimed at you suffers **-1 to its Degree of Success**. | Free | Self | Instant | — (no roll, passive) |
| 2 | **Doesn't Stick.** Minor coercion, a passing suggestion or a low-grade compulsion, fails against you outright. | Free | Self | Instant | — (no roll, passive) |
| 3 | **Throw It Back.** Once per scene, force an active mental intrusion already inside your head back out. | Action | Self | Instant | Resisted Roll: Power Level + Mind vs. the intruder |
| 4 | **Barely There.** The penalty on attacks and intrusions against you rises to **-3 DoS**, and it now applies to area effects too, not just single targets. | Free | Self | Instant | — (no roll, passive) |
| 5 | **Locked Door.** The penalty rises to **-5 DoS**. Body or mind, almost nothing finds its mark on you anymore. | Free | Self | Passive | — (no roll, passive) |

### Elemental & Energy Manipulation

#### Ember Touch (fire)
Fire treats you like kin. Flame bends toward your will the way it bends toward fuel and air.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Know Fire.** A guttering candle, a dying ember, the ghost-warmth of a fire long put out: all of it plain to you at a glance. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Coax the Flame.** A flame flares, dims, bends around a corner, or catches on something already ready to burn, at your suggestion. | Action | Close | Instant | Power Level + Soul |
| 3 | **Kindle and Hold.** Flame blooms in your open palm from nothing and holds as long as you concentrate: a torch you never have to relight. | Action | Self | Scene | Power Level + Soul |
| 4 | **Burning Strike.** Fire leaves your hand as a real attack, or shoves an already-raging blaze somewhere else entirely. Deals damage as a Martial weapon (**Base +6**). | Action | Close | Instant | Power Level + Soul vs. Defense |
| 5 | **Wildfire's Master.** Bend an existing fire's front, starve its heart, or snuff it dead in an instant. Conjure a blast at devastating scale instead: **Base +9**, able to spill across Health Levels like Ordnance. | Action | Medium | Instant | Power Level + Soul vs. Defense |

#### Frostbound (cold/ice)
Winter never really left you. Cold and ice answer to something in your blood.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Read the Ice.** How long it's held its shape, how deep the cold runs, whether it's natural or something else's doing: ice tells you its story on contact. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Bite the Air.** The air around you picks up a cold it didn't have a moment ago, and a thaw already underway slows to a crawl at your say-so. | Action | Close | Instant | Power Level + Soul |
| 3 | **Lock It Down.** Standing water stiffens and locks at your command. A bare surface goes slick with ice thick enough that anyone crossing it suffers Disadvantage on the attempt. | Action | Close | Instant | Power Level + Soul |
| 4 | **Flash Freeze.** Cold pours off you hard enough to freeze a target solid where they stand: their Move drops to 0 until they break free with a Resisted Roll (their Body vs. your Power Level + Soul). If you'd rather hurt than hold, it deals damage as a Martial weapon instead (**Base +6**). | Action | Close | Instant | Power Level + Soul vs. Defense |
| 5 | **Winter's Reach.** Lock a room in ice thick enough to seal every door, or thaw one instantly with a thought. Turned on a person, the freezing blast deals **Base +9**. | Action | Medium | Instant | Power Level + Soul vs. Defense |

#### Radiant Burst (light/energy)
Light gathers to you the way it gathers to any source. The source, in this case, is you, and the light knows it.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Steady Light.** A soft glow rises off your skin or gathers in your palm, entirely under your control. A lantern that never runs out. | Free | Self | Scene | — (no roll, passive) |
| 2 | **Bend the Light.** Light in a room bends to your intent: brighter, dimmer, gone entirely, all with a thought. | Action | Close | Instant | Power Level + Soul |
| 3 | **Flash.** A flash bursts from you bright enough to blind for a moment (the target suffers Disadvantage on their next roll), or a beam bright enough to signal clean across a valley. | Action | Medium | Instant | Power Level + Soul vs. Defense |
| 4 | **Cutting Beam.** Light leaves your hands as a real attack, focused enough to burn skin or cut through what it touches. Deals damage as a Martial weapon (**Base +6**). | Action | Close | Instant | Power Level + Soul vs. Defense |
| 5 | **Blinding Wave.** Unleash a wave bright enough to blind a crowd outright (Disadvantage on their next roll, all at once), or hold a beam steady enough to cut through steel: **Base +9**. | Action | Medium | Instant | Power Level + Soul vs. Defense |

#### Stoneheart (earth)
The ground under your feet has never really been separate from you. Earth and stone shift, hold, and yield according to something closer to conversation than command.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Ground Truth.** A hollow beneath the soil, a crack running through bedrock: the ground under your feet tells you what it's made of and how stable it is. | Free | Self | Instant | — (no roll, passive) |
| 2 | **A Word to the Earth.** Loose soil firms into packed earth at your touch, or firm ground goes soft and yielding. Small, exact adjustments. | Action | Touch | Instant | Power Level + Body |
| 3 | **Raise and Seal.** Raise a wall of packed dirt where there was none, or seal a crack in stone shut as though it had never opened. A raised wall grants Advantage to anyone using it as cover. | Action | Close | Instant | Power Level + Body |
| 4 | **Break the Earth.** A real mass of stone moves at your will, or shatters outright, enough to open a path or bring one down. Hurled at a target, it deals damage as a Martial weapon (**Base +6**). | Action | Close | Instant | Power Level + Body vs. Defense |
| 5 | **Foundation's Will.** Raise or collapse a structure's worth of earth and stone in a single act of will. Directed at a person instead, it deals **Base +9**. | Action | Medium | Instant | Power Level + Body vs. Defense |

#### Storm's Herald (wind/lightning/weather)
The sky above you is never entirely neutral. Wind, rain, and lightning lean a little closer to whatever you're feeling, ready to answer if you ask.

*Checked against [Voltaic Pulse](#voltaic-pulse-electricity), 2026-07-16: both touch "lightning," but not the same capability. This Gift's lightning is weather, summoned as part of a wider storm, needs open sky, and answers to Soul. It can't reach a circuit through a wall or ride a wire indoors. Kept separate.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Weather Sense.** A shift in pressure, a change in the wind, a storm hours off that no one else has noticed yet: the sky tells you its plans before the first cloud rolls in. | Free | Self | Scene | — (no roll, passive) |
| 2 | **Restless Wind.** A still afternoon picks up a breeze that wasn't there a moment ago, small and local, entirely yours to shape. | Action | Close | Instant | Power Level + Soul |
| 3 | **Called Down.** You reach up and pull down what wasn't building: a hard gust from nowhere, a sudden downpour, or a single crack of lightning out of a clear sky. Aimed at a target, the bolt deals damage as a Light weapon (**Base +3**). | Action | Medium | Instant | Power Level + Soul vs. Defense |
| 4 | **The Storm Holds.** A real storm gathers at your call and holds: wind, rain, and lightning that don't dissipate, aimable like a weapon for as long as it lasts. A bolt aimed at a target deals **Base +6**. | Action | Long | Scene | Power Level + Soul vs. Defense |
| 5 | **Write on the Sky.** The sky over a significant stretch of ground is yours to write on: its path, its intensity, whether it rages or breaks. A bolt aimed at a target now deals **Base +9**. | Action | Long | Scene | Power Level + Soul vs. Defense |

#### Tidecaller (water)
Water moves for you the way it moves for the moon. It was always going to answer, whether it's a puddle or the open sea.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Water's Voice.** Its purity, its current, its depth, its motion: water speaks to you before you touch it, even from well out of sight. | Free | Medium | Instant | — (no roll, passive) |
| 2 | **A Suggestion to the Current.** A puddle ripples without wind. A stream's flow bends a little at your suggestion. Not commands yet, just nudges, but water listens. | Action | Close | Instant | Power Level + Soul |
| 3 | **Water Answers.** A real volume of water moves because you told it to: a stream redirected, a wave raised in a still pool. Turned against a person, contest it as a Trip/Shove to knock them down or push them back. | Action | Close | Instant | Resisted Roll: Power Level + Soul vs. the target |
| 4 | **The Current Bends.** A strong current bends to your will, or a localized flood rises where you need it. Slammed directly into a target, it deals damage as a Martial weapon (**Base +6**). | Action | Medium | Instant | Power Level + Soul vs. Defense |
| 5 | **The Sea Obeys.** Shape a wave, hold back a flood, or part standing water clean to the bottom. Turned into a weapon, the wave deals **Base +9**. | Action | Long | Instant | Power Level + Soul vs. Defense |

#### Voltaic Pulse (electricity)
Current runs through the world in more places than most people notice, and it all speaks a language you understand natively.

*Checked against [Storm's Herald](#storms-herald-windlightningweather), 2026-07-16: both touch "lightning," but not the same capability. This Gift is a precise current delivered by touch or along a conductor, wire, water, rebar, indoors or out, no sky required, and answers to Mind. It can't call a bolt down from a clear sky. Kept separate.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Live Current.** Live wiring behind a wall, the charge building in a storm cloud, a battery's last dregs: current hums to you before you see its source. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Controlled Spark.** A spark jumps from your fingertip, controlled and precise: a jolt to startle, a static kiss to drain or top off something small. | Action | Touch | Instant | Power Level + Mind |
| 3 | **Real Jolt.** A real jolt leaves your hand, enough to fry a simple circuit or drop someone to their knees. Deals damage as a Light weapon (**Base +3**). | Action | Touch | Instant | Power Level + Mind vs. Defense |
| 4 | **Conductive Path.** Send a serious discharge through a target directly, or along whatever conductive path is lying around: wire, water, rebar, all a route to you now. Deals **Base +6**. | Action | Close | Instant | Power Level + Mind vs. Defense |
| 5 | **Stop a Heart.** A building's power dies at your word, or a discharge leaves your hands at lethal scale: **Base +9**, able to spill across Health Levels like Ordnance. | Action | Medium | Instant | Power Level + Mind vs. Defense |

### Fate, Luck & Probability

#### Fortune's Favor
**Merged with Twist of Fate, 2026-07-16.** Luck has always had a soft spot for you. Sometimes it's raw probability tipping your way; sometimes it's the right coincidence landing at the right second. Either way, it's a real, persistent lean in your direction when it matters.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Beat of Warning.** The light turns green, the coin lands right, the dropped item bounces somewhere convenient. You feel a coincidence coalescing a beat before it lands. | Free | Self | Scene | — (no roll, passive) |
| 2 | **A Small Lean.** Once per scene, grant yourself Advantage on one roll, or conjure a minor coincidence that grants an ally Advantage instead. | Action | Self | Instant | Power Level + Soul |
| 3 | **Pull Through.** Once per scene, turn a roll (yours or an ally's) into a real success by adding **+3 DoS** after seeing the result, or force a useful coincidence into being: the right door already unlocked, the right distraction, right on cue. | Action | Close | Instant | Power Level + Soul |
| 4 | **A Real Stroke.** Once per scene, bend a significant outcome your way with **+5 DoS** to a roll after it's made, or arrange a real stroke of luck, the right person, the right item, with no roll needed at all. | Action | Medium | Instant | Power Level + Soul |
| 5 | **Fate Rewritten.** Once per session, force a single roll, yours, an ally's, or an enemy's, into an automatic critical success or failure as needed. | Action | Medium | Instant | — (no roll, automatic) |

#### Ill Omen
Fortune's soft spot for you has a mirror image. You have a knack for making bad luck land on someone else, right when it counts.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Felt Coming.** You can feel it on someone before it happens: a run of bad luck circling, waiting for its moment to land. | Free | Close | Instant | — (no roll, passive) |
| 2 | **A Small Push.** Once per scene, impose Disadvantage on a single roll someone else is about to make. | Action | Close | Instant | Power Level + Soul vs. Resolve |
| 3 | **Curdled Success.** Once per scene, turn a target's roll that would have succeeded into a failure with **-3 DoS** after seeing the result. | Action | Close | Instant | Power Level + Soul vs. Resolve |
| 4 | **A Genuine Streak.** A target carries Disadvantage on every roll for the rest of the scene. | Action | Close | Scene (extended) | Power Level + Soul vs. Resolve |
| 5 | **Bad Luck, Made Personal.** Once per session, force a single roll of a chosen target's into an automatic critical failure. | Action | Close | Instant | Power Level + Soul vs. Resolve |

*Note: decision-outcome reading lives in [Second Sight](#second-sight-clairvoyanceprecognition--decision-reading) (Mental & Psychic) — the old separate "Threadreader" entry was merged into it 2026-07-16. Coincidence-engineering lives entirely in [Fortune's Favor](#fortunes-favor) above — the old separate "Twist of Fate" entry was merged into it the same day.*

### Illusion & Concealment

#### Radiant Face
Strangers read you as honest before you've said a word. It's a natural counterweight to deception and darkness alike.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Gives You Away.** People can tell, on some instinctive level, when you mean what you're saying. | Free | Self | Passive | — (no roll, passive) |
| 2 | **A Calming Glow.** A faint, calming glow rises when you want to be seen as trustworthy. Nothing overt, just a warmth people register without noticing why. | Action | Self | Scene | — (no roll, passive) |
| 3 | **Hard to Lie To.** Lying to your face becomes difficult: the words catch, the nerve falters, something in your presence resists the deception. | Free | Close | Scene | Power Level + Soul vs. Resolve |
| 4 | **Recoils on Instinct.** A minor malevolent or deceptive presence recoils from you, without you having to do anything but be there. | Free | Close | Instant | Power Level + Soul vs. Resolve |
| 5 | **A Force for Truth.** Your presence alone can expose a lie, settle a crowd's temper, or push back something genuinely dark. | Action | Medium | Instant | Power Level + Soul vs. Resolve |

#### Trick of the Light
What people see isn't always what's actually there. You have a subtle, growing talent for putting something else in front of their eyes instead.

*Note: general unremarkability lives in [Unseen](#unseen-concealment--evasion) below as a Special Effect option — the old separate "Veil of Unseeing" entry was merged into it 2026-07-16.*

*Note: darkness-based concealment lives in [Unseen](#unseen-concealment--evasion) below as a Special Effect option — the old separate "Shadow Step" entry was merged into it 2026-07-16. Its shadow-to-shadow teleportation lives in [Step Between](#step-between-short-teleport) instead, as a Special Effect option there, since that's a movement power, not concealment.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Wrong Shadow.** A shadow falls a little wrong, a glint catches where it shouldn't: small, deniable, enough to make someone's eye slide past what's really there. | Action | Close | Instant | Power Level + Mind |
| 2 | **A Minor Illusion.** A false glint, a misplaced shadow: simple but real, sitting where you put it. | Action | Close | Instant | Power Level + Mind |
| 3 | **Out of Nothing.** A small object or a brief effect appears out of nothing, convincing enough to fool a glance and a second look both. | Action | Close | Scene | Power Level + Mind vs. Resolve |
| 4 | **Large Enough to Pass.** A detailed illusion, large enough to pass for real at a glance: a person, a doorway, a hazard that isn't there. | Action | Close | Scene | Power Level + Mind vs. Resolve |
| 5 | **Survives Scrutiny.** A fully convincing illusion, detailed and sustained enough that people can look right at it and still not see through it. | Action | Medium | Scene (sustained) | Power Level + Mind vs. Resolve |

#### Unseen (concealment & evasion)
**Merged with Veil of Unseeing, Empty Body, and Shadow Step, 2026-07-16** (replaces the old "One with the Wild"). Nobody finds you unless you let them. Maybe it's terrain: rough ground and thick brush treat you like one of their own. Maybe it's darkness, home turf instead of a hazard. Maybe it's stillness, discipline pushed until pain and hunger stop registering. Maybe your face is just the kind people's eyes forget to hold onto. However you get there, the result is the same.

**Special Effect note**: choose which of the above your character runs on when you take this Gift, or something else that fits them. The mechanic below is identical regardless.

*Note: this Gift no longer covers stepping halfway out of the physical world or shadow-to-shadow teleportation. Those are a different kind of power (defense and short-range movement, not concealment) and now live in [Through the Cracks](#through-the-cracks-phasing) and [Step Between](#step-between-short-teleport) respectively as Special Effect options for a character built on discipline or shadow.*

*Natural opposite of [Marked for the Hunt](#marked-for-the-hunt): when a hunter with that Gift pursues you, resolve it as a Resisted Roll — this Gift's tracking-penalty and the hunter's own DoS bonus both apply to their respective sides before comparing margins, rather than either Gift simply overriding the other.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Home Ground.** Whatever throws other people off, rough terrain, darkness, distraction, doesn't touch you. You're already a little more forgettable than you have any right to be. | Free | Self | Scene | — (no roll, passive) |
| 2 | **Trackless Passage.** No trail, no telltale sign, no reason for anyone to remember you were there. Any roll made to notice, track, or follow you specifically suffers **-1 to Degree of Success**. | Free | Self | Scene | — (no roll, passive) |
| 3 | **Predator's Ghost.** Hold still, move carefully, or simply commit. Even a careful, active search passes right over you. | Action | Self | Scene | Power Level + Body |
| 4 | **Vanish From Pursuit.** Cross a crowded street or slip a hunting party's cordon: your trail thins fast enough that whoever's looking loses it. The tracking penalty against you rises to **-3 DoS**. | Free | Self | Scene | — (no roll, passive) |
| 5 | **Ghost.** So long as you choose to stay that way, you're effectively unfindable. The tracking penalty against you rises to **-5 DoS**. | Free | Self | Scene | — (no roll, passive) |

### Life, Death & Spirit

#### Beyond the Veil (spirit sight/travel)
The line between the living world and whatever comes after was never as solid to you as it is to everyone else. You can see it, and eventually, cross it.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **More Than Visible.** A residual impression, a faint shape at the edge of sight, an echo of grief or rage soaked into the walls: places carry more than what's visible, and you catch all of it. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Sense You Back.** A spirit hears you when you speak to it, and answers, even though no one else in the room notices either side of the conversation. | Action | Close | Scene | Power Level + Soul |
| 3 | **Partway Across.** You lean partway into the space between the living and whatever comes after: a touch that shouldn't be possible, briefly, in both directions. | Action | Close | Instant | Power Level + Soul |
| 4 | **Step Across.** You step across bodily for a short while, unseen and unfelt by anyone still among the living. | Action | Self | Scene | Power Level + Soul |
| 5 | **Bring Someone With You.** The line between the living and whatever lies beyond stops being a wall for you. Cross it freely, and take someone else's hand to bring them along. | Action | Self (or Touch, to guide another) | Scene | Power Level + Soul |

#### Borrowed Vitality
Life force isn't sealed inside a single body, not to you. It's a resource you can read, draw on, and in a pinch, take.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Reads Like a Gauge.** Life force reads to you like a gauge: how much a nearby creature has to spare, plain at a glance. | Free | Close | Instant | — (no roll, passive) |
| 2 | **A Willing Loan.** A willing source spends **1 Health Level** of their own vitality; you recover **1 Health Level**, or gain Advantage on your next roll if you're already at full. | Action | Touch | Instant | Power Level + Body |
| 3 | **Real Strength.** Draw enough from a willing source to fuel a significant effort: gain **+3 DoS** on your next roll this scene. The source still spends **1 Health Level**. | Action | Touch | Instant | Power Level + Body |
| 4 | **Taken, Not Given.** Draw from someone unwilling: they lose **1 Health Level** as a real, physical cost, whether they consent or not. You recover **1 Health Level** or gain **+3 DoS**. | Action | Touch | Instant | Power Level + Body vs. Resolve |
| 5 | **A Major Draw.** An unwilling source loses up to **2 Health Levels**; you recover fully or gain **+5 DoS**. | Action | Touch | Instant | Power Level + Body vs. Resolve |

#### Healer's Touch
**Added 2026-07-16.** Wounds don't answer only to your own body. Reach out, and harm someone else is carrying eases at your hand. (For healing yourself rather than others, see [Regeneration](#regeneration) instead.)

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **First Touch.** Once per scene, a touch to a willing, injured ally clears any lingering Disadvantage from a minor wound. No Health Level recovered, just the sting taken off. | Free | Touch | Instant | — (no roll, passive) |
| 2 | **A Real Mending.** Once per scene, recover **1 Health Level** for a willing, touched ally. | Action | Touch | Instant | Power Level + Body |
| 3 | **Steady Hands.** The once-per-scene limit is gone: recover **1 Health Level** for a touched ally as often as you have Actions to spend. | Action | Touch | Instant | Power Level + Body |
| 4 | **Deep Mending.** A single touch now recovers **2 Health Levels** at once. | Action | Touch | Instant | Power Level + Body |
| 5 | **Miracle Worker.** Once per day, recover **every Health Level** a touched ally has lost, in a single act. | Action | Touch | Instant | Power Level + Body |

#### Last Rites
The dead don't always go quietly, and you're one of the few who can tell the difference. If it comes to it, you can make the choice for them.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **At Rest or Lingering.** The dead nearby tell you plainly whether they're at rest or still lingering. A fact, not a guess. | Free | Close | Instant | — (no roll, passive) |
| 2 | **A Willing Rite.** A restless spirit willing to go finds peace through a rite you perform. Closure, not a trick. | Action | Close | Scene | Power Level + Soul |
| 3 | **Gentle Pressure.** A lingering spirit moves on at your compelling, even if part of it isn't ready. | Action | Close | Scene | Power Level + Soul vs. Resolve |
| 4 | **Held in Place.** You can just as easily hold a spirit from moving on, if that's what you choose to do instead. | Action | Close | Scene (sustained) | Power Level + Soul vs. Resolve |
| 5 | **Your Call to Make.** Whether the dead rest or linger is, for all practical purposes, your call. Decisive, and at will. | Action | Close | Instant | Power Level + Soul vs. Resolve |

#### Mercy's Hand
You recognize an ending when it's truly, unavoidably at hand, and you have the rare, quiet gift of making that ending gentle.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Total Certainty.** You know, with total certainty, when an ending is at hand and unavoidable. No false hope, no guessing. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Eases the Pain.** Your presence eases a dying creature's pain in its final moments. Not a cure, just a mercy, freely given. | Action | Touch | Instant | Power Level + Soul |
| 3 | **Swift and Painless.** Where an end is already certain, you can make it swift and painless. Gentle, deliberate, final. | Action | Touch | Instant | Power Level + Soul |
| 4 | **Reaches Further.** Something that would otherwise linger in suffering for a long stretch instead finds its peace quickly. | Action | Touch | Instant | Power Level + Soul |
| 5 | **Without Exception.** Anything whose end has truly, unavoidably come can be granted immediate, total peace at your hand. | Action | Touch | Instant | Power Level + Soul |

### Mental & Psychic

#### Ghost in the Wires (technopathy)
Electronics were never truly closed systems to you. Circuits and code have a rhythm you can hear, and once you're listening, you can talk back.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Ambient Hum.** A camera panning, a phone buzzing in a pocket, a server room's quiet churn: active electronics hum at the edge of your awareness. | Free | Close | Instant | — (no roll, passive) |
| 2 | **A Word to the Machine.** Your thoughts slip into a simple device without a cable or a login: a lock, a lightswitch, a basic terminal, answering you like it was always yours. | Action | Touch | Instant | Power Level + Mind |
| 3 | **Remote Hand.** A straightforward device or system opens fully to you from a distance: cameras, doors, simple networks, all under your remote hand. | Action | Medium | Instant | Power Level + Mind |
| 4 | **Walk the Network.** A complex networked system stops being a wall of code and becomes a space you move through, navigating and rewriting it as naturally as walking a hallway. | Action | Long | Scene | Power Level + Mind |
| 5 | **All Yours at Once.** A building's systems, a fleet of devices, an entire network: scale stops being a limit, all of it yours to command at once. | Action | Long | Scene | Power Level + Mind |

#### Mind's Whisper (telepathy / hyper-perception / spirit confidant)
**Merged with Read the Room, 2026-07-16.** Other minds have never been entirely closed books to you.

**Special Effect note** (same as [Bulwark](#bulwark-damage-resistance--toughness)): the mechanic below is fixed, but the in-fiction source is genuinely open — literal telepathy, superhuman powers of observation and inference, or an actual spirit that whispers secrets in your ear are all equally valid, chosen when you take this Gift. The GM may let the source matter narratively (a spirit confidant can be silenced or banished; raw perception can't) without touching the numbers.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Read the Room.** Tension, deception, a hidden agenda: a mind nearby registers to you the way a lit window registers in a dark street, its general mood plain even through a closed door. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Catch the Drift.** Unguarded thoughts drift off a nearby mind like heat off pavement. In a conversation, you know who's actually running things and who's lying, usually before they finish their first sentence. | Action | Close | Instant | Power Level + Mind |
| 3 | **Mind to Mind.** A thought or image leaves your mind and lands whole in someone else's, no words needed. Against someone actively hiding their real goal, you piece it together from what they do instead of what they say. | Action | Close | Instant | Power Level + Mind vs. Resolve |
| 4 | **No Distance, No Deception.** Distance stops mattering: hold a real, two-way silent conversation with someone you can't see. A gifted liar's seams show to you either way, even when they shouldn't. | Action | Long | Scene | Power Level + Mind |
| 5 | **Once Touched, Never Lost.** A mind that's touched yours is never entirely out of reach again: find it across any distance and read past the surface to what's actually felt underneath. | Action | Self (target: anyone met before) | Instant | Power Level + Mind vs. Resolve |

*Note: mental resistance lives entirely in [Untouchable](#untouchable) (Combat & Martial Techniques) — the old separate "Iron Mind" entry was merged into it 2026-07-16.*

#### Second Sight (clairvoyance/precognition & decision-reading)
**Merged with Threadreader, 2026-07-16.** Time and distance are more porous for you than for most. What starts narrow — a lean on one small choice — widens with practice into glimpses of anything distant or significant, whether or not you go looking for it.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Lean.** A small decision or near-future moment hangs in front of you. Not certainty, just a lean: a feeling, an afterimage of which way it tips. | Free | Self | Instant | Power Level + Mind |
| 2 | **A Pointed Answer.** Ask a specific question about a specific choice or moment, and the vague impression sharpens into a real answer. | Action | Self | Instant | Power Level + Mind |
| 3 | **Several Paths.** Several possible outcomes of a choice lay themselves out clearly enough to weigh, or a likely near-future event plays out in real detail. | Action | Self | Instant | Power Level + Mind |
| 4 | **Steps Ahead.** A significant decision's consequences trace several steps ahead of you, clear enough to plan around. What's coming, or what already happened, comes through sharp instead of hazy. | Action | Self | Instant | Power Level + Mind |
| 5 | **Reach Out and Look.** Reach out deliberately for anything distant or significant, a decision, a person, an event, and pull back a detailed, coherent vision on demand rather than by chance. | Action | Self | Instant | Power Level + Mind |

#### Silent Push (telekinesis)
Your will reaches past your own hands. Objects move because you decided they should, no touch required.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Small Push.** A coin skitters off a table. A door eases shut. A light object drifts an inch to the left, undeniably not you touching it. | Action | Close | Instant | Power Level + Mind |
| 2 | **Precise Lift.** A light object lifts clean off the ground and goes exactly where you point it. Precise, controlled, deliberate. | Action | Close | Instant | Power Level + Mind |
| 3 | **Real Weight.** A chair, a body, a stack of crates: real weight answers to your will now, moving because you decided it should. | Action | Medium | Instant | Power Level + Mind |
| 4 | **Invisible Weapon.** Invisible force becomes a weapon: a shove hard enough to strike deals damage as a Martial weapon (**Base +6**), or a grip hard enough to restrain drops a target's Move to 0 until they break free with a Resisted Roll (their Body vs. your Power Level + Mind). | Action | Medium | Instant | Power Level + Mind vs. Defense |
| 5 | **Total Control.** Hold several things aloft at once, or something massive, all under total, effortless control. The force-strike option now deals **Base +9**. | Action | Medium | Instant | Power Level + Mind vs. Defense |

*Note: reading and moving emotion lives entirely in [Chorus of Concord](#chorus-of-concord-empathic--emotional-influence) (Social & Emotional) — the old separate "Borrowed Feeling" entry was merged into it 2026-07-16.*

### Movement & Spatial

#### Long Road Home (fast travel)
The road itself seems to want you to arrive. Journeys under your feet go smoother, faster, and shorter than they logically should.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Never Lost.** Turned around, lost, disoriented: it doesn't matter. Some part of you always knows which way leads back toward safety or home. | Free | Self | Instant | — (no roll, passive) |
| 2 | **Journeys Go Right.** The traffic clears, the trail stays dry, the connection is never missed, more often than luck should allow. | Free | Self | Scene | — (no roll, passive) |
| 3 | **A Shortcut That Shouldn't Exist.** You find the route nobody else would think to take, and it cuts real time off a long journey. | Action | Self | Scene | Power Level + Mind |
| 4 | **The Road Bends.** A significant distance collapses into a fraction of the time it should take. | Action | Self | Scene | Power Level + Mind |
| 5 | **The World Gets Smaller.** Vast distances close in almost no time at all, so long as you're still moving under your own power. | Action | Self | Scene | Power Level + Mind |

#### Step Between (short teleport)
Distance is more of a suggestion to you than a fixed rule. The space between two points is collapsible whenever you need it to be.

*Note: a shadow-to-shadow flavor of this Gift (moving only between points of darkness, rather than any two points you've seen) absorbed the teleport half of the old "Shadow Step" entry, 2026-07-16. Same mechanic, reskinned as a Special Effect for a shadow-affine character.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **The Shortest Line.** Through the crowd, around the guard, past the rubble: the shortest safe line between two points draws itself in your mind's eye. | Free | Medium | Instant | — (no roll, passive) |
| 2 | **Across the Gap.** A locked door, a chasm, a gap that should stop you cold: none of it matters, so long as you've laid eyes on both sides. | Action | Close | Instant | Power Level + Mind |
| 3 | **Blink.** You blink out of existence and back in somewhere else: a short hop to any spot you can currently lay eyes on. | Action | Close | Instant | Power Level + Mind |
| 4 | **No Need to See It.** A place you know well enough is a place you can simply arrive at, sight unseen. | Action | Long | Instant | Power Level + Mind |
| 5 | **A Thought Away.** Distance stops being the obstacle it once was. Almost anywhere you've ever stood is a single thought away from you again. | Action | Long | Instant | Power Level + Mind |

#### Through the Cracks (phasing)
Solid matter isn't quite as solid to you as it is to everyone else. A wall, a door, a hull: all of it slightly more theoretical when you decide it should be.

*Note: a meditative-discipline flavor of this Gift (stepping halfway or fully out of the physical world through inner mastery, rather than raw matter-phasing) absorbed the intangibility half of the old "Empty Body" entry, 2026-07-16. Same mechanic, reskinned as a Special Effect for an ascetic character.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Fold Through.** A gap far too small for you stops being a problem. You fold through it like the rules briefly forgot to apply. | Action | Self | Instant | — (no roll, passive) |
| 2 | **A Flicker.** A solid surface brushes against you and, just for an instant, doesn't quite manage to stop you. Gone before anyone's sure they saw it. | Free | Self | Instant | — (no roll, passive) |
| 3 | **Through and Whole.** Your hand or arm sinks into something solid and comes back out the other side, whole, a heartbeat later. | Action | Touch | Instant | Power Level + Body |
| 4 | **The Whole Body.** A wall, a door, a hull: none of it stops your entire body for the few moments you need to be somewhere it isn't. | Action | Touch | Instant | Power Level + Body |
| 5 | **Open Air.** Solid matter stops being an obstacle for as long as you need it to. You move through it as freely as open air. | Action | Self | Scene | Power Level + Body |

#### Wall-Runner
Footing has always been more flexible for you than for anyone standing on two feet has any right to expect. Vertical, upside-down, it barely matters.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Sure Footing.** Ice, loose gravel, a beam an inch wide: your footing holds on surfaces that should have you flat on your back. | Free | Self | Scene | — (no roll, passive) |
| 2 | **A Few Real Strides.** You hit a vertical wall at a dead run and get a few real strides out of it before gravity remembers to argue. | Action | Self | Instant | Power Level + Body |
| 3 | **No Different Than the Street.** A sheer vertical surface is no different to you than a flat street. You climb it at a walk, without strain. | Free | Self | Scene | — (no roll, passive) |
| 4 | **Ceilings and Overhangs.** Surfaces that shouldn't hold a person at all: you move across them with total, unhurried control. | Free | Self | Scene | — (no roll, passive) |
| 5 | **Every Direction the Same.** Footing and gravity stop being rules that apply to you while you're in motion. Up, down, and sideways all become the same direction. | Free | Self | Scene | — (no roll, passive) |

#### Weightless (flight)
Gravity's hold on you has always been a little negotiable. The more you practice, the more room there is to negotiate.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Soft Landing.** A fall that should hurt slows on the way down. You land like it was nothing: shaken, maybe, but never broken. | Free | Self | Instant | — (no roll, passive) |
| 2 | **A Few Inches.** You lift off the ground and hang there, weightless for a breath or two, before gravity remembers you. | Action | Self | Instant | — (no roll, passive) |
| 3 | **Off the Ground.** Slow, careful, deliberate, but you leave the ground properly now, flying under your own power. | Action | Self | Scene | — (no roll, passive) |
| 4 | **Speed and Control.** Both arrive at once. You bank, dive, and climb like flight was always yours to begin with. | Action | Self | Scene | — (no roll, passive) |
| 5 | **The Sky, Like Ground.** Real altitude, real speed, no more effort than walking across a room. | Free | Self | Scene | — (no roll, passive) |

### Nature & Environment

#### Beast Speech (animal communication & command)
**Merged with Call of the Wild, 2026-07-16.** Animals were never as inscrutable to you as they are to everyone else. You speak enough of their language, and they of yours, to actually be understood — and, when it matters, to answer a call.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Plain Mood and Intent.** The hackles that mean fear, not aggression, the stillness before a strike: an animal's mood and intent are plain to you. Nearby animals register like blips on a map, roughly where they are and what they're up to. | Free | Medium | Instant | — (no roll, passive) |
| 2 | **Mutual Understanding.** Simple concepts pass between you and a nearby animal, both directions, and a single animal's attention turns toward you when you want it to. | Action | Close | Instant | Power Level + Soul |
| 3 | **A Real Exchange.** Real back-and-forth, real meaning carried both ways, with an animal in front of you. A specific type of animal nearby answers a call and comes to you. | Action | Close | Scene | Power Level + Soul |
| 4 | **A Group Answers.** A group of animals calms or rallies at your communication alone, no treats or commands needed. A small group answers a call together and briefly does roughly what you ask. | Action | Close | Scene | Power Level + Soul |
| 5 | **No Barrier Left.** Virtually any animal understands you fluently, the barrier between species gone. A significant number of animals from the surrounding area answer your call at once, under your command for as long as it lasts. | Action | Long | Scene | Power Level + Soul |

*Note: weather-sensing and weather-command live entirely in [Storm's Herald](#storms-herald-windlightningweather) (Elemental & Energy Manipulation) — the old separate "Weathersense" entry was merged into it 2026-07-16, since the two reached the same end state (sense weather coming, then command it).*

#### Genius Loci (territorial bond)
**Merged with City's Own, 2026-07-16.** Batman and Gotham. Spider-Man and New York. A druid and their grove. A bond with a place, not blood or oath, that runs just as deep, whatever kind of place it is.

**Special Effect note**: choose the type of ground this bond takes root in when you take this Gift — untamed wilderness, a city district, farmland, an industrial sprawl, whatever fits the character. The mechanic below never changes; only the flavor of what "vitality" or "pulse" means for the chosen terrain does (ecological health for the wild, crime/prosperity for a city, and so on).

**Attunement:** Perform a 5-minute ritual at a site and spend **1 Resonance** to bond with it. This attunement cost is separate from the general per-use Gift Resonance cost (still in playtesting) — it's the price of *forming* the bond, not of *using* it once formed. The bond's strength tracks the site's own vitality/pulse: a thriving, healthy site powers this Gift fully, while one that's damaged, decaying, or corrupted weakens or cuts off what you can draw from it until it recovers or you attune elsewhere. How many sites you can hold bonded at once scales with your Gift Level.

*Note: this Gift no longer grants site history/rumor-reading — that duplicated [Echo of What Was](#echo-of-what-was-psychometry), which already owns that space. If a character wants both a territorial bond and history-reading, take Echo of What Was as a separate Gift.*

*Note: the old separate "Urban & Territorial" category and its sole entry, City's Own, were merged into this Gift on 2026-07-16 — a territorial bond now works for any terrain type via the Special Effect choice above, rather than needing a separate urban-specific Gift.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **The Rite.** 5-minute ritual + 1 Resonance to attune to a site. You hold **one** attunement at a time. From anywhere, you always know that site's condition and exactly how strong your bond to it currently is. | Ritual (5 min) + 1 Resonance | Touch | Permanent (until replaced) | — (no roll, passive) |
| 2 | **Borrowed Vigor, and a Watchful Ground.** While physically on attuned ground, Advantage on Body and Mind rolls made there. The site also tells you how many other creatures or people are moving through it and their general direction, even ones you can't see. | Free | Self | Scene | — (no roll, passive) |
| 3 | **The Ground Answers, and a Second Bond.** Once per scene while on attuned ground, command a concrete effect suited to its terrain: a root trips a target, a fire escape gives at the right moment, a burst of steam or underbrush blocks line of sight. You can now hold **two** attunements simultaneously. | Action | Close | Instant | Power Level + Body, Resisted Roll if used to Trip |
| 4 | **Reaching Further, and a Third Bond.** Draw on an attuned site's power even far outside it — a day's travel in the wild, clear across a city — or let one attunement grow to cover a wider connected area. You can now hold **three** attunements simultaneously. | Free | Long | Scene | — (no roll, passive) |
| 5 | **Communion Absolute, Instantly.** Even ground you've never attuned to responds faintly to your bond's strength, so long as it's genuinely the same kind of terrain, at reduced power next to a true attuned site. The Rite itself no longer needs the 5-minute ritual: 1 Resonance alone attunes you instantly. | Action | Self | Instant | Power Level + Body |

#### Green Thumb
Plants respond to you the way they'd respond to a season change. Growth, health, and bloom all move faster when you ask them to.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Obvious Needs.** Thirsty, root-bound, thriving: a plant's health and its needs are obvious to you at a glance. | Free | Close | Instant | — (no roll, passive) |
| 2 | **A Little Encouragement.** A touch nudges a plant's growth or health favorably, gently given and gladly taken. | Action | Touch | Instant | Power Level + Soul |
| 3 | **Visibly Faster.** A plant grows or blooms at a pace that has nothing to do with sunlight or season, because you asked it to. | Action | Touch | Instant | Power Level + Soul |
| 4 | **Grown to Order.** Shape a plant's growth into a useful form on command: a lattice, a bridge, a screen of leaves. | Action | Touch | Instant | Power Level + Soul |
| 5 | **Real Scale.** A garden flourishes overnight, or a wall of vines rises in moments to block a path or shield a retreat. A vine wall grants Advantage to anyone using it as cover. | Action | Close | Instant | Power Level + Soul |

### Physical Enhancement

#### Bulwark (damage resistance & toughness)
**Merged with Unbreakable, 2026-07-16** — same territory (not going down, not breaking), one Gift instead of two. Explicitly **not** healing: this is about damage never fully landing or a body that refuses to quit, not wounds closing up. Healing/regeneration lives entirely in [Regeneration](#regeneration) now.

**Special Effect note**: the mechanic below, a flat **Soak** value that reduces incoming Damage after a hit connects, per [combat.md](combat.md#damage--confirmed), is fixed regardless of fictional source. A player picks the justification when taking this Gift: unnaturally tough skin, a mystic ward woven into a tattoo, subdermal scales, a personal kinetic barrier, hardened chi, whatever fits the character. The numbers never change based on the choice. The GM may let the fictional source matter narratively (a ward-flavored Bulwark might falter against a dispelling effect, a skin-flavored one might not) without touching the mechanic itself.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | A blow that should leave a mark barely does. Whatever protects you takes the edge off before it lands, and a fall that should leave you limping instead leaves you standing. **Soak +1.** | Free | Self | Passive | — (no roll, passive) |
| 2 | The effect deepens. Whatever protects you blocks real force now, not just glancing hits — cold, heat, and crushing pressure that would trouble an ordinary body barely register either. **Soak +2.** | Free | Self | Passive | — (no roll, passive) |
| 3 | A solid, committed blow that should draw blood instead draws a bruise. **Soak +3.** | Free | Self | Passive | — (no roll, passive) |
| 4 | Attacks that should stagger anyone else barely register. A blow lands that should have ended things right there — it doesn't, and you're still standing, still in the fight, when everyone watching expected you on the ground. **Soak +4.** | Free | Self | Passive | — (no roll, passive) |
| 5 | You shrug off blows that should be devastating. Circumstances that would kill almost anyone else leave you scarred, exhausted, and furious — but standing. **Soak +5.** | Free | Self | Passive | — (no roll, passive) |

#### Iron Lungs
The ordinary limits of breath, thirst, hunger, and sleep loosen their grip on you a little more with every level. Your body runs on reserves nobody else has access to.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Deep Reserves.** A held breath stretches on long past the point it should burn. Food, water, and sleep can all wait far longer than your body should allow. | Free | Self | Scene | — (no roll, passive) |
| 2 | **Filtered Breath.** Smoke that should choke you, thin mountain air, a faintly toxic haze: you breathe through all of it without effect. | Free | Self | Scene | — (no roll, passive) |
| 3 | **Sealed Lungs.** You stop needing air at all for the scene: underwater, in a sealed room, in smoke too thick to see through. | Free | Self | Scene | — (no roll, passive) |
| 4 | **Endure the Extreme.** Vacuum-adjacent cold, crushing deep-water pressure, a lungful of something lethal: your body keeps functioning through it for the scene. | Free | Self | Scene | — (no roll, passive) |
| 5 | **Beyond Need.** Air, food, water, and sleep stop being requirements. Only comforts now. | Free | Self | Passive | — (no roll, passive) |

#### Overwhelming Might
Ordinary strength has a ceiling. Yours keeps finding more room above it.

*Note: superhuman speed lives entirely in [Stolen Moment](#stolen-moment-speedreaction--time-perception) (Temporal) now — the old separate "Fleet-Footed Fury" entry was merged into it 2026-07-16, since both landed on "faster than everyone, act first, close distance in a blink."*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Barely Feel It.** Your grip closes on stone and it groans before it gives. A locked door is barely an obstacle. You shoulder through debris, wrench open jammed metal, and hoist what two people would need a dolly for. | Action | Touch | Instant | Power Level + Body |
| 2 | **One Explosive Heartbeat.** A door doesn't creak, it detonates off its hinges. A boulder rolled into your path becomes a boulder rolled *out* of it. A collapsing beam meets a shoulder that doesn't yield. | Action | Touch | Instant | Power Level + Body |
| 3 | **Settles Into a Rhythm.** Hold a beam off a trapped ally for as long as the scene demands, haul on a line all night, or hold your own in a contest of pure force without tiring. | Free (passive while exerting) | Self | Scene | — (no roll, passive) |
| 4 | **Redraws What's Possible.** Match a feat of strength that ought to belong to something twice your size. Arm-wrestle a foe built like a wall, and don't lose. | Action | Touch | Instant | Power Level + Body, vs. Resisted Roll if opposing another's active effort (e.g. a strength contest) |
| 5 | **Collapsing Buildings, Derailed Trains.** Plant your feet and hold a wall from falling. Flip a vehicle off a pinned victim. Put your shoulder into a failing structure and buy everyone inside the seconds they need. | Action | Touch | Instant | Power Level + Body |

#### Second Wind
Recovery moves at a different pace for you than for anyone else. Exhaustion that should linger for days burns off in a fraction of the time.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Quick Recovery.** A 10-minute rest does what a full night does for anyone else: any Disadvantage you're carrying from fatigue clears the moment you stand back up. | Free | Self | Instant | — (no roll, passive) |
| 2 | **Borrowed Time.** Fatigue-based Disadvantage doesn't touch you for one extra scene past when it normally would kick in. | Free | Self | Scene | — (no roll, passive) |
| 3 | **One Breath, Reset.** Clear any fatigue-based Disadvantage on you outright, no rest required. | Action | Self | Instant | — (no roll, passive) |
| 4 | **Walk It Off.** Once per scene, recover **1 Health Level** from a wound, poison, or bad fall that should have sidelined you for days. | Free | Self | Scene | Power Level + Body |
| 5 | **Back Up Again.** Recovering a Health Level, from this Gift or any other source, happens instantly rather than over time, and any lingering Disadvantage from an injury clears the moment that level is healed. | Free | Self | Instant | — (no roll, passive) |

#### Titan's Grip
What should require a forklift or a crane instead just requires you. Mass and weight stop being an obstacle.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Shoulder the Load.** A burden that should have you staggering doesn't slow you down at all. | Free | Self | Scene | — (no roll, passive) |
| 2 | **Get a Grip.** A stuck vehicle, a fallen beam, a boulder blocking the only way through: you get a grip, plant your feet, and it moves. | Action | Touch | Instant | Power Level + Body |
| 3 | **Real Force, Real Aim.** Something heavy leaves your hands thrown, not dropped, and lands exactly where you meant it to. | Action | Close | Instant | Power Level + Body |
| 4 | **Small Vehicle, Bare Hands.** You get your arms around something the size of a small vehicle and it comes with you, off a trapped victim, out of a doorway, wherever it needs to go. | Action | Touch | Instant | Power Level + Body |
| 5 | **Crane's Work.** Once per scene, move or hurl something at a scale that makes onlookers question what they just saw. | Action | Touch | Instant | Power Level + Body |

### Reality-Warping (rare, high-tier)

#### Mantle of the Divine
You were never entirely ordinary, and the longer this Gift grows, the harder that becomes to miss. A mark of something greater, worn openly when you choose to.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Doesn't Sit Right.** A faint, hard-to-place sense that you aren't entirely ordinary, to anyone who really looks. | Free | Self | Passive | — (no roll, passive) |
| 2 | **Let It Show.** A glow, a shimmer, a weight to your presence that wasn't visible before, entirely at your choosing. | Free | Self | Scene | — (no roll, passive) |
| 3 | **Carries Weight.** Deference, awe, a flicker of reverence from anyone who sees the mark. | Free | Close | Scene | Power Level + Soul |
| 4 | **Settle or Silence.** Your marked presence alone can settle a crowd, cow it into silence, or lift it toward something braver. Sight, nothing more. | Action | Medium | Instant | Power Level + Soul vs. Resolve |
| 5 | **Unmistakable.** Your presence is unmistakably touched by something greater, and everyone who sees it knows it in their bones. | Action | Medium | Scene | Power Level + Soul vs. Resolve |

#### Unerring Hand (mastercraft creation)
Flaws in a piece of work announce themselves to you, and your own hands rarely make new ones. It's a craftsmanship that borders on the impossible.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Confessing Flaws.** A broken or flawed piece of work shows you exactly what's wrong with it, instantly, like it's confessing. | Free | Touch | Instant | — (no roll, passive) |
| 2 | **Fast and Flawless.** Your hands move at a speed that should cost quality and never does: ordinary work, done fast, still flawless. | Free | Self | Scene | Power Level + Mind |
| 3 | **A Masterwork in Miniature.** A single small piece comes off your work entirely finished, flawless by any normal measure. | Action | Touch | Instant | Power Level + Mind |
| 4 | **Shouldn't Have Been Possible.** You build something the tools and time on hand shouldn't have permitted. | Action | Touch | Scene | Power Level + Mind |
| 5 | **A True Masterwork.** A masterwork of real scale or complexity comes together in a fraction of the time it should take. | Action | Touch | Scene | Power Level + Mind |

#### Voice of Creation
Words, spoken by you with real intent, carry a weight that ordinary speech doesn't. Reality listens, and sometimes agrees.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Unmistakable Weight.** A word spoken with real intent lands with faint but unmistakable weight. The air itself seems to take note. | Action | Close | Instant | Power Level + Soul |
| 2 | **Nudges It True.** A simple statement about the world around you nudges it toward being true. Small, but real once you've said it. | Action | Close | Instant | Power Level + Soul |
| 3 | **One Small Detail.** A deliberate declaration reshapes one small, specific detail of reality, chosen precisely, and it holds. | Action | Close | Instant | Power Level + Soul |
| 4 | **A Meaningful Change.** Something significant about the immediate world bends to a spoken word, made true by your saying so. | Action | Close | Instant | Power Level + Soul |
| 5 | **Reality Catches Up.** What you declare, within reason, simply becomes true. Briefly, locally, undeniably true. | Action | Close | Instant | Power Level + Soul |

#### Worldwalker
Reality has seams, and you're one of the rare few who can actually feel them: places where the world runs thin enough to step through.

*Checked against [Step Between](#step-between-short-teleport) and [Through the Cracks](#through-the-cracks-phasing), 2026-07-16: all three cover "get from A to B unconventionally," but not the same way. Step Between needs a destination you've seen or know well. Through the Cracks moves you through solid matter, not distance. This Gift needs neither: it rides a seam in reality itself to a place the seam connects to, sight and familiarity both unneeded, which is why it's gated to the rare tier instead of the common Movement & Spatial category. Kept separate.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Feel the Seams.** Places where reality runs thin, unstable, or quietly connected to somewhere else entirely. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Half Out of Perception.** Step half-out of normal perception, watching a moment unfold from just outside it, unseen and unfelt. | Action | Self | Scene | Power Level + Mind |
| 3 | **A Seam Opens.** A seam opens, briefly, and you slip through it to a nearby place it connects to. | Action | Close | Instant | Power Level + Mind |
| 4 | **A Shortcut Nothing Else Could Take.** Real distance collapses when you step outside reality's normal rules for a moment. | Action | Long | Instant | Power Level + Mind |
| 5 | **Just a Step Apart.** Significantly distant places are, for you, just a step apart. The world's normal rules don't apply once you leave them behind. | Action | Long | Instant | Power Level + Mind |

### Social & Emotional

#### Bound by Oath
A promise made to you is never as easy to walk away from as an ordinary promise. Something in the exchange takes on real, felt weight.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **It Sticks.** A promise made to you doesn't fade the way promises usually do. It stays vivid in the mind of whoever made it, hard to shake. | Free | Close | Scene | — (no roll, passive) |
| 2 | **Felt Weight.** Even a small promise made to you settles onto the one who made it with real weight: they suffer Disadvantage on any roll made to act directly against it. | Action | Close | Scene | Power Level + Soul |
| 3 | **Hard to Break.** A significant oath sworn to you resists being broken. In the moment they try, contest it: win, and they can't bring themselves to act against it this scene. | Action | Close | Scene (extended) | Resisted Roll: Power Level + Soul vs. Resolve |
| 4 | **The Cost of Breaking It.** Break an oath made to you anyway, and the backlash is automatic: Disadvantage on every roll the oathbreaker makes until they make real amends. | Free | Close | Scene (extended) | Power Level + Soul vs. Resolve |
| 5 | **Unbreakable.** An oath sworn to you is, for all practical purposes, unbreakable: any attempt to act against it is treated as an automatic failure, no roll needed. | Action | Close | Scene (extended) | — (no roll, automatic) |

#### Chorus of Concord (empathic & emotional influence)
**Merged with Borrowed Feeling and Song Unheard, 2026-07-16; absorbed part of Commanding Presence the same day** (command-attention, default deference, and rallying belong here; the rest of Commanding Presence went to [Glamour](#glamour-uncanny-enchantment)). Emotion in a room isn't background noise to you. Whether you read and move it through touch and instinct, quiet conversation, or music, you have a real gift for finding the thread that pulls a mood where you want it to go.

**Special Effect note**: choose how this actually works for your character when you take this Gift — an empathic read-and-push through presence and touch, a calm and disarming conversational manner, or a hummed tune/performance that carries more than melody. The mechanic is identical regardless.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Read the Room, Turn It Back.** Tension coiled in a corner, warmth between two people, dread nobody's said out loud yet: you read it instantly. The room's attention works the same way in reverse. Want it, and a look or a word brings the noise down. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Willing Tension, Willing Deference.** A carefully composed face doesn't fool you, and your presence eases willing tension in individuals or a small audience. Walk into an ambiguous situation and people already default to deferring to you. | Action | Close | Instant | Power Level + Soul |
| 3 | **The Nudge It Needs.** Reach a mood already leaning somewhere and give it the push, even against real resistance: calming an anger, easing a fear, steadying a grief that isn't ready to let go yet. | Action | Close | Instant | Power Level + Soul vs. Resolve |
| 4 | **Hold and Rally.** Take hold of a specific, strong emotion directly, or help two willing people mend what's broken between them. A crowd's mood bends to you deliberately, and a group on the edge of breaking finds its nerve because you gave it one. | Action | Close/Medium | Instant/Scene | Power Level + Soul vs. Resolve |
| 5 | **Breaks Against You.** A mob's temper breaks against you like a wave against a seawall. Calm a crowd outright, forge consensus out of a room ready to tear itself apart, or override one resistant person's emotional state entirely, if only for a moment. | Action | Medium | Scene | Power Level + Soul vs. Resolve |

*Note: reading people/rooms lives entirely in [Mind's Whisper](#minds-whisper-telepathy--hyper-perception--spirit-confidant) (Mental & Psychic) — the old separate "Read the Room" entry was merged into it 2026-07-16.*

#### Glamour (uncanny enchantment)
**Merged with Silver Tongue and reframed, 2026-07-16; absorbed part of Commanding Presence the same day** (an order followed instantly, and obedience against instinct, belong here; the rest of Commanding Presence went to [Chorus of Concord](#chorus-of-concord-empathic--emotional-influence)). This isn't persuasion and it isn't command: no argument is won, no order given real weight. It's an otherworldly, faintly unsettling pull that people feel around you and can't quite explain, closer to fae enchantment than to charisma.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **An Uncanny Pull.** People extend you trust and attention you haven't earned, and can't say why. Not charm they could point to. | Free | Close | Scene | — (no roll, passive) |
| 2 | **Doubt Melts Away.** A minor doubt or objection melts away in your presence, like the person forgot why they were worried in the first place. | Action | Close | Instant | Power Level + Soul |
| 3 | **Not Persuaded. Enchanted.** Someone genuinely reluctant finds themselves agreeing anyway, and can't say why. An order given in the heat of a crisis gets followed, no hesitation, no second-guessing. | Action | Close | Instant | Power Level + Soul vs. Resolve |
| 4 | **Felt, Not Chosen.** A room defers to you unprompted, or a situation that should be a dead end reopens. Obedience and compliance that isn't chosen so much as felt. | Action | Medium | Scene | Power Level + Soul vs. Resolve |
| 5 | **Doesn't Take No.** Bend nearly anyone to your will, one person or a whole crowd, pulling against their own instincts if it comes to that. Not argument, not authority. | Action | Medium | Scene | Power Level + Soul vs. Resolve |

### Sound & Vibration

#### Perfect Pitch
Sound reaches you with a clarity that borders on unfair. Nothing whispered, hidden, or drowned out stays that way once you're listening.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Clean Sound.** A held breath, a footstep on carpet, a whispered word two rooms over: sounds most people would never register reach you clean. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Exactly What and Where.** A sound tells you exactly what made it and where, with a precision that borders on unnatural. | Free | Close | Instant | Power Level + Mind |
| 3 | **Through Walls.** Distance and barriers stop mattering much: hear real detail through a wall, or from well beyond normal earshot. | Action | Medium | Instant | Power Level + Mind |
| 4 | **Cuts Through the Noise.** Pick out the one sound that matters from a roaring crowd or a battlefield. | Free | Close | Instant | Power Level + Mind |
| 5 | **Nothing Stands Between.** Distance, interference, walls: none of it stands between your attention and the sound you want to hear. | Action | Long | Instant | Power Level + Mind |

#### Resonant Shatter
Every solid thing has a note it can't survive hearing, and you have an instinct for finding it.

*Note: musical/vocal emotional influence lives entirely in [Chorus of Concord](#chorus-of-concord-empathic--emotional-influence) (Social & Emotional), as one of its Special Effect options — the old separate "Song Unheard" entry was merged into it 2026-07-16.*

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **The Weak Point.** A structure hums back at you when you listen closely, its weak points plain in how it resonates. | Free | Touch | Instant | — (no roll, passive) |
| 2 | **Crack and Shatter.** Something small and already fragile answers a note you strike with a crack, then a shatter. | Action | Close | Instant | Power Level + Soul |
| 3 | **Comes Apart.** Glass, thin metal, anything breakable meets a focused burst of vibration and comes apart. | Action | Close | Instant | Power Level + Soul |
| 4 | **Patient Enough.** Sustained resonance cracks or destabilizes something substantial. Not fragile at all, just patient enough to find its breaking note. | Action | Close | Scene (sustained) | Power Level + Soul |
| 5 | **Brings It Down.** A wall, a structure, something significant: sound and vibration alone bring it down, given the chance to build. | Action | Close | Scene (sustained) | Power Level + Soul |

#### Voice of Thunder
Sound, in your hands, stops being just noise. It's pressure, force, a physical push that happens to come out of your throat.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Carries Far.** Your voice carries across a distance and a volume it has no business reaching, and never strains doing it. | Free | Long | Instant | — (no roll, passive) |
| 2 | **Sharp and Sudden.** A sound leaves you sharp enough to startle: the target suffers Disadvantage on their next roll. | Action | Close | Instant | Power Level + Soul vs. Defense |
| 3 | **A Physical Push.** Sound leaves your voice as a real push, enough to knock a target back a step or off balance (Trip/Shove), or deals damage as a Light weapon instead (**Base +3**) if you'd rather hurt than shove. | Action | Close | Instant | Power Level + Soul vs. Defense |
| 4 | **Punches Through.** A blast of sound lands where you aim it, punching through a target or straight through a structure in its path: **Base +6**. | Action | Medium | Instant | Power Level + Soul vs. Defense |
| 5 | **Levels What's in Front.** A wave that levels what's in front of it, or carries your voice across a battlefield: **Base +9**. | Action | Medium | Instant | Power Level + Soul vs. Defense |

### Technology & Constructs

#### Field Repair
Broken technology practically explains itself to you. It's a diagnostic instinct and a steady hand that turns wreckage back into working order.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Tells You What's Wrong.** Broken technology tells you exactly what's wrong with it the moment you lay eyes on it. No guesswork, no diagnostics needed. | Free | Close | Instant | — (no roll, passive) |
| 2 | **Patched Up.** With minimal tools and whatever's around, you patch a piece of technology back to full working order. | Action | Touch | Instant | Power Level + Mind |
| 3 | **Back to Full Function.** A badly damaged device comes back to full function in the field. No workshop, no spare parts, just you and a few minutes. | Action | Touch | Instant | Power Level + Mind |
| 4 | **Better Than It Started.** While repairing something, it comes back improved past its original specifications, not just restored. | Action | Touch | Instant | Power Level + Mind |
| 5 | **Restored or Upgraded.** Even severely damaged, complex technology comes back, restored or upgraded, with nothing but what's lying around. | Action | Touch | Instant | Power Level + Mind |

#### Spark of Invention
Given a problem and whatever's lying around, you build a solution. You have a knack for making the impossible fit into the time and materials you actually have.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Fast Fix.** Whatever's on hand becomes a fix: a jammed lock, a snapped strap, a sparking wire, patched together fast and good enough to hold. | Action | Touch | Instant | Power Level + Mind |
| 2 | **A Simple Device.** A working device comes together in your hands faster and better than the parts on the table should allow. | Action | Touch | Scene | Power Level + Mind |
| 3 | **A Clever Gadget.** A gadget takes shape, purpose-built for the exact problem in front of you. | Action | Touch | Scene | Power Level + Mind |
| 4 | **Beyond the Materials.** A sophisticated device comes out of your hands, built well beyond what your materials and time should have permitted. | Action | Touch | Scene (extended) | Power Level + Mind |
| 5 | **Shouldn't Be Possible.** You invent something that, by any reasonable account, shouldn't be possible with what you had on hand and how little time you had. | Action | Touch | Scene (extended) | Power Level + Mind |

#### Waking the Machine
Machines and constructs listen to you in a way they don't listen to anyone else. It starts as a suggestion and ends as fluid command.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Runs Smoother.** A simple mechanism runs a little smoother, a little more willingly, after a touch and a word from you. | Action | Touch | Scene | Power Level + Mind |
| 2 | **Follows an Instruction.** A basic construct or simple machine takes an elementary instruction from you and actually follows it. | Action | Touch | Scene | Power Level + Mind |
| 3 | **Animates Fully.** A straightforward construct or mechanism animates fully at your direction, carrying out a task on its own once set in motion. | Action | Touch | Scene | Power Level + Mind |
| 4 | **Judgment Calls.** A complex construct or machine takes real, nuanced direction from you: not just commands, but judgment calls within them. | Action | Close | Scene | Power Level + Mind |
| 5 | **No Gap Between.** A sophisticated construct or machine moves like an extension of your own will, command and execution with no gap between them. | Action | Medium | Scene | Power Level + Mind |

### Temporal

#### Borrowed Time (delay effects)
Consequences aren't as fixed to their moment as they seem. You have a limited but real ability to make something bad wait its turn.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **Felt Coming.** A beat before something bad happens, you feel it coming. Not what, not always why, but enough warning to brace. | Free | Self | Instant | — (no roll, passive) |
| 2 | **Bought a Beat.** A minor consequence hangs in the air for **1 round** longer than it should, just long enough for you to actually do something about it. | Action | Close | Instant | Power Level + Mind |
| 3 | **Real Time.** You buy real time against a looming effect or deadline, not forever, but for the rest of the scene, holding until you say otherwise. | Action | Close | Scene | Power Level + Mind |
| 4 | **Postponed.** Something significant, an injury's onset, a trap already sprung, a deadline already breached, gets meaningfully postponed at your word. | Action | Close | Scene | Power Level + Mind vs. Resolve |
| 5 | **Held Off Entirely.** A major consequence simply waits, held off entirely for as long as you keep pouring effort into holding it there. | Action | Close | Scene (sustained) | Power Level + Mind vs. Resolve |

#### Echo of What Was (psychometry)
The past doesn't fully leave a place or an object. It lingers in a residue only you can read, waiting for a touch to bring it back.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Faint Residue.** Lay a hand on an object or stand in a place, and its recent past bleeds through, faint and general: something happened here, and you can feel the shape of it. | Free | Touch | Instant | — (no roll, passive) |
| 2 | **Sharper Impression.** The impression sharpens into something you can describe: hazy, but tied to a specific past event, not just a feeling. | Action | Touch | Instant | Power Level + Mind |
| 3 | **A Clear Echo.** Something that happened here recently plays out for you, witnessed almost as though you'd been standing there yourself. | Action | Touch | Instant | Power Level + Mind |
| 4 | **Reaching Further Back.** The echo comes through sharp regardless of how far back you reach. The past doesn't blur just because it's old. | Action | Touch | Instant | Power Level + Mind |
| 5 | **History Laid Bare.** Any object or place, any distance of years: call up a vivid, fully detailed echo of what happened there, on demand. | Action | Touch | Instant | Power Level + Mind |

#### Frozen Instant (localized time-stop)
For one narrow slice of the world, time is something you can reach out and grab hold of, pausing it just long enough to change what happens next.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Beat Longer.** A falling glass, a swinging door: small, simple things hang in the air a beat longer than they should, giving you just enough time. | Action | Close | Instant | Power Level + Mind |
| 2 | **The Split-Second Edge.** Something slows, briefly and noticeably, handing you or an ally Advantage on the very next roll made because of it. | Action | Close | Instant | Power Level + Mind |
| 3 | **Stopped Dead.** A single small object or effect stops dead in place, held there for **1 round** before time remembers it exists. | Action | Close | Instant | Power Level + Mind |
| 4 | **Frozen Mid-Motion.** A person mid-motion or a mechanism about to trigger freezes in place at your word for **1 round**. | Action | Close | Instant | Power Level + Mind vs. Resolve |
| 5 | **Complete Stop.** Bring something to a complete stop, and it stays that way for as long as you hold your concentration on it. | Action | Close | Scene (sustained) | Power Level + Mind vs. Resolve |

#### Stolen Moment (speed/reaction & time perception)
**Merged with Fleet-Footed Fury, 2026-07-16.** Time doesn't pass at quite the same rate for you as it does for everyone else — every physical edge this Gift grants (endurance, outrunning pursuit, closing a gap in a blink) comes from that, not from raw muscle. It's a private head start built into how you experience the world, not a sprinter's legs.

| Level | Capability | Action | Range | Duration | Resolution |
|---|---|---|---|---|---|
| 1 | **A Half-Step Ahead.** Details other eyes slide right past register to you. Gain **+1 DoS** on your Initiative roll and on the first reactive roll you make against a sudden threat each scene. | Free | Self | Scene | — (no roll, passive) |
| 2 | **Outlasting the Chase.** Once you're moving, less time passes for you than for the ground you're covering. A sprint that would exhaust anyone else isn't tiring, full speed with no fade, for as long as the chase demands. | Free | Self | Scene | — (no roll, passive) |
| 3 | **The Blink.** Several seconds of thought and motion collapse into what looks, to everyone watching, like a single blink: enough to catch a fleeing car, a startled animal, anything not purpose-built to outrun you. | Action | Self | Instant | Power Level + Mind |
| 4 | **Outside Their Beat.** For a moment, the world stops keeping pace with you: act freely while everyone else is caught between one heartbeat and the next. You gain Advantage on the one roll you make during that stolen moment. | Action | Self | Instant | Power Level + Mind |
| 5 | **Your Own Clock.** Step onto a slice of time that belongs to you alone. Cross real distance in that stolen moment, a blur, a gust, and you're somewhere else, while the world outside crawls by at its normal pace. | Action | Close | Instant | Power Level + Mind |
