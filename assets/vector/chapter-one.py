"""Draw reusable chapter-one scenery as SVG, retaining Tiled IDs and anchors.

No source images or resampling. Run: python3 assets/vector/chapter-one.py
"""
import json,re,math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/art/vector/tiles'
C={
 'ink':'#202d35','navy':'#34475b','slate':'#626d7f','steel':'#8b9b9b',
 'silver':'#b7c1b8','cream':'#d8c59b','white':'#efe1bd','gold':'#d9ae62',
 'copper':'#b7784e','brown':'#80553d','wood':'#9a7151','red':'#b85343',
 'plum':'#825875','teal':'#518589','blue':'#547a96','green':'#55745c',
 'leaf':'#8ca66d','grass':'#718065','grass-dark':'#64765b','grass-light':'#859371',
 'earth':'#b49a75','earth-dark':'#a28b6c','paving':'#c5b99f','mortar':'#b4aa97',
 'ballast':'#929b9a','ballast-dark':'#788786','water':'#405e70','water-light':'#668b97',
 'cave-floor':'#7d8080','cave-wall':'#566570','cave-roof':'#35444f','rock-light':'#6a7a80',
}

class SVG:
 def __init__(self,w,h):self.w=w;self.h=h;self.parts=[]
 def col(self,c):return C.get(c,c)
 def poly(self,pts,fill,edge='ink',width=2):
  pts=' '.join(f'{x:g},{y:g}' for x,y in pts)
  self.parts.append(f'<polygon points="{pts}" fill="{self.col(fill)}"'+(f' stroke="{self.col(edge)}" stroke-width="{width}" stroke-linejoin="round"' if edge else '')+'/>')
 def rect(self,x,y,w,h,fill,edge=None,width=2):
  self.parts.append(f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{self.col(fill)}"'+(f' stroke="{self.col(edge)}" stroke-width="{width}"' if edge else '')+'/>')
 def line(self,pts,color='ink',width=2):
  pts=' '.join(f'{x:g},{y:g}' for x,y in pts)
  self.parts.append(f'<polyline points="{pts}" fill="none" stroke="{self.col(color)}" stroke-width="{width}" stroke-linejoin="round"/>')
 def oval(self,x,y,rx,ry,fill,edge='ink',width=2):
  self.parts.append(f'<ellipse cx="{x:g}" cy="{y:g}" rx="{rx:g}" ry="{ry:g}" fill="{self.col(fill)}"'+(f' stroke="{self.col(edge)}" stroke-width="{width}"' if edge else '')+'/>')
 def content(self):return ''.join(self.parts)
 def file(self):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}" shape-rendering="crispEdges">{self.content()}</svg>\n'


def sun(s,x,y,r):
 for i in range(8):
  a=i*math.pi/4;s.line([(x+math.cos(a)*(r+3),y+math.sin(a)*(r+3)),(x+math.cos(a)*(r+9),y+math.sin(a)*(r+9))],'gold')
 s.oval(x,y,r,r,'gold');s.oval(x,y,r/2,r/2,'cream',None)


