import { artPath } from '../../src/content/art-assets';
import { expect, type Page } from '@playwright/test';
import { ABILITIES, active, damage, legalAim, movement, targets, type Battle, type AbilityId } from '../../src/rules/combat';
import { cells, distance, equal, key as keyFor, toPixel, type Hex } from '../../src/rules/hex';
import { speakerPortrait } from '../../src/content/characters';
import { MAPS } from '../../src/content/maps';
import { BATTLE_MAPS } from '../../src/content/battle-maps';
import { layerVisible, properties, TILESET, tileProperties, mapTilePages } from '../../src/content/tilemaps';
import type { MapId } from '../../src/rules/state';
import { visibleSceneArt } from '../../src/content/scene-art';
import { civilianPresentation } from '../../src/content/civilians';

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
      await expect(image).toHaveAttribute('src',new RegExp(`/${artPath(portrait).replaceAll('.','\\.')}$`));
      await expect.poll(()=>image.evaluate(img=>{const i=img as HTMLImageElement;return i.complete&&i.naturalWidth===128&&i.naturalHeight===128;})).toBe(true);
    }
    await page.locator('.dialogue-actions button').first().click();
  }
}
export async function talk(page: Page, x: number, y: number) { await clickWorld(page,x,y);await dialogue(page); }
export async function capture(page: Page, name: string) { if(process.env.BT_QA_SCREENSHOTS)await page.screenshot({path:`${process.env.BT_QA_SCREENSHOTS}/${name}.png`}); }

/** Compare a native camera crop below the cinematic heading with the framebuffer. */
export async function nativeScene(page:Page,map:string,yOffset=0){
  const snapshot=await inspect(page),tiles=snapshot.mode==='battle'?BATTLE_MAPS[snapshot.battle!.encounter]??MAPS[map as MapId]?.tiles:MAPS[map as MapId]?.tiles;
  const layers=tiles?.layers.filter(l=>l.data&&layerVisible(l,snapshot.state)).map(l=>({...l,sorted:!!properties(l).sort}));
  await expect.poll(()=>page.evaluate(async({name,yOffset,tiles,layers,tileset,tileProperties,pieces})=>{
    const image=new Image();if(!tiles){image.src=`/art/${name}.webp`;await image.decode();}
    const pages=tiles?await Promise.all(tileset.pages.map(async p=>{const img=new Image();img.src=`/${p.url}`;await img.decode();return img;})):[];
    const scenery=document.createElement('canvas');scenery.width=tiles?tiles.width*24:image.width;scenery.height=tiles?tiles.height*24:image.height;
    const ctx=scenery.getContext('2d')!;
    if(pieces){
      for(const piece of [...pieces].sort((a,b)=>a.depth-b.depth)){const img=new Image();img.src=`/${piece.url}`;await img.decode();const native=document.createElement('canvas');native.width=img.naturalWidth;native.height=img.naturalHeight;native.getContext('2d')!.drawImage(img,0,0);ctx.drawImage(native,piece.x,piece.y);}
    }else if(tiles){
      const props:{gid:number;x:number;y:number;depth:number}[]=[];
      const draw=(gid:number,x:number,y:number)=>{const i=tileset.pages.findIndex(p=>gid>=p.firstgid&&gid<p.firstgid+p.tilecount),p=tileset.pages[i],id=gid-p.firstgid;ctx.drawImage(pages[i],id%p.columns*24,Math.floor(id/p.columns)*24,24,24,x,y,24,24);};
      for(const layer of layers!)for(let i=0;i<layer.data!.length;i++){
        const gid=layer.data![i];if(!gid)continue;const x=i%tiles.width*24,y=Math.floor(i/tiles.width)*24;
        if(layer.sorted)props.push({gid,x,y,depth:y+Number(tileProperties[gid-1]?.sortOffset??24)});else draw(gid,x,y);
      }
      for(const p of props.sort((a,b)=>a.depth-b.depth))draw(p.gid,p.x,p.y);
    }else ctx.drawImage(image,0,0);
    const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
    const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
    const expected=ctx.getImageData(0,0,scenery.width,scenery.height).data;
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const worldX=Math.round((world.left-source.left)/info.cssScale),worldY=Math.round((world.top-source.top)/info.cssScale),u=info.rasterUnit;
    const sample=(n:number)=>Math.floor(n/u)*u;
    let missing=0,maxDelta=0;const examples:number[][]=[];
    for(let y=48;y<112;y++)for(let x=8;x<40;x++)for(let c=0;c<4;c++){
      const at=((info.physicalTop+(worldY+y)*info.physicalScale)*output.width+info.physicalLeft+(worldX+x)*info.physicalScale)*4+c;
      const sx=Math.round(view.scrollX)+sample(worldX+x)-worldX,sy=Math.round(view.scrollY)+sample(worldY+y)-worldY+(tiles?0:yOffset);
      const want=expected[(sy*scenery.width+sx)*4+c];
      const delta=Math.abs(actual[at]-want);maxDelta=Math.max(maxDelta,delta);if(delta>1){missing++;if(examples.length<5)examples.push([x,y,c,actual[at],want]);}
    }
    return missing?JSON.stringify({missing,maxDelta,examples}):'ok';
  },{name:map,yOffset,tiles,layers,tileset:{...TILESET,pages:mapTilePages(tiles)},tileProperties,pieces:tiles?visibleSceneArt(tiles,snapshot.state):undefined}),{timeout:15000}).toBe('ok');
}

