"""Chapter One night scenery: angular architecture, local light, native SVGs.

Shared originals and story layouts stay untouched. lighting.json registers the
same lamps/windows for this compiler, the campaign and the Maps workshop.
"""
import json,re
from pathlib import Path
from xml.etree import ElementTree as ET
from station import COLORS,NS,path,fmt
from chapter_one_landforms import crossing,terrain as landform
from scene_lighting import spill as ground_spill

ROOT=Path(__file__).resolve().parents[2]
LIGHTS=json.loads((ROOT/'src/content/chapter-one/lighting.json').read_text())
MECHANICAL={'engine','coach','prison-coach','collector-machine','collector-broken','sun-mural'}
BRIDGES={'footbridge','footbridge-front','stone-steps'}
NIGHT={**COLORS,'#253e48':'#25394b','#86a19c':'#8daeb3','#d5c9a0':'#baaf9c',
       '#49565a':'#414f65','#586267':'#53627a','#3d4f55':'#303f56','#667172':'#66758b',
       '#43575f':'#3b4c61','#354953':'#2f4057','#4d6066':'#4b5e73','#52646a':'#52677d',
       '#4d6067':'#475c73','#7b8580':'#758693','#55777a':'#607f9a','#294858':'#22394e',
       '#203b4b':'#1b3047','#385b65':'#34536e','#617857':'#4b6068'}

def transform(name,x,y,w,h):
 f=max(0,1-y/h)
 if name in MECHANICAL or name in BRIDGES:return x,y
 if name in ('workshop','bakery','station-house','shelter'):
  return x+f*(22-35*x/w),y+f*(-5+11*x/w)
 if name=='river-wall':return x,y+(1-y/h)*(5-5*x/w)
 return x+f*(5-8*x/w),y

def scenery(name,source):
 folder=ROOT/'public/art/vector/chapter-one-kit';folder.mkdir(exist_ok=True)
 out=folder/(name+'.svg')
 svg=ET.fromstring(source.read_text());w,h=float(svg.get('width')),float(svg.get('height'))
 geometry=crossing(name)
 if geometry is not None:
  svg=ET.fromstring(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" viewBox="0 0 {w:g} {h:g}"><title>{name}</title><metadata/>{geometry}</svg>')
 for e in svg.iter():
  for attr in ('fill','stroke'):
   if e.get(attr)in NIGHT:e.set(attr,NIGHT[e.get(attr)])
  if e.tag in (NS+'polygon',NS+'polyline'):
   pts=[tuple(map(float,p.split(',')))for p in e.get('points').split()]
   e.set('points',' '.join(fmt(transform(name,*p,w,h))for p in pts))
  elif e.tag==NS+'ellipse':
   x,y=transform(name,float(e.get('cx')),float(e.get('cy')),w,h);e.set('cx',str(x));e.set('cy',str(y))
 # An actual hanging oil lamp explains the refuge/shed's light, rather than
 # adding an unexplained bright area. It sits just inside the right jamb.
 if name=='shelter':
  svg.append(path('M138 71 L138 79','none',stroke='#bda070',**{'stroke-width':2}))
  svg.append(path('M131 79 L144 78 L146 92 L139 98 L131 94Z','#a97b51'))
  svg.append(path('M134 81 L141 80 L142 91 L138 95 L134 92Z','#ffe0a1'))
 if name in ('engine','collector-machine','lamp'):
  for light in LIGHTS['props'].get(name,[]):
   color='#b9ded4'if light.get('color')else'#ffd59c'
   svg.insert(2,ET.Element(NS+'ellipse',{'cx':str(light['x']),'cy':str(light['y']-light['height']),
    'rx':'16','ry':'20','fill':color,'opacity':'.10'}))
 svg.find(NS+'title').text='Chapter One night · '+name
 metadata=svg.find(NS+'metadata')
 if metadata is not None:
  metadata.text=('Authored crossing; source: assets/vector/chapter_one_landforms.py; reference: 'if geometry is not None else'Angular festival-night variant; editable original: ')+'art/vector/scenery/'+name+'.svg'
 out.write_text(ET.tostring(svg,encoding='unicode')+'\n')
 return 'scene-one-prop-'+name,'art/vector/chapter-one-kit/'+name+'.svg'

def terrain(kind,base,w,h,scene='',layer=0):
 for a,b in NIGHT.items():base=base.replace(a,b)
 # Only painted contours lean; cell centres, real floor and bridge deck stay
 # exact. Straight segments, no sinusoidal displacement or waving masonry.
 if kind in ('paving','earth','water','cave-roof','cave-floor','cave-wall','cave-ledge'):
  def skew(m):
   def corner(t):
    values=[-.8,.35,-.5,.8,.1,-.7,.5];index=int(t//144);f=t/144-index
    return values[index%len(values)]*(1-f)+values[(index+1)%len(values)]*f
   def point(x,y):return fmt((x+7*corner(y)*max(0,min(x/24,(w-x)/24,1)),y+8*corner(x)*max(0,min(y/24,(h-y)/24,1))))
   loops=[]
   for loop in re.findall(r'M(.*?)Z',m[1]):
    pts=[tuple(map(float,p))for p in re.findall(r'(-?[\d.]+),(-?[\d.]+)',loop)];samples=[]
    for a,b in zip(pts,pts[1:]+pts[:1]):
     count=max(1,int(max(abs(b[0]-a[0]),abs(b[1]-a[1]))/80))
     samples.extend(point(a[0]+(b[0]-a[0])*i/count,a[1]+(b[1]-a[1])*i/count)for i in range(count))
    loops.append('M'+' L'.join(samples)+' Z')
   return '<path d="'+' '.join(loops)+'"'
  base=re.sub(r'<path d="([^"]+)"',skew,base,count=1)
 return landform(scene,kind,base,w,h,layer)

def spill(pieces):
 return ground_spill(pieces,LIGHTS['props'])
