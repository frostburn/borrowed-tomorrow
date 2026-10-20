import Phaser from 'phaser';
import { facingAsset, PLAYABLE_ACTORS } from '../content/actors';
import { CHAPTER_TWO_AVAILABLE,CHAPTER_THREE_AVAILABLE,CHAPTER_FOUR_AVAILABLE } from '../content/chapters';
import { CHARACTERS, NPC_SPRITES } from '../content/characters';
import type { StoryHost } from '../content/chapter-one/interactions';
import { interactChapter, resumeChapter, CHAPTER, JOURNAL, objective } from '../content/story';
import type { Dialogue } from '../content/dialogue';
import { HEIGHT, MAPS, TILE, WIDTH, arrival, mapSize, restorePoint, visibleObjects, walkable, worldPath, type MapObject } from '../content/maps';
import { ABILITIES, ENCOUNTERS, active, awardVictory, cast, createBattle, damage, defend, enemyTurn, legalAim, move, movement, pushDestination, shape, targets, tauntTarget, wait, type AbilityId, type Battle } from '../rules/combat';
import { HEX_SIZE, cells, equal, fromPixel, inside, key, neighbors, offset, toPixel, type Hex } from '../rules/hex';
import { beginChapterTwo, beginChapterThree, beginChapterFour, partyLeader, decodeSave, level, maxHp, newGame, remember, restoreParty, type GameState, type HeroId, type MapId } from '../rules/state';
import { Audio } from './audio';
import { Cutscene } from './cutscene';
import { drawTileMap } from './tilemap';
import { TILESET, TILE_PAGES } from '../content/tilemaps';
import { CHAPTER_ONE_BATTLES } from '../content/chapter-one/maps';
import { checkpoint, exportSave, listSaves, save } from './saves';
import { art, UI } from './ui';
import { ITEMS, ownedCopies } from '../rules/inventory';
import { SUPPLIES, buySupply, canBuy } from '../rules/supplies';
import { openInventory } from './inventory';
import { bitmapText } from './pixel-font';
import { worldView, narrowScreen } from './resolution';

type Action = AbilityId | 'move';
type Plan = { action: Action; hex: Hex };
const textures = [...PLAYABLE_ACTORS,'master','clerk','hound','crow','inspector','guardian','rock',...NPC_SPRITES];
const roles: Record<string, string> = { nell: 'Porter', orrin: 'Mechanic', kit: 'Courier', petra:'Knight', celia: 'Physician', hound: 'Melee · retaliates', crow: 'Ranged · cover blocks shots', guardian: 'Steam lance · line AoE', inspector: 'Signal flare · blast AoE' };

export class Adventure extends Phaser.Scene {
  state: GameState = newGame();
  battle?: Battle;
  readonly audio = new Audio();
  private ui!: UI;
  private layer?: Phaser.GameObjects.Container;
  private cinematic?:Cutscene;
  private grid?: Phaser.GameObjects.Graphics;
  private player?: Phaser.GameObjects.Image;
  private followers: Phaser.GameObjects.Image[] = [];
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
  private practiceReturn?: () => void;
  private testingTools?: typeof import('../dev/testing-tools').renderTestingTools;
  private testingBattle?: Battle;

