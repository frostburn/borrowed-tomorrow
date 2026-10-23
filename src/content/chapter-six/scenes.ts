import { SAY,type Dialogue } from '../dialogue';
import { stage } from '../maps';
import type { MapId } from '../../rules/state';
import type { Shot } from '../cinematics';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(map:MapId,id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id).map(actor=>actor.id==='nell'?{...actor,face:'nell-ill'}:actor)},lines});
export const sealed=()=>scene('outermooring','six-sealed','Chapter Six · The Emperor’s Last Day',[
 line('The outer mooring','The landing bridge unfolds. Across the gap, a woman pulls a handcart through the capital gate.',{focus:{x:32,y:13},cut:true}),
 line('Alda','Hold for the bridge latch. Kit, pass me that line.',{focus:{x:32,y:25}}),
 line('The bridge','A pale wall descends across its far end. The bridge strikes it and buckles. Behind the wall, the handcart keeps moving.',{cue:'resonance',effect:'pact-seal',cut:true,duration:1450,focus:{x:32,y:19}}),
 line('The Emperor','Withdraw your ship. The capital is under the protection of the old pact.'),
 line('Petra','There are people outside your gate.'),
 line('The Emperor','I have room for those already here. I will not lose them too.'),
 line('Celia','Your patron destroyed a ship full of your soldiers.'),
 line('The Emperor','Then you understand why this gate must stay shut.'),
 line('Kit','Nell’s below. She heard that crash.'),
 line('Alda','Tell her we’re holding. Nobody’s crossing that bridge.'),
 line('Orrin','Two seals on the bridge latch. I saw them on the sanctuary chart.'),
 line('Petra','Namar and the northern kingdom. Their rulers signed the defense pact with ours.'),
 line('Alda','We have their landing charts. Bring the copies to the table. We’ll ask them to open it.'),
]);
export const briefing=()=>scene('outermooring','six-briefing','Two foreign seals',[
 line('Petra','The pact was meant to shelter all three capitals. He’s called both seals around his own.',{focus:{x:32,y:25},cut:true}),
 line('Orrin','The releases are at the other end. We need the crowns that lent him those seals.'),
 line('Alda','Namar keeps its seal in the royal observatory. The northern one is above the glacier harbor. We have charts for both.'),
 line('Celia','Sera’s reply came with the last launch. She’s found people who treated crystal workers before the imperial wards opened.'),
 line('Kit','River healers. She’s marked their landing and sent her notes ahead.'),
 line('Celia','They may know how to interrupt what’s happening to Nell. I’ve asked them to read her notes before we land.'),
 line('Kit','I’ll tell Nell where we’re going. She’ll want Tomas to have the route.'),
 line('Alda','The medics keep the berth. We keep the landings open. Mark your course when you’re ready.'),
]);
export const letter=()=>scene('outermooring','six-letter','The next letter',[
 line('Nell','Is the gate open?',{focus:{x:20,y:28},cut:true}),
 line('Kit','No. There’s a wall of light across the bridge. We’re going to the cities that hold it.'),
 line('Nell','What about the people we saw outside?'),
 line('Celia','Alda’s launches are collecting them. There’s room at the refuge.'),
 line('Kit','I’ve got Sera’s notes for the river healers. I’ll keep a copy on the ship.'),
 line('Nell','Send Tomas the route too. And put in that I’m awake. He’ll worry if it’s all flight plans.'),
 line('Kit','I left space for you. There’s a board under the blanket.'),
 line('Nell','Good. Pass me the pencil.'),
]);
export const city=()=>scene('namar','six-namar','The evening exchange',[
 line('Namar','A narrow postal boat slips beneath the bridge. Above the canal, awnings open for the evening market.',{focus:{x:32,y:23},cut:true}),
 line('Amal','Last sack for the western railway! If you’ve got letters, bring them over.'),
 line('Kit','You still take the railway post?'),
 line('Amal','They still write to us. The trains can stop without everybody forgetting their cousins.'),
 line('Kit','I have a ward report for the refuge. And a letter for Tomas.'),
 line('Amal','Two trays, at the sorting table. The ward post goes first; the railway sack leaves at the bell.'),
 line('Orrin','That clock’s running off the canal.'),
 line('Amal','It loses a minute when the boats bunch up. The clockmaker blames the boatmen. They blame his clock.'),
 line('Petra','We need to speak to your queen about the imperial pact.'),
 line('Amal','Samira’s expecting the survey ship. Cross the bridge and take the eastern palace door.'),
 line('Celia','She knows why we’ve come?'),
 line('Amal','The people from the coast sent more than supply lists. She’s been reading them all afternoon.'),
]);
export const court=()=>scene('sunpalace','six-court','The queen’s half of the pact',[
 line('Queen Samira','Leave the ledger open. These villages supplied our winter grain.',{focus:{x:32,y:24},cut:true}),
 line('Celia','The ward records are on the next page. The patients lost days while the palace took delivery.'),
 line('Queen Samira','Those are my orders beside the shipments.'),
 line('Minister Sahir','We bought grain, Your Majesty. No collector has touched this city.'),
 line('Petra','I defended Alban at Cinderbank. He ordered our guns turned on the patients.'),
 line('Queen Samira','What happened to Alban?'),
 line('Kit','The Benefactor’s light took him and the whole ship. We barely reached our gangway.'),
 line('Minister Sahir','Then this is when we need the pact most. What protects us if that light comes here?'),
 line('Queen Samira','You asked the Emperor to open his gate to our ward crews. Has he answered?'),
 line('Minister Sahir','He’s holding the capital together. We have to give him time.'),
 line('Queen Samira','He’s using our seal to keep us outside. We’ll need our own boats and stores.'),
 line('Minister Sahir','If we withdraw it, he owes us nothing. We’ll be alone when that light comes.'),
 line('Queen Samira','Send the ward crews to the covered quay. I’m going to the observatory to withdraw our seal.'),
 line('The court','Sahir closes his hand around the bronze token at his collar. A horn answers from the observatory.',{cue:'return-call',focus:{x:39,y:25}}),
 line('Minister Sahir','Wake the guardian. Hold the queen in the court.',{silence:true,duration:1100,actors:{sahir:{to:{x:49,y:23}}},track:'sahir'}),
 line('The palace gates','A bar drops across the southern gate. The courtyard attendants step away from it.',{cue:'defend',focus:{x:31,y:33}}),
 line('Queen Samira','Captain, open that gate.'),
 line('The gallery','The captain lowers his visor. His men turn their shields toward the court.'),
 line('Petra','Stay behind my shield. We’ll get you out.'),
 line('Queen Samira','The postal stair is west. Amal will hear that horn. She’ll come to it.'),
]);
export const escaped=()=>scene('sunpalace','six-escape','The postal stair',[
 line('The courtyard','The cordon falls back. A small door opens behind the fountain.',{focus:{x:21,y:29},cut:true,actors:{sahir:{visible:false},amal:{visible:true}}}),
 line('Amal','Your Majesty. Are we using the respectable exit?'),
 line('Queen Samira','Apparently not.'),
 line('Amal','The boatmen heard his horn. They’re keeping the quay clear for the ward crews.'),
 line('Orrin','The observatory’s above these roofs?'),
 line('Amal','Follow the water jars. They’re for the post runners. There’s a shelter before the upper stair.'),
 line('Queen Samira','I’m coming. That release answers to my hand, whatever Sahir has put around it.'),
 line('Petra','Then take the inside of the railing.'),
]);
export const roofs=()=>scene('skywalk','six-roofs','Above the awnings',[
 line('The upper terraces','The market awnings lie below. Pale wings settle on the observatory’s release walk.',{focus:{x:47,y:17},cut:true}),
 line('Amal','Those aren’t our machines.'),
 line('Celia','We saw them at Nell’s hatch. The Benefactor’s creatures.'),
 line('Queen Samira','Sahir’s guards are running. Those things have cut off the release walk.'),
 line('Kit','I can get a clear shot from the next terrace. Keep away from their straight lines.'),
 line('Amal','I’ll keep the stair open. There’s drinking water under the canopy.'),
]);
export const serpent=()=>scene('observatory','six-serpent','The sun serpent',[
 line('The royal observatory','A great serpent tightens around the bronze rings. Its breath turns spilled sand into shining glass.',{focus:{x:32,y:18},cut:true,cue:'resonance'}),
 line('Queen Samira','That ring measured the summer floods. My grandmother had it turned by hand.'),
 line('Minister Sahir','It’s supposed to recognize the keeper’s token. It struck the walk when I held it out.'),
 line('Petra','Get down from that walk. It’s pointing at you too.'),
 line('Orrin','One coil loosens while the other closes. We can strike the loose one.'),
 line('Kit','Its breath comes back off the glass. Don’t let it pin us against the edge.'),
 line('Queen Samira','Grandmother showed me the bronze latch. Keep it off that ring and I can lift the seal.'),
]);
export const release=()=>scene('observatory','six-release','The bronze release',[
 line('Orrin','The teeth have stopped. Take the inside latch first.',{focus:{x:32,y:22},cut:true}),
 line('Queen Samira','I know this one. Hold the ring while I lift it.',{duration:800,actors:{samira:{to:{x:32,y:22}}}}),
 line('The observatory','The queen frees a narrow bronze band. Pale lettering still moves along its inner edge.',{cue:'paper'}),
 line('Minister Sahir','The pact still holds. We could put it back.'),
 line('Queen Samira','You barred my gate and set that creature above our street. You’ll answer for both.'),
 line('Petra','The city watch is at the lower stair. Give them the token.'),
 line('Queen Samira','Bring the ledger. They need to see what I signed before I break this.'),
]);
export const publicBreak=(mailSent=false)=>scene('namar','six-public','The western seal',[
 line('The evening exchange','Amal rings the postal bell. People gather on both banks. Sahir stands between two city watchmen.',{focus:{x:35,y:29},cut:true}),
 line('Queen Samira','Our palace bought imperial grain while the growing villages lost their days. I signed those orders.'),
 line('Queen Samira','The ward crews have copies. Open the palace granaries; the first barges go back along those routes.'),
 line('Minister Sahir','And when the Benefactor comes for us?'),
 line('Queen Samira','We have stores, boats and people who can sail them. We’ll put them alongside the towns already fighting it.'),
 line('Amal','The postal boats are ready. The ward crews have already sent their lists.'),
 line('The bronze band','Samira lays the band across the canal bollard and strikes it with the release lever. The lettering goes dark.',{cue:'resonance',effect:'pact-break',cut:true,duration:1100,focus:{x:35,y:29},actors:{samira:{to:{x:35,y:29}}}}),
 line('Orrin','The western return is open.'),
 line('Queen Samira','Take our navigators aboard. The canal barges can carry families out of the capital when the gate opens.'),
 line('Petra','The northern seal is still holding. We’ll need those barges ready.'),
 line('Amal',mailSent?'The westbound sack has gone, Kit. Nell’s letter is on its way to Tomas.':'The westbound sack leaves at the next bell. Bring Nell’s letter before you sail.'),
 line('Kit',mailSent?'Thank you. I’ll leave our next landing with the sorting desk.':'I’ll bring it to the sorting table.'),
]);
export const home=(mailSent=false)=>scene('outermooring','six-home','News from the canal',[
 line('Alda','One return has gone dark. The barrier’s still standing on the northern one.',{focus:{x:32,y:23},cut:true}),
 line('Kit',mailSent?'Namar’s sending pilots and barges. Your letter’s on its way to Tomas.':'Namar’s sending pilots and barges. The railway post is still running there.'),
 line('Nell','Was it anything like the capital?',{focus:{x:20,y:28}}),
 line('Orrin','Their clock runs on canal water. It stops whenever a boat parks badly.'),
 line('Nell','I’d like to see that.'),
 line('Orrin','I drew it for you. Kit’s got the page.'),
 line('Kit','I kept it flat. There’s a clean bit on the back if you want to— I’ll turn it round.'),
 line('Nell','Leave it there. I want to work out which boat is holding up the clock.'),
 line('Celia','And someone bring the tea over. She’s been waiting to hear this all afternoon.'),
]);
