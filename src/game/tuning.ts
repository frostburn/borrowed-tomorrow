/** Spelling is part of a pitch: C# and Db are different members of 31-EDO. */
export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Pitch = `${Letter}${'' | '#' | 'b' | '##' | 'bb' | '###' | 'bbb' | '####' | 'bbbb'}${number}`;
const letters = ['C','D','E','F','G','A','B'] as const;
const natural = [0,5,10,13,18,23,28];
const chromatic = [0,2,4,5,7,9,11];
const intervals = { P1:[0,0], A1:[0,2], m2:[1,3], M2:[1,5], m3:[2,8], M3:[2,10], P4:[3,13], A4:[3,15], d5:[4,16], P5:[4,18], m6:[5,21], M6:[5,23], m7:[6,26], M7:[6,28], P8:[7,31], P12:[11,49] } as const;
type SimpleInterval = keyof typeof intervals;
export type Interval = SimpleInterval | `-${SimpleInterval}`;
function parts(pitch:Pitch){
  const match=/^([CDEFGAB])(#{1,4}|b{1,4})?(-?\d+)$/.exec(pitch);
  if(!match)throw new Error(`Invalid spelled pitch: ${pitch}`);
  return {letter:letters.indexOf(match[1] as Letter),alter:match[2]?.startsWith('#')?match[2].length:-(match[2]?.length??0),octave:Number(match[3])};
}
export function pitchSteps(pitch:Pitch){const p=parts(pitch);return p.octave*31+natural[p.letter]+2*p.alter;}
export function pitchFrequency(pitch:Pitch){return 440*2**((pitchSteps(pitch)-(4*31+23))/31);}
/** Legacy semitone coordinates are useful for checking the transcription, never for tuning. */
export function semitones(pitch:Pitch){const p=parts(pitch);return (p.octave+1)*12+chromatic[p.letter]+p.alter;}
export function octave(pitch:Pitch,count:number):Pitch{
  if(!Number.isInteger(count))throw new Error('Octave shifts must be integers.');
  const p=parts(pitch);return `${letters[p.letter]}${p.alter<0?'b'.repeat(-p.alter):'#'.repeat(p.alter)}${p.octave+count}` as Pitch;
}
export function transpose(pitch:Pitch,interval:Interval):Pitch{
  const down=interval.startsWith('-'),[diatonic,steps]=intervals[(down?interval.slice(1):interval) as SimpleInterval];
  const p=parts(pitch),letter=p.letter+(down?-diatonic:diatonic),oct=p.octave+Math.floor(letter/7),index=((letter%7)+7)%7;
  const alter=(pitchSteps(pitch)+(down?-steps:steps)-(oct*31+natural[index]))/2;
  if(!Number.isInteger(alter)||Math.abs(alter)>4)throw new Error(`Unsupported spelling: ${pitch} ${interval}`);
  return `${letters[index]}${alter<0?'b'.repeat(-alter):'#'.repeat(alter)}${oct}` as Pitch;
}
export const isBass=(instrument:string)=>instrument==='bass'||instrument==='round-bass';
export const isPercussion=(instrument:string)=>instrument==='kick'||instrument==='snare'||instrument==='hat'||instrument==='cymbal';

/** A balanced spelling of all 31 fifth-related classes; never merge # with b. */
export function fifthsCircle():Pitch[]{
  return Array.from({length:31},(_,i)=>{
    const fifth=i<=15?i:i-31;let pitch:Pitch='C4';
    for(let n=0;n<Math.abs(fifth);n++)pitch=transpose(pitch,fifth<0?'-P5':'P5');
    return octave(pitch,4-parts(pitch).octave);
  });
}
