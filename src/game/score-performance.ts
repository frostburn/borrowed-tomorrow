import { ARRANGEMENTS,scoreBar,scoreLength,type MusicMode } from './score';

export interface PerformanceOptions {rubato?:boolean;expression?:boolean}
type TempoKnot=readonly [bar:number,stretch:number];
// Local beat lengths, interpolated through the phrases. A breath at a cadence
// belongs to the whole ensemble, including a pedal begun in an earlier bar.
const breaths:Partial<Record<MusicMode,readonly TempoKnot[]>>={
 'capital-return':[[0,.98],[7.5,1.12],[8,.98],[15.5,1.15],[16,.98],[23.5,1.12],[24,.98],[31.5,1.14],[32,.98]],
 laststation:[[0,.97],[7.5,1.16],[8,.98],[15.5,1.2],[16,.96],[23.5,1.17],[24,.98],[31.5,1.2],[32,.97]],
 bellharbor:[[0,.98],[4,.96],[7.5,1.1],[8,.98],[12,.96],[15.5,1.12],[16,.98],[20,.97],[23.5,1.1],[24,.96],[28,.98],[31.5,1.13],[32,.98]],
 wintershrine:[[0,.98],[4,.96],[7.5,1.09],[8,.98],[12,.96],[15.5,1.11],[16,.98],[20,.97],[23.5,1.09],[24,.96],[28,.98],[31.5,1.12],[32,.98]],
 sunpalace:[[0,.98],[4,.96],[7.5,1.12],[8,.98],[12,.96],[15.5,1.15],[16,.98],[20,.97],[23.5,1.13],[24,.96],[28,.98],[31.5,1.16],[32,.98]],
 outermooring:[[0,.98],[4,.96],[7.5,1.12],[8,.98],[12,.96],[15.5,1.15],[16,.98],[20,.97],[23.5,1.13],[24,.96],[28,.98],[31.5,1.16],[32,.98]],
 airship:[[0,.96],[2,1.02],[4,.95],[7,1.09],[8,.98],[10.5,1.1],[11.5,1.18],[12,.96],[15,1.07],[16,.99],[19,1.1],[20,.92],[21.5,.96],[23.5,1.15],[24,.97],[27,1.07],[28,.94],[30,1.06],[31.5,1.17],[32,.96]],
 windmere:[[0,1.03],[1.5,.98],[4,1.04],[6,.97],[9,1.13],[10,.96],[12,.99],[15.5,1.16],[16,.98],[19,1.05],[21,.97],[23.5,1.13],[24,.96],[26,.99],[29,1.05],[31.5,1.18],[32,1.03]],
 refuge:[[0,.98],[2,.94],[3.5,1.07],[4,.97],[6,.99],[7.5,1.15],[8,.97],[10,.95],[11.5,1.1],[12,.99],[15.5,1.14],[16,.95],[18,.98],[19.5,1.07],[20,1.08],[23.5,1.16],[24,.98],[27.5,1.08],[28,.97],[30,1.04],[31.5,1.18],[32,.98]],
 anchorforge:[[0,.96],[2,1.04],[3,1.12],[4,.98],[6,1.03],[7.5,1.16],[8,.95],[10,1.06],[11,1.12],[12,.98],[14,1.04],[15.5,1.15],[16,.97],[18,1.04],[19.5,1.13],[20,.96],[22,1.04],[23.5,1.14],[24,.95],[26,1.03],[27.5,1.1],[28,.98],[30,1.06],[31.5,1.18],[32,.96]],
 signalwall:[[0,.99],[1.5,.96],[2.75,1.15],[4,.97],[6,1.02],[7.5,1.13],[8,.97],[10,.99],[12,1.08],[13.5,1.15],[14,.99],[15.5,1.1],[16,.97],[18,1.03],[19.5,1.12],[20,.96],[22,1.02],[23.5,1.14],[24,.99],[26,1.07],[27.5,1.15],[28,.97],[30,1.04],[31.5,1.17],[32,.99]],
 observation:[[0,.98],[1,.94],[2,1.03],[3,1.17],[4,.98],[5,.94],[6,1.04],[7.5,1.16],[8,.97],[9,.94],[10,1.05],[11.5,1.18],[12,1.01],[13.5,1.14],[14,.96],[15.5,1.17],[16,.97],[18,1.06],[19.5,1.16],[20,.99],[22,.95],[23.5,1.15],[24,.98],[25,.94],[26,1.04],[27.5,1.17],[28,1.01],[30,1.06],[31.5,1.2],[32,.98]],
};
const clocks:Partial<Record<MusicMode,number[]>>={};
for(const [name,knots]of Object.entries(breaths)){
 const mode=name as MusicMode,beats=ARRANGEMENTS[mode].beats,length=scoreLength(mode)*beats,weights:number[]=[];
 let k=0;
 for(let beat=0;beat<length;beat++){
  const bar=(beat+.5)/beats;while(k<knots!.length-2&&bar>knots![k+1][0])k++;
  const [from,a]=knots![k],[to,b]=knots![k+1];weights.push(a+(b-a)*(bar-from)/(to-from));
 }
 // Give time back between breaths: the complete loop keeps its nominal length.
 const scale=length/weights.reduce((a,b)=>a+b,0),clock=[0];
 for(const weight of weights)clock.push(clock.at(-1)!+weight*scale);
 clock[length]=length;clocks[mode]=clock;
}
export const hasRubato=(mode:MusicMode)=>!!clocks[mode];
const expressive:readonly MusicMode[]=['stillcity','lastpalace','crown','laststation','capital-return','capital-battle','emperor','lightbearer','bellharbor','frostwatch','glacier','wintershrine','north-battle','winter-dragon','riverhaven','canopy','rainhouse','rainhouse-rest','river-battle','rain-warden','outermooring','namar','sunpalace','skywalk','observatory','desert-battle','sun-serpent','airship','windmere','refuge','conduit','sanctuary','mirrorward','airfield','anchorforge','signalwall','observation','flagship','claim'];
export const hasExpression=(mode:MusicMode)=>expressive.includes(mode);

