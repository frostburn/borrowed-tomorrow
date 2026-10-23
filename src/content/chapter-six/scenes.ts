import { SAY,type Dialogue } from '../dialogue';
import { stage } from '../maps';
import type { MapId } from '../../rules/state';
import type { Shot } from '../cinematics';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(map:MapId,id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id).map(actor=>actor.id==='nell'?{...actor,face:'nell-ill'}:actor)},lines});
export const sealed=()=>scene('outermooring','six-sealed','Chapter Six · The Emperor’s Last Day',[
 line('The outer mooring','The landing bridge unfolds. Across the gap, a woman pulls a handcart through the capital gate.',{focus:{x:32,y:13},cut:true}),
 line('Alda','Hold for the bridge latch. Kit, pass me that line.',{focus:{x:32,y:25}}),
 line('The bridge','A pale wall descends across its far end. The bridge strikes it and buckles. Behind the wall, the handcart keeps moving.',{cue:'resonance',focus:{x:32,y:19}}),
 line('The Emperor','Withdraw your ship. The capital is under the protection of the old pact.'),
 line('Petra','There are people outside your gate.'),
 line('The Emperor','I have room for those already here. I will not lose them too.'),
 line('Celia','Your patron destroyed a ship full of your soldiers.'),
 line('The Emperor','Then you understand why this gate must stay shut.'),
 line('Kit','Nell’s below. She heard that crash.'),
 line('Alda','Tell her we’re holding. Nobody’s crossing that bridge.'),
 line('Orrin','Two returns in that wall. The old sanctuary chart had the same pair.'),
 line('Petra','Namar and the northern kingdom. Their rulers signed the defense pact with ours.'),
 line('Alda','We have their landing charts. Bring the copies to the table. We’ll ask them to open it.'),
]);
export const briefing=()=>scene('outermooring','six-briefing','Two foreign seals',[
 line('Petra','The pact was meant to shelter all three capitals. He’s called both seals around his own.',{focus:{x:32,y:25},cut:true}),
 line('Orrin','We can’t cut the returns from this side. Each has an open contact at the city that gave it.'),
 line('Alda','Namar’s western observatory. The northern sanctuary is above its glacier harbor. Either flight is within our range.'),
 line('Celia','Sera’s reply came with the last launch. She’s found people who treated crystal workers before the imperial wards opened.'),
 line('Kit','River healers. She’s marked their landing and sent her notes ahead.'),
 line('Celia','They may know how to interrupt what’s happening to Nell. It’s a separate journey; we can keep her comfortable here.'),
 line('Petra','The capital won’t let anyone through until both foreign seals are broken.'),
 line('Alda','The medics keep the berth. We keep the landings open. Mark your course when you’re ready.'),
]);
export const letter=()=>scene('outermooring','six-letter','The next letter',[
 line('Nell','Is the gate open?',{focus:{x:20,y:28},cut:true}),
 line('Kit','No. There’s a wall of light across the bridge. We’re going to the cities that hold it.'),
 line('Nell','What about the people we saw outside?'),
 line('Celia','Alda’s launches are collecting them. There’s room at the refuge.'),
 line('Kit','I’ve got Sera’s notes for the river healers. I’ll keep a copy on the ship.'),
 line('Nell','Send Tomas the route too. He’ll be trying to find us.'),
 line('Kit','I’ve written it. I left out the bit where I dropped the ink.'),
 line('Nell','He’ll work that out from the letter.'),
]);
export const city=()=>scene('namar','six-namar','The evening exchange',[
 line('Namar','A narrow postal boat slips beneath the bridge. Above the canal, awnings open for the evening market.',{focus:{x:32,y:23},cut:true}),
 line('Amal','Last sack for the western railway! If you’ve got letters, bring them over.'),
 line('Kit','You still take the railway post?'),
 line('Amal','They still write to us. The trains can stop without everybody forgetting their cousins.'),
 line('Kit','I have a ward report for the refuge. And a letter for Tomas.'),
 line('Amal','Two trays. Give me the report first.'),
 line('Orrin','That clock’s running off the canal.'),
 line('Amal','It loses a minute when the boats bunch up. Nobody has to pledge their grandchildren to fix it.'),
 line('Petra','We need to speak to your queen about the imperial pact.'),
 line('Amal','Samira’s expecting the survey ship. Cross the bridge and take the eastern palace door.'),
 line('Celia','She knows why we’ve come?'),
 line('Amal','The people from the coast sent more than supply lists. She’s been reading them all afternoon.'),
]);
export const court=()=>scene('sunpalace','six-court','The queen’s half of the pact',[
 line('Queen Samira','You brought the hospital ledger. Leave it open there.',{focus:{x:32,y:24},cut:true}),
 line('Celia','The treatments worked. This is what the villages paid for them.'),
 line('Minister Sahir','We have wards too. The Emperor has never collected here.'),
 line('Petra','He ordered his own medical coaches fired on. Alban carried out those orders until his patron killed him.'),
 line('Queen Samira','And his men?'),
 line('Kit','The light took the whole ship. We barely reached our gangway.'),
 line('Minister Sahir','Then this is when we need the pact most. What protects us if that light comes here?'),
 line('Queen Samira','We lent the Emperor our defense. Now he’s keeping it behind his own gate.'),
 line('Minister Sahir','He can still speak to the Benefactor.'),
 line('Queen Samira','So could Alban. I am withdrawing our seal. Bring the observatory release.'),
 line('Minister Sahir','I can’t let you expose the city.'),
 line('The court','Sahir closes his hand around the bronze token at his collar. A horn answers from the observatory.',{cue:'return-call',focus:{x:39,y:25}}),
 line('Minister Sahir','The guardian holds the release now. Keep her here until she understands.',{duration:1100,actors:{sahir:{to:{x:49,y:23}}},track:'sahir'}),
 line('The palace gates','A bar drops across the southern gate. The courtyard attendants step away from it.',{cue:'defend',focus:{x:31,y:33}}),
 line('Queen Samira','He’s posted his own men at my door.'),
 line('Petra','Stay behind my shield. We’ll get you out.'),
 line('Queen Samira','The postal stair is west. Amal will hear that horn. She’ll come to it.'),
]);
export const escaped=()=>scene('sunpalace','six-escape','The postal stair',[
 line('The courtyard','The cordon falls back. A small door opens behind the fountain.',{focus:{x:21,y:29},cut:true,actors:{sahir:{visible:false},amal:{visible:true}}}),
 line('Amal','Your Majesty. Are we using the respectable exit?'),
 line('Queen Samira','Apparently not.'),
 line('Amal','Good. I’ve left a boat under the wrong bridge to keep his men busy.'),
 line('Orrin','The observatory’s above these roofs?'),
 line('Amal','Follow the water jars. They’re for the post runners. There’s a shelter before the upper stair.'),
 line('Queen Samira','I’m coming. That release answers to my hand, whatever Sahir has put around it.'),
 line('Petra','Then take the inside of the railing.'),
]);
export const roofs=()=>scene('skywalk','six-roofs','Above the awnings',[
 line('The upper terraces','The market awnings lie below. Pale wings strike at the observatory’s rotating brass rings.',{focus:{x:47,y:17},cut:true}),
 line('Amal','Those aren’t our machines.'),
 line('Celia','We saw them at Nell’s hatch. The Benefactor’s creatures.'),
 line('Queen Samira','Sahir promised the guardian would protect us. It’s drawing them here.'),
 line('Kit','I can get a clear shot from the next terrace. Keep away from their straight lines.'),
 line('Amal','I’ll keep the stair open. There’s drinking water under the canopy.'),
]);
export const serpent=()=>scene('observatory','six-serpent','The sun serpent',[
 line('The royal observatory','A great serpent tightens around the bronze rings. Its breath turns spilled sand into shining glass.',{focus:{x:32,y:18},cut:true,cue:'resonance'}),
 line('Queen Samira','That ring measured the summer floods. My grandmother had it turned by hand.'),
 line('Minister Sahir','It woke when I asked it to defend us. It won’t let me near the release.'),
 line('Petra','Get down from that walk. It’s pointing at you too.'),
 line('Orrin','One coil loosens while the other closes. We can strike the loose one.'),
 line('Kit','The glass catches its breath and throws it sideways. Watch the reflected lanes.'),
 line('Queen Samira','Stop it. Then I can lift our seal from the apparatus.'),
]);
export const release=()=>scene('observatory','six-release','The bronze release',[
 line('Orrin','The teeth have stopped. Take the inside latch first.',{focus:{x:32,y:22},cut:true}),
 line('Queen Samira','I know this one. Hold the ring while I lift it.',{duration:800,actors:{samira:{to:{x:32,y:22}}}}),
 line('The observatory','The queen frees a narrow bronze band. Pale lettering still moves along its inner edge.',{cue:'paper'}),
 line('Minister Sahir','If you break it, he won’t defend us again.'),
 line('Queen Samira','You barred my gate and set that creature above our street. You’ll answer for both.'),
 line('Petra','The city watch is at the lower stair. Give them the token.'),
 line('Queen Samira','We signed this in the market, where everyone could see. That’s where I’ll end it.'),
]);
export const publicBreak=()=>scene('namar','six-public','The western seal',[
 line('The evening exchange','Amal rings the postal bell. People gather on both banks. Sahir stands between two city watchmen.',{focus:{x:35,y:29},cut:true}),
 line('Queen Samira','Our palace bought imperial grain while the growing villages lost their days. I signed those orders.'),
 line('Queen Samira','The wards have the full ledger now. We will send supplies back along the same routes.'),
 line('Minister Sahir','And when the Benefactor comes for us?'),
 line('Queen Samira','We’ll keep our people here and ask our neighbors to stand with us. We won’t pay for safety with theirs.'),
 line('Amal','The postal boats are ready. The ward crews have already sent their lists.'),
 line('The bronze band','Samira lays the band across the canal bollard and strikes it with the release lever. The lettering goes dark.',{cue:'resonance',duration:800,actors:{samira:{to:{x:35,y:29}}}}),
 line('Orrin','The western return is open.'),
 line('Queen Samira','Take our navigators aboard. The canal barges can carry families out of the capital when the gate opens.'),
 line('Petra','The northern seal is still holding. We’ll need those barges ready.'),
 line('Amal','I’ll keep the exchange open. Kit, your brother’s letter has gone.'),
 line('Kit','Her brother. I put the address on both sides, just in case.'),
]);
export const home=()=>scene('outermooring','six-home','News from the canal',[
 line('Alda','One return has gone dark. The barrier’s still standing on the northern one.',{focus:{x:32,y:23},cut:true}),
 line('Kit','Namar’s sending pilots and barges. Amal got a letter through to Tomas.'),
 line('Nell','Was it anything like the capital?',{focus:{x:20,y:28}}),
 line('Orrin','Their clock runs on canal water. It stops whenever a boat parks badly.'),
 line('Nell','I’d like to see that.'),
 line('Kit','I could ask Amal for a picture. Or a diagram. I mean, until—'),
 line('Orrin','I’ve got a diagram. You can explain the boats.'),
 line('Celia','Let her have her tea first. Then you can both tell her.'),
]);
