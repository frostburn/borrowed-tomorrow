import { STAGED as line, type Dialogue, type Line } from '../dialogue';
import { stage } from '../maps';
import type { MapId } from '../../rules/state';

const scene = (map:MapId, id:string, title:string, lines:Line[]):Dialogue => ({scene:{id,title,actors:stage(map,id)},lines});

export const arrival = () => scene('coast', 'two-coast', 'CHAPTER TWO · PRISON TRAINS', [
  line('Iron Coast exchange', 'Beyond the cranes, the sea is turning silver. Soldiers are coupling a barred coach to the eastbound train.', { focus: { x: 32, y: 9 }, cut: true, cue: 'return-call' }),
  line('Kit', 'Registered post for the railway ward. Two parcels and the letters. Here’s my permit.', { focus: { x: 29, y: 20 }, cut: true, actors: { kit: { to: { x: 28, y: 19 } } } }),
  line('Captain Alban', 'Nothing passes the gate. Leave the bag.'),
  line('Kit', 'The parcels are medicine. I brought them through yesterday.'),
  line('The loading gate', 'A hound catches Kit’s satchel strap in its jaws. Petra draws it back by the collar.', { actors: { petra: { to: { x: 29, y: 18 } } } }),
  line('Petra', 'He’s shown his permit. Call the machine off.',{expression:'angry'}),
  line('Captain Alban', 'The bag goes in the coach. He can collect it when we’ve searched it.'),
  line('Kit', 'Dena needs those bottles before her evening round.',{expression:'worried'}),
  line('The loading gate', 'Alban tears the permit across its stamp and throws the satchel through the coach door.', { focus: { x: 28, y: 17 }, cut: true, cue: 'paper', actors: { alban: { to: { x: 28, y: 15 } } } }),
  line('Kit', 'You can’t just keep it. People are waiting for those—',{expression:'angry'}),
  line('Petra', 'Step back, Kit. I’ll see that the bottles aren’t broken.'),
  line('Captain Alban', 'With me, Petra. Clear the gate.', { actors: { kit: { to: { x: 28, y: 21 } }, alban: { to: { x: 35, y: 18 } }, petra: { to: { x: 37, y: 19 } } } }),
  line('Nell', 'Orrin. That’s Alban.', { focus: { x: 25, y: 25 }, cut: true, actors: { alban: { visible: false }, petra: { visible: false } } }),
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
  line('Nell', 'What about the knight who helped you?'),
  line('Kit', 'Petra? She’s brought lost parcels back to the ward herself. She still locked that coach.'),
  line('Orrin', 'We can get your bag back while we’re there.'),
  line('Kit', 'Those parcels need to reach Dena. I can show you the two ways in.'),
  line('Nell', 'You don’t have to come through with us.'),
  line('Kit', 'I’m not leaving the medicine with him. Stay behind the wall until we’ve picked a route.',{expression:'angry'}),
]);

export const raid = (diversion: boolean) => scene('coast', 'two-raid', diversion ? 'THE SIGNAL WALK' : 'THE LOADING GATE', [
  line('Petra', 'Away from the coach. There are civilians waiting on this platform.', { focus: { x: 36, y: 21 }, cut: true }),
  line('Nell', 'Then let them see who you’ve locked inside.'),
  line('Petra', 'That lantern. Alban’s report said a girl was carrying the fragment. Put it down.'),
  line('Kit', 'You said you’d keep my parcels safe.'),
  line('Petra', 'I have. You can take them to the ward when this is settled. Nell must come with me.'),
  line('Nell', 'And you’ll put me on the same train as my brother?'),
  line('Petra', 'The fragment was taken from the imperial conduits. I have orders to recover it.'),
  line('The lantern', 'A faint hum travels through the handle. Nell closes her other hand around it.', { silence: true, cue: 'resonance' }),
  line('Kit', diversion ? 'Orrin, the points! Send that empty wagon across her track.' : 'Orrin, release the loading crane! She’ll have to go round.'),
  line('Orrin', 'Mind your feet!', { cue: 'steam', actors: { petra: { to: { x: 42, y: 20 } } } }),
  line('Petra', 'Stop! You’ll bring the guard machines down on everyone.'),
  line('Kit', diversion ? 'The crows are coming off the signal gantry. Spread out. My bolts can reach them.' : 'The guardian’s turning. My piercing bolts can get through its plating.', { actors: { petra: { visible: false } } }),
]);

