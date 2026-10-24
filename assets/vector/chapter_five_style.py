"""Chapter Five's coastal/industrial polygon scenery and shared light sources.

Paint and 24px footing use the same authored perimeters. Mechanical ports,
cinematic anchors, tactical cells and the accepted boss bodies stay rigid.
"""
import json,re
from pathlib import Path
from xml.etree import ElementTree as ET
from scene_lighting import spill
from chapter_five_floors import floor_paint

ROOT=Path(__file__).resolve().parents[2]
NS='{http://www.w3.org/2000/svg}'
ET.register_namespace('','http://www.w3.org/2000/svg')
LIGHTS=json.loads((ROOT/'src/content/chapter-five/lighting.json').read_text())

# Straight but crooked edges, with broad aprons around every registered cast.
OUTLINES={
 'airfield':[(110,568),(666,542),(682,458),(876,444),(903,542),(1429,577),(1396,878),(960,860),(524,882),(132,852)],
 'airship':[(312,468),(446,422),(510,350),(750,324),(1032,352),(1110,415),(1224,462),(1248,692),(1204,816),(782,842),(330,816),(296,674)],
 'hammerplain':[(114,598),(226,565),(254,468),(710,448),(734,410),(900,398),(924,452),(1184,468),(1216,570),(1450,596),(1428,884),(1090,906),(750,880),(396,902),(132,874)],
 'coolingworks':[(142,644),(176,616),(185,464),(660,446),(690,340),(1016,332),(1050,454),(1312,474),(1308,608),(1354,632),(1326,858),(1090,880),(754,856),(408,884),(154,858)],
 'anchorforge':[(116,620),(226,595),(252,446),(640,426),(660,336),(974,344),(996,428),(1312,450),(1332,594),(1430,620),(1400,874),(1180,902),(560,878),(132,900)],
 'dawnwatch':[(114,648),(366,618),(392,488),(734,476),(758,412),(1024,398),(1048,482),(1340,500),(1360,618),(1450,640),(1420,886),(1110,906),(700,880),(350,900),(132,874)],
 'watchbarracks':[(140,620),(178,586),(208,466),(588,452),(596,544),(632,560),(642,365),(922,350),(950,448),(1300,470),(1332,592),(1402,618),(1374,884),(1072,906),(740,880),(380,900),(154,876)],
 'signalwall':[(164,620),(320,592),(346,492),(614,474),(636,388),(928,378),(952,480),(1184,492),(1220,586),(1380,618),(1350,886),(1068,908),(744,880),(424,902),(182,876)],
 'observation':[(238,498),(418,470),(440,388),(790,374),(1100,388),(1122,472),(1305,494),(1284,830),(986,854),(580,836),(250,854)],
 'windmere':[(114,598),(320,566),(348,440),(784,424),(1234,446),(1264,568),(1450,598),(1428,884),(1080,906),(734,880),(368,902),(132,878)],
 'dispensary':[(140,620),(180,590),(208,464),(660,448),(684,336),(1066,326),(1094,452),(1260,472),(1278,588),(1402,620),(1374,888),(1068,906),(678,882),(366,902),(155,870)],
 'mirrorward':[(140,620),(250,592),(276,442),(636,426),(664,340),(972,330),(1000,428),(1286,452),(1308,586),(1402,620),(1376,886),(1100,908),(748,882),(360,902),(156,874)],
 'flagship':[(118,624),(298,594),(329,492),(564,475),(586,412),(956,401),(995,474),(1238,494),(1280,588),(1410,618),(1430,872),(1180,904),(350,892),(126,866)],
}
FIXTURES={
 'airfield':[(432,690),(1100,774)],'airship':[(384,758),(1000,790)],
 'hammerplain':[(552,804),(1280,798)],'coolingworks':[(408,792),(1216,822)],
 'anchorforge':[(408,668),(1230,712)],'dawnwatch':[(510,808),(1296,798)],
 'watchbarracks':[(480,788),(1160,804)],'signalwall':[(444,810),(1176,810)],
 'observation':[(440,640),(1112,652)],'windmere':[],
 'dispensary':[(552,706),(1260,768)],'mirrorward':[(504,728),(1200,744)],
 'flagship':[(432,762),(1270,754)],
}

def poly(pts,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in pts)+f'" fill="{c}"/>'
def line(pts,c,width=2):return '<polyline points="'+' '.join(f'{x:g},{y:g}'for x,y in pts)+f'" fill="none" stroke="{c}" stroke-width="{width}"/>'
def path(pts):return 'M'+' L'.join(f'{x:g},{y:g}'for x,y in pts)+' Z'
def cells(pts,w,h):
 def inside(x,y):
  result=False
  for (ax,ay),(bx,by)in zip(pts,pts[1:]+pts[:1]):
   if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:result=not result
  return result
 return [3 if inside(x*24+12,y*24+12)else 0 for y in range(h)for x in range(w)]

