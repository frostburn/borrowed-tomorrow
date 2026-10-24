import { MAP_REVIEWS, reviewFlags } from './map-catalog';
import { CHARACTERS } from '../content/characters';
import { mapPoints, gridPoint, layerVisible, properties, tilePages, tileFrame, tileProperties, mapTilePages, TILESET, type TileLayer } from '../content/tilemaps';
import { interactionMarker } from '../content/interaction-markers';
import { walkable } from '../content/maps';
import { bitmapText } from '../game/pixel-font';
import { art } from '../game/ui';
import { vectorSurface } from '../game/vector-image';
import { vectorAsset } from '../content/art-assets';
import { sceneArt, visibleSceneArt } from '../content/scene-art';
import { sceneLight, lightPixels } from '../game/world-light';
import { lightGround, paintActorShadow } from '../game/light-canvas';

const esc=(text:unknown)=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const numbers=(text:string|null)=>text?.split(',').map(Number)??[];
type Point={x:number;y:number};
export class MapWorkshop {
  private entry=MAP_REVIEWS.find(m=>m.id===new URLSearchParams(location.search).get('map'))??MAP_REVIEWS.find(m=>m.id==='station')!;
  private zoom=1;
  private selected:Point={x:47,y:9};
  private hidden=new Set<number>();
  private flags:Record<string,boolean>={};
  private scene='';
  private overlays=new Set(['actors']);
  private initialView?:Point;
  private host?:HTMLElement;
  private images=new Map<string,HTMLImageElement>();
  private failed=new Set<string>();
  private actorSurfaces=new WeakMap<HTMLImageElement,{pixels:ImageData;shadow:HTMLCanvasElement}>();
  private raf?:number;
  private urlTimer?:ReturnType<typeof setTimeout>;
  constructor(private report:(message:string)=>void){
    const q=new URLSearchParams(location.search),cell=numbers(q.get('cell')),view=numbers(q.get('mapView'));
    this.zoom=q.get('mapZoom')==='2'?2:1;
    this.selected=this.clamp(cell.length===2&&cell.every(Number.isInteger)?{x:cell[0],y:cell[1]}:this.entry.id==='northglass'?this.selected:{x:Math.floor(this.entry.width/48),y:Math.floor(this.entry.height/48)});
    this.hidden=new Set(numbers(q.get('mapHide')).filter(id=>this.layers.some(l=>l.id===id)));
    this.flags=Object.fromEntries(reviewFlags(this.entry).filter(f=>q.get('mapFlags')?.split(',').includes(f)).map(f=>[f,true]));
    this.scene=this.scenes.some(l=>l.name===q.get('mapScene'))?q.get('mapScene')!:'';
    if(q.has('mapOverlays'))this.overlays=new Set(q.get('mapOverlays')!.split(',').filter(s=>['actors','grid','collision','markers'].includes(s)));
    if(view.length===2&&view.every(n=>Number.isFinite(n)&&n>=0))this.initialView={x:view[0],y:view[1]};
  }
  private get layers(){return this.entry.tiles?.layers.filter(l=>l.data)??[];}
  private get scenes(){return this.entry.tiles?.layers.filter(l=>l.name.startsWith('Scene:'))??[];}
  private clamp(p:Point){return {x:Math.max(0,Math.min(Math.floor(this.entry.width/24)-1,p.x)),y:Math.max(0,Math.min(Math.floor(this.entry.height/24)-1,p.y))};}
  show(host:HTMLElement){this.host=host;this.render(false);}
  hide(){
    const view=this.host?.querySelector<HTMLElement>('.map-viewport');
    if(view)this.initialView={x:view.scrollLeft/this.zoom,y:view.scrollTop/this.zoom};
    if(this.urlTimer!==undefined)clearTimeout(this.urlTimer);this.urlTimer=undefined;
    this.host=undefined;if(this.raf!==undefined)cancelAnimationFrame(this.raf);this.raf=undefined;
  }
  private image(url:string){
    let image=this.images.get(url);
    if(!image){image=new Image();this.images.set(url,image);image.onload=()=>this.repaint();image.onerror=()=>{this.failed.add(url);this.repaint();};image.src=url;}
    return image;
  }
  private repaint(){if(!this.host||this.raf!==undefined)return;this.raf=requestAnimationFrame(()=>{this.raf=undefined;if(this.host)this.paint();});}
  private changeMap(id:string){
    this.entry=MAP_REVIEWS.find(m=>m.id===id)!;this.hidden.clear();this.flags={};this.scene='';this.initialView=undefined;
    this.selected=this.clamp({x:Math.floor(this.entry.width/48),y:Math.floor(this.entry.height/48)});this.render(false);
  }
  private render(keepView=true){
    const host=this.host!,old=host.querySelector<HTMLElement>('.map-viewport');
    const view=keepView&&old?{x:old.scrollLeft/this.zoom,y:old.scrollTop/this.zoom}:this.initialView;this.initialView=undefined;
    const opened=[...host.querySelectorAll('details[open] summary')].map(s=>s.textContent);
    const sideScroll=host.querySelector('.map-sidebar')?.scrollTop??0,outer=host.closest('.inventory-panel')!,outerScroll=outer.scrollTop;
    const e=this.entry;
    host.innerHTML=`<section class="map-review" aria-label="Map review"><header><h2>Maps</h2><p>Click a cell to identify its art. Copy reference includes coordinates, layers and a link to this view.</p></header>
      <div class="map-toolbar" role="group" aria-label="Map chapters">${[...new Set(MAP_REVIEWS.map(m=>m.chapter))].sort((a,b)=>a-b).map(ch=>`<button data-map-chapter="${ch}" aria-pressed="${ch===e.chapter}">Chapter ${ch}</button>`).join('')}<span class="map-divider"></span>${['World','Battle'].map(kind=>`<button data-map-kind="${kind}" aria-pressed="${kind===e.kind}" ${MAP_REVIEWS.some(m=>m.chapter===e.chapter&&m.kind===kind)?'':'disabled'}>${kind}</button>`).join('')}</div>
      <div class="map-library" role="group" aria-label="Maps in chapter">${MAP_REVIEWS.filter(m=>m.chapter===e.chapter&&m.kind===e.kind).map(m=>`<button data-map="${m.id}" aria-pressed="${m.id===e.id}">${esc(m.id)}</button>`).join('')}</div>
      <h3>${esc(e.name)}</h3><p class="map-meta">${esc(e.id)} / ${e.width} x ${e.height} / ${e.tiles?sceneArt(e.tiles)?'Traced SVG scene / 24px navigation':'24px tiles':'Native painting'}</p>
      <div class="map-toolbar" role="group" aria-label="Map view">${[1,2].map(z=>`<button data-map-zoom="${z}" aria-pressed="${z===this.zoom}">${z}x</button>`).join('')}${['actors','grid','collision','markers'].map(o=>`<button data-map-overlay="${o}" aria-pressed="${this.overlays.has(o)}">${o[0].toUpperCase()+o.slice(1)}</button>`).join('')}<button id="map-reset">Reset layers</button><button id="map-download">Download view PNG</button><button id="map-copy">Copy reference</button></div>
      <div class="map-layout"><div class="map-main"><form class="map-coordinates" aria-label="Map coordinates"><label>X <input id="map-x" aria-label="Map X" type="number" min="0" max="${Math.floor(e.width/24)-1}" step="1" value="${this.selected.x}" required/></label><label>Y <input id="map-y" aria-label="Map Y" type="number" min="0" max="${Math.floor(e.height/24)-1}" step="1" value="${this.selected.y}" required/></label><button type="submit">Go to cell</button><button type="button" id="map-arrival" ${e.tiles&&mapPoints(e.tiles,'Arrivals').length?'':'disabled'}>Arrival</button></form>
      <div class="map-viewport" aria-label="Scrollable map"><canvas id="map-preview" role="img" tabindex="0" aria-label="${esc(e.id)} map preview" width="${e.width*this.zoom}" height="${e.height*this.zoom}"></canvas></div><p id="map-load" role="status"></p><section class="map-inspector" aria-label="Selected map cell"></section></div>
      <aside class="map-sidebar"><h3>Layers</h3><p>Toggle layers or use Only to isolate one.</p><div class="map-layers" role="group" aria-label="Map layers">${this.layers.map(l=>`<div><button data-map-layer="${l.id}" aria-label="Show ${esc(l.name)}" aria-pressed="${!this.hidden.has(l.id)}">${esc(l.name)}${layerVisible(l,{flags:this.flags})?'':' (story hidden)'}</button><button data-map-only="${l.id}" aria-label="Only ${esc(l.name)}">Only</button></div>`).join('')||'<p>Single scene; no tile layers.</p>'}</div>
      ${this.scenes.length?`<details><summary>Scene cast</summary><div class="map-scenes" role="group" aria-label="Scene cast"><button data-map-scene="" aria-pressed="${!this.scene}">None</button>${this.scenes.map(l=>`<button data-map-scene="${esc(l.name)}" aria-pressed="${l.name===this.scene}">${esc(l.name.slice(6))}</button>`).join('')}</div></details>`:''}
      ${reviewFlags(e).length?`<details><summary>Story flags</summary><div class="map-flags" role="group" aria-label="Map story flags">${reviewFlags(e).map(f=>`<button data-map-flag="${f}" aria-pressed="${!!this.flags[f]}">${f}</button>`).join('')}</div></details>`:''}<button id="map-retry">Retry missing art</button></aside></div></section>`;
    const bind=(selector:string,action:(b:HTMLButtonElement)=>void)=>{for(const b of host.querySelectorAll<HTMLButtonElement>(selector))b.onclick=()=>{
      const attribute=b.getAttributeNames().find(n=>n.startsWith('data-'));
      const focus=attribute?`[${attribute}="${CSS.escape(b.getAttribute(attribute)!)}"]`:`#${b.id}`;
      action(b);if(!b.isConnected)host.querySelector<HTMLButtonElement>(focus)?.focus({preventScroll:true});
    };};
    bind('[data-map]',b=>this.changeMap(b.dataset.map!));
    bind('[data-map-chapter]',b=>this.changeMap(MAP_REVIEWS.find(m=>m.chapter===Number(b.dataset.mapChapter)&&m.kind===e.kind)?.id??MAP_REVIEWS.find(m=>m.chapter===Number(b.dataset.mapChapter))!.id));
    bind('[data-map-kind]',b=>this.changeMap(MAP_REVIEWS.find(m=>m.chapter===e.chapter&&m.kind===b.dataset.mapKind)!.id));
    bind('[data-map-layer]',b=>{const id=Number(b.dataset.mapLayer);if(this.hidden.has(id))this.hidden.delete(id);else this.hidden.add(id);this.render();});
    bind('[data-map-only]',b=>{this.hidden=new Set(this.layers.filter(l=>l.id!==Number(b.dataset.mapOnly)).map(l=>l.id));this.render();});
    bind('[data-map-flag]',b=>{this.flags[b.dataset.mapFlag!]=!this.flags[b.dataset.mapFlag!];this.render();});
    bind('[data-map-scene]',b=>{this.scene=b.dataset.mapScene!;const actor=e.tiles?mapPoints(e.tiles,this.scene)[0]:undefined;if(actor)this.selected=gridPoint(actor);this.render(false);});
    bind('[data-map-overlay]',b=>{const o=b.dataset.mapOverlay!;if(this.overlays.has(o))this.overlays.delete(o);else this.overlays.add(o);this.render();});
    bind('[data-map-zoom]',b=>{this.zoom=Number(b.dataset.mapZoom);this.render(false);});
    bind('#map-reset',()=>{this.hidden.clear();this.render();});
    bind('#map-arrival',()=>{this.selected=gridPoint(mapPoints(e.tiles!,'Arrivals')[0]);this.render(false);});
    bind('#map-retry',()=>{for(const url of this.failed)this.images.delete(url);this.failed.clear();this.paint();});
    bind('#map-copy',()=>{
      this.syncUrl();const fallback=()=>this.report('Clipboard unavailable. Copy the review link from the address bar.');
      if(!navigator.clipboard){fallback();return;}
      void navigator.clipboard.writeText(this.reference()).then(()=>this.report('Map reference copied.')).catch(fallback);
    });
    bind('#map-download',()=>this.download());
    host.querySelector<HTMLFormElement>('form')!.onsubmit=event=>{event.preventDefault();const x=Number(host.querySelector<HTMLInputElement>('#map-x')!.value),y=Number(host.querySelector<HTMLInputElement>('#map-y')!.value);if(Number.isInteger(x)&&Number.isInteger(y)){this.selected=this.clamp({x,y});this.render(false);}};
    const canvas=host.querySelector<HTMLCanvasElement>('#map-preview')!,viewport=host.querySelector<HTMLElement>('.map-viewport')!;
    let drag:{x:number;y:number;left:number;top:number}|undefined,moved=false;
    canvas.onpointerdown=event=>{if(event.pointerType==='mouse'&&event.button===0){drag={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};moved=false;canvas.setPointerCapture(event.pointerId);}};
    canvas.onpointermove=event=>{if(!drag)return;const scale=canvas.getBoundingClientRect().width/canvas.width;if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>4)moved=true;if(moved){viewport.scrollLeft=drag.left-(event.clientX-drag.x)/scale;viewport.scrollTop=drag.top-(event.clientY-drag.y)/scale;}};
    canvas.onpointerup=canvas.onpointercancel=()=>{drag=undefined;};
    canvas.onclick=event=>{if(moved){moved=false;return;}const r=canvas.getBoundingClientRect();this.select({x:Math.floor((event.clientX-r.left)*e.width/r.width/24),y:Math.floor((event.clientY-r.top)*e.height/r.height/24)});};
    canvas.onkeydown=event=>{const delta:Record<string,Point>={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};const d=delta[event.key];if(d){event.preventDefault();event.stopPropagation();this.select({x:this.selected.x+d.x,y:this.selected.y+d.y});this.center();}};
    for(const details of host.querySelectorAll('details'))details.open=opened.includes(details.querySelector('summary')?.textContent??'');
    host.querySelector('.map-sidebar')!.scrollTop=keepView?sideScroll:0;outer.scrollTop=outerScroll;
    if(view){viewport.scrollLeft=view.x*this.zoom;viewport.scrollTop=view.y*this.zoom;}else this.center();
    viewport.onscroll=()=>{if(this.urlTimer!==undefined)clearTimeout(this.urlTimer);this.urlTimer=setTimeout(()=>{this.urlTimer=undefined;this.syncUrl();},150);};this.paint();this.syncUrl();
  }
  private center(){const v=this.host!.querySelector<HTMLElement>('.map-viewport')!;v.scrollLeft=(this.selected.x+.5)*24*this.zoom-v.clientWidth/2;v.scrollTop=(this.selected.y+.5)*24*this.zoom-v.clientHeight/2;}
  private select(p:Point){this.selected=this.clamp(p);this.host!.querySelector<HTMLInputElement>('#map-x')!.value=String(this.selected.x);this.host!.querySelector<HTMLInputElement>('#map-y')!.value=String(this.selected.y);this.paint();this.syncUrl();}
  private active(l:TileLayer){return !this.hidden.has(l.id)&&layerVisible(l,{flags:this.flags});}
  private tile(ctx:CanvasRenderingContext2D,gid:number,x:number,y:number){
    const frame=tileFrame(gid,this.entry.tiles),page=mapTilePages(this.entry.tiles).find(p=>p.name===frame.key)!;const img=this.image(`${import.meta.env.BASE_URL}${page.url}`);
    if(img.complete&&img.naturalWidth)ctx.drawImage(img,frame.frame%page.columns*24,Math.floor(frame.frame/page.columns)*24,24,24,x,y,24,24);
  }
  private paint(){
    const host=this.host!,e=this.entry,canvas=host.querySelector<HTMLCanvasElement>('#map-preview')!,ctx=canvas.getContext('2d')!;
    ctx.resetTransform();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=false;ctx.scale(this.zoom,this.zoom);ctx.fillStyle='#080f19';ctx.fillRect(0,0,e.width,e.height);
    const sorted:{depth:number;draw:()=>void}[]=[];
    const pieces=e.tiles?visibleSceneArt(e.tiles,{flags:this.flags},this.hidden):undefined;
    const rig=sceneLight(e.id,pieces??[]),ground=rig&&e.tiles?lightGround({...e.tiles,layers:e.tiles.layers.filter(l=>!this.hidden.has(l.id))},{flags:this.flags}):undefined;
    if(pieces){
      for(const piece of pieces){
        const image=this.image(`${import.meta.env.BASE_URL}${piece.url}`),draw=()=>{if(image.complete&&image.naturalWidth)ctx.drawImage(vectorSurface(image),piece.x,piece.y);};
        if(piece.depth>=0)sorted.push({depth:piece.depth,draw});else draw();
      }
    }else if(e.tiles){
      for(const page of tilePages(e.tiles))this.image(`${import.meta.env.BASE_URL}${page.url}`);
      for(const l of this.layers.filter(l=>this.active(l))){
        for(const [i,gid] of l.data!.entries())if(gid&&!tileProperties[gid-1].empty){
          const x=i%e.tiles.width*24,y=Math.floor(i/e.tiles.width)*24,draw=()=>this.tile(ctx,gid,x,y);
          if(properties(l).sort)sorted.push({depth:y+Number(tileProperties[gid-1].sortOffset??24),draw});else draw();
        }
      }
    }else{const img=this.image(`${import.meta.env.BASE_URL}${e.image??`art/${e.world!.art??e.id}.webp`}`);if(img.complete&&img.naturalWidth)ctx.drawImage(e.image?vectorSurface(img):img,0,0);}
    if(this.overlays.has('actors')){
      const cast=e.tiles?mapPoints(e.tiles,this.scene):[],castSprites=new Set<string>(cast.map(o=>CHARACTERS[o.name as keyof typeof CHARACTERS]?.sprite));
      const visible=(o:{hiddenFlag?:string;requiredFlag?:string})=>(!o.hiddenFlag||!this.flags[o.hiddenFlag])&&(!o.requiredFlag||this.flags[o.requiredFlag]);
      const actor=(sprite:string,p:Point)=>{
        const image=this.image(art(sprite)),x=(p.x+.5)*24,y=(p.y+.5)*24+7,sy=worldActorScaleY(sprite);
        if(rig&&ground&&image.complete&&image.naturalWidth){
          let surface=this.actorSurfaces.get(image);
          if(!surface){
            const shadow=document.createElement('canvas');shadow.width=shadow.height=80;const s=shadow.getContext('2d',{willReadFrequently:true})!;
            s.drawImage(vectorSurface(image),0,0);const pixels=s.getImageData(0,0,80,80);s.globalCompositeOperation='source-in';s.fillStyle='#172038';s.fillRect(0,0,80,80);
            surface={pixels,shadow};this.actorSurfaces.set(image,surface);
          }
          const native=document.createElement('canvas');native.width=native.height=80;const s=native.getContext('2d')!,lit=s.createImageData(80,80);
          lightPixels(surface.pixels,lit,rig,x,y,40,68,1,sy);s.putImageData(lit,0,0);
          const shadow=surface.shadow;
          sorted.push({depth:-900,draw:()=>{ctx.save();ctx.clip(ground);paintActorShadow(ctx,rig,{x,y,originX:40,originY:68,scaleX:1,scaleY:sy,rotation:0,alpha:1,image:shadow});ctx.restore();}});
          sorted.push({depth:y,draw:()=>ctx.drawImage(native,x-40,y-68*sy,80,80*sy)});
        }else sorted.push({depth:y,draw:()=>{if(image.complete&&image.naturalWidth)ctx.drawImage(vectorAsset(sprite)?vectorSurface(image):image,x-40,y-68*sy,80,80*sy);}});
      };
      for(const o of e.world?.objects??[])if(o.sprite&&visible(o)&&(!o.spriteHiddenFlag||!this.flags[o.spriteHiddenFlag])&&!castSprites.has(o.sprite))actor(o.sprite,o);
      for(const p of e.world?.people??[])if(visible(p))actor(p.sprite,p);
      for(const o of cast){const character=CHARACTERS[o.name as keyof typeof CHARACTERS];if(character&&!properties(o).hidden)actor(character.sprite,gridPoint(o));}
    }
    sorted.sort((a,b)=>a.depth-b.depth).forEach(p=>p.draw());
    if(this.overlays.has('collision')&&!e.image){
      const world=e.world?{...e.world,tiles:e.tiles?{...e.tiles,layers:e.tiles.layers.filter(l=>!this.hidden.has(l.id))}:undefined}:undefined;
      for(let y=0;y<Math.floor(e.height/24);y++)for(let x=0;x<Math.floor(e.width/24);x++){
        let floor=false;if(world)floor=walkable(world,x,y,{flags:this.flags});else for(const l of this.layers.filter(l=>this.active(l))){const value=tileProperties[l.data![y*e.tiles!.width+x]-1]?.walkable;if(typeof value==='boolean')floor=value;}
        if(!floor){ctx.fillStyle='#ce505055';ctx.fillRect(x*24,y*24,24,24);}
      }
    }
    if(this.overlays.has('grid')){ctx.fillStyle='#f4e5be55';for(let x=0;x<e.width;x+=24)ctx.fillRect(x,0,1,e.height);for(let y=0;y<e.height;y+=24)ctx.fillRect(0,y,e.width,1);}
    if(this.overlays.has('markers'))for(const l of e.tiles?.layers.filter(l=>l.type==='objectgroup'&&!l.name.startsWith('Scene:'))??[]){for(const o of l.objects??[]){const p=properties(o);if(p.hiddenFlag&&this.flags[String(p.hiddenFlag)]||p.requiredFlag&&!this.flags[String(p.requiredFlag)])continue;const interaction=l.name==='Interactions'?e.world?.objects.find(item=>item.id===o.name):undefined,marker=interaction?interactionMarker(interaction,{flags:this.flags}):undefined;if(interaction&&!marker)continue;const color=marker?.color??'#73d5de';ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(Math.floor(o.x)+.5,Math.floor(o.y)+.5,o.width||6,o.height||6);bitmapText(ctx,marker?`${marker.glyph} ${o.name}`:o.name,Math.floor(o.x)+8,Math.floor(o.y),color,1);}}
    ctx.strokeStyle='#f4c77a';ctx.lineWidth=2;ctx.strokeRect(this.selected.x*24+1,this.selected.y*24+1,22,22);
    this.inspector();
    const urls=pieces?pieces.map(p=>`${import.meta.env.BASE_URL}${p.url}`):e.tiles?tilePages(e.tiles).map(p=>`${import.meta.env.BASE_URL}${p.url}`):[`${import.meta.env.BASE_URL}${e.image??`art/${e.world!.art??e.id}.webp`}`];
    const missing=urls.filter(url=>this.failed.has(url)),loading=urls.filter(url=>!this.images.get(url)?.complete);
    const status=host.querySelector('#map-load')!;status.textContent=missing.length?'Some artwork is unavailable. Retry missing art or choose another map.':loading.length?'Loading map art...':'Map art loaded.';host.dataset.ready=String(!missing.length&&!loading.length);host.dataset.paint=String(Number(host.dataset.paint??0)+1);
  }
  private stack(){const {x,y}=this.selected;return this.layers.filter(l=>l.data![y*this.entry.tiles!.width+x]).map(l=>({layer:l,gid:l.data![y*this.entry.tiles!.width+x]})).reverse();}
  private source(layer:TileLayer,gid:number){
    const pieces=sceneArt(this.entry.tiles);
    if(pieces){const x=this.selected.x*24,y=this.selected.y*24;return pieces.filter(p=>p.layerId===layer.id&&x>=p.x&&y>=p.y&&x<p.x+p.width&&y<p.y+p.height).map(p=>p.url).join(', ');}
    const f=tileFrame(gid,this.entry.tiles),page=mapTilePages(this.entry.tiles).find(p=>p.name===f.key)!;
    return `${page.url} / frame ${f.frame}`;
  }
  private inspector(){
    const host=this.host!,{x,y}=this.selected,stack=this.stack();
    host.querySelector('.map-inspector')!.innerHTML=`<h3>Cell (${x}, ${y}) / pixel (${x*24}, ${y*24})</h3><p>Top layer first. Hidden entries remain listed for identification.</p>${stack.map(({layer,gid})=>{return `<p class="map-tile-source ${this.active(layer)?'':'map-muted'}"><strong>${esc(layer.name)}</strong>${this.active(layer)?'':' / hidden'}<br/>${gid}: ${esc(TILESET.tiles[gid-1].type)}<br/>${esc(this.source(layer,gid))}</p>`;}).join('')||(this.entry.image?`<p>Whole boss arena: ${esc(this.entry.image)}. Review tactical hexes and actors in Bosses.</p>`:'<p>No tile at this cell; native painting.</p>')}`;
  }
  private syncUrl(){
    if(!this.host)return;const url=new URL(location.href),q=url.searchParams,view=this.host.querySelector<HTMLElement>('.map-viewport')!;
    q.set('dev','maps');q.set('map',this.entry.id);q.set('cell',`${this.selected.x},${this.selected.y}`);q.set('mapZoom',String(this.zoom));q.set('mapView',`${Math.round(view.scrollLeft/this.zoom)},${Math.round(view.scrollTop/this.zoom)}`);q.set('mapOverlays',[...this.overlays].sort().join(','));
    for(const [key,value] of [['mapHide',[...this.hidden].sort((a,b)=>a-b).join(',')],['mapFlags',Object.keys(this.flags).filter(f=>this.flags[f]).sort().join(',')],['mapScene',this.scene]])if(value)q.set(key,value);else q.delete(key);
    if(url.href!==location.href)history.replaceState(null,'',url);
  }
  private reference(){return `Map: ${this.entry.id} / Chapter ${this.entry.chapter} / ${this.entry.kind}\nCell: (${this.selected.x}, ${this.selected.y}) / pixel (${this.selected.x*24}, ${this.selected.y*24})\nScene: ${this.scene||'none'}\nFlags: ${Object.keys(this.flags).filter(f=>this.flags[f]).join(', ')||'none'}\n${this.stack().map(({layer,gid})=>`${this.active(layer)?'Visible':'Hidden'}: ${layer.name} / ${gid}: ${TILESET.tiles[gid-1].type} / ${this.source(layer,gid)}`).join('\n')}\n${this.entry.image??''}\n${location.href}`;}
  private download(){
    const host=this.host!,view=host.querySelector<HTMLElement>('.map-viewport')!,source=host.querySelector<HTMLCanvasElement>('#map-preview')!,crop=document.createElement('canvas');crop.width=view.clientWidth;crop.height=view.clientHeight;
    crop.getContext('2d')!.drawImage(source,view.scrollLeft,view.scrollTop,crop.width,crop.height,0,0,crop.width,crop.height);
    crop.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${this.entry.id}-${this.selected.x}-${this.selected.y}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  }
}
import { worldActorScaleY } from '../content/actors';
