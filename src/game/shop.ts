import { CHARACTERS } from '../content/characters';
import { CONSUMABLES, isConsumable } from '../rules/consumables';
import { ITEMS, type ItemId } from '../rules/inventory';
import { buySupply, canBuy, canSell, sellEquipment, sellPrice, shopStock, supplyCount, type ShopId } from '../rules/supplies';
import type { GameState } from '../rules/state';
import { art, type UI } from './ui';
import './shop.css';

/** Supply counters share transactions; their stock and host stay local to the route. */
export function openShop(ui: UI, state: GameState, shop: ShopId, changed: () => void, rest: () => void, equipment: () => void) {
  let selling = false, selected: ItemId | undefined, message = '';
  const esc = ui.escape, host = shop === 'station' ? CHARACTERS.iona : shop === 'ward' ? CHARACTERS.dena : undefined;
  const title = shop === 'station' ? 'Iona’s supplies' : shop === 'ward' ? 'Ward supplies' : shop === 'field' ? 'Medical supplies' : 'Coastal supplies';
  const greeting = shop === 'station' ? (state.flags.raidSeen ? '“I’ll keep the station open. You find Tomas. And eat something before you go.”' : '“Your brother’s home. You can stop checking every train now.”')
    : shop === 'ward' ? '“Take what you need for the crossing. Leave the spare fittings here; we can use them.”' : shop === 'field' ? '“Fresh dressings and tonics. Let me know what you need.”' : '“Coats and spare fittings here. I can take your old gear in trade.”';
  ui.showModal(title, `<div class="supply-shop"><div class="shopkeeper">${host ? `<img src="${art(host.portrait)}" alt="${host.name}"/>` : ''}<p>${greeting}</p></div><p class="shop-wallet"></p><div class="shop-tabs" role="group" aria-label="Trading"><button data-tab="buy">Buy supplies</button><button data-tab="sell">Sell spare gear</button></div><div class="shop-status" role="status" aria-live="polite"></div><div class="shop-list"></div></div>`, [
    { label: 'Rest · free', action: rest }, { label: 'Equipment', action: equipment },
  ]);
  const root = ui.modal.querySelector<HTMLElement>('.supply-shop')!, target = root.querySelector<HTMLElement>('.shop-list')!;
  const render = () => {
    root.querySelector('.shop-wallet')!.textContent = `${state.coins} marks`;
    root.querySelector('.shop-status')!.textContent = message;
    for (const button of root.querySelectorAll<HTMLButtonElement>('[data-tab]')) {
      button.setAttribute('aria-pressed', String((button.dataset.tab === 'sell') === selling));
      button.classList.toggle('selected', (button.dataset.tab === 'sell') === selling);
      button.onclick = () => { selling = button.dataset.tab === 'sell'; selected = undefined; message = ''; render(); };
    }
    target.replaceChildren();
    if (selling) {
      const note = document.createElement('p'); note.textContent = 'Only spare copies in the bag can be sold. Unequip worn gear in Equipment first.'; target.append(note);
      const ids = (Object.keys(ITEMS) as ItemId[]).filter(id => (state.inventory.bag[id] ?? 0) > 0);
      if (!ids.length) { const empty = document.createElement('p'); empty.textContent = 'No spare gear to sell.'; target.append(empty); }
      for (const id of ids) {
        const item = ITEMS[id], row = document.createElement('section'); row.className = 'equipment-row'; row.dataset.gear = id; row.setAttribute('role', 'group'); row.setAttribute('aria-label', item.name);
        row.innerHTML = `<div><h3>${esc(item.name)}</h3><p>${state.inventory.bag[id]} in bag · ${sellPrice(id)} marks each</p></div>`;
        row.append(ui.button({ label: `Sell · ${sellPrice(id)} marks`, disabled: !canSell(state, id), selected: selected === id, action: () => { selected = id; message = ''; render(); root.querySelector<HTMLButtonElement>('.shop-sale button')?.focus(); } })); target.append(row);
        if (selected === id) {
          const confirm = document.createElement('div'); confirm.className = 'shop-sale'; confirm.setAttribute('role', 'group'); confirm.setAttribute('aria-label', 'Confirm sale');
          const question = document.createElement('p'); question.textContent = `Sell one ${item.name} for ${sellPrice(id)} marks?`; confirm.append(question);
          confirm.append(ui.button({ label: 'Confirm sale', action: () => { if (sellEquipment(state, id)) { message = `${item.name} sold for ${sellPrice(id)} marks.`; selected = undefined; changed(); } render(); root.querySelector<HTMLButtonElement>('[data-tab="sell"]')!.focus(); } }), ui.button({ label: 'Cancel sale', action: () => { selected = undefined; render(); root.querySelector<HTMLButtonElement>(`[data-gear="${id}"] button`)?.focus(); } })); target.append(confirm);
        }
      }
      return;
    }
    for (const supply of shopStock(shop)) {
      const id = supply.id, item = isConsumable(id) ? undefined : ITEMS[id];
      if (item && !item.heroes.some(h => state.party.some(p => p.id === h))) continue;
      const definition = isConsumable(id) ? CONSUMABLES[id] : ITEMS[id], owned = supplyCount(state, id);
      const row = document.createElement('div'); row.className = 'equipment-row'; row.dataset.stock = id; row.setAttribute('role', 'group'); row.setAttribute('aria-label', definition.name);
      const bonuses = item ? Object.entries(item.bonuses).filter(([, n]) => n !== 0).map(([stat, n]) => `${stat[0].toUpperCase() + stat.slice(1)} ${n > 0 ? '+' : ''}${n}`).join(' · ') : '';
      row.innerHTML = `<div><h3>${esc(definition.name)}</h3><p>${esc(definition.description)}</p>${bonuses ? `<p>${bonuses} · ${item!.heroes.filter(h => state.party.some(p => p.id === h)).map(h => CHARACTERS[h].name).join(' / ')}</p>` : ''}<small>${owned} owned${item ? ` · ${state.inventory.bag[id as ItemId] ?? 0} in bag` : ''}</small></div>`;
      row.append(ui.button({ label: item?.slot === 'fitting' && owned ? 'Owned' : `Buy · ${supply.cost} marks`, disabled: !canBuy(state, id, shop), action: () => {
        if (!buySupply(state, id, shop)) return;
        message = `${definition.name} added to the bag.`; changed(); render();
        (root.querySelector<HTMLButtonElement>(`[data-stock="${id}"] button:not(:disabled)`) ?? root.querySelector<HTMLButtonElement>('[data-tab="buy"]'))!.focus();
      } })); target.append(row);
    }
  };
  render();
}
