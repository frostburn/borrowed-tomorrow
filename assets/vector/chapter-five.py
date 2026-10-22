"""Reproduce Chapter Five Act I's native SVG scenery, cast and Tiled layouts.
No bitmap inputs or resampling. Navigation, markers and scene casts share 24px cells.
"""
import json, math, re
from pathlib import Path
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'public/art/vector/chapter-five'; MAP=ROOT/'src/content/chapter-five/maps'
ART.mkdir(parents=True,exist_ok=True);MAP.mkdir(parents=True,exist_ok=True)
manifest={}
def rect(x,y,w,h,c):return f'<path d="M{x:g} {y:g}h{w:g}v{h:g}h{-w:g}Z" fill="{c}"/>'
def poly(pts,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+f'" fill="{c}"/>'
def line(pts,c,w=3):return '<polyline points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ellipse(x,y,rx,ry,c):return f'<ellipse cx="{x:g}" cy="{y:g}" rx="{rx:g}" ry="{ry:g}" fill="{c}"/>'
def svg(path,w,h,body):
 path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(path.stem.replace("-"," "))}</title>'+''.join(body)+'</svg>\n')
def prop(**kw):return [{'name':k,'type':'bool' if isinstance(v,bool) else 'int' if isinstance(v,int) else 'string','value':v}for k,v in kw.items()]
def point(name,x,y,**kw):return {'name':name,'point':True,'x':x*24+12,'y':y*24+12,'properties':prop(**kw)}
def obj(name,x,y,label,**kw):return point(name,x,y,label=label,**kw)
def control(name,x,y,area,label,**kw):
 xx,yy,w,h=area
 return {'name':name,'x':xx*24,'y':yy*24,'width':w*24,'height':h*24,'properties':prop(label=label,approachX=x,approachY=y,**kw)}

def group(i,name,objects=None,**kw):return {'id':i,'name':name,'type':'objectgroup','visible':True,'objects':objects or [],'properties':prop(**kw)}
def cells(rects,w,h,gid=3):
 data=[0]*(w*h)
 for x,y,ww,hh in rects:
  for yy in range(y,y+hh):
   for xx in range(x,x+ww):data[yy*w+xx]=gid
 return data
def layer(i,name,rects,w,h,gid=3):return {'id':i,'name':name,'type':'tilelayer','visible':True,'width':w,'height':h,'data':cells(rects,w,h,gid)}
def sky(w,h):
 return [rect(0,0,w,h,'#384f62'),poly([(0,110),(210,55),(510,114),(760,48),(1000,98),(w,33),(w,260),(1180,193),(890,230),(560,172),(200,224),(0,193)],'#788e96'),poly([(0,260),(260,210),(500,279),(800,234),(1050,288),(w,218),(w,390),(1200,360),(850,395),(500,339),(180,390),(0,360)],'#c5b89a')]
def ground(w,h):
 return sky(w,h)+[poly([(0,440),(200,357),(430,416),(720,343),(1030,415),(1270,337),(w,400),(w,h),(0,h)],'#344b52'),poly([(0,620),(240,485),(530,572),(830,466),(1180,570),(w,457),(w,h),(0,h)],'#657165'),poly([(0,830),(500,710),(840,810),(w,676),(w,h),(0,h)],'#414f4d')]
