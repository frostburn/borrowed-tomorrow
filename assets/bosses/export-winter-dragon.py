"""Skeld's winter dragon: native planar SVG poses, not a resized raster."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'public/art/vector/chapter-six';ART.mkdir(parents=True,exist_ok=True)
INK='#182e49';DARK='#365477';MID='#658ca6';LIGHT='#b6d7dc';WHITE='#e5eee2';ICE='#8fc5d7'
def poly(points,c):return '<polygon points="'+' '.join(f'{x},{y}'for x,y in points)+f'" fill="{c}"/>'
def dragon(pose='idle'):
 out=[];lift=-5 if pose=='inhale'else 0
 # Two very different wing planes share a single shoulder and broad, low base.
 for flip in (False,True):
  def wing(points,c):out.append(poly([(528-x if flip else x,y+lift)for x,y in points],c))
  wing([(255,116),(187,65),(116,19),(16,6),(55,52),(5,82),(77,93),(37,149),(123,140),(105,191),(196,159),(246,195)],INK)
  wing([(249,119),(183,76),(119,30),(38,18),(76,56),(23,78),(99,87),(60,135),(142,125),(124,173),(196,147),(239,179)],MID if not flip else DARK)
  wing([(183,76),(119,30),(76,56),(99,87),(60,135),(142,125),(124,173),(197,146)],LIGHT if not flip else MID)
  wing([(249,119),(183,76),(197,146),(239,179)],ICE)
  wing([(119,30),(123,62),(99,87),(142,125),(197,146),(183,76)],DARK)
  wing([(38,18),(76,56),(98,63),(83,39)],WHITE)
  wing([(23,78),(99,87),(92,96),(52,92)],LIGHT)
  wing([(60,135),(142,125),(139,136),(92,143)],ICE)
  wing([(124,173),(197,146),(187,158),(148,180)],LIGHT)
 # Tail and grounded claws frame the release; wings reach seven hexes.
 out += [poly([(254,204),(232,228),(179,236),(167,251),(211,263),(304,259),(345,243),(364,249),(347,267),(288,279),(216,272),(181,263),(151,244),(184,220),(228,212)],DARK),poly([(184,239),(219,251),(302,247),(340,238),(318,256),(213,260)],MID)]
 for flip in(False,True):
  def limb(points,c):out.append(poly([(528-x if flip else x,y)for x,y in points],c))
  limb([(246,152),(215,165),(195,202),(178,225),(182,250),(201,256),(221,242),(223,214),(251,200)],INK)
  limb([(241,160),(221,175),(208,209),(190,230),(192,244),(205,245),(212,233),(212,210),(245,192)],MID)
  limb([(190,232),(176,253),(187,248),(192,260),(199,247),(211,253),(207,238)],WHITE)
 out += [poly([(247,99),(277,99),(302,145),(295,207),(276,239),(247,229),(225,189),(229,140)],INK),poly([(245,105),(274,106),(289,147),(281,209),(264,229),(244,217),(235,177),(239,139)],MID),poly([(251,129),(271,129),(278,169),(264,219),(249,204),(244,167)],LIGHT)]
 for y,w in [(146,13),(163,15),(181,13),(199,9)]:out.append(poly([(264-w,y),(264,y+7),(264+w,y),(264+9,y+11),(264,y+16),(264-9,y+11)],ICE))
 # Jagged crown grows out of the long skull; no god-like halo or human face.
 out += [poly([(243,102),(224,68),(221,35),(244,62),(252,27),(266,62),(286,29),(288,69),(308,50),(299,95),(283,121),(245,122)],INK),poly([(238,80),(230,52),(249,78),(255,48),(266,80),(281,51),(281,83),(298,66),(288,101)],LIGHT),poly([(244,89),(264,77),(285,91),(291,122),(281,146),(251,146),(235,121)],DARK),poly([(245,95),(263,86),(282,97),(278,121),(266,135),(245,123)],MID),poly([(247,95),(262,88),(261,111),(246,119)],LIGHT),poly([(238,110),(252,112),(254,118),(242,117)],WHITE),poly([(273,112),(287,109),(283,117),(272,119)],WHITE),poly([(244,114),(251,114),(250,118),(244,118)],INK),poly([(276,114),(282,113),(281,118),(276,119)],INK)]
 jaw=8 if pose=='breath'else 3 if pose=='inhale'else 0
 out += [poly([(246,126),(264,134),(281,125),(282,139+jaw),(265,153+jaw),(246,141+jaw)],INK),poly([(248,139+jaw),(265,146+jaw),(279,137+jaw),(269,155+jaw),(257,153+jaw)],ICE)]
 if pose in('inhale','breath'):out += [poly([(251,133),(264,140),(277,132),(275,141+jaw),(263,148+jaw),(252,142+jaw)],'#9ee7e5'),poly([(253,135),(257,143),(260,137),(267,144),(273,135)],WHITE)]
 if pose=='shatter':out += [poly([(179,246),(166,258),(182,256),(176,269),(191,257),(205,266),(203,253)],ICE),poly([(347,246),(361,258),(346,256),(353,269),(338,257),(324,266),(326,253)],WHITE)]
 return out
for pose,key in [('idle','winter-dragon'),('inhale','dragon-inhale'),('breath','dragon-breath'),('shatter','dragon-shatter')]:
 (ART/f'{key}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="528" height="280" viewBox="0 0 528 280"><title>Winter dragon {pose}</title>'+''.join(dragon(pose))+'</svg>\n')
# A deliberate crop from the same editable vector geometry, with native portrait dimensions.
p=ART/'dragon-portrait.svg'
if not p.exists():p.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>Winter dragon</title><path d="M0 0H128V128H0Z" fill="#263e53"/><g transform="translate(-158 -8) scale(.84)">'+''.join(dragon())+'</g></svg>\n')
print('Exported winter dragon poses.')
