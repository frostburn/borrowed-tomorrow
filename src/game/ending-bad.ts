import {BAD_ENDING_CUES,BAD_ENDING_HINT} from '../content/ending-film';
import {paintEndingPerson as person} from './ending-cast';
import {bitmapText} from './pixel-font';

type C=CanvasRenderingContext2D;
type Point=readonly [number,number];
const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const rect=(c:C,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};

/** Nell's folded coat and Tomas's bag leave the rest of the bench empty. */
function belongings(c:C,x:number,y:number,s=1){
 c.save();c.translate(x,y);c.scale(s,s);
 poly(c,'#704d3d',[[-41,-8],[-34,-18],[-8,-18],[-1,-9],[-1,7],[-42,7]]);
 line(c,'#ae8e65',3,[[-32,-16],[-29,-24],[-13,-24],[-9,-16]]);
 poly(c,'#a95243',[[2,-11],[12,-17],[38,-14],[48,-5],[44,8],[0,7]]);
 poly(c,'#c27054',[[2,-10],[25,-12],[45,-5],[42,0],[5,-1]]);
 poly(c,'#843f39',[[5,0],[43,1],[44,8],[0,7]]);
 poly(c,'#d8c59b',[[11,-15],[17,-15],[24,-10],[20,-7],[15,-10]]);
 poly(c,'#843f39',[[25,-11],[39,-8],[43,-4],[35,-2],[22,-7]]);
 line(c,'#c27054',2,[[24,-5],[36,-1],[42,-2]]);
 c.restore();
}
function bench(c:C,x:number,y:number,s=1){
 c.save();c.translate(x,y);c.scale(s,s);
 for(const xx of [9,143]){
  poly(c,'#455a60',[[xx,-43],[xx+5,-44],[xx+7,29],[xx+1,29]]);
  line(c,'#778780',3,[[xx+2,1],[xx-3,29],[xx+11,29]]);
 }
 poly(c,'#8f7e60',[[0,-44],[153,-48],[154,-35],[1,-31]]);
 poly(c,'#a18f6b',[[1,-27],[154,-31],[155,-18],[2,-14]]);
 poly(c,'#b09d76',[[-6,-6],[154,-10],[169,0],[1,6]]);
 poly(c,'#786d57',[[1,6],[169,0],[169,7],[1,13]]);c.restore();
}
function coach(c:C,x:number,y:number,s=1){
 c.save();c.translate(x,y);c.scale(s,s);
 poly(c,'#4d6970',[[0,-67],[177,-64],[182,0],[1,7]]);
 poly(c,'#8b967f',[[-5,-74],[175,-71],[185,-63],[-3,-65]]);
 line(c,'#9b9878',3,[[2,-14],[181,-19]]);
 for(let i=0;i<5;i++){
  const xx=12+i*33;
  poly(c,'#bdc8ae',[[xx,-57],[xx+23,-56],[xx+23,-29],[xx,-28]]);
  poly(c,'#8ea89f',[[xx+3,-53],[xx+20,-52],[xx+3,-33]]);
  line(c,'#637b78',2,[[xx+11,-55],[xx+11,-29]]);
 }
 for(const xx of [23,145]){oval(c,'#304955',xx,7,10,10);oval(c,'#738780',xx,7,4,4);}
 c.restore();
}
export const BAD_ENDING_CAST=[
 {who:'orrin',x:286,scale:.46}, {who:'celia',x:316,scale:.44},
 {who:'petra',x:346,scale:.47}, {who:'tomas',x:376,scale:.45},
 {who:'kit',x:406,scale:.44},
] as const;
export const BAD_ENDING_LANTERN={x:259,y:272,scale:.55};
/** A single camera pulls back from the bench. Its seat anchor drifts smoothly
 * from the center to its final position; people and lantern keep world anchors.
 * Exponential zoom gives equal optical steps, without scaling a cached bitmap. */