def floors(rectangles,w,h,steel=False,wood=False):
 # Draw one continuous union: edges inside adjoining floor rectangles disappear.
 covered={(xx,yy)for x,y,ww,hh in rectangles for xx in range(x,x+ww)for yy in range(y,y+hh)}
 path=' '.join(f'M{x*24} {y*24}h24v24h-24Z'for x,y in sorted(covered))
 base='#917a55' if wood else '#526d70' if steel else '#878a78'
 out=[f'<defs><clipPath id="floor"><path d="{path}"/></clipPath></defs><g clip-path="url(#floor)">',rect(0,0,w,h,base)]
 out.append(poly([(0,480),(420,430),(900,630),(w,500),(w,650),(950,760),(490,580),(0,610)],'#a48b63' if wood else '#647d7b' if steel else '#9a9b84'))
 for y in range(0,h,24 if wood else 72):out.append(line([(0,y),(w,y)],'#6e5f4b' if wood else '#40595f' if steel else '#737e73',2))
 if not wood:
  for y in range(0,h,72):
   for x in range(60+y%120,w,168):out.append(line([(x,y),(x,y+72)],'#40595f' if steel else '#758174',2))
 out.append('</g>')
 for x,y in sorted(covered):
  if (x,y+1)not in covered:out += [poly([(x*24,(y+1)*24),((x+1)*24,(y+1)*24),((x+1)*24,(y+1)*24+18),(x*24,(y+1)*24+18)],'#243d47'),rect(x*24,(y+1)*24-3,24,3,'#baad83')]
 return out

def ship():
 out=[poly([(0,164),(78,80),(208,30),(370,4),(538,27),(674,86),(738,165),(651,225),(495,256),(270,254),(92,226)],'#233e4b'),poly([(0,164),(78,80),(208,30),(370,4),(538,27),(674,86),(738,165),(568,162),(370,129),(168,158)],'#d2c5a3'),poly([(0,164),(168,158),(370,129),(568,162),(738,165),(651,225),(495,256),(270,254),(92,226)],'#a7a78d'),poly([(78,80),(208,30),(370,4),(538,27),(674,86),(546,100),(370,76),(194,103)],'#ede0b5')]
 for x,y,xx,yy in [(110,112,155,302),(251,63,265,300),(489,65,485,302),(632,119,590,302)]:out.append(line([(x,y),(xx,yy)],'#657c7a',4))
 out += [poly([(142,291),(266,270),(482,270),(600,291),(563,346),(485,371),(268,371),(179,347)],'#223d49'),poly([(142,291),(266,270),(482,270),(600,291),(483,319),(267,319)],'#b79e6e'),poly([(267,319),(483,319),(563,346),(485,371),(268,371),(179,347)],'#486668'),rect(282,290,185,10,'#d3bd86')]
 for x in range(293,465,27):out += [rect(x,330,17,21,'#182d3a'),rect(x+3,331,11,9,'#a6b6a2')]
 for x in (112,588):out += [ellipse(x,275,30,18,'#1b3441'),ellipse(x,273,22,11,'#a9a88b'),line([(x-27,275),(x+27,275)],'#d9bc7d',5)]
 return out

def factory():
 out=[rect(12,110,564,152,'#4c6464'),poly([(0,112),(146,24),(294,108),(437,27),(595,112),(578,129),(440,71),(294,151),(147,69),(14,132)],'#243e4b'),poly([(0,112),(146,24),(148,44),(14,132)],'#a5aaa0')]
 for x in (43,333):out += [rect(x,143,212,113,'#223b46'),rect(x+10,154,192,102,'#384f52')]
 for x in range(50,560,55):out += [rect(x,92,25,36,'#a9b69f'),line([(x+12,92),(x+12,128)],'#4a676c',4)]
 for x in (70,480):out += [rect(x,0,45,100,'#273e49'),poly([(x,0),(x+22,-12),(x+45,0),(x+45,14),(x,14)],'#8c8973'),rect(x+5,18,8,78,'#687e73')]
 return out

def crane():
 out=[poly([(24,318),(41,39),(77,31),(86,318)],'#29434a'),poly([(41,39),(77,31),(82,318),(66,318)],'#a18d64'),poly([(9,58),(38,29),(286,29),(305,58)],'#334d53'),rect(39,35,245,9,'#bba576'),line([(53,62),(77,91),(90,62),(115,91),(130,62),(155,91),(170,62),(195,91),(210,62),(239,91),(260,62)],'#b0905c',6),line([(263,58),(263,206)],'#142f3c',5),poly([(253,197),(262,206),(273,198),(278,213),(261,231),(247,217)],'#bca56e')]
 return out

