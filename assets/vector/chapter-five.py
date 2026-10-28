"""Reproduce Chapter Five Acts I–IV's native SVG scenery, cast and Tiled layouts.
No bitmap inputs or resampling. Navigation, markers and scene casts share 24px cells.
"""
import json, math, re
from pathlib import Path
from map_metadata import retain_interaction_roles,preserve_map_format
from anchor_engines import carrier
from gangway import gangway
from chapter_five_style import OUTLINES,FIXTURES,cells as polygon_cells,floor_shapes,treatment,work_lamp,arena_fixtures,mechanisms,spill_layer
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'public/art/vector/chapter-five'; MAP=ROOT/'src/content/chapter-five/maps'
ART.mkdir(parents=True,exist_ok=True);MAP.mkdir(parents=True,exist_ok=True)
manifest={}
preserve_map_format(MAP)
def rect(x,y,w,h,c):return f'<path d="M{x:g} {y:g}h{w:g}v{h:g}h{-w:g}Z" fill="{c}"/>'
def poly(pts,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+f'" fill="{c}"/>'
def line(pts,c,w=3):return '<polyline points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ellipse(x,y,rx,ry,c):return f'<ellipse cx="{x:g}" cy="{y:g}" rx="{rx:g}" ry="{ry:g}" fill="{c}"/>'
def svg(path,w,h,body):
 source=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(path.stem.replace("-"," "))}</title>'+''.join(body)+'</svg>\n'
 path.write_text(treatment(path.stem,source,w,h)if path.parent==ART else source)
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
def ship():
 out=[poly([(0,164),(78,80),(208,30),(370,4),(538,27),(674,86),(738,165),(651,225),(495,256),(270,254),(92,226)],'#233e4b'),poly([(0,164),(78,80),(208,30),(370,4),(538,27),(674,86),(738,165),(568,162),(370,129),(168,158)],'#d2c5a3'),poly([(0,164),(168,158),(370,129),(568,162),(738,165),(651,225),(495,256),(270,254),(92,226)],'#a7a78d'),poly([(78,80),(208,30),(370,4),(538,27),(674,86),(546,100),(370,76),(194,103)],'#ede0b5')]
 for x,y,xx,yy in [(110,112,155,302),(251,63,265,300),(489,65,485,302),(632,119,590,302)]:out.append(line([(x,y),(xx,yy)],'#657c7a',4))
 out += [poly([(142,291),(266,270),(482,270),(600,291),(563,346),(485,371),(268,371),(179,347)],'#223d49'),poly([(142,291),(266,270),(482,270),(600,291),(483,319),(267,319)],'#b79e6e'),poly([(267,319),(483,319),(563,346),(485,371),(268,371),(179,347)],'#486668'),rect(282,290,185,10,'#d3bd86')]
 for x in range(293,465,27):out += [rect(x,330,17,21,'#182d3a'),rect(x+3,331,11,9,'#a6b6a2')]
 for x in (112,588):out += [ellipse(x,275,30,18,'#1b3441'),ellipse(x,273,22,11,'#a9a88b'),line([(x-27,275),(x+27,275)],'#d9bc7d',5)]
 return out

def docked_ship():
 # Same survey hull as the airfield, moored beside the western landing.
 return ['<g transform="translate(6 4) scale(.45)">',*ship(),'</g>',line([(78,158),(90,198)],'#bca574',3),line([(272,150),(302,197)],'#bca574',3),rect(79,198,23,7,'#253f4b'),rect(291,197,24,7,'#253f4b'),line([(81,198),(101,198)],'#d1b884',3),line([(293,197),(313,197)],'#d1b884',3)]
def dock_gangway():
 return gangway((14,34),(148,96),width=24)
def rest_bench():
 return [rect(0,0,157,59,'#324c55'),rect(5,5,147,7,'#81958a'),rect(15,24,101,26,'#947c57'),rect(11,48,113,11,'#bc9d6d'),poly([(11,59),(124,59),(124,65),(11,65)],'#5f5948'),rect(20,59,7,20,'#304a53'),rect(108,59,7,20,'#304a53'),rect(119,42,42,28,'#617c75'),rect(125,47,28,5,'#d5c8a1'),rect(136,41,6,20,'#d5c8a1'),ellipse(142,27,12,8,'#aec4b2'),rect(130,17,24,12,'#789b93'),ellipse(142,17,12,6,'#bdd0ba'),rect(137,8,10,6,'#3b5961')]

def factory():
 out=[poly([(12,110),(147,52),(294,131),(440,54),(576,110),(576,262),(12,262)],'#4c6464'),poly([(0,112),(146,24),(294,108),(437,27),(595,112),(578,129),(440,71),(294,151),(147,69),(14,132)],'#243e4b'),poly([(0,112),(146,24),(148,44),(14,132)],'#a5aaa0')]
 for x in (43,333):out += [rect(x,143,212,113,'#223b46'),rect(x+10,154,192,102,'#384f52')]
 for x in range(50,560,55):out += [rect(x,92,25,36,'#a9b69f'),line([(x+12,92),(x+12,128)],'#4a676c',4)]
 for x in (70,480):out += [rect(x,0,45,100,'#273e49'),poly([(x,0),(x+22,-12),(x+45,0),(x+45,14),(x,14)],'#8c8973'),rect(x+5,18,8,78,'#687e73')]
 return out

def crane():
 out=[poly([(24,318),(41,39),(77,31),(86,318)],'#29434a'),poly([(41,39),(77,31),(82,318),(66,318)],'#a18d64'),poly([(9,58),(38,29),(286,29),(305,58)],'#334d53'),rect(39,35,245,9,'#bba576'),line([(53,62),(77,91),(90,62),(115,91),(130,62),(155,91),(170,62),(195,91),(210,62),(239,91),(260,62)],'#b0905c',6),line([(263,58),(263,206)],'#142f3c',5),poly([(253,197),(262,206),(273,198),(278,213),(261,231),(247,217)],'#bca56e')]
 return out

