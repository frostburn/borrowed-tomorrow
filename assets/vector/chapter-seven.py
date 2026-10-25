"""Chapter Seven native vector scenery and real Tiled routes. No raster inputs.
Run: python3 assets/vector/chapter-seven.py. Editable source art remains SVG.
"""
import json,re,math,copy
from pathlib import Path
from xml.sax.saxutils import escape
from map_metadata import retain_interaction_roles
from chapter_seven_style import OUTLINES,ARENA,GOD_GROUND,FIXTURES,LIGHTS,cells,floor_art,lean,fixture,spill_art,arena
ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'public/art/vector/chapter-seven';MAP=ROOT/'src/content/chapter-seven/maps'
ART.mkdir(parents=True,exist_ok=True);MAP.mkdir(parents=True,exist_ok=True);manifest={}
INK='#172c3b';BLUE='#466578';PALE='#d7dbce';GOLD='#c5a36b';TEAL='#5a9692';RUST='#966450'
def rect(x,y,w,h,c):return f'<path d="M{x} {y}h{w}v{h}h{-w}Z" fill="{c}"/>'
def poly(p,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in p)+f'" fill="{c}"/>'
def line(p,c,w=3):return '<polyline points="'+' '.join(f'{x:g},{y:g}'for x,y in p)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ellipse(x,y,rx,ry,c):return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{c}"/>'
def svg(path,w,h,body):path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(path.stem.replace("-"," "))}</title>'+''.join(body)+'</svg>\n')
def props(**kw):return [{'name':k,'type':'bool'if isinstance(v,bool)else'int'if isinstance(v,int)else'string','value':v}for k,v in kw.items()]
def point(name,x,y,**kw):return {'name':name,'point':True,'x':x*24+12,'y':y*24+12,'properties':props(**kw)}
def obj(name,x,y,label,kind='story',**kw):return point(name,x,y,label=label,kind=kind,**kw)
def control(name,x,y,area,label,**kw):
 a,b,w,h=area
 return {'name':name,'x':a*24,'y':b*24,'width':w*24,'height':h*24,'properties':props(label=label,approachX=x,approachY=y,kind='story',**kw)}
def group(i,name,objects=None,**kw):return {'id':i,'type':'objectgroup','name':name,'visible':True,'objects':objects or [],'properties':props(**kw)}
def layer(i,name,areas,gid):
 data=[0]*2688
 for x,y,w,h in areas:
  for yy in range(y,y+h):
   for xx in range(x,x+w):data[yy*64+xx]=gid
 return {'id':i,'name':name,'type':'tilelayer','visible':True,'width':64,'height':42,'data':data}
def write_map(id,title,subtitle,floor,objects,casts,people,back,ground,decor=[],start=(32,34),art=True,blocks=[]):
 layers=[layer(1,'Surroundings',[(0,0,64,42)],5),layer(2,'Walking surfaces',floor,3),layer(3,'Scenery footprints',blocks,6)];entries=[]
 if id in OUTLINES:layers[1]['data']=cells(OUTLINES[id])
 def add(n,body,depth,lid,w=1536,h=1008,x=0,y=0):
  svg(ART/f'{id}-{n}.svg',w,h,body);entries.append({'key':f'scene-seven-{id}-{n}','url':f'art/vector/chapter-seven/{id}-{n}.svg','x':x,'y':y,'width':w,'height':h,'depth':depth,'layerId':lid})
 if art:add('back',back,-1000,1);add('ground',ground,-999,2)
 decor=list(decor)
 for i,(x,y)in enumerate(FIXTURES.get(id,[])):decor.append(('light-'+str(i),fixture(id=='quietward'),48,148,x-23,y-148,y,{}))
 for n,body,w,h,x,y,depth,flags in decor:
  flags=dict(flags)
  if n in ('distant-god','monument','revealed-sun','revealed-heart'):flags['live']=True
  lid=len(layers)+1;layers.append(group(lid,n,**flags));add(n,body,depth,lid,w,h,x,y)
  if id in OUTLINES and Path(entries[-1]['url']).stem in LIGHTS['props']:
   lid=len(layers)+1;layers.append(group(lid,n+'-spill',**flags));add(n+'-spill',spill_art([entries[-1]],OUTLINES[id]),-997,lid)
 layers += [group(len(layers)+1,'Interactions',objects),group(len(layers)+2,'Arrivals',[point('start',*start),point('return',32,20)]),group(len(layers)+3,'People',people)]
 for sid,cast in casts.items():layers.append(group(len(layers)+1,'Scene:'+sid,[point(k,*v)for k,v in cast.items()]))
 source=json.loads((ROOT/'src/content/chapter-six/maps/observatory.json').read_text())
 d={k:source[k]for k in ['type','version','tiledversion','orientation','renderorder','infinite','width','height','tilewidth','tileheight','tilesets']};d.update(nextlayerid=len(layers)+1,nextobjectid=1,properties=props(name=title,subtitle=subtitle,sceneArt=id,artStyle='rotoscope',safeArrival='start',cameraLeadY=144),layers=layers)
 for l in layers:
  for o in l.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 retain_interaction_roles(MAP/f'{id}.json',layers)
 text=json.dumps(d,indent=2);text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+64])for i in range(0,2688,64))+'\n    ]',text)
 (MAP/f'{id}.json').write_text(text+'\n');manifest[id]=entries