def engine():
 return [ellipse(54,114,24,21,'#142a36'),ellipse(133,114,24,21,'#142a36'),ellipse(54,114,13,11,'#9d9e86'),ellipse(133,114,13,11,'#9d9e86'),rect(30,62,120,45,'#476568'),ellipse(31,85,19,25,'#9ca792'),poly([(30,62),(51,49),(154,49),(150,62)],'#a8b39c'),rect(123,19,61,73,'#304b55'),poly([(115,20),(150,3),(194,20),(186,31),(127,31)],'#ae9c70'),rect(136,31,26,30,'#b8c3a6'),rect(48,20,21,39,'#263d48'),rect(43,15,31,9,'#aa976d'),line([(35,113),(144,113)],'#c1a774',5)]
def wheel():
 return [rect(34,40,17,44,'#273f49'),poly([(9,84),(72,84),(86,97),(0,97)],'#2d4852'),ellipse(43,35,31,30,'#c2a169'),ellipse(43,35,22,21,'#3b5b60'),line([(16,35),(69,35)],'#c2a169',5),line([(43,10),(43,60)],'#c2a169',5)]
def conduit():
 out=[poly([(20,249),(78,203),(254,203),(309,249),(294,279),(39,279)],'#203c48'),rect(115,45,96,179,'#526e6c'),poly([(90,61),(162,0),(235,61),(211,80),(162,35),(114,80)],'#b19563'),ellipse(162,108,58,66,'#192f3e'),ellipse(162,108,39,48,'#b3d0bc'),poly([(143,67),(171,57),(187,120),(164,152),(141,113)],'#d6dfba'),rect(80,208,166,20,'#b59c68')]
 for x in (47,252):out += [rect(x,120,20,131,'#9c885f'),rect(x-9,119,38,11,'#d4b580')]
 return out

def carrier(w=224,h=168):
 out=[poly([(8,115),(31,94),(188,94),(216,115),(211,153),(32,164),(7,144)],'#152c38'),poly([(12,113),(39,96),(184,96),(214,115),(189,132),(32,136)],'#5e6d67')]
 for x in (35,74,116,157,193):out += [ellipse(x,140,16,15,'#172c37'),ellipse(x,140,9,8,'#8b927a')]
 out += [poly([(38,48),(71,23),(174,23),(198,48),(187,115),(55,122),(29,91)],'#354f53'),poly([(38,48),(71,23),(174,23),(198,48),(158,68),(71,70)],'#8e9275'),poly([(71,70),(158,68),(187,115),(55,122)],'#5e6c5b'),poly([(41,59),(68,76),(61,107),(38,91)],'#142b36'),poly([(46,68),(62,78),(57,99),(43,90)],'#dd8b4c')]
 for x in (83,110,137):out += [rect(x,78,13,26,'#263e45'),rect(x+3,80,7,18,'#d3a05f')]
 out += [rect(153,0,25,37,'#223c48'),poly([(146,0),(162,0),(184,0),(180,12),(151,12)],'#9b9471'),poly([(189,50),(213,56),(223,91),(205,104),(188,81)],'#29454c'),line([(191,62),(216,81)],'#bda16d',5)]
 return out

def write_map(id,name,subtitle,layers,w=64,h=42,safe='start'):
 d={'type':'map','version':'1.10','tiledversion':'1.11.2','orientation':'orthogonal','renderorder':'right-down','infinite':False,'width':w,'height':h,'tilewidth':24,'tileheight':24,'nextlayerid':len(layers)+1,'nextobjectid':1,'properties':prop(name=name,subtitle=subtitle,artStyle='rotoscope',sceneArt=id,safeArrival=safe),'tilesets':[{'firstgid':p['firstgid'],'source':'../../../../assets/tiles/pages/'+p['name']+'.json'}for p in json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text())['pages']],'layers':layers}
 for layer_ in layers:
  for o in layer_.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 text=json.dumps(d,indent=2)
 text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+w])for i in range(0,w*h,w))+'\n    ]',text)
 (MAP/f'{id}.json').write_text(text+'\n')