  constructor(private readonly practiceReady?: (scene: Adventure, ui: UI) => void, private readonly practiceActors: readonly string[] = []) { super('adventure'); }
  attach(ui: UI) { this.ui = ui; }
  preload() {
    for (const name of new Set([...textures,...(import.meta.env.DEV ? this.practiceActors : [])])) this.load.image(name, art(name));
    for(const page of TILE_PAGES)this.load.spritesheet(page.name,`${import.meta.env.BASE_URL}${page.url}`,{frameWidth:TILESET.tilewidth,frameHeight:TILESET.tileheight});
    this.load.on('loaderror', () => this.ui.toast('An art asset could not load. Try refreshing the page.'));
  }
  create() {
    this.arrowKeys = this.input.keyboard!.createCursorKeys();
    this.letters = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on('keydown', (e: KeyboardEvent) => this.keydown(e));
    if(import.meta.env.DEV&&this.practiceReady)this.practiceReady(this,this.ui);
    else{
      this.showTitle();
      this.ui.status.textContent = 'WASD / arrows · E interact · click to walk · J journal · Esc menu';
      void listSaves().then(records => { const current = records[0]; if (current) this.latestSave = current.state; if (this.mode === 'title') this.titlePanel(); }).catch(() => this.ui.toast('Browser saves are unavailable. You can still export your progress.'));
      window.addEventListener('pagehide', () => { if (this.mode === 'world') this.autosave(); });
    }
    window.borrowedTomorrow = { inspect: () => ({ mode: this.mode, moving:this.moving||this.path.length>0||!!this.pendingObject, cinematic:this.cinematic?.script.id??null, state: structuredClone(this.state), battle: this.battle ? { ...structuredClone(this.battle), obstacles: [...this.battle.obstacles], water:[...this.battle.water],vents:[...this.battle.vents] } : null, view: { width:this.cameras.main.width,height:this.cameras.main.height,scrollX:this.cameras.main.scrollX,scrollY:this.cameras.main.scrollY } }) };
    if(import.meta.env.DEV)void import('../dev/testing-tools').then(({renderTestingTools})=>{
      if(!this.sys.isActive())return;
      this.testingTools=renderTestingTools;
      if(this.mode==='battle')this.renderBattleControls();
    });
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
  private revealHex(hex:Hex,margin=48){
    if(!narrowScreen())return;
    const camera=this.cameras.main,p=toPixel(hex);
    if(p.x<camera.scrollX+margin||p.x>camera.scrollX+camera.width-margin)camera.setScroll(Phaser.Math.Clamp(Math.round(p.x-camera.width/2),0,WIDTH-camera.width),0);
  }
  get animating(){return this.moving||!!this.cinematic?.animating||this.tweens.getTweens().length>0;}
  private label(x:number,y:number,text:string,color:string,scale=3,outline=false){
    const padding=outline?1:0,canvas=document.createElement('canvas');canvas.width=text.length*6*scale+padding*2;canvas.height=9*scale+padding*2;
    const ctx=canvas.getContext('2d')!;
    if(outline)for(const dx of [-1,0,1])for(const dy of [-1,0,1])if(dx||dy)bitmapText(ctx,text,padding+dx,scale+padding+dy,'#080f19',scale);
    bitmapText(ctx,text,padding,scale+padding,color,scale);
    const name=`label-${this.labelId++}`;this.textures.addCanvas(name,canvas);
    const image=this.add.image(x,y,name).setOrigin(.5);
    image.once('destroy',()=>this.textures.remove(name));return image;
  }
  private get blocked() { return this.ui.panelOpen || this.ui.modalOpen; }
  private clearLayer() {
    this.cinematic?.close();this.cinematic=undefined;
    this.path = []; this.pendingObject = undefined; this.near = undefined; this.moving = false;
    this.tweens.killAll(); this.layer?.destroy(true); this.grid = undefined; this.player = undefined; this.followers = [];this.actorImages.clear();
    this.layer = this.add.container(0,0);
  }
  private background(name: MapId, y=0, x=0) {
    const tiles=this.mode==='battle'?(CHAPTER_ONE_BATTLES[this.battle!.encounter]??MAPS[name].tiles):MAPS[name].tiles;
    if(tiles)drawTileMap(this,this.layer!,tiles,this.state,x,this.mode==='battle'?0:y);
    else this.layer!.add(this.add.image(x,y,`map-${name}`,'__BASE').setOrigin(0).setDepth(-1000));
  }
  private sortWorld(){
    if(this.mode!=='world')return;
    for(const child of this.layer?.list??[])if(child instanceof Phaser.GameObjects.Image&&child.getData('world-actor'))child.setDepth(child.y);
    this.layer?.sort('depth');
  }
  private showTitle() {
    (document.getElementById('inventory-button') as HTMLButtonElement).disabled=true;
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
      ...(import.meta.env.DEV ? [{label:'Workshop',action:()=>{const url=new URL(location.href);url.searchParams.set('dev','workshop');location.assign(url);}}] : []),
    ]);
  }
  private begin() {
    this.state = newGame(); this.state.location=arrival('station','start'); this.ui.clearPanel(); this.showWorld();
    this.autosave();resumeChapter(this.storyHost());
  }
  private async ensureRegion(map: MapId) {
    if(MAPS[map].tiles){
      if(TILE_PAGES.some(page=>!this.textures.exists(page.name)))throw new Error('The Chapter One tiles could not load. Your checkpoint is intact.');
      return;
    }
    const texture = `map-${map}`;
    if (this.textures.exists(texture)) return;
    if (!this.regionLoad) {
      this.regionLoad = new Promise<void>((resolve, reject) => {
        this.load.once('complete', () => {
          if (this.textures.exists(texture)) {
            const source = this.textures.get(texture).getSourceImage(), size = mapSize(MAPS[map]);
            if (source.width === size.width && source.height === size.height) { resolve(); return; }
            this.textures.remove(texture);
          }
          reject(new Error(`${MAPS[map].name} could not load. Your checkpoint is intact; try again.`));
        });
        this.load.image(texture, `${import.meta.env.BASE_URL}art/${MAPS[map].art??map}.webp`);
        this.load.start();
      }).finally(() => { this.regionLoad = undefined; });
    }
    await this.regionLoad;
  }
  private async beginNextChapter() {
    const third=this.state.chapter==='chapter-two',fourth=this.state.chapter==='chapter-three';
    if(this.busy || (fourth?!CHAPTER_FOUR_AVAILABLE:third?!CHAPTER_THREE_AVAILABLE:!CHAPTER_TWO_AVAILABLE) || !['chapter-one','chapter-two','chapter-three'].includes(this.state.chapter) || !this.state.boundary)return;
    this.busy=true;this.ui.toast(fourth?'Loading the railway refuge…':third?'Loading the capital…':'Loading the Iron Coast…');
    try{
      const maps=fourth?['refuge','breakwater','sanctuary'] as const:third?['northglass','relayhall','conduit'] as const:['coast','infirmary','cinderbank'] as const;
      for(const map of maps)await this.ensureRegion(map);
      if(!(fourth?beginChapterFour(this.state):third?beginChapterThree(this.state):beginChapterTwo(this.state)))return;
      this.ui.clearPanel();this.showWorld();this.autosave();resumeChapter(this.storyHost());
    }catch(error){this.ui.toast(error instanceof Error?error.message:'Unable to load the chapter. Your departure is intact.');}
    finally{this.busy=false;}
  }
  private async loadState(state: GameState) {
    if(this.busy)return;this.busy=true;
    try {
      const candidate = decodeSave(JSON.stringify(state));
      if (candidate.chapter === 'chapter-four' && !CHAPTER_FOUR_AVAILABLE) throw new Error('Chapter Four artwork is not installed. Your saved journey is intact.');
      if (candidate.chapter === 'chapter-three' && !CHAPTER_THREE_AVAILABLE) throw new Error('Chapter Three artwork is not installed. Your saved journey is intact.');
      if (candidate.chapter === 'chapter-two' && !CHAPTER_TWO_AVAILABLE) throw new Error('Chapter Two artwork is not installed in this build. Your saved journey is intact.');
      const floor=restorePoint(MAPS[candidate.location.map],candidate.location,candidate);
      if(!floor)throw new Error('This save is inside an obstacle.');
      candidate.location={map:candidate.location.map,...floor};
      if(candidate.chapter==='chapter-four')for(const map of ['refuge','breakwater','sanctuary'] as const)await this.ensureRegion(map);
      else if(candidate.chapter==='chapter-three')for(const map of ['northglass','relayhall','conduit'] as const)await this.ensureRegion(map);
      else await this.ensureRegion(candidate.location.map);
      this.state = candidate;
      this.battle = undefined; this.ui.closeModal(); this.ui.clearPanel(); this.showWorld(); this.autosave();
      if(this.state.boundary)this.boundaryPanel();
      else resumeChapter(this.storyHost());
      this.ui.toast('Journey restored.');
    } catch (error) { this.ui.toast(error instanceof Error ? error.message : 'Unable to load the save.'); }
    finally{this.busy=false;}
  }
  private showWorld() {
    (document.getElementById('inventory-button') as HTMLButtonElement).disabled=false;
    this.mode = 'world';this.ui.battlePan.hidden=true; this.battle = undefined; this.hover = undefined; this.plan = undefined; this.busy = false;
    const view=worldView();this.scale.setGameSize(view.width,view.height);this.cameras.main.stopFollow();this.cameras.main.setScroll(0,0);
    this.clearLayer(); const map = MAPS[this.state.location.map]; this.background(map.id); this.audio.setMode((map.id==='station'&&this.state.flags.raidSeen)||(map.id==='rillbridge'&&!this.state.flags.villageFreed)?'tunnel':map.id);
    for (const object of visibleObjects(map, this.state)) {
      const x = (object.x + .5) * TILE, y = (object.y + .5) * TILE;
      if (object.sprite&&(!object.spriteHiddenFlag||!this.state.flags[object.spriteHiddenFlag])) this.layer!.add(this.add.image(x,y + 7,object.sprite).setOrigin(.5,.85).setData('world-actor',true));
      if (!object.doneFlag || !this.state.flags[object.doneFlag]) {
        const marker = this.label(x,y-(object.sprite?39:9),object.sign?'◇':'!','#f4c77a',3,true);
        this.layer!.add(marker.setDepth(20000));
      }
    }
    const p = this.state.location;
    const leader=partyLeader(this.state);
    if(this.face.replace(/-(left|right|back)$/,'')!==leader)this.face=leader;
    for (const [index, id] of this.state.activeParty.filter(id => id !== leader).entries()) {
      const x = walkable(map,p.x-index-1,p.y,this.state) ? p.x-index-1 : p.x;
      const follower = this.add.image((x+.5)*TILE,(p.y+.5)*TILE+7,id).setOrigin(.5,.85).setData('hero',id).setData('world-actor',true);
      this.followers.push(follower); this.layer!.add(follower);
    }
    this.player = this.add.image((p.x+.5)*TILE,(p.y+.5)*TILE+7,this.face).setOrigin(.5,.85).setData('world-actor',true); this.layer!.add(this.player);
    this.sortWorld();
    const size=mapSize(map);this.cameras.main.setBounds(0,0,size.width,size.height);this.cameras.main.centerOn(this.player.x,this.player.y);this.cameras.main.startFollow(this.player,true,1,1);
    this.ui.location(map.name);
    this.ui.initiative.textContent = this.state.chapter==='chapter-four'? (this.state.flags.chapterFourComplete?'The counterattack has a route. Tomas keeps the railway messages moving.':map.id==='refuge'?'The passengers are safe. The ward is a place to come back to.':map.id==='breakwater'?(this.state.flags.worksGateWon?'The machines are down. Open the south evacuation gate.':'Orrin and Kit · clear a path through the return-gate machines.'):this.state.flags.sanctuaryWardenWon?'The valley is moving. The old record is open.':this.state.flags.partyReunited?'The warden is repeating the emperor’s order.':this.state.flags.sealLead?'Celia · examine the lower seal on the great door.':'Petra and Celia · keep the patients safe beneath the arch.')
      : this.state.chapter==='chapter-three'&&this.state.flags.chapterThreeComplete?'Tomas is aboard. The medical train has escaped.'
      : map.id==='northglass'&&this.state.flags.emperorMerged?'The capital is rising. Reach the medical engine.'
      : map.id==='northglass'&&this.state.flags.petraJoined?'The works entrance is open. Tomas is inside.'
      : map.id==='relayhall'&&this.state.flags.tomasRescued?'Tomas is safe. The intake console is below.'
      : map.id==='conduit'&&this.state.flags.conduitGuardWon?'The regulator is down. Close the feeds.'
      : map.id === 'station' && this.state.flags.raidSeen ? 'The festival is over. Iona is keeping the station open.'
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
    this.ui.controls.innerHTML = `<div class="world-party" data-size="${s.activeParty.length}">${s.activeParty.map(id=>s.party.find(h=>h.id===id)!).map(h => `<div class="world-hero"><img src="${art(h.id)}" alt=""/><div><strong>${CHARACTERS[h.id].name}</strong><small>HP ${h.hp}/${maxHp(h.id,s)} · Lv ${level(s)}</small></div></div>`).join('')}</div><div class="world-objective"><h3>${esc(this.near?.label ?? 'Next stop')}</h3><p>${esc(objective(s))}</p></div><div class="world-actions"><div class="dpad"></div><div class="interact-action"></div></div>`;
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
    this.sortWorld();
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
    const leader=partyLeader(this.state);
    this.face = facingAsset(leader,dx,dy);
    this.player!.setTexture(this.face); p.x=x; p.y=y;this.audio.effect('move',p.map);
    this.tweens.add({ targets:this.player, x:(x+.5)*TILE, y:(y+.5)*TILE+7, duration:130, ease:'Linear', onComplete:()=>{ this.moving=false; } });
    let following = previous;
    for (const follower of this.followers) {
      const old = { x: follower.x, y: follower.y }, id = follower.getData('hero') as HeroId;
      follower.setTexture(facingAsset(id,following.x-old.x,following.y-old.y));
      this.tweens.add({ targets:follower, x:following.x, y:following.y, duration:130, ease:'Linear' });
      following = old;
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
    if (e.key === 'Escape') { if (this.ui.modalOpen) this.ui.closeModal(); else if(import.meta.env.DEV&&this.practiceReady)this.practiceReturn?.(); else if(this.cinematic){this.ui.skipDialogue();} else if (this.plan) { this.plan=undefined; this.renderBattleControls(); this.drawGrid(); } else if (!this.ui.dialogueOpen) this.help(); return; }
    if (this.ui.modalOpen) return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (this.ui.dialogueOpen && ['Enter',' ','e','E'].includes(e.key)) { e.preventDefault(); this.ui.advanceDialogue(); return; }
    if (this.blocked || this.busy || e.repeat) return;
    if (e.key.toLowerCase()==='i') { this.inventory(); return; }
    if (e.key.toLowerCase()==='j') { if(import.meta.env.DEV&&this.practiceReady)this.practiceReturn?.();else this.journal(); return; }
    if (this.mode==='world' && ['e','E','Enter',' '].includes(e.key)) { const near=this.closestObject(); if(near)this.interact(near); }
    if (this.mode==='battle' && active(this.battle!)?.side==='party') {
      const u=active(this.battle!)!;
      if (e.key==='1') this.selectAction('move');
      else if (/^[2-9]$/.test(e.key)) { const id=u.abilities[Number(e.key)-2];if(id)this.selectAction(id); }
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
    interactChapter(this.storyHost(), object.id);
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
    if(this.state.chapter==='chapter-four'){
      this.ui.panel('Chapter Four complete','<div class="chapter-name">Next: Chapter Five · Taking the World Back</div><p>The party is reunited. The sanctuary’s arrest has ended, and the three anchors are marked.</p><p>Tomas is safe at the railway refuge, organizing messages between the freed communities. Nell has chosen to lead the counterattack.</p><p>The western airfield is your next destination. Chapter Five is not yet playable; your party, equipment and departure are saved.</p>',[
        {label:'Return to the refuge',action:()=>{this.ui.clearPanel();this.renderWorldControls();}},
        {label:'Export departure save',action:()=>exportSave(this.state)},
      ]);return;
    }
    if(this.state.chapter==='chapter-three'){
      this.ui.panel('Chapter Three complete','<div class="chapter-name">Next: Chapter Four · The Broken World</div><p>Tomas is safe aboard the medical train. The rescued passengers escaped with you. The extraction feeds are shut.</p><p>The emperor has entered the vessel. The capital hangs above the valley, and time is failing beyond it.</p>'+(!CHAPTER_FOUR_AVAILABLE?'<p>Chapter Four artwork is not installed. Your departure is saved.</p>':''),[
        ...(CHAPTER_FOUR_AVAILABLE?[{label:'Begin Chapter Four',action:()=>{void this.beginNextChapter();}}]:[]),
        {label:'Return to the platform',action:()=>{this.ui.clearPanel();this.renderWorldControls();}},
        {label:'Export departure save',action:()=>exportSave(this.state)},
      ]);return;
    }
    if (this.state.chapter === 'chapter-two') {
      this.ui.panel('Chapter Two complete', '<div class="chapter-name">Next: Chapter Three · Beneath the Palace</div><p>The rescued prisoners and Cinderbank families are traveling with Nell, Orrin and Kit.</p><p>Tomas is alive at the palace engine works. Your medical-train clearance opens a route to him.</p>'+(!CHAPTER_THREE_AVAILABLE?'<p>Chapter Three artwork is not installed. Your capital departure is saved.</p>':''), [
        ...(CHAPTER_THREE_AVAILABLE?[{label:'Begin Chapter Three',action:()=>{void this.beginNextChapter();}}]:[]),
        { label: 'Return to the siding', action: () => { this.ui.clearPanel(); this.renderWorldControls(); } },
        { label: 'Export departure save', action: () => exportSave(this.state) },
      ]); return;
    }
    this.ui.panel('Chapter One complete', '<div class="chapter-name">Next: Chapter Two · Prison Trains</div><p>Rillbridge is awake. Alban has lost the crossing. Tomas is at the prison-train exchange on the Iron Coast.</p><p>Nell and Orrin have their own engine and a way east.</p>'+(!CHAPTER_TWO_AVAILABLE?'<p>Chapter Two artwork is not installed in this build. Your departure is saved.</p>':''), [
      ...(CHAPTER_TWO_AVAILABLE ? [{ label: 'Begin Chapter Two', action: () => { void this.beginNextChapter(); } }] : []),
      { label: 'Return to the pass', action: () => { this.ui.clearPanel(); this.renderWorldControls(); } },
      { label: 'Export departure save', action: () => exportSave(this.state) },
    ]);
  }

  private startBattle(id: string) {
    this.ui.clearPanel();this.path=[];this.autosave();this.battle=createBattle(id,this.state);this.mode='battle';this.selected='move';this.plan=undefined;this.hover=undefined;
    this.enterBattle(id);
  }
  /** A standalone harness: no campaign saves, flags, loot or experience. */
  previewBattle(battle: Battle, returnToWorkshop: () => void) {
    if(!import.meta.env.DEV||!this.practiceReady)throw new Error('A development practice host is required.');
    this.practiceReturn=returnToWorkshop;this.ui.closeModal();this.clearLayer();this.ui.clearPanel();
    this.battle=battle;this.mode='battle';this.busy=false;this.selected='move';this.plan=undefined;this.hover=undefined;
    this.enterBattle(battle.encounter);
  }
  closePreview() {
    if(!import.meta.env.DEV||!this.practiceReady)return;
    this.mode='title';this.battle=undefined;this.busy=false;this.clearLayer();this.ui.closeModal();this.ui.clearPanel();this.ui.battlePan.hidden=true;
  }
  private enterBattle(id: string) {
    (document.getElementById('inventory-button') as HTMLButtonElement).disabled=true;
    if(import.meta.env.DEV)this.testingBattle=structuredClone(this.battle!);
    const view=worldView();this.scale.setGameSize(view.width,view.height);this.ui.battlePan.hidden=!narrowScreen();this.shownTurn=undefined;this.cameras.main.stopFollow();this.cameras.main.setBounds(0,0,WIDTH,480);this.cameras.main.setScroll(0,0);this.clearLayer();this.audio.setMode(this.state.chapter==='chapter-four'?(id==='sanctuary-warden'?'four-warden':'four-battle'):this.state.chapter==='chapter-three'?'switching':id==='captain'||id==='coast-recapture'?'inspector':'battle');this.drawBattle();this.renderBattleControls();this.ui.location(ENCOUNTERS[id].name);this.ui.canvas.focus();this.scheduleEnemy();
  }
  private drawBattle() {
    this.layer?.destroy(true);this.layer=this.add.container(0,0);this.actorImages.clear();
    const backdrop=ENCOUNTERS[this.battle!.encounter].backdrop??{map:'yard' as const,y:0};
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
        if(u.guard||u.dazzledAttacks||tauntTarget(b,u))this.layer.add(this.label(p.x,p.y+44,[u.guard?`Guard ${u.guard}`:'',u.dazzledAttacks?`Dazzled ${u.dazzledAttacks}`:'',tauntTarget(b,u)?`Taunted: ${tauntTarget(b,u)!.name}`:''].filter(Boolean).join(' · '),'#87a3a2',1));
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
    if(canAct&&aimed&&this.selected!=='move'&&['push','shove'].includes(ABILITIES[this.selected].effect??'')&&legalAim(b,u!,this.selected,aimed)){
      for(const target of targets(b,u!,this.selected,aimed)){const destination=target.hp>damage(u!,target,this.selected)?pushDestination(b,u!,target):undefined;if(destination){this.hexPolygon(destination,0x557179,.3,0x9bab6c,2);}}
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
    this.ui.controls.innerHTML=`<div class="identity"><img src="${art(character?.portrait??u.kind)}" alt=""/><div><h2>${esc(u.name)}</h2><div class="role">${[u.role??roles[u.kind],u.level?`Lv ${u.level}`:'',u.guard?`Guard ${u.guard}`:'',u.dazzledAttacks?`Dazzled ${u.dazzledAttacks}`:'',tauntTarget(b,u)?`Taunted: ${esc(tauntTarget(b,u)!.name)}`:''].filter(Boolean).join(' · ')}</div><div class="vitals">HP ${u.hp} / ${u.maxHp}<div class="bar"><span style="width:${u.hp/u.maxHp*100}%"></span></div>Focus ${u.focus} / 6<div class="bar focus"><span style="width:${u.focus/6*100}%"></span></div></div></div></div><div class="command-panel"><div class="actions"></div><p class="hint" id="battle-hint"></p><div class="confirmation" id="confirmation"></div></div><div class="battle-log" aria-label="Battle log">${b.log.slice(-4).map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
    const actions=this.ui.controls.querySelector<HTMLElement>('.actions')!;
    if(import.meta.env.DEV)this.testingTools?.(this.ui,this.ui.controls.querySelector('.command-panel')!,{
      current:()=>this.mode==='battle'&&!this.ui.modalOpen&&!this.ui.panelOpen?this.battle:undefined,
      initial:()=>this.testingBattle,
      apply:battle=>{
        this.tweens.killAll();this.battle=battle;this.busy=false;this.plan=undefined;this.hover=undefined;this.selected='move';
        this.drawBattle();this.renderBattleControls();
        if(battle.result)this.battleEnded();else this.scheduleEnemy();
      },
    });
    this.ui.actionRow(actions,[{label:'Move',key:'1',action:()=>this.selectAction('move'),disabled:!player||u.moved,selected:this.selected==='move'},...u.abilities.map((id,i)=>({label:ABILITIES[id].name+(ABILITIES[id].bonus?' · Extra':''),key:String(i+2),action:()=>this.selectAction(id),disabled:!player||u.focus<ABILITIES[id].cost||!!(ABILITIES[id].bonus&&u.bonusUsed)||(id==='bandage'&&!b.bandages),selected:this.selected===id,title:ABILITIES[id].description})),
      {label:'Defend',key:'F',disabled:!player,action:()=>this.doDefend()},{label:'Wait',key:'W',disabled:!player||u.waited||u.moved||u.bonusUsed,action:()=>this.doWait()}]);
    this.ui.status.textContent=player?(u.bonusUsed?'Shield bash used. Move if available, then take your main action.':this.selected!=='move'&&ABILITIES[this.selected].range===0?'Review affected hexes, then confirm. Move once, then act.':'Select an action, then a hex. Confirm to commit. Move once, then act.'):'Enemy turn · watch the initiative order';
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
      const ability=ABILITIES[this.selected],hits=targets(b,u,this.selected,aimed);
      const description=ability.effect==='taunt'?`All ${hits.length} enemies target ${u.name} until ${u.name}’s next turn.`:hits.map(v=>ability.effect==='shove'?`${v.name}: ${pushDestination(b,u,v)?'push one hex':'push blocked'} · no damage`:ability.effect==='weaken'?`${v.name}: next 3 attacks −40%`:ability.effect==='guard'?`${v.name}: +${damage(u,v,this.selected as AbilityId)} guard`:ability.effect==='focus'?`${v.name}: +${damage(u,v,this.selected as AbilityId)} focus`:`${v.name}: ${ability.heal?'+':'−'}${damage(u,v,this.selected as AbilityId)} HP${v.side===u.side&&!ability.heal?' (ALLY)':''}${ability.effect==='push'&&v.hp>damage(u,v,this.selected as AbilityId)?pushDestination(b,u,v)?' · pushed one hex':' · push blocked':''}`).join(' · ')||'Empty ground';
      if(this.plan)confirm.append(this.ui.button({label:ability.heal?'Confirm healing':ability.effect==='guard'||ability.effect==='weaken'||ability.effect==='focus'||ability.effect==='taunt'||ability.effect==='shove'?'Confirm ability':'Confirm attack',action:()=>this.commitPlan()}));
      const text=document.createElement('span');text.className='prediction';text.textContent=description;confirm.append(text);
    }else{const text=document.createElement('span');text.className='prediction';text.textContent='Out of range, blocked, or not a valid target.';confirm.append(text);}
  }
  private selectAction(action: Action) {
    const u=active(this.battle!);if(this.busy||u?.side!=='party'||(action!=='move'&&ABILITIES[action].bonus&&u.bonusUsed))return;
    this.selected=action;this.plan=undefined;
    if(action!=='move'&&ABILITIES[action].range===0&&legalAim(this.battle!,u,action,u.hex)){
      this.plan={action,hex:{...u.hex}};this.battleCursor={...u.hex};
      this.revealHex(u.hex,HEX_SIZE*5); // Include adjacent hexes and knockback landings.
    }
    this.drawGrid();this.renderBattleControls();
  }
  private chooseHex(hex: Hex) {
    const b=this.battle!,u=active(b);if(!u||u.side!=='party'||this.busy||b.result)return;
    if(this.selected!=='move'&&ABILITIES[this.selected].range===0)return;
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
    this.plan=undefined;this.hover=undefined;this.audio.effect(plan.action==='move'?'move':ABILITIES[plan.action].sound??plan.action as import('./synth').Effect,this.state.location.map);
    if(plan.action==='move'||active(b)?.id===u.id&&u.moved)this.selected=u.abilities[0];else this.selected='move';
    this.animateBattle(before);
  }
  private doDefend() {if(this.busy||active(this.battle!)?.side!=='party')return;defend(this.battle!);this.audio.effect('defend');this.plan=undefined;this.hover=undefined;this.selected='move';this.animateBattle(new Map());}
  private doWait() {if(this.busy||active(this.battle!)?.side!=='party')return;if(wait(this.battle!)){this.plan=undefined;this.hover=undefined;this.selected='move';this.animateBattle(new Map());}}
  private animateBattle(before: Map<string,{hex:Hex;hp:number}>) {
    const battle=this.battle;
    this.busy=true;this.drawBattle();this.renderBattleControls();
    for(const u of this.battle!.units){const old=before.get(u.id),image=this.actorImages.get(u.id);if(!old||!image)continue;
      if(!equal(old.hex,u.hex)){const from=toPixel(old.hex),to=toPixel(u.hex);image.setPosition(from.x,from.y+9);this.tweens.add({targets:image,x:to.x,y:to.y+9,duration:280,ease:'Sine.easeInOut'});}
      if(old.hp!==u.hp){const p=toPixel(u.hex),amount=u.hp-old.hp;const text=this.label(p.x,p.y-50,`${amount>0?'+':''}${amount}`,amount>0?'#9bab6c':'#f4c77a').setDepth(10);this.layer!.add(text);this.tweens.add({targets:text,y:p.y-80,alpha:0,duration:900,onComplete:()=>text.destroy()});}
    }
    this.time.delayedCall(380,()=>{if(this.battle!==battle||this.mode!=='battle')return;this.busy=false;if(this.battle?.result)this.battleEnded();else{this.drawGrid();this.renderBattleControls();this.scheduleEnemy();}});
  }
  private scheduleEnemy() {
    const b=this.battle;if(!b||b.result||active(b)?.side!=='enemy')return;
    this.busy=true;
    this.time.delayedCall(480,()=>{
      if(this.mode!=='battle'||this.battle!==b)return;
      if(this.ui.modalOpen){this.busy=false;this.scheduleEnemy();return;}
      const before=new Map(b.units.map(v=>[v.id,{hex:{...v.hex},hp:v.hp}]));const action=enemyTurn(b);if(action)this.audio.effect(action==='defend'?'defend':ABILITIES[action].sound??action as import('./synth').Effect,this.state.location.map);this.animateBattle(before);
    });
  }
  private battleEnded() {
    const b=this.battle!;
    if(import.meta.env.DEV&&this.practiceReady){
      this.ui.panel(b.result==='victory'?'Practice complete':'Practice defeated','',[
        {label:'Back to workshop',action:()=>this.practiceReturn?.()},
      ]);return;
    }
    if(b.result==='defeat'){
      this.ui.panel('The line can wait', '<p>The party retreats to a safe spot. Your progress before this encounter is preserved.</p><p>Try separating them, using cover, or waiting for the enemy to approach.</p>',[
        {label:'Retry battle',action:()=>{restoreParty(this.state);this.startBattle(b.encounter);}},
        {label:this.state.chapter!=='chapter-one'?'Retreat to the checkpoint':'Return to Larkspur',action:()=>{restoreParty(this.state);this.ui.clearPanel();if(this.state.chapter!=='chapter-one'){this.showWorld();this.autosave();}else{const p=arrival('station','retreat');void this.changeMap(p.map,p.x,p.y);}}},
      ]);return;
    }
    const previousLevel=level(this.state);awardVictory(b,this.state);const e=ENCOUNTERS[b.encounter];
    (document.getElementById('inventory-button') as HTMLButtonElement).disabled=false;
    if(e.journal)remember(this.state,e.journal);
    this.audio.setMode(this.state.location.map);this.audio.effect('win');
    this.ui.panel('The line is clear',`<p>${e.xp} experience · ${e.coins} marks</p><p>${level(this.state)>previousLevel?`The party reaches level ${level(this.state)}. Maximum HP and attack power increase.`:'The party catches its breath. Some HP and all focus are restored.'}</p>${e.victory?`<p>${this.ui.escape(e.victory)}</p>`:''}`,[{label:'Continue the journey',action:()=>{this.ui.clearPanel();this.showWorld();this.autosave();resumeChapter(this.storyHost());}}]);
  }

  inventory() {
    if(this.practiceReady||this.cinematic||this.busy||!(this.mode==='world'||this.mode==='battle'&&this.battle?.result==='victory'))return;
    this.path=[];this.pendingObject=undefined;
    openInventory(this.ui,this.state,()=>{this.autosave();if(this.mode==='world')this.renderWorldControls();});
  }

  journal() {
    if(this.mode==='title'){this.help();return;}
    const s=this.state,esc=this.ui.escape;
    const entries=s.journal.map(id=>JOURNAL[id]).filter(Boolean);
    this.ui.showModal('Travel journal',`<article><h3>Next stop</h3><p>${esc(objective(s))}</p><p>Level ${level(s)} · ${s.xp} experience · ${s.coins} marks · ${s.bandages} bandages</p><p>Equipment: ${s.party.map(h=>`${CHARACTERS[h.id].name}: ${Object.values(s.inventory.characters[h.id]).filter(id=>id!==null).map(id=>ITEMS[id].name).join(', ')||'Station issue'}`).join(' · ')}</p></article>${entries.map(e=>`<article><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></article>`).join('')}`);
  }
  help() {
    this.ui.showModal('On the line', '<article><h3>Exploration</h3><p>WASD or arrow keys move. Click a destination to walk there, or click a person or marked object to approach and interact. E / Enter / Space interacts. J opens the journal. I opens Equipment. Escape closes menus.</p><p>The supply clerk at Larkspur provides free rest and sells supplies and equipment. Bought and found equipment stays in the shared bag until you equip it on a character. Gold marks indicate people and places worth investigating.</p></article><article><h3>Hex battles</h3><p>Each character acts in initiative order. Move once, then act or defend. Select an action, choose a hex, read the preview, and confirm. You can change your target before committing.</p><p>Lantern burst affects the target and its six neighbors, including allies. Steam lance fires along one of six hex axes, hits every unit on that line, and stops at the first rock. Rocks also block ranged shots and the aim of a blast.</p><p>Melee provokes one retaliation per defender per round. Defend reduces damage by 40% until the next turn. Wait delays your turn to the end of the round and is available before moving. Focus restores by one each turn; defend restores one extra.</p><p>At the eastern pass, orange steam outlets deal six HP to ground units at the end of each round. Keep clear of those lanes and the captain’s sun flare. Mend and Bandage use Confirm healing.</p><p>On narrow screens, use the battlefield view arrows to pan without shrinking the board. Keyboard: 1 Move; 2–9 abilities; arrows move the target cursor; Enter selects and confirms; F Defend; W Wait. Bandages are shared. Defeat offers a retry.</p></article><article><h3>Keeping the journey</h3><p>Autosaves occur at story checkpoints and before battles. Manual saves and JSON export/import are in the Save menu. Browser saves belong to this browser and site; exported saves can move between devices.</p><p>Chapter One continues into Chapter Two at the saved Iron Coast departure. Equipment lets you choose up to three active fighters; reserves keep their gear and gain experience. Chapter Two continues at the saved capital departure. Chapter Three rescues Tomas and ends at the saved Broken World departure. Chapter Four follows Orrin, Petra and Celia before reuniting the party. Their local groups lead temporarily; Equipment retains everyone’s loadouts. Reunion restores your earlier formation, and the chapter ends at the saved anchor counterattack departure. Only current-format saves can be loaded.</p></article>');
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
      this.ui.showModal('Keep your place',`<p>Autosave records story checkpoints. Manual slots stay available when you begin a new journey.</p><div id="save-slots">${['autosave','slot-1','slot-2','slot-3'].map(slot=>{const r=records.find(v=>v.slot===slot);return`<div class="save-row"><div><h3>${slot==='autosave'?'Autosave':`Slot ${slot.slice(-1)}`}</h3><p>${r?`${esc(MAPS[r.state.location.map].name)} · Lv ${level(r.state)} · ${new Date(r.savedAt).toLocaleString()}`:'Empty'}</p></div><div class="slot-buttons" data-slot="${slot}"></div></div>`;}).join('')}</div><p style="margin-top:18px">Export a JSON file to carry your journey to another browser or keep a backup.</p>`,[
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
        target.append(this.ui.button({label:'Load',disabled:!record,action:()=>{
          if(!record)return;
          if(this.mode==='title')this.loadState(record.state);
          else this.ui.showModal('Restore this journey?', '<p>Progress since your last checkpoint will be replaced by this save.</p>',[{label:'Load save',action:()=>this.loadState(record.state)}]);
        }}));
      }
    }catch{this.ui.showModal('Save files','<p>Browser storage is unavailable. You can still export and import JSON saves.</p>',[{label:'Export current save',disabled:this.mode==='title',action:()=>exportSave(this.state)},{label:'Close',action:()=>this.ui.closeModal()}]);}
  }
  private shop() {
    const s=this.state;
    this.ui.showModal('Iona’s supplies',`<div class="shopkeeper"><img src="${art(CHARACTERS.iona.portrait)}" alt="Iona"/><p>${s.flags.raidSeen?"“I’ll keep the station open. You find Tomas. And eat something before you go.”":"“Your brother’s home. You can stop checking every train now.”"}</p></div><p>${s.coins} marks · ${s.bandages} bandages</p><div id="shop-items"></div>`,[{label:'Rest · free',action:()=>{restoreParty(s);this.ui.closeModal();this.showWorld();this.autosave();this.ui.toast('Party HP and focus restored.');}}]);
    const target=this.ui.modal.querySelector('#shop-items')!;
    for(const supply of SUPPLIES){
      const id=supply.id,item=id==='bandage'?undefined:ITEMS[id];
      if(item&&!item.heroes.some(h=>s.party.some(p=>p.id===h)))continue;
      const name=item?.name??'Bandage',description=item?.description??'Restore 24 HP during battle.';
      const owned=id==='bandage'?s.bandages:ownedCopies(s.inventory,id);
      const row=document.createElement('div');row.className='equipment-row';row.setAttribute('role','group');row.setAttribute('aria-label',name);
      row.innerHTML=`<div><h3>${name}</h3><p>${description}</p><small>${owned} owned${id==='bandage'?'':` · ${s.inventory.bag[id]??0} in bag`}</small></div>`;
      row.append(this.ui.button({label:item?.slot==='fitting'&&owned?'Owned':`Buy · ${supply.cost} marks`,disabled:!canBuy(s,id),action:()=>{
        if(!buySupply(s,id))return;
        this.autosave();this.renderWorldControls();this.shop();if(item)this.ui.toast(`${name} added to the bag.`);
      }}));target.append(row);
    }
  }
}