def supply_cargo():
 # Lashed deck stores; locomotives belong to the foundry's engine shipments.
 out=[poly([(7,115),(157,104),(180,125),(35,139)],'#3b5356')]
 for x,y,w,h in [(12,61,84,59),(91,52,74,61),(47,13,68,49)]:
  out += [poly([(x,y),(x+w,y-7),(x+w+16,y+7),(x+15,y+16)],'#b9a377'),
          poly([(x,y),(x+15,y+16),(x+15,y+h+12),(x,y+h)],'#73654f'),
          poly([(x+15,y+16),(x+w+16,y+7),(x+w+16,y+h),(x+15,y+h+12)],'#947e5a'),
          line([(x+22,y+20),(x+w+10,y+h-5)],'#cbb48a',5),
          line([(x+w+10,y+12),(x+22,y+h+6)],'#cbb48a',5)]
 out += [line([(20,65),(43,117),(177,107)],'#d0b685',3),
         line([(60,17),(79,79),(83,121)],'#d0b685',3),
         poly([(123,77),(149,74),(154,99),(126,103)],'#648378'),
         poly([(131,82),(141,81),(143,95),(133,96)],'#d6d1ab')]
 return ['<g transform="scale(.85 1)">',*out,'</g>']

def engine():
 return [ellipse(54,114,24,21,'#142a36'),ellipse(133,114,24,21,'#142a36'),ellipse(54,114,13,11,'#9d9e86'),ellipse(133,114,13,11,'#9d9e86'),rect(30,62,120,45,'#476568'),ellipse(31,85,19,25,'#9ca792'),poly([(30,62),(51,49),(154,49),(150,62)],'#a8b39c'),rect(123,19,61,73,'#304b55'),poly([(115,20),(150,3),(194,20),(186,31),(127,31)],'#ae9c70'),rect(136,31,26,30,'#b8c3a6'),rect(48,20,21,39,'#263d48'),rect(43,15,31,9,'#aa976d'),line([(35,113),(144,113)],'#c1a774',5)]
def wheel(rim='#c2a169'):
 return [rect(34,40,17,44,'#273f49'),poly([(9,84),(72,84),(86,97),(0,97)],'#2d4852'),ellipse(43,35,31,30,rim),ellipse(43,35,22,21,'#3b5b60'),line([(16,35),(69,35)],rim,5),line([(43,10),(43,60)],rim,5)]
def conduit():
 out=[poly([(20,249),(78,203),(254,203),(309,249),(294,279),(39,279)],'#203c48'),rect(115,45,96,179,'#526e6c'),poly([(90,61),(162,0),(235,61),(211,80),(162,35),(114,80)],'#b19563'),ellipse(162,108,58,66,'#192f3e'),ellipse(162,108,39,48,'#b3d0bc'),poly([(143,67),(171,57),(187,120),(164,152),(141,113)],'#d6dfba'),rect(80,208,166,20,'#b59c68')]
 for x in (47,252):out += [rect(x,120,20,131,'#9c885f'),rect(x-9,119,38,11,'#d4b580')]
 return out


def write_map(id,name,subtitle,layers,w=64,h=42,safe='start'):
 d={'type':'map','version':'1.10','tiledversion':'1.11.2','orientation':'orthogonal','renderorder':'right-down','infinite':False,'width':w,'height':h,'tilewidth':24,'tileheight':24,'nextlayerid':len(layers)+1,'nextobjectid':1,'properties':prop(name=name,subtitle=subtitle,artStyle='rotoscope',sceneArt=id,safeArrival=safe),'tilesets':[{'firstgid':p['firstgid'],'source':'../../../../assets/tiles/pages/'+p['name']+'.json'}for p in json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text())['pages']],'layers':layers}
 retain_interaction_roles(MAP/f'{id}.json', layers)
 for layer_ in layers:
  for o in layer_.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 text=json.dumps(d,indent=2)
 text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+w])for i in range(0,w*h,w))+'\n    ]',text)
 (MAP/f'{id}.json').write_text(text+'\n')

def world(id,name,subtitle,outline,blocks,objects,arrivals,casts,people,decor,back=None):
 w,h=64,42
 if id in ('dawnwatch','windmere'):
  blocks=blocks+[(0,24,14,6),(3,30,9,1)]
  decor=decor+[(id+'-survey-mooring',docked_ship(),342,208,0,574,-997,{}),
   (id+'-boarding-plank',gangway((170,714),(230,790)),250,810,0,0,-996,{})]
  # Board from the gangway, leaving the infirmary's approach outside its hit area.
  for o in objects:
   if o['name']in ('dawn-ship','wind-ship'):
    replacement=control(o['name'],8,31,(2,29,9,5),'Survey mooring · return aboard',sign=True);o.clear();o.update(replacement)
 layers=[layer(1,'Surroundings',[(0,0,w,h)],w,h,5),{'id':2,'name':'Walking surfaces','type':'tilelayer','visible':True,'width':w,'height':h,'data':polygon_cells(outline,w,h)},layer(3,'Scenery footprints',blocks,w,h,6)]
 layers[2]['properties']=prop(sort=True)
 entries=[]
 def add(n,body,ww=w*24,hh=h*24,x=0,y=0,depth=-1000,lid=1):
  url=f'art/vector/chapter-five/{n}.svg';svg(ART/f'{n}.svg',ww,hh,body);entries.append({'key':f'scene-five-{n}','url':url,'x':x,'y':y,'width':ww,'height':hh,'depth':depth,'layerId':lid})
 add(id+'-back',back if back is not None else ground(w*24,h*24));add(id+'-floor',floor_shapes(outline,w*24,h*24,id),depth=-999,lid=2)
 fixtures=[('flagship-worklight'if id=='flagship'else'opal-standard',work_lamp(),32,144,x-16,y-142,y,{})for x,y in FIXTURES[id]]
 decor=decor+fixtures
 link=mechanisms(id)
 if link:add(id+'-drive-link',link,depth=-998,lid=2)
 for n,body,ww,hh,x,y,depth,flags in decor:
  lid=3 if depth>=0 else 2
  if flags:lid=len(layers)+1;layers.append(group(lid,n,sort=depth>=0,**flags))
  add(n,body,ww,hh,x,y,depth,lid)
 layers += [group(len(layers)+1,'Interactions',objects),group(len(layers)+2,'Arrivals',[point(k,*v)for k,v in arrivals.items()]),group(len(layers)+3,'People',people)]
 for sid,cast in casts.items():layers.append(group(len(layers)+1,'Scene:'+sid,[point(k,*v,**({'projection':True}if sid=='five-emperor-offer' and k!='nell' else {}))for k,v in cast.items()]))
 # A takeoff image must remain individually addressable when lit scenery is
 # cached; the command deck's individual pieces must still fade in the strike.
 if id=='airfield':
  lid=len(layers)+1;layers.append(group(lid,'Survey launch motion',live=True))
  for e in entries:
   if e['key'] in ('scene-five-survey-ship','scene-five-airfield-gangway'):e['layerId']=lid
 if id=='flagship':
  for l in layers:l.setdefault('properties',[]).extend(prop(live=True))
 for lid in sorted({e['layerId']for e in entries}):
  field=spill_layer([e for e in entries if e['layerId']==lid],outline)
  if field:
   add(f'light-{id}-{lid}',field,depth=-950,lid=lid)
   if id=='flagship':entries[-1]['key']=f'scene-five-flagship-light-{lid}'
 write_map(id,name,subtitle,layers,safe=next(iter(arrivals)));manifest[id]=entries

