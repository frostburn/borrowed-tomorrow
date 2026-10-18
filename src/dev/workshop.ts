import { Adventure } from '../game/adventure';
import { mountGame } from '../game/mount';
import { art, type UI } from '../game/ui';
import { ABILITIES, createBattle, type Unit } from '../rules/combat';
import { newGame, recruitOrrin } from '../rules/state';
import { ITEMS, SLOTS, canEquip, decodeInventory, equipmentBonuses, equipItem, newInventory, ownedCopies, receiveItem, unequipItem, type Inventory, type ItemId } from '../rules/inventory';
import { COMPANION_IDS, COMPANIONS, LEARNING, STAT_LIMITS, setPartyMember, type CompanionId, characterProfiles, decodeCharacterSettings, defaultBuild, newCharacterSettings, validStat, type CharacterStat } from '../rules/characters';
import { CHARACTERS } from '../content/characters';
import { MAX_PARTY_SIZE } from '../rules/party';
import './workshop.css';

const STORAGE = 'borrowed-tomorrow:inventory-workshop:v1';
const CHARACTER_STORAGE = 'borrowed-tomorrow:character-workshop:v1';
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
  private tab: 'character' | 'equipment' = new URLSearchParams(location.search).get('dev') === 'inventory' ? 'equipment' : 'character';
  private hero: CompanionId = 'nell';
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
    return `<section class="workshop-build" aria-label="Character settings"><h2>Character settings</h2><div class="workshop-level"><label for="character-level">Level</label><button data-level="-1" aria-label="Decrease ${names[hero]} level" ${build.level===1?'disabled':''}>−</button><input id="character-level" type="number" min="1" max="10" step="1" value="${build.level}" aria-label="${names[hero]} level"/><button data-level="1" aria-label="Increase ${names[hero]} level" ${build.level===10?'disabled':''}>+</button></div><p class="inv-note">Changing level restores base stats. Equipment stays equipped.</p><form id="character-stats" novalidate><h3>Base stats</h3>${fields}<button type="submit">Apply base stats</button><button type="button" id="level-defaults">Level defaults</button></form><p class="inv-note">Equipment bonuses are added to these values. Starting focus regenerates on a character’s turn.</p></section><section class="workshop-abilities" aria-label="Level abilities"><h2>Abilities</h2>${LEARNING[hero].map(entry=>{
      const ability=ABILITIES[entry.ability],known=entry.level<=build.level;
      return `<article class="workshop-ability ${known?'known':'locked'}" data-ability="${ability.id}"><div><h3>${ability.name}</h3><small>Lv ${entry.level} · ${known?'Known':'Locked'} · ${ability.cost} focus</small></div><p>${ability.description}</p></article>`;
    }).join('')}</section>`;
  }
  private bindCharacterPanel() {
    if(this.tab!=='character')return;
    const hero=this.hero,levelInput=this.ui.sceneLayer.querySelector<HTMLInputElement>('#character-level')!;
    const changeLevel=(level:number)=>{
      if(!Number.isInteger(level)||level<1||level>10){this.message='Level must be a whole number from 1 to 10.';this.show();return;}
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
      return `<button class="inv-item${id === this.selected ? ' selected' : ''}" data-item="${id}" aria-pressed="${id === this.selected}"><span>${esc(item.name)}</span><small>${this.inventory.bag[id] ?? 0} in bag${holders.length ? ` · ${holders.map(h => names[h]).join(', ')}` : ''}</small></button>`;
    }).join('');
    this.ui.sceneLayer.innerHTML = `<section class="inventory-panel" aria-label="Character workshop">
      <div class="inv-characters" role="group" aria-label="Character">${COMPANION_IDS.map(id=>`<button data-hero="${id}" aria-label="${names[id]}" aria-pressed="${hero===id}" class="${hero===id?'selected':''}">${names[id]}<small>${this.settings.party.includes(id)?'Party':'Reserve'}</small></button>`).join('')}</div>
      <div class="workshop-navigation"><nav class="workshop-tabs" aria-label="Workshop panels"><button data-tab="character" class="${this.tab === 'character' ? 'selected' : ''}" aria-pressed="${this.tab === 'character'}">Character</button><button data-tab="equipment" class="${this.tab === 'equipment' ? 'selected' : ''}" aria-pressed="${this.tab === 'equipment'}">Equipment</button></nav><section class="workshop-party" aria-label="Practice party"><div><small>Practice party · ${this.settings.party.length} / ${MAX_PARTY_SIZE}</small><p>${this.settings.party.map(id=>names[id]).join(' · ')}</p></div><button id="party-toggle" ${this.settings.party.includes(hero)?this.settings.party.length===1?'disabled':'':this.settings.party.length===MAX_PARTY_SIZE?'disabled':''}>${this.settings.party.includes(hero)?`Remove ${names[hero]} from party`:`Add ${names[hero]} to party`}</button>${!this.settings.party.includes(hero)&&this.settings.party.length===MAX_PARTY_SIZE?'<p class="party-full">Party full. Remove a member first.</p>':''}</section></div>
      <div class="inv-columns ${this.tab === 'character' ? 'character-columns' : ''}"><section class="inv-character" aria-label="${names[hero]} equipment">
        <div class="inv-identity"><img src="${art(CHARACTERS[hero].portrait)}" alt="${names[hero]}"/><div><h2>${names[hero]} · Lv ${this.settings.characters[hero].level}</h2><small>${COMPANIONS[hero].tool}</small><p class="inv-biography">${COMPANIONS[hero].role} · Chapter ${COMPANIONS[hero].chapter}<br/>${esc(COMPANIONS[hero].description)}</p><p class="inv-hp">HP ${current.maxHp} · Move ${current.movement}</p></div></div>
        <div class="inv-current-stats">${stats.map(([label, value]) => `<div><small>${label}</small><p>${value(current)}</p></div>`).join('')}</div>
        <h3>Equipped</h3>${SLOTS.map(slot => `<div class="inv-slot"><small>${slot === 'fitting' ? 'Tool fitting' : 'Coat'}</small><p>${equipped[slot] ? esc(ITEMS[equipped[slot]!].name) : 'None'}</p><button data-unequip="${slot}" ${!equipped[slot] ? 'disabled' : ''}>Unequip ${slot === 'fitting' ? 'fitting' : 'coat'}</button></div>`).join('')}
      </section>${this.tab === 'character' ? this.characterPanel() : `<section class="inv-bag" aria-label="Shared bag"><h2>Shared bag</h2><div class="inv-items">${items}</div><p class="inv-note">An item stays in the bag until you equip it.</p></section>
      <section class="inv-details" aria-label="Item details"><small>${selected.slot === 'fitting' ? 'Tool fitting' : 'Coat'} · ${selected.heroes.map(h => names[h]).join(' / ')}</small><h2>${esc(selected.name)}</h2><p>${esc(selected.description)}</p><div class="inv-comparison" aria-label="Stat comparison">${comparison}</div><div id="inv-equip"></div><p class="inv-note">${!canEquip(hero, this.selected) ? `${names[hero]} cannot use this fitting.` : equipped[selected.slot] === this.selected ? 'Already equipped.' : !(this.inventory.bag[this.selected] ?? 0) ? 'No spare copy. Unequip it from its wearer first.' : equipped[selected.slot] ? `Replaces ${esc(ITEMS[equipped[selected.slot]!].name)}.` : ''}</p><div id="inv-receive"></div></section>`}</div>
      <div class="inv-footer"><div id="inv-tools"></div><p role="status">${esc(this.message)}</p></div>
    </section>`;
    this.bindCharacterPanel();
    this.ui.sceneLayer.querySelector<HTMLButtonElement>('#party-toggle')!.onclick=()=>{
      const included=!this.settings.party.includes(hero);
      if(setPartyMember(this.settings,hero,included))this.save(`${names[hero]} ${included?'added to':'removed from'} the practice party.`);
    };
    for(const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-tab]'))button.onclick=()=>{this.tab=button.dataset.tab as typeof this.tab;this.show();};
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
  battle() {
    document.querySelector('.game-shell')!.classList.remove('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled = true;
    this.scene.state = practiceState();
    this.scene.previewBattle(createBattle('workshop', this.scene.state, equipmentBonuses(this.inventory),characterProfiles(this.settings),this.settings.party), () => this.show());
    this.ui.location('Workshop practice');
    this.ui.status.textContent = 'Workshop / Esc returns to character settings · Practice earns no campaign progress';
  }
  help() {
    this.ui.showModal('Character workshop', '<p>Choose any companion. Add or remove the selected companion from the practice party; one to three may fight. Reserves keep their equipment and builds. Character adjusts level and base stats and shows learned abilities. Changing level restores base stats; Apply base stats commits manual edits.</p><p>Equipment opens the shared bag and stat comparisons. Test battle uses the selected party’s builds and equipped items. Workshop or Escape returns here.</p><p>Guard absorbs damage until used up. Dazzle weakens the next three attacks, including retaliations. Celia’s weak Celestial bolt can target any enemy, ignoring distance and cover. Petra can use Shield bash once as an extra action before her main action; it pushes without damage, keeps movement available and prevents waiting afterward. Taunt draws every enemy toward her until her next turn. Selecting Pressure wave immediately previews its area; confirm to use it. It can hit allies and pushes only into clear hexes.</p><p>The workshop saves separately from the campaign. Reset restores level 1 and the starting equipment stock.</p>');
  }
}
export function startWorkshop(root: HTMLElement) {
  let workshop: Workshop | undefined;
  const scene = new Adventure((scene, ui) => { workshop = new Workshop(scene, ui); }, COMPANION_IDS.filter(id=>id!=='nell'&&id!=='orrin').map(id=>CHARACTERS[id].sprite));
  mountGame(root, scene, { journal: () => workshop?.show(), saves: () => workshop?.battle(), help: () => workshop?.help() });
}