/** Absolute score beats to seconds, with periodic rubato and no accumulated drift. */
export function scoreTime(mode:MusicMode,beat:number,rubato=true):number {
 const unit=60/ARRANGEMENTS[mode].bpm,clock=rubato?clocks[mode]:undefined;
 if(!clock)return beat*unit;
 const length=clock.length-1,loop=Math.floor(beat/length),within=beat-loop*length,i=Math.min(length-1,Math.floor(within));
 return (loop*length+clock[i]+(within-i)*(clock[i+1]-clock[i]))*unit;
}
/** Inverse clock for the live bar/beat display, including seeks and loop wraps. */
export function scoreBeat(mode:MusicMode,seconds:number,rubato=true):number {
 const time=seconds*ARRANGEMENTS[mode].bpm/60,clock=rubato?clocks[mode]:undefined;
 if(!clock)return time;
 const length=clock.length-1,loop=Math.floor(time/length),within=time-loop*length;
 let low=0,high=length;
 while(low+1<high){const middle=(low+high)>>1;if(clock[middle]<=within)low=middle;else high=middle;}
 return loop*length+low+(within-clock[low])/(clock[low+1]-clock[low]);
}
/** Shared by live playback and offline review; long holds cross tempo changes. */
export function performanceBar(mode:MusicMode,bar:number,options:PerformanceOptions={}) {
 const beat=bar*ARRANGEMENTS[mode].beats,start=scoreTime(mode,beat,options.rubato);
 return {duration:scoreTime(mode,beat+ARRANGEMENTS[mode].beats,options.rubato)-start,
  notes:scoreBar(mode,bar).map(n=>({...n,
   time:scoreTime(mode,beat+n.beat,options.rubato)-start,
   seconds:scoreTime(mode,beat+n.beat+n.duration,options.rubato)-scoreTime(mode,beat+n.beat,options.rubato),
   expression:options.expression===false&&n.expression?{}:n.expression,
  })),
 };
}