def world(id,name,subtitle,floor,blocks,objects,arrivals,casts,people,decor,back=None,steel=False,wood=False):
 w,h=64,42;layers=[layer(1,'Surroundings',[(0,0,w,h)],w,h,5),layer(2,'Walking surfaces',floor,w,h),layer(3,'Scenery footprints',blocks,w,h,6)]
 entries=[]
 def add(n,body,ww=w*24,hh=h*24,x=0,y=0,depth=-1000,lid=1):
  url=f'art/vector/chapter-five/{n}.svg';svg(ART/f'{n}.svg',ww,hh,body);entries.append({'key':f'scene-five-{n}','url':url,'x':x,'y':y,'width':ww,'height':hh,'depth':depth,'layerId':lid})
 add(id+'-back',back if back is not None else ground(w*24,h*24));add(id+'-floor',floors(floor,w*24,h*24,steel,wood),depth=-999,lid=2)
 for n,body,ww,hh,x,y,depth,flags in decor:
  lid=3
  if flags:lid=len(layers)+1;layers.append(group(lid,n,**flags))
  add(n,body,ww,hh,x,y,depth,lid)
 layers += [group(len(layers)+1,'Interactions',objects),group(len(layers)+2,'Arrivals',[point(k,*v)for k,v in arrivals.items()]),group(len(layers)+3,'People',people)]
 for sid,cast in casts.items():layers.append(group(len(layers)+1,'Scene:'+sid,[point(k,*v)for k,v in cast.items()]))
 write_map(id,name,subtitle,layers,safe=next(iter(arrivals)));manifest[id]=entries

air_cast={'nell':(24,29),'orrin':(22,30),'kit':(24,31),'petra':(26,30),'celia':(22,31),'alda':(30,25),'durn':(38,26)}
world('airfield','Western airfield','The survey crew is loading beside the northern mooring. The supplies are west of the hangar.',[(5,23,54,13),(28,19,9,5)],[(48,28,4,3)], [
 obj('airfield-supply',10,27,'Crew supplies · rest and bandages',sign=True),obj('airfield-seizure',35,26,'The mooring · imperial seizure party',sprite='inspector',spriteHiddenFlag='airfieldGuardWon',doneFlag='airfieldGuardWon'),control('airfield-board',32,23,(25,16,15,8),'Survey ship · boarding gangway',sign=True),obj('airfield-alda',29,26,'Alda · survey captain',sprite='alda')],
 {'start':(24,30),'ship':(31,25)}, {'five-airfield':air_cast,'five-launch':{**air_cast,'alda':(31,22),'durn':(55,29)}},
 [point('rigging-hand',42,25,sprite='civilian-dockhand'),point('loading-hand',16,26,sprite='civilian-dockhand-rust'),point('crew-passenger',19,30,sprite='civilian-traveler-blue')],
 [('airfield-stores',[poly([(0,18),(30,0),(73,0),(96,18),(96,75),(0,75)],'#a78d62'),poly([(0,18),(96,18),(96,75),(0,75)],'#776b53'),rect(9,27,78,6,'#c5ad7a'),rect(9,58,78,6,'#c5ad7a'),rect(44,19,8,56,'#c5ad7a')],100,80,210,590,670,{}),('survey-ship',ship(),744,384,400,126,-997,{}),('hangar',factory(),600,270,56,292,540,{}),('mooring-crane',crane(),312,330,1090,330,660,{}),('airfield-cargo',engine(),200,140,1140,636,776,{})])

