"""Larkspur's opening art study: crooked dollhouse forms at festival blue hour.

Only the station compiler uses these variants. Shared originals, story layouts,
railway geometry, ground anchors and all other maps remain independent.
Rebuild: python3 assets/vector/chapter-one.py --map station
"""
from xml.etree import ElementTree as ET
from math import sin,pi,hypot
import re

NS='{http://www.w3.org/2000/svg}'
ET.register_namespace('','http://www.w3.org/2000/svg')
# Cool ambient light keeps warm oil/crystal windows and lamps visibly luminous.
COLORS={
 '#737c76':'#46526a','#80877d':'#56627c','#5f7070':'#35425c','#969789':'#69728b','#667572':'#38475f',
 '#29483e':'#1d3039','#1e3c36':'#172937','#233e36':'#192c37','#315044':'#2a414c','#385546':'#354b55',
 '#756e5b':'#56515e','#827966':'#655b67','#696956':'#474657','#91836a':'#736675',
 '#424e50':'#2b3548','#50605e':'#3e485e','#39484c':'#263246','#62716a':'#4e596d',
 '#304653':'#343d57','#53676c':'#4d5870','#213747':'#242e47','#263e53':'#303957','#3e5969':'#505c7e','#142536':'#1d253d',
 '#78827a':'#69768a','#638487':'#7c879d','#695547':'#59495a','#895e48':'#7a5355',
 '#112d30':'#172737','#385d4a':'#2c4551','#617857':'#4b6068','#193d37':'#1e3542','#0c1726':'#141d32',
 '#a09b7d':'#9c8992','#9a7e58':'#a98b70',
}
MODULES={'station-house','river-wall','stone-steps','market-stall','canopy','fir','lamp','bunting','planter'}

def path(d,fill,**attrs):return ET.Element(NS+'path',{'d':d,'fill':fill,**{k:str(v)for k,v in attrs.items()}})
def fmt(p):return f'{p[0]:.2f},{p[1]:.2f}'

def scenery(name,source,folder):
 if name not in MODULES:return None
 svg=ET.fromstring(source.read_text());w,h=float(svg.get('width')),float(svg.get('height'))
 # A continuous warp bows adjoining edges together. Ground points stay fixed.
 def bend(x,y):
  amount=6 if name=='station-house' else 4 if name in ('market-stall','canopy')else 2
  f=max(0,1-y/h)
  dx=amount*sin(x/w*pi)*(sin(y/h*pi)+.8*f)
  dy=amount*.7*sin(x/w*2*pi)*sin(y/h*pi)
  if name=='river-wall':dx=0;dy=6*sin(x/w*pi)*sin(y/h*pi)
  if name in ('lamp','bunting','planter'):dx*=.4;dy*=.3
  return x+dx,y+dy
 for e in svg.iter():
  for attr in ('fill','stroke'):
   if e.get(attr)in COLORS:e.set(attr,COLORS[e.get(attr)])
  if e.tag in (NS+'polygon',NS+'polyline'):
   pts=[tuple(map(float,p.split(',')))for p in e.get('points').split()]
   closed=e.tag==NS+'polygon';pairs=list(zip(pts,pts[1:]+pts[:1]if closed else pts[1:]));d='M'+fmt(bend(*pts[0]))
   for a,b in pairs:
    fa,fb=bend(*a),bend(*b);mid=bend((a[0]+b[0])/2,(a[1]+b[1])/2)
    control=(2*mid[0]-(fa[0]+fb[0])/2,2*mid[1]-(fa[1]+fb[1])/2)
    d+=' Q'+fmt(control)+' '+fmt(fb) if hypot(b[0]-a[0],b[1]-a[1])>20 else ' L'+fmt(fb)
   if closed:d+=' Z'
   e.tag=NS+'path';del e.attrib['points'];e.set('d',d)
  elif e.tag==NS+'ellipse':
   x,y=bend(float(e.get('cx')),float(e.get('cy')));e.set('cx',str(x));e.set('cy',str(y))
 if name=='lamp':
  for rx,ry,opacity in [(23,29,.10),(17,22,.14)]:svg.insert(2,ET.Element(NS+'ellipse',{'cx':'24','cy':'28','rx':str(rx),'ry':str(ry),'fill':'#ffd59c','opacity':str(opacity)}))
 if name=='station-house':
  # A gently sagging main eave, leaning chimneys and an uneven dormer silhouette.
  roofs=[e for e in svg if e.get('fill')in ('#303957','#505c7e','#1d253d')]
  assert len(roofs)==3
  for e,d in zip(roofs,[
   'M1 94 Q10 56 29 18 Q122 31 241 17 L263 84 Q214 91 167 88 L138 56 L111 94Z',
   'M9 79 Q18 51 32 25 Q130 38 239 24 L253 65 Q207 76 165 72 L138 47 L108 82Z',
   'M6 81 Q59 90 108 82 L138 50 L168 81 Q215 85 259 75 L263 85 Q213 97 166 92 L138 62 L111 96 Q55 104 1 95Z',
  ]):e.set('d',d)
 svg.find(NS+'title').text='Larkspur festival night · '+name
 metadata=svg.find(NS+'metadata')
 if metadata is not None:metadata.text='Station-only moonlit, gently bowed variant of '+str(source.relative_to(source.parents[4]))
 out=folder/(name+'.svg');out.write_text(ET.tostring(svg,encoding='unicode')+'\n')
 return 'scene-station-prop-'+name,'art/vector/scenes/station/'+name+'.svg'

