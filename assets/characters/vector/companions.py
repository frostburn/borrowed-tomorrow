"""Quiet Nell/Kit poses from the accepted rigs, without mirrored bodies.

Run directly, or through art:six / art:seven. The 80px height, native proportions
and colored sleeve planes match the ordinary cast; no raster inputs/resampling.
"""
from pathlib import Path
import runpy
from draw import nell,Drawing,sleeve,lantern
ROOT=Path(__file__).resolve().parents[3];OUT=ROOT/'public/art/vector'
hero=runpy.run_path(str(Path(__file__).with_name('chapter-two.py')))['hero']
def body(d):return d.svg().split('>',1)[1].rsplit('</svg>',1)[0]
def group(d,x=0):return f'<g transform="translate({x} 0) scale(2 1)">{body(d)}</g>'
def svg(name,w,shapes):
 (OUT/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="80" viewBox="0 0 {w} 80" shape-rendering="crispEdges"><title>{name}</title>'+''.join(shapes)+'</svg>\n')
# Empty hands allow Nell to leave her lantern and Kit his bow by their bags.
nrest=nell('front',unarmed=True);lantern(nrest,(6,53))
(OUT/'nell-rest.svg').write_text(nrest.svg())
(OUT/'kit-rest.svg').write_text(hero('kit','front',unarmed=True).svg())
# A brief standing hug: heads remain separate; sleeves wrap the other's back.
far=Drawing();sleeve(far,(18,24),(22,32),(29,34),'red')
near_nell=Drawing();sleeve(near_nell,(24,24),(29,31),(35,32),'red')
near_kit=Drawing();sleeve(near_kit,(22,25),(13,33),(5,32),'navy')
lamp=Drawing();lantern(lamp,(6,53))
svg('pair-hug',104,[group(lamp),group(far),group(hero('kit','left',arms=False),24),group(nell('right',arms=False)),group(near_nell),group(near_kit,24)])
# Looking out at the water. Nell's right hand meets Kit's left; no body flips.
n=Drawing();sleeve(n,(24,24),(29,34),(32,42),'red');sleeve(n,(15,24),(13,33),(12,40),'red')
k=Drawing();sleeve(k,(16,25),(11,35),(8,42),'navy');sleeve(k,(24,25),(27,32),(28,40),'navy')
svg('pair-hands',128,[group(lamp),group(n),group(k,48),group(nell('back',arms=False)),group(hero('kit','back',arms=False),48)])
print('Exported four native Nell / Kit scene poses')
