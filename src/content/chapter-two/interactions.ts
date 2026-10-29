import { SAY } from '../dialogue';
import type { StoryHost } from '../story-host';
import { THIRD_CHAPTER, recruit, remember, restoreParty } from '../../rules/state';
import * as scenes from './scenes';
import { arrival } from '../maps';
import type { MapId } from '../../rules/state';
import { trainApproachBlock } from './access';

export function resumeChapterTwo(host: StoryHost) {
  const s = host.state, f = s.flags;
  if (!f.coastSeen) host.talk({ ...scenes.arrival(), done: () => host.commit('coastSeen', 'coast') });
  else if (s.location.map === 'infirmary' && !f.wardSeen) host.talk({ ...scenes.ward(), done: () => {
    restoreParty(s); s.location = arrival('infirmary','treated'); host.commit('wardSeen', 'ward');
  } });
  else if (s.location.map === 'cinderbank' && !f.settlementSeen) host.talk({ ...scenes.abandonment(), done: () => {
    s.location = arrival('cinderbank','settled'); host.commit('settlementSeen', 'settlement');
  } });
}

export function interactChapterTwo(host: StoryHost, id: string) {
  const s = host.state, f = s.flags;
  const say = (who: string, text: string) => host.talk({ lines: [SAY(who, text)] });
  const travel=(map:MapId,name:string)=>{const p=arrival(map,name);host.travel(p.map,p.x,p.y);};
  const raidId = () => f.raidDiversion ? 'coast-signals' : 'coast-loading';
  const breach = (diversion: boolean) => {
    const blocked=trainApproachBlock(s,diversion);if(blocked)return host.toast(blocked);
    if (f.trainRaidWon) return say('Kit', 'The coach is clear. Let’s open it.');
    if (f.raidPlanned) {
      if (f.raidConfronted) return host.battle(raidId());
      host.talk({ ...scenes.raid(diversion), done: () => { host.commit('raidConfronted'); host.battle(raidId()); } });
      return;
    }
    host.talk({ lines: [SAY('Kit', diversion ? 'The signal walk has three machines: two crows and a hound. More room to spread out, but less cover from their shots.' : 'The loading gate has a plated guardian and two hounds. My Piercing bolt can get through its armor. Keep clear of Orrin’s steam line.')], choices: [
      { label: diversion ? 'Take the signal walk' : 'Breach the loading gate', action: () => { f.raidDiversion = diversion; host.commit('raidPlanned'); breach(diversion); } },
      { label: 'Look at the other approach', action: () => {} },
    ] });
  };
  switch (id) {
    case 'kit-contact':
      if (f.kitJoined) return say('Kit', 'Signal walk to the east, loading gate to the north. I’ll follow your lead.');
      host.talk({ ...scenes.meetKit(), done: () => { recruit(s, 'kit'); remember(s, 'kit'); s.location = arrival('coast','kit-joined'); host.refresh(); host.save(); host.toast('Kit joined · Quick shot, Piercing bolt and Feint.'); } }); return;
    case 'signal-walk': breach(true); return;
    case 'loading-gate': breach(false); return;
    case 'prison-coach':
      if (!f.trainRaidWon) return host.toast('The coach is under guard. Choose an approach with Kit.');
      if (f.prisonersFreed) return say('Nell', 'Empty. They’re all out. Tomas’s transfer slip is safe.');
      host.talk({ ...scenes.freePrisoners(), done: () => { s.location = arrival('coast','coach-opened'); host.commit('prisonersFreed', 'prisoners'); } }); return;
    case 'coast-ward':
      if (!f.prisonersFreed) return host.toast('Open the prison coach before leaving.');
      travel('infirmary','from-coast'); return;
    case 'coast-engine':
      host.talk({ lines: [SAY('Supply clerk', 'There’s hot water in the cab. Coats and spare fittings here, if you need them.')], choices: [
        { label: 'Rest · restore everyone’s HP and focus', action: () => { restoreParty(s); host.refresh(); host.save(); host.toast('Everyone restored.'); } },
        { label: 'Browse supplies and trade gear', action: () => host.shop('coast') },
        { label: 'Keep moving', action: () => {} },
      ] }); return;
    case 'ward-rest':
      host.talk({ lines: [SAY('Dena', 'Soup is warming by the stove. Clean bandages are stacked on the supply bench.')], choices: [
        { label: 'Rest · restore everyone’s HP and focus', action: () => { restoreParty(s); host.refresh(); host.save(); host.toast('Everyone restored.'); } },
        { label: 'Browse supplies and trade gear', action: () => host.shop('ward') },
        { label: 'Keep moving', action: () => {} },
      ] }); return;
    case 'ward-kit': say('Kit', f.chapterTwoComplete ? 'No one from the exchange is missing. I checked twice.' : 'The little boy in the first coach wants to deliver post on the engine. I told him to ask Orrin.'); return;
    case 'ward-clearance':
      say('Kit', 'Medical service, southern siding below the capital. That’s the seal. I deliver there; the path comes out by the engine works gate.'); return;
    case 'ward-coast': travel('coast','from-ward'); return;
    case 'ward-siding': travel('cinderbank','from-ward'); return;
    case 'siding-ward': travel('infirmary','from-siding'); return;
    case 'siding-collector':
      if (f.coastCollectorWon) return;
      host.talk({...scenes.boarding(),done:()=>host.battle('coast-collector')}); return;
    case 'siding-release':
      if (!f.coastCollectorWon) return;
      if (f.evacuationReady) return say('The broken collector', 'The casing is open. Dena has everyone aboard the medical train.');
      host.talk({ ...scenes.evacuation(), done: () => { s.location = arrival('cinderbank','evacuated'); restoreParty(s); host.commit('evacuationReady', 'evacuation'); } }); return;
    case 'siding-coaches':
      host.talk({lines:[SAY('Kit', f.evacuationReady ? 'The families are aboard. The ward staff are staying with the injured. We still need to get Orrin to the engine.' : 'The prisoners are safe in the coaches. That letter is for the family at the green door. We still need to reach them.')],choices:[
        {label:'Rest · restore everyone’s HP and focus',action:()=>{restoreParty(s);host.refresh();host.save();host.toast('Everyone restored.');}},
        {label:'Browse supplies and trade gear',action:()=>host.shop('ward')},
        {label:'Keep moving',action:()=>{}},
      ]});return;
    case 'siding-captain':
    case 'siding-alban':
      if (!f.evacuationReady) return host.toast('Free the families at the collector before clearing the crossing.');
      if (f.recaptureWon) return;
      if (f.recaptureConfronted) return host.battle('coast-recapture');
      host.talk({ ...scenes.recapture(), done: () => { host.commit('recaptureConfronted'); host.battle('coast-recapture'); } }); return;
    case 'capital-engine':
      if (!f.recaptureWon) return host.toast('Petra still holds the far crossing.');
      if (f.chapterTwoComplete) return host.boundary();
      host.talk({ ...scenes.departure(), done: () => {
        s.location = arrival('cinderbank','departure'); f.chapterTwoComplete = true; s.boundary = THIRD_CHAPTER; remember(s, 'capitalDeparture'); host.refresh(); host.save(); host.endingMusic(); host.boundary();
      } }); return;
  }
}