def lamplight(x,y):
 # Uneven, transparent spill retains the stone beneath without a bullseye rim.
 return f'<path d="M{x-94} {y-5} Q{x-63} {y-41} {x-17} {y-35} Q{x+67} {y-29} {x+99} {y+3} Q{x+71} {y+36} {x+9} {y+32} Q{x-66} {y+31} {x-94} {y-5}Z" fill="#f3bd7c" opacity=".08"/><ellipse cx="{x}" cy="{y}" rx="53" ry="19" fill="#f3bd7c" opacity=".13"/>'

def terrain(kind,base,w,h):
 if kind in ('paving','earth'):
  # Bend painted boundaries by less than half a cell; collision stays in Tiled.
  def curve(match):
   result=[]
   for loop in re.findall(r'M(.*?)Z',match[1]):
    points=[tuple(map(float,p))for p in re.findall(r'(-?[\d.]+),(-?[\d.]+)',loop)]
    def bend(x,y):return x,y+5*sin(x/173)*sin(y/h*pi)
    d='M'+fmt(bend(*points[0]))
    for a,b in zip(points,points[1:]+points[:1]):
     count=max(1,int(hypot(b[0]-a[0],b[1]-a[1])/90))
     for i in range(count):
      t0,t1=i/count,(i+1)/count
      at=lambda t:(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t)
      fa,fb=bend(*at(t0)),bend(*at(t1));mid=bend(*at((t0+t1)/2))
      d+=' Q'+fmt((2*mid[0]-(fa[0]+fb[0])/2,2*mid[1]-(fa[1]+fb[1])/2))+' '+fmt(fb)
    result.append(d+'Z')
   return '<path d="'+' '.join(result)+'"'
  base=re.sub(r'<path d="([^"]+)"',curve,base,count=1)
 for a,b in COLORS.items():base=base.replace(a,b)
 if kind!='paving':return base
 # Keep the exact walkable contour; paint softer street courses inside it.
 i=base.index('<g clip-path=');prefix=base[:i];out=[prefix,'<g clip-path="url(#paving)">',f'<rect width="{w}" height="{h}" fill="#46526a"/>']
 out += ['<path d="M0 244 Q200 282 418 259 T1008 268 L1008 364 Q730 304 535 343 T0 324Z" fill="#515d77"/>','<path d="M0 459 Q219 390 392 428 T1008 431 L1008 624H0Z" fill="#38455e"/>','<path d="M181 270 Q256 328 246 459 L309 450 Q326 352 284 275Z" fill="#53617a"/>']
 for i,y in enumerate(range(236,h,67)):
  out.append(f'<path d="M0 {y} Q210 {y-13} 396 {y+4} T760 {y-6} Q914 {y-10} {w} {y+3}" fill="none" stroke="#36435c" stroke-width="2"/>')
  for x in range(50+(i%2)*79,w,157):out.append(f'<path d="M{x} {y+2} Q{x-9} {y+23} {x-6} {y+52}" fill="none" stroke="#39465e" stroke-width="2"/>')
 # Warm light spilling from the station's three windows into the cool street.
 for x in (162,204,324):out.append(f'<path d="M{x-13} 249 L{x+15} 247 L{x+42} 313 Q{x+3} 325 {x-38} 313Z" fill="#e8b879" opacity=".10"/>')
 out.append('</g>');return ''.join(out)
