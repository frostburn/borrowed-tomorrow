import { expect, type Page } from '@playwright/test';
import { MAPS, visibleObjects, walkable, worldPath } from '../../src/content/maps';
import { inspect, clickWorld, dialogue } from './controls';

export async function importSave(page:Page,state:unknown){
  await page.getByRole('button',{name:/^Save files$|^Save$/}).first().click();
  const chooser=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import save file'}).click();
  await (await chooser).setFiles({name:'arrival.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(state))});
  // Restore closes this dialog only after the save and its region are ready.
  await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:20000});
}
/** Walk the larger maps through visible waypoints; never teleport or mutate the game. */
export async function approach(page:Page,id:string){
  for(let leg=0;leg<30;leg++){
    const {state,view}=await inspect(page),map=MAPS[state.location.map],objects=visibleObjects(map,state),object=objects.find(o=>o.id===id)!;
    expect(object,`Object ${id} in ${map.id}`).toBeTruthy();
    const visible=(p:{x:number;y:number})=>(p.x+.5)*24>view.scrollX+36&&(p.x+.5)*24<view.scrollX+view.width-36&&(p.y+.5)*24>view.scrollY+40&&(p.y+.5)*24<view.scrollY+view.height-36;
    if(visible(object)){await clickWorld(page,object.x,object.y);return;}
    const approaches=[object,{x:object.x-1,y:object.y},{x:object.x+1,y:object.y},{x:object.x,y:object.y-1},{x:object.x,y:object.y+1}];
    const paths=approaches.filter(p=>walkable(map,p.x,p.y,state)).map(p=>worldPath(map,state.location,p,state)).filter(p=>p.length).sort((a,b)=>a.length-b.length);
    const waypoint=[...paths[0]].reverse().find(p=>visible(p)&&objects.every(o=>Math.hypot(o.x-p.x,o.y-p.y)>=1.8));
    expect(waypoint,`Visible waypoint to ${id}`).toBeTruthy();
    await clickWorld(page,waypoint!.x,waypoint!.y);
    await expect.poll(async()=>{const x=await inspect(page);return !x.moving&&x.state.location.x===waypoint!.x&&x.state.location.y===waypoint!.y;},{timeout:20000}).toBe(true);
  }
  throw new Error(`Could not reach ${id}`);
}
export async function visit(page:Page,id:string){await approach(page,id);await dialogue(page);}
export async function travel(page:Page,id:string,map:string){await approach(page,id);await expect.poll(async()=>(await inspect(page)).state.location.map,{timeout:20000}).toBe(map);}
