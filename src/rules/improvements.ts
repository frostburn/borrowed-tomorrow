import type {GameState,HeroId,MapId} from './state';

export type ImprovementService='training'|'hammerplain'|'dawnwatch'|'windmere'|'iria'|'capital';
export interface Improvement {
 id:string;hero:HeroId;name:string;cost:number;service:ImprovementService;requires:string;
 effect:'hp'|'focus'|'movement'|'bash'|'heal'|'terrain'|'barrier';
}
const heroes:HeroId[]=['nell','orrin','kit','celia','petra'];
export const IMPROVEMENTS:readonly Improvement[]=[
 ...heroes.flatMap(hero=>[
  {id:`hp-${hero}`,hero,name:'Endurance training',cost:300,service:'training' as const,requires:'airshipOwned',effect:'hp' as const},
  {id:`focus-${hero}`,hero,name:'Focus training',cost:450,service:'training' as const,requires:'airshipOwned',effect:'focus' as const},
 ]),
 {id:'orrin-counterbalance',hero:'orrin',name:'Counterbalanced lance',cost:500,service:'hammerplain',requires:'hammerplainComplete',effect:'movement'},
 {id:'petra-recovery',hero:'petra',name:'Shield recovery drill',cost:400,service:'dawnwatch',requires:'dawnwatchComplete',effect:'bash'},
 {id:'celia-sight',hero:'celia',name:'Long-range focus calibration',cost:450,service:'windmere',requires:'windmereComplete',effect:'heal'},
 {id:'kit-footing',hero:'kit',name:'River courier training',cost:450,service:'iria',requires:'riverRestSeen',effect:'terrain'},
 {id:'nell-housing',hero:'nell',name:'Reinforced lantern housing',cost:400,service:'capital',requires:'capitalOpened',effect:'barrier'},
];
export const improvementFlag=(id:string)=>`improved-${id}`;
type Progress={flags?:GameState['flags']};
export const improved=(s:Progress,id:string)=>s.flags?.[improvementFlag(id)]===true;
export const hpTraining=(s:Progress,id:HeroId)=>improved(s,`hp-${id}`)?12:0;
export const maxFocus=(s:Progress,id:HeroId)=>improved(s,`focus-${id}`)?7:6;
/** Battle fixtures without a campaign profile keep the ordinary six-focus cap. */
export const focusCapacity=(u:{maxFocus?:number})=>u.maxFocus??6;
export const improvementUnlocked=(s:Pick<GameState,'party'|'flags'>,i:Improvement)=>s.party.some(h=>h.id===i.hero)&&!!s.flags[i.requires]&&(i.effect!=='barrier'||!!s.flags.nellRecovered);
const locations:Record<ImprovementService,readonly MapId[]>={
 training:['airship','outermooring','capitalquay','hollowsill','lastrefuge'],
 hammerplain:['hammerplain'],dawnwatch:['dawnwatch'],windmere:['windmere','dispensary'],iria:['riverhaven','rainhouse'],capital:['capitalquay','lastpalace','crown'],
};
/** Allied crews retain the three anchor-region specialties after departure. */
export const CREW_SERVICES:readonly ImprovementService[]=['hammerplain','dawnwatch','windmere'];
export const serviceAvailable=(s:GameState,service:ImprovementService)=>!!s.flags.airshipOwned&&(locations[service].includes(s.location.map)||CREW_SERVICES.includes(service)&&locations.training.includes(s.location.map));
export function improvementProblem(s:GameState,i:Improvement):string|undefined {
 if(improved(s,i.id))return 'Completed';
 if(!serviceAvailable(s,i.service)||!improvementUnlocked(s,i))return 'Not available yet';
 if(i.hero==='nell'&&(s.flags.nellLost||s.flags.nellIll&&!s.flags.nellRecovered))return 'Nell cannot train while unavailable';
 if(s.coins<i.cost)return `Need ${i.cost-s.coins} more ${i.cost-s.coins===1?'mark':'marks'}`;
}
/** One atomic, once-only purchase. No healing, skill ranks or equipment mutation. */
export function buyImprovement(s:GameState,id:string):boolean {
 const i=IMPROVEMENTS.find(i=>i.id===id);
 if(!i||improvementProblem(s,i))return false;
 s.coins-=i.cost;s.flags[improvementFlag(id)]=true;return true;
}
export function validateImprovements(s:Pick<GameState,'party'|'flags'>) {
 for(const [flag,value]of Object.entries(s.flags))if(value&&flag.startsWith('improved-')){
  const i=IMPROVEMENTS.find(i=>improvementFlag(i.id)===flag);
  if(!i||!improvementUnlocked(s,i))throw new Error('Invalid permanent improvement.');
 }
}
