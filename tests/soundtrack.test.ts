import {expect,it,vi} from 'vitest';
import {SOUNDTRACK,SOUNDTRACK_CHAPTERS,SOUNDTRACK_ORDER,soundtrackSections} from '../src/content/soundtrack';
import {ARRANGEMENTS} from '../src/game/score';
import {Audio} from '../src/game/audio';

it('exposes each authored cue once through the shared public/workshop catalogue',()=>{
 const modes=SOUNDTRACK.map(track=>track.mode);
 expect(new Set(modes).size).toBe(modes.length);
 expect([...modes].sort()).toEqual(Object.keys(ARRANGEMENTS).sort());
 expect(SOUNDTRACK.every(track=>track.title.trim()&&SOUNDTRACK_CHAPTERS.some(chapter=>chapter.id===track.group))).toBe(true);
 expect(SOUNDTRACK_ORDER.map(track=>track.mode).sort()).toEqual([...modes].sort());
});
it('groups all Chapter Five cues by the shared voyage and four acts',()=>{
 const sections=soundtrackSections('5');
 expect(sections.map(section=>section.title)).toEqual(['The shared voyage','Act I · Hammerplain','Act II · Dawnwatch','Act III · Windmere','Act IV · The flagship']);
 expect(sections[4].tracks.map(track=>track.mode)).toEqual(['flagship','claim']);
 for(const chapter of SOUNDTRACK_CHAPTERS){
  const tracks=soundtrackSections(chapter.id).flatMap(section=>section.tracks);
  expect(tracks.every(track=>track.group===chapter.id)).toBe(true);
  expect(tracks.map(track=>track.mode).sort()).toEqual(SOUNDTRACK.filter(track=>track.group===chapter.id).map(track=>track.mode).sort());
 }
});
it('keeps independently ordered Chapter Six expeditions distinct from the capital finale',()=>{
 expect(soundtrackSections('6').map(section=>section.title)).toEqual(['The sealed capital','Namar · Desert expedition','Iria · River expedition','Skeld · Northern expedition','The capital assault']);
 expect(SOUNDTRACK_ORDER[0].mode).toBe('station');
});
it('restores an audible host once at its previous bar without losing its part/performance settings',async()=>{
 const audio=new Audio(),play=vi.spyOn(audio,'play').mockResolvedValue();
 Object.assign(audio,{enabled:true,pending:'flagship',instruments:['brass'],performance:{expression:false,rubato:false}});
 vi.spyOn(audio,'position').mockReturnValue({mode:'flagship',bar:18,beat:2,playing:true});
 const resume=audio.suspend();expect(audio.enabled).toBe(false);
 await resume();await resume();expect(play).toHaveBeenCalledExactlyOnceWith('flagship',18,['brass'],{expression:false,rubato:false});
});
it('resumes a pending first request, preserves an all-instrument request and honors a later scene cue',async()=>{
 const audio=new Audio(),play=vi.spyOn(audio,'play').mockResolvedValue();
 Object.assign(audio,{pending:'flagship',instruments:['bell'],starting:{mode:'flagship',bar:7,instruments:undefined,performance:{rubato:false}}});
 const resume=audio.suspend();await resume();expect(play).toHaveBeenCalledExactlyOnceWith('flagship',7,undefined,{rubato:false});
 play.mockClear();Object.assign(audio,{enabled:true});
 const next=audio.suspend();audio.setMode('coast');await next();expect(play).toHaveBeenCalledExactlyOnceWith('coast',0,['bell'],{});
});
it('does not enable an originally silent host',async()=>{
 const audio=new Audio(),play=vi.spyOn(audio,'play').mockResolvedValue();
 await audio.suspend()();expect(play).not.toHaveBeenCalled();
});
