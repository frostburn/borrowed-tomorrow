import {endingFrame,endingCreditTime,ENDING_FILMS,type EndingKind} from '../content/ending-film';
import {paintEndingShore} from './ending-shore';
import {paintEndingCredits} from './ending-credits';
import {paintBadEndingShot} from './ending-bad';
import {paintEndingPerson as person} from './ending-cast';

type C=CanvasRenderingContext2D;
type Point=readonly [number,number];
const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const rect=(c:C,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const ease=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
const P={sky:'#9ebac0',cloud:'#dce1cb',sea:'#527c87',water:'#7da5a7',foam:'#c9d5c0',sand:'#c7ad7e',stone:'#596b72',dark:'#243b49',gold:'#c5a365'};

/** Broad native vector planes, painted before the game's common 2px framebuffer.
 * Every movement is a rigid layer transform, not a warped or stretched bitmap. */
function cloud(c:C,x:number,y:number,s=1){c.save();c.translate(x,y);c.scale(s,s);poly(c,P.cloud,[[0,9],[19,2],[44,5],[57,0],[86,8],[106,12],[62,14],[29,12]]);c.restore();}
function boat(c:C,x:number,y:number,s=1){
 c.save();c.translate(x,y);c.scale(s,s);
 poly(c,'#876348',[[-22,0],[23,0],[15,9],[-10,10]]);poly(c,'#bd9d6a',[[-20,0],[17,0],[10,3],[-15,4]]);
 line(c,'#556269',2,[[0,-37],[0,1]]);poly(c,'#e8dfbd',[[-2,-35],[-2,-3],[-23,-3]]);poly(c,'#b8c9c2',[[2,-29],[18,-6],[2,-4]]);
 line(c,P.foam,1,[[-27,12],[-7,14],[20,12],[35,12]]);c.restore();
}
function release(c:C,p:number,t:number){
 rect(c,'#203c50',0,0,512,288);
 const dawn=ease((p-.18)/.7);c.globalAlpha=dawn;rect(c,P.sky,0,0,512,169);c.globalAlpha=1;
 poly(c,'#566f7d',[[0,154],[56,131],[105,149],[172,138],[210,157],[316,133],[392,143],[465,132],[512,146],[512,288],[0,288]]);
 for(let i=0;i<9;i++){
  const x=60+i*49,y=58+(i%3)*9+ease(p)*75;
  poly(c,'#b8cec6',[[x,y],[x+33,y-4],[x+55,y+8],[x+12,y+6]]);
 }
 // The source is gone: broken light drains into water, not a resurrected figure.
 for(let i=0;i<7;i++){
  const x=155+i*33,fall=ease(Math.min(1,p*1.25))*125;
  c.globalAlpha=Math.max(0,1-p*1.5);
  poly(c,i%2?'#c4a56e':'#d3c7a1',[[x,40+fall],[x+8,34+fall],[x+16,48+fall],[x+4,64+fall]]);
 }c.globalAlpha=1;
 rect(c,'#486a79',0,190,512,98);
 line(c,'#9ab9ba',3,[[0,215],[102,209],[196,214],[322,205],[420,210],[512,202]]);
 poly(c,'#a29a80',[[0,259],[96,234],[144,221],[198,215],[256,220],[288,239],[213,247],[159,244],[92,262],[0,282]]);
 poly(c,'#586970',[[0,282],[92,262],[159,244],[213,247],[288,239],[288,260],[214,268],[155,264],[92,282],[0,288]]);
 const walk=ease(p)*18;
 person(c,'celia',156-walk,236,.46);person(c,'orrin',111-walk,251,.48);person(c,'petra',201-walk,233,.5);
 person(c,'kit',73-walk,263,.5);person(c,'nell',50-walk,272,.5);
 c.globalAlpha=dawn*.7;poly(c,'#d4c89e',[[0,0],[512,0],[512,118],[0,159]]);c.globalAlpha=1;
 void t;
}
function locomotive(c:C,x:number,y:number){
 c.save();c.translate(x,y);
 poly(c,'#324d59',[[0,-44],[13,-48],[107,-43],[112,-4],[7,0],[-8,-8]]);
 rect(c,'#566d71',8,-42,88,26);poly(c,'#b5ab81',[[8,-42],[98,-41],[91,-35],[8,-35]]);
 rect(c,'#243e49',10,-65,16,21);poly(c,'#637a7b',[[5,-69],[30,-67],[28,-61],[6,-61]]);
 rect(c,'#556b6d',83,-65,38,56);poly(c,'#bdac7f',[[78,-68],[122,-67],[127,-61],[81,-61]]);
 rect(c,'#bad1c8',90,-58,20,17);poly(c,'#8e9f93',[[93,-57],[107,-57],[93,-44]]);
 line(c,'#a58f62',3,[[1,-21],[81,-21],[83,-9],[112,-9]]);
 for(const xx of [12,42,70,100]){oval(c,'#263e4a',xx,0,11,11);oval(c,'#81908b',xx,0,6,6);}
 line(c,'#b5ad91',3,[[12,0],[42,0],[70,0],[100,0]]);c.restore();
}
function station(c:C,p:number,t:number){
 rect(c,'#c5cdb8',0,0,512,288);cloud(c,16,28,1.3);cloud(c,325,17,1.2);
 poly(c,'#899c99',[[0,100],[88,65],[130,74],[172,62],[225,93],[288,75],[348,91],[426,68],[512,98],[512,185],[0,185]]);
 poly(c,'#bcc1ab',[[0,181],[512,170],[512,255],[0,267]]);
 // Crooked station facade, filled gable and angled roof planes.
 poly(c,'#9b9f8d',[[310,78],[404,56],[467,90],[467,217],[303,224]]);
 poly(c,'#ced1b4',[[319,87],[404,67],[457,96],[456,208],[314,215]]);
 poly(c,'#6f8490',[[293,84],[401,44],[479,88],[469,103],[404,62],[309,99]]);
 poly(c,'#526d7d',[[401,44],[479,88],[469,103],[404,62]]);
 poly(c,'#8e9e98',[[400,114],[439,116],[436,207],[395,209]]);
 poly(c,'#405b66',[[405,119],[431,121],[429,207],[401,208]]);
 rect(c,'#304b59',325,120,41,47);poly(c,'#acc5bc',[[330,124],[361,125],[358,161],[329,163]]);
 line(c,'#d0c8a5',3,[[345,123],[344,164]]);line(c,'#d0c8a5',3,[[328,144],[362,143]]);
 // Ansel's cap hangs beside the office; the lower hook stays empty.
 poly(c,'#4e6270',[[375,139],[381,134],[388,138],[389,143],[375,144]]);
 poly(c,'#9da794',[[374,144],[390,143],[393,146],[373,147]]);line(c,'#6f7568',2,[[381,160],[381,166],[385,166]]);
 oval(c,'#d4cfac',403,83,11,11);line(c,'#617882',2,[[403,75],[403,83],[409,86]]);
 line(c,'#e2d5ac',5,[[0,234],[512,218]]);poly(c,'#6d7978',[[0,239],[512,224],[512,255],[0,277]]);
 line(c,'#b4bba5',3,[[0,255],[512,235]]);line(c,'#526973',3,[[0,265],[512,244]]);
 const travel=ease(p)*65,engine=180-travel;
 for(let i=0;i<3;i++){
  const x=engine+122+114*i;poly(c,'#6d837e',[[x,165],[x+108,167],[x+111,224],[x,228]]);
  poly(c,'#c5bd99',[[x-3,162],[x+110,164],[x+114,172],[x-3,170]]);
  for(let j=0;j<4;j++){rect(c,'#b4ccc1',x+8+j*25,177,17,22);line(c,'#49636c',2,[[x+8+j*25,178],[x+8+j*25,199]]);}
 }
 locomotive(c,engine,225);
 for(let i=0;i<4;i++){const smoke=(t*.045+i*.21)%1;c.globalAlpha=(1-smoke)*.35;poly(c,'#e5e4ce',[[engine+15+smoke*21,160-smoke*46],[engine+29+smoke*23,147-smoke*49],[engine+54+smoke*34,153-smoke*44],[engine+47+smoke*28,171-smoke*42]]);}c.globalAlpha=1;
 // A raised foreground platform separates the travelers from the moving rails.
 // Its back edge, front face and sole anchors share the same perspective slope.
 poly(c,'#b8b69c',[[0,247],[512,231],[512,272],[0,288]]);
 poly(c,'#8a9389',[[0,288],[512,272],[512,288],[0,304]]);
 line(c,'#e2d5ac',4,[[0,247],[512,231]]);
 line(c,'#d0c9a7',2,[[0,286],[512,270]]);
 for(const x of [108,260,420])line(c,'#a6aa94',1,[[x,249-x/32],[x+8,280-(x+8)/32]]);
 const cast=[['tomas',125,.72],['nell',179,.70],['kit',235,.70],['celia',292,.70],['petra',351,.74],['orrin',413,.73]] as const;
 for(const [who,x,scale]of cast){
  const feet=277-x/32;
  oval(c,'#879482',x,feet+2,15,3);person(c,who,x,feet,scale);
 }
 // Foreground canopy and cool shadow create depth without dark outlines.
 poly(c,'#576c70',[[0,0],[72,0],[81,288],[55,288],[46,70],[0,76]]);
 poly(c,'#7e958a',[[0,0],[212,0],[187,11],[108,9],[65,27],[0,39]]);
}
function windowSeat(c:C,p:number,t:number){
 rect(c,'#546d71',0,0,512,288);
 rect(c,'#c6baa0',52,18,407,211);rect(c,'#365865',66,28,377,187);
 c.save();c.beginPath();c.rect(73,34,362,172);c.clip();
 rect(c,P.sky,73,34,362,172);cloud(c,70-t*3,49,1.1);rect(c,P.sea,73,122,362,100);
 poly(c,'#829d93',[[42-t*4,136],[186-t*4,104],[248-t*4,116],[330-t*4,142],[471-t*4,159],[540,191],[30,193]]);
 for(let i=0;i<7;i++){const xx=80+i*80-t*17%80;line(c,'#d2c9a6',3,[[xx,170],[xx,211]]);line(c,'#82968c',2,[[xx,179],[xx+80,179]]);}
 boat(c,350-p*28,139,.36);c.restore();
 poly(c,'#e1d2ad',[[55,18],[76,24],[73,211],[58,229],[48,230]]);
 poly(c,'#9a9b84',[[439,26],[460,20],[462,224],[435,215]]);
 line(c,'#aeb6a1',4,[[71,210],[439,211]]);rect(c,'#8a785d',40,228,429,14);
 poly(c,'#354f5c',[[0,214],[125,220],[145,288],[0,288]]);
 poly(c,'#506873',[[352,220],[484,206],[512,230],[512,288],[341,288]]);
 // Close framing gives the siblings ordinary window seats, not a heroic tableau.
 person(c,'nell',190,353,2.3,true);person(c,'tomas',310,365,2.5,true);
 // Luggage rests on the opposite seat, clear of Nell's closer back silhouette.
 poly(c,'#a27853',[[89,259],[99,251],[130,252],[137,285],[88,285]]);
 line(c,'#d1b67f',2,[[95,256],[100,244],[118,245],[122,253]]);
 // Orrin's folded coat and a loose timetable rest on the opposite bench.
 poly(c,'#d8c59b',[[33,251],[78,240],[108,251],[113,278],[36,280]]);
 poly(c,'#385368',[[44,251],[65,246],[81,251],[76,277],[53,278]]);
 poly(c,'#d8c9a1',[[66,256],[99,252],[107,270],[72,274]]);line(c,'#9b9478',1,[[73,260],[98,257],[102,264],[77,267]]);
}
/** Native view coordinates adapt to the canvas, then the shared display chunks
 * art, transitions and UI together. No GIF/video, embedded raster or film filter. */
export function paintEndingFilm(c:C,milliseconds:number,reduced=false,kind:EndingKind='good'){
 const frame=endingFrame(milliseconds,kind),p=reduced?(frame.shot.id==='shore'?.9:.55):frame.progress,t=reduced?0:frame.time/1000;
 const w=c.canvas.width,h=c.canvas.height,s=Math.min(w/512,h/288);
 c.save();c.setTransform(1,0,0,1,0,0);rect(c,'#080f19',0,0,w,h);
 c.save();c.translate((w-512*s)/2,(h-288*s)/2);c.scale(s,s);
 c.beginPath();c.rect(0,0,512,288);c.clip();
 if(kind==='bad')paintBadEndingShot(c,frame.shot.id,frame.time,reduced);
 else if(frame.shot.id==='release')release(c,p,t);
 else if(frame.shot.id==='station')station(c,p,t);
 else if(frame.shot.id==='window')windowSeat(c,p,t);
 else paintEndingShore(c,frame.time,reduced,s);
 c.restore();
 if(frame.index===ENDING_FILMS[kind].creditShot)paintEndingCredits(c,endingCreditTime(frame.time,kind),w,h,reduced);
 if(!reduced){const fade=Math.max(0,1-frame.time/500,1-(frame.shot.duration-frame.time)/500);if(fade>0){c.globalAlpha=Math.min(1,fade);rect(c,'#080f19',0,0,w,h);}}
 c.restore();
}
