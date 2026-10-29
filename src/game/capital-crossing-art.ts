import {paintEndingPerson as person} from './ending-cast';
import {type C,poly,rect,line,oval,P,engine} from './crossing-drawing';

const GREEN='#41645c',LIGHT_GREEN='#6f8b78',SHADOW='#2e4b4b',CREAM='#d6c7a0',SKIN='#d49c70';

/** Couplings, wheel contact and the roof line share the locomotive's ground. */
function coach(c:C,x:number,t:number,occupied=true){
 c.save();c.translate(x,0);
 for(const wx of [-43,42]){
  oval(c,P.dark,wx,3,9,9);oval(c,'#7e9790',wx,3,5,5);
  line(c,'#b0ad8c',1.5,[[wx,3],[wx+Math.cos(t*8)*4,3+Math.sin(t*8)*4]]);
 }
 line(c,P.dark,3,[[-70,-6],[69,-6]]);
 poly(c,SHADOW,[[-59,-49],[58,-49],[61,-10],[-60,-10]]);
 poly(c,GREEN,[[-58,-45],[56,-45],[58,-18],[-59,-18]]);
 poly(c,CREAM,[[-64,-49],[-56,-58],[52,-58],[63,-51],[62,-46],[-63,-45]]);
 poly(c,'#b4ac8e',[[52,-58],[63,-51],[62,-46],[-63,-45],[-61,-49],[54,-51]]);
 rect(c,'#9aaf9f',-59,-19,117,5);
 for(let i=0;i<5;i++){
  const wx=-49+i*21;rect(c,'#bcab79',wx,-40,15,17);rect(c,'#e0c996',wx+1,-39,11,8);
  if(occupied){
   oval(c,'#665745',wx+7,-32,3,4);poly(c,i%2?'#567169':'#6c7765',[[wx+3,-29],[wx+10,-29],[wx+13,-24],[wx,-24]]);
   if(i===2){oval(c,'#b38c65',wx+11,-28,2,2);}
  }
 }
 // A simple medical board; it is a coach, not another crystal-powered engine.
 rect(c,CREAM,-9,-21,18,14);rect(c,'#5b877b',-2,-19,4,10);rect(c,'#5b877b',-5,-16,10,4);
 c.restore();
}
function medicalTrain(c:C,p:number,t:number){
 rect(c,'#9aa99f',0,0,512,288);
 poly(c,'#c7c5a7',[[0,91],[126,74],[205,83],[333,63],[512,79],[512,144],[0,144]]);
 rect(c,'#6b8a8d',0,124,512,76);
 for(let i=0;i<8;i++){const x=(i*84-p*30+620)%620-60;line(c,'#9dad9e',1,[[x,136+i*6],[x+35,136+i*6]]);}
 // The coast recedes. Harbour cranes never travel with the medical train.
 poly(c,'#637c78',[[0,139],[120,122],[190,144],[263,133],[340,155],[512,139],[512,201],[0,218]]);
 for(const x of [34,92,156])line(c,'#5b7374',3,[[x,135],[x,105],[x+28,99]]);
 poly(c,'#455e60',[[0,225],[512,191],[512,218],[0,257]]);
 poly(c,'#82907d',[[0,203],[512,180],[512,192],[0,218]]);
 for(let i=0;i<26;i++){
  const x=i*23-p*17,y=207-x*.045;line(c,'#a69474',3,[[x,y-4],[x-1,y+5]]);
 }
 line(c,'#c4c6ac',2.5,[[0,201],[512,178]]);line(c,'#b1bca5',2.5,[[0,209],[512,186]]);
 const x=305+p*100;
 c.save();c.translate(x,201-x*.045-8);c.rotate(-.045);c.scale(.67,.67);
 for(const x of [-384,-257,-130])coach(c,x,t);
 engine(c,0,0,1,t);c.restore();
 // Near embankment moves faster than the coastal skyline.
 const shift=p*60;
 poly(c,'#344e53',[[0,273],[64-shift,253],[144-shift,271],[219-shift,248],[282-shift,288],[0,288]]);
 for(const x of [460,566]){
  c.save();c.translate(x-shift,0);poly(c,'#4d655e',[[0,288],[4,235],[-10,244],[-5,220],[8,213],[22,242],[12,238],[16,288]]);c.restore();
 }
}
function clearance(c:C,x:number,y:number,s=1){
 c.save();c.translate(x,y);c.scale(s,s);c.rotate(-.09);
 poly(c,'#a8906c',[[-29,-18],[28,-21],[32,18],[-30,20]]);
 poly(c,'#e0d4af',[[-28,-19],[26,-22],[30,15],[-28,17]]);
 for(const [y,w]of [[-12,30],[-7,37],[-2,26],[7,18]])line(c,'#8a8b75',1.5,[[-20,y],[-20+w,y-1]]);
 oval(c,'#597e73',17,7,7,7);oval(c,'#a9b79b',17,7,4,4);
 line(c,'#587467',1.5,[[14,7],[17,4],[20,7],[17,10],[14,7]]);
 c.restore();
}
/** Dena's green coat, cream apron/cap and brown hair match her world actor. */
function dena(c:C,t:number){
 const hand=1.4*Math.sin(t*.9);
 poly(c,'#263e53',[[229,196],[237,196],[236,216],[229,216]]);poly(c,'#263e53',[[242,197],[250,196],[252,215],[245,216]]);
 poly(c,'#80553d',[[229,212],[237,212],[237,218],[225,218]]);poly(c,'#80553d',[[245,211],[251,211],[255,216],[245,217]]);
 poly(c,SHADOW,[[228,139],[250,139],[260,183],[254,207],[222,202]]);
 poly(c,GREEN,[[230,140],[247,140],[254,184],[248,204],[222,201],[225,164]]);
 poly(c,LIGHT_GREEN,[[229,144],[235,145],[229,195],[223,198],[226,163]]);
 poly(c,'#f5dca4',[[234,147],[246,147],[250,195],[244,200],[231,198]]);
 // Bent sleeves and one slow blanket-tucking hand; the body does not bob.
 poly(c,GREEN,[[230,144],[226,161],[211,167+hand],[213,173+hand],[233,169],[238,149]]);
 poly(c,LIGHT_GREEN,[[228,150],[226,161],[213,168+hand],[214,170+hand],[230,164]]);
 oval(c,SKIN,211,170+hand,4,2);
 poly(c,GREEN,[[248,145],[256,158],[253,175],[247,174],[249,159],[244,152]]);
 oval(c,SKIN,250,176,3,3);
 poly(c,'#80553d',[[231,119],[243,117],[250,124],[249,140],[244,146],[230,141]]);
 poly(c,SKIN,[[232,125],[238,122],[245,126],[244,136],[239,141],[232,136]]);
 poly(c,'#e0b48a',[[233,126],[238,124],[240,127],[237,136],[234,134]]);
 poly(c,'#80553d',[[230,122],[234,118],[243,119],[248,125],[245,130],[240,124],[234,127],[232,139],[229,141]]);
 poly(c,'#f5dca4',[[228,122],[230,116],[238,113],[246,117],[249,122],[242,119],[234,122]]);
 line(c,'#526154',1.5,[[236,131],[239,132]]);
}
function passengers(c:C,_p:number,t:number){
 rect(c,'#385650',0,0,512,288);
 poly(c,'#7d8f77',[[0,16],[512,6],[512,37],[0,49]]);
 // Side windows contain their own moving landscape, behind fixed frames.
 for(const x of [24,348]){
  c.save();c.beginPath();c.rect(x,52,137,85);c.clip();rect(c,'#b4bdab',x,52,137,85);
  const drift=t*10;
  poly(c,'#81978c',[[x-40,111],[x+43-drift,77],[x+140-drift,114],[x+240,91],[x+240,143],[x-40,143]]);
  rect(c,'#697f72',x,128,137,9);c.restore();
  line(c,'#b8b28d',5,[[x,139],[x,49],[x+138,49],[x+138,139]]);
  line(c,'#536e62',3,[[x+70,52],[x+70,136]]);rect(c,'#c6bd97',x-3,138,144,5);
 }
 poly(c,'#26473f',[[203,45],[291,40],[302,212],[195,214]]);
 line(c,'#91a18c',3,[[202,207],[208,48],[286,44],[295,211]]);
 poly(c,'#63765f',[[197,202],[301,201],[392,288],[98,288]]);
 for(const x of [213,244,276])line(c,'#7d8a6d',1,[[x,205],[244+(x-244)*2.3,288]]);
 oval(c,'#3d5b4d',241,218,19,4);
 // A narrow rear berth: connected cushion, blanket and patient; no floating cot.
 line(c,'#89967a',3,[[149,184],[151,202]]);line(c,'#89967a',3,[[219,176],[222,201]]);
 poly(c,'#b29e79',[[143,172],[221,167],[225,182],[146,190]]);
 poly(c,'#e1d5b2',[[146,167],[162,163],[170,172],[150,177]]);
 oval(c,SKIN,163,163,6,6);
 poly(c,'#a4b3a0',[[170,163],[197,158],[218,166],[221,176],[173,182],[163,174]]);
 poly(c,'#bdc6ad',[[172,164],[199,161],[212,167],[175,174]]);
 dena(c,t);
 // The father and child continue reading the letter delivered at Cinderbank.
 rect(c,'#8b7a59',350,178,126,17);poly(c,'#596957',[[374,143],[397,142],[411,179],[369,179]]);
 oval(c,SKIN,386,135,8,10);poly(c,'#6d533d',[[377,131],[380,123],[391,125],[395,131],[389,129]]);
 poly(c,'#bf9d6c',[[405,158],[417,157],[425,179],[403,179]]);oval(c,SKIN,411,151,6,7);
 poly(c,'#80553d',[[406,149],[405,145],[411,142],[416,146],[416,150],[412,147]]);
 poly(c,'#e1d4af',[[391,163],[416,161],[421,174],[394,176]]);line(c,'#989780',1.5,[[397,166],[414,165]]);
 // Foreground seats keep the two young travellers at the same scale.
 poly(c,'#6c7663',[[122,178],[181,181],[191,286],[114,288]]);
 poly(c,'#75806b',[[296,180],[346,176],[357,288],[290,287]]);
 person(c,'nell',175,262,1.35,false,'right',{sit:1});
 person(c,'kit',310,262,1.35,false,'left',{sit:1});
 poly(c,'#324c47',[[123,264],[341,255],[363,288],[109,288]]);
 poly(c,'#ad9973',[[133,256],[331,249],[351,270],[119,280]]);
 poly(c,'#d1bc8b',[[134,256],[330,249],[337,255],[127,265]]);
 clearance(c,244,263,.73);
 // Nell steadies one corner; Kit points out the seal with his right hand.
 poly(c,'#a95243',[[190,219],[200,225],[205,243],[223,257],[219,263],[196,249],[189,235]]);oval(c,SKIN,223,263,5,3);
 poly(c,'#c27054',[[194,225],[199,229],[202,246],[220,258],[217,259],[196,247]]);
 poly(c,'#263e53',[[292,216],[300,220],[291,240],[273,260],[267,256],[283,234]]);oval(c,SKIN,267,260,5,3);
 poly(c,'#385368',[[291,222],[293,224],[286,239],[271,256],[269,255],[282,235]]);
 // Ansel's cloth wraps the lantern. Its light is ordinary oil, without a shard effect.
 poly(c,'#a89b7e',[[143,258],[156,256],[162,270],[141,274]]);poly(c,'#e8cb89',[[148,258],[154,258],[157,267],[147,268]]);
 line(c,'#a98b56',2,[[146,258],[147,250],[154,249],[157,256]]);
 // A lamp sways on its joint; the walls, faces and floor remain rigid.
 c.save();c.translate(246,17);c.rotate(Math.sin(t*1.6)*.035);line(c,'#a48e65',2,[[0,0],[0,53]]);
 poly(c,'#d5c598',[[-9,54],[-6,47],[7,47],[10,54],[7,65],[-7,65]]);oval(c,'#edd8a0',0,56,5,5);c.restore();
}
function capital(c:C,p:number,t:number){
 rect(c,'#a6b2a4',0,0,512,288);
 poly(c,'#c6c5a8',[[0,108],[108,93],[212,100],[334,82],[512,97],[512,165],[0,165]]);
 poly(c,'#879b8b',[[0,149],[98,120],[212,134],[317,111],[433,130],[512,114],[512,213],[0,213]]);
 // Growing industrial architecture stays grounded around the rail vanishing point.
 c.save();c.translate(268,173);c.scale(1+p*.09,1+p*.09);c.translate(-268,-173);
 poly(c,'#5b7267',[[0,170],[135,151],[224,153],[349,145],[512,166],[512,226],[0,226]]);
 // Factory wings, brick piers and brass service pipes belong to the conduit district.
 poly(c,SHADOW,[[105,121],[227,107],[232,173],[103,183]]);
 poly(c,GREEN,[[105,121],[149,115],[150,178],[103,183]]);
 poly(c,'#879078',[[100,119],[148,108],[233,102],[235,111],[149,121]]);
 for(const x of [119,143,172,197,218]){poly(c,'#c8bd92',[[x,131],[x+10,129],[x+10,147],[x,148]]);line(c,SHADOW,2,[[x+5,130],[x+5,148]]);}
 for(const [x,h]of [[124,35],[163,47],[195,33]]){
  poly(c,'#617b6d',[[x,116],[x-2,116-h],[x+9,115-h],[x+10,115]]);line(c,'#9ba386',2,[[x-2,116-h],[x+9,115-h]]);
  for(let i=0;i<3;i++){const u=(t*.15+i/3)%1;c.globalAlpha=(1-u)*.2;oval(c,'#e1dec0',x+5-u*17,111-h-u*29,5+u*12,4+u*7);}c.globalAlpha=1;
 }
 // Broad green pressure dome: the imperial engine works, before the city rises.
 poly(c,'#334f4d',[[223,121],[227,92],[243,64],[269,46],[297,42],[326,53],[349,77],[360,115],[356,164],[226,169]]);
 poly(c,'#577b67',[[227,112],[232,91],[248,68],[272,52],[297,46],[286,111]]);
 poly(c,'#76927a',[[235,91],[250,70],[273,54],[284,52],[270,80],[262,111],[228,114]]);
 poly(c,'#46695e',[[297,46],[322,58],[344,81],[354,111],[286,111]]);
 for(const points of [[[232,112],[247,78],[275,52]],[[268,111],[279,73],[293,47]],[[306,111],[306,73],[300,47]],[[343,111],[330,76],[309,50]]] as const)line(c,'#a3986b',2.5,points);
 poly(c,'#899578',[[221,113],[357,109],[365,117],[356,123],[222,128],[215,121]]);
 poly(c,GREEN,[[226,128],[355,122],[355,162],[226,169]]);
 poly(c,'#8e9c7f',[[232,130],[241,129],[241,165],[232,166]]);
 for(const x of [252,278,304,330]){rect(c,'#a5b298',x,132,12,22);rect(c,'#546f60',x+3,133,4,20);}
 // The rail line enters a covered receiving bay below the engine works.
 poly(c,'#2b4945',[[252,171],[252,154],[259,147],[275,147],[284,153],[286,171]]);
 line(c,'#9ba385',2,[[251,170],[251,153],[258,146],[276,146],[285,152],[287,170]]);
 // A small royal crest is architectural decoration, never a divine apparition.
 // One open upper-left wedge, matching the hollow-sun emblem without fractures.
 oval(c,'#4a6b5c',293,92,6,6);
 c.fillStyle='#c0a367';c.beginPath();c.arc(293,92,11,1.32*Math.PI,3.18*Math.PI);
 c.arc(293,92,6,3.18*Math.PI,1.32*Math.PI,true);c.closePath();c.fill();
 for(let i=0;i<8;i++){
  if(i===5)continue;const a=i*Math.PI/4,x=Math.cos(a),y=Math.sin(a);
  poly(c,'#c0a367',[[293+x*10.5-y*2,92+y*10.5+x*2],[293+x*17,92+y*17],[293+x*10.5+y*2,92+y*10.5-x*2]]);
 }
 // Medical pavilion and a covered platform below the works.
 poly(c,'#829580',[[356,149],[426,143],[456,158],[449,179],[356,179]]);
 poly(c,'#d4ccb0',[[350,148],[386,132],[428,137],[461,154],[453,158],[386,143],[354,154]]);
 for(const x of [368,392,417,442])line(c,'#617d70',3,[[x,155],[x,180]]);
 rect(c,CREAM,390,153,15,17);rect(c,'#5b877b',396,155,3,12);rect(c,'#5b877b',393,159,9,3);
 c.restore();
 poly(c,'#708476',[[233,174],[288,174],[444,288],[66,288]]);
 for(const side of [-1,1])line(c,'#d0ccb1',2.5,[[268+side*5,173],[268+side*88,288]]);
 for(let i=0;i<14;i++){const u=(i/14+t*.15)%1,y=176+u*u*134;line(c,'#a59c7b',2+u*3,[[263-u*83,y],[273+u*83,y]]);}
 // Fixed cab framing makes the slow approach legible, including on a phone.
 poly(c,'#2e4949',[[0,0],[33,0],[58,288],[0,288]]);poly(c,'#789080',[[31,0],[42,0],[67,288],[56,288]]);
 poly(c,'#2e4949',[[487,0],[512,0],[512,288],[455,288]]);poly(c,'#638173',[[478,0],[488,0],[466,288],[456,288]]);
 poly(c,'#2c4748',[[0,0],[512,0],[512,26],[315,15],[148,21],[0,38]]);
 poly(c,'#7d8b70',[[51,274],[458,267],[458,288],[52,288]]);
 clearance(c,112,275,.7);
 // The brass controls and a steady oil flame stay in the foreground.
 oval(c,'#bda16a',397,279,14,14);oval(c,'#d8cdab',397,279,10,10);line(c,'#557067',2,[[397,279],[402,273]]);
}
export function capitalCrossingShot(c:C,index:number,p:number,t:number){
 if(index===0)medicalTrain(c,p,t);else if(index===1)passengers(c,p,t);else capital(c,p,t);
}
