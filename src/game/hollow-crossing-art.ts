import {type C,poly,rect,line,oval} from './crossing-drawing';
import {surveyShip} from './airfield-crossing-art';
import {floatingCapital} from './refuge-crossing-art';
import {hollowSunPolygons} from '../content/hollow-sun';
import {paintEndingPerson as person,type EndingPerson} from './ending-cast';

/** The opening keeps the accepted pointed rays and single missing rim wedge.
 * Its interior stays dark; this is the crossing, not a glimpse of the god. */
function opening(c:C,x:number,y:number,r:number,t:number){
 oval(c,'#102431',x,y,r*.9,r*.9);
 c.save();c.beginPath();c.arc(x,y,r*.79,0,Math.PI*2);c.clip();
 for(let i=0;i<5;i++){
  const at=y-r*.5+i*r*.19;
  c.strokeStyle=i%2?'#294554':'#1d3949';c.lineWidth=2;
  c.beginPath();c.moveTo(x-r,at);c.bezierCurveTo(x-r*.4,at-5-Math.sin(t+i)*2,x+r*.4,at+8,x+r,at-3);c.stroke();
 }
 c.restore();
 const sun=hollowSunPolygons(x,y,r);
 for(const points of sun.rays)poly(c,'#ab9366',points.map(({x,y})=>[x,y]));
 for(const [i,points]of sun.bands.entries())poly(c,i%4===0?'#e4c789':i%3===0?'#b49c70':'#ccb47f',points.map(({x,y})=>[x,y]));
}
function traveller(c:C,who:EndingPerson,x:number,y:number,s:number,walk?:number){
 oval(c,'#334952',x,y+1,14*s,2.5*s);
 person(c,who,x,y,s,true,undefined,walk===undefined?undefined:{walk});
 if(who!=='nell')return;
 // Anatomical right, including the arm swing; the collar fitted in Iria remains.
 const swing=walk===undefined?0:Math.sin(walk*Math.PI*2);
 c.save();c.translate(x,y);c.scale(s,s);c.translate(18+swing*2,-29+swing*4);
 line(c,'#bca16f',2,[[-4,3],[-3,-4],[3,-5],[5,2]]);
 poly(c,'#a58a5f',[[-5,3],[5,2],[8,19],[-7,20]]);
 poly(c,'#e6c78c',[[-3,6],[3,5],[5,16],[-4,17]]);
 line(c,'#a6b8ae',2,[[-6,17],[7,16]]);c.restore();
}
function ascent(c:C,p:number,t:number){
 rect(c,'#3e5868',0,0,512,288);
 poly(c,'#6d8284',[[0,147],[83,122],[169,139],[278,119],[381,133],[512,109],[512,288],[0,288]]);
 poly(c,'#a2ad9c',[[0,214],[101,183],[190,198],[281,175],[379,196],[512,173],[512,288],[0,288]]);
 // The familiar royal skyline now rests on foundations, with no airborne gap.
 floatingCapital(c,111,231,.58);
 poly(c,'#758d7b',[[0,255],[72,248],[155,249],[228,260],[314,241],[382,249],[512,224],[512,288],[0,288]]);
 poly(c,'#546e68',[[0,273],[91,266],[170,270],[260,281],[334,264],[427,272],[512,254],[512,288],[0,288]]);
 line(c,'#b4b69a',3,[[37,255],[108,254],[174,258],[214,267]]);
 for(const [x,y]of [[41,258],[79,254],[181,264]]){
  poly(c,'#e0cfa5',[[x,y],[x+12,y-1],[x+9,y+4],[x+2,y+5]]);
  line(c,'#a0a994',1,[[x+5,y],[x+5,y-8]]);
 }
 opening(c,358,94,60+p*4,t);
 // Rigid retreat in perspective: the hull approaches the opening above the city.
 c.save();c.translate(161+p*94,147-p*55);c.scale(.22-p*.04,.22-p*.04);surveyShip(c,t*12);c.restore();
 for(let i=0;i<3;i++){
  const x=-90+i*223-t*8;
  poly(c,'#b3bdad',[[x,278],[x+41,263],[x+83,271],[x+132,253],[x+189,274],[x+214,288],[x,288]]);
 }
}
function threshold(c:C,p:number,t:number){
 rect(c,'#344b5b',0,0,512,288);
 poly(c,'#697f83',[[0,147],[107,131],[187,144],[313,119],[401,139],[512,125],[512,248],[0,248]]);
 c.save();c.translate(256,108);c.scale(1+p*.08,1+p*.08);opening(c,0,0,74,t);c.restore();
 // The same foredeck, with its far rail behind the cast in camera view.
 poly(c,'#536e66',[[0,247],[243,211],[367,220],[512,251],[512,288],[0,288]]);
 poly(c,'#89947b',[[0,246],[243,208],[369,217],[512,247],[512,254],[367,225],[243,217],[0,254]]);
 for(const y of [255,276,296])line(c,'#9ca184',1,[[0,y],[242,y-30],[512,y+3]]);
 for(const [x,y]of [[18,239],[97,228],[310,212],[456,233]])line(c,'#728c7a',4,[[x,y],[x,y+23]]);
 line(c,'#c2b78e',3,[[0,241],[252,204],[512,239]]);
 // All five travel even if Nell or another companion is in the combat reserve.
 traveller(c,'orrin',125,252,.7);
 traveller(c,'celia',360,248,.66);
 traveller(c,'petra',415,264,.73);
 traveller(c,'kit',286,264,.72);
 traveller(c,'nell',226,264,.72);
 // Fixed deck rigging, outside the faces and the centre of the opening.
 line(c,'#869b8b',2,[[29,0],[57,229]]);line(c,'#869b8b',2,[[492,0],[465,234]]);
 poly(c,'#2e4948',[[0,271],[52,264],[81,288],[0,288]]);
}
function hangingSea(c:C,t:number){
 poly(c,'#496c79',[[0,0],[512,0],[512,81],[438,105],[360,95],[271,123],[183,109],[92,129],[0,111]]);
 poly(c,'#648892',[[0,0],[512,0],[512,36],[424,58],[345,46],[250,73],[158,61],[71,84],[0,72]]);
 poly(c,'#83a3a3',[[0,0],[512,0],[512,15],[423,33],[337,25],[245,46],[153,35],[70,59],[0,49]]);
 for(let i=0;i<5;i++){
  const x=(i*124+t*7)%670-84,y=34+i%3*19;
  c.strokeStyle='#a1b9b0';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y);
  c.quadraticCurveTo(x+28,y+7,x+66,y-4);c.stroke();
 }
 // An inverted boat rides the overhead surface; its wake stays with that sea.
 c.save();c.translate(152+t*4,67);c.rotate(Math.PI);c.scale(.55,.55);
 poly(c,'#9c7d58',[[-30,0],[31,0],[19,12],[-20,13]]);
 poly(c,'#c5ad7d',[[-28,0],[28,0],[17,4],[-21,4]]);
 line(c,'#b7b799',2,[[0,-39],[0,1]]);
 poly(c,'#dfd6b3',[[-3,-36],[-24,-5],[-3,-5]]);
 poly(c,'#92b0ad',[[3,-30],[20,-5],[3,-5]]);c.restore();
}
function hangingsea(c:C,p:number,t:number){
 rect(c,'#142b3c',0,0,512,288);
 hangingSea(c,t);
 // Suspended landings fade into the distance, without revealing the far god.
 poly(c,'#2d4856',[[297,158],[340,144],[363,151],[390,134],[447,141],[512,117],[512,153],[449,168],[390,158],[363,177],[338,171],[299,182]]);
 poly(c,'#49636a',[[340,144],[363,151],[390,134],[447,141],[512,117],[512,124],[448,149],[389,141],[365,159],[338,151]]);
 // The ship holds the entrance; the companions cross on foot. No landing/cure
 // flags are committed here, and Alda's spoken mooring check follows on arrival.
 c.save();c.translate(-79,124);c.scale(.25,.25);surveyShip(c,t*12);c.restore();
 // A walkable gangway connects the actual gondola door to the pier's near end.
 poly(c,'#7e8069',[[12,213],[21,211],[115,246],[109,255]]);
 for(let i=0;i<7;i++){const u=i/7;line(c,'#b5aa7e',1,[[15+u*96,213+u*36],[22+u*91,213+u*31]]);}
 line(c,'#8d9b86',1.5,[[19,203],[114,238]]);
 for(const [x,y]of [[34,208],[82,226]])line(c,'#6c867a',2,[[x,y],[x,y+12]]);
 poly(c,'#4b6167',[[91,242],[166,210],[233,221],[319,197],[403,182],[455,164],[470,171],[409,198],[329,220],[236,246],[171,234],[112,264]]);
 poly(c,'#9c9d80',[[91,235],[166,203],[233,214],[319,190],[403,175],[455,157],[470,164],[409,191],[329,213],[236,239],[171,227],[112,257]]);
 poly(c,'#b6ad83',[[91,235],[166,203],[233,214],[319,190],[403,175],[455,157],[470,164],[455,163],[404,181],[320,196],[234,220],[166,210],[96,241]]);
 for(const [x,y]of [[190,216],[241,218],[303,199],[365,190],[420,174]])line(c,'#7a8879',1,[[x,y],[x+5,y+12]]);
 line(c,'#889787',2,[[92,224],[166,192],[231,203],[320,179],[402,164],[454,146]]);
 for(const [x,y]of [[116,214],[178,194],[317,180],[405,162]])line(c,'#6e877d',3,[[x,y],[x,y+15]]);
 // A visible continuous rope returns to the ship's locked mooring drum.
 line(c,'#bdad7c',1.5,[[33,211],[69,228],[105,241]]);
 oval(c,'#59766f',104,242,7,6);oval(c,'#b6a67b',104,242,4,4);
 for(const [who,x,y,s,phase]of [
  ['petra',278,218,.37,.1],['orrin',233,227,.41,.7],['celia',194,222,.37,.3],
  ['kit',161,239,.41,.6],['nell',126,248,.42,0],
 ]as const)traveller(c,who,x+p*17,y-p*5,s,p*1.2+phase);
 // The distant steps finish in mist. The original arrival owns the camera pan,
 // the Benefactor's first full appearance, its warning and withdrawal.
 c.save();c.globalAlpha=.22;
 poly(c,'#6e9395',[[376,125],[428,117],[512,128],[512,143],[438,135],[383,146]]);c.restore();
}
export function hollowCrossingShot(c:C,index:number,p:number,t:number){
 if(index===0)ascent(c,p,t);else if(index===1)threshold(c,p,t);else hangingsea(c,p,t);
}
