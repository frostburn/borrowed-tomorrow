/** Spelling is part of a pitch: C# and Db are different members of 31-EDO. */
export type Letter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
type Accidental = '' | 't' | 'd' | `${'#' | '##' | '###' | '####'}${'' | 't'}` | `${'b' | 'bb' | 'bbb' | 'bbbb'}${'' | 'd'}`;
export type Pitch = `${Letter}${Accidental}${number}`;
const letters = ['C','D','E','F','G','A','B'] as const;
const natural = [0,5,10,13,18,23,28];
const chromatic = [0,2,4,5,7,9,11];
const intervals = { P1:[0,0], A1:[0,2], m2:[1,3], M2:[1,5], m3:[2,8], M3:[2,10], P4:[3,13], A4:[3,15], d5:[4,16], P5:[4,18], m6:[5,21], M6:[5,23], m7:[6,26], M7:[6,28], P8:[7,31], P12:[11,49] } as const;
type SimpleInterval = keyof typeof intervals;
export type Interval = SimpleInterval | `-${SimpleInterval}`;
function parts(pitch:Pitch){
  const match=/^([CDEFGAB])((?:#{1,4}t?|b{1,4}d?|t|d)?)(-?\d+)$/.exec(pitch);
  if(!match)throw new Error(`Invalid spelled pitch: ${pitch}`);
  const accidental=match[2];let alter=0;
  for(const sign of accidental)alter+=sign==='#'?2:sign==='b'?-2:sign==='t'?1:-1;
  return {letter:letters.indexOf(match[1] as Letter),accidental,alter,octave:Number(match[3])};
}
export function pitchSteps(pitch:Pitch){const p=parts(pitch);return p.octave*31+natural[p.letter]+p.alter;}
export function pitchFrequency(pitch:Pitch){return 440*2**((pitchSteps(pitch)-(4*31+23))/31);}
/** Legacy semitone coordinates are useful for checking the transcription, never for tuning. */
export function semitones(pitch:Pitch){const p=parts(pitch);return (p.octave+1)*12+chromatic[p.letter]+p.alter/2;}
export function octave(pitch:Pitch,count:number):Pitch{
  if(!Number.isInteger(count))throw new Error('Octave shifts must be integers.');
  const p=parts(pitch);return `${letters[p.letter]}${p.accidental}${p.octave+count}` as Pitch;
}
export function transpose(pitch:Pitch,interval:Interval):Pitch{
  const down=interval.startsWith('-'),[diatonic,steps]=intervals[(down?interval.slice(1):interval) as SimpleInterval];
  const p=parts(pitch),letter=p.letter+(down?-diatonic:diatonic),oct=p.octave+Math.floor(letter/7),index=((letter%7)+7)%7;
  const alter=pitchSteps(pitch)+(down?-steps:steps)-(oct*31+natural[index]);
  if(Math.abs(alter)>9)throw new Error(`Unsupported spelling: ${pitch} ${interval}`);
  const whole=Math.floor(Math.abs(alter)/2),half=Math.abs(alter)%2;
  const accidental=(alter<0?'b':'#').repeat(whole)+(half?(alter<0?'d':'t'):'');
  return `${letters[index]}${accidental}${oct}` as Pitch;
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
