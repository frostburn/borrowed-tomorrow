import {crossingFrame} from '../content/crossing';
import {paintEndingPerson as person} from './ending-cast';
type C=CanvasRenderingContext2D;
type Point=readonly [number,number];
const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const rect=(c:C,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const P={night:'#1b2d40',sky:'#617e8b',mist:'#90a6a5',rock:'#384d5c',face:'#526976',dark:'#253b48',steel:'#638487',brass:'#bd945a',light:'#f0cd8b',sea:'#3b6376'};

function steam(c:C,x:number,y:number,t:number){
 for(let i=0;i<6;i++){
  const p=(t*.7+i/6)%1;c.globalAlpha=(1-p)*.65;
  oval(c,'#c3d0bf',x-p*42,y-p*39,5+p*13,4+p*9);
 }
 c.globalAlpha=1;
}
/** Orrin's short coal engine: blue-green boiler, brass bands and low cab. */
function engine(c:C,x:number,y:number,s:number,t:number){
 c.save();c.translate(x,y);c.scale(s,s);
 steam(c,52,-52,t);
 // Wheels and a rigid coupling rod move about fixed axles, below the running board.
 for(const wx of [-44,-14,17,43]){
  oval(c,P.dark,wx,0,wx===-44?10:12,wx===-44?10:12);oval(c,P.steel,wx,-1,7,7);
  line(c,'#9ba992',2,[[wx,-1],[wx+Math.cos(t*8)*6,-1+Math.sin(t*8)*6]]);
 }
 line(c,'#9ba992',3,[[-14+Math.cos(t*8)*5,Math.sin(t*8)*5],[43+Math.cos(t*8)*5,Math.sin(t*8)*5]]);
 poly(c,P.dark,[[-59,-9],[55,-9],[62,-2],[-60,-2]]);
 poly(c,'#3b535b',[[-60,-50],[-25,-52],[-24,-10],[-60,-10]]);
 rect(c,P.night,-53,-44,19,19);rect(c,'#b49a68',-51,-42,15,15);
 // A small warm lantern inside the cab, without crystal effects.
 rect(c,'#d6b877',-40,-38,3,10);
 poly(c,'#304b55',[[-25,-36],[42,-40],[58,-30],[57,-12],[-24,-10]]);
 poly(c,P.steel,[[-24,-37],[40,-42],[54,-34],[-24,-27]]);
 for(const bx of [-13,18,40])line(c,P.brass,3,[[bx,-36],[bx,-13]]);
 oval(c,'#2a414e',55,-26,9,16);oval(c,P.steel,57,-27,5,12);
 poly(c,P.dark,[[44,-37],[46,-61],[55,-61],[56,-36]]);rect(c,P.steel,43,-63,15,4);
 poly(c,P.brass,[[13,-39],[15,-49],[23,-49],[27,-40]]);
 poly(c,P.night,[[-65,-52],[-59,-59],[-23,-61],[-17,-53]]);line(c,P.steel,2,[[-59,-57],[-24,-59]]);
 oval(c,P.brass,61,-30,5,6);oval(c,P.light,63,-31,2,3);
 c.restore();
}
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
 for(let i=0;i<4;i++){
  const x=63+i*34;poly(c,'#354e5d',[[x,144],[x+28,143],[x+30,164],[x,165]]);
  rect(c,'#c8b68c',x+5,148,5,6);rect(c,'#c8b68c',x+17,148,5,6);
  line(c,P.dark,1,[[x+7,148],[x+7,154]]);line(c,P.dark,1,[[x+19,148],[x+19,154]]);
 }
 line(c,'#3b525f',5,[[337,168],[339,71],[430,50]]);line(c,'#82958f',2,[[340,86],[418,56],[418,114]]);
 poly(c,'#d0c8a0',[[415,115],[422,115],[421,121],[416,121]]);
 for(const x of [210,307]){line(c,'#4b6168',3,[[x,165],[x-2,123]]);oval(c,P.light,x-2,123,3,2);}
 poly(c,'#9ca995',[[215,154],[231,158],[231,165],[215,164]]);poly(c,'#4c615e',[[282,157],[301,154],[301,164],[282,165]]);
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
export function paintChapterCrossing(c:C,milliseconds:number,reduced=false){
 const f=crossingFrame(milliseconds),p=reduced?.55:f.progress,t=reduced?1.5:f.time/1000;
 const w=c.canvas.width,h=c.canvas.height,scale=Math.max(w/512,h/288);
 const focal=f.index===0?241+p*30:f.index===1?165+p*160:254;
 c.save();c.setTransform(1,0,0,1,0,0);rect(c,'#101e2d',0,0,w,h);
 const center=Math.max(w/scale/2,Math.min(512-w/scale/2,focal));
 c.translate(w/2-center*scale,(h-288*scale)/2);c.scale(scale,scale);
 if(f.index===0)pass(c,p,t);else if(f.index===1)viaduct(c,p,t);else exchange(c,p,t);
 c.restore();
 if(!reduced){
  const fade=Math.max(0,1-f.time/300,f.index<2?1-(f.shot.duration-f.time)/300:0);
  if(fade>0){c.save();c.globalAlpha=Math.min(1,fade);rect(c,'#101e2d',0,0,w,h);c.restore();}
 }
}