air_cast={'nell':(24,29),'orrin':(22,30),'kit':(24,31),'petra':(26,30),'celia':(22,31),'alda':(30,25),'durn':(38,26)}
world('airfield','Western airfield','The survey crew is loading beside the northern mooring. The supplies are west of the hangar.',OUTLINES['airfield'],[(48,28,4,3)], [
 obj('airfield-supply',10,27,'Crew supplies · rest and bandages',sign=True),obj('airfield-seizure',35,26,'The mooring · imperial seizure party',sprite='inspector',spriteHiddenFlag='airfieldGuardWon',doneFlag='airfieldGuardWon'),control('airfield-board',32,23,(25,16,15,8),'Survey ship · boarding gangway',sign=True,markerFlags='airfieldGuardWon'),obj('airfield-alda',29,26,'Alda · survey captain',sprite='alda')],
 {'start':(24,30),'ship':(31,25),'cabin':(32,19)}, {'five-airfield':air_cast,'five-launch':{**air_cast,'alda':(31,22),'durn':(55,29)}},
 [point('rigging-hand',42,25,sprite='civilian-dockhand'),point('loading-hand',16,26,sprite='civilian-dockhand-rust'),point('crew-passenger',19,30,sprite='civilian-traveler-blue')],
 [('airfield-stores',[poly([(0,18),(30,0),(73,0),(96,18),(96,75),(0,75)],'#a78d62'),poly([(0,18),(96,18),(96,75),(0,75)],'#776b53'),rect(9,27,78,6,'#c5ad7a'),rect(9,58,78,6,'#c5ad7a'),rect(44,19,8,56,'#c5ad7a')],100,80,210,590,670,{}),('survey-ship',ship(),744,384,400,126,-997,{}),('airfield-gangway',gangway((777,466),(801,566)),1536,1008,0,0,-996,{}),('hangar',factory(),600,270,56,292,540,{}),('mooring-crane',crane(),312,330,1090,330,660,{}),('airfield-cargo',supply_cargo(),200,140,1140,636,776,{})])

