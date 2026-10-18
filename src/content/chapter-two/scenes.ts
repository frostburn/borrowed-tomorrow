import { SAY, type Dialogue, type Line } from '../dialogue';
import type { Cinematic, Shot } from '../cinematics';

const line = (who: string, text: string, shot?: Shot): Line => ({ ...SAY(who, text), shot });
const scene = (id: string, title: string, actors: Cinematic['actors'], lines: Line[]): Dialogue => ({ scene: { id, title, actors }, lines });

export const arrival = () => scene('two-coast', 'CHAPTER TWO · PRISON TRAINS', [
  { id: 'nell', at: { x: 24, y: 26 } }, { id: 'orrin', at: { x: 22, y: 26 } }, { id: 'kit', at: { x: 29, y: 23 } },
], [
  line('Iron Coast exchange', 'Beyond the cranes, the sea is turning silver. Soldiers are coupling a barred coach to the eastbound train.', { focus: { x: 32, y: 9 }, cut: true, cue: 'return-call' }),
  line('Nell', 'That’s Alban’s sun on the door. Tomas could still be inside.', { focus: { x: 26, y: 24 }, cut: true }),
  line('Kit', 'Don’t cross the rails. There’s a signal crow on the roof.', { actors: { kit: { to: { x: 27, y: 25 } } } }),
  line('Nell', 'My brother’s on that train. Brown hair, red scarf. They brought him from Larkspur.'),
  line('Kit', 'I saw him at the transfer window. Come by the loading gate. I can get you closer.'),
  line('Orrin', 'I’ll leave our engine on the coal siding. Keep a way back to it.'),
]);

export const meetKit = () => scene('two-kit', 'THE LOADING GATE', [
  { id: 'nell', at: { x: 26, y: 22 } }, { id: 'orrin', at: { x: 24, y: 23 } }, { id: 'kit', at: { x: 28, y: 21 } },
], [
  line('Kit', 'I’m Kit. I carry messages for the families waiting outside. We’re opening the prison coach.', { focus: { x: 27, y: 22 }, cut: true }),
  line('Nell', 'Nell. This is Orrin. How many guards?'),
  line('Kit', 'A rail guardian at the loading gate. Crows along the signal walk. We only have to break through one side.'),
  line('Orrin', 'You’ve done this before?'),
  line('Kit', 'Carried messages, yes. Stolen an entire train? I was hoping you had.'),
  line('Nell', 'We’ve brought our own engine. That’s a start.'),
  line('Kit', 'Good. I’ll take the crossbow. You pick our way in; I’ll get the doors open.'),
]);

export const raid = (diversion: boolean) => scene('two-raid', diversion ? 'THE SIGNAL WALK' : 'THE LOADING GATE', [
  { id: 'nell', at: { x: 34, y: 21 } }, { id: 'orrin', at: { x: 31, y: 22 } }, { id: 'kit', at: { x: 36, y: 22 } }, { id: 'petra', at: { x: 39, y: 19 } },
], [
  line('Petra', 'Away from the coach. There are civilians waiting on this platform.', { focus: { x: 36, y: 21 }, cut: true }),
  line('Nell', 'Then let them see who you’ve locked inside.'),
  line('Petra', 'That lantern. Alban’s report said a girl was carrying the fragment. Put it down.'),
  line('The lantern', 'A faint hum travels through the handle. Nell closes her other hand around it.', { silence: true, cue: 'resonance' }),
  line('Kit', diversion ? 'Orrin, the points! Send that empty wagon across her track.' : 'Orrin, release the loading crane! She’ll have to go round.'),
  line('Orrin', 'Mind your feet!', { cue: 'steam', actors: { petra: { to: { x: 42, y: 20 } } } }),
  line('Petra', 'Stop! You’ll bring the guard machines down on everyone.'),
  line('Kit', diversion ? 'The crows are coming off the signal gantry. Spread out. My bolts can reach them.' : 'The guardian’s turning. My piercing bolts can get through its plating.', { actors: { petra: { visible: false } } }),
]);

