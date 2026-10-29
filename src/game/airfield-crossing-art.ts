import {type C,poly,rect,line,oval} from './crossing-drawing';
import {paintEndingPerson as person,type EndingPerson} from './ending-cast';

/** Foot-anchored cast from the shared cinematic models; no mirrored costumes. */
function traveller(c:C,who:EndingPerson,x:number,y:number,s:number,walk?:number,back=false){
 oval(c,'#526b60',x,y+1,17*s,3*s);
 person(c,who,x,y,s,back,undefined,walk===undefined?undefined:{walk});
 if(who!=='nell')return;
 // Follow the actual right hand in the shared walking pose.
 const side=back?1:-1,swing=walk===undefined?0:Math.sin(walk*Math.PI*2)*side;
 c.save();c.translate(x,y);c.scale(s,s);c.translate(side*18+swing*2,-29+swing*4);
 line(c,'#ba9863',2,[[-4,4],[-3,-3],[3,-4],[5,3]]);
 poly(c,'#947b55',[[-5,4],[5,3],[8,19],[-7,20]]);
 poly(c,'#e3c68c',[[-3,6],[3,5],[5,16],[-4,17]]);c.restore();
}
function sky(c:C){
 rect(c,'#879e9e',0,0,512,288);
 poly(c,'#c5c7ad',[[0,84],[114,71],[224,82],[364,64],[512,78],[512,151],[0,151]]);
}
function ferry(c:C,x:number,y:number){
 c.save();c.translate(x,y);
 line(c,'#a9bbb0',1,[[-43,8],[-23,8]]);line(c,'#8ca79f',1,[[-47,13],[-11,13]]);
 poly(c,'#345763',[[-33,0],[35,-2],[25,13],[-22,15]]);
 poly(c,'#aa9670',[[-32,-3],[33,-5],[36,-1],[-33,3]]);
 poly(c,'#e0d2a9',[[-15,-18],[11,-19],[13,-3],[-15,-1]]);
 poly(c,'#7b8c78',[[-20,-19],[-12,-24],[12,-24],[18,-19]]);
 for(const wx of [-10,1])rect(c,'#638581',wx,-15,6,7);
 poly(c,'#ae8d5d',[[17,-11],[27,-12],[29,-4],[17,-3]]);
 c.restore();
}
function farewell(c:C,_p:number,t:number){
 sky(c);
 poly(c,'#6f8a7d',[[0,128],[109,97],[202,108],[290,95],[339,115],[512,103],[512,173],[0,173]]);
 rect(c,'#60858a',220,129,292,90);
 for(let i=0;i<7;i++){
  const x=234+(i*63+t*7)%294;
  line(c,i%2?'#9fb5a7':'#7e9e99',1,[[x,140+i*8],[x+22+i%3*6,140+i*8]]);
 }
 ferry(c,431-t*11,169);
 // A reverse view of the ward: warm windows, green timber and the cream awning.
 poly(c,'#3f6055',[[19,112],[177,105],[209,128],[209,194],[20,201]]);
 poly(c,'#6c8271',[[19,112],[61,110],[61,199],[20,201]]);
 poly(c,'#d7cdab',[[9,111],[48,84],[173,80],[220,121],[209,130],[171,97],[51,100],[15,122]]);
 poly(c,'#b2af90',[[51,100],[171,97],[209,130],[197,133],[167,107],[53,110],[20,129],[15,122]]);
 for(const x of [39,82,126,169]){
  poly(c,'#d8c494',[[x,138],[x+22,137],[x+22,160],[x,162]]);
  line(c,'#879078',2,[[x+11,138],[x+11,161]]);
 }
 poly(c,'#2e5149',[[111,176],[135,175],[135,201],[112,202]]);
 poly(c,'#98a38a',[[104,201],[142,199],[151,207],[101,211]]);
 // The road leaves the quay; Tomas and the medical train remain at the refuge.
 poly(c,'#82917b',[[0,208],[211,192],[263,204],[333,198],[512,216],[512,288],[0,288]]);
 poly(c,'#a2a58a',[[0,225],[215,208],[272,223],[359,218],[512,242],[512,252],[354,230],[271,235],[211,221],[0,239]]);
 line(c,'#4c7067',5,[[247,196],[351,193],[512,211]]);
 for(const [x,y]of [[259,213],[348,210],[462,223]])line(c,'#69867a',5,[[x,y],[x-2,y-27]]);
 traveller(c,'celia',79,239,.64,undefined,true);
 traveller(c,'orrin',115,254,.73,undefined,true);
 traveller(c,'kit',361,250,.71,undefined,true);
 traveller(c,'petra',407,239,.69,undefined,true);
 oval(c,'#526b60',186,247,16,3);
 person(c,'tomas',186,247,.85,false,'right');
 // Replace the omitted sleeve with one raised farewell, not an extra arm.
 c.save();c.translate(186,247);c.scale(.85,.85);
 const wave=Math.sin(t*3.2)*2;
 poly(c,'#263e53',[[12,-66],[19,-64],[28,-50],[33,-65],[39+wave,-64],[33,-41],[26,-40],[15,-54]]);
 poly(c,'#385368',[[17,-63],[20,-61],[29,-48],[29,-43],[26,-44],[18,-55]]);
 oval(c,'#d49c70',36+wave,-68,3.5,5);c.restore();
 traveller(c,'nell',265,254,.87,undefined,true);
}
function road(c:C,p:number,t:number){
 sky(c);
 rect(c,'#60858a',0,120,512,168);
 for(let i=0;i<9;i++){
  const x=(i*43+t*5)%266-20;line(c,'#90aaa0',1,[[x,137+i*10],[x+20+i%3*7,137+i*10]]);
 }
 poly(c,'#6e897c',[[0,117],[104,96],[200,115],[267,101],[344,119],[512,106],[512,143],[241,149],[122,130],[0,137]]);
 poly(c,'#506d69',[[132,167],[197,139],[267,133],[333,117],[413,126],[512,113],[512,288],[29,288],[57,228]]);
 poly(c,'#82917c',[[149,174],[190,132],[285,118],[330,130],[386,122],[512,137],[512,288],[96,288],[101,222]]);
 // An angled gravel road widens toward the camera, with substantial cliff faces.
 poly(c,'#a6a58b',[[196,132],[282,129],[327,157],[339,210],[390,288],[70,288],[99,222],[149,174]]);
 poly(c,'#79877a',[[70,288],[99,222],[149,174],[157,177],[111,226],[87,288]]);
 poly(c,'#3c5e60',[[29,288],[57,228],[132,167],[149,174],[99,222],[70,288]]);
 poly(c,'#637d72',[[57,228],[132,167],[141,172],[91,220],[67,260]]);
 for(const [x,y]of [[183,161],[271,145],[288,174],[165,201],[143,243],[307,239],[285,274],[102,279]]){
  line(c,'#c4bda0',1.5,[[x,y],[x+8,y-2],[x+13,y]]);
 }
 // A rooted tree bends only at its upper branches in the coastal breeze.
 poly(c,'#586b59',[[435,212],[439,161],[427,151],[432,147],[444,159],[449,210]]);
 c.save();c.translate(439,161);c.rotate(Math.sin(t*1.2)*.025);
 poly(c,'#496b58',[[-49,-24],[-27,-56],[3,-66],[33,-45],[47,-16],[23,-7],[-4,-15],[-24,-5]]);
 poly(c,'#71856a',[[-44,-27],[-25,-51],[3,-61],[24,-46],[8,-32],[-16,-37]]);c.restore();
 const cx=270-p*64,cy=190+p*25;
 const cast:readonly [EndingPerson,number,number,number,number][]=[
  ['celia',-58,-24,.75,.3],['orrin',3,-28,.79,.7],['petra',59,-8,.8,.1],
  ['kit',38,24,.84,.6],['nell',-24,35,.86,0],
 ];
 for(const [who,dx,dy,size,phase]of cast)traveller(c,who,cx+dx,cy+dy,size+p*.1,p*5+phase);
 poly(c,'#526f5c',[[0,277],[30,266],[35,253],[46,275],[63,269],[73,288],[0,288]]);
}

