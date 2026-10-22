import type { GameState } from '../../rules/state';
export const JOURNAL:Record<string,{title:string;text:string}>={
 airfieldSeen:{title:'The survey ship',text:'Superintendent Durn has seized Alda’s survey ship for Hammerplain. Bram’s ferry stores are being unloaded. Clear the confiscation detail at the gangway.'},
 airfieldClear:{title:'A flight out',text:'The airfield guards have withdrawn. Meet Alda at the gangway to board the survey ship.'},
 firstFlightSeen:{title:'Three landings',text:'Alda will fly us between the anchor stations. Hammerplain powers its anchor from a foundry; Petra knows Dawnwatch’s garrison, and Celia knows Windmere’s medicine works. Choose a landing on the flight chart. Tomas keeps our railway messages at the refuge.'},
 hammerplainSeen:{title:'Engines for the street',text:'Hammerplain’s residential street has stopped while the foundry feeds the anchor. Durn is seizing the ordinary engines Hester’s crew built for the houses. Hester can change the works over if we reopen the manual cooling race. Reach it by the eastern walkway.'},
 coolingSeen:{title:'The red wheel',text:'The cooling gate is locked behind the foundry guards. Choose the freight lift past ranged crows, or the shallow race walk past hounds. Then turn the red wheel on the eastern walkway.'},
 coolingClear:{title:'The manual gate',text:'The approach is clear. Hester will hold the pawl while Orrin turns the red cooling wheel. The crew is waiting to bring the starters through.'},
 coolingOpened:{title:'The anchor gantry',text:'The cooling race is open. Hester’s crew is bringing the replacement engines online. Take the upper gantry to disconnect the anchor.'},
 forgeGantrySeen:{title:'The pouring lane',text:'Durn has ordered the furnace carrier to melt the finished engines. Hold it off while Hester’s crew takes the load. Its red warnings mark the next pour; its tracks leave hot metal behind.'},
 furnaceFallen:{title:'The breaker',text:'The carrier is stopped. Its balanced expansion valve is in the bag for Orrin. Pull the breaker above the gantry to disconnect the anchor.'},
 hammerplainFreed:{title:'The street wakes',text:'The anchor cable is disconnected. Hester’s crew holds Durn in the shift office. Return to the casting floor to check the engines and the street.'},
 hammerplainComplete:{title:'Hammerplain · a working engine',text:'People in the street are moving again. Hester started the engine without Orrin’s help; the crew can run the houses on its own. They are sending railway engines, two fitters and a spare drive for the survey ship. Return aboard when ready.'},
 fleetSighted:{title:'The imperial fleet',text:'Alban’s fleet has appeared above the inland line. Alda can fly clear of it. Hammerplain’s anchor stays disconnected; Dawnwatch and Windmere remain intact.'},
};
export function objective(s:GameState):string{
 const f=s.flags;
 if(!f.airfieldGuardWon)return 'Clear the guards at the survey gangway.';
 if(!f.airshipOwned)return 'Meet Alda at the gangway and board the survey ship.';
 if(!f.firstFlightSeen)return 'Join Alda at the flight chart.';
 if(!f.hammerplainSeen)return 'Choose Hammerplain at the forward flight chart.';
 if(!f.coolingSeen)return 'Follow the eastern walkway to Hammerplain’s cooling race.';
 if(!f.forgeApproachWon)return 'Choose the freight lift or the shallow race walk at the cooling junction.';
 if(!f.coolingOpened)return 'Turn the red cooling wheel on the eastern walkway.';
 if(!f.furnaceWon)return 'Take the upper gantry and stop the furnace carrier.';
 if(!f.hammerplainFreed)return 'Pull the anchor breaker above the gantry.';
 if(!f.hammerplainComplete)return 'Return to the casting floor and check the replacement engines.';
 if(!f.fleetSighted)return 'Return to the survey ship at the western landing.';
 return 'Act I complete · Hammerplain is free. Rest aboard or revisit.';
}
