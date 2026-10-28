import type {LightFlare} from './world-light';

/** Local optical glare, sampled by the same chunky framebuffer as the art. */
export function paintLensFlare(ctx:CanvasRenderingContext2D,flare:LightFlare,center:{x:number;y:number}){
 const {x,y}=flare,gain=Math.min(1.35,flare.strength*1.35);if(gain<=0)return;
 ctx.save();ctx.globalCompositeOperation='screen';
 const halo=ctx.createRadialGradient(x,y,2,x,y,54);
 halo.addColorStop(0,`rgba(255,235,171,${.48*gain})`);
 halo.addColorStop(.18,`rgba(255,204,108,${.20*gain})`);
 halo.addColorStop(.52,`rgba(221,145,67,${.055*gain})`);halo.addColorStop(1,'rgba(221,145,67,0)');
 ctx.fillStyle=halo;ctx.fillRect(x-54,y-54,108,108);
 // A tapered diffraction streak reads as an intense source instead of a disk.
 const streak=ctx.createLinearGradient(x-96,y,x+96,y);
 for(const [at,alpha]of [[0,0],[.18,.06],[.35,.28],[.47,.72],[.5,.98],[.53,.72],[.65,.28],[.82,.06],[1,0]])streak.addColorStop(at,`rgba(255,234,177,${Math.min(1,alpha*gain)})`);
 ctx.fillStyle=streak;ctx.beginPath();
 for(const [i,[dx,dy]]of [[-96,0],[-16,-2],[0,-4],[16,-2],[96,0],[16,2],[0,4],[-16,2]].entries())if(i)ctx.lineTo(x+dx,y+dy);else ctx.moveTo(x+dx,y+dy);
 ctx.closePath();ctx.fill();
 const ray=ctx.createLinearGradient(x,y-28,x,y+28);
 ray.addColorStop(0,'rgba(255,230,171,0)');ray.addColorStop(.5,`rgba(255,241,201,${.62*gain})`);ray.addColorStop(1,'rgba(255,230,171,0)');
 ctx.fillStyle=ray;ctx.beginPath();ctx.moveTo(x,y-28);ctx.lineTo(x+2,y);ctx.lineTo(x,y+28);ctx.lineTo(x-2,y);ctx.closePath();ctx.fill();
 // Faint lens ghosts follow the source-to-camera axis, not the tactical grid.
 const dx=center.x-x,dy=center.y-y;
 for(const [along,radius,color]of [[1.4,7,'170,214,190'],[2.2,11,'226,185,111']]as const){
  const gx=Math.round((x+dx*along)/2)*2,gy=Math.round((y+dy*along)/2)*2;
  const ghost=ctx.createRadialGradient(gx,gy,radius*.65,gx,gy,radius);
  ghost.addColorStop(0,`rgba(${color},${.018*gain})`);ghost.addColorStop(.8,`rgba(${color},${.065*gain})`);ghost.addColorStop(1,`rgba(${color},0)`);
  ctx.fillStyle=ghost;ctx.fillRect(gx-radius,gy-radius,radius*2,radius*2);
 }
 const core=ctx.createRadialGradient(x,y,0,x,y,9);
 core.addColorStop(0,`rgba(255,255,240,${Math.min(1,.98*gain)})`);core.addColorStop(.4,`rgba(255,249,215,${.75*gain})`);core.addColorStop(1,'rgba(255,223,137,0)');
 ctx.fillStyle=core;ctx.fillRect(x-9,y-9,18,18);
 ctx.fillStyle=`rgba(255,255,249,${Math.min(1,gain)})`;ctx.fillRect(x-2,y-2,4,4);ctx.restore();
}
