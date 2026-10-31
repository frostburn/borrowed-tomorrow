import type {Dialogue} from './dialogue';

/** The saved illness is historical after recovery; never tint the healthy cast. */
export const nellIsPale=(flags:Readonly<Record<string,boolean|undefined>>)=>!!flags.nellIll&&!flags.nellRecovered;
export const illnessPortrait=(portrait:string|undefined,pale:boolean)=>pale&&portrait==='portrait-nell'?'portrait-nell-ill':portrait;
const illPoses=new Set(['nell-faint','nell-ill','nell-bed']);
const healthyPoses=new Set(['nell','nell-recovered','nell-rest','pair-hug','pair-hands','nell-left','nell-right','nell-back']);
export const nellPoseIsPale=(face:string|undefined,fallback:boolean)=>face&&illPoses.has(face)?true:face&&healthyPoses.has(face)?false:fallback;

/** Follow staged collapse/recovery before the completion callback saves flags. */
export function illnessDialogue(dialogue:Dialogue,pale:boolean):Dialogue{
 const initial=dialogue.scene?.actors.find(a=>a.id==='nell')?.face;
 const pose=(face?:string)=>{pale=nellPoseIsPale(face,pale);};
 pose(initial);
 return {...dialogue,lines:dialogue.lines.map(line=>{
  pose(line.shot?.actors?.nell?.face);
  return {...line,portrait:illnessPortrait(line.portrait,pale)};
 })};
}
