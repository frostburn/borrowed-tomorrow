import {focusCapacity} from '../rules/improvements';
import './testing-tools.css';
import type { Battle } from '../rules/combat';
import type { UI } from '../game/ui';

interface BattleToolsHost {
  current: () => Battle | undefined;
  initial: () => Battle | undefined;
  apply: (battle: Battle, restart?:boolean) => void;
}

/** Mutate a replacement battle so pending callbacks from the old one are discarded. */
export function renderTestingTools(ui: UI, target: HTMLElement, host: BattleToolsHost) {
  const group = document.createElement('div');
  group.className = 'dev-battle-tools';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Development battle tools');
  const label = document.createElement('small'); label.textContent = 'DEV'; group.append(label);
  const run = (change: (battle: Battle) => void) => {
    const current = host.current();
    if (!current || current.result) return;
    const replacement = structuredClone(current);
    change(replacement);
    host.apply(replacement);
  };
  const disabled = !host.current() || !!host.current()?.result;
  ui.actionRow(group, [
    { label: 'Win battle', disabled, action: () => run(b => {
      for (const unit of b.units) if (unit.side === 'enemy') unit.hp = 0;
      if (b.evacuation) b.evacuation.boarded = b.evacuation.groups;
      b.result = 'victory'; b.log.push('Development tools: battle won.');
    }) },
    { label: 'Lose battle', disabled, action: () => run(b => {
      for (const unit of b.units) if (unit.side === 'party') unit.hp = 0;
      b.result = 'defeat'; b.log.push('Development tools: battle lost.');
    }) },
    { label: 'Refill party', disabled, action: () => run(b => {
      for (const unit of b.units) if (unit.side === 'party') { unit.hp = unit.maxHp; unit.focus = focusCapacity(unit); }
      b.log.push('Development tools: party HP and focus refilled.');
    }) },
    { label: 'Restart battle', disabled: disabled || !host.initial(), action: () => {
      if (host.current()?.result !== null) return;
      const initial = host.initial(); if (initial) host.apply(structuredClone(initial),true);
    } },
  ]);
  target.prepend(group);
}
