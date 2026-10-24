"""Angular green-iron conduit kit, native geometry and registered illumination.

Shared originals and the later royal marble remain independent. Connected wall
bays use world coordinates; machinery, stairs and the cinematic gauges retain
their exact anchors. Rebuild with chapter-one.py --chapter three.
"""
import json,re
from pathlib import Path
from xml.etree import ElementTree as ET
from station import NS,fmt
from scene_lighting import spill as ground_spill

ROOT=Path(__file__).resolve().parents[2]
LIGHTS=json.loads((ROOT/'src/content/chapter-three/lighting.json').read_text())
PALETTE={
 '#7f8984':'#647b75','#9c9f90':'#8c9a85','#596d70':'#456063',
 '#142a37':'#243e45','#253f49':'#304c51','#3f6159':'#3e6659',
 '#6f8c7b':'#7b9980','#304f4c':'#315348','#2b4948':'#2c4b47',
 '#bf995b':'#c69e60','#80623e':'#876c48','#a0a18e':'#b4b69a',
 '#8da9a8':'#a2b7a3','#b7c7bd':'#e4cf96','#567780':'#7c9b91','#d1d6bd':'#f5e4b2',
 '#8a9690':'#647b77','#737c76':'#647b77','#80877d':'#788c83',
 '#5f7070':'#506a68','#969789':'#899788','#667572':'#4d6663',
 '#858e85':'#526d64','#989e90':'#718576','#75857f':'#455e59','#7a8981':'#425e57',
 '#607c78':'#456c65','#738b7e':'#658678','#4d686b':'#385956','#48646b':'#32544f',
 '#334a58':'#293e4b','#405864':'#3e5964','#203b4b':'#203641',
 '#384f43':'#253e36','#1e3c36':'#20392f','#233e36':'#243b32','#315044':'#3a5444','#385546':'#4c6450',
 '#40575d':'#344c50','#50605e':'#4c615c','#39484c':'#2b4248','#62716a':'#63756b',
 '#49565a':'#334e50','#566a6b':'#476563','#2f4956':'#294447',
 '#2d404a':'#29434a','#101f2d':'#122833','#263b47':'#203c44',
 '#1b303d':'#203945','#152c3b':'#19323e','#425963':'#3b5958','#294450':'#2a474b',
 '#53676a':'#59736a','#263e4b':'#243f44','#3d5862':'#3e605e','#4a6369':'#4c6d65',
 '#304653':'#304a50','#53676c':'#526e6e','#213747':'#243e46','#263e53':'#29444c',
 '#78827a':'#7d8c7e','#638487':'#6d9390','#112d30':'#243e39','#385d4a':'#3b5a45',
 '#617857':'#697f57','#193d37':'#29483e','#0c1726':'#1d343c',
}

def polygon(points,color):
 return '<polygon points="'+' '.join(fmt(p)for p in points)+'" fill="'+color+'"/>'

def slope(x):
 """Shared endpoints, unequal straight roof/beam runs; never waving walls."""
 knots=[(0,8),(384,-7),(744,9),(1128,-9),(1536,5)]
 x=max(0,min(1536,x));a,b=next((a,b)for a,b in zip(knots,knots[1:])if a[0]<=x<=b[0])
 return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])

def scenery(name,source,scene,ox):
 if name=='lamp'and scene not in ('northglass','battle-capital-arrest'):
  name='conduit-work-light';source=source.with_name(name+'.svg')
 joined=name in ('conduit-factory-wing','works-wall')
 variant=str(ox)if joined else'shared'
 folder=ROOT/'public/art/vector/chapter-three-kit'/variant;folder.mkdir(parents=True,exist_ok=True)
 svg=ET.fromstring(source.read_text());w,h=float(svg.get('width')),float(svg.get('height'))
 # Keep these visible instruments, crystal facets, rail mechanics and steps
 # exact: the cutscene overlays the five individual gauge faces by coordinate.
 rigid=name in ('conduit-controls','conduit-vessel','conduit-work-light','works-stairs','engine','coach','collector-machine','ward-stove')
 def point(x,y):
  f=max(0,1-y/h)
  if rigid:return x,y
  if joined:return x,y+f*slope(ox+x)
  if name=='conduit-dome':return x+f*(14-23*x/w),y+f*(-6+12*x/w)
  if name=='conduit-medical-pavilion':return x+f*(15-25*x/w),y+f*(-5+12*x/w)
  return x+f*(4-7*x/w),y+f*(2-4*x/w)
 for e in list(svg.iter()):
  for a in ('fill','stroke'):
   if e.get(a)in PALETTE:e.set(a,PALETTE[e.get(a)])
  if e.tag==NS+'rect'and not rigid:
   x,y=float(e.get('x','0')),float(e.get('y','0'));ww,hh=float(e.get('width')),float(e.get('height'))
   for a in ('x','y','width','height'):e.attrib.pop(a,None)
   e.tag=NS+'polygon';e.set('points',' '.join(fmt(point(*p))for p in [(x,y),(x+ww,y),(x+ww,y+hh),(x,y+hh)]))
  elif e.tag in (NS+'polygon',NS+'polyline'):
   e.set('points',' '.join(fmt(point(*map(float,p.split(','))))for p in e.get('points').split()))
  elif e.tag==NS+'ellipse':
   x,y=point(float(e.get('cx')),float(e.get('cy')));e.set('cx',str(x));e.set('cy',str(y))
 for light in LIGHTS['props'].get(name,[]):
  # Restrained source halos; window apertures themselves stay sharply faceted.
  if light.get('beam'):continue
  cx,cy=point(light['x'],light['y']-light['height'])
  svg.insert(2,ET.Element(NS+'ellipse',{'cx':str(cx),'cy':str(cy),'rx':'17','ry':'19','fill':'#c1ded0'if light.get('color')else'#ffdaa0','opacity':'.1'}))
 svg.find(NS+'title').text='Green conduit · '+name
 metadata=svg.find(NS+'metadata')
 if metadata is not None:metadata.text='Angular green-iron variant; source: assets/vector/chapter_three_style.py; editable original: art/vector/scenery/'+name+'.svg'
 (folder/(name+'.svg')).write_text(ET.tostring(svg,encoding='unicode')+'\n')
 # Chapter-specific conduit originals have one runtime variant. Keep their
 # canonical keys so the staged escape can still address the real instruments.
 key='scenery-'+name if name.startswith('conduit-')and not joined else'scene-three-prop-'+variant+'-'+name
 return key,'art/vector/chapter-three-kit/'+variant+'/'+name+'.svg'

