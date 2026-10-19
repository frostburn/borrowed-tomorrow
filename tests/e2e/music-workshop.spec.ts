import {test,expect} from '@playwright/test';
import {capture} from './controls';

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1],['phone',{width:390,height:844},1.25]] as const){
 test.describe(`music review on ${device}`,()=>{
  test.use({viewport,deviceScaleFactor:dpr});
  test('auditions spelling-aware pitches, seeks and isolates the real score without saving',async({page})=>{
   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.addInitScript(()=>{
    const state=window as unknown as {pitchStarts:number[]};state.pitchStarts=[];
    const create=AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator=function(){const node=create.call(this),start=node.start.bind(node);node.start=(when=0)=>{state.pitchStarts.push(node.frequency.value);start(when);};return node;};
   });
   await page.goto('/?dev=music');await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');
   await expect(page.getByRole('region',{name:'Music review',exact:true})).toBeVisible();
   await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();
   const starts=()=>page.evaluate(()=>(window as unknown as {pitchStarts:number[]}).pitchStarts);
   const clear=()=>page.evaluate(()=>{(window as unknown as {pitchStarts:number[]}).pitchStarts=[];});
   expect(await starts()).toEqual([]);const stored=await page.evaluate(()=>JSON.stringify(localStorage));
   for(const [group,count]of [['Ch 1',7],['Ch 2',3],['Ch 3',4],['Ch 4',5],['Library',3]] as const){
    await page.getByRole('group',{name:'Cue chapters'}).getByRole('button',{name:group,exact:true}).click();await expect(page.locator('[data-cue]')).toHaveCount(count);
   }
   await page.getByRole('group',{name:'Cue chapters'}).getByRole('button',{name:'Ch 4',exact:true}).click();
   const bar=page.getByRole('spinbutton',{name:'Bar',exact:true});await bar.fill('21');await bar.press('Tab');
   await expect(page.locator('#music-notes')).toContainText('Ab5');await capture(page,`31edo-workshop-${device}`);
   await page.getByRole('button',{name:'Compare C#4 / Db4',exact:true}).click();
   const comparison=await starts();expect(comparison).toHaveLength(6);
   expect(comparison[0]).toBeCloseTo(440*2**(-21/31),2);expect(comparison[3]).toBeCloseTo(440*2**(-20/31),2);
   expect(comparison[3]/comparison[0]).toBeCloseTo(2**(1/31),6);
   await page.getByRole('button',{name:'Stop',exact:true}).click();await clear();
   await expect(page.locator('[data-fifth]')).toHaveCount(31);
   await page.getByRole('button',{name:'Hear fifth F#4',exact:true}).click();
   const fifth=await starts();expect(fifth).toHaveLength(6);expect(fifth[3]/fifth[0]).toBeCloseTo(2**(18/31),6);
   await page.getByRole('button',{name:'Stop',exact:true}).click();
   await bar.fill('32');await bar.press('Tab');await page.getByRole('button',{name:'Play',exact:true}).click();
   await expect(page.locator('#music-position')).toContainText('Playing / bar 32');
   await page.getByRole('group',{name:'Instrument audition'}).getByRole('button',{name:'Bass',exact:true}).click();
   await expect(page.locator('#music-notes tbody')).toContainText('bass');await expect(page.locator('#music-notes tbody')).not.toContainText('reed');
   await page.getByRole('button',{name:'Next bar',exact:true}).click();await expect(bar).toHaveValue('1');
   await page.getByRole('button',{name:'Lower music volume',exact:true}).click();await expect(page.locator('#music-volume')).toHaveText('Volume 70%');
   await page.getByRole('button',{name:'Sound on',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Stopped');
   await page.getByRole('button',{name:'Play',exact:true}).click();await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Character',exact:true}).click();
   await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();await expect(page.getByRole('spinbutton',{name:'Nell level',exact:true})).toHaveValue('1');
   expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   expect(errors).toEqual([]);
  });
 });
}
