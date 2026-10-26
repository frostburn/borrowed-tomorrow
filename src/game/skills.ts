import {CHARACTERS} from '../content/characters';
import {heroAvailable} from '../rules/availability';
import {level,partyLeader,type GameState} from '../rules/state';
import {ABILITIES,teamSolo} from '../rules/abilities';
import {SKILLS,abilityFor,skillPoints,upgradeReason,upgradeSkill,type SkillId,type SkillRanks} from '../rules/skills';
import type {CompanionId} from '../rules/party';
import {art,type UI} from './ui';
import './skills.css';

const shapes={single:'One target',blast:'Seven-hex area',spread:'Twelve-hex volley',quad:'Slanted four-hex area',line:'Straight ray',diagonal:'Spaced hex-diagonal ray',axis:'Full-width team axis',party:'Living party',bounce:'Two-enemy ricochet',pattern:'Announced area'};
export function skillCards(hero:CompanionId,characterLevel:number,ranks:SkillRanks,esc:(s:unknown)=>string,disabled=false,known:readonly CompanionId[]=[hero]){
 return `<div class="skill-summary"><strong>${skillPoints(hero,characterLevel,ranks)} upgrade point${skillPoints(hero,characterLevel,ranks)===1?'':'s'}</strong><span>One point per character level gained. You may save points.</span></div><div class="skill-cards">${SKILLS[hero].map(s=>{
  const rank=ranks[s.id]??0,current=abilityFor({kind:hero,skills:ranks},s.id),next=rank<s.ranks.length?abilityFor({kind:hero,skills:{...ranks,[s.id]:rank+1}},s.id):undefined;
  const reason=upgradeReason(hero,characterLevel,ranks,s.id),stats=(a:typeof current)=>`${shapes[a.shape]}${a.power>0?` · ${a.heal?'Healing':a.effect==='guard'?'Guard':'Power'} ${a.power}`:''} · ${a.cost} focus`;
  const combinations=Object.values(ABILITIES).filter(a=>a.team&&teamSolo(hero,a.id)===s.id&&a.team.pair.every(id=>known.includes(id as CompanionId))).map(a=>{const other=a.team!.pair.find(id=>id!==hero)as CompanionId,solo=teamSolo(other,a.id)!;return `${a.name}: combines with ${CHARACTERS[other].name}’s ${ABILITIES[solo].name}. Available when both solo skills are learned; no separate upgrade.`;});
  return `<article class="skill-card" data-ability="${s.id}"><h3>${esc(ABILITIES[s.id].name)} <small>Skill ${rank} / ${s.ranks.length}</small></h3><p>${rank?esc(current.description):`Learn at character level ${s.levels[0]}.`}</p>${rank?`<p class="skill-stats">${esc(stats(current))}</p>`:''}${next?`<div class="skill-next"><small>Next: skill ${rank+1} · character level ${s.levels[rank]}</small><p>${esc(next.description)}</p><p class="skill-stats">${esc(stats(next))}</p></div>`:''}${combinations.map(text=>`<p class="skill-combination">${esc(text)}</p>`).join('')}<button data-skill="${s.id}" ${reason||disabled?'disabled':''}>${!next?'Mastered':rank?`Upgrade ${esc(ABILITIES[s.id].name)} to ${rank+1}`:`Learn ${esc(ABILITIES[s.id].name)}`}</button><small class="skill-reason">${esc(disabled?'Unavailable':reason??'Costs 1 upgrade point.')}</small></article>`;
 }).join('')}</div>`;
}
export function openSkills(ui:UI,state:GameState,changed:()=>void,initial:CompanionId=partyLeader(state)){
 let hero=initial,message='';ui.showModal('Character skills','<section class="character-skills"></section>');
 const target=ui.modal.querySelector<HTMLElement>('.character-skills')!,esc=ui.escape;
 const render=()=>{
  target.innerHTML=`<div class="skill-characters" role="group" aria-label="Character">${state.party.map(p=>`<button data-hero="${p.id}" aria-pressed="${p.id===hero}">${esc(CHARACTERS[p.id].name)} · ${skillPoints(p.id,level(state),state.skills[p.id])}</button>`).join('')}</div><div class="skill-identity"><img src="${art(CHARACTERS[hero].portrait)}" alt="${esc(CHARACTERS[hero].name)}"/><div><h2>${esc(CHARACTERS[hero].name)}</h2><p>Character level ${level(state)}</p></div></div>${skillCards(hero,level(state),state.skills[hero],esc,hero==='nell'&&!!state.flags.nellLost,state.party.map(p=>p.id))}<p role="status">${esc(message)}</p>`;
  for(const button of target.querySelectorAll<HTMLButtonElement>('[data-hero]'))button.onclick=()=>{hero=button.dataset.hero as CompanionId;message='';render();};
  for(const button of target.querySelectorAll<HTMLButtonElement>('[data-skill]'))button.onclick=()=>{
   const id=button.dataset.skill as SkillId;if(hero==='nell'&&state.flags.nellLost)return;
   if(upgradeSkill(hero,level(state),state.skills[hero],id)){message=`${ABILITIES[id].name} upgraded to skill ${state.skills[hero][id]}.`;changed();render();}
  };
 };render();
}
export const pendingSkillPoints=(state:GameState)=>state.party.filter(p=>heroAvailable(state,p.id)).reduce((sum,p)=>sum+skillPoints(p.id,level(state),state.skills[p.id]),0);