crew={'nell':(32,27),'orrin':(29,28),'kit':(34,28),'petra':(28,30),'celia':(35,30)}
def casts(*ids,extra=None):return {id:{**crew,**(extra or {})}for id in ids}
def sky(sea=True):
 out=[rect(0,0,1536,1008,INK)]
 for i in range(53):
  x=(i*193+71)%1536;y=(i*97+40)%1008;out.append(rect(x,y,2+(i%3)*2,2,'#849ca6'))
 if sea:
  out += [poly([(0,0),(1536,0),(1536,560),(1280,619),(975,590),(727,645),(420,602),(190,631),(0,580)],'#28596b'),poly([(0,0),(1536,0),(1536,448),(1250,538),(951,507),(714,568),(427,537),(184,557),(0,504)],'#507f88')]
  for x,y,w in [(40,106,280),(360,150,320),(820,75,480),(1160,185,300),(220,222,190),(714,227,470)]:out.append(poly([(x,y+320),(x+w,y+307),(x+w-47,y+323),(x+14,y+328)],'#8bafb0'))
  out += [poly([(1050,123),(1157,112),(1136,144),(1075,151)],'#b2c5b9'),poly([(1050,123),(1075,151),(1136,144),(1133,152),(1073,160)],'#628f92'),line([(1105,143),(1111,240)],'#a9c1b5',4),poly([(1108,161),(1110,231),(1157,218)],'#83a7a3')]
 return out
def sun(cx=768,cy=197,r=102):
 out=[]
 for a in range(0,360,30):
  t=math.radians(a);u=(math.cos(t),math.sin(t));v=(-u[1],u[0]);out.append(poly([(cx+u[0]*r+v[0]*9,cy+u[1]*r+v[1]*9),(cx+u[0]*(r+38),cy+u[1]*(r+38)),(cx+u[0]*r-v[0]*9,cy+u[1]*r-v[1]*9)],GOLD))
 out += [ellipse(cx,cy,r,r,GOLD),ellipse(cx,cy,r-16,r-16,INK),poly([(cx+45,cy-r),(cx+68,cy-r-8),(cx+27,cy+13),(cx+2,cy+2)],INK)]
 return out
