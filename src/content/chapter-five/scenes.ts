import { STAGED as line,type Dialogue } from '../dialogue';
import { stage } from '../maps';
const scene=(map:'airfield'|'airship'|'hammerplain'|'coolingworks'|'anchorforge',id:string,title:string,lines:Dialogue['lines']):Dialogue=>({scene:{id,title,actors:stage(map,id)},lines});

export const airfield=()=>scene('airfield','five-airfield','Chapter Five · Taking the World Back',[
 line('The western airfield','Crates of flour stand beneath the survey ship. An officer paints the imperial seal across its gangway.',{focus:{x:32,y:11},cut:true}),
 line('Alda','Those are ferry stores. The ward’s expecting them.',{focus:{x:30,y:25}}),
 line('Superintendent Durn','Hammerplain has requisitioned all engines and aircraft. Unload the food. My freight goes aboard.'),
 line('Alda','Your freight can wait. I have a flight booked.'),
 line('Nell','Bram sent us. We need to reach the anchor stations.'),
 line('Alda','Then you’re my passengers. Bring your bags.'),
 line('Superintendent Durn','You’ll surrender that chart as well.'),
 line('Petra','Under whose authority?'),
 line('Superintendent Durn','The capital is still standing, Lieutenant. I suggest you remember that.'),
 line('Alda','She asked who signed it.'),
 line('Superintendent Durn','Hold the ship. I’ll send a crew from the casting floor.',{duration:800,actors:{durn:{to:{x:52,y:30}}},track:'durn'}),
 line('Kit','He’s leaving the guards to do it.'),
 line('Nell','We’ll get your gangway back.',{focus:{x:32,y:26}}),
]);
export const launch=()=>scene('airfield','five-launch','Above the railway',[
 line('Alda','Mooring brake is free. Everyone aboard. Mind the survey rods.',{focus:{x:31,y:23},cut:true,actors:{durn:{visible:false}}}),
 line('Kit','I’ll take the heavy case.'),
 line('Nell','Which one?'),
 line('Kit','Yours. If you— I mean, I’m already carrying the others.',{expression:'bashful'}),
 line('Nell','Thanks. I’ll get the door.',{expression:'happy'}),
 line('The gangway','The last bag goes aboard. Alda folds the gangway and releases the mooring.',{effect:'survey-board',duration:1400,focus:{x:32,y:21}} ),
 line('Alda','Hold a rail. She lifts a little nose-first.',{effect:'survey-launch',duration:1800,cue:'steam',focus:{x:32,y:18}}),
]);
export const firstFlight=()=>scene('airship','five-first-flight','The flight chart',[
 line('The survey ship','The railway shrinks beneath the cloud. Far behind, a ferry crosses the open harbor.',{focus:{x:32,y:20},cut:true}),
 line('Alda','Bram’s made his tide. Good.'),
 line('Celia','He’ll have the blankets back before Dena counts them.'),
 line('Nell','Tomas has the railway signal. Can we get messages up here?'),
 line('Alda','At each landing. Leave them with me.'),
 line('Orrin','The sanctuary chart marks three anchor stations. Hammerplain’s a foundry. I’ve worked on their engines.'),
 line('Petra','Dawnwatch’s officers know me. I’ll have to give them a reason to listen.'),
 line('Celia','Windmere supplied our crystal medicines. There must be people there who can help us stop the collections.'),
 line('Alda','Put a finger on the flight chart when you’re ready. There’s water and a bunk aft.'),
]);
export const hammerplain=()=>scene('hammerplain','five-hammer','The stopped shift',[
 line('Hammerplain','A casting crane swings over the works. Beyond the fence, a woman stands motionless with a loaf halfway into her shopping bag.',{focus:{x:32,y:18},cut:true}),
 line('Nell','Her boy’s still holding the bag open.',{focus:{x:16,y:25}}),
 line('Hester','They were buying their supper when it happened. My sister’s in that street.',{focus:{x:25,y:26}}),
 line('Superintendent Durn','Finish the anchor quota and I can apply for its release.'),
 line('Hester','You said that last shift. And you’ve taken the engines we built to run the houses.'),
 line('Superintendent Durn','Their iron is required at the gantry.'),
 line('Orrin','You’re melting them? Those don’t even use crystals.',{expression:'angry'}),
 line('Hester','They don’t. That’s why we made them.'),
 line('Petra','Step away from her.'),
 line('Superintendent Durn','Keep them out of my works.',{duration:750,actors:{durn:{to:{x:44,y:29}}},track:'durn'}),
 line('Nell','We came to disconnect the anchor. Can you help?',{focus:{x:25,y:26},actors:{durn:{to:{x:55,y:29}}}}),
 line('Hester','Hester. Casting forewoman. I can switch the works over, if you open the cooling race.'),
 line('Orrin','We can cut the return at the gantry, then?'),
 line('Hester','Once there’s water under those jackets. Cut it dry and we lose the engines with it.'),
 line('Orrin','Show me where you need us.'),
 line('Hester','Eastern walkway. My crew will bring the starters through behind you.'),
]);
export const cooling=()=>scene('coolingworks','five-cooling','The cooling race',[
 line('Hester','They locked the manual gate when we refused the extra shift. The red wheel opens it.',{focus:{x:45,y:23},cut:true}),
 line('Orrin','That’s a two-person ratchet.'),
 line('Hester','I’ll hold the pawl. You turn. First we need those guards out of the way.',{focus:{x:29,y:26}}),
 line('Kit','Freight lift above, race walk below. I can see crows on the lift.'),
 line('Petra','Hounds down by the water. Choose where we can hold our ground.'),
]);
export const water=()=>scene('coolingworks','five-water','Water under the jackets',[
 line('Hester','Wait for the pawl. Now.',{focus:{x:45,y:23},cut:true,actors:{orrin:{to:{x:46,y:23}},hester:{to:{x:45,y:24}}}}),
 line('Orrin','It’s caught. Shall I lift the—'),
 line('Hester','Leave it. Old gate. It needs the weight back first.'),
 line('The cooling race','Hester lowers the lever. Orrin gives the wheel a full turn, and water pours under the casting floor.',{cue:'steam'}),
 line('Orrin','There. All right, I’ve got it.'),
 line('Hester','Good. Keep it there while we send the starters through.'),
 line('Celia','Your men are at the far door.'),
 line('Hester','They know the changeover. Take the upper gantry. I’m coming with you.'),
]);
export const gantry=()=>scene('anchorforge','five-gantry','The furnace carrier',[
 line('The anchor gantry','The finished engines stand beneath the crane. A tracked furnace rolls along the casting rails toward them.',{focus:{x:34,y:19},cut:true}),
 line('Hester','Stop that carrier! There are people under the load!',{focus:{x:27,y:25}}),
 line('Superintendent Durn','Clear the floor. Feed the engines into it.'),
 line('Petra','You’ll bury your own workers.',{expression:'angry'}),
 line('Superintendent Durn','I have an output order. I won’t answer for a failed anchor.'),
 line('Hester','You can answer to the people in that street.'),
 line('Nell','Hester, get your crew to the starters. We’ll keep it here.'),
 line('Orrin','Watch the pouring lane. It leaves hot metal where it travels.'),
 line('Petra','Then we give it somewhere else to aim.'),
]);
export const release=()=>scene('anchorforge','five-release','The anchor breaker',[
 line('Hester','Cooling pressure holds. Starter crew, take the load!',{focus:{x:32,y:19},cut:true,actors:{durn:{visible:false}}}),
 line('Orrin','The return is yours, Nell. Pull it all the way down.'),
 line('Nell','Here goes.',{duration:650,actors:{nell:{to:{x:32,y:18}}}}),
 line('The anchor','The breaker falls. Copper contacts part above the gantry. Nell’s lantern hums against her fingers; she tightens her grip.',{cue:'steam'}),
 line('Kit','The light’s gone from the cable.'),
 line('Hester','Keep the water running. I want to hear both engines before anybody celebrates.'),
 line('Petra','Durn’s at the lower stair.'),
 line('Hester','My crew has him. He can wait in the shift office until the street’s awake enough to hear him.'),
 line('Nell','Let’s go and see them.'),
]);
export const workers=()=>scene('hammerplain','five-workers','The next shift',[
 line('Hammerplain','A door bangs in the street. The woman catches the loaf as it slips from her hand. Her boy laughs, then starts to cry.',{focus:{x:20,y:32},cut:true,cue:'win'}),
 line('Celia','I’ll check on them.'),
 line('Orrin','Hester, that starter likes the choke half—',{focus:{x:35,y:26},actors:{orrin:{to:{x:33,y:26}}}}),
 line('The engine','Hester sets the lever and turns the crank. The flywheel takes up a steady beat.',{focus:{x:37,y:25},duration:600,actors:{hester:{to:{x:37,y:25}}},cue:'steam'}),
 line('Orrin','You’ve got it.'),
 line('Hester','We did build it.'),
 line('Orrin','I know. Sorry. I’m used to doing the whole thing myself.',{expression:'worried'}),
 line('Hester','Well, go and find something else to fix. We’ll run this one.'),
 line('Nell','Can you keep the houses going?'),
 line('Hester','And the ward, when we get another engine on the railway. Tell Bram there’ll be freight for him.'),
 line('Kit','Alda’s ship could use a workshop crew.'),
 line('Hester','I’ll send two fitters up, and a spare drive. If you’re cutting more anchors, you’ll need to keep flying.'),
 line('Orrin','I’d like to see that engine once it’s settled.'),
 line('Hester','Next time you’re here. I’ll let somebody else start it.'),
]);
export const fleet=(region:'hammerplain'|'dawnwatch'|'windmere'='hammerplain')=>scene('airship','five-fleet','Beyond the cloudbank',[
 line('Alda',region==='windmere'?'Windmere’s medical crew has its cases aboard. Sera sent the release order with them.':region==='dawnwatch'?'The Dawnwatch launches are holding off our port side. Their pilots know this cloudbank.':'Hammerplain’s fitters have the spare drive aboard. They’ve already found the rattle I couldn’t.',{focus:{x:32,y:22},cut:true}),
 line('Orrin',region==='windmere'?'I’ll keep their bellows on the dry rack.':region==='dawnwatch'?'I’ll put the recognition chart beside the helm.':'You’ll want to keep them.'),
 line('Kit','Petra. Those lights above the cloud.'),
 line('The northern sky','Three long hulls emerge beyond the cloudbank. The largest carries an imperial standard.',{focus:{x:32,y:13},cut:true,effect:'fleet-sighting'}),
 line('Petra','Alban’s formation. He’s brought the fleet out of the capital.',{focus:{x:32,y:21}}),
 line('Nell','Are they coming here?'),
 line('Alda','Holding over the inland line. We can keep clear of them.'),
 line('Petra','He’ll want the remaining anchors guarded. We’ve still got people to reach.'),
 line('Nell',region==='windmere'?'The ordinary ward’s open. Let’s mark the chart.':region==='dawnwatch'?'The shelter’s open, and the watch is staying. Let’s mark the chart.':'And Hammerplain can look after its own street now. Let’s mark the chart.'),
]);
