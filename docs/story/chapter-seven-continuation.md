# Chapter Seven — saved route and completed campaign

Entry: a current version-11 Chapter Six save at `chapter-seven:hollow-sun`, with `chapterSixComplete`, `nellRecovered`, the Emperor's defeat and good landing. The loader must finish the native domain/boss kit before `beginChapterSeven` consumes the departure. No migration, new cure, resource reset or forced active formation occurs. The ill Lightbearer ending never enters.

| Location | Required progress and next checkpoint |
| --- | --- |
| `hollowsill` | Upward camera reveal, warning and visible withdrawal → `domainEntered`; the god leaves the stair clear. Supplies and Alda. |
| `takenwater` | `domainWaterSeen`; confront/win `domain-hounds`, then `domain-collector`; release → `takenPeopleFreed`. |
| `firstfield` | `firstHarvestSeen`; confront/win `domain-furnace`; release → `harvestFreed`; optional lamp → `domainReflectorTaken`. |
| `quietward` | `firstHospiceSeen`; confront/win `domain-ward`; patient release → `wardPeopleFreed`. |
| `seasonstreet` | `seasonStreetSeen`; optional `domain-patrol` opens the local rest/supplies stop and awards Kit’s sight; confront/win `domain-dragon`; road release → `seasonsFreed`. |
| `lastrefuge` | Arrival → `lastRefugeSeen`; repeatable rest/supplies, companion conversations and final stair. |
| `sunthrone` | `benefactorSeen`; `benefactorBodyConfronted/Won`; transformation → `hollowSunSeen`; `benefactorSunConfronted/Won`; fragment scene → `fragmentReturned`; `benefactorHeartConfronted/Won`; release → `daysReturned`, then travel home. |
| `homecoming` | Arrival → `homecomingSeen`; Tomas, Iona, cap and ordinary train; board for the sea. |
| `seaholiday` | Arrival → `realSeaSeen`; picnic/water conversations; ending interaction → `chapterSevenComplete`, null boundary. Reload reopens the completion panel. |

All source releases, transformations and arrivals commit only on completion/skip. Restored won-but-unreleased checkpoints resume automatically. Earlier domain roads and the last refuge remain reachable before final release, including between forms. A completed fragment return never grants another shard. The mooring and last-refuge training counters retain all five recruited, quest-unlocked specialties, including Kit’s river training and Nell’s housing, at their original prices and with shared once-only purchase flags. `daysReturned` permits only the throne transition and epilogue maps; completion belongs only at the real sea. Every battle reward is once-only and enters the shared bag. Five final fittings, a crossing coat and levels 13/14/15 at 5200/6600/8200 XP support progression without automatic equipment changes.

The pressure collector has no earth-plate restriction, so all legal one-to-three formations can progress. Repeated furnace/ward/dragon encounters use the shared rules/presentation with their own tactical floors and authored numbers. The final forms occupy 19/19/7 contacts, have fixed round warnings, alternate distinct area shapes and a zero-attack fourth round. Taunt redirects actual cells; Dazzle is consumed per attack, barriers work normally, areas hit each body once, and no body can be pushed or entered. The sun and heart also summon up to two divine minions (a Sun herald and Glass wing) on odd-round source turns; arrivals act from the next round, and source death disperses them. The mantle remains unchanged. See `docs/combat-upgrade.md` for timing and safe arrival rules.

`Begin Chapter Seven (canonical)` and `Begin final refuge (canonical)` are Vite-only authored fixtures. Bosses → The Benefactor exposes all three actual campaign forms without rewards or campaign writes; the earlier off-story fixture remains separately labeled. Maps → Ch 7 and Music → Ch 7 review real assets/scores. Full journeys, ordinary combat, artwork/audio and missing-asset tests remain outside default CI.

Authoring: `npm run art:seven` regenerates the native SVG/Tiled scenes, accepted Benefactor motion, two additional forms and common-enemy recolors. It preserves editable primary art/portraits. No bitmap sheets or new production dependencies. The per-image 128 KiB guard still applies.

Nell and Kit’s revised affection follows [their arc notes](nell-kit-arc.md), including the recovery gate and real-sea payoff.

Petra’s accountability continues through [her arc notes](petra-arc.md): a Cinderbank passenger declines her help, she sends Dena her own account after Alban’s death, and she commits to answer the families in person after the sea trip. Neither her service nor the final victory grants a pardon.

Celia’s [personal arc](celia-arc.md) follows her uncertainty as a teacher through Sera’s support after Windmere, trusting Ines with Nell’s treatment, and accepting company and rest herself. Sera is a former pupil; Celia never knew the omitted pledge before the sanctuary discovery.

Orrin’s [crew-trust thread](orrin-arc.md) pays off Hammerplain at the capital patient hoist: he leaves Hester’s fitters to complete their own repair, sees it support the evacuation, and later hands the gate watch to the porter. The sea trip lets him rest while someone else runs the train.

The party’s [relationships while traveling](party-relationships.md) develop through shared work, disagreements, mutual care and a seaside card game. The optional deck talks adapt to regional progress; existing individual arcs and Nell’s recovery gates remain intact.


## Completion film

After the real-sea ending interaction commits `chapterSevenComplete` and saves,
the shared 44-second vector film plays before the existing completion panel.
It revisits the release, ordinary train and holiday as a wordless epilogue;
the playable station/shore scenes and all their choices remain intact. It shows
surviving travelers only. Ansel is represented by his cap at the office, with an
empty hook beneath it. There is no resurrection or reset.

The film is skippable, pauseable and replayable from completion. Reload opens
the completion panel directly. Its renderer changes no flags, locations,
resources, equipment, formation or save version. Headless story hosts without
the optional film service continue directly to the existing boundary callback.
The workshop reviews the same film without requiring or changing a save.
