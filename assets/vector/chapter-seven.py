"""Chapter Seven native vector scenery and real Tiled routes. No raster inputs.
Run: python3 assets/vector/chapter-seven.py. Editable source art remains SVG.
"""
import json,re,math,copy
from pathlib import Path
from xml.sax.saxutils import escape
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
def group(i,name,objects=None,**kw):return {'id':i,'type':'objectgroup','name':name,'visible':True,'objects':objects or [],'properties':props(**kw)}
def layer(i,name,areas,gid):
 data=[0]*2688
 for x,y,w,h in areas:
  for yy in range(y,y+h):
   for xx in range(x,x+w):data[yy*64+xx]=gid
 return {'id':i,'name':name,'type':'tilelayer','visible':True,'width':64,'height':42,'data':data}
def write_map(id,title,subtitle,floor,objects,casts,people,back,ground,decor=[],start=(32,34),art=True,blocks=[]):
 layers=[layer(1,'Surroundings',[(0,0,64,42)],5),layer(2,'Walking surfaces',floor,3),layer(3,'Scenery footprints',blocks,6)];entries=[]
 def add(n,body,depth,lid,w=1536,h=1008,x=0,y=0):
  svg(ART/f'{id}-{n}.svg',w,h,body);entries.append({'key':f'scene-seven-{id}-{n}','url':f'art/vector/chapter-seven/{id}-{n}.svg','x':x,'y':y,'width':w,'height':h,'depth':depth,'layerId':lid})
 if art:add('back',back,-1000,1);add('ground',ground,-999,2)
 for n,body,w,h,x,y,depth,flags in decor:
  lid=len(layers)+1;layers.append(group(lid,n,**flags));add(n,body,depth,lid,w,h,x,y)
 layers += [group(len(layers)+1,'Interactions',objects),group(len(layers)+2,'Arrivals',[point('start',*start),point('return',32,20)]),group(len(layers)+3,'People',people)]
 for sid,cast in casts.items():layers.append(group(len(layers)+1,'Scene:'+sid,[point(k,*v)for k,v in cast.items()]))
 source=json.loads((ROOT/'src/content/chapter-six/maps/observatory.json').read_text())
 d={k:source[k]for k in ['type','version','tiledversion','orientation','renderorder','infinite','width','height','tilewidth','tileheight','tilesets']};d.update(nextlayerid=len(layers)+1,nextobjectid=1,properties=props(name=title,subtitle=subtitle,sceneArt=id,artStyle='rotoscope',safeArrival='start',cameraLeadY=144),layers=layers)
 for l in layers:
  for o in l.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 text=json.dumps(d,indent=2);text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+64])for i in range(0,2688,64))+'\n    ]',text)
 (MAP/f'{id}.json').write_text(text+'\n');manifest[id]=entries
crew={'nell':(32,27),'orrin':(29,28),'kit':(34,28),'petra':(28,30),'celia':(35,30)}
def casts(*ids,extra=None):return {id:{**crew,**(extra or {})}for id in ids}
def floor_art(areas,color=BLUE):
 occupied={(xx,yy)for x,y,w,h in areas for xx in range(x,x+w)for yy in range(y,y+h)}
 boundary={y:sorted(x for x,yy in occupied if yy==y and (x,y+1)not in occupied)for y in {yy for _,yy in occupied}}
 out=[]
 for y,xs in boundary.items():
  if not xs:continue
  runs=[];a=z=xs[0]
  for x in xs[1:]:
   if x==z+1:z=x
   else:runs.append((a,z));a=z=x
  runs.append((a,z))
  for a,z in runs:out.append(poly([(a*24,(y+1)*24),((z+1)*24,(y+1)*24),((z+1)*24-20,(y+1)*24+44),(a*24+18,(y+1)*24+60)],INK))
 light='#'+''.join(f'{min(255,int(color[i:i+2],16)+20):02x}'for i in (1,3,5))
 path=' '.join(f'M{x*24} {y*24}h{w*24}v{h*24}h{-w*24}Z'for x,y,w,h in areas)
 out += [f'<defs><clipPath id="floor"><path d="{path}"/></clipPath></defs><g clip-path="url(#floor)">',rect(0,0,1536,1008,color),poly([(0,650),(510,572),(930,717),(1536,626),(1536,717),(710,836),(0,750)],light)]
 for y in range(0,1008,72):
  out.append(line([(0,y),(1536,y)],'#93a2a0',2))
  for x in range(0,1536,192):out.append(line([(x+(y%144),y),(x+(y%144),y+72)],'#596f7c',2))
 out.append('</g>')
 for y,xs in boundary.items():
  for x in xs:out.append(line([(x*24,(y+1)*24),((x+1)*24,(y+1)*24)],GOLD,3))
 return out
