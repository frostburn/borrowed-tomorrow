import { SAY, type Dialogue } from '../dialogue';
import { stage } from '../maps';
import type { Shot } from '../cinematics';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(map:'refuge'|'breakwater'|'sanctuary',id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id)},lines});

export const home=()=>scene('refuge','four-home','Chapter Four · A Light on the Water',[
 line('The railway refuge','The medical train rests beside the ward. Out on the water, a wave stands above an empty fishing boat.',{focus:{x:31,y:17},cut:true}),
 line('Tomas','Dena has everyone inside. I checked the coaches twice.',{focus:{x:31,y:27}}),
 line('Nell','You can sit down now. Nobody’s taking you anywhere.'),
 line('Tomas','I was going to say the same to you.'),
 line('Bram','Sorry. Is this the mechanic who brought that train out?',{actors:{bram:{to:{x:38,y:27}}},focus:{x:36,y:26}}),
 line('Orrin','Orrin. What’s broken?'),
 line('Bram','The harbor gate is locked. Our ferry’s caught on the other side, with the crews who were working the sea wall.'),
 line('Petra','Can they reach the bank?'),
 line('Bram','They’re safe on the upper deck. But the gate machines won’t let us bring them in.'),
 line('Dena','Celia’s treating them at the pump house. She sent for blankets. I’m running out of hands here.'),
 line('Nell','We’ll take them. Tomas, can you keep a place ready?'),
 line('Tomas','Already doing it. The harbor path is east of the ward.'),
]);
export const harbor=()=>scene('breakwater','four-harbor','The closed harbor',[
 line('Breakwater','The ferry lists against the sea gate. Beneath the pump-house awning, a physician ties a splint around a dockhand’s wrist.',{focus:{x:26,y:25},cut:true}),
 line('Celia','Hold the blanket here, please. Yes, over his fingers.'),
 line('Nell','Dena sent these. I’m Nell.'),
 line('Celia','Celia. Tell her the crew can walk, once we have somewhere to walk to.'),
 line('Petra','The palace seal is on that lock. Who gave the order?'),
 line('The gate horn','COASTAL ARREST. ALL DEPARTURES SUSPENDED. MAINTAIN THE CAPITAL’S SUPPORTS.',{focus:{x:34,y:18},cue:'click'}),
 line('Bram','That came through when the city rose. Now it’s stopping the tide in pieces.'),
 line('Orrin','The gate itself still moves. Its drive chain’s warm. We can wind it open once the guards are down.'),
 line('Celia','The signal comes from the sanctuary above us. I worked in its hospice. There’s a service stair behind the gate.'),
 line('Petra','Will your patients be all right if you leave?'),
 line('Celia','Bram can bring them to Dena. I’d like to stop the thing that’s making more of them.'),
 line('Nell','Then come with us.'),
 line('Celia','First, let’s get this ferry home.'),
]);
export const openGate=()=>scene('breakwater','four-gate','A way through',[
 line('Orrin','Kit, take the slack. Nell, turn that wheel when I lift the brake.',{focus:{x:34,y:23},actors:{orrin:{to:{x:33,y:22}},kit:{to:{x:36,y:24}},nell:{to:{x:34,y:24}}}}),
 line('The sea gate','The chain catches. The iron leaves fold back, and the ferry scrapes into the basin.',{cue:'steam'}),
 line('Bram','Easy on the gangway! There’s hot food at the railway ward.'),
 line('Celia','The man with the splint stays at the back. No carrying ropes.'),
 line('Kit','Dena’s going to make him sit down, isn’t she?'),
 line('Celia','She’ll make all of you sit down if I ask her.'),
 line('Nell','We might need that later.'),
 line('Bram','I’ll keep the ferry running. You’ve opened us a supply route.'),
 line('Celia','The stair’s clear now. Come and see what they connected to my old hospice.'),
]);
export const terrace=()=>scene('sanctuary','four-terrace','The signal sanctuary',[
 line('The sanctuary','An imperial cable climbs the old sea wall and enters a bronze ring. Far inland, the capital hangs above the dark valley.',{focus:{x:32,y:17},cut:true}),
 line('Celia','We used to bring the ward beds onto this terrace in summer. That cable wasn’t here.'),
 line('The Sanctuary Warden','The coast is held for its protection. Return to shelter.'),
 line('Petra','People are trapped below. Release the signal.'),
 line('The Sanctuary Warden','The capital must stand. Orders cannot be amended here.'),
 line('Orrin','Its guards are on the return line. Clear that bridge and I can disconnect it.'),
 line('Celia','That machine opened the hospice every morning. I want to know who changed its orders.'),
]);
export const cable=()=>scene('sanctuary','four-cable','The return line',[
 line('Orrin','Stand back from the copper shoe.',{focus:{x:43,y:26},actors:{orrin:{to:{x:43,y:25}},nell:{to:{x:40,y:27}}}}),
 line('The return line','Orrin releases the clamp. A white spark runs uphill. Nell’s lantern gives a thin, answering hum.',{cue:'steam'}),
 line('Nell','I felt that through the handle.'),
 line('Celia','Put it down if it burns.'),
 line('Nell','It’s cold.'),
 line('The Sanctuary Warden','Return line lost. Maintaining arrest from the local reserve.'),
 line('Petra','It’s still holding them.'),
 line('Orrin','But it can’t draw anything else from the palace. We can reach it now.'),
 line('Celia','Then we empty that reserve.'),
]);
export const record=()=>scene('sanctuary','four-chart','Behind the imperial plate',[
 line('The coast','The ring has stopped. Below the terrace, the suspended wave has fallen. A ferry bell answers from the harbor.',{focus:{x:32,y:18},cue:'win'}),
 line('Nell','Look. The boat’s moving.'),
 line('Celia','Orrin, help me with this plate. They bolted it over the old inscription.'),
 line('The founding pledge','“For harvest, healing and light, we entrust the days of our children, and their children after them.”',{document:{heading:'The founding pledge',lines:['HARVEST · HEALING · LIGHT','THE DAYS OF OUR CHILDREN','AND THEIR CHILDREN AFTER THEM'],stamp:'A DYNASTIC SEAL'}}),
 line('Celia','Our hospice oath stopped at “healing and light.” They left the rest off every copy I taught from.'),
 line('Petra','The people in those coaches never agreed to this.'),
 line('Celia','No. And the healing was real. I’ve seen it work. That doesn’t give anyone the right to charge their children.'),
 line('Kit','There’s a chart behind it. Three lines go back to the capital.'),
 line('Orrin','Hammerplain. Dawnwatch. Windmere. Anchor stations, with the same return circuit we just cut.'),
 line('Petra','Dawnwatch has soldiers who’ll listen to me. Some of them, at least.'),
 line('Nell','If we break these connections, can we bring the city down?'),
 line('Orrin','That’s what’s holding the vessel steady. We’ll need to see the stations themselves.'),
 line('Celia','There’s another drawing. The palace vessel, and a passage through the hollow sun behind it.'),
 line('The old diagram','The vessel is labeled “conduit.” Beyond the hollow sun, the same hand has written “source.”'),
 line('Nell','So even if we stop the emperor…'),
 line('Celia','The one owed this payment may still be there. We should take a copy of all of it.'),
 line('Nell','Tomas needs to see this. Let’s go back.'),
]);
export const decision=()=>scene('refuge','four-choice','The sea wall',[
 line('Tomas','Bram’s ferry brought flour, oil, and a letter from Rillbridge. Tilda says her oven clock started again.',{focus:{x:24,y:27},cut:true}),
 line('Nell','Can we leave the map for a moment? There’s something we were supposed to do.'),
 line('The sea wall','Nell and Tomas walk down to the water. For a while, neither tries to speak over the wind.',{duration:1100,track:'nell',actors:{nell:{to:{x:8,y:28}},tomas:{to:{x:10,y:28}}}}),
 line('Tomas','I imagined a beach. Perhaps a less alarming boat.'),
 line('Nell','You said the sea. You didn’t specify the boat.'),
 line('Tomas','I’m glad we got here.'),
 line('Nell','Me too.'),
 line('Tomas','You’ve got me home. You can stay, if you want.'),
 line('Nell','That wave stopped while I was looking at it. Next time it could be this ward.'),
 line('Nell','I want to go after those anchors. I just wanted us to have this first.'),
 line('Tomas','Then I’ll keep the railway talking to you. We’ve got a lot of people who owe us a letter.'),
 line('Bram','The western airfield has a survey ship. Dry hangar, high ground. I’ve marked the road.',{focus:{x:17,y:28}}),
 line('Celia','Dena has a copy of the pledge. So do I. They can’t shorten it again.'),
 line('Nell','All right. Let’s decide what we need before we leave.'),
]);
