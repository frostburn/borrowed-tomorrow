import {improvementSummary,maxFocus} from '../content/improvements';
import {icon} from './item-icons';
import {itemIcon} from '../content/ui-art';
import { CONSUMABLES, consumableCount, type ConsumableId } from '../rules/consumables';
import { heroAvailable } from '../rules/availability';
import { CHARACTERS } from '../content/characters';
import { ABILITIES, createPartyUnit, type Unit } from '../rules/combat';
import { ITEMS, SLOTS, equipmentBonuses, canEquip, equipmentOwner, equipItem, ownedCopies, unequipItem, type ItemId } from '../rules/inventory';
import { level, partyLeader, setActive, type GameState, type HeroId } from '../rules/state';
import { art, type UI } from './ui';
import './inventory.css';
import {openSkills} from './skills';

export function openInventory(ui: UI, state: GameState, changed: () => void,initial?:{hero:HeroId;item:ItemId}) {
  let hero: HeroId = initial?.hero??partyLeader(state), selected: ItemId | undefined=initial?.item, message = '';
  ui.showModal('Character inventory', '<div class="campaign-inventory"></div>');
  const target = ui.modal.querySelector<HTMLElement>('.campaign-inventory')!, esc = ui.escape;
  const stats: [string, (unit: Unit) => number][] = [
    ['Attack', u => ABILITIES.strike.power + u.bonus], ['Armor', u => u.armor], ['Speed', u => u.speed],
  ];
  const combatant = (inventory = state.inventory) => createPartyUnit(state,hero,0,1,equipmentBonuses(inventory));
  const render = () => {
    const items = (Object.keys(ITEMS) as ItemId[]).filter(id => ownedCopies(state.inventory, id) > 0);
    if (!selected || !items.includes(selected)) selected = items[0];
    const leader=partyLeader(state);
    const current = combatant(), currentHp = state.party.find(p=>p.id===hero)!.hp, equipped = state.inventory.characters[hero], name = CHARACTERS[hero].name;
    const trial = structuredClone(state.inventory), fits = selected ? equipItem(trial, hero, selected) : false;
    const next = combatant(trial), item = selected ? ITEMS[selected] : undefined;
    target.innerHTML = `<div class="ci-characters" role="group" aria-label="Character">${state.party.map(p => `<button data-character="${p.id}" aria-pressed="${p.id === hero}" class="${p.id === hero ? 'selected' : ''}">${CHARACTERS[p.id].name}</button>`).join('')}</div>
      <div class="ci-grid"><section class="ci-character" aria-label="${name} equipment"><img src="${art(CHARACTERS[hero].portrait)}" alt="${name}"/><h2>${name} <small>Lv ${level(state)}</small></h2><p>HP ${currentHp} / ${current.maxHp} · Focus ${state.party.find(p=>p.id===hero)!.focus} / ${maxFocus(state,hero)} · Move ${current.movement}</p>${improvementSummary(state,hero).length?`<section aria-label="Permanent improvements"><h3>Permanent improvements</h3>${improvementSummary(state,hero).map(t=>`<p>${esc(t)}</p>`).join('')}</section>`:''}
      <div class="ci-stats">${stats.map(([label, value]) => `<div><small>${label}</small><p>${value(current)}</p></div>`).join('')}</div>
      <p>${hero==='nell'&&state.flags.nellLost?'Deceased':!heroAvailable(state,hero)?'Too ill to fight · resting aboard':state.activeParty.includes(hero) ? 'Active fighter' : 'Reserve · keeps equipment and gains experience'}</p>${hero === 'nell'&&!state.flags.nellIll ? '' : `<button id="ci-active" ${!heroAvailable(state,hero)||!state.activeParty.includes(hero)&&state.activeParty.length>=3||state.activeParty.includes(hero)&&state.activeParty.length===1?'disabled':''}>${state.activeParty.includes(hero) ? 'Move to reserve' : 'Set active'}</button>`}<small>${state.activeParty.length} / 3 active · ${CHARACTERS[leader].name} leads the party</small><button id="ci-skills">Skills</button><h3>Equipped</h3>${SLOTS.map(slot => `<div class="ci-slot"><small>${slot === 'fitting' ? 'Tool fitting' : 'Coat'}</small><p>${equipped[slot] ? `<span class="icon-label">${icon(itemIcon(equipped[slot]!))}<span>${esc(ITEMS[equipped[slot]!].name)}</span></span>` : 'None'}</p><button data-slot="${slot}" ${equipped[slot] ? '' : 'disabled'}>Unequip ${slot === 'fitting' ? 'fitting' : 'coat'}</button></div>`).join('')}</section>
      <div class="ci-bag"><section aria-label="Shared bag"><h3>Shared bag</h3><p class="ci-supplies">${(Object.keys(CONSUMABLES) as ConsumableId[]).map(id=>`<span class="icon-label">${icon(itemIcon(id))}<span>${CONSUMABLES[id].name} × ${consumableCount(state,id)}</span></span>`).join('')}</p><div class="ci-items">${items.map(id => {
        const holders = state.party.filter(p => Object.values(state.inventory.characters[p.id]).includes(id)).map(p => CHARACTERS[p.id].name);
        const compatible=canEquip(hero,id),owner=equipmentOwner(id);
        return `<button data-item="${id}" aria-pressed="${id === selected}" ${compatible?'':`aria-description="${name} cannot use this item."`} class="${id === selected ? 'selected' : ''}${compatible?'':' incompatible'}"><span class="icon-label">${icon(itemIcon(id))}<span>${esc(ITEMS[id].name)}</span></span><small>${owner?`${CHARACTERS[owner].name}${holders.length?' · Equipped':''}`:`${state.inventory.bag[id] ?? 0} in bag${holders.length ? ` · ${holders.join(', ')}` : ''}`}</small></button>`;
      }).join('')}</div>${items.length?'':'<p>No equipment yet.</p>'}</section>
      ${item ? `<section class="ci-details" aria-label="Item details"><h3>${icon(itemIcon(selected!))}${esc(item.name)}</h3><p>${esc(item.description)}</p><small>Fits: ${item.heroes.filter(id => state.party.some(p => p.id === id)).map(id => CHARACTERS[id].name).join(' / ') || 'No recruited character'}</small><div class="ci-comparison" role="region" aria-label="Stat comparison">${stats.map(([label, value]) => `<p>${label}: ${value(current)}${fits ? ` → ${value(next)}` : ''}</p>`).join('')}</div><button id="ci-equip" ${fits ? '' : 'disabled'}>Equip on ${name}</button><p>${!canEquip(hero, selected!) ? `${name} cannot use this item.` : equipped[item.slot] === selected ? 'Already equipped.' : !(state.inventory.bag[selected!] ?? 0) ? 'No spare copy. Unequip it from its wearer first.' : ''}</p></section>` : ''}</div></div><p class="ci-message" role="status">${esc(message)}</p>`;
    target.querySelector<HTMLButtonElement>('#ci-skills')!.onclick=()=>openSkills(ui,state,hero);
    target.querySelector<HTMLButtonElement>('#ci-active')?.addEventListener('click', () => { if (setActive(state, hero, !state.activeParty.includes(hero))) { message = 'Formation saved.'; changed(); render(); } });
    for (const button of target.querySelectorAll<HTMLButtonElement>('[data-character]')) button.onclick = () => { hero = button.dataset.character as HeroId; render(); };
    for (const button of target.querySelectorAll<HTMLButtonElement>('[data-item]')) button.onclick = () => { selected = button.dataset.item as ItemId; render(); };
    for (const button of target.querySelectorAll<HTMLButtonElement>('[data-slot]')) button.onclick = () => {
      if (unequipItem(state.inventory, hero, button.dataset.slot as typeof SLOTS[number])) { message = 'Equipment returned to the bag.'; changed(); render(); }
    };
    target.querySelector<HTMLButtonElement>('#ci-equip')?.addEventListener('click', () => {
      if (selected && equipItem(state.inventory, hero, selected)) { message = `${ITEMS[selected].name} equipped on ${name}.`; changed(); render(); }
    });
  };
  render();
}
