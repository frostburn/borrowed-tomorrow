import {ENDING_FILMS,endingShotStart,type EndingKind} from '../content/ending-film';
import {paintEndingFilm} from '../game/ending-art';
import {BOSS_CHOICES,campaignBoss,createCampaignBoss,workshopBoss,type WorkshopBoss} from './boss-catalog';
import {campaignBossPortrait,campaignBossPresentation,loadCampaignBoss} from './campaign-boss-preview';
import {icon} from '../game/item-icons';
import {itemIcon} from '../content/ui-art';
import '../game/item-icons.css';
import {skillCards} from '../game/skills';
import {startingSkills,upgradeSkill,type SkillId} from '../rules/skills';
import {richCombatPreview,type CombatPreset} from './rich-combat';
import {benefactorCampaignPreview} from './benefactor-campaign-preview';
import { createImperialPreview,IMPERIAL_PREVIEW_ASSETS,IMPERIAL_PRESENTATIONS } from './imperial-preview';
import { imperialPortrait } from '../game/imperial-presentation';
import { createDragonPreview,DRAGON_PRESENTATION,DRAGON_PREVIEW_ASSETS } from './winter-dragon-preview';
import { DRAGON_PORTRAIT } from '../game/winter-dragon-presentation';
import { createSerpentPreview,SERPENT_PRESENTATION,SERPENT_PREVIEW_ASSETS } from './sun-serpent-preview';
import { SERPENT_PORTRAIT } from '../game/sun-serpent-presentation';
import { MAX_LEVEL } from '../rules/progression';
import { FLAGSHIP_ASSETS, FLAGSHIP_PRESENTATION, FLAGSHIP_PORTRAIT } from './flagship-preview';
import { createFlagshipBattle } from './flagship-battle';
import { BOSS_ASSETS, BOSS_PRESENTATION, BOSS_PORTRAIT } from './boss-preview';
import { createBossBattle } from './boss-battle';
import { CONDUIT_ASSETS, CONDUIT_PORTRAIT, conduitPresentation } from '../game/conduit-presentation';
import { createConduitBattle, CONDUIT_ENCOUNTERS } from './conduit-battle';
import type { ConduitRoute } from '../content/chapter-three/regulator';
import { MusicWorkshop } from './music-workshop';
import { SpriteWorkshop } from './sprite-workshop';
import { AnimationWorkshop } from './animation-workshop';
import { MapWorkshop } from './map-workshop';
import { Adventure } from '../game/adventure';
import { mountGame } from '../game/mount';
import { art, type UI } from '../game/ui';
import { ABILITIES, createBattle, type Unit } from '../rules/combat';
import { newGame, recruitOrrin } from '../rules/state';
import { ITEMS, SLOTS, canEquip, decodeInventory, equipmentBonuses, equipItem, newInventory, ownedCopies, receiveItem, unequipItem, type Inventory, type ItemId } from '../rules/inventory';
import { COMPANION_IDS, COMPANIONS, STAT_LIMITS, setPartyMember, type CompanionId, characterProfiles, decodeCharacterSettings, defaultBuild, newCharacterSettings, validStat, type CharacterStat } from '../rules/characters';
import { CHARACTERS } from '../content/characters';
import { MAX_PARTY_SIZE } from '../rules/party';
import './workshop.css';

