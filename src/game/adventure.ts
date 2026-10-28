import {BossLighting} from './boss-lighting';
import {focusCapacity} from '../rules/improvements';
import {icon} from './item-icons';
import {itemIcon} from '../content/ui-art';
import {resourceSnapshot,resourceGains,rewardList} from './rewards';
import {PeopleMotion} from './people-motion';
import {PERSON_MOTION_PAGES} from '../content/people-motion';
import {abilityFor,earnedSkillPoints} from '../rules/skills';
import {openSkills,availableSkillPoints} from './skills';
import {teamStatus,battleAbilities,daybreakProtection} from '../rules/combat-tactics';
import {drawBattleFixtures} from './battle-fixtures';
import type {installSoundPreferences} from './sound-preferences';
import {gridEdges,type HexOutline} from './hex-grid';
import {MAP_ROOMS,TRACK_ROOMS} from '../content/rooms';
import { alignCameraScroll } from './raster-camera';
import { WorldMechanisms } from './world-mechanisms';
import { MapLife } from './map-life';
import { BoardingPresentation } from './boarding-presentation';
import {benefactorPresentation} from './benefactor-presentation';
import { imperialPresentation } from './imperial-presentation';
import { winterDragonPresentation } from './winter-dragon-presentation';
import { serpentPresentation } from './sun-serpent-presentation';
import { RegionAssets } from './region-assets';
import { flagshipPresentation } from './flagship-presentation';
import { wardPresentation } from './ward-presentation';
import { furnacePresentation } from './furnace-presentation';
import Phaser from 'phaser';
import { facingAsset, PLAYABLE_ACTORS, worldActorScaleY } from '../content/actors';
import { COMPANION_IDS, type CompanionId } from '../rules/party';
import { MOTION_PAGES, animatedHero, walkingHero, ATTACK_CONTACT_MS, ATTACK_DURATION_MS } from '../content/actor-motion';
import { ActorAnimator } from './actor-motion';
import { battleEffect,summonArrival,teamWindup,fixtureBurst,valveTurn } from './battle-effects';
import {TEAM_ANIMATION,type TeamSource} from './battle-team-effects';
import {teamSolo} from '../rules/abilities';
import { CHAPTERS,nextChapter,mapsForRestore } from '../content/chapters';
import { INTERACTION_MARKERS,interactionKind,interactionMarker } from '../content/interaction-markers';
import { CHARACTERS, NPC_SPRITES } from '../content/characters';
import { CIVILIAN_SPRITES } from '../content/civilians';
import { ENEMY_VARIANT_ACTORS } from '../content/enemy-variants';
import type { StoryHost } from '../content/story-host';
import { interactChapter, resumeChapter, CHAPTER, JOURNAL, objective } from '../content/story';
import type { Dialogue } from '../content/dialogue';
import { HEIGHT, MAPS, TILE, WIDTH, arrival, mapSize, restorePoint, visibleObjects, visiblePeople, walkable, worldPath, type MapObject } from '../content/maps';
import { ABILITIES, damagingAbility, active, awardVictory, cast, createBattle, damage, fixtureDamage, defend, endTurn, enemyTurn, legalAim, move, movement, movementOnly, pushDestination, shape, targets, tauntTarget, wait, type AbilityId, type Battle, type Unit } from '../rules/combat';
import {rallyArea,rallyBonus,rallyRemaining,rallySources,rallyReason} from '../rules/rally';
import {bossDirectHint} from '../rules/boss-direct';
import { ENCOUNTERS } from '../content/encounters';
import { HEX_SIZE, hexVertices, cells, diagonalStart, equal, fromPixel, inside, key, neighbors, offset, toPixel, type Hex } from '../rules/hex';
import { partyLeader, level, maxHp, newGame, remember, restoreParty, type GameState, type HeroId, type MapId } from '../rules/state';
import { decodeSave } from '../rules/save';
import { Audio } from './audio';
import { Cutscene } from './cutscene';
import { drawTileMap } from './tilemap';
import { CHAPTER_ONE_SCENE_ASSETS } from '../content/scene-art';
import { BATTLE_MAPS } from '../content/battle-maps';
import { checkpoint, exportSave, listSaves, save } from './saves';
import { art, UI } from './ui';
import { ITEMS } from '../rules/inventory';
import { type ShopId } from '../rules/supplies';
import { CONSUMABLES, isConsumable } from '../rules/consumables';
import { battleItemCount } from '../rules/combat';
import { openShop } from './shop';
import { openInventory } from './inventory';
import { bitmapText } from './pixel-font';
import { PixelLabel } from './pixel-label';
import { worldView, narrowScreen } from './resolution';
import { occupiedHexes } from '../rules/footprint';
import type { BattlePresentation } from './battle-presentation';
import { conduitPresentation } from './conduit-presentation';
import { WorldLighting } from './world-lighting';

type Action = AbilityId | 'move';
type Plan = { action: Action; hex: Hex };
type BattleSnapshot = Map<string,{hex:Hex;hp:number;active?:boolean}>;
interface BattleMotion { actorId:string;aim:Hex;ability?:AbilityId;partnerId?:string;path?:Hex[];affected?:Hex[];retaliations?:string[] }
const textures = [...PLAYABLE_ACTORS,'master','clerk','herald','glasswing','hound','crow','inspector','guardian','rock',...NPC_SPRITES,...CIVILIAN_SPRITES,...ENEMY_VARIANT_ACTORS];
const roles: Record<string, string> = {herald:'Severing light · straight beam',glasswing:'Flying · glass splinters', nell: 'Porter', orrin: 'Mechanic', kit: 'Courier', petra:'Knight', celia: 'Physician', hound: 'Melee · retaliates', crow: 'Ranged · cover blocks shots', guardian: 'Steam lance · line AoE', inspector: 'Signal flare · blast AoE', knight:'Shield bash · Taunt · Saber sweep' };

export class Adventure extends Phaser.Scene {
  state: GameState = newGame();
  battle?: Battle;
  readonly audio = new Audio();
  soundPreferences?:ReturnType<typeof installSoundPreferences>;
  private ui!: UI;
  private layer?: Phaser.GameObjects.Container;
  private cinematic?:Cutscene;
  private grid?: Phaser.GameObjects.Graphics;
  private player?: Phaser.GameObjects.Image;
  private followers: Phaser.GameObjects.Image[] = [];
  private actorImages = new Map<string, Phaser.GameObjects.Image>();
  private motion=new ActorAnimator(this);
  private peopleMotion=new PeopleMotion();
  private lighting=new WorldLighting(this);
  private bossLighting?:BossLighting;
  private battleFaces=new Map<string,string>();
  private boarding=new BoardingPresentation();
  private enemyAttack?:{battle:Battle;actorId:string;ability:AbilityId;cells:Hex[];impact:boolean};
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
  private handledKeys=new WeakSet<KeyboardEvent>();
  private near?: MapObject;
  private lastSecond = 0;
  private latestSave?: GameState;
  private labelId=0;
  private shownTurn?:string;
  private regionAssets=new RegionAssets(this);
  private serialSave: Promise<void> = Promise.resolve();
  private practiceReturn?: () => void;
  private testingTools?: typeof import('../dev/testing-tools').renderTestingTools;
  private testingBattle?: Battle;
  private battlePresentation?:BattlePresentation;
  private get battleDefinition(){return this.battlePresentation?.encounter??ENCOUNTERS[this.battle!.encounter];}

