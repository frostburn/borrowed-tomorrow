import type { GameState } from '../../rules/state';
export const JOURNAL: Record<string, { title: string; text: string }> = {
  coast: { title: 'Iron Coast exchange', text: 'A barred coach is waiting at the exchange. Alban seized a courier’s medicine and letters. Speak to the courier at the loading gate once Alban has gone.' },
  kit: { title: 'The courier', text: 'Kit saw Tomas at the transfer window. He is guiding us to the coach to recover his seized deliveries while we look for Tomas. The signal walk has crows; the loading gate has an armored guardian. Choose our approach at either entrance. His crossbow can fire from cover, and Piercing bolt ignores armor.' },
  trainRaid: { title: 'The guard is down', text: 'We reached the barred coach. Open its door and get the prisoners out.' },
  prisoners: { title: 'Tomas’s transfer', text: 'The prisoners are free. A freed prisoner kept Tomas’s transfer slip for Nell. He is at the palace engine works in the capital. His note says the collectors feed the engines. We took a medical-train clearance from the dispatch case. Escort everyone west to the railway ward.' },
  ward: { title: 'The delivery book', text: 'Kit delivered the medicine and had his book signed. The official hospital refused the prisoners. Their families are waiting at Cinderbank siding; Kit still has their letters. Our clearance can get the ward’s coaches onto a siding below the capital. Rest here, then collect the families.' },
  settlement: { title: 'The capital comes first', text: 'Alban ordered Cinderbank collected despite the families still waiting there. Petra cleared the platform while we went for the collector’s guard. Stop the guard by the coal shed.' },
  coastCollector: { title: 'Open the casing', text: 'The collector’s guard is down. Break open the casing beside the coal shed so the families can get out.' },
  evacuation: { title: 'A way onto the capital line', text: 'Cinderbank can move again. The survivors have boarded the medical coaches. Petra changed the points for us and went to call her soldiers off the west gate. Alban is blocking the far crossing. Defeat him to reach our engine.' },
  recapture: { title: 'The train is ours', text: 'Alban has fallen back. Board the engine beyond the crossing and leave with the rescued prisoners and families.' },
  capitalDeparture: { title: 'The capital line', text: 'The medical train is leaving with the rescued prisoners and Cinderbank families. Kit is coming with Nell and Orrin. Petra stayed to bring her soldiers away from the west gate; she has not joined us. Tomas is alive at the palace engine works. Our medical clearance gives us a route into the capital. Next: Chapter Three — Beneath the Palace.' },
};
export function objective(s: GameState): string {
  const f = s.flags;
  if (f.chapterTwoComplete) return 'Chapter Two complete. Next: Beneath the Palace.';
  if (!f.kitJoined) return 'Meet Kit at the loading gate of the prison train.';
  if (!f.trainRaidWon) return f.raidPlanned ? `Breach the ${f.raidDiversion ? 'signal walk' : 'loading gate'}.` : 'Choose the signal walk or loading gate to raid the train.';
  if (!f.prisonersFreed) return 'Open the barred coach and free the prisoners.';
  if (!f.wardSeen) return 'Escort the prisoners west to the railway ward.';
  if (!f.settlementSeen) return 'Follow Kit’s route to Cinderbank siding.';
  if (!f.coastCollectorWon) return 'Stop the collector’s guard beside the coal shed.';
  if (!f.evacuationReady) return 'Break open the collector and evacuate the families.';
  if (!f.recaptureWon) return 'Defeat Alban at the far crossing to reach the engine.';
  return 'Board the engine beyond the far crossing.';
}
