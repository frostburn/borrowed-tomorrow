import { SAY, type Dialogue, type Line } from '../dialogue';
import type { Shot } from '../cinematics';
import { stage } from '../maps';
import type { MapId } from '../../rules/state';

const line = (who: string, text: string, shot?: Shot): Line => ({ ...SAY(who, text), shot });
const scene = (map:MapId, id:string, title:string, lines:Line[]):Dialogue => ({scene:{id,title,actors:stage(map,id)},lines});

export const arrival = () => scene('coast', 'two-coast', 'CHAPTER TWO · PRISON TRAINS', [
  line('Iron Coast exchange', 'Beyond the cranes, the sea is turning silver. Soldiers are coupling a barred coach to the eastbound train.', { focus: { x: 32, y: 9 }, cut: true, cue: 'return-call' }),
  line('Kit', 'Registered post for the railway ward. Two parcels and the letters. Here’s my permit.', { focus: { x: 29, y: 20 }, cut: true, actors: { kit: { to: { x: 28, y: 19 } } } }),
  line('Captain Alban', 'Nothing passes the gate. Leave the bag.'),
  line('Kit', 'The parcels are medicine. I brought them through yesterday.'),
  line('Captain Alban', 'Then you should have come yesterday.'),
  line('The loading gate', 'Alban tears the permit across its stamp. He takes Kit’s satchel and throws it through the coach door.', { focus: { x: 28, y: 17 }, cut: true, cue: 'paper', actors: { alban: { to: { x: 28, y: 15 } } } }),
  line('Kit', 'You can’t just keep it. People are waiting for those—'),
  line('Captain Alban', 'Clear the gate.', { actors: { kit: { to: { x: 28, y: 21 } }, alban: { to: { x: 35, y: 18 } } } }),
  line('Nell', 'Orrin. That’s Alban.', { focus: { x: 25, y: 25 }, cut: true, actors: { alban: { visible: false } } }),
  line('Orrin', 'I see him. Let him go round the coach first.'),
  line('Nell', 'That courier might have seen Tomas.'),
]);

export const meetKit = () => scene('coast', 'two-kit', 'THE TORN PERMIT', [
  line('The loading gate', 'Kit kneels to collect the pieces of his permit. Nell picks one out of the slush.', { focus: { x: 27, y: 22 }, cut: true, cue: 'paper' }),
  line('Nell', 'Here. I’m Nell. This is Orrin.'),
  line('Kit', 'Kit. Thanks. The postmaster’s going to want this, even like that.'),
  line('Nell', 'Did you see a man with a red scarf at the transfer window? My brother, Tomas.'),
  line('Kit', 'He was there this morning. They wouldn’t let him send a letter. Is that why you’re here?'),
  line('Nell', 'Alban took him from our station. I’m going to open that coach.'),
  line('Kit', 'There’s a guardian at the gate. And crows over the other walk. You won’t get past by asking.'),
  line('Orrin', 'We’ve had the same trouble with him. We can get your bag back while we’re there.'),
  line('Kit', 'Those parcels need to reach the ward. I can show you the two ways in.'),
  line('Nell', 'You don’t have to come through with us.'),
  line('Kit', 'I’m not leaving the medicine with him. Stay behind the wall until we’ve picked a route.'),
]);

export const raid = (diversion: boolean) => scene('coast', 'two-raid', diversion ? 'THE SIGNAL WALK' : 'THE LOADING GATE', [
  line('Petra', 'Away from the coach. There are civilians waiting on this platform.', { focus: { x: 36, y: 21 }, cut: true }),
  line('Nell', 'Then let them see who you’ve locked inside.'),
  line('Petra', 'That lantern. Alban’s report said a girl was carrying the fragment. Put it down.'),
  line('The lantern', 'A faint hum travels through the handle. Nell closes her other hand around it.', { silence: true, cue: 'resonance' }),
  line('Kit', diversion ? 'Orrin, the points! Send that empty wagon across her track.' : 'Orrin, release the loading crane! She’ll have to go round.'),
  line('Orrin', 'Mind your feet!', { cue: 'steam', actors: { petra: { to: { x: 42, y: 20 } } } }),
  line('Petra', 'Stop! You’ll bring the guard machines down on everyone.'),
  line('Kit', diversion ? 'The crows are coming off the signal gantry. Spread out. My bolts can reach them.' : 'The guardian’s turning. My piercing bolts can get through its plating.', { actors: { petra: { visible: false } } }),
]);

export const freePrisoners = () => scene('coast', 'two-prisoners', 'THE COACH OPENS', [
  line('Kit', 'Stand back from the lock. There.', { focus: { x: 27, y: 13 }, cut: true, cue: 'strike' }),
  line('The prison coach', 'The door slides open. Kit catches an outstretched hand. Orrin helps the prisoners down to the platform.'),
  line('Nell', 'Tomas! Have you seen my brother? Brown hair, red scarf?'),
  line('The prisoners', 'A man in a torn railway coat holds out a folded slip. “They took him off here this morning. He said to keep this for his sister.”'),
  line('Transfer slip', '“Tomas · palace engine works, capital. Personal custody by imperial order.” Below the stamp: “The collectors feed the engines. I saw the houses go dark. — T.”', { document: { heading: 'CAPITAL TRANSFER', lines: ['TOMAS · PALACE ENGINE WORKS', 'PERSONAL CUSTODY · IMPERIAL ORDER', 'The collectors feed the engines.', 'I saw the houses go dark. — T.'], stamp: 'TRANSFERRED' } }),
  line('Nell', 'He’s alive. And he left us a way to find him.'),
  line('Kit', 'My bag’s here. The bottles are still packed. We can take everyone to the railway ward, west of the exchange.'),
  line('Orrin', 'There’s a dispatch case under the bench. Medical-train clearance, all the way to the capital.'),
  line('Kit', 'I know that siding. It runs below the engine works. Let me see the seal.'),
  line('Nell', 'Thank you, Kit.'),
  line('Kit', 'You’re—yes. The left door sticks. I’ll take it.', { actors: { kit: { to: { x: 28, y: 15 } } } }),
  line('Nell', 'Orrin, bring the case. Let’s get them somewhere warm.'),
]);