# Optional conversations use their own casts; reserves join without changing formation.
ship_companions={
 'five-deck-orrin':{'nell':(38,24),'orrin':(43,30),'kit':(45,30),'petra':(37,27),'celia':(39,27),'alda':(34,19)},
 'five-deck-petra':{'nell':(32,22),'orrin':(35,24),'kit':(30,25),'petra':(28,24),'celia':(36,26),'alda':(34,19)},
 'five-deck-celia':{'nell':(32,22),'orrin':(28,24),'kit':(29,26),'petra':(36,24),'celia':(34,24),'alda':(34,19)},
}
shipback=sky(1536,1008)+[poly([(0,630),(450,570),(950,620),(1536,550),(1536,1008),(0,1008)],'#759495'),poly([(0,725),(360,662),(720,730),(1120,655),(1536,700),(1536,795),(1100,752),(690,824),(290,748),(0,809)],'#b6c5b2')]
world('airship','Survey ship · the flight deck','The flight chart is on the forward table. Crew supplies are by the aft hatch.',OUTLINES['airship'],[(45,26,3,4)], [
 control('ship-chart',32,19,(30,16,5,4),'Flight chart · the three anchors',sign=True),obj('ship-cabin',48,31,'Observation cabin · the inland sky',sign=True),obj('ship-supply',18,28,'Aft stores · rest and bandages',sign=True),obj('ship-orrin',25,24,'Orrin · the engine watch',sprite='orrin'),obj('ship-kit',39,25,'Kit · the courier routes',sprite='kit'),obj('ship-celia',42,30,'Celia · field notes',sprite='celia'),obj('ship-petra',23,30,'Petra · the horizon',sprite='petra'),obj('ship-alda',35,19,'Alda · the survey log',sprite='alda')],
 {'start':(32,26),'airfield':(32,26),'hammerplain':(32,26),'dawnwatch':(32,26),'windmere':(32,26),'cabin':(32,26)},
 {'five-alliance':{'nell':(32,21),'orrin':(29,23),'kit':(36,24),'petra':(38,25),'celia':(29,26),'alda':(34,19)},'five-first-flight':{'nell':(32,21),'orrin':(28,24),'kit':(35,24),'petra':(38,27),'celia':(28,28),'alda':(34,19)},'five-emperor-told':{'nell':(32,21),'orrin':(29,23),'kit':(36,24),'petra':(38,25),'celia':(29,26),'alda':(34,19)},'five-fleet':{'nell':(32,21),'orrin':(29,23),'kit':(36,24),'petra':(38,25),'celia':(29,26),'alda':(34,19)},**ship_companions},
 [point('medical-crew',20,26,sprite='civilian-traveler-blue',requiredFlag='windmereComplete'),point('navigator',40,21,sprite='civilian-traveler'),point('deck-hand',16,24,sprite='civilian-dockhand-rust'),point('foundry-fitter',16,29,sprite='civilian-dockhand',requiredFlag='hammerplainComplete'),point('drive-fitter',42,27,sprite='civilian-dockhand-rust',requiredFlag='hammerplainComplete'),point('watch-pilot',45,23,sprite='dawn-gunner',requiredFlag='dawnwatchComplete')],
 [('deck-rail',[line([(318,442),(318,805),(1218,805),(1218,442)],'#d4bc87',5)]+[line([(x,y),(x,y-34)],'#34515b',5)for x in (318,1218)for y in range(460,806,58)],1536,1008,0,0,-997,{}),('ship-chart-table',[poly([(0,22),(68,0),(122,22),(51,47)],'#c8b185'),poly([(0,22),(51,47),(51,65),(0,40)],'#655d4a'),poly([(51,47),(122,22),(122,40),(51,65)],'#374d51'),poly([(17,23),(68,7),(101,22),(51,39)],'#526f73'),line([(34,24),(65,20),(83,23)],'#d6c385',2),ellipse(34,24,3,3,'#ead49d'),ellipse(65,20,3,3,'#ead49d'),ellipse(83,23,3,3,'#ead49d')],124,68,720,397,465,{}),('ship-fleet',[f'<g transform="translate({x} {y}) scale({s})">'+''.join([poly([(0,18),(43,0),(147,2),(196,24),(144,39),(43,35)],'#263f51'),poly([(41,38),(149,38),(138,52),(54,52)],'#263f51'),rect(90,38,4,26,'#263f51'),poly([(94,40),(119,40),(115,52),(94,52)],'#a47d54')])+'</g>'for x,y,s in [(590,203,.75),(750,165,1.1),(1000,211,.65)]],1536,400,0,0,-998,{'requiredFlag':'fleetSighted','hiddenFlag':'emperorOfferTold'}),('ship-cordon',[f'<g transform="translate({x} {y}) scale({s})">'+''.join([poly([(0,18),(43,0),(147,2),(196,24),(144,39),(43,35)],'#263f51'),poly([(41,38),(149,38),(138,52),(54,52)],'#263f51'),rect(90,38,4,26,'#263f51'),poly([(94,40),(119,40),(115,52),(94,52)],'#a47d54')])+'</g>'for x,y,s in [(450,194,1.05),(713,145,1.45),(1088,195,.9)]],1536,400,0,0,-998,{'requiredFlag':'emperorOfferTold','hiddenFlag':'allAnchorsSeen'}),('ship-blockade',sky(1536,300)+[f'<g transform="translate({x} {y}) scale({s})">'+''.join([poly([(0,18),(43,0),(147,2),(196,24),(144,39),(43,35)],'#263f51'),poly([(41,38),(149,38),(138,52),(54,52)],'#263f51'),rect(90,38,4,26,'#263f51')])+'</g>'for x,y,s in [(250,190,1.25),(645,132,1.9),(1160,185,1.15)]],1536,300,0,0,-998,{'requiredFlag':'allAnchorsSeen'}),('ship-medical-kit',[rect(0,10,78,45,'#64897e'),poly([(0,10),(25,0),(101,0),(78,10)],'#c3c5a2'),rect(29,23,21,7,'#dfd2a8'),rect(36,16,7,21,'#dfd2a8')],104,60,440,572,632,{'requiredFlag':'windmereComplete'}),('ship-bow',[poly([(468,333),(516,282),(996,282),(1032,333)],'#253e49'),line([(480,330),(516,293),(996,293),(1020,330)],'#d1b67b',7)],1060,350,0,0,-997,{}),('ship-store',supply_cargo(),200,140,1060,590,720,{}),('observation-hatch',[poly([(0,12),(27,0),(110,0),(84,45),(0,45)],'#c4ad7e'),poly([(10,16),(31,7),(95,7),(77,35),(10,35)],'#233e4c'),line([(22,20),(76,20)],'#8a9a8e',4),line([(18,29),(68,29)],'#8a9a8e',4),rect(4,14,8,24,'#d7bd86')],112,48,1110,727,-997,{})],shipback)

