import {ABILITIES,teamOutput,teamSolo,type Ability,type AbilityId} from './abilities';
import {COMPANION_IDS,type CompanionId} from './party';

export type SkillId='burst'|'mend'|'heal'|'dazzle'|'sunline'|'steam'|'rivet'|'guard'|'repulse'|'quickshot'|'ricochet'|'feint'|'pin'|'celestialbolt'|'rally'|'sanctuary'|'bash'|'taunt'|'sweep'|'crush';
export type SkillRanks=Partial<Record<SkillId,number>>;
export type SkillBook=Record<CompanionId,SkillRanks>;
export interface Skill {id:SkillId;levels:readonly number[];ranks:readonly Partial<Ability>[]}
const skill=(id:SkillId,levels:readonly number[],ranks:readonly Partial<Ability>[]):Skill=>({id,levels,ranks});
const restoration=(id:'mend'|'heal',levels:readonly number[])=>{const revive=id==='heal';return skill(id,levels,[
 {power:18,description:'Heal one ally. Range 4. 2 focus.'},
 {power:22,shape:'blast',cost:3,description:'Heal allies in a seven-hex area. Range 4. 3 focus.'},
 {power:28,shape:'blast',cost:revive?4:3,cleanse:true,...(revive?{reviveFraction:.35,sound:'revive' as const}:{}),description:revive?'Heal allies in seven hexes and clear Dazzle/pin. A fallen ally at the clear center revives at 35% HP and acts next round. Range 4. 4 focus.':'Heal allies in a seven-hex area and clear Dazzle and pin. Range 4. 3 focus.'},
]);};
export const SKILLS:Record<CompanionId,readonly Skill[]>={
 nell:[
  skill('burst',[1,2,6],[
   {shape:'quad',power:8,description:'A slanted four-hex burst extending right and down-right from the aim. Hits allies. Range 5. 2 focus.'},
   {shape:'blast',power:12,description:'A seven-hex burst. Hits allies. Range 5. 2 focus.'},
   {shape:'blast',power:17,friendlyFire:.5,description:'A stronger seven-hex burst. Allies take half damage. Range 5. 2 focus.'},
  ]),restoration('mend',[2,5,10]),
  skill('dazzle',[3,7,11],[{}, {shape:'blast',cost:3,description:'Dazzle enemies in a seven-hex area for three attacks. Existing Dazzle is not refreshed. Range 4. 3 focus.'},{shape:'blast',cost:2,description:'Dazzle enemies in a seven-hex area for three attacks. Existing Dazzle is not refreshed. Range 4. 2 focus.'}]),
  skill('sunline',[7,10,13],[{range:4,power:22,cost:3,description:'A short hex-diagonal ray: two spaced contacts from Nell. Stops at cover, hits allies. 3 focus.'},{range:6,power:28,cost:3,description:'A stronger hex-diagonal ray: three spaced contacts from Nell. Stops at cover, hits allies. 3 focus.'},{range:6,power:35,cost:3,description:'A powerful hex-diagonal ray: three spaced contacts from Nell. Stops at cover, hits allies. 3 focus.'}]),
 ],
 orrin:[
  skill('steam',[1,4,9],[{power:16},{power:21},{power:28}]),
  skill('rivet',[2,6,11],[{power:10,pierce:2},{power:15,pierce:4,description:'One enemy within 5 hexes. Ignores 4 armor. 1 focus.'},{power:21,pierce:6,description:'One enemy within 5 hexes. Ignores 6 armor. 1 focus.'}]),
  skill('guard',[2,5,10],[{power:10},{shape:'blast',range:0,power:16,cost:3,description:'Grant a barrier to Orrin and adjacent allies. Level-scaled; does not stack. 3 focus.'},{shape:'blast',range:0,power:25,cost:3,description:'Grant a stronger barrier to Orrin and adjacent allies. Level-scaled; does not stack. 3 focus.'}]),
  skill('repulse',[5,8,12],[{power:10,cost:2,description:'Hit all six hexes around Orrin, including allies. Push survivors one clear hex. 2 focus.'},{power:16,cost:2,description:'A stronger pressure wave around Orrin, including allies. Push survivors one clear hex. 2 focus.'},{power:23,cost:2,friendlyFire:.5,description:'A strong pressure wave around Orrin. Allies take half damage. Push survivors one clear hex. 2 focus.'}]),
 ],
 kit:[
  skill('quickshot',[1,4,9],[{power:10},{power:13,pierce:1,description:'A quick shot within 5 hexes. Ignores 1 armor. No focus cost.'},{power:17,pierce:2,description:'A quick shot within 5 hexes. Ignores 2 armor. No focus cost.'}]),
  skill('feint',[2,3,10],[{}, {cost:1,description:'Dazzle one enemy for its next three attacks. Range 4. 1 focus.'},{cost:1,range:6,description:'Dazzle one enemy for its next three attacks. Range 6. 1 focus.'}]),
  skill('ricochet',[5,8,12],[{power:9,range:4,bounceRange:2,description:'Hit one enemy within 4 hexes, then another within 2 of it. 3 focus.'},{power:14,range:5,bounceRange:3},{power:20,range:6,bounceRange:4,description:'Hit one enemy within 6 hexes, then another within 4 of it. 3 focus.'}]),
  skill('pin',[7,10,13],[{power:11},{power:17},{power:24}]),
 ],
 celia:[
  skill('celestialbolt',[1,6,11],[{power:8},{power:10},{power:12}]),restoration('heal',[1,3,10]),
  skill('rally',[2,6,10],[{}, {shape:'blast',description:'A moving aura on Celia and her six surrounding hexes. +1 focus regeneration at normal turn start. Lasts 3 rounds, including this round. No immediate focus; ends if Celia falls. Refreshes without stacking. 3 focus.'},{shape:'party',description:'The whole active party gains +1 focus regeneration at normal turn start, wherever they stand. Lasts 3 rounds, including this round. No immediate focus; ends if Celia falls. Refreshes without stacking. 3 focus.'}]),
  skill('sanctuary',[5,9,12],[{power:8},{power:24,description:'Grant a stronger barrier to allies in seven hexes. Level-scaled; does not stack. Range 4. 3 focus.'},{shape:'party',range:0,power:32,cost:4,description:'Grant a strong barrier to every living ally. Level-scaled; does not stack. 4 focus.'}]),
 ],
 petra:[
  skill('bash',[1,5,9],[{}, {cost:0,description:'Optional extra action: push an adjacent enemy one hex. No damage or focus cost; once per turn.'},{shape:'blast',range:0,cost:0,enemyOnly:true,description:'Optional extra action: push every adjacent enemy one hex. No damage or focus cost; once per turn.'}]),
  skill('taunt',[2,6,10],[{}, {ward:{power:10},description:'Taunt every enemy and give Petra a level-scaled barrier. 2 focus.'},{ward:{power:10,party:true},cost:4,description:'Taunt every enemy and give the living party level-scaled barriers. 4 focus.'}]),
  skill('sweep',[3,7,11],[{power:13},{power:18},{power:25,friendlyFire:.5,description:'Sweep all adjacent hexes. Allies take half damage. 2 focus.'}]),
  skill('crush',[5,8,12],[{power:18,pierce:4},{power:24,pierce:6},{power:31,pierce:8,effect:'push',description:'Heavy adjacent strike, ignoring 8 armor. Push the survivor one clear hex. 3 focus.'}]),
 ],
};
export function startingSkills(hero:CompanionId):SkillRanks{return Object.fromEntries(SKILLS[hero].map(s=>[s.id,s.levels[0]===1?1:0]));}
export const newSkillBook=():SkillBook=>Object.fromEntries(COMPANION_IDS.map(id=>[id,startingSkills(id)]))as SkillBook;
export const skillPoints=(hero:CompanionId,level:number,ranks:SkillRanks)=>Math.max(0,level-1-SKILLS[hero].reduce((sum,s)=>sum+Math.max(0,(ranks[s.id]??0)-(s.levels[0]===1?1:0)),0));
export function upgradeReason(hero:CompanionId,level:number,ranks:SkillRanks,id:SkillId):string|undefined{
 if(!Number.isInteger(level)||level<1||level>15)return 'Invalid character level.';
 const s=SKILLS[hero].find(s=>s.id===id);if(!s)return 'This character cannot learn this skill.';
 const rank=ranks[id]??0;if(rank>=s.ranks.length)return 'Maximum skill level.';
 if(level<s.levels[rank])return `Requires character level ${s.levels[rank]}.`;
 if(skillPoints(hero,level,ranks)<=0)return 'No upgrade points.';
}
export function upgradeSkill(hero:CompanionId,level:number,ranks:SkillRanks,id:SkillId){if(upgradeReason(hero,level,ranks,id))return false;ranks[id]=(ranks[id]??0)+1;return true;}
/** Authored workshop/canonical builds; a new campaign leaves the choices to the player. */
export function presetSkills(hero:CompanionId,level:number,priority:readonly SkillId[]=[]):SkillRanks{
 const ranks=startingSkills(hero);
 for(const id of priority)while(upgradeSkill(hero,level,ranks,id)){/* allocate the selected review skill first */}
 for(let rank=1;rank<=3;rank++)for(const s of SKILLS[hero])if((ranks[s.id]??0)<rank)upgradeSkill(hero,level,ranks,s.id);
 return ranks;
}
export const skillAbilities=(hero:CompanionId,ranks:SkillRanks):AbilityId[]=>['strike',...SKILLS[hero].filter(s=>s.levels[0]===1&&(ranks[s.id]??0)>0).map(s=>s.id),'bandage',...SKILLS[hero].filter(s=>s.levels[0]!==1&&(ranks[s.id]??0)>0).map(s=>s.id),...Object.values(ABILITIES).filter(a=>{const solo=teamSolo(hero,a.id);return solo&&(ranks[solo as SkillId]??0)>0;}).map(a=>a.id)];
export function abilityFor(u:{kind:string;skills?:SkillRanks;improvements?:{heal?:boolean;bash?:boolean}},id:AbilityId,partner?:{kind:string;skills?:SkillRanks;improvements?:{heal?:boolean;bash?:boolean}}):Ability{
 if(ABILITIES[id].team){
  const solo=teamSolo(u.kind,id),other=partner&&teamSolo(partner.kind,id),a=ABILITIES[id];
  const shot=id==='crossfire'?(u.kind==='kit'?abilityFor(u,'ricochet'):partner?.kind==='kit'?abilityFor(partner,'ricochet'):undefined):undefined;
  const vanguard=id==='daybreak'?[u,partner].find(v=>v?.kind==='petra'):undefined,ward=vanguard?abilityFor(vanguard,'taunt').ward:undefined;
  const courier=id==='lanternvolley'?[u,partner].find(v=>v?.kind==='kit'):undefined;
  const volleyRank=id==='lanternvolley'?Math.max(1,Math.min(3,courier?.skills?.pin??1)):undefined;
  return {...a,description:a.description+(id==='daybreak'?' Healing and barriers retain 90% of solo strength, rounded down.':' Deals 90% of the combined solo damage, rounded down.'),...(solo&&other?{power:teamOutput(abilityFor(u,solo).power+abilityFor(partner!,other).power)}:{}),...(shot?{range:shot.range,bounceRange:shot.bounceRange}: {}),...(ward?{ward}:{}),...(volleyRank?{volleyRank,description:`Lantern burst + Pinning shot: lantern-lit bolts cover ${[7,10,12][volleyRank-1]} hexes, hitting enemies only. Coverage follows Kit’s Pinning shot skill (7 / 10 / 12 hexes). Range 5; rocks block the aim. Deals 90% of the combined solo damage. Both fighters spend their action and 3 focus.`}:{})};
 }
 const s=u.skills&&SKILLS[u.kind as CompanionId]?.find(s=>s.id===id);if(!s)return ABILITIES[id];
 const rank=u.skills![s.id]??0;
 const a={...ABILITIES[id],...s.ranks[Math.max(0,rank-1)],rank};
 if(id==='heal'&&u.improvements?.heal){a.range++;a.description=a.description.replace(/Range \d+\./,`Range ${a.range}.`)+` Calibrated focus: range ${a.range}.`;}
 if(id==='bash'&&u.improvements?.bash)a.description+=' Recovery drill: grants 4 Guard without stacking.';
 return a;
}
export function decodeSkillRanks(raw:unknown,hero:CompanionId,level:number):SkillRanks{
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length!==SKILLS[hero].length)throw new Error('Invalid character skills.');
 const ranks=raw as SkillRanks,result:SkillRanks={};let spent=0;
 for(const s of SKILLS[hero]){
  const r=ranks[s.id];if(typeof r!=='number'||!Number.isInteger(r)||r<0||r>s.ranks.length||s.levels[0]===1&&r<1||r>0&&s.levels[r-1]>level)throw new Error('Invalid skill level.');
  result[s.id]=r;spent+=Math.max(0,r-(s.levels[0]===1?1:0));
 }
 if(spent>level-1)throw new Error('Too many skill upgrades.');return result;
}
export function decodeSkillBook(raw:unknown,level:number):SkillBook{
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||Object.keys(raw).length!==COMPANION_IDS.length)throw new Error('Invalid skill book.');
 return Object.fromEntries(COMPANION_IDS.map(id=>[id,decodeSkillRanks((raw as SkillBook)[id],id,level)]))as SkillBook;
}
