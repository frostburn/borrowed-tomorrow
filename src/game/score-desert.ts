import type { Instrument, Note } from './score';
import { octave, type Pitch } from './tuning';
import { phrasing, singing } from './expression';

export type DesertMode = 'outermooring' | 'namar' | 'sunpalace' | 'skywalk' | 'observatory' | 'desert-battle' | 'sun-serpent';
type Phrase = readonly (readonly [beat: number, pitch: Pitch, hold: number])[];

// Each tune has a complete form. Only deliberate quotations join the city,
// postal stair and serpent; changing the tempo is not a battle arrangement.
const melodies: Record<DesertMode, readonly Phrase[]> = {
  namar: [
    [[0,'G5',1.25],[1.5,'Ed5',.5],[2.5,'D5',.75]], [[.5,'C5',2.5]],
    [[0,'D5',.75],[1,'Ed5',1.5],[3,'Ft5',.75]], [[.5,'G5',1],[2,'Ft5',.5],[3,'D5',.75]],
    [[0,'C5',2.75]], [[.5,'E5',.5],[1.5,'Ct5',.5],[2.5,'A4',1]],
    [[0,'Bd4',1.5],[2,'D5',.75]], [[.5,'C5',2]],
    [[0,'C6',1.5],[2,'Ad5',.75],[3,'G5',.5]], [[.5,'F5',2.25]],
    [[0,'Ft5',.75],[1,'A5',.75],[2.5,'G5',1]], [[0,'Bd5',1.5],[2,'A5',.5],[3,'G5',.75]],
    [[.5,'Ft5',1.5],[2.5,'Ed5',.75]], [[0,'E5',1.5],[2,'Ct5',1]],
    [[0,'D5',1],[1.5,'Bd4',.5],[2.5,'G4',1]], [[0,'C5',2.75]],
    [[.5,'E5',.75],[1.5,'Ct5',.75],[3,'B4',.5]], [[0,'A4',2.5]],
    [[0,'D5',1],[1.5,'Ft5',.75]], [[.5,'E5',1],[2,'D5',1.5]],
    [[0,'F5',1.5],[2,'Ad5',1]], [[.5,'Bd5',1.5],[2.5,'Ad5',.75]],
    [[0,'G5',2.5]], [],
    [[0,'Ad5',1],[1.5,'G5',.5],[2.5,'F5',1]], [[.5,'Ft5',1],[2,'D5',1.5]],
    [[0,'G5',1],[1.5,'Ed5',.5],[2.5,'D5',.75]], [[.5,'Ct5',1.25],[2.5,'E5',.75]],
    [[0,'F5',1.5],[2,'Ad5',1]], [[0,'G5',1],[1.5,'Ft5',.5],[2.5,'D5',1]],
    [[.5,'Bd4',1],[2,'D5',.75]], [[0,'C5',3]],
  ],
  sunpalace: [
    [[0,'G4',1.5],[2,'Ed4',.75]], [[.5,'D4',1],[2,'C4',.75]],
    [[0,'Ed4',2.5]], [],
    [[0,'F4',1],[1.5,'Ad4',1]], [[0,'G4',1.5],[2,'F4',.75]],
    [[.5,'Ft4',1],[2,'D4',.75]], [[0,'A4',2.5]],
    [[0,'E5',1],[1.5,'Ct5',1]], [[0,'B4',.5],[1,'A4',1.5]],
    [[.5,'G4',1],[2,'Bd4',.75]], [[0,'D5',2.5]],
    [[0,'Ft5',1.5],[2,'D5',.75]], [[.5,'C5',1],[2,'A4',.75]],
    [[0,'Bd4',1],[1.5,'A4',.5],[2.5,'G4',.4]], [],
    [[0,'Ad4',1.5],[2,'C5',.75]], [[0,'F5',2.5]],
    [[.5,'Ft5',1],[2,'D5',.75]], [[0,'C5',2]],
    [[0,'Bd4',1],[1.5,'D5',1]], [[.5,'Ft5',2]],
    [[0,'E5',1],[1.5,'Ct5',1]], [[0,'A4',2.5]],
    [[0,'G4',1.5],[2,'Ed4',.75]], [[.5,'D4',1],[2,'C4',.75]],
    [[0,'F4',1],[1.5,'Ad4',1]], [[0,'G4',2]],
    [[.5,'Ft4',1],[2,'D4',.75]], [[0,'Bd3',2]],
    [[0,'D4',.75],[1.5,'Ed4',.75]], [[0,'C4',2.6]],
  ],
  skywalk: [
    [[0,'G4',.6],[1,'Ed4',.6],[2.5,'D4',.8]], [[.5,'C4',1.5],[3,'G4',.6]],
    [[0,'D5',.6],[1.5,'Ft4',.6],[2.5,'A4',.8]], [[0,'G4',2.5]],
    [[.5,'Ad4',.6],[1.5,'C5',.6],[3,'Ad4',.6]], [[0,'G4',1.5],[2,'F4',1]],
    [[0,'D4',.6],[1,'Bd3',.6],[2.5,'Ft4',.8]], [],
    [[0,'C5',1],[1.5,'Ad4',.6],[3,'G4',.6]], [[.5,'F4',2]],
    [[0,'E5',.6],[1,'Ct5',.6],[2.5,'A4',.8]], [[0,'B4',1],[2,'Ct5',1]],
    [[0,'D5',1.5],[2,'Ft5',.8]], [[.5,'E5',1],[2,'D5',1]],
    [[0,'Bd4',.6],[1,'A4',.6],[2.5,'G4',.8]], [[0,'C5',2.5]],
    [[0,'Ft5',2],[2.5,'E5',1]], [[.5,'D5',2.5]],
    [[0,'E5',1.5],[2,'Ct5',1.5]], [],
    [[.5,'D5',2],[3,'C5',.6]], [[0,'Bd4',2.5]],
    [[0,'D5',1],[1.5,'Bd4',.6],[3,'G4',.6]], [[0,'A4',1.5],[2.5,'G4',1]],
    [[0,'G4',.6],[1,'Ed4',.6],[2.5,'D4',.8]], [[.5,'C4',1.5],[3,'Ed4',.6]],
    [[0,'F4',1],[1.5,'Ad4',.6],[3,'C5',.6]], [[0,'D5',1.5],[2.5,'Ft5',.8]],
    [[0,'E5',1],[1.5,'Ct5',.6],[3,'A4',.6]], [[0,'Bd4',1.5],[2,'D5',1]],
    [[0,'G4',1],[1.5,'Ft4',.6],[2.5,'D4',.8]], [[0,'C4',2.5]],
  ],
  outermooring: [
    [[0,'G3',3]], [[.5,'Ed3',1.5],[2.5,'D3',1]],
    [[0,'C3',4.5]], [],
    [[.5,'F3',2],[3,'Ad3',.75]], [[0,'G3',2.5]],
    [[0,'Ft3',1.5],[2,'D3',1]], [],
    [[0,'E4',2.5]], [[.5,'Ct4',1.5],[2.5,'B3',1]],
    [[0,'A3',4.5]], [],
    [[.5,'D4',1.5],[2.5,'Bd3',1]], [[0,'A3',1.5],[2,'G3',1.5]],
    [[0,'Ft3',2.5]], [[1,'G3',2]],
    [[.5,'D4',3]], [[0,'Ft4',2.5]],
    [[0,'E4',1.5],[2,'Ct4',1.5]], [[0,'A3',4.5]],
    [], [[.5,'Ad3',2.5]],
    [[0,'G3',1.5],[2,'F3',1]], [[.5,'D3',2.5]],
    [[0,'A3',2],[2.5,'Ft3',1]], [[0,'D3',2.5]],
    [[.5,'Bd3',1.5],[2.5,'A3',1]], [[0,'G3',3]],
    [[0,'Ed3',1.5],[2,'D3',1]], [],
    [[.5,'D3',1.5],[2.5,'G3',.75]], [[0,'C3',2.5]],
  ],
  observatory: [
    [[.5,'A3',4.5]], [],
    [[0,'Ft3',2.5]], [[1,'D3',2]],
    [[.5,'Bd3',3]], [[0,'Ad3',1.5],[2.5,'Ft3',1]],
    [], [[.5,'F3',3]],
    [[0,'E5',2]], [],
    [[1,'Ct5',2]], [[.5,'A4',2.5]],
    [], [[0,'Bd4',3]],
    [[.5,'G4',1.5],[2.5,'D4',1]], [],
    [[0,'E5',1.5],[2,'Eb5',1]], [[1,'A4',2.5]],
    [[.5,'Ft4',4.5]], [],
    [[0,'D4',3]], [[.5,'C4',1.5],[2.5,'Bd3',1]],
    [], [[1,'A3',2.5]],
    [[.5,'F3',2.5]], [[0,'Ad3',3]],
    [[0,'Ft3',1.5],[2,'D3',1.5]], [],
    [[0,'G3',2]], [[.5,'Bd3',1.5],[2.5,'A3',1]],
    [[0,'Ft3',2.5]], [[.5,'D3',3]],
  ],
  'desert-battle': [
    [[0,'G5',.6],[1,'Ed5',.6],[2,'D5',.6],[3,'Ed5',.4],[3.5,'G5',.35]], [[0,'C5',1.5],[2,'G4',.6],[3,'C5',.6]],
    [[0,'D5',.6],[1,'Ft5',.6],[2.5,'A5',1]], [[0,'G5',1],[1.5,'Ft5',.4],[2,'D5',1],[3.5,'Bd4',.35]],
    [[0,'C5',1],[1.5,'Ed5',.4],[2,'G5',1]], [[0,'E5',.6],[1,'Ct5',.6],[2,'A4',1.5]],
    [[0,'Bd4',.6],[1,'D5',.6],[2,'G5',1]], [[0,'C5',2.5],[3,'G5',.6]],
    [[0,'C6',1],[1.5,'Ad5',.4],[2,'G5',.6],[3,'F5',.6]], [[0,'Ad5',1.5],[2,'C6',1]],
    [[0,'A5',.6],[1,'G5',.6],[2,'Ft5',1.5]], [[0,'D5',1],[1.5,'Ft5',.4],[2.5,'A5',1]],
    [[0,'Bd5',1.5],[2,'Ad5',.6],[3,'Ft5',.6]], [[0,'E5',1],[1.5,'Ct5',.4],[2,'A4',1.5]],
    [[0,'D5',.6],[1,'Bd4',.6],[2,'G4',1]], [[0,'C5',2.5]],
    [[0,'E5',2.5]], [[1,'Ct5',1],[2.5,'A4',1]],
    [[0,'Ft5',1.5],[2,'E5',1]], [[0,'D5',3]],
    [[0,'F5',2],[2.5,'Ad5',1]], [[0,'Bd5',2.5]],
    [[0,'A5',1],[1.5,'G5',1],[3,'Ft5',.6]], [[0,'D5',2.5],[3,'G5',.6]],
    [[0,'G5',.6],[1,'Ed5',.6],[2,'D5',.6],[3,'G5',.6]], [[0,'C6',1.5],[2,'Ed6',1]],
    [[0,'Ad5',.6],[1,'G5',.6],[2.5,'F5',1]], [[0,'Ft5',1],[1.5,'D5',.4],[2,'A4',1.5]],
    [[0,'E5',.6],[1,'Ct5',.6],[2,'A4',.6],[3,'Ct5',.6]], [[0,'D5',1.5],[2,'G5',1]],
    [[0,'Bd5',.6],[1,'A5',.6],[2,'G5',.6],[3,'D5',.6]], [[0,'C5',2],[2.5,'D5',.35],[3,'Ed5',.35],[3.5,'D5',.35]],
  ],
  'sun-serpent': [
    [[0,'G4',.7],[1,'Ed4',.35],[1.5,'D4',.7]], [[0,'C4',1],[1.5,'G4',1]],
    [[0,'Ad4',.7],[1,'G4',.35],[1.5,'F4',.7]], [[0,'D4',1.5],[2,'Bd3',.7]],
    [[0,'G4',.7],[1,'Ed4',.35],[1.5,'C4',1]], [[0,'A4',1],[1.5,'Ft4',1]],
    [[0,'Bd4',.7],[1,'A4',.35],[1.5,'G4',.7]], [[0,'C4',2.5]],
    [[0,'C5',1.5],[2,'Ad4',.7]], [[.5,'G4',1],[2,'F4',.7]],
    [[0,'E5',1],[1.5,'Ct5',1]], [[0,'A4',2.5]],
    [[0,'Ft5',1],[1.5,'D5',1]], [[0,'Bd4',.7],[1,'Ad4',.35],[1.5,'Ft4',.7]],
    [[0,'G4',1],[1.5,'Bd4',1]], [[0,'D5',2.5]],
    [[0,'E5',1],[1.5,'Eb5',1]], [[.5,'A4',2]],
    [[0,'Ft5',2]], [[.5,'D5',2]],
    [[0,'E5',1],[1.5,'Ct5',1]], [[0,'A4',2.5]],
    [[0,'Bd4',1],[1.5,'D5',1]], [[0,'G4',2.5]],
    [[0,'C5',.7],[1,'Ad4',.35],[1.5,'F4',.7]], [[0,'A4',1],[1.5,'Ft4',1]],
    [[0,'G4',.7],[1,'Ed4',.35],[1.5,'D4',.7]], [[0,'E4',1],[1.5,'Ct4',1]],
    [[0,'F4',1],[1.5,'Ad4',1]], [[0,'G4',.7],[1,'Ft4',.35],[1.5,'D4',1]],
    [[0,'Bd3',1],[1.5,'D4',1]], [[0,'C4',2.5]],
  ],
};

