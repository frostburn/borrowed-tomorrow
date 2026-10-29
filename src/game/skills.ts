import {improved} from '../rules/improvements';
import {CHARACTERS} from '../content/characters';
import {heroAvailable} from '../rules/availability';
import {level,partyLeader,type GameState} from '../rules/state';
import {ABILITIES,teamSolo} from '../rules/abilities';
import {SKILLS,abilityFor,skillProgress,upgradeReason,upgradeSkill,type SkillId,type SkillRanks} from '../rules/skills';
import type {CompanionId} from '../rules/party';
import {art,type UI} from './ui';
import './skills.css';

const shapes={ring:'Six surrounding hexes',single:'One target',blast:'Seven-hex area',spread:'Growing lantern volley',quad:'Slanted four-hex area',line:'Straight ray',diagonal:'Spaced hex-diagonal ray',axis:'Full-width team axis',party:'Living party',bounce:'Two-enemy ricochet',pattern:'Announced area'};
export function skillCards(hero:CompanionId,characterLevel:number,ranks:SkillRanks,esc:(s:unknown)=>string,disabled=false,known:readonly CompanionId[]=[hero],improvements:{heal?:boolean;bash?:boolean}={}){
 const progress=skillProgress(hero,characterLevel,ranks),banked=progress.points>0&&!progress.spendable;
 const title=progress.mastered?'All skills mastered':`${progress.points} ${banked?'banked':'upgrade'} point${progress.points===1?'':'s'}`;
 const detail=progress.mastered?'Every skill is at its maximum rank.':progress.nextLevel?`Next upgrade available at character level ${progress.nextLevel}.`:progress.spendable<progress.points?`${progress.spendable} can be spent now; the rest are banked for later levels.`:'Spend on an available skill, or save for later.';
 return `<div class="skill-summary"><strong>${title}</strong><span>${detail}</span></div><div class="skill-cards">${SKILLS[hero].map(s=>{
  const rank=ranks[s.id]??0,current=abilityFor({kind:hero,skills:ranks,improvements},s.id),next=rank<s.ranks.length?abilityFor({kind:hero,skills:{...ranks,[s.id]:rank+1},improvements},s.id):undefined;
  const reason=upgradeReason(hero,characterLevel,ranks,s.id),stats=(a:typeof current)=>`${shapes[a.shape]}${a.power>0?` · ${a.heal?'Healing':a.effect==='guard'?'Guard':'Power'} ${a.power}`:''} · ${a.cost} focus`;
  const combinations=Object.values(ABILITIES).filter(a=>a.team&&teamSolo(hero,a.id)===s.id&&a.team.pair.every(id=>known.includes(id as CompanionId))).map(a=>{const other=a.team!.pair.find(id=>id!==hero)as CompanionId,solo=teamSolo(other,a.id)!;return `Team: ${a.name} · ${CHARACTERS[other].name}’s ${ABILITIES[solo].name}.${a.id==='lanternvolley'?' Pinning shot ranks: 7 / 10 / 12 hexes.':''}`;});
  const action=!next?'Mastered':rank?`Upgrade ${ABILITIES[s.id].name} to ${rank+1}`:`Learn ${ABILITIES[s.id].name}`;
  return `<article class="skill-card" data-ability="${s.id}"><div class="skill-card-heading"><h3>${esc(ABILITIES[s.id].name)}</h3><small>Skill ${rank} / ${s.ranks.length}</small></div>${rank?`<details class="skill-current"><summary>Current · ${esc(stats(current))}</summary><p>${esc(current.description)}</p></details>`:''}${next?`<div class="skill-next"><small>Next: ${rank+1} · level ${s.levels[rank]}</small><p>${esc(next.description)}</p><p class="skill-stats">${esc(stats(next))}</p></div>`:''}${combinations.map(text=>`<p class="skill-combination">${esc(text)}</p>`).join('')}<div class="skill-purchase"><button data-skill="${s.id}" aria-label="${esc(action)}" ${reason||disabled?'disabled':''}>${!next?'Mastered':rank?`Upgrade · ${rank+1}`:'Learn'}</button><small class="skill-reason">${esc(disabled?'Unavailable':reason??'1 point')}</small></div></article>`;
 }).join('')}</div>`;
}
export function openSkills(ui:UI,state:GameState,changed:()=>void,initial?:CompanionId){
 let hero=initial??state.party.find(p=>heroAvailable(state,p.id)&&skillProgress(p.id,level(state),state.skills[p.id]).spendable)?.id??partyLeader(state),message='';ui.showModal('Character skills','<section class="character-skills"></section>');
 const target=ui.modal.querySelector<HTMLElement>('.character-skills')!,esc=ui.escape;
 const render=()=>{
  target.innerHTML=`<div class="skill-characters" role="group" aria-label="Character">${state.party.map(p=>{const progress=skillProgress(p.id,level(state),state.skills[p.id]);return `<button data-hero="${p.id}" aria-pressed="${p.id===hero}">${esc(CHARACTERS[p.id].name)} · ${progress.mastered?'Mastered':`${progress.points}${progress.points&&!progress.spendable?' banked':''}`}</button>`;}).join('')}</div><div class="skill-identity"><img src="${art(CHARACTERS[hero].portrait)}" alt="${esc(CHARACTERS[hero].name)}"/><div><h2>${esc(CHARACTERS[hero].name)}</h2><p>Character level ${level(state)}</p></div></div>${skillCards(hero,level(state),state.skills[hero],esc,hero==='nell'&&!!state.flags.nellLost,state.party.map(p=>p.id),{heal:hero==='celia'&&improved(state,'celia-sight'),bash:hero==='petra'&&improved(state,'petra-recovery')})}<p role="status">${esc(message)}</p>`;
  for(const button of target.querySelectorAll<HTMLButtonElement>('[data-hero]'))button.onclick=()=>{hero=button.dataset.hero as CompanionId;message='';render();};
  for(const button of target.querySelectorAll<HTMLButtonElement>('[data-skill]'))button.onclick=()=>{
   const id=button.dataset.skill as SkillId;if(hero==='nell'&&state.flags.nellLost)return;
   if(upgradeSkill(hero,level(state),state.skills[hero],id)){message=`${ABILITIES[id].name} upgraded to skill ${state.skills[hero][id]}.`;changed();render();}
  };
 };render();
}
export const availableSkillPoints=(state:GameState)=>state.party.filter(p=>heroAvailable(state,p.id)).reduce((sum,p)=>sum+skillProgress(p.id,level(state),state.skills[p.id]).spendable,0);