def angled_boundary(base,w,h):
 def offset(t):
  knots=[-4,6,-3,5,-6,3];i=int(t//168);f=t/168-i
  return knots[i%len(knots)]*(1-f)+knots[(i+1)%len(knots)]*f
 def skew(m):
  loops=[]
  for loop in re.findall(r'M(.*?)Z',m[1]):
   pts=[tuple(map(float,p))for p in re.findall(r'(-?[\d.]+),(-?[\d.]+)',loop)];samples=[]
   for a,b in zip(pts,pts[1:]+pts[:1]):
    count=max(1,int(max(abs(b[0]-a[0]),abs(b[1]-a[1]))/100))
    for i in range(count):
     x=a[0]+(b[0]-a[0])*i/count;y=a[1]+(b[1]-a[1])*i/count
     samples.append(fmt((x+offset(y)*max(0,min(x/24,(w-x)/24,1)),y+offset(x)*max(0,min(y/24,(h-y)/24,1)))))
   loops.append('M'+' L'.join(samples)+'Z')
  return '<path d="'+' '.join(loops)+'"'
 return re.sub(r'<path d="([^"]+)"',skew,base,count=1)

def terrain(kind,base,w,h,scene):
 # One replacement pass avoids accidental recoloring of a replacement color.
 base=re.sub(r'#[0-9a-f]{6}',lambda m:PALETTE.get(m[0],m[0]),base)
 if scene=='relayhall'and kind=='motes':
  return base.replace('x="707" y="394"','x="559" y="420"').replace('x="851" y="394"','x="919" y="396"')
 if scene in ('relayhall','conduit')and kind.startswith('works-pipe-'):
  # Whole rigid pipe runs with elbows and clearance offsets, rather than a
  # ruler-straight rectangular circuit or independently warped tile fragments.
  if kind!='works-pipe-h':return ''
  # Governors feed the side instrument banks; both banks feed the central
  # intake console, whose outlet meets the lower-chamber stair.
  routes=[
   [(324,604),(312,576),(312,450),(336,432),(336,410)],
   [(420,400),(470,400),(488,422),(592,422),(616,446),(704,446),(720,474)],
   [(1260,656),(1248,640),(1248,490),(1232,468),(1232,400),(1188,376)],
   [(1020,376),(980,376),(956,398),(908,398),(884,422),(848,422),(832,474)],
   [(768,510),(768,548),(744,572),(744,690),(760,706),(760,790)]]if scene=='relayhall'else[
   [(864,444),(880,444),(900,436),(914,444),(980,444),(994,430),(1020,430),(1032,442),(1080,442)],
   [(1032,442),(1032,486),(1020,500),(1020,580),(1008,592),(1008,624),(1020,636),(1020,744)],
   [(324,600),(324,630),(338,646),(338,710),(324,724),(324,792)]]
  out=[]
  for pts in routes:
   for color,width in [('#36594f',9),('#6a8b70',6),('#b3b997',2)]:
    out.append('<polyline points="'+' '.join(fmt(p)for p in pts)+f'" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="bevel"/>')
  return ''.join(out)
 if kind in ('works-stone','works-deck'):
  # Both materials share one world-space slab field, including lighting planes
  # and joints. The service strip must not restart courses or change their tint.
  prefix=base[:base.index('<g clip-path=')]
  out=[prefix,f'<g clip-path="url(#{kind})"><rect width="{w}" height="{h}" fill="#7b8e7d"/>',
   polygon([(0,260),(w,280),(w,500),(0,480)],'#859784'),
   polygon([(0,680),(w,700),(w,h),(0,h)],'#728674')]
  for i,y in enumerate(range(61,h,112)):
   out.append(f'<path d="M0 {y} L{w} {y+w*.013:g}" fill="none" stroke="#587365" stroke-width="2"/>')
   for x in range(56+(i%2)*112,w,224):
    yy=y+x*.013
    out.append(f'<path d="M{x} {yy:g} L{x-9} {yy+112-9*.013:g}" fill="none" stroke="#587365" stroke-width="2"/>')
  return ''.join(out)+'</g>'
 if scene=='conduit'and kind=='cave-wall':
  # Exposed rock is a broken geological face, not a rectangular factory wall.
  # Its foot meets the existing service floor; all new height is behind actors.
  crest=[(192,213),(260,166),(383,184),(469,144),(600,186),(712,130),(850,170),(967,139),(1097,190),(1214,146),(1370,193)]
  body=polygon(crest+[(1368,359),(1220,353),(1118,367),(962,351),(790,364),(615,350),(451,365),(302,354),(192,362)],'#314e50')
  faces=[([(192,213),(260,166),(383,184),(329,247),(242,337),(192,362)],'#46645f'),
   ([(383,184),(469,144),(600,186),(548,263),(451,365),(329,247)],'#28464a'),
   ([(600,186),(712,130),(850,170),(776,241),(790,364),(615,350),(548,263)],'#5b756b'),
   ([(850,170),(967,139),(1097,190),(1043,265),(962,351),(790,364),(776,241)],'#345654'),
   ([(1097,190),(1214,146),(1370,193),(1274,268),(1118,367),(1043,265)],'#4b6c63'),
   ([(1370,193),(1368,359),(1220,353),(1118,367),(1274,268)],'#27494c')]
  return body+''.join(polygon(pts,c)for pts,c in faces)
 if not scene.startswith('battle-')and kind in ('paving','grass','works-stone','works-deck','cave-roof','cave-wall','cave-floor','cave-ledge'):
  base=angled_boundary(base,w,h)
 if kind in ('works-stone','works-deck','paving'):
  prefix=base[:base.index('<g clip-path=')];steel=kind=='works-deck'
  colors=['#486c62','#577b6c','#3a5c57']if steel else['#586f66','#6b8072','#49625b']if kind=='works-stone'else['#647b77','#758a80','#506963']
  if scene not in ('northglass','battle-capital-arrest'):
   colors=['#708e7a','#7b9782','#668571']if steel else['#7b8e7d','#859784','#728674']
  out=[prefix,f'<g clip-path="url(#{kind})"><rect width="{w}" height="{h}" fill="{colors[0]}"/>']
  out += [polygon([(0,h*.24),(w*.29,h*.21),(w*.57,h*.39),(w,h*.27),(w,h*.48),(w*.55,h*.51),(w*.24,h*.37),(0,h*.43)],colors[1]),
          polygon([(0,h*.73),(w*.28,h*.62),(w*.62,h*.77),(w,h*.65),(w,h),(0,h)],colors[2])]
  seam='#36564f'if steel else'#4b655d'
  step=96 if steel else 112
  for i,y in enumerate(range(80 if scene.startswith('battle-')else 285,h,step)):
   out.append(f'<path d="M0 {y+8} L{w*.28:g} {y-7} L{w*.61:g} {y+10} L{w} {y-3}" fill="none" stroke="{seam}" stroke-width="2"/>')
   for x in range(56+i%3*71,w,237):
    out.append(f'<path d="M{x} {y+2} L{x-13} {y+step-10}" fill="none" stroke="{seam}" stroke-width="2"/>')
    if steel:
     for xx,yy in [(x+6,y+12),(x-19,y+step-22)]:out.append(f'<rect x="{xx}" y="{yy}" width="3" height="3" fill="#9e936c"/>')
  return ''.join(out)+'</g>'
 if kind=='works-cutaway':
  # Replace repeated ruler-straight strips with one continuous chamfered lip.
  def tilt(m):
   x,y,ww,hh=map(float,m.groups()[:4]);color=m[5]
   if hh>=20:y-=8;hh+=8
   return polygon([(x,y+slope(x)*.4),(x+ww,y+slope(x+ww)*.4),(x+ww,y+hh+slope(x+ww)*.4),(x,y+hh+slope(x)*.4)],color)
  return re.sub(r'<rect x="([\d.-]+)" y="([\d.-]+)" width="([\d.-]+)" height="([\d.-]+)" fill="(#[a-f0-9]+)"/>',tilt,base)
 return base

def spill(pieces,scene):
 if scene in ('northglass','battle-capital-arrest'):return ground_spill(pieces,LIGHTS['props'])
 # Diffused work-room illumination: broad low-opacity pools, no spotlight cones
 # or concentric bullseyes. Actor light uses the same reduced local strength.
 out=[]
 for name,x,y in pieces:
  for light in LIGHTS['props'].get(name,[]):
   cx,cy=x+light['x'],y+light['y'];color='#c4dcc3'if light.get('color')else'#f3d49c'
   out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="160" ry="68" fill="{color}" opacity=".025"/>')
 return ''.join(out)
