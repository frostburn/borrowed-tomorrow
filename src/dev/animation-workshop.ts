import { ACTOR_DIRECTIONS, type ActorDirection } from '../content/actors';
import { LAYERED_SIZE, renderLayers } from '../art/layered-sprite';
import { LEG_COLORS, REFERENCE_FRAME_MS, REFERENCE_FRAMES, referenceFrame, referencePose, STRIDE_DISTANCE } from '../art/walk-cycle';
import { project } from '../art/actor-space';
import { layerName, REFERENCE_LAYERS, referenceLayers } from './reference-actor';

const phases=['Left contact','Left support','Right passing','Right contact','Right support','Left passing'];
const color=(n:number)=>`#${n.toString(16).padStart(6,'0')}`;
const frameOf=(tick:number)=>((tick%REFERENCE_FRAMES)+REFERENCE_FRAMES)%REFERENCE_FRAMES;

/** Dev-only source rig. Every canvas and export uses the same native layer renderer. */
export class AnimationWorkshop {
  private host?:HTMLElement;
  private direction:ActorDirection='right';
  private visible=new Set<string>(REFERENCE_LAYERS);
  private anatomy=true;
  private joints=false;
  private paths=true;
  private playing=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private speed=1;
  private tick=0;
  private started=0;
  private raf?:number;
  private paintedTick=NaN;
  private frames:Uint8ClampedArray[]=[];
  private native=document.createElement('canvas');

