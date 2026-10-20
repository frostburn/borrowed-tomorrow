import { SAY, type Dialogue } from '../dialogue';
import * as scenes from '../scenes';
import { arrival, stage } from '../maps';
import { NEXT_CHAPTER, recruitOrrin, remember, restoreParty, type GameState, type MapId } from '../../rules/state';

export interface StoryHost {
  state: GameState;
  talk(dialogue: Dialogue): void;
  commit(flag: string, entry?: string): void;
  refresh(): void;
  save(): void;
  travel(map: MapId, x: number, y: number): void;
  battle(id: string): void;
  shop(): void;
  boundary(): void;
  toast(message: string): void;
  endingMusic(): void;
}

/** An unfinished arrival replays from its checkpoint, including after a reload. */
export function resumeChapter(host: StoryHost) {
  const s = host.state;
  if (!s.flags.festivalSeen) host.talk({ ...scenes.opening(), done: () => { s.location = arrival('station','festival'); host.commit('festivalSeen'); } });
  else if (s.location.map === 'rillbridge' && !s.flags.villageSeen) host.talk({ ...scenes.stillness(), done: () => { s.location = arrival('rillbridge','arrival'); host.commit('villageSeen', 'village'); } });
  else if (s.location.map === 'tunnel' && !s.flags.passSeen) host.talk({ ...scenes.passArrival(), done: () => { s.location = arrival('tunnel','arrival'); host.commit('passSeen', 'pass'); } });
}