def arch(x,y,w,h):
 # Crooked masonry jambs, separate lit glass and deep colored reveal planes.
 return lean([poly([(x-10,y),(x+w-5,y-6),(x+w+8,y+h),(x,y+h+4)],'#63858b'),poly([(x+w-22,y+4),(x+w-5,y-6),(x+w+8,y+h),(x+w-18,y+h-6)],'#405e6d'),poly([(x-15,y),(x+w*.48,y-54),(x+w+14,y-9),(x+w-4,y+12),(x+w*.48,y-30),(x+1,y+18)],'#c3c9b3'),poly([(x+28,y+h),(x+27,y+62),(x+w*.48,y+10),(x+w-28,y+56),(x+w-21,y+h-5)],'#365865'),poly([(x+40,y+h-8),(x+39,y+68),(x+w*.48,y+28),(x+w-40,y+65),(x+w-34,y+h-12)],'#86a39b'),poly([(x+47,y+73),(x+w*.48,y+40),(x+w*.48,y+h-21),(x+48,y+h-15)],'#b4c3a7'),line([(x+w*.48,y+42),(x+w*.48+3,y+h-16)],'#768f88',5),line([(x+44,y+h*.53),(x+w-36,y+h*.53-5)],'#668982',5),poly([(x+20,y+h-4),(x+w-20,y+h-12),(x+w-11,y+h+1),(x+14,y+h+10)],'#b8bba0')],y+h,.025 if x<768 else -.026)
