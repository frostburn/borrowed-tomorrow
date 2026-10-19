import { SAY,type Dialogue,type Line } from '../dialogue';
import type { Cinematic,Shot } from '../cinematics';
const line=(who:string,text:string,shot?:Shot):Line=>({...SAY(who,text),shot});
const scene=(id:string,title:string,actors:Cinematic['actors'],lines:Line[]):Dialogue=>({scene:{id,title,actors},lines});
export const morning=()=>scene('four-morning','CHAPTER FOUR · THE BROKEN WORLD',[
 {id:'nell',at:{x:31,y:22}},{id:'tomas',at:{x:34,y:22}},{id:'dena',at:{x:28,y:22}},
],[
 line('The railway ward','A kettle whistles. Nell wakes with Tomas sitting beside her, his bad leg stretched across a crate.',{focus:{x:32,y:22},cut:true,cue:'steam'}),
 line('Nell','You’re still here.'),
 line('Tomas','I promised. Dena made me sit down before I wore through the floor.'),
 line('Dena','The train made it back to the coast. We have every passenger from the capital on the ward list.'),
 line('Nell','Where are the others?'),
 line('Tomas','Another pulse hit the western line. You struck your head when the engine stopped. Orrin and Kit went to open the Breakwater return gate.'),
 line('Dena','Petra took the people stranded on the road up to the old sanctuary. There’s shelter under its arches.'),
 line('Nell','Then I’m getting up.'),
 line('Tomas','Have some water first. I’ve got Orrin’s signal here.'),
]);
export const works=()=>scene('four-works','ORRIN · THE RETURN GATE',[
 {id:'orrin',at:{x:31,y:27}},{id:'kit',at:{x:34,y:27}},{id:'bram',at:{x:29,y:19}},
],[
 line('The works','Water hangs between the flood wheel’s paddles. Below it, workers pound on the return gate.',{focus:{x:32,y:12},cut:true,silence:true}),
 line('Bram','Nineteen in the pump house. The guardian won’t let us through.',{focus:{x:30,y:20},cut:true}),
 line('The gate speaker','Evacuation suspended. Hold all personnel for the palace.'),
 line('Orrin','It’s taking orders from a city that isn’t even on the ground.'),
 line('Kit','Can we open the gate ourselves?'),
 line('Orrin','After we get past its machines. The dry walk has crows watching it. The pump floor’s flooded, but we can use the stone blocks for cover.'),
 line('Bram','Get that south gate open and I’ll bring them out. The gatehouse has our field supplies.'),
]);
export const worksEscape=()=>scene('four-works-escape','THE WORKERS LEAVE',[
 {id:'orrin',at:{x:30,y:34}},{id:'kit',at:{x:34,y:34}},{id:'bram',at:{x:32,y:31}},
],[
 line('Orrin','The return chain’s on its manual teeth. Kit, pull when I say.',{focus:{x:32,y:34},cut:true,cue:'click'}),
 line('Kit','Ready.'),
 line('Orrin','Now.'),
 line('The south gate','The gate rolls clear. Bram leads the workers down the stairs, counting as they pass.',{cue:'steam',actors:{bram:{to:{x:32,y:36}}}}),
 line('Bram','Nineteen. All right. We’re all here.'),
 line('Kit','Tomas has beds at the railway ward. Follow the old signal posts.'),
 line('Orrin','I’ll keep the road open behind you.'),
 line('The mountain road','Above the works, Petra’s signal lamp flashes once through the trees.'),
]);
export const road=()=>scene('four-road','PETRA · UNDER THE ARCH',[
 {id:'petra',at:{x:28,y:29}},{id:'celia',at:{x:23,y:26}},
],[
 line('The sanctuary road','A woman in a green coat ties a splint beneath the arch. Petra plants her shield across the path behind her.',{focus:{x:25,y:28},cut:true}),
 line('Celia','Keep your weight off it. The ward is downhill; we’ll get you there.'),
 line('The road speaker','All displaced persons will return to the valley. Keep the imperial day intact.'),
 line('Petra','They can’t walk back through that. The road has stopped in mid-collapse.'),
 line('Celia','The machines followed us from the lower bridge. Are you their officer?'),
 line('Petra','I was. They’re not taking anyone back.'),
 line('Celia','Then I’m Celia. I can keep you on your feet if you keep them away from the arch.'),
 line('Petra','Stay behind my shield. When they turn toward me, take your shot.'),
]);
export const seal=()=>scene('four-seal','CELIA · THE LOWER INSCRIPTION',[
 {id:'celia',at:{x:31,y:19}},{id:'petra',at:{x:35,y:21}},
],[
 line('Celia','The imperial plaster has come off. There’s an older seal underneath.',{focus:{x:32,y:17},cut:true,cue:'paper'}),
 line('Petra','You know these letters?'),
 line('Celia','From the hospice copies. They said the guardians received the Benefactor’s gifts here. There should be a record inside.'),
 line('The door','Celia presses the lower ring. A narrow line of light reaches the warden’s station, then stops.',{cue:'resonance'}),
 line('Celia','The palace is using its circuit. I can open the record, but I can’t keep the warden off it by myself.'),
 line('Petra','Nell will want to see this. First we’re taking those people to the ward.'),
 line('Celia','Good. I’m down to my last clean bandage.'),
]);
export const reunion=()=>scene('four-reunion','THE SAME WARD',[
 {id:'nell',at:{x:30,y:24}},{id:'tomas',at:{x:33,y:22}},{id:'orrin',at:{x:25,y:24}},{id:'kit',at:{x:27,y:26}},
 {id:'petra',at:{x:37,y:25}},{id:'celia',at:{x:40,y:25}},{id:'dena',at:{x:36,y:22}},
],[
 line('Tomas','Bram’s nineteen are inside. Dena has places for the people from the road too.',{focus:{x:32,y:24},cut:true}),
 line('Nell','Orrin. I thought I’d have to chase your engine this time.'),
 line('Orrin','It’s in the siding. I’m beginning to miss running out of coal.'),
 line('Kit','I brought your lamp oil. In case you— Needed it. For the lantern.'),
 line('Nell','Thanks, Kit.'),
 line('Petra','This is Celia. We cleared the sanctuary road together.'),
 line('Celia','I found a record behind the old seal. The emperor’s order is running through its warden. That’s what keeps stopping the valley.'),
 line('Orrin','If it’s using a local circuit, we can cut it. We’ve done that much before.'),
 line('Celia','I want to know what the guardians actually agreed to. The hospice copies leave half the inscription out.'),
 line('Tomas','I’ll stay with the passengers. We’re sending hand-carried messages along every line that still moves.'),
 line('Nell','Then we’ll open the record. All of us are done waiting for another order from that palace.'),
]);
export const threshold=()=>scene('four-threshold','THE WARDEN’S ORDER',[
 {id:'nell',at:{x:29,y:28}},{id:'orrin',at:{x:25,y:29}},{id:'kit',at:{x:33,y:29}},{id:'petra',at:{x:36,y:28}},{id:'celia',at:{x:38,y:26}},
 {id:'sanctuaryWarden',at:{x:32,y:22}},
],[
 line('The Sanctuary Warden','Imperial preservation order. No admission. No departure.',{focus:{x:32,y:23},cut:true,cue:'steam'}),
 line('Celia','This was a place people came for help. Its circuit’s carrying his voice now.'),
 line('Nell','Can we stop it without breaking the record?'),
 line('Celia','The warden is on the floor. The record is in the door. Keep your lantern pointed at the first one.'),
 line('Orrin','That’s unusually clear engineering advice.'),
 line('The sanctuary','The warden steps away from the stair. Crows unfold from the side arches.'),
]);
export const record=()=>scene('four-record','BEYOND THE HOLLOW SUN',[
 {id:'nell',at:{x:30,y:20}},{id:'orrin',at:{x:26,y:22}},{id:'kit',at:{x:34,y:23}},{id:'petra',at:{x:38,y:22}},{id:'celia',at:{x:33,y:19}},
],[
 line('The sanctuary','With the warden silent, the last line of the seal lights. Far below, a mill wheel begins to turn.',{focus:{x:32,y:13},cut:true,cue:'click'}),
 line('Celia','Three anchors. Hammerplain, Dawnwatch, Windmere. These lines meet beneath the capital.'),
 line('Orrin','They steady the vessel. Cut those supports and he won’t be able to hold his new body together.'),
 line('Petra','And the regions around them?'),
 line('Celia','The same lines carry his arrest. We can free those places as we go.'),
 line('The old record','Figures carry grain, lamps and medicine away from the hollow sun. Behind them, lines of empty days flow back through it.',{document:{heading:'THE FOUNDING PLEDGE',lines:['Harvests, healing, light.','The dynasty pledges the days of its descendants.','The vessel receives. The source remains beyond the sun.']}}),
 line('Nell','Descendants. People who weren’t even born when they agreed to this.'),
 line('Celia','The hospice calls it gratitude. This says what they gave in payment.'),
 line('Tomas’s notes','Nell unfolds the sketch Tomas made of the palace. Its restraints match the three lines on the door.',{cue:'paper'}),
 line('Orrin','That body is how the Benefactor reaches us. Its source is still on the other side.'),
 line('Petra','So even if the emperor falls, it can keep collecting.'),
 line('Celia','There’s a way through the sun in the last carving. The guardians left a route to the source.'),
 line('The lantern','The glass hums against Nell’s fingers. She wraps the handle in her scarf and folds the copied route into Tomas’s notes.',{cue:'resonance'}),
 line('Nell','First the anchors. Then we make sure nobody can send another collector.'),
]);
export const decision=()=>scene('four-decision','WHAT WE DO NEXT',[
 {id:'nell',at:{x:30,y:24}},{id:'tomas',at:{x:33,y:22}},{id:'orrin',at:{x:25,y:24}},{id:'kit',at:{x:27,y:26}},
 {id:'petra',at:{x:37,y:25}},{id:'celia',at:{x:40,y:25}},{id:'bram',at:{x:24,y:21}},
],[
 line('Tomas','The ward clock’s moving. Bram brought word from the mill. Whatever you stopped up there, it helped.',{focus:{x:32,y:24},cut:true}),
 line('Nell','We found three anchors holding the palace steady. And a route beyond it.'),
 line('Bram','Hammerplain? I worked the western airfield before the works. There’s a survey ship in its hangar.'),
 line('Orrin','An airship. That would get us around the broken lines.'),
 line('Tomas','You found me. We could stay here while other people take this on.'),
 line('Nell','I know. I want to go anyway. Those machines will keep coming until someone stops what’s sending them.'),
 line('Petra','I’ll come. There are soldiers at Dawnwatch who still think I’m one of them. I should speak to them before the palace does.'),
 line('Celia','And I want the complete record where people can read it.'),
 line('Kit','I can find the airfield road. My deliveries went there every spring.'),
 line('Tomas','Then I’ll keep the railway messages moving. You’ll have somewhere to send news back to.'),
 line('Nell','Keep a place on the train for me.'),
 line('Tomas','Two. We still haven’t seen the sea.'),
]);