export const freePrisoners = () => scene('coast', 'two-prisoners', 'THE COACH OPENS', [
  line('Kit', 'Stand back from the lock. There.', { focus: { x: 27, y: 13 }, cut: true, cue: 'strike' }),
  line('The prison coach', 'Kit slides the door aside. Orrin braces a shoulder beneath a prisoner’s arm and helps him down.'),
  line('Nell', 'Tomas! Have you seen my brother? Brown hair, red scarf?',{expression:'surprised'}),
  line('The prisoners', 'A man in a torn railway coat holds out a folded slip. “They took him off here this morning. He said to keep this for his sister.”'),
  line('Transfer slip', '“Tomas · imperial conduit works, Northglass. Personal custody by imperial order.” Below the stamp: “The collectors feed the engines. I saw the houses go dark. — T.”', { document: { heading: 'CAPITAL TRANSFER', lines: ['TOMAS · IMPERIAL CONDUIT WORKS', 'PERSONAL CUSTODY · IMPERIAL ORDER', 'The collectors feed the engines.', 'I saw the houses go dark. — T.'], stamp: 'TRANSFERRED' } }),
  line('Nell', 'He’s alive. And he left us a way to find him.',{expression:'happy'}),
  line('Kit', 'My bag’s here. The bottles are still packed. Dena can take everyone at the railway ward, west of the exchange.',{expression:'happy'}),
  line('Orrin', 'There’s a dispatch case under the bench. Medical-train clearance, for the conduit works outside the capital.'),
  line('Kit', 'I deliver to that siding. Let me see the seal.'),
  line('Nell', 'Thank you, Kit.'),
  line('Kit', 'You’re—yes. The left door sticks. I’ll take it.', { actors: { kit: { to: { x: 28, y: 15 } } } }),
  line('Nell', 'Orrin, bring the case. Let’s get them somewhere warm.'),
]);

export const ward = () => scene('infirmary', 'two-ward', 'THE WARD AT THE END OF THE LINE', [
  line('Dena', 'Kit. Put the parcels here. Orrin, help that man onto the end bed.', { focus: { x: 31, y: 20 }, cut: true }),
  line('Kit', 'Two parcels and the letters. Could you sign here? The permit didn’t make it.', { cue: 'paper' }),
  line('Dena', 'The fever medicine. Good. I’ve been stretching the last bottle since yesterday.'),
  line('The railway ward', 'Dena checks the bottles, then signs Kit’s book. A prisoner warms both hands around the cup she gives him.'),
  line('Dena', 'The hospital won’t take them without release papers. We’ll make room here.'),
  line('Kit', 'One of these letters is for the family by Cinderbank’s coal shed. Their father’s in the first coach.'),
  line('Dena', 'His little girl came here twice asking for him. The army promised them seats on the evacuation train.'),
  line('Orrin', 'This clearance gets our coaches onto the capital line. I can couple up and leave from here.'),
  line('Nell', 'How far is Cinderbank?'),
  line('Kit', 'A run down the branch, then back to the main line. I still have their letter.'),
  line('The railway ward', 'Nell folds Tomas’s transfer slip along its worn crease.'),
  line('Nell', 'He asked me to find Orrin. He knew I’d need help. We can stop for them.'),
  line('Orrin', 'I’ll bring the engine round.'),
  line('Dena', 'I’m coming. Those coaches will need someone who knows which bed is whose.'),
  line('Orrin', 'Nell, take some bread for the cab. You haven’t eaten since we left.'),
  line('Nell', 'Neither have you. Here. Half.'),
  line('Orrin', 'Mine’ll taste of coal.'),
  line('Nell', 'Then wash your hands.'),
]);

export const abandonment = () => scene('cinderbank', 'two-settlement', 'THE CAPITAL COMES FIRST', [
  line('Cinderbank siding', 'The medical coaches stop beside the coal shed. Beyond the station, light drains from the miners’ windows.', { focus: { x: 32, y: 22 }, cut: true, silence: true }),
  line('Kit', 'That house. The green door. There should be a girl waiting on the step.'),
  line('Petra', 'Captain, there are still people in those houses. Halt the collector.'),
  line('Captain Alban', 'The emperor’s order gives the capital its full allocation. Withdraw your men and leave the siding clear.'),
  line('Petra', 'You promised these families an evacuation train.'),
  line('Captain Alban', 'Recover the fragment. The train stays here.'),
  line('Nell', 'You took Tomas to keep those engines running. Wasn’t that enough?'),
  line('Petra', 'Let the medical passengers board. Their clearance is in order.'),
  line('Captain Alban', 'Then see that they stay in their coaches. I’ll be at the crossing.', { actors: { alban: { to: { x: 43, y: 19 } } } }),
  line('Dena', 'The people in those houses can’t walk to a coach like this.'),
  line('Orrin', 'There’s a release latch below the casing. I can reach it from the platform.'),
  line('Petra', 'You’ll set the guard machines on the whole siding.'),
  line('Nell', 'Then tell them to stand down.'),
  line('The platform', 'Petra grips her shield strap. Alban’s command rod flashes at the far crossing.'),
  line('Petra', 'Keep your people behind the coal shed. I’ll get mine off the platform.', { actors: { petra: { to: { x: 33, y: 19 } } } }),
]);