const STORAGE = 'borrowed-tomorrow:inventory-workshop:v1';
const CHARACTER_STORAGE = 'borrowed-tomorrow:character-workshop:v3';
const names = Object.fromEntries(COMPANION_IDS.map(id=>[id,CHARACTERS[id].name])) as Record<CompanionId,string>;
function stock(): Inventory {
  const inventory = newInventory();
  for (const item of Object.keys(ITEMS) as ItemId[]) receiveItem(inventory, item, item === 'work-coat' ? MAX_PARTY_SIZE : 1);
  return inventory;
}
function practiceState() {
  const state = newGame(); recruitOrrin(state); state.coins = 0; return state;
}
class Workshop {
  private inventory = stock();
  private settings = newCharacterSettings();
  private music: MusicWorkshop;
  private sprites = new SpriteWorkshop();
  private animation = new AnimationWorkshop();
  private maps = new MapWorkshop(message=>this.ui.toast(message));
  private tab: 'combat' | 'character' | 'equipment' | 'music' | 'sprites' | 'animation' | 'maps' | 'bosses' | 'cinematics' = new URLSearchParams(location.search).get('dev') === 'cinematics' ? 'cinematics' : new URLSearchParams(location.search).get('dev') === 'combat' ? 'combat' : new URLSearchParams(location.search).get('dev') === 'boss' ? 'bosses' : new URLSearchParams(location.search).get('dev') === 'inventory' ? 'equipment' : new URLSearchParams(location.search).get('dev') === 'music' ? 'music' : new URLSearchParams(location.search).get('dev') === 'sprites' ? 'sprites' : new URLSearchParams(location.search).get('dev') === 'animation' ? 'animation' : new URLSearchParams(location.search).get('dev') === 'maps' ? 'maps' : 'character';
  private endingShot=0;
  private endingKind:EndingKind='good';
  private hero: CompanionId = 'nell';
  private boss:WorkshopBoss=workshopBoss(new URLSearchParams(location.search).get('boss'));
  private loadingBoss=false;
  private bossRequest=0;
  private conduitRoute:ConduitRoute=new URLSearchParams(location.search).get('route')==='pressure'?'pressure':'feeds';
  private selected: ItemId = 'brass-reflector';
  private message = 'Choose a character to adjust their build.';
  constructor(private scene: Adventure, private ui: UI) {
    try { const stored = localStorage.getItem(STORAGE); if (stored) this.inventory = decodeInventory(stored); }
    catch { this.message = 'Stored workshop inventory was unavailable. Starting with fresh equipment.'; }
    try { const stored = localStorage.getItem(CHARACTER_STORAGE); if(stored) this.settings = decodeCharacterSettings(stored); } catch { this.message = 'Stored character settings were unavailable. Using level defaults.'; }
    document.getElementById('inventory-button')!.hidden = true;
    document.title = 'Borrowed Tomorrow · Character workshop';
    document.querySelector('.game-shell')!.classList.add('character-workshop');
    document.querySelector('.brand h1')!.textContent = 'Character workshop';
    document.getElementById('journal-button')!.textContent = 'Workshop';
    document.getElementById('save-button')!.textContent = 'Test battle';
    document.getElementById('help-button')!.setAttribute('aria-label', 'Workshop help');
    this.ui.location('Vite development');
    this.scene.state = practiceState();
    this.music=new MusicWorkshop(this.scene.audio,on=>this.ui.sound(on),message=>this.ui.toast(message));
    this.show();
  }
  private save(message: string) {
    this.message = message;
    try { localStorage.setItem(STORAGE, JSON.stringify(this.inventory)); localStorage.setItem(CHARACTER_STORAGE, JSON.stringify(this.settings)); }
    catch { this.message += ' This browser could not store the workshop changes.'; }
    this.show();
  }
  private combatant(hero: CompanionId, inventory = this.inventory) {
    return createBattle('workshop', practiceState(), equipmentBonuses(inventory),characterProfiles(this.settings),[hero]).units[0];
  }
  private characterPanel() {
    const hero=this.hero,build=this.settings.characters[hero];
    const labels:Record<CharacterStat,string>={maxHp:'Max HP',attack:'Attack',armor:'Armor',speed:'Speed',movement:'Movement',focus:'Starting focus'};
    const fields=(Object.keys(STAT_LIMITS) as CharacterStat[]).map(stat=>{
      const [min,max]=STAT_LIMITS[stat];
      return `<div class="workshop-stat-field"><label for="stat-${stat}">${labels[stat]}</label><button type="button" data-step="${stat}" data-delta="-1" aria-label="Decrease ${names[hero]} ${labels[stat]}">−</button><input id="stat-${stat}" aria-label="${names[hero]} ${labels[stat]}" name="${stat}" type="number" min="${min}" max="${max}" step="1" value="${build[stat]}" required/><button type="button" data-step="${stat}" data-delta="1" aria-label="Increase ${names[hero]} ${labels[stat]}">+</button></div>`;
    }).join('');
    return `<section class="workshop-build" aria-label="Character settings"><h2>Character settings</h2><div class="workshop-level"><label for="character-level">Level</label><button data-level="-1" aria-label="Decrease ${names[hero]} level" ${build.level===1?'disabled':''}>−</button><input id="character-level" type="number" min="1" max="${MAX_LEVEL}" step="1" value="${build.level}" aria-label="${names[hero]} level"/><button data-level="1" aria-label="Increase ${names[hero]} level" ${build.level===MAX_LEVEL?'disabled':''}>+</button></div><p class="inv-note">Changing level restores base stats and a balanced skill build. Reset skill choices to allocate points manually. Equipment stays equipped.</p><form id="character-stats" novalidate><h3>Base stats</h3>${fields}<button type="submit">Apply base stats</button><button type="button" id="level-defaults">Level defaults</button></form><p class="inv-note">Equipment bonuses are added to these values. Starting focus regenerates on a character’s turn.</p></section><section class="workshop-abilities" aria-label="Level abilities"><h2>Abilities</h2>${skillCards(hero,build.level,build.skills,this.ui.escape,false,COMPANION_IDS)}<button id="reset-skills">Reset skill choices</button></section>`;
  }
  private bindCharacterPanel() {
    if(this.tab!=='character')return;
    const hero=this.hero;
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-skill]'))button.onclick=()=>{const build=this.settings.characters[hero];if(upgradeSkill(hero,build.level,build.skills,button.dataset.skill as SkillId))this.save('Skill upgraded.');};
    this.ui.sceneLayer.querySelector<HTMLButtonElement>('#reset-skills')!.onclick=()=>{this.settings.characters[hero].skills=startingSkills(hero);this.save('Skill choices reset.');};
    const levelInput=this.ui.sceneLayer.querySelector<HTMLInputElement>('#character-level')!;
    const changeLevel=(level:number)=>{
      if(!Number.isInteger(level)||level<1||level>MAX_LEVEL){this.message=`Level must be a whole number from 1 to ${MAX_LEVEL}.`;this.show();return;}
      this.settings.characters[hero]=defaultBuild(hero,level);this.save(`${names[hero]} set to level ${level}.`);
    };
    levelInput.onchange=()=>changeLevel(levelInput.value===''?NaN:Number(levelInput.value));
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-level]'))button.onclick=()=>changeLevel(this.settings.characters[hero].level+Number(button.dataset.level));
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-step]'))button.onclick=()=>{
      const stat=button.dataset.step as CharacterStat,input=this.ui.sceneLayer.querySelector<HTMLInputElement>(`#stat-${stat}`)!;
      const [min,max]=STAT_LIMITS[stat];input.value=String(Math.max(min,Math.min(max,Number(input.value)+Number(button.dataset.delta))));input.dispatchEvent(new Event('input',{bubbles:true}));
    };
    this.ui.sceneLayer.querySelector<HTMLFormElement>('#character-stats')!.onsubmit=event=>{
      event.preventDefault();const build={...this.settings.characters[hero]};
      for(const stat of Object.keys(STAT_LIMITS) as CharacterStat[]){
        const input=this.ui.sceneLayer.querySelector<HTMLInputElement>(`#stat-${stat}`)!,value=input.value===''?NaN:Number(input.value);
        if(!validStat(stat,value)){const [min,max]=STAT_LIMITS[stat];this.ui.toast(`${input.getAttribute('aria-label')} must be a whole number from ${min} to ${max}.`);input.focus();return;}
        build[stat]=value;
      }
      this.settings.characters[hero]=build;this.save(`${names[hero]} base stats saved.`);
    };
    this.ui.sceneLayer.querySelector<HTMLButtonElement>('#level-defaults')!.onclick=()=>{this.settings.characters[hero]=defaultBuild(hero,this.settings.characters[hero].level);this.save(`${names[hero]} restored to level defaults.`);};
  }
  show() {
    if(this.tab==='combat'){this.showCombat();return;}
    this.sprites.hide();
    this.animation.hide();
    this.maps.hide();
    if(this.tab==='cinematics'){this.showCinematics();return;}
    if(this.tab==='bosses'){this.showBosses();return;}
    if(this.tab==='maps'){this.showMaps();return;}
    if(this.tab==='animation'){this.showAnimation();return;}
    if(this.tab==='sprites'){this.showSprites();return;}
    if(this.tab==='music'){this.showMusic();return;}
    this.music.hide();
    const scroll = this.ui.sceneLayer.querySelector('.inventory-panel')?.scrollTop ?? 0;
    this.scene.closePreview();
    document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled = false;
    this.ui.initiative.textContent = 'Character levels · Base stats · Equipment · Abilities';
    const hero = this.hero, esc = this.ui.escape, current = this.combatant(hero);
    const selected = ITEMS[this.selected], equipped = this.inventory.characters[hero];
    const trial = structuredClone(this.inventory);
    const changed = equipItem(trial, hero, this.selected);
    const next = this.combatant(hero,trial);
    const stats: [string, (u: Unit) => number][] = [['Attack', u => ABILITIES.strike.power + u.bonus], ['Armor', u => u.armor], ['Speed', u => u.speed]];
    const comparison = stats.map(([label, value]) => {
      const delta = value(next) - value(current);
      return `<div class="inv-stat"><span>${label}</span><span>${value(current)}${changed ? ` → ${value(next)}` : ''}</span><small class="${delta > 0 ? 'gain' : delta < 0 ? 'loss' : ''}">${delta > 0 ? '+' : ''}${delta || '—'}</small></div>`;
    }).join('');
    const items = (Object.keys(ITEMS) as ItemId[]).map(id => {
      const item = ITEMS[id], holders = COMPANION_IDS.filter(h => Object.values(this.inventory.characters[h]).includes(id));
      const compatible=canEquip(hero,id);
      return `<button class="inv-item${id === this.selected ? ' selected' : ''}${compatible?'':' incompatible'}" data-item="${id}" aria-pressed="${id === this.selected}" ${compatible?'':`aria-description="${names[hero]} cannot use this item."`}><span class="icon-label">${icon(itemIcon(id))}<span>${esc(item.name)}</span></span><small>${this.inventory.bag[id] ?? 0} in bag${holders.length ? ` · ${holders.map(h => names[h]).join(', ')}` : ''}</small></button>`;
    }).join('');
    this.ui.sceneLayer.innerHTML = `<section class="inventory-panel" aria-label="Character workshop">
      <div class="inv-characters" role="group" aria-label="Character">${COMPANION_IDS.map(id=>`<button data-hero="${id}" aria-label="${names[id]}" aria-pressed="${hero===id}" class="${hero===id?'selected':''}">${names[id]}<small>${this.settings.party.includes(id)?'Party':'Reserve'}</small></button>`).join('')}</div>
      <div class="workshop-navigation">${this.tabs()}<section class="workshop-party" aria-label="Practice party"><div><small>Practice party · ${this.settings.party.length} / ${MAX_PARTY_SIZE}</small><p>${this.settings.party.map(id=>names[id]).join(' · ')}</p></div><button id="party-toggle" ${this.settings.party.includes(hero)?this.settings.party.length===1?'disabled':'':this.settings.party.length===MAX_PARTY_SIZE?'disabled':''}>${this.settings.party.includes(hero)?`Remove ${names[hero]} from party`:`Add ${names[hero]} to party`}</button>${!this.settings.party.includes(hero)&&this.settings.party.length===MAX_PARTY_SIZE?'<p class="party-full">Party full. Remove a member first.</p>':''}</section></div>
      <div class="inv-columns ${this.tab === 'character' ? 'character-columns' : ''}"><section class="inv-character" aria-label="${names[hero]} equipment">
        <div class="inv-identity"><img src="${art(CHARACTERS[hero].portrait)}" alt="${names[hero]}"/><div><h2>${names[hero]} · Lv ${this.settings.characters[hero].level}</h2><small>${COMPANIONS[hero].tool}</small><p class="inv-biography">${COMPANIONS[hero].role} · Chapter ${COMPANIONS[hero].chapter}<br/>${esc(COMPANIONS[hero].description)}</p><p class="inv-hp">HP ${current.maxHp} · Move ${current.movement}</p></div></div>
        <div class="inv-current-stats">${stats.map(([label, value]) => `<div><small>${label}</small><p>${value(current)}</p></div>`).join('')}</div>
        <h3>Equipped</h3>${SLOTS.map(slot => `<div class="inv-slot"><small>${slot === 'fitting' ? 'Tool fitting' : 'Coat'}</small><p>${equipped[slot] ? `<span class="icon-label">${icon(itemIcon(equipped[slot]!))}<span>${esc(ITEMS[equipped[slot]!].name)}</span></span>` : 'None'}</p><button data-unequip="${slot}" ${!equipped[slot] ? 'disabled' : ''}>Unequip ${slot === 'fitting' ? 'fitting' : 'coat'}</button></div>`).join('')}
      </section>${this.tab === 'character' ? this.characterPanel() : `<section class="inv-bag" aria-label="Shared bag"><h2>Shared bag</h2><div class="inv-items">${items}</div><p class="inv-note">An item stays in the bag until you equip it.</p></section>
      <section class="inv-details" aria-label="Item details"><small>${selected.slot === 'fitting' ? 'Tool fitting' : 'Coat'} · ${selected.heroes.map(h => names[h]).join(' / ')}</small><h2>${icon(itemIcon(this.selected))}${esc(selected.name)}</h2><p>${esc(selected.description)}</p><div class="inv-comparison" aria-label="Stat comparison">${comparison}</div><div id="inv-equip"></div><p class="inv-note">${!canEquip(hero, this.selected) ? `${names[hero]} cannot use this fitting.` : equipped[selected.slot] === this.selected ? 'Already equipped.' : !(this.inventory.bag[this.selected] ?? 0) ? 'No spare copy. Unequip it from its wearer first.' : equipped[selected.slot] ? `Replaces ${esc(ITEMS[equipped[selected.slot]!].name)}.` : ''}</p><div id="inv-receive"></div></section>`}</div>
      <div class="inv-footer"><div id="inv-tools"></div><p role="status">${esc(this.message)}</p></div>
    </section>`;
    this.bindCharacterPanel();
    this.ui.sceneLayer.querySelector<HTMLButtonElement>('#party-toggle')!.onclick=()=>{
      const included=!this.settings.party.includes(hero);
      if(setPartyMember(this.settings,hero,included))this.save(`${names[hero]} ${included?'added to':'removed from'} the practice party.`);
    };
    this.bindTabs();
    for (const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-hero]')) button.onclick = () => { this.hero = button.dataset.hero as CompanionId; this.show(); this.ui.sceneLayer.querySelector<HTMLButtonElement>(`[data-hero="${this.hero}"]`)!.focus({preventScroll:true}); };
    for (const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-item]')) button.onclick = () => { this.selected = button.dataset.item as ItemId; this.show(); this.ui.sceneLayer.querySelector<HTMLButtonElement>(`[data-item="${this.selected}"]`)!.focus({preventScroll:true}); };
    for (const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-unequip]')) button.onclick = () => { if (unequipItem(this.inventory, hero, button.dataset.unequip as typeof SLOTS[number])) this.save('Equipment returned to the bag.'); };
    if(this.tab === 'equipment'){
    this.ui.actionRow(this.ui.sceneLayer.querySelector('#inv-equip')!, [{ label: `Equip on ${names[hero]}`, disabled: !changed, action: () => { if (equipItem(this.inventory, hero, this.selected)) this.save(`${selected.name} equipped on ${names[hero]}.`); } }]);
    this.ui.actionRow(this.ui.sceneLayer.querySelector('#inv-receive')!, [{ label: 'Receive one copy', disabled: ownedCopies(this.inventory, this.selected) >= 99, action: () => { if (receiveItem(this.inventory, this.selected)) this.save(`${selected.name} added to the bag.`); } }]);
    }
    this.ui.actionRow(this.ui.sceneLayer.querySelector('#inv-tools')!, [{ label: 'Reset workshop', action: () => { this.inventory = stock(); this.settings = newCharacterSettings(); this.save('Workshop reset. Characters are level 1; equipment is in the bag.'); } }, { label: 'Return to story', action: () => { const url = new URL(location.href); url.searchParams.delete('dev'); location.assign(url); } }]);
    this.ui.status.textContent = 'Vite development · Workshop saved separately';
    this.ui.sceneLayer.querySelector('.inventory-panel')!.scrollTop = scroll;
  }
  private tabs(){
    return `<nav class="workshop-tabs" aria-label="Workshop panels">${(['character','combat','equipment','music','sprites','animation','maps','bosses','cinematics'] as const).map(tab=>`<button data-tab="${tab}" class="${this.tab===tab?'selected':''}" aria-pressed="${this.tab===tab}">${tab[0].toUpperCase()+tab.slice(1)}</button>`).join('')}</nav>`;
  }
  private bindTabs(){for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-tab]'))button.onclick=()=>{this.tab=button.dataset.tab as typeof this.tab;this.bossRequest++;this.show();};}
  private showCombat(){
    this.music.hide();this.sprites.hide();this.animation.hide();this.maps.hide();this.scene.closePreview();
    document.querySelector('.game-shell')!.classList.add('inventory-open');
    this.ui.sceneLayer.innerHTML=`<section class="inventory-panel" aria-label="Character workshop">${this.tabs()}<h2>Combat review</h2><p>New skills, shared turns and battlefield mechanisms use the campaign rules. Each preset changes only this practice battle.</p><p>Team moves need two living partners with attacks left and enough focus, anywhere on the battlefield. They spend both main actions; the assisting fighter keeps unused movement. Red X locks the guardian–crow relay one round before its even-round shot: defeat either machine to cancel it.</p><p>Break timber to open a route. Burst the pressure drum to hurt nearby fighters on either side. Strike the brass valve with any damaging attack to toggle the orange steam vents.</p><div id="combat-start" class="panel-actions"></div><p>The level-10 presets include Nell’s hex-diagonal ray, Orrin’s straight Steam lance, full-width team attacks, Ricochet, barriers and Celia’s final Heal. Daybreak pairs Celia’s Heal with Petra’s Taunt at level 13 with an injured party; Prism lance pairs Horizon light with Steam lance. Lantern volley pairs Lantern burst with Kit’s Pinning shot at levels 7 / 10 / 13, showing 7 / 10 / 12 hexes; Revive starts with Orrin down on a clear hex. The workshop option uses your current levels, equipment and formation.</p></section>`;
    this.bindTabs();this.ui.actionRow(this.ui.sceneLayer.querySelector('#combat-start')!,[
      ...(['rally-ring','rally-self','rally-party','prism','crossfire','stars','daybreak','lantern','lantern-wide','lantern-full','recovery']as CombatPreset[]).map(preset=>({label:`Practice ${preset==='rally-ring'?'Rallying cry I':preset==='rally-self'?'Rallying cry II':preset==='rally-party'?'Rallying cry III':preset==='prism'?'Prism lance':preset==='crossfire'?'Crossfire':preset==='stars'?'Falling stars':preset==='recovery'?'Revive':preset==='lantern'?'Lantern volley':preset==='lantern-wide'?'Lantern volley · 10 hexes':preset==='lantern-full'?'Lantern volley · 12 hexes':'Daybreak'}`,action:()=>this.combatBattle(preset)})),
      {label:'Practice current workshop party',action:()=>this.combatBattle('workshop')},
    ]);this.ui.initiative.textContent='Combat review / shared campaign rules';
  }
  private combatBattle(preset:CombatPreset|'workshop'){
    document.querySelector('.game-shell')!.classList.remove('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=true;
    this.scene.state=practiceState();const {battle,presentation}=richCombatPreview(preset,this.settings,this.inventory);
    this.scene.previewBattle(battle,()=>this.show(),presentation);
  }
  private showMusic(){
    this.scene.closePreview();document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=false;
    this.ui.initiative.textContent='Music review / 31-tone equal temperament';
    this.ui.sceneLayer.innerHTML=`<section class="inventory-panel" aria-label="Character workshop">${this.tabs()}<div id="music-workshop"></div></section>`;
    this.bindTabs();this.music.show(this.ui.sceneLayer.querySelector('#music-workshop')!);
    this.ui.status.textContent='Vite development / Music review does not change campaign saves';
  }
  private showSprites(){
    this.music.hide();this.scene.closePreview();document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=false;
    this.ui.initiative.textContent='Sprite review / Native artwork and ground anchors';
    this.ui.sceneLayer.innerHTML=`<section class="inventory-panel" aria-label="Character workshop">${this.tabs()}<div id="sprite-workshop"></div></section>`;
    this.bindTabs();this.sprites.show(this.ui.sceneLayer.querySelector('#sprite-workshop')!);
    this.ui.status.textContent='Vite development / Sprite review does not change saves or builds';
  }
  private showAnimation(){
    this.music.hide();this.scene.closePreview();document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=false;
    this.ui.initiative.textContent='Layered animation / Reference walk';
    this.ui.sceneLayer.innerHTML=`<section class="inventory-panel" aria-label="Character workshop">${this.tabs()}<div id="animation-workshop"></div></section>`;
    this.bindTabs();this.animation.show(this.ui.sceneLayer.querySelector('#animation-workshop')!);
    this.ui.status.textContent='Vite development / Animation reference does not change saves or character art';
  }
  private showCinematics(){
    this.music.hide();this.scene.closePreview();document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=false;
    const film=ENDING_FILMS[this.endingKind];
    const description=this.endingKind==='good'?'A wordless epilogue: the released crossing, Larkspur, window seats and the real sea.':'One continuous pullback from Nell’s folded coat at an empty seat reveals the surviving companions and her broken lantern, before the train leaves and rain begins. The Benefactor remains undefeated.';
    this.ui.initiative.textContent='Cinematics / '+film.label;
    this.ui.sceneLayer.innerHTML='<section class="inventory-panel" aria-label="Character workshop">'+this.tabs()+'<nav class="panel-actions" aria-label="Ending selection">'+(Object.keys(ENDING_FILMS) as EndingKind[]).map(kind=>'<button class="'+(kind===this.endingKind?'selected':'')+'" data-ending-kind="'+kind+'" aria-pressed="'+(kind===this.endingKind)+'">'+ENDING_FILMS[kind].label+'</button>').join('')+'</nav><section class="ending-workshop" aria-label="Ending cinematic preview"><div><h2>'+film.title+'</h2><canvas id="ending-poster" width="512" height="288" aria-label="Selected ending shot"></canvas><p>'+description+' Both endings use the same credits.</p><div id="ending-start" class="panel-actions"></div></div><div><h3>Shots</h3><nav class="ending-shot-list" aria-label="Cinematic shots">'+film.shots.map((s,index)=>'<button class="'+(index===this.endingShot?'selected':'')+'" data-ending-select="'+index+'" aria-pressed="'+(index===this.endingShot)+'">'+(index+1)+'. '+s.title+'</button>').join('')+'</nav><p>Space pauses; arrows change shots. The accessibility setting starts a still review. Playback changes no saves, equipment or workshop builds.</p></div></section></section>';
    this.bindTabs();
    const canvas=this.ui.sceneLayer.querySelector<HTMLCanvasElement>('#ending-poster')!;
    const poster=this.endingKind==='bad'?14000:endingShotStart(this.endingShot,this.endingKind)+film.shots[this.endingShot].duration*.55;
    paintEndingFilm(canvas.getContext('2d')!,poster,this.endingKind!=='bad',this.endingKind);
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-ending-kind]'))button.onclick=()=>{this.endingKind=button.dataset.endingKind as EndingKind;this.endingShot=0;this.show();};
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-ending-select]'))button.onclick=()=>{this.endingShot=Number(button.dataset.endingSelect);this.show();};
    const start=(shot:number)=>{this.music.hide();document.querySelector('.game-shell')!.classList.remove('inventory-open');this.scene.previewEndingFilm(()=>this.show(),shot,this.endingKind);};
    this.ui.actionRow(this.ui.sceneLayer.querySelector('#ending-start')!,[
      {label:'Play '+film.label.toLowerCase(),action:()=>start(0)},
      {label:'Play selected shot',action:()=>start(this.endingShot)},
    ]);
    this.ui.status.textContent='Cinematic review / Shares the campaign player';
  }
  private showMaps(){
    this.music.hide();this.scene.closePreview();document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=false;
    this.ui.initiative.textContent='Map review / Layers, coordinates and native artwork';
    this.ui.sceneLayer.innerHTML=`<section class="inventory-panel" aria-label="Character workshop">${this.tabs()}<div id="map-workshop"></div></section>`;
    this.bindTabs();this.maps.show(this.ui.sceneLayer.querySelector('#map-workshop')!);
    this.ui.status.textContent='Vite development / Map review does not change campaign saves';
  }
  private showBosses(){
    this.music.hide();this.scene.closePreview();document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=false;
    this.ui.initiative.textContent='Epic boss battle preview';
    const imperial=this.boss==='emperor'||this.boss==='lightbearer',dragon=this.boss==='dragon',serpent=this.boss==='serpent',conduit=this.boss==='conduit',flagship=this.boss==='flagship',shortParty=conduit&&this.conduitRoute==='feeds'&&this.settings.party.length<2;
    const entry=campaignBoss(this.boss);
    const portrait=entry?campaignBossPortrait(entry.id):imperial?imperialPortrait(this.boss==='lightbearer'):dragon?DRAGON_PORTRAIT:serpent?SERPENT_PORTRAIT:flagship?FLAGSHIP_PORTRAIT:conduit?CONDUIT_PORTRAIT:BOSS_PORTRAIT;
    const bossName=entry?.label??(imperial?(this.boss==='lightbearer'?'The Lightbearer':'The Emperor'):dragon?'Winter dragon':serpent?'Sun serpent':flagship?'Alban’s flagship':conduit?'Heart regulator':'The hollow sun');
    const library=[1,2,3,4,5,6,7].map(chapter=>`<div class="boss-chapter" role="group" aria-label="Chapter ${chapter} bosses"><strong>Ch ${chapter}</strong><div>${BOSS_CHOICES.filter(b=>b.chapter===chapter).map(b=>`<button data-boss="${b.id}" aria-pressed="${this.boss===b.id}">${b.label}</button>`).join('')}</div></div>`).join('');
    const details=entry?`<h2>${entry.label}</h2><p>${entry.hint}</p><p>Chapter ${entry.chapter} preset: ${entry.party.map(id=>names[id]).join(', ')} at level ${entry.level}. Uses the actual campaign encounter, arena, music and lighting. Rewards and campaign progress are disabled.</p>`:imperial?`<h2>${this.boss==='emperor'?'The Emperor’s vessel':'The Lightbearer'}</h2><p>${this.boss==='emperor'?'Break both crown supports to expose the seven-contact core. A later coronation rebuilds vacant supports at half strength; standing on a broken mounting prevents its return.':'Nell and the lantern remain inside a seven-contact mantle. The fan, side beams and crossing light are announced; when her hand closes the shutter, no attack fires and the mantle opens.'}</p><p>Taunt redirects the actual marked attack. Dazzle, guard and one-hit area attacks use ordinary rules. The preview uses level-12 Kit, Orrin and Petra with twelve bandages and changes no campaign progress.</p>`:dragon?`<h2>The winter dragon</h2><p>Eleven contacts form one anchored creature, above the expedition. Attack its body or any occupied hex; area attacks hit it once.</p><p>Drawn breath pulls each threatened survivor one clear hex toward its mouth. The side shelves shatter into loose ice: two movement per hex and six cold damage at round end. The ice stays passable. Red X hexes show the exact next attack.</p><p>Taunt redirects the actual attack and the ice it leaves. Dazzle and guard work normally. The level-12 preset uses Kit, Orrin and Petra with twelve bandages. The battle theme has a two-bar introduction and a 32-bar 5/4 loop. Music → Ch 6.</p>`:serpent?`<h2>The sun serpent</h2><p>Face its three-contact head from below. The head is always damageable. Coils alternate between loose and protected; breaking them lowers the head’s armor and stops reflected lanes on that side.</p><p>Breath leaves glass for the next attack. Red X hexes include every reflection. Taunt redirects the whole breath; Dazzle, guard and area attacks use the normal rules.</p><p>The Chapter Six preset uses level-12 Kit, Orrin and Petra with twelve bandages. Coils around the Sun has a two-bar introduction and a 32-bar loop in 6/8. Review the region in Music → Ch 6.</p>`:flagship?`<h2>Alban’s flagship</h2><p>Fight upward from the survey ship’s deck. Port battery, starboard battery and bridge each occupy three hexes. Target a component’s body or any of its contacts; area attacks hit each component once.</p><p>Destroy both batteries to drop the bridge shield. Each destroyed gun stops firing. Red X hexes warn of the next cannon attack; boarding marines contest the deck. Destroying the exposed bridge ends the boarding.</p><p>The Chapter Five preset uses level-10 Nell, Orrin and Petra with twelve bandages. Iron Above the Clouds plays in 10/8 with a two-bar intro and a 32-bar loop. Review it in Music → Ch 5. The campaign finale uses the same flagship with its saved formation and supplies.</p>`:conduit?`<h2>Heart regulator</h2><p>Face the conduit guardian from below. Its three supporting hexes form a compact triangle; attack any contact or its body. Area attacks hit it once. Its feet are anchored.</p><div class="boss-route" role="group" aria-label="Intake route"><button data-route="feeds" aria-pressed="${this.conduitRoute==='feeds'}">Sealed intake</button><button data-route="pressure" aria-pressed="${this.conduitRoute==='pressure'}">Pressure walk</button></div><p>${this.conduitRoute==='feeds'?'Occupy both blue earth plates together to drop the shield permanently. A feed hound guards the right flank.':'The seal is already down. Two pressure crows and hot floor vents guard the approach.'} Red X hexes warn of the regulator’s next pressure discharge.</p><p>The Chapter Three preset uses level-7 Nell, Orrin and Kit with six bandages.</p>`:`<h2>The Benefactor</h2><div class="boss-route" role="group" aria-label="Chapter Seven final forms"><button data-final-form="0">Campaign · the Benefactor</button><button data-final-form="1">Campaign · hollow sun</button><button data-final-form="2">Campaign · exposed heart</button></div><p>These three previews use the actual Chapter Seven encounters and the canonical final-refuge formation and equipment. Music → Ch 7. The older practice fixture below remains separate.</p><p>A towering enemy occupies nineteen hexes above the party. Every occupied hex targets the same enemy; area attacks damage it once.</p><p>Red X hexes show its next attack. Move clear before its turn, or protect the threatened heroes. Taunt draws judgment onto its user. The god is anchored and cannot be pushed.</p><p>The hollow heart opens at half health, widening its attacks. The finale preset uses level-10 Nell, Petra and Celia with twelve bandages.</p>`;
    this.ui.sceneLayer.innerHTML=`<section class="inventory-panel" aria-label="Character workshop">${this.tabs()}<div class="boss-layout"><nav class="boss-library" aria-label="Boss encounter">${library}</nav><section class="boss-preview" aria-label="Boss battle preview"><img src="${portrait}" width="128" height="128" alt="${bossName}"/><div>${details}<div id="boss-start"></div><p class="inv-note">Workshop party: ${this.settings.party.map(id=>`${names[id]} Lv ${this.settings.characters[id].level}`).join(' · ')}. ${shortParty?'Sealed intake requires at least two companions for the earth plates. ':''}This preview earns no campaign progress.</p></div></section></div></section>`;
    const address=()=>{const url=new URL(location.href);url.searchParams.set('dev','boss');url.searchParams.set('boss',this.boss);if(this.boss==='conduit')url.searchParams.set('route',this.conduitRoute);else url.searchParams.delete('route');history.replaceState(null,'',url);};
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-boss]'))button.onclick=()=>{const top=this.ui.sceneLayer.querySelector('.boss-library')!.scrollTop;this.boss=button.dataset.boss as typeof this.boss;this.bossRequest++;address();this.show();this.ui.sceneLayer.querySelector('.boss-library')!.scrollTop=top;};
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-route]'))button.onclick=()=>{this.conduitRoute=button.dataset.route as ConduitRoute;address();this.show();};
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-final-form]')){button.disabled=this.loadingBoss;button.onclick=()=>{
      if(this.loadingBoss)return;
      this.sprites.hide();this.animation.hide();this.maps.hide();this.music.hide();document.querySelector('.game-shell')!.classList.remove('inventory-open');
      (document.getElementById('save-button') as HTMLButtonElement).disabled=true;this.scene.state=practiceState();
      const {battle,presentation}=benefactorCampaignPreview(Number(button.dataset.finalForm) as 0|1|2);this.scene.previewBattle(battle,()=>this.show(),presentation);
    };}
    this.bindTabs();this.ui.actionRow(this.ui.sceneLayer.querySelector('#boss-start')!,[
      {disabled:this.loadingBoss,label:entry?`Start Chapter ${['One','Two','Three','Four','Five','Six','Seven'][entry.chapter-1]} preset`:imperial||dragon||serpent?'Start Chapter Six preset':flagship?'Start Chapter Five preset':conduit?'Start Chapter Three preset':'Start finale preset',action:()=>this.bossBattle(false)},
      ...entry||imperial||conduit||serpent||dragon?[]:[{disabled:this.loadingBoss,label:flagship?'Start exposed bridge':'Start phase two',action:()=>this.bossBattle(false,true)}],
      {label:'Use workshop party',disabled:shortParty||this.loadingBoss,action:()=>this.bossBattle(true)},
    ]);this.ui.status.textContent=this.loadingBoss?'Loading boss arena…':'Vite development / Boss battle preview';
  }
  private bossBattle(workshop:boolean,phaseTwo=false){
    if(this.loadingBoss)return;
    if(campaignBoss(this.boss)){void this.campaignBattle(workshop);return;}
    if(this.boss==='conduit'&&workshop&&this.conduitRoute==='feeds'&&this.settings.party.length<2)return;
    this.sprites.hide();this.animation.hide();this.maps.hide();this.music.hide();
    document.querySelector('.game-shell')!.classList.remove('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled=true;
    this.scene.state=practiceState();
    const profiles=workshop?characterProfiles(this.settings):undefined,equipment=workshop?equipmentBonuses(this.inventory):undefined,party=workshop?this.settings.party:undefined;
    const battle=this.boss==='emperor'||this.boss==='lightbearer'?createImperialPreview(this.boss,profiles,equipment,party):this.boss==='dragon'?createDragonPreview(profiles,equipment,party):this.boss==='serpent'?createSerpentPreview(profiles,equipment,party):this.boss==='flagship'?createFlagshipBattle(profiles,equipment,party,phaseTwo):this.boss==='conduit'?createConduitBattle(this.conduitRoute,profiles,equipment,party):createBossBattle(profiles,equipment,party,phaseTwo);
    this.scene.previewBattle(battle,()=>this.show(),this.boss==='emperor'||this.boss==='lightbearer'?IMPERIAL_PRESENTATIONS[this.boss]:this.boss==='dragon'?DRAGON_PRESENTATION:this.boss==='serpent'?SERPENT_PRESENTATION:this.boss==='flagship'?FLAGSHIP_PRESENTATION:this.boss==='conduit'?conduitPresentation(CONDUIT_ENCOUNTERS[this.conduitRoute]):BOSS_PRESENTATION);
  }
  private async campaignBattle(workshop:boolean){
    const entry=campaignBoss(this.boss)!,request=++this.bossRequest;this.loadingBoss=true;this.showBosses();let started=false;
    try{
      await loadCampaignBoss(this.scene,entry.id);
      if(request!==this.bossRequest||this.tab!=='bosses'||this.boss!==entry.id)return;
      this.sprites.hide();this.animation.hide();this.maps.hide();this.music.hide();
      document.querySelector('.game-shell')!.classList.remove('inventory-open');
      (document.getElementById('save-button')as HTMLButtonElement).disabled=true;this.scene.state=practiceState();
      const {battle,encounter}=createCampaignBoss(entry.id,workshop?characterProfiles(this.settings):undefined,workshop?equipmentBonuses(this.inventory):undefined,workshop?this.settings.party:undefined);
      this.scene.previewBattle(battle,()=>this.show(),campaignBossPresentation(encounter));started=true;
    }catch(error){this.ui.toast(error instanceof Error?error.message:'The boss preview could not start. Try again.');}
    finally{this.loadingBoss=false;if(!started&&this.tab==='bosses')this.showBosses();}
  }
  toggleSound(){if(this.music.active)this.music.toggle();else void this.scene.toggleSound();}
  battle() {
    if(this.tab==='bosses'){this.bossBattle(true);return;}
    if(this.tab==='combat'){this.combatBattle('workshop');return;}
    this.sprites.hide();
    this.animation.hide();
    this.maps.hide();
    this.music.hide();
    document.querySelector('.game-shell')!.classList.remove('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled = true;
    this.scene.state = practiceState();
    this.scene.previewBattle(createBattle('workshop', this.scene.state, equipmentBonuses(this.inventory),characterProfiles(this.settings),this.settings.party), () => this.show());
    this.ui.location('Workshop practice');
    this.ui.status.textContent = 'Workshop / Esc returns to character settings · Practice earns no campaign progress';
  }
  help() {
    this.ui.showModal('Character workshop', '<p>Choose any companion. Add or remove the selected companion from the practice party; one to three may fight. Reserves keep their equipment and builds. Character adjusts level and base stats and shows learned abilities. Changing level restores base stats; Apply base stats commits manual edits.</p><p>Equipment opens the shared bag and stat comparisons. Test battle uses the selected party’s builds and equipped items. Workshop or Escape returns here.</p><p>Guard absorbs damage until used up. Dazzle weakens the next three attacks, including retaliations. Celia’s weak Celestial bolt can target any enemy, ignoring distance and cover. Petra can use Shield bash once as an extra action before her main action; it pushes without damage, keeps movement available and prevents waiting afterward. Taunt draws every enemy toward her until her next turn. Selecting Pressure wave immediately previews its area; confirm to use it. It can hit allies and pushes only into clear hexes.</p><p>Music reviews every cue in 31-EDO. Play or stop, seek to a bar, and isolate instruments. Click a spelled pitch or a circle-of-fifths button to audition it. C# and Db remain distinct. Music stops when you leave the tab.</p><p>Sprites compares the five playable characters, all four directions and their native portraits. Choose a backdrop, toggle ground guides, and enlarge an actor by an integer factor for inspection. The lineup stays at native size.</p><p>The workshop saves separately from the campaign. Reset restores level 1 and the starting equipment stock.</p>');
  }
}
export function startWorkshop(root: HTMLElement) {
  let workshop: Workshop | undefined;
  const scene = new Adventure((scene, ui) => { workshop = new Workshop(scene, ui); }, COMPANION_IDS.filter(id=>id!=='nell'&&id!=='orrin').map(id=>CHARACTERS[id].sprite), [...BOSS_ASSETS,...IMPERIAL_PREVIEW_ASSETS,...DRAGON_PREVIEW_ASSETS,...SERPENT_PREVIEW_ASSETS,...FLAGSHIP_ASSETS,...CONDUIT_ASSETS.map(a=>({...a,url:`${import.meta.env.BASE_URL}${a.url}`}))]);
  mountGame(root, scene, { journal: () => workshop?.show(), saves: () => workshop?.battle(), sound: () => workshop?.toggleSound(), help: () => workshop?.help() });
}
