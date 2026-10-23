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
   for(const [group,count]of [['Ch 1',7],['Ch 2',6],['Ch 3',4],['Ch 4',5],['Library',2]] as const){
    await page.getByRole('group',{name:'Cue chapters'}).getByRole('button',{name:group,exact:true}).click();await expect(page.locator('[data-cue]')).toHaveCount(count);
   }
   // Six character references use real campaign cues, without a chapter playthrough.
   await page.getByRole('button',{name:'Themes',exact:true}).click();await expect(page.locator('[data-cue]')).toHaveCount(6);
   for(const [cue,character]of [['station','Nell'],['hammerplain','Orrin'],['coast','Kit'],['dawnwatch','Petra'],['flagship','Alban'],['windmere','Celia']]){
    await expect(page.locator(`[data-cue="${cue}"] span`)).toHaveText(character);await page.locator(`[data-cue="${cue}"]`).click();await expect(page.locator('.music-theme')).toContainText(character);
    await expect(page.locator('.music-review .music-description').first()).toContainText(cue==='windmere'?'3/4':cue==='flagship'?'10/8':'4/4');
   }
   await page.getByRole('button',{name:'Play',exact:true}).click();await expect(page.locator('#music-position')).toContainText('Playing');
   await page.getByRole('button',{name:'Next bar',exact:true}).click();await expect(page.getByRole('spinbutton',{name:'Bar',exact:true})).toHaveValue('2');await expect(page.locator('#music-notes-title')).toHaveText('Bar 2 / 32');
   await page.getByRole('button',{name:'Restart cue',exact:true}).click();await expect(page.getByRole('spinbutton',{name:'Bar',exact:true})).toHaveValue('1');await expect(page.locator('#music-notes-title')).toHaveText('Bar 1 / 32');await expect(page.locator('#music-notes')).toContainText('Ab5');
   await page.getByRole('button',{name:'Stop',exact:true}).click();await capture(page,`new-character-themes-${device}`);await clear();
   await page.getByRole('group',{name:'Cue chapters'}).getByRole('button',{name:'Ch 4',exact:true}).click();await page.locator('[data-cue="refuge"]').click();

   const bar=page.getByRole('spinbutton',{name:'Bar',exact:true});await bar.fill('21');await bar.press('Tab');
   await expect(page.locator('#music-notes')).toContainText('Ab5');await capture(page,`31edo-workshop-${device}`);
   const comparisonButton=page.getByRole('button',{name:'Compare C#4 / Db4',exact:true});
   await comparisonButton.scrollIntoViewIfNeeded();
   // Check the visible native raster: DOM text already contained # when the
   // missing bitmap glyph incorrectly painted question marks. Check the
   // current 3x5 compact glyph at the shared 2px raster, including every pixel.
   await expect.poll(()=>comparisonButton.evaluate(button=>{
    const text=button.firstChild!,range=document.createRange(),at=text.textContent!.indexOf('#');range.setStart(text,at);range.setEnd(text,at+1);
    const box=range.getBoundingClientRect(),source=document.querySelector('.pixel-source')!.getBoundingClientRect(),info=window.borrowedTomorrowPixels.inspect();
    const canvas=document.querySelector<HTMLCanvasElement>('.pixel-output')!,data=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height).data;
    const unit=info.rasterUnit,snap=(v:number)=>Math.round(v/unit)*unit;
    const left=info.physicalLeft+snap(Math.round((box.left-source.left)/info.cssScale))*info.physicalScale;
    const top=info.physicalTop+snap(Math.round((box.top-source.top)/info.cssScale)+1)*info.physicalScale;
    const color=getComputedStyle(button).color.match(/\d+/g)!.slice(0,3).map(Number),mask=['101','111','101','111','101'];let wrong=0;
    for(let y=0;y<5;y++)for(let x=0;x<3;x++)for(let py=0;py<unit*info.physicalScale;py++)for(let px=0;px<unit*info.physicalScale;px++){
     const i=((top+y*unit*info.physicalScale+py)*canvas.width+left+x*unit*info.physicalScale+px)*4;
     const ink=color.every((c,n)=>data[i+n]===c);if(ink!==(mask[y][x]==='1'))wrong++;
    }
    return wrong;
   })).toBe(0);
   await capture(page,`31edo-sharp-${device}`);
   await comparisonButton.click();
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
   await page.getByRole('group',{name:'Cue chapters'}).getByRole('button',{name:'Ch 2',exact:true}).click();
   await page.locator('[data-cue="coast"]').click();
   await expect(page.locator('#music-notes tbody')).toContainText('round-bass');
   await page.locator('[data-cue="infirmary"]').click();await expect(page.locator('.music-review .music-description').first()).toContainText('78 BPM / 3/4');
   await page.evaluate(async()=>{
    // @ts-expect-error Vite serves the real shared synth.
    const {Synth}:typeof import('../../src/game/synth')=await import('/src/game/synth.ts');
    const state=window as unknown as {wardBassStarts:number[]};state.wardBassStarts=[];
    const note=Synth.prototype.note;
    Synth.prototype.note=function(instrument,pitch,when,duration,volume,pan){if(instrument==='round-bass')state.wardBassStarts.push(when);note.call(this,instrument,pitch,when,duration,volume,pan);};
   });
   await page.getByRole('button',{name:'Play',exact:true}).click();
   await expect.poll(()=>page.evaluate(()=>(window as unknown as {wardBassStarts:number[]}).wardBassStarts.length)).toBeGreaterThanOrEqual(2);
   const beats=await page.evaluate(()=>(window as unknown as {wardBassStarts:number[]}).wardBassStarts);
   expect(beats[1]-beats[0]).toBeCloseTo(3*60/78,5);
   await expect(page.locator('#music-position')).not.toContainText('beat 4');await capture(page,`ward-three-four-${device}`);
   for(const cue of ['coast-battle','shunting','petra-battle']){
    await page.locator(`[data-cue="${cue}"]`).click();await expect(page.locator(`[data-cue="${cue}"]`)).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.music-review .music-description').first()).toContainText('4/4');
   }
   await page.getByRole('group',{name:'Instrument audition'}).getByRole('button',{name:'Strings',exact:true}).click();
   await bar.fill('5');await bar.press('Tab');
   await expect(page.locator('#music-notes tbody')).toContainText('4+2/3');
   await capture(page,`chapter-two-battle-music-${device}`);
   await page.getByRole('button',{name:'Play',exact:true}).click();await page.getByRole('navigation',{name:'Workshop panels'}).getByRole('button',{name:'Character',exact:true}).click();
   await expect(page.getByRole('button',{name:'Sound off',exact:true})).toBeVisible();await expect(page.getByRole('spinbutton',{name:'Nell level',exact:true})).toHaveValue('1');
   expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(stored);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   expect(errors).toEqual([]);
  });
 });
}
