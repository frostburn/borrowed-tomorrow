// Native pixel artwork, authored as reusable 24px tiles. No scenery is sampled.
// Run from the repository root: node assets/tiles/draw-chapter-one.mjs
import { writeFileSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const S=24,COLS=8,tiles=[];
const P={ink:'#151e2d',deep:'#1d2b3c',shade:'#27394b',slate:'#354b5a',stone:'#526773',light:'#7f9294',cream:'#d7c5a0',gold:'#c79b55',shine:'#f4d991',wood:'#6e5149',woodL:'#a47b59',woodD:'#403541',brick:'#79515a',red:'#aa6664',roof:'#385666',roofL:'#527586',roofD:'#243948',leaf:'#2b4c49',leafL:'#41675a',leafH:'#65816a',soil:'#574c48',soilL:'#706159',soilD:'#454047',grass:'#304b49',grassL:'#3e5a50',water:'#234757',waterL:'#426b79'};
const color=c=>{c=P[c]??c;return [parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16),255];};
class Pixels{
  constructor(w,h){this.w=w;this.h=h;this.data=Buffer.alloc(w*h*4);}
  dot(x,y,c){x=Math.floor(x);y=Math.floor(y);if(x<0||x>=this.w||y<0||y>=this.h)return;this.data.set(color(c),(y*this.w+x)*4);}
  rect(x,y,w,h,c){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)this.dot(xx,yy,c);}
  line(x,y,xx,yy,c){const n=Math.max(Math.abs(xx-x),Math.abs(yy-y));for(let i=0;i<=n;i++)this.dot(Math.round(x+(xx-x)*i/(n||1)),Math.round(y+(yy-y)*i/(n||1)),c);}
  ellipse(x,y,rx,ry,c){for(let yy=y-ry;yy<=y+ry;yy++)for(let xx=x-rx;xx<=x+rx;xx++)if(((xx-x)/rx)**2+((yy-y)/ry)**2<=1)this.dot(xx,yy,c);}
  poly(points,c){const ys=points.map(p=>p[1]);for(let y=Math.min(...ys);y<=Math.max(...ys);y++){const xs=[];for(let i=0;i<points.length;i++){const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length];if((y1<=y&&y2>y)||(y2<=y&&y1>y))xs.push(x1+(y-y1)*(x2-x1)/(y2-y1));}xs.sort((a,b)=>a-b);for(let i=0;i<xs.length;i+=2)for(let x=Math.ceil(xs[i]);x<xs[i+1];x++)this.dot(x,y,c);}}
}
function noise(p,seed,colors,count=22){let n=seed*7829+43;for(let i=0;i<count;i++){n=(n*1664525+1013904223)>>>0;const x=n%p.w;n=(n*1664525+1013904223)>>>0;const y=n%p.h;p.rect(x,y,1+(i%3===0?1:0),1,colors[i%colors.length]);}}
function tile(name,walkable,draw){const p=new Pixels(S,S);draw(p);tiles.push({name,walkable,p});}
function stamp(name,w,h,walkable,draw){const p=new Pixels(w*S,h*S);draw(p);for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  tile(`${name}-${x}-${y}`,typeof walkable==='function'?walkable(x,y):walkable,t=>{for(let yy=0;yy<S;yy++)for(let xx=0;xx<S;xx++){const at=((y*S+yy)*p.w+x*S+xx)*4;t.data.set(p.data.subarray(at,at+4),(yy*S+xx)*4);}});
  tiles.at(-1).sortOffset=(h-y)*S;
}}
for(let v=0;v<4;v++){
  tile(`grass-${v}`,true,p=>{p.rect(0,0,S,S,'grass');noise(p,v+1,['grassL','leaf'],22);for(let i=0;i<3;i++){const x=(v*7+i*11)%21,y=(v*3+i*7)%22;p.rect(x,y,1,2,'leafH');p.dot(x-1,y-1,'grassL');}});
  tile(`earth-${v}`,true,p=>{p.rect(0,0,S,S,'soil');noise(p,v+9,['soilL','soilD'],28);p.line(3+v,8,8+v,7,'soilD');p.rect(16,19-v,3,1,'soilL');});
  tile(`paving-${v}`,true,p=>{p.rect(0,0,S,S,'shade');for(let y=0;y<3;y++)for(let x=-1;x<3;x++){const xx=x*12+(y%2)*6,yy=y*8;p.rect(xx+1,yy,11,7,v%2?'#667878':'#617372');p.rect(xx+1,yy,10,1,'light');p.rect(xx+2,yy+6,9,1,'stone');}noise(p,v+15,['#71817e','#52666a'],10);});
  tile(`ballast-${v}`,true,p=>{p.rect(0,0,S,S,'slate');noise(p,v+23,['stone','deep','light'],70);});
  tile(`water-${v}`,false,p=>{p.rect(0,0,S,S,'water');for(const [x,y,w] of [[2,4+v,8],[14,11-v,8],[6,19,11]]){p.rect(x,y,w,1,'waterL');p.rect(x+2,y+1,w-4,1,'#2f596a');}});
  tile(`cliff-${v}`,false,p=>{p.rect(0,0,S,S,'deep');p.poly([[0,0],[24,0],[24,13],[18,18],[12,16],[5,24],[0,24]],'shade');p.line(0,2,18,2,'slate');p.line(18,2,16,15,'stone');p.line(5,10,3,23,'slate');noise(p,v+31,['slate','deep'],10);});
}
tile('void',false,p=>p.rect(0,0,S,S,'ink'));
tile('bank-w',false,p=>{p.rect(0,0,9,S,'grass');p.rect(9,0,5,S,'slate');p.line(9,0,11,23,'light');p.rect(14,0,10,S,'water');for(const y of [2,12,20])p.rect(12,y,7,1,'waterL');});
tile('bank-e',false,p=>{p.rect(0,0,10,S,'water');p.rect(10,0,5,S,'slate');p.line(13,0,15,23,'light');p.rect(15,0,9,S,'grass');for(const y of [6,17])p.rect(5,y,7,1,'waterL');});
tile('quay',true,p=>{p.rect(0,0,S,S,'slate');p.rect(0,1,S,6,'light');p.rect(0,2,S,3,'cream');p.rect(0,8,S,16,'stone');p.line(11,9,11,23,'shade');p.line(0,17,23,17,'shade');});
tile('steps',true,p=>{p.rect(0,0,S,S,'stone');for(let y=0;y<24;y+=6){p.rect(0,y,24,2,'light');p.rect(0,y+5,24,1,'shade');}});
tile('bridge',true,p=>{p.rect(0,0,S,S,'woodD');for(let y=0;y<24;y+=6){p.rect(0,y,24,4,'woodL');p.rect(2,y+1,20,1,'wood');p.dot(3,y+3,'ink');p.dot(21,y+3,'ink');}});
for(const edge of ['n','s','w','e'])tile(`path-${edge}`,undefined,p=>{const y=edge==='s'?20:0,x=edge==='e'?20:0;if(edge==='n'||edge==='s'){p.rect(0,y,24,4,'soilD');for(let i=0;i<24;i+=5)p.rect(i,y+(i%3),3,1,'grassL');}else{p.rect(x,0,4,24,'soilD');for(let i=0;i<24;i+=5)p.rect(x+(i%3),i,1,3,'grassL');}});
tile('rail-h',undefined,p=>{for(let x=2;x<24;x+=8){p.rect(x,1,5,22,'woodD');p.rect(x,2,4,19,'wood');p.rect(x,2,1,19,'woodL');}for(const y of [5,17]){p.rect(0,y,24,3,'ink');p.rect(0,y,24,1,'light');p.rect(0,y+1,24,1,'stone');}});
tile('rail-v',undefined,p=>{for(let y=2;y<24;y+=8){p.rect(1,y,22,5,'woodD');p.rect(2,y,19,4,'wood');p.rect(2,y,19,1,'woodL');}for(const x of [5,17]){p.rect(x,0,3,24,'ink');p.rect(x,0,1,24,'light');p.rect(x+1,0,1,24,'stone');}});
tile('buffers',false,p=>{p.rect(1,4,22,4,'ink');p.rect(2,4,20,2,'red');p.rect(4,8,4,13,'wood');p.rect(17,8,4,13,'wood');p.rect(3,21,19,2,'ink');});
tile('platform-edge',undefined,p=>{p.rect(0,0,24,4,'cream');p.rect(0,4,24,3,'woodD');for(let x=0;x<24;x+=8)p.rect(x+1,1,5,1,'gold');});
for(const type of ['plaster','brick','workshop'])for(let v=0;v<2;v++)tile(`${type}-${v}`,false,p=>{
  p.rect(0,0,24,24,type==='plaster'?'#a8977b':type==='brick'?'brick':'slate');
  if(type==='workshop'){for(let x=0;x<24;x+=6){p.rect(x,0,1,24,'light');p.rect(x+4,0,1,24,'shade');}p.rect(0,21,24,3,'deep');}
  else{for(let y=0;y<24;y+=8){p.rect(0,y,24,1,type==='plaster'?'#817863':'woodD');for(let x=0;x<24;x+=12)p.rect((x+(y%16?6:0))%24,y,1,8,type==='plaster'?'#92866e':'woodD');}if(type==='plaster'){p.rect(v?19:3,0,3,24,'woodD');p.rect(v?19:3,0,1,24,'woodL');}}
});
for(const lit of [false,true])tile(lit?'window-lit':'window-dark',false,p=>{p.rect(0,0,24,24,'woodD');p.rect(2,1,20,21,'ink');p.rect(4,3,16,16,lit?'gold':'deep');p.rect(5,4,6,6,lit?'shine':'roof');p.rect(13,4,6,6,lit?'cream':'slate');p.rect(5,12,6,6,lit?'#ae7d46':'shade');p.rect(13,12,6,6,lit?'gold':'shade');p.rect(1,21,22,3,'woodL');p.rect(3,1,18,1,'woodL');});
tile('door',false,p=>{p.rect(0,0,24,24,'woodD');p.rect(3,0,18,23,'ink');p.rect(5,1,14,21,'wood');for(const x of [8,13])p.rect(x,2,1,18,'woodD');p.rect(5,1,14,2,'woodL');p.rect(15,12,2,2,'gold');p.rect(1,23,22,1,'light');});
tile('arch',true,p=>{p.rect(0,0,3,24,'woodD');p.rect(21,0,3,24,'woodD');p.rect(0,0,24,3,'woodL');p.rect(3,3,18,3,'deep');});
for(const type of ['slate','copper'])for(const part of ['middle','top','bottom','left','right'])tile(`roof-${type}-${part}`,false,p=>{
  const mid=type==='slate'?'roof':'wood',hi=type==='slate'?'roofL':'woodL';p.rect(0,0,24,24,mid);
  for(let y=0;y<24;y+=6){p.rect(0,y+5,24,1,'roofD');for(let x=0;x<24;x+=8){const xx=(x+(y%12?4:0))%24;p.rect(xx,y,1,5,hi);p.rect(xx+1,y,6,1,hi);}}
  if(part==='top'){p.rect(0,0,24,3,'ink');p.rect(0,3,24,2,hi);}
  if(part==='bottom'){p.rect(0,18,24,3,hi);p.rect(0,21,24,3,'ink');}
  if(part==='left'){p.rect(0,0,3,24,'ink');p.rect(3,0,2,24,hi);}
  if(part==='right'){p.rect(21,0,3,24,'ink');p.rect(19,0,2,24,hi);}
});
tile('roof-shadow',undefined,p=>{p.rect(0,0,24,6,'deep');p.rect(0,6,24,3,'shade');});
tile('awning-red',undefined,p=>{p.rect(0,0,24,8,'woodD');for(let x=0;x<24;x+=8){p.rect(x,2,8,12,x%16?'cream':'red');p.rect(x,14,7,5,x%16?'gold':'brick');p.rect(x,19,6,2,'ink');}});
tile('counter',false,p=>{p.rect(0,3,24,18,'woodD');p.rect(0,2,24,6,'woodL');p.rect(2,3,21,1,'cream');p.rect(2,10,20,10,'wood');p.rect(4,12,16,1,'woodL');p.rect(3,21,3,3,'ink');p.rect(18,21,3,3,'ink');});
tile('bread',undefined,p=>{for(const [x,y] of [[2,4],[14,6],[7,14]]){p.ellipse(x+3,y+2,5,3,'woodD');p.ellipse(x+3,y,5,3,'gold');p.line(x,y-1,x+3,y-1,'cream');}});
tile('crate',false,p=>{p.rect(2,3,21,20,'ink');p.rect(2,2,19,19,'wood');p.rect(3,2,18,3,'woodL');p.rect(3,5,2,15,'woodL');p.rect(18,5,3,15,'woodL');for(const y of [7,12,17])p.rect(5,y,13,1,'woodD');p.line(5,18,17,6,'woodL');p.line(6,18,18,6,'gold');});
tile('barrel',false,p=>{p.ellipse(12,20,9,3,'ink');p.rect(3,5,18,14,'woodD');p.rect(5,4,14,16,'wood');p.rect(7,4,2,16,'woodL');p.ellipse(12,5,9,4,'woodL');p.ellipse(12,5,6,2,'wood');for(const y of [8,17]){p.rect(3,y,18,2,'slate');p.rect(4,y,16,1,'light');}});
tile('coal',false,p=>{p.ellipse(12,18,12,5,'ink');for(const [x,y] of [[3,12],[11,9],[17,13],[8,16]]){p.poly([[x,y+5],[x+2,y],[x+7,y+1],[x+8,y+5]],'shade');p.line(x+2,y,x+6,y+1,'stone');}});
tile('tools',undefined,p=>{p.line(3,18,16,5,'ink');p.line(4,18,17,5,'light');p.rect(14,3,6,3,'stone');p.rect(18,3,3,7,'light');p.rect(2,16,4,5,'woodL');});
tile('flowers',false,p=>{p.rect(1,12,22,10,'woodD');p.rect(2,13,20,7,'wood');p.rect(2,11,21,3,'woodL');for(const [x,y] of [[4,7],[9,4],[15,7],[20,5]]){p.rect(x,y,1,8,'leafH');p.rect(x-2,y,5,2,'red');p.dot(x,y-1,'cream');}});
tile('sign',false,p=>{p.rect(11,5,3,19,'woodD');p.rect(10,5,1,19,'woodL');p.rect(1,1,22,11,'ink');p.rect(2,2,20,8,'wood');p.rect(3,2,19,1,'woodL');p.line(6,6,17,6,'cream');p.line(14,4,17,6,'cream');p.line(14,8,17,6,'cream');});
tile('lamp-top',undefined,p=>{p.rect(11,10,3,14,'ink');p.rect(8,3,9,12,'ink');p.rect(9,4,7,9,'gold');p.rect(11,5,3,6,'shine');p.rect(8,2,9,2,'woodL');p.rect(11,0,3,2,'ink');p.rect(8,14,9,2,'woodL');});
tile('lamp-base',false,p=>{p.rect(11,0,3,20,'ink');p.rect(11,0,1,20,'light');p.rect(7,20,11,3,'ink');p.rect(8,19,9,2,'stone');});
tile('bunting',undefined,p=>{p.line(0,2,23,4,'woodL');p.poly([[2,3],[11,4],[7,13]],'red');p.poly([[14,4],[23,4],[18,13]],'gold');p.line(3,4,9,5,'cream');});
tile('torn-bunting',undefined,p=>{p.line(2,18,21,21,'woodL');p.poly([[5,17],[13,20],[7,23]],'red');});
tile('cap',undefined,p=>{p.ellipse(12,17,9,3,'ink');p.rect(6,10,12,6,'shade');p.rect(6,10,12,2,'stone');p.rect(4,16,16,2,'deep');p.rect(10,13,4,2,'gold');});
tile('paper',undefined,p=>{p.poly([[6,9],[16,7],[18,17],[8,19]],'cream');p.line(9,11,14,10,'woodL');p.line(10,14,15,13,'woodL');});
tile('rail-fence',false,p=>{for(const x of [3,19]){p.rect(x,0,3,23,'ink');p.rect(x,0,1,23,'light');}p.rect(0,5,24,3,'shade');p.rect(0,5,24,1,'light');p.rect(0,16,24,3,'shade');p.rect(0,16,24,1,'stone');});
tile('rail-shadow',undefined,p=>{p.rect(0,0,24,3,'ink');p.rect(0,3,24,2,'deep');});
tile('bedroll',undefined,p=>{p.rect(2,3,20,19,'ink');p.rect(3,4,18,16,'leafL');p.rect(3,5,18,3,'cream');p.rect(5,10,14,9,'leaf');p.rect(4,19,16,2,'leafH');});
tile('stove',false,p=>{p.rect(10,0,5,8,'ink');p.rect(4,8,17,13,'ink');p.rect(5,9,15,10,'shade');p.rect(8,12,9,5,'brick');p.rect(10,13,5,3,'gold');p.rect(5,21,3,3,'woodD');p.rect(17,21,3,3,'woodD');});
tile('motes',undefined,p=>{for(const [x,y] of [[3,4],[17,9],[9,19]]){p.rect(x,y,2,3,'#9bbdc2');p.dot(x,y,'cream');}});
tile('drops',undefined,p=>{for(const [x,y] of [[5,3],[17,10],[7,18]]){p.rect(x,y,2,3,'#8ab8bd');p.dot(x,y,'shine');}});
tile('thread',undefined,p=>{p.line(0,13,23,11,'#688b8c');for(const x of [4,16])p.dot(x,12,'#bad5cc');});
tile('pipe-h',false,p=>{p.rect(0,9,24,8,'ink');p.rect(0,10,24,5,'gold');p.rect(0,10,24,1,'cream');p.rect(2,8,3,10,'wood');p.rect(3,8,1,10,'woodL');});
tile('pipe-v',false,p=>{p.rect(9,0,8,24,'ink');p.rect(10,0,5,24,'gold');p.rect(10,0,1,24,'cream');p.rect(8,2,10,3,'wood');p.rect(8,3,10,1,'woodL');});
tile('steam-grate',undefined,p=>{p.rect(3,4,18,16,'ink');p.rect(4,5,16,1,'light');for(let y=8;y<20;y+=3)p.rect(5,y,14,1,'stone');});
tile('train-roof',false,p=>{p.rect(0,5,24,19,'ink');p.rect(0,7,24,17,'slate');p.rect(0,7,24,2,'light');p.rect(0,10,24,2,'stone');p.rect(3,14,18,8,'shade');p.rect(6,15,12,1,'stone');});
tile('train-window',false,p=>{p.rect(0,0,24,24,'brick');p.rect(0,0,24,3,'red');p.rect(2,4,20,16,'ink');p.rect(4,6,16,12,'deep');p.rect(5,7,6,7,'roofL');p.rect(13,7,5,7,'roof');p.rect(0,22,24,2,'gold');});
tile('train-body',false,p=>{p.rect(0,0,24,24,'brick');p.rect(0,0,24,3,'gold');p.rect(2,5,20,15,'woodD');p.rect(3,6,18,13,'brick');for(const x of [4,19])for(const y of [7,17])p.dot(x,y,'gold');p.rect(0,22,24,2,'ink');});
tile('train-door',false,p=>{p.rect(0,0,24,24,'brick');p.rect(4,0,17,24,'ink');p.rect(5,0,15,24,'woodD');p.rect(7,3,11,11,'deep');for(const x of [8,12,16])p.rect(x,2,1,13,'light');p.rect(16,18,2,2,'gold');});
tile('train-wheels',false,p=>{p.rect(0,0,24,6,'ink');p.rect(0,1,24,2,'stone');p.ellipse(11,12,9,9,'ink');p.ellipse(11,12,6,6,'stone');p.ellipse(11,12,4,4,'deep');p.rect(10,10,3,3,'woodL');p.rect(0,12,24,2,'shade');});
tile('engine-boiler',false,p=>{p.rect(0,0,24,24,'ink');p.rect(0,1,24,21,'shade');p.rect(0,2,24,3,'light');p.rect(0,6,24,4,'stone');p.rect(0,18,24,3,'deep');p.rect(2,0,3,23,'gold');p.rect(2,1,1,21,'cream');});
tile('engine-cab',false,p=>{p.rect(1,0,23,24,'ink');p.rect(3,1,19,21,'leaf');p.rect(5,3,15,13,'ink');p.rect(7,4,11,10,'gold');p.rect(8,5,7,5,'shine');p.rect(4,20,18,2,'gold');});
tile('engine-chimney',false,p=>{p.rect(6,0,12,4,'ink');p.rect(8,4,8,13,'shade');p.rect(8,4,2,13,'light');p.rect(4,17,16,7,'ink');p.rect(6,17,12,3,'stone');});
stamp('tree',4,4,(x,y)=>y===3&&(x===1||x===2)?false:undefined,p=>{
  p.ellipse(49,88,32,5,'deep');p.poly([[43,44],[54,44],[54,82],[62,89],[37,89],[44,81]],'woodD');p.rect(45,47,4,37,'wood');p.line(49,72,61,57,'wood');
  const clusters=[[48,21,25,18],[28,37,23,21],[65,37,25,23],[44,51,29,23],[69,55,19,16],[22,54,17,16]];
  for(const [x,y,rx,ry] of clusters)p.ellipse(x,y,rx,ry,'ink');
  for(const [x,y,rx,ry] of clusters){p.ellipse(x,y-2,rx-2,ry-3,'leaf');p.ellipse(x-4,y-7,rx-6,ry-8,'leafL');}
  for(const [x,y] of [[35,13],[51,9],[66,23],[18,29],[38,32],[57,38],[11,49],[26,43],[75,45],[44,51],[57,57]]){p.rect(x,y,8,2,'leafH');p.rect(x-3,y+3,5,2,'leafL');}
});
stamp('pine',3,4,(x,y)=>y===3&&x===1?false:undefined,p=>{
  p.rect(32,67,8,24,'woodD');p.rect(32,68,2,22,'woodL');p.ellipse(36,90,22,3,'deep');
  for(const [y,w] of [[10,13],[25,21],[43,29],[61,34]]){p.poly([[36,y-9],[36+w,y+19],[36+w-6,y+24],[5+36-w,y+24],[36-w,y+19]],'ink');p.poly([[36,y-7],[36+w-3,y+17],[36+14,y+15],[36+4,y+20],[36-w+3,y+18]],'leaf');p.poly([[36,y-6],[44,y+12],[24,y+15]],'leafL');p.line(36,y-3,29,y+10,'leafH');}
});
stamp('sun-mural',3,3,false,p=>{
  p.rect(0,0,72,72,'shade');for(let y=0;y<72;y+=12){p.line(0,y,71,y,'slate');for(let x=y%24?12:0;x<72;x+=24)p.line(x,y,x,y+11,'deep');}
  p.ellipse(36,28,20,20,'wood');p.ellipse(36,28,16,16,'gold');p.ellipse(36,28,12,12,'shade');
  for(let n=0;n<12;n++){const a=n*Math.PI/6;p.line(Math.round(36+Math.cos(a)*23),Math.round(28+Math.sin(a)*23),Math.round(36+Math.cos(a)*28),Math.round(28+Math.sin(a)*28),'woodL');}
  for(const x of [11,49]){p.ellipse(x+4,51,3,3,'woodL');p.rect(x+2,55,5,9,'woodL');p.line(x,66,x+5,59,'woodL');p.line(x+8,66,x+5,59,'woodL');p.line(x+6,56,x+14,49,'gold');p.line(x+9,54,x+13,45,'gold');}
  p.poly([[42,13],[48,17],[39,40],[34,36]],'shade');p.line(2,30,15,36,'deep');p.line(57,3,52,14,'deep');
});
stamp('collector',4,4,false,p=>{
  p.rect(5,82,87,8,'ink');p.rect(9,78,79,7,'stone');p.rect(10,30,76,49,'ink');p.rect(12,32,72,44,'slate');p.rect(14,32,68,3,'light');
  for(const x of [18,70]){p.rect(x,11,9,59,'ink');p.rect(x+2,13,5,54,'gold');p.rect(x+2,14,1,51,'shine');p.rect(x-3,43,15,5,'woodL');}
  p.ellipse(48,48,28,28,'ink');p.ellipse(48,48,25,25,'wood');p.ellipse(48,47,22,22,'gold');p.ellipse(48,47,17,17,'ink');p.ellipse(48,47,12,12,'waterL');p.ellipse(48,46,8,10,'deep');p.rect(45,38,2,11,'#a7c4bc');
  for(let n=0;n<12;n++){const a=n*Math.PI/6;p.line(Math.round(48+Math.cos(a)*26),Math.round(47+Math.sin(a)*26),Math.round(48+Math.cos(a)*33),Math.round(47+Math.sin(a)*33),'cream');}
  for(const x of [14,69]){p.ellipse(x+5,82,10,10,'ink');p.ellipse(x+5,82,6,6,'stone');p.ellipse(x+5,82,3,3,'deep');}
});
stamp('broken-collector',4,4,false,p=>{
  p.rect(5,82,87,8,'ink');p.rect(9,78,79,7,'stone');p.poly([[11,39],[38,32],[49,53],[61,37],[85,48],[83,76],[13,76]],'slate');
  p.poly([[26,55],[33,34],[46,27],[53,33],[40,43],[38,62]],'gold');p.poly([[56,54],[64,39],[73,46],[72,65],[61,74],[56,68]],'woodL');
  p.rect(20,20,5,49,'gold');p.rect(23,19,14,5,'gold');p.rect(74,49,5,21,'gold');p.rect(69,18,7,14,'wood');
  for(const x of [14,69]){p.ellipse(x+5,82,10,10,'ink');p.ellipse(x+5,82,6,6,'stone');p.ellipse(x+5,82,3,3,'deep');}
});

