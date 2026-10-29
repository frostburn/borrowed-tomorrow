/** Cinematic poses, referenced from the accepted actors and portrait originals in
 * public/art/vector. Keep costume/material identity when changing the staging:
 * Nell's bib and braids; Orrin's goggles, beard and sleeves; Kit's scarf/satchel;
 * Celia's bob, spectacles and book; Petra's short hair/armor; Tomas's red scarf.
 * Coordinates are vector planes, not a separate pre-rasterized sprite skin. */
type C=CanvasRenderingContext2D;
type Point=readonly [number,number];
export type EndingPerson='nell'|'orrin'|'kit'|'celia'|'petra'|'tomas';
export type EndingPose={sit?:number;walk?:number};
const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.lineCap='butt';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const P={skin:'#d49c70',skinLight:'#e1b68c',skinShade:'#ad795b',navy:'#263e53',navyLight:'#385368',navyShade:'#243747',red:'#a95243',redLight:'#c27054',redShade:'#843f39',cream:'#d8c59b',creamLight:'#e5d5b0',creamShade:'#b4a784',hair:'#80553d',hairLight:'#a07854',hairShade:'#694a3b',gold:'#d9ae62',goldLight:'#eed090',goldShade:'#b58b4f',green:'#385d4a',greenLight:'#50735b',greenShade:'#304d43',silver:'#b7c1b8',silverLight:'#d2d4bc',silverShade:'#8d9d98',eye:'#34444c',boot:'#80553d'};