export const freePrisoners = () => scene('two-prisoners', 'THE COACH OPENS', [
  { id: 'nell', at: { x: 26, y: 15 } }, { id: 'orrin', at: { x: 24, y: 16 } }, { id: 'kit', at: { x: 27, y: 14 } }, { id: 'celia', at: { x: 29, y: 16 } },
], [
  line('Kit', 'Stand back from the lock. There.', { focus: { x: 27, y: 13 }, cut: true, cue: 'strike' }),
  line('The prison coach', 'The door slides open. Hands reach for the rail. Celia takes a man’s weight while Kit helps the others down.'),
  line('Celia', 'Anyone who can walk, help someone who can’t. The ward is west of the exchange.'),
  line('Nell', 'Tomas! Is Tomas here?'),
  line('Celia', 'Red scarf? They took him off before these coaches arrived. I dressed his wrist at the transfer window.'),
  line('Nell', 'Was he all right?'),
  line('Celia', 'He was arguing with the officer. Then he pressed this into my bag.'),
  line('Transfer slip', '“Tomas · palace engine works, capital. Personal custody by imperial order.” Below the stamp: “The collectors feed the engines. I saw the houses go dark. — T.”', { document: { heading: 'CAPITAL TRANSFER', lines: ['TOMAS · PALACE ENGINE WORKS', 'PERSONAL CUSTODY · IMPERIAL ORDER', 'The collectors feed the engines.', 'I saw the houses go dark. — T.'], stamp: 'TRANSFERRED' } }),
  line('Nell', 'He’s alive. And he left us a way to find him.'),
  line('Kit', 'We’ve got the dispatch case too. The medical train’s clearance is inside. Celia knows the capital wards.'),
  line('Nell', 'Thank you, Kit.'),
  line('Kit', 'You’re—yes. The left door sticks. I’ll take it.', { actors: { kit: { to: { x: 28, y: 15 } } } }),
  line('Celia', 'Bring that case. And get these people somewhere warm.'),
]);

export const ward = () => scene('two-ward', 'THE WARD AT THE END OF THE LINE', [
  { id: 'nell', at: { x: 31, y: 21 } }, { id: 'orrin', at: { x: 28, y: 22 } }, { id: 'kit', at: { x: 34, y: 22 } }, { id: 'celia', at: { x: 32, y: 18 } },
], [
  line('Celia', 'The official hospital turned them away. No release papers, no beds. So we opened this ward.', { focus: { x: 31, y: 20 }, cut: true }),
  line('Nell', 'They’d have sent them back?'),
  line('Celia', 'With clean bandages, if they were feeling generous. Hold this for me.'),
  line('The ward', 'Nell holds a basin while Celia cleans the last prisoner’s hands. Through the open doors, Kit calls the families in.'),
  line('Orrin', 'This clearance gives the medical train a siding below the capital. We could take our engine in with it.'),
  line('Celia', 'I’m coming. My patients need that train, and you need someone who knows where it stops.'),
  line('Kit', 'We can collect everyone at Cinderbank siding. The mining families have food and blankets ready.'),
  line('Celia', 'Rest here first. Then we move together.'),
]);

export const abandonment = () => scene('two-settlement', 'THE CAPITAL COMES FIRST', [
  { id: 'nell', at: { x: 27, y: 22 } }, { id: 'orrin', at: { x: 24, y: 23 } }, { id: 'kit', at: { x: 30, y: 23 } }, { id: 'celia', at: { x: 32, y: 24 } },
  { id: 'petra', at: { x: 35, y: 20 } }, { id: 'alban', at: { x: 40, y: 19 } },
], [
  line('Cinderbank siding', 'The medical coaches are full. Beyond the station, a row of miners’ windows goes dark.', { focus: { x: 32, y: 22 }, cut: true, silence: true }),
  line('Kit', 'That’s the street where the families are waiting.'),
  line('Petra', 'Captain, there are still people in those houses. Halt the collector.'),
  line('Captain Alban', 'The capital engines require their allocation. Withdraw your men and leave the siding clear.'),
  line('Petra', 'The settlement was promised an evacuation train.'),
  line('Captain Alban', 'The emperor’s order supersedes it. Recover the fragment. The train stays here.'),
  line('Celia', 'Those coaches are carrying the people you refused to treat.'),
  line('Petra', 'I can read the crosses, physician.'),
  line('Kit', 'And I know who’s behind the dark windows. Nell, the collector’s guard is beside the coal shed.'),
  line('Nell', 'Orrin, get ready to open its casing. We’re stopping it.'),
  line('Petra', 'I’ll clear the platform. Go.', { actors: { petra: { to: { x: 33, y: 19 } }, alban: { to: { x: 43, y: 19 } } } }),
]);