// PNG encoder keeps the authoring tool dependency-free.
const crc=b=>{let c=0xffffffff;for(const v of b){c^=v;for(let i=0;i<8;i++)c=(c>>>1)^(c&1?0xedb88320:0);}return (c^0xffffffff)>>>0;};
const chunk=(type,data)=>{const t=Buffer.from(type),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(data.length);c.writeUInt32BE(crc(Buffer.concat([t,data])));return Buffer.concat([n,t,data,c]);};
// Small native pages are the committed source of truth. Never upload a large
// authoring sheet: export its real tiles first and enforce this byte budget.
const pageSize=COLS*COLS,pages=[];
mkdirSync('public/art/chapter-one',{recursive:true});
mkdirSync('assets/tiles/pages',{recursive:true});
function png(atlas){
  const raw=Buffer.alloc((atlas.w*4+1)*atlas.h);for(let y=0;y<atlas.h;y++)atlas.data.copy(raw,y*(atlas.w*4+1)+1,y*atlas.w*4,(y+1)*atlas.w*4);
  const header=Buffer.alloc(13);header.writeUInt32BE(atlas.w);header.writeUInt32BE(atlas.h,4);header[8]=8;header[9]=6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))]);
}
const definitions=tiles.map(({name,walkable,sortOffset},id)=>({id,type:name,properties:[{name:'name',type:'string',value:name},...(walkable===undefined?[]:[{name:'walkable',type:'bool',value:walkable}]),...(sortOffset===undefined?[]:[{name:'sortOffset',type:'int',value:sortOffset}])]}));
for(let start=0;start<tiles.length;start+=pageSize){
  const part=tiles.slice(start,start+pageSize),atlas=new Pixels(COLS*S,Math.ceil(part.length/COLS)*S),name=`chapter-one-${String(start/pageSize).padStart(3,'0')}`;
  part.forEach(({p},i)=>{const x=i%COLS*S,y=Math.floor(i/COLS)*S;for(let yy=0;yy<S;yy++)p.data.copy(atlas.data,((y+yy)*atlas.w+x)*4,yy*S*4,(yy+1)*S*4);});
  const bytes=png(atlas);if(bytes.length>65536)throw new Error(`${name} exceeds the 64 KB image limit; reduce the page size.`);
  const page={type:'tileset',version:'1.10',tiledversion:'1.11.2',name,tilewidth:S,tileheight:S,tilecount:part.length,columns:COLS,image:`../../../public/art/chapter-one/${name}.png`,imagewidth:atlas.w,imageheight:atlas.h,margin:0,spacing:0,tiles:definitions.slice(start,start+pageSize).map(t=>({...t,id:t.id-start}))};
  writeFileSync(`public/art/chapter-one/${name}.png`,bytes);
  writeFileSync(`assets/tiles/pages/${name}.json`,JSON.stringify(page,null,2)+'\n');
  const {tiles:pageTiles,...pageInfo}=page;
  pages.push({...pageInfo,firstgid:start+1,source:`../../../../assets/tiles/pages/${name}.json`,url:`art/chapter-one/${name}.png`});
}
writeFileSync('assets/tiles/chapter-one.tileset.json',JSON.stringify({name:'Chapter One',tilewidth:S,tileheight:S,tilecount:tiles.length,tiles:definitions,pages},null,2)+'\n');
for(const file of readdirSync('src/content/chapter-one/maps')){
  if(!file.endsWith('.json'))continue;
  const {readFileSync}=await import('node:fs'),path=`src/content/chapter-one/maps/${file}`,map=JSON.parse(readFileSync(path,'utf8'));
  map.tilesets=pages.map(({firstgid,source})=>({firstgid,source}));
  const text=JSON.stringify(map,null,2).replace(/"data": \[([\d,\s]+)\]/g,(_,body)=>{
    const cells=body.split(',').map(Number),rows=[];
    for(let i=0;i<cells.length;i+=map.width)rows.push('        '+cells.slice(i,i+map.width).join(','));
    return '"data": [\n'+rows.join(',\n')+'\n      ]';
  });
  writeFileSync(path,text+'\n');
}
rmSync('public/art/chapter-one-tiles.png',{force:true});
console.log(`${tiles.length} native tiles · ${pages.length} pages · at most ${COLS*S} × ${COLS*S} pixels / 64 KB per image`);
