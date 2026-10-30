import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {SAY,STAGED} from '../src/content/dialogue';
import {artPath} from '../src/content/art-assets';
import {UI_ICONS,OBJECT_CARDS,itemIcon} from '../src/content/ui-art';
import {ITEMS,receiveItem,equipItem,unequipItem} from '../src/rules/inventory';
import {newGame} from '../src/rules/state';
import {buySupply} from '../src/rules/supplies';
import {resourceGains,resourceSnapshot} from '../src/game/rewards';

it('uses object cards for reading and leaves narration and character cues intact',()=>{
 expect(SAY('Transfer slip','Text.').portrait).toBe('ui/portrait-letter');
 expect(STAGED('The dispatch','Orders.',{cue:'paper'})).toMatchObject({portrait:'ui/portrait-letter',shot:{cue:'paper'}});
 expect(SAY('The old diagram','Text.').portrait).toBe('ui/portrait-chart');
 expect(SAY('The founding pledge','Text.').portrait).toBe('ui/portrait-ledger');
 expect(SAY('Nell','Words.').portrait).toBe('portrait-nell');
 expect(SAY('The dispatch','Text.','petra').portrait).toBe('portrait-petra');
 expect(SAY('The deck','The party boards.').portrait).toBeUndefined();
 expect(SAY('The broken crystal','A pale fleck catches in the glass.').portrait).toBeUndefined();
 expect(SAY('The household','The room is quiet.').portrait).toBeUndefined();
 expect(SAY('Ansel','Words.').portrait).toBe('portrait-master');
 expect(SAY('The Benefactor','Words.').portrait).toBe('ui/portrait-light');
 expect(SAY('The Benefactor','Words.','benefactor').portrait).toBe('portrait-benefactor');
 for(const who of ['Supply clerk','The baker','The cart woman','A Cinderbank passenger','A fitter','Palace commandant','The household'])expect(SAY(who,'Words.').portrait).toBeUndefined();
 expect(SAY('Iona','Coats here.').portrait).toBe('portrait-clerk');
});
it('registers small self-contained native icons and full-size dialogue cards',()=>{
 for(const [names,prefix,size]of [[UI_ICONS,'',32],[OBJECT_CARDS,'portrait-',128]]as const)for(const id of names){
  const file=artPath(`ui/${prefix}${id}`);expect(file.endsWith('.svg')).toBe(true);
  const svg=readFileSync(`public/${file}`,'utf8');expect(svg).toContain(`width="${size}" height="${size}"`);expect(svg.length).toBeLessThan(4000);expect(svg).not.toMatch(/<image|<script|href=/);
 }
 for(const id of Object.keys(ITEMS) as (keyof typeof ITEMS)[])expect(UI_ICONS).toContain(itemIcon(id));
});
it('announces real gains, including optional finds and medicines, without treating equipment transfers as loot',()=>{
 const s=newGame(),before=resourceSnapshot(s);receiveItem(s.inventory,'work-coat');s.coins+=24;s.bandages+=2;s.inventory.bag['focus-tonic']=1;
 expect(resourceGains(before,s)).toEqual(expect.arrayContaining([{icon:'marks',name:'marks',quantity:24},{icon:'coat',name:'Reinforced work coat',quantity:1,item:'work-coat'},{icon:'bandage',name:'Bandage',quantity:2},{icon:'tonic',name:'Focus tonic',quantity:1}]));
 const after=resourceSnapshot(s);equipItem(s.inventory,'nell','work-coat');expect(resourceGains(after,s)).toEqual([]);unequipItem(s.inventory,'nell','coat');expect(resourceGains(after,s)).toEqual([]);
});
it('does not report failed purchases, capped rewards, spending or a repeated completed award',()=>{
 const s=newGame();s.coins=0;receiveItem(s.inventory,'work-coat',99);const before=resourceSnapshot(s);
 expect(buySupply(s,'bandage')).toBe(false);expect(receiveItem(s.inventory,'work-coat')).toBe(false);s.bandages--;expect(resourceGains(before,s)).toEqual([]);
 s.coins+=10;expect(resourceGains(before,s)).toEqual([{icon:'marks',name:'marks',quantity:10}]);expect(resourceGains(resourceSnapshot(s),s)).toEqual([]);
});
