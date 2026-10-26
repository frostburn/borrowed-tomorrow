import {STAGED,type StageCue,type Dialogue} from '../dialogue';
import {stage} from '../maps';
import type {MapId} from '../../rules/state';
const l=(who:string,text:string,cue?:StageCue)=>STAGED(who,text,{...cue,portrait:who==='The Benefactor'?'benefactor':cue?.portrait});
const scene=(map:MapId,id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id)},lines:lines.map((line,index)=>index===1?{...line,shot:{focus:map==='homecoming'?{x:24,y:18}:map==='seaholiday'?{x:31,y:24}:{x:32,y:29},duration:900,...line.shot}}:line)});
export const crossing=()=>scene('hollowsill','seven-crossing','Under the sea',[
 l('The crossing','Water hangs overhead. A boat passes across it, upside down; its wake spreads without falling.',{focus:{x:32,y:29},cut:true,music:'hollowsill'}),
 l('Orrin','The mooring line’s tight. Alda, keep the drum locked.'),
 l('Alda','I can do that. Coming back will be your part.'),
 l('The hollow sun','A gold ring turns above the far stair. The figure beneath it lowers its hands across the road.',{focus:{x:32,y:22},duration:2200}),
 l('The Benefactor','Return to your ship. You have no place here.'),
 l('Celia','There are people in that light.',{expression:'worried',focus:{x:32,y:29}}),
 l('Nell','Let them go.',{expression:'angry'}),
 l('The Benefactor','Their lives are in my keeping. You will go no farther.',{focus:{x:32,y:22},duration:1200}),
 l('The crossing','The figure rises through the hanging water. Its hands lift clear of the stair.',{focus:{x:32,y:22},effect:'domain-withdraw',duration:1600}),
 l('Kit','There are stairs down to them. I’ll mark the turns.',{focus:{x:32,y:29}}),
 l('Nell','Then we start there.'),
]);
export const water=()=>scene('takenwater','seven-water','The waiting platform',[
 l('The platform','The bell and the shelter are Rillbridge’s. The rails end in open sky.',{focus:{x:32,y:23},cut:true}),
 l('A porter','Is Elspeth with you? She was counting us when the light came down.'),
 l('Nell','She’s safe. We stopped the collector in the village.'),
 l('A porter','We heard it stop. Then this thing started instead.'),
 l('The collector','The machine has the old pressure housing, but no rivets. Gold veins grow through the joins.'),
 l('Orrin','The palace keeper had this casing. Someone built a machine around something they found here.'),
 l('Petra','Hounds on the lower platform. Keep the passengers behind us.'),
]);
export const waterFree=()=>scene('takenwater','seven-water-free','The bell finishes ringing',[
 l('The platform','The collector’s casing splits. The bell swings past the same notch and rings a second note.',{focus:{x:32,y:24},cut:true,cue:'steam'}),
 l('A porter','My hands. I can feel the cold again.'),
 l('Celia','Go slowly. There’s a shelter at the crossing. Ask for Alda.'),
 l('Kit','Follow these blue ties. I’ve put them at every turn.'),
 l('Nell','Tell Elspeth we found you.'),
 l('The sea','A current leaves the water. High above, a strip of sky opens between the waves.'),
]);
export const harvest=()=>scene('firstfield','seven-harvest','The first good year',[
 l('The field','Ripe wheat bends beneath a skin of frost. The festival sun is carved into the threshing floor.',{focus:{x:32,y:23},cut:true,music:'firstfield'}),
 l('Nell','We hung that shape over the station every summer.'),
 l('A farmer','We made the first ones out of straw. The winter had killed two sowings. Then the grain came up in a night.'),
 l('Celia','The first imperial harvest?'),
 l('A farmer','There wasn’t an empire. Just a prince with an empty granary. He said we’d pay with winter days we weren’t using.'),
 l('Orrin','And the next valley?'),
 l('A farmer','Their summer went dark. They came here looking for food. The prince shut the granary.'),
 l('The Benefactor','I ripened the grain. Your prince chose who would eat.'),
 l('Nell','You still took the days.'),
 l('The Benefactor','He pledged the years after him. I kept what he gave.'),
 l('A farmer','We asked to go home. That machine keeps bringing us back to the row.'),
]);
export const harvestFree=()=>scene('firstfield','seven-harvest-free','The uncut row',[
 l('The field','The carrier stops. Frost melts along the row; the wheat falls where it was cut.',{focus:{x:32,y:24},cut:true,cue:'steam'}),
 l('Orrin','Same return valve as Hammerplain. The workers changed the pressure housing, but they kept its circuit.'),
 l('A farmer','I thought we’d spoiled the gift. Every year we worked harder.'),
 l('Petra','The road behind us is open. Nobody’s keeping you at the harvest.'),
 l('The hollow sun','One stream of light gutters out at the distant figure’s shoulder.'),
 l('Nell','It’s losing what it took. Keep the next road open.'),
]);
export const hospice=()=>scene('quietward','seven-hospice','After the healing',[
 l('The hospice','A woman sits beside a made bed. Beyond the window, the same leaf falls upward into a tree.',{focus:{x:32,y:23},cut:true,music:'quietward'}),
 l('A patient','My daughter brought me here last winter. They said my fever had broken. She went to fetch my shoes.',{focus:{x:24,y:32}}),
 l('Celia','May I look at your wrist?'),
 l('A patient','You’re a physician. Can you discharge me?'),
 l('Celia','I can help you walk out. That binding has rubbed through the skin.'),
 l('The Benefactor','Without me, the fever would have ended her life.'),
 l('Celia','You treated her. You didn’t become her owner.'),
 l('The Benefactor','Every morning she lived was a morning I gave.'),
 l('The patient','I wanted to spend them with my daughter.'),
 l('Orrin','The lamps are feeding the lens, just like Windmere. Break its projections and we can get her past it.'),
]);
export const hospiceFree=()=>scene('quietward','seven-hospice-free','Out of bed',[
 l('The hospice','The mirrors go dark. Celia folds a strip of clean cloth around the woman’s wrist.',{focus:{x:24,y:32},cut:true,cue:'mend'}),
 l('Celia','Put your weight on my arm. We’ll stop if you need to.',{focus:{x:24,y:32}}),
 l('A patient','I’d like to keep going.'),
 l('Kit','The porter’s waiting at the lower turn. He can walk with you.'),
 l('The hollow sun','A second stream breaks. The gold figure shifts; flakes of its mantle fall into the sea.'),
 l('Petra','It can feel this. Watch the next crossing.'),
]);
export const seasons=()=>scene('seasonstreet','seven-seasons','The road between seasons',[
 l('The city','Snow lies against a Namar doorstep. A jungle stair descends into the wall of a Skeld warehouse.',{focus:{x:32,y:22},cut:true,music:'seasonstreet'}),
 l('Kit','That stair goes back to the hospice. It didn’t a moment ago.'),
 l('Orrin','Give me a tie from your bag. I can jam the return wheel.'),
 l('Petra','I’ll hold the stair while they come through.'),
 l('The Benefactor','I kept their harvests. Their recoveries. Their summers. Outside, everything I gave them ends.'),
 l('Nell','They’ve asked to leave.'),
 l('The city','Ice spreads down the terrace. Wings lift above the gate.'),
 l('Celia','Skeld’s dragon. There’s no bell under it this time.'),
 l('Orrin','There’s the last return. It’s keeping the whole road inside.'),
]);
export const seasonsFree=()=>scene('seasonstreet','seven-seasons-free','One road stays open',[
 l('The city','The ice breaks away from the gate. Orrin drives the wheel past its stop and wedges the teeth apart.',{focus:{x:32,y:24},cut:true,cue:'steam'}),
 l('Kit','This way! Keep the children on the inside of the stair.'),
 l('Petra','The landing’s clear. Send the next group.'),
 l('The hollow sun','The last stream tears free. For the first time, the distant ring stops turning.'),
 l('Nell','There’s a shelter beyond the gate. We get everyone there before we climb.'),
]);
export const refuge=()=>scene('lastrefuge','seven-refuge','The unwritten hour',[
 l('The shelter','The porter has set out water. The farmer is cutting cloth for bedding; a child is asleep beside the last stair.',{focus:{x:32,y:24},cut:true,music:'lastrefuge'}),
 l('A porter','Alda answered the bell. The first group’s across.'),
 l('Celia','Leave the sleeping ones here. We’ll bring the next group together.'),
 l('Kit','I checked the whole route. Blue ties at the turns, two at the broken step.'),
 l('Nell','I saved you some water. There’s room beside me.'),
 l('Kit','Thank you. The porter’s taking the next group; I can stay a while.'),
 l('Nell','Good. I wanted you here.'),
 l('Orrin','The gate will stay open. It isn’t drawing from the sun anymore.'),
 l('Petra','We can rest. Then we finish this.'),
]);
export const celia=()=>scene('lastrefuge','seven-ready','A drink of water',[
 l('Celia','I’ve left water at the next landing. Check your dressings before we go.',{focus:{x:34,y:30},cut:true}),
 l('Nell','Have you had any water?',{actors:{nell:{to:{x:33,y:30},face:'nell-right'}},duration:800}),
 l('Celia','Not yet. There’s some in the flask.',{actors:{celia:{face:'celia-left'}}}),
 l('Nell','We can wait.'),
 l('Celia','Then stay here a little, will you? I’d like some company.'),
 l('Nell','Until we’re all ready.'),
]);
export const orrin=()=>scene('lastrefuge','seven-orrin','The next watch',[
 l('Orrin','I took the return spring out. It can’t put the gate back while anyone’s crossing.',{focus:{x:30,y:29},cut:true}),
 l('Nell','You’re still listening for it.',{actors:{nell:{to:{x:31,y:28},face:'nell-left'},orrin:{face:'orrin-right'}},duration:700}),
 l('Orrin','Old habit. The porter knows the catch now. He’s taking the next watch.'),
 l('Nell','And you?'),
 l('Orrin','I’d like to ride a train without listening for what’s about to break.'),
 l('Nell','You’re coming with us.'),
 l('Orrin','Then I’m getting a window seat.'),
]);
export const god=()=>scene('sunthrone','seven-god','The god who lent tomorrow',[
 l('The sun throne','The Benefactor lowers its hands. Its empty face contains the same night as the sea beneath the crossing.',{focus:{x:32,y:18},cut:true,music:'benefactor'}),
 l('The Benefactor','You carry my light into my own house. Where are the lives you took from it?'),
 l('Nell','On their way home.'),
 l('The Benefactor','I held the winter back. I closed their wounds. What have you brought to replace me?'),
 l('Orrin','Engines that people can stop.'),
 l('Celia','Care they can leave.'),
 l('Petra','A road they’re allowed to take.'),
 l('The Benefactor','And when those things fail?'),
 l('Nell','We help each other. You don’t get to keep us until nothing hurts.'),
 l('The sun throne','The god’s hands close over the stair. Its broken shoulder streams reach for the empty channels.'),
]);
export const sun=()=>scene('sunthrone','seven-sun','The mantle falls',[
 l('The sun throne','The mantle breaks from its shoulders. No light comes to fill the cracks.',{focus:{x:32,y:18},cut:true,cue:'flare',effect:'domain-break',duration:2100,music:'hollow-sun'}),
 l('Orrin','The channels are empty. It can’t build another body.'),
 l('The Benefactor','I was here before your stations. Before your names.'),
 l('The sun throne','The ring lifts from the wreckage. Its rays unfold across the floor.'),
 l('Petra','It can still reach us. Watch where the light falls.'),
]);
export const heart=()=>scene('sunthrone','seven-heart','The fragment goes home',[
 l('The sun throne','The ring splits. A pale heart turns inside it; the lantern pulls toward the opening.',{focus:{x:32,y:18},cut:true,cue:'flare',effect:'domain-break',duration:2100,music:'unborrowed'}),
 l('Nell','This came out of you.'),
 l('Celia','The collar Ines fitted is still holding. You can let it go.'),
 l('Nell','Orrin, the glass.'),
 l('The lantern','Orrin lifts the catch. Nell tips the fleck into her palm and lets it fall into the broken ring.'),
 l('The sun throne','The heart closes around it, then opens along the fracture. The cold leaves the lantern’s handle.',{focus:{x:32,y:24},effect:'domain-fragment',duration:1800}),
 l('Kit','Nell?'),
 l('Nell','I’m here. The flame’s still lit.'),
 l('Petra','The heart’s exposed. Together.'),
]);
export const released=()=>scene('sunthrone','seven-release','The days return',[
 l('The sun throne','The heart breaks. The ring opens into separate rays, then falls apart.',{focus:{x:32,y:18},cut:true,cue:'mend',effect:'domain-release',duration:2100,music:'homecoming'}),
 l('The sea','Water drops toward a real horizon. Across the broken terraces, people turn toward voices from the crossing.'),
 l('Celia','Nell, your pulse is steady. The binding’s gone.',{actors:{celia:{to:{x:33,y:27},face:'celia-left'}},duration:600}),
 l('Orrin','The return channels are empty. There’s nothing left to collect them.'),
 l('Nell','Kit, can you see the blue ties?'),
 l('Kit','All the way back.'),
 l('Petra','Then we take that road too.'),
]);
export const home=()=>scene('homecoming','seven-home','Larkspur, this morning',[
 l('Larkspur','The whistle sounds over the station. No lamp answers it.',{focus:{x:24,y:14},cut:true,music:'homecoming'}),
 l('Tomas','I thought I’d have to buy these tickets a third time.',{expression:'happy'}),
 l('Nell','You didn’t give my seat away?'),
 l('Tomas','Your bag’s already on it.'),
 l('Iona','The porter from Rillbridge came through yesterday. Elspeth made him sit while she counted everyone.'),
 l('Celia','The woman from the first hospice reached her family. They’re finding room for the others.'),
 l('Orrin','Hester sent the first ordinary ward engine. They had it running before we got back.'),
 l('Petra','Namar and Skeld have crews on the roads. There’s work waiting when we return.'),
 l('Nell','When we return.'),
 l('Iona','Petra, there’s a letter for you. Dena sent it with the ward post.',{focus:{x:21,y:14},actors:{petra:{to:{x:22,y:13},face:'petra-back'}},duration:1000}),
 l('Petra','About the exchange?'),
 l('Iona','Some of the Cinderbank families want to ask you about the crossing. She wants to know if you’ll come back.'),
 l('Petra','Tell her I’ll be there after the sea trip. She has my account; I’ll answer them in person.'),
 l('Larkspur','Petra folds the letter into her coat.'),
 l('Iona','I’ll tell her.'),
 l('Larkspur','Ansel’s cap hangs beside the office door. Iona has left the hook beneath it empty.'),
 l('Iona','Go on. I can manage one train without the lot of you.'),
]);
export const sea=()=>scene('seaholiday','seven-sea','Tomorrow belongs to us',[
 l('The coast','The sea moves under an ordinary sky. Tomas puts the picnic down and takes off his shoes.',{focus:{x:31,y:21},cut:true,music:'seaholiday'}),
 l('Tomas','All that way, and I forgot a knife.',{expression:'happy'}),
 l('Petra','I have one.'),
 l('Orrin','She does tend to.'),
 l('Kit','I marked the path back to the station. We’ve got until evening.'),
 l('Nell','Then come down here with me. You can show me the fishing boats.',{focus:{x:29,y:22},actors:{nell:{to:{x:28,y:22}},kit:{to:{x:30,y:22}}},duration:1000}),
 l('The coast','Nell sets the lantern on the sand. Its handle is warm from the sun.',{actors:{nell:{at:{x:28,y:22},face:'nell-rest'},kit:{at:{x:30,y:22},face:'kit-rest'}}}),
 l('Kit','That one’s a fishing boat. See the baskets?'),
 l('Nell','I remember.'),
 l('The shore','She reaches for his hand. Kit takes it, and they stand together while the boat passes.',{actors:{nell:{at:{x:29,y:22},face:'pair-hands'},kit:{visible:false}},duration:900}),
 l('Nell','I’m glad you came with us.',{expression:'happy'}),
 l('Kit','So am I.',{expression:'happy'}),
]);
export const picnic=()=>scene('seaholiday','seven-picnic','A hand of cards',[
 l('Petra','Orrin. It’s your turn.',{focus:{x:32,y:26},cut:true}),
 l('Orrin','I’m deciding.',{focus:{x:32,y:26}}),
 l('Kit','You’ve got one card.'),
 l('Orrin','It’s an important decision.',{expression:'happy'}),
 l('Celia','Does he take this long with a valve?'),
 l('Nell','Longer. He explains what it ought to have done.'),
 l('Orrin','They never listen.'),
 l('Celia','Come over here, Nell. Petra’s been helping me.'),
 l('Petra','And we’re still losing.',{expression:'happy'}),
 l('Nell','Deal me in.',{expression:'happy'}),
]);