function braid(c:C,x:number,y:number){
 poly(c,P.hair,[[x-3,y],[x+3,y],[x+4,y+12],[x+1,y+22],[x-3,y+25],[x-5,y+21],[x-2,y+12]]);
 poly(c,P.hairLight,[[x-2,y+2],[x+2,y+5],[x-2,y+10],[x+1,y+14],[x-3,y+19],[x-1,y+22],[x-4,y+21],[x-2,y+14],[x-4,y+9],[x-1,y+6]]);
 line(c,P.gold,2,[[x-4,y+22],[x,y+23]]);
}
function nellHead(c:C,back:boolean){
 if(!back){
  poly(c,P.hairShade,[[-10,-87],[8,-87],[12,-76],[9,-64],[-9,-64],[-12,-77]]);
  poly(c,P.skin,[[-8,-81],[-4,-85],[5,-84],[9,-78],[8,-70],[3,-65],[-3,-65],[-8,-71]]);
  poly(c,P.skinLight,[[-6,-79],[-2,-82],[2,-81],[1,-71],[-3,-69],[-6,-72]]);
  poly(c,P.hair,[[-10,-82],[-4,-87],[8,-85],[10,-77],[5,-81],[1,-78],[-3,-81],[-8,-75]]);
  line(c,P.eye,1.5,[[-6,-76],[-3,-76]]);line(c,P.eye,1.5,[[3,-76],[6,-76]]);
  line(c,'#a26c58',1,[[-2,-69],[2,-68],[4,-69]]);
 }else poly(c,P.hair,[[-10,-83],[-5,-88],[5,-88],[11,-81],[10,-69],[5,-63],[-5,-63],[-11,-70]]);
 braid(c,-11,-70);braid(c,11,-70);
 poly(c,P.red,[[-13,-85],[-9,-93],[0,-96],[11,-92],[15,-84],[6,-82]]);
 poly(c,P.redLight,[[-9,-90],[0,-93],[9,-90],[12,-86],[-9,-87]]);
 poly(c,P.redShade,[[-14,-85],[10,-86],[17,-83],[15,-80],[-13,-81]]);
 if(!back){line(c,P.navy,2,[[-12,-83],[13,-82]]);poly(c,P.gold,[[-1,-90],[3,-90],[3,-87],[-1,-87]]);}
}
function orrinHead(c:C,back:boolean){
 if(!back){
  poly(c,P.skin,[[-12,-85],[-7,-89],[7,-89],[13,-83],[13,-73],[8,-67],[-8,-67],[-13,-74]]);
  poly(c,P.skinLight,[[-9,-82],[-4,-85],[0,-83],[-1,-74],[-8,-75]]);
  line(c,P.eye,1.5,[[-9,-79],[-5,-79]]);line(c,P.eye,1.5,[[5,-79],[9,-79]]);
  // One closed mouth within warm beard planes, rather than a dark open oval.
  poly(c,P.hair,[[-13,-75],[-8,-72],[-4,-74],[0,-72],[5,-74],[10,-72],[13,-76],[12,-64],[7,-58],[0,-55],[-9,-60],[-14,-68]]);
  poly(c,P.hairLight,[[-11,-72],[-6,-69],[0,-68],[7,-70],[4,-63],[-2,-60],[-9,-64]]);
  poly(c,P.hairShade,[[7,-71],[11,-72],[10,-64],[3,-58],[0,-59],[5,-65]]);
  line(c,'#805642',1.5,[[-4,-71],[3,-71]]);
 }else poly(c,P.hair,[[-13,-84],[12,-84],[13,-69],[7,-63],[-8,-63],[-13,-70]]);
 poly(c,P.navy,[[-16,-87],[-11,-95],[1,-99],[14,-94],[17,-86]]);
 poly(c,P.navyLight,[[-10,-93],[1,-96],[12,-92],[14,-88],[-12,-89]]);
 line(c,P.navyShade,3,[[-18,-85],[18,-85]]);
 if(!back){
  line(c,P.hairShade,3,[[-14,-91],[14,-91]]);
  for(const x of [-7,7]){oval(c,P.gold,x,-91,5,4);poly(c,P.silver,[[x-3,-93],[x+2,-93],[x+3,-90],[x-2,-89]]);}
 }
}
function kitHead(c:C,back:boolean){
 if(!back){
  poly(c,P.skin,[[-9,-81],[-3,-87],[6,-85],[11,-79],[9,-69],[4,-64],[-2,-64],[-9,-70]]);
  poly(c,P.skinLight,[[-7,-78],[-3,-82],[1,-80],[0,-71],[-5,-70]]);
  line(c,P.eye,1.5,[[-6,-76],[-3,-76]]);line(c,P.eye,1.5,[[4,-76],[7,-76]]);
  line(c,'#a26c58',1,[[-1,-68],[4,-68]]);
 }else poly(c,P.hair,[[-11,-83],[10,-83],[11,-71],[7,-65],[-6,-65],[-11,-71]]);
 poly(c,P.hair,[[-14,-80],[-18,-88],[-10,-87],[-12,-95],[-4,-91],[0,-98],[4,-90],[13,-94],[11,-86],[18,-86],[11,-78],[6,-82],[1,-78],[-4,-82],[-9,-76]]);
 poly(c,'#b7784e',[[-11,-88],[-4,-86],[0,-92],[3,-86],[11,-89],[7,-83],[1,-84],[-5,-86],[-10,-82]]);
}
function celiaHead(c:C,back:boolean){
 poly(c,P.silver,[[-13,-82],[-11,-91],[-3,-96],[7,-95],[14,-87],[16,-76],[12,-65],[5,-62],[-8,-64],[-15,-72]]);
 poly(c,P.silverShade,[[-12,-82],[-7,-90],[-3,-92],[-6,-82],[-9,-73],[-6,-64],[-11,-65],[-15,-73]]);
 if(back){poly(c,P.silverLight,[[-6,-91],[2,-93],[9,-89],[11,-78],[8,-67],[5,-65],[8,-77],[6,-87]]);return;}
 // The neck cuts through the rear bob and ends exactly in the collar's V.
 // Keep the collar in front, rather than painting skin across the clothes.
 poly(c,P.skin,[[-4,-70],[4,-70],[5,-64],[0,-59],[-5,-64]]);
 poly(c,P.skin,[[-8,-82],[-2,-88],[7,-85],[10,-78],[8,-69],[3,-64],[-2,-64],[-8,-71]]);
 poly(c,P.skinLight,[[-6,-80],[-2,-84],[2,-82],[0,-72],[-4,-71]]);
 poly(c,P.silverLight,[[-11,-85],[-5,-92],[3,-93],[9,-89],[4,-87],[-3,-85],[-8,-77],[-10,-69]]);
 poly(c,P.silver,[[8,-86],[12,-83],[14,-75],[10,-65],[7,-65],[10,-75]]);
 // Broad teal rims and pale lenses, as in the accepted portrait. Both survive
 // the common chunky display; fine skin-colored rims disappear at this scale.
 for(const x of [-5,5]){
  poly(c,'#43686a',[[x-4,-79],[x+4,-79],[x+4,-73],[x+1,-71],[x-4,-73]]);
  poly(c,'#e6e9d7',[[x-2,-77],[x+2,-77],[x+2,-74],[x-2,-74]]);
  line(c,'#5b7775',1,[[x,-76],[x,-74]]);
 }
 line(c,'#43686a',1.5,[[-1,-77],[1,-77]]);line(c,'#a57660',1,[[-1,-67],[3,-67]]);
}
function petraHead(c:C,back:boolean){
 const hair='#263542',shade='#1e303d';
 poly(c,hair,[[-13,-83],[-11,-93],[-3,-98],[8,-96],[15,-90],[14,-80],[12,-67],[7,-63],[-10,-65],[-14,-72]]);
 if(back){poly(c,'#394851',[[-8,-91],[-1,-94],[9,-90],[11,-79],[8,-67],[5,-65],[7,-80],[3,-89]]);return;}
 poly(c,P.skin,[[-8,-83],[-3,-90],[5,-87],[10,-80],[9,-71],[4,-65],[-1,-65],[-7,-70],[-10,-77]]);
 poly(c,P.skinLight,[[-7,-81],[-3,-85],[0,-83],[-1,-74],[-5,-72]]);
 poly(c,shade,[[-13,-83],[-9,-92],[-2,-94],[9,-92],[13,-86],[12,-79],[7,-85],[1,-87],[-4,-83],[-8,-79],[-9,-66],[-13,-66]]);
 poly(c,'#4c4b45',[[-8,-89],[-2,-92],[7,-90],[2,-89],[-5,-85]]);
 line(c,P.eye,1.5,[[-7,-78],[-3,-78]]);line(c,P.eye,1.5,[[3,-78],[7,-78]]);
 line(c,'#a57660',1,[[-2,-69],[3,-69]]);
}
function tomasHead(c:C,back:boolean){
 if(!back){
  poly(c,P.skin,[[-10,-86],[-6,-93],[4,-94],[11,-88],[12,-78],[7,-71],[2,-68],[-6,-72],[-11,-79]]);
  poly(c,P.skinLight,[[-8,-84],[-3,-89],[1,-87],[1,-76],[-4,-75]]);
  line(c,'#47674e',2,[[-7,-82],[-3,-82]]);line(c,'#47674e',2,[[4,-82],[8,-82]]);
  poly(c,P.skinShade,[[2,-81],[4,-76],[1,-75]]);line(c,'#a57660',1,[[-2,-72],[4,-72]]);
 }else poly(c,P.hair,[[-13,-90],[-7,-98],[3,-100],[13,-96],[15,-90],[12,-78],[8,-70],[-7,-70],[-11,-78]]);
 poly(c,P.hair,[[-13,-85],[-13,-92],[-7,-98],[3,-100],[13,-96],[16,-90],[11,-83],[7,-89],[2,-90],[-4,-86],[-9,-88],[-10,-81]]);
 poly(c,P.hairLight,[[-10,-92],[-6,-95],[3,-97],[11,-94],[4,-94],[-2,-92],[-7,-89]]);
}

