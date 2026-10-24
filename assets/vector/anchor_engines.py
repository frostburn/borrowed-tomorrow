"""Shared native furnace-carrier and optical-engine models.

Run directly to rebuild their battle, world, portrait and engine-prop SVGs without
rewriting chapter maps. Chapter Five's scene exporter uses these same functions.
"""
from pathlib import Path
from xml.sax.saxutils import escape

def rect(x,y,w,h,c):return f'<path d="M{x:g} {y:g}h{w:g}v{h:g}h{-w:g}Z" fill="{c}"/>'

def poly(pts,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+f'" fill="{c}"/>'

def line(pts,c,w=3):return '<polyline points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'

def ellipse(x,y,rx,ry,c):return f'<ellipse cx="{x:g}" cy="{y:g}" rx="{rx:g}" ry="{ry:g}" fill="{c}"/>'

def svg(path,w,h,body):
 path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(path.stem.replace("-"," "))}</title>'+''.join(body)+'</svg>\n')

def carrier(w=224,h=168):
 out=[poly([(8,115),(31,94),(188,94),(216,115),(211,153),(32,164),(7,144)],'#3b5056'),poly([(12,113),(39,96),(184,96),(214,115),(189,132),(32,136)],'#718078'),poly([(8,115),(32,136),(211,124),(211,132),(32,145),(7,133)],'#a4aa90')]
 for x in (35,74,116,157,193):
  out += [ellipse(x,140,16,15,'#31494e'),ellipse(x,140,11,10,'#7e8d80'),poly([(x-9,137),(x-3,131),(x+6,133),(x+9,138),(x,137),(x-4,145)],'#b8b89a'),ellipse(x,140,3,3,'#c5ad79')]
 out += [poly([(38,48),(71,23),(174,23),(198,48),(187,115),(55,122),(29,91)],'#354f53'),poly([(38,48),(71,23),(174,23),(198,48),(158,68),(71,70)],'#8e9275'),poly([(71,70),(158,68),(187,115),(55,122)],'#5e6c5b'),poly([(41,59),(68,76),(61,107),(38,91)],'#142b36'),poly([(46,68),(62,78),(57,99),(43,90)],'#dd8b4c')]
 for x in (83,110,137):out += [rect(x,78,13,26,'#263e45'),rect(x+3,80,7,18,'#d3a05f')]
 # Roof plates, folded edges and visible fittings share the party's broad light planes.
 out += [poly([(71,23),(174,23),(185,34),(91,35),(66,52),(38,48)],'#b2b398'),poly([(91,35),(171,34),(181,42),(151,56),(99,58),(72,51)],'#72847b'),poly([(98,38),(156,37),(151,49),(105,51)],'#a7b19a'),poly([(71,70),(158,68),(164,76),(70,80)],'#c1a571'),poly([(159,75),(174,77),(187,115),(177,114)],'#8d9c88'),poly([(58,111),(176,105),(187,115),(55,122)],'#b39a68')]
 # The open furnace door has a recessed fire; its rim is copper, rather than black piping.
 out += [poly([(41,59),(68,76),(66,83),(42,68),(37,89),(38,91),(34,87)],'#aa8659'),poly([(45,82),(54,77),(59,86),(53,94),(45,91)],'#f1c47c')]
 for x in (83,110,137):out += [rect(x,78,13,3,'#c8b584'),rect(x+3,91,7,3,'#b17b4e')]
 for x,y in [(73,65),(151,62),(72,112),(169,108)]:out += [rect(x,y,3,3,'#e0c58d')]
 out += [rect(153,0,25,37,'#3c555c'),rect(153,7,7,26,'#8c9d8f'),rect(174,12,4,25,'#2f494f'),poly([(146,0),(162,0),(184,0),(180,12),(151,12)],'#b5aa81'),poly([(151,5),(180,5),(180,12),(151,12)],'#8e815f'),poly([(189,50),(213,56),(223,91),(205,104),(188,81)],'#455e64'),poly([(189,50),(213,56),(217,68),(197,64)],'#a0ac94'),poly([(205,77),(219,82),(223,91),(205,104),(200,95)],'#344d54'),line([(191,62),(216,81)],'#c5ad78',5)]
 return out


