import { SAY, type Dialogue, type Line } from './dialogue';
import type { Cinematic, Shot } from './cinematics';

const line = (who: string, text: string, shot?: Shot): Line => ({ ...SAY(who, text), shot });
const scene = (id: string, title: string, actors: Cinematic['actors'], lines: Line[]): Dialogue => ({ scene: { id, title, actors }, lines });

export const opening = () => scene('one-festival', 'CHAPTER ONE · LEAVING HOME', [
  { id: 'nell', at: { x: 21, y: 16 } }, { id: 'ansel', at: { x: 20, y: 12 } },
], [
  line('Larkspur · festival night', 'The last train is in. Music carries from the square, and every crystal lamp bears the imperial sun.', { focus: { x: 21, y: 14 }, cut: true, cue: 'return-call' }),
  line('Stationmaster Ansel', 'Off duty, Nell. Your brother’s by the festival lanterns. He asked if you still wanted to see the sea.'),
  line('Nell', 'He promised we’d go before I turned eighteen. I’m starting to think he means the night before.'),
  line('Stationmaster Ansel', 'Give him a chance to disappoint you properly.', { actors: { nell: { to: { x: 23, y: 15 } } } }),
  line('Nell', 'I’ll make him pick a train this time.'),
]);

export const raid = () => scene('one-raid', 'THE ARREST', [
  { id: 'nell', at: { x: 24, y: 14 } }, { id: 'tomas', at: { x: 26, y: 13 } },
  { id: 'ansel', at: { x: 20, y: 12 } }, { id: 'alban', at: { x: 32, y: 11 }, hidden: true },
], [
  line('Tomas', 'You kept the lantern. I thought Ansel would have given you a crystal one by now.', { focus: { x: 25, y: 14 }, cut: true }),
  line('Nell', 'You kept finding reasons to stay in the capital. Are we going to the sea or aren’t we?'),
  line('Tomas', 'We are. Nell, if anyone asks, I only got here tonight.'),
  line('Captain Alban', 'Tomas. Step away from the girl.', { cue: 'punch', focus: { x: 29, y: 13 }, actors: { alban: { visible: true, to: { x: 29, y: 13 } } } }),
  line('Nell', 'What’s he supposed to have done?'),
  line('Captain Alban', 'Stolen property from the palace engine. Your brother knows what I want.'),
  line('Tomas', 'Take me. Leave her out of it.', { actors: { tomas: { to: { x: 27, y: 13 } } } }),
  line('Stationmaster Ansel', 'You don’t draw a blade in my square. Put it away.', { actors: { ansel: { to: { x: 28, y: 14 } } } }),
  line('The square', 'Ansel catches the captain’s arm. Alban turns his blade. Tomas lunges; the crystal in his hand strikes the paving.', { silence: true, cue: 'strike', actors: { ansel: { fallen: true }, tomas: { to: { x: 28, y: 13 } } } }),
  line('Nell', 'Ansel!', { actors: { nell: { to: { x: 27, y: 14 } } } }),
  line('The broken crystal', 'A pale fleck catches in the lantern glass. A low hum runs through its handle, raising the hairs on Nell’s arm.', { silence: true, cue: 'resonance' }),
  line('The platform', 'A whistle cuts through the noise. Soldiers drag Tomas up the steps. The prison coach rolls east.', { cue: 'punch', focus: { x: 29, y: 12 }, actors: { tomas: { to: { x: 31, y: 11 } }, alban: { to: { x: 33, y: 11 } } } }),
  line('Tomas', 'Nell! Find Orrin. The old branch!', { actors: { tomas: { visible: false }, alban: { visible: false } } }),
  line('Stationmaster Ansel', 'West gate. Iona’s got the key. Go on, Nell. Go.', { focus: { x: 27, y: 14 }, silence: true }),
  line('The square', 'His hand slips from hers. Nell closes his eyes and takes the lantern. The hounds are coming down the steps.'),
  line('Nell', 'I’m bringing him home. Iona, stay with Ansel.'),
]);

export const recruit = () => scene('one-orrin', 'A WAY EAST', [
  { id: 'nell', at: { x: 27, y: 15 } }, { id: 'orrin', at: { x: 25, y: 13 } },
], [
  line('Orrin', 'I heard the train. Where’s Tomas?', { focus: { x: 26, y: 14 }, cut: true }),
  line('Nell', 'They took him. Alban killed Ansel. I couldn’t—'),
  line('Orrin', 'Sit down a moment. Here. I’ve got you.', { actors: { orrin: { to: { x: 26, y: 15 } } }, silence: true }),
  line('Nell', 'When the crystal broke, my lantern started humming. The handle’s still cold.'),
  line('Orrin', 'Then we’ll work that out on the way. My engine burns coal. The army can’t turn it off with a signal.'),
  line('Nell', 'Can it catch them?'),
  line('Orrin', 'The Rillbridge branch joins the main line at the eastern pass. It’s shorter. We’ll take it.'),
  line('Orrin', 'I’m bringing the lance. Don’t stand in front of it. And if your lantern’s about to explode, warn me.', { actors: { orrin: { to: { x: 25, y: 14 } } } }),
  line('Nell', 'It’s never done that before. I’ll try to give you some notice.'),
]);