def building(name,w,h):
 s=SVG(w,h);roof='red' if name=='bakery' else 'teal' if name=='workshop' else 'navy'
 eave=86 if name!='shelter' else 73
 s.poly([(16,eave),(w-8,eave),(w-8,h-10),(16,h-10)],'cream')
 s.poly([(w-37,eave),(w-8,eave),(w-8,h-10),(w-37,h-10)],'wood')
 for yy in range(eave+13,h-8,18):
  s.line([(18,yy),(w-40,yy)],'paving',1)
  for xx in range(24+(9 if yy%36 else 0),int(w-38),35):s.line([(xx,yy-13),(xx,yy)],'mortar',1)
 if name=='workshop':
  s.poly([(4,eave),(4,55),(48,18),(48,48),(96,14),(96,46),(150,12),(150,42),(w-3,62),(w-3,eave)],roof)
  for x in (48,96,150):s.poly([(x-24,48),(x-4,30),(x-4,48)],'ice' if False else 'silver')
 elif name=='shelter':
  s.poly([(4,eave),(23,35),(w-33,17),(w-1,eave)],roof)
 else:
  s.poly([(3,eave),(39,24),(w-58,24),(w-1,eave)],roof)
  s.poly([(3,eave),(39,24),(w-58,24),(w-32,41),(52,41),(27,eave)],'blue' if name!='bakery' else 'copper',None)
  for y in (54,69):s.line([(25,y),(w-22,y)],'ink',1)
  s.rect(w-72,7,23,39,'brown','ink');s.rect(w-76,5,31,8,'copper','ink')
 s.line([(3,eave),(w-1,eave)],'ink',4);s.line([(15,eave+4),(w-9,eave+4)],'wood',3)
 if name=='workshop':
  s.rect(54,100,w-121,h-111,'brown','ink')
  for x in range(62,int(w-66),14):s.line([(x,101),(x,h-12)],'wood')
  s.line([(54,103),(w-67,h-13)]);s.line([(w-67,103),(54,h-13)])
  s.rect(25,112,25,49,'navy','ink');s.line([(37,113),(37,160)],'gold')
  s.oval(w-37,123,13,13,'gold');s.line([(w-37,112),(w-37,133)],'brown')
 elif name=='shelter':
  s.rect(55,93,w-107,h-103,'navy','ink')
  for x in (22,w-33):s.rect(x,eave,10,h-eave-4,'brown','ink')
  s.rect(38,h-31,w-77,10,'wood','ink')
 else:
  door=156 if name=='bakery' else 119
  s.rect(door,119,40,h-130,'brown','ink');s.rect(door+6,125,27,30,'navy','gold')
  s.oval(door+31,h-39,2,2,'gold',None)
  for x in ((43,96) if name=='bakery' else (40,190)):
   s.rect(x,111,34,46,'navy','ink');s.rect(x+3,114,28,39,'blue')
   s.line([(x+17,112),(x+17,156)],'cream');s.line([(x+2,135),(x+32,135)],'cream')
   s.rect(x-3,156,40,6,'wood','ink')
  if name=='bakery':
   s.poly([(29,101),(133,101),(144,115),(24,115)],'white')
   for x in range(35,135,24):s.poly([(x,101),(x+10,101),(x+12,115),(x-2,115)],'red',None)
  else:
   s.oval(w/2,61,17,19,'cream');s.line([(w/2,48),(w/2,61),(w/2+8,65)],'ink')
 s.rect(12,h-15,w-17,9,'slate','ink')
 return s


def train(name,w,h):
 s=SVG(w,h);ground=h-5;body=h-52
 for x in (49,w-62):
  s.oval(x,ground-11,21,14,'ink');s.oval(x,ground-11,14,10,'slate');s.oval(x,ground-11,5,5,'gold')
 if name=='engine':
  s.rect(34,70,154,h-113,'navy','ink');s.oval(34,99,15,30,'teal');s.rect(38,71,137,56,'teal','ink')
  for x in (65,122,164):s.rect(x,71,7,56,'gold','ink')
  s.poly([(61,72),(64,24),(84,24),(88,72)],'navy');s.rect(58,20,33,8,'copper','ink')
  s.oval(126,66,13,12,'gold');s.rect(121,52,10,14,'gold','ink')
  s.rect(185,55,81,h-91,'brown','ink');s.rect(192,63,64,58,'teal','ink')
  s.rect(202,72,20,34,'navy','gold');s.rect(230,72,20,34,'navy','gold')
  s.poly([(176,55),(180,42),(266,42),(279,55)],'navy')
  s.line([(46,128),(160,128),(176,141)],'gold',4)
  s.oval(39,98,7,10,'gold');s.oval(39,98,3,5,'white',None)
  s.poly([(6,ground-5),(20,body),(37,body),(32,ground-5)],'slate')
 else:
  fill='navy' if name=='prison-coach' else 'green'
  s.poly([(12,56),(27,32),(w-31,32),(w-9,57)],'navy')
  s.line([(30,38),(w-33,38)],'steel')
  s.rect(14,58,w-30,body-47,fill,'ink')
  for x in range(29,int(w-40),42):
   s.rect(x,69,27,37,'ink','gold');s.rect(x+3,72,21,30,'blue')
   if name=='prison-coach':
    for bx in (x+8,x+18):s.line([(bx,71),(bx,105)],'silver')
  s.line([(17,111),(w-20,111)],'gold');s.line([(19,body),(w-20,body)],'gold')
  s.rect(w-61,63,37,body-57,fill,'gold');s.rect(w-53,73,21,30,'navy','ink');s.oval(w-31,body-13,2,2,'gold',None)
 s.rect(21,body+9,w-43,9,'brown','ink');s.line([(49,ground-11),(w-62,ground-11)],'silver',4)
 s.rect(0,ground-14,21,5,'ink');s.rect(w-21,ground-14,21,5,'ink')
 return s


