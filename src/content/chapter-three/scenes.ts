import { SAY,type Dialogue,type Line } from '../dialogue';
import type { Cinematic,Shot } from '../cinematics';
const line=(who:string,text:string,shot?:Shot):Line=>({...SAY(who,text),shot});
const scene=(id:string,title:string,actors:Cinematic['actors'],lines:Line[]):Dialogue=>({scene:{id,title,actors},lines});
export const arrival=()=>scene('three-capital','CHAPTER THREE · BENEATH THE PALACE',[
  {id:'nell',at:{x:32,y:31}},{id:'orrin',at:{x:29,y:32}},{id:'kit',at:{x:34,y:31}},
],[
  line('The south medical siding','The clerk checks the clearance, breaks the platform seal and waves the medical coaches through.',{focus:{x:47,y:12},cut:true,cue:'paper'}),
  line('Kit','Same seal. I told you it was the right siding.',{focus:{x:32,y:30},cut:true}),
  line('Orrin','I’ll keep the coal engine under steam. The ward staff can unload here.'),
  line('Nell','And the engine works?'),
  line('Kit','Through the glass doors on the right. The transfer window’s inside.'),
  line('Nell','Then we’re finally in the same station as him.'),
]);
export const refusal=()=>scene('three-refusal','THE ARREST ORDER',[
  {id:'nell',at:{x:35,y:22}},{id:'orrin',at:{x:32,y:23}},{id:'kit',at:{x:34,y:24}},
  {id:'petra',at:{x:38,y:20}},{id:'alban',at:{x:42,y:18}},
],[
  line('Captain Alban','Petra. Seal those coaches. The passengers are imperial property.',{focus:{x:38,y:21},cut:true}),
  line('Petra','They’re patients. Their clearance is in order.'),
  line('Captain Alban','Their clearance is revoked. Arrest the girl and deliver her lantern to the palace.'),
  line('Petra','You promised Cinderbank an evacuation. I watched you turn the collector on them instead.'),
  line('Captain Alban','You changed the points. I have the signal record.'),
  line('Petra','Then you know my answer.'),
  line('The square','Petra takes the command rod from Alban’s hand and snaps it against the rail.',{cue:'strike',actors:{petra:{to:{x:40,y:20}}}}),
  line('Captain Alban','The machines have their orders. You can answer to the emperor.',{actors:{alban:{to:{x:46,y:17}}}}),
  line('Petra','Nell, the guardian. I’ll hold the coach doors.',{actors:{alban:{visible:false},petra:{to:{x:35,y:25}}}}),
]);
export const defection=()=>scene('three-defection','NO RETURN ORDER',[
  {id:'nell',at:{x:35,y:22}},{id:'orrin',at:{x:32,y:23}},{id:'kit',at:{x:34,y:24}},{id:'petra',at:{x:38,y:20}},
],[
  line('Petra','The coaches are clear. Alban’s gone to the palace.',{focus:{x:36,y:21},cut:true}),
  line('Nell','Are you coming after my lantern again?'),
  line('Petra','No. I’m going to help you get your brother out. After that, I’ll answer for what I did at the exchange.'),
  line('Kit','You could start by telling us what’s behind those doors.'),
  line('Petra','A control gallery. Prisoners service the intake instruments. The wardens execute anyone who interferes with the readings.'),
  line('Nell','Then we’re going now.'),
  line('Petra','Take this spare saber hilt. Mine fits it. I’ll cover you through the gallery.'),
]);
export const gallery=()=>scene('three-gallery','A VALVE HELD OPEN',[
  {id:'nell',at:{x:30,y:31}},{id:'orrin',at:{x:28,y:32}},{id:'kit',at:{x:33,y:31}},{id:'petra',at:{x:35,y:31}},
  {id:'tomas',at:{x:23,y:13}},{id:'engineWarden',at:{x:23,y:16}},
],[
  line('The control gallery','The intake needles sink, rise, then sink again. A man at the rear workbench is keeping one hand inside an open valve casing.',{focus:{x:23,y:15},cut:true,cue:'steam'}),
  line('Nell','Tomas!'),
  line('Tomas','Nell? Stay left of the table! I’ve got its alarm line open.'),
  line('The Engine Warden','Intake interference. Disposal authorized.',{actors:{engineWarden:{to:{x:22,y:16}}}}),
  line('The control gallery','The warden lowers its shears. Tomas wedges his wrench into the casing and pulls his hand free.',{cue:'punch'}),
  line('Nell','Orrin, break that thing!'),
]);
export const rescue=()=>scene('three-reunion','TOMAS',[
  {id:'nell',at:{x:22,y:15}},{id:'tomas',at:{x:23,y:13}},{id:'orrin',at:{x:20,y:16}},{id:'kit',at:{x:24,y:17}},{id:'petra',at:{x:21,y:19}},
],[
  line('Orrin','Give me your wrist. Hold still.',{focus:{x:22,y:15},cut:true,cue:'strike'}),
  line('The workbench','The restraint falls open. Tomas steps down and Nell catches him before his bad leg gives way.',{actors:{tomas:{to:{x:23,y:15}}}}),
  line('Tomas','You came all this way.'),
  line('Nell','You kept leaving before I got there.'),
  line('Tomas','I wasn’t doing it on purpose.'),
  line('Nell','I know.'),
  line('The gallery','For a moment Nell keeps both hands twisted in his coat. The open valve hisses behind them.'),
  line('Tomas','Is Ansel with you?'),
  line('Nell','Alban killed him. At the station.'),
  line('Tomas','Oh, Nell.'),
  line('Nell','We’re getting you out. Orrin brought the engine.'),
  line('Orrin','Coal-fired. Unfashionable. Still running.'),
  line('Tomas','I held the intake open so it couldn’t sound the outer alarms. There’s a whole vessel under this floor. The collectors send people’s days into it.'),
  line('Petra','And the palace draws its power from that?'),
  line('Tomas','I stole a piece to prove it. I thought someone would stop the collections if they saw. Instead they brought me back to keep it running.'),
  line('Nell','We’ll stop it ourselves. You’re going to the medical train.'),
  line('Tomas','The intake controls are on that table. Cut the feeds or vent the pressure line. I can bypass the execution circuit before I go.'),
  line('Kit','The ward staff are just outside. I’ll take you to them.'),
]);
export const heart=()=>scene('three-heart','THE VESSEL BELOW',[
  {id:'nell',at:{x:31,y:27}},{id:'orrin',at:{x:28,y:28}},{id:'kit',at:{x:34,y:28}},{id:'petra',at:{x:36,y:27}},{id:'emperor',at:{x:44,y:19}},
],[
  line('Beneath the palace','Iron restraints bite into a pale vessel above the machines. The hum in Nell’s lantern catches against the hum from the walls.',{focus:{x:32,y:12},cut:true,silence:true,cue:'resonance'}),
  line('The Emperor','I gave orders for your brother to be kept alive.',{focus:{x:41,y:22},cut:true}),
  line('Nell','Your warden was cutting him apart.'),
  line('The Emperor','Then the warden exceeded its instruction. Return the fragment. I will have the train take you both home.'),
  line('Petra','And the people at Cinderbank? The others still being collected?'),
  line('The Emperor','This city has hospitals, winter stores, children who have never known a siege. Those engines keep them alive.'),
  line('Orrin','Our train brought patients here without taking anyone’s days. Yours can stop.'),
  line('The Emperor','You have one engine. I have an empire.'),
  line('Nell','Then you should have built more like his.'),
  line('The regulator','The emperor turns a brass key. The heart regulator unfolds between Nell and the intake console.',{cue:'steam',actors:{emperor:{to:{x:47,y:19}}}}),
]);
export const rupture=()=>scene('three-rupture','THE FEEDS CLOSE',[
  {id:'nell',at:{x:40,y:23}},{id:'orrin',at:{x:43,y:21}},{id:'kit',at:{x:37,y:25}},{id:'petra',at:{x:39,y:26}},{id:'emperor',at:{x:47,y:19}},
],[
  line('Orrin','Tomas’s bypass is holding. Turning the feeds off.',{focus:{x:42,y:22},cut:true,cue:'steam'}),
  line('The intake console','The needles fall to zero. Along the pipes, the traveling light stops.',{silence:true}),
  line('Nell','It’s stopped.'),
  line('The Emperor','The lamps will fail by nightfall. The heating. The lifts to the hospitals.'),
  line('Petra','Open your stores. Let the workers keep the pumps running. You still have people.'),
  line('The Emperor','I have buried enough of them.'),
  line('The chamber','He looks up at the restraints, then unlocks the narrow access stair.',{focus:{x:46,y:19},cut:true,cue:'click'}),
  line('Nell','What are you doing?'),
  line('The Emperor','If the world will not give us another peaceful day, I will keep this one.'),
  line('The vessel','The emperor steps into the iron cradle. Pale light catches his coat and draws him out of sight.',{focus:{x:32,y:12},cut:true,cue:'resonance',actors:{emperor:{visible:false}}}),
  line('The chamber','The restraints pull taut. A crack runs through the ceiling. Stone dust rises instead of falling.',{cue:'punch'}),
  line('Kit','The stairs! Nell, now!'),
  line('Orrin','Tomas is at our engine. We’re leaving together.',{focus:{x:31,y:28},cut:true}),
]);
export const departure=()=>scene('three-departure','THE BROTHER WHO CAME HOME',[
  {id:'nell',at:{x:32,y:32}},{id:'tomas',at:{x:34,y:30}},{id:'orrin',at:{x:30,y:33}},{id:'kit',at:{x:35,y:32}},{id:'petra',at:{x:37,y:31}},
],[
  line('The south siding','The medical coaches are full. Above the roof, the palace rises through a cloud of broken stone.',{focus:{x:47,y:10},cut:true,cue:'steam'}),
  line('Tomas','Nell! Here!',{focus:{x:33,y:31},cut:true}),
  line('Nell','You’re staying where I can see you.'),
  line('Tomas','I can manage that.'),
  line('Petra','The last ward carriage is coupled. Everyone from the coast is aboard.'),
  line('Kit','The signal’s stuck at red. There’s nobody in the box.'),
  line('Orrin','Then watch the rail ahead. This engine doesn’t need their signal current.'),
  line('The medical train','The coal engine pulls the coaches out. The last bridge drops away behind the wheels.',{cue:'steam'}),
  line('Tomas','Your hands are shaking.'),
  line('Nell','So are yours.'),
  line('The valley','Far below the rising capital, a mill wheel stops between splashes. Orrin keeps his eyes on the track.'),
]);