forgeback=ground(1536,1008)
for x in (170,420,1100,1310):forgeback += [rect(x,74,64,312,'#304a51'),poly([(x-9,74),(x+32,55),(x+78,74),(x+67,91),(x-4,91)],'#8f9278'),poly([(x+10,69),(x-5,22),(x+32,0),(x+68,9),(x+58,47)],'#657b80')]
world('hammerplain','Hammerplain · the casting floor','The cooling works are northeast. The survey landing is west of the foundry.',OUTLINES['hammerplain'],[(11,20,24,5),(38,23,7,2),(47,25,6,3),(0,24,15,5),(2,29,10,2)], [
 obj('hammer-hester',25,25,'Hester · casting forewoman',sprite='hester',hiddenFlag='hammerplainComplete'),obj('hammer-hester-after',37,25,'Hester · the running engines',sprite='hester',requiredFlag='hammerplainComplete'),obj('hammer-cooling',45,23,'Cooling works · freight lift or race walk',sign=True),obj('hammer-supply',18,28,'Foundry bench · rest and supplies',sign=True),control('hammer-ship',17,32,(11,29,7,5),'Survey ship · boarding gangway',sign=True),obj('hammer-coat',50,29,'Safety stores · heat-resistant coat',sprite='guardian-forge',doneFlag='forgeStoresWon',spriteHiddenFlag='forgeStoresWon')],
 {'start':(18,32),'cooling':(42,25),'freed':(30,27),'crew':(24,27),'engine':(28,27)},
 {'five-hammer':{'nell':(24,27),'orrin':(23,26),'kit':(21,28),'petra':(25,29),'celia':(22,30),'hester':(26,25),'durn':(30,26)},'five-workers':{'nell':(28,27),'orrin':(29,26),'hester':(32,25),'kit':(25,29),'petra':(27,30),'celia':(24,30)}},
 [point('casting-hand',35,24,sprite='civilian-dockhand-rust'),point('stopped-family',16,25,sprite='civilian-family-blue',hiddenFlag='hammerplainFreed',motionAfter='hammerplainFreed'),point('home-family',20,32,sprite='civilian-family-blue',requiredFlag='hammerplainFreed'),point('shift-hand',37,30,sprite='civilian-dockhand')],
 [('hammer-docked-ship',docked_ship(),342,208,0,574,-997,{}),('hammer-gangway',dock_gangway(),164,110,270,678,-996,{}),('foundry-street',[rect(3,80,111,155,'#929681'),poly([(0,80),(55,32),(120,80)],'#394e56'),poly([(0,80),(55,32),(55,48),(17,91)],'#c3b78d'),rect(126,49,124,186,'#687d75'),poly([(115,49),(184,0),(256,49)],'#344d56'),poly([(115,49),(184,0),(184,17),(132,61)],'#c2b68b'),rect(12,140,26,48,'#304850'),rect(71,140,26,48,'#304850'),rect(142,105,28,50,'#304850'),rect(204,105,28,50,'#304850'),rect(47,186,31,49,'#304850'),rect(181,178,34,57,'#304850'),line([(3,229),(250,229)],'#c4b78b',5)],256,236,0,342,578,{}),('street-lights',[rect(16,482,18,33,'#dec591'),rect(75,482,18,33,'#dec591'),rect(146,447,20,35,'#dec591'),rect(208,447,20,35,'#dec591')],256,578,0,0,579,{'requiredFlag':'hammerplainFreed'}),('casting-hall',factory(),600,270,260,330,600,{}),('freight-crane',crane(),312,330,1080,240,570,{}),('replacement-engine',engine(),200,140,900,460,600,{}),('stores-engine',engine(),200,140,1120,530,670,{})],forgeback)

coolback=ground(1536,1008)+[poly([(0,705),(480,678),(1000,733),(1536,690),(1536,1008),(0,1008)],'#284e5b'),poly([(0,885),(430,905),(1030,866),(1536,906),(1536,925),(1030,889),(430,928),(0,908)],'#648e8f'),poly([(0,435),(1536,435),(1536,515),(0,515)],'#233e4b'),rect(0,458,1536,21,'#78968c')]
world('coolingworks','Hammerplain · the cooling race','A freight lift crosses the upper walk. The manual wheel is on the far eastern pier.',OUTLINES['coolingworks'],[(10,19,10,3),(49,29,4,3)], [
 obj('cooling-route',29,26,'Crossing · choose the freight lift or race walk',sign=True),control('cooling-wheel',46,23,(44,19,4,5),'Manual cooling wheel',sign=True,markerFlags='forgeApproachWon'),obj('cooling-forge',42,16,'Northern gantry · the anchor furnace',sign=True,accessFlag='coolingOpened'),obj('cooling-return',8,30,'Return to the casting floor',sign=True)],
 {'start':(10,30),'forge':(39,18),'wheel':(44,24),'junction':(25,27)},
 {'five-cooling':{'nell':(25,27),'orrin':(27,25),'kit':(24,29),'petra':(29,28),'celia':(24,30),'hester':(30,24)},'five-water':{'nell':(44,26),'orrin':(45,23),'hester':(43,24),'kit':(42,28),'petra':(40,26),'celia':(41,29)}},
 [point('race-hand',33,25,sprite='civilian-dockhand'),point('wheel-hand',47,24,sprite='civilian-dockhand-rust',requiredFlag='coolingOpened')],
 [('cooling-wheel',wheel('#c95746')+[ellipse(43,35,7,7,'#783b37'),ellipse(41,33,4,4,'#e3956d')],90,100,1072,460,560,{}),('freight-lift',crane(),312,330,192,226,556,{}),('moving-water',[poly([(0,457),(1536,457),(1536,480),(0,480)],'#9abcb0'),line([(0,465),(1536,465)],'#d0d9b7',3)],1536,490,0,0,-998,{'requiredFlag':'coolingOpened'})],coolback)

forgebackground=[rect(0,0,1536,1008,'#253b47'),poly([(0,80),(560,20),(1040,110),(1536,20),(1536,150),(1050,240),(530,126),(0,200)],'#445e61'),rect(0,245,1536,230,'#334d52')]
for x in range(100,1536,220):forgebackground += [rect(x,220,35,360,'#1c3340'),rect(x+7,227,9,352,'#8b866a'),rect(x+51,282,109,99,'#1b303b'),rect(x+62,292,88,75,'#bb784a')]
world('anchorforge','Hammerplain · the anchor gantry','The replacement engines stand below the anchor. Keep the carrier off them.',OUTLINES['anchorforge'],[(26,14,14,3),(47,20,6,3),(20,22,7,3),(43,23,7,2),(14,27,6,3)], [
 control('forge-carrier',33,25,(27,15,14,10),'Furnace carrier · defend the engines',sign=True,doneFlag='furnaceWon'),control('forge-anchor',32,18,(26,5,14,14),'Anchor release · the manual breaker',sign=True,accessFlag='furnaceWon'),obj('forge-cooling',9,30,'Return to the cooling race',sign=True),obj('forge-hester',22,28,'Hester · the changeover',sprite='hester'),control('forge-supply',16,30,(13,26,8,4),'Crew rest bench · rest and bandages',sign=True)],
 {'start':(13,30),'breaker':(32,22),'stand':(27,26)},
 {'five-gantry':{'nell':(27,26),'orrin':(25,25),'kit':(24,28),'petra':(28,28),'celia':(23,29),'hester':(22,26),'durn':(39,23)},'five-release':{'nell':(31,21),'orrin':(30,20),'hester':(34,20),'kit':(28,23),'petra':(35,23),'celia':(27,24),'durn':(53,24)}},
 [point('gantry-hand',20,26,sprite='civilian-dockhand'),point('gantry-helper',41,27,sprite='civilian-dockhand-rust')],
 [('gantry-rest-bench',rest_bench(),168,80,324,636,716,{}),('forge-anchor',conduit(),320,286,620,122,408,{}),('gantry-crane',crane(),312,330,1060,160,490,{}),('gantry-engine',engine(),200,140,456,450,590,{}),('gantry-second-engine',engine(),200,140,1010,440,580,{}),('gantry-signal',[line([(776,360),(776,500)],'#a9d3cd',5)],1000,600,0,0,-997,{'hiddenFlag':'hammerplainFreed'}),('gantry-carrier',['<g transform="scale(1.25)">',*carrier(),'</g>'],280,210,664,366,571,{'hiddenFlag':'furnaceWon'})],forgebackground)

