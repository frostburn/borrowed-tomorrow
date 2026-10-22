import { CHARACTERS } from '../content/characters';
import { ABILITIES, createBattle, type Unit } from '../rules/combat';
import { ITEMS, SLOTS, canEquip, equipItem, ownedCopies, unequipItem, type ItemId } from '../rules/inventory';
import { level, partyLeader, setActive, type GameState, type HeroId } from '../rules/state';
import { art, type UI } from './ui';
import './inventory.css';

export function openInventory(ui: UI, state: GameState, changed: () => void) {
  let hero: HeroId = partyLeader(state), selected: ItemId | undefined, message = '';
  ui.showModal('Character inventory', '<div class="campaign-inventory"></div>');
  const target = ui.modal.querySelector<HTMLElement>('.campaign-inventory')!, esc = ui.escape;
  const stats: [string, (unit: Unit) => number][] = [
    ['Attack', u => ABILITIES.strike.power + u.bonus], ['Armor', u => u.armor], ['Speed', u => u.speed],
  ];
  const combatant = (inventory = state.inventory) => createBattle('workshop', { ...state, inventory }, undefined, undefined, [hero]).units.find(u => u.id === hero)!;
  const render = () => {
    const items = (Object.keys(ITEMS) as ItemId[]).filter(id => ownedCopies(state.inventory, id) > 0);
    if (!selected || !items.includes(selected)) selected = items[0];
    const leader=partyLeader(state);
    const current = combatant(), equipped = state.inventory.characters[hero], name = CHARACTERS[hero].name;
    const trial = structuredClone(state.inventory), fits = selected ? equipItem(trial, hero, selected) : false;
    const next = combatant(trial), item = selected ? ITEMS[selected] : undefined;
    target.innerHTML = `<div class="ci-characters" role="group" aria-label="Character">${state.party.map(p => `<button data-character="${p.id}" aria-pressed="${p.id === hero}" class="${p.id === hero ? 'selected' : ''}">${CHARACTERS[p.id].name}</button>`).join('')}</div>
      <div class="ci-grid"><section class="ci-character" aria-label="${name} equipment"><img src="${art(CHARACTERS[hero].portrait)}" alt="${name}"/><h2>${name} <small>Lv ${level(state)}</small></h2><p>HP ${current.hp} / ${current.maxHp} · Move ${current.movement}</p>
      <div class="ci-stats">${stats.map(([label, value]) => `<div><small>${label}</small><p>${value(current)}</p></div>`).join('')}</div>
      <p>${state.activeParty.includes(hero) ? 'Active fighter' : 'Reserve · keeps equipment and gains experience'}</p>${hero === 'nell' ? '' : `<button id="ci-active" ${!state.activeParty.includes(hero) && state.activeParty.length >= 3 ? 'disabled' : ''}>${state.activeParty.includes(hero) ? 'Move to reserve' : 'Set active'}</button>`}<small>${state.activeParty.length} / 3 active · ${CHARACTERS[leader].name} leads the party</small><h3>Equipped</h3>${SLOTS.map(slot => `<div class="ci-slot"><small>${slot === 'fitting' ? 'Tool fitting' : 'Coat'}</small><p>${equipped[slot] ? esc(ITEMS[equipped[slot]!].name) : 'None'}</p><button data-slot="${slot}" ${equipped[slot] ? '' : 'disabled'}>Unequip ${slot === 'fitting' ? 'fitting' : 'coat'}</button></div>`).join('')}</section>
      <div class="ci-bag"><section aria-label="Shared bag"><h3>Shared bag</h3><p>${state.bandages} shared bandages</p><div class="ci-items">${items.map(id => {
        const holders = state.party.filter(p => Object.values(state.inventory.characters[p.id]).includes(id)).map(p => CHARACTERS[p.id].name);
        return `<button data-item="${id}" aria-pressed="${id === selected}" class="${id === selected ? 'selected' : ''}"><span>${esc(ITEMS[id].name)}</span><small>${state.inventory.bag[id] ?? 0} in bag${holders.length ? ` · ${holders.join(', ')}` : ''}</small></button>`;
      }).join('')}</div>${items.length ? '<p>Buying or finding equipment adds it to the bag. Equip each copy on one character.</p>' : '<p>No equipment yet. Items you buy or find will appear here.</p>'}</section>
      ${item ? `<section class="ci-details" aria-label="Item details"><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><small>Fits: ${item.heroes.filter(id => state.party.some(p => p.id === id)).map(id => CHARACTERS[id].name).join(' / ') || 'No recruited character'}</small><div class="ci-comparison" role="region" aria-label="Stat comparison">${stats.map(([label, value]) => `<p>${label}: ${value(current)}${fits ? ` → ${value(next)}` : ''}</p>`).join('')}</div><button id="ci-equip" ${fits ? '' : 'disabled'}>Equip on ${name}</button><p>${!canEquip(hero, selected!) ? `${name} cannot use this item.` : equipped[item.slot] === selected ? 'Already equipped.' : !(state.inventory.bag[selected!] ?? 0) ? 'No spare copy. Unequip it from its wearer first.' : ''}</p></section>` : ''}</div></div><p class="ci-message" role="status">${esc(message)}</p>`;
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
