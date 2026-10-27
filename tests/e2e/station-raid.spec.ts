import {test,expect} from '@playwright/test';
import {checkpoint} from '../support/progress';
import {importSave,approach} from './navigation';
import {inspect,capture} from './controls';
test.setTimeout(30000);
for(const [name,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)test(`guests retreat and a hound enters the first square on ${name}`,async({page})=>{
 await page.setViewportSize(viewport);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,checkpoint('festivalSeen'));await approach(page,'tomas');
 await expect.poll(async()=>(await inspect(page)).cinematic).toBe('one-raid');
 expect((await inspect(page)).people.find(p=>p.id==='raid-hound')).toBeUndefined();
 for(let i=0;i<3;i++)await page.locator('.dialogue-actions button').first().click();
 const first=(await inspect(page)).people.find(p=>p.id==='festival-traveler')!;
 await expect.poll(async()=>(await inspect(page)).people.find(p=>p.id==='festival-traveler')?.x).not.toBe(first.x);
 expect((await inspect(page)).people.find(p=>p.id==='festival-traveler')?.texture).toBe('civilian-traveler');
 await capture(page,`raid-guests-leaving-${name}`);
 await expect.poll(async()=>(await inspect(page)).people.filter(p=>p.id.startsWith('festival-')).every(p=>p.alpha===0),{timeout:8000}).toBe(true);
 while(!(await page.locator('.dialogue-copy p').textContent())?.includes('hounds are coming'))await page.locator('.dialogue-actions button').first().click();
 const start=(await inspect(page)).people.find(p=>p.id==='raid-hound')!;expect(start).toBeDefined();
 await expect.poll(async()=>(await inspect(page)).people.find(p=>p.id==='raid-hound')?.x).not.toBe(start.x);
 await expect.poll(async()=>{const h=(await inspect(page)).people.find(p=>p.id==='raid-hound');return h?.x===492&&h.y===355;},{timeout:8000}).toBe(true);
 await capture(page,`raid-hound-arrived-${name}`);expect((await inspect(page)).state.flags.raidSeen).toBeUndefined();
 await page.locator('.dialogue-actions button').first().click();await page.locator('.dialogue-actions button').first().click();
 const done=await inspect(page);expect(done.state.flags.raidSeen).toBe(true);expect(done.people).toEqual([]);
 await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).state.flags.raidSeen).toBe(true);
 expect((await inspect(page)).cinematic).toBeNull();expect((await inspect(page)).people).toEqual([]);await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
});
test('reduced motion and immediate skip retain the same raid checkpoint',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await importSave(page,checkpoint('festivalSeen'));await approach(page,'tomas');
 for(let i=0;i<3;i++)await page.locator('.dialogue-actions button').first().click();
 expect((await inspect(page)).people.filter(p=>p.id.startsWith('festival-')).every(p=>p.alpha===0)).toBe(true);
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();expect((await inspect(page)).state.flags.raidSeen).toBe(true);expect((await inspect(page)).people).toEqual([]);
});

test('skipping mid-retreat removes the raid tweens and temporary hound',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await importSave(page,checkpoint('festivalSeen'));await approach(page,'tomas');
 for(let i=0;i<3;i++)await page.locator('.dialogue-actions button').first().click();
 await page.getByRole('button',{name:'Skip scene',exact:true}).click();const state=(await inspect(page)).state;
 await page.waitForTimeout(700);const end=await inspect(page);expect(end.cinematic).toBeNull();expect(end.people).toEqual([]);expect(end.state.flags.raidSeen).toBe(true);expect(end.state.party).toEqual(state.party);expect(errors).toEqual([]);
});
