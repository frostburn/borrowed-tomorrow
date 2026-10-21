import type {Page} from '@playwright/test';

export const sampleRegulator=(page:Page,ms:number)=>page.evaluate(ms=>new Promise<{frame:string;motion:string;pixels:number;casing:number;chassis:number;drive:number}[]>(resolve=>{
  const rows:{frame:string;motion:string;pixels:number;casing:number;chassis:number;drive:number}[]=[],start=performance.now();let last=-100;
  const info=window.borrowedTomorrowPixels.inspect(),view=window.borrowedTomorrow.inspect().view,source=document.querySelector('.pixel-source')!.getBoundingClientRect(),world=document.querySelector('.world-input')!.getBoundingClientRect();
  const hash=(p:Uint8ClampedArray)=>{let h=2166136261;for(const v of p)h=Math.imul(h^v,16777619);return h>>>0;};
  const region=(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number)=>hash(ctx.getImageData(info.physicalLeft+(Math.round((world.left-source.left)/info.cssScale)+335+x-view.scrollX)*info.physicalScale,info.physicalTop+(Math.round((world.top-source.top)/info.cssScale)+46+y)*info.physicalScale,w*info.physicalScale,h*info.physicalScale).data);
  const tick=()=>{if(performance.now()-last>100){last=performance.now();const s=window.borrowedTomorrow.inspect(),a=s.actors.find(a=>a.hero==='conduit-regulator');if(a){
   const c=document.querySelector<HTMLCanvasElement>('.pixel-output')!,p=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;let hash=2166136261;for(let i=0;i<p.length;i+=16)hash=Math.imul(hash^p[i],16777619);
   const ctx=c.getContext('2d')!;rows.push({frame:a.frame,motion:a.motion,pixels:hash>>>0,casing:region(ctx,100,46,58,34),chassis:region(ctx,95,177,65,34),drive:region(ctx,15,65,80,38)});
  }}if(performance.now()-start>=ms)resolve(rows);else requestAnimationFrame(tick);};tick();
 }),ms);