def sky(sea=True):
 out=[rect(0,0,1536,1008,INK)]
 for i in range(53):
  x=(i*193+71)%1536;y=(i*97+40)%1008;out.append(rect(x,y,2+(i%3)*2,2,'#849ca6'))
 if sea:
  out += [poly([(0,0),(1536,0),(1536,560),(1280,619),(975,590),(727,645),(420,602),(190,631),(0,580)],'#28596b'),poly([(0,0),(1536,0),(1536,448),(1250,538),(951,507),(714,568),(427,537),(184,557),(0,504)],'#507f88')]
  for x,y,w in [(40,106,280),(360,150,320),(820,75,480),(1160,185,300),(220,222,190),(714,227,470)]:out.append(poly([(x,y+320),(x+w,y+307),(x+w-47,y+323),(x+14,y+328)],'#8bafb0'))
  out += [poly([(1050,83),(1071,35),(1088,93),(1083,181),(1064,210)],'#c5d2c0'),poly([(1064,210),(1083,181),(1080,300),(1071,350)],TEAL)]
 return out
def sun(cx=768,cy=197,r=102):
 out=[]
 for a in range(0,360,30):
  t=math.radians(a);u=(math.cos(t),math.sin(t));v=(-u[1],u[0]);out.append(poly([(cx+u[0]*r+v[0]*9,cy+u[1]*r+v[1]*9),(cx+u[0]*(r+38),cy+u[1]*(r+38)),(cx+u[0]*r-v[0]*9,cy+u[1]*r-v[1]*9)],GOLD))
 out += [ellipse(cx,cy,r,r,GOLD),ellipse(cx,cy,r-16,r-16,INK),poly([(cx+45,cy-r),(cx+68,cy-r-8),(cx+27,cy+13),(cx+2,cy+2)],INK)]
 return out
