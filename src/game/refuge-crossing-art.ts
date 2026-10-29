import {type C,poly,rect,line,oval,engine} from './crossing-drawing';
import {coach,conduitDistrict} from './capital-crossing-art';
import {paintEndingPerson as person} from './ending-cast';
import {hollowSunPolygons} from '../content/hollow-sun';

/** The white royal city is already airborne, separate from the green works. */
function floatingCapital(c:C,x:number,y:number,s:number){
 c.save();c.translate(x,y);c.scale(s,s);
 poly(c,'#64746f',[[-177,25],[-113,11],[115,9],[173,24],[148,48],[109,54],[68,89],[31,62],[-15,100],[-57,68],[-99,76],[-136,48]]);
 poly(c,'#849080',[[-177,25],[-113,11],[-31,22],[-15,100],[-57,68],[-99,76],[-136,48]]);
 poly(c,'#4d6264',[[14,26],[173,24],[148,48],[109,54],[68,89],[31,62],[-15,100]]);
 // Terraces, colonnades and the sun-marked palace read as marble, not a dome.
 poly(c,'#c5c7b4',[[-170,13],[-119,1],[124,-1],[170,14],[147,29],[-146,33]]);
 poly(c,'#ede6ce',[[-170,13],[147,11],[170,14],[147,21],[-146,25]]);
 for(const [left,right,top]of [[-144,-62,-28],[65,141,-31]]){
  poly(c,'#b2bdb2',[[left,top],[right,top-3],[right,10],[left,14]]);
  poly(c,'#e1ddc5',[[left-6,top-5],[right+5,top-8],[right+5,top],[left-6,top+3]]);
  for(let col=left+4;col<right;col+=16){rect(c,'#ece6d0',col,top+2,7,29);rect(c,'#9cafa7',col+6,top+2,3,29);}
 }
 poly(c,'#aebbb2',[[-65,-48],[72,-53],[72,11],[-65,16]]);
 poly(c,'#e7e1cb',[[-65,-48],[16,-51],[16,14],[-65,16]]);
 poly(c,'#f2ead2',[[-77,-49],[4,-77],[84,-54],[73,-46],[-65,-42]]);
 poly(c,'#c6ccb9',[[4,-77],[84,-54],[73,-46],[4,-66]]);
 for(const col of [-57,-32,34,59]){rect(c,'#9aafa8',col,-32,11,39);rect(c,'#eee7d0',col-2,-33,5,43);}
 poly(c,'#758f8a',[[-13,-10],[-11,-26],[0,-34],[12,-26],[13,11],[-13,12]]);
 line(c,'#c4a66c',2,[[-65,10],[72,6]]);
 // Small skyline towers distinguish the city from the grounded receiving bay.
 for(const [tx,ty]of [[-120,-61],[112,-65]]){
  poly(c,'#d9d9c3',[[tx-13,ty],[tx+13,ty-2],[tx+13,ty+43],[tx-13,ty+44]]);
  poly(c,'#aabbb1',[[tx+5,ty-1],[tx+13,ty-2],[tx+13,ty+43],[tx+5,ty+44]]);
  poly(c,'#6f8a82',[[tx-18,ty],[tx,ty-22],[tx+18,ty-2]]);
  rect(c,'#718f88',tx-3,ty+9,6,15);
 }
 const crest=hollowSunPolygons(3,-54,10);
 for(const points of [...crest.rays,...crest.bands])poly(c,'#bc9a61',points.map(({x,y})=>[x,y]));
 c.restore();
}
function train(c:C,x:number,y:number,s:number,t:number,grade=-.025){
 c.save();c.translate(x,y);c.rotate(grade);c.scale(-s,s);
 for(const x of [-384,-257,-130])coach(c,x,t);
 engine(c,0,0,1,t);c.restore();
}
function bridge(c:C,p:number,t:number){
 rect(c,'#8c9d99',0,0,512,288);
 poly(c,'#b6b7a3',[[0,100],[93,86],[197,101],[295,74],[512,90],[512,163],[0,163]]);
 poly(c,'#718782',[[0,172],[94,130],[182,153],[279,119],[359,143],[512,126],[512,288],[0,288]]);
 // The mill and its arrested water stay still as the train passes.
 poly(c,'#8c9881',[[20,153],[54,142],[80,156],[76,181],[22,185]]);
 poly(c,'#596f68',[[15,151],[49,135],[87,153],[80,158],[49,145],[20,158]]);
 poly(c,'#aebcaa',[[79,147],[86,150],[85,187],[79,180]]);
 oval(c,'#536960',76,176,15,15);oval(c,'#8d9e86',76,176,11,11);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;line(c,'#536960',2,[[76,176],[76+Math.cos(a)*13,176+Math.sin(a)*13]]);}
 for(const [x,y]of [[91,181],[90,188],[85,192]])poly(c,'#b5c2af',[[x,y],[x+3,y-2],[x+4,y+3],[x+1,y+4]]);
 floatingCapital(c,374,95,.57);
 // The emptied green works sit on a continuous hillside below the royal city.
 poly(c,'#5b7267',[[257,196],[314,185],[375,188],[424,202],[460,215],[247,223]]);
 c.save();c.translate(338,202);c.scale(.3,.3);c.translate(-285,-160);conduitDistrict(c,t);c.restore();
 // Dust falls around the failing works; neither building nor ground rises.
 for(let i=0;i<7;i++){
  const u=(p*.55+i/7)%1,x=294+i*13,y=178+u*29;
  poly(c,i%2?'#9fa99a':'#718780',[[x,y],[x+2,y-1],[x+3,y+1],[x+1,y+3]]);
 }
 poly(c,'#435d5c',[[0,226],[448,207],[448,241],[0,280]]);
 poly(c,'#9ba48a',[[0,214],[449,203],[449,212],[0,229]]);
 // The last coach is already clear before the abandoned bridge section drops.
 const fall=Math.max(0,p-.12)*65;
 c.save();c.translate(455,204+fall);c.rotate(p*.25);
 poly(c,'#526966',[[0,0],[67,-20],[68,-8],[5,14],[1,14]]);
 line(c,'#bec3a7',2,[[0,-2],[65,-23]]);line(c,'#8a9580',2,[[3,4],[67,-17]]);c.restore();
 for(let i=0;i<21;i++){const x=i*22;line(c,'#a89471',2,[[x,215-x*.025],[x-1,223-x*.025]]);}
 line(c,'#c4c7aa',2,[[0,215],[447,204]]);line(c,'#adbca3',2,[[0,222],[447,211]]);
 const x=205-p*75;train(c,x,215-x*.025-6.6,.55,t);
 poly(c,'#354e53',[[0,278],[58-p*30,248],[129-p*30,270],[178-p*30,257],[226-p*30,288],[0,288]]);
}
function together(c:C,p:number,t:number){
 rect(c,'#354f4e',0,0,512,288);
 poly(c,'#75836c',[[0,13],[512,3],[512,35],[0,47]]);
 // One large window makes this a different view of the same medical coaches.
 c.save();c.beginPath();c.rect(111,48,291,108);c.clip();
 rect(c,'#afb6a3',111,48,291,108);
 poly(c,'#7d9387',[[100,134],[184+p*9,103],[265+p*9,119],[345+p*9,92],[450,123],[450,176],[100,176]]);
 floatingCapital(c,331+p*20,100,.3);c.restore();
 line(c,'#b7b18f',5,[[109,159],[109,45],[404,45],[404,159],[109,159]]);
 line(c,'#5a7369',3,[[258,48],[258,155]]);rect(c,'#bcae88',105,158,303,7);
 poly(c,'#586d5e',[[0,214],[512,207],[512,288],[0,288]]);
 for(const y of [226,248,279])line(c,'#70806a',1,[[0,y],[512,y-7]]);
 oval(c,'#3b574d',65,251,18,4);oval(c,'#3b574d',444,253,20,4);
 // Kit watches the line; Petra keeps away from the patients' berths.
 person(c,'kit',65,249,.83);person(c,'petra',444,251,.88);
 poly(c,'#3c5b58',[[458,211],[474,208],[481,224],[474,242],[460,238]]);
 poly(c,'#9aa897',[[461,214],[472,212],[476,224],[471,236],[463,234]]);
 line(c,'#c1a16c',2,[[466,214],[470,234]]);
 poly(c,'#6b7867',[[134,183],[335,179],[356,281],[119,283]]);
 line(c,'#8c947b',2,[[140,187],[334,183]]);
 // Tomas's red scarf and longer coat distinguish him from the soldiers.
 person(c,'nell',199,264,1.35,false,undefined,{sit:1});
 person(c,'tomas',311,264,1.35,false,undefined,{sit:1});
 // Their hands rest on their laps; the rescue has succeeded.
 poly(c,'#334d49',[[119,270],[356,260],[371,288],[108,288]]);
 poly(c,'#b3a07c',[[128,258],[343,252],[362,270],[113,280]]);
 poly(c,'#d0bc95',[[129,258],[342,252],[349,258],[122,267]]);
 // The lantern stays wrapped in Ansel's cloth, on Nell's right.
 poly(c,'#a89b7e',[[160,250],[174,248],[181,268],[157,271]]);
 poly(c,'#e3c58a',[[164,252],[172,251],[175,263],[163,265]]);
 line(c,'#b2955e',2,[[162,251],[163,243],[171,241],[175,249]]);
 c.save();c.translate(258,20);c.rotate(Math.sin(t*1.4)*.022);
 line(c,'#ae9870',2,[[0,0],[0,38]]);poly(c,'#e0ca99',[[-9,39],[-6,32],[6,32],[9,39],[6,48],[-6,48]]);c.restore();
}
function fishingBoat(c:C){
 // Arrested water and the boat have no time-dependent coordinates.
 poly(c,'#345567',[[367,195],[410,191],[401,204],[379,205]]);
 poly(c,'#8b9f96',[[371,195],[405,192],[399,196],[377,199]]);
 line(c,'#9c9276',2,[[389,193],[386,165]]);
 poly(c,'#c3bfa0',[[384,169],[372,188],[386,186]]);
}
function refuge(c:C,p:number,t:number){
 rect(c,'#9caca0',0,0,512,288);
 poly(c,'#c7c5a8',[[0,89],[107,78],[226,88],[353,72],[512,81],[512,158],[0,158]]);
 rect(c,'#60858a',0,144,512,144);
 // Flat reflections suggest a motionless tide without an impossible wave crest.
 for(const [x,y,w]of [[301,151,32],[437,158,44],[333,177,21],[452,192,35]])line(c,'#8fa69c',1,[[x,y],[x+w,y]]);
 poly(c,'#4d777e',[[373,207],[408,205],[399,209],[379,210]]);
 line(c,'#789890',1,[[386,207],[388,218]]);
 fishingBoat(c);
 // Solid railway ground stays in front of the shore; no tracks cross open water.
 poly(c,'#718774',[[0,188],[81,171],[197,170],[252,185],[311,202],[343,236],[512,251],[512,288],[0,288]]);
 poly(c,'#486c69',[[311,202],[343,236],[512,251],[512,261],[338,245],[303,211]]);
 // The ward's low green timber walls, cream awning and warm windows.
 poly(c,'#47665b',[[88,160],[227,151],[257,171],[256,219],[90,229]]);
 poly(c,'#688374',[[88,160],[122,159],[123,226],[90,229]]);
 poly(c,'#d2c9a7',[[77,158],[112,134],[224,132],[265,163],[257,172],[221,148],[115,150],[84,168]]);
 poly(c,'#b2ad8d',[[115,150],[221,148],[257,172],[239,173],[217,157],[117,159],[89,171],[84,168]]);
 for(const x of [107,143,181,219]){
  poly(c,'#cdbb88',[[x,178],[x+18,177],[x+19,197],[x,198]]);
  line(c,'#788570',2,[[x+9,178],[x+9,197]]);
 }
 poly(c,'#2f514d',[[174,204],[193,202],[194,223],[174,224]]);
 poly(c,'#9da68b',[[163,224],[201,220],[211,229],[158,234]]);
 for(const x of [88,246])line(c,'#81957e',3,[[x,173],[x,228]]);
 for(const x of [78,275]){line(c,'#547367',2,[[x,232],[x-2,184]]);oval(c,'#e2c88e',x-2,182,4,3);}
 poly(c,'#a5a98c',[[0,247],[512,243],[512,260],[0,265]]);
 for(let i=0;i<27;i++){const x=i*21;line(c,'#988968',2,[[x,247-x*.006],[x-1,257-x*.006]]);}
 line(c,'#d0c9a9',2,[[0,248],[512,245]]);line(c,'#b1bca1',2,[[0,257],[512,254]]);
 // Ease into the ward siding, with the same full coaches still coupled.
 train(c,270-p*35,248-(270-p*35)*.006-12*.48,.48,t,-.006);
 poly(c,'#45665b',[[0,280],[104,273],[160,288],[0,288]]);
}
export function refugeCrossingShot(c:C,index:number,p:number,t:number){
 if(index===0)bridge(c,p,t);else if(index===1)together(c,p,t);else refuge(c,p,t);
}
