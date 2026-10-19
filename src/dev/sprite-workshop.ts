import { CHARACTERS } from '../content/characters';
import { ACTOR_DIRECTIONS, ACTOR_FEET, ACTOR_SIZE, actorAsset, type ActorDirection } from '../content/actors';
import { COMPANION_IDS, type CompanionId } from '../rules/party';
import { art } from '../game/ui';

const backgrounds = { Slate: ['#182b32', '#234047'], Paper: ['#dac9a0', '#f4e5be'], Night: ['#080f19', '#101d28'] } as const;
type Background = keyof typeof backgrounds;
export class SpriteWorkshop {
  private hero: CompanionId = 'nell';
  private direction: ActorDirection = 'front';
  private background: Background = 'Slate';
  private zoom = 2;
  private guides = true;
  private images = new Map<string, HTMLImageElement>();
  private host?: HTMLElement;

  show(host: HTMLElement) {
    this.host = host;
    this.render();
  }
  hide() { this.host = undefined; }
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
    const host = this.host!;
    host.innerHTML = `<section class="sprite-review" aria-label="Sprite review"><header><h2>Sprites</h2><p>Five travelers, one art direction. Portraits and lineup are native size.</p></header>
      <div class="sprite-cast" role="group" aria-label="Playable characters">${COMPANION_IDS.map(hero=>`<button data-sprite-hero="${hero}" aria-label="Inspect ${CHARACTERS[hero].name}" aria-pressed="${hero===this.hero}"><img src="${art(CHARACTERS[hero].portrait)}" alt="${CHARACTERS[hero].name} portrait" width="128" height="128"/><span>${CHARACTERS[hero].name}</span></button>`).join('')}</div>
      <div class="sprite-settings"><div role="group" aria-label="Facing">${ACTOR_DIRECTIONS.map(direction=>`<button data-facing="${direction}" aria-pressed="${direction===this.direction}">${direction[0].toUpperCase()+direction.slice(1)}</button>`).join('')}</div>
      <div role="group" aria-label="Preview background">${Object.keys(backgrounds).map(background=>`<button data-background="${background}" aria-pressed="${background===this.background}">${background}</button>`).join('')}</div>
      <button id="sprite-guides" aria-pressed="${this.guides}">Ground guides</button></div>
      <section class="sprite-lineup"><h3>Party lineup / 1x</h3><div class="sprite-scroll"><canvas role="img" width="480" height="112" aria-label="All five travelers at native size"></canvas></div></section>
      <div class="sprite-inspector"><section><h3>${CHARACTERS[this.hero].name} / ${this.direction}</h3><div class="sprite-zoom" role="group" aria-label="Sprite zoom">${[1,2,3].map(zoom=>`<button data-zoom="${zoom}" aria-pressed="${zoom===this.zoom}">${zoom}x</button>`).join('')}</div><canvas role="img" class="sprite-detail" width="240" height="240" aria-label="${CHARACTERS[this.hero].name} ${this.direction} at ${this.zoom}x"></canvas></section>
      <section class="sprite-reference"><h3>Four directions / 1x</h3><div class="sprite-scroll"><canvas role="img" width="352" height="112" aria-label="${CHARACTERS[this.hero].name} in all four directions"></canvas></div><p>Actor: 80 x 80<br/>Portrait: 128 x 128<br/>Feet: row 68 / center: column 40</p><p class="sprite-file">${actorAsset(this.hero,this.direction)}.png<br/>${CHARACTERS[this.hero].portrait}.png</p></section></div></section>`;
    const bind = (selector: string, action: (button: HTMLButtonElement) => void) => {
      for (const button of host.querySelectorAll<HTMLButtonElement>(selector)) button.onclick = () => {
        const scroll = host.closest('.inventory-panel')!.scrollTop;
        const attribute=button.getAttributeNames().find(name=>name.startsWith('data-'));
        const focus=attribute?`[${attribute}="${button.getAttribute(attribute)}"]`:`#${button.id}`;
        action(button); this.render(); host.closest('.inventory-panel')!.scrollTop = scroll;
        host.querySelector<HTMLButtonElement>(focus)?.focus({preventScroll:true});
      };
    };
    bind('[data-sprite-hero]', button=>{ this.hero=button.dataset.spriteHero as CompanionId; });
    bind('[data-facing]', button=>{ this.direction=button.dataset.facing as ActorDirection; });
    bind('[data-background]', button=>{ this.background=button.dataset.background as Background; });
    bind('[data-zoom]', button=>{ this.zoom=Number(button.dataset.zoom); });
    bind('#sprite-guides', ()=>{ this.guides=!this.guides; });
    this.paint();
  }
  private backdrop(ctx: CanvasRenderingContext2D) {
    const colors = backgrounds[this.background];
    for (let y=0;y<ctx.canvas.height;y+=8) for (let x=0;x<ctx.canvas.width;x+=8) {
      ctx.fillStyle=colors[(x/8+y/8)%2]; ctx.fillRect(x,y,8,8);
    }
    ctx.imageSmoothingEnabled=false;
  }
  private actor(ctx: CanvasRenderingContext2D, hero: CompanionId, direction: ActorDirection, x: number, y: number, zoom=1) {
    const image=this.image(actorAsset(hero,direction)), size=ACTOR_SIZE*zoom;
    if (this.guides) {
      ctx.strokeStyle='#87a3a2';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,size-1,size-1);
      ctx.fillStyle='#f4c77a';ctx.fillRect(x,y+ACTOR_FEET*zoom,size,1);
      ctx.fillStyle='#557179';ctx.fillRect(x+40*zoom,y,1,size);
    }
    if(image.complete&&image.naturalWidth)ctx.drawImage(image,x,y,size,size);
  }
  private paint() {
    if(!this.host)return;
    const [lineup, detail, directions]=this.host.querySelectorAll('canvas');
    const a=lineup.getContext('2d')!,b=detail.getContext('2d')!,c=directions.getContext('2d')!;
    for(const ctx of [a,b,c])this.backdrop(ctx);
    COMPANION_IDS.forEach((hero,index)=>this.actor(a,hero,this.direction,8+96*index,16));
    const offset=(240-ACTOR_SIZE*this.zoom)/2;this.actor(b,this.hero,this.direction,offset,offset,this.zoom);
    ACTOR_DIRECTIONS.forEach((direction,index)=>this.actor(c,this.hero,direction,8+88*index,16));
    // A DOM mutation asks the shared native framebuffer to repaint these canvases.
    this.host.dataset.paint=String(Number(this.host.dataset.paint??0)+1);
  }
}
