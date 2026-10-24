"""Coastal angular scenery and registered lamps for Chapter Four.

Only computed Chapter Four art uses these treatments. Navigation, story casts,
machine controls and the calibrated bronze ring keep their original anchors.
"""
import json
from pathlib import Path
from xml.etree import ElementTree as ET
from scene_lighting import spill

ROOT=Path(__file__).resolve().parents[2]
NS='{http://www.w3.org/2000/svg}'
ET.register_namespace('','http://www.w3.org/2000/svg')
LIGHTS=json.loads((ROOT/'src/content/chapter-four/lighting.json').read_text())

def poly(pts,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in pts)+'" fill="'+c+'"/>'
def line(pts,c,width=2):return '<polyline points="'+' '.join(f'{x:g},{y:g}'for x,y in pts)+f'" fill="none" stroke="{c}" stroke-width="{width}"/>'

def floor_paint(w,h,steel=False):
 # A single slanted architectural plane, rather than bowed courses or a
 # different pattern every time the navigation rectangles overlap.
 colors=('#627d7e','#6f8987','#536f75')if steel else('#7b8981','#88958a','#6d807b')
 out=[f'<rect width="{w}" height="{h}" fill="{colors[0]}"/>',
  poly([(0,430),(w,430+w*.006),(w,604+w*.006),(0,604)],colors[1]),
  poly([(0,780),(w,780+w*.006),(w,h),(0,h)],colors[2])]
 for i,y in enumerate(range(44,h,96)):
  out.append(line([(0,y),(w,y+w*.006)],'#526c6c'if steel else'#647c75'))
  for x in range(56+(i%2)*104,w,208):
   out.append(line([(x,y+x*.006),(x-8,y+96+(x-8)*.006)],'#526c6c'if steel else'#647c75'))
 return out

def treatment(name,source,w,h):
 svg=ET.fromstring(source)
 architecture=name in ('refuge-ward','harbor-pumphouse','sanctuary-ring')
 # Keep a colored shadow at real overlaps/undersides, without tracing every
 # exterior edge in near-black. The sky, sea and distant silhouettes stay cool.
 shades={'#1c3443':'#304951','#1c3542':'#314b52','#142f40':'#2b444f',
  '#1a3340':'#304a51','#223d48':'#35535a','#243e49':'#35525a',
  '#233e4a':'#35535a','#1d3947':'#35555a','#263f49':'#36535a',
  '#203c4b':'#35545c','#244350':'#36575c'}
 def point(x,y):
  f=max(0,1-y/h)
  if name=='refuge-ward':return x+f*(21-31*x/w),y+f*(-6+15*x/w)
  if name=='harbor-pumphouse':return x+f*(13-23*x/w),y+f*(-7+15*x/w)
  if name=='sanctuary-ring':
   # Instrument paths stay rigid; the weathered hospice wings lean around it.
   if x<190:return x+f*7,y+f*(3-7*x/190)
   if x>449:return x-f*5,y+f*(-4+8*(x-449)/199)
  return x,y
 for e in list(svg.iter()):
  if not name.endswith(('-coast','-floor')):
   for attr in ('fill','stroke'):
    if e.get(attr)in shades:e.set(attr,shades[e.get(attr)])
  if not architecture:continue
  if e.tag==NS+'rect':
   x,y=float(e.get('x','0')),float(e.get('y','0'));ww,hh=float(e.get('width')),float(e.get('height'))
   for a in ('x','y','width','height'):e.attrib.pop(a,None)
   e.tag=NS+'polygon';e.set('points',' '.join(f'{xx:g},{yy:g}'for xx,yy in [point(x,y),point(x+ww,y),point(x+ww,y+hh),point(x,y+hh)]))
  elif e.tag in (NS+'polygon',NS+'polyline'):
   e.set('points',' '.join(f'{xx:g},{yy:g}'for xx,yy in [point(*map(float,p.split(',')))for p in e.get('points').split()]))
 # Sparse halos live on the source fixtures. Their floor spill is a separate
 # flag-aware layer, and the actual emitters illuminate actors at runtime.
 for l in LIGHTS['props'].get(name,[]):
  if l.get('beam'):continue
  x,y=point(l['x'],l['y']-l['height'])
  svg.insert(1,ET.Element(NS+'ellipse',{'cx':str(x),'cy':str(y),'rx':'18','ry':'21','fill':'#ffdda4','opacity':'.08'}))
 return ET.tostring(svg,encoding='unicode')+'\n'

def coastal_lamp():
 root=ET.parse(ROOT/'public/art/vector/scenery/lamp.svg').getroot()
 return [ET.tostring(e,encoding='unicode')for e in root if e.tag not in (NS+'title',NS+'metadata')]

def opal(x,y):
 return [line([(x,y-18),(x,y-9)],'#a48f67',3),
  f'<ellipse cx="{x}" cy="{y}" rx="6" ry="10" fill="#e9dbaf"/>',
  poly([(x-3,y-6),(x,y-9),(x+1,y+6),(x-2,y+7)],'#fff0c5')]

def floor_spill(entries):
 return spill([(Path(e['url']).stem,e['x'],e['y'])for e in entries],LIGHTS['props'])

def drive_link():
 # The winding wheel drives the sea gate's left tower through a supported shaft.
 pts=[(828,509),(855,509),(878,487),(900,487),(918,463),(936,439)]
 out=[line(pts,'#37545a',10),line(pts,'#a0916d',6),line(pts,'#d1b680',2)]
 for x,y in [(855,509),(900,487)]:
  out += [poly([(x-8,y+4),(x+8,y+4),(x+12,y+13),(x-12,y+13)],'#4c6668'),line([(x-6,y),(x+6,y)],'#bca06b',5)]
 return out

def arena_lights():
 return [p for x in (100,904)for p in opal(x,70)]
