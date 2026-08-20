# Resources

A structurally different kind of thing from [Boons](boons.md): a scalable resource on a 1-5 level scale, not a binary yes/no trait.

## What a Resource Is

A Resource represents a currency or standing the character can draw on or lean on narratively - money, contacts, a reputation, a home base - not a bonus applied to a roll. Each Resource is rated **1-5**, and each level is a cumulative, defined step up in scope, not a numeric roll bonus.

**Cost**: at character creation, each level costs a flat **1 point** from the [Resources pool](character-creation.md#resources-pool) - a Resource at Level 3 costs 3 points total. After creation, raising a Resource by one level costs a flat **3 XP** per step.

## Pushing a Resource

Each Resource's Level table below defines what's available for free, no roll required. When a character wants to draw on a Resource for something beyond that free scope, roll a **Resource Check**: **2d10** against **Resource Level + (10 − Resource Index)**, roll-under. Critical results apply as normal (a roll of 2 is always a success, a roll of 20 is always a failure, regardless of the target number). No Skill is involved - a flat roll against the Resource itself, the same shape as the [Gift Check](gifts.md#resolution).

**Resource Index** is a flat **1-6** rating for how far beyond a Resource's ordinary reach the request goes - its own scale, not the general [Difficulty Chart](rules.md#difficulty-chart). It inverts the same way [Defense](rules.md#defense-derived-stat) does: a *lower* Resource Index is easier (Resource Index 1 adds **9** to the target), a *higher* one is harder (Resource Index 6 adds only **4**, the minimum any Resource Check can add).

- **Success**: the character gets what they were after, no further cost.
- **Failure**: the character still gets what they were after - the ask goes through either way - but the Resource's Level drops by **1** (to a minimum of 1) until the start of the next **Month**, representing it stretched thin: savings drained, favors called in, goodwill spent. A Resource at a reduced Level uses that lower Level for everything, including further Resource Checks made while it's still reduced.

**Reaching beyond your means**: a Resource Index up to **2 higher** than the Resource's current effective Level can be attempted - anything further out of reach can't be attempted at all. Reaching that far always gets the character what they were after, but drops the Resource's Level to **0** for a Month (not just 1) regardless of whether the roll succeeded or failed - **unless the roll is a critical success**, which resolves the attempt as an ordinary free success with no cost at all.

**Resource Index 6** is always treated as reaching 2 levels beyond the Resource's current Level, no matter how high that Level actually is - and it's the one case a critical success can't save: a Resource Index 6 attempt always drops the Resource to 0 for a Month, full stop, even on a critical success.

## Wealth at Character Creation

Buying gear (see [Weapons & Equipment](weapons.md)) at character creation uses a dedicated procedure, not the general [Pushing a Resource](#pushing-a-resource) rule above.

A character's **creation-Wealth** starts at **2**, unless they spent Resources Pool points on Wealth, in which case their purchased Level is used instead. Every gear item carries its own **Wealth rating**. **Every purchase during character creation requires a roll - there is no automatic free item, even one at or under current creation-Wealth.**

1. Find the **gap**: the item's Wealth rating minus current creation-Wealth. This can be zero or negative for an item at or under current creation-Wealth.
2. If the gap is **more than current creation-Wealth**, the item can't be afforded at all - no roll.
3. Otherwise, roll a **Wealth Check**: 2d10 against creation-Wealth + Difficulty **6**, roll-under, standard critical results apply.
   - **Success**: the item is free.
   - **Failure**: the character still gets the item. Creation-Wealth drops by the gap, **floored at a minimum of 1** - even an inexpensive item with no real gap still costs at least 1 Level on a failed roll. A **critical failure** doubles this loss.

Creation-Wealth carries across every purchase made during this shopping pass - once no remaining item is affordable (via a viable roll), gear shopping is over for this character creation. **This pool is temporary bookkeeping only**: it has no effect on the character's actual Wealth Resource once play begins, which stays at whatever Level was actually purchased. Once creation ends, this procedure stops applying entirely - every purchase from then on uses the general [Pushing a Resource](#pushing-a-resource) rule above, unaffected by anything that happened during creation shopping.

| Resource | What Scales by Level |
|---|---|
| Base | How developed, defended, or well-equipped the headquarters/safehouse is |
| Black Market Access | How deep into illegal or off-the-books trade the connections reach |
| Contacts | How large, capable, or well-placed the network is |
| Corporate Backing | How much a legitimate business entity can move, fund, or cover |
| Debts Owed | How much real leverage is owed, in favors people can't easily refuse |
| Fame | How widely recognized the character is, and how strongly people react to it |
| Followers | How many, how skilled, or how loyal the group is |
| Fringe Benefit | The reach/exclusivity of the license, membership, clearance, or legal right |
| Guild Standing | How much rank and pull the character holds within a specific trade or professional body |
| Informant Network | How wide and reliable the web of low-level eyes and ears is |
| Legal Counsel | How capable and well-connected the lawyer or legal team is |
| Media Contact | How much a story can be shaped, planted, or killed before it runs |
| Medical Access | How much discreet, high-quality medical care can be called on |
| Occult Library | How comprehensive, rare, or dangerous the collection of esoteric material is |
| Safehouse Network | How many scattered bolt-holes are maintained, and how well-stocked each is |
| Sanctuary Standing | How protected the character is within one specific safe territory |
| Signature Possession | How significant the one prized item owned actually is |
| Spiritual Standing | How much weight the character's name carries within a specific religious or spiritual community |
| System Access | How deep and wide the character's reach into digital systems and networks already is |
| Territory | How much real ground answers to the character specifically |
| Underworld Reputation | How known, trusted, or feared the character is within criminal and hidden-world circles |
| Vehicle | How distinctive, capable, or valuable the vehicle is |
| Wealth | How much disposable financial resource is available to draw on |

## Per-Level Content

| Level | Base | Contacts | Fame |
|---|---|---|---|
| 1 | A dedicated, secure space of your own - a real hideout, workshop, or safehouse beyond an ordinary home; basic, but defensible | One reliable contact for small favors or info | Known within a small local circle |
| 2 | A proper base with solid amenities and dependable security | A handful of contacts spanning a couple of fields | Recognized across a city or subculture |
| 3 | Well-equipped, with real security and specialized rooms | A broad network spanning most of a city | Known regionally or nationally |
| 4 | Fortified and staffed, with serious defenses and advanced equipment | An extensive network with regional reach, including a few influential names | Broadly famous - recognized by strangers regularly |
| 5 | A near-impenetrable, fully self-sufficient stronghold | A vast network reaching into any relevant field or region, including powerful people | World-renowned, a household name |

| Level | Followers | Fringe Benefit | Vehicle |
|---|---|---|---|
| 1 | A single loyal follower or apprentice | A basic hobbyist license/membership | Reliable but unremarkable |
| 2 | A small handful of modestly capable followers | A recognized professional credential (licensed trade, press pass) | One standout feature - notably fast, armored, or distinctive |
| 3 | A coordinated, reasonably capable crew | Restricted-access clearance - into secured facilities, government-adjacent circles | Significantly customized, high-performance |
| 4 | A sizable, well-organized group with real capability | High-level clearance - classified access, executive-level standing | Rare and exceptional - armored, military-grade, or famous |
| 5 | A substantial, highly capable and loyal organization | Near-total access - opens virtually any door in its domain | One-of-a-kind, legendary in capability or reputation |

| Level | Occult Library | System Access |
|---|---|---|
| 1 | A modest personal collection - well-thumbed books on folklore and the occult, covering common knowledge | Access to public records and consumer-level databases and systems |
| 2 | A solid working library, with enough breadth to research most common supernatural phenomena and a few genuine rarities | Real internal access into a specific organization's systems - a company, a local agency |
| 3 | An extensive collection, including forbidden or suppressed texts - enough to dig into obscure or actively dangerous topics | Broad access spanning multiple systems and networks, reaching into mid-level corporate or government databases |
| 4 | A renowned archive sought after by scholars and occultists alike, holding material found nowhere else publicly | Deep access into high-security systems - classified government or corporate networks, real backdoors |
| 5 | A legendary collection - texts thought lost or mythical; knowledge dangerous enough that possessing it alone draws attention | Near-total digital reach - access into almost any system that exists, the kind of reach that alarms anyone who learns of it |

| Level | Wealth |
|---|---|
| 1 | Financially comfortable - bills, rent, and daily needs covered without stress, plus modest savings and room for the occasional splurge |
| 2 | Well-off - real disposable income, enough saved to absorb an emergency without real strain |
| 3 | Wealthy; owns property outright, can make major purchases freely |
| 4 | Very wealthy; can finance a major undertaking outright |
| 5 | A fortune large enough to move markets or bankroll entire operations |

| Level | Safehouse Network | Underworld Reputation | Medical Access |
|---|---|---|---|
| 1 | One additional modest bolt-hole beyond your main Base - a spare room, a lockup, somewhere to lay low for a night | A name a few low-level players recognize and treat with mild caution | A single sympathetic nurse or paramedic willing to patch you up off the books |
| 2 | A small handful of bolt-holes across a city, each stocked with basic supplies and a change of clothes | Known within a specific city's criminal scene as someone not worth crossing | A private doctor who treats you (and a few others) no questions asked |
| 3 | A network spanning a region, each site defensible and stocked for an extended stay | Respected or feared across a city's underworld broadly, name carries real weight in negotiations | A small discreet clinic with real equipment, staffed by people who won't talk |
| 4 | A network reaching into neighboring regions, with a few sites hardened and hidden well enough to withstand real searching | Known regionally among serious players - crime bosses, cartels, syndicates - as someone to reckon with | A private hospital wing or trauma team on standby, capable of handling serious, unusual injuries |
| 5 | A network spanning the whole country (or equivalent scale), any site capable of disappearing you completely, indefinitely | A legend in the underworld nationally or beyond, invoked as a cautionary tale or a name that opens (or closes) any door | A world-class covert medical operation, capable of handling anything short of death itself, anywhere you can reach it |

| Level | Legal Counsel | Media Contact | Black Market Access |
|---|---|---|---|
| 1 | A single competent lawyer, reliable for everyday trouble | One sympathetic local journalist willing to hear you out | A single fence or dealer for common contraband |
| 2 | A small firm that can handle real charges and knows which favors to call in | A standing relationship with a local outlet - can get a story placed or softened | A working relationship with a local black-market network - weapons, drugs, stolen goods |
| 3 | A firm with real courtroom pull and connections into the local justice system | Real pull with a regional news network - can plant, spike, or reframe a story reliably | Real standing with a regional network, access to rarer or more dangerous goods |
| 4 | A firm capable of making serious charges quietly disappear, with reach into regional courts and agencies | Influence reaching national media - a story dies or runs the way you want it to, most of the time | Deep pull into a national or international smuggling network, most anything can be found for a price |
| 5 | Legal firepower capable of making almost anything short of the worst crimes vanish, nationally | Command of the narrative at a national or international level - what the world believes happened is substantially up to you | A name in the black market itself - you don't just buy from the network, you're a fixture in it, able to source almost anything that exists |

| Level | Spiritual Standing | Corporate Backing | Informant Network |
|---|---|---|---|
| 1 | A respected member of a local congregation or circle | A small business willing to carry you on the books, light cover and minor funding | A couple of regular tipsters in one neighborhood |
| 2 | A trusted figure within a wider spiritual community, sought out for guidance | A real company with legitimate revenue, able to fund modest operations and provide solid cover | A working network across a city - cabbies, bartenders, doormen - who pass along what they see |
| 3 | Real authority within the community - your word carries weight in real decisions | A mid-size company with real assets, capable of funding serious operations and absorbing real scrutiny | A broad network spanning a whole city's worth of ordinary people, reliable and reasonably fast |
| 4 | A recognized leader or elder, influence reaching related communities elsewhere | A major regional company, resources and cover to match, capable of weathering real investigation | A network with regional reach, fast enough to catch developing situations as they happen |
| 5 | A figure of real spiritual significance, recognized and deferred to across the faith or tradition broadly | A multinational corporation's backing, effectively bottomless resources and cover strong enough to survive nearly anything | An extensive network reaching anywhere relevant, near-real-time awareness of anything worth knowing |

| Level | Signature Possession | Sanctuary Standing | Guild Standing |
|---|---|---|---|
| 1 | A well-made, quality item - reliable, a cut above ordinary | A single establishment where you're recognized and safe from casual trouble | A dues-paying member in reasonably good standing |
| 2 | An item with a real history or reputation of its own, recognized by those who know to look | A small protected zone - a block, a building complex - where real trouble is unwelcome | A recognized, respected member, able to call in modest favors |
| 3 | A genuinely rare or exceptional item, sought after by serious collectors or rivals | A genuine sanctuary territory, actively enforced, real consequences for violating it | A senior member with real influence over local guild decisions |
| 4 | An item of real renown, recognized on sight by anyone versed in its field | A significant, well-known sanctuary, respected and enforced across multiple factions | A leadership figure, influence reaching the guild's regional or national body |
| 5 | A legendary item, known even to people who've never seen it - and often coveted because of it | A sanctuary recognized and honored practically everywhere relevant, violating it carries consequences almost no one is willing to risk | A defining figure within the guild itself, decisions of real consequence run through you |

| Level | Debts Owed | Territory |
|---|---|---|
| 1 | One person who owes you a real, acknowledged favor | A single block or building genuinely under your influence |
| 2 | A small handful of people who owe you, each for something genuinely significant | A modest neighborhood where your word carries real weight |
| 3 | A broader circle of real debts, enough to call in meaningful help when it matters | A significant district, actively held and defended |
| 4 | Debts owed by people with real capability or standing of their own, favors that can move real weight | A substantial stretch of a city, real infrastructure and people answering to you |
| 5 | A web of serious debts reaching people of real power, the kind of leverage that can bend outcomes that matter | Territory on the scale of a city or region, genuinely yours in every practical sense |

