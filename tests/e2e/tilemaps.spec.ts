import { artPath } from '../../src/content/art-assets';
import { expect, test } from '@playwright/test';
import { TILESET, tileProperties, mapTilePages } from '../../src/content/tilemaps';
import { MAPS, walkable } from '../../src/content/maps';
import { receiveItem } from '../../src/rules/inventory';
import { checkpoint } from '../support/progress';
import { capture, clickWorld, dialogue, inspect, nativeActor, nativeScene } from './controls';
import { approach, importSave, travel, visit } from './navigation';

test('phone routes connect the workshop, both river banks, residents and pass recesses',async({page})=>{
  test.setTimeout(180_000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  const yard=checkpoint('orrinJoined');yard.location={map:'yard',x:27,y:15};await importSave(page,yard);
  await nativeScene(page,'yard');await capture(page,'tile-yard-phone');await visit(page,'engine');
  await travel(page,'branch','rillbridge');await dialogue(page);await nativeScene(page,'rillbridge');await capture(page,'tile-river-phone');
  await visit(page,'still-water');await visit(page,'elspeth');await visit(page,'tilda');await capture(page,'tile-bakery-phone');
  await visit(page,'collector');await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  await page.getByRole('button',{name:'Win battle',exact:true}).click();await page.getByRole('button',{name:'Continue the journey',exact:true}).click();
  await visit(page,'release');await capture(page,'tile-collector-released-phone');
  await travel(page,'east-pass','tunnel');await dialogue(page);await visit(page,'sun-mural');await capture(page,'tile-mural-phone');
  await approach(page,'shelter');await page.getByRole('button',{name:'Rest · restore HP and focus',exact:true}).click();await capture(page,'tile-shelter-phone');
  await approach(page,'captain');await dialogue(page);await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
  await nativeScene(page,'tunnel');await capture(page,'tile-pass-battle-phone');expect(errors).toEqual([]);
});

test('native foreground trees occlude actors behind them and yield to actors in front',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  for(const [row,front] of [[22,false],[24,true]] as const){
    const state=checkpoint('festivalSeen');state.location={map:'station',x:1,y:row};await importSave(page,state);
    await expect.poll(()=>page.evaluate(async({row,tileset,tileProperties,map,actorUrl})=>{
      const actor=new Image();actor.src=actorUrl;await actor.decode();
      const pages=await Promise.all(tileset.pages.map(async p=>{const image=new Image();image.src=`/${p.url}`;await image.decode();return image;}));
      const reference=document.createElement('canvas');reference.width=map.width*24;reference.height=map.height*24;const ctx=reference.getContext('2d')!;
      const tree=document.createElement('canvas');tree.width=reference.width;tree.height=reference.height;const t=tree.getContext('2d')!;
      const draw=(context:CanvasRenderingContext2D,gid:number,x:number,y:number)=>{
        const i=tileset.pages.findIndex(p=>gid>=p.firstgid&&gid<p.firstgid+p.tilecount),p=tileset.pages[i],frame=gid-p.firstgid;
        context.drawImage(pages[i],frame%p.columns*24,Math.floor(frame/p.columns)*24,24,24,x,y,24,24);
      };
      const queue:{gid:number;x:number;y:number;depth:number}[]=[];
      for(const layer of map.layers){
        if(!layer.data||!layer.visible||layer.properties?.some(p=>p.name==='requiredFlag'))continue;
        const sorted=layer.properties?.some(p=>p.name==='sort'&&p.value===true);
        for(let i=0;i<layer.data.length;i++){
          const gid=layer.data[i];if(!gid)continue;
          const x=i%map.width*24,y=Math.floor(i/map.width)*24;
          if(sorted){queue.push({gid,x,y,depth:y+Number(tileProperties[gid-1]?.sortOffset??24)});if(String(tileProperties[gid-1]?.name).startsWith('canopy-')&&x<120)draw(t,gid,x,y);}
          else draw(ctx,gid,x,y);
        }
      }
      const actorX=36-40,actorY=(row+.5)*24+7-68;
      queue.push({gid:0,x:actorX,y:actorY,depth:(row+.5)*24+7});
      for(const p of queue.sort((a,b)=>a.depth-b.depth))if(p.gid)draw(ctx,p.gid,p.x,p.y);else ctx.drawImage(actor,p.x,p.y);
      const expected=ctx.getImageData(0,0,reference.width,reference.height).data,canopy=t.getImageData(0,0,tree.width,tree.height).data;
      const sprite=document.createElement('canvas');sprite.width=80;sprite.height=80;sprite.getContext('2d')!.drawImage(actor,0,0);const pixels=sprite.getContext('2d')!.getImageData(0,0,80,80).data;
      const view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
      const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
      const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
      const left=info.physicalLeft+Math.round((world.left-source.left)/info.cssScale)*info.physicalScale,top=info.physicalTop+Math.round((world.top-source.top)/info.cssScale)*info.physicalScale;
      let compared=0,missing=0,maxDelta=0;const examples:number[][]=[];
      for(let sy=0;sy<80;sy++)for(let sx=0;sx<80;sx++){
        const x=actorX+sx,y=actorY+sy;if(x<0||y<0||x>=reference.width||y>=reference.height||y<view.scrollY||y>=view.scrollY+view.height)continue;
        const a=(sy*80+sx)*4,b=(y*tree.width+x)*4;if(pixels[a+3]<200||canopy[b+3]<200)continue;
        const out=((top+(y-view.scrollY)*info.physicalScale)*output.width+left+(x-view.scrollX)*info.physicalScale)*4;
        for(let c=0;c<4;c++){const delta=Math.abs(actual[out+c]-expected[b+c]);maxDelta=Math.max(maxDelta,delta);if(delta>1){missing++;if(examples.length<5)examples.push([x,y,c,actual[out+c],expected[b+c]]);}}
        compared++;
      }
      return compared>100&&!missing?'ok':JSON.stringify({compared,missing,maxDelta,examples});
    },{row,tileset:{...TILESET,pages:mapTilePages(MAPS.station.tiles)},tileProperties,map:MAPS.station.tiles!,actorUrl:`/${artPath('nell')}`}),{timeout:15000}).toBe('ok');
    await capture(page,front?'tile-tree-front':'tile-tree-behind');
  }
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
  test(`actors stand above the bridge deck and cross both banks on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const state=checkpoint('villageSeen');state.activeParty=['nell'];state.location={map:'rillbridge',x:24,y:18};await importSave(page,state);
    // Compare actual opaque actor pixels against her native sprite: the deck
    // used to cover these feet and legs despite the cell being walkable.
    await nativeActor(page,'nell',{x:24,y:18});await capture(page,`tile-bridge-${device}`);
    for(const x of [31,25,19,24]){
      await clickWorld(page,x,18);
      await expect.poll(async()=>{const s=await inspect(page);return !s.moving&&s.state.location.x===x&&s.state.location.y===18;},{timeout:15000}).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test(`current-format Rillbridge saves below the redesigned map restore on ${device}`,async({page})=>{
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.setViewportSize(viewport);await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
    const old=checkpoint('collectorDefeated');old.location={map:'rillbridge',x:31,y:40};old.bandages=7;old.party[0].hp=17;receiveItem(old.inventory,'brass-reflector');
    await importSave(page,old);const restored=(await inspect(page)).state;
    expect(restored.location).toEqual({map:'rillbridge',x:31,y:27});
    expect(restored).toMatchObject({flags:old.flags,inventory:old.inventory,party:old.party,activeParty:old.activeParty,journal:old.journal,coins:old.coins,bandages:7});
    await page.getByRole('button',{name:'Save',exact:true}).click();
    await page.locator('[data-slot="slot-1"]').getByRole('button',{name:'Save',exact:true}).click();await expect(page.getByRole('status')).toContainText('Place saved');
    await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
    await expect.poll(async()=>(await inspect(page)).state.location).toEqual(restored.location);
    expect((await inspect(page)).state.inventory).toEqual(old.inventory);
    await visit(page,'tilda');const after=(await inspect(page)).state;
    expect(walkable(MAPS.rillbridge,after.location.x,after.location.y,after)).toBe(true);expect(after.flags.villageFreed).toBeUndefined();expect(errors).toEqual([]);
  });
}