def module(name,w,h):
 if name in ('station-house','workshop','bakery','shelter'):return building(name,w,h)
 if name in ('engine','coach','prison-coach'):return train(name,w,h)
 s=SVG(w,h)
 if name in ('canopy','fir'):
  s.poly([(w*.44,h*.43),(w*.58,h*.43),(w*.61,h-6),(w*.48,h-2),(w*.37,h-5),(w*.45,h*.67)],'brown')
  s.line([(w*.5,h*.65),(w*.3,h*.44)],'wood',4)
  if name=='canopy':
   s.poly([(3,94),(23,46),(61,14),(111,4),(157,18),(198,55),(w-3,105),(198,144),(157,167),(100,174),(49,163),(15,139)],'green')
   s.poly([(16,90),(41,49),(75,29),(117,21),(158,37),(188,70),(167,96),(115,86),(66,107)],'leaf',None)
   s.poly([(40,132),(85,115),(143,120),(181,98),(203,116),(166,149),(105,161),(65,153)],'grass-dark',None)
   s.line([(37,95),(53,75),(79,70)],'green',3);s.line([(120,39),(147,47),(161,66)],'green',3)
  else:
   for y,half in ((5,20),(39,39),(81,57),(123,75)):
    s.poly([(w/2,y),(w/2+half,y+67),(w/2+half*.6,y+75),(w/2,y+64),(w/2-half*.7,y+77),(w/2-half,y+67)],'green')
    s.line([(w/2,y+12),(w/2-half*.65,y+62)],'leaf',3)
 elif name.startswith('collector'):
  if name=='collector-broken':
   s.poly([(13,h-10),(6,h-46),(28,h-66),(40,h-35),(65,h-71),(89,h-46),(110,h-9)],'copper')
   s.poly([(27,h-33),(43,h-48),(65,h-27),(89,h-32),(105,h-7),(20,h-7)],'slate')
   s.line([(21,h-19),(37,h-26),(52,h-12)],'gold',3)
  else:
   s.poly([(15,h-9),(22,63),(36,44),(84,44),(101,64),(108,h-9)],'navy')
   s.rect(34,56,52,h-74,'teal','gold');s.oval(60,54,28,27,'copper')
   s.oval(60,54,19,18,'navy','gold');s.oval(60,54,8,8,'ice' if False else 'silver')
   for x in (26,94):s.rect(x-5,24,10,h-36,'copper','ink');s.oval(x,22,8,6,'gold')
   s.poly([(15,h-9),(37,h-18),(82,h-18),(108,h-9)],'brown')
   s.line([(43,90),(43,h-31)],'gold');s.line([(60,90),(60,h-31)],'gold');s.line([(77,90),(77,h-31)],'gold')
 elif name in ('footbridge','footbridge-front'):
  if name=='footbridge':
   s.rect(0,48,w,24,'wood','ink')
   for x in range(0,w,16):s.line([(x,49),(x,71)],'brown')
   s.rect(0,43,w,6,'brown','ink')
   for x in (8,w-14):s.rect(x,29,8,41,'brown','ink')
  else:
   s.rect(0,88,w,7,'wood','ink')
   for x in (7,w-16):s.rect(x,72,9,43,'brown','ink');s.rect(x-2,70,13,6,'gold','ink')
 elif name=='river-wall':
  s.rect(0,8,w,h-8,'slate','ink');s.rect(0,0,w,13,'silver','ink')
  for x in range(0,w,48):
   s.line([(x,14),(x,h)],'ink');s.line([(x,48),(x+48,48)],'ink')
   s.poly([(x+7,h),(x+7,42),(x+16,25),(x+29,25),(x+39,42),(x+39,h)],'water','ink')
 elif name in ('ledge','sun-mural'):
  s.poly([(5,h-7),(7,31),(24,9),(w-25,5),(w-6,26),(w-3,h-7)],'cave-wall')
  s.poly([(15,h-16),(21,34),(w-24,31),(w-15,h-16)],'slate')
  if name=='sun-mural':
   sun(s,w/2,69,22);s.line([(w/2,100),(w/2-22,126),(w/2+23,126),(w/2,100)],'gold')
   s.line([(30,140),(w-30,140)],'cream')
 elif name=='lamp':
  s.poly([(11,h-4),(15,h-12),(19,h-12),(19,43),(29,43),(29,h-12),(33,h-4)],'navy')
  s.line([(24,42),(24,h-16)],'gold')
  s.rect(12,15,24,29,'gold','ink');s.rect(16,20,16,18,'white');s.line([(24,17),(24,42)],'brown')
  s.poly([(8,15),(24,4),(40,15)],'navy');s.oval(24,5,3,3,'gold')
 elif name=='market-stall':
  s.rect(19,68,w-39,h-73,'brown','ink');s.rect(11,h-42,w-23,33,'wood','ink')
  for x in (15,w-22):s.rect(x,45,7,h-50,'brown','ink')
  s.poly([(1,61),(23,16),(w-27,16),(w-1,61),(w-6,75),(4,75)],'white')
  for x in range(15,w-20,32):s.poly([(x+11,16),(x+25,16),(x+32,74),(x+10,74)],'red',None)
  for x in range(23,w-22,25):s.oval(x,h-46,9,6,'gold')
 elif name in ('crate','supplies'):
  if name=='supplies':
   s.rect(9,22,47,45,'cream','ink');s.line([(18,22),(18,66)],'brown');s.line([(46,22),(46,66)],'brown')
   s.rect(49,51,40,41,'wood','ink');s.line([(50,52),(88,90)]);s.line([(88,52),(50,90)])
  else:
   s.poly([(7,20),(47,8),(66,21),(66,65),(26,70),(7,57)],'wood')
   s.line([(7,20),(26,31),(66,21),(26,31),(26,70)],'brown',3)
   s.line([(29,34),(63,61)]);s.line([(62,25),(29,65)]);s.line([(9,24),(22,60)])
 elif name=='barrel':
  s.oval(w/2,h-11,w/2-5,9,'brown');s.rect(5,19,w-10,h-30,'wood','ink');s.oval(w/2,19,w/2-5,9,'brown')
  for x in (11,23,35):s.line([(x,25),(x,h-14)],'brown')
  for y in (31,h-24):s.rect(5,y,w-10,5,'slate','ink')
 elif name=='planter':
  s.poly([(7,h-30),(w-4,h-30),(w-16,h-6),(19,h-6)],'wood')
  s.rect(4,h-35,w-7,8,'brown','ink')
  for x in range(18,w-9,25):
   s.poly([(x,h-36),(x-8,h-48),(x,h-46),(x+8,h-58),(x+11,h-41)],'green')
   s.oval(x,h-53,4,5,'red')
 elif name=='fence':
  for x in range(5,w,32):s.poly([(x,21),(x+5,15),(x+10,21),(x+10,h-3),(x,h-3)],'wood')
  for y in (30,50):s.rect(0,y,w,7,'brown','ink')
 elif name=='stone-steps':
  for y in range(0,h,16):s.rect(0,y,w,16,'slate','ink');s.rect(0,y,w,6,'silver')
 elif name=='bunting':
  s.line([(1,22),(w/2,41),(w-1,22)],'brown')
  for i,x in enumerate(range(9,w-8,23)):
   y=22+19*(1-abs(x-w/2)/(w/2));s.poly([(x,y),(x+17,y),(x+9,y+23)],('red','gold','teal')[i%3])
 else:raise ValueError(name)
 return s


