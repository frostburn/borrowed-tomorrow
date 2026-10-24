"""Larkspur's opening art study: crooked dollhouse forms at festival blue hour.

Only the station compiler uses these variants. Shared originals, story layouts,
railway geometry, ground anchors and all other maps remain independent.
Rebuild: python3 assets/vector/chapter-one.py --map station
"""
from xml.etree import ElementTree as ET
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

def scenery(name,source,folder,placement_x=0):
 if name not in MODULES:return None
 svg=ET.fromstring(source.read_text());w,h=float(svg.get('width')),float(svg.get('height'))
 # Straight edges join at deliberately skewed corners. No sinusoidal warping:
 # narrowing walls, tilted lintels and splayed supports supply the dollhouse feel.
 def crook(x,y):
  f=max(0,1-y/h)
  if name=='station-house':return x+f*(22-36*x/w),y+f*(-9+17*x/w)
  if name=='river-wall':return x,y+f*(20-(placement_x-432+x)*.035)
  if name=='market-stall':return x+f*(15-24*x/w),y+f*(8-13*x/w)
  if name=='lamp':return x+f*4,y
  if name in ('canopy','fir'):return x+f*(5-8*x/w),y
  return x+f*(4-6*x/w),y+f*(3-5*x/w)
 if name=='river-wall':
  # One slanted parapet across all three spans, including their shared joins.
  polygons=[e for e in svg if e.tag==NS+'polygon']
  for e,pts in zip(polygons,['0,14 192,14 192,96 0,96','0,4 192,4 192,17 0,17','0,17 192,17 192,32 0,32']):e.set('points',pts)
 for e in svg.iter():
  for attr in ('fill','stroke'):
   if e.get(attr)in COLORS:e.set(attr,COLORS[e.get(attr)])
  if e.tag in (NS+'polygon',NS+'polyline'):
   pts=[tuple(map(float,p.split(',')))for p in e.get('points').split()]
   e.set('points',' '.join(fmt(crook(*p))for p in pts))
  elif e.tag==NS+'ellipse':
   x,y=crook(float(e.get('cx')),float(e.get('cy')));e.set('cx',str(x));e.set('cy',str(y))
 if name=='lamp':
  for rx,ry,opacity in [(23,29,.10),(17,22,.14)]:svg.insert(2,ET.Element(NS+'ellipse',{'cx':'24','cy':'28','rx':str(rx),'ry':str(ry),'fill':'#ffd59c','opacity':str(opacity)}))
 if name=='bunting':
  # Warm paper lanterns hang between the pennants, above the staged action.
  for x,y in [(21,25),(75,37),(129,40),(183,30)]:
   svg.append(ET.Element(NS+'ellipse',{'cx':str(x),'cy':str(y+7),'rx':'15','ry':'18','fill':'#ffd28a','opacity':'.13'}))
   svg.append(path(f'M{x} {y-3} L{x} {y+2}','none',stroke='#a98b70',**{'stroke-width':2}))
   svg.append(path(f'M{x-5} {y+3} L{x+4} {y+2} L{x+6} {y+12} L{x+1} {y+17} L{x-5} {y+13}Z','#d99350'))
   svg.append(path(f'M{x-3} {y+4} L{x+2} {y+3} L{x+3} {y+12} L{x} {y+15} L{x-3} {y+12}Z','#ffe2a3'))
 if name=='station-house':
  # Explicit angular roof planes: one high corner, an off-centre dormer and
  # slanted eaves. Keep this architecture faceted, rather than rubbery.
  roofs=[e for e in svg if e.get('fill')in ('#303957','#505c7e','#1d253d')]
  assert len(roofs)==3
  for e,d in zip(roofs,[
   'M10 88 L43 12 L230 29 L258 89 L165 99 L146 58 L110 91Z',
   'M19 76 L46 20 L228 35 L246 72 L170 82 L147 48 L108 79Z',
   'M15 78 L108 79 L147 51 L171 85 L252 76 L258 89 L164 100 L144 65 L111 94 L10 88Z',
  ]):e.set('d',d)
 svg.find(NS+'title').text='Larkspur festival night · '+name
 metadata=svg.find(NS+'metadata')
 if metadata is not None:metadata.text='Station-only festival-night angular variant of '+str(source.relative_to(source.parents[4]))
 variant=name+('-'+str(placement_x)if name=='river-wall'else'')
 out=folder/(variant+'.svg');out.write_text(ET.tostring(svg,encoding='unicode')+'\n')
 return 'scene-station-prop-'+variant,'art/vector/scenes/station/'+variant+'.svg'

def lamplight(x,y):
 # Uneven, transparent spill retains the stone beneath without a bullseye rim.
 return f'<path d="M{x-94} {y-5} Q{x-63} {y-41} {x-17} {y-35} Q{x+67} {y-29} {x+99} {y+3} Q{x+71} {y+36} {x+9} {y+32} Q{x-66} {y+31} {x-94} {y-5}Z" fill="#f3bd7c" opacity=".08"/><ellipse cx="{x}" cy="{y}" rx="53" ry="19" fill="#f3bd7c" opacity=".13"/>'

def terrain(kind,base,w,h):
 if kind in ('paving','earth'):
  # Slant painted boundaries by less than half a cell; collision stays in Tiled.
  def skew(match):
   result=[]
   for loop in re.findall(r'M(.*?)Z',match[1]):
    points=[tuple(map(float,p))for p in re.findall(r'(-?[\d.]+),(-?[\d.]+)',loop)]
    def tilt(x,y):return x,y+8*(x/w-.5)*min(y/h,1-y/h)*2
    d='M'+' L'.join(fmt(tilt(*p))for p in points)
    result.append(d+'Z')
   return '<path d="'+' '.join(result)+'"'
  base=re.sub(r'<path d="([^"]+)"',skew,base,count=1)
 for a,b in COLORS.items():base=base.replace(a,b)
 if kind!='paving':return base
 # Broad, skewed paving courses: straight segments, irregular corners.
 i=base.index('<g clip-path=');prefix=base[:i];out=[prefix,'<g clip-path="url(#paving)">',f'<rect width="{w}" height="{h}" fill="#46526a"/>']
 out += ['<path d="M0 244 L418 266 L1008 249 L1008 350 L535 331 L0 324Z" fill="#515d77"/>','<path d="M0 447 L392 413 L1008 438 L1008 624H0Z" fill="#38455e"/>','<path d="M181 270 L263 361 L246 459 L309 450 L326 352 L284 275Z" fill="#53617a"/>']
 for i,y in enumerate(range(236,h,67)):
  out.append(f'<path d="M0 {y} L396 {y+12} L760 {y-9} L{w} {y+3}" fill="none" stroke="#36435c" stroke-width="2"/>')
  for x in range(50+(i%2)*79,w,157):out.append(f'<path d="M{x} {y+2} L{x-10} {y+55}" fill="none" stroke="#39465e" stroke-width="2"/>')
 # Warm light spilling from the station's three windows into the cool street.
 for x in (162,204,324):out.append(f'<path d="M{x-14} 249 L{x+14} 249 L{x+57} 339 L{x-39} 339Z" fill="#e8b879" opacity=".14"/>')
 # Diffuse spill from the lantern strand ties the visible warm lights to the
 # plaza and keeps Nell's entrance and the arrest within the festival glow.
 out.append('<ellipse cx="574" cy="343" rx="233" ry="112" fill="#f5bf7a" opacity=".09"/><ellipse cx="574" cy="340" rx="158" ry="77" fill="#ffcf8e" opacity=".07"/>')
 out.append('</g>');return ''.join(out)
