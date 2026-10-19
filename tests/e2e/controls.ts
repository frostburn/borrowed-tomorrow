import { expect, type Page } from '@playwright/test';
import { ABILITIES, active, damage, legalAim, movement, targets, type Battle, type AbilityId } from '../../src/rules/combat';
import { cells, distance, equal, key as keyFor, toPixel, type Hex } from '../../src/rules/hex';
import { speakerPortrait } from '../../src/content/characters';
import { MAPS } from '../../src/content/maps';
import { CHAPTER_ONE_BATTLES } from '../../src/content/chapter-one/maps';
import { layerVisible, properties, TILESET, tileProperties } from '../../src/content/tilemaps';
import type { MapId } from '../../src/rules/state';

export async function inspect(page: Page) { return page.evaluate(()=>window.borrowedTomorrow.inspect()); }
export async function clickWorld(page: Page, x: number, y: number) {
  const box=(await page.locator('#canvas canvas').boundingBox())!,view=(await inspect(page)).view;
  await page.mouse.click(box.x+((x+.5)*24-view.scrollX)*box.width/view.width,box.y+((y+.5)*24-view.scrollY)*box.height/view.height);
}
export async function clickHex(page: Page, h: Hex) {
  const p=toPixel(h);let view=(await inspect(page)).view;
  for(let pan=0;pan<6&&(p.x<view.scrollX+8||p.x>view.scrollX+view.width-8);pan++){
    await page.getByRole('button',{name:p.x<view.scrollX?'Pan battlefield left':'Pan battlefield right',exact:true}).click();view=(await inspect(page)).view;
  }
  const box=(await page.locator('#canvas canvas').boundingBox())!;
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

/** Compare a native camera crop below the cinematic heading with the framebuffer. */
export async function nativeScene(page:Page,map:string,yOffset=0){
  const snapshot=await inspect(page),tiles=snapshot.mode==='battle'?CHAPTER_ONE_BATTLES[snapshot.battle!.encounter]??MAPS[map as MapId]?.tiles:MAPS[map as MapId]?.tiles;
  const layers=tiles?.layers.filter(l=>l.data&&layerVisible(l,snapshot.state)).map(l=>({...l,sorted:!!properties(l).sort}));
  await expect.poll(()=>page.evaluate(async({name,yOffset,tiles,layers,tileset,tileProperties})=>{
    const image=new Image();image.src=tiles?'/art/chapter-one-tiles.png':`/art/${name}.webp`;await image.decode();
    const scenery=document.createElement('canvas');scenery.width=tiles?tiles.width*24:image.width;scenery.height=tiles?tiles.height*24:image.height;
    const ctx=scenery.getContext('2d')!;
    if(tiles){
      const props:{gid:number;x:number;y:number;depth:number}[]=[];
      const draw=(gid:number,x:number,y:number)=>ctx.drawImage(image,(gid-1)%tileset.columns*24,Math.floor((gid-1)/tileset.columns)*24,24,24,x,y,24,24);
      for(const layer of layers!)for(let i=0;i<layer.data!.length;i++){
        const gid=layer.data![i];if(!gid)continue;const x=i%tiles.width*24,y=Math.floor(i/tiles.width)*24;
        if(layer.sorted)props.push({gid,x,y,depth:y+Number(tileProperties[gid-1]?.sortOffset??(tileProperties[gid-1]?.name==='lamp-top'?48:24))});else draw(gid,x,y);
      }
      for(const p of props.sort((a,b)=>a.depth-b.depth))draw(p.gid,p.x,p.y);
    }else ctx.drawImage(image,0,0);
    const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
    const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
    const reference=document.createElement('canvas');reference.width=32;reference.height=64;
    reference.getContext('2d')!.drawImage(scenery,Math.round(view.scrollX)+8,Math.round(view.scrollY)+48+(tiles?0:yOffset),32,64,0,0,32,64);
    const expected=reference.getContext('2d')!.getImageData(0,0,32,64).data;
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const left=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+8)*info.physicalScale;
    const top=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+48)*info.physicalScale;
    let missing=0;
    for(let y=0;y<64;y++)for(let x=0;x<32;x++)for(let c=0;c<4;c++){
      const at=((top+y*info.physicalScale)*output.width+left+x*info.physicalScale)*4+c;
      if(actual[at]!==expected[(y*32+x)*4+c])missing++;
    }
    return missing;
  },{name:map,yOffset,tiles,layers,tileset:TILESET,tileProperties}),{timeout:15000}).toBe(0);
}

