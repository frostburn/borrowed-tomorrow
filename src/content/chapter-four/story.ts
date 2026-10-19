import type { GameState } from '../../rules/state';
export const JOURNAL:Record<string,{title:string;text:string}>={
 brokenMorning:{title:'A morning after the escape',text:'Tomas and the medical passengers are safe at the Iron Coast ward. Another pulse stopped the western line. Orrin and Kit went to open the Breakwater evacuation gate; Petra took stranded patients toward the mountain sanctuary. Tomas is coordinating messages. Speak to him about Orrin’s signal.'},
 worksArrival:{title:'Orrin’s return gate',text:'Orrin and Kit reached the works. The stopped flood wheels trapped workers behind a return gate. Choose the dry service walk or the flooded pump floor. The survey cart holds a fitting for Kit, but its patrol can be left alone.'},
 worksClear:{title:'The way out of the works',text:'The gate machines are down. Orrin found a counterweighted valve for his lance. Open the evacuation gate at the south stairs to bring the workers out.'},
 worksEvacuated:{title:'Workers out of the valley',text:'Orrin and Kit opened the gate and led the workers back to Tomas. Petra is still on the sanctuary road with the patients.'},
 roadSeen:{title:'Celia at the arch',text:'Petra found Celia treating patients under the sanctuary arch. Imperial machines have orders to return them to the stopped valley. Celia is helping Petra protect them. Her celestial bolt can reach enemies behind cover; Petra can draw their attacks with Taunt.'},
 roadClear:{title:'The patients can leave',text:'Petra and Celia cleared the road and found a braced rescue coat. Celia wants to read the lower seal on the great door before bringing everyone down to the refuge.'},
 sealSeen:{title:'An older way in',text:'The guardians’ seal predates the empire. Celia found a route into its records, but the warden still carries the palace’s arrest signal. The patients are safe to bring down. Nell and the others are waiting at the refuge.'},
 partyReunited:{title:'Everyone at the ward',text:'Orrin, Kit, Petra and Celia have reunited with Nell. Tomas has the passengers and workers safe. The previous active formation is restored; Celia is available in Equipment. Open the sanctuary’s record to learn how to stop the spreading arrest.'},
 sanctuaryEntered:{title:'The warden’s borrowed order',text:'The sanctuary warden is repeating an imperial order through the old guardian circuit. Defeat it to stop the valley arrest and reach the record. There is a field chest beside the right arch and a sheltered rest bench on the left.'},
 wardenFallen:{title:'The valley moves',text:'The warden’s arrest signal is gone. The refuge reports moving clocks and running water. Nell’s guardian prism is in the bag. Read the record beneath the hollow sun before returning to Tomas.'},
 anchorsKnown:{title:'Three anchors and the hollow sun',text:'Three ancient anchors hold the palace vessel steady: Hammerplain, Dawnwatch and Windmere. Severing them will free their regions and expose the emperor. The record calls the palace body a conduit to a source beyond the hollow sun. The empire pledged future generations’ days for its boons; the source’s claim can outlive the vessel. We know a route to it exists. Speak to Tomas about the counterattack.'},
 anchorsDeparture:{title:'A choice beyond the rescue',text:'Nell chose to lead the counterattack. Tomas stays with the resistance, linking the people freed along the railway. The western airfield is the next destination; an airship will make the three anchor regions reachable. The party, equipment and Chapter Five departure are saved.'},
};
export function objective(s:GameState):string{
 const f=s.flags;
 if(f.chapterFourComplete)return 'Chapter Four complete. Next: Taking the World Back.';
 if(!f.worksStarted)return 'Speak to Tomas about Orrin and Kit at the Breakwater works.';
 if(!f.worksEvacuated)return f.worksGateWon?'Open the evacuation gate at the south stairs.':'Choose a way past the return-gate machines at the back of the works.';
 if(!f.roadSeen)return 'Help the patients sheltering beneath the sanctuary arch.';
 if(!f.roadGuardWon)return 'Protect the patients with Petra and Celia.';
 if(!f.sealSeen)return 'With Celia, read the lower seal on the great door.';
 if(!f.partyReunited)return 'Reunite at the railway refuge.';
 if(!f.sanctuaryWardenWon)return 'Return to the mountain sanctuary and stop its warden.';
 if(!f.anchorsKnown)return 'Read the guardians’ record beneath the hollow sun.';
 return 'Return to Tomas at the railway refuge and choose the counterattack.';
}
