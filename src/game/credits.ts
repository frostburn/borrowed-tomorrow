import {ENDING_CREDITS} from '../content/credits';
import type {UI} from './ui';
import './credits.css';

type C=CanvasRenderingContext2D;
type Point=readonly [number,number];
const poly=(c:C,color:string,points:readonly Point[])=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();};
const oval=(c:C,color:string,x:number,y:number,rx:number,ry:number)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
const line=(c:C,color:string,width:number,points:readonly Point[])=>{c.strokeStyle=color;c.lineWidth=width;c.lineJoin='bevel';c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();};

/** A quiet, story-independent still life; editable vectors, no bitmap assets. */
export function paintCreditsStillLife(c:C){
 const {width,height}=c.canvas;
 c.save();c.setTransform(width/512,0,0,height/224,0,0);
 c.fillStyle='#2b3c42';c.fillRect(0,0,512,224);
 poly(c,'#35494c',[[0,0],[256,0],[267,159],[0,176]]);
 poly(c,'#506167',[[46,15],[161,20],[158,147],[42,152]]);
 poly(c,'#253d50',[[54,24],[152,28],[150,138],[51,143]]);
 poly(c,'#3f5b6d',[[57,28],[147,32],[146,79],[54,83]]);
 poly(c,'#4b6570',[[54,110],[91,91],[115,102],[148,95],[150,138],[51,143]]);
 line(c,'#7b867b',5,[[103,26],[101,141]]);line(c,'#7b867b',4,[[53,84],[150,81]]);
 poly(c,'#27383d',[[180,0],[202,0],[206,149],[198,172],[178,172],[188,128]]);
 // A slanted wooden sill/table, with short joints rather than a tile pattern.
 poly(c,'#8b6c4c',[[0,174],[206,157],[512,170],[512,224],[0,224]]);
 poly(c,'#ab875a',[[0,174],[206,157],[512,170],[512,195],[0,209]]);
 poly(c,'#634c3c',[[0,209],[512,195],[512,224],[0,224]]);
 line(c,'#c39b66',2,[[0,177],[205,161],[512,174]]);
 line(c,'#72543f',2,[[17,196],[124,188],[176,190]]);
 line(c,'#72543f',2,[[285,180],[374,185],[481,181]]);
 // Warm light reaches both props and the wall. The window stays a cool blue.
 const glow=c.createRadialGradient(361,148,12,345,145,190);
 glow.addColorStop(0,'rgba(247,194,101,.42)');glow.addColorStop(.5,'rgba(218,146,71,.16)');glow.addColorStop(1,'rgba(218,146,71,0)');
 c.fillStyle=glow;c.fillRect(166,0,346,224);
 oval(c,'#654f3e',247,196,65,7);oval(c,'#6d543c',362,198,38,6);
 // Nell's red railway cap: full crown, navy band, short brim and gold badge.
 c.save();c.translate(242,191);
 poly(c,'#a34c40',[[-46,-14],[-34,-42],[-8,-55],[27,-49],[43,-25],[42,-14]]);
 poly(c,'#c36a50',[[-33,-37],[-7,-50],[25,-45],[37,-26],[12,-32],[-18,-30]]);
 poly(c,'#d58059',[[25,-45],[38,-28],[42,-15],[30,-15],[27,-28],[9,-36]]);
 poly(c,'#803f38',[[-46,-14],[-35,-39],[-28,-34],[-30,-18],[-11,-13]]);
 poly(c,'#334957',[[-46,-15],[43,-17],[43,-9],[-46,-7]]);
 poly(c,'#a74f40',[[-48,-8],[43,-10],[57,0],[42,6],[-48,2]]);
 poly(c,'#c37654',[[-8,-7],[42,-8],[52,-1],[39,2],[-12,-2]]);
 poly(c,'#d9ae62',[[-3,-32],[7,-31],[7,-23],[-3,-24]]);
 poly(c,'#efd08b',[[0,-30],[5,-29],[5,-26],[0,-27]]);c.restore();
 // The lantern is whole and ordinary; nothing in this page reveals an ending.
 line(c,'#b69761',5,[[348,117],[344,96],[349,84],[361,80],[374,85],[380,98],[376,117]]);
 line(c,'#e6bf77',2,[[348,96],[352,87],[362,84],[372,89]]);
 poly(c,'#7d694e',[[341,117],[379,115],[389,127],[386,187],[377,196],[344,193],[335,182],[336,130]]);
 poly(c,'#d3a765',[[343,123],[377,121],[381,130],[378,179],[371,186],[346,183],[342,174]]);
 const glass=c.createLinearGradient(344,134,377,179);
 glass.addColorStop(0,'#e3b36c');glass.addColorStop(.55,'#f6dda0');glass.addColorStop(1,'#edbf71');
 c.fillStyle=glass;c.fillRect(345,131,32,48);
 poly(c,'#fff0be',[[358,172],[354,162],[358,152],[361,138],[365,154],[370,165],[366,174]]);
 poly(c,'#a78350',[[335,128],[342,126],[346,183],[340,186]]);
 poly(c,'#d8b676',[[377,124],[383,127],[382,184],[376,188]]);
 line(c,'#aa8a58',3,[[359,129],[360,181]]);
 poly(c,'#bda06c',[[334,122],[345,111],[376,109],[389,120],[386,127],[336,130]]);
 poly(c,'#e0bc7b',[[345,114],[374,113],[382,119],[341,122]]);
 poly(c,'#9d7d50',[[340,182],[380,181],[386,189],[378,196],[344,193]]);
 line(c,'#dfba74',2,[[344,185],[376,185]]);
 c.restore();
}

/** Read-only help page. Retain the existing scene, music, battle and save state. */
export function showCredits(ui:UI,back:()=>void){
 const entries=ENDING_CREDITS.map(entry=>'<section class="credit-entry'+('title' in entry?' credit-game-title':'')+'"><h3>'+ui.escape(entry.role)+'</h3>'+entry.lines.map(name=>'<p>'+ui.escape(name)+'</p>').join('')+'</section>').join('');
 ui.showModal('Credits','<section class="help-credits"><canvas width="768" height="336" role="img" aria-label="Nell’s red railway hat and lantern resting on a wooden sill in warm lamplight"></canvas><div class="credit-list" aria-label="Game credits">'+entries+'</div></section>',[{label:'Back to help',action:back}]);
 paintCreditsStillLife(ui.modal.querySelector<HTMLCanvasElement>('canvas')!.getContext('2d')!);
}
