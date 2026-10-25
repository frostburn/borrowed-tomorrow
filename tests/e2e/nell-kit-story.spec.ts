import {test,expect,type Page} from '@playwright/test';
import {chapterSevenRefugeStart} from '../../src/dev/canonical-saves';
import {jungleCheckpoint} from '../support/jungle';
import {arrival} from '../../src/content/maps';
import {importSave} from './navigation';
import {inspect,capture} from './controls';

async function untilPose(page:Page,pose:string){
 for(let i=0;i<24;i++){
  if((await inspect(page)).actors.some(a=>a.texture===pose))return;
  await page.locator('.dialogue-actions button').first().click();
 }
 throw new Error(`Missing ${pose}`);
}
function holiday(){
 const s=chapterSevenRefugeStart();for(const f of ['lastRefugeSeen','benefactorSeen','benefactorBodyConfronted','benefactorBodyWon','hollowSunSeen','benefactorSunConfronted','benefactorSunWon','fragmentReturned','benefactorHeartConfronted','benefactorHeartWon','daysReturned','homecomingSeen'])s.flags[f]=true;
 s.location=arrival('seaholiday','start');return s;
}
for(const [device,viewport]of [['desktop',{width:1280,height:800}],['phone',{width:390,height:844}]]as const)for(const reduced of [false,true])test(`Nell / Kit ${device} ${reduced?'reduced':'moving'}: hug, replay, release and real-sea hands`,async({browser})=>{
 const context=await browser.newContext({viewport,deviceScaleFactor:1.25,reducedMotion:reduced?'reduce':'no-preference'}),page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const s=jungleCheckpoint('nellRecovered');s.activeParty=['orrin','petra','celia'];await page.goto('/');await importSave(page,s);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-rest');
  await untilPose(page,'pair-hug');await page.mouse.move(0,0);await page.waitForTimeout(1000);await capture(page,`hug-${device}-${reduced}`);
  const hugged=await inspect(page);expect(hugged.actors.filter(a=>a.hero==='nell'||a.hero==='kit')).toHaveLength(1);expect(hugged.state.flags.riverRestSeen).toBeUndefined();expect(hugged.state.xp).toBe(s.xp);expect(hugged.state.inventory).toEqual(s.inventory);
  await page.reload();await page.getByRole('button',{name:'Continue',exact:true}).click();await expect.poll(async()=>(await inspect(page)).cinematic).toBe('six-river-rest');await untilPose(page,'pair-hug');
  for(let i=0;i<6;i++)await page.locator('.dialogue-actions button').first().click();
  const release=await inspect(page);expect(release.actors.some(a=>a.hero==='kit'&&a.texture==='kit-rest')).toBe(true);await capture(page,`hug-release-${device}-${reduced}`);
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();const done=await inspect(page);expect(done.state.flags.riverRestSeen).toBe(true);expect(done.state.activeParty).toEqual(s.activeParty);expect(done.state.inventory).toEqual(s.inventory);expect(done.state.xp).toBe(s.xp);expect(done.actors.some(a=>a.texture.startsWith('pair-'))).toBe(false);
  const sea=holiday();sea.activeParty=['orrin','petra','celia'];await importSave(page,sea);await expect.poll(async()=>(await inspect(page)).cinematic).toBe('seven-sea');await untilPose(page,'pair-hands');await page.mouse.move(0,0);await page.waitForTimeout(1100);await capture(page,`hands-${device}-${reduced}`);
  const hands=await inspect(page);expect(hands.actors.filter(a=>a.hero==='nell'||a.hero==='kit')).toHaveLength(1);expect(hands.state.flags.realSeaSeen).toBeUndefined();
  await page.getByRole('button',{name:'Skip scene',exact:true}).click();const end=await inspect(page);expect(end.state.flags.realSeaSeen).toBe(true);expect(end.state.activeParty).toEqual(sea.activeParty);expect(end.state.inventory).toEqual(sea.inventory);expect(end.actors.some(a=>a.texture.startsWith('pair-'))).toBe(false);
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{await context.close();}
});
