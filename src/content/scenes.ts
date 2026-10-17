import { SAY, type Dialogue, type Line } from './disk-a/story';
import type { Cinematic, Shot } from './cinematics';
import type { GameState } from '../rules/state';

const line=(who:string,text:string,shot?:Shot):Line=>({...SAY(who,text),shot});
const scene=(id:string,title:string,actors:Cinematic['actors'],lines:Line[]):Dialogue=>({scene:{id,title,actors},lines});
const receipt={heading:'LARKSPUR · RECEIVING COPY',lines:['14 OCTOBER · 00:17','Thirty-one received. None substituted.'],signature:true};

export const opening=()=>scene('a-arrival','DISK A · THE WRONG PLATFORM',[
  {id:'nell',at:{x:23,y:13}},{id:'mira',at:{x:28,y:11}},{id:'inspector',at:{x:33,y:11},hidden:true},
],[
  line('Larkspur · 18:43','The empty platform bell rings twice, then holds its third note. A child steps down from the Rillbridge train.',{focus:{x:29,y:11},cut:true,cue:'return-call'}),
  line('Mira','Dad got off to ask about the delay. Please don’t let it go without me too.',{actors:{nell:{to:{x:25,y:12}}}}),
  line('Nell','We haven’t had a train from Rillbridge in forty years. What’s that you’re holding?'),
  line('Mira','It was on my seat. Your name’s on it.',{cue:'paper',document:receipt}),
  line('Nell','That’s my signature. See the tail under the whole name? I do that when I’m tired.',{document:receipt}),
  line('Nell','Thirty-one people? Dated tomorrow? I haven’t signed this.',{silence:true,document:receipt}),
  line('The inspector','Receiving copy. Hand it over.',{focus:{x:30,y:12},cue:'punch',actors:{inspector:{visible:true,to:{x:31,y:12}}}}),
  line('Nell','Stay behind me, Mira. This is station paperwork. I’m keeping it.',{actors:{nell:{to:{x:28,y:13}},mira:{to:{x:25,y:12}}}}),
  line('The inspector','The western return relay is closed. Do not attempt to answer it.',{actors:{inspector:{to:{x:36,y:12}}}}),
  line('Mira','My ticket’s only twenty minutes old. Can your mechanic make it take us back?',{focus:{x:26,y:12},actors:{inspector:{visible:false}}}),
  line('Nell','The date on your ticket is forty years old. The day the line flooded. Keep it with you; we’ll need both papers.'),
  line('Nell','Orrin’s in the square. We’ll find your dad. And I’m going to ask why that man is afraid of a receipt.'),
]);

export const relay=()=>scene('a-relay','THE FIRST ANSWER',[
  {id:'nell',at:{x:14,y:12}},{id:'orrin',at:{x:11,y:11}},{id:'mira',at:{x:17,y:12}},
],[
  line('Orrin','The fuse was pulled, not burnt. Someone wanted this end deaf.',{focus:{x:12,y:11},cut:true,actors:{orrin:{to:{x:12,y:10}}}}),
  line('The relay','Two short rings. One long. A strip of paper creeps out of the cabinet.',{cue:'return-call'}),
  line('Return wire','RILLBRIDGE · THIRTY-ONE AT RISK. FOOT CROSSING STILL OPEN.',{document:{heading:'INCOMING · MAINTENANCE WIRE',lines:['RILLBRIDGE · 31 AT RISK','KEEP THE FOOT CROSSING OPEN.']}}),
  line('The inspector · over the wire','Receiving copy unaccounted for. Seal the crossing.',{silence:true,cue:'punch'}),
  line('Orrin','He can hear us now too. The tunnel gate’s released; let’s get there before he closes the far end.'),
]);

export const timetable=(s:GameState)=>scene('a-timetable','A TRAIN FOR EVERY DISASTER',[
  {id:'nell',at:{x:20,y:11}},{id:'orrin',at:{x:24,y:11}},{id:'mira',at:{x:16,y:12}},
],[
  line('Maintenance timetable','Below Rillbridge are dates of flood, fire, and war. Every arrival is written in one hand.',{focus:{x:21,y:9},cut:true,cue:'paper',document:{heading:'RETURN SERVICES · WORKING COPY',lines:['RILLBRIDGE · 31','CINDERBANK · 14','PASSENGERS ONLY. NO SUBSTITUTIONS.']}}),
  line('Nell',s.flags.aReceiptSeen?'The receipt says we receive thirty-one. The relay says thirty-one are at risk. We haven’t missed them yet.':'Thirty-one at risk. The relay warned us, and the inspector tried to cut it off. We haven’t missed them yet.'),
  line('Mira','Does Dad get to come if his name isn’t on it?'),
  line('Nell','We’ll find him first. That man doesn’t get to decide who you leave behind.'),
]);