# Dawnwatch: warm lived-in terraces below a cold military signal wall.
def gun():
 return [ellipse(53,116,25,19,'#203744'),ellipse(139,116,25,19,'#203744'),ellipse(53,116,12,10,'#9d9e86'),ellipse(139,116,12,10,'#9d9e86'),poly([(24,89),(90,64),(171,80),(164,111),(52,124),(20,109)],'#485d62'),poly([(24,89),(90,64),(171,80),(111,102)],'#8c998d'),poly([(68,63),(126,39),(193,54),(192,77),(119,70),(80,87)],'#263f4e'),poly([(68,63),(126,39),(193,54),(174,61),(121,53),(82,73)],'#a69b7d'),ellipse(191,65,10,14,'#162c3a'),line([(58,95),(117,79)],'#bea56f',5)]
def dwellings():
 out=[]
 for x,y,w,h,c in [(0,60,122,196,'#8c8c79'),(126,94,128,162,'#b09d7c'),(260,25,138,231,'#748582')]:
  out += [rect(x,y,w,h,c),poly([(x-6,y),(x+w/2,y-47),(x+w+8,y),(x+w,y+12),(x+8,y+12)],'#344e59'),rect(x+18,y+38,27,41,'#233c48'),rect(x+w-46,y+38,27,41,'#233c48'),rect(x+w/2-14,205,29,51,'#233c48'),line([(x,252),(x+w,252)],'#d4c39a',5)]
  for xx in (x+21,x+w-43):out += [rect(xx,y+42,20,28,'#d6bb83'),line([(xx+10,y+41),(xx+10,y+71)],'#60736c',2)]
 return out
def fortress():
 out=[rect(20,85,750,208,'#455d65'),poly([(0,85),(115,36),(673,36),(794,85),(771,105),(21,105)],'#7f918e'),rect(87,28,103,262,'#334c59'),rect(603,28,103,262,'#334c59'),poly([(73,28),(138,0),(206,28),(191,43),(87,43)],'#a9aa93'),poly([(590,28),(655,0),(720,28),(705,43),(603,43)],'#a9aa93'),rect(315,149,149,145,'#1f3645'),poly([(301,149),(389,91),(480,149),(463,165),(389,126),(315,165)],'#b49d72')]
 for x in range(40,770,58):out += [rect(x,113,25,39,'#243c49'),rect(x+6,117,13,22,'#a4b8ae')]
 out += [rect(377,58,24,35,'#ad9567'),ellipse(389,74,23,23,'#ad9567'),ellipse(389,74,13,13,'#344e59')]
 return out

watchback=ground(1536,1008)+[poly([(0,455),(430,330),(1020,375),(1536,300),(1536,610),(0,610)],'#3b545d')]
world('dawnwatch','Dawnwatch · the lower town','The shelter gate is above the lower street. The barracks stair rises to the east.',OUTLINES['dawnwatch'],[(5,24,12,3),(43,21,11,3),(31,18,9,3)], [
 obj('dawn-supply',11,31,'Town infirmary · rest and bandages',sign=True),obj('dawn-ship',6,32,'Survey landing · return aboard',sign=True),control('dawn-gate',35,23,(31,17,10,7),'Shelter gate · the locking lever',sign=True),obj('dawn-barracks',51,25,'Barracks stair · the gun positions',sign=True,accessFlag='shelterOpened'),obj('dawn-soldier',29,25,'Enna · the shelter watch',sprite='enna',hiddenFlag='dawnwatchComplete'),obj('dawn-soldier-after',32,25,'Enna · the town watch',sprite='enna',requiredFlag='dawnwatchComplete')],
 {'start':(9,32),'gate':(35,24),'barracks':(49,27),'shelter':(35,25),'queue':(29,29)},
 {'five-dawn-arrival':{'nell':(28,28),'petra':(30,26),'orrin':(26,27),'kit':(25,29),'celia':(27,30),'aurel':(36,22),'enna':(32,25)},'five-shelter':{'nell':(34,26),'petra':(35,23),'orrin':(32,26),'kit':(30,28),'celia':(32,29),'enna':(37,25)},'five-dawn-freed':{'nell':(34,27),'petra':(36,25),'orrin':(31,26),'kit':(32,29),'celia':(30,28),'aurel':(38,25),'enna':(34,24)}},
 [point('lower-family',21,29,sprite='civilian-family-plum',hiddenFlag='shelterOpened'),point('shelter-family',35,21,sprite='civilian-family-plum',requiredFlag='shelterOpened'),point('lower-resident',18,32,sprite='civilian-traveler-blue',hiddenFlag='shelterOpened'),point('shelter-resident',37,22,sprite='civilian-traveler-blue',requiredFlag='shelterOpened'),point('gate-watch',42,25,sprite='dawn-soldier'),point('infirmary-hand',13,30,sprite='civilian-dockhand-rust')],
 [('watch-citadel',fortress(),800,300,450,80,380,{}),('lower-houses',dwellings(),410,260,20,335,595,{}),('watch-barracks-wing',factory(),600,270,1010,265,535,{}),('shelter-front',[rect(0,25,250,165,'#6c7f7a'),poly([(0,25),(125,0),(250,25),(250,43),(0,43)],'#b3ac87'),rect(66,68,117,122,'#203946'),rect(54,60,141,12,'#c0ac79')],252,192,702,311,503,{}),('shelter-bar',[rect(0,0,112,14,'#b49a69'),rect(8,0,7,119,'#374f58'),rect(96,0,7,119,'#374f58')],114,120,772,380,506,{'hiddenFlag':'shelterOpened'}),('shelter-lamps',[rect(713,390,15,37,'#e2c78d'),rect(925,390,15,37,'#e2c78d')],960,450,0,0,504,{'requiredFlag':'shelterOpened'})],watchback)

