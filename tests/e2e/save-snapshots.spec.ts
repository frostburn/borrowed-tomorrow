import { test,expect } from '@playwright/test';
import { newGame } from '../../src/rules/state';

for(const slot of ['manual','autosave']){
 test(`${slot} writes capture the state before their first asynchronous wait`,async({page})=>{
  await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');
  const before=newGame();before.coins=37;
  const result=await page.evaluate(async({before,slot})=>{
   // @ts-expect-error Vite serves the actual IndexedDB persistence module.
   const {save,listSaves,checkpoint}:typeof import('../../src/game/saves')=await import('/src/game/saves.ts');
   if(slot==='autosave')checkpoint(before);
   const writing=save(slot,before);
   // A running game can change its state before IndexedDB becomes available.
   before.coins+=99;before.party[0].hp=2;before.journal.push('later');
   await writing;
   return {record:(await listSaves()).find(r=>r.slot===slot),pending:localStorage.getItem('borrowed-tomorrow-pending-checkpoint')};
  },{before,slot});
  expect(result.record?.state).toEqual(before);
  if(slot==='autosave')expect(result.pending).toBeNull();
 });
}
