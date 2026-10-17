import { expect, type Page } from '@playwright/test';
import { active, damage, legalAim, movement, targets, type Battle, type AbilityId } from '../../src/rules/combat';
import { cells, equal, key as keyFor, toPixel, type Hex } from '../../src/rules/hex';
import { speakerPortrait } from '../../src/content/characters';

export async function inspect(page: Page) { return page.evaluate(()=>window.borrowedTomorrow.inspect()); }
export async function clickWorld(page: Page, x: number, y: number) {
  const box=(await page.locator('#canvas canvas').boundingBox())!,view=(await inspect(page)).view;
  await page.mouse.click(box.x+((x+.5)*24-view.scrollX)*box.width/view.width,box.y+((y+.5)*24-view.scrollY)*box.height/view.height);
}
export async function clickHex(page: Page, h: Hex) {
  const box=(await page.locator('#canvas canvas').boundingBox())!,p=toPixel(h),view=(await inspect(page)).view;
  await page.mouse.click(box.x+(p.x-view.scrollX)*box.width/view.width,box.y+(p.y-view.scrollY)*box.height/view.height);
}
export async function dialogue(page: Page) {
  await expect(page.locator('.dialogue')).toBeVisible({timeout:15000});
  while(await page.locator('.dialogue').isVisible()){
    const who=await page.locator('.dialogue h2').textContent(),portrait=who?speakerPortrait(who):undefined;
    if(portrait){
      const image=page.locator('.dialogue-portrait img');
      await expect(image).toHaveAttribute('src',new RegExp(`/art/${portrait}\\.png$`));
      await expect.poll(()=>image.evaluate(img=>{const i=img as HTMLImageElement;return i.complete&&i.naturalWidth===128&&i.naturalHeight===128;})).toBe(true);
    }
    await page.locator('.dialogue-actions button').first().click();
  }
}
export async function talk(page: Page, x: number, y: number) { await clickWorld(page,x,y);await dialogue(page); }
export async function capture(page: Page, name: string) { if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/${name}.png`}); }

/** Compare an unobstructed native camera crop with the displayed framebuffer. */
export async function nativeScene(page:Page,map:string){
  await expect.poll(()=>page.evaluate(async(name)=>{
    const image=new Image();image.src=`/art/${name}.webp`;await image.decode();
    if(image.naturalWidth!==1536||image.naturalHeight!==1024)return -1;
    const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
    const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
    const reference=document.createElement('canvas');reference.width=32;reference.height=64;
    reference.getContext('2d')!.drawImage(image,view.scrollX+8,view.scrollY+16,32,64,0,0,32,64);
    const expected=reference.getContext('2d')!.getImageData(0,0,32,64).data;
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const left=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+8)*info.physicalScale;
    const top=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+16)*info.physicalScale;
    let missing=0;
    for(let y=0;y<64;y++)for(let x=0;x<32;x++)for(let c=0;c<4;c++){
      const at=((top+y*info.physicalScale)*output.width+left+x*info.physicalScale)*4+c;
      if(actual[at]!==expected[(y*32+x)*4+c])missing++;
    }
    return missing;
  },map),{timeout:15000}).toBe(0);
}

function playerPlan(b: Battle): { action:'move'|AbilityId|'defend';hex?:Hex } {
  const u=active(b)!;
  for(const ally of b.units.filter(v=>v.side==='party'&&v.hp>0&&v.hp<v.maxHp*.45))for(const id of ['bandage','mend'] as AbilityId[])
    if(legalAim(b,u,id,ally.hex))return {action:id,hex:ally.hex};
  let best:{action:AbilityId;hex:Hex;pos:Hex;score:number}|undefined;
  const original=u.hex;
  for(const visit of movement(b,u).values()){
    u.hex=visit.hex;
    for(const id of u.abilities.filter(id=>!['mend','bandage'].includes(id)))for(const h of cells()){
      if(!legalAim(b,u,id,h))continue;
      const score=targets(b,u,id,h).reduce((sum,v)=>sum+(v.side!==u.side?1:-4)*(Math.min(v.hp,damage(u,v,id))+(v.hp<=damage(u,v,id)?8:0)),0)-visit.path.length*.1-(b.vents.has(keyFor(visit.hex))?7:0);
      if(score>0&&(!best||score>best.score))best={action:id,hex:h,pos:visit.hex,score};
    }
  }
  u.hex=original;
  if(!best)return {action:'defend'};
  return equal(best.pos,original)?{action:best.action,hex:best.hex}:{action:'move',hex:best.pos};
}
export async function battle(page: Page, screenshot?: string) {
  await expect.poll(async()=> (await inspect(page)).mode).toBe('battle');
  if(screenshot)await capture(page,screenshot);
  for(let turns=0;turns<260;turns++){
    if(await page.getByRole('heading',{name:'The line is clear',exact:true}).isVisible()){
      await page.getByRole('button',{name:'Continue the journey'}).click();return;
    }
    if(await page.getByRole('heading',{name:'The line can wait'}).isVisible())throw new Error('The party was defeated during the browser playthrough.');
    const snapshot=(await inspect(page)).battle!;
    if(snapshot.result){await page.waitForTimeout(400);continue;}
    const b={...snapshot,obstacles:new Set(snapshot.obstacles),water:new Set(snapshot.water),vents:new Set(snapshot.vents)} as Battle;
    const u=active(b)!;
    if(u.side!=='party'){await page.waitForTimeout(250);continue;}
    const decision=playerPlan(b);
    const label=decision.action==='move'?/^1\s+Move$/:decision.action==='defend'?/^F\s+Defend$/:new RegExp(`^\\d\\s+${decision.action==='burst'?'Lantern burst':decision.action==='steam'?'Steam lance':decision.action==='bandage'?'Bandage':decision.action==='mend'?'Mend':'Strike'}$`);
    const action=page.locator('.actions').getByRole('button',{name:label});
    await expect(action).toBeEnabled();await action.click();
    if(decision.hex){await clickHex(page,decision.hex);if(screenshot&&decision.action==='burst'){await capture(page,'aoe-preview');screenshot=undefined;}await page.getByRole('button',{name:decision.action==='move'?/^Confirm move/:['mend','bandage'].includes(decision.action)?/^Confirm healing$/:/^Confirm attack$/}).click();}
    await page.waitForTimeout(420);
  }
  throw new Error('Battle did not resolve within the turn budget.');
}