// Neutral triads are homes, including D–Ft–A and A–Ct–E. Open inversions
// keep their thirds audible without a cloud of clustered upper partials.
const chords = {
  C: {bass:'C2', tones:['G3','C4','Ed4']},
  G: {bass:'G2', tones:['G3','Bd3','D4']},
  F: {bass:'F2', tones:['F3','Ad3','C4']},
  D: {bass:'D2', tones:['A3','D4','Ft4']},
  A: {bass:'A2', tones:['A3','Ct4','E4']},
  B: {bass:'Bd2', tones:['Ft3','Bd3','D4']},
} as const satisfies Record<string, {bass:Pitch; tones:readonly Pitch[]}>;
type Chord = keyof typeof chords;
const pairs = (...ids:Chord[]) => ids.flatMap(id=>[id,id]);
const harmonies: Record<DesertMode, readonly Chord[]> = {
  namar: ['C','C','D','G','C','A','G','C','F','F','D','G','D','A','G','C','A','A','D','D','F','B','G','G','F','D','C','A','F','G','G','C'],
  sunpalace: pairs('C','C','F','D','A','G','D','G','F','D','B','A','C','F','G','C'),
  skywalk: ['C','C','D','G','F','F','B','G','F','F','A','A','D','D','G','C','D','D','A','A','B','B','G','G','C','C','F','D','A','G','G','C'],
  outermooring: pairs('C','C','F','D','A','A','G','D','B','A','F','F','D','G','C','C'),
  observatory: pairs('D','D','B','F','A','A','G','C','D','D','B','A','F','D','G','D'),
  'desert-battle': ['C','C','D','G','C','A','G','C','F','F','D','D','B','A','G','C','A','A','D','D','F','B','G','G','C','C','F','D','A','G','G','C'],
  'sun-serpent': ['C','C','F','G','C','D','G','C','F','F','A','A','D','B','G','G','D','D','B','B','A','D','G','G','F','D','C','A','F','G','G','C'],
};
const leads: Record<DesertMode, readonly Instrument[]> = {
  outermooring:['reed','reed','strings','reed'], namar:['reed','reed','lute','reed'],
  sunpalace:['reed','lute','reed','reed'], skywalk:['lute','lute','reed','lute'],
  observatory:['reed','bell','strings','reed'], 'desert-battle':['reed','reed','strings','reed'],
  'sun-serpent':['brass','reed','strings','brass'],
};
// These are written replies in the lead's rests, not a fill for every gap.
const replies: Partial<Record<DesertMode, Readonly<Record<number,Phrase>>>> = {
  namar:{4:[[3,'Ed4',.45]],7:[[2.75,'D5',.4],[3.5,'G4',.35]],15:[[3,'Ed5',.6]],23:[[.5,'D5',1],[2.5,'Bd4',1]]},
  sunpalace:{3:[[.5,'G4',.7],[1.5,'Ed4',1]],7:[[2.5,'D5',.4]],15:[[.5,'D4',1],[2,'G4',.7]],23:[[2.5,'E5',.4]]},
  skywalk:{7:[[.5,'Bd4',1.5],[2.5,'G4',1]],19:[[.5,'E4',1],[2,'A4',1.5]],31:[[2.75,'Ed4',.7]]},
  outermooring:{3:[[1,'G4',1.5]],7:[[1,'A4',1.5]],11:[[.5,'E4',1.5],[2.5,'Ct4',1]],20:[[1,'C4',2]],29:[[1,'G4',1.5]]},
  observatory:{3:[[3,'A4',2]],7:[[3,'Ad4',2]],15:[[1,'G4',2]],23:[[3,'E4',2]],27:[[1,'A4',2]]},
  'desert-battle':{7:[[3,'Ed5',.65]],15:[[3,'G5',.65]],19:[[3.25,'A4',.6]],23:[[3.5,'D5',.35]]},
  'sun-serpent':{7:[[2.5,'Ed5',.4]],11:[[2.5,'Ct5',.4]],19:[[2.5,'Ft5',.4]],23:[[2.5,'D5',.4]]},
};
const dynamics = [.83,.76,.9,.82,.73,.88,.8,.65,.94,.84,.91,.78,.96,.86,.83,.62,.67,.75,.83,.71,.94,1,.86,.76,1,.94,.88,.83,.97,.86,.78,.62];

