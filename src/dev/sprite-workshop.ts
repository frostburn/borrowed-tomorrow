import { ACTOR_DIRECTIONS, ACTOR_FEET, ACTOR_SIZE, type ActorDirection } from '../content/actors';
import type { CompanionId } from '../rules/party';
import { SPRITE_CATALOG, SPRITE_GROUPS, spriteAsset, type SpriteEntry, type SpriteGroup } from './sprite-catalog';
import { art } from '../game/ui';
import { mountCivilianReconstruction } from './civilian-reconstruction';
import { civilianPresentation } from '../content/civilians';
import { animatedHero, ATTACK_CONTACT_MS, motionFrame, motionPage, WALK_CYCLE_MS, WALK_FRAME_MS, WALK_FRAMES, WALK_PHASES, type ActorMotion } from '../content/actor-motion';

const backgrounds = { Slate: ['#182b32', '#234047'], Paper: ['#dac9a0', '#f4e5be'], Night: ['#080f19', '#101d28'] } as const;
type Background = keyof typeof backgrounds;
const equipmentSide: Record<CompanionId,string> = {
  nell:'Lantern: right hand.', orrin:'Steam lance: right hand.',
  kit:'Crossbow: right hand. Satchel: left hip.', celia:'Book: left arm. Satchel: right hip.',
  petra:'Shield: left arm. Saber: right hand.',
};
export class SpriteWorkshop {
  private hero = 'nell';
  private group: SpriteGroup = 'Party';
  private get entry() { return SPRITE_CATALOG.find(entry=>entry.id===this.hero)!; }
  private direction: ActorDirection = 'front';
  private background: Background = 'Slate';
  private zoom = 2;
  private guides = true;
  private images = new Map<string, HTMLImageElement>();
  private host?: HTMLElement;
  private motion:ActorMotion='idle';
  private playing=false;
  private frame=0;
  private started=0;
  private raf?:number;
  private paintedFrame=-2;
  private displayedFrame?:number;

