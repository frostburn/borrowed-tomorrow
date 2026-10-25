import { SAY,type Dialogue } from '../../dialogue';
import { stage } from '../../maps';
import type { Shot } from '../../cinematics';
import type { GameState,MapId } from '../../../rules/state';
const line=(who:string,text:string,shot?:Shot)=>({...SAY(who,text),shot});
const scene=(map:MapId,id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id).map(a=>a.id==='nell'&&id==='six-river-treatment'?{...a,face:'nell-faint'}:a)},lines});
export const arrival=()=>scene('riverhaven','six-river-arrival','Iria · the next launch',[
 line('The river landing','A launch noses between the piles. Two passengers pass a basket of folded cloth up to the quay.',{focus:{x:31,y:28},cut:true}),
 line('Tavi','Keep the blue basket dry. Ines, your examination lamp is under the seat.'),
 line('Ines','Leave room beside it. Sera said you were bringing a patient.'),
 line('Celia','Nell’s aboard the survey ship. Her pulse follows a crystal fragment, even when we move it away.'),
 line('Ines','I read your notes. The quarry workers used to come to us with that. Is she awake?'),
 line('Kit','She was correcting my letter when we landed.'),
 line('Ines','Good. I’ll need her to tell me what she feels. We have the equipment at the rain house.'),
 line('Tavi','The old patrol has closed the boat chain. My other patients are waiting here too.'),
 line('Orrin','We’ll open the passage. Keep Nell on the ship until we’ve seen the landing.'),
 line('Celia','I’ll compare the treatment notes with you before she comes across.'),
 line('Ines','Take the eastern path. Tavi knows where the chain catches. We’ll pack the boat while you clear it.'),
]);
export const crossing=()=>scene('canopy','six-river-crossing','The closed waterway',[
 line('The canopy passage','Vines have grown through the old signal post. Beneath it, patrol machines stand across the bridge.',{focus:{x:35,y:28},cut:true}),
 line('Tavi','They shut it when the white creatures came upriver. We’ve been using the lower quay ever since.'),
 line('Petra','That post is still giving them orders. We’ll have to get past them.'),
 line('Orrin','The boat chain runs through this capstan. Once the walk is clear, I can lift it.'),
 line('Kit','I’ll take the outer rail. Keep the patients at the lower landing until we signal.'),
]);
export const chain=()=>scene('canopy','six-river-chain','The treatment boat',[
 line('Orrin','The chain’s free of the teeth. Tavi, take the handle while I lift it.',{focus:{x:34,y:28},cut:true,cue:'defend',effect:'river-launch',duration:1300}),
 line('Tavi','Easy. There—keep it over that peg.'),
 line('The river','The chain rises out of the channel. The treatment boat passes below the bridge, its lamp wrapped against the spray.'),
 line('Celia','Ines has the notes and equipment. We still need to check the upper landing before Nell comes across.'),
 line('Tavi','I’ll bring the boat to the rain house. The path climbs above the eastern bank.',{actors:{tavi:{to:{x:38,y:28}}},track:'tavi',duration:1000}),
]);
export const rainhouse=()=>scene('rainhouse','six-rainhouse','The rain house',[
 line('The rain house','Open shutters face the river. Pale wings cover the treatment deck; a tall figure stands over the landing bell.',{focus:{x:33,y:26},cut:true}),
 line('Celia','They’ve taken the upper landing. Ines’s boat is still below the bend.'),
 line('Tavi','I won’t bring anyone to this rail while those things are here.'),
 line('Kit','The same wings came for Nell’s hatch. I’ll keep them off the boat.'),
 line('Petra','We clear the deck first. Spread out where that tall one can’t line us up.'),
 line('Orrin','The west awning is clear. We can use the shelter before we go in.'),
]);
export const treatment=()=>scene('rainhouse','six-river-treatment','The quiet pulse',[
 line('The upper landing','Tavi brings the launch alongside. Kit and Petra lift Nell from the boat while Celia takes her bag.',{focus:{x:42,y:29},cut:true,effect:'river-launch',actors:{kit:{face:'kit-carry'},petra:{face:'petra-carry'}},duration:1300}),
 line('Nell','I can manage the last step.'),
 line('Kit','We’ve got you. Just to the cot.'),
 line('Ines','This way. Tell me if the pull changes.',{focus:{x:32,y:25},actors:{nell:{to:{x:31.5,y:24}},kit:{to:{x:30,y:25}},petra:{to:{x:33,y:25}},celia:{to:{x:29,y:26}}},duration:2200}),
 line('The cot','Kit and Petra lower Nell onto the mattress. Celia draws the cover over her.',{actors:{nell:{to:{x:31.5,y:25},face:'nell-ill'}},duration:650}),
 line('Celia','Moving the lantern didn’t break the rhythm. Even in the next room, her pulse followed it.',{actors:{kit:{to:{x:29,y:27},face:'kit'},petra:{to:{x:34,y:27},face:'petra'},celia:{to:{x:30,y:25}}},duration:700}),
 line('Ines','The binding is on her now. Set the lantern beside the basin; I’ll follow it back.'),
 line('Nell','Do I have to hold it?'),
 line('Ines','Just two fingers on the handle. Tell me when it feels cold.'),
 line('Celia','Let me turn the collar. If it tightens again—'),
 line('Ines','I’ve used it before, Celia. Watch her pulse for me.'),
 line('Nell','Celia. Will you stay by me?'),
 line('Celia','Yes. I’ll watch your wrist.',{actors:{celia:{face:'celia-right'}}}),
 line('The treatment','Ines turns the split collar around the fragment. Celia watches Nell’s wrist as the light in the basin grows still.',{focus:{x:33,y:26},effect:'river-treatment',cue:'resonance',silence:true,duration:1800}),
 line('Nell','Now. It’s cold.'),
 line('Celia','Her pulse has stopped following it.'),
 line('Ines','Let go. The shard stays in the lamp; the binding can settle without pulling on her.'),
 line('The rain house','Rain passes over the roof. When Nell wakes again, the lantern is humming softly on the table.'),
 line('Nell','It did that before it hurt. It doesn’t hurt now.'),
 line('Celia','I’ve checked it twice. You can get up when you’ve eaten something.'),
 line('Nell','Then someone had better find my shoes.'),
]);
export const rest=()=>scene('rainhouse','six-river-rest','A little farther',[
 line('Nell','Kit. Come over here, will you?',{focus:{x:30,y:28},cut:true,actors:{nell:{to:{x:29,y:28}}},duration:800}),
 line('Kit','I put your water here. Is there anything else you—'),
 line('Nell','You. I wanted to see you without someone counting my pulse.'),
 line('Kit','Oh. I kept thinking I’d left something on the boat.'),
 line('Nell','My shoes?'),
 line('Kit','Only once.'),
 line('Nell','I missed talking to you.'),
 line('Kit','I missed it too.',{actors:{kit:{to:{x:30,y:28}}},duration:600}),
 line('The rain house','Nell sets the lantern by her feet and steps close to Kit.',{actors:{nell:{face:'nell-rest'},kit:{face:'kit-rest'}}}),
 line('Nell','I’m all right now.'),
 line('The river','She puts her arms around him. After a moment, he hugs her back.',{actors:{nell:{at:{x:29.5,y:28},face:'pair-hug'},kit:{visible:false}},duration:900}),
 line('Kit','I was frightened.'),
 line('Nell','So was I. Stay here a little while.'),
 line('Celia','I’ll be inside if you need me. Take your time.'),
 line('The rain house','They let go. Nell stays beside him, watching the rain reach the river.',{actors:{nell:{at:{x:29,y:28},face:'nell-rest'},kit:{at:{x:30,y:28},face:'kit-rest',visible:true}}}),
 line('Nell','I’d like a walk when it stops. Will you come with me?'),
 line('Kit','As far as you like.'),
]);
export const thanks=()=>scene('riverhaven','six-river-thanks','The open passage',[
 line('Tavi','The morning patients are back. We can use the upper landing again.',{focus:{x:28,y:30},cut:true}),
 line('Nell','Ines, I don’t know what to say.'),
 line('Ines','Tell Sera what happened. She’ll have other patients to use it for.'),
 line('Celia','I’ve copied every step. I’d like your corrections before we send it.'),
 line('Ines','Leave it at the table. You can use the launch whenever you need us.'),
 line('Nell','I want to keep going. There are people outside that capital gate.'),
 line('Kit','Your bag’s on the survey launch. The shoes are in it this time.'),
]);
export const home=(s:GameState)=>scene('outermooring','six-river-home','Back at the flight chart',[
 line('Alda','There you are. Come round this side of the table, Nell.',{focus:{x:32,y:26},cut:true}),
 line('Nell','I’d like to see the route for myself.'),
 line('Celia','Ines is keeping a copy of the treatment. Sera will get ours with the next launch.'),
 line('Alda',s.flags.desertSealBroken&&s.flags.northSealBroken?'Both returns are dark. The two fleets are ready at the landing.':s.flags.northSealBroken?'Skeld’s return is dark. We can take their pilots with us to Namar.':s.flags.desertSealBroken?'Namar’s return is dark. Their navigators are helping with the northern approach.':'Namar and Skeld still hold the pact seals. We have room to land at either.'),
 line('Nell',s.flags.desertSealBroken&&s.flags.northSealBroken?'Then let’s bring the bridge level.':s.flags.northSealBroken?'Then show me Namar’s landing.':s.flags.desertSealBroken?'Then show me where the northern seal joins the wall.':'Let’s start with the people who can open that wall.'),
 line('Kit','I’ll bring the other chart. The clean one.'),
]);