def ward_engine():
 out=[ellipse(128,217,110,19,'#162e3c'),poly([(22,207),(53,180),(204,180),(237,207),(213,232),(44,232)],'#2c4851'),poly([(22,207),(53,180),(204,180),(237,207),(128,217)],'#8d9f94')]
 for x,flip in [(28,1),(228,-1)]:
  out += [poly([(x,190),(x-10*flip,105),(x+20*flip,47),(x+38*flip,61),(x+17*flip,118),(x+26*flip,190)],'#54736f'),poly([(x+3*flip,183),(x-2*flip,109),(x+22*flip,59),(x+27*flip,65),(x+9*flip,117),(x+18*flip,184)],'#9eb5a5' if flip==1 else '#6f9188'),poly([(x+16*flip,124),(x+21*flip,180),(x+26*flip,190),(x+13*flip,190),(x+8*flip,124)],'#42655e' if flip==1 else '#284744'),ellipse(x+20*flip,65,12,12,'#bfa875'),ellipse(x+18*flip,62,5,5,'#e3d19f' if flip==1 else '#c4b082'),ellipse(x+20*flip,65,3,3,'#847755')]
 out += [poly([(66,163),(66,65),(97,32),(159,32),(190,65),(190,163),(159,194),(97,194)],'#304c54'),poly([(66,65),(97,32),(159,32),(190,65),(171,79),(85,79)],'#bbad87'),poly([(85,79),(108,56),(148,56),(172,79),(172,147),(148,172),(108,172),(85,147)],'#3d5f63'),poly([(93,81),(112,65),(144,65),(164,83),(164,143),(143,162),(113,162),(93,143)],'#b8d3be'),poly([(104,85),(123,71),(148,83),(156,129),(132,151),(108,136)],'#ebdfac'),poly([(128,77),(149,86),(156,129),(132,151),(128,123)],'#94bdb0'),poly([(62,163),(99,183),(159,183),(194,163),(185,194),(151,211),(103,211),(71,194)],'#496969')]
 for x in (82,172):out += [rect(x,94,7,40,'#cfb779'),rect(x-3,93,13,5,'#e5d2a0')]
 # Separate metal, porcelain and optical glass with connected, directional facets.
 out += [poly([(66,65),(85,79),(85,147),(108,172),(99,183),(72,160)],'#74958c'),poly([(172,79),(190,65),(190,163),(159,194),(151,182),(172,147)],'#2d4d4e'),poly([(75,65),(100,41),(117,41),(98,61),(85,79)],'#d7c595'),poly([(159,32),(190,65),(171,79),(157,59),(139,48)],'#766b51')]
 out += [poly([(93,81),(112,65),(128,69),(108,89),(103,126),(113,162),(93,143)],'#d1dfc2'),poly([(128,77),(149,86),(156,129),(141,144),(142,113)],'#83b0a5'),poly([(104,85),(123,71),(127,92),(115,112),(108,136)],'#f0e4b9'),poly([(128,99),(142,113),(137,136),(128,123)],'#bed7bb')]
 out += [poly([(85,147),(108,172),(148,172),(172,147),(165,163),(151,183),(104,183),(78,160)],'#29484d'),poly([(172,79),(190,65),(190,163),(178,177),(178,94)],'#29474d')]
 for x,y in [(76,83),(180,83),(83,155),(173,155)]:out += [rect(x,y,4,4,'#e0c995')]
 for x in (103,119,135,151):out += [rect(x,193,7,7,'#3c5f5c'),rect(x,193,7,2,'#aec0a5')]
 out += [poly([(22,207),(128,217),(237,207),(229,214),(128,226),(31,216)],'#71887c')]
 out += [poly([(112,33),(115,8),(140,8),(144,33)],'#304d57'),poly([(115,8),(127,0),(140,8),(136,16),(119,16)],'#dfca91'),line([(128,15),(128,32)],'#a2c5b6',4)]
 return out

def export():
 root=Path(__file__).resolve().parents[2];art=root/'public/art/vector';chapter=art/'chapter-five'
 svg(chapter/'furnace-carrier-battle.svg',224,168,carrier())
 svg(art/'furnace-carrier.svg',80,80,['<g transform="translate(3 14) scale(.33)">',*carrier(),'</g>'])
 svg(art/'portrait-furnace-carrier.svg',128,128,['<g transform="translate(-8 5) scale(.64)">',*carrier(),'</g>'])
 svg(chapter/'ward-engine-battle.svg',256,240,ward_engine())
 svg(chapter/'windmere-engine.svg',256,240,ward_engine())
 svg(art/'ward-engine.svg',80,80,['<g transform="translate(5 2) scale(.27)">',*ward_engine(),'</g>'])
 svg(art/'portrait-ward-engine.svg',128,128,['<g transform="translate(-8 0) scale(.56)">',*ward_engine(),'</g>'])
 print('Exported shared furnace and ward-engine SVGs without rewriting maps.')

if __name__=='__main__':export()
