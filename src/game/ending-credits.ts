import {ENDING_CREDITS,ENDING_CREDITS_START,ENDING_CREDITS_END,endingCreditPage} from '../content/credits';
import {bitmapText} from './pixel-font';
type C=CanvasRenderingContext2D;

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
  add(credit.role,'title' in credit&&credit.title&&!small?2:1,'title' in credit?'#f6e1b4':'#dfbda0');height+=8;
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