export const evacuation = () => scene('two-evacuation', 'A TRAIN FOR EVERYONE', [
  { id: 'nell', at: { x: 38, y: 23 } }, { id: 'orrin', at: { x: 40, y: 22 } }, { id: 'kit', at: { x: 35, y: 24 } }, { id: 'celia', at: { x: 32, y: 23 } }, { id: 'petra', at: { x: 36, y: 20 } },
], [
  line('Orrin', 'Casing’s open. Pull!', { focus: { x: 37, y: 23 }, cut: true, cue: 'burst' }),
  line('Cinderbank', 'Light spills from the broken casing. A shout carries from the houses. Kit runs to meet the families at the crossing.'),
  line('Kit', 'Keep coming! Celia’s at the second coach. We’ve got room.'),
  line('Petra', 'I’ve changed the points. Your engine can pull the medical coaches onto the capital line.'),
  line('Nell', 'Alban will know you did that.'),
  line('Petra', 'He ordered me to clear the platform. I’m clearing it.'),
  line('Celia', 'Come with us.'),
  line('Petra', 'There are soldiers at the west gate who still take orders from me. I’ll bring them off it. Don’t wait on the signal.'),
  line('Kit', 'Everyone’s aboard. Alban’s brought his hounds to the far crossing. He’s cutting us off from the engine.'),
  line('Nell', 'We’ve opened the train. He’s not putting them back inside.'),
]);

export const recapture = () => scene('two-recapture', 'THE LAST CROSSING', [
  { id: 'nell', at: { x: 45, y: 24 } }, { id: 'orrin', at: { x: 42, y: 25 } }, { id: 'kit', at: { x: 44, y: 26 } }, { id: 'celia', at: { x: 40, y: 25 } }, { id: 'alban', at: { x: 48, y: 23 } },
], [
  line('Captain Alban', 'The train does not move. Hand over the fragment and the prisoners.', { focus: { x: 45, y: 24 }, cut: true, cue: 'punch' }),
  line('Nell', 'You’ve already taken days from these people. What’s enough for you?'),
  line('Captain Alban', 'A working capital. Food on the platforms. Trains arriving. You’ve seen what happens when the engines stop.'),
  line('Orrin', 'Mine hasn’t stopped. It’s waiting behind you.'),
  line('Kit', 'His crows can hit us behind the hounds. I’ll take a clear shot; keep his flare away from the others.'),
]);

export const departure = () => scene('two-departure', 'THE CAPITAL LINE', [
  { id: 'nell', at: { x: 49, y: 26 } }, { id: 'orrin', at: { x: 47, y: 27 } }, { id: 'kit', at: { x: 51, y: 27 } }, { id: 'celia', at: { x: 45, y: 26 } },
], [
  line('The crossing', 'Alban falls back along the track. Orrin couples the coal engine to the medical train. The coaches begin to move.', { focus: { x: 48, y: 26 }, cut: true, cue: 'steam' }),
  line('Celia', 'The families are settled. Kit found everyone on his list.'),
  line('Kit', 'Everyone from the exchange, anyway. I’m keeping the list.'),
  line('Nell', 'Come to the capital with us. You got us this far.'),
  line('Kit', 'I know the sidings there too. You’ll want the south one. The others smell worse.'),
  line('Orrin', 'Something to look forward to.'),
  line('Nell', 'Tomas is at the palace engine works. We’ve got the clearance, and we’ve got a train. This time we go straight to him.'),
  line('The lantern', 'The glass trembles against Nell’s coat. She wraps it in Ansel’s old cloth and watches the last harbor lights pass.', { silence: true }),
]);
