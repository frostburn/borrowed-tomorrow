import Phaser from 'phaser';
import { CHARACTERS, NPC_SPRITES } from '../content/characters';
import { interactChapterOne, resumeChapter, type StoryHost } from '../content/chapter-one/interactions';
import { CHAPTER, JOURNAL, objective } from '../content/chapter-one/story';
import type { Dialogue } from '../content/dialogue';
import { HEIGHT, MAPS, TILE, WIDTH, mapSize, visibleObjects, walkable, worldPath, type MapObject } from '../content/maps';
import { ABILITIES, ENCOUNTERS, active, awardVictory, cast, createBattle, damage, defend, enemyTurn, legalAim, move, movement, shape, targets, wait, type AbilityId, type Battle } from '../rules/combat';
import { HEX_SIZE, cells, equal, fromPixel, inside, key, neighbors, offset, toPixel, type Hex } from '../rules/hex';
import { decodeSave, level, maxHp, newGame, remember, restoreParty, type GameState, type MapId } from '../rules/state';
import { Audio } from './audio';
import { Cutscene } from './cutscene';
import { checkpoint, exportSave, listSaves, save } from './saves';
import { art, UI } from './ui';
import { bitmapText } from './pixel-font';
import { worldView, narrowScreen } from './resolution';

type Action = AbilityId | 'move';
type Plan = { action: Action; hex: Hex };
const textures = ['nell','nell-left','nell-right','nell-back','orrin','orrin-left','orrin-right','orrin-back','master','clerk','hound','crow','inspector','guardian','rock',...NPC_SPRITES];
const roles: Record<string, string> = { nell: 'Porter', orrin: 'Mechanic', hound: 'Melee · retaliates', crow: 'Ranged · cover blocks shots', guardian: 'Steam lance · line AoE', inspector: 'Signal flare · blast AoE' };

export class Adventure extends Phaser.Scene {
  state: GameState = newGame();
  battle?: Battle;
  readonly audio = new Audio();
  private ui!: UI;
  private layer?: Phaser.GameObjects.Container;
  private cinematic?:Cutscene;
  private grid?: Phaser.GameObjects.Graphics;
  private player?: Phaser.GameObjects.Image;
  private follower?: Phaser.GameObjects.Image;
  private actorImages = new Map<string, Phaser.GameObjects.Image>();
  private mode: 'title' | 'world' | 'battle' = 'title';
  private selected: Action = 'move';
  private hover?: Hex;
  private plan?: Plan;
  private path: { x: number; y: number }[] = [];
  private pendingObject?: MapObject;
  private moving = false;
  private busy = false;
  private face = 'nell';
  private arrowKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private letters?: Record<string, Phaser.Input.Keyboard.Key>;
  private battleCursor: Hex = offset(4, 3);
  private near?: MapObject;
  private lastSecond = 0;
  private latestSave?: GameState;
  private labelId=0;
  private shownTurn?:string;
  private regionLoad?:Promise<void>;
  private serialSave: Promise<void> = Promise.resolve();