/** Check opaque sprite pixels at their floor position, allowing neighboring actors. */
export async function nativeActor(page:Page,sprite:string,at:{x:number;y:number},maxObscuredFraction=0){
  await expect.poll(()=>page.evaluate(async({spriteUrl,at,fit})=>{
    const actor=new Image();actor.src=spriteUrl;await actor.decode();
    const x=Math.round((at.x+.5)*24)-40,y=Math.round((at.y+.5)*24)+7-68;
    const reference=document.createElement('canvas');reference.width=80;reference.height=80;
    const ctx=reference.getContext('2d')!;
    if(fit){ctx.imageSmoothingEnabled=true;ctx.drawImage(actor,40-actor.width*fit.originX*fit.scale,68-actor.height*fit.originY*fit.scale,actor.width*fit.scale,actor.height*fit.scale);}
    else ctx.drawImage(actor,0,0);
    const expected=ctx.getImageData(0,0,80,80).data;
    const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
    const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
    const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
    const left=info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+x-view.scrollX)*info.physicalScale;
    const top=info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+y-view.scrollY)*info.physicalScale;
    const gx=Math.round((world.left-source.left)/info.cssScale)+x-Math.round(view.scrollX),gy=Math.round((world.top-source.top)/info.cssScale)+y-Math.round(view.scrollY),u=info.rasterUnit;
    let missing=0,compared=0;
    for(let row=0;row<80;row++)for(let col=0;col<80;col++)for(let c=0;c<4;c++){
      // Native exports retain alpha around 250–254; requiring 255 silently
      // skipped whole characters. Allow only the small compositing delta.
      // Filtered edge pixels blend with scenery; compare only opaque interiors
      // there. Older unscaled PNGs also carry intentional alpha around 250.
      const sx=Math.floor((gx+col)/u)*u-gx,sy=Math.floor((gy+row)/u)*u-gy;
      if(sx<0||sy<0||sx>=80||sy>=80||expected[(sy*80+sx)*4+3]<(fit?255:250))continue;
      const index=((top+row*info.physicalScale)*output.width+left+col*info.physicalScale)*4+c;
      compared++;if(Math.abs(actual[index]-expected[(sy*80+sx)*4+c])>6)missing++;
    }
    return compared>=600?missing/compared:1;
  // Phaser's transformed draw and Canvas drawImage use slightly different
  // subpixel rounding at filtered boundaries. Keep geometry assertions exact
  // and allow up to 1% differing color channels for scaled civilian artwork.
  },{spriteUrl:`/${artPath(sprite)}`,at,fit:civilianPresentation(sprite)}),{timeout:15000}).toBeLessThanOrEqual(Math.max(maxObscuredFraction,civilianPresentation(sprite)?0.01:0));
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