/** Tapered leg segments articulate at knees and hips while the upper body stays
 * rigid. Crossed shins and grounded boots replace standing legs as they sit. */
function picnicLegs(c:C,wide:number,sit:number){
 const mix=(a:number,b:number)=>a+(b-a)*sit,drop=28*sit;
 const segment=(a:Point,b:Point,width:number,color:string)=>{
  const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length*width,ny=dx/length*width;
  poly(c,color,[[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]]);
 };
 poly(c,P.navy,[[-12-wide,-41+drop],[12+wide,-41+drop],[15+wide,-30+drop],[-14-wide,-30+drop]]);
 for(const side of [-1,1]){
  const hip:Point=[side*(7+wide*.5),-35+drop],knee:Point=[side*mix(9+wide,23+wide),mix(-21,-7)],ankle:Point=[side*mix(8+wide,-7),-3+sit];
  segment(hip,knee,5.5,P.navy);oval(c,P.navy,knee[0],knee[1],5.5,4.5);
  segment(knee,ankle,4.5,side===1?P.navyShade:P.navyLight);
  const [x,y]=ankle,toe=side*mix(4,-8);
  poly(c,P.boot,[[x-4,y-5],[x+4,y-5],[x+4+Math.max(0,toe),y+5],[x-4+Math.min(0,toe),y+5]]);
  line(c,P.hairLight,1.5,[[x-3,y-2],[x+3,y-2]]);
 }
}

/** Six distinct stepping poses, with knees/feet advancing along the shore path.
 * The torso and head stay rigid; no whole-body scaling or vibrating idle pose. */