export const inspector=(s:GameState)=>scene('a-inspector','THE MAN FROM THE PLATFORM',[
  {id:'nell',at:{x:28,y:14}},{id:'orrin',at:{x:25,y:14}},{id:'mira',at:{x:21,y:14}},{id:'inspector',at:{x:34,y:13}},
],[
  line('The inspector',s.flags.aReceiptSeen?'You were told to leave the return wire closed. Give me the receiving copy and the child.':'One outstanding passenger. Return the child to the service.',{focus:{x:32,y:13},cut:true,cue:'punch',actors:{inspector:{to:{x:32,y:13}}}}),
  line('Nell','You ordered the crossing sealed with thirty-one people still there. What happens to them?'),
  line('The inspector','Their service will depart as recorded. You will not enter a different arrival.'),
  line('Nell','Then you’d better take my pen too.',{actors:{nell:{to:{x:30,y:14}},mira:{to:{x:19,y:14}}}}),
  line('Orrin','Mira, behind the wall. Nell, keep out of line with me. His staff throws a signal blast.'),
]);

export const across=()=>scene('a-boundary','THE DAY BEFORE',[
  {id:'nell',at:{x:36,y:14}},{id:'orrin',at:{x:33,y:14}},{id:'mira',at:{x:39,y:13}},
],[
  line('Beyond the tunnel','The inspector’s empty coat hangs on the signal arm. Its punch still clicks as they pass.',{focus:{x:34,y:13},cut:true,cue:'punch'}),
  line('Mira','There! Our blue door. Dad’s mending the hinge.',{focus:{x:39,y:13},actors:{mira:{to:{x:40,y:13}}}}),
  line('Orrin','Rillbridge. The roofs are whole. There’s washing out by the river.'),
  line('Nell','The memorial said no survivors. We can still get them out.'),
  line('Mira','Then come now. I want him to see you before the train leaves again.',{cue:'return-call'}),
]);

export const reunion=()=>scene('b-family','THE BLUE DOOR',[
  {id:'nell',at:{x:19,y:14}},{id:'orrin',at:{x:16,y:14}},{id:'mira',at:{x:20,y:12}},{id:'bram',at:{x:25,y:12}},
],[
  line('Mira','Dad!',{focus:{x:23,y:12},cut:true,actors:{mira:{to:{x:23,y:12}}}}),
  line('Bram','Mind the hinge. I haven’t—Mira? What’s happened to your shoes?'),
  line('Mira','You got off the train. I waited and waited.'),
  line('Bram','I haven’t been to the platform today. Your suitcase is upstairs.'),
  line('Nell','There’s a memorial for this town at Larkspur. The flood is tomorrow here. We came through before it.'),
  line('Bram','I don’t understand the memorial. I know what she looks like when she’s frightened.'),
  line('Mira','Please don’t go to ask anyone about delays.'),
  line('Bram','You and I stay together. Elspeth next door can’t walk the bridge steps. Help me bring her, and we’ll go.'),
  line('Orrin','I saw a braked trolley on the sluice rails. We’ll check the flood gauge while we’re up there.'),
]);

export const crossing=()=>scene('b-crossing','THIRTY-ONE ACROSS',[
  {id:'nell',at:{x:16,y:20}},{id:'orrin',at:{x:10,y:19}},{id:'bram',at:{x:22,y:19}},{id:'mira',at:{x:25,y:19}},{id:'elspeth',at:{x:20,y:21}},
],[
  line('Bram','Thirty-one names. Elspeth, would you count them off while I pull?',{focus:{x:21,y:20},cut:true}),
  line('Elspeth','I have been counting children through doors for forty years. Keep your eyes on the wheels.'),
  line('The crossing','The river spills over the lower quay. Orrin holds the gate; Nell takes the last cart through.',{focus:{x:13,y:19},actors:{bram:{to:{x:17,y:19}},mira:{to:{x:20,y:19}},elspeth:{to:{x:15,y:21}},nell:{to:{x:11,y:20}}}}),
  line('Mira','Dad? Still here?',{cue:'return-call'}),
  line('Bram','Still here. I’m the one pulling your suitcase.'),
]);