/** Same envelope, rigging, gondola and nacelles as assets/vector/chapter-five.py.
 * Draw vectors directly, at the film's perspective; the ship is not yet owned. */
function surveyShip(c:C){
 poly(c,'#233e4b',[[0,164],[78,80],[208,30],[370,4],[538,27],[674,86],[738,165],[651,225],[495,256],[270,254],[92,226]]);
 poly(c,'#d2c5a3',[[0,164],[78,80],[208,30],[370,4],[538,27],[674,86],[738,165],[568,162],[370,129],[168,158]]);
 poly(c,'#a7a78d',[[0,164],[168,158],[370,129],[568,162],[738,165],[651,225],[495,256],[270,254],[92,226]]);
 poly(c,'#ede0b5',[[78,80],[208,30],[370,4],[538,27],[674,86],[546,100],[370,76],[194,103]]);
 for(const [x,y,xx,yy]of [[110,112,155,302],[251,63,265,300],[489,65,485,302],[632,119,590,302]])line(c,'#657c7a',4,[[x,y],[xx,yy]]);
 poly(c,'#223d49',[[142,291],[266,270],[482,270],[600,291],[563,346],[485,371],[268,371],[179,347]]);
 poly(c,'#b79e6e',[[142,291],[266,270],[482,270],[600,291],[483,319],[267,319]]);
 poly(c,'#486668',[[267,319],[483,319],[563,346],[485,371],[268,371],[179,347]]);
 rect(c,'#d3bd86',282,290,185,10);
 for(let x=293;x<465;x+=27){rect(c,'#182d3a',x,330,17,21);rect(c,'#a6b6a2',x+3,331,11,9);}
 for(const x of [112,588]){oval(c,'#1b3441',x,275,30,18);oval(c,'#a9a88b',x,273,22,11);line(c,'#d9bc7d',5,[[x-27,275],[x+27,275]]);}
 rect(c,'#25464b',369,325,24,44);
}
function mooring(c:C,p:number){
 sky(c);
 poly(c,'#657e75',[[0,144],[106,113],[211,137],[316,106],[426,124],[512,104],[512,238],[0,238]]);
 // A slight camera approach, not a launch: ship, ropes and posts move together.
 c.save();c.translate(304,183);c.scale(1+p*.045,1+p*.045);c.translate(-304,-183);
 poly(c,'#81907b',[[0,216],[132,198],[255,209],[382,196],[512,216],[512,288],[0,288]]);
 poly(c,'#a7a58a',[[0,255],[173,239],[289,246],[331,239],[393,257],[512,248],[512,265],[383,272],[325,252],[290,260],[171,252],[0,272]]);
 // The hangar and a working cargo crane sit on the same mooring apron.
 poly(c,'#4d6b60',[[20,178],[120,167],[152,187],[151,240],[21,249]]);
 poly(c,'#c1b491',[[12,178],[53,151],[121,151],[162,184],[152,192],[119,167],[55,166],[18,188]]);
 poly(c,'#324e4a',[[51,197],[122,192],[122,238],[52,244]]);
 for(const x of [57,84,111])line(c,'#7b907b',3,[[x,199],[x,239]]);
 line(c,'#526d65',5,[[461,236],[464,128],[415,115]]);
 line(c,'#a9ac8e',2,[[463,144],[464,130],[418,117],[418,159]]);
 poly(c,'#9b8c67',[[413,159],[424,158],[422,170],[416,170]]);
 poly(c,'#46675e',[[447,239],[475,236],[482,245],[442,249]]);
 oval(c,'#637c6d',299,223,111,14);
 c.save();c.translate(145,67);c.scale(.4,.4);surveyShip(c);c.restore();
 for(const [x,y,xx,yy]of [[205,184,188,237],[384,184,435,233]]){
  line(c,'#bda879',1.5,[[x,y],[xx,yy]]);rect(c,'#476358',xx-5,yy-4,10,7);
 }
 // The gangway stops at the moored gondola door. No one boards in this film.
 poly(c,'#7e765b',[[294,215],[303,214],[335,244],[316,249]]);
 for(let i=0;i<6;i++){const u=i/6;line(c,'#bda981',1,[[295+u*22,216+u*27],[303+u*30,215+u*27]]);}
 line(c,'#81927c',1.5,[[294,204],[315,234],[316,249]]);
 line(c,'#81927c',1.5,[[304,204],[337,232],[335,244]]);
 // Stores are still waiting below; the requisition scene follows on arrival.
 for(const [x,y]of [[362,243],[385,253],[349,255]]){
  poly(c,'#a38f67',[[x,y],[x+16,y-3],[x+21,y+2],[x+21,y+14],[x+3,y+17],[x,y+12]]);
  line(c,'#d1bb8b',1.5,[[x+4,y+1],[x+19,y+12]]);
 }
 for(const [x,y]of [[331,234],[350,227]]){
  oval(c,'#536e62',x,y,5,1.5);poly(c,'#38565d',[[x-4,y-21],[x+4,y-21],[x+5,y-8],[x+3,y],[x,y-8],[x-3,y],[x-5,y-8]]);
  oval(c,'#b59372',x,y-24,3,4);poly(c,'#2b4651',[[x-4,y-27],[x,y-30],[x+4,y-27],[x+4,y-25],[x-4,y-25]]);
 }
 for(const [who,x,y,s]of [['celia',187,240,.29],['orrin',207,244,.33],['petra',230,241,.31],['nell',210,258,.36],['kit',239,257,.35]]as const){
  traveller(c,who,x,y,s,undefined,true);
 }
 c.restore();
}
export function airfieldCrossingShot(c:C,index:number,p:number,t:number){
 if(index===0)farewell(c,p,t);else if(index===1)road(c,p,t);else mooring(c,p);
}