shipback=sky(1536,1008)+[poly([(0,630),(450,570),(950,620),(1536,550),(1536,1008),(0,1008)],'#759495'),poly([(0,725),(360,662),(720,730),(1120,655),(1536,700),(1536,795),(1100,752),(690,824),(290,748),(0,809)],'#b6c5b2')]
shipfloor=[(13,18,38,16),(21,14,22,5)]
world('airship','Survey ship · the flight deck','The flight chart is on the forward table. Crew supplies are by the aft hatch.',shipfloor,[(45,26,3,4)], [
 control('ship-chart',32,19,(30,16,5,4),'Flight chart · the three anchors',sign=True),obj('ship-supply',18,28,'Aft stores · rest and bandages',sign=True),obj('ship-orrin',25,24,'Orrin · the engine watch',sprite='orrin'),obj('ship-kit',39,25,'Kit · the courier routes',sprite='kit'),obj('ship-celia',42,30,'Celia · field notes',sprite='celia'),obj('ship-petra',23,30,'Petra · the horizon',sprite='petra'),obj('ship-alda',35,19,'Alda · the survey log',sprite='alda')],
 {'start':(32,26),'airfield':(32,26),'hammerplain':(32,26)},
 {'five-first-flight':{'nell':(32,21),'orrin':(28,24),'kit':(35,24),'petra':(38,27),'celia':(28,28),'alda':(34,19)},'five-fleet':{'nell':(32,21),'orrin':(29,23),'kit':(36,24),'petra':(38,25),'celia':(29,26),'alda':(34,19)}},
 [point('navigator',40,21,sprite='civilian-traveler'),point('deck-hand',16,24,sprite='civilian-dockhand-rust'),point('foundry-fitter',16,29,sprite='civilian-dockhand',requiredFlag='hammerplainComplete'),point('drive-fitter',42,27,sprite='civilian-dockhand-rust',requiredFlag='hammerplainComplete')],
 [('ship-chart-table',[poly([(0,22),(68,0),(122,22),(51,47)],'#c8b185'),poly([(0,22),(51,47),(51,65),(0,40)],'#655d4a'),poly([(51,47),(122,22),(122,40),(51,65)],'#374d51'),poly([(17,23),(68,7),(101,22),(51,39)],'#526f73'),line([(34,24),(65,20),(83,23)],'#d6c385',2),ellipse(34,24,3,3,'#ead49d'),ellipse(65,20,3,3,'#ead49d'),ellipse(83,23,3,3,'#ead49d')],124,68,720,397,465,{}),('ship-fleet',[f'<g transform="translate({x} {y}) scale({s})">'+''.join([poly([(0,18),(43,0),(147,2),(196,24),(144,39),(43,35)],'#263f51'),poly([(41,38),(149,38),(138,52),(54,52)],'#263f51'),rect(90,38,4,26,'#263f51'),poly([(94,40),(119,40),(115,52),(94,52)],'#a47d54')])+'</g>'for x,y,s in [(590,203,.75),(750,165,1.1),(1000,211,.65)]],1536,400,0,0,-998,{'requiredFlag':'fleetSighted'}),('ship-bow',[poly([(468,333),(516,282),(996,282),(1032,333)],'#253e49'),line([(480,330),(516,293),(996,293),(1020,330)],'#d1b67b',7)],1060,350,0,0,-997,{}),('ship-store',engine(),200,140,1060,590,720,{})],shipback,wood=True)

