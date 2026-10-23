# Chapter Seven — saved route and completed campaign

Entry: a current version-10 Chapter Six save at `chapter-seven:hollow-sun`, with `chapterSixComplete`, `nellRecovered`, the Emperor's defeat and good landing. The loader must finish the native domain/boss kit before `beginChapterSeven` consumes the departure. No migration, new cure, resource reset or forced active formation occurs. The ill Lightbearer ending never enters.

| Location | Required progress and next checkpoint |
| --- | --- |
| `hollowsill` | Entry scene → `domainEntered`; supplies and Alda. |
| `takenwater` | `domainWaterSeen`; confront/win `domain-hounds`, then `domain-collector`; release → `takenPeopleFreed`. |
| `firstfield` | `firstHarvestSeen`; confront/win `domain-furnace`; release → `harvestFreed`; optional lamp → `domainReflectorTaken`. |
| `quietward` | `firstHospiceSeen`; confront/win `domain-ward`; patient release → `wardPeopleFreed`. |
| `seasonstreet` | `seasonStreetSeen`; optional `domain-patrol`; confront/win `domain-dragon`; road release → `seasonsFreed`. |
| `lastrefuge` | Arrival → `lastRefugeSeen`; repeatable rest/supplies, companion conversations and final stair. |
| `sunthrone` | `benefactorSeen`; `benefactorBodyConfronted/Won`; transformation → `hollowSunSeen`; `benefactorSunConfronted/Won`; fragment scene → `fragmentReturned`; `benefactorHeartConfronted/Won`; release → `daysReturned`, then travel home. |
| `homecoming` | Arrival → `homecomingSeen`; Tomas, Iona, cap and ordinary train; board for the sea. |
| `seaholiday` | Arrival → `realSeaSeen`; picnic/water conversations; ending interaction → `chapterSevenComplete`, null boundary. Reload reopens the completion panel. |

All source releases, transformations and arrivals commit only on completion/skip. Restored won-but-unreleased checkpoints resume automatically. Earlier domain roads and the last refuge remain reachable before final release, including between forms. A completed fragment return never grants another shard. `daysReturned` permits only the throne transition and epilogue maps; completion belongs only at the real sea. Every battle reward is once-only and enters the shared bag. Five final fittings, a crossing coat and levels 13/14/15 at 5200/6600/8200 XP support progression without automatic equipment changes.

The pressure collector has no earth-plate restriction, so all legal one-to-three formations can progress. Repeated furnace/ward/dragon encounters use the shared rules/presentation with their own tactical floors and authored numbers. The final forms occupy 19/19/7 contacts, have fixed round warnings, alternate distinct area shapes and a zero-attack fourth round. Taunt redirects actual cells; Dazzle is consumed per attack, barriers work normally, areas hit each body once, and no body can be pushed or entered.

`Begin Chapter Seven (canonical)` and `Begin final refuge (canonical)` are Vite-only authored fixtures. Bosses → The Benefactor exposes all three actual campaign forms without rewards or campaign writes; the earlier off-story fixture remains separately labeled. Maps → Ch 7 and Music → Ch 7 review real assets/scores. Full journeys, ordinary combat, artwork/audio and missing-asset tests remain outside default CI.

Authoring: `npm run art:seven` regenerates the native SVG/Tiled scenes, accepted Benefactor motion, two additional forms and common-enemy recolors. It preserves editable primary art/portraits. No bitmap sheets or new production dependencies. The per-image 128 KiB guard still applies.