export function badEndingBlocking(milliseconds:number,reduced=false){
 const time=reduced?34000:Math.max(0,Number.isFinite(milliseconds)?milliseconds:0);
 const u=ease((time-BAD_ENDING_CUES.pullbackStart)/(BAD_ENDING_CUES.pullbackEnd-BAD_ENDING_CUES.pullbackStart));
 const zoom=8**(1-u);
 return {time,zoom,offsetX:256+197*u-453*zoom,offsetY:144+102*u-246*zoom,
  train:640*ease((time-BAD_ENDING_CUES.trainStart)/(BAD_ENDING_CUES.trainEnd-BAD_ENDING_CUES.trainStart)),
  rain:ease((time-BAD_ENDING_CUES.rainStart)/(BAD_ENDING_CUES.rainFull-BAD_ENDING_CUES.rainStart))};
}
function brokenLantern(c:C){
 const {x,y,scale}=BAD_ENDING_LANTERN;
 c.save();c.translate(x,y);c.scale(scale,scale);
 oval(c,'#667a79',1,3,18,3);
 c.save();c.rotate(-.5);
 // A bent handle and two jagged frame fragments surround an empty pane.
 // The floor shows through it; retained glass is confined to two corners.
 line(c,'#ac946a',3,[[-9,-13],[-11,-21],[-5,-25],[1,-22]]);
 poly(c,'#9e8660',[[-13,-13],[-3,-13],[-5,-9],[-10,-9],[-12,-4],[-10,0],[-2,0],[-3,4],[-12,4],[-16,-3]]);
 poly(c,'#9e8660',[[2,-13],[8,-13],[12,-8],[7,3],[2,3],[5,-1],[7,-5],[4,-9],[1,-9]]);
 poly(c,'#a7c4bd',[[-10,-9],[-5,-9],[-7,-4],[-10,-2]]);
 poly(c,'#799b9b',[[5,-9],[8,-5],[4,0],[3,-2]]);
 line(c,'#c4ab7b',2,[[-14,-13],[-4,-13]]);
 line(c,'#786e59',2,[[3,3],[7,3],[12,-8]]);c.restore();
 poly(c,'#acc7bf',[[-21,2],[-16,-1],[-17,5]]);
 poly(c,'#819f9f',[[13,3],[19,1],[17,6]]);
 poly(c,'#a0bcb5',[[-10,8],[-3,6],[-5,10]]);c.restore();
}
function rain(c:C,t:number,strength:number,foreground:boolean){
 if(strength===0)return;
 c.save();c.globalAlpha=strength*(foreground ? .38 : .23);
 c.strokeStyle=foreground?'#a5bec5':'#8da8b6';c.lineWidth=foreground?1.25:1;
 c.beginPath();
 const count=foreground?26:42;
 for(let i=0;i<count;i++){
  const x=(i*83+17)%568-28,phase=(t*(foreground?143:103)+i*61)%348;
  const y=phase-30,len=foreground?10:6;
  c.moveTo(x,y);c.lineTo(x-2,y+len);
 }
 c.stroke();c.restore();
}
function station(c:C,stage:ReturnType<typeof badEndingBlocking>){
 const {time,train,rain:wet}=stage,t=time/1000;
 rect(c,'#4e6572',-500,-500,1512,1288);
 poly(c,'#72838a',[[0,68],[94,57],[182,66],[276,53],[396,64],[512,51],[512,103],[0,99]]);
 poly(c,'#425d68',[[0,154],[83,126],[145,138],[234,112],[319,139],[406,120],[512,145],[512,237],[0,237]]);
 poly(c,'#7e8d89',[[0,224],[512,209],[512,271],[0,288]]);
 // Crooked Larkspur roof/gable, with a warm office still open to the living.
 poly(c,'#a0a795',[[383,121],[437,99],[497,123],[497,228],[380,231]]);
 poly(c,'#bcc0a5',[[389,125],[438,109],[487,128],[487,222],[388,225]]);
 poly(c,'#496671',[[372,122],[437,89],[508,123],[500,135],[439,105],[383,135]]);
 poly(c,'#3c5664',[[437,89],[508,123],[500,135],[439,105]]);
 rect(c,'#c0aa78',398,149,30,35);line(c,'#788978',3,[[413,149],[413,183]]);
 rect(c,'#4e696d',450,151,24,71);
 // Ansel's cap remains on its hook; neither lost character returns to the cast.
 poly(c,'#44596a',[[435,171],[438,166],[445,167],[448,173],[435,175]]);
 line(c,'#a1997b',2,[[434,175],[449,173]]);
 line(c,'#a3ab99',3,[[0,248],[512,233]]);line(c,'#3b5763',3,[[0,255],[512,240]]);
 rain(c,t,wet,false);
 const travel=Math.round(train/2)*2;
 for(let i=0;i<3;i++)coach(c,116+i*146-travel,235-i*4,.8);
 poly(c,'#929b8e',[[0,258],[512,242],[512,282],[0,298]]);
 poly(c,'#5f7576',[[0,298],[512,282],[512,301],[0,317]]);
 line(c,'#c1bc99',4,[[0,258],[512,242]]);
 c.save();c.globalAlpha=wet*.3;
 poly(c,'#617f85',[[236,276],[285,270],[322,274],[315,280],[260,283]]);
 poly(c,'#b5af8e',[[460,264],[480,261],[500,264],[494,269],[465,269]]);c.restore();
 bench(c,415,258,.42);belongings(c,449,254,.34);
 for(const {who,x,scale}of BAD_ENDING_CAST){const feet=279-x/32;oval(c,'#73857d',x,feet+2,10,2);person(c,who,x,feet,scale,true);}
 brokenLantern(c);
 // A diffuse lamp, with its stem outside the cast's silhouettes.
 poly(c,'#516c70',[[505,143],[510,144],[508,274],[503,274]]);
 poly(c,'#a2946c',[[496,140],[512,140],[512,154],[497,154]]);
 poly(c,'#d9c595',[[499,143],[508,143],[508,151],[499,151]]);
 // Wet, overcast light builds only after the train has cleared the platform.
 c.save();c.globalAlpha=wet*.2;rect(c,'#233f56',0,0,512,288);c.restore();
 rain(c,t,wet,true);
}
/** One unbroken shot. The lantern enters the framing after the companions,
 * before departure and rain. Every frame redraws vectors through one camera. */