def terrain(kind,x,y,mask=0):
 s=SVG(24,24);fill={'grass':'grass','earth':'earth','paving':'paving','ballast':'ballast','water':'water','cave-floor':'cave-floor','cave-wall':'cave-wall','cave-roof':'cave-roof','cave-ledge':'cave-wall'}[kind]
 s.rect(0,0,24,24,fill)
 n=(x*47+y*31)%17
 if kind=='grass':
  if n%3==0:s.line([(4+n%8,15),(7+n%8,12),(9+n%8,14)],'grass-dark',1)
  if n%5==0:s.line([(16,6),(18,3),(20,6)],'grass-light',1)
 elif kind=='earth':
  if n%3==0:s.line([(6,17),(10,17)],'earth-dark',1)
 elif kind=='paving':
  s.line([(0,23),(24,23)],'mortar',1)
  s.line([((x+y)%2*12,0),((x+y)%2*12,23)],'mortar',1)
 elif kind=='ballast':
  for a,b in ((3+n%5,5),(13,16+n%3)):s.line([(a,b),(a+3,b-1)],'ballast-dark',1)
 elif kind=='water':
  s.line([(3+n%5,7),(11+n%5,7)],'water-light',1)
  if n%3==0:s.line([(14,19),(23,19)],'blue',1)
 elif kind in ('cave-wall','cave-roof'):
  s.poly([(0,0),(24,0),(24,5+n%7),(10,12+n%6),(0,9)],'cave-wall' if kind=='cave-roof' else 'rock-light',None)
  if n%3==0:s.line([(4,3),(6,12),(2,19)],'navy',1)
 elif kind=='cave-ledge':
  s.poly([(0,0),(24,0),(24,9),(14,15),(0,12)],'silver',None);s.line([(0,12),(14,15),(24,9)],'ink')
 else:
  if n%5==0:s.line([(5,12),(10,11),(15,14)],'rock-light',1)
 if mask:
  # Faceted joins are real transparent cuts, never antialiased feathering.
  top=3 if mask&1 else 0;right=21 if mask&2 else 24;bottom=21 if mask&4 else 24;left=3 if mask&8 else 0
  clip=f'<clipPath id="edge"><polygon points="{left},{top} 11,{max(0,top-2)} {right},{top} {min(24,right+2)},13 {right},{bottom} 13,{min(24,bottom+2)} {left},{bottom} {max(0,left-2)},12"/></clipPath>'
  s.parts=[clip,'<g clip-path="url(#edge)">',*s.parts,'</g>']
 return s