export const boarding = () => scene('cinderbank', 'two-boarding', 'THE LOADING ROUTE', [
  line('Orrin', 'Here. Hold the cover while I lift it.', { focus: { x: 38, y: 20 }, cut: true, cue: 'steam' }),
  line('The collector', 'Orrin pulls the latch. The wheels jolt to a stop. From the houses comes a scrape of chairs and a child calling for her father.'),
  line('Kit', 'This way! Your father’s in the first coach. I’ve got his letter.'),
  line('Dena', 'I’ll take them through the loading walk. Keep the machines off it.'),
  line('Nell', 'Orrin, cover the shed. Kit, with me.'),
]);

export const evacuation = () => scene('cinderbank', 'two-evacuation', 'A TRAIN FOR EVERYONE', [
  line('Dena', 'That’s the last family. Help me fasten this step.', { focus: { x: 37, y: 23 }, cut: true, cue: 'strike' }),
  line('The medical coach', 'A girl clambers into her father’s lap. Kit passes their letter through the window. The man tries to unfold it with one arm.'),
  line('Kit', 'I can read it, if you want.'),
  line('The medical coach', 'The girl takes the page from her father. “I know the first bit.”'),
  line('Petra', 'The patients can travel under the medical clearance. Nell, you’ll surrender the lantern and stay here.'),
  line('Nell', 'I stopped the collector. You stood and watched it.'),
  line('Petra', 'And you brought those guard machines onto a crowded platform. I won’t let you carry that fragment into the capital.'),
  line('Kit', 'She’s the reason they’re on that train.'),
  line('Petra', 'I’ll escort her myself. The rest of you can go.'),
  line('Orrin', 'We came together. We’re leaving together.'),
  line('Petra', 'Then you’ll have to stop at the crossing.'),
]);

export const recapture = () => scene('cinderbank', 'two-recapture', 'THE LAST CROSSING', [
  line('Nell', 'Alban. Step away from our engine.', { focus: { x: 47, y: 24 }, cut: true }),
  line('Captain Alban', 'Petra. Hold the crossing.', { actors: { alban: { to: { x: 49, y: 21 } }, petra: { to: { x: 47, y: 23 } } } }),
  line('The crossing', 'Alban steps behind Petra’s shield. She looks back at him, then plants her feet across the track.'),
  line('Petra', 'Put the lantern down, Nell. You can end this here.'),
  line('Nell', 'So he can lock another coach? You saw what he did at Cinderbank.'),
  line('Petra', 'I’ve secured passage for the patients. I can see you brought to the capital alive.'),
  line('Nell', 'He killed Ansel for standing in his way. What will you do when he gives that order again?'),
  line('Captain Alban', 'Enough. Recover the fragment.'),
  line('Petra', 'Stay behind me, Captain.', { cue: 'defend' }),
  line('Kit', 'She’ll draw our attacks onto her shield. My piercing bolts can get through. Watch her bash near the rails.'),
]);

export const departure = () => scene('cinderbank', 'two-departure', 'THE CAPITAL LINE', [
  line('The crossing', 'Petra braces against the signal post, her saber on the paving. Orrin runs for the cab.', { focus: { x: 48, y: 25 }, cut: true, cue: 'steam' }),
  line('Captain Alban', 'Hold them, Petra. Crows, fire on the coach doors.'),
  line('Petra', 'The passengers are cleared to leave.'),
  line('Captain Alban', 'Their clearance is revoked. Stop that engine.'),
  line('Petra', 'There are people behind those doors.'),
  line('The crossing', 'A crow turns toward the nearest window. Petra steps into its line, shield raised.', { actors: { petra: { to: { x: 48, y: 25 } } }, cue: 'defend' }),
  line('Petra', 'Stand down. Let the train pass.'),
  line('Captain Alban', 'You’ll report to the capital without your commission.', { actors: { alban: { to: { x: 49, y: 19 } } } }),
  line('Petra', 'I’ll report. Call the crows off.'),
  line('The crossing', 'Alban turns up the service walk. The crows follow his command rod.', { actors: { alban: { visible: false } } } ),
  line('Orrin', 'Points set. Dena, get that door shut.', { cue: 'steam' }),
  line('The engine', 'The coal engine takes the weight. Its wheels turn, and the full medical coaches follow. Petra watches them pass.'),
  line('Petra', 'That engine has no crystal.'),
  line('Orrin', 'Coal in the firebox. Water in the boiler. It’ll get them there.'),
  line('Nell', 'Come with us.'),
  line('Petra', 'My soldiers heard that firing order. I need to make sure they know it’s been refused.'),
  line('Dena', 'Everyone’s aboard, Nell. We can go.'),
  line('Kit', 'And all the letters are delivered.'),
  line('Nell', 'Come to the works with us, Kit.'),
  line('Kit', 'I should see the coaches through. And you’ll want the south siding. I’ve done that round.'),
  line('Nell', 'I’m glad you’re coming.'),
  line('Nell', 'Tomas is at the imperial conduit works. We’ve got a train. This time we go straight to him.'),
  line('The lantern', 'The glass trembles against Nell’s coat. She wraps it in Ansel’s old cloth and watches the last harbor lights pass.', { silence: true }),
]);
