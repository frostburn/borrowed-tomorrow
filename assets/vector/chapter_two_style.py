"""Angular harbor/ward/terrace scenery with registered local illumination.

Shared originals remain editable. Only Chapter Two selects these variants.
The quay/terrace/wall modules agree at their joins using world coordinates.
"""
import json,re
from pathlib import Path
from xml.etree import ElementTree as ET
from station import NS,fmt
from scene_lighting import spill as ground_spill

ROOT=Path(__file__).resolve().parents[2]
LIGHTS=json.loads((ROOT/'src/content/chapter-two/lighting.json').read_text())
COOL={
 '#71838a':'#52677f','#819398':'#60768c','#5e7580':'#3d556e','#9ba9a6':'#7a8b9c',
 '#657374':'#505e70','#827966':'#65717c','#696956':'#424f63','#91836a':'#80858b',
 '#3c5261':'#2d3f58','#50605e':'#475a71','#39484c':'#26374e','#62716a':'#64758a',
 '#405864':'#3d526c','#334a58':'#30445e','#203b4b':'#21374f','#294858':'#284961',
 '#25465c':'#23425d','#385b65':'#325c73','#55777a':'#67879b',
 '#536b75':'#566881','#87989c':'#8a99a8','#345562':'#3a536d','#6e9096':'#7391a4',
 '#2a4351':'#30445e','#132b3b':'#24354e','#0c1f2f':'#1b2b43',
 '#304653':'#34465f','#53676c':'#526880','#213747':'#293a54','#263e53':'#303d59','#3e5969':'#546889',
 '#78827a':'#798a9b','#638487':'#8197a5','#695547':'#615363','#895e48':'#806469',
 '#112d30':'#243943','#385d4a':'#344f5c','#617857':'#5e7379','#193d37':'#294451','#0c1726':'#18243c',
 '#c2c9bd':'#b5c1cc','#405a68':'#425c74',
}
WARM={**COOL,'#52677f':'#6a727e','#536b75':'#736e77','#a0a190':'#9a8e80','#b7b5a0':'#b6a18a',
      '#345562':'#4c555f','#99866b':'#ac8a67','#87989c':'#a09385','#132b3b':'#313f52',
      '#9c9e8a':'#8c8178','#7e8c84':'#686974','#b0b09a':'#a39787','#667572':'#565c6c'}

def polygon(points,color):return '<polygon points="'+' '.join(fmt(p)for p in points)+'" fill="'+color+'"/>'

def wall_offset(x):
 # Piecewise straight architectural runs; shared endpoints meet exactly.
 knots=[9,-7,6,-10,8,2];t=max(0,min(4.9999,(x-240)/240));i=int(t)
 return knots[i]+(knots[i+1]-knots[i])*(t-i)

def scenery(name,source,scene,ox):
 ward=scene=='infirmary';palette=WARM if ward else COOL
 stitched=name in ('river-wall','ledge','ward-wall')
 variant=(('ward'if ward else'coast')+'/'+str(ox))if stitched else('ward'if ward else'coast')
 folder=ROOT/'public/art/vector/chapter-two-kit'/variant;folder.mkdir(parents=True,exist_ok=True)
 svg=ET.fromstring(source.read_text());w,h=float(svg.get('width')),float(svg.get('height'))
 def point(x,y):
  f=max(0,1-y/h)
  if name=='ward-wall':return x,y+(.3+.7*f)*wall_offset(ox+x)
  if name in ('river-wall','ledge'):
   # Lean connected retaining faces as one structure, never one arch per tile.
   return x,y+(1-y/h)*(8*((ox+x)/1536-.5))
  if name in ('station-house','miners-cottage','coast-coal-shed'):
   return x+f*(18-31*x/w),y+f*(-7+12*x/w)
  if name in ('crate','barrel','fence','fir','lamp'):return x+f*(4-7*x/w),y
  return x,y
 for e in svg.iter():
  for a in ('fill','stroke'):
   if e.get(a)in palette:e.set(a,palette[e.get(a)])
  if e.tag in (NS+'polygon',NS+'polyline'):
   e.set('points',' '.join(fmt(point(*map(float,p.split(','))))for p in e.get('points').split()))
  elif e.tag==NS+'ellipse':
   x,y=point(float(e.get('cx')),float(e.get('cy')));e.set('cx',str(x));e.set('cy',str(y))
 if name=='ledge':
  # Unequal geological seams across the full terrace, not repeating teeth.
  for e in list(svg):
   if e.tag in (NS+'polygon',NS+'polyline'):svg.remove(e)
  tops=[(0,8),(86,-2),(178,14),(292,3),(401,20),(506,9),(617,18),(748,0),(884,15),(1000,4),(1128,18),(1240,2),(1392,13),(1536,6)]
  def top(x):
   a,b=next((a,b)for a,b in zip(tops,tops[1:])if a[0]<=x<=b[0]);return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])
  local=[(0,top(ox))]+[(x-ox,y)for x,y in tops if ox<x<ox+w]+[(w,top(ox+w))]
  body=polygon(local+[(w,h),(0,h)],'#20364d')
  for i,(x,y)in enumerate(tops[:-1]):
   xx,yy=tops[i+1];mid=x+(xx-x)*.62
   body+=polygon([(x-ox,y),(xx-ox,yy),(mid-ox,91),(x-ox-15,155)],['#4f687f','#3b556e','#60788b'][i%3])
  body+=polygon(local+[(x,y+8)for x,y in local[::-1]],'#a9b8c4')
  for element in ET.fromstring('<g xmlns="http://www.w3.org/2000/svg">'+body+'</g>'):svg.append(element)
 if name=='river-wall':
  # Keep existing footprints but soften the arcade repetition with material
  # variation and a continuous, sloping cap (no new black contour strokes).
  for e in svg:
   if e.get('fill')=='#18243c':e.set('fill','#293f56')
 for light in LIGHTS['props'].get(name,[]):
  if name not in ('lamp','engine','collector-machine','ward-stove'):continue
  svg.insert(2,ET.Element(NS+'ellipse',{'cx':str(light['x']),'cy':str(light['y']-light['height']),
   'rx':'19','ry':'23','fill':'#c2e0df'if light.get('color')else'#ffd59c','opacity':'.1'}))
 svg.find(NS+'title').text='Railway '+('ward'if ward else'blue hour')+' · '+name
 metadata=svg.find(NS+'metadata')
 if metadata is not None:metadata.text='Chapter Two angular variant; source: assets/vector/chapter_two_style.py; editable original: art/vector/scenery/'+name+'.svg'
 (folder/(name+'.svg')).write_text(ET.tostring(svg,encoding='unicode')+'\n')
 return 'scene-two-prop-'+variant.replace('/','-')+'-'+name,'art/vector/chapter-two-kit/'+variant+'/'+name+'.svg'