foundfloor=[(5,24,55,13),(10,19,40,6),(30,17,8,3)]
forgeback=ground(1536,1008)
for x in (170,420,1100,1310):forgeback += [rect(x,74,64,312,'#304a51'),poly([(x-9,74),(x+32,55),(x+78,74),(x+67,91),(x-4,91)],'#8f9278'),poly([(x+10,69),(x-5,22),(x+32,0),(x+68,9),(x+58,47)],'#657b80')]
world('hammerplain','Hammerplain · the casting floor','The cooling works are northeast. The survey landing is west of the foundry.',foundfloor,[(7,19,13,3),(47,25,6,3)], [
 obj('hammer-hester',25,25,'Hester · casting forewoman',sprite='hester'),obj('hammer-cooling',45,23,'Cooling works · freight lift or race walk',sign=True),obj('hammer-supply',11,28,'Foundry bench · rest and supplies',sign=True),obj('hammer-ship',6,30,'Western landing · survey ship',sign=True),obj('hammer-coat',50,29,'Safety stores · heat-resistant coat',sprite='guardian-forge',doneFlag='forgeStoresWon',spriteHiddenFlag='forgeStoresWon')],
 {'start':(8,30),'cooling':(42,25),'freed':(30,27)},
 {'five-hammer':{'nell':(24,27),'orrin':(23,26),'kit':(21,28),'petra':(25,29),'celia':(22,30),'hester':(26,25),'durn':(39,24)},'five-workers':{'nell':(28,27),'orrin':(29,26),'hester':(32,25),'kit':(25,29),'petra':(27,30),'celia':(24,30)}},
 [point('casting-hand',35,24,sprite='civilian-dockhand-rust'),point('stopped-family',14,26,sprite='civilian-family-blue',hiddenFlag='hammerplainFreed'),point('home-family',18,31,sprite='civilian-family-blue',requiredFlag='hammerplainFreed'),point('shift-hand',37,30,sprite='civilian-dockhand')],
 [('casting-hall',factory(),600,270,260,230,500,{}),('freight-crane',crane(),312,330,1080,240,570,{}),('replacement-engine',engine(),200,140,720,445,585,{}),('stores-engine',engine(),200,140,1120,530,670,{})],forgeback)

coolfloor=[(6,26,50,10),(7,19,48,8),(28,14,15,6)]
coolback=ground(1536,1008)+[poly([(0,435),(1536,435),(1536,515),(0,515)],'#233e4b'),rect(0,458,1536,21,'#78968c')]
world('coolingworks','Hammerplain · the cooling race','A freight lift crosses the upper walk. The manual wheel is on the far eastern pier.',coolfloor,[(10,19,10,3),(49,29,4,3)], [
 obj('cooling-route',29,26,'Crossing · choose the freight lift or race walk',sign=True),control('cooling-wheel',46,23,(44,19,4,5),'Manual cooling wheel',sign=True),obj('cooling-forge',42,16,'Northern gantry · the anchor furnace',sign=True,accessFlag='coolingOpened'),obj('cooling-return',8,30,'Return to the casting floor',sign=True)],
 {'start':(10,30),'forge':(39,18),'wheel':(44,24)},
 {'five-cooling':{'nell':(25,27),'orrin':(27,25),'kit':(24,29),'petra':(29,28),'celia':(24,30),'hester':(30,24)},'five-water':{'nell':(44,26),'orrin':(45,23),'hester':(43,24),'kit':(42,28),'petra':(40,26),'celia':(41,29)}},
 [point('race-hand',33,25,sprite='civilian-dockhand'),point('wheel-hand',47,24,sprite='civilian-dockhand-rust',requiredFlag='coolingOpened')],
 [('cooling-wheel',wheel(),90,100,1072,460,560,{}),('freight-lift',crane(),312,330,192,226,556,{}),('moving-water',[poly([(0,457),(1536,457),(1536,480),(0,480)],'#9abcb0'),line([(0,465),(1536,465)],'#d0d9b7',3)],1536,490,0,0,-998,{'requiredFlag':'coolingOpened'})],coolback,steel=True)

