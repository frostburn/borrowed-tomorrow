"""Capital finale: continuous native SVG scenes over real Tiled routes/layers/casts."""
import runpy,json,re,copy
from pathlib import Path
from chapter_six_style import lean
b=runpy.run_path(str(Path(__file__).with_name('chapter-six-north.py')))
ROOT=b['ROOT'];world=b['world'];manifest=b['manifest'];rect=b['rect'];poly=b['poly'];line=b['line'];ellipse=b['ellipse'];obj=b['obj'];point=b['point'];control=b['control'];bench=b['bench'];chest=b['chest'];ART=ROOT/'public/art/vector/chapter-six'
INK='#243943';BLUE='#819aa8';SHADOW='#536f80';WHITE='#e9e6d8';GOLD='#c89b53';TEAL='#527c72';DUSK='#876e76'
def inline(name):return (ART/f'{name}.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]
def floor(f):return [p.replace('#c59d70','#e9e6d8').replace('#a17e60','#aab9bf').replace('#745b50','#819aa8')for p in b['b']['base']['plane'](f,1536,1008,'#d3d9d5')]
def arch(x,y,w=210,h=190):
 return lean([rect(x,y,w,h,SHADOW),poly([(x-12,y),(x+w/2,y-62),(x+w+12,y),(x+w,y+15),(x,y+15)],WHITE),f'<path d="M{x+30} {y+h}V{y+72}Q{x+w/2} {y-26} {x+w-30} {y+72}V{y+h}Z" fill="{INK}"/>',rect(x+7,y+17,17,h-17,WHITE),rect(x+w-24,y+17,17,h-17,BLUE),line([(x+20,y+20),(x+w-20,y+20)],GOLD,4)],y+h,.018)

def facade():
 out=[rect(0,0,1536,1008,'#475d70'),poly([(0,260),(260,188),(580,268),(890,175),(1180,222),(1536,151),(1536,1008),(0,1008)],DUSK),rect(120,260,1280,336,BLUE),rect(120,260,1280,28,WHITE)]
 for x in [150,380,610,840,1070]:out+=arch(x,306,190,245)
 out+=[poly([(90,260),(760,101),(1430,260),(1390,278),(760,137),(120,280)],WHITE),poly([(290,244),(760,135),(1225,244),(1200,255),(760,164),(320,260)],GOLD),poly([(0,606),(440,488),(1094,488),(1536,610),(1536,705),(0,705)],SHADOW)]
 return out
def interior():
 out=[rect(0,0,1536,1008,INK),poly([(155,170),(760,45),(1381,170),(1381,620),(155,620)],SHADOW),poly([(155,170),(760,45),(760,96),(193,215),(193,620),(155,620)],BLUE),rect(193,286,1145,8,GOLD)]
 for x in [235,444,855,1064]:out+=arch(x,300,190,245)
 for x in [170,1320]:out+=[rect(x,195,42,464,WHITE),rect(x-11,630,65,26,BLUE),rect(x-9,192,60,19,GOLD)]
 out+=arch(610,215,305,290)
 return out
party={'kit':(32,29),'orrin':(29,30),'petra':(35,30),'celia':(30,32),'nell':(33,28)}
# Stillwater Avenue: open lower plaza, real closed neck, visible release on its safe side.
f=[(10,24,44,12),(25,16,15,9)]
world('stillcity','The capital · Stillwater Avenue','The procession returns to the same arch. The palace stair climbs beyond its bronze return; allied launches wait behind you.',f,[(12,25,4,3),(47,25,4,3)],[
 obj('city-procession',32,29,'Procession machines · clear the avenue',hiddenFlag='capitalProcessionWon',doneFlag='capitalProcessionWon',sprite='guardian-crown'),control('city-release',32,25,(30,22,5,2),'Bronze street return · free the procession',hiddenFlag='capitalStreetFreed',doneFlag='capitalStreetFreed',sign=True),obj('city-palace',32,18,'Palace of the Last Day',kind='exit',accessFlag='capitalStreetFreed',sign=True),obj('city-quay',13,33,'Allied quay · evacuation landing',kind='exit',sign=True),obj('city-baker',22,28,'The bakery · an unfinished batch',kind='talk',sign=True),obj('city-cloth',43,28,'The handcart · a dropped cloth',kind='talk',sign=True)],
 {'start':(32,33),'palace':(32,20)}, {'six-capital-street':{**party,'kit':(31,32)},'six-capital-release':{**party,'alda':(26,29)}},
 [point('cart-woman',29,27,sprite='civilian-traveler-blue',hiddenFlag='capitalStreetFreed'),point('procession-child',38,26,sprite='civilian-family-blue',hiddenFlag='capitalStreetFreed'),point('baker',21,28,sprite='civilian-dockhand-rust'),point('waiting-family',18,33,sprite='civilian-family-blue',requiredFlag='capitalStreetFreed')],
 [('city-west-garden',[poly([(0,35),(130,0),(197,25),(64,64)],TEAL),line([(0,35),(64,64),(197,25)],WHITE,8)],198,65,319,605,670,{}),('city-east-garden',[poly([(0,35),(130,0),(197,25),(64,64)],TEAL),line([(0,35),(64,64),(197,25)],WHITE,8)],198,65,1127,605,670,{}),('city-return',[rect(0,8,360,15,GOLD),line([(5,0),(5,38),(355,38),(355,0)],WHITE,5)],360,43,600,548,591,{'hiddenFlag':'capitalStreetFreed'}),('city-cart',[ellipse(24,49,7,7,INK),ellipse(75,49,7,7,INK),rect(17,21,67,29,'#a28b65'),poly([(17,21),(35,9),(97,10),(84,21)],'#d0bea0'),poly([(45,16),(72,13),(89,23),(72,34),(59,27)],WHITE)],100,60,1012,616,676,{})],facade(),ground=floor(f),gated={'city-return':[(25,23,15,1)]})
# Palace gallery: the commandant has a real cordon with a clear approach.
f=[(9,25,46,12),(20,18,25,8),(26,13,13,6)]
world('lastpalace','Palace of the Last Day','A service shelter faces the lower gallery. The private apartments and crown stair lie beyond the remaining palace cordon.',f,[(11,26,4,2),(48,26,4,2)],[
 obj('palace-command',32,28,'Palace commandant · the remaining cordon',hiddenFlag='capitalCommandWon',doneFlag='capitalCommandWon',sprite='inspector'),obj('palace-preparations',32,16,'Crown stair · final preparations',kind='story',sign=True,accessFlag='capitalHallOpened'),obj('palace-city',13,34,'Stillwater Avenue · return to the boats',kind='exit',sign=True),obj('palace-rest',18,31,'Service shelter · rest and supplies',kind='optional',sign=True),obj('palace-locker',46,31,'Service locker · medical focus',kind='optional',sign=True,hiddenFlag='capitalFocusTaken',doneFlag='capitalFocusTaken'),obj('palace-hunters',43,23,'Eastern cloister · divine hunters',accessFlag='capitalHallOpened',kind='optional',sign=True,hiddenFlag='capitalHuntersWon',doneFlag='capitalHuntersWon'),obj('palace-household',25,21,'The household · a repeated conversation',accessFlag='capitalHallOpened',kind='talk',sign=True)],
 {'start':(32,34),'memory':(32,22)}, {'six-palace-arrival':party,'six-palace-command':{**party,'petra':(34,27)},'six-palace-open':party,'six-capital-warning':party,'six-emperor-audience':{**party,'emperor':(32,17)},'six-memory-wake':{**party,'nell':(32,23),'celia':(34,24),'kit':(30,24),'emperor':(32,17)}},
 [point('palace-servant',23,23,sprite='civilian-dockhand-rust'),point('palace-memory',38,21,sprite='civilian-traveler',projection=True)],
 [('palace-cordon',[rect(0,0,600,18,GOLD),line([(0,2),(0,34),(600,34),(600,2)],WHITE,4)],600,40,480,574,614,{'hiddenFlag':'capitalHallOpened'}),('palace-safe-bench',bench(),168,86,350,692,778,{}),('palace-service-locker',chest(),60,48,1074,693,741,{})],interior(),ground=floor(f),gated={'palace-cordon':[(20,24,25,1)]})
# Reuse the real Larkspur station geometry instead of inventing a palace-like home.
def home_map(id,remembered):
 d=json.loads((ROOT/'src/content/chapter-one/maps/station.json').read_text())
 d['layers']=[l for l in d['layers'] if l['type']=='tilelayer' and (not remembered or l['id'] not in (6,22))]
 if remembered:
  for layer in d['layers']:layer['properties']=[p for p in layer.get('properties',[])if p['name'] not in ('requiredFlag','hiddenFlag')]
 title='Larkspur · the remembered morning'if remembered else 'Larkspur · the empty seat'
 subtitle='Ansel waits by the familiar platform. Tomas has the sea-train tickets; the eastern lamp marks their carriage.'if remembered else 'An ordinary train waits beside the platform. Nell’s place beside the window is empty.'
 d['properties']=b['b']['base']['props'](name=title,subtitle=subtitle,sceneArt=id,artStyle='rotoscope',safeArrival='start')
 objects=[obj('morning-ansel',20,12,'Ansel · the platform',kind='talk',sprite='master'),obj('morning-tomas',25,13,'Tomas · the sea train',kind='talk',sprite='tomas'),obj('morning-leave',28,19,'Eastern lamp · take the sea train with Tomas',kind='exit',sign=True),obj('morning-cup',17,14,'Ansel’s chipped cup',kind='talk',sign=True)]if remembered else[obj('last-tomas',22,14,'Tomas · the platform bench',kind='talk',sprite='tomas'),obj('last-kit',26,16,'Kit · the folded coat',kind='talk',sprite='kit'),obj('last-ending',32,12,'The waiting train · an unfinished tomorrow',kind='story',sign=True)]
 casts={'six-last-morning':{'nell':(21,16),'ansel':(20,12),'tomas':(25,13)}}if remembered else{'six-empty-seat':{'tomas':(22,14),'kit':(25,16),'orrin':(20,17),'petra':(27,17),'celia':(23,18)}}
 group=b['b']['base']['group'];lid=max(l['id']for l in d['layers'])+1
 d['layers'] += [group(lid,'Interactions',objects),group(lid+1,'Arrivals',[point('start',21,18)]),group(lid+2,'People',[])]
 for sid,actors in casts.items():d['layers'].append(group(lid+3+len(d['layers']),'Scene:'+sid,[point(k,*v)for k,v in actors.items()]))
 d['nextobjectid']=1;d['nextlayerid']=max(l['id']for l in d['layers'])+1
 for layer in d['layers']:
  for o in layer.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 text=json.dumps(d,indent=2);w=d['width'];h=d['height']
 text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+w])for i in range(0,w*h,w))+'\n    ]',text)
 (ROOT/f'src/content/chapter-six/maps/{id}.json').write_text(text+'\n')
 ids={l['id']for l in d['layers']if l['type']=='tilelayer'};pieces=copy.deepcopy(json.loads((ROOT/'src/content/chapter-one/scene-art.json').read_text())['station']);pieces=[p for p in pieces if p['layerId']in ids]
 if remembered:
  palette={'#172937':'#617956','#192c37':'#80916c','#1d3039':'#91a27c','#2a414c':'#a6b18a','#354b55':'#bfbd90','#1e3c36':'#617956','#233e36':'#80916c','#29483e':'#91a27c','#315044':'#a6b18a','#385546':'#bfbd90'}
  piece=next(p for p in pieces if p['layerId']==1);source=(ROOT/'public'/piece['url']).read_text()
  for old,new in palette.items():source=source.replace(old,new)
  (ART/'memory-grass.svg').write_text(source);piece['key']='scene-six-memory-grass';piece['url']='art/vector/chapter-six/memory-grass.svg'
 manifest[id]=pieces