def terrain(kind,base,w,h,scene):
 palette=WARM if scene=='infirmary'else COOL
 for a,b in palette.items():base=base.replace(a,b)
 if kind in ('paving','earth'):
  # Straight tilted contours preserve the playable cell centres. Rebuild the
  # slab courses too: the old long horizontal seams fought the new buildings.
  def skew(m):
   return '<path d="'+re.sub(r'(-?[\d.]+),(-?[\d.]+)',lambda p:fmt((float(p[1]),float(p[2])+7*(float(p[1])/w-.5))),m[1])+'"'
  base=re.sub(r'<path d="([^"]+)"',skew,base,count=1)
 if kind=='paving':
  prefix=base[:base.index('<g clip-path=')];ward=scene=='infirmary'
  out=[prefix,'<g clip-path="url(#paving)">',f'<rect width="{w}" height="{h}" fill="'+('#81786f'if ward else'#52677f')+'"/>']
  for pts,c in [([(0,h*.28),(w*.3,h*.23),(w*.58,h*.4),(w,h*.28),(w,h*.49),(w*.55,h*.54),(w*.24,h*.4),(0,h*.48)],'#9a8d7c'if ward else'#60768c'),
                ([(0,h*.7),(w*.28,h*.61),(w*.61,h*.75),(w,h*.62),(w,h),(0,h)],'#686974'if ward else'#3f546e')]:out.append(polygon(pts,c))
  for i,y in enumerate(range(288,h,79)):
   out.append(f'<path d="M0 {y+9} L{w*.27:g} {y-6} L{w*.63:g} {y+11} L{w} {y-2}" fill="none" stroke="'+('#62616a'if ward else'#3f556e')+'" stroke-width="2"/>')
   for x in range(40+i%3*53,w,193):out.append(f'<path d="M{x} {y+5} L{x-11} {y+64}" fill="none" stroke="'+('#6d6970'if ward else'#455b72')+'" stroke-width="2"/>')
  return ''.join(out)+'</g>'
 if kind=='water':
  # Give the sea its own sparse, irregular reflection bands; keep distant
  # mountain silhouettes from the compiled harbor reference composition.
  base=re.sub(r'<polygon points="[^\"]+" fill="#67879b"/>','',base)
  reflections=[]
  for i,(x,y,length)in enumerate([(35,207,110),(340,187,87),(619,212,143),(990,191,124),(1410,213,94),(3,405,90),(1441,497,87),(8,621,96),(1432,677,109),(63,940,117),(319,966,163),(710,928,89),(1086,963,168),(1352,932,114)]):
   reflections.append(polygon([(x,y),(x+length*.7,y-4),(x+length,y),(x+length*.24,y+3)],'#638399'))
  return base.replace('</g>',''.join(reflections)+'</g>')
 if scene=='cinderbank'and kind=='granite':
  hills=polygon([(0,94),(126,30),(250,83),(389,21),(547,109),(689,48),(834,101),(1010,15),(1156,75),(1318,34),(w,110),(w,292),(0,292)],'#324a63')
  hills+=polygon([(0,202),(177,111),(319,188),(492,104),(653,223),(824,149),(992,216),(1175,122),(w,199),(w,316),(0,316)],'#243b54')
  return base.replace('</g>',hills+'</g>')
 return base

def spill(pieces):return ground_spill(pieces,LIGHTS['props'])