def chest(x,y):return ('chest',[rect(0,14,58,32,RUST),poly([(0,14),(10,0),(47,0),(58,14)],GOLD),rect(25,20,9,13,PALE)],60,48,x,y,y+48,{})
def supplies(id,x=18,y=33,**kw):return obj(id+'-rest',x,y,'Shelter · rest and field supplies',kind='optional',sign=True,**kw)
def body_art():return (ROOT/'public/art/vector/benefactor/benefactor.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]
def form_prop(form,flags):
 source=(ROOT/f'public/art/vector/benefactor/benefactor-{form}-motion.svg').read_text()
 body=re.search(r'<svg x="0" y="0"[^>]*>(.*?)</svg>',source,re.S)[1]
 return ('revealed-'+form,['<g transform="translate(552 245) scale(1.2)">',body,'</g>'],1536,1008,0,0,-998.5,flags)
def body_prop(n,x,y,scale,flags):return (n,[f'<g transform="translate({x} {y}) scale({scale})">',body_art(),'</g>'],1536,1008,0,0,-998.5,flags)
def recalled(name,x,y,scale,depth=-998.2):
 source_path=ROOT/('public/art/vector/chapter-one-kit/river-wall.svg'if name=='river-wall'else f'public/art/vector/scenes/station/{name}.svg')
 source=source_path.read_text().split('>',1)[1].rsplit('</svg>',1)[0]
 return (name,[f'<g transform="translate({x} {y}) scale({scale})">',source,'</g>'],1536,1008,0,0,depth,{})
def cot(name,x,y):
 # Four posts support the same mattress corners; no detached upright panel.
 body=[poly([(8,55),(17,58),(17,89),(8,86)],'#68817d'),poly([(105,45),(113,44),(113,78),(105,81)],'#68817d'),poly([(28,67),(37,66),(37,92),(28,94)],'#78908a'),poly([(120,55),(128,52),(128,80),(120,85)],'#78908a'),poly([(3,42),(104,28),(130,51),(30,70)],'#aaa88a'),poly([(3,42),(30,70),(30,78),(3,51)],'#708782'),poly([(30,70),(130,51),(130,60),(30,78)],'#82988b'),poly([(7,39),(102,25),(124,49),(31,66)],'#d3d6bd'),poly([(9,39),(33,35),(53,56),(31,62)],'#ebe4c8'),poly([(49,33),(100,27),(124,49),(66,60)],'#7a9b8b'),poly([(66,60),(124,49),(124,56),(67,66)],'#587d77')]
 return (name,body,132,96,x,y,y+96,{})
def camp(name,x,y):
 body=[poly([(0,82),(63,0),(177,17),(220,101),(132,114)],'#bca584'),poly([(63,0),(132,114),(220,101),(177,17)],'#7b8c88'),poly([(63,9),(15,81),(115,106)],'#d6c8a2'),poly([(63,35),(44,88),(98,100)],INK),line([(0,82),(-20,110)],GOLD,3),rect(233,83,45,25,RUST),poly([(233,83),(246,70),(274,74),(278,83)],GOLD)]
 return (name,body,288,120,x,y,y+114,{})
# A threshold with the familiar airship hull hanging over an impossible sea.
f=[(16,26,32,11),(28,18,9,9)]
back=sky()+sun(768,178,92)
ship=(ROOT/'public/art/vector/chapter-five/survey-ship.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]
ship=['<g transform="translate(56 350) scale(.66)">',ship,'</g>',poly([(497,583),(532,591),(462,666),(430,655)],'#a29d7b'),line([(503,587),(444,650)],'#cec5a0',4),line([(528,590),(460,660)],'#b7b795',4)]
write_map('hollowsill','Beyond the hollow sun · the crossing','The survey ship holds the mortal end. A path runs beneath the suspended sea.',f,[supplies('sill'),obj('sill-alda',20,29,'Alda · the mooring line',kind='talk',sprite='alda'),obj('sill-cross',32,19,'The suspended pier',kind='exit',accessFlag='domainEntered',sign=True)],casts('seven-crossing',extra={'alda':(24,29)}),[],back,floor_art('hollowsill'),[('survey-ship',ship,1536,1008,0,0,-998.3,{}),body_prop('distant-god',650,370,.65,{'hiddenFlag':'domainEntered'}),camp('crossing-shelter',923,665)])
f=[(14,27,36,10),(26,18,13,10),(9,33,6,3)]
back=sky()+[poly([(230,393),(1190,365),(1298,490),(155,513)],'#405c68')]+arch(634,280,260,250)
ground=floor_art('takenwater')
write_map('takenwater','The sea of taken mornings','A railway platform hangs beneath the water. Living passengers wait behind the old collector.',f,[obj('water-hounds',25,31,'The pursuit · clear the platform',hiddenFlag='domainHoundsWon',sprite='hound-solar'),obj('water-collector',32,24,'The first collector',accessFlag='domainHoundsWon',hiddenFlag='domainCollectorWon',sprite='guardian-solar'),obj('water-field',32,19,'The field beyond the platform',kind='exit',accessFlag='takenPeopleFreed',sign=True),obj('water-sill',11,35,'Survey crossing',kind='exit',sign=True),obj('water-porter',19,29,'A Rillbridge porter',kind='talk',sign=True),supplies('water',47,34)],casts('seven-water','seven-water-free'),[point('waiting-porter',20,29,sprite='civilian-dockhand-rust',hiddenFlag='takenPeopleFreed'),point('waiting-family',41,29,sprite='civilian-family-blue',hiddenFlag='takenPeopleFreed')],back,ground,[recalled('station-house',350,520,.7,671)],blocks=[(15,26,7,2)])
f=[(16,27,34,10),(24,18,17,10),(9,33,8,3)]
back=sky(False)+[poly([(0,85),(1536,45),(1536,492),(0,475)],'#89917e'),poly([(0,316),(500,275),(840,333),(1536,245),(1536,1008),(0,1008)],'#a28e60')]+sun(760,187,85)
for row,y in enumerate(range(415,873,53)):
 back.append(poly([(0,y+30),(590,y-20),(1030,y+4),(1536,y-38),(1536,y-19),(1040,y+24),(590,y+1),(0,y+48)],['#b0a076','#a59771','#b5a87f'][row%3]))
 for x in range(-20+(row%2)*22,1536,31):
  if x>345 and x<1230 and y>625 or 550<x<1020 and y>430:continue
  height=30+row*3;back.extend([line([(x,y+height),(x+7,y)],'#c7b880',2),poly([(x+7,y),(x+1,y+9),(x+2,y+20),(x+6,y+17),(x+10,y+5),(x+13,y+14),(x+10,y+28),(x+15,y+24),(x+19,y+12)],'#dfc691')])
back += [poly([(0,435),(184,414),(279,453),(420,433),(515,461),(510,474),(423,451),(274,471),(182,431),(0,451)],'#d1dcd3'),poly([(1115,473),(1300,441),(1536,453),(1536,469),(1305,459),(1125,487)],'#ccd8d0')]
write_map('firstfield','The first harvest','Ripe wheat stands in frost. A casting machine circles the same uncut row.',f,[obj('field-furnace',32,24,'The harvest keeper',hiddenFlag='domainFurnaceWon'),obj('field-ward',32,19,'The old hospice',kind='exit',accessFlag='harvestFreed',sign=True),obj('field-water',11,35,'The suspended platform',kind='exit',sign=True),obj('field-farmer',19,29,'The first harvest · a farmer’s account',kind='talk',sign=True),obj('field-reflector',46,32,'The keeper’s empty lamp',kind='optional',accessFlag='harvestFreed',doneFlag='domainReflectorTaken',sign=True),supplies('field',15,34)],casts('seven-harvest','seven-harvest-free'),[point('harvest-worker',20,28,sprite='civilian-dockhand',hiddenFlag='harvestFreed')],back,floor_art('firstfield'),[chest(1080,726),recalled('market-stall',280,560,.6,684),('harvest-keeper',[(ROOT/'public/art/vector/chapter-five/furnace-carrier-battle.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]],224,168,668,426,594,{'hiddenFlag':'domainFurnaceWon'})])
f=[(14,25,36,12),(25,17,15,9),(10,33,5,3)]
back=sky(False)+[poly([(180,214),(1326,196),(1340,610),(198,634)],'#74928f'),poly([(160,217),(746,80),(1362,198),(1340,225),(750,128),(180,244)],'#c5c9ad'),poly([(1310,201),(1340,214),(1353,614),(1316,625)],'#4c7076'),line([(197,419),(1330,398)],'#b8b899',5)]
for x in [235,445,875,1085]:back+=arch(x,302,176,292)
write_map('quietward','The first hospice · the quiet ward','The beds are warm. The people in them have been waiting to go home.',f,[control('ward-engine-seven',32,24,(27,14,11,10),'The gift of healing · mirrored engine',hiddenFlag='domainWardWon'),obj('ward-seasons',32,18,'The city of seasons',kind='exit',accessFlag='wardPeopleFreed',sign=True),obj('ward-field',12,35,'The harvest terrace',kind='exit',sign=True),obj('ward-patient',19,29,'The patient by the western window',kind='talk',sign=True),supplies('ward-seven',47,34)],casts('seven-hospice','seven-hospice-free',extra={'nell':(25,29),'celia':(22,30)}),[point('old-patient',20,30,sprite='civilian-patient-green',hiddenFlag='wardPeopleFreed')],back,floor_art('quietward'),[('original-engine',[(ROOT/'public/art/vector/chapter-five/ward-engine-battle.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]],256,240,652,348,588,{'hiddenFlag':'domainWardWon'}),cot('western-bed',380,600),cot('eastern-bed',1075,600)],blocks=[(16,26,3,2),(45,26,3,2)])
f=[(14,26,36,11),(24,17,18,10),(42,22,14,5),(8,33,7,3)]
back=sky()+[poly([(0,292),(280,103),(565,330),(890,145),(1150,257),(1536,119),(1536,1008),(0,1008)],'#77939f'),poly([(0,292),(280,103),(404,247),(301,226),(233,257),(156,256)],PALE),poly([(923,329),(1387,311),(1405,592),(936,614)],'#a88b6e'),poly([(1360,317),(1387,311),(1405,592),(1369,604)],'#7c7467'),poly([(901,331),(1174,230),(1429,311),(1412,332),(1177,260),(926,348)],'#dec9a3'),poly([(978,296),(1010,246),(1056,223),(1096,247),(1104,283)],'#73988a'),poly([(978,296),(988,305),(1104,293),(1104,283)],'#a8b5a0'),line([(1054,224),(1050,194)],'#c3b68e',4)]
back+=arch(1050,376,218,218)
ground=floor_art('seasonstreet')
write_map('seasonstreet','The city of stolen seasons','Skeld’s snow lies across a Namar stair. The freed people need one road that stays open.',f,[obj('season-dragon',32,23,'The winter kept here',hiddenFlag='domainDragonWon',sprite='winter-dragon'),obj('season-refuge',32,18,'The unwritten hour',kind='exit',accessFlag='seasonsFreed',sign=True),obj('season-ward',10,35,'The quiet ward',kind='exit',sign=True),obj('season-patrol',48,27,'The courier stair · divine patrol',kind='optional',hiddenFlag='domainPatrolWon',sprite='herald'),obj('season-nameplate',18,29,'A cut tow-rope beside the snow',kind='talk',sign=True),supplies('season',47,34,accessFlag='domainPatrolWon')],casts('seven-seasons','seven-seasons-free'),[],back,ground,[recalled('river-wall',162,764,.9),('tow-rope',[line([(6,13),(43,9),(62,21),(34,32),(12,21),(27,13),(52,31),(69,44)],'#d1bb8c',4),line([(61,35),(71,33)],'#a2b3a4',2)],84,52,396,670,722,{})])
f=[(14,25,36,12),(27,18,11,8),(12,33,3,3)]
back=sky()+[poly([(122,508),(710,412),(1392,520),(1302,575),(760,532),(240,583)],'#68818a'),poly([(350,544),(672,428),(932,450),(1220,564),(1130,580),(917,480),(686,460),(408,568)],'#aeb7a6'),line([(432,561),(432,638)],'#a3af9b',5),line([(1142,564),(1142,646)],'#a3af9b',5)]+sun(768,191,110)
write_map('lastrefuge','The unwritten hour','The rescued people have made a shelter. Beyond it, the last stair reaches the god.',f,[supplies('refuge-seven',22,32),obj('refuge-preparations',32,23,'The last stair · final preparations',sign=True),obj('refuge-seasons',13,35,'The city of seasons',kind='exit',sign=True),obj('refuge-nell',27,29,'Nell · the lantern',kind='talk',sign=True),obj('refuge-kit',37,30,'Kit · the return route',kind='talk',sign=True),obj('refuge-orrin',20,28,'Orrin · the gate gear',kind='talk',sign=True),obj('refuge-celia',44,29,'Celia · the dressing table',kind='talk',sign=True),obj('refuge-petra',30,33,'Petra · the watch',kind='talk',sign=True)],casts('seven-refuge','seven-ready','seven-orrin'),[point('porter',16,28,sprite='civilian-dockhand-rust'),point('farmer',47,28,sprite='civilian-dockhand'),point('patient',41,33,sprite='civilian-patient-green'),point('family',18,33,sprite='civilian-family-blue')],back,floor_art('lastrefuge'),[chest(480,730),camp('returning-shelter',375,575),cot('resting-bed',1063,657)],blocks=[(16,25,6,2),(45,28,3,2)])
f=[(18,25,29,12),(24,17,17,9),(12,33,7,3)]
back=sky(False)+sun(768,174,146)+[poly([(0,493),(380,378),(710,402),(1040,361),(1536,489),(1536,1008),(0,1008)],'#3d5969')]
write_map('sunthrone','The Benefactor · the sun throne','The three streams are broken. The god stands at the source of collection.',f,[obj('throne-fight',32,22,'The Benefactor',doneFlag='benefactorHeartWon',sign=True),obj('throne-retreat',13,35,'Return to the shelter',kind='exit',hiddenFlag='daysReturned',sign=True)],casts('seven-god','seven-sun','seven-heart','seven-release'),[],back,floor_art('sunthrone'),[body_prop('monument',552,245,1.2,{'hiddenFlag':'hollowSunSeen'}),form_prop('sun',{'requiredFlag':'hollowSunSeen','hiddenFlag':'fragmentReturned'}),form_prop('heart',{'requiredFlag':'fragmentReturned','hiddenFlag':'daysReturned'})])
# A real return to the accepted station geometry, with no raid restrictions or ghost Ansel.
d=copy.deepcopy(json.loads((ROOT/'src/content/chapter-one/maps/station.json').read_text()))
d['layers']=[l for l in d['layers']if l['type']=='tilelayer' and l['id'] not in (6,19,22)]
for l in d['layers']:l['properties']=[p for p in l.get('properties',[]) if p['name']=='sort']
d['properties']=props(name='Larkspur · an ordinary departure',subtitle='The platform is open. Tomas has the tickets; Iona is keeping the station.',sceneArt='homecoming',artStyle='rotoscope',safeArrival='start')
objs=[obj('home-tomas',25,13,'Tomas · the sea train',kind='talk',sprite='tomas'),obj('home-iona',20,12,'Iona · the station',kind='talk',sprite='clerk'),obj('home-train',28,14,'Board the ordinary sea train',kind='story',sign=True),obj('home-cap',17,14,'Ansel’s cap',kind='talk',sign=True)]
d['layers'] += [group(100,'Interactions',objs),group(101,'Arrivals',[point('start',21,18)]),group(102,'People',[point('traveler',31,16,sprite='civilian-traveler-blue')]),group(103,'Scene:seven-home',[point(k,*v)for k,v in {'nell':(21,16),'tomas':(25,13),'iona':(20,12),'orrin':(20,18),'kit':(26,18),'petra':(24,19),'celia':(22,19)}.items()])]
d['nextobjectid']=1;d['nextlayerid']=104
for l in d['layers']:
 for o in l.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
(MAP/'homecoming.json').write_text(json.dumps(d,separators=(',',':'))+'\n')
manifest['homecoming']=[p for p in json.loads((ROOT/'src/content/chapter-one/scene-art.json').read_text())['station']if p['layerId']in {l['id']for l in d['layers']}]
f=[(10,25,42,8),(18,22,24,4)]
shore=json.loads((ROOT/'src/content/chapter-six/scene-art.json').read_text())['lastshore']
write_map('seaholiday','The sea · tomorrow','The train goes home in the evening. For now there is nowhere else to be.',f,[obj('sea-tomas',33,23,'Tomas · the water’s edge',kind='talk',sprite='tomas'),obj('sea-friends',24,26,'The picnic',kind='talk',sign=True),obj('sea-orrin',27,26,'Orrin · the picnic',kind='talk',sprite='orrin'),obj('sea-kit',29,25,'Kit · the bags',kind='talk',sprite='kit'),obj('sea-petra',35,25,'Petra · the bread',kind='talk',sprite='petra'),obj('sea-celia',37,25,'Celia · the shade',kind='talk',sprite='celia'),obj('sea-ending',32,25,'Stay beside the sea',kind='story',sign=True)],{'seven-sea':{'nell':(31,22),'tomas':(33,22),'orrin':(27,24),'kit':(29,24),'petra':(35,24),'celia':(37,24)},'seven-picnic':{'nell':(30,25),'tomas':(33,22),'orrin':(29,24),'kit':(31,23),'petra':(34,24),'celia':(35,25)}},[],[],[],start=(25,24),art=False)
# Use the actual coast, now reached in the real world, with its accepted framing.
manifest['seaholiday']=shore
# Simple native tactical surfaces, shared by rules and review.
for id,mapid in [('domain-hounds','takenwater'),('domain-collector','takenwater'),('domain-furnace','firstfield'),('domain-ward','quietward'),('domain-dragon','seasonstreet'),('domain-patrol','seasonstreet'),('benefactor-body','sunthrone'),('benefactor-sun','sunthrone'),('benefactor-heart','sunthrone')]:
 source=json.loads((ROOT/'src/content/chapter-six/maps/battle-capital-procession.json').read_text())
 source['properties']=props(name=id,sceneArt='battle-'+id,artStyle='rotoscope')
 for l in source['layers']:
  if l['type']=='objectgroup':l['objects']=[]
  elif l['name']=='Walking surfaces':l['data']=cells(GOD_GROUND if id.startswith('benefactor-')else ARENA,source['width'],source['height'])
 (MAP/('battle-'+id+'.json')).write_text(json.dumps(source,separators=(',',':'))+'\n')
 body=arena(mapid)
 lid=next(l['id']for l in source['layers']if l['type']=='tilelayer')
 if id.startswith('benefactor-'):
  manifest['battle-'+id]=[{'key':'benefactor-domain','url':'art/vector/benefactor/benefactor-domain.svg','x':0,'y':0,'width':1024,'height':480,'depth':-1000,'layerId':lid}]
 else:
  svg(ART/('battle-'+id+'.svg'),1024,480,body)
  manifest['battle-'+id]=[{'key':'scene-seven-battle-'+id,'url':'art/vector/chapter-seven/battle-'+id+'.svg','x':0,'y':0,'width':1024,'height':480,'depth':-1000,'layerId':lid}]
(ROOT/'src/content/chapter-seven/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Chapter Seven:',len(manifest),'native scene manifests')
