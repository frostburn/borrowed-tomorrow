import { expect, test } from '@playwright/test';
import { TILESET } from '../../src/content/tilemaps';
import { MAPS, walkable } from '../../src/content/maps';
import { receiveItem } from '../../src/rules/inventory';
import { checkpoint } from '../support/progress';
import { capture, dialogue, inspect, nativeScene } from './controls';
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
    await expect.poll(()=>page.evaluate(async({row,front,tileset})=>{
      const actor=new Image();actor.src='/art/nell.png';await actor.decode();
      const pages=await Promise.all(tileset.pages.map(async p=>{const image=new Image();image.src=`/${p.url}`;await image.decode();return image;}));
      const sprite=document.createElement('canvas');sprite.width=80;sprite.height=80;const s=sprite.getContext('2d')!;s.drawImage(actor,0,0);const actorPixels=s.getImageData(0,0,80,80).data;
      const tree=document.createElement('canvas');tree.width=96;tree.height=96;const t=tree.getContext('2d')!;
      for(let y=0;y<4;y++)for(let x=0;x<4;x++){
        const id=tileset.tiles.find(tile=>tile.type===`tree-${x}-${y}`)!.id;
        const i=tileset.pages.findIndex(p=>id+1>=p.firstgid&&id+1<p.firstgid+p.tilecount),p=tileset.pages[i],frame=id+1-p.firstgid;
        t.drawImage(pages[i],frame%p.columns*24,Math.floor(frame/p.columns)*24,24,24,x*24,y*24,24,24);
      }
      const treePixels=t.getImageData(0,0,96,96).data,view=window.borrowedTomorrow.inspect().view,info=window.borrowedTomorrowPixels.inspect();
      const source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
      const output=document.querySelector<HTMLCanvasElement>('.pixel-output')!,actual=output.getContext('2d')!.getImageData(0,0,output.width,output.height).data;
      const left=info.physicalLeft+Math.round((world.left-source.left)/info.cssScale)*info.physicalScale,top=info.physicalTop+Math.round((world.top-source.top)/info.cssScale)*info.physicalScale;
      const actorX=36-40,actorY=(row+.5)*24+7-68;let compared=0,missing=0;
      // The retained actor has fractional alpha. Compose it over the opaque
      // canopy using the source alpha rather than treating it as solid RGB.
      if(front)t.drawImage(actor,actorX,actorY-480);
      const expected=t.getImageData(0,0,96,96).data;
      for(let y=0;y<96;y++)for(let x=0;x<96;x++){
        const sx=x-actorX,sy=480+y-actorY;if(sx<0||sx>=80||sy<0||sy>=80)continue;
        const a=(sy*80+sx)*4,b=(y*96+x)*4;if(actorPixels[a+3]<200||treePixels[b+3]!==255)continue;
        const out=((top+(480+y-view.scrollY)*info.physicalScale)*output.width+left+(x-view.scrollX)*info.physicalScale)*4;
        for(let c=0;c<4;c++)if(Math.abs(actual[out+c]-expected[b+c])>1)missing++;
        compared++;
      }
      return compared>100?missing:-1;
    },{row,front,tileset:TILESET}),{timeout:15000}).toBe(0);
    await capture(page,front?'tile-tree-front':'tile-tree-behind');
  }
});

for(const [device,viewport] of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]] as const){
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
