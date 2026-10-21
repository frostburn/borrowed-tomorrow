import { bitmapText } from './pixel-font';
import { displayWidth, DISPLAY_HEIGHT } from './resolution';

/** Panel and text colors. Asset colors pass through unchanged. */
export const PALETTE = ['#080f19','#101d28','#182b32','#234047','#35535a','#557179','#87a3a2',
  '#142b29','#253d32','#3b513a','#536c46','#789054','#9bab6c',
  '#382c29','#514033','#70513d','#96694a','#c18a59','#dda66d','#f4c77a',
  '#7f3540','#aa4d42','#d57854','#30334d','#4c526c','#727c93',
  '#625842','#8b805e','#b8a780','#dac9a0','#f4e5be','#e5f3df'];
export function pixelScale(width:number,height:number,dpr:number,logicalWidth:number,logicalHeight:number) {
  const physical=Math.max(1,Math.floor(Math.min(width*dpr/logicalWidth,height*dpr/logicalHeight)));
  return {physical,css:physical/dpr};
}
/** DOM retains focus, semantics, and hit targets. Only this bitmap is visible. */
export class PixelDisplay {
  readonly source: HTMLDivElement;
  readonly output: HTMLCanvasElement;
  readonly world: HTMLCanvasElement;
  readonly host: HTMLDivElement;
  private ctx:CanvasRenderingContext2D;
  private frame=document.createElement('canvas');
  private presentCtx:CanvasRenderingContext2D;
  private lower=document.createElement('canvas');
  private upper=document.createElement('canvas');
  private worldRect={x:0,y:0,w:0,h:0};
  private width=1024;
  private height=DISPLAY_HEIGHT;
  private cssScale=1;
  private physicalScale=1;
  private physicalLeft=0;
  private physicalTop=0;
  private native?:HTMLCanvasElement;
  private dirty=true;
  private commands:{draw:(ctx:CanvasRenderingContext2D)=>void;state:boolean;world?:boolean}[]=[];
  private fitted='';
  private lastPaint=-1;
  private wasAnimated=false;
  constructor(root:HTMLElement, onPoint:(x:number,y:number,click:boolean)=>void) {
    this.source=document.createElement('div');this.source.className='pixel-source';
    while(root.firstChild)this.source.append(root.firstChild);root.append(this.source);
    this.output=document.createElement('canvas');this.output.className='pixel-output';this.output.setAttribute('aria-hidden','true');this.output.style.imageRendering='pixelated';root.append(this.output);
    this.ctx=this.frame.getContext('2d',{willReadFrequently:true})!;
    this.presentCtx=this.output.getContext('2d',{willReadFrequently:true})!;
    this.host=document.createElement('div');this.host.className='phaser-host';document.body.append(this.host);
    this.world=document.createElement('canvas');this.world.className='world-input';document.getElementById('canvas')!.append(this.world);
    const point=(e:PointerEvent,click:boolean)=>{const b=this.world.getBoundingClientRect();onPoint((e.clientX-b.left)*this.world.width/b.width,(e.clientY-b.top)*this.world.height/b.height,click);};
    this.world.addEventListener('pointerdown',e=>point(e,true));this.world.addEventListener('pointermove',e=>point(e,false));
    new MutationObserver(()=>{this.dirty=true;}).observe(this.source,{subtree:true,childList:true,characterData:true,attributes:true});
    for(const event of ['focusin','focusout','pointerover','pointerout','scroll','load','input','change'])this.source.addEventListener(event,()=>{this.dirty=true;},true);
    void document.fonts.ready.then(()=>{this.dirty=true;});
    window.addEventListener('resize',()=>this.layout());this.layout();
    window.borrowedTomorrowPixels={inspect:()=>({width:this.width,height:this.height,physicalScale:this.physicalScale,cssScale:this.cssScale,physicalLeft:this.physicalLeft,physicalTop:this.physicalTop,palette:PALETTE})};
  }
  attach(canvas:HTMLCanvasElement){this.native=canvas;}
  private layout(){
    this.dirty=true;this.fitted='';
    this.width=displayWidth();this.height=DISPLAY_HEIGHT;
    const dpr=window.devicePixelRatio||1,scale=pixelScale(window.innerWidth,window.innerHeight,dpr,this.width,this.height);
    this.cssScale=scale.css;this.physicalScale=scale.physical;
    const left=Math.round((window.innerWidth-this.width*this.cssScale)*dpr/2)/dpr,top=Math.round((window.innerHeight-this.height*this.cssScale)*dpr/2)/dpr;
    this.source.style.width=this.width+'px';this.source.style.height=this.height+'px';this.source.style.left=left+'px';this.source.style.top=top+'px';this.source.style.transform=`scale(${this.cssScale})`;
    this.frame.width=this.width;this.frame.height=this.height;
    // The visible canvas starts at the device origin; center the console inside
    // its bitmap to avoid fractional CSS edges antialiasing the outer border.
    this.physicalLeft=Math.round(left*dpr);this.physicalTop=Math.round(top*dpr);
    this.output.width=Math.ceil(window.innerWidth*dpr);this.output.height=Math.ceil(window.innerHeight*dpr);
    Object.assign(this.output.style,{left:'0px',top:'0px',width:this.output.width/dpr+'px',height:this.output.height/dpr+'px'});
    this.fitWorld();
  }
  /** Sync hit targets in the resize event, before another pointer event can run. */
  fitWorld(){
    if(!this.native)return;
    const stage=document.getElementById('canvas')!;
    // The scene owns its camera viewport. A scene pixel is always a framebuffer pixel.
    const w=this.native.width,h=this.native.height;
    if(this.world.width!==this.native.width||this.world.height!==this.native.height){this.world.width=this.native.width;this.world.height=this.native.height;this.dirty=true;}
    const fitted=`${w}:${h}:${stage.clientWidth}:${stage.clientHeight}`;
    if(fitted!==this.fitted){
      Object.assign(this.world.style,{width:w+'px',height:h+'px',left:Math.floor((stage.clientWidth-w)/2)+'px',top:Math.floor((stage.clientHeight-h)/2)+'px'});
      this.fitted=fitted;this.dirty=true;
    }
  }
  paint(animated=false){
    if(!this.native)return;
    const now=performance.now();
    const resized=this.world.width!==this.native.width||this.world.height!==this.native.height;
    if(this.wasAnimated&&!animated)this.dirty=true;
    this.wasAnimated=animated;
    if(!resized&&!this.dirty&&(!animated||now-this.lastPaint<50))return;
    this.lastPaint=now;
    this.fitWorld();
    if(this.dirty){this.rebuild();this.dirty=false;}
    const ctx=this.ctx;ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;ctx.fillStyle=PALETTE[0];ctx.fillRect(0,0,this.width,this.height);
    ctx.drawImage(this.lower,0,0);
    const r=this.worldRect;ctx.drawImage(this.native,r.x,r.y,r.w,r.h);
    ctx.drawImage(this.upper,0,0);
    // Expand in the bitmap itself. CSS fractional sizing can otherwise smooth pixels
    // at fractional DPR even when the final device scale is an integer.
    this.presentCtx.imageSmoothingEnabled=false;
    this.presentCtx.fillStyle=PALETTE[0];this.presentCtx.fillRect(0,0,this.output.width,this.output.height);
    this.presentCtx.drawImage(this.frame,this.physicalLeft,this.physicalTop,this.width*this.physicalScale,this.height*this.physicalScale);
  }
  /** Measure the DOM only after changes; the world canvas still updates each frame. */
  private rebuild(){
    const origin=this.source.getBoundingClientRect();this.commands=[];
    const add=(draw:(ctx:CanvasRenderingContext2D)=>void,state=false,world=false)=>this.commands.push({draw,state,world});
    const rect=(r:DOMRect)=>({x:Math.round((r.left-origin.left)/this.cssScale),y:Math.round((r.top-origin.top)/this.cssScale),w:Math.round(r.width/this.cssScale),h:Math.round(r.height/this.cssScale)});
    const walk=(element:HTMLElement)=>{
      const style=getComputedStyle(element);if(element.hidden||style.display==='none'||style.visibility==='hidden')return;
      const r=rect(element.getBoundingClientRect());if(r.w<=0||r.h<=0)return;
      const alpha=Number(style.opacity),background=style.backgroundColor;
      add(ctx=>{ctx.save();ctx.globalAlpha*=Number.isFinite(alpha)?alpha:1;},true);
      if(background!=='rgba(0, 0, 0, 0)'&&background!=='transparent')add(ctx=>{ctx.fillStyle=background;ctx.fillRect(r.x,r.y,r.w,r.h);});
      for(const [side,x,y,w,h] of [['top',r.x,r.y,r.w,Number.parseFloat(style.borderTopWidth)],['bottom',r.x,r.y+r.h-Number.parseFloat(style.borderBottomWidth),r.w,Number.parseFloat(style.borderBottomWidth)],['left',r.x,r.y,Number.parseFloat(style.borderLeftWidth),r.h],['right',r.x+r.w-Number.parseFloat(style.borderRightWidth),r.y,Number.parseFloat(style.borderRightWidth),r.h]] as const){
        if(w&&h){const color=style.getPropertyValue(`border-${side}-color`);add(ctx=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));});}
      }
      if(style.overflowX!=='visible'||style.overflowY!=='visible')add(ctx=>{ctx.beginPath();ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();},true);
      if(element===this.world){this.worldRect=r;add(()=>{},false,true);}
      else if(element instanceof HTMLCanvasElement)add(ctx=>{ctx.drawImage(element,r.x,r.y,r.w,r.h);});
      else if(element instanceof HTMLInputElement&&element.type==='number'){
        const value=element.value,scale=Math.max(1,Math.round(parseFloat(style.fontSize)/10));
        add(ctx=>bitmapText(ctx,value,r.x+Math.round(parseFloat(style.paddingLeft)),r.y+Math.round(parseFloat(style.paddingTop))+scale,style.color,scale));
      }
      else if(element instanceof HTMLImageElement&&element.complete&&element.naturalWidth){
        // Borders and padding are outside the image's content box. Drawing into
        // the border box used to resample even a supposedly native-sized portrait.
        const left=Math.round(parseFloat(style.borderLeftWidth)+parseFloat(style.paddingLeft));
        const top=Math.round(parseFloat(style.borderTopWidth)+parseFloat(style.paddingTop));
        const right=Math.round(parseFloat(style.borderRightWidth)+parseFloat(style.paddingRight));
        const bottom=Math.round(parseFloat(style.borderBottomWidth)+parseFloat(style.paddingBottom));
        const w=r.w-left-right,h=r.h-top-bottom;
        add(ctx=>{ctx.imageSmoothingEnabled=true;ctx.drawImage(element,r.x+left,r.y+top,w,h);ctx.imageSmoothingEnabled=false;});
      }else{
        // A closed disclosure retains measurable descendant boxes in Chromium.
        // Its UA content slot hides them; computed display alone does not.
        const summary=element instanceof HTMLDetailsElement&&!element.open?element.querySelector(':scope > summary'):undefined;
        for(const node of element.childNodes){
          if(summary!==undefined&&node!==summary)continue;
          if(node instanceof HTMLElement)walk(node);
          else if(node.nodeType===Node.TEXT_NODE){
            const text=node.textContent??'',range=document.createRange(),color=style.color;
            const scale=Math.max(1,Math.round(Number.parseFloat(style.fontSize)/10));
            for(let i=0;i<text.length;i++){
              if(/\s/.test(text[i]))continue;range.setStart(node,i);range.setEnd(node,i+1);
              const boxes=range.getClientRects();if(!boxes.length)continue;const b=rect(boxes[0]),char=text[i];
              add(ctx=>{bitmapText(ctx,char,b.x,b.y+scale,color,scale);});
            }
          }
        }
      }
      if(element===document.activeElement&&element.tagName!=='DIV')add(ctx=>{ctx.strokeStyle=PALETTE[19];ctx.lineWidth=1;ctx.strokeRect(r.x+1.5,r.y+1.5,r.w-3,r.h-3);});
      if((style.overflowY==='auto'||style.overflowY==='scroll')&&element.scrollHeight>element.clientHeight+1){
        const thumb=Math.max(6,Math.floor(r.h*element.clientHeight/element.scrollHeight));
        const y=r.y+Math.floor((r.h-thumb)*element.scrollTop/(element.scrollHeight-element.clientHeight));
        add(ctx=>{ctx.fillStyle=PALETTE[3];ctx.fillRect(r.x+r.w-3,r.y,2,r.h);ctx.fillStyle=PALETTE[28];ctx.fillRect(r.x+r.w-3,y,2,thumb);});
      }
      add(ctx=>ctx.restore(),true);
    };
    for(const element of this.source.children)if(element instanceof HTMLElement)walk(element);
    // Flatten stable UI once. Keep the animated scene between two cached rasters.
    this.lower.width=this.upper.width=this.width;this.lower.height=this.upper.height=this.height;
    const lower=this.lower.getContext('2d',{willReadFrequently:true})!,upper=this.upper.getContext('2d',{willReadFrequently:true})!;
    lower.imageSmoothingEnabled=upper.imageSmoothingEnabled=false;let passed=false;
    for(const command of this.commands){
      if(command.world){passed=true;continue;}
      if(passed)command.draw(upper);
      else{command.draw(lower);if(command.state)command.draw(upper);}
    }
  }
}