  constructor() { super('adventure'); }
  attach(ui: UI) { this.ui = ui; }
  preload() {
    for (const name of textures) this.load.image(name, art(name));
    for (const name of ['station','yard','tunnel']) this.load.image(`map-${name}`, `${import.meta.env.BASE_URL}art/${name}.webp`);
    this.load.on('loaderror', () => this.ui.toast('An art asset could not load. Try refreshing the page.'));
  }
  create() {
    this.arrowKeys = this.input.keyboard!.createCursorKeys();
    this.letters = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => this.keydown(e));
    this.showTitle();
    this.ui.status.textContent = 'WASD / arrows · E interact · click to walk · J journal · Esc menu';
    void listSaves().then(records => { const current = records.find(r => r.compatible); if (current) this.latestSave = current.state; if (this.mode === 'title') this.titlePanel(); }).catch(() => this.ui.toast('Browser saves are unavailable. You can still export your progress.'));
    window.addEventListener('pagehide', () => { if (this.mode === 'world') this.autosave(); });
    window.borrowedTomorrow = { inspect: () => ({ mode: this.mode, moving:this.moving||this.path.length>0||!!this.pendingObject, cinematic:this.cinematic?.script.id??null, state: structuredClone(this.state), battle: this.battle ? { ...structuredClone(this.battle), obstacles: [...this.battle.obstacles], water:[...this.battle.water],vents:[...this.battle.vents] } : null, view: { width:this.cameras.main.width,height:this.cameras.main.height,scrollX:this.cameras.main.scrollX,scrollY:this.cameras.main.scrollY } }) };
  }
  resizeView(){
    if(!this.sys.isActive())return;
    if(this.mode==='battle'){
      const view=worldView();this.scale.setGameSize(view.width,view.height);this.ui.battlePan.hidden=!narrowScreen();this.revealHex(active(this.battle!)?.hex??this.battleCursor);return;
    }
    const view=worldView();this.scale.setGameSize(view.width,view.height);
    const camera=this.cameras.main,size=this.mode==='world'?mapSize(MAPS[this.state.location.map]):{width:WIDTH,height:HEIGHT};camera.stopFollow();camera.setBounds(0,0,size.width,size.height);
    if(this.cinematic){this.cinematic.reframe();}
    else if(this.mode==='world'&&this.player){camera.centerOn(this.player.x,this.player.y);camera.startFollow(this.player,true,1,1);}
    else camera.setScroll(Math.floor((WIDTH-view.width)/2),72);
  }
  panBattle(direction:-1|1){
    if(this.mode!=='battle'||this.blocked)return;
    const camera=this.cameras.main;camera.setScroll(Phaser.Math.Clamp(camera.scrollX+direction*192,0,WIDTH-camera.width),0);
    this.ui.status.textContent='Battlefield view · choose an action and target';
  }
  private revealHex(hex:Hex){
    if(!narrowScreen())return;
    const camera=this.cameras.main,p=toPixel(hex);
    if(p.x<camera.scrollX+48||p.x>camera.scrollX+camera.width-48)camera.setScroll(Phaser.Math.Clamp(Math.round(p.x-camera.width/2),0,WIDTH-camera.width),0);
  }
  get animating(){return this.moving||!!this.cinematic?.animating||this.tweens.getTweens().length>0;}
  private label(x:number,y:number,text:string,color:string,scale=3){
    const canvas=document.createElement('canvas');canvas.width=text.length*6*scale;canvas.height=9*scale;
    bitmapText(canvas.getContext('2d')!,text,0,scale,color,scale);
    const name=`label-${this.labelId++}`;this.textures.addCanvas(name,canvas);
    const image=this.add.image(x,y,name).setOrigin(.5);
    image.once('destroy',()=>this.textures.remove(name));return image;
  }
  private get blocked() { return this.ui.panelOpen || this.ui.modalOpen; }
  private clearLayer() {
    this.cinematic?.close();this.cinematic=undefined;
    this.path = []; this.pendingObject = undefined; this.near = undefined; this.moving = false;
    this.tweens.killAll(); this.layer?.destroy(true); this.grid = undefined; this.player = undefined; this.follower = undefined;this.actorImages.clear();
    this.layer = this.add.container(0,0);
  }
  private background(name: string, y=0, x=0) { this.layer!.add(this.add.image(x,y,`map-${name}`,'__BASE').setOrigin(0)); }
  private worldDetails(map:MapId){
    const g=this.add.graphics();this.layer!.add(g);
    if(map==='station'&&!this.state.flags.raidSeen){
      g.lineStyle(1,0xd8b981,1).lineBetween(180,300,672,300);
      for(let x=184;x<672;x+=24){g.fillStyle((x/24)%2?0x98434c:0xd6b471,1).fillTriangle(x,301,x+14,301,x+7,314);}
      for(const x of [443,574]){g.fillStyle(0xf1d38f,1).fillRect(x,292,6,9);g.lineStyle(1,0xa97b42,1).strokeRect(x-2,290,10,13);}
    }
    if(map==='station'&&this.state.flags.raidSeen){
      g.fillStyle(0x283942,1).fillRect(558,327,13,6).fillRect(555,332,19,3);g.fillStyle(0xb89855,1).fillRect(562,328,4,2);
    }
    if(map==='rillbridge'&&!this.state.flags.villageFreed){
      g.fillStyle(0xc2e8ed,.9);
      for(const [x,y] of [[44,13],[27,19],[25,15]])for(let i=0;i<4;i++)g.fillRect((x+.5)*TILE-26+i*16,(y+.5)*TILE-50+(i%2)*12,3,5);
    }
    if(map==='tunnel'){
      const x=21.5*TILE,y=8*TILE;g.lineStyle(1,0x8c8067,.75).strokeCircle(x,y,17);
      for(const [dx,dy] of [[0,-23],[23,0],[0,23],[-23,0]])g.lineBetween(x+dx,y+dy,x+Math.round(dx*.85),y+Math.round(dy*.85));
    }
  }
  private showTitle() {
    this.mode = 'title';this.ui.battlePan.hidden=true; const view=worldView();this.scale.setGameSize(view.width,view.height);this.cameras.main.stopFollow();this.cameras.main.setBounds(0,0,WIDTH,HEIGHT);this.cameras.main.setScroll(Math.floor((WIDTH-view.width)/2),72);this.clearLayer();this.background('station');
    this.ui.location(CHAPTER.title); this.ui.initiative.textContent = 'Chapter One · A journey beyond the empire';
    this.ui.controls.innerHTML = '<div class="world-objective"><h3>A journey begins at home</h3><p>Explore with the keyboard or click a destination. Battles take place on a hex grid.</p></div>';
    this.titlePanel();
  }
  private titlePanel() {
    this.ui.panel('Borrowed Tomorrow', '<div class="chapter-name">Chapter One · Leaving Home</div>', [
      { label: 'Begin Chapter One', action: () => {
        if (this.latestSave) this.ui.showModal('Begin a new journey?', '<p>Your manual save slots will remain available. Starting a new journey replaces the autosave.</p>', [{ label: 'Begin', action: () => { this.ui.closeModal(); this.begin(); } }]);
        else this.begin();
      } },
      { label: 'Continue', disabled: !this.latestSave, action: () => { if (this.latestSave) this.loadState(this.latestSave); } },
      { label: 'Save files', action: () => this.saves() },
    ]);
  }
  private begin() {
    this.state = newGame(); this.ui.clearPanel(); this.showWorld();
    this.autosave();resumeChapter(this.storyHost());
  }
  private async ensureRegion(map: MapId) {
    if (map !== 'rillbridge' || this.textures.exists('map-rillbridge')) return;
    if (!this.regionLoad) {
      this.regionLoad = new Promise<void>((resolve, reject) => {
        this.load.once('complete', () => {
          if (this.textures.exists('map-rillbridge')) resolve();
          else reject(new Error('Rillbridge could not load. Your checkpoint is intact; try the branch again.'));
        });
        this.load.image('map-rillbridge', `${import.meta.env.BASE_URL}art/rillbridge.webp`);
        this.load.start();
      }).finally(() => { this.regionLoad = undefined; });
    }
    await this.regionLoad;
  }
  private async loadState(state: GameState) {
    if(this.busy)return;this.busy=true;
    try {
      const candidate = decodeSave(JSON.stringify(state));
      if (!walkable(MAPS[candidate.location.map], candidate.location.x, candidate.location.y,candidate)) throw new Error('This save is inside an obstacle.');
      await this.ensureRegion(candidate.location.map);
      this.state = candidate;
      this.battle = undefined; this.ui.closeModal(); this.ui.clearPanel(); this.showWorld(); this.autosave();
      if(this.state.boundary)this.boundaryPanel();
      else resumeChapter(this.storyHost());
      this.ui.toast('Journey restored.');
    } catch (error) { this.ui.toast(error instanceof Error ? error.message : 'Unable to load the save.'); }
    finally{this.busy=false;}
  }
  private showWorld() {
    this.mode = 'world';this.ui.battlePan.hidden=true; this.battle = undefined; this.hover = undefined; this.plan = undefined; this.busy = false;
    const view=worldView();this.scale.setGameSize(view.width,view.height);this.cameras.main.stopFollow();this.cameras.main.setScroll(0,0);
    this.clearLayer(); const map = MAPS[this.state.location.map]; this.background(map.id); this.audio.setMode((map.id==='station'&&this.state.flags.raidSeen)||(map.id==='rillbridge'&&!this.state.flags.villageFreed)?'tunnel':map.id);
    this.worldDetails(map.id);
    for (const object of visibleObjects(map, this.state)) {
      const x = (object.x + .5) * TILE, y = (object.y + .5) * TILE;
      if (object.sprite&&(!object.spriteHiddenFlag||!this.state.flags[object.spriteHiddenFlag])) this.layer!.add(this.add.image(x,y + 7,object.sprite).setOrigin(.5,.85));
      if (!object.doneFlag || !this.state.flags[object.doneFlag]) {
        const marker = this.label(x,y-(object.sprite?39:9),object.sign?'◇':'!','#f4c77a');
        this.layer!.add(marker);
      }
    }
    const p = this.state.location;
    if (this.state.flags.orrinJoined) {
      this.follower = this.add.image((p.x - 1 + .5)*TILE,(p.y+.5)*TILE+7,'orrin').setOrigin(.5,.85); this.layer!.add(this.follower);
    }
    this.player = this.add.image((p.x+.5)*TILE,(p.y+.5)*TILE+7,this.face).setOrigin(.5,.85); this.layer!.add(this.player);
    const size=mapSize(map);this.cameras.main.setBounds(0,0,size.width,size.height);this.cameras.main.centerOn(this.player.x,this.player.y);this.cameras.main.startFollow(this.player,true,1,1);
    this.ui.location(map.name);
    this.ui.initiative.textContent = map.id === 'station' && this.state.flags.raidSeen ? 'The festival is over. Iona is keeping the station open.'
      : map.id === 'rillbridge' && this.state.flags.villageFreed ? 'Rillbridge is awake. The eastern road is open.'
      : map.id === 'tunnel' && this.state.flags.captainDefeated ? 'The crossing is yours. The Iron Coast lies ahead.' : map.subtitle;
    this.renderWorldControls();
  }
  private talk(dialogue: Dialogue) {
    this.path = []; this.pendingObject = undefined;
    this.cinematic?.close();
    const director=dialogue.scene&&this.layer?new Cutscene(this,this.layer,dialogue.scene,this.audio):undefined;
    this.cinematic=director;let finished=false;
    const finish=(action?:()=>void)=>{
      if(finished)return;finished=true;director?.close();if(this.cinematic===director)this.cinematic=undefined;
      if(this.mode==='world'&&this.player)this.cameras.main.startFollow(this.player,true,1,1);
      action?.();if(this.mode==='world'){this.renderWorldControls();this.autosave();}
    };
    this.ui.showDialogue({...dialogue,choices:dialogue.choices?.map(c=>({...c,action:()=>finish(c.action)})),done:()=>finish(dialogue.done)},index=>director?.shot(dialogue.lines[index].shot));
  }
  private finishStory(flag: string, entry?: string) {
    this.state.flags[flag] = true; if (entry) remember(this.state, entry);
    this.showWorld(); this.autosave();
  }
  private async changeMap(map: MapId, x: number, y: number) {
    if(this.busy)return;this.busy=true;
    try{await this.ensureRegion(map);this.state.location={map,x,y};this.showWorld();this.autosave();resumeChapter(this.storyHost());this.ui.canvas.focus();}
    catch(error){this.ui.toast(error instanceof Error?error.message:'Unable to load this area.');}
    finally{this.busy=false;}
  }
  private renderWorldControls() {
    if (this.mode !== 'world') return;
    const s = this.state, esc = this.ui.escape;
    this.ui.controls.innerHTML = `<div class="world-party">${s.party.map(h => `<div class="world-hero"><img src="${art(h.id)}" alt=""/><div><strong>${h.id === 'nell' ? 'Nell':'Orrin'}</strong><small>HP ${h.hp}/${maxHp(h.id,s)} · Lv ${level(s)}</small></div></div>`).join('')}</div><div class="world-objective"><h3>${esc(this.near?.label ?? 'Next stop')}</h3><p>${esc(objective(s))}</p></div><div class="world-actions"><div class="dpad"></div><div class="interact-action"></div></div>`;
    const pad = this.ui.controls.querySelector('.dpad')!;
    for (const [label, dx, dy] of [['↑',0,-1],['←',-1,0],['↓',0,1],['→',1,0]] as const) pad.append(this.ui.button({ label, action: () => { if (!this.blocked && !this.moving) this.stepWorld(dx,dy); } }));
    this.ui.controls.querySelector('.interact-action')!.append(this.ui.button({ label: this.near ? 'Interact' : 'Journal', key: this.near ? 'E' : 'J', action: () => this.near ? this.interact(this.near) : this.journal() }));
    this.ui.status.textContent = `${s.coins} marks · ${s.bandages} bandages · click to walk · E interact · J journal`;
  }
  private closestObject(): MapObject | undefined {
    const p = this.state.location;
    return visibleObjects(MAPS[p.map], this.state).filter(o=>(!o.accessFlag||this.state.flags[o.accessFlag])).filter(o => Math.abs(o.x-p.x) + Math.abs(o.y-p.y) <= 3)
      .sort((a,z) => (Math.abs(a.x-p.x)+Math.abs(a.y-p.y))-(Math.abs(z.x-p.x)+Math.abs(z.y-p.y)))[0];
  }
  update(time: number) {
    if (this.mode !== 'title' && time - this.lastSecond > 1000) { this.lastSecond = time; this.state.playSeconds++; }
    if (this.mode !== 'world' || this.blocked || this.moving || this.busy) return;
    if (this.path.length) {
      const p = this.path.shift()!; this.stepWorld(p.x - this.state.location.x, p.y - this.state.location.y); return;
    }
    if (this.pendingObject) { const object = this.pendingObject; this.pendingObject = undefined; this.interact(object); return; }
    const l = this.letters!, a = this.arrowKeys!;
    if (a.left.isDown || l.A.isDown) this.stepWorld(-1,0);
    else if (a.right.isDown || l.D.isDown) this.stepWorld(1,0);
    else if (a.up.isDown || l.W.isDown) this.stepWorld(0,-1);
    else if (a.down.isDown || l.S.isDown) this.stepWorld(0,1);
    else {
      const near = this.closestObject();
      if (near?.id !== this.near?.id) { this.near = near; this.renderWorldControls(); }
    }
  }
  private stepWorld(dx: number, dy: number) {
    const p = this.state.location; const x = p.x + dx, y = p.y + dy;
    if (!walkable(MAPS[p.map], x, y,this.state) || this.moving || this.blocked) return;
    this.moving = true;
    const previous = { x: this.player!.x, y: this.player!.y };
    this.face = dx < 0 ? 'nell-left' : dx > 0 ? 'nell-right' : dy < 0 ? 'nell-back' : 'nell';
    this.player!.setTexture(this.face); p.x=x; p.y=y;this.audio.effect('move',p.map);
    this.tweens.add({ targets:this.player, x:(x+.5)*TILE, y:(y+.5)*TILE+7, duration:130, ease:'Linear', onComplete:()=>{ this.moving=false; } });
    if (this.follower) {
      this.follower.setTexture(dx < 0 ? 'orrin-left' : dx > 0 ? 'orrin-right' : dy < 0 ? 'orrin-back' : 'orrin');
      this.tweens.add({ targets:this.follower, x:previous.x, y:previous.y, duration:150, ease:'Linear' });
    }
  }
  point(x:number,y:number,click:boolean){
    if(click){this.pointerClick({x,y});return;}
    if(this.mode!=='battle'||this.blocked||this.busy)return;
    const hex=fromPixel(x+this.cameras.main.scrollX,y+this.cameras.main.scrollY);
    if(inside(hex)&&(!this.hover||!equal(this.hover,hex))){this.hover=hex;this.drawGrid();this.updatePreview();}
  }
  private pointerClick(pointer: {x:number;y:number}) {
    if (this.blocked || this.busy) return;
    if (this.mode === 'battle') { const h = fromPixel(pointer.x+this.cameras.main.scrollX,pointer.y+this.cameras.main.scrollY); if (inside(h)) this.chooseHex(h); return; }
    if (this.mode !== 'world') return;
    const point={x:pointer.x+this.cameras.main.scrollX,y:pointer.y+this.cameras.main.scrollY};
    const dest = { x:Math.floor(point.x/TILE), y:Math.floor(point.y/TILE) };
    const object = visibleObjects(MAPS[this.state.location.map], this.state).find(o =>
      Math.hypot(o.x-dest.x,o.y-dest.y)<1.8 || (o.hitArea&&dest.x>=o.hitArea.x&&dest.x<o.hitArea.x+o.hitArea.width&&dest.y>=o.hitArea.y&&dest.y<o.hitArea.y+o.hitArea.height));
    if (object) {
      if (Math.abs(object.x-this.state.location.x)+Math.abs(object.y-this.state.location.y)<=3 && !this.moving) { this.interact(object); return; }
      const candidates = [{x:object.x,y:object.y}, {x:object.x-1,y:object.y}, {x:object.x+1,y:object.y}, {x:object.x,y:object.y-1}, {x:object.x,y:object.y+1}];
      const paths = candidates.filter(d=>walkable(MAPS[this.state.location.map],d.x,d.y,this.state)).map(d=>worldPath(MAPS[this.state.location.map],this.state.location,d,this.state)).filter(p=>p.length).sort((a,b)=>a.length-b.length);
      if (paths[0]) { this.path = paths[0]; this.pendingObject=object; } else this.ui.toast('Walk closer to the marked entrance.');
    } else { this.path=worldPath(MAPS[this.state.location.map],this.state.location,dest,this.state); this.pendingObject=undefined; }
    this.ui.canvas.focus();
  }
  private keydown(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { if (this.ui.modalOpen) this.ui.closeModal(); else if(this.cinematic){this.ui.skipDialogue();} else if (this.plan) { this.plan=undefined; this.renderBattleControls(); this.drawGrid(); } else if (!this.ui.dialogueOpen) this.help(); return; }
    if (this.ui.modalOpen) return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (this.ui.dialogueOpen && ['Enter',' ','e','E'].includes(e.key)) { e.preventDefault(); this.ui.advanceDialogue(); return; }
    if (this.blocked || this.busy || e.repeat) return;
    if (e.key.toLowerCase()==='j') { this.journal(); return; }
    if (this.mode==='world' && ['e','E','Enter',' '].includes(e.key)) { const near=this.closestObject(); if(near)this.interact(near); }
    if (this.mode==='battle' && active(this.battle!)?.side==='party') {
      const u=active(this.battle!)!;
      if (e.key==='1') this.selectAction('move');
      else if (/^[2-5]$/.test(e.key)) { const id=u.abilities[Number(e.key)-2];if(id)this.selectAction(id); }
      else if (e.key.toLowerCase()==='f') this.doDefend();
      else if (e.key.toLowerCase()==='w') this.doWait();
      else if (e.key==='Enter' || e.key===' ') { if(this.plan)this.commitPlan();else this.chooseHex(this.battleCursor); }
      else if (e.key.startsWith('Arrow')) {
        const direction=e.key==='ArrowLeft'?3:e.key==='ArrowRight'?0:e.key==='ArrowUp'?2:5;
        const candidate=neighbors(this.battleCursor).find(h=>equal(h,{q:this.battleCursor.q+[1,1,0,-1,-1,0][direction],r:this.battleCursor.r+[0,-1,-1,0,1,1][direction]}));
        if(candidate){this.battleCursor=candidate;this.hover=candidate;this.revealHex(candidate);this.drawGrid();this.updatePreview();}
      }
    }
  }

  private interact(object: MapObject) {
    if (this.blocked || this.mode !== 'world') return;
    if(object.accessFlag&&!this.state.flags[object.accessFlag]){this.ui.toast('This route has not opened yet.');return;}
    this.path = []; this.pendingObject = undefined;
    interactChapterOne(this.storyHost(), object.id);
  }
  private storyHost(): StoryHost {
    return {
      state: this.state, talk: d => this.talk(d), commit: (flag, entry) => this.finishStory(flag, entry),
      refresh: () => this.showWorld(), save: () => this.autosave(),
      travel: (map, x, y) => { void this.changeMap(map, x, y); }, battle: id => this.startBattle(id),
      shop: () => this.shop(), boundary: () => this.boundaryPanel(), toast: message => this.ui.toast(message),
      endingMusic: () => this.audio.setMode('ending'),
    };
  }
  private boundaryPanel() {
    this.ui.panel('Chapter One complete', '<div class="chapter-name">Next: Chapter Two · Prison Trains</div><p>Rillbridge is awake. Alban has lost the crossing. Tomas is at the prison-train exchange on the Iron Coast.</p><p>Nell and Orrin have their own engine and a way east.</p><p>Chapter Two is not yet playable. Your departure, party, equipment and journal are saved for its continuation.</p>', [
      { label: 'Return to the pass', action: () => { this.ui.clearPanel(); this.renderWorldControls(); } },
      { label: 'Export departure save', action: () => exportSave(this.state) },
    ]);
  }

  private startBattle(id: string) {
    this.ui.clearPanel();this.path=[];this.autosave();this.battle=createBattle(id,this.state);this.mode='battle';this.selected='move';this.plan=undefined;this.hover=undefined;
    const view=worldView();this.scale.setGameSize(view.width,view.height);this.ui.battlePan.hidden=!narrowScreen();this.shownTurn=undefined;this.cameras.main.stopFollow();this.cameras.main.setBounds(0,0,WIDTH,480);this.cameras.main.setScroll(0,0);this.clearLayer();this.audio.setMode(id==='captain'?'inspector':'battle');this.drawBattle();this.renderBattleControls();this.ui.location(ENCOUNTERS[id].name);this.ui.canvas.focus();
  }
  private drawBattle() {
    this.layer?.destroy(true);this.layer=this.add.container(0,0);this.actorImages.clear();
    const backdrop=ENCOUNTERS[this.battle!.encounter].backdrop??{map:'yard',y:-66};
    this.background(backdrop.map,backdrop.y);
    this.grid=this.add.graphics();this.layer.add(this.grid);
    const b=this.battle!,turn=active(b);
    if(turn&&turn.id!==this.shownTurn){this.revealHex(turn.hex);this.shownTurn=turn.id;}
    for(const rock of ENCOUNTERS[b.encounter].rocks){const p=toPixel(offset(...rock));this.layer.add(this.add.image(p.x,p.y+9,'rock').setOrigin(.5,.8));}
    for(const u of b.units){const p=toPixel(u.hex);
      const img=this.add.image(p.x,p.y+9,u.appearance??u.kind).setOrigin(.5,.82).setAlpha(u.hp>0?1:.22);
      if(u.side==='enemy')img.setFlipX(true);
      this.layer.add(img);this.actorImages.set(u.id,img);
      if(u.hp>0){const g=this.add.graphics();g.fillStyle(0x101d24,.95).fillRect(p.x-23,p.y+18,46,6);g.fillStyle(u.side==='party'?0x8ab4ab:0xbf7050).fillRect(p.x-22,p.y+19,44*u.hp/u.maxHp,4);this.layer.add(g);
        const t=this.label(p.x,p.y+28,String(u.hp),'#f4e5be',2);this.layer.add(t);
      }
    }
    this.drawGrid();this.drawInitiative();
  }
  private hexPolygon(h: Hex, color: number, alpha: number, stroke: number, width=1) {
    const p=toPixel(h),g=this.grid!;const points=Array.from({length:6},(_,i)=>{const a=(i*60-30)*Math.PI/180;return new Phaser.Math.Vector2(p.x+HEX_SIZE*Math.cos(a),p.y+HEX_SIZE*Math.sin(a));});
    if(alpha>0)g.fillStyle(color,alpha).fillPoints(points,true);
    g.lineStyle(width,stroke,.78).strokePoints(points,true);
  }
  private drawGrid() {
    if(!this.grid||!this.battle)return;this.grid.clear();const b=this.battle,u=active(b);
    const aimed=this.plan?.hex??this.hover;
    const canAct=u?.side==='party'&&!b.result&&!this.busy;
    const reachableHexes=canAct&&this.selected==='move'?movement(b,u!):undefined;
    const affected=canAct&&aimed&&this.selected!=='move'&&legalAim(b,u!,this.selected,aimed)?new Set(shape(b,u!,this.selected,aimed).map(key)):new Set<string>();
    for(const h of cells()){
      const id=key(h);let color=0x182824,alpha=.12,stroke=0x938e68,width=1;
      if(b.water.has(id)){color=0x357e98;alpha=.46;stroke=0x87bbc9;}
      if(b.grounding?.plates.some(p=>equal(p,h))){color=b.grounding.open?0x4b9787:0x3b7bba;alpha=.48;stroke=0x9be8e4;width=3;}
      if(b.vents.has(id)){color=0xb95025;alpha=.4;stroke=0xffbf6a;}
      if(b.obstacles.has(id)){color=0x17201e;alpha=.45;stroke=0x686753;}
      else if(reachableHexes?.has(id)&&!equal(h,u!.hex)){color=0x568d99;alpha=.21;stroke=0x91b5b2;}
      if(affected.has(id)){color=ABILITIES[this.selected as AbilityId]?.heal?0x72b89c:0xe5a742;alpha=.45;stroke=0xf2c778;width=2;}
      if(u&&equal(h,u.hex)){color=0xf0d38c;alpha=.19;stroke=0xf2e0ac;width=3;}
      if(aimed&&equal(h,aimed)){stroke=0xffffff;width=2;}
      this.hexPolygon(h,color,alpha,stroke,width);
      if(b.grounding?.plates.some(p=>equal(p,h))){const p=toPixel(h);this.grid.lineStyle(3,0xb7f0df,1);this.grid.lineBetween(p.x,p.y-9,p.x,p.y+7);for(let row=0;row<3;row++)this.grid.lineBetween(p.x-10+row*3,p.y+7+row*5,p.x+10-row*3,p.y+7+row*5);}
      if(b.water.has(id)){const p=toPixel(h);this.grid.lineStyle(2,0xa1d4dc,.9);this.grid.lineBetween(p.x-12,p.y+10,p.x+2,p.y+10);this.grid.lineBetween(p.x-2,p.y+14,p.x+12,p.y+14);}
      if(b.vents.has(id)){const p=toPixel(h);this.grid.lineStyle(2,0xffc07a,.95);for(const dx of [-10,0,10]){this.grid.lineBetween(p.x+dx-3,p.y+16,p.x+dx+3,p.y+8);this.grid.lineBetween(p.x+dx+3,p.y+8,p.x+dx,p.y+3);}}
    }
    if(this.plan?.action==='move'&&u){const path=movement(b,u).get(key(this.plan.hex))?.path??[];this.grid.lineStyle(3,0xe8d6a2,.9);this.grid.beginPath();const start=toPixel(u.hex);this.grid.moveTo(start.x,start.y);for(const h of path){const p=toPixel(h);this.grid.lineTo(p.x,p.y);}this.grid.strokePath();}
  }
  private drawInitiative() {
    const b=this.battle!,u=active(b),esc=this.ui.escape;
    this.ui.initiative.innerHTML=`<span class="round">Round ${b.round}${b.grounding?(b.grounding.open?' · shield released':' · earth both blue plates'):b.vents.size?' · vents after last turn':''}</span>${b.queue.map(id=>b.units.find(v=>v.id===id)!).filter(v=>v.hp>0).map(v=>`<span class="turn ${v.id===u?.id?'active':''}">${esc(v.name)}${v.waited?' · waiting':''}</span>`).join('')}`;
  }
  private renderBattleControls() {
    const b=this.battle;if(!b)return;const u=active(b);if(!u)return;
    const player=u.side==='party'&&!b.result&&!this.busy,esc=this.ui.escape;
    const character=CHARACTERS[(u.appearance??u.kind) as keyof typeof CHARACTERS];
    this.ui.controls.innerHTML=`<div class="identity"><img src="${art(character?.portrait??u.kind)}" alt=""/><div><h2>${esc(u.name)}</h2><div class="role">${roles[u.kind]}</div><div class="vitals">HP ${u.hp} / ${u.maxHp}<div class="bar"><span style="width:${u.hp/u.maxHp*100}%"></span></div>Focus ${u.focus} / 6<div class="bar focus"><span style="width:${u.focus/6*100}%"></span></div></div></div></div><div class="command-panel"><div class="actions"></div><p class="hint" id="battle-hint"></p><div class="confirmation" id="confirmation"></div></div><div class="battle-log" aria-label="Battle log">${b.log.slice(-4).map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
    const actions=this.ui.controls.querySelector<HTMLElement>('.actions')!;
    this.ui.actionRow(actions,[{label:'Move',key:'1',action:()=>this.selectAction('move'),disabled:!player||u.moved,selected:this.selected==='move'},...u.abilities.map((id,i)=>({label:ABILITIES[id].name,key:String(i+2),action:()=>this.selectAction(id),disabled:!player||u.focus<ABILITIES[id].cost||(id==='bandage'&&!b.bandages),selected:this.selected===id,title:ABILITIES[id].description})),
      {label:'Defend',key:'F',disabled:!player,action:()=>this.doDefend()},{label:'Wait',key:'W',disabled:!player||u.waited||u.moved,action:()=>this.doWait()}]);
    this.ui.status.textContent=player?'Select an action, then a hex. Confirm to commit. Move once, then act.':'Enemy turn · watch the initiative order';
    this.updatePreview();
  }
  private updatePreview() {
    if(this.mode!=='battle'||!this.battle)return;const b=this.battle,u=active(b);if(!u)return;
    const hint=document.getElementById('battle-hint'),confirm=document.getElementById('confirmation');if(!hint||!confirm)return;
    const aimed=this.plan?.hex??this.hover;const player=u.side==='party'&&!this.busy;
    if(!player){hint.textContent=`${u.name} is choosing a position.`;confirm.innerHTML='';return;}
    hint.textContent=b.grounding&&!b.grounding.open?'Keeper shielded: occupy both blue earth plates together. The shield stays down afterward.':this.selected==='move'?(b.vents.size?'Orange vents: 6 HP to ground units at round end. Move to an unmarked hex before the last turn. Blue hexes are reachable.':b.water.size?'Blue hexes are reachable. Water marked with waves costs 2 movement; dry ground costs 1. Crows fly over it.':'Blue hexes are reachable. Moving leaves your action available. Wait is available before moving.'):ABILITIES[this.selected].description;
    confirm.innerHTML='';
    if(!aimed)return;
    if(this.selected==='move'){
      const visit=movement(b,u).get(key(aimed));
      if(visit&&visit.path.length){if(this.plan)confirm.append(this.ui.button({label:`Confirm move · ${visit.path.length} hexes${b.water.size?` · ${visit.cost}/${u.movement} movement`:''}`,action:()=>this.commitPlan()}));else{const text=document.createElement('span');text.className='prediction';text.textContent=`${visit.path.length} hexes${b.water.size?` · ${visit.cost}/${u.movement} movement`:''} · click to select`;confirm.append(text);}}
    }else if(legalAim(b,u,this.selected,aimed)){
      const hits=targets(b,u,this.selected,aimed);const description=hits.map(v=>`${v.name}: ${ABILITIES[this.selected as AbilityId].heal?'+':'−'}${damage(u,v,this.selected as AbilityId)} HP${v.side===u.side&&!ABILITIES[this.selected as AbilityId].heal?' (ALLY)':''}`).join(' · ')||'Empty ground';
      if(this.plan)confirm.append(this.ui.button({label:ABILITIES[this.selected].heal?'Confirm healing':'Confirm attack',action:()=>this.commitPlan()}));
      const text=document.createElement('span');text.className='prediction';text.textContent=description;confirm.append(text);
    }else{const text=document.createElement('span');text.className='prediction';text.textContent='Out of range, blocked, or not a valid target.';confirm.append(text);}
  }
  private selectAction(action: Action) { if(this.busy||active(this.battle!)?.side!=='party')return;this.selected=action;this.plan=undefined;this.drawGrid();this.renderBattleControls(); }
  private chooseHex(hex: Hex) {
    const b=this.battle!,u=active(b);if(!u||u.side!=='party'||this.busy||b.result)return;
    this.hover=hex;this.battleCursor=hex;
    const valid=this.selected==='move'?!!movement(b,u).get(key(hex))?.path.length:legalAim(b,u,this.selected,hex);
    if(valid){this.plan={action:this.selected,hex};this.audio.effect('click');}
    else{this.plan=undefined;this.ui.toast(this.selected==='move'?'That hex is not reachable this turn.':'That target is out of range or blocked.');}
    this.drawGrid();this.updatePreview();
  }
  private commitPlan() {
    const b=this.battle!,u=active(b),plan=this.plan;if(!u||!plan||this.busy)return;
    const before=new Map(b.units.map(v=>[v.id,{hex:{...v.hex},hp:v.hp}]));
    const success=plan.action==='move'?!!move(b,u,plan.hex):cast(b,u,plan.action,plan.hex);
    if(!success){this.plan=undefined;this.drawGrid();this.renderBattleControls();return;}
    this.plan=undefined;this.hover=undefined;this.audio.effect(plan.action,this.state.location.map);
    if(plan.action==='move')this.selected=u.abilities[0];else this.selected='move';
    this.animateBattle(before);
  }
  private doDefend() {if(this.busy||active(this.battle!)?.side!=='party')return;defend(this.battle!);this.audio.effect('defend');this.plan=undefined;this.hover=undefined;this.selected='move';this.animateBattle(new Map());}
  private doWait() {if(this.busy||active(this.battle!)?.side!=='party')return;if(wait(this.battle!)){this.plan=undefined;this.hover=undefined;this.selected='move';this.animateBattle(new Map());}}
  private animateBattle(before: Map<string,{hex:Hex;hp:number}>) {
    this.busy=true;this.drawBattle();this.renderBattleControls();
    for(const u of this.battle!.units){const old=before.get(u.id),image=this.actorImages.get(u.id);if(!old||!image)continue;
      if(!equal(old.hex,u.hex)){const from=toPixel(old.hex),to=toPixel(u.hex);image.setPosition(from.x,from.y+9);this.tweens.add({targets:image,x:to.x,y:to.y+9,duration:280,ease:'Sine.easeInOut'});}
      if(old.hp!==u.hp){const p=toPixel(u.hex),amount=u.hp-old.hp;const text=this.label(p.x,p.y-50,`${amount>0?'+':''}${amount}`,amount>0?'#9bab6c':'#f4c77a').setDepth(10);this.tweens.add({targets:text,y:p.y-80,alpha:0,duration:900,onComplete:()=>text.destroy()});}
    }
    this.time.delayedCall(380,()=>{this.busy=false;if(this.battle?.result)this.battleEnded();else{this.drawGrid();this.renderBattleControls();this.scheduleEnemy();}});
  }
  private scheduleEnemy() {
    const b=this.battle;if(!b||b.result||active(b)?.side!=='enemy')return;
    this.busy=true;
    this.time.delayedCall(480,()=>{
      if(this.mode!=='battle'||this.battle!==b)return;
      if(this.ui.modalOpen){this.busy=false;this.scheduleEnemy();return;}
      const before=new Map(b.units.map(v=>[v.id,{hex:{...v.hex},hp:v.hp}]));const action=enemyTurn(b);if(action)this.audio.effect(action,this.state.location.map);this.animateBattle(before);
    });
  }
  private battleEnded() {
    const b=this.battle!;
    if(b.result==='defeat'){
      this.ui.panel('The line can wait', '<p>The party retreats to a safe spot. Your progress before this encounter is preserved.</p><p>Try separating them, using cover, or waiting for the enemy to approach.</p>',[
        {label:'Retry battle',action:()=>{restoreParty(this.state);this.startBattle(b.encounter);}},
        {label:'Return to Larkspur',action:()=>{restoreParty(this.state);this.ui.clearPanel();this.changeMap('station',21,19);}},
      ]);return;
    }
    const previousLevel=level(this.state);awardVictory(b,this.state);const e=ENCOUNTERS[b.encounter];
    if(e.journal)remember(this.state,e.journal);
    this.audio.setMode(this.state.location.map);this.audio.effect('win');
    this.ui.panel('The line is clear',`<p>${e.xp} experience · ${e.coins} marks</p><p>${level(this.state)>previousLevel?`The party reaches level ${level(this.state)}. Maximum HP and attack power increase.`:'The party catches its breath. Some HP and all focus are restored.'}</p>${e.victory?`<p>${this.ui.escape(e.victory)}</p>`:''}`,[{label:'Continue the journey',action:()=>{this.ui.clearPanel();this.showWorld();this.autosave();resumeChapter(this.storyHost());}}]);
  }

  journal() {
    if(this.mode==='title'){this.help();return;}
    const s=this.state,esc=this.ui.escape;
    const entries=s.journal.map(id=>JOURNAL[id]).filter(Boolean);
    this.ui.showModal('Travel journal',`<article><h3>Next stop</h3><p>${esc(objective(s))}</p><p>Level ${level(s)} · ${s.xp} experience · ${s.coins} marks · ${s.bandages} bandages</p><p>Equipment: ${s.gear.length?s.gear.map(id=>id==='brass-lantern'?'Brass lantern':'Reinforced work coats').join(', '):'Station issue'}</p></article>${entries.map(e=>`<article><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></article>`).join('')}`);
  }
  help() {
    this.ui.showModal('On the line', '<article><h3>Exploration</h3><p>WASD or arrow keys move. Click a destination to walk there, or click a person or marked object to approach and interact. E / Enter / Space interacts. J opens the journal. Escape closes menus.</p><p>The supply clerk at Larkspur provides free rest and sells supplies and equipment. Gold marks indicate people and places worth investigating.</p></article><article><h3>Hex battles</h3><p>Each character acts in initiative order. Move once, then act or defend. Select an action, choose a hex, read the preview, and confirm. You can change your target before committing.</p><p>Lantern burst affects the target and its six neighbors, including allies. Steam lance fires along one of six hex axes, hits every unit on that line, and stops at the first rock. Rocks also block ranged shots and the aim of a blast.</p><p>Melee provokes one retaliation per defender per round. Defend reduces damage by 40% until the next turn. Wait delays your turn to the end of the round and is available before moving. Focus restores by one each turn; defend restores one extra.</p><p>At the eastern pass, orange steam outlets deal six HP to ground units at the end of each round. Keep clear of those lanes and the captain’s sun flare. Mend and Bandage use Confirm healing.</p><p>On narrow screens, use the battlefield view arrows to pan without shrinking the board. Keyboard: 1 Move; 2–5 abilities; arrows move the target cursor; Enter selects and confirms; F Defend; W Wait. Bandages are shared. Defeat offers a retry.</p></article><article><h3>Keeping the journey</h3><p>Autosaves occur at story checkpoints and before battles. Manual saves and JSON export/import are in the Save menu. Browser saves belong to this browser and site; exported saves can move between devices.</p><p>Chapter One ends at a saved Iron Coast departure. Later chapters are planned. The previous story’s saves remain available to export, but cannot be loaded into this campaign.</p></article>');
  }
  async toggleSound() { try {this.ui.sound(await this.audio.toggle());}catch{this.ui.toast('Audio could not start in this browser.');} }
  private autosave() {
    const snapshot=structuredClone(this.state);
    checkpoint(snapshot);this.latestSave=snapshot;
    this.serialSave=this.serialSave.catch(()=>{}).then(()=>save('autosave',snapshot)).catch(()=>{this.ui.toast('Unable to save in this browser. Export your progress from the Save menu.');});
  }
  async saves() {
    if(this.mode==='battle'){this.ui.toast('The checkpoint before this battle is saved. Manual saves are available after the battle.');return;}
    try{
      const records=await listSaves();const esc=this.ui.escape;
      this.ui.showModal('Keep your place',`<p>Autosave records story checkpoints. Manual slots stay available when you begin a new journey.</p><div id="save-slots">${['autosave','slot-1','slot-2','slot-3'].map(slot=>{const r=records.find(v=>v.slot===slot);return`<div class="save-row"><div><h3>${slot==='autosave'?'Autosave':`Slot ${slot.slice(-1)}`}</h3><p>${r?(r.compatible?`${esc(MAPS[r.state.location.map].name)} · Lv ${level(r.state)} · ${new Date(r.savedAt).toLocaleString()}`:'Previous story or incompatible save · export available'):'Empty'}</p></div><div class="slot-buttons" data-slot="${slot}"></div></div>`;}).join('')}</div><p style="margin-top:18px">Export a JSON file to carry your journey to another browser or keep a backup.</p>`,[
        {label:'Export current save',disabled:this.mode==='title',action:()=>exportSave(this.state)},
        {label:'Import save file',action:()=>{const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{try{const file=input.files?.[0];if(!file)return;if(file.size>2_000_000)throw new Error('That save file is too large.');this.loadState(decodeSave(await file.text()));}catch(error){this.ui.toast(error instanceof Error?error.message:'Unable to import the save.');}};input.click();}},
      ]);
      for(const slot of ['autosave','slot-1','slot-2','slot-3']){
        const target=this.ui.modal.querySelector(`[data-slot="${slot}"]`)!;const record=records.find(v=>v.slot===slot);
        if(slot!=='autosave')target.append(this.ui.button({label:'Save',disabled:this.mode==='title',action:async()=>{
          const write=async()=>{await save(slot,this.state);this.ui.toast('Place saved.');await this.saves();};
          if(record)this.ui.showModal('Replace this save?',`<p>Replace ${slot.replace('-',' ')} with your current journey?</p>`,[{label:'Replace save',action:()=>{void write().catch(()=>this.ui.toast('Save failed. You can export a file instead.'));}}]);
          else void write().catch(()=>this.ui.toast('Save failed. You can export a file instead.'));
        }}));
        if(record&&!record.compatible)target.append(this.ui.button({label:'Export previous save',action:()=>exportSave(record.state)}));
        target.append(this.ui.button({label:'Load',disabled:!record?.compatible,action:()=>{
          if(!record?.compatible)return;
          if(this.mode==='title')this.loadState(record.state);
          else this.ui.showModal('Restore this journey?', '<p>Progress since your last checkpoint will be replaced by this save.</p>',[{label:'Load save',action:()=>this.loadState(record.state)}]);
        }}));
      }
    }catch{this.ui.showModal('Save files','<p>Browser storage is unavailable. You can still export and import JSON saves.</p>',[{label:'Export current save',disabled:this.mode==='title',action:()=>exportSave(this.state)},{label:'Close',action:()=>this.ui.closeModal()}]);}
  }
  private shop() {
    const s=this.state;
    this.ui.showModal('Iona’s supplies',`<div class="shopkeeper"><img src="${art(CHARACTERS.iona.portrait)}" alt="Iona"/><p>${s.flags.raidSeen?"“I’ll keep the station open. You find Tomas. And eat something before you go.”":"“Your brother’s home. You can stop checking every train now.”"}</p></div><p>${s.coins} marks · ${s.bandages} bandages</p><div id="shop-items"></div>`,[{label:'Rest · free',action:()=>{restoreParty(s);this.ui.closeModal();this.showWorld();this.autosave();this.ui.toast('Party HP and focus restored.');}}]);
    const items=[{id:'bandage',name:'Bandage',description:'Restore 24 HP during battle.',cost:8},{id:'brass-lantern',name:'Brass lantern',description:'Nell deals 3 more damage.',cost:30},{id:'work-coats',name:'Reinforced work coats',description:'Both heroes take 1 less damage.',cost:25}];
    const target=this.ui.modal.querySelector('#shop-items')!;
    for(const item of items){const row=document.createElement('div');row.className='equipment-row';row.innerHTML=`<div><h3>${item.name}</h3><p>${item.description}</p></div>`;row.append(this.ui.button({label:s.gear.includes(item.id)?'Equipped':`${item.cost} marks`,disabled:s.coins<item.cost||s.gear.includes(item.id)||(item.id==='bandage'&&s.bandages>=999),action:()=>{s.coins-=item.cost;if(item.id==='bandage')s.bandages++;else s.gear.push(item.id);this.autosave();this.renderWorldControls();this.shop();}}));target.append(row);}
  }
}
