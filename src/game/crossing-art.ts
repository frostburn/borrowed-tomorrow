import {crossingFrame,type CrossingKind} from '../content/crossing';
import {paintEndingPerson as person} from './ending-cast';
import {type C,poly,rect,line,oval,P,engine} from './crossing-drawing';
import {capitalCrossingShot} from './capital-crossing-art';
import {refugeCrossingShot} from './refuge-crossing-art';
import {airfieldCrossingShot} from './airfield-crossing-art';
import {mooringCrossingShot} from './mooring-crossing-art';
function coast(c:C,shift:number){
 rect(c,P.sky,0,0,512,288);poly(c,'#bdc0ac',[[0,90],[94,79],[176,88],[288,71],[423,82],[512,73],[512,145],[0,145]]);
 rect(c,P.sea,0,134,512,154);
 for(let i=0;i<13;i++){const x=(i*67-shift*.2+600)%600-50;line(c,'#719197',1,[[x,147+i*8],[x+28+i%4*8,146+i*8]]);}
 poly(c,'#526c75',[[0,177],[78,143],[167,169],[221,150],[283,167],[361,130],[447,150],[512,137],[512,288],[0,288]]);
}
function pass(c:C,p:number,t:number){
 coast(c,p*30);
 poly(c,P.rock,[[0,0],[512,0],[512,47],[430,20],[360,57],[295,48],[260,108],[205,118],[162,159],[0,172]]);
 poly(c,'#647885',[[0,0],[140,0],[211,84],[176,129],[111,153],[0,164]]);
 poly(c,P.night,[[62,183],[69,96],[104,58],[151,55],[184,91],[194,185]]);
 line(c,'#7d8b8a',9,[[62,182],[65,105],[91,67],[131,53],[166,70],[189,112],[194,181]]);
 poly(c,P.face,[[0,177],[221,160],[350,178],[512,161],[512,288],[0,288]]);
 poly(c,P.dark,[[0,191],[227,176],[512,180],[512,204],[224,195],[0,211]]);
 line(c,'#8c9e9a',3,[[0,185],[220,172],[512,178]]);line(c,'#8c9e9a',2,[[0,197],[222,184],[512,190]]);
 for(let i=0;i<24;i++){const x=i*24;line(c,'#a08f72',3,[[x,184],[x-2,198]]);}
 engine(c,191+p*99,174,1.08,t);
 // Near rocks pass the lens; their slower far planes give the train real depth.
 poly(c,'#2b424e',[[0,233],[83-p*35,203],[131-p*35,246],[176-p*35,258],[181,288],[0,288]]);
}
function viaduct(c:C,p:number,t:number){
 coast(c,p*90);
 // The distant cranes stand on the exchange quay across the bay.
 poly(c,'#3e5661',[[333,132],[512,115],[512,139],[333,155]]);
 for(const [x,y]of [[360,130],[424,124],[481,119]]){
  line(c,'#364e5c',4,[[x,y],[x+5,y-57],[x+41,y-68]]);line(c,'#80938e',1,[[x+4,y-53],[x+37,y-65],[x+37,y-28]]);
  rect(c,P.light,x+34,y-29,3,3);
 }

 poly(c,'#8d9e9c',[[0,189],[126,157],[266,135],[512,117],[512,129],[266,148],[126,171],[0,202]]);
 for(let i=0;i<7;i++){
  const x=18+i*77,top=183-x*.14;
  poly(c,P.rock,[[x,top],[x+21,top-3],[x+30,288],[x-11,288]]);
  poly(c,'#708681',[[x,top],[x+7,top-1],[x+10,288],[x-11,288]]);
  c.strokeStyle='#6a807e';c.lineWidth=10;c.beginPath();c.moveTo(x+16,top+19);c.quadraticCurveTo(x+51,top-10,x+83,top+9);c.stroke();
 }
 line(c,'#c1c0a2',2,[[0,188],[126,156],[266,134],[512,116]]);
 line(c,'#a7b5aa',2,[[0,195],[126,163],[266,141],[512,123]]);
 c.save();c.translate(165+p*160,153-p*24);c.rotate(-.11);engine(c,0,0,.47,t);c.restore();
 poly(c,'#314b58',[[0,253],[67,239],[106,288],[0,288]]);poly(c,'#38535f',[[410,288],[450,226],[512,204],[512,288]]);
}
function exchange(c:C,p:number,t:number){
 coast(c,p*20);
 // Two rails converge on the exchange; no route or rescue is solved here.
 poly(c,'#5e7476',[[105,159],[398,159],[512,288],[0,288]]);
 for(const offset of [-1,1])line(c,'#b5c0b0',3,[[257+offset*7,161],[257+offset*73,288]]);
 for(let i=0;i<14;i++){const u=(i/14+t*.13)%1,y=163+u*u*133;line(c,'#998d70',2+u*2,[[248-u*76,y],[266+u*76,y]]);}
 // A gentle approach about the vanishing point leaves the foreground cab fixed.
 c.save();c.translate(257,156);c.scale(1+.08*p,1+.08*p);c.translate(-257,-156);
 for(let i=0;i<4;i++){
  const x=63+i*34;poly(c,'#354e5d',[[x,144],[x+28,143],[x+30,164],[x,165]]);
  rect(c,'#c8b68c',x+5,148,5,6);rect(c,'#c8b68c',x+17,148,5,6);
  line(c,P.dark,1,[[x+7,148],[x+7,154]]);line(c,P.dark,1,[[x+19,148],[x+19,154]]);
 }
 line(c,'#3b525f',5,[[337,168],[339,71],[430,50]]);line(c,'#82958f',2,[[340,86],[418,56],[418,114]]);
 poly(c,'#d0c8a0',[[415,115],[422,115],[421,121],[416,121]]);
 for(const x of [210,307]){line(c,'#4b6168',3,[[x,165],[x-2,123]]);oval(c,P.light,x-2,123,3,2);}
 poly(c,'#9ca995',[[215,154],[231,158],[231,165],[215,164]]);poly(c,'#4c615e',[[282,157],[301,154],[301,164],[282,165]]);
 c.restore();
 // Foreground cab framing and two familiar silhouettes, looking down the line.
 poly(c,P.dark,[[0,0],[67,0],[83,288],[0,288]]);poly(c,P.steel,[[48,0],[66,0],[82,288],[65,288]]);
 poly(c,P.dark,[[450,0],[512,0],[512,288],[435,288]]);poly(c,P.steel,[[450,0],[462,0],[446,288],[435,288]]);
 poly(c,'#273f4e',[[0,0],[512,0],[512,38],[390,25],[143,32],[0,49]]);
 line(c,P.brass,1.5,[[238,29],[238,235]]);
 person(c,'nell',198,360,1.64,true);person(c,'orrin',310,372,1.8,true);
 // Ansel's lantern hangs on Nell's right, clear of Orrin's silhouette.
 line(c,P.brass,2,[[231,246],[233,237],[239,235],[244,240],[243,247]]);
 poly(c,'#8e7654',[[230,247],[245,247],[249,268],[228,269]]);poly(c,P.light,[[233,251],[242,251],[245,265],[232,265]]);
 poly(c,'#4b6368',[[78,279],[437,269],[437,288],[78,288]]);
}
/** Direct vectors feed the same chunky framebuffer as the UI and actors. */
export function paintChapterCrossing(c:C,milliseconds:number,reduced=false,kind:CrossingKind='coast'){
 const f=crossingFrame(milliseconds,kind),p=reduced?.55:f.progress,t=reduced?1.5:f.time/1000;
 const w=c.canvas.width,h=c.canvas.height;
 // Keep both ends of the escape and the arrested coast in narrow overview shots.
 const overview=(kind==='airfield'||kind==='mooring'||kind==='refuge'&&f.index!==1)&&w/h<512/288;
 const scale=overview?Math.min(w/512,h/288):Math.max(w/512,h/288);
 const focal=kind==='refuge'?(f.index===0?280-p*65:f.index===1?256:290):kind==='capital'?(f.index===0?280+p*50:f.index===1?240:270):f.index===0?241+p*30:f.index===1?165+p*160:254;
 c.save();c.setTransform(1,0,0,1,0,0);rect(c,'#101e2d',0,0,w,h);
 const center=overview?256:Math.max(w/scale/2,Math.min(512-w/scale/2,focal));
 c.translate(w/2-center*scale,(h-288*scale)/2);c.scale(scale,scale);
 if(kind==='mooring')mooringCrossingShot(c,f.index,p,t);else if(kind==='airfield')airfieldCrossingShot(c,f.index,p,t);else if(kind==='refuge')refugeCrossingShot(c,f.index,p,t);else if(kind==='capital')capitalCrossingShot(c,f.index,p,t);else if(f.index===0)pass(c,p,t);else if(f.index===1)viaduct(c,p,t);else exchange(c,p,t);
 c.restore();
 if(!reduced){
  const fade=Math.max(0,1-f.time/300,f.index<2?1-(f.shot.duration-f.time)/300:0);
  if(fade>0){c.save();c.globalAlpha=Math.min(1,fade);rect(c,'#101e2d',0,0,w,h);c.restore();}
 }
}