export const stillness = () => scene('one-stillness', 'RILLBRIDGE', [
  { id: 'nell', at: { x: 14, y: 18 } }, { id: 'orrin', at: { x: 12, y: 18 } },
  { id: 'elspeth', at: { x: 27, y: 19 } },
], [
  line('The branch', 'Orrin leaves the engine before the town crossing. Smoke from a chimney stands in a straight column.', { focus: { x: 17, y: 18 }, cut: true, silence: true }),
  line('Nell', 'There’s water hanging over the river. Look at the people.'),
  line('Orrin', 'The lantern’s making my teeth ache. Is it louder here?', { actors: { nell: { to: { x: 15, y: 18 } } }, cue: 'resonance' }),
  line('Nell', 'It hasn’t been quiet since the square.'),
  line('Orrin', 'That machine by the eastern carriage is still running. Same sun on its casing.'),
  line('Nell', 'Tomas’s train came through here. We stop the machine, then we follow it.'),
]);

export const collector = () => scene('one-collector', 'THE FIRST REPAYMENT', [
  { id: 'nell', at: { x: 55, y: 18 } }, { id: 'orrin', at: { x: 53, y: 18 } },
], [
  line('The collector', 'Light leaves the houses in thin threads. Each thread enters the sun-shaped opening in the carriage.', { focus: { x: 57, y: 18 }, cut: true, cue: 'resonance' }),
  line('Captain Alban', 'Rillbridge collection complete. Record the repayment and clear the branch.'),
  line('Nell', 'Repayment? What did these people borrow?'),
  line('Orrin', 'Its guard’s turning. Stay out of the steam line. We can break the collector once it’s down.', { cue: 'steam' }),
]);

export const releaseVillage = () => scene('one-release', 'THE VILLAGE WAKES', [
  { id: 'nell', at: { x: 56, y: 18 } }, { id: 'orrin', at: { x: 58, y: 18 } },
  { id: 'tilda', at: { x: 53, y: 18 }, hidden: true }, { id: 'elspeth', at: { x: 51, y: 18 }, hidden: true },
], [
  line('Orrin', 'Keep the lantern up. I’m opening the casing.', { focus: { x: 57, y: 18 }, cut: true }),
  line('Rillbridge', 'The casing splits. Water falls, a plate smashes, and a woman finishes a word she began three days ago.', { cue: 'burst' }),
  line('Tilda', 'Who are you? Where’s the carriage?', { actors: { tilda: { visible: true, to: { x: 55, y: 18 } }, elspeth: { visible: true, to: { x: 53, y: 18 } } } }),
  line('Nell', 'Nell. From Larkspur. The army put a machine here. How long has it been?'),
  line('Tilda', 'They arrived on Monday. Why?'),
  line('Nell', 'It’s Thursday.'),
  line('Tilda', 'Three days? My hands—why do they hurt?'),
  line('Elspeth', 'Help me with my register. I could lift it this morning.'),
  line('Orrin', 'We stopped it taking any more. I don’t know how to give back what it took.', { silence: true }),
  line('Nell', 'A prison coach came through. My brother was on it.'),
  line('Tilda', 'The eastern pass. I heard the captain order it through before he started this. The north road will take you there.'),
  line('Elspeth', 'Go. We can look after each other now.'),
]);

export const passArrival = () => scene('one-pass', 'THE CROSSING', [
  { id: 'nell', at: { x: 5, y: 14 } }, { id: 'orrin', at: { x: 3, y: 14 } },
  { id: 'alban', at: { x: 33, y: 14 } },
], [
  line('Orrin', 'I’ve brought the engine up. We just need the crossing.', { focus: { x: 6, y: 14 }, cut: true }),
  line('Captain Alban', 'The crossing is closed.', { focus: { x: 32, y: 14 }, cue: 'punch' }),
  line('Nell', 'He’s waiting for us.'),
  line('Orrin', 'There’s an old shelter in the lower recess. Catch your breath before we go at him.', { focus: { x: 9, y: 14 } }),
]);

export const confrontation = () => scene('one-captain', 'CAPTAIN ALBAN', [
  { id: 'nell', at: { x: 29, y: 14 } }, { id: 'orrin', at: { x: 26, y: 14 } },
  { id: 'alban', at: { x: 33, y: 14 } },
], [
  line('Nell', 'Where’s Tomas?', { focus: { x: 31, y: 14 }, cut: true }),
  line('Captain Alban', 'Already east of the border. Give me the lantern, and you can go home.'),
  line('Nell', 'You killed Ansel. You put that machine in Rillbridge. What happens when you come back for us?'),
  line('Captain Alban', 'The empire has kept your lamps lit and your fields green. Someone has to settle what it owes.'),
  line('Nell', 'Then start with the emperor.', { actors: { nell: { to: { x: 30, y: 14 } }, alban: { to: { x: 32, y: 14 } } } }),
  line('Orrin', 'His sun flare hits a whole cluster. Keep apart, and watch the orange steam outlets.', { cue: 'flare' }),
]);

export const departure = () => scene('one-departure', 'LEAVING HOME', [
  { id: 'nell', at: { x: 34, y: 14 } }, { id: 'orrin', at: { x: 36, y: 14 } },
  { id: 'alban', at: { x: 38, y: 14 } },
], [
  line('Captain Alban', 'You’ve won a crossing. Your brother’s at the Iron Coast exchange by now.', { focus: { x: 36, y: 14 }, cut: true }),
  line('Nell', 'Then that’s where we’re going.'),
  line('Captain Alban', 'The exchange is under military guard. You won’t get near him.', { actors: { alban: { to: { x: 40, y: 14 } } } }),
  line('Orrin', 'He’s gone. The engine’s ready.', { actors: { alban: { visible: false } } }),
  line('Nell', 'Ansel wanted me to see the sea. He’d be furious about this route.'),
  line('Orrin', 'We’ll complain to the stationmaster when we get back.'),
  line('Nell', 'Iona will be stationmaster now. She’ll charge us for the coal.', { actors: { nell: { to: { x: 37, y: 14 } }, orrin: { to: { x: 39, y: 14 } } }, cue: 'return-call' }),
]);
