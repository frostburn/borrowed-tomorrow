import { SAY,type Dialogue } from '../../dialogue';
import { stage } from '../../maps';
import type { GameState,MapId } from '../../../rules/state';
import type { Shot } from '../../cinematics';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(s:GameState,map:MapId,id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id).filter(a=>a.id!=='nell'||s.flags.nellRecovered||id==='six-lightbearer-fall').map(a=>a.id==='nell'&&!s.flags.nellRecovered?{...a,face:'nell-ill'}:a)},lines});
export const street=(s:GameState)=>scene(s,'stillcity','six-capital-street','Stillwater Avenue',[
 line('Stillwater Avenue','A woman pulls her cart beneath the arch. A cloth slips from the load. She turns, and the cloth is folded on top again.',{focus:{x:32,y:25},cut:true}),
 line('Kit','I caught it on the quay. She took it back without looking at me.'),
 line('The baker','Mind the tray. These are for the procession.'),
 line('The bakery','He lifts a blackened loaf from the oven, sets it on the counter, then reaches for the same loaf inside.'),
 line('Celia','His hands are blistered. He doesn’t feel the heat anymore.'),
 line('Orrin','The return runs under the arch. It’s pulling the whole street back to that bell.'),
 line('Petra','Those machines are keeping people on the route. We clear them, then open the return.'),
 ...(s.flags.nellRecovered?[line('Nell','The boats are below the southern steps. We’ll keep that way clear.')]:[line('Kit','The boats are below the southern steps. I’ll mark the way back.')]),
]);
export const released=(s:GameState)=>scene(s,'stillcity','six-capital-release','The street moves on',[
 line('Orrin','Pull when I lift the catch.',{focus:{x:32,y:25},cut:true}),
 line('The street return','The bronze arm drops. The woman’s cart catches on the fallen cloth; she stops and looks down.',{effect:'capital-street',cue:'defend',duration:1200}),
 line('The cart woman','I’ve lost the turn. Which way’s the river?'),
 line('Kit','Down those steps. There are boats waiting.'),
 line('The baker','Those aren’t my loaves. How long have they been in there?'),
 line('Celia','Put the tray down. Let me wrap your hands before you carry anything.'),
 line('Alda','The first boat’s ready. Namar’s crews will take the carts; Skeld’s pilots have the crossing.'),
 ...(s.flags.nellRecovered?[line('Nell','Take the people who can’t manage the steps first. We’ll send the next group down.')]:[line('Petra','Take the people who can’t manage the steps first. We’ll send the next group down.')]),
 line('Stillwater Avenue','The baker leaves the burnt loaf on the counter. This time it stays there.'),
]);
export const palace=(s:GameState)=>scene(s,'lastpalace','six-palace-arrival','The palace of the last day',[
 line('The lower gallery','A servant carries a bowl to an empty chair. Behind it, a woman’s pale reflection turns toward a door that never opens.',{focus:{x:32,y:21},cut:true}),
 line('Celia','There’s someone breathing behind that screen. The servant keeps passing him.'),
 line('Orrin','The private rooms are taking the service ward’s pressure. They’ve shut the other line down.'),
 line('Petra','This gallery served the whole palace. He’s keeping one household at the table.'),
 line('The eastern cloister','A white wing strikes a guardian against the rail. The guardian gets up and bars the patient stair again.',{cue:'strike',focus:{x:43,y:23}}),
 line('Kit','They’re fighting each other. Neither side’s letting the attendants through.'),
 line('Petra','Keep the attendants behind us. I know the man holding that cordon.'),
]);
export const command=(s:GameState)=>scene(s,'lastpalace','six-palace-command','The remaining cordon',[
 line('Palace commandant','The public rooms are closed. Return to the landing.',{focus:{x:32,y:27},cut:true}),
 line('Petra','Open the patient stair. Your own staff are carrying people out.'),
 line('Palace commandant','His Majesty ordered the household kept undisturbed.'),
 line('Petra','Look behind you. There’s a man on that stretcher.'),
 line('Palace commandant','I have my orders.'),
 line('Petra','Then put the weapon down and let us through. I won’t leave them here.'),
]);
export const hallOpened=(s:GameState)=>scene(s,'lastpalace','six-palace-open','The patient stair',[
 line('Palace commandant','I can’t hold the whole gallery. The white things are coming through the windows.',{focus:{x:32,y:27},cut:true}),
 line('Petra','You can hold a stretcher. Take that end.'),
 line('The gallery','The attendants lift the bar. The commandant takes the lower handles and follows them toward the quay.',{effect:'capital-street',duration:1000}),
 line('Kit','The eastern passage still has hunters. There’s another way down for the staff now.'),
 line('Celia',s.flags.nellRecovered?'I’m going down to the boats. The attendants need help with the patients. Rest here until I’m back.':'I’m going back to Nell before we climb higher. Rest here while I check her.'),
]);
export const audience=(s:GameState)=>scene(s,'lastpalace','six-emperor-audience','A room kept ready',[
 line('The Emperor','You came back. I kept the morning you saw.',{focus:{x:32,y:18},cut:true}),
 line('Nell','Stay where you are.'),
 line('The Emperor','Your brother is waiting. There’s still time to catch the train.'),
 line('The doorway','A guard’s whistle makes Nell turn. Warm wind lifts her sleeve; the gallery is gone before she can step back.',{duration:1300}),
]);
export const morning=(s:GameState)=>scene(s,'lastmorning','six-last-morning','Before the first train',[
 line('Larkspur','Ansel turns the chipped side of his cup toward himself. Tomas leans against the station clock.',{focus:{x:21,y:13},cut:true}),
 line('Ansel','Lantern trimmed? Your brother’s been waiting. Don’t leave him standing there all morning.'),
 line('Nell','I remember this cup.'),
 line('Tomas','We’ll miss the sea train if you keep talking.'),
 line('Nell','You always said that before you’d bought the tickets.'),
 line('Tomas','This time I got there early. Two seats by the window.'),
 line('Ansel','Bring my flask back. I don’t want to drink the station tea.'),
]);
export const shore=(s:GameState)=>scene(s,'lastshore','six-memory-sea','The sea, at last',[
 line('The coast','The carriage door opens onto salt air. Tomas takes their bags, and Nell walks beside him down to the water.',{focus:{x:31,y:21},cut:true,duration:1800,actors:{nell:{to:{x:31,y:22}},tomas:{to:{x:33,y:22}}}}),
 line('Tomas','A beach. No ferry leaning against a gate. This is more like it.'),
 line('Nell','You’ve brought enough bread for a week.'),
 line('Tomas','I was hungry when I bought it. Sit down before the gulls notice.'),
 line('The sea','Nell leans against her brother. The wind is warm, and the next train is hours away.',{duration:1200}),
 line('Nell','There was a woman at the quay. She kept dropping the same cloth.'),
 line('Tomas','Tell me on the train. We’ve got time.'),
 line('Nell','She couldn’t leave. Neither could the baker. His hands were burned.'),
 line('The sea','Nell looks at the bread in her lap. She remembers the blackened loaf, and Celia carrying a patient past the palace table.'),
 line('Nell','They’re still taking people’s days. How many more have they taken while we’ve been here?'),
 line('Tomas','We can stay until the next train.'),
 line('Nell','I want to. I want to stay so much.'),
 line('Nell','But I can’t leave them there.'),
 line('The shore','Nell closes her eyes and digs her nails into her palm. She holds on to the sting as the sound of the waves fades.',{duration:1200}),
 line('Nell','Wake up.'),
]);
export const awake=(s:GameState)=>scene(s,'lastpalace','six-memory-wake','The days outside',[
 line('Celia','Nell. Here. Look at me.',{focus:{x:32,y:22},cut:true,actors:{celia:{to:{x:33,y:23}}}}),
 line('The gallery','Cold marble presses against Nell’s knees. She pulls herself upright and faces the Emperor.'),
 line('Nell','No. I won’t take it. Let their days go.'),
 line('The gallery','Her hand is still trembling. Kit draws a chair away from the wall.'),
 line('Kit','Sit with us for a minute.'),
]);
export const warning=(s:GameState)=>scene(s,'lastpalace','six-capital-warning','Before the crown stair',s.flags.nellRecovered?[
 line('Celia','The attendants are at the boats. Everyone who could be moved is out of the private ward.',{focus:{x:32,y:23},cut:true}),
 line('Orrin','The crown supports are above this stair. Break them and the vessel loses its shield.'),
 line('Nell','Then we go together. Let me check the lantern first.'),
]:[
 line('Celia','I’ve just come from Nell. Her pulse is following the palace engine.',{focus:{x:32,y:23},cut:true}),
 line('Kit','Even with the lantern here?'),
 line('Celia','Yes. Ines’s notes describe this binding. Taking the shard away hasn’t broken it.'),
 line('Orrin','If we break the vessel, the current will need somewhere else to go.'),
 line('Celia','I won’t promise she’ll survive that. We can still take her to Iria before we do this.'),
 line('Petra','The patient stair is clear. The crews can hold the landing while we return.'),
 line('Kit','Then the launch stays ready. We don’t have to leave her like this.'),
]);
export const vessel=(s:GameState)=>scene(s,'crown','six-imperial-vessel','The Emperor’s last day',[
 line('The crown platform','The palace roof opens around a crowned vessel. Two pale supports turn beneath its arms.',{focus:{x:32,y:21},cut:true,cue:'resonance'}),
 line('The Emperor','They were safe here. The wards worked. The gardens grew through winter.'),
 line('Celia','The lower ward was left without water. We carried your patients out.'),
 line('The Emperor','I can restore the rooms. I need the supports kept in place.'),
 line('Orrin','He’s drawing them back together already. Break both, then go for the vessel.'),
 ...(s.flags.nellRecovered?[line('Nell','There are people on those boats. Let them have tomorrow.')]:[line('Petra','The people are at the boats. You’re letting them leave.')]),
]);
export const fallen=(s:GameState)=>scene(s,'crown','six-imperial-fall','The crown breaks',[
 line('The vessel','The crown splits around the Emperor’s motionless body. Its sun falls dark.',{focus:{x:32,y:20},cut:true,effect:'capital-fall',cue:'burst',duration:1800}),
 line('The crown platform','The broken armrests fall away. Below, the palace terraces settle past the outer walls.',{duration:1100}),
 line('Orrin','The crews have the lowering gear. Take the inside of the stair.'),
 ...(s.flags.nellRecovered?[
 line('The lantern','A pale thread catches against Nell’s wrist, then slips loose and breaks.',{effect:'capital-thread',duration:1000,cue:'resonance'}),
 line('Celia','The river collar broke the binding. Nell, stay beside me until that light clears.'),
 line('Nell','I’m here. Kit, take the other rail.'),
 ]:[
 line('The mooring','A line of light runs down toward the survey ship’s shaded berth.',{effect:'capital-thread',duration:1300,cue:'resonance'}),
 line('Kit','That’s our ship.'),
 line('Celia','Alda’s medics are with her. Get down to the landing.'),
 ]),
]);
export const manifestation=(s:GameState)=>scene(s,'crown','six-lightbearer-rise','The Lightbearer',[
 line('The broken crown','The thread tightens. Above the ship, a small figure rises into the light. Orange cloth shows through the unfolding white plates.',{focus:{x:32,y:20},cut:true,music:'lightbearer',effect:'lightbearer-rise',duration:1700,cue:'resonance'}),
 line('Kit','Nell!'),
 line('The Lightbearer','Her lantern hangs in her right hand. Its shutter opens, and a white line cuts through the empty crown.'),
 line('Orrin','Behind the broken wall. Now.'),
 line('The lantern','Nell’s fingers close around the shutter. The line breaks; for a moment the mantle hangs open.',{effect:'capital-thread',duration:1000}),
 line('Kit','Her hand. She shut it herself.'),
 line('Celia','When the plates open, break the light holding them. I’ll reach her if I can.'),
 line('Petra','Keep clear when that shutter lifts. Watch what she’s trying to stop.'),
]);
export const lost=(s:GameState)=>scene(s,'crown','six-lightbearer-fall','The last light',[
 line('The mantle','The white plates fall apart. Kit catches Nell beneath the broken mounting.',{focus:{x:32,y:27},cut:true,music:'laststation',effect:'lightbearer-fall',duration:1500,actors:{kit:{to:{x:32,y:28}},nell:{at:{x:32,y:27},fallen:true}}}),
 line('Celia','Lay her here. Orrin, give me your coat.'),
 line('The lantern','The fragment crumbles against the glass. Kit holds the shutter shut while Celia kneels beside him.',{silence:true,duration:1100}),
 line('Kit','She kept it closed. I saw her.'),
 line('Celia','Kit. Put the lantern down.'),
 line('The platform','He sets it beside her hand. Celia does not ask him to move away.'),
]);
export const landing=(s:GameState):Dialogue=>({scene:{id:'six-capital-landing',title:'The city lands',actors:[...stage('capitalquay','six-capital-quay').filter(a=>a.id!=='nell'||s.flags.nellRecovered)]},lines:[
 line('The allied quay','The last terrace settles on its old foundations. Above it, the hollow sun opens across a dark strip of sky.',{focus:{x:32,y:20},cut:true,effect:'capital-horizon',duration:1600,cue:'resonance'}),
 line('Alda','The last ward boat’s in. Skeld’s pilots are checking the lower streets.'),
 line('Celia','The man behind the screen is with the medical crew. He asked for breakfast.'),
 line('Orrin','The broken vessel’s still connected to something above it. The old hospice diagram had this same opening.'),
 line('The sky','Light passes over the far hills. Beyond the imperial roads, a line of field lamps goes dark.'),
 line('Petra','It’s taking from outside the empire now.'),
 line('Nell','Then we follow it. Can we get through that opening?'),
 line('Orrin','With the fragment, I think so. I want the crews and that diagram together before we try.'),
 line('Kit','I’ll bring the chart. And a clean lamp glass.'),
 line('Alda','Take the time you need. The foreign landings stay open; I’ll keep the ship here.'),
]});
export const emptySeat=(s:GameState)=>scene(s,'laststation','six-empty-seat','The empty seat',[
 line('Larkspur','A coal train waits beside the platform. Tomas has put his bag on the bench, leaving the place beside the window clear.',{focus:{x:22,y:15},cut:true}),
 line('Tomas','I booked the sea train. Before your letter came.'),
 line('Kit','I brought her coat. The lantern’s wrapped inside.'),
 line('Tomas','Leave it here. Please.'),
 line('The platform','Kit puts the folded coat beside the bag. The station clock advances.'),
 line('Orrin','The capital’s on the ground. The last boats got everyone off the lower terraces.'),
 line('Celia','There was another report from beyond Namar. A whole orchard stopped between one picking and the next.'),
 line('Petra','We’ll send what help we can.'),
 line('The waiting train','The guard walks past the empty seat and closes the next carriage door.'),
]);
