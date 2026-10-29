import type { GameState } from '../../rules/state';
export const JOURNAL: Record<string, { title: string; text: string }> = {
  coast: { title: 'Iron Coast exchange', text: 'A barred coach is waiting at the exchange. Alban seized a courier’s medicine and letters. Speak to the courier at the loading gate once Alban has gone.' },
  kit: { title: 'The courier', text: 'Kit saw Tomas at the transfer window. He is guiding us to the coach to recover his seized deliveries while we look for Tomas. The signal walk has crows; the loading gate has an armored guardian. Choose our approach at either entrance. His crossbow can fire from cover, and Piercing bolt ignores armor.' },
  trainRaid: { title: 'The guard is down', text: 'We reached the barred coach. Open its door and get the prisoners out.' },
  prisoners: { title: 'Tomas’s transfer', text: 'The prisoners are free. A freed prisoner kept Tomas’s transfer slip for Nell. He is at the imperial conduit works outside the capital. His note says the collectors feed the engines. We took a medical-train clearance from the dispatch case. Escort everyone west to the railway ward.' },
  ward: { title: 'The delivery book', text: 'Dena received Kit’s medicine and took in the prisoners. Our clearance gives us a route to the capital, but Nell chose an extra stop for the families at Cinderbank. Kit still has a letter for the family at the green door. Dena is coming to care for the passengers.' },
  settlement: { title: 'The capital comes first', text: 'Alban ordered Cinderbank collected despite the families still waiting there. Petra asked for the collection to stop but still followed Alban’s orders. Orrin found a release latch. Open the casing, then keep the loading route clear while Dena brings the families aboard.' },
  coastCollector: { title: 'The loading route', text: 'Orrin stopped the collector and Dena brought the families through the loading walk. The medical coaches are full. Check with Dena beside the coal shed before leaving.' },
  evacuation: { title: 'A way onto the capital line', text: 'Cinderbank can move again. The survivors have boarded the medical coaches. Petra accepts the patients’ clearance but insists that Nell surrender the fragment and stay behind. Alban has put her across the far crossing. Defeat Petra to reach our engine.' },
  recapture: { title: 'The train is ours', text: 'Petra is disarmed and the crossing is ours. Alban still has the crows’ command rod. Get to the engine and leave with the rescued passengers.' },
  capitalDeparture: { title: 'The capital line', text: 'The medical train is leaving with the rescued prisoners and Cinderbank families. Kit is coming with Nell and Orrin. After her defeat, Petra refused Alban’s order to fire on the coaches and lost her commission. She stayed to countermand that order among her soldiers; she has not joined us. Tomas is alive at the imperial conduit works. Our medical clearance gives us a route to the conduit works. Next: Chapter Three — The Conduit Works.' },
};
export function objective(s: GameState): string {
  const f = s.flags;
  if (f.chapterTwoComplete) return 'Chapter Two complete. Next: The Conduit Works.';
  if (!f.kitJoined) return 'Meet Kit at the loading gate of the prison train.';
  if (!f.trainRaidWon) return f.raidPlanned ? `Breach the ${f.raidDiversion ? 'signal walk' : 'loading gate'}.` : 'Choose the signal walk or loading gate to raid the train.';
  if (!f.prisonersFreed) return 'Open the barred coach and free the prisoners.';
  if (!f.wardSeen) return 'Escort the prisoners west to the railway ward.';
  if (!f.settlementSeen) return 'Follow Kit’s route to Cinderbank siding.';
  if (!f.coastCollectorWon) return 'Open the collector, then protect the families’ loading route.';
  if (!f.evacuationReady) return 'Check with Dena beside the coal shed.';
  if (!f.recaptureWon) return 'Defeat Petra at the far crossing to reach the engine.';
  return 'Board the engine beyond the far crossing.';
}
