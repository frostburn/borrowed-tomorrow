import type {EndingShotId} from '../content/ending-film';
import {paintEndingPerson as person} from './ending-cast';
import {bitmapText} from './pixel-font';

type C=CanvasRenderingContext2D;
type Point=readonly [number,number];
const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const rect=(c:C,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};

/** The coat is folded, not an ill or sleeping Nell. The wrapped lantern never
 * lights: losing the fragment has closed this route, not ended collection. */
function belongings(c:C,x:number,y:number,s=1){
 c.save();c.translate(x,y);c.scale(s,s);
 poly(c,'#704d3d',[[-41,-8],[-34,-18],[-8,-18],[-1,-9],[-1,7],[-42,7]]);
 line(c,'#ae8e65',3,[[-32,-16],[-29,-24],[-13,-24],[-9,-16]]);
 poly(c,'#a95243',[[2,-11],[12,-17],[38,-14],[48,-5],[44,8],[0,7]]);
 poly(c,'#c27054',[[2,-10],[25,-12],[45,-5],[42,0],[5,-1]]);
 poly(c,'#843f39',[[5,0],[43,1],[44,8],[0,7]]);
 // An ordinary dark lantern, mostly tucked inside the folded jacket.
 line(c,'#a68e62',2,[[21,-12],[21,-21],[27,-24],[33,-21],[33,-12]]);
 poly(c,'#8c7959',[[19,-13],[35,-13],[37,2],[18,2]]);
 poly(c,'#52666a',[[23,-10],[31,-10],[32,-2],[22,-2]]);c.restore();
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
function emptySeat(c:C,t:number){
 rect(c,'#8a9fa1',0,0,512,288);
 poly(c,'#aeb9ab',[[0,37],[85,24],[186,34],[299,18],[412,32],[512,21],[512,71],[0,73]]);
 poly(c,'#647f84',[[0,113],[71,87],[122,100],[211,77],[292,101],[398,82],[512,106],[512,198],[0,198]]);
 poly(c,'#778c89',[[0,180],[512,168],[512,221],[0,237]]);
 coach(c,-35,205,1.32);coach(c,209,199,1.32);
 line(c,'#a9b2a1',3,[[0,222],[512,209]]);line(c,'#50676d',3,[[0,230],[512,216]]);
 // A covered waiting platform, with both standing figures on its surface.
 poly(c,'#a6a58d',[[0,239],[512,224],[512,288],[0,288]]);
 line(c,'#d1c5a0',4,[[0,239],[512,224]]);
 bench(c,257,227);belongings(c,337,218,.8);
 oval(c,'#838e82',224,259,19,4);person(c,'tomas',224,256,.88,true);
 oval(c,'#838e82',458,264,18,4);person(c,'kit',458,261,.83,true);
 poly(c,'#415d65',[[0,0],[512,0],[512,17],[340,27],[168,20],[0,44]]);
 poly(c,'#597276',[[0,0],[164,0],[147,13],[0,33]]);
 poly(c,'#4b656a',[[39,28],[51,26],[55,288],[42,288]]);
 // One tick, rather than an unnaturally fast clock or an animated apparition.
 line(c,'#697d79',3,[[359,21],[359,45]]);oval(c,'#c1baa0',359,61,22,22);
 oval(c,'#d0c9ab',359,61,18,18);
 line(c,'#5b716f',3,[[359,47],[359,61],[368,65]]);
 const angle=-Math.PI/2+Math.floor(t)*Math.PI/30;
 line(c,'#8a765b',1.5,[[359,61],[359+Math.cos(angle)*14,61+Math.sin(angle)*14]]);
}
function lastTrain(c:C,t:number){
 rect(c,'#4e6572',0,0,512,288);
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
 const travel=Math.round(ease(t/12)*390/2)*2;
 for(let i=0;i<3;i++)coach(c,116+i*146-travel,235-i*4,.8);
 poly(c,'#929b8e',[[0,258],[512,242],[512,282],[0,298]]);
 poly(c,'#5f7576',[[0,298],[512,282],[512,301],[0,317]]);
 line(c,'#c1bc99',4,[[0,258],[512,242]]);
 bench(c,415,258,.42);belongings(c,449,254,.34);
 const cast=[['orrin',291,.46],['celia',330,.44],['petra',368,.47],['tomas',409,.45],['kit',477,.44]] as const;
 for(const [who,x,scale]of cast){const feet=279-x/32;oval(c,'#73857d',x,feet+2,10,2);person(c,who,x,feet,scale,true);}
 // A diffuse lamp, with its stem outside the cast's silhouettes.
 poly(c,'#516c70',[[505,143],[510,144],[508,274],[503,274]]);
 poly(c,'#a2946c',[[496,140],[512,140],[512,154],[497,154]]);
 poly(c,'#d9c595',[[499,143],[508,143],[508,151],[499,151]]);
 // Quiet negative space keeps the shared credit lettering readable.
 const shade=c.createLinearGradient(0,0,290,0);
 shade.addColorStop(0,'rgba(20,36,52,.55)');shade.addColorStop(.6,'rgba(20,36,52,.35)');shade.addColorStop(1,'rgba(20,36,52,0)');
 c.fillStyle=shade;c.fillRect(0,0,290,288);
 if(t>42){
  c.save();c.globalAlpha=ease((t-42)/2);
  bitmapText(c,'An unfinished',292,62,'#d9d3b9',2);
  bitmapText(c,'tomorrow',322,82,'#d9d3b9',2);c.restore();
 }
}
/** No battle replay, new dialogue or divine body: just the surviving friends,
 * the empty seat, and an ordinary train continuing without Nell. */
export function paintBadEndingShot(c:C,shot:EndingShotId,milliseconds:number,reduced:boolean){
 if(shot==='empty-seat')emptySeat(c,reduced?0:milliseconds/1000);
 else lastTrain(c,reduced?44:milliseconds/1000);
}