def floor_shapes(pts,w,h,scene):
 out=[f'<defs><clipPath id="floor"><path d="{path(pts)}"/></clipPath></defs><g clip-path="url(#floor)">',*floor_paint(w,h,scene,pts),'</g>']
 for a,b in zip(pts,pts[1:]+pts[:1]):
  if b[0]<a[0]:out.extend([poly([b,a,(a[0],a[1]+19),(b[0],b[1]+19)],'#3f5c63'),line([a,b],'#b5b493',4)])
  elif b[0]>a[0]:out.append(line([a,b],'#9eac96',3))
 return out

def work_lamp():
 return [poly([(3,136),(26,136),(31,143),(0,143)],'#4b6467'),line([(16,135),(16,36)],'#56716e',5),line([(14,134),(14,38)],'#9ba68b',2),
  line([(16,36),(16,30)],'#a69770',4),'<ellipse cx="16" cy="22" rx="7" ry="12" fill="#e9dcb3"/>',poly([(12,16),(16,11),(16,29),(13,30)],'#fff0c6')]

def arena_fixtures():
 out=[]
 for x in (100,904):
  out.extend([line([(x,72),(x,42)],'#b2a581',3),'<ellipse cx="'+str(x)+'" cy="62" rx="7" ry="11" fill="#ecdfb9"/>',poly([(x-3,58),(x,53),(x,68),(x-3,69)],'#fff0cd')])
 return out

def mechanisms(id):
 routes={
  'coolingworks':[(1115,544),(1140,544),(1158,519),(1158,490),(1128,470)],
  'dispensary':[(1063,542),(1110,514),(1090,340),(878,312)],
 }
 pts=routes.get(id);out=[]
 if pts:
  out=[line(pts,'#46646a',10),line(pts,'#ac9a71',6),line(pts,'#d5c08e',2)]
  for x,y in pts[1:-1]:out.extend([poly([(x-9,y+4),(x+9,y+4),(x+13,y+12),(x-13,y+12)],'#5c7674'),line([(x-6,y),(x+6,y)],'#c6ad7c',5)])
 return out

def spill_layer(entries,pts):
 field=spill([(Path(e['url']).stem,e['x'],e['y'])for e in entries],LIGHTS['props'])
 return [f'<defs><clipPath id="spill-floor"><path d="{path(pts)}"/></clipPath></defs><g clip-path="url(#spill-floor)">'+field+'</g>']if field else []

def treatment(name,source,w,h):
 root=ET.fromstring(source)
 # Primary boss bodies retain the accepted shared battle/world geometry.
 if name in ('furnace-carrier-battle','ward-engine-battle','windmere-engine','gantry-carrier'):return source
 architecture=name in ('hangar','casting-hall','watch-barracks-wing','foundry-street','lower-houses','watch-citadel','shelter-front','windmere-pavilion','windmere-canopy')
 def point(x,y):
  if not architecture:return x,y
  height=60 if name=='shelter-front'else h
  f=max(0,1-y/height)
  return x+f*(14-25*x/w),y+f*(-5+12*x/w)
 shadows={'#142a36':'#3a555b','#142f3c':'#425d61','#182d3a':'#3b5961','#1b3441':'#3b575c','#223d49':'#3b585d',
  '#203c48':'#3a575e','#1f3645':'#3b565f','#203946':'#3d5c61','#243c49':'#3f5c62','#233c48':'#3c595f',
  '#1e3947':'#3c5c63','#162f3e':'#38565f','#203f4c':'#3f6269','#1b303b':'#415a5e','#1c3340':'#3b555b',
  '#233e4b':'#3c5b63','#233e4c':'#3b5961','#1c3543':'#39565f','#1b3340':'#3d5860','#203d49':'#3b5960'}
 rect=re.compile(r'M(-?[\d.]+) (-?[\d.]+)h(-?[\d.]+)v(-?[\d.]+)h-?[\d.]+Z')
 for e in root.iter():
  if not name.endswith(('-back','-floor')):
   for attr in ('fill','stroke'):
    if e.get(attr)in shadows:e.set(attr,shadows[e.get(attr)])
  if not architecture:continue
  if e.tag==NS+'path':
   m=rect.fullmatch(e.get('d',''))
   if m:
    x,y,ww,hh=map(float,m.groups());e.tag=NS+'polygon';e.attrib.pop('d');e.set('points',' '.join(f'{xx:g},{yy:g}'for xx,yy in [point(x,y),point(x+ww,y),point(x+ww,y+hh),point(x,y+hh)]))
  elif e.tag in (NS+'polygon',NS+'polyline'):
   e.set('points',' '.join(f'{xx:g},{yy:g}'for xx,yy in [point(*map(float,p.split(',')))for p in e.get('points').split()]))
 # A source halo shares the registered emitter; no painted fake light source.
 for light in LIGHTS['props'].get(name,[]):
  x,y=point(light['x'],light['y']-light['height'])
  root.insert(1,ET.Element(NS+'ellipse',{'cx':str(x),'cy':str(y),'rx':'17','ry':'19','fill':'#f3deb0','opacity':'.07'}))
 return ET.tostring(root,encoding='unicode')+'\n'
