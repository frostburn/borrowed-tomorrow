import {ENDING_CREDITS,ENDING_CREDITS_START,ENDING_CREDITS_END,endingCreditPage} from '../content/credits';
import {paintEndingPerson as person} from './ending-cast';
import {bitmapText} from './pixel-font';

type C=CanvasRenderingContext2D;
type Point=readonly [number,number];
const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const rect=(c:C,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
function color(a:string,b:string,t:number){
 const channel=(offset:number)=>Math.round(parseInt(a.slice(offset,offset+2),16)*(1-t)+parseInt(b.slice(offset,offset+2),16)*t).toString(16).padStart(2,'0');
 return '#'+channel(1)+channel(3)+channel(5);
}
export const SHORE_COMPANIONS=[
 {who:'celia',x:342,y:219,scale:.62,rise:3.0},
 {who:'orrin',x:302,y:232,scale:.65,rise:2.4},
 {who:'petra',x:386,y:232,scale:.66,rise:4.0},
 {who:'tomas',x:352,y:246,scale:.62,rise:3.5},
] as const;

/** An upward follow reveals the horizon. The picnic leaves the bottom of the
 * camera naturally; no cast members fade away or vanish beside the couple. */
export function shoreBlocking(milliseconds:number,reduced=false){
 const t=reduced?54:Math.max(0,Math.min(60,milliseconds/1000)),travel=ease((t-1)/11);
 return {t,travel,cameraY:-140*ease((t-5)/7),sunset:ease((t-12)/36),
  nellX:206+136*travel,kitX:246+132*travel,y:253-158*travel,
  walk:t>1&&t<12?Math.floor(travel*8*6)/6:undefined};
}
function boat(c:C,x:number,y:number,scale:number){
 c.save();c.translate(x,y);c.scale(scale,scale);
 poly(c,'#876348',[[-22,0],[23,0],[15,9],[-10,10]]);
 line(c,'#556269',2,[[0,-37],[0,1]]);poly(c,'#e8dfbd',[[-2,-35],[-2,-3],[-23,-3]]);poly(c,'#b8c9c2',[[2,-29],[18,-6],[2,-4]]);
 line(c,'#c9d5c0',1,[[-27,12],[-7,14],[20,12],[35,12]]);c.restore();
}
function couple(c:C,stage:ReturnType<typeof shoreBlocking>){
 const {nellX,kitX,y,walk}=stage;
 // One shared right/left handhold follows the shoulders, including in motion.
 const mid=(nellX+kitX)/2;
 oval(c,'#987e73',nellX+7,y+3,17,3);oval(c,'#987e73',kitX+7,y+3,18,3);
 person(c,'nell',nellX,y,.86,true,'right',walk===undefined?undefined:{walk});
 person(c,'kit',kitX,y,.91,true,'left',walk===undefined?undefined:{walk:walk+.5});
 const shoulderN:Point=[nellX+13*.86,y-59*.86],shoulderK:Point=[kitX-13*.91,y-59*.91];
 line(c,'#a95243',6,[shoulderN,[mid-5,y-36],[mid,y-23]]);
 line(c,'#c27054',2,[[shoulderN[0]-1,shoulderN[1]],[mid-7,y-36],[mid,y-23]]);
 line(c,'#263e53',6,[shoulderK,[mid+5,y-36],[mid,y-23]]);
 line(c,'#385368',2,[shoulderK,[mid+3,y-36],[mid,y-23]]);
 oval(c,'#d49c70',mid,y-21,3,2);
}

export function paintEndingShore(c:C,milliseconds:number,reduced:boolean,nativeScale:number){
 const stage=shoreBlocking(milliseconds,reduced),{t,sunset,cameraY}=stage;
 c.save();
 // Quantize the camera in native pixels before the common chunky framebuffer.
 c.translate(0,Math.round(-cameraY*nativeScale/2)*2/nativeScale);
 rect(c,color('#9ebac0','#4c4e70',sunset),0,-220,512,210);
 poly(c,color('#c8d4c2','#db9a7b',sunset),[[0,-88],[116,-92],[227,-80],[355,-86],[512,-77],[512,-28],[0,-28]]);
 for(const [x,y,s]of [[32,-106,1.1],[246,-143,.8],[370,-83,1.2]]){
  poly(c,color('#dce1cb','#efba93',sunset),[[x,y+7],[x+20*s,y],[x+46*s,y+3],[x+59*s,y-1],[x+103*s,y+10],[x+58*s,y+12],[x+26*s,y+10]]);
 }
 c.globalAlpha=sunset;
 oval(c,'#e8b77e',380,-68+39*sunset,18,18);c.globalAlpha=1;
 poly(c,color('#8ba6a5','#827d8e',sunset),[[0,-41],[76,-57],[129,-42],[191,-49],[267,-33],[344,-42],[437,-34],[512,-38],[512,-24],[0,-24]]);
 rect(c,color('#527c87','#665b78',sunset),0,-30,512,160);
 for(let i=0;i<14;i++){
  const y=-18+i*9,x=(i*137+23)%410-20+Math.sin(t*.8+i)*3,width=48+i*29%91;
  poly(c,color(i%2?'#7da5a7':'#638c94',i%2?'#ab8590':'#806a87',sunset),[[x,y],[x+width*.65,y-1],[x+width,y+1],[x+width*.27,y+3]]);
 }
 c.globalAlpha=sunset*.5;
 for(let i=0;i<9;i++){
  const y=-20+i*13,half=7+i*3,shift=Math.sin(t+i)*2;
  poly(c,'#e5b18d',[[380-half+shift,y],[380+half+shift,y],[387+half+shift,y+2],[373-half+shift,y+3]]);
 }c.globalAlpha=1;
 boat(c,106+Math.sin(t*.05)*18,12,.46);boat(c,438-t*.2,45,.27);
 // A deep beach lets the walk pass the picnic before reaching the actual water.
 const shore:Point[]=[[0,120],[110,104],[220,102],[310,90],[410,84],[512,98],[512,420],[0,420]];
 poly(c,color('#d3b889','#c99b83',sunset),shore);
 poly(c,color('#a18c6c','#9c7d7e',sunset),[[0,186],[102,165],[218,174],[336,155],[452,171],[512,154],[512,420],[0,420]]);
 const wave=Math.sin(t*.8)*2;
 poly(c,color('#c9d5c0','#d9bdad',sunset),[[0,116+wave],[111,100+wave],[220,98+wave],[310,86+wave],[410,80+wave],[512,94+wave],[512,98+wave],[410,84+wave],[310,90+wave],[220,102+wave],[111,104+wave],[0,120+wave]]);
 poly(c,'#8e6e60',[[288,213],[367,207],[399,242],[313,254]]);
 line(c,'#c1ac8d',3,[[300,219],[383,235]]);line(c,'#c1ac8d',2,[[328,211],[351,249]]);
 oval(c,'#d6c7a4',340,233,7,3);poly(c,'#c2a16b',[[324,232],[329,225],[337,228],[334,234]]);
 for(const x of [310,373])poly(c,'#d8c59b',[[x,232],[x+5,232],[x+4,238],[x+1,238]]);
 const cast:Array<{depth:number;draw:()=>void}>=SHORE_COMPANIONS.map(companion=>({depth:companion.y,draw:()=>{
  const rise=ease((t-companion.rise)/1.2);
  person(c,companion.who,companion.x,companion.y,companion.scale,rise>.65,undefined,{sit:1-rise});
 }}));
 cast.push({depth:stage.y,draw:()=>couple(c,stage)});
 for(const actor of cast.sort((a,b)=>a.depth-b.depth))actor.draw();
 // The lantern and nearby tree remain with the picnic, below the final framing.
 oval(c,'#6c7464',147,266,23,6);
 line(c,'#947d53',2,[[143,240],[143,232],[150,230],[155,234],[155,240]]);
 poly(c,'#8b7652',[[139,240],[158,240],[160,262],[137,262]]);poly(c,'#e1d6a9',[[143,244],[153,244],[155,258],[141,258]]);
 poly(c,'#49665d',[[0,158],[14,157],[31,280],[58,420],[30,420],[12,302]]);
 c.restore();
 if(t>54){
  c.save();c.globalAlpha=ease((t-54)/2);
  bitmapText(c,'Borrowed Tomorrow',154,267,'#f4e5be',2);c.globalAlpha=1;
  c.restore();
 }
}

type CreditLine={text:string;scale:number;color:string;y:number};
/** Text is painted in native view coordinates. It keeps full 2px stems on a
 * phone instead of shrinking the lettering with the wide scenery composition. */
export function paintEndingCredits(c:C,milliseconds:number,w:number,h:number,reduced:boolean){
 if(!reduced&&(milliseconds<ENDING_CREDITS_START||milliseconds>=ENDING_CREDITS_END))return;
 const s=Math.min(w/512,h/288),left=(w-512*s)/2+16*s,top=(h-288*s)/2+12;
 const areaW=Math.min(512*s*.50-16*s,320),areaH=288*s-24,small=w<600;
 const lines:CreditLine[]=[];let height=0;
 const add=(text:string,scale:number,ink:string)=>{
  const advance=scale===1?8:6*scale,max=Math.max(8,Math.floor(areaW/advance));let current='';
  for(const word of text.split(' ')){
   if(current&&current.length+1+word.length>max){lines.push({text:current,scale,color:ink,y:height});height+=(scale===1?10:7*scale)+8;current=word;}
   else current+=(current?' ':'')+word;
  }
  if(current){lines.push({text:current,scale,color:ink,y:height});height+=(scale===1?10:7*scale)+8;}
 };
 const chosen=reduced?[ENDING_CREDITS[endingCreditPage(milliseconds)]]:ENDING_CREDITS;
 for(const credit of chosen){
  add(credit.role,1,'#dfbda0');height+=8;
  for(const text of credit.lines)add(text,small?1:2,'#f6e1b4');
  height+=34;
 }
 const progress=Math.max(0,Math.min(1,(milliseconds-ENDING_CREDITS_START)/(ENDING_CREDITS_END-ENDING_CREDITS_START)));
 const offset=reduced?top+(areaH-height+34)/2:top+areaH-progress*(areaH+height);
 c.save();c.beginPath();c.rect(left-4,top,areaW+8,areaH);c.clip();
 for(const entry of lines){
  const advance=entry.scale===1?8:6*entry.scale,x=left+(areaW-entry.text.length*advance)/2,y=offset+entry.y;
  if(y<top-20||y>top+areaH)continue;
  bitmapText(c,entry.text,x+2,y+2,'#344459',entry.scale);bitmapText(c,entry.text,x,y,entry.color,entry.scale);
 }
 c.restore();
}