  show(host:HTMLElement){this.host=host;this.started=performance.now();this.native.width=this.native.height=LAYERED_SIZE;this.render();}
  hide(){if(this.host)this.pause();this.host=undefined;if(this.raf!==undefined)cancelAnimationFrame(this.raf);this.raf=undefined;}
  private currentTick(){return this.tick+(this.playing?Math.floor((performance.now()-this.started)*this.speed/REFERENCE_FRAME_MS):0);}
  private pause(){this.tick=this.currentTick();this.playing=false;}
  private render(){
    if(!this.host)return;
    if(this.raf!==undefined)cancelAnimationFrame(this.raf);this.raf=undefined;
    const host=this.host;
    host.innerHTML=`<section class="animation-review" aria-label="Layered animation reference"><header><h2>Layered reference</h2><p>Armless walker / 80 x 80 / six frames. Left leg: teal. Right leg: amber.</p></header>
      <div class="animation-controls"><div role="group" aria-label="Reference facing">${ACTOR_DIRECTIONS.map(d=>`<button data-reference-facing="${d}" aria-pressed="${d===this.direction}">${layerName(d)}</button>`).join('')}</div>
      <div role="group" aria-label="Reference playback"><button id="reference-previous">Previous frame</button><button id="reference-play">${this.playing?'Pause':'Play'}</button><button id="reference-next">Next frame</button></div>
      <div role="group" aria-label="Reference speed">${[.5,1,2].map(speed=>`<button data-reference-speed="${speed}" aria-pressed="${speed===this.speed}">${speed}x</button>`).join('')}</div></div>
      <p id="reference-phase" aria-live="off"></p><div class="animation-controls" role="group" aria-label="Reference guides"><button id="reference-joints" aria-pressed="${this.joints}">Joint guides</button><button id="reference-paths" aria-pressed="${this.paths}">Foot paths</button><button id="reference-anatomy" aria-pressed="${this.anatomy}">Anatomy colors</button></div>
      <div class="animation-layout"><section><h3>Assembled / 3x</h3><canvas width="240" height="240" id="reference-detail" role="img" aria-label="Armless reference at 3x"></canvas></section>
      <section class="animation-floor"><h3>Moving floor / 1x</h3><div class="animation-scroll"><canvas width="320" height="128" id="reference-floor" role="img" aria-label="Reference walking over fixed foot contacts"></canvas></div><p id="reference-contacts"></p><p>Floor marks move 40 pixels per cycle. A planted foot stays on its colored mark.</p></section>
      <section><h3>Layers</h3><div class="animation-layers">${REFERENCE_LAYERS.map(id=>`<div><button data-reference-layer="${id}" aria-label="Show ${layerName(id)}" aria-pressed="${this.visible.has(id)}">${layerName(id)}</button><button data-reference-solo="${id}" aria-label="Solo ${layerName(id)}" aria-pressed="${this.visible.size===1&&this.visible.has(id)}">Solo</button></div>`).join('')}</div><button id="reference-all">Show all layers</button></section></div>
      <section><h3>Six-frame strip / 1x</h3><div class="animation-scroll"><canvas width="480" height="88" id="reference-strip" role="img" aria-label="Six native reference walk frames"></canvas></div></section>
      <div class="animation-controls" role="group" aria-label="Reference exports"><button id="reference-export-frame">Export frame PNG</button><button id="reference-export-cycle">Export six frames PNG</button><button id="reference-export-pose">Export pose data</button></div><p class="animation-note">PNG exports contain only the visible layers, at native size, on transparency. Guides stay in the workshop.</p></section>`;
    const bind=(selector:string,action:(button:HTMLButtonElement)=>void)=>{
      for(const button of host.querySelectorAll<HTMLButtonElement>(selector))button.onclick=()=>{
        const panel=host.closest('.inventory-panel')!,scroll=panel.scrollTop;
        const attribute=button.getAttributeNames().find(a=>a.startsWith('data-'));
        const focus=attribute?`[${attribute}="${button.getAttribute(attribute)}"]`:`#${button.id}`;
        action(button);this.render();panel.scrollTop=scroll;host.querySelector<HTMLButtonElement>(focus)?.focus({preventScroll:true});
      };
    };
    bind('[data-reference-facing]',b=>{this.direction=b.dataset.referenceFacing as ActorDirection;});
    bind('[data-reference-speed]',b=>{const wasPlaying=this.playing;this.pause();this.speed=Number(b.dataset.referenceSpeed);this.started=performance.now();this.playing=wasPlaying;});
    bind('#reference-play',()=>{if(this.playing)this.pause();else{this.started=performance.now();this.playing=true;}});
    bind('#reference-previous',()=>{this.pause();this.tick--;});
    bind('#reference-next',()=>{this.pause();this.tick++;});
    bind('#reference-joints',()=>{this.joints=!this.joints;});
    bind('#reference-paths',()=>{this.paths=!this.paths;});
    bind('#reference-anatomy',()=>{this.anatomy=!this.anatomy;});
    bind('[data-reference-layer]',b=>{const id=b.dataset.referenceLayer!;if(this.visible.has(id))this.visible.delete(id);else this.visible.add(id);});
    bind('[data-reference-solo]',b=>{const id=b.dataset.referenceSolo!;this.visible=this.visible.size===1&&this.visible.has(id)?new Set(REFERENCE_LAYERS):new Set([id]);});
    bind('#reference-all',()=>{this.visible=new Set(REFERENCE_LAYERS);});
    bind('#reference-export-frame',()=>{this.exportPng(false);});
    bind('#reference-export-cycle',()=>{this.exportPng(true);});
    bind('#reference-export-pose',()=>{this.exportPose();});
    this.frames=Array.from({length:REFERENCE_FRAMES},(_,i)=>renderLayers(referenceLayers(referenceFrame(i),this.anatomy),this.direction,this.visible));
    this.paint();this.loop();
  }
  private loop(){
    if(!this.host||!this.playing)return;
    this.raf=requestAnimationFrame(()=>{this.raf=undefined;if(!this.host||!this.playing)return;if(this.currentTick()!==this.paintedTick)this.paint();this.loop();});
  }
  private backdrop(ctx:CanvasRenderingContext2D){
    ctx.imageSmoothingEnabled=false;
    for(let y=0;y<ctx.canvas.height;y+=8)for(let x=0;x<ctx.canvas.width;x+=8){ctx.fillStyle=(x/8+y/8)%2?'#234047':'#182b32';ctx.fillRect(x,y,8,8);}
  }
  private source(frame:number){this.native.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(this.frames[frame]),80,80),0,0);return this.native;}
  private paint(){
    if(!this.host)return;
    const tick=this.currentTick(),frame=frameOf(tick),pose=referenceFrame(frame),travel=tick/REFERENCE_FRAMES*STRIDE_DISTANCE;
    this.paintedTick=tick;const detail=this.host.querySelector<HTMLCanvasElement>('#reference-detail')!.getContext('2d')!,floor=this.host.querySelector<HTMLCanvasElement>('#reference-floor')!.getContext('2d')!,strip=this.host.querySelector<HTMLCanvasElement>('#reference-strip')!.getContext('2d')!;
    for(const ctx of [detail,floor,strip])this.backdrop(ctx);
    // Draw the floor in world coordinates relative to a camera following the root.
    for(let n=Math.floor(travel/20)-6;n<=Math.floor(travel/20)+6;n++){
      const y=n*20+12-travel,left=n%2===0,c=left?LEG_COLORS.left:LEG_COLORS.right;
      const a=project({x:-28,y,z:0},this.direction),b=project({x:28,y,z:0},this.direction);
      line(floor,a.x+120,a.y+22,b.x+120,b.y+22,'#35535a');
      const mark=project({x:left?-4:4,y,z:0},this.direction);floor.fillStyle=color(c);floor.fillRect(Math.round(mark.x)+118,Math.round(mark.y)+22,5,1);
    }
    if(this.paths)for(const side of ['left','right'] as const){
      floor.fillStyle=color(LEG_COLORS[side]);
      for(let i=0;i<36;i++){const p=project(referencePose(i/36)[side].ankle,this.direction);floor.fillRect(Math.round(p.x)+120,Math.round(p.y)+22,1,1);}
    }
    const source=this.source(frame);detail.drawImage(source,0,0,240,240);floor.drawImage(source,120,22);
    if(this.joints){
      this.drawJoints(detail,pose,3,0,0);this.drawJoints(floor,pose,1,120,22);
    }
    for(let i=0;i<REFERENCE_FRAMES;i++)strip.drawImage(this.source(i),i*80,0);
    strip.fillStyle='#f4c77a';strip.fillRect(frame*80+8,83,64,2);
    this.host.querySelector('#reference-phase')!.textContent=`Frame ${frame+1} / ${REFERENCE_FRAMES} · ${phases[frame]}`;
    this.host.querySelector('#reference-contacts')!.textContent=`Left: ${pose.left.planted?'planted':'swing'} · Right: ${pose.right.planted?'planted':'swing'}`;
    this.host.dataset.frame=String(frame);this.host.dataset.layers=[...this.visible].join(',');this.host.dataset.paint=String(Number(this.host.dataset.paint??0)+1);
  }
  private drawJoints(ctx:CanvasRenderingContext2D,pose:ReturnType<typeof referenceFrame>,scale:number,dx:number,dy:number){
    for(const side of ['left','right'] as const){
      const points=[pose[side].hip,pose[side].knee,pose[side].ankle].map(p=>project(p,this.direction)),c=color(LEG_COLORS[side]);
      for(let i=0;i<2;i++)line(ctx,Math.round(points[i].x)*scale+dx,Math.round(points[i].y)*scale+dy,Math.round(points[i+1].x)*scale+dx,Math.round(points[i+1].y)*scale+dy,c);
      for(const p of points){ctx.fillStyle='#f4e5be';ctx.fillRect(Math.round(p.x)*scale+dx,Math.round(p.y)*scale+dy,scale,scale);}
    }
  }
  private exportPng(cycle:boolean){
    const canvas=document.createElement('canvas');canvas.width=cycle?160:80;canvas.height=cycle?240:80;
    const ctx=canvas.getContext('2d')!;ctx.imageSmoothingEnabled=false;
    if(cycle)for(let i=0;i<REFERENCE_FRAMES;i++)ctx.drawImage(this.source(i),i%2*80,Math.floor(i/2)*80);
    else ctx.drawImage(this.source(frameOf(this.currentTick())),0,0);
    const selection=this.visible.size===REFERENCE_LAYERS.length?'all':this.visible.size===1?[...this.visible][0]:'selection';
    canvas.toBlob(blob=>{if(blob)download(blob,`reference-${this.direction}-${selection}-${cycle?'walk':'frame'}.png`);},'image/png');
  }
  private exportPose(){
    const document={version:1,size:[80,80],anchor:[40,68],direction:this.direction,frameMs:REFERENCE_FRAME_MS,cycleDistance:STRIDE_DISTANCE,layers:REFERENCE_LAYERS,frames:Array.from({length:REFERENCE_FRAMES},(_,i)=>({frame:i,rootForward:i/REFERENCE_FRAMES*STRIDE_DISTANCE,pose:referenceFrame(i)}))};
    download(new Blob([JSON.stringify(document,null,2)],{type:'application/json'}),`reference-${this.direction}-poses.json`);
  }
}

function line(ctx:CanvasRenderingContext2D,x0:number,y0:number,x1:number,y1:number,color:string){
  x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);ctx.fillStyle=color;
  const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let error=dx+dy;
  for(;;){ctx.fillRect(x0,y0,1,1);if(x0===x1&&y0===y1)break;const e=2*error;if(e>=dy){error+=dy;x0+=sx;}if(e<=dx){error+=dx;y0+=sy;}}
}
function download(blob:Blob,name:string){
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
