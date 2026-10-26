import type { GameState,MapId } from '../rules/state';

/** Boss victories flow straight into the scene previously blocked by the fight.
 * Keep the interaction as a replay/recovery entry, but do not mark it twice. */
export const BOSS_AFTERMATHS:readonly {map:MapId;won:string;done:string;interaction:string}[]=[
 {map:'rillbridge',won:'collectorDefeated',done:'villageFreed',interaction:'release'},
 {map:'relayhall',won:'worksWardenWon',done:'tomasRescued',interaction:'works-tomas'},
 {map:'conduit',won:'conduitGuardWon',done:'extractionStopped',interaction:'heart-release'},
 {map:'breakwater',won:'worksGateWon',done:'harborOpened',interaction:'works-wheel'},
 {map:'sanctuary',won:'roadGuardWon',done:'signalCut',interaction:'sanctuary-cable'},
 {map:'sanctuary',won:'sanctuaryWardenWon',done:'anchorsKnown',interaction:'sanctuary-record'},
 {map:'anchorforge',won:'furnaceWon',done:'hammerplainFreed',interaction:'forge-anchor'},
 {map:'signalwall',won:'aurelWon',done:'dawnwatchFreed',interaction:'wall-anchor'},
 {map:'mirrorward',won:'wardEngineWon',done:'windmereFreed',interaction:'wind-anchor'},
 {map:'observatory',won:'sunSerpentWon',done:'desertReleaseReady',interaction:'desert-release'},
 {map:'stillcity',won:'capitalProcessionWon',done:'capitalStreetFreed',interaction:'city-release'},
 {map:'wintershrine',won:'winterDragonWon',done:'northSealBroken',interaction:'north-release'},
];
export function pendingBossAftermath(state:Pick<GameState,'location'|'flags'>){
 return BOSS_AFTERMATHS.find(scene=>scene.map===state.location.map&&state.flags[scene.won]&&!state.flags[scene.done]);
}