/** Check opaque sprite pixels at their floor position, allowing neighboring actors. */
export async function nativeActor(page:Page,sprite:string,at:{x:number;y:number}){
  await expect.poll(()=>page.evaluate(async({sprite,at})=>{
    const actor=new Image();actor.src=`/art/${sprite}.png`;await actor.decode();
    const x=Math.round((at.x+.5)*24)-40,y=Math.round((at.y+.5)*24)+7-68;
    const reference=document.createElement('canvas');reference.width=80;reference.height=80;
    const ctx=reference.getContext('2d')!;ctx.drawImage(actor,0,0);
    const expected=ctx.getImageData(0,0,80,80).data;
    const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
    const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const left=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+x-view.scrollX)*info.physicalScale;
    const top=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+y-view.scrollY)*info.physicalScale;
    let missing=0;
    for(let row=0;row<80;row++)for(let col=0;col<80;col++)for(let c=0;c<4;c++){
      if(expected[(row*80+col)*4+3]!==255)continue;
      const index=((top+row*info.physicalScale)*output.width+left+col*info.physicalScale)*4+c;
      if(actual[index]!==expected[(row*80+col)*4+c])missing++;
    }
    return missing;
  },{sprite,at}),{timeout:15000}).toBe(0);
}

function playerPlan(b: Battle): { action:'move'|AbilityId|'defend';hex?:Hex } {
  const u=active(b)!;
  for(const ally of b.units.filter(v=>v.side==='party'&&v.hp>0&&v.hp<v.maxHp*.45))for(const id of ['bandage','mend','beacon'] as AbilityId[])
    if(legalAim(b,u,id,ally.hex))return {action:id,hex:ally.hex};
  if(b.grounding&&!b.grounding.open){
    const plate=b.grounding.plates[u.id==='nell'?0:1];
    const best=[...movement(b,u).values()].sort((a,z)=>distance(a.hex,plate)-distance(z.hex,plate)||a.cost-z.cost)[0];
    if(best&&distance(best.hex,plate)<distance(u.hex,plate))return {action:'move',hex:best.hex};
    return {action:'defend'};
  }
  let best:{action:AbilityId;hex:Hex;pos:Hex;score:number}|undefined;
  const original=u.hex;
  for(const visit of movement(b,u).values()){
    u.hex=visit.hex;
    for(const id of u.abilities.filter(id=>!ABILITIES[id].heal && !['guard','dazzle'].includes(id)))for(const h of cells()){
      if(!legalAim(b,u,id,h))continue;
      const score=targets(b,u,id,h).reduce((sum,v)=>sum+(v.side!==u.side?1:-4)*(Math.min(v.hp,damage(u,v,id))+(v.hp<=damage(u,v,id)?8:0)),0)-visit.path.length*.1-(b.vents.has(keyFor(visit.hex))?7:0);
      if(score>0&&(!best||score>best.score))best={action:id,hex:h,pos:visit.hex,score};
    }
  }
  u.hex=original;
  if(!best)return {action:'defend'};
  return equal(best.pos,original)?{action:best.action,hex:best.hex}:{action:'move',hex:best.pos};
}
export async function battle(page: Page, screenshot?: string, practice=false) {
  await expect.poll(async()=> (await inspect(page)).mode).toBe('battle');
  if(screenshot)await capture(page,screenshot);
  for(let turns=0;turns<260;turns++){
    if(await page.getByRole('heading',{name:practice?'Practice complete':'The line is clear',exact:true}).isVisible()){
      const snapshot=await inspect(page);
      if(snapshot.battle?.grounding){expect(snapshot.battle.grounding.open).toBe(true);expect(snapshot.battle.units.some(u=>u.sealed)).toBe(false);await capture(page,'northglass-shield-released');}
      await page.getByRole('button',{name:practice?'Back to workshop':'Continue the journey'}).click();return;
    }
    if(await page.getByRole('heading',{name:practice?'Practice defeated':'The line can wait'}).isVisible())throw new Error('The party was defeated during the browser playthrough.');
    const snapshot=(await inspect(page)).battle!;
    if(snapshot.result){await page.waitForTimeout(400);continue;}
    const b={...snapshot,obstacles:new Set(snapshot.obstacles),water:new Set(snapshot.water),vents:new Set(snapshot.vents)} as Battle;
    const u=active(b)!;
    if(u.side!=='party'){await page.waitForTimeout(250);continue;}
    const decision=playerPlan(b);
    const label=decision.action==='move'?/^1\s+Move$/:decision.action==='defend'?/^F\s+Defend$/:new RegExp(`^\\d\\s+${ABILITIES[decision.action].name}${ABILITIES[decision.action].bonus?' · Extra':''}$`);
    const action=page.locator('.actions').getByRole('button',{name:label});
    await expect(action).toBeEnabled();await action.click();
    if(decision.hex && decision.action!=='defend'){await clickHex(page,decision.hex);if(screenshot&&decision.action==='burst'){await capture(page,'aoe-preview');screenshot=undefined;}await page.getByRole('button',{name:decision.action==='move'?/^Confirm move/:ABILITIES[decision.action].heal?/^Confirm healing$/:ABILITIES[decision.action].effect && ABILITIES[decision.action].effect!=='push'?/^Confirm ability$/:/^Confirm attack$/}).click();}
    await page.waitForTimeout(420);
  }
  throw new Error('Battle did not resolve within the turn budget.');
}