export function receiving(s:GameState):Dialogue{
  const f=s.flags;
  return scene('b-receipt','THE SIGNATURE',[
    {id:'nell',at:{x:16,y:10}},{id:'orrin',at:{x:20,y:11}},{id:'ansel',at:{x:13,y:7}},{id:'mira',at:{x:25,y:20}},{id:'bram',at:{x:28,y:20}},
  ],[
    line('Stationmaster Ansel',f.promisedHome?'You promised to bring them home. I’d have put the kettle on sooner if you’d mentioned there were thirty-one.':f.askedForTruth?'You wanted to understand the line. I see you brought witnesses.':'I counted thirty-one people coming out of the goods yard. Iona is opening the waiting room.',{focus:{x:15,y:9},cut:true}),
    line('Nell','Elspeth needs a bed without steps. Mira’s father is with her.'),
    line('Stationmaster Ansel','My office has one. Sign the receiving copy. I’ll find somewhere for my desk.'),
    line('Larkspur · after midnight','Nell checks the thirty-one names. Her last stroke trails beneath the whole name.',{cue:'paper',document:receipt}),
    line('Nell',f.aReceiptSeen?'Same hooked first stroke, same long tail. This is what Mira brought me.':'There’s another copy under the blotter. Same signature, same long tail. This one was here before I signed.',{silence:true,document:{...receipt,compare:true}}),
    line('Orrin','Let it dry. Put them side by side.'),
    line('Nell','The inspector wasn’t trying to keep an error out of the books. He was trying to stop this arrival.'),
    line('Tilda',f.bOrchardChannel?'We lost the orchard. We’re here, though. When people have slept, I’ll ask about flour on credit.':'The orchard bank held. When people have slept, I want to go back and see what we can bring over.'),
    line('Mira','Dad’s still here. You can keep the paper.',{focus:{x:26,y:20}}),
  ]);
}

export const ambulanceDoor=()=>scene('c-refusal','NO ATTENDANTS',[
  {id:'nell',at:{x:37,y:13}},{id:'orrin',at:{x:34,y:13}},{id:'dena',at:{x:41,y:12}},{id:'ivo',at:{x:45,y:12}},
],[
  line('The carriage door','Ivo takes the stretcher over the sill. The door clamps Dena’s bag strap against the frame.',{focus:{x:42,y:11},cut:true,cue:'punch',actors:{ivo:{to:{x:45,y:9}},dena:{to:{x:41,y:10}}}}),
  line('The carriage speaker','Fourteen registered patients. Attendants: zero. Unauthorized boarding refused.'),
  line('Dena','My bag is beside his head. Let me reach it.'),
  line('Nell','Ivo, bring him back. Nobody leaves without you.',{actors:{ivo:{to:{x:45,y:12}},nell:{to:{x:40,y:13}}}}),
  line('Orrin','Same punch mark as the inspector’s receipt order.',{document:{heading:'CINDERBANK · SERVICE ORDER',lines:['PATIENTS: 14 · ATTENDANTS: 0'],stamp:'RETURN REGISTRY · NO ADDITIONS'}}),
  line('Dena','There’s a footpath. Six miles of ballast, and two of them can’t sit up. We need this train.'),
  line('Nell','Then we use the working-crew register. Keep the brake pinned. He’s not choosing who gets care.'),
]);

export const collection=(s:GameState)=>scene('c-letter','ADDRESSED TO ORRIN',[
  {id:'nell',at:{x:29,y:12}},{id:'orrin',at:{x:32,y:12}},
],[
  line('Collection slip','A sealed green bag has arrived with the crew carbon. The address names Orrin, care of Larkspur repairs.',{focus:{x:31,y:11},cut:true,cue:'paper',document:{heading:'NORTHGLASS · REGISTERED LETTER',lines:['ORRIN · CARE OF LARKSPUR REPAIRS','BAG SEALED: SHIFT 783','CREW COPY FILED: SHIFT 786']}}),
  line('Orrin','Three shifts before we put our names in the register. Someone was waiting for my signature.'),
  line('Nell',s.flags.bReceiptMatched?'Like the receiving copy. Northglass has the bag; we have the crew copy that opens it.':'The date is early, but the address is yours. Northglass has the bag; we have the crew copy that opens it.'),
  line('Orrin','Not another passenger list. A letter to me. I’m taking my coat; we’re going there.'),
]);