function walkingLegs(c:C,phase:number){
 const frame=((Math.floor(phase*6)%6)+6)%6;
 const strides=[-10,-2,10,10,2,-10],lifts=[0,5,2,0,0,0];
 poly(c,P.navy,[[-12,-41],[12,-41],[13,-29],[-13,-29]]);
 for(const side of [-1,1]){
  const at=(frame+(side===1?3:0))%6,stride=strides[at],lift=lifts[at];
  const hip:Point=[side*7,-35],knee:Point=[side*9+stride*.33,-20-stride*.33-lift*.35],ankle:Point=[side*8+stride*.64,-3-stride*.76-lift];
  for(const [a,b,width,ink]of [[hip,knee,5,P.navy],[knee,ankle,4.5,side===1?P.navyShade:P.navyLight]] as const){
   const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length*width,ny=dx/length*width;
   poly(c,ink,[[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]]);
  }
  const [x,y]=ankle;
  poly(c,P.boot,[[x-4,y-5],[x+1,y-8],[x+6,y-4],[x+3,y+4],[x-5,y+5]]);
  line(c,P.hairLight,1.5,[[x-2,y-4],[x+2,y-5]]);
 }
}

function celiaBookArm(c:C,sit:number,back:boolean){
 // Anatomical left is screen right in front and screen left from behind.
 // Rear geometry is drawn before the coat, so the torso occludes the book.
 c.save();c.scale(back?-1:1,1);
 const lap=-sit*7;
 poly(c,P.green,[[11,-61],[18,-59],[25,-46+lap*.5],[22,-31+lap],[12,-27+lap],[10,-34+lap],[18,-37+lap],[19,-45+lap*.5],[10,-53]]);
 poly(c,P.greenLight,[[13,-58],[16,-57],[22,-45+lap*.5],[20,-36+lap],[17,-36+lap],[19,-44+lap*.5]]);
 c.save();c.translate(0,lap);c.scale(-1,1);
 poly(c,P.hair,[[-23,-45],[-8,-47],[-5,-29],[-21,-27]]);
 poly(c,'#b18b62',[[-20,-43],[-10,-44],[-8,-31],[-19,-30]]);
 line(c,P.gold,2,[[-22,-44],[-20,-29]]);poly(c,P.cream,[[-18,-29],[-6,-31],[-6,-28],[-18,-26]]);
 oval(c,P.skin,-14,-30,4,2);c.restore();c.restore();
}
/** Foot-anchored figures keep adult proportions, distinct builds and the same
 * clothing in front/back. joinSide is a screen side omitted for the sea handhold. */
