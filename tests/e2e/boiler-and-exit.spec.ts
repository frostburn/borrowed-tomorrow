import {expect,test,type Page} from '@playwright/test';
import stalled from '../fixtures/disk-c-boiler-stalled-v4.json' with {type:'json'};
import arrival from '../fixtures/disk-a-v1.json' with {type:'json'};
import {decodeSave} from '../../src/rules/state';
import {importSave,approach,visit} from './navigation';
import {inspect,clickWorld,dialogue,battle,capture} from './controls';

async function walkTo(page:Page,key:string,axis:'x'|'y',goal:number){
  await page.keyboard.down(key);
  try{await expect.poll(async()=>(await inspect(page)).state.location[axis],{intervals:[20],timeout:15000}).toBe(goal);}
  finally{await page.keyboard.up(key);}
  await expect.poll(async()=>(await inspect(page)).moving).toBe(false);
}

for(const width of [1280,390]){
  test(`the supplied boiler checkpoint continues by clicking the painted shed (${width})${width===1280?' @journey':''}`,async({page})=>{
    test.setTimeout(120000);await page.setViewportSize({width,height:844});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('/');await expect(page).toHaveTitle('Borrowed Tomorrow');await importSave(page,stalled);
    await expect.poll(async()=>(await inspect(page)).state.location).toEqual(stalled.location);
    const before=(await inspect(page)).state;expect(before.party).toEqual(stalled.party);expect(before.flags.cTrainHeat).toBe(true);
    // Real movement reveals the shed; click its painted door, not the interaction marker.
    await walkTo(page,'ArrowRight','x',49);await walkTo(page,'ArrowDown','y',20);await walkTo(page,'ArrowRight','x',57);
    await capture(page,`boiler-shed-${width}`);await clickWorld(page,59,13);
    const confront=page.getByRole('button',{name:'Confront the boiler keeper',exact:true});
    await expect(page.locator('.dialogue')).toBeVisible({timeout:15000});
    while(!await confront.isVisible())await page.locator('.dialogue-actions button').first().click();
    await expect(confront).toBeVisible();await expect(confront).toBeInViewport();await capture(page,`boiler-confront-${width}`);
    await confront.click();await expect.poll(async()=>(await inspect(page)).mode).toBe('battle');
    expect((await inspect(page)).battle!.encounter).toBe('c-boiler');expect((await inspect(page)).battle!.vents).toHaveLength(10);
    if(width===1280){
      await battle(page);await expect.poll(async()=>(await inspect(page)).state.flags.cBoilerStopped).toBe(true);
      await visit(page,'c-dispatch');expect((await inspect(page)).state.flags.cCrewAccepted).toBe(true);
      await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();
      await expect.poll(async()=>(await inspect(page)).state.flags.cBoilerStopped).toBe(true);
      expect((await inspect(page)).state.flags.bMillraceChannel).toBe(true);
    }
    expect(errors).toEqual([]);expect(await page.locator('vite-error-overlay').count()).toBe(0);
  });

  test(`Mira stands on the tunnel walkway during the Disk B reveal (${width})`,async({page})=>{
    await page.setViewportSize({width,height:844});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
    const state=decodeSave(JSON.stringify(arrival));state.flags.diskAComplete=false;state.boundary=null;state.location={map:'tunnel',x:35,y:14};
    await importSave(page,state);await expect.poll(async()=>(await inspect(page)).state.location.map).toBe('tunnel');await approach(page,'disk-b');
    await expect.poll(async()=>(await inspect(page)).cinematic).toBe('a-boundary');await page.locator('.dialogue-actions button').click();
    await expect(page.locator('.dialogue h2')).toHaveText('Mira');await page.waitForTimeout(500);await capture(page,`mira-tunnel-${width}`);
    // Match the actual native sprite on the stone apron, left of the sky opening.
    await expect.poll(()=>page.evaluate(async()=>{
      const sprite=new Image();sprite.src='/art/mira.png';await sprite.decode();
      const ref=document.createElement('canvas');ref.width=80;ref.height=80;const rc=ref.getContext('2d')!;rc.drawImage(sprite,0,0);const pixels=rc.getImageData(0,0,80,80).data;
      const floor=new Image();floor.src='/art/tunnel.webp';await floor.decode();
      const canvas=document.querySelector<HTMLCanvasElement>('.phaser-host canvas')!,ctx=canvas.getContext('2d')!,view=window.borrowedTomorrow.inspect().view;
      for(const x of [35,36,37]){
        const left=(x+.5)*24-40,top=14.5*24+7-68;
        rc.clearRect(0,0,80,80);rc.drawImage(floor,left,top,80,80,0,0,80,80);rc.drawImage(sprite,0,0);const expected=rc.getImageData(0,0,80,80).data;
        const actual=ctx.getImageData(Math.round(left-view.scrollX),Math.round(top-view.scrollY),80,80).data;let count=0,matched=0;
        // These sprites have near-opaque alpha, so compare their composited colors.
        for(let i=0;i<pixels.length;i+=4)if(pixels[i+3]>240){count++;if([0,1,2].every(c=>Math.abs(expected[i+c]-actual[i+c])<=1))matched++;}
        if(count>500&&matched/count>.995)return true;
      }
      return false;
    }),{timeout:5000}).toBe(true);
    await dialogue(page);await expect(page.getByRole('heading',{name:'Insert Disk B',exact:true})).toBeVisible();expect(errors).toEqual([]);
  });
}