home_map('lastmorning',True)
# A real coast stage for the Emperor's remembered holiday. No remote voices or signals.
shore_back=[rect(0,0,1536,1008,'#9fb8bc'),poly([(0,323),(350,312),(720,328),(1150,307),(1536,320),(1536,1008),(0,1008)],'#5b8e9a'),poly([(0,323),(354,322),(694,328),(1130,319),(1536,327),(1536,365),(0,357)],'#aac5c0'),poly([(0,363),(95,313),(178,335),(226,313),(306,352),(419,369)],'#617e87'),poly([(1202,363),(1288,319),(1387,307),(1452,334),(1536,301),(1536,371)],'#768d91')]
for x,y,w in [(120,327,340),(780,309,290),(415,374,465),(920,417,490),(56,463,380),(531,486,497)]:shore_back += [poly([(x,y),(x+w,y-4),(x+w-42,y+5),(x+30,y+8)],'#c9d8cb')]
shore_ground=[poly([(0,657),(276,579),(432,510),(699,529),(877,546),(1082,510),(1299,539),(1536,582),(1536,1008),(0,1008)],'#a59b76'),poly([(0,689),(280,612),(448,547),(695,563),(883,582),(1105,548),(1305,578),(1536,619),(1536,1008),(0,1008)],'#c6b88d'),poly([(0,787),(380,689),(626,672),(994,705),(1255,672),(1536,712),(1536,1008),(0,1008)],'#748568'),poly([(0,825),(350,742),(667,720),(945,762),(1231,721),(1536,753),(1536,1008),(0,1008)],'#536e5e'),poly([(194,640),(367,588),(462,577),(405,616),(221,669)],'#e6d7a7'),poly([(1116,556),(1253,558),(1433,597),(1361,611),(1213,581)],'#e6d7a7')]
for x,y in [(297,748),(1090,753),(1305,844),(165,882)]:shore_ground += [poly([(x,y),(x+33,y-28),(x+65,y-19),(x+81,y+18),(x+24,y+25)],'#516c69'),poly([(x+33,y-28),(x+65,y-19),(x+51,y),(x+7,y+7)],'#84958a')]
world('lastshore','The remembered coast','Tomas has left their bags beside the path. The sea is moving; the next train is hours away.',[(10,25,42,8),(18,22,24,4)],[],[obj('shore-wake',31,27,'The water’s edge · wake up',kind='story',sign=True)],{'start':(24,22)},{'six-memory-sea':{'nell':(24,22),'tomas':(26,22)}},[],[('shore-bags',[poly([(0,15),(24,5),(53,14),(51,43),(4,45)],'#755c48'),line([(14,12),(16,2),(36,0),(39,11)],INK,4),poly([(4,45),(51,43),(66,55),(20,61)],'#354d52')],67,62,464,486,548,{})],shore_back,ground=shore_ground)
# The crown is the route's sole commitment point; no exits lead back after the warning.
f=[(12,24,40,12),(24,18,17,7)]
back=[rect(0,0,1536,1008,'#314958'),poly([(0,294),(289,211),(633,302),(1020,181),(1536,261),(1536,1008),(0,1008)],BLUE),poly([(0,481),(424,387),(789,446),(1144,362),(1536,475),(1536,614),(0,614)],'#b3bfae')]
world('crown','The capital · crown platform','The imperial vessel stands above its two supports. The final stair is behind you; the evacuation boats are far below.',f,[],[
 obj('capital-emperor',32,26,'The Emperor · imperial vessel',hiddenFlag='emperorWon',doneFlag='emperorWon',sign=True),obj('capital-lightbearer',32,26,'The Lightbearer · Nell’s lantern',requiredFlag='lightbearerSeen',hiddenFlag='lightbearerWon',doneFlag='lightbearerWon',sign=True),obj('crown-landing',46,32,'The allied landing · descend with the crews',requiredFlag='capitalReleased',kind='exit',sign=True),obj('crown-rest',19,32,'Broken stair shelter · rest and supplies',kind='optional',requiredFlag='emperorWon',sign=True)],
 {'start':(32,32)}, {'six-imperial-vessel':party,'six-imperial-fall':party,'six-lightbearer-rise':party,'six-lightbearer-fall':party},[],
 [('crown-vessel',[inline('imperial-idle')],528,280,516,224,504,{'hiddenFlag':'emperorWon'}),('crown-west-support',[inline('imperial-support')],96,160,502,349,509,{'hiddenFlag':'emperorWon'}),('crown-east-support',[inline('imperial-support')],96,160,978,349,509,{'hiddenFlag':'emperorWon'}),('crown-lightbearer',[inline('lightbearer-idle')],528,280,516,224,504,{'requiredFlag':'lightbearerSeen','hiddenFlag':'lightbearerWon'}),('crown-broken-marble',[poly([(0,22),(60,0),(122,31),(74,66),(30,59)],WHITE),poly([(122,31),(74,66),(70,90),(116,58)],BLUE)],124,92,422,759,851,{'requiredFlag':'emperorWon'})],back,ground=floor(f))
