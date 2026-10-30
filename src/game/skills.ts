import {improved} from '../rules/improvements';
import {CHARACTERS} from '../content/characters';
import {heroAvailable} from '../rules/availability';
import {level,partyLeader,type GameState} from '../rules/state';
import {ABILITIES,teamSolo} from '../rules/abilities';
import {SKILLS,abilityFor,skillChanges,skillProgress,skillsAtLevel,type SkillBook,type SkillRanks} from '../rules/skills';
import type {CompanionId} from '../rules/party';
import {art,type UI} from './ui';
import './skills.css';

const shapes={ring:'Six surrounding hexes',single:'One target',blast:'Seven-hex area',spread:'Growing lantern volley',quad:'Slanted four-hex area',line:'Straight ray',diagonal:'Spaced hex-diagonal ray',axis:'Full-width team axis',party:'Living party',bounce:'Two-enemy ricochet',pattern:'Announced area'};
export function skillCards(hero:CompanionId,characterLevel:number,ranks:SkillRanks,esc:(s:unknown)=>string,known:readonly CompanionId[]=[hero],improvements:{heal?:boolean;bash?:boolean}={},partners?:Partial<SkillBook>){
 const progress=skillProgress(hero,characterLevel);
 return `<div class="skill-summary"><strong>${progress.mastered?'All skills mastered':'Automatic progression'}</strong><span>${progress.mastered?'Every skill is at its maximum rank.':`Next improvement at character level ${progress.nextLevel}.`}</span></div><div class="skill-cards">${SKILLS[hero].map(s=>{
  const rank=ranks[s.id]??0,current=abilityFor({kind:hero,skills:ranks,improvements},s.id),next=rank<s.ranks.length?abilityFor({kind:hero,skills:{...ranks,[s.id]:rank+1},improvements},s.id):undefined;
  const stats=(a:typeof current)=>`${shapes[a.shape]}${a.power>0?` · ${a.heal?'Healing':a.effect==='guard'?'Guard':'Power'} ${a.power}`:''} · ${a.cost} focus`;
  const combinations=Object.values(ABILITIES).filter(a=>rank>0&&a.team&&teamSolo(hero,a.id)===s.id&&a.team.pair.every(id=>known.includes(id as CompanionId)&&(partners?.[id as CompanionId]??skillsAtLevel(id as CompanionId,characterLevel))[teamSolo(id,a.id) as keyof SkillRanks]!>0)).map(a=>{const other=a.team!.pair.find(id=>id!==hero)as CompanionId,solo=teamSolo(other,a.id)!;return `Team: ${a.name} · ${CHARACTERS[other].name}’s ${ABILITIES[solo].name}.${a.id==='lanternvolley'?' Pinning shot ranks: 7 / 10 / 12 hexes.':''}`;});
  return `<article class="skill-card" data-ability="${s.id}"><div class="skill-card-heading"><h3>${esc(ABILITIES[s.id].name)}</h3><small>${rank?`Skill ${rank} / ${s.ranks.length}`:'Not learned'}</small></div>${rank?`<details class="skill-current"><summary>Current · ${esc(stats(current))}</summary><p>${esc(current.description)}</p></details>`:''}${next?`<div class="skill-next"><small>${rank?`Rank ${rank+1}`:'Learns'} at level ${s.levels[rank]}</small><p>${esc(next.description)}</p><p class="skill-stats">${esc(stats(next))}</p></div>`:'<p class="skill-stats">Mastered</p>'}${combinations.map(text=>`<p class="skill-combination">${esc(text)}</p>`).join('')}</article>`;
 }).join('')}</div>`;
}
/** Messages name recruited, available companions only; all reserves still gain their ranks. */
export function skillMessages(state:GameState,previousLevel:number):string[]{
 return state.party.filter(p=>heroAvailable(state,p.id)&&(p.id!=='nell'||!state.flags.nellLost)).flatMap(p=>skillChanges(p.id,previousLevel,level(state)).map(change=>change.rank===1?`${CHARACTERS[p.id].name} learns ${ABILITIES[change.id].name}.`:`${CHARACTERS[p.id].name}’s ${ABILITIES[change.id].name} reaches rank ${change.rank}.`));
}
export function openSkills(ui:UI,state:GameState,initial?:CompanionId){
 let hero=initial??partyLeader(state);ui.showModal('Character skills','<section class="character-skills"></section>');
 const target=ui.modal.querySelector<HTMLElement>('.character-skills')!,esc=ui.escape;
 const render=()=>{
  target.innerHTML=`<div class="skill-characters" role="group" aria-label="Character">${state.party.map(p=>`<button data-hero="${p.id}" aria-pressed="${p.id===hero}">${esc(CHARACTERS[p.id].name)}${skillProgress(p.id,level(state)).mastered?' · Mastered':''}</button>`).join('')}</div><div class="skill-identity"><img src="${art(CHARACTERS[hero].portrait)}" alt="${esc(CHARACTERS[hero].name)}"/><div><h2>${esc(CHARACTERS[hero].name)}</h2><p>Character level ${level(state)}</p></div></div>${skillCards(hero,level(state),state.skills[hero],esc,state.party.map(p=>p.id),{heal:hero==='celia'&&improved(state,'celia-sight'),bash:hero==='petra'&&improved(state,'petra-recovery')},state.skills)}`;
  for(const button of target.querySelectorAll<HTMLButtonElement>('[data-hero]'))button.onclick=()=>{hero=button.dataset.hero as CompanionId;render();};
 };render();
}
