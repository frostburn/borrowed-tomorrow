import { ORRIN_PROPORTIONS, KIT_PROPORTIONS, PETRA_PROPORTIONS } from '../../src/art/rig-proportions';
// Browser plugin not available; exercise the native review through repository Playwright.
import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { project } from '../../src/art/actor-space';
import { LEG_COLORS } from '../../src/art/walk-cycle';
import { renderLayers } from '../../src/art/layered-sprite';
import { referenceRigFrame, type ReferenceWeapon } from '../../src/art/reference-rig';
import { referenceLayers, REFERENCE_ARM_LAYERS, REFERENCE_LAYERS } from '../../src/dev/reference-actor';
import type { ActorDirection } from '../../src/content/actors';
import { capture } from './controls';

async function nativeFrame(page:Page,frame:number,direction:ActorDirection='right',visible:ReadonlySet<string>=new Set(REFERENCE_LAYERS),anatomy=true,weapon:ReferenceWeapon='lantern'){
  const pixels=Array.from(renderLayers(referenceLayers(referenceRigFrame(frame,weapon),anatomy),direction,visible));
  await expect.poll(()=>page.locator('#reference-detail').evaluate((element,pixels)=>{
    const expected=document.createElement('canvas');expected.width=expected.height=240;const ctx=expected.getContext('2d')!;ctx.imageSmoothingEnabled=false;
    for(let y=0;y<240;y+=8)for(let x=0;x<240;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#234047':'#182b32';ctx.fillRect(x,y,8,8);}
    const source=document.createElement('canvas');source.width=source.height=80;source.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(pixels),80,80),0,0);ctx.drawImage(source,0,0,240,240);
    const actual=(element as HTMLCanvasElement).getContext('2d')!.getImageData(0,0,240,240).data,wanted=ctx.getImageData(0,0,240,240).data;
    return actual.reduce((n,value,i)=>n+Number(value!==wanted[i]),0);
  },pixels)).toBe(0);
}