export function paintBadEnding(c:C,milliseconds:number,reduced:boolean,nativeScale:number){
 const stage=badEndingBlocking(milliseconds,reduced);
 c.save();
 // Align camera translation with the common two-pixel display grid.
 c.translate(Math.round(stage.offsetX*nativeScale/2)*2/nativeScale,Math.round(stage.offsetY*nativeScale/2)*2/nativeScale);
 c.scale(stage.zoom,stage.zoom);station(c,stage);c.restore();
 // The credit side falls into a diffuse shadow once the pullback has ended.
 const shade=c.createLinearGradient(0,0,280,0);
 shade.addColorStop(0,'rgba(20,36,52,.55)');shade.addColorStop(.6,'rgba(20,36,52,.3)');shade.addColorStop(1,'rgba(20,36,52,0)');
 c.save();c.globalAlpha=ease((stage.time-14000)/2000);c.fillStyle=shade;c.fillRect(0,0,280,288);c.restore();
}
/** Closing lettering uses view pixels, like the credits, so the hint remains
 * readable on a phone. It overlays the same rainy scene without another cut. */
export function paintBadEndingCaption(c:C,milliseconds:number,w:number,h:number){
 if(milliseconds<BAD_ENDING_CUES.captionStart)return;
 const scale=Math.min(w/512,h/288),top=(h-288*scale)/2+72*scale,titleScale=w<600?1:2;
 c.save();c.globalAlpha=ease((milliseconds-BAD_ENDING_CUES.captionStart)/1000);
 const text=(value:string,y:number,size:number)=>{
  const x=(w-value.length*(size===1?8:6*size))/2;
  bitmapText(c,value,x+2,y+2,'#263e53',size);bitmapText(c,value,x,y,'#e2d9bd',size);
 };
 text('Borrowed Tomorrow',top,titleScale);text(BAD_ENDING_HINT,top+34,1);c.restore();
}
