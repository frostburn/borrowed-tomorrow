import { SAY,type Dialogue } from '../../dialogue';
import { stage } from '../../maps';
import type { GameState,MapId } from '../../../rules/state';
import type { Shot } from '../../cinematics';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(s:GameState,map:MapId,id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id).filter(a=>a.id!=='nell'||s.flags.nellRecovered||id==='six-north-home').map(a=>a.id==='nell'&&!s.flags.nellRecovered?{...a,face:map==='outermooring'?'nell-bed':'nell-ill',...(map==='outermooring'?{at:{x:18,y:28}}:{})}:a.id==='nell'&&map==='outermooring'?{...a,at:{x:27,y:28}}:a)},lines});
export const arrival=(s:GameState)=>scene(s,'bellharbor','six-north-arrival','Skeld · the winter expedition',[
 line('The bell harbor','A bell sounds across the snow roofs. A pilot answers from a launch beyond the covered quay.',{focus:{x:32,y:22},cut:true}),
 line('Egil','Two short bells for an open berth. In fog you follow the next boat’s answer.'),
 line('King Edric','We’ve had word from the western wards. There are beds under the fish market roof.'),
 line('Petra','We need the northern pact withdrawn. The Emperor has called your seal around his capital.'),
 line('King Edric','I sent that order three days ago. The imperial post closed our mountain passage and sent my expedition back.'),
 line('Signe','They left the king’s letter nailed to the gate. There are machines across the walk now.'),
 line('King Edric','Signe carries my commission. Get her to the sanctuary and she can release the seal.'),
 line('Orrin','We can open the passage. Will your expedition come with us?'),
 line('Signe','The porters are packed. Egil knows the glacier route; I know the release.'),
 line('Egil','It was a stair when I last took it. The ice has pulled back since then. We’ll see what’s left.'),
 ...(s.flags.nellRecovered?[line('Nell','We’ll bring rope. Kit, did the launch take our long coil?'),line('Kit','Under your bag. I mean—the equipment bag. I’ll get it.')]:[line('Celia','One of our companions is ill aboard. I’ll leave her care notes with your harbor medics.'),line('King Edric','They’ll take the next launch. We can keep the watch while you’re on the mountain.')]),
 line('Signe','The covered road starts above the eastern quay. Take warm coats before we go.'),
]);
export const watch=(s:GameState)=>scene(s,'frostwatch','six-north-watch','The closed mountain passage',[
 line('Frostwatch','The signal arm points across the covered road. A guardian stands beneath it, its joints white with frost.',{focus:{x:43,y:23},cut:true}),
 line('Signe','Our passage order is still on that post. They haven’t even taken it down.'),
 line('Petra','The officer’s gone. The machines will follow the last order he left.'),
 line('Egil','The road beyond the gate is sheltered all the way to the glacier. We can take the porters through there.'),
 line('Orrin','The gate cable’s sound. Clear the guardian and I’ll get the windlass moving.'),
 ...(s.flags.nellRecovered?[line('Nell','Leave the packs in the shelter. We’ll need room on that walk.')]:[line('Kit','The porters can wait in the shelter. I’ll signal when the walk’s clear.')]),
]);
export const gate=(s:GameState)=>scene(s,'frostwatch','six-north-gate','The expedition road',[
 line('Orrin','Ice in the pawl. Hold this while I lift it.',{focus:{x:43,y:24},cut:true}),
 line('Signe','I’ve got it. Egil, keep the porters back from the cable.'),
 line('The covered passage','The windlass turns. Snow falls from the rising gate; the porters shoulder their packs.',{cue:'defend',duration:1100}),
 line('Egil','Follow my tracks past the first turn. The old relief ships are below the eastern shelf.'),
 line('Kit','Ships? This high up?'),
 line('Egil','The bay came this far once. The winter that took them never left.'),
 ...(s.flags.nellRecovered?[line('Nell','I’ll follow the last porter. Pass the rope back when everyone’s through.')]:[]),
]);
export const wrecks=(s:GameState)=>scene(s,'glacier','six-north-wrecks','The fleet under the ice',[
 line('The glacier','A ship’s bow projects from blue ice. Below its broken rail, severed towropes hang beside a row of smaller boats.',{focus:{x:24,y:23},cut:true}),
 line('Egil','The White Finch. My father kept the engine on her.'),
 line('Signe','The memorial puts her inside the harbor. One of the rescue ships.'),
 line('Egil','Then somebody moved the harbor. That’s her name under the stern rail.'),
 line('Celia','There are coats in the small boats. They were carrying people.'),
 line('Kit','The dispatch case is still strapped shut. Orrin, can you lift this hinge?'),
 line('Orrin','Keep your fingers clear. There.'),
 line('The dispatch','“Cut refugee tows at the outer marker. Keep the protected harbor clear. Admit only ships named in the pact.” The imperial seal is pressed beside the order.',{cue:'paper'}),
 line('Signe','Our harbor log says the fleet brought everyone in.'),
 line('Egil','We waited at the bell. Mother kept saying they’d lost their way in the fog.'),
 ...(s.flags.nellRecovered?[line('Nell','We’ll bring the case down. The names are still readable.')]:[line('Kit','We’ll bring the case down. The names are still readable.')]),
 line('Egil','Leave the rope. I want the nameplate. Help me with the last bolt.'),
 line('Signe','I’ll carry the orders. The king can read the same words we did.'),
 line('Petra','There are wings on the upper shelf. Keep the porters behind the wreck while we clear the path.'),
]);
export const shrine=(s:GameState)=>scene(s,'wintershrine','six-north-shrine','The winter sanctuary',[
 line('The sanctuary','Ice wings fill the arch above the pact bell. The dragon draws breath; loose snow runs up the walk toward its mouth.',{focus:{x:32,y:19},cut:true,cue:'resonance'}),
 line('Egil','That bell used to guide the ships in. You could hear it from the outer marker.'),
 line('Signe','The dragon was carved above the door. Nobody fed it or kept it behind a gate.'),
 line('Celia','The white creatures cleared this place for it. Stay back from the broken shelf.'),
 line('Orrin','It’s drawing the snow uphill. Brace when it opens its mouth; don’t let it pull us under its claws.'),
 line('Petra','Watch its wings. They’re breaking the edge of the walk.'),
 ...(s.flags.nellRecovered?[line('Nell','The shelter’s out of reach. We can rest there before we cross.')]:[line('Kit','Egil, keep the expedition in the shelter. We’ll signal when you can reach the bell.')]),
]);
export const release=(s:GameState)=>scene(s,'wintershrine','six-north-release','The northern bell',[
 line('Signe','The king’s commission goes in this slot. Orrin, lift the catch when I turn it.',{focus:{x:32,y:22},cut:true}),
 line('Orrin','Ready. It’s free.'),
 line('The pact bell','Signe draws the silver tongue from its mounting. Pale letters go dark along the ice above the arch.',{cue:'resonance',effect:'pact-break',duration:1300}),
 line('Signe','The northern seal is released. Let’s get these people down before the weather turns.'),
 line('Egil','Give me a moment.'),
 line('The bell','Egil strikes its rim with the loose tongue. Across the glacier, a harbor bell answers.',{cue:'return-call',duration:900}),
 ...(s.flags.nellRecovered?[line('Nell','They heard you.')]:[line('Kit','They heard you.')]),
 line('Egil','They’ve been listening. Take the inside of the stair on the way down.'),
]);
export const returned=(s:GameState)=>scene(s,'bellharbor','six-north-return','The harbor record',[
 line('King Edric','The sanctuary signal has gone dark. Signe, did everyone get back?',{focus:{x:34,y:24},cut:true}),
 line('Signe','Everyone we took up. We found the relief fleet outside the old harbor.'),
 line('Egil','My father’s ship. The refugee tows were cut. These orders say why.'),
 line('King Edric','Let me see them.'),
 line('The harbor','The king reads beside the bell. Egil lays the nameplate on the dispatch case.'),
 line('King Edric','Open the harbor records. Put these beside them, with the names of every ship we turned away.'),
 line('Signe','The families will come looking. They’ll need someone here to read them.'),
 line('King Edric','Keep the old log too. They should see what we told them.'),
 line('Egil','I’ll stay until the next watch. Then I’m taking a launch to your ship.'),
 line('King Edric','Our pilots and winter stores go with him. The capital will need boats when that wall comes down.'),
 ...(s.flags.desertSealBroken?[line('Petra','Namar’s barges are ready. With both returns open, we can take them to the landing.')]:[line('Petra','Namar still holds the western seal. We’ll bring your pilots when we go.')]),
 ...(s.flags.nellRecovered?[line('Nell','We’ll leave the route with your bell-keepers. Nobody should have to wait without word.')]:[line('Celia','We’ll take the harbor medics back to Nell. She’ll want to hear the bells for herself.')]),
]);
export const home=(s:GameState)=>scene(s,'outermooring','six-north-home','News from Skeld',[
 line('Alda',s.flags.desertSealBroken?'Both returns are dark. Skeld’s pilots are alongside Namar’s barges.':'The northern return is dark. Egil has brought the first pilots.',{focus:{x:32,y:26},cut:true}),
 ...(s.flags.nellRecovered?[
 line('Nell','He rang the sanctuary bell before we came down. Someone answered all the way from the harbor.'),
 line('Kit','He’s teaching me the signals. I got the open berth right.'),
 line('Nell','I liked the one for fish. Can we keep that one too?'),
 line('Kit','I think Egil would prefer we didn’t.'),
 line('Nell','Then you’ll have to teach me the right one.'),
 ]:[
 line('Nell','I heard bells from the launch. Were they for us?',{focus:{x:20,y:28}}),
 line('Kit','Two short for an open berth. Egil’s teaching me the rest.'),
 line('Nell','Will you teach me that one?'),
 line('Kit','On the cup? Celia said—'),
 line('Celia','Use the empty one. I’m putting this on her table.'),
 line('The berth','Kit taps the rim twice. Nell answers on the bed frame.'),
 ]),
 line('Orrin',s.flags.desertSealBroken?'The bridge latch is moving. Alda, bring us alongside.':'The western line is still lit. We can take Namar’s course when everyone’s aboard.'),
]);
export const opened=(s:GameState)=>scene(s,'outermooring','six-capital-open','The allied landing',[
 line('Orrin','Both returns are out. Put a little weight on the bridge.',{focus:{x:32,y:19},cut:true}),
 line('The landing bridge','The bent latch lifts. Alda’s crew draw the bridge level; the pale wall thins above the white quay.',{cue:'resonance',effect:'pact-open',duration:1700}),
 line('Alda','Skeld’s pilots have the first berths. Namar’s barges are coming under us.'),
 line('Petra','The Emperor’s guards have left the outer steps. We can land.'),
 ...(s.flags.nellRecovered?[line('Nell','Take the patients first. We’ll meet the launches on the quay.')]:[line('Celia','I’m keeping Nell’s berth here. The launch can bring us back whenever we need it.')]),
 line('Alda','The inner gate’s open too. Let me make the landing safe before you go through.'),
]);
export const quay=(s:GameState)=>scene(s,'capitalquay','six-capital-quay','Behind the wall',[
 line('The capital quay','A woman pulls a handcart through the arch. At the fountain she turns, walks back, and pulls it through again.',{focus:{x:32,y:17},cut:true}),
 line('Kit','She’s going to the same place. She hasn’t even looked at the boats.'),
 line('Petra','That’s the cart we saw when he sealed the landing.'),
 line('Celia','Leave a clear way beside her. I want to see whether she can hear us.'),
 ...(s.flags.nellRecovered?[line('Nell','She’s dropped that cloth twice. Each time it’s back on the cart when she turns.')]:[line('Orrin','She’s dropped that cloth twice. Each time it’s back on the cart when she turns.')]),
 line('Alda','Hester’s fitters are at the patient hoist. Its bearing housing has split.',{focus:{x:44,y:30},cut:true,actors:{orrin:{at:{x:42,y:29},face:'orrin-right'}}}),
 line('Orrin','I can sleeve that. There’s a length of copper on the ship.'),
 line('A fitter','We’re taking it out. There’s a hand drum on the launch.'),
 line('Orrin','You’ll need something under the outer mounting.'),
 line('A fitter','Timber brace. We’ve checked the piles. We’ll test it with the ballast before anyone gets on.'),
 line('Alda','Do you need to stay with them?'),
 line('Orrin','No. That’ll do the job. Take my ring spanner; it fits the mounting.'),
 line('The quay','Orrin leaves the spanner beside the fitter’s tools and heads for the inner stair.',{focus:{x:40,y:30},actors:{orrin:{to:{x:38,y:29}}},duration:1400}),
 line('Alda','The launches can use this quay. I’ll keep a crew here while we find a way to reach the people inside.'),
]);
