import {it,expect,vi,afterEach} from 'vitest';
import {BoardingPresentation} from '../src/game/boarding-presentation';
import {createBattle} from '../src/rules/combat';
import {coastCheckpoint} from './support/progress';

afterEach(()=>vi.unstubAllGlobals());
function harness(reduced=false){
 vi.stubGlobal('window',{matchMedia:()=>({matches:reduced})});
 const pending:(()=>void)[]=[],families:any[]=[],lines:any[]=[],circles:any[]=[];
 const graphic:any={active:true,clear(){return this;},lineStyle(){return this;},lineBetween(...p:any[]){lines.push(p);return this;},strokeCircle(...p:any[]){circles.push(p);return this;},setDepth(){return this;},setData(){return this;},destroy(){this.active=false;}};
 const scene:any={add:{graphics:()=>graphic},cameras:{main:{startFollow:vi.fn(),stopFollow:vi.fn()}},time:{delayedCall:(_:number,f:()=>void)=>pending.push(f)},tweens:{add:(t:any)=>pending.push(()=>{t.onComplete?.();})}};
 const actor=()=>{const a:any={active:true,setOrigin(){return this;},setDepth(){return this;},setData(){return this;},destroy(){this.active=false;}};families.push(a);return a;};
 const b=createBattle('coast-collector',coastCheckpoint('settlementSeen')),p=new BoardingPresentation();p.sync(b);
 return {b,p,scene,actor,families,lines,circles,done:vi.fn(),layer:{add:()=>{}}as any,flush:()=>{while(pending.length)pending.shift()!();}};
}
it('keeps the framebuffer animating until every boarding family reaches safety',()=>{
 const h=harness();h.b.evacuation!.boarded=3;h.b.result='victory';
 expect(h.p.play(h.scene,h.layer,h.b,h.actor,h.done)).toBe(true);
 expect(h.p.active).toBe(true);expect(h.families).toHaveLength(3);expect(h.done).not.toHaveBeenCalled();
 h.flush();expect(h.families.every(f=>!f.active)).toBe(true);expect(h.done).toHaveBeenCalledTimes(1);expect(h.p.active).toBe(false);
 expect(h.p.play(h.scene,h.layer,h.b,h.actor,h.done)).toBe(false);
});
it('lights only the route leading up to the first blocking enemy',()=>{
 const h=harness();h.b.units.filter(u=>u.side==='enemy').forEach(u=>u.hp=0);
 const enemy=h.b.units.find(u=>u.side==='enemy')!;enemy.hp=10;enemy.hex={...h.b.evacuation!.route[2]};h.b.round++;
 expect(h.p.play(h.scene,h.layer,h.b,h.actor,h.done)).toBe(true);expect(h.p.active).toBe(true);
 h.flush();expect(h.lines).toHaveLength(18);expect(h.circles).toHaveLength(1);expect(h.families).toHaveLength(0);expect(h.done).toHaveBeenCalledTimes(1);expect(h.p.active).toBe(false);
});
it('settles immediately under reduced motion',()=>{
 const h=harness(true);h.b.evacuation!.boarded++;
 expect(h.p.play(h.scene,h.layer,h.b,h.actor,h.done)).toBe(false);expect(h.p.active).toBe(false);expect(h.families).toHaveLength(0);
});

it('settles an interrupted crossing so a battlefield resize cannot strand the turn',()=>{
 const h=harness();h.b.evacuation!.boarded++;
 h.p.play(h.scene,h.layer,h.b,h.actor,h.done);h.families.forEach(f=>f.destroy());h.p.settle(h.scene);
 h.flush();expect(h.p.active).toBe(false);expect(h.done).toHaveBeenCalledTimes(1);
});