export function interactChapterOne(host: StoryHost, id: string) {
  const s = host.state, f = s.flags;
  const travel=(map:MapId,key:string)=>{const p=arrival(map,key);host.travel(p.map,p.x,p.y);};
  const say = (who: string, text: string) => host.talk({ lines: [SAY(who, text)] });
  switch (id) {
    case 'tomas':
      if (f.raidSeen) return;
      host.talk({ ...scenes.raid(), done: () => {
        s.location = arrival('station','raid');
        host.commit('raidSeen', 'raid');
      } });
      return;
    case 'ansel':
      say('Stationmaster Ansel', 'Orrin says his engine doesn’t need the empire’s crystals. I told him he could celebrate when it stopped setting fire to the shed.'); return;
    case 'memorial':
      host.talk({ lines: [
        SAY('Nell', 'He used to leave this on the desk so I’d think he’d already gone home. He was always on the platform.'),
        SAY('Iona', 'I’ll stay with him. You find your brother.'),
      ], done: () => host.commit('farewellSeen') }); return;
    case 'iona': host.shop(); return;
    case 'blessing':
      host.talk({ lines: [
        SAY('Festival lanterns', 'The sun emblem surrounds a crystal flame. “For the harvest, for healing, for another peaceful year: thanks to the Benefactor.”'),
        SAY('Nell', f.raidSeen ? 'A crystal in every lamp. Why did they need his so badly?' : 'Ansel still lights the station with oil. He says he likes knowing where the light comes from.'),
      ], done: () => host.commit('blessingRead', 'blessing') }); return;
    case 'imperial-train':
      say('Nell', f.raidSeen ? 'The prison coach has gone. The soldiers left an empty carriage. Tomas said to find Orrin.' : 'An armored coach on a festival service. Tomas never mentioned the army was traveling with him.'); return;
    case 'pursuit':
      if (f.raidSeen && !f.escapeWon) host.battle('pursuit'); return;
    case 'west-yard':
      if (!f.raidSeen) return say('Nell', 'I’ll find Tomas first. He owes me a proper answer about our trip.');
      if (!f.escapeWon) return host.toast('The pursuit hounds still hold the western road.');
      travel('yard','from-station'); return;
    case 'orrin':
      if (f.orrinJoined) return;
      host.talk({ ...scenes.recruit(), done: () => {
        s.location = arrival('yard','recruited'); recruitOrrin(s); restoreParty(s); remember(s, 'orrin'); host.refresh(); host.save();
      } }); return;
    case 'engine':
      say('Orrin', 'Coal, water and a very offensive amount of noise. The branch curves round to Rillbridge, then up to the pass. No imperial signals needed.'); return;
    case 'workshop-cache':
      if (!f.orrinJoined) return say('Nell', 'Orrin’s by the engine. I need to talk to him before I go after more hounds.');
      if (f.workshopWon) return;
      host.talk({ lines: [SAY('Orrin', 'Hounds in the spare shed. There’s a brass reflector inside: more punch for your lantern.')], choices: [
        { label: 'Clear the shed', action: () => host.battle('workshop') },
        { label: 'Keep moving', action: () => {} },
      ] }); return;
    case 'branch':
      if (!f.orrinJoined) return host.toast('Speak to Orrin by the engine first.');
      travel('rillbridge','from-yard'); return;
    case 'yard-home': travel('station','from-yard'); return;
    case 'tilda':
      if (!f.villageFreed) return say('Tilda’s bakery', 'Tilda holds a loaf above the counter. The steam has stopped rising. She cannot hear Nell.');
      say('Tilda', 'We’ve taken down the imperial lamps. Elspeth found some candles. Go and find your brother; I’ll have something hot for you when you come back.'); return;
    case 'elspeth':
      if (!f.villageFreed) return say('The square', 'Elspeth’s hand rests on a class register. A page hangs halfway through a turn.');
      say('Elspeth', 'Everyone’s accounted for. Tired, hungry and very cross. Tell your mechanic the railway can wait until we’ve had tea.'); return;
    case 'still-water':
      host.talk({ lines: [SAY('Nell', f.villageFreed ? 'It’s running again. I can hear it from the bridge.' : 'The drops are separate. I can put the lantern between them. They don’t fall.')], done: () => host.commit('waterSeen') }); return;
    case 'collector':
      if (f.collectorDefeated) return;
      if (f.collectorConfronted) return host.battle('collector');
      host.talk({ ...scenes.collector(), done: () => { host.commit('collectorConfronted'); host.battle('collector'); } }); return;
    case 'release':
      if (!f.collectorDefeated) return;
      if (f.villageFreed) return say('The broken collector', 'Its sun-shaped casing is empty. No threads of light leave the houses.');
      host.talk({ ...scenes.releaseVillage(), done: () => { s.location = arrival('rillbridge','released'); restoreParty(s); host.commit('villageFreed', 'freed'); } }); return;
    case 'east-pass':
      if (!f.villageFreed) return host.toast(f.collectorDefeated ? 'Break open the collector before leaving.' : 'The collector has stopped the crossing. Reach the eastern carriage.');
      travel('tunnel','from-village'); return;
    case 'village-yard': travel('yard','from-village'); return;
    case 'sun-mural':
      host.talk({ scene: { id: 'one-mural', title: 'THE HOLLOW SUN', actors: stage('tunnel','one-mural') }, lines: [
        { ...SAY('The old mural', 'Harvesters carry sheaves toward a circle. Most of its center has flaked away.'), shot: { focus: { x: 21, y: 8 }, cut: true, silence: true } },
        SAY('Nell', 'The lamps in Larkspur have the same rays.'),
        SAY('Orrin', 'This was here before the empire laid the track.'),
      ], done: () => host.commit('muralRead') }); return;
    case 'shelter':
      host.talk({ lines: [SAY('Orrin', f.shelterSupplies ? 'We can rest here. The crossing will still be there when we’re ready.' : 'Dry blankets, a stove and two sealed bandages. We can rest here before we face him.')], choices: [
        { label: 'Rest · restore HP and focus', action: () => {
          if (!f.shelterSupplies) { s.bandages = Math.min(999, s.bandages + 2); f.shelterSupplies = true; }
          restoreParty(s); host.refresh(); host.save(); host.toast('Party restored.');
        } },
        { label: 'Keep going', action: () => {} },
      ] }); return;
    case 'captain':
      if (f.captainDefeated) return;
      if (f.captainConfronted) return host.battle('captain');
      host.talk({ ...scenes.confrontation(), done: () => { s.location = arrival('tunnel','confronted'); host.commit('captainConfronted'); host.battle('captain'); } }); return;
    case 'departure':
      if (!f.captainDefeated) return host.toast('Captain Alban still holds the crossing.');
      if (f.chapterOneComplete) return host.boundary();
      host.talk({ ...scenes.departure(), done: () => {
        s.location = arrival('tunnel','departure'); f.chapterOneComplete = true; s.boundary = NEXT_CHAPTER; remember(s, 'departure');
        host.refresh(); host.save(); host.endingMusic(); host.boundary();
      } }); return;
    case 'pass-village': travel('rillbridge','from-pass'); return;
  }
}