barrackback=ground(1536,1008)+[rect(0,270,1536,207,'#3b555f'),rect(0,280,1536,15,'#a49e7e')]
world('watchbarracks','Dawnwatch · the gun terraces','The mortar is west, the repeater east. Both positions command the signal-wall stair.',OUTLINES['watchbarracks'],[(10,19,7,3),(45,19,7,3),(27,15,10,3)], [
 obj('watch-plan',31,28,'Gun terraces · choose the first position',sign=True),control('watch-mortar',19,24,(9,18,11,5),'Western mortar · clear the position',sign=True,doneFlag='mortarWon'),control('watch-repeater',43,24,(43,18,11,5),'Eastern repeater · clear the position',sign=True,doneFlag='repeaterWon'),obj('watch-wall',32,20,'Signal-wall stair · the anchor',sign=True,markerFlags='mortarWon,repeaterWon'),obj('watch-town',8,31,'Return to the lower town',sign=True),control('watch-coat',50,29,(49,27,4,3),'Field locker · officers’ coat',sign=True,markerFlags='mortarWon,repeaterWon')],
 {'start':(12,31),'mortar':(20,24),'repeater':(42,24),'wall':(32,21),'junction':(31,28)},
 {'five-watch-guns':{'nell':(31,28),'petra':(32,26),'orrin':(28,27),'kit':(30,30),'celia':(27,30)}},
 [point('west-watch',18,23,sprite='dawn-soldier',hiddenFlag='mortarWon'),point('east-watch',44,23,sprite='dawn-gunner',hiddenFlag='repeaterWon'),point('shelter-volunteer',23,31,sprite='civilian-dockhand-rust',requiredFlag='dawnwatchComplete')],
 [('west-gun',gun(),204,140,225,397,537,{'hiddenFlag':'mortarWon'}),('east-gun',gun(),204,140,1060,397,537,{'hiddenFlag':'repeaterWon'}),('west-silent-gun',[rect(0,0,140,11,'#536968'),poly([(25,-35),(98,-47),(149,-22),(124,-1),(39,0)],'#334c57')],180,60,246,518,542,{'requiredFlag':'mortarWon'}),('east-silent-gun',[rect(0,0,140,11,'#536968'),poly([(25,-35),(98,-47),(149,-22),(124,-1),(39,0)],'#334c57')],180,60,1081,518,542,{'requiredFlag':'repeaterWon'}),('signal-stair',[poly([(0,0),(230,0),(230,99),(0,99)],'#2f4955')]+[rect(0,y,230,5,'#b0aa89')for y in range(0,100,16)],240,104,647,340,444,{}),('field-locker',[rect(4,4,116,50,'#61736e'),poly([(4,4),(27,0),(125,0),(116,12),(4,12)],'#b5a77d'),rect(53,20,15,10,'#d4ba7c')],128,58,1169,643,701,{})],barrackback)

wallback=sky(1536,1008)+[poly([(0,500),(300,430),(530,490),(800,420),(1100,493),(1536,410),(1536,1008),(0,1008)],'#71817d')]
world('signalwall','Dawnwatch · the signal wall','The command platform stands below the anchor. Its release wheel faces the town.',OUTLINES['signalwall'],[(27,16,10,3),(9,27,4,3),(49,27,4,3)], [
 obj('wall-commander',33,24,'Commander Aurel · the command platform',sprite='aurel',doneFlag='aurelWon',spriteHiddenFlag='aurelWon'),control('wall-anchor',32,20,(26,6,14,14),'Dawnwatch anchor · town release wheel',sign=True,accessFlag='aurelWon'),obj('wall-barracks',10,32,'Return down the gun terraces',sign=True),obj('wall-sentry',39,27,'Enna · the signal watch',sprite='enna')],
 {'start':(14,32),'stand':(29,27),'release':(32,22)},
 {'five-aurel':{'nell':(29,27),'petra':(31,26),'orrin':(26,27),'kit':(28,29),'celia':(25,30),'aurel':(35,24),'enna':(37,26)},'five-watch-release':{'nell':(30,24),'petra':(33,22),'orrin':(28,23),'kit':(27,26),'celia':(28,28),'aurel':(37,25),'enna':(34,21)}},
 [point('wall-west-guard',23,25,sprite='dawn-soldier',hiddenFlag='aurelWon'),point('wall-east-guard',41,25,sprite='dawn-soldier',hiddenFlag='aurelWon'),point('watch-chart-runner',43,28,sprite='dawn-gunner',requiredFlag='dawnwatchFreed')],
 [('watch-anchor',conduit(),320,286,620,135,421,{}),('wall-parapet',[rect(0,0,1536,45,'#3b5661'),rect(0,0,1536,7,'#c4b48a')]+[rect(x,-27,51,36,'#82908a')for x in range(0,1536,90)],1536,90,0,500,-997,{}),('watch-return-line',[line([(783,358),(783,510)],'#afcfc0',6)],1000,540,0,0,-996,{'hiddenFlag':'dawnwatchFreed'}),('signal-desk',[poly([(0,16),(65,0),(126,21),(54,42)],'#ccb58c'),poly([(0,16),(54,42),(54,67),(0,39)],'#465e63'),poly([(54,42),(126,21),(126,49),(54,67)],'#243e4c'),rect(45,15,39,13,'#e0c99c')],130,70,1094,579,649,{})],wallback)