home_map('laststation',False)
for id,title in [('capital-procession','The repeating procession'),('palace-command','The palace cordon'),('capital-hunters','The eastern cloister'),('imperial-vessel','The Emperor’s vessel'),('lightbearer','The Lightbearer')]:
 f=[(3,3,34,16)];back=[rect(0,0,1008,480,'#394f61'),poly([(0,90),(200,7),(447,87),(736,0),(1008,75),(1008,480),(0,480)],BLUE)]
 if id not in ('imperial-vessel','lightbearer'):
  back+=[rect(0,0,1008,45,SHADOW),rect(0,40,1008,5,GOLD),rect(0,20,29,460,WHITE),rect(979,20,29,460,WHITE)]
 world('battle-'+id,title,'',f,[],[],{'start':(20,17)},{},[],[],back,w=42,h=20,ground=floor(f))
# Update the existing landing without changing stable IDs or floor geometry.
p=ROOT/'src/content/chapter-six/maps/capitalquay.json';d=json.loads(p.read_text())
for v in d['properties']:
 if v['name']=='subtitle':v['value']='Namar’s barges and Skeld’s launches serve the white quay. Stillwater Avenue lies through the northern arch.'
for layer in d['layers']:
 for o in layer.get('objects',[]):
  if o.get('name')=='capital-inner':
   for v in o['properties']:
    if v['name']=='label':v['value']='Stillwater Avenue · enter the capital'
    if v['name']=='kind':v['value']='exit'
text=json.dumps(d,indent=2);text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+64])for i in range(0,64*42,64))+'\n    ]',text)
p.write_text(text+'\n')
for id in ['capitalquay','stillcity','lastpalace','crown','lastshore']:
 path=ROOT/f'src/content/chapter-six/maps/{id}.json';data=json.loads(path.read_text());data['properties']=[p for p in data['properties']if p['name']!='cameraLeadY']+[{'name':'cameraLeadY','type':'int','value':144}];out=json.dumps(data,indent=2);out=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+64])for i in range(0,64*42,64))+'\n    ]',out);path.write_text(out+'\n')
for obsolete in ['lastmorning-back','lastmorning-floor','laststation-back','laststation-floor','morning-bench','last-empty-bench']:(ART/f'{obsolete}.svg').unlink(missing_ok=True)
(ROOT/'src/content/chapter-six/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Exported capital avenue, palace, remembered morning, crown, aftermath and five tactical floors.')