def fitting(name):
 s=SVG(24,24)
 if name=='rail-h':
  for x in (3,16):s.rect(x,0,5,24,'brown','ink',1)
  for y in (5,18):s.rect(0,y,24,3,'ink');s.rect(0,y,24,1,'silver')
 elif name=='platform-edge':
  s.rect(0,0,24,24,'slate');s.rect(0,0,24,5,'cream');s.line([(0,6),(24,6)],'ink',1);s.line([(23,7),(23,23)],'ink',1)
 elif name=='steps':
  for y in range(0,24,8):s.rect(0,y,24,8,'slate');s.rect(0,y,24,3,'silver')
 elif name=='cap':
  s.poly([(5,12),(8,7),(17,7),(20,12),(18,15),(4,15)],'navy');s.line([(8,10),(17,10)],'gold',1)
 elif name=='thread':s.line([(11,0),(13,9),(12,24)],'cream',1)
 elif name=='drops':
  s.poly([(8,3),(5,10),(8,13),(11,10)],'silver',None);s.poly([(18,13),(15,20),(18,23),(21,20)],'white',None)
 elif name=='motes':
  for x,y in ((4,7),(16,3),(21,18)):s.rect(x,y,2,2,'gold')
 else:raise ValueError(name)
 return s


def cavern(kind):
 # Broad rock faces span several cells; avoid a row of sawteeth per tile.
 s=SVG(192,192)
 s.rect(0,0,192,192,'cave-roof' if kind=='cave-roof' else 'cave-wall')
 if kind=='cave-ledge':
  s.poly([(0,0),(192,0),(192,13),(169,19),(143,12),(116,20),(84,14),(56,19),(27,12),(0,17)],'silver',None)
  s.line([(0,17),(27,12),(56,19),(84,14),(116,20),(143,12),(169,19),(192,13)])
  s.poly([(3,26),(31,22),(45,60),(29,114),(5,143)],'rock-light',None)
  s.poly([(78,22),(100,26),(116,84),(99,144),(65,144),(75,81)],'navy',None)
  s.poly([(143,27),(171,25),(184,81),(166,143),(130,143),(150,86)],'cave-roof',None)
  for pts in ([(31,23),(45,60),(35,87)],[(100,26),(116,84),(108,110)],[(171,25),(184,81),(174,114)]):s.line(pts,'ink',1)
 elif kind=='cave-wall':
  for pts,fill in (([(0,0),(61,0),(43,53),(11,101),(0,96)],'rock-light'), ([(67,0),(111,0),(125,61),(101,130),(65,177),(54,101),(74,53)],'slate'), ([(157,0),(191,0),(191,149),(153,169),(137,107),(147,55)],'rock-light')):s.poly(pts,fill,None)
  s.line([(64,0),(47,55),(54,96),(37,149),(42,192)],'navy')
  s.line([(143,0),(131,39),(137,107),(120,154),(126,192)],'navy')
  s.line([(4,102),(31,88),(47,55)],'cave-roof',1)
 else:
  s.poly([(0,15),(49,4),(83,22),(104,68),(69,105),(22,78),(0,85)],'navy',None)
  s.poly([(111,2),(158,13),(192,61),(192,90),(156,63),(127,66)],'cave-wall',None)
  s.poly([(0,144),(41,117),(80,144),(73,189),(0,192)],'navy',None)
  s.line([(88,0),(104,68),(91,91)],'ink',1);s.line([(130,139),(156,121),(179,131),(192,117)],'ink',1)
 return s