export const ward = () => scene('infirmary', 'two-ward', 'THE WARD AT THE END OF THE LINE', [
  line('The railway ward', 'The staff bring blankets and hot water. Kit sets his parcels on the desk and waits while an attendant checks each bottle.', { focus: { x: 31, y: 20 }, cut: true, cue: 'paper' }),
  line('Kit', 'That’s everything. Could you sign here? The permit didn’t make it.'),
  line('The railway ward', 'The attendant signs his book, then turns it round. A list of families fills the opposite page.'),
  line('Kit', 'They’ve been sent to Cinderbank siding. The hospital wouldn’t take anyone without release papers.'),
  line('Nell', 'Alban put them on the train. Now they need his permission to get a bed?'),
  line('Orrin', 'Our clearance covers the ward’s coaches. I can bring the engine round and couple them on.'),
  line('Kit', 'The families are waiting by the coal shed. I still have their letters. Can we pick them up?'),
  line('Nell', 'We’re going that way. Show us where.'),
]);

export const abandonment = () => scene('cinderbank', 'two-settlement', 'THE CAPITAL COMES FIRST', [
  line('Cinderbank siding', 'The medical coaches are full. Beyond the station, a row of miners’ windows goes dark.', { focus: { x: 32, y: 22 }, cut: true, silence: true }),
  line('Kit', 'That’s the street where the families are waiting.'),
  line('Petra', 'Captain, there are still people in those houses. Halt the collector.'),
  line('Captain Alban', 'The capital engines require their allocation. Withdraw your men and leave the siding clear.'),
  line('Petra', 'The settlement was promised an evacuation train.'),
  line('Captain Alban', 'The emperor’s order supersedes it. Recover the fragment. The train stays here.'),
  line('Nell', 'We’ve just brought your prisoners out of the exchange. Now you’re doing it to their families?'),
  line('Petra', 'There are children in those houses, Captain.'),
  line('Kit', 'And I know who’s behind the dark windows. Nell, the collector’s guard is beside the coal shed.'),
  line('Nell', 'Orrin, get ready to open its casing. We’re stopping it.'),
  line('Petra', 'I’ll clear the platform. Go.', { actors: { petra: { to: { x: 33, y: 19 } }, alban: { to: { x: 43, y: 19 } } } }),
]);

export const evacuation = () => scene('cinderbank', 'two-evacuation', 'A TRAIN FOR EVERYONE', [
  line('Orrin', 'Casing’s open. Pull!', { focus: { x: 37, y: 23 }, cut: true, cue: 'burst' }),
  line('Cinderbank', 'Light spills from the broken casing. A shout carries from the houses. Kit runs to meet the families at the crossing.'),
  line('Kit', 'Keep coming! The ward staff are at the second coach. We’ve got room.'),
  line('Petra', 'I’ve changed the points. Your engine can pull the medical coaches onto the capital line.'),
  line('Nell', 'Alban will know you did that.'),
  line('Petra', 'He ordered me to clear the platform. I’m clearing it.'),
  line('Nell', 'Come with us.'),
  line('Petra', 'There are soldiers at the west gate who still take orders from me. I’ll bring them off it. Don’t wait on the signal.'),
  line('Kit', 'Everyone’s aboard. Alban’s brought his hounds to the far crossing. He’s cutting us off from the engine.'),
  line('Nell', 'We’ve opened the train. He’s not putting them back inside.'),
]);

export const recapture = () => scene('cinderbank', 'two-recapture', 'THE LAST CROSSING', [
  line('Captain Alban', 'The train does not move. Hand over the fragment and the prisoners.', { focus: { x: 45, y: 24 }, cut: true, cue: 'punch' }),
  line('Nell', 'You’ve already taken days from these people. What’s enough for you?'),
  line('Captain Alban', 'A working capital. Food on the platforms. Trains arriving. You’ve seen what happens when the engines stop.'),
  line('Orrin', 'Mine hasn’t stopped. It’s waiting behind you.'),
  line('Kit', 'His crows can hit us behind the hounds. I’ll take a clear shot; keep his flare away from the others.'),
]);

export const departure = () => scene('cinderbank', 'two-departure', 'THE CAPITAL LINE', [
  line('The crossing', 'Alban falls back along the track. Orrin couples the coal engine to the medical train. The coaches begin to move.', { focus: { x: 48, y: 26 }, cut: true, cue: 'steam' }),
  line('Kit', 'Everyone on the list is aboard. The ward staff have the injured. And all the letters are delivered.'),
  line('Orrin', 'Your postmaster will be pleased.'),
  line('Kit', 'I’m hoping he reads the signatures before he sees the permit.'),
  line('Nell', 'Come to the capital with us. You got us this far.'),
  line('Kit', 'I should see the coaches through. And you’ll want the south siding. I’ve done that round.'),
  line('Orrin', 'Something to look forward to.'),
  line('Nell', 'Tomas is at the palace engine works. We’ve got the clearance, and we’ve got a train. This time we go straight to him.'),
  line('The lantern', 'The glass trembles against Nell’s coat. She wraps it in Ansel’s old cloth and watches the last harbor lights pass.', { silence: true }),
]);