async function nativeHero(page:Page,hero:'nell'|'orrin'|'kit'|'petra',frame:number,direction:ActorDirection){
  await expect.poll(()=>page.locator('#reference-detail').evaluate(async(element,{hero,frame,direction})=>{
    const image=new Image();image.src=`/art/animation/${hero}-${direction}.png`;await image.decode();
    const expected=document.createElement('canvas');expected.width=expected.height=240;const ctx=expected.getContext('2d')!;ctx.imageSmoothingEnabled=false;
    for(let y=0;y<240;y+=8)for(let x=0;x<240;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#234047':'#182b32';ctx.fillRect(x,y,8,8);}
    ctx.drawImage(image,frame%2*80,Math.floor(frame/2)*80,80,80,0,0,240,240);
    const wanted=ctx.getImageData(0,0,240,240).data,actual=(element as HTMLCanvasElement).getContext('2d')!.getImageData(0,0,240,240).data;
    return actual.reduce((n,value,i)=>n+Number(value!==wanted[i]),0);
  },{hero,frame,direction})).toBe(0);
}

for(const [device,viewport,dpr] of [['desktop',{width:1280,height:800},1.25],['phone',{width:390,height:844},1]] as const){
  test.describe(`layered reference on ${device}`,()=>{
    test.use({viewport,deviceScaleFactor:dpr});
    test('plays a complete walk, isolates layers and exports native frames without saving',async({page})=>{
      const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/?dev=animation');
      await expect(page).toHaveTitle('Borrowed Tomorrow · Character workshop');expect(new URL(page.url()).searchParams.get('dev')).toBe('animation');
      const review=page.getByRole('region',{name:'Layered animation reference',exact:true}),host=page.locator('#animation-workshop');
      await expect(review).toBeVisible();await expect(page.locator('vite-error-overlay')).toHaveCount(0);
      const stored=await page.evaluate(()=>JSON.stringify(localStorage));
      // Check the visible compositor too: closed details have measurable child
      // boxes even though the browser's disclosure slot hides their contents.
      await review.locator('#reference-proportions summary').evaluate(summary=>{
        const probe=document.createElement('div');probe.id='closed-disclosure-probe';
        probe.style.cssText='height:24px;background:rgb(197,21,153)';summary.after(probe);
      });
      const probePixels=()=>page.locator('.pixel-output').evaluate(element=>{
        const canvas=element as HTMLCanvasElement,pixels=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
        let count=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]===197&&pixels[i+1]===21&&pixels[i+2]===153)count++;return count;
      });
      await expect.poll(probePixels).toBe(0);
      await review.locator('#reference-proportions summary').click();
      await page.locator('#closed-disclosure-probe').scrollIntoViewIfNeeded();
      await expect.poll(probePixels).toBeGreaterThan(500);
      await review.locator('#reference-proportions summary').click();
      await expect.poll(probePixels).toBe(0);
      await page.locator('#closed-disclosure-probe').evaluate(element=>element.remove());

      const frames=await host.evaluate(h=>new Promise<string[]>(resolve=>{const seen=new Set<string>(),start=performance.now();const tick=()=>{seen.add((h as HTMLElement).dataset.frame!);if(seen.size===6||performance.now()-start>2000)resolve([...seen]);else requestAnimationFrame(tick);};tick();}));
      expect(new Set(frames)).toEqual(new Set(['0','1','2','3','4','5']));
      await review.getByRole('button',{name:'Pause',exact:true}).click();const paused=await host.getAttribute('data-frame');await page.waitForTimeout(160);expect(await host.getAttribute('data-frame')).toBe(paused);
      while(await host.getAttribute('data-frame')!=='0')await review.getByRole('button',{name:'Next frame',exact:true}).click();
      for(let frame=0;frame<6;frame++){await nativeFrame(page,frame);await review.getByRole('button',{name:'Next frame',exact:true}).click();}
      await expect(host).toHaveAttribute('data-frame','0');await review.getByRole('button',{name:'Previous frame',exact:true}).click();await expect(host).toHaveAttribute('data-frame','5');await review.getByRole('button',{name:'Next frame',exact:true}).click();
      for(const weapon of ['none','lantern','lance','crossbow','saber'] as const){
        await review.locator(`[data-reference-weapon="${weapon}"]`).click();await expect(host).toHaveAttribute('data-weapon',weapon);
        await expect(review.locator(`[data-reference-weapon="${weapon}"]`)).toHaveAttribute('aria-pressed','true');
        for(const direction of ['front','left','right','back'] as const){await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:direction[0].toUpperCase()+direction.slice(1),exact:true}).click();await nativeFrame(page,0,direction,new Set(REFERENCE_LAYERS),true,weapon);}
      }
      await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:'Right',exact:true}).click();
      await review.locator('[data-reference-weapon="lance"]').click();
      for(let frame=0;frame<6;frame++){await nativeFrame(page,frame,'right',new Set(REFERENCE_LAYERS),true,'lance');await review.getByRole('button',{name:'Next frame',exact:true}).click();}
      await review.locator('[data-reference-weapon="lantern"]').click();
      await review.getByRole('button',{name:'Arms and weapon',exact:true}).click();await expect(review.getByRole('button',{name:'Arms and weapon',exact:true})).toHaveAttribute('aria-pressed','false');
      await nativeFrame(page,0,'right',new Set(REFERENCE_LAYERS.filter(id=>!REFERENCE_ARM_LAYERS.some(arm=>arm===id))));
      await review.getByRole('button',{name:'Arms and weapon',exact:true}).click();await nativeFrame(page,0);
      await review.getByRole('button',{name:'Anatomy colors',exact:true}).click();await nativeFrame(page,0,'right',new Set(REFERENCE_LAYERS),false);await review.getByRole('button',{name:'Anatomy colors',exact:true}).click();
      await review.getByRole('button',{name:'Show Left Shin',exact:true}).click();await nativeFrame(page,0,'right',new Set(REFERENCE_LAYERS.filter(id=>id!=='left-shin')));
      await review.getByRole('button',{name:'Solo Right Foot',exact:true}).click();await expect(host).toHaveAttribute('data-layers','right-foot');await nativeFrame(page,0,'right',new Set(['right-foot']));
      const pngEvent=page.waitForEvent('download');await review.getByRole('button',{name:'Export six frames PNG',exact:true}).click();const png=await pngEvent,bytes=await readFile((await png.path())!);
      expect(png.suggestedFilename()).toBe('reference-lantern-right-right-foot-walk.png');expect([bytes.readUInt32BE(16),bytes.readUInt32BE(20)]).toEqual([160,240]);
      for(const weapon of ['lantern','lance'] as const){
        await review.getByRole('button',{name:'Solo Right Weapon',exact:true}).click();await review.locator(`[data-reference-weapon="${weapon}"]`).click();
        await expect(host).toHaveAttribute('data-layers','right-weapon');await nativeFrame(page,0,'right',new Set(['right-weapon']),true,weapon);
        const event=page.waitForEvent('download');await review.getByRole('button',{name:'Export six frames PNG',exact:true}).click();const download=await event,content=await readFile((await download.path())!);
        expect(download.suggestedFilename()).toBe(`reference-${weapon}-right-right-weapon-walk.png`);expect([content.readUInt32BE(16),content.readUInt32BE(20)]).toEqual([160,240]);
        await review.getByRole('button',{name:'Show all layers',exact:true}).click();
      }
      await review.locator('[data-reference-weapon="lantern"]').click();
      const jsonEvent=page.waitForEvent('download');await review.getByRole('button',{name:'Export pose data',exact:true}).click();const json=await jsonEvent,data=JSON.parse(await readFile((await json.path())!,'utf8'));
      expect(data.anchor).toEqual([40,68]);expect(data.layers).toEqual([...REFERENCE_LAYERS]);expect(data.frames).toHaveLength(6);
      expect(data.version).toBe(5);expect(data.skin).toBe('reference');expect(data.weapon).toBe('lantern');expect(data.frames[0].pose.left.foot.contact).toBe('heel');expect(data.frames[3].pose.left.foot.contact).toBe('toe');
      expect(data.frames[0].pose.left.foot.heel.z).toBeCloseTo(0);expect(data.frames[3].pose.left.foot.toe.z).toBeCloseTo(0);
      for(const frame of data.frames){expect(frame.pose.weapon.hand).toBe('right');expect(frame.pose.weapon.grip).toEqual(frame.pose.arms.right.grip);expect(frame.pose.arms.left.shoulder.x).toBeLessThan(0);expect(frame.pose.arms.right.shoulder.x).toBeGreaterThan(0);}
      await review.getByRole('button',{name:'Show all layers',exact:true}).click();await nativeFrame(page,0);
      await expect(review.getByRole('group',{name:'Reference skin',exact:true}).getByRole('button',{name:'Nell',exact:true})).toHaveCount(0);
      await review.getByRole('group',{name:'Reference skin',exact:true}).getByRole('button',{name:'Orrin',exact:true}).click();
      await expect(host).toHaveAttribute('data-skin','orrin');await expect(host).toHaveAttribute('data-weapon','lance');
      await expect(review.locator('[data-reference-weapon="lantern"]')).toBeDisabled();
      for(const direction of ['front','left','right','back'] as const){
        await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:direction[0].toUpperCase()+direction.slice(1),exact:true}).click();
        for(let frame=0;frame<6;frame++){await nativeHero(page,'orrin',frame,direction);await review.getByRole('button',{name:'Next frame',exact:true}).click();}
      }
      const orrinJson=page.waitForEvent('download');await review.getByRole('button',{name:'Export pose data',exact:true}).click();const orrinData=JSON.parse(await readFile((await(await orrinJson).path())!,'utf8'));
      expect(orrinData.skin).toBe('orrin');expect(orrinData.cycleDistance).toBe(ORRIN_PROPORTIONS.strideDistance);expect(orrinData.weapon).toBe('lance');
      expect(orrinData.frames[0].pose.weapon.grip).toEqual(orrinData.frames[0].pose.arms.right.grip);
      await review.getByRole('button',{name:'Solo Right Weapon',exact:true}).click();
      const contacts=(['left','right'] as const).map(side=>{
        const foot=orrinData.frames[0].pose[side].foot,point=project(foot.contact==='heel'?foot.heel:foot.toe,'back'),rgb=LEG_COLORS[side];
        return {x:Math.round(point.x)+120,y:Math.round(point.y)+22,rgb:[rgb>>16&255,rgb>>8&255,rgb&255]};
      });
      await expect.poll(()=>page.locator('#reference-floor').evaluate((element,contacts)=>{
        const ctx=(element as HTMLCanvasElement).getContext('2d')!;
        return contacts.every(({x,y,rgb})=>{const actual=ctx.getImageData(x,y,1,1).data;return rgb.every((value,i)=>value===actual[i]);});
      },contacts)).toBe(true);
      const lanceEvent=page.waitForEvent('download');await review.getByRole('button',{name:'Export six frames PNG',exact:true}).click();expect((await lanceEvent).suggestedFilename()).toBe('orrin-back-right-weapon-walk.png');
      await review.getByRole('button',{name:'Show all layers',exact:true}).click();
      await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:'Right',exact:true}).click();await nativeHero(page,'orrin',0,'right');
      await page.locator('#reference-detail').scrollIntoViewIfNeeded();await capture(page,`orrin-rig-${device}`);
      await review.getByRole('group',{name:'Reference skin',exact:true}).getByRole('button',{name:'Kit',exact:true}).click();
      await expect(host).toHaveAttribute('data-skin','kit');await expect(host).toHaveAttribute('data-weapon','crossbow');
      for(const direction of ['front','left','right','back'] as const){
        await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:direction[0].toUpperCase()+direction.slice(1),exact:true}).click();
        for(let frame=0;frame<6;frame++){await nativeHero(page,'kit',frame,direction);await review.getByRole('button',{name:'Next frame',exact:true}).click();}
      }
      const kitJson=page.waitForEvent('download');await review.getByRole('button',{name:'Export pose data',exact:true}).click();
      const kitData=JSON.parse(await readFile((await(await kitJson).path())!,'utf8'));
      expect(kitData.skin).toBe('kit');expect(kitData.weapon).toBe('crossbow');expect(kitData.cycleDistance).toBe(KIT_PROPORTIONS.strideDistance);
      expect(kitData.frames[0].pose.satchel.anchor.x).toBeLessThan(0);expect(kitData.frames[0].pose.weapon.grip).toEqual(kitData.frames[0].pose.arms.right.grip);
      await review.getByRole('button',{name:'Solo Satchel',exact:true}).click();
      const satchel=page.waitForEvent('download');await review.getByRole('button',{name:'Export six frames PNG',exact:true}).click();expect((await satchel).suggestedFilename()).toBe('kit-back-satchel-walk.png');
      await review.getByRole('button',{name:'Show all layers',exact:true}).click();
      await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:'Right',exact:true}).click();await nativeHero(page,'kit',0,'right');
      await page.locator('#reference-detail').scrollIntoViewIfNeeded();await capture(page,`kit-rig-${device}`);
      await review.getByRole('group',{name:'Reference skin',exact:true}).getByRole('button',{name:'Petra',exact:true}).click();
      await expect(host).toHaveAttribute('data-skin','petra');await expect(host).toHaveAttribute('data-weapon','saber');
      for(const direction of ['front','left','right','back'] as const){
        await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:direction[0].toUpperCase()+direction.slice(1),exact:true}).click();
        for(let frame=0;frame<6;frame++){await nativeHero(page,'petra',frame,direction);await review.getByRole('button',{name:'Next frame',exact:true}).click();}
      }
      const petraJson=page.waitForEvent('download');await review.getByRole('button',{name:'Export pose data',exact:true}).click();
      const petraData=JSON.parse(await readFile((await(await petraJson).path())!,'utf8'));
      expect(petraData.skin).toBe('petra');expect(petraData.cycleDistance).toBe(PETRA_PROPORTIONS.strideDistance);
      expect(petraData.frames[0].pose.weapon.grip).toEqual(petraData.frames[0].pose.arms.right.grip);
      expect(petraData.frames[0].pose.shield.grip).toEqual(petraData.frames[0].pose.arms.left.grip);
      await review.getByRole('group',{name:'Reference facing',exact:true}).getByRole('button',{name:'Right',exact:true}).click();await nativeHero(page,'petra',0,'right');
      await page.locator('#reference-detail').scrollIntoViewIfNeeded();await capture(page,`petra-rig-${device}`);
      await review.getByRole('group',{name:'Reference skin',exact:true}).getByRole('button',{name:'Mannequin',exact:true}).click();await nativeFrame(page,0);
      await review.locator('#reference-proportions summary').click();
      await review.getByRole('button',{name:'Match Kit proportions',exact:true}).click();
      await expect(review.getByRole('spinbutton',{name:'Leg bone',exact:true})).toHaveValue('10');
      await expect(review.getByRole('spinbutton',{name:'Stride distance',exact:true})).toHaveValue('26');
      await review.getByRole('button',{name:'Match Nell proportions',exact:true}).click();
      await expect(review.getByRole('spinbutton',{name:'Leg bone',exact:true})).toHaveValue('9');
      const compact=await page.locator('#reference-detail').evaluate(e=>(e as HTMLCanvasElement).toDataURL());
      await review.getByRole('spinbutton',{name:'Hip spacing',exact:true}).fill('3.5');await review.getByRole('spinbutton',{name:'Hip spacing',exact:true}).press('Tab');
      await expect.poll(()=>page.locator('#reference-detail').evaluate(e=>(e as HTMLCanvasElement).toDataURL())).not.toBe(compact);
      await review.getByRole('spinbutton',{name:'Leg bone',exact:true}).fill('5');await review.getByRole('spinbutton',{name:'Leg bone',exact:true}).press('Tab');
      await expect(review.locator('#reference-proportion-error')).toContainText('Legs cannot reach');
      await expect(review.getByRole('spinbutton',{name:'Leg bone',exact:true})).toHaveValue('9');
      await review.getByRole('spinbutton',{name:'Arm thickness (x)',exact:true}).fill('1.2');await review.getByRole('spinbutton',{name:'Arm thickness (x)',exact:true}).press('Tab');
      const customEvent=page.waitForEvent('download');await review.getByRole('button',{name:'Export pose data',exact:true}).click();
      const custom=JSON.parse(await readFile((await(await customEvent).path())!,'utf8'));
      expect(custom.proportions.armWidth).toBe(1.2);expect(custom.proportions.hipHalfWidth).toBe(3.5);expect(custom.cycleDistance).toBe(24);
      await review.getByRole('button',{name:'Reset proportions',exact:true}).click();await nativeFrame(page,0);
      await review.locator('#reference-proportions summary').click();
      await review.getByRole('button',{name:'Joint guides',exact:true}).click();await review.getByRole('button',{name:'Next frame',exact:true}).click();await review.getByRole('button',{name:'Next frame',exact:true}).click();
      await page.locator('#reference-detail').scrollIntoViewIfNeeded();await capture(page,`layered-reference-${device}`);
      expect(await page.locator('.inventory-panel').evaluate(p=>p.scrollWidth<=p.clientWidth)).toBe(true);
      const old=await host.elementHandle(),paint=await host.getAttribute('data-paint');
      await page.getByRole('navigation',{name:'Workshop panels',exact:true}).getByRole('button',{name:'Sprites',exact:true}).click();await page.waitForTimeout(160);
      expect(await old!.evaluate(h=>(h as HTMLElement).dataset.paint)).toBe(paint);expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(errors).toEqual([]);
    });
  });
}