forgefloor=[(5,25,54,12),(10,18,45,8),(27,14,14,5)]
forgebackground=[rect(0,0,1536,1008,'#253b47'),poly([(0,80),(560,20),(1040,110),(1536,20),(1536,150),(1050,240),(530,126),(0,200)],'#445e61'),rect(0,245,1536,230,'#334d52')]
for x in range(100,1536,220):forgebackground += [rect(x,220,35,360,'#1c3340'),rect(x+7,227,9,352,'#8b866a'),rect(x+51,282,109,99,'#1b303b'),rect(x+62,292,88,75,'#bb784a')]
world('anchorforge','Hammerplain · the anchor gantry','The replacement engines stand below the anchor. Keep the carrier off them.',forgefloor,[(26,14,14,3),(47,20,6,3)], [
 obj('forge-carrier',33,23,'Furnace carrier · defend the engines',sprite='furnace-carrier',doneFlag='furnaceWon',spriteHiddenFlag='furnaceWon'),control('forge-anchor',32,18,(26,5,14,14),'Anchor release · the manual breaker',sign=True,accessFlag='furnaceWon'),obj('forge-cooling',9,30,'Return to the cooling race',sign=True),obj('forge-hester',22,28,'Hester · the changeover',sprite='hester')],
 {'start':(13,30),'breaker':(32,22)},
 {'five-gantry':{'nell':(27,26),'orrin':(25,25),'kit':(24,28),'petra':(28,28),'celia':(23,29),'hester':(22,26),'durn':(39,23),'furnaceCarrier':(35,22)},'five-release':{'nell':(31,21),'orrin':(30,20),'hester':(34,20),'kit':(28,23),'petra':(35,23),'celia':(27,24),'durn':(44,24)}},
 [point('gantry-hand',20,26,sprite='civilian-dockhand'),point('gantry-helper',41,27,sprite='civilian-dockhand-rust')],
 [('forge-anchor',conduit(),320,286,620,122,408,{}),('gantry-crane',crane(),312,330,1060,160,490,{}),('gantry-engine',engine(),200,140,456,450,590,{}),('gantry-signal',[line([(776,360),(776,500)],'#a9d3cd',5)],1000,600,0,0,-997,{'hiddenFlag':'hammerplainFreed'})],forgebackground,steel=True)

for id,mapid in [('airfield-guard','airfield'),('hammer-lift','coolingworks'),('hammer-race','coolingworks'),('hammer-stores','hammerplain'),('hammer-carrier','anchorforge')]:
 w,h=42,26;key='battle-'+id;f=[(1,3,40,20)];layers=[layer(1,'Arena surroundings',[(0,0,w,h)],w,h,5),layer(2,'Clear tactical floor',f,w,h)]
 write_map(key,'Hammerplain · '+id,'Tactical arena',layers,w,h,safe='start')
 back=sky(1008,624) if mapid=='airfield' else [rect(0,0,1008,624,'#2b424b'),rect(0,25,1008,80,'#4b6262'),rect(0,73,1008,10,'#ad9565')]
 if id=='hammer-race':back += [rect(0,0,1008,63,'#2e515b'),line([(0,36),(1008,36)],'#b5c3a5',5)]
 if id=='hammer-carrier':
  for y in (195,248):back += [rect(0,y,1008,7,'#1b3440'),rect(0,y,1008,2,'#b8a67c')]
 floorart=floors(f,1008,624,mapid!='airfield')
 if id=='hammer-carrier':
  for y in (195,248):floorart += [rect(24,y,960,7,'#1b3440'),rect(24,y,960,2,'#b8a67c')]
 svg(ART/f'{key}-back.svg',1008,624,back);svg(ART/f'{key}-floor.svg',1008,624,floorart)
 manifest[key]=[{'key':f'scene-five-{key}-{i}','url':f'art/vector/chapter-five/{key}-{part}.svg','x':0,'y':0,'width':1008,'height':624,'depth':-1001+i,'layerId':i}for i,part in [(1,'back'),(2,'floor')]]

# The carrier's world actor and combat body share one geometry, scaled in SVG.
svg(ART/'furnace-carrier-battle.svg',224,168,carrier())
svg(ROOT/'public/art/vector/furnace-carrier.svg',80,80,['<g transform="translate(3 14) scale(.33)">',*carrier(),'</g>'])
svg(ROOT/'public/art/vector/portrait-furnace-carrier.svg',128,128,['<g transform="translate(-8 5) scale(.64)">',*carrier(),'</g>'])
(ROOT/'src/content/chapter-five/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Exported Act I: 5 story maps, 5 arenas and native SVG scenery.')