export function fatherLetter(s:GameState):Dialogue{
  return scene('d-letter','THE UNSENT LETTER',[
    {id:'nell',at:{x:17,y:16}},{id:'orrin',at:{x:14,y:17}},{id:'petra',at:{x:14,y:14}},
  ],[
    line('Petra','Working crew: Nell, porter; Orrin, mechanic. The signatures match. The seal hasn’t been broken.',{focus:{x:15,y:16},cut:true,cue:'paper'}),
    line('Orrin',s.flags.bWorksheetRead?'The same hand as the Rillbridge sheet. This one’s addressed to me.':s.flags.scrapCleared?'The same hand as the wage envelope. There’s a letter inside.':'He’s put “care of Larkspur repairs” under my name.'),
    line('The letter','Orrin—Your ambulance crew copy came through. I nearly filed it. Then I saw your signature.',{silence:true,document:{heading:'ORRIN · FROM DAD',lines:['Your ambulance crew copy came through.','You couldn’t write your name when I left.']}}),
    line('The letter','You couldn’t write your name when I left. I heard the viaduct fall. At shift change I was back in the lamp room, with the burn still on my sleeve.'),
    line('Orrin','They brought his coat home. I couldn’t read yet. I remember trying to find that burn.'),
    line('The letter','The train takes my ticket, not my tools. I stayed to hold the return contact. Don’t bridge the returns at Northglass; earth both before you open it.'),
    line('The letter','I left your mother’s brass key in Brinewick’s parcel cage. One tooth filed down. The works has the number. If this reaches you, write back. Dad.'),
    line('Orrin','Her sewing-drawer key. She thought she’d lost it.'),
    line('Petra','The return feed’s tied into the workers’ road. Hang the independent red lamp first. Get those six off the tram; then we can isolate a safe reply wire.'),
    line('Nell','We’ll do it. Keep a blank sheet by the recorder.'),
  ]);
}

export const reply=()=>scene('d-reply','A REPLY FROM THE LAMP ROOM',[
  {id:'nell',at:{x:50,y:29}},{id:'orrin',at:{x:54,y:29}},{id:'esme',at:{x:47,y:29}},
],[
  line('Shift recorder','The green bag was sealed three shifts before our crew copy arrived. The earlier parcel is at Brinewick freight ferry, cage 6.',{focus:{x:53,y:28},cut:true,cue:'paper',document:{heading:'ISOLATED RECORDER · COUNTERFOIL',lines:['LETTER SEALED: 783 · CREW COPY: 786','EARLIER PARCEL: BRINEWICK · CAGE 6','BRASS DRAWER KEY · ONE TOOTH FILED']}}),
  line('Esme','I’ve got the yard circuit locked out. This wire only takes the lamp-room copy. Write what you want to send.'),
  line('Orrin','Dad. I got the letter. Mum kept the drawer. I can read your writing now.',{document:{heading:'TO THE MAINTENANCE LAMP ROOM',lines:['DAD. I GOT THE LETTER.','I CAN READ YOUR WRITING NOW.','— ORRIN']}}),
  line('Nell','Go on. Put it through.',{actors:{orrin:{to:{x:55,y:28}}}}),
  line('The recorder','The paper feeds through. Nell waits beside Orrin. A second strip pushes out against the first.',{silence:true,cue:'return-call'}),
  line('Lamp-room return','Orrin. Your handwriting has changed.',{silence:true,document:{heading:'LAMP ROOM · RETURN COPY',lines:['Orrin. Your handwriting has changed.','DON’T PUT YOUR NAME ON THE FERRY LIST.']}}),
  line('Orrin','Send again. Ask him where he is.'),
  line('The recorder','A round punch cuts through the next line. RETURN CONTACT UNDER INSPECTION.',{silence:true,cue:'punch',document:{heading:'RETURN REGISTRY',lines:['CONTACT UNDER INSPECTION.'],stamp:'REPLY RETAINED'}}),
  line('Nell','We have his reply. And the parcel number. At Brinewick we ask for the key, not a passenger ticket.'),
  line('Orrin','Put his strip inside the letter. He got one sentence through. I want the rest.'),
]);

export const nightPlan=()=>scene('d-night-plan','WHO STAYS TONIGHT',[
  {id:'nell',at:{x:31,y:25}},{id:'orrin',at:{x:35,y:25}},{id:'petra',at:{x:28,y:24}},{id:'esme',at:{x:37,y:24}},
],[
  line('Petra','With the feed off, I can close the works for tonight. The crew keeps its pay; tonight’s parcels wait until morning.',{focus:{x:32,y:24},cut:true}),
  line('Esme','Or we can work the local siding by hand bell. I’ll take one watch if you take the other. That gets the parcels away.',{actors:{esme:{to:{x:35,y:24}}}}),
  line('Petra','It keeps both of us here late. The main line stays red either way. No one tests the viaduct tonight.'),
]);