# An empty chart cabin, with an imperial projection in its glazed observation bay.
# The memory is scenery, never a restored station or a living campaign NPC.
cabinback=[rect(0,0,1536,1008,'#1d3443'),rect(220,255,1100,500,'#3c545b'),poly([(220,255),(420,146),(1110,146),(1320,255)],'#728581'),rect(420,170,690,274,'#1d3544'),rect(433,183,664,244,'#6d8c96'),poly([(433,322),(720,280),(1097,323),(1097,427),(433,427)],'#b4c2b2'),rect(220,478,1100,16,'#b49e71')]
world('observation','Survey ship · observation cabin','The observation glass faces the inland sky. The deck hatch is below.',OUTLINES['observation'],[(11,21,7,3),(46,21,6,3)], [obj('cabin-deck',32,32,'Deck hatch · return to the others',sign=True)],
 {'start':(32,29),'glass':(32,25)},
 {'five-emperor-offer':{'nell':(32,22),'emperor':(40,18),'ansel':(28,17),'tomas':(34,17)}}, [],
 [('cabin-window-memory',[rect(0,0,664,244,'#d1b98d'),poly([(0,163),(264,135),(664,174),(664,244),(0,244)],'#8b8b78'),rect(28,60,192,120,'#74837b'),poly([(5,60),(127,8),(239,60)],'#35505a'),rect(52,91,35,50,'#d8bf88'),rect(149,91,37,50,'#d8bf88'),rect(280,93,264,15,'#3d5459'),rect(300,108,15,97,'#3d5459'),rect(516,108,15,97,'#3d5459'),line([(0,209),(664,209)],'#d9c493',4),line([(249,84),(575,114)],'#8a6759',3)]+[poly([(x,95),(x+22,98),(x+10,124)],'#b26755')for x in (280,324,368,412,456)],664,244,433,183,-998,{'hiddenFlag':'emperorOfferSeen'}),('cabin-glazing',[rect(0,0,690,11,'#c3b18a'),rect(0,0,11,274,'#c3b18a'),rect(679,0,11,274,'#c3b18a'),rect(0,263,690,11,'#c3b18a'),rect(211,0,8,274,'#667a7a'),rect(469,0,8,274,'#667a7a'),poly([(24,18),(195,18),(24,178)],'#b0c8bd')],690,274,420,170,-997,{}),('cabin-benches',[rect(0,0,165,41,'#8d7c59'),rect(0,39,165,15,'#334d56')],180,70,260,498,568,{}),('cabin-chart-case',[rect(0,0,132,47,'#8f815e'),rect(7,5,118,14,'#d1bd92')],140,60,1100,503,563,{})],cabinback)

from windmere import export as export_windmere
export_windmere(globals())
from flagship import export as export_flagship
export_flagship(globals())

for id,mapid in [('benefactor-retaliation','airship'),('wind-lift','dispensary'),('wind-gallery','mirrorward'),('wind-engine','mirrorward'),('airfield-guard','airfield'),('hammer-lift','coolingworks'),('hammer-race','coolingworks'),('hammer-stores','hammerplain'),('hammer-carrier','anchorforge'),('dawn-mortar-first','watchbarracks'),('dawn-repeater-first','watchbarracks'),('dawn-mortar-last','watchbarracks'),('dawn-repeater-last','watchbarracks'),('dawn-commander','signalwall')]:
 w,h=42,26;key='battle-'+id;f=[(1,3,40,20)];layers=[layer(1,'Arena surroundings',[(0,0,w,h)],w,h,5),layer(2,'Clear tactical floor',f,w,h)]
 write_map(key,('Survey ship · ' if mapid=='airship' else 'Windmere · ' if id.startswith('wind-') else 'Dawnwatch · ' if id.startswith('dawn-') else 'Hammerplain · ')+id,'Tactical arena',layers,w,h,safe='start')
 back=sky(1008,624) if mapid in ('airfield','airship') else [rect(0,0,1008,624,'#2b424b'),rect(0,25,1008,80,'#4b6262'),rect(0,73,1008,10,'#ad9565')]
 if id.startswith('wind-'):back=[rect(0,0,1008,624,'#294954'),rect(0,15,1008,58,'#6b9188'),rect(0,65,1008,10,'#c4c3a0')]+[poly([(x,15),(x+56,0),(x+112,15),(x+112,55),(x,55)],'#94b6a3')for x in range(0,1008,144)]
 if id.startswith('dawn-'):back=sky(1008,624)[:2]+[rect(0,65,1008,20,'#677f7f'),rect(0,80,1008,5,'#b9aa83')]
 if id=='hammer-race':back += [rect(0,0,1008,63,'#2e515b'),line([(0,36),(1008,36)],'#b5c3a5',5)]
 if id=='hammer-carrier':
  for y in (195,248):back += [rect(0,y,1008,7,'#1b3440'),rect(0,y,1008,2,'#b8a67c')]
 back.extend(arena_fixtures())
 floorart=floor_shapes([(24,72),(984,72),(984,552),(24,552)],1008,624,mapid,arena=True)
 if id=='hammer-carrier':
  for y in (195,248):floorart += [rect(24,y,960,7,'#1b3440'),rect(24,y,960,2,'#b8a67c')]
 svg(ART/f'{key}-back.svg',1008,624,back);svg(ART/f'{key}-floor.svg',1008,624,floorart)
 manifest[key]=[{'key':f'scene-five-{key}-{i}','url':f'art/vector/chapter-five/{key}-{part}.svg','x':0,'y':0,'width':1008,'height':624,'depth':-1001+i,'layerId':i}for i,part in [(1,'back'),(2,'floor')]]

# The carrier's world actor and combat body share one geometry, scaled in SVG.
svg(ART/'furnace-carrier-battle.svg',224,168,carrier())
svg(ROOT/'public/art/vector/furnace-carrier.svg',80,80,['<g transform="translate(3 14) scale(.33)">',*carrier(),'</g>'])
svg(ROOT/'public/art/vector/portrait-furnace-carrier.svg',128,128,['<g transform="translate(-8 5) scale(.64)">',*carrier(),'</g>'])
(ROOT/'src/content/chapter-five/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Exported Chapter Five Acts I–IV: 13 story maps, 14 arenas and native SVG scenery.')
