import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {MAPS} from '../src/content/maps';
import {CIVILIANS} from '../src/content/civilians';
import {artPath} from '../src/content/art-assets';
it('gives unattended goods counters a registered clerk without changing rest access',()=>{
 const ids=["coast-engine","siding-coaches","works-bench","sanctuary-bench","airfield-supply","ship-supply","hammer-supply","forge-supply","dawn-supply","wind-supply","six-supplies","namar-supply","palace-supply","roof-rest","observatory-rest","harbor-stores","watch-rest","glacier-rest","shrine-rest","capital-stores","river-stores","canopy-stores","rainhouse-rest","palace-rest","crown-rest","sill-rest","water-rest","field-rest","ward-seven-rest","season-rest","refuge-seven-rest"];
 const counters=Object.values(MAPS).flatMap(m=>m.objects).filter(o=>ids.includes(o.id));
 expect(counters).toHaveLength(ids.length);
 for(const o of counters){expect(o.rest).toBe(true);expect(o.sprite).toBe('supply-clerk');}
 expect(CIVILIANS['supply-clerk'].name).toBe('Supply clerk');
 const svg=readFileSync('public/'+artPath('supply-clerk'),'utf8');
 expect(svg).toContain('width="80" height="80"');
 expect(MAPS.infirmary.objects.find(o=>o.id==='ward-rest')!.sprite).toBe('dena');
});