export function desertBar(mode:DesertMode, bar:number):Note[] {
  const boss=mode==='sun-serpent', court=mode==='sunpalace';
  const quiet=mode==='outermooring'||mode==='observatory'||court, fight=boss||mode==='desert-battle';
  const beats=boss||court?3:4, i=((bar-(boss?2:0))%32+32)%32, section=Math.floor(i/8), out:Note[]=[];
  const strength=dynamics[i];
  const add=(instrument:Instrument,pitch:Pitch,beat:number,duration:number,velocity:number,pan=0) => {
    const note:Note={instrument,pitch,beat,duration,velocity,pan,expression:phrasing(strength,instrument==='strings')};
    out.push(note);return note;
  };
  if(boss&&bar<2){
    const second=bar===1;
    add('timpani',second?'G2':'C2',0,1.3,.12);
    for(const pitch of ['G3','C4','Ed4'] as const)add('strings',pitch,0,2.8,.022,.3);
    add('brass',second?'D4':'G4',0,.85,.16,-.15);
    add('brass',second?'Bd3':'Ed4',1.5,1.2,.18,-.15);
    if(second)for(const beat of [1.5,2,2.5])add('snare','D2',beat,.12,.045+beat*.02,-.15);
    return out;
  }
  const id=harmonies[mode][i], chord=chords[id], next=chords[harmonies[mode][(i+1)%32]];
  const lead=leads[mode][section], tune=melodies[mode][i];
  for(const [beat,pitch,hold] of tune){
    const volume=quiet?.14:lead==='lute'?.21:boss?.2:.19;
    const n=add(lead,pitch,beat,hold,volume,-.18);
    n.expression=lead==='lute'?phrasing(strength):singing(quiet?'warm':'clear',strength,hold,i%8===7);
    // A reed's tiny one-step approach arrives early, before its neutral third
    // settles. Plucked notes and short connections retain their exact attack.
    if(lead==='reed'&&quiet&&hold>=2.5&&[2,11,25].includes(i))n.expression.bend=[[0,-1200/31],[.1,0],[1,0]];
    if(lead==='bell')n.expression.release=.9;
  }
  const answer=mode==='skywalk'?'reed':mode==='observatory'?'bell':mode==='sun-serpent'?'reed':'lute';
  for(const [beat,pitch,hold] of replies[mode]?.[i]??[]){
    const n=add(answer,pitch,beat,hold,quiet?.09:fight?.09:.11,.3);
    n.expression=answer==='lute'?phrasing(strength):singing('clear',strength*.85,hold);
    if(answer==='bell')n.expression.release=.9;
  }
  if(quiet){
    // Two-bar harmony. No reattack, chord change or automatic arpeggio midway
    // through a sustained phrase; the actual next pair decides the release.
    if(i%2===0){
      const hold=beats*2-.4;
      add('round-bass',chord.bass,0,hold,mode==='observatory'?.12:.1);
      // Open the texture for the central answer instead of making it louder
      // simply by adding another copy of every chord.
      if(!(mode==='observatory'&&section===1))for(const [k,p] of chord.tones.entries()){
        add('strings',p,0,hold,section===2?.024:.018,k%2?.4:-.4);
      }
    }
    if(court&&[0,4,8,12,20,24,28].includes(i)){
      for(const [k,p] of chord.tones.entries())add('lute',p,.5+k*.5,1.25,.055,.3);
    }
    // Recall the hunters' established E–Eb–A call in the room's middle.
    // It is a recognisable incursion into the local neutral harmony.
    if(mode==='observatory'&&i===16){
      add('bell','E5',0,1.4,.09,.25).expression!.release=1;
      add('bell','Eb5',2,1,.09,.25).expression!.release=1;
    }
    if(mode==='observatory'&&i===17)add('bell','A4',1,2.5,.09,.25).expression!.release=1;
    return out;
  }

  if(boss){
    add('round-bass',chord.bass,0,1.25,.17);
    add('round-bass',i%4===3?octave(chord.tones[0],-1):chord.bass,1.5,1.1,.14);
    if([6,14,22,30].includes(i))add('round-bass',next.bass,2.75,.2,.1);
  }else if(fight){
    const rhythm=i%8===7?[[0,2.8],[3.5,.35]]:section===2?[[0,1.75],[2,1.6]]:[[0,.85],[1.5,.35],[2,.85],[3.5,.35]];
    for(const [k,[beat,hold]] of rhythm.entries())add('round-bass',beat===3.5?next.bass:k%2?octave(chord.tones[0],-1):chord.bass,beat,hold,k%2?.12:.16);
  }else{
    add('round-bass',chord.bass,0,i%4===3?3.4:1.65,.13);
    if(i%4!==3)add('round-bass',section===2?octave(chord.tones[0],-1):chord.bass,2.5,1,.095);
    if([6,14,22,30].includes(i))add('round-bass',next.bass,3.75,.2,.075);
  }

  // Keep accompaniment below the lead. Cadences leave a real gap, and the
  // longer middle retains the pulse without constant plucked subdivisions.
  if(i%8!==7){
    const rhythm=boss?[.5,2]:fight?[.5,2.5]:section===2?[1.5]:[1,3];
    for(const beat of rhythm){
      const p=chord.tones[(i+Math.floor(beat))%3];
      add('lute',p,beat,boss?.35:.55,fight?.06:.055,.3);
      if(!boss&&section!==2)add('lute',chord.tones[(i+Math.floor(beat)+1)%3],beat,.55,fight?.04:.035,-.35);
    }
  }
  if(section===2||section===3&&i%2===0)for(const [k,p] of chord.tones.entries())add('strings',p,0,beats-.2,.022,k%2?.4:-.4);
  if(boss&&i===16){
    add('bell','E5',0,1,.075,.3).expression!.release=.7;
    add('bell','Eb5',1.5,1,.075,.3).expression!.release=.7;
  }
  if(boss&&i===17)add('bell','A4',.5,2,.075,.3).expression!.release=.7;

  if(boss){
    for(const beat of [0,1.5])add('kick','C2',beat,.14,.11);
    add('snare','D2',1.5,.12,.075,-.15);
    for(const beat of [.5,1,2,2.5])add('hat','F#2',beat,.07,beat===1||beat===2.5?.016:.025,.4);
    if([0,8,24].includes(i)){add('timpani',chord.bass,0,1.3,.09);add('cymbal','C2',0,1.2,.03,.3);}
    if(i%8===7)for(const beat of [2,2.5])add('snare','D2',beat,.1,.06,-.15);
  }else if(fight){
    for(const beat of [0,2])add('kick','C2',beat,.14,.105);
    for(const beat of [1,3])add('snare','D2',beat,.12,.075,-.15);
    for(let beat=.5;beat<4;beat+=.5)add('hat','F#2',beat,.07,beat%1?.022:.014,.4);
    if([0,8,24].includes(i))add('cymbal','C2',0,1,.025,.3);
    if(i%8===7)for(const beat of [3.5,3.75])add('snare','D2',beat,.08,.045,-.15);
  }else{
    const pulse=mode==='skywalk'?.04:.03;
    for(const beat of i%8===7?[0]:[0,2])add('kick','C2',beat,.14,pulse);
    if(section!==2&&i%8!==7)for(const beat of [1,3])add('snare','D2',beat,.1,pulse*.55,-.15);
    for(const beat of section===2?[1.5,3.5]:[.5,1.5,2.5,3.5])add('hat','F#2',beat,.07,pulse*.35,.4);
  }
  return out;
}
