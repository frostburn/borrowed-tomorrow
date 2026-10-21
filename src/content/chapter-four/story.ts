import type { GameState } from '../../rules/state';
export const JOURNAL:Record<string,{title:string;text:string}>={
 refugeSeen:{title:'Blankets for the harbor',text:'Tomas and every medical passenger are safe at the railway refuge. Bram’s ferry crews are stranded behind the harbor gate. Dena sent blankets for Celia at the pump house. Take the eastern harbor path.'},
 worksArrival:{title:'Celia at Breakwater',text:'Celia is treating the ferry crews. The capital’s signal has locked the sea gate and stopped patches of the tide. Celia joined us to stop it. Clear the gate guards by the dry chain walk or the shallow pump floor, then turn the winding wheel on the middle pier. The survey cart holds a sight for Kit.'},
 worksClear:{title:'The winding wheel',text:'The gate guards are down. Orrin’s counterweighted return valve is in the bag. Turn the wheel on the middle pier to let Bram’s ferry through.'},
 harborOpened:{title:'The ferry comes home',text:'Bram brought the crews to Dena and reopened the supply route. The service stair beyond the sea gate leads to Celia’s old sanctuary hospice. Follow it uphill to find the arrest signal.'},
 sanctuaryEntered:{title:'An order that cannot be amended',text:'An imperial cable feeds the sanctuary’s old bronze ring. Its warden refuses to release the coast. Clear the guards on the eastern bridge, then disconnect the return cable at its copper clamp.'},
 roadClear:{title:'The copper clamp',text:'The bridge guards are down. The braced rescue coat is in the bag. Disconnect the return cable at the eastern bridge before approaching the warden.'},
 signalCut:{title:'The local reserve',text:'Orrin disconnected the palace line. The warden is still holding the coast from its local reserve, but it can no longer draw power from the capital. Climb to the bronze ring and defeat it.'},
 wardenFallen:{title:'The tide returns',text:'The warden has stopped. Water and clocks on the coast are moving again. The guardian prism is in the bag for Nell. Examine the chart beneath the bronze ring.'},
 anchorsKnown:{title:'The price behind the pledge',text:'The founders pledged their descendants’ days for harvests, healing and light. The chart shows anchor stations at Hammerplain, Dawnwatch and Windmere supporting the palace vessel. An older diagram labels that vessel a conduit, with a source beyond the hollow sun. We copied both. Bring them to Tomas at the railway refuge.'},
 anchorsDeparture:{title:'A light on the water',text:'Nell and Tomas finally stood at the sea together. Nell chose to go after the anchors; Tomas will keep the rescued communities in contact from the refuge. Bram marked a survey airship at the western airfield. The coast is free, but the three distant anchors are intact.'},
};
export function objective(s:GameState):string{
 const f=s.flags;
 if(f.chapterFourComplete)return 'Chapter Four complete. Next: Taking the World Back.';
 if(!f.worksArrival)return 'Take Dena’s blankets to the pump house via the eastern harbor path.';
 if(!f.worksGateWon)return 'Choose a way past the sea-gate guards at the chain walk.';
 if(!f.harborOpened)return 'Turn the winding wheel on the middle pier.';
 if(!f.sanctuaryEntered)return 'Climb the service stair beyond the harbor gate.';
 if(!f.roadGuardWon)return 'Clear the guards on the sanctuary’s eastern bridge.';
 if(!f.signalCut)return 'Disconnect the return cable at the eastern bridge’s copper clamp.';
 if(!f.sanctuaryWardenWon)return 'Climb to the bronze ring and defeat the Sanctuary Warden.';
 if(!f.anchorsKnown)return 'Examine the chart beneath the bronze ring.';
 return f.seaWalkSeen?'Speak to Tomas when you are ready for the western airfield.':'Bring the copied chart to Tomas at the railway refuge.';
}