def arch(x,y,w,h):return [rect(x,y,w,h,'#355360'),poly([(x-12,y),(x+w/2,y-60),(x+w+12,y),(x+w,y+20),(x,y+20)],PALE),f'<path d="M{x+26} {y+h}V{y+72}Q{x+w/2} {y-20} {x+w-26} {y+72}V{y+h}Z" fill="{INK}"/>',rect(x+7,y+17,17,h-17,GOLD),rect(x+w-24,y+17,17,h-17,BLUE)]
def chest(x,y):return ('chest',[rect(0,14,58,32,RUST),poly([(0,14),(10,0),(47,0),(58,14)],GOLD),rect(25,20,9,13,PALE)],60,48,x,y,y+48,{})
def supplies(id,x=18,y=33,**kw):return obj(id+'-rest',x,y,'Shelter · rest and field supplies',kind='optional',sign=True,**kw)
def body_art():return (ROOT/'public/art/vector/benefactor/benefactor.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]
def form_prop(form,flags):
 source=(ROOT/f'public/art/vector/benefactor/benefactor-{form}-motion.svg').read_text()
 body=re.search(r'<svg x="0" y="0"[^>]*>(.*?)</svg>',source,re.S)[1]
 return ('revealed-'+form,['<g transform="translate(552 245) scale(1.2)">',body,'</g>'],1536,1008,0,0,-998.5,flags)
def body_prop(n,x,y,scale,flags):return (n,[f'<g transform="translate({x} {y}) scale({scale})">',body_art(),'</g>'],1536,1008,0,0,-998.5,flags)
def recalled(name,x,y,scale,depth=-998.2):
 source=(ROOT/f'public/art/vector/scenery/{name}.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]
 return (name,[f'<g transform="translate({x} {y}) scale({scale})">',source,'</g>'],1536,1008,0,0,depth,{})
def cot(name,x,y):
 body=[poly([(0,29),(92,6),(130,37),(36,66)],'#485d69'),poly([(0,29),(36,66),(36,91),(0,54)],INK),poly([(36,66),(130,37),(130,62),(36,91)],'#69818a'),poly([(4,26),(91,9),(124,34),(37,61)],PALE),poly([(31,31),(94,17),(123,35),(60,54)],'#839f97'),poly([(8,25),(34,18),(50,28),(24,35)],'#eeead2'),rect(6,54,6,32,GOLD),rect(117,61,6,29,GOLD)]
 return (name,body,132,94,x,y,y+94,{})
def camp(name,x,y):
 body=[poly([(0,82),(63,0),(177,17),(220,101),(132,114)],'#bca584'),poly([(63,0),(132,114),(220,101),(177,17)],'#7b8c88'),poly([(63,9),(15,81),(115,106)],'#d6c8a2'),poly([(63,35),(44,88),(98,100)],INK),line([(0,82),(-20,110)],GOLD,3),rect(233,83,45,25,RUST),poly([(233,83),(246,70),(274,74),(278,83)],GOLD)]
 return (name,body,288,120,x,y,y+120,{})
# A threshold with the familiar airship hull hanging over an impossible sea.
f=[(16,26,32,11),(28,18,9,9)]
back=sky()+sun(768,178,92)+[poly([(187,389),(640,375),(597,476),(274,497)],'#7b6760'),poly([(187,389),(640,375),(612,398),(223,414)],GOLD),line([(317,392),(317,268)],GOLD,6),line([(320,271),(567,375)],GOLD,3)]
write_map('hollowsill','Beyond the hollow sun · the crossing','The survey ship holds the mortal end. A path runs beneath the suspended sea.',f,[supplies('sill'),obj('sill-alda',20,29,'Alda · the mooring line',kind='talk',sprite='alda'),obj('sill-cross',32,19,'The suspended pier',kind='exit',accessFlag='domainEntered',sign=True)],casts('seven-crossing',extra={'alda':(24,29)}),[],back,floor_art(f),[body_prop('distant-god',650,370,.65,{'hiddenFlag':'domainEntered'}),recalled('lamp',450,600,.85,744),camp('crossing-shelter',923,665)])
f=[(14,27,36,10),(26,18,13,10),(9,33,6,3)]
back=sky()+[poly([(230,393),(1190,365),(1298,490),(155,513)],'#405c68')]+arch(634,280,260,250)
ground=floor_art(f,'#536d78')+[line([(252,729),(1296,729)],GOLD,5),line([(252,765),(1296,765)],INK,6)]
write_map('takenwater','The sea of taken mornings','A railway platform hangs beneath the water. Living passengers wait behind the old collector.',f,[obj('water-hounds',25,31,'The pursuit · clear the platform',hiddenFlag='domainHoundsWon',sprite='hound-solar'),obj('water-collector',32,24,'The first collector',accessFlag='domainHoundsWon',hiddenFlag='domainCollectorWon',sprite='guardian-solar'),obj('water-field',32,19,'The field beyond the platform',kind='exit',accessFlag='takenPeopleFreed',sign=True),obj('water-sill',11,35,'Survey crossing',kind='exit',sign=True),obj('water-porter',19,29,'A Rillbridge porter',kind='talk',sign=True),supplies('water',47,34)],casts('seven-water','seven-water-free'),[point('waiting-porter',20,29,sprite='civilian-dockhand-rust',hiddenFlag='takenPeopleFreed'),point('waiting-family',41,29,sprite='civilian-family-blue',hiddenFlag='takenPeopleFreed')],back,ground,[recalled('station-house',304,380,.7),recalled('lamp',1170,594,.8,744)])
f=[(16,27,34,10),(24,18,17,10),(9,33,8,3)]
back=sky(False)+[poly([(0,85),(1536,45),(1536,492),(0,475)],'#89917e'),poly([(0,316),(500,275),(840,333),(1536,245),(1536,1008),(0,1008)],'#a28e60')]+sun(760,187,85)
for x in range(35,1536,41):
 y=400+(x*17)%190;back += [line([(x,y+116),(x+10,y)],'#d2bb7c',3),poly([(x+10,y),(x-1,y+28),(x+11,y+18),(x+24,y+37),(x+17,y+6)],'#edcf8d')]
back += [poly([(0,450),(185,400),(270,481),(440,430),(510,498),(620,487),(513,531),(220,514)],'#d1dcd3')]
write_map('firstfield','The first harvest','Ripe wheat stands in frost. A casting machine circles the same uncut row.',f,[obj('field-furnace',32,24,'The harvest keeper',hiddenFlag='domainFurnaceWon',sprite='furnace-carrier'),obj('field-ward',32,19,'The old hospice',kind='exit',accessFlag='harvestFreed',sign=True),obj('field-water',11,35,'The suspended platform',kind='exit',sign=True),obj('field-farmer',19,29,'The first harvest · a farmer’s account',kind='talk',sign=True),obj('field-reflector',46,32,'The keeper’s empty lamp',kind='optional',accessFlag='harvestFreed',doneFlag='domainReflectorTaken',sign=True),supplies('field',15,34)],casts('seven-harvest','seven-harvest-free'),[point('harvest-worker',20,28,sprite='civilian-dockhand',hiddenFlag='harvestFreed')],back,floor_art(f,'#8b8064'),[chest(1080,726),recalled('market-stall',280,560,.6,684)])
f=[(14,25,36,12),(25,17,15,9),(10,33,5,3)]
back=sky(False)+[rect(180,214,1160,424,'#45616c'),poly([(160,217),(760,80),(1362,217),(1340,244),(760,127),(180,244)],PALE),rect(190,405,1140,8,GOLD)]
for x in [235,445,875,1085]:back+=arch(x,302,176,292)
for x in [326,1074]:back += [poly([(x,595),(x+110,570),(x+141,611),(x+28,638)],PALE),rect(x+25,634,112,10,'#71888d')]
write_map('quietward','The first hospice · the quiet ward','The beds are warm. The people in them have been waiting to go home.',f,[obj('ward-engine-seven',32,24,'The gift of healing · mirrored engine',hiddenFlag='domainWardWon',sprite='ward-engine'),obj('ward-seasons',32,18,'The city of seasons',kind='exit',accessFlag='wardPeopleFreed',sign=True),obj('ward-field',12,35,'The harvest terrace',kind='exit',sign=True),obj('ward-patient',19,29,'The patient by the western window',kind='talk',sign=True),supplies('ward-seven',47,34)],casts('seven-hospice','seven-hospice-free',extra={'nell':(25,29),'celia':(22,30)}),[point('old-patient',20,30,sprite='civilian-patient-green',hiddenFlag='wardPeopleFreed')],back,floor_art(f),[cot('western-bed',380,600),cot('eastern-bed',1075,600),recalled('lamp',1190,585,.85,744)],blocks=[(16,26,3,2),(45,26,3,2)])
f=[(14,26,36,11),(24,17,18,10),(42,22,14,5),(8,33,7,3)]
back=sky()+[poly([(0,292),(280,103),(565,330),(890,145),(1150,257),(1536,119),(1536,1008),(0,1008)],'#77939f'),poly([(0,292),(280,103),(404,247),(301,226),(233,257),(156,256)],PALE),rect(925,329,480,263,'#9f7d60'),poly([(901,331),(1185,227),(1429,331),(1412,348),(926,348)],'#dec9a3')]
back+=arch(1050,376,218,218)
ground=floor_art(f,'#677c86')+[poly([(193,624),(560,624),(693,707),(442,735),(193,724)],'#ced8ce'),poly([(770,626),(1340,626),(1340,848),(1025,781)],'#ae936f')]
write_map('seasonstreet','The city of stolen seasons','Skeld’s snow lies across a Namar stair. The freed people need one road that stays open.',f,[obj('season-dragon',32,23,'The winter kept here',hiddenFlag='domainDragonWon',sprite='winter-dragon'),obj('season-refuge',32,18,'The unwritten hour',kind='exit',accessFlag='seasonsFreed',sign=True),obj('season-ward',10,35,'The quiet ward',kind='exit',sign=True),obj('season-patrol',48,27,'The courier stair · divine patrol',kind='optional',hiddenFlag='domainPatrolWon',sprite='herald'),obj('season-nameplate',18,29,'A cut tow-rope beside the snow',kind='talk',sign=True),supplies('season',47,34,accessFlag='domainPatrolWon')],casts('seven-seasons','seven-seasons-free'),[],back,ground,[recalled('river-wall',251,520,.8),recalled('lamp',1155,570,.8,730)])
f=[(14,25,36,12),(27,18,11,8),(12,33,3,3)]
back=sky()+[poly([(122,508),(710,412),(1392,520),(1302,575),(760,532),(240,583)],'#68818a')]+sun(768,191,110)
write_map('lastrefuge','The unwritten hour','The rescued people have made a shelter. Beyond it, the last stair reaches the god.',f,[supplies('refuge-seven',22,32),obj('refuge-preparations',32,23,'The last stair · final preparations',sign=True),obj('refuge-seasons',13,35,'The city of seasons',kind='exit',sign=True),obj('refuge-nell',27,29,'Nell · the lantern',kind='talk',sign=True),obj('refuge-kit',37,30,'Kit · the return route',kind='talk',sign=True),obj('refuge-orrin',20,28,'Orrin · the gate gear',kind='talk',sign=True),obj('refuge-celia',44,29,'Celia · the dressing table',kind='talk',sign=True),obj('refuge-petra',30,33,'Petra · the watch',kind='talk',sign=True)],casts('seven-refuge','seven-ready'),[point('porter',16,28,sprite='civilian-dockhand-rust'),point('farmer',47,28,sprite='civilian-dockhand'),point('patient',41,33,sprite='civilian-patient-green'),point('family',18,33,sprite='civilian-family-blue')],back,floor_art(f),[chest(480,730),camp('returning-shelter',375,575),cot('resting-bed',1063,657)],blocks=[(16,25,6,2),(45,28,3,2)])
f=[(18,25,29,12),(24,17,17,9),(12,33,7,3)]
back=sky(False)+sun(768,174,146)+[poly([(0,493),(380,378),(710,402),(1040,361),(1536,489),(1536,1008),(0,1008)],'#3d5969')]
write_map('sunthrone','The Benefactor · the sun throne','The three streams are broken. The god stands at the source of collection.',f,[obj('throne-fight',32,22,'The Benefactor',doneFlag='benefactorHeartWon',sign=True),obj('throne-retreat',13,35,'Return to the shelter',kind='exit',hiddenFlag='daysReturned',sign=True)],casts('seven-god','seven-sun','seven-heart','seven-release'),[],back,floor_art(f,'#71828a'),[body_prop('monument',552,245,1.2,{'hiddenFlag':'hollowSunSeen'}),form_prop('sun',{'requiredFlag':'hollowSunSeen','hiddenFlag':'fragmentReturned'}),form_prop('heart',{'requiredFlag':'fragmentReturned','hiddenFlag':'daysReturned'})])
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
write_map('seaholiday','The sea · tomorrow','The train goes home in the evening. For now there is nowhere else to be.',f,[obj('sea-tomas',33,23,'Tomas · the water’s edge',kind='talk',sprite='tomas'),obj('sea-friends',24,26,'The picnic',kind='talk',sign=True),obj('sea-orrin',27,26,'Orrin · the picnic',kind='talk',sprite='orrin'),obj('sea-kit',29,25,'Kit · the bags',kind='talk',sprite='kit'),obj('sea-petra',35,25,'Petra · the bread',kind='talk',sprite='petra'),obj('sea-celia',37,25,'Celia · the shade',kind='talk',sprite='celia'),obj('sea-ending',32,25,'Stay beside the sea',kind='story',sign=True)],{'seven-sea':{'nell':(31,22),'tomas':(33,22),'orrin':(27,24),'kit':(29,24),'petra':(35,24),'celia':(37,24)}},[],[],[],start=(25,24),art=False)
# Use the actual coast, now reached in the real world, with its accepted framing.
manifest['seaholiday']=shore
# Simple native tactical surfaces, shared by rules and review.
for id,mapid in [('domain-hounds','takenwater'),('domain-collector','takenwater'),('domain-furnace','firstfield'),('domain-ward','quietward'),('domain-dragon','seasonstreet'),('domain-patrol','seasonstreet'),('benefactor-body','sunthrone'),('benefactor-sun','sunthrone'),('benefactor-heart','sunthrone')]:
 source=json.loads((ROOT/'src/content/chapter-six/maps/battle-capital-procession.json').read_text())
 source['properties']=props(name=id,sceneArt='battle-'+id,artStyle='rotoscope')
 for l in source['layers']:
  if l['type']=='objectgroup':l['objects']=[]
 (MAP/('battle-'+id+'.json')).write_text(json.dumps(source,separators=(',',':'))+'\n')
 body=[rect(0,0,1024,480,INK),poly([(0,75),(512,24),(1024,75),(1024,480),(0,480)],BLUE),poly([(0,330),(512,260),(1024,330),(1024,480),(0,480)],'#587586')]
 for y in range(80,480,64):body.append(line([(0,y),(1024,y)],'#829697',2))
 for x in range(80,1024,128):body.append(line([(512,24),(x,480)],'#829697',2))
 lid=next(l['id']for l in source['layers']if l['type']=='tilelayer')
 if id.startswith('benefactor-'):
  manifest['battle-'+id]=[{'key':'benefactor-domain','url':'art/vector/benefactor/benefactor-domain.svg','x':0,'y':0,'width':1024,'height':480,'depth':-1000,'layerId':lid}]
 else:
  svg(ART/('battle-'+id+'.svg'),1024,480,body)
  manifest['battle-'+id]=[{'key':'scene-seven-battle-'+id,'url':'art/vector/chapter-seven/battle-'+id+'.svg','x':0,'y':0,'width':1024,'height':480,'depth':-1000,'layerId':lid}]
(ROOT/'src/content/chapter-seven/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Chapter Seven:',len(manifest),'native scene manifests')
