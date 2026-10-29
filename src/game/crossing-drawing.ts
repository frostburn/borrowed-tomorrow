/** Shared vector drawing and Orrin’s coal locomotive for the chapter films. */
export type C=CanvasRenderingContext2D;
export type Point=readonly [number,number];
export const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
export const rect=(c:C,color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
export const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};
export const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
export const P={night:'#1b2d40',sky:'#617e8b',mist:'#90a6a5',rock:'#384d5c',face:'#526976',dark:'#253b48',steel:'#638487',brass:'#bd945a',light:'#f0cd8b',sea:'#3b6376'};

function steam(c:C,x:number,y:number,t:number){
 for(let i=0;i<6;i++){
  const p=(t*.7+i/6)%1;c.globalAlpha=(1-p)*.65;
  oval(c,'#c3d0bf',x-p*42,y-p*39,5+p*13,4+p*9);
 }
 c.globalAlpha=1;
}
/** Orrin's short coal engine: blue-green boiler, brass bands and low cab. */
export function engine(c:C,x:number,y:number,s:number,t:number){
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