export function paintEndingPerson(c:C,who:EndingPerson,x:number,y:number,s=1,back=false,joinSide?:'left'|'right',pose?:EndingPose){
 c.save();c.translate(x,y);c.scale(s,s);
 const sit=Math.max(0,Math.min(1,pose?.sit??0)),walk=pose?.walk;
 const wide=who==='orrin'?5:who==='petra'?2:0;
 const coat=who==='nell'?P.red:who==='celia'||who==='petra'?P.green:P.navy;
 const shadow=who==='nell'?P.redShade:who==='celia'||who==='petra'?P.greenShade:P.navyShade;
 const light=who==='nell'?P.redLight:who==='celia'||who==='petra'?P.greenLight:P.navyLight;
 const sleeve=who==='orrin'?P.cream:who==='petra'?P.silver:coat;
 const sleeveShade=who==='orrin'?P.creamShade:who==='petra'?P.silverShade:shadow;
 const top=who==='tomas'?-69:-64;
 // Joined trousers and separate substantial boots; no floating lower legs.
 if(walk!==undefined)walkingLegs(c,walk);
 else if(pose?.sit!==undefined)picnicLegs(c,wide,sit);
 else{
 poly(c,P.navy,[[-11-wide,-41],[11+wide,-41],[12+wide,-19],[10+wide,-3],[3,-3],[1,-24],[-2,-24],[-4,-3],[-12-wide,-3],[-13-wide,-19]]);
 poly(c,P.navyShade,[[1,-26],[6,-26],[7,-4],[3,-3]]);
 poly(c,P.boot,[[-12-wide,-8],[-4,-8],[-3,-1],[0,2],[-15-wide,2],[-15-wide,-2]]);
 poly(c,P.boot,[[3,-8],[11+wide,-8],[13+wide,-2],[17+wide,2],[3,2]]);
 line(c,'#a07854',1.5,[[-13-wide,-5],[-5,-5]]);line(c,'#a07854',1.5,[[4,-5],[11+wide,-5]]);
 }
 // Lower/lean the torso as one piece; do not squash the head or clothing.
 c.save();c.translate(0,28*sit-35);c.rotate(Math.sin(sit*Math.PI)*-.09);c.translate(0,35);
 if(who==='celia'&&back)celiaBookArm(c,sit,true);
 const hem=who==='celia'?-15-sit*21:who==='nell'?-34:-32;
 poly(c,coat,[[-13-wide,top],[10+wide,top],[18+wide,-52],[15+wide,-37],[who==='celia'?20:12+wide,hem],[4,hem-2],[-1,hem-5],[-7,hem],[-17-wide,hem-2],[-16-wide,-49]]);
 poly(c,shadow,[[8+wide,top+4],[18+wide,-52],[15+wide,-37],[who==='celia'?20:12+wide,hem],[7,hem-1],[8,-43],[4,-55]]);
 poly(c,light,[[-12-wide,top+4],[-7-wide,top+4],[-8,-43],[-9,hem-2],[-15-wide,hem-3],[-14-wide,-48]]);
 poly(c,P.skin,[[-4,top-6],[4,top-6],[5,top+4],[0,top+8],[-5,top+3]]);
 if(who==='nell'||who==='orrin'){
  if(who==='orrin'){
   poly(c,P.cream,[[-15-wide,top],[13+wide,top],[18+wide,-54],[14+wide,-35],[-16-wide,-35],[-20-wide,-52]]);
   poly(c,P.creamLight,[[-15-wide,top+2],[-9-wide,top+2],[-12-wide,-39],[-17-wide,-38],[-18-wide,-51]]);
   poly(c,P.creamShade,[[12+wide,top+2],[18+wide,-54],[14+wide,-35],[8+wide,-35],[9,-49]]);
  }
  if(who==='orrin'||!back){
   poly(c,P.navy,[[-10-wide,top+2],[-6-wide,top+2],[-5-wide,-53],[6+wide,-53],[6+wide,top+2],[10+wide,top+2],[12+wide,-35],[-12-wide,-35]]);
   poly(c,P.navyLight,[[-8-wide,-51],[0,-51],[-2,-38],[-9-wide,-38]]);
  }else{
   line(c,P.redShade,2,[[0,-59],[0,-39]]);
   poly(c,P.redLight,[[-5,-64],[4,-64],[6,-61],[-6,-61]]);
  }
  if(!back){poly(c,P.creamLight,[[-5,top],[5,top],[4,top+7],[0,top+10],[-4,top+7]]);line(c,P.gold,2,[[-3,-40],[4,-40]]);}
  if(who==='orrin'){line(c,P.hairShade,3,[[-15,-34],[16,-34]]);if(!back)poly(c,P.gold,[[0,-36],[4,-36],[4,-32],[0,-32]]);}
 }else if(who==='kit'){
  poly(c,P.gold,[[-12,top-1],[-5,top-4],[3,top-2],[12,top],[10,top+7],[0,top+11],[-11,top+7]]);
  if(!back)poly(c,'#b7784e',[[-4,top+8],[2,top+10],[0,-40],[-6,-44]]);
  line(c,P.hairShade,3,back?[[10,-60],[-14,-34]]:[[-12,-60],[16,-34]]);
  const bag=back?-15:16;
  poly(c,'#9a7151',[[bag-6,-39],[bag+7,-38],[bag+8,-25],[bag-6,-24]]);
  poly(c,P.hair,[[bag-6,-40],[bag+7,-39],[bag+7,-33],[bag-6,-33]]);
  line(c,P.gold,2,[[bag,-35],[bag+2,-35]]);
 }else if(who==='celia'){
  if(back)line(c,P.greenShade,2,[[0,-59],[0,-22]]);
  else{
   poly(c,P.cream,[[-8,-64],[0,-59],[8,-64],[6,-52],[0,-47],[-6,-53]]);
   poly(c,P.navy,[[-10,-61],[-6,-61],[0,-47],[-7,-53]]);
   line(c,P.gold,1.5,[[0,-46],[-1,-21]]);oval(c,P.gold,0,-57,2,3);
  }
 }else if(who==='petra'){
  poly(c,P.silver,[[-10,-62],[0,-58],[11,-63],[13,-48],[7,-39],[-1,-37],[-10,-43],[-13,-51]]);
  poly(c,P.silverLight,[[-10,-59],[-3,-56],[-2,-42],[-8,-45],[-11,-51]]);
  poly(c,P.silverShade,[[8,-59],[11,-60],[12,-48],[7,-41],[2,-40],[4,-51]]);
  line(c,P.gold,2,[[-9,-63],[0,-57],[10,-64]]);
  line(c,P.hairShade,3,[[-13,-33],[14,-33]]);if(!back)poly(c,P.gold,[[-2,-35],[3,-35],[3,-31],[-2,-31]]);
 }else{
  if(!back)poly(c,P.cream,[[-8,top+1],[6,top+1],[7,-35],[-7,-35]]);
  poly(c,P.red,[[-12,top-3],[-5,top-6],[8,top-4],[12,top],[1,top+7],[-10,top+5]]);
  if(!back)poly(c,P.redLight,[[-6,top+3],[3,top+5],[-6,-43],[-14,-45]]);
  c.save();c.scale(back?-1:1,1);
  line(c,P.hairShade,3,[[12,-64],[-14,-35]]);
  poly(c,'#9a7151',[[-20,-38],[-9,-39],[-8,-25],[-21,-25]]);
  poly(c,P.hair,[[-20,-39],[-9,-40],[-9,-33],[-20,-32]]);
  c.restore();
 }
 for(const side of [-1,1] as const){
  if(joinSide===(side===-1?'left':'right'))continue;
  if(who==='celia'&&side===(back?-1:1))continue;
  if(sit>0||walk!==undefined){
   const swing=walk===undefined?0:Math.sin(walk*Math.PI*2)*side;
   const shoulder:Point=[side*(13+wide),top+5];
   const elbow:Point=[side*(20+wide)+swing,-47+sit*4+swing];
   const hand:Point=[side*(18+wide)*(1-sit)+side*7*sit+swing*2,-29-sit*7+swing*4];
   // Seated hands rest on the lap; the free walking arm swings at its joints.
   const limb=(a:Point,b:Point,width:number,color:string)=>{
    const dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length*width,ny=dx/length*width;
    poly(c,color,[[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]]);
   };
   limb(shoulder,elbow,4,sleeve);limb(elbow,hand,3.5,sleeveShade);oval(c,P.skin,hand[0],hand[1],3,2.5);
   if(who==='petra'){
    poly(c,P.gold,[[shoulder[0]-6,top+4],[shoulder[0],top],[shoulder[0]+7,top+5],[shoulder[0]+7,top+12],[shoulder[0]-5,top+13]]);
    poly(c,P.silverLight,[[shoulder[0]-3,top+5],[shoulder[0],top+3],[shoulder[0]+4,top+6],[shoulder[0]+4,top+10],[shoulder[0]-3,top+10]]);
   }
   continue;
  }
  const shoulder=side*(13+wide),elbow=side*(20+wide),hand=side*(18+wide);
  poly(c,sleeve,[[shoulder-side*3,top+4],[shoulder+side*4,top+6],[elbow+side*3,-47],[hand+side*3,-29],[hand-side*3,-28],[elbow-side*3,-46],[shoulder-side*6,top+13]]);
  poly(c,sleeveShade,[[elbow,-46],[hand+side*3,-29],[hand,-28],[elbow-side*2,-43],[shoulder,top+9]]);
  poly(c,P.skin,[[hand-side*3,-29],[hand+side*3,-29],[hand+side*3,-23],[hand-side*2,-22]]);
  if(who==='orrin')line(c,P.creamLight,3,[[hand-side*3,-31],[hand+side*3,-31]]);
  if(who==='petra'){
   poly(c,P.gold,[[shoulder-side*5,top+4],[shoulder,top],[shoulder+side*8,top+5],[shoulder+side*8,top+13],[shoulder-side*3,top+14]]);
   poly(c,P.silverLight,[[shoulder-side*3,top+6],[shoulder,top+3],[shoulder+side*5,top+7],[shoulder+side*5,top+11],[shoulder-side*2,top+11]]);
  }
 }
 if(who==='celia'&&!back)celiaBookArm(c,sit,false);
 if(who==='nell')nellHead(c,back);
 else if(who==='orrin')orrinHead(c,back);
 else if(who==='kit')kitHead(c,back);
 else if(who==='celia')celiaHead(c,back);
 else if(who==='petra')petraHead(c,back);
 else tomasHead(c,back);
 c.restore();c.restore();
}