  constructor(private readonly practiceReady?: (scene: Adventure, ui: UI) => void, private readonly practiceActors: readonly string[] = [], private readonly previewAssets:readonly {key:string;url:string}[] = []) { super('adventure'); }
  attach(ui: UI) { this.ui = ui; }
  preload() {
    for (const name of new Set([...textures,...(import.meta.env.DEV ? this.practiceActors : [])])) this.load.image(name, art(name));
    if(import.meta.env.DEV)for(const asset of this.previewAssets)this.load.image(asset.key,asset.url);
    for(const asset of CHAPTER_ONE_SCENE_ASSETS)this.load.image(asset.key,`${import.meta.env.BASE_URL}${asset.url}`);
    for(const page of [...MOTION_PAGES,...PERSON_MOTION_PAGES,{key:'hound-arrival',asset:'animation/hound-arrival'}])this.load.spritesheet(page.key,art(page.asset),{frameWidth:80,frameHeight:80});
    this.load.on('loaderror', () => this.ui.toast('An art asset could not load. Try refreshing the page.'));
  }
  create() {
    alignCameraScroll(this.cameras.main);
    this.regionAssets.prepareVectors([...textures,...[...MOTION_PAGES,...PERSON_MOTION_PAGES,{key:'hound-arrival',asset:'animation/hound-arrival'}].map(page=>page.key),...CHAPTER_ONE_SCENE_ASSETS.map(asset=>asset.key)]);
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
    window.borrowedTomorrow = { inspect: () => ({ mode: this.mode, busy:this.busy, moving:this.moving||this.path.length>0||!!this.pendingObject, cinematic:this.cinematic?.script.id??null,ambient:this.mapLife?.inspect(),audioRoom:this.audio.room, actors:(this.layer?.list??[]).filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image&&!!child.getData('hero')&&child.visible).map(image=>({hero:String(image.getData('hero')),texture:image.texture.key,frame:String(image.frame.name),motion:String(image.getData('actor-motion')??'idle'),x:image.x,y:image.y})), people:(this.layer?.list??[]).filter((child):child is Phaser.GameObjects.Image=>child instanceof Phaser.GameObjects.Image&&!!child.getData('person')&&child.visible).map(image=>({id:String(image.getData('person')),motion:String(image.getData('person-motion')??'idle'),frame:String(image.frame.name),texture:image.texture.key,alpha:image.alpha,x:image.x,y:image.y,depth:image.depth,scale:image.scaleX,originX:image.originX,originY:image.originY,sourceWidth:image.frame.width,sourceHeight:image.frame.height,filter:image.frame.source.scaleMode})), state: structuredClone(this.state), battle: this.battle ? { ...structuredClone(this.battle), obstacles: [...this.battle.obstacles], water:[...this.battle.water],vents:[...this.battle.vents] } : null, view: { width:this.cameras.main.width,height:this.cameras.main.height,scrollX:this.cameras.main.scrollX,scrollY:this.cameras.main.scrollY,roundPixels:this.cameras.main.roundPixels } }) };
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
    else if(this.mode==='world'&&this.player){camera.centerOn(this.player.x,this.player.y);camera.startFollow(this.player,false,1,1);}
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
  private mechanisms?:WorldMechanisms;
  private mapLife?:MapLife;
  get animating(){
    const preview=this.mode==='battle'&&this.battle?this.battlePresentation?.animating?.(this.battle):false;
    return (this.mode==='battle'&&this.boarding.active)||!!this.mechanisms?.animating||this.moving||this.motion.active||!!this.cinematic?.animating||this.tweens.getTweens().length>0||!!preview||!!this.bossLighting?.animating;
  }
  get sceneryChanged(){const people=this.peopleMotion.takeFrame(),scenery=this.mapLife?.takeFrame()??false;return people||scenery;}
  private label(x:number,y:number,text:string,color:string,scale=3,outline=false){
    const pixelAligned=this.mode==='battle',padding=outline?1:0,canvas=document.createElement('canvas');
    canvas.width=text.length*(scale===1?8:6*scale)+padding*2;
    // The compact face is five rows of 2px stems, with 2px leading/trailing space.
    canvas.height=(pixelAligned&&scale===1?14:9*scale)+padding*2;
    const ctx=canvas.getContext('2d')!;
    if(outline)for(const dx of [-1,0,1])for(const dy of [-1,0,1])if(dx||dy)bitmapText(ctx,text,padding+dx,scale+padding+dy,'#080f19',scale);
    bitmapText(ctx,text,padding,scale+padding,color,scale);
    const name=`label-${this.labelId++}`;this.textures.addCanvas(name,canvas);
    const image=pixelAligned?this.add.existing(new PixelLabel(this,x,y,name)):this.add.image(x,y,name);
    image.setOrigin(.5);
    if(pixelAligned)image.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    image.once('destroy',()=>this.textures.remove(name));return image;
  }
  private get blocked() { return this.ui.panelOpen || this.ui.modalOpen; }
  private clearLayer() {
    this.mechanisms?.close();this.mechanisms=undefined;
    this.mapLife?.close();this.mapLife=undefined;
    this.boarding.clear();
    this.ui.canvas.removeAttribute('aria-description');
    this.lighting.clear();this.bossLighting=undefined;
    this.motion.clear();this.peopleMotion.clear();
    this.enemyAttack=undefined;
    this.cinematic?.close();this.cinematic=undefined;
    this.path = []; this.pendingObject = undefined; this.near = undefined; this.moving = false;
    this.tweens.killAll(); this.layer?.destroy(true); this.grid = undefined; this.player = undefined; this.followers = [];this.actorImages.clear();
    this.layer = this.add.container(0,0);
  }
  private background(name: MapId, y=0, x=0) {
    const tiles=this.mode==='battle'?(BATTLE_MAPS[this.battle!.encounter]??MAPS[name].tiles):MAPS[name].tiles;
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
    this.mode = 'title';this.ui.battlePan.hidden=true; const view=worldView();this.scale.setGameSize(view.width,view.height);this.cameras.main.stopFollow();this.cameras.main.setBounds(0,0,WIDTH,HEIGHT);this.cameras.main.setScroll(Math.floor((WIDTH-view.width)/2),72);this.clearLayer();this.background('station');this.audio.setRoom(MAP_ROOMS.station);
    this.mapLife=new MapLife(this,this.layer!,MAPS.station,this.state);
    this.ui.location(CHAPTER.title); this.ui.initiative.textContent = 'Chapter One · A journey beyond the empire';
    this.ui.controls.innerHTML = '<div class="world-objective"><h3>A journey begins at home</h3><p>Explore with the keyboard or click a destination. Battles take place on a hex grid.</p></div>';
    this.titlePanel();
  }
  private titlePanel() {
    this.ui.panel('Borrowed Tomorrow', '<div class="chapter-name">Chapter One · Leaving Home</div>', [
      ...(!this.soundPreferences?.known?[{ label: 'Start adventure with sound', action: () => {void this.soundPreferences?.enable();this.requestNewGame();} }]:[]),
      { label: 'Begin Chapter One', action: () => this.requestNewGame() },
      { label: 'Continue', disabled: !this.latestSave, action: () => { if (this.latestSave) this.loadState(this.latestSave); } },
      { label: 'Save files', action: () => this.saves() },
      ...(import.meta.env.DEV ? [{label:'Workshop',action:()=>{const url=new URL(location.href);url.searchParams.set('dev','workshop');location.assign(url);}}] : []),
    ]);
    this.ui.sceneLayer.querySelector('.scene-panel')!.classList.add('title-panel');
    if(import.meta.env.DEV){
      const group=document.createElement('section');group.className='canonical-saves';group.setAttribute('aria-labelledby','canonical-saves-heading');
      group.innerHTML='<h3 id="canonical-saves-heading">Canonical saves</h3><div class="canonical-actions"></div>';
      this.ui.sceneLayer.querySelector('.scene-panel')!.append(group);
      const target=group.querySelector<HTMLElement>('.canonical-actions')!;
      this.ui.actionRow(target,[
        ...(['Chapter Seven','final refuge'] as const).map(destination=>({label:`Begin ${destination} (canonical)`,action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(saves=>this.loadState(destination==='Chapter Seven'?saves.chapterSevenStart():saves.chapterSevenRefugeStart()));};
          if(this.latestSave)this.ui.showModal(`Start the canonical ${destination} save?`,'<p>This replaces the autosave with the recovered party in the Benefactor’s domain. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);else start();
        }})),
        {label:'Begin Chapter Two (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterTwoStart})=>this.loadState(chapterTwoStart()));};
          if(this.latestSave)this.ui.showModal('Start the canonical Chapter Two save?','<p>This replaces the autosave with Nell and Orrin at the Iron Coast. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);
          else start();
        }},
        {label:'Begin Chapter Three (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterThreeStart})=>this.loadState(chapterThreeStart()));};
          if(this.latestSave)this.ui.showModal('Start the canonical Chapter Three save?','<p>This replaces the autosave with Nell, Orrin and Kit at the capital medical siding. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);
          else start();
        }},
        {label:'Begin Chapter Four (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterFourStart})=>this.loadState(chapterFourStart()));};
          if(this.latestSave)this.ui.showModal('Start the canonical Chapter Four save?','<p>This replaces the autosave with the rescued passengers and four travelers at the railway refuge. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);
          else start();
        }},
        {label:'Begin Chapter Five (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterFiveStart})=>this.loadState(chapterFiveStart()));};
          if(this.latestSave)this.ui.showModal('Start the canonical Chapter Five save?','<p>This replaces the autosave with the five travelers at the western airfield. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);else start();
        }},
        {label:'Begin Chapter Six (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterSixStart})=>this.loadState(chapterSixStart()));};
          if(this.latestSave)this.ui.showModal('Start the canonical Chapter Six save?','<p>This replaces the autosave with the flagship and hunters defeated. Nell is ill; Kit, Orrin and Petra approach the capital. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);else start();
        }},
        ...(['Skeld','winter dragon','capital','final preparations'] as const).map(destination=>({label:`Begin ${destination} (canonical)`,action:()=>{
          this.ui.showModal(`Begin ${destination}?`,`<p>Choose Nell’s authored condition. This replaces the autosave; manual slots remain available. ${destination==='capital'||destination==='final preparations'?'Both pact seals have been released.':'Namar has not been visited.'}</p>`,[
            {label:'Nell ill · Kit, Orrin and Petra',action:()=>{void import('../dev/canonical-saves').then(saves=>this.loadState(({'Skeld':saves.chapterSixNorthStart,'winter dragon':saves.chapterSixDragonStart,'capital':saves.chapterSixCapitalStart,'final preparations':saves.chapterSixFinaleStart}[destination])(false)));}},
            {label:'Nell recovered · Nell, Kit and Celia',action:()=>{void import('../dev/canonical-saves').then(saves=>this.loadState(({'Skeld':saves.chapterSixNorthStart,'winter dragon':saves.chapterSixDragonStart,'capital':saves.chapterSixCapitalStart,'final preparations':saves.chapterSixFinaleStart}[destination])(true)));}},
          ]);
        }})),
        {label:'Begin Iria (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterSixJungleStart})=>this.loadState(chapterSixJungleStart()));};
          if(this.latestSave)this.ui.showModal('Start the canonical Iria save?','<p>This replaces the autosave at Iria’s river landing. Nell is ill; Namar is unvisited. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);else start();
        }},
        {label:'Begin Namar · Nell recovered (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterSixRecoveredStart})=>this.loadState(chapterSixRecoveredStart()));};
          if(this.latestSave)this.ui.showModal('Start with Nell recovered?','<p>This replaces the autosave after Iria’s treatment, before Namar. Nell, Kit and Celia are active. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);else start();
        }},
        {label:'Begin Chapter Five · Act IV (canonical)',action:()=>{
          const start=()=>{void import('../dev/canonical-saves').then(({chapterFiveFinaleStart})=>this.loadState(chapterFiveFinaleStart()));};
          if(this.latestSave)this.ui.showModal('Start the canonical Act IV save?','<p>This replaces the autosave with Acts I–III complete, the Emperor’s offer recorded and all five travelers rested aboard. Manual save slots remain available.</p>',[{label:'Start canonical save',action:start}]);else start();
        }},
      ]);
      for(const button of target.querySelectorAll('button')){
        button.setAttribute('aria-label',button.textContent!);
        button.textContent=button.textContent!.replace(/^Begin /,'').replace(/ \(canonical\)$/,'');
      }
    }
  }
  private requestNewGame(){
        if (this.latestSave) this.ui.showModal('Begin a new journey?', '<p>Your manual save slots will remain available. Starting a new journey replaces the autosave.</p>', [{ label: 'Begin', action: () => { this.ui.closeModal(); this.begin(); } }]);
        else this.begin();
  }
  private begin() {
    this.state = newGame(); this.state.location=arrival('station','start'); this.ui.clearPanel(); this.showWorld();
    this.autosave();resumeChapter(this.storyHost());
  }
  private async beginNextChapter() {
    const destination=nextChapter(this.state);
    if(this.busy||!destination?.entry)return;
    this.busy=true;this.ui.toast(destination.entry.loading);
    try{
      for(const map of destination.maps)await this.regionAssets.ensure(map);
      if(!destination.entry.begin(this.state))return;
      this.ui.clearPanel();this.showWorld();this.autosave();resumeChapter(this.storyHost());
    }catch(error){this.ui.toast(error instanceof Error?error.message:'Unable to load the chapter. Your departure is intact.');}
    finally{this.busy=false;}
  }
  private async loadState(state: GameState) {
    if(this.busy)return;this.busy=true;
    try {
      const candidate = decodeSave(JSON.stringify(state));
      const floor=restorePoint(MAPS[candidate.location.map],candidate.location,candidate);
      if(!floor)throw new Error('This save is inside an obstacle.');
      candidate.location={map:candidate.location.map,...floor};
      for(const map of mapsForRestore(candidate))await this.regionAssets.ensure(map);
      this.state = candidate;
      this.battle = undefined; this.ui.closeModal(); this.ui.clearPanel(); this.showWorld(); this.autosave();
      if(this.state.boundary)this.boundaryPanel();
      else resumeChapter(this.storyHost());
      this.ui.toast('Journey restored.');
    } catch (error) { this.ui.toast(error instanceof Error ? error.message : 'Unable to load the save.'); }
    finally{this.busy=false;}
  }
  private showWorld() {
    document.querySelector('.game-shell')!.classList.remove('boss-battle');
    (document.getElementById('inventory-button') as HTMLButtonElement).disabled=false;
    this.battlePresentation=undefined;
    this.mode = 'world';this.ui.battlePan.hidden=true; this.battle = undefined; this.hover = undefined; this.plan = undefined; this.busy = false;
    const view=worldView();this.scale.setGameSize(view.width,view.height);this.cameras.main.stopFollow();this.cameras.main.setScroll(0,0);
    this.clearLayer(); const map = MAPS[this.state.location.map]; this.background(map.id); this.audio.setRoom(MAP_ROOMS[map.id]);this.audio.setMode((map.id==='station'&&this.state.flags.raidSeen)||(map.id==='rillbridge'&&!this.state.flags.villageFreed)?'tunnel':map.id==='lastshore'?'refuge':map.id==='capitalquay'?(this.state.flags.capitalReleased?'capital-return':'outermooring'):map.id==='flagship'?'signalwall':map.id==='airship'&&this.state.flags.nellIll&&!this.state.flags.nellRecovered?'observation':map.id==='rainhouse'&&this.state.flags.nellRecovered?'rainhouse-rest':map.id);
    this.lighting.attach(this.layer!,map.tiles,this.state);
    this.mechanisms=new WorldMechanisms(this,this.layer!);
    this.mapLife=new MapLife(this,this.layer!,map,this.state);
    for(const person of visiblePeople(map,this.state)){
      const image=this.lighting.actor(this.layer!,(person.x+.5)*TILE,(person.y+.5)*TILE+7,person.sprite).setOrigin(.5,.85).setAlpha(person.projection?.72:1).setData('projection',!!person.projection).setData('world-actor',true).setData('person',person.id);
      this.peopleMotion.add(image,person,map,this.state);
    }
    for (const object of visibleObjects(map, this.state)) {
      const x = (object.x + .5) * TILE, y = (object.y + .5) * TILE;
      if (object.sprite&&(!object.spriteHiddenFlag||!this.state.flags[object.spriteHiddenFlag])) this.lighting.actor(this.layer!,x,y+7,object.sprite).setOrigin(.5,.85).setData('world-actor',true);
      const indicator=interactionMarker(object,this.state);
      if (indicator) {
        const marker = this.label(x,y-(object.sprite?74*worldActorScaleY(object.sprite):9),indicator.glyph,indicator.color,3,true);
        this.layer!.add(marker.setDepth(20000));
      }
    }
    const p = this.state.location;
    const leader=this.worldLeader();
    if(this.face.replace(/-(left|right|back)$/,'')!==leader)this.face=leader;
    this.syncWorldFollowers();
    this.player = this.lighting.actor(this.layer!,(p.x+.5)*TILE,(p.y+.5)*TILE+7,this.face).setOrigin(.5,.85).setData('hero',leader).setData('world-actor',true);
    this.sortWorld();
    const size=mapSize(map);this.cameras.main.setBounds(0,0,size.width,size.height);this.cameras.main.centerOn(this.player.x,this.player.y);this.cameras.main.startFollow(this.player,false,1,1,0,MAPS[this.state.location.map].cameraLeadY??0);
    this.ui.location(map.name);
    this.ui.initiative.textContent = this.state.chapter==='chapter-four'? (this.state.flags.chapterFourComplete?'The western airfield is marked. Tomas keeps the railway talking.':map.id==='sanctuary'&&this.state.flags.sanctuaryWardenWon?'The tide is moving again. The covered chart is open.':map.id==='breakwater'&&this.state.flags.harborOpened?'The ferry is home. The eastern service stair is clear.':map.id==='refuge'&&this.state.flags.harborOpened?'Bram’s ferry is supplying the ward. Tomas keeps the messages moving.':map.subtitle)
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
    const director=dialogue.scene&&this.layer?new Cutscene(this,this.layer,dialogue.scene,this.audio,this.motion,this.lighting):undefined;
    this.cinematic=director;let finished=false;
    const finish=(action?:()=>void)=>{
      if(finished)return;finished=true;director?.close();if(this.cinematic===director)this.cinematic=undefined;
      if(this.mode==='world'&&this.player)this.cameras.main.startFollow(this.player,false,1,1,0,MAPS[this.state.location.map].cameraLeadY??0);
      const resources=resourceSnapshot(this.state),notice=this.ui.toastSerial;
      action?.();this.ui.received(resourceGains(resources,this.state),this.ui.toastSerial!==notice);if(this.mode==='world'){this.renderWorldControls();this.autosave();}
    };
    this.ui.showDialogue({...dialogue,choices:dialogue.choices?.map(c=>({...c,action:()=>finish(c.action)})),done:()=>finish(dialogue.done)},index=>director?.shot(dialogue.lines[index].shot));
  }
  private finishStory(flag: string, entry?: string) {
    this.state.flags[flag] = true; if (entry) remember(this.state, entry);
    this.showWorld(); this.autosave();
  }
  private async changeMap(map: MapId, x: number, y: number) {
    if(this.busy)return;this.busy=true;
    try{await this.regionAssets.ensure(map);this.state.location={map,x,y};this.showWorld();this.autosave();resumeChapter(this.storyHost());this.ui.canvas.focus();}
    catch(error){this.ui.toast(error instanceof Error?error.message:'Unable to load this area.');}
    finally{this.busy=false;}
  }
  private renderWorldControls() {
    if (this.mode !== 'world') return;
    const s = this.state, esc = this.ui.escape;
    this.ui.controls.innerHTML = `<div class="world-party" data-size="${s.activeParty.length}">${s.activeParty.map(id=>s.party.find(h=>h.id===id)!).map(h => `<div class="world-hero"><img src="${art(h.id)}" alt=""/><div><strong>${CHARACTERS[h.id].name}</strong><small>HP ${h.hp}/${maxHp(h.id,s)}</small><small>Lv ${level(s)}</small></div></div>`).join('')}</div><div class="world-objective"><h3${this.near?' class="nearby"':''}>${esc(this.near?`${(interactionMarker(this.near,s)?.label??INTERACTION_MARKERS[interactionKind(this.near,s)].label)} · ${this.near.label}`:'Next stop')}</h3><p>${esc(objective(s))}</p></div><div class="world-actions"><div class="dpad"></div><div class="interact-action"></div></div>`;
    const pad = this.ui.controls.querySelector('.dpad')!;
    for (const [label, dx, dy] of [['↑',0,-1],['←',-1,0],['↓',0,1],['→',1,0]] as const) pad.append(this.ui.button({ label, action: () => { if (!this.blocked && !this.moving) this.stepWorld(dx,dy); } }));
    this.ui.controls.querySelector('.interact-action')!.append(this.ui.button({ label: this.near ? 'Interact' : 'Journal', key: this.near ? 'E' : 'J', action: () => this.near ? this.interact(this.near) : this.journal() }));
    const points=availableSkillPoints(s);if(points)this.ui.controls.querySelector('.world-actions')!.append(this.ui.button({label:`Upgrade skills · ${points}`,action:()=>openSkills(this.ui,s,()=>{this.autosave();this.renderWorldControls();})}));
    this.ui.status.innerHTML = `${icon('marks')}${s.coins} marks · ${icon('bandage')}${s.bandages} bandages · click to walk · E interact · J journal`;
  }
  private closestObject(): MapObject | undefined {
    const p = this.state.location;
    return visibleObjects(MAPS[p.map], this.state).filter(o=>(!o.accessFlag||this.state.flags[o.accessFlag])).filter(o => Math.abs(o.x-p.x) + Math.abs(o.y-p.y) <= 3)
      .sort((a,z) => (Math.abs(a.x-p.x)+Math.abs(a.y-p.y))-(Math.abs(z.x-p.x)+Math.abs(z.y-p.y)))[0];
  }
  update(time: number,delta:number) {
    this.peopleMotion.update(delta,this.mode!=='world'||this.blocked||this.busy||!!this.cinematic);
    this.motion.update();
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
  private worldLeader():HeroId {
    if((this.state.location.map==='lastmorning'||this.state.location.map==='lastshore'||this.state.location.map==='seaholiday'||this.state.location.map==='homecoming'))return 'nell';
    // Kit waits with Tomas during the aftermath, without changing the saved formation.
    if(this.state.location.map==='laststation')return this.state.activeParty.find(id=>id!=='kit')??'orrin';
    return partyLeader(this.state);
  }
  private syncWorldFollowers() {
    const mapId=this.state.location.map;
    const stationed=mapId==='airship'||mapId==='laststation'?new Set(visibleObjects(MAPS[mapId],this.state).map(o=>o.sprite)):new Set<string>();
    const ids=mapId==='lastmorning'||mapId==='lastshore'||mapId==='seaholiday'?[]:this.state.activeParty.filter(id=>id!==this.worldLeader()&&!stationed.has(id));
    if(ids.length===this.followers.length&&ids.every((id,i)=>this.followers[i].getData('hero')===id))return;
    for(const follower of this.followers){
      this.tweens.killTweensOf(follower);this.motion.stop(follower);follower.destroy();
    }
    this.followers=[];
    const p=this.state.location,map=MAPS[p.map];
    for(const [index,id] of ids.entries()){
      const x=walkable(map,p.x-index-1,p.y,this.state)?p.x-index-1:p.x;
      const follower=this.lighting.actor(this.layer!,(x+.5)*TILE,(p.y+.5)*TILE+7,id).setOrigin(.5,.85).setData('hero',id).setData('world-actor',true);
      this.followers.push(follower);
    }
  }
  private stepWorld(dx: number, dy: number) {
    const p = this.state.location; const x = p.x + dx, y = p.y + dy;
    if (!walkable(MAPS[p.map], x, y,this.state) || this.moving || this.blocked) return;
    this.moving = true;
    const previous = { x: this.player!.x, y: this.player!.y };
    const leader=this.worldLeader();
    this.face = facingAsset(leader,dx,dy);
    this.motion.walk(this.player!,this.face,130); p.x=x; p.y=y;this.audio.effect('move',p.map);
    this.tweens.add({ targets:this.player, x:(x+.5)*TILE, y:(y+.5)*TILE+7, duration:130, ease:'Linear', onComplete:()=>{ this.moving=false; } });
    let following = previous;
    for (const follower of this.followers) {
      const old = { x: follower.x, y: follower.y }, id = follower.getData('hero') as HeroId;
      if(following.x!==old.x||following.y!==old.y)this.motion.walk(follower,facingAsset(id,following.x-old.x,following.y-old.y),130);
      else this.motion.stop(follower);
      this.tweens.add({ targets:follower, x:following.x, y:following.y, duration:130, ease:'Linear' });
      following = old;
    }
  }
  point(x:number,y:number,click:boolean){
    if(click){this.pointerClick({x,y});return;}
    if(this.mode!=='battle'||this.blocked||this.busy)return;
    const wx=x+this.cameras.main.scrollX,wy=y+this.cameras.main.scrollY;
    const hex=this.battlePresentation?.pick?.(this.battle!,this.selected,wx,wy)??fromPixel(wx,wy);
    if(inside(hex)&&(!this.hover||!equal(this.hover,hex))){this.hover=hex;this.drawGrid();this.updatePreview();}
  }
  private pointerClick(pointer: {x:number;y:number}) {
    if (this.blocked || this.busy) return;
    if (this.mode === 'battle') { const x=pointer.x+this.cameras.main.scrollX,y=pointer.y+this.cameras.main.scrollY;const h=this.battlePresentation?.pick?.(this.battle!,this.selected,x,y)??fromPixel(x,y); if (inside(h)) this.chooseHex(h); return; }
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
    // One DOM event must never both select and confirm a tactical action.
    if(this.handledKeys.has(e))return;this.handledKeys.add(e);
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
      else if (/^[2-9]$/.test(e.key)) { const id=this.commandAbilities(this.battle!,u)[Number(e.key)-2];if(id)this.selectAction(id); }
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
      checkpoint:async slot=>{
        if(this.busy)return false;this.busy=true;
        try{await this.serialSave;await save(slot,structuredClone(this.state));return true;}
        catch{this.ui.toast('The return checkpoint could not be saved. Free browser storage and try the stair again.');return false;}
        finally{this.busy=false;}
      },
      travel: (map, x, y) => { void this.changeMap(map, x, y); }, battle: id => this.startBattle(id),
      shop: shop => this.shop(shop), boundary: () => this.boundaryPanel(), toast: message => this.ui.toast(message),
      endingMusic: () => this.audio.setMode('ending'),
    };
  }
  private boundaryPanel() {
    if(this.state.flags.lightbearerEnding){
      this.ui.panel('An unfinished tomorrow','<p>The Emperor’s rule has ended. The capital has landed, but the Benefactor still takes days from the world.</p><p>Nell’s place on the sea train is empty.</p>',[
        {label:'Return before the final assault',action:()=>{void listSaves().then(records=>{const prior=records.find(r=>r.slot==='capital-return');if(prior)void this.loadState(prior.state);else this.ui.toast('The return checkpoint is unavailable in this browser. Import your earlier save from Save files.');}).catch(()=>this.ui.toast('Browser saves are unavailable. Your exported saves can still be imported.'));}},
        {label:'Export ending save',action:()=>exportSave(this.state)},
      ]);return;
    }
    const chapter=CHAPTERS[this.state.chapter],destination=nextChapter(this.state);
    this.ui.panel(this.state.flags.chapterSevenComplete?'Borrowed Tomorrow · complete':`${chapter.title} complete`,chapter.ending.html,[
      ...(destination?[{label:`Begin ${destination.title}`,action:()=>{void this.beginNextChapter();}}]:[]),
      {label:chapter.ending.returnLabel,action:()=>{this.ui.clearPanel();this.renderWorldControls();}},
      {label:chapter.ending.exportLabel??'Export departure save',action:()=>exportSave(this.state)},
    ]);
  }

  private startBattle(id: string) {
    const definition=ENCOUNTERS[id];
    if(definition.boss==='conduit'&&definition.grounding&&this.state.activeParty.length<2){this.ui.toast('Sealed intake needs two active companions. Add a companion in Equipment.');return;}
    this.battlePresentation=definition.boss==='benefactor'?benefactorPresentation(definition):definition.boss==='emperor'||definition.boss==='lightbearer'?imperialPresentation(definition):definition.boss==='dragon'?winterDragonPresentation(definition):definition.boss==='serpent'?serpentPresentation(definition):definition.boss==='conduit'?conduitPresentation(definition):definition.boss==='furnace'?furnacePresentation(definition):definition.boss==='ward'?wardPresentation(definition):definition.boss==='flagship'?flagshipPresentation(definition):undefined;
    this.ui.clearPanel();this.path=[];this.autosave();this.battle=createBattle(id,this.state);this.mode='battle';this.selected='move';this.plan=undefined;this.hover=undefined;
    this.enterBattle();
  }
  /** A standalone harness: no campaign saves, flags, loot or experience. */
  previewBattle(battle: Battle, returnToWorkshop: () => void, presentation?:BattlePresentation) {
    if(!import.meta.env.DEV||!this.practiceReady)throw new Error('A development practice host is required.');
    this.practiceReturn=returnToWorkshop;this.battlePresentation=presentation;this.ui.closeModal();this.clearLayer();this.ui.clearPanel();
    this.battle=battle;this.mode='battle';this.busy=false;this.selected='move';this.plan=undefined;this.hover=undefined;
    this.enterBattle();
  }
  closePreview() {
    if(!import.meta.env.DEV||!this.practiceReady)return;
    document.querySelector('.game-shell')!.classList.remove('boss-battle');
    this.mode='title';this.battle=undefined;this.battlePresentation=undefined;this.busy=false;this.clearLayer();this.ui.closeModal();this.ui.clearPanel();this.ui.battlePan.hidden=true;
  }
  private enterBattle() {
    document.querySelector('.game-shell')!.classList.toggle('boss-battle',!!this.battlePresentation&&!this.battlePresentation.tactical);
    this.battleFaces.clear();
    this.battleCursor={...active(this.battle!)!.hex};
    if(this.battlePresentation&&!this.battlePresentation.tactical)for(const u of this.battle!.units)if(u.side==='party')this.battleFaces.set(u.id,facingAsset(u.kind as CompanionId,0,-1));
    for(const u of this.battle!.units)if(u.side==='enemy'&&COMPANION_IDS.includes((u.appearance??u.kind) as CompanionId))this.battleFaces.set(u.id,facingAsset((u.appearance??u.kind) as CompanionId,-1,0));
    (document.getElementById('inventory-button') as HTMLButtonElement).disabled=true;
    if(import.meta.env.DEV)this.testingBattle=structuredClone(this.battle!);
    const view=worldView();this.scale.setGameSize(view.width,view.height);this.ui.battlePan.hidden=!narrowScreen();this.shownTurn=undefined;this.cameras.main.stopFollow();this.cameras.main.setBounds(0,0,WIDTH,480);this.cameras.main.setScroll(0,0);this.clearLayer();
    if(this.battlePresentation?.focus)this.revealHex(this.battlePresentation.focus);
    this.audio.setRoom(this.practiceReady?TRACK_ROOMS[this.battleDefinition.music]:MAP_ROOMS[this.state.location.map]);this.audio.setMode(this.battleDefinition.music);this.drawBattle();this.renderBattleControls();this.ui.location(this.battleDefinition.name);this.ui.canvas.focus();this.scheduleEnemy();
  }
  private drawBattle(before?:BattleSnapshot) {
    this.boarding.settle(this);
    this.battlePresentation?.prepare?.(this.battle!);
    if(!this.busy&&this.battlePresentation?.facing)for(const unit of this.battle!.units){const facing=this.battlePresentation.facing(unit);if(facing)this.battleFaces.set(unit.id,facing);}
    this.motion.clear();this.peopleMotion.clear();
    this.lighting.clear();this.bossLighting=undefined;
    this.layer?.destroy(true);this.layer=this.add.container(0,0);this.actorImages.clear();
    const backdrop=this.battleDefinition.backdrop??{map:'yard' as const,y:0};
    if(this.battlePresentation)this.battlePresentation.background(this,this.layer,this.battle!);
    else this.background(backdrop.map,backdrop.y);
    this.bossLighting=BossLighting.create(this,this.battle!,this.battleDefinition);
    const illumination=this.battlePresentation?.lighting;
    const stage=illumination&&this.bossLighting?{...illumination,sample:this.bossLighting.sample,floorLight:true}:illumination;
    this.lighting.attach(this.layer,this.battlePresentation?undefined:BATTLE_MAPS[this.battle!.encounter],this.state,stage);
    if(this.bossLighting)for(const object of this.layer.list)if(object instanceof Phaser.GameObjects.Image&&object.texture.key==='flagship-hull')this.lighting.illuminate(object);
    this.lighting.environment(this.layer);
    this.grid=this.add.graphics();this.layer.add(this.grid);
    const b=this.battle!,turn=active(b);
    if(!this.busy&&turn&&turn.id!==this.shownTurn){this.revealHex(turn.hex);this.shownTurn=turn.id;}
    for(const rock of this.battleDefinition.rocks){if(b.fixtures?.some(f=>equal(f.hex,offset(...rock))))continue;const p=toPixel(offset(...rock));this.layer.add(this.add.image(p.x,p.y+9,'rock').setOrigin(.5,.8));}
    drawBattleFixtures(this,this.layer,b,before);
    this.lighting.focus(this.layer);
    const floor=(u:import('../rules/combat').Unit)=>Math.max(...occupiedHexes(u,before?.get(u.id)?.hex??u.hex).map(h=>toPixel(h).y));
    for(const u of [...b.units].sort((a,z)=>floor(a)-floor(z))){if(before?.size&&!before.has(u.id)&&u.id.startsWith('benefactor-minion-'))continue;const old=before?.get(u.id),p=toPixel(old?.hex??u.hex),hp=old?.hp??u.hp;
      const custom=this.battlePresentation?.actor?.(this,u,hp,old?.hex??u.hex);
      const img=(custom??this.lighting.actor(this.layer,p.x,p.y+9,this.battleFaces.get(u.id)??u.appearance??u.kind).setOrigin(.5,.85)).setAlpha(hp>0?1:.22).setData('hero',u.appearance??u.kind).setData('fallen',hp<=0);
      if(!custom&&u.side==='enemy'&&!COMPANION_IDS.includes((u.appearance??u.kind) as CompanionId))img.setFlipX(true);
      if(custom){this.layer.add(img);if(this.bossLighting){this.lighting.illuminate(img);this.bossLighting.bind(u,img,hp);}}this.actorImages.set(u.id,img);
      if(hp>0&&!custom){const badges=this.add.container(p.x,p.y+9);this.layer.add(badges);img.setData('badges',badges);
        const g=this.add.graphics();g.fillStyle(0x101d24,.95).fillRect(-23,9,46,6);g.fillStyle(u.side==='party'?0x8ab4ab:0xbf7050).fillRect(-22,10,44*hp/u.maxHp,4);badges.add(g);
        badges.add(this.label(0,19,String(hp),'#f4e5be',2));
        if(u.guard||u.dazzledAttacks||tauntTarget(b,u))badges.add(this.label(0,35,[u.guard?`Guard ${u.guard}`:'',u.dazzledAttacks?`Dazzled ${u.dazzledAttacks}`:'',u.pinned?'Pinned · move 1':'',tauntTarget(b,u)?`Taunted: ${tauntTarget(b,u)!.name}`:''].filter(Boolean).join(' · '),'#87a3a2',1));
      }
    }
    this.boarding.sync(b);
    if(b.evacuation){this.ui.canvas.setAttribute('aria-description',`Families aboard: ${b.evacuation.boarded}/${b.evacuation.groups}. Gold arrows mark the loading walk.`);this.layer.add(this.label(worldView().width-80,20,`${b.evacuation.boarded}/${b.evacuation.groups} aboard`,'#f4d598',1).setScrollFactor(0).setDepth(20000));this.layer.add(this.add.image(850,440,'dena').setOrigin(.5,.85));this.layer.add(this.label(850,461,'To coaches','#f4d598',1));}
    this.drawGrid();this.drawInitiative();
    this.battlePresentation?.overlay?.(this,this.layer,b);
  }
  private hexPolygon(h: Hex, color: number, alpha: number, stroke: number, width=1,inset=0) {
    const g=this.grid!,points=hexVertices(h,inset).map(p=>new Phaser.Math.Vector2(p.x,p.y)),inner=hexVertices(h,inset+Math.max(2,Math.ceil(width/2)*2)).map(p=>new Phaser.Math.Vector2(p.x,p.y));
    if(alpha>0)g.fillStyle(color,alpha).fillPoints(points,true);
    // Filled strips avoid centered strokes straddling a chunky pixel.
    g.fillStyle(stroke,.78);for(let i=0;i<6;i++){const next=(i+1)%6;g.fillPoints([points[i],points[next],inner[next],inner[i]],true);}
  }
  private drawGrid() {
    if(!this.grid||!this.battle)return;this.grid.clear();const b=this.battle,u=active(b);
    const aimed=this.plan?.hex??this.hover;
    const canAct=u?.side==='party'&&!b.result&&!this.busy;
    const reachableHexes=canAct&&this.selected==='move'?movement(b,u!):undefined;
    const occupied=new Set(b.units.filter(v=>v.hp>0&&v.footprint?.length).flatMap(v=>occupiedHexes(v).map(key)));
    const attack=this.enemyAttack?.battle===b?this.enemyAttack:undefined;
    const attackCells=new Set(attack?.cells.map(key));
    const danger=new Set(b.units.filter(v=>v.hp>0&&!(v.id===attack?.actorId&&ABILITIES[attack.ability].shape==='pattern')).flatMap(v=>v.intent?.cells.map(key)??[]));
    const affected=canAct&&aimed&&this.selected!=='move'&&legalAim(b,u!,this.selected,aimed)?new Set(shape(b,u!,this.selected,aimed).map(key)):new Set<string>();
    const valveVents=new Set(this.selected!=='move'&&damagingAbility(this.selected)?b.fixtures?.filter(f=>f.kind==='valve'&&affected.has(key(f.hex))).flatMap(f=>f.vents?.map(key)??[]):[]);
    const auras=rallySources(b),rallyCells=new Set(auras.flatMap(source=>rallyArea(b,source,source.rally!.rank).map(key)));
    const outlines:HexOutline[]=[];
    const fill=(h:Hex,color:number,alpha:number)=>this.grid!.fillStyle(color,alpha).fillPoints(hexVertices(h).map(p=>new Phaser.Math.Vector2(p.x,p.y)),true);
    for(const h of cells()){
      const id=key(h);let color=0x182824,alpha=.12,stroke=0x938e68,width=1,priority=0;
      const reachable=!!reachableHexes?.get(id)?.path.length;
      if(rallyCells.has(id)){color=0x727fca;alpha=.22;}
      if(b.water.has(id)){color=0x357e98;alpha=.46;stroke=0x87bbc9;priority=1;}
      if(b.grounding?.plates.some(p=>equal(p,h))){color=b.grounding.open?0x4b9787:0x3b7bba;alpha=.48;stroke=0x9be8e4;width=3;priority=2;}
      if(b.vents.has(id)){color=0xb95025;alpha=.4;stroke=0xffbf6a;priority=2;}
      if(b.obstacles.has(id)){color=0x17201e;alpha=.45;stroke=0x686753;priority=1;}
      else if(reachableHexes?.has(id)&&!equal(h,u!.hex)){color=0x568d99;alpha=.21;stroke=0x91b5b2;priority=3;}
      if(occupied.has(id)){color=0x29233b;alpha=.5;stroke=0xbe965d;width=2;priority=4;}
      if(danger.has(id)){
        if(reachable){color=0x568d99;alpha=.32;}else{color=0xad4937;alpha=.4;}
        stroke=0xf7ae73;width=2;priority=5;
      }
      if(affected.has(id)){const a=abilityFor(u!,this.selected as AbilityId);color=a.effect==='rally'?0x727fca:a.heal?0x72b89c:0xe5a742;alpha=.45;stroke=a.effect==='rally'?0xb1bdf5:0xf2c778;width=2;priority=6;}
      if(valveVents.has(id)&&!affected.has(id)){color=0x4bada7;alpha=.25;stroke=0x9ae4cc;width=2;priority=6;}
      if(u&&equal(h,u.hex)){color=0xf0d38c;alpha=.19;stroke=0xf2e0ac;width=3;priority=7;}
      if(aimed&&equal(h,aimed)){stroke=0xffffff;width=2;priority=9;}
      if(b.evacuation?.route.some(p=>equal(p,h))){stroke=0xf4cc72;width=Math.max(2,width);priority=8;if(alpha===.12){color=0xd7a548;alpha=.22;}}
      if(attackCells.has(id)){color=attack!.impact?0xf0a34b:0xb65a38;alpha=attack!.impact ? .5 : .3;stroke=attack!.impact?0xffe1a1:0xffb16c;width=3;priority=10;}
      fill(h,color,alpha);outlines.push({hex:h,color:stroke,width,priority});
      if(danger.has(id)){
        if(reachable)this.hexPolygon(h,0,0,0x91d5df,2,6);
        const p=toPixel(h),x=Math.round(p.x/2)*2,y=Math.round((p.y-20)/2)*2;
        this.grid.lineStyle(2,0xffd098,1);this.grid.lineBetween(x-4,y-4,x+4,y+4);this.grid.lineBetween(x-4,y+4,x+4,y-4);
      }
      if(b.evacuation?.route.some(p=>equal(p,h))){const p=toPixel(h);this.grid.lineStyle(2,0xf4cc72,.95);this.grid.lineBetween(p.x-9,p.y+15,p.x+9,p.y+15);this.grid.lineBetween(p.x+3,p.y+10,p.x+9,p.y+15);this.grid.lineBetween(p.x+3,p.y+20,p.x+9,p.y+15);}
      if(b.grounding?.plates.some(p=>equal(p,h))){const p=toPixel(h);this.grid.lineStyle(3,0xb7f0df,1);this.grid.lineBetween(p.x,p.y-9,p.x,p.y+7);for(let row=0;row<3;row++)this.grid.lineBetween(p.x-10+row*3,p.y+7+row*5,p.x+10-row*3,p.y+7+row*5);}
      if(b.water.has(id)){const p=toPixel(h);this.grid.lineStyle(2,0xa1d4dc,.9);this.grid.lineBetween(p.x-12,p.y+10,p.x+2,p.y+10);this.grid.lineBetween(p.x-2,p.y+14,p.x+12,p.y+14);}
      if(b.vents.has(id)){const p=toPixel(h);this.grid.lineStyle(2,0xffc07a,.95);for(const dx of [-10,0,10]){this.grid.lineBetween(p.x+dx-3,p.y+16,p.x+dx+3,p.y+8);this.grid.lineBetween(p.x+dx+3,p.y+8,p.x+dx,p.y+3);}}
    }
    if(canAct&&aimed&&this.selected!=='move'&&['push','shove'].includes(abilityFor(u!,this.selected).effect??'')&&legalAim(b,u!,this.selected,aimed)){
      for(const target of targets(b,u!,this.selected,aimed)){const destination=target.hp>damage(u!,target,this.selected)?pushDestination(b,u!,target):undefined;if(destination){fill(destination,0x557179,.3);outlines.push({hex:destination,color:0x9bab6c,width:2,priority:8});}}
    }
    // Draw the collected edge network after every fill. Same-style segments
    // share a single path, so joins do not accumulate translucent strokes.
    const batches=new Map<string,ReturnType<typeof gridEdges>>();
    for(const edge of gridEdges(outlines,auras.map(source=>rallyArea(b,source,source.rally!.rank).map(hex=>({hex,color:0xb1bdf5,width:2,priority:4}))))){const id=`${edge.color}:${edge.width}`,batch=batches.get(id)??[];batch.push(edge);batches.set(id,batch);}
    for(const edges of batches.values()){
      const {color,width}=edges[0],phase=(width/2)%2;
      this.grid.lineStyle(width,color,.78).beginPath();
      for(const {a,b}of edges){this.grid.moveTo(a.x+phase,a.y+phase);this.grid.lineTo(b.x+phase,b.y+phase);}
      this.grid.strokePath();
    }
    if(canAct&&aimed&&this.selected!=='move'&&abilityFor(u!,this.selected).shape==='bounce'&&legalAim(b,u!,this.selected,aimed)){
      const points=shape(b,u!,this.selected,aimed).map(toPixel);if(points.length===2)this.grid.lineStyle(4,0xf4d49c,.9).lineBetween(points[0].x,points[0].y-20,points[1].x,points[1].y-20);
    }
    if(canAct&&aimed&&this.selected!=='move'&&abilityFor(u!,this.selected).shape==='diagonal'&&legalAim(b,u!,this.selected,aimed)){
      const ray=shape(b,u!,this.selected,aimed),first=ray[0],last=ray.at(-1);if(first&&last){const start=diagonalStart(u!.hex,first),end=toPixel(last);this.grid.lineStyle(2,0xf4d49c,.9).lineBetween(start.x,start.y,end.x,end.y);}
    }
    if(this.plan?.action==='move'&&u){const path=movement(b,u).get(key(this.plan.hex))?.path??[];this.grid.lineStyle(3,0xe8d6a2,.9);this.grid.beginPath();const start=toPixel(u.hex);this.grid.moveTo(start.x,start.y);for(const h of path){const p=toPixel(h);this.grid.lineTo(p.x,p.y);}this.grid.strokePath();}
  }
  private drawInitiative() {
    const b=this.battle!,u=active(b),esc=this.ui.escape;
    this.ui.initiative.innerHTML=`<span class="round">Round ${b.round}${b.grounding?(b.grounding.open?' · shield released':' · earth both blue plates'):b.vents.size?' · vents after last turn':''}</span>${rallySources(b).map(source=>`<span class="round">Cry ${rallyRemaining(b,source)}r</span>`).join('')}${b.queue.map(id=>b.units.find(v=>v.id===id)!).filter(v=>v.hp>0).map(v=>`<span class="turn ${v.id===u?.id?'active':''}">${esc(v.name)}${v.waited?' · waiting':''}</span>`).join('')}`;
  }
  private commandAbilities(b:Battle,u:Unit){return battleAbilities(b,u).filter(id=>!isConsumable(id)||id==='bandage');}
  private renderBattleControls() {
    const b=this.battle;if(!b)return;const u=active(b);if(!u)return;
    const player=u.side==='party'&&!b.result&&!this.busy,esc=this.ui.escape;
    const abilities=battleAbilities(b,u);if(this.selected!=='move'&&!abilities.includes(this.selected)){this.selected='move';this.plan=undefined;}
    const commandScroll=this.ui.controls.dataset.unit===u.id?(this.ui.controls.querySelector('.command-list')?.scrollTop??0):0;this.ui.controls.dataset.unit=u.id;
    const character=CHARACTERS[(u.appearance??u.kind) as keyof typeof CHARACTERS];
    this.ui.controls.innerHTML=`<div class="identity"><img src="${this.battlePresentation?.portrait?.(u)??art(u.kind==='herald'||u.kind==='glasswing'?`portrait-${u.kind}`:character?.portrait??u.appearance??u.kind)}" alt=""/><div><h2>${esc(u.name)}</h2><div class="role">${[u.role??roles[u.kind],u.level?`Lv ${u.level}`:'',u.guard?`Guard ${u.guard}`:'',u.dazzledAttacks?`Dazzled ${u.dazzledAttacks}`:'',u.pinned?'Pinned · move 1':'',rallyBonus(b,u)?'Focus regen +1':'',tauntTarget(b,u)?`Taunted: ${esc(tauntTarget(b,u)!.name)}`:''].filter(Boolean).join(' · ')}</div><div class="vitals">HP ${u.hp} / ${u.maxHp}<div class="bar"><span style="width:${u.hp/u.maxHp*100}%"></span></div>Focus ${u.focus} / ${focusCapacity(u)}<div class="bar focus"><span style="width:${u.focus/focusCapacity(u)*100}%"></span></div></div></div></div><div class="command-panel"><div class="command-list"><div class="actions"></div><p class="hint" id="battle-hint"></p></div><div class="confirmation" id="confirmation"></div></div><div class="battle-log" aria-label="Battle log">${b.log.slice(-4).map(t=>`<p>${esc(t)}</p>`).join('')}</div>`;
    const actions=this.ui.controls.querySelector<HTMLElement>('.actions')!;
    if(import.meta.env.DEV)this.testingTools?.(this.ui,this.ui.controls.querySelector('.command-list')!,{
      current:()=>this.mode==='battle'&&!this.ui.modalOpen&&!this.ui.panelOpen?this.battle:undefined,
      initial:()=>this.testingBattle,
      apply:(battle,restart)=>{
        this.tweens.killAll();this.enemyAttack=undefined;this.battle=battle;this.busy=false;this.plan=undefined;this.hover=undefined;this.selected='move';
        this.battleCursor={...active(battle)!.hex};
        if(restart)this.audio.setMode(this.battleDefinition.music);
        this.drawBattle();this.renderBattleControls();
        if(battle.result)this.battleEnded();else this.scheduleEnemy();
      },
    });
    this.ui.actionRow(actions,[{label:'Move',key:'1',action:()=>this.selectAction('move'),disabled:!player||u.moved,selected:this.selected==='move'},...this.commandAbilities(b,u).map((id,i)=>{
      const team=teamStatus(b,u,id),a=abilityFor(u,id,team.partner),reason=team.reason??(id==='rally'?rallyReason(b,u):undefined);
      return {label:(id==='bandage'?'Items':a.name)+(a.bonus?' · Extra':a.team?' · Team':''),key:i<8?String(i+2):undefined,action:()=>this.selectAction(id),disabled:!player||!a.team&&u.focus<a.cost||!!(a.bonus&&u.bonusUsed)||(id==='bandage'&&!Object.keys(CONSUMABLES).some(item=>battleItemCount(b,item as keyof typeof CONSUMABLES)>0)),unavailable:!!reason,selected:this.selected===id||id==='bandage'&&isConsumable(this.selected),badge:a.rank?String(a.rank):undefined,title:reason??`${a.rank?`Skill ${a.rank}. `:''}${a.description}`};
    }),
      {label:movementOnly(b,u)?'End turn':'Defend',key:'F',disabled:!player,action:()=>this.doDefend()},...movementOnly(b,u)?[]:[{label:'Wait',key:'W',disabled:!player||u.waited||u.moved||u.bonusUsed,action:()=>this.doWait()}]]);
    this.ui.status.textContent=player?(movementOnly(b,u)?'Attack spent. Move or End turn (F).':u.bonusUsed?'Shield bash used. Move if available, then take your main action.':this.selected!=='move'&&abilityFor(u!,this.selected).range===0?'Review affected hexes, then confirm. Move once, then act.':'Select an action, then a hex. Confirm to commit. Move once, then act.'):'Enemy turn · watch the initiative order';
    this.updatePreview();
    this.ui.controls.querySelector('.command-list')!.scrollTop=commandScroll;
    if(this.selected!=='move')this.ui.controls.querySelector('.actions button.selected')?.scrollIntoView({block:'nearest',inline:'nearest'});
  }
  private updatePreview() {
    if(this.mode!=='battle'||!this.battle)return;const b=this.battle,u=active(b);if(!u)return;
    const hint=document.getElementById('battle-hint'),confirm=document.getElementById('confirmation');if(!hint||!confirm)return;
    const aimed=this.plan?.hex??this.hover;const player=u.side==='party'&&!this.busy;
    if(!player){hint.textContent=`${u.name} is choosing a position.`;confirm.innerHTML='';return;}
    hint.textContent=b.grounding&&!b.grounding.open?'Keeper shielded: occupy both blue earth plates together. The shield stays down afterward.':this.selected==='move'?(b.vents.size?(b.furnaceHeat?'Hot metal: 6 HP to ground fighters at round end.':'Orange vents: 6 HP to ground units at round end.')+' Move to an unmarked hex before the last turn. Blue hexes are reachable.':b.water.size?'Blue hexes are reachable. Water marked with waves costs 2 movement; dry ground costs 1. Crows fly over it.':'Blue hexes are reachable. Moving leaves your action available. Wait is available before moving.'):abilityFor(u!,this.selected,teamStatus(b,u,this.selected).partner).description;
    if(this.selected!=='move'&&abilityFor(u,this.selected).rank)hint.textContent=`Skill ${abilityFor(u,this.selected).rank}. `+hint.textContent;
    if(this.battlePresentation?.hint)hint.textContent=this.battlePresentation.hint(b)+' '+hint.textContent;
    const directHint=this.selected==='move'&&bossDirectHint(b);if(directHint)hint.textContent=directHint+' '+hint.textContent;
    if(movementOnly(b,u))hint.textContent='Attack spent. Move once, or End turn (F).';
    if(this.selected==='move'&&b.units.some(v=>v.hp>0&&v.intent?.cells.length))hint.textContent+=' Red X marks an announced attack; blue interiors remain reachable.';
    confirm.innerHTML='';
    if(this.selected!=='move'&&abilityFor(u!,this.selected).team&&teamStatus(b,u,this.selected).reason){
      const reason=teamStatus(b,u,this.selected).reason!;hint.textContent=reason;
      const note=document.createElement('span');note.className='prediction invalid-target team-unavailable';note.setAttribute('role','status');note.textContent=reason;confirm.append(note);return;
    }
    if(this.selected==='rally'&&rallyReason(b,u)){const note=document.createElement('span');note.className='prediction invalid-target';note.textContent=rallyReason(b,u)!;confirm.append(note);return;}
    if(!aimed){
      if(directHint){const note=document.createElement('span');note.className='prediction';note.textContent=bossDirectHint(b,true);confirm.append(note);}
      return;
    }
    if(this.selected==='move'){
      const visit=movement(b,u).get(key(aimed));
      if(visit&&visit.path.length){if(this.plan)confirm.append(this.ui.button({label:`Confirm move · ${visit.path.length} hexes${b.water.size?` · ${visit.cost}/${u.movement} movement`:''}`,action:()=>this.commitPlan()}));else{const text=document.createElement('span');text.className='prediction';text.textContent=`${visit.path.length} hexes${b.water.size?` · ${visit.cost}/${u.movement} movement`:''} · click to select`;confirm.append(text);}
        if(b.units.some(v=>v.hp>0&&v.intent?.cells.some(h=>equal(h,aimed)))){const warning=document.createElement('span');warning.className='prediction';warning.textContent='Threatened destination · an enemy has marked this hex.';confirm.append(warning);}
      }
      else{const text=document.createElement('span');text.className='prediction invalid-target';text.textContent='Outside movement range.';confirm.append(text);}
    }else if(legalAim(b,u,this.selected,aimed)){
      const team=teamStatus(b,u,this.selected).partner,ability=abilityFor(u!,this.selected,team),hits=targets(b,u,this.selected,aimed),footprint=shape(b,u,this.selected,aimed);
      const fixtures=damagingAbility(this.selected)?b.fixtures?.filter(f=>f.hp>0&&footprint.some(h=>equal(f.hex,h)))??[]:[];
      const descriptions=hits.map(v=>ability.effect==='shove'?`${v.name}: ${pushDestination(b,u,v)?'push one hex':'push blocked'} · no damage`:ability.effect==='weaken'?`${v.name}: next 3 attacks −40%`:ability.effect==='guard'?`${v.name}: +${damage(u,v,this.selected as AbilityId,team)} guard`:ability.effect==='focus'?`${v.name}: +${damage(u,v,this.selected as AbilityId,team)} focus`:`${v.name}: ${ability.heal?'+':'−'}${damage(u,v,this.selected as AbilityId,team)} HP${v.side===u.side&&!ability.heal?' (ALLY)':''}${ability.effect==='push'&&v.hp>damage(u,v,this.selected as AbilityId,team)?pushDestination(b,u,v)?' · pushed one hex':' · push blocked':''}`);
      descriptions.push(...fixtures.map(f=>`${f.name}: ${f.kind==='valve'?`steam ${f.active?'off':'on'} on marked hexes`:`${f.hp} HP · takes ${fixtureDamage(u,this.selected as AbilityId,team)} damage`}`));
      const description=ability.effect==='rally'?`Moving aura · +1 focus regeneration for 3 rounds (including this round). ${hits.length?hits.map(v=>v.name).join(', ')+': currently in range.':'No ally currently in range; the aura follows Celia.'} No immediate focus.`:ability.effect==='taunt'?`All ${hits.length} enemies target ${u.name} until ${u.name}’s next turn.`:descriptions.join(' · ')||'Empty ground';
      if(this.plan)confirm.append(this.ui.button({label:ability.heal?'Confirm healing':ability.effect==='rally'||ability.effect==='guard'||ability.effect==='weaken'||ability.effect==='focus'||ability.effect==='taunt'||ability.effect==='shove'?'Confirm ability':'Confirm attack',action:()=>this.commitPlan()}));
      const contributions=team?[u,team].map(fighter=>{const solo=abilityFor(fighter,teamSolo(fighter.kind,this.selected as AbilityId)!);return `${solo.name}${solo.rank?` ${solo.rank}`:''}`;}).join(' + '):'';
      const protection=this.selected==='daybreak'?daybreakProtection(u,team):undefined;
      const text=document.createElement('span');text.className='prediction';text.textContent=(team?`${u.name} + ${team.name} · both actions · ${ability.team!.cost} focus each. ${contributions}. `:'')+description+(ability.ward&&!protection?` · ${ability.ward.party?'All allies':u.name}: up to ${ability.ward.power+Math.floor(Math.max(0,(u.level??1)-1)*1.5)} guard`:'')+(protection?` · all enemies target ${protection.vanguard.name}${protection.power?` · ${protection.party?'All allies':protection.vanguard.name}: up to ${protection.power} guard`:''}`:'');confirm.append(text);
    }else{const text=document.createElement('span');text.className='prediction invalid-target';text.textContent='Out of range or blocked.';confirm.append(text);}
  }
  private selectAction(action: Action, fromItems=false) {
    const u=active(this.battle!);if(this.busy||u?.side!=='party'||(action!=='move'&&(!battleAbilities(this.battle!,u).includes(action)||abilityFor(u!,action).bonus&&u.bonusUsed)))return;
    if(action==='bandage'&&!fromItems){this.openBattleItems();return;}
    this.selected=action;this.plan=undefined;
    if(action!=='move'&&abilityFor(u!,action).range===0&&legalAim(this.battle!,u,action,u.hex)){
      this.plan={action,hex:{...u.hex}};this.battleCursor={...u.hex};
      this.revealHex(u.hex,HEX_SIZE*5); // Include adjacent hexes and knockback landings.
    }
    this.drawGrid();this.renderBattleControls();
  }
  private openBattleItems() {
    const b=this.battle!,u=active(b);if(!u||u.side!=='party'||this.busy||movementOnly(b,u))return;
    this.ui.showModal('Battle items','<div class="shop-items"><p>Use one item and your action. Then choose an ally and confirm.</p><div class="item-list"></div></div>');
    const list=this.ui.modal.querySelector('.item-list')!;
    for(const [id,item]of Object.entries(CONSUMABLES)){
      const itemId=id as keyof typeof CONSUMABLES,count=battleItemCount(b,itemId),row=document.createElement('div');row.className='equipment-row';row.setAttribute('role','group');row.setAttribute('aria-label',item.name);
      row.innerHTML=`<div><h3 class="icon-label">${icon(itemIcon(itemId))}<span>${item.name} × ${count}</span></h3><p>${item.description}</p></div>`;
      row.append(this.ui.button({label:'Select',disabled:count<=0||!u.abilities.includes(itemId),action:()=>{this.ui.closeModal();this.selectAction(itemId,true);}}));list.append(row);
    }
  }
  private chooseHex(hex: Hex) {
    const b=this.battle!,u=active(b);if(!u||u.side!=='party'||this.busy||b.result)return;
    if(this.selected!=='move'&&abilityFor(u!,this.selected).range===0)return;
    this.hover=hex;this.battleCursor=hex;
    const valid=this.selected==='move'?!!movement(b,u).get(key(hex))?.path.length:legalAim(b,u,this.selected,hex);
    if(valid){this.plan={action:this.selected,hex};this.audio.effect('click');}
    else this.plan=undefined;
    this.drawGrid();this.updatePreview();
  }
  private commitPlan() {
    const b=this.battle!,u=active(b),plan=this.plan;if(!u||!plan||this.busy)return;
    const before=this.battleSnapshot();
    const retaliations:string[]=[];
    const partner=plan.action==='move'?undefined:teamStatus(b,u,plan.action).partner;
    const affected=plan.action==='move'?[]:shape(b,u,plan.action,plan.hex);
    const path=plan.action==='move'?move(b,u,plan.hex):undefined;
    const success=plan.action==='move'?!!path:cast(b,u,plan.action,plan.hex,id=>retaliations.push(id));
    if(!success){this.plan=undefined;this.drawGrid();this.renderBattleControls();return;}
    this.plan=undefined;this.hover=undefined;
    if(active(b)?.id===u.id&&(plan.action==='move'||u.moved))this.selected=u.abilities[0];else this.selected='move';
    this.animateBattle(before,{actorId:u.id,aim:plan.hex,...(plan.action==='move'?{path:path!}:{ability:plan.action,partnerId:partner?.id,affected,retaliations})});
  }
  private doDefend() {const b=this.battle,u=b&&active(b);if(this.busy||!b||u?.side!=='party')return;const remaining=movementOnly(b,u);if(!(remaining?endTurn(b):defend(b)))return;if(!remaining)this.audio.effect('defend');this.plan=undefined;this.hover=undefined;this.selected='move';this.animateBattle(new Map());}
  private doWait() {if(this.busy||active(this.battle!)?.side!=='party')return;if(wait(this.battle!)){this.plan=undefined;this.hover=undefined;this.selected='move';this.animateBattle(new Map());}}
  private battleSnapshot():BattleSnapshot {return new Map([...this.battle!.units.map(v=>[v.id,{hex:{...v.hex},hp:v.hp}]as const),...(this.battle!.fixtures??[]).map(f=>[`fixture:${f.id}`,{hex:{...f.hex},hp:f.hp,active:f.active}]as const)]);}
  private animateBattle(before:BattleSnapshot,action?:BattleMotion) {
    const battle=this.battle!,valid=()=>this.battle===battle&&this.mode==='battle';
    const actor=battle.units.find(u=>u.id===action?.actorId),hero=actor?.appearance??actor?.kind;
    const from=actor?toPixel(action?.path&&action.ability?actor.hex:before.get(actor.id)?.hex??actor.hex):undefined,to=action?toPixel(action.aim):undefined;
    const face=hero&&walkingHero(hero)&&from&&to?facingAsset(hero,to.x-from.x,to.y-from.y):undefined;
    if(face&&actor)this.battleFaces.set(actor.id,face);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const preview=this.battlePresentation;
    const timing=actor&&action?.ability?preview?.attackTiming?.(actor):undefined;
    const enemyAttack=actor?.side==='enemy'&&!!action?.ability;
    const rich=!!action?.ability&&(['axis','diagonal','bounce'].includes(abilityFor(actor!,action.ability).shape)||!!abilityFor(actor!,action.ability).team);
    const teamTiming=action?.ability?TEAM_ANIMATION[action.ability]:undefined;
    const contact=teamTiming?.contact??timing?.contact??(enemyAttack&&!animatedHero(hero??'')?220:ATTACK_CONTACT_MS);
    const path=action?.path,stepMs=reduced?0:95,travel=path?path.length*stepMs:0,impact=travel+(action?.ability&&!reduced?contact:0);
    const duration=path&&!action?.ability?Math.max(80,travel+40):travel+(reduced?(enemyAttack?220:100):(teamTiming?teamTiming.duration+80:timing?.duration??(rich?900:enemyAttack?560:ATTACK_DURATION_MS)));
    let teamEffects:Phaser.GameObjects.Container|undefined;
    this.enemyAttack=undefined;
    this.busy=true;this.drawBattle(before);this.renderBattleControls();
    if(actor){this.revealHex(before.get(actor.id)?.hex??actor.hex);const image=this.actorImages.get(actor.id)!;
      const startAttack=()=>{
        if(!valid()||!image.active)return;
        if(enemyAttack&&action?.ability){
          this.enemyAttack={battle,actorId:actor.id,ability:action.ability,cells:action.affected??[],impact:false};
          this.revealHex(action.aim);this.drawGrid();
          const partner=battle.units.find(v=>v.id===action.partnerId);this.ui.status.textContent=`${actor.name}${partner?` + ${partner.name}`:''} · ${abilityFor(actor!,action.ability).name}`;
        }
        if(action?.partnerId){
          const partner=battle.units.find(u=>u.id===action.partnerId),partnerImage=this.actorImages.get(action.partnerId);
          if(partner&&partnerImage){
            teamWindup(this,this.layer!,image,partnerImage,!!abilityFor(actor!,action!.ability!).heal);
            if(animatedHero(partner.kind)){const p=toPixel(partner.hex),target=toPixel(action.aim),face=facingAsset(partner.kind as CompanionId,target.x-p.x,target.y-p.y);this.battleFaces.set(partner.id,face);this.motion.attack(partnerImage,face,0,action.ability==='daybreak'&&partner.kind==='petra'?'bash':'attack');}
            else{const x=partnerImage.x,y=partnerImage.y;this.tweens.addCounter({from:0,to:1,duration:reduced?0:contact,onUpdate:t=>{if(partnerImage.active)partnerImage.setPosition(x-2*Math.round(Math.sin((t.getValue()??0)*Math.PI)*2),y);},onComplete:()=>{if(partnerImage.active)partnerImage.setPosition(x,y);}});}
          }
        }
        if(!reduced&&!animatedHero(hero??'')&&!timing){const x=image.x,y=image.y;this.tweens.addCounter({from:0,to:1,duration:contact,onUpdate:t=>{if(image.active){const p=t.getValue()??0;image.setPosition(x-2*Math.round(p*2),y-2*Math.round(Math.sin(p*Math.PI)*2));}}});}
        if(!reduced&&enemyAttack)this.bossLighting?.attack(actor.id,action?.affected??[],contact,duration-travel);
        if(!reduced&&timing)preview?.attack?.(this,image,actor,0);
        if(face&&action?.ability&&!isConsumable(action.ability)){this.battleFaces.set(actor.id,face);this.motion.attack(image,face,0,action.ability==='bash'||action.ability==='taunt'||action.ability==='daybreak'&&actor.kind==='petra'?'bash':'attack');}
        if(teamTiming&&action?.ability){
          const sources:TeamSource[]=[actor,...action.partnerId?battle.units.filter(u=>u.id===action.partnerId):[]].map(u=>{
            const img=this.actorImages.get(u.id)!,f=this.battleFaces.get(u.id)??'',x=img.x+(f.endsWith('-left')?-26:f.endsWith('-right')?26:f.endsWith('-back')?18:-18);
            return {kind:u.kind,x,y:img.y-30,hex:{...u.hex}};
          });
          teamEffects=this.add.container(0,0);this.layer!.add(teamEffects);
          battleEffect(this,teamEffects,image,action.aim,action.ability,action.affected??[],face??'',actor.hex,abilityFor(actor,action.ability,battle.units.find(u=>u.id===action.partnerId)),sources);
          this.audio.effect(abilityFor(actor,action.ability).sound!,this.state.location.map);this.revealHex(action.aim);
        }
      };
      if(path&&action?.ability)this.time.delayedCall(travel,startAttack);else startAttack();
      if(path){
        this.audio.effect('move',this.state.location.map);
        const advance=(index:number)=>{
          if(!valid()||!image.active||index>=path.length)return;
          const p=preview?.position?.(actor,path[index])??{...toPixel(path[index]),y:toPixel(path[index]).y+9},walkFace=hero&&walkingHero(hero)?facingAsset(hero,p.x-image.x,p.y-image.y):undefined;
          if(walkFace){this.battleFaces.set(actor.id,walkFace);this.motion.walk(image,walkFace,stepMs);}
          this.tweens.add({targets:[image,image.getData('badges')].filter(Boolean),x:p.x,y:p.y,duration:stepMs,ease:'Linear',onComplete:()=>advance(index+1)});
        };advance(0);
      }
    }
    const showImpact=()=>{
      if(!valid()||(path&&!action?.ability))return;
      if(this.enemyAttack?.battle===battle)this.enemyAttack.impact=true;
      const counter=battle.units.find(u=>u.side==='enemy'&&action?.retaliations?.includes(u.id));
      if(counter&&actor){
        this.enemyAttack={battle,actorId:counter.id,ability:'strike',cells:[{...actor.hex}],impact:true};
        this.ui.status.textContent=`${counter.name} · Retaliation`;
      }
      // Keep the airborne projectiles while replacing the snapshot with the hit state.
      if(teamEffects?.active)this.layer!.remove(teamEffects);
      this.drawBattle();
      if(teamEffects?.active)this.layer!.add(teamEffects);
      for(const u of battle.units)if(u.hp>0&&!before.has(u.id)&&u.id.startsWith('benefactor-minion-'))summonArrival(this,this.layer!,u.hex);
      for(const fixture of battle.fixtures??[])if(fixture.hp<=0&&(before.get(`fixture:${fixture.id}`)?.hp??0)>0){fixtureBurst(this,this.layer!,fixture.hex,fixture.kind==='drum');this.audio.effect(fixture.kind==='drum'?'drum':'shield');}
      for(const fixture of battle.fixtures??[])if(fixture.kind==='valve'&&before.has(`fixture:${fixture.id}`)&&fixture.active!==before.get(`fixture:${fixture.id}`)?.active){valveTurn(this,this.layer!,fixture.hex,fixture.vents??[],!!fixture.active);this.audio.effect('valve');}
      if(actor&&action?.ability){
        const image=this.actorImages.get(actor.id)!;
        if(!reduced&&enemyAttack)this.bossLighting?.attack(actor.id,action.affected??[],contact,duration-travel,impact-travel);
        if(!reduced&&timing)preview?.attack?.(this,image,actor,impact-travel);
        if(action.partnerId){const partner=battle.units.find(u=>u.id===action.partnerId),other=this.actorImages.get(action.partnerId);if(partner&&other&&animatedHero(partner.kind)){const p=toPixel(partner.hex),target=toPixel(action.aim),f=facingAsset(partner.kind as CompanionId,target.x-p.x,target.y-p.y);this.motion.attack(other,f,impact-travel,action.ability==='daybreak'&&partner.kind==='petra'?'bash':'attack');}}
        if(face&&!isConsumable(action.ability))this.motion.attack(image,face,impact-travel,action.ability==='bash'||action.ability==='taunt'||action.ability==='daybreak'&&actor.kind==='petra'?'bash':'attack');
        this.revealHex(action.aim);
        if(!teamTiming){
          this.audio.effect(preview?.attackSound?.(actor,action.ability)??abilityFor(actor!,action.ability).sound??action.ability as import('./synth').Effect,this.state.location.map);
          if((actor.side==='enemy'||face||abilityFor(actor!,action.ability).shape==='pattern')&&!preview?.attackEffect?.(this,this.layer!,image,actor,action.ability,action.affected??[]))battleEffect(this,this.layer!,image,action.aim,action.ability,action.affected??[],face??'',actor.hex,abilityFor(actor,action.ability));
        }
      }
      for(const u of battle.units){
        const old=before.get(u.id),image=this.actorImages.get(u.id);if(!old||!image)continue;
        if(!equal(old.hex,u.hex)&&!(path&&u.id===actor?.id)){
          const start=preview?.position?.(u,old.hex)??{...toPixel(old.hex),y:toPixel(old.hex).y+9},end=preview?.position?.(u,u.hex)??{...toPixel(u.hex),y:toPixel(u.hex).y+9};image.setPosition(start.x,start.y);
          const badges=image.getData('badges') as Phaser.GameObjects.Container|undefined;badges?.setPosition(start.x,start.y);
          this.tweens.add({targets:[image,badges].filter(Boolean),x:end.x,y:end.y,duration:reduced?0:140,ease:'Sine.easeOut'});
        }
        if(old.hp!==u.hp){const p=toPixel(u.hex),amount=u.hp-old.hp;
          const text=this.label(p.x,p.y-50,`${amount>0?'+':''}${amount}`,amount>0?'#9bab6c':'#f4c77a').setDepth(10);this.layer!.add(text);
          this.tweens.add({targets:text,y:p.y-80,alpha:0,duration:reduced?100:700,onComplete:()=>{if(text.active)text.destroy();}});
        }
        const counterHero=u.appearance??u.kind;
        if(action?.retaliations?.includes(u.id)&&actor){
          if(u.side==='enemy')battleEffect(this,this.layer!,image,actor.hex,'strike',[actor.hex],'');
          if(animatedHero(counterHero)){
            const p=toPixel(u.hex),target=toPixel(actor.hex),counterFace=facingAsset(counterHero,target.x-p.x,target.y-p.y);
            this.battleFaces.set(u.id,counterFace);this.motion.attack(image,counterFace);
          }
        }
      }
    };
    if(!path||action?.ability)this.time.delayedCall(impact,showImpact);
    this.time.delayedCall(duration,()=>{
      if(!valid())return;teamEffects?.destroy(true);this.motion.clear();this.busy=false;
      const hadAttackArea=!!this.enemyAttack;this.enemyAttack=undefined;
      if(path||this.battlePresentation||hadAttackArea)this.drawBattle();
      const next=active(battle);if(next){this.revealHex(next.hex);this.shownTurn=next.id;}
      const finish=()=>{if(!valid())return;this.busy=false;const next=active(battle);if(next)this.revealHex(next.hex);if(battle.result)this.battleEnded();else{this.drawGrid();this.renderBattleControls();this.scheduleEnemy();}};
      if(battle.evacuation){this.busy=true;this.renderBattleControls();if(this.boarding.play(this,this.layer!,battle,(x,y)=>this.lighting.actor(this.layer!,x,y,'civilian-family'),finish))return;}
      finish();
    });
  }
  private scheduleEnemy() {
    const b=this.battle;if(!b||b.result||active(b)?.side!=='enemy')return;
    this.busy=true;
    this.time.delayedCall(480,()=>{
      if(this.mode!=='battle'||this.battle!==b)return;
      if(this.ui.modalOpen){this.busy=false;this.scheduleEnemy();return;}
      const before=this.battleSnapshot(),attacker=active(b),retaliations:string[]=[];
      const routes=attacker?movement(b,attacker):undefined;
      const partner=attacker?.abilities.includes('relay')?teamStatus(b,attacker,'relay').partner:undefined;
      const announced=attacker?.intent?.cells.map(h=>({...h}));
      let presentation:Pick<BattleMotion,'ability'|'aim'|'affected'>|undefined;
      const run=this.battlePresentation?.enemyTurn??enemyTurn;
      const action=run(b,id=>retaliations.push(id),(ability,aim)=>{if(attacker)presentation={ability,aim:{...aim},affected:(ABILITIES[ability].shape==='pattern'&&announced?announced:shape(b,attacker,ability,aim)).map(h=>({...h}))};});
      if(action&&!presentation)this.audio.effect(action==='defend'?'defend':ABILITIES[action].sound??action as import('./synth').Effect,this.state.location.map);
      const path=attacker?routes?.get(key(attacker.hex))?.path:undefined;
      this.animateBattle(before,attacker?{actorId:attacker.id,partnerId:presentation?.ability==='relay'?partner?.id:undefined,aim:attacker.hex,...presentation,...(path?.length?{path}:{}),retaliations}:undefined);
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
    const resources=resourceSnapshot(this.state),previousLevel=level(this.state);awardVictory(b,this.state);const e=ENCOUNTERS[b.encounter];
    (document.getElementById('inventory-button') as HTMLButtonElement).disabled=false;
    if(e.journal)remember(this.state,e.journal);
    this.audio.setMode(this.state.location.map==='lastshore'?'refuge':this.state.location.map==='capitalquay'?'outermooring':this.state.location.map);this.audio.effect('win');
    this.ui.panel('The line is clear',`<p>${e.xp} experience</p>${rewardList(resourceGains(resources,this.state))}<p>${level(this.state)>previousLevel?`The party reaches level ${level(this.state)}. Maximum HP and attack power increase.${this.state.party.some(p=>earnedSkillPoints(p.id,level(this.state))>earnedSkillPoints(p.id,previousLevel))?' Skill upgrade points earned.':''}`:'The party catches its breath. Some HP and all focus are restored.'}</p>${e.victory?`<p>${this.ui.escape(e.victory)}</p>`:''}`,[{label:'Continue the journey',action:()=>{this.ui.clearPanel();this.showWorld();this.autosave();resumeChapter(this.storyHost());}}]);
    if(availableSkillPoints(this.state)){
      const upgrade=this.ui.button({label:'Upgrade skills',action:()=>openSkills(this.ui,this.state,()=>{
        this.autosave();this.refreshVictorySkills();
      })});
      upgrade.dataset.victorySkills='';
      this.ui.sceneLayer.querySelector('.panel-actions')!.prepend(upgrade);
    }
  }

  private refreshVictorySkills(){
    if(!availableSkillPoints(this.state))this.ui.sceneLayer.querySelector('[data-victory-skills]')?.remove();
  }

  inventory() {
    if(this.practiceReady||this.cinematic||this.busy||!(this.mode==='world'||this.mode==='battle'&&this.battle?.result==='victory'))return;
    this.path=[];this.pendingObject=undefined;
    openInventory(this.ui,this.state,()=>{
      this.autosave();
      if(this.mode==='world'){this.showWorld();}
      else this.refreshVictorySkills();
    });
  }

  journal() {
    if(this.mode==='title'){this.help();return;}
    const s=this.state,esc=this.ui.escape;
    const entries=s.journal.map(id=>JOURNAL[id]).filter(Boolean);
    this.ui.showModal('Travel journal',`<article><h3>Next stop</h3><p>${esc(objective(s))}</p><p>Level ${level(s)} · ${s.xp} experience · ${icon('marks')}${s.coins} marks · ${icon('bandage')}${s.bandages} bandages</p><p>Equipment: ${s.party.map(h=>`${CHARACTERS[h.id].name}: ${Object.values(s.inventory.characters[h.id]).filter(id=>id!==null).map(id=>ITEMS[id].name).join(', ')||'Station issue'}`).join(' · ')}</p></article>${entries.map(e=>`<article><h3>${esc(e.title)}</h3><p>${esc(e.text)}</p></article>`).join('')}`);
  }
  help() {
    this.ui.showModal('On the line', '<article><h3>Exploration</h3><p>WASD or arrow keys move. Click a destination to walk there, or click a person or marked object to approach and interact. E / Enter / Space interacts. J opens the journal. I opens Equipment. Escape closes menus.</p><p>The supply clerk at Larkspur provides free rest and sells supplies and equipment. Bought and found equipment stays in the shared bag until you equip it on a character. Markers use both shape and colour: gold ! for story actions, green ◇ for one-time rewards and optional encounters, pale blue ⌂ for repeatable rest and supplies, a barbell for training and permanent improvements (beside the house when rest is offered too), grey … for conversations or observations, and blue → for exits. Actions and routes that are not ready yet keep their shape but turn grey.</p></article><article><h3>Hex battles</h3><p>Each character acts in initiative order. Move once, then act or defend. Select an action, choose a hex, read the preview, and confirm. You can change your target before committing.</p><p>Skills have their own levels. Lantern burst starts as four slanted hexes, grows to seven, then halves damage to allies. Steam lance remains a contiguous four-hex ray from Orrin at every skill level. Horizon light follows spaced hex diagonals from Nell. Read the highlighted footprint before confirming. Rocks also block ranged shots and the aim of a blast.</p><p>Melee provokes one retaliation per defender per round. Defend reduces damage by 40% until the next turn. Wait delays your turn to the end of the round and is available before moving. Focus restores by one each turn; defend restores one extra.</p><p>At the eastern pass, orange steam outlets deal six HP to ground units at the end of each round. Keep clear of those lanes and the captain’s sun flare. Mend, Heal and items use Confirm healing.</p><p>On narrow screens, use the battlefield view arrows to pan without shrinking the board. Keyboard: 1 Move; 2–9 abilities; arrows move the target cursor; Enter selects and confirms; F Defend; W Wait. Items opens the shared medical bag: bandages restore HP and tonics restore focus. Each uses one main action. Defeat offers a retry.</p></article><article><h3>Skill upgrades</h3><p>Each character level gained grants one upgrade point to every companion, including reserves, until they have earned enough to master every skill. Spend it on any skill whose next rank meets your character level, or save it for later. Open Upgrade skills after a victory or Skills inside Equipment. Upgrades are saved with each character. Team moves unlock from their solo skills and spend both main actions and both focus costs from anywhere on the board. Damage adds the two solo attacks. The assisting fighter keeps any unused movement at their initiative position; move once or use End turn (F), without another attack or free Defend. Each companion has two team partners in a circle; only recruited partners appear in upgrade descriptions.</p></article><article><h3>Keeping the journey</h3><p>Autosaves occur at story checkpoints and before battles. Manual saves and JSON export/import are in the Save menu. Browser saves belong to this browser and site; exported saves can move between devices.</p><p>Chapter One continues into Chapter Two at the saved Iron Coast departure. Equipment lets you choose up to three active fighters; reserves keep their gear and gain experience. Chapter Two continues at the saved capital departure. Chapter Three rescues Tomas and ends at the saved coastal departure. Chapter Four opens the harbor and releases the sanctuary signal. Celia joins the traveling roster; Equipment can change your three active fighters throughout. The chapter ends at the saved anchor counterattack departure. Only current-format saves can be loaded.</p></article>');
  }
  async toggleSound() { try {if(this.soundPreferences)await this.soundPreferences.toggle();else this.ui.sound(await this.audio.toggle());}catch{this.ui.toast('Audio could not start in this browser.');} }
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
  private shop(shop:ShopId='station') {
    openShop(this.ui,this.state,shop,()=>{this.autosave();this.renderWorldControls();},()=>{
      restoreParty(this.state);this.ui.closeModal();this.showWorld();this.autosave();this.ui.toast('Party HP and focus restored.');
    },()=>openInventory(this.ui,this.state,()=>{this.showWorld();this.autosave();}));
  }
}
