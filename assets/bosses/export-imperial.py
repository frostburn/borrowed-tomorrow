"""Native polygonal imperial vessel and Nell's Lightbearer manifestation. No raster inputs."""
from pathlib import Path
import math
ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'public/art/vector/chapter-six';ART.mkdir(parents=True,exist_ok=True)
INK='#203340';SHADOW='#506b80';BLUE='#819aa8';MARBLE='#e4e5d9';WHITE='#fff0c7';GOLD='#c89b53';RUST='#a35c42';LIGHT='#b3dad0'
def p(points,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="{c}"/>'
def r(x,y,w,h,c):return f'<path d="M{x:g} {y:g}h{w:g}v{h:g}h{-w:g}Z" fill="{c}"/>'
def l(points,c,w=3):return '<polyline points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ring(cx,cy,rx,ry,c,w=8):return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="{c}" stroke-width="{w}"/>'
def vessel(pose='idle'):
 out=[];lift=3 if pose=='charge'else 0
 # A rigid architectural crown and visible clockwork, distinct from the god's halo.
 out+=[p([(85,93),(139,33),(214,51),(264,8),(315,50),(388,30),(444,95),(415,139),(120,140)],INK),p([(97,91),(144,43),(215,62),(264,19),(313,63),(383,41),(432,92),(404,112),(126,113)],GOLD)]
 for x in [145,198,264,329,382]:out+=[r(x-5,63,10,88,SHADOW),p([(x-13,63),(x,41),(x+13,63)],WHITE)]
 out+=[p([(105,148),(146,117),(214,135),(264,111),(315,135),(384,117),(424,148),(392,247),(331,260),(264,248),(195,261),(132,246)],INK),p([(115,150),(151,128),(216,149),(264,126),(313,149),(379,128),(413,150),(381,232),(321,244),(264,231),(204,245),(143,230)],MARBLE)]
 for a,b in [(124,179),(346,401)]:out+=[p([(a,151),(b,146),(b-9,221),(a+18,214)],BLUE),l([(a+12,160),(b-12,157),(b-20,205)],WHITE,5)]
 # Emperor still recognizable inside the collar; the face is neither an aperture nor a halo.
 out+=[p([(238,78),(249,66),(278,65),(293,82),(290,115),(275,132),(251,125),(239,107)],INK),p([(244,82),(253,73),(276,73),(286,84),(283,111),(272,121),(253,116),(245,101)],'#bf9a76'),p([(264,74),(277,73),(286,84),(283,111),(272,121),(269,100)],'#8d725e'),p([(237,77),(237,55),(249,65),(263,48),(275,64),(289,54),(291,79)],GOLD),r(247,89,12,4,INK),r(272,87,12,4,INK),l([(255,110),(273,113),(280,108)],INK,3)]
 # Articulated hands seated on the imperial armrests.
 for side in [-1,1]:
  def mirror(pts):return [(264+side*(x-264),y)for x,y in pts]
  out+=[p(mirror([(148,137),(118,159),(94,202),(111,217),(141,191),(173,159)]),SHADOW),p(mirror([(102,192),(82,200),(76,220),(90,231),(113,224),(125,210)]),GOLD),l(mirror([(89,211),(111,208),(118,214)]),WHITE,3)]
 out+=[p([(213,145),(264,132),(315,145),(308,202),(265,232),(220,203)],GOLD),p([(225,151),(264,142),(303,151),(296,194),(264,216),(231,195)],SHADOW),p([(244,153-lift),(265,143-lift),(285,157-lift),(279,191),(263,204),(248,190)],WHITE if pose in('cast','charge')else LIGHT),p([(244,153-lift),(263,165),(263,204),(248,190)],BLUE)]
 for y in [226,242,258]:out+=[p([(176,y),(264,y-17),(352,y),(334,y+8),(264,y-3),(194,y+8)],GOLD)]
 if pose=='cast':
  for x in [74,176,352,454]:out+=[p([(x,163),(x+7,186),(x,242),(x-7,188)],WHITE)]
 return out

def lightbearer(pose='idle'):
 out=[];opened=pose=='resist';dy=-3 if pose=='rise'else 0
 # Broken triangular rays, asymmetrical cloth-like planes: a mortal vessel, no god body.
 out += [ring(264,111,96,86,INK,16),ring(264,111,95,86,GOLD,8)]
 for i in range(11):
  a=math.radians(204+i*27);x=264+math.cos(a)*105;y=111+math.sin(a)*94
  out += [p([(x+math.sin(a)*9,y-math.cos(a)*9),(264+math.cos(a)*139,111+math.sin(a)*125),(x-math.sin(a)*9,y+math.cos(a)*9)],GOLD)]
 for side in [-1,1]:
  def m(pts):return [(264+side*(x-264),y+dy)for x,y in pts]
  out += [p(m([(246,124),(209,102),(170,114),(156,151),(122,171),(97,237),(148,218),(189,199),(211,237),(238,207)]),INK),p(m([(242,130),(208,115),(181,122),(170,157),(139,178),(119,218),(155,202),(194,184),(214,218),(236,195)]),MARBLE),p(m([(208,115),(213,163),(194,184),(155,202),(176,165),(181,122)]),BLUE),p(m([(242,130),(236,195),(214,218),(211,170)]),GOLD)]
 out += [p([(235,183),(264,169),(295,183),(310,254),(281,239),(264,274),(245,243),(215,256)],INK),p([(240,189),(264,179),(289,190),(296,239),(278,227),(264,255),(249,231),(229,242)],BLUE)]
 # Nell: copper hair, two braids, orange work jacket, full connected limbs.
 out += [p([(247,91),(253,81),(272,82),(282,94),(279,112),(269,122),(252,115)],INK),p([(251,93),(257,87),(271,88),(277,96),(274,109),(267,116),(255,111)],'#d6b18c'),p([(248,92),(252,80),(268,78),(280,87),(281,99),(270,91),(261,92),(255,99)],'#a96040'),p([(249,104),(254,108),(253,132),(248,144),(244,139),(248,121)],'#a96040'),p([(277,104),(281,108),(282,129),(287,140),(283,145),(276,132)],'#8c5039'),p([(253,118),(269,118),(280,126),(280,160),(269,168),(250,164),(245,137)],RUST),p([(253,122),(260,128),(259,158),(249,161),(248,138)],'#d29354'),p([(259,159),(275,159),(280,187),(270,191),(265,170),(259,191),(250,188)],INK),p([(250,166),(257,166),(257,188),(250,190)],SHADOW),p([(270,166),(275,166),(280,185),(273,189)],BLUE),p([(249,186),(258,186),(260,194),(247,194)],INK),p([(273,185),(280,184),(285,191),(274,194)],INK)]
 out += [r(254,101,4,3,INK),r(270,101,4,3,INK),l([(265,104),(263,108),(267,109)],'#976c51',2),r(260,113,8,2,'#8d5645')]
 # Her anatomical right arm is on screen-left; it closes the lantern during resistance.
 hand=142 if opened else 163
 out += [p([(247,126),(241,128),(233,143),(237,hand),(244,hand),(241,146),(253,136)],RUST),p([(278,125),(286,133),(290,151),(284,156),(278,145),(271,138)],RUST),p([(237,hand-3),(243,hand-3),(244,hand+3),(238,hand+4)],'#d6b18c'),l([(238,hand+3),(238,hand+10)],GOLD,3),r(229,hand+10,17,22,INK),r(232,hand+13,11,14,SHADOW if opened else WHITE),r(229,hand+31,17,3,GOLD)]
 if pose=='cast':out += [p([(238,hand+19),(211,205),(173,252),(226,228),(237,hand+22),(283,232),(344,251),(267,191)],WHITE)]
 if opened:out += [p([(220,152),(229,165),(217,198),(206,206)],WHITE),p([(304,142),(310,161),(319,194),(309,179)],WHITE)]
 return out

def support(opened=False):
 if opened:return [p([(5,143),(18,130),(72,130),(91,143),(77,159),(17,159)],INK),p([(18,139),(29,130),(72,134),(79,144),(27,149)],MARBLE),p([(28,131),(32,109),(47,117),(49,137)],BLUE),p([(54,134),(64,117),(79,126),(73,142)],GOLD),r(31,143,37,5,SHADOW)]
 return [p([(5,143),(16,31),(48,5),(80,31),(91,143),(77,159),(17,159)],INK),p([(17,139),(25,37),(48,19),(70,38),(79,139),(68,147),(28,147)],MARBLE),p([(48,19),(70,38),(79,139),(60,142),(58,45)],BLUE),r(33,57,27,63,INK),r(39,61,15,51,SHADOW if opened else LIGHT),p([(22,37),(48,27),(73,38),(69,46),(48,37),(26,45)],GOLD),r(20,130,57,8,GOLD)]

def write(key,w,h,body):
 (ART/f'{key}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{key.replace("-"," ")}</title>'+''.join(body)+'</svg>\n')
for name,fn,poses in [('imperial',vessel,['idle','charge','cast']),('lightbearer',lightbearer,['idle','rise','cast','resist'])]:
 for pose in poses:write(name+'-'+pose,528,280,fn(pose))
 portrait=ART/f'{name}-portrait.svg'
 if not portrait.exists():portrait.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>'+name+'</title>'+r(0,0,128,128,INK)+'<g transform="translate(-150 -8) scale(.8)">'+''.join(fn())+'</g></svg>\n')
write('imperial-support',96,160,support());write('imperial-support-broken',96,160,support(True))
print('Exported imperial vessel, supports and Lightbearer poses.')
