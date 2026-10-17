import { Adventure } from '../game/adventure';
import { mountGame } from '../game/mount';
import { art, type UI } from '../game/ui';
import { ABILITIES, createBattle, type Unit } from '../rules/combat';
import { newGame, recruitOrrin, type HeroId } from '../rules/state';
import { ITEMS, SLOTS, canEquip, decodeInventory, equipmentBonuses, equipItem, newInventory, receiveItem, unequipItem, type Inventory, type ItemId } from '../rules/inventory';
import './inventory-workshop.css';

const STORAGE = 'borrowed-tomorrow:inventory-workshop:v1';
const names = { nell: 'Nell', orrin: 'Orrin' };
function stock(): Inventory {
  const inventory = newInventory();
  for (const item of Object.keys(ITEMS) as ItemId[]) receiveItem(inventory, item, item === 'work-coat' ? 2 : 1);
  return inventory;
}
function practiceState() {
  const state = newGame(); recruitOrrin(state); state.coins = 0; return state;
}
class InventoryWorkshop {
  private inventory = stock();
  private hero: HeroId = 'nell';
  private selected: ItemId = 'brass-reflector';
  private message = 'Choose a character and an item.';
  constructor(private scene: Adventure, private ui: UI) {
    try { const stored = localStorage.getItem(STORAGE); if (stored) this.inventory = decodeInventory(stored); }
    catch { this.message = 'Stored workshop inventory was unavailable. Starting with fresh equipment.'; }
    document.title = 'Borrowed Tomorrow · Inventory workshop';
    document.querySelector('.game-shell')!.classList.add('inventory-workshop');
    document.querySelector('.brand h1')!.textContent = 'Inventory workshop';
    document.getElementById('journal-button')!.textContent = 'Inventory';
    document.getElementById('save-button')!.textContent = 'Test battle';
    document.getElementById('help-button')!.setAttribute('aria-label', 'Inventory help');
    this.ui.location('Vite development');
    this.scene.state = practiceState();
    this.show();
  }
  private save(message: string) {
    this.message = message;
    try { localStorage.setItem(STORAGE, JSON.stringify(this.inventory)); }
    catch { this.message += ' This browser could not store the workshop changes.'; }
    this.show();
  }
  private combatants(inventory = this.inventory) {
    return createBattle('workshop', practiceState(), equipmentBonuses(inventory)).units.filter(u => u.side === 'party');
  }
  show() {
    this.scene.closePreview();
    document.querySelector('.game-shell')!.classList.add('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled = false;
    this.ui.initiative.textContent = 'Manual equipment · Shared bag';
    const hero = this.hero, esc = this.ui.escape, current = this.combatants().find(u => u.id === hero)!;
    const selected = ITEMS[this.selected], equipped = this.inventory.characters[hero];
    const trial = structuredClone(this.inventory);
    const changed = equipItem(trial, hero, this.selected);
    const next = this.combatants(trial).find(u => u.id === hero)!;
    const stats: [string, (u: Unit) => number][] = [['Attack', u => ABILITIES.strike.power + u.bonus], ['Armor', u => u.armor], ['Speed', u => u.speed]];
    const comparison = stats.map(([label, value]) => {
      const delta = value(next) - value(current);
      return `<div class="inv-stat"><span>${label}</span><span>${value(current)}${changed ? ` → ${value(next)}` : ''}</span><small class="${delta > 0 ? 'gain' : delta < 0 ? 'loss' : ''}">${delta > 0 ? '+' : ''}${delta || '—'}</small></div>`;
    }).join('');
    const items = (Object.keys(ITEMS) as ItemId[]).map(id => {
      const item = ITEMS[id], holders = (['nell', 'orrin'] as const).filter(h => Object.values(this.inventory.characters[h]).includes(id));
      return `<button class="inv-item${id === this.selected ? ' selected' : ''}" data-item="${id}" aria-pressed="${id === this.selected}"><span>${esc(item.name)}</span><small>${this.inventory.bag[id] ?? 0} in bag${holders.length ? ` · ${holders.map(h => names[h]).join(', ')}` : ''}</small></button>`;
    }).join('');
    this.ui.sceneLayer.innerHTML = `<section class="inventory-panel" aria-label="Character inventory">
      <div class="inv-characters" role="group" aria-label="Character"><button data-hero="nell" aria-pressed="${hero === 'nell'}" class="${hero === 'nell' ? 'selected' : ''}">Nell</button><button data-hero="orrin" aria-pressed="${hero === 'orrin'}" class="${hero === 'orrin' ? 'selected' : ''}">Orrin</button></div>
      <div class="inv-columns"><section class="inv-character" aria-label="${names[hero]} equipment">
        <div class="inv-identity"><img src="${art(`portrait-${hero}`)}" alt="${names[hero]}"/><div><h2>${names[hero]}</h2><small>${hero === 'nell' ? 'Oil lantern' : 'Steam lance'}</small><p class="inv-hp">HP ${current.maxHp} / ${current.maxHp}</p></div></div>
        <div class="inv-current-stats">${stats.map(([label, value]) => `<div><small>${label}</small><p>${value(current)}</p></div>`).join('')}</div>
        <h3>Equipped</h3>${SLOTS.map(slot => `<div class="inv-slot"><small>${slot === 'fitting' ? 'Tool fitting' : 'Coat'}</small><p>${equipped[slot] ? esc(ITEMS[equipped[slot]!].name) : 'None'}</p><button data-unequip="${slot}" ${!equipped[slot] ? 'disabled' : ''}>Unequip ${slot === 'fitting' ? 'fitting' : 'coat'}</button></div>`).join('')}
      </section><section class="inv-bag" aria-label="Shared bag"><h2>Shared bag</h2><div class="inv-items">${items}</div><p class="inv-note">An item stays in the bag until you equip it.</p></section>
      <section class="inv-details" aria-label="Item details"><small>${selected.slot === 'fitting' ? 'Tool fitting' : 'Coat'} · ${selected.heroes.map(h => names[h]).join(' / ')}</small><h2>${esc(selected.name)}</h2><p>${esc(selected.description)}</p><div class="inv-comparison" aria-label="Stat comparison">${comparison}</div><div id="inv-equip"></div><p class="inv-note">${!canEquip(hero, this.selected) ? `${names[hero]} cannot use this fitting.` : equipped[selected.slot] === this.selected ? 'Already equipped.' : !(this.inventory.bag[this.selected] ?? 0) ? 'No spare copy. Unequip it from its wearer first.' : `Replaces ${equipped[selected.slot] ? esc(ITEMS[equipped[selected.slot]!].name) : 'the empty slot'}.`}</p><div id="inv-receive"></div></section></div>
      <div class="inv-footer"><div id="inv-tools"></div><p role="status">${esc(this.message)}</p></div>
    </section>`;
    for (const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-hero]')) button.onclick = () => { this.hero = button.dataset.hero as HeroId; this.show(); this.ui.sceneLayer.querySelector<HTMLButtonElement>(`[data-hero="${this.hero}"]`)!.focus(); };
    for (const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-item]')) button.onclick = () => { this.selected = button.dataset.item as ItemId; this.show(); this.ui.sceneLayer.querySelector<HTMLButtonElement>(`[data-item="${this.selected}"]`)!.focus(); };
    for (const button of this.ui.sceneLayer.querySelectorAll<HTMLButtonElement>('[data-unequip]')) button.onclick = () => { if (unequipItem(this.inventory, hero, button.dataset.unequip as typeof SLOTS[number])) this.save('Equipment returned to the bag.'); };
    this.ui.actionRow(this.ui.sceneLayer.querySelector('#inv-equip')!, [{ label: `Equip on ${names[hero]}`, disabled: !changed, action: () => { if (equipItem(this.inventory, hero, this.selected)) this.save(`${selected.name} equipped on ${names[hero]}.`); } }]);
    this.ui.actionRow(this.ui.sceneLayer.querySelector('#inv-receive')!, [{ label: 'Receive one copy', disabled: (this.inventory.bag[this.selected] ?? 0) >= 99, action: () => { if (receiveItem(this.inventory, this.selected)) this.save(`${selected.name} added to the bag.`); } }]);
    this.ui.actionRow(this.ui.sceneLayer.querySelector('#inv-tools')!, [{ label: 'Reset workshop', action: () => { this.inventory = stock(); this.save('Workshop reset. All equipment is in the bag.'); } }, { label: 'Return to story', action: () => { const url = new URL(location.href); url.searchParams.delete('dev'); location.assign(url); } }]);
    this.ui.status.textContent = 'Vite development · Workshop inventory saved separately';
  }
  battle() {
    document.querySelector('.game-shell')!.classList.remove('inventory-open');
    (document.getElementById('save-button') as HTMLButtonElement).disabled = true;
    this.scene.state = practiceState();
    this.scene.previewBattle(createBattle('workshop', this.scene.state, equipmentBonuses(this.inventory)), () => this.show());
    this.ui.location('Inventory practice');
    this.ui.status.textContent = 'Inventory / Esc returns to equipment · Practice earns no campaign progress';
  }
  help() {
    this.ui.showModal('Inventory workshop', '<p>Select Nell or Orrin, then choose a piece of equipment. The comparison shows the effect before equipping. Unequipped copies stay in the shared bag.</p><p>Receive one copy tests item acquisition. Test battle uses the selected equipment in the combat engine. Return with Inventory or Escape.</p><p>The workshop saves separately from the campaign. Reset restores its starting stock.</p>');
  }
}
export function startInventoryWorkshop(root: HTMLElement) {
  let workshop: InventoryWorkshop | undefined;
  const scene = new Adventure((scene, ui) => { workshop = new InventoryWorkshop(scene, ui); });
  mountGame(root, scene, { journal: () => workshop?.show(), saves: () => workshop?.battle(), help: () => workshop?.help() });
}