  show(host: HTMLElement) {
    this.host = host;
    this.started=performance.now();
    this.render();
  }
  hide() { this.host = undefined;if(this.raf!==undefined)cancelAnimationFrame(this.raf);this.raf=undefined; }
  private image(name: string) {
    let image = this.images.get(name);
    if (!image) {
      image = new Image(); this.images.set(name, image);
      image.onload = () => { if (this.host) this.paint(); };
      image.src = art(name);
    }
    return image;
  }
  private render() {
    if(this.raf!==undefined)cancelAnimationFrame(this.raf);this.raf=undefined;
    const host = this.host!, entry=this.entry, entries=SPRITE_CATALOG.filter(character=>character.group===this.group),fit=civilianPresentation(entry.sprite);
    const cardStyle=(character:SpriteEntry)=>{const fit=civilianPresentation(character.sprite);return fit?`style="width:${fit.width*fit.scale}px;height:${fit.height*fit.scale}px"`:'';};
    if(!animatedHero(entry.id)){this.motion='idle';this.playing=false;}
    if(!entry.directions.includes(this.direction))this.direction='front';
    host.innerHTML = `<section class="sprite-review" aria-label="Sprite review"><header><h2>Sprites</h2><p>Compare character and enemy artwork at native size.</p></header>
      <div class="sprite-settings" role="group" aria-label="Sprite collection">${SPRITE_GROUPS.map(group=>`<button data-sprite-group="${group}" aria-pressed="${group===this.group}">${group} (${SPRITE_CATALOG.filter(character=>character.group===group).length})</button>`).join('')}</div>
      <div class="sprite-cast" role="group" aria-label="${this.group==='Party'?'Playable characters':this.group}">${entries.map(character=>`<button data-sprite-hero="${character.id}" aria-label="Inspect ${character.name}" aria-pressed="${character.id===this.hero}"><span class="sprite-card-image"><img ${character.portrait?'':'data-actor-only'} ${cardStyle(character)} src="${art(character.portrait??character.sprite)}" alt="${character.name} ${character.portrait?'portrait':'actor'}" width="${character.portrait?128:80}" height="${character.portrait?128:80}"/></span><span>${character.name}</span></button>`).join('')}</div>
      <div class="sprite-settings"><div role="group" aria-label="Facing">${ACTOR_DIRECTIONS.map(direction=>`<button data-facing="${direction}" aria-pressed="${direction===this.direction}" ${entry.directions.includes(direction)?'':'disabled'}>${direction[0].toUpperCase()+direction.slice(1)}</button>`).join('')}</div>
      <div role="group" aria-label="Preview background">${Object.keys(backgrounds).map(background=>`<button data-background="${background}" aria-pressed="${background===this.background}">${background}</button>`).join('')}</div>
      <button id="sprite-guides" aria-pressed="${this.guides}">Ground guides</button></div>
      <div class="sprite-settings" role="group" aria-label="Animation preview">${(['idle','walk','attack',...(entry.id==='petra'?['bash' as const]:[])] as const).map(motion=>`<button data-motion="${motion}" aria-pressed="${this.motion===motion}" ${motion!=='idle'&&!animatedHero(entry.id)?'disabled':''}>${motion[0].toUpperCase()+motion.slice(1)}</button>`).join('')}<button id="sprite-play" ${this.motion==='idle'?'disabled':''}>${this.playing?'Pause':'Play'}</button><button id="sprite-next-frame" ${this.motion==='idle'?'disabled':''}>Next frame</button><span id="sprite-frame" aria-live="off"></span></div>
      <section class="sprite-lineup"><h3>${this.group} lineup / 1x</h3><div class="sprite-scroll"><canvas role="img" width="${entries.length*96}" height="112" aria-label="${this.group} at native size"></canvas></div></section>
      <div class="sprite-inspector"><section><h3>${entry.name} / ${this.direction}</h3><div class="sprite-zoom" role="group" aria-label="Sprite zoom">${[1,2,3].map(zoom=>`<button data-zoom="${zoom}" aria-pressed="${zoom===this.zoom}">${zoom}x</button>`).join('')}</div><canvas role="img" class="sprite-detail" width="240" height="240" aria-label="${entry.name} ${this.direction} at ${this.zoom}x"></canvas></section>
      <section class="sprite-reference"><h3>${entry.directions.length===4?'Four directions':'Available view'} / 1x</h3><div class="sprite-scroll"><canvas role="img" width="${entry.directions.length*88}" height="112" aria-label="${entry.name} available views"></canvas></div><p>${entry.directions.map(direction=>direction[0].toUpperCase()+direction.slice(1)).join(' / ')}</p><p>${entry.hero?equipmentSide[entry.hero]+' Side views keep equipment on its anatomical side.':'One front view is available for this asset.'}</p><p>Actor: ${fit?`${fit.width} x ${fit.height} / scaled to 63px standing height`:'80 x 80'}<br/>Portrait: ${entry.portrait?'128 x 128':'not available'}<br/>Guide: row 68 / center: column 40</p><p class="sprite-file">${spriteAsset(entry,this.direction)}.png${entry.portrait?'<br/>'+entry.portrait+'.png':''}</p></section></div></section>`;
    const bind = (selector: string, action: (button: HTMLButtonElement) => void) => {
      for (const button of host.querySelectorAll<HTMLButtonElement>(selector)) button.onclick = () => {
        const scroll = host.closest('.inventory-panel')!.scrollTop;
        const attribute=button.getAttributeNames().find(name=>name.startsWith('data-'));
        const focus=attribute?`[${attribute}="${button.getAttribute(attribute)}"]`:`#${button.id}`;
        action(button); this.render(); host.closest('.inventory-panel')!.scrollTop = scroll;
        host.querySelector<HTMLButtonElement>(focus)?.focus({preventScroll:true});
      };
    };
    bind('[data-sprite-hero]', button=>{ this.hero=button.dataset.spriteHero!; });
    bind('[data-sprite-group]', button=>{ this.group=button.dataset.spriteGroup as SpriteGroup;this.hero=SPRITE_CATALOG.find(entry=>entry.group===this.group)!.id; });
    bind('[data-facing]', button=>{ this.direction=button.dataset.facing as ActorDirection; });
    bind('[data-background]', button=>{ this.background=button.dataset.background as Background; });
    bind('[data-zoom]', button=>{ this.zoom=Number(button.dataset.zoom); });
    bind('#sprite-guides', ()=>{ this.guides=!this.guides; });
    bind('[data-motion]',button=>{this.motion=button.dataset.motion as ActorMotion;this.frame=0;this.started=performance.now();this.playing=this.motion!=='idle';});
    bind('#sprite-play',()=>{
      if(this.playing)this.pause();else{this.started=performance.now()-(this.motion==='walk'?this.frame*WALK_FRAME_MS:[0,ATTACK_CONTACT_MS,280][this.frame]);this.playing=true;}
    });
    bind('#sprite-next-frame',()=>{this.pause();this.frame=(this.frame+1)%(this.motion==='walk'?WALK_FRAMES:3);});
    this.paint();
    this.playLoop();
    mountCivilianReconstruction(host,entry.id);
  }
  private currentFrame(){
    if(this.motion==='idle')return undefined;
    if(this.playing)return motionFrame(this.motion,(performance.now()-this.started)%(this.motion==='walk'?WALK_CYCLE_MS:600));
    return this.motion==='walk'?this.frame%WALK_FRAMES:motionFrame(this.motion,[0,ATTACK_CONTACT_MS,280][this.frame%3]);
  }
  private pause(){const frame=this.currentFrame();this.frame=this.motion==='walk'?(frame??0):frame===undefined?2:frame%2===0?0:1;this.playing=false;}
  private playLoop(){
    if(!this.host||!this.playing)return;
    this.raf=requestAnimationFrame(()=>{
      this.raf=undefined;if(!this.host||!this.playing)return;
      if((this.currentFrame()??-1)!==this.paintedFrame)this.paint();
      this.playLoop();
    });
  }
  private backdrop(ctx: CanvasRenderingContext2D) {
    const colors = backgrounds[this.background];
    for (let y=0;y<ctx.canvas.height;y+=8) for (let x=0;x<ctx.canvas.width;x+=8) {
      ctx.fillStyle=colors[(x/8+y/8)%2]; ctx.fillRect(x,y,8,8);
    }
    ctx.imageSmoothingEnabled=false;
  }
  private actor(ctx: CanvasRenderingContext2D, entry: SpriteEntry, direction: ActorDirection, x: number, y: number, zoom=1) {
    const frame=animatedHero(entry.id)?this.displayedFrame:undefined;
    const image=this.image(frame!==undefined&&animatedHero(entry.id)?motionPage(entry.id,direction).asset:spriteAsset(entry,direction)),size=ACTOR_SIZE*zoom;
    if (this.guides) {
      ctx.strokeStyle='#87a3a2';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,size-1,size-1);
      ctx.fillStyle='#f4c77a';ctx.fillRect(x,y+ACTOR_FEET*zoom,size,1);
      ctx.fillStyle='#557179';ctx.fillRect(x+40*zoom,y,1,size);
    }
    if(image.complete&&image.naturalWidth){
      const fit=civilianPresentation(entry.sprite);
      if(fit){
        const scale=fit.scale*zoom;ctx.imageSmoothingEnabled=true;
        ctx.drawImage(image,x+40*zoom-image.width*fit.originX*scale,y+68*zoom-image.height*fit.originY*scale,image.width*scale,image.height*scale);
        ctx.imageSmoothingEnabled=false;
      }else if(frame===undefined)ctx.drawImage(image,x,y,size,size);
      else ctx.drawImage(image,frame%2*80,Math.floor(frame/2)*80,80,80,x,y,size,size);
    }
  }
  private paint() {
    if(!this.host)return;
    const [lineup, detail, directions]=this.host.querySelectorAll('canvas');
    const a=lineup.getContext('2d')!,b=detail.getContext('2d')!,c=directions.getContext('2d')!;
    for(const ctx of [a,b,c])this.backdrop(ctx);
    const entry=this.entry, entries=SPRITE_CATALOG.filter(character=>character.group===this.group);
    const frame=this.currentFrame();this.displayedFrame=frame;this.paintedFrame=frame??-1;
    this.host.querySelector('#sprite-frame')!.textContent=frame===undefined?'Idle':frame<WALK_FRAMES?`Step ${frame+1}/${WALK_FRAMES} · ${WALK_PHASES[frame]}`:frame%2===0?'Wind-up':'Contact';
    this.host.dataset.frame=String(frame??'idle');
    const asset=frame!==undefined&&animatedHero(entry.id)?motionPage(entry.id,this.direction).asset:spriteAsset(entry,this.direction);
    this.host.querySelector('.sprite-file')!.innerHTML=`${asset}.png${frame===undefined?'':` / frame ${frame}`}${entry.portrait?'<br/>'+entry.portrait+'.png':''}`;
    entries.forEach((character,index)=>this.actor(a,character,this.direction,8+96*index,16));
    const offset=(240-ACTOR_SIZE*this.zoom)/2;this.actor(b,entry,this.direction,offset,offset,this.zoom);
    entry.directions.forEach((direction,index)=>this.actor(c,entry,direction,8+88*index,16));
    // A DOM mutation asks the shared native framebuffer to repaint these canvases.
    this.host.dataset.paint=String(Number(this.host.dataset.paint??0)+1);
  }
}
