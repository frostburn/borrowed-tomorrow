import {endingFrame} from '../content/ending-film';
import {bitmapText} from './pixel-font';

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
function lantern(c:C,x:number,y:number,s=1){
 c.save();c.translate(x,y);c.scale(s,s);
 line(c,'#947d53',3,[[-5,0],[-5,-9],[4,-12],[10,-7],[10,0]]);
 poly(c,'#8b7652',[[-10,0],[13,0],[16,30],[-12,30]]);poly(c,'#b6bfa7',[[-5,5],[7,5],[9,24],[-7,24]]);
 poly(c,'#e1d6a9',[[-3,5],[1,5],[-1,24],[-7,24]]);rect(c,'#695d48',-12,28,28,4);c.restore();
}
type Person='nell'|'kit'|'tomas'|'orrin'|'celia'|'petra';
/** Character-specific heads, coats and resting stances; no weapons at the picnic. */
function person(c:C,who:Person,x:number,y:number,s=1,back=false){
 c.save();c.translate(x,y);c.scale(s,s);
 const coat={nell:'#ad6549',kit:'#647d89',tomas:'#61736c',orrin:'#577178',celia:'#638379',petra:'#7d7980'}[who];
 const skin=who==='celia'?'#d1af91':who==='orrin'?'#c59d7d':'#d9af8a';
 const hair=who==='celia'?'#bcc8bf':who==='orrin'?'#c9c3ab':who==='petra'?'#6b4e41':who==='kit'?'#62463b':who==='tomas'?'#674d40':'#a05b3e';
 const wide=who==='orrin'?4:0;
 poly(c,'#344b59',[[-9-wide,-23],[8+wide,-23],[10+wide,0],[3,1],[0,-15],[-2,1],[-11-wide,1]]);
 poly(c,coat,[[-12-wide,-49],[8+wide,-49],[14+wide,-21],[3,-18],[-11-wide,-22],[-15-wide,-37]]);
 poly(c,'#45616a',[[8+wide,-46],[14+wide,-21],[7,-20],[3,-44]]);
 poly(c,who==='nell'?'#cb8c57':'#90a098',[[-11-wide,-46],[-5,-47],[-3,-24],[-11-wide,-22]]);
 poly(c,skin,[[-10,-64],[-5,-69],[6,-67],[11,-57],[6,-49],[-5,-50],[-11,-57]]);
 poly(c,hair,[[-12,-62],[-8,-71],[6,-72],[13,-62],[10,-53],[6,-61],[-3,-64],[-10,-55]]);
 if(back)poly(c,hair,[[-11,-63],[9,-64],[10,-52],[-5,-50],[-12,-55]]);
 else{
  rect(c,'#455456',-6,-59,2,2);rect(c,who==='tomas'?'#47674e':'#455456',4,-59,2,2);
  poly(c,'#bc8b6c',[[0,-58],[2,-54],[-1,-53]]);line(c,'#a57660',1,[[-3,-51],[3,-51]]);
 }
 if(who==='nell'){
  poly(c,'#9b5d43',[[-13,-66],[-7,-76],[8,-74],[14,-65],[4,-63]]);
  poly(c,'#c58551',[[-12,-66],[6,-68],[17,-65],[16,-62],[-12,-62]]);
  poly(c,hair,[[-10,-54],[-7,-48],[-8,-33],[-12,-27],[-14,-31],[-11,-43]]);
  poly(c,hair,[[9,-54],[12,-48],[12,-36],[15,-29],[11,-26],[8,-39]]);
 }else if(who==='kit'){
  poly(c,hair,[[-13,-66],[-8,-73],[-3,-71],[3,-76],[7,-70],[13,-69],[10,-61]]);
  poly(c,'#c5a267',[[-8,-49],[3,-44],[9,-49],[8,-41],[1,-38],[-8,-44]]);
  line(c,'#8a7150',3,[[8,-42],[-8,-21]]);poly(c,'#8a7150',[[-15,-26],[-6,-28],[-4,-16],[-14,-15]]);
 }else if(who==='orrin'){
  poly(c,hair,[[-12,-57],[-7,-51],[9,-54],[9,-44],[3,-38],[-8,-42],[-14,-50]]);
  poly(c,'#dcd3b4',[[-8,-51],[-2,-48],[6,-50],[2,-43],[-5,-43]]);
 }else if(who==='celia'){
  poly(c,hair,[[-13,-60],[-9,-50],[-9,-45],[-16,-50],[-16,-64],[-7,-73],[8,-71],[15,-60],[13,-48],[7,-46],[10,-56],[6,-63]]);
  if(!back){line(c,'#617578',2,[[-10,-60],[-3,-60],[-3,-55],[-10,-55],[-10,-60],[2,-60],[10,-60],[10,-55],[2,-55],[2,-60]]);}
  poly(c,'#c2baa0',[[-6,-49],[0,-43],[6,-50],[4,-39],[-2,-37]]);
 }else if(who==='petra'){
  poly(c,hair,[[8,-66],[17,-64],[19,-44],[13,-34],[10,-38],[13,-52]]);
  poly(c,'#d0c3a5',[[-10,-49],[-2,-45],[8,-49],[7,-42],[-2,-39]]);
 }else{
  poly(c,'#cfb992',[[-7,-49],[0,-45],[8,-48],[3,-39],[-5,-40]]);
  if(!back)line(c,'#6c5243',2,[[-9,-56],[-6,-52]]);
 }
 poly(c,coat,[[-13-wide,-44],[-19-wide,-29],[-15-wide,-15],[-11-wide,-16],[-13-wide,-29],[-6,-40]]);
 poly(c,skin,[[-16-wide,-16],[-10-wide,-16],[-9-wide,-11],[-14-wide,-9]]);
 poly(c,coat,[[9+wide,-44],[19+wide,-29],[15+wide,-17],[11+wide,-18],[12+wide,-30],[5,-39]]);
 poly(c,skin,[[11+wide,-18],[16+wide,-17],[16+wide,-11],[11+wide,-10]]);
 poly(c,'#655447',[[-11-wide,-1],[-3,-2],[-1,4],[-13-wide,4]]);
 poly(c,'#655447',[[3,-2],[10+wide,-1],[14+wide,4],[3,4]]);c.restore();
}
function coast(c:C,t:number){
 rect(c,P.sky,0,0,512,288);cloud(c,42-t*4,24,1.4);cloud(c,330-t*2,44,.85);
 poly(c,'#8ba6a5',[[0,104],[84,91],[128,97],[188,84],[254,103],[329,97],[418,105],[512,99],[512,139],[0,139]]);
 rect(c,P.sea,0,120,512,168);
 for(let i=0;i<10;i++){const y=131+i*13,shift=Math.sin(t*1.1+i)*4;poly(c,i%2?P.water:'#638c94',[[12+i*7+shift,y],[139+i*15+shift,y-1],[197+i*9+shift,y+2],[62+i*4+shift,y+3]]);}
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
 for(const [x,y]of [[91,249],[157,230],[222,231]])line(c,'#87b4bb',2,[[x,y-17],[x+2,y-12],[x+7,y-15]]);
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
 person(c,'tomas',277,243,.58);person(c,'nell',302,247,.52);person(c,'kit',327,241,.5);
 person(c,'celia',356,235,.48);person(c,'petra',378,239,.52);person(c,'orrin',402,242,.55);
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
 person(c,'nell',196,287,1.8,true);person(c,'tomas',307,286,1.95,true);
 poly(c,'#a27853',[[154,244],[164,236],[195,237],[202,270],[153,270]]);
 line(c,'#d1b67f',2,[[160,241],[165,229],[183,230],[187,238]]);
 // Orrin's folded coat and a loose timetable rest on the opposite bench.
 poly(c,'#75827b',[[33,251],[78,240],[108,251],[113,278],[36,280]]);
 poly(c,'#d8c9a1',[[66,256],[99,252],[107,270],[72,274]]);line(c,'#9b9478',1,[[73,260],[98,257],[102,264],[77,267]]);
}
function shore(c:C,p:number,t:number){
 coast(c,t);
 boat(c,111+p*52,136,.48);boat(c,365-p*31,158,.28);
 poly(c,'#81958e',[[0,185],[73,171],[113,187],[145,215],[97,235],[0,247]]);
 poly(c,'#d3b889',[[0,234],[104,211],[210,219],[305,207],[407,200],[512,207],[512,288],[0,288]]);
 poly(c,'#a18c6c',[[0,265],[112,244],[220,249],[346,233],[457,241],[512,232],[512,288],[0,288]]);
 // Continuous shallow foam approaches, then retreats along the actual shoreline.
 const wave=Math.sin(t*.8)*3;
 poly(c,P.foam,[[127,209+wave],[214,213+wave],[304,201+wave],[405,195+wave],[512,201+wave],[512,204+wave],[405,200+wave],[305,206+wave],[216,218+wave],[133,214+wave]]);
 poly(c,'#76847b',[[3,223],[55,208],[83,220],[71,239],[7,247]]);
 poly(c,'#a2aa91',[[3,223],[51,215],[78,220],[63,228],[10,235]]);
 // The picnic includes the other four travelers. Their work can wait.
 poly(c,'#8e6e60',[[295,215],[365,211],[391,239],[315,246]]);
 line(c,'#c1ac8d',3,[[307,220],[376,231]]);line(c,'#c1ac8d',2,[[330,215],[349,242]]);
 person(c,'orrin',308,226,.4);person(c,'celia',343,216,.36);person(c,'petra',376,227,.4);person(c,'tomas',352,246,.4);
 oval(c,'#d6c7a4',340,233,7,3);poly(c,'#c2a16b',[[324,232],[329,225],[337,228],[334,234]]);
 // A closer, sheltered plane: two young people watching fishing boats.
 person(c,'nell',206,253,.86,true);person(c,'kit',246,253,.91,true);
 const reach=ease((p-.18)/.28);
 line(c,'#b97550',5,[[216,218],[223,231],[225+reach*2,239]]);
 line(c,'#687f89',5,[[235,219],[233,232],[229-reach*2,239]]);
 if(reach>.6)oval(c,'#d4ad88',227,239,4,2);
 oval(c,'#6c7464',147,266,23,6);lantern(c,148,235,.82);
 // Angled foreground pines frame the open sea, with a slight breeze at the tips.
 poly(c,'#49665d',[[0,0],[16,0],[33,161],[60,288],[31,288],[13,187]]);
 poly(c,'#526f62',[[0,0],[144,0],[122,22],[97,18],[79,35],[39,21],[0,34]]);
 const breeze=Math.sin(t*.65)*1.5;
 poly(c,'#78917b',[[9,5],[109,5],[94,14+breeze],[68,12],[51,23+breeze],[21,13]]);
 if(p>.65){
  c.globalAlpha=ease((p-.65)/.23);
  bitmapText(c,'Borrowed Tomorrow',154,270,'#f4e5be',2);
  c.globalAlpha=1;
 }
}

/** Native view coordinates adapt to the canvas, then the shared display chunks
 * art, transitions and UI together. No GIF/video, embedded raster or film filter. */
export function paintGoodEnding(c:C,milliseconds:number,reduced=false){
 const frame=endingFrame(milliseconds),p=reduced?(frame.shot.id==='shore'?.9:.55):frame.progress,t=reduced?0:frame.time/1000;
 const w=c.canvas.width,h=c.canvas.height,s=Math.min(w/512,h/288);
 c.save();c.setTransform(1,0,0,1,0,0);rect(c,'#080f19',0,0,w,h);
 c.translate((w-512*s)/2,(h-288*s)/2);c.scale(s,s);
 c.beginPath();c.rect(0,0,512,288);c.clip();
 if(frame.shot.id==='release')release(c,p,t);
 else if(frame.shot.id==='station')station(c,p,t);
 else if(frame.shot.id==='window')windowSeat(c,p,t);
 else shore(c,p,t);
 if(!reduced){const fade=Math.max(0,1-frame.time/500,1-(frame.shot.duration-frame.time)/500);if(fade>0){c.globalAlpha=Math.min(1,fade);rect(c,'#080f19',0,0,512,288);}}
 c.restore();
}