def export():
 OUT.mkdir(parents=True,exist_ok=True)
 kit={i['name']:module(i['name'],*i['size']) for i in json.loads((ROOT/'assets/tiles/scenery.json').read_text())}
 kit['footbridge-front']=module('footbridge-front',192,120)
 used={g for f in (ROOT/'src/content/chapter-one/maps').glob('*.json') for l in json.loads(f.read_text())['layers'] for g in l.get('data',[]) if g}
 tileset=json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text())
 pages=[]
 for page in tileset['pages']:
  if not any(page['firstgid']<=g<page['firstgid']+page['tilecount'] for g in used):continue
  defs={};cells=[]
  for tile in json.loads((ROOT/'assets/tiles/pages'/f'{page["name"]}.json').read_text())['tiles']:
   gid=page['firstgid']+tile['id']
   if gid not in used:continue
   name=tile['type'];m=re.fullmatch(r'(grass|earth|paving|ballast|water)-(field|join)-(\d+)-(\d+)(?:-(\d+))?',name)
   if m:
    kind,_,xx,yy,mask=m.groups();drawing=terrain(kind,int(xx),int(yy),int(mask or 0));ref=f'g{gid}'
    defs[ref]=drawing.content().replace('"edge"',f'"edge-{gid}"').replace('#edge)',f'#edge-{gid})');vx=vy=0
   else:
    m=re.fullmatch(r'(.+)-(\d+)-(\d+)',name)
    if m:
     kind,xx,yy=m.groups();vx=int(xx)*24;vy=int(yy)*24;ref=kind
     if kind in kit:defs[ref]=kit[kind].content()
     elif kind in ('cave-wall','cave-roof','cave-ledge'):
      defs[ref]=cavern(kind).content()
     elif kind.startswith('cave-'):
      ref=f'g{gid}';defs[ref]=terrain(kind,int(xx),int(yy)).content();vx=vy=0
     else:raise ValueError(name)
    else:ref=name;defs[ref]=fitting(name).content();vx=vy=0
   x=tile['id']%page['columns']*24;y=tile['id']//page['columns']*24
   cells.append(f'<svg x="{x}" y="{y}" width="24" height="24" viewBox="{vx} {vy} 24 24"><use href="#{ref}"/></svg>')
  width=page['imagewidth'];height=page['imageheight'];name=page['name']
  body='<defs>'+''.join(f'<g id="{name}">{body}</g>' for name,body in defs.items())+'</defs>'+''.join(cells)
  (OUT/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" shape-rendering="crispEdges">{body}</svg>\n')
  pages.append(name)
 # Registry only lists pages actually authored: missing coverage fails export.
 (ROOT/'src/content/vector-tiles.json').write_text(json.dumps(pages,indent=2)+'\n')
 print(f'Exported {len(pages)} SVG tile pages ({len(used)} stable tile IDs); {len(kit)} reusable scenery models')

if __name__=='__main__':export()
