"""Native SVG/Tiled source for the sealed capital and Namar expedition.
No raster inputs. Run via npm run art:six. Existing portrait originals are retained.
"""
import json, math, re
from pathlib import Path
from xml.sax.saxutils import escape
from map_metadata import retain_interaction_roles
ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'public/art/vector/chapter-six'; MAP=ROOT/'src/content/chapter-six/maps'
ART.mkdir(parents=True,exist_ok=True); MAP.mkdir(parents=True,exist_ok=True)
manifest={}
INK='#243943'; NIGHT='#33434f'; STONE='#b38b65'; LIGHT='#e4be86'; DARK='#745b50'; TEAL='#497c7b'; GOLD='#cb9d55'
def rect(x,y,w,h,c):return f'<path d="M{x:g} {y:g}h{w:g}v{h:g}h{-w:g}Z" fill="{c}"/>'
def poly(p,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}' for x,y in p)+f'" fill="{c}"/>'
def line(p,c,w=3):return '<polyline points="'+' '.join(f'{x:g},{y:g}' for x,y in p)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ellipse(x,y,rx,ry,c):return f'<ellipse cx="{x:g}" cy="{y:g}" rx="{rx:g}" ry="{ry:g}" fill="{c}"/>'
def svg(path,w,h,body):path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(path.stem.replace("-"," "))}</title>'+''.join(body)+'</svg>\n')
def props(**kw):return [{'name':k,'type':'bool' if isinstance(v,bool) else 'int' if isinstance(v,int) else 'string','value':v}for k,v in kw.items()]
def point(name,x,y,**kw):return {'name':name,'point':True,'x':x*24+12,'y':y*24+12,'properties':props(**kw)}
def obj(name,x,y,label,kind='story',**kw):return point(name,x,y,label=label,kind=kind,**kw)
def control(name,x,y,area,label,**kw):
 a,b,w,h=area
 return {'name':name,'x':a*24,'y':b*24,'width':w*24,'height':h*24,'properties':props(label=label,approachX=x,approachY=y,kind=kw.pop('kind','story'),**kw)}
def group(i,name,objects=None,**kw):return {'id':i,'name':name,'type':'objectgroup','visible':True,'objects':objects or [],'properties':props(**kw)}
def layer(i,name,rects,w,h,gid):
 data=[0]*(w*h)
 for x,y,ww,hh in rects:
  for yy in range(y,y+hh):
   for xx in range(x,x+ww):data[yy*w+xx]=gid
 return {'id':i,'name':name,'type':'tilelayer','visible':True,'width':w,'height':h,'data':data}
def plane(floor,w,h,colour=STONE,wood=False):
 cells={(xx,yy)for x,y,ww,hh in floor for xx in range(x,x+ww)for yy in range(y,y+hh)}
 path=' '.join(f'M{x*24} {y*24}h{ww*24}v{hh*24}h{-ww*24}Z'for x,y,ww,hh in floor)
 out=[f'<defs><clipPath id="floor"><path d="{path}"/></clipPath></defs><g clip-path="url(#floor)">',rect(0,0,w,h,colour),poly([(0,470),(450,430),(920,590),(w,490),(w,640),(800,730),(0,610)],'#c59d70')]
 for y in range(0,h,24 if wood else 72):
  out.append(line([(0,y),(w,y)],'#6e5f4b'if wood else '#a17e60',2))
  if not wood:
   for x in range((y//72)%2*80,w,160):out.append(line([(x,y),(x,y+72)],'#a17e60',2))
 out.append('</g>')
 for x,y in sorted(cells):
  if(x,y+1)not in cells:out.extend([rect(x*24,(y+1)*24,24,16,DARK),rect(x*24,(y+1)*24-3,24,3,LIGHT)])
 return out
def dunes(w=1536,h=1008):
 return [rect(0,0,w,h,NIGHT),poly([(0,60),(350,130),(700,48),(1050,120),(w,35),(w,280),(0,280)],'#bd8b78'),poly([(0,230),(230,172),(530,239),(840,161),(1140,226),(w,168),(w,h),(0,h)],'#916d65'),poly([(0,365),(270,274),(620,410),(950,284),(w,388),(w,h),(0,h)],'#b88a69'),poly([(0,647),(440,394),(670,520),(1060,402),(w,600),(w,h),(0,h)],'#765d54')]
def building(x,y,w=170,h=160,dome=False):
 out=[rect(x,y,w,h,STONE),poly([(x,y),(x+w,y),(x+w,y+h),(x+w-27,y+h),(x+w-27,y+12)],'#8d6d56'),poly([(x-10,y),(x+w/2,y-36),(x+w+8,y),(x+w-8,y+14),(x,y+14)],LIGHT)]
 if dome:out.extend([f'<path d="M{x+12} {y}Q{x+20} {y-76} {x+w/2} {y-92}Q{x+w-20} {y-76} {x+w-12} {y}Z" fill="{TEAL}"/>',line([(x+w/2,y-94),(x+w/2,y-115)],GOLD,4)])
 for xx in range(int(x+22),int(x+w-14),48):out.extend([f'<path d="M{xx} {y+45}q12-23 24 0v43h-24Z" fill="{INK}"/>',rect(xx+4,y+49,7,28,'#cca775')])
 out.append(rect(x+18,y+h-12,w-44,5,LIGHT));return out
def palm(x,y,s=1):
 return [f'<g transform="translate({x} {y}) scale({s})">',poly([(0,130),(8,32),(20,0),(25,6),(19,47),(12,134)],'#705742'),poly([(18,6),(-50,-21),(-72,-5),(-25,-6),(19,14)],'#4c6d5b'),poly([(19,6),(71,-27),(97,-9),(42,-8),(22,14)],'#557b62'),poly([(19,4),(24,-41),(50,-60),(40,-21),(22,14)],'#75936c'),poly([(17,6),(-2,-35),(-25,-44),(-9,-10),(20,15)],'#3a5f54'),'</g>']
def bench():return [poly([(0,32),(95,32),(117,47),(20,47)],LIGHT),rect(20,47,97,10,DARK),rect(25,57,9,24,INK),rect(99,57,9,24,INK),rect(11,5,101,29,TEAL),rect(19,10,86,5,'#8ea48b'),ellipse(142,53,14,8,INK),rect(131,22,22,30,TEAL),ellipse(142,22,11,6,LIGHT)]
def chest():return [rect(0,12,56,32,DARK),poly([(0,12),(10,0),(48,0),(56,12)],GOLD),rect(7,11,5,33,LIGHT),rect(43,11,5,33,LIGHT),rect(24,20,8,11,GOLD)]
def astrolabe(cx,cy,rx=150):
 out=[ellipse(cx,cy,rx,rx*.42,INK),f'<ellipse cx="{cx}" cy="{cy-7}" rx="{rx}" ry="{rx*.42}" fill="none" stroke="{GOLD}" stroke-width="13"/>',f'<ellipse cx="{cx}" cy="{cy-7}" rx="{rx*.72}" ry="{rx*.3}" fill="none" stroke="{LIGHT}" stroke-width="4"/>']
 for a in range(0,360,30):
  t=math.radians(a);out.append(line([(cx+math.cos(t)*rx*.76,cy-7+math.sin(t)*rx*.31),(cx+math.cos(t)*rx*.96,cy-7+math.sin(t)*rx*.4)],LIGHT,3))
 out.extend([poly([(cx-15,cy+3),(cx+7,cy-104),(cx+25,cy-108),(cx+15,cy+3)],GOLD),ellipse(cx+17,cy-102,20,20,LIGHT),ellipse(cx+17,cy-102,12,12,INK)])
 return out
def world(id,name,subtitle,floor,blocks,objects,arrivals,casts,people,decor,back=None,w=64,h=42,wood=False):
 layers=[layer(1,'Surroundings',[(0,0,w,h)],w,h,5),layer(2,'Walking surfaces',floor,w,h,3),layer(3,'Scenery footprints',blocks,w,h,6)];entries=[]
 def add(n,body,ww=w*24,hh=h*24,x=0,y=0,depth=-1000,lid=1):
  svg(ART/f'{n}.svg',ww,hh,body);entries.append({'key':f'scene-six-{n}','url':f'art/vector/chapter-six/{n}.svg','x':x,'y':y,'width':ww,'height':hh,'depth':depth,'layerId':lid})
 add(id+'-back',back if back is not None else dunes(w*24,h*24));add(id+'-floor',plane(floor,w*24,h*24,'#917a55'if wood else STONE,wood),depth=-999,lid=2)
 for n,body,ww,hh,x,y,depth,flags in decor:
  lid=3
  if flags:
   lid=len(layers)+1
   item=layer(lid,n,[(27,33,9,1)],w,h,6)if n=='palace-bar'else group(lid,n)
   item['properties']=props(**flags);layers.append(item)
  add(n,body,ww,hh,x,y,depth,lid)
 layers.extend([group(len(layers)+1,'Interactions',objects),group(len(layers)+2,'Arrivals',[point(k,*v)for k,v in arrivals.items()]),group(len(layers)+3,'People',people)])
 for sid,cast in casts.items():layers.append(group(len(layers)+1,'Scene:'+sid,[point(k,*v,**({'projection':True}if sid=='six-sealed' and k=='emperor' else {'hidden':True}if sid=='six-court' and k=='amal' else {}))for k,v in cast.items()]))
 retain_interaction_roles(MAP/f'{id}.json',layers)
 d={'type':'map','version':'1.10','tiledversion':'1.11.2','orientation':'orthogonal','renderorder':'right-down','infinite':False,'width':w,'height':h,'tilewidth':24,'tileheight':24,'nextlayerid':len(layers)+1,'nextobjectid':1,'properties':props(name=name,subtitle=subtitle,sceneArt=id,artStyle='rotoscope',safeArrival=next(iter(arrivals))),'tilesets':[{'firstgid':p['firstgid'],'source':'../../../../assets/tiles/pages/'+p['name']+'.json'}for p in json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text())['pages']],'layers':layers}
 for ll in layers:
  for o in ll.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 text=json.dumps(d,indent=2);text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('      '+','.join(str(v)for v in json.loads('['+m[1]+']')[i:i+w])for i in range(0,w*h,w))+'\n    ]',text)
 (MAP/f'{id}.json').write_text(text+'\n');manifest[id]=entries

crew={'kit':(32,28),'orrin':(29,29),'petra':(35,29),'celia':(30,31),'alda':(34,25)}
capital=[rect(0,0,1536,1008,NIGHT),poly([(0,90),(320,170),(720,100),(1140,153),(1536,80),(1536,350),(0,350)],'#7e9698'),poly([(0,320),(270,233),(610,333),(1010,232),(1536,305),(1536,1008),(0,1008)],'#526d6c'),poly([(0,630),(340,540),(700,647),(1110,535),(1536,590),(1536,760),(1120,704),(710,790),(320,714),(0,770)],'#b3bfa8'),poly([(120,350),(380,308),(740,358),(1100,304),(1430,350),(1360,427),(920,460),(420,439),(170,405)],'#3e575b')]
def imperial(n,x,y,scale):
 original=(ROOT/f'public/art/vector/scenery/{n}.svg').read_text().split('>',1)[1].rsplit('</svg>',1)[0]
 return [f'<g transform="translate({x} {y}) scale({scale})">',original,'</g>']
capital.extend(imperial('palace-portico',575,61,1.1))
capital.extend(imperial('palace-wing',330,155,.85));capital.extend(imperial('palace-wing',1035,154,.85))
far_cart=[ellipse(42,56,7,7,INK),ellipse(64,56,7,7,INK),rect(31,33,42,20,'#8f9278'),poly([(31,33),(42,24),(76,24),(73,33)],'#c6b78b'),line([(30,45),(17,40)],'#b89c6d',3),poly([(9,22),(19,22),(24,39),(17,42),(9,37)],'#76908a'),poly([(12,39),(17,40),(15,59),(11,59)],INK),poly([(17,39),(21,39),(25,56),(21,58)],INK),ellipse(14,15,6,8,'#c69b73'),poly([(7,10),(13,6),(21,12),(21,15),(8,14)],'#65776d')]
barrier=[poly([(100,357),(380,296),(742,346),(1100,290),(1450,353),(1391,463),(910,501),(405,483),(135,426)],'#7b9b96'),line([(100,357),(380,296),(742,346),(1100,290),(1450,353)],'#c9d4af',8)]
for x in range(180,1450,94):barrier.append(line([(x,340),(x+20,451)],'#bac5a4',3))
deck=[(12,22,40,14),(29,18,7,5)]
world('outermooring','The capital · outer mooring','The landing bridge points toward the sealed capital. Alda keeps the flight chart by the bow.',deck,[(13,23,4,3)], [
 obj('six-chart',33,23,'Flight chart · the two pact seals',sign=True),obj('six-nell',18,28,'Nell · the shaded berth',kind='talk',sprite='nell-ill',sign=True),obj('six-alda',36,26,'Alda · the outer mooring',kind='talk',sprite='alda'),obj('six-supplies',45,30,'Crew stores · rest and bandages',kind='optional',sign=True),obj('six-report',24,30,'Signal desk · Sera’s reply',storyUntil='jungleLeadKnown',sign=True),obj('six-capital',32,19,'Landing bridge · sealed capital',kind='talk',sign=True)],
 {'start':(32,29),'namar':(32,29),'briefing':(32,28)}, {'six-sealed':{**crew,'emperor':(32,19)},'six-briefing':crew,'six-letter':{**crew,'nell':(19,28)},'six-home':{**crew,'nell':(19,28)}},
 [point('lookout',42,25,sprite='civilian-traveler-blue'),point('fitter',25,25,sprite='civilian-dockhand')],
 [('mooring-city-life',far_cart,80,64,802,365,-998.5,{}),('mooring-rail',[line([(290,540),(290,856),(1245,856),(1245,540)],GOLD,5)],1536,1008,0,0,-997,{}),('mooring-barrier',['<g opacity=".65">',*barrier,'</g>'],1536,540,0,0,-998,{'requiredFlag':'capitalSealed'}),('mooring-chart',chest(),60,48,785,515,563,{}),('mooring-berth',bench(),168,86,324,565,651,{}),('mooring-stores',chest(),60,48,1100,680,728,{})],capital,wood=True)

cityback=dunes()+[rect(744,430,120,578,'#315b64'),poly([(765,430),(800,430),(825,1008),(788,1008)],'#638a87')]
for x,y,w,h in [(35,264,260,251),(330,285,225,194),(1080,214,340,263),(893,106,170,328)]:cityback.extend(building(x,y,w,h,x>800))
cityback.extend([poly([(480,520),(610,305),(670,305),(574,520)],'#96775c'),poly([(885,479),(954,331),(1001,331),(945,479)],'#e0b787')])
market=[]
for x,c in [(0,'#a65949'),(166,'#4f7777')]:market.extend([rect(x+12,37,136,51,DARK),poly([(x,33),(23,0),(137,0),(158,33)],c),rect(x+9,33,5,75,GOLD),rect(x+144,33,5,75,GOLD),line([(x+21,57),(x+131,57)],LIGHT,3)])
world('namar','Namar · the evening exchange','The palace is beyond the eastern bridge. The post exchange and drinking water are on the western quay.',[(4,22,27,15),(34,19,26,18),(29,26,7,4),(20,17,29,6)],[(6,22,12,3),(43,19,9,2)], [
 obj('namar-amal',23,27,'Amal · the evening post',sprite='amal',kind='talk'),obj('namar-post',19,28,'Post exchange · letters to the railway',kind='optional',sign=True),obj('namar-supply',12,30,'Canal fountain · rest and supplies',kind='optional',sign=True),control('namar-palace',47,22,(44,17,9,5),'Royal palace · Queen Samira',kind='exit',sign=True),obj('namar-ship',9,34,'Survey landing · return aboard',kind='exit',sign=True),obj('namar-clock',38,27,'The water clock',kind='talk',sign=True),obj('namar-celebrate',36,31,'Samira · the western seal',requiredFlag='desertSealBroken',sprite='samira',kind='talk')],
 {'start':(13,32),'palace':(43,23),'return':(33,28),'home':(34,31)}, {'six-namar':{'kit':(20,28),'orrin':(18,29),'petra':(22,30),'celia':(20,31),'amal':(23,27)},'six-public':{'kit':(32,28),'orrin':(29,31),'petra':(35,31),'celia':(34,33),'samira':(36,29),'sahir':(42,30),'amal':(38,32)}},
 [point('market-buyer',17,26,sprite='civilian-traveler',hiddenFlag='palaceCoup'),point('boat-family',26,33,sprite='civilian-family-blue',hiddenFlag='palaceCoup'),point('clock-keeper',40,29,sprite='civilian-dockhand-rust'),point('returning-family',26,33,sprite='civilian-family-blue',requiredFlag='desertSealBroken'),point('western-watch',41,30,sprite='namar-watch',requiredFlag='desertReleaseReady',hiddenFlag='desertSealBroken'),point('eastern-watch',43,30,sprite='namar-watch',requiredFlag='desertReleaseReady',hiddenFlag='desertSealBroken')],
 [('namar-market',market,328,110,146,493,600,{}),('namar-palms',palm(0,0)+palm(181,19,.8),285,181,943,513,675,{}),('namar-clock',astrolabe(50,58,48)+[rect(38,52,24,85,TEAL),ellipse(50,133,55,17,DARK)],112,154,914,495,649,{}),('namar-fountain',bench(),168,86,230,650,736,{}),('namar-bridge-rail',[line([(696,628),(862,628)],GOLD,4),line([(696,716),(862,716)],GOLD,4)],880,730,0,0,-997,{}),('namar-shelters',[rect(0,8,143,6,DARK),poly([(0,8),(24,0),(124,0),(143,8),(143,91),(0,91)],TEAL)],148,96,155,490,586,{'requiredFlag':'palaceCoup','hiddenFlag':'desertSealBroken'})],cityback)

courtback=[rect(0,0,1536,1008,'#4b5554'),rect(240,120,1056,650,'#856b55'),rect(270,154,996,590,LIGHT),rect(355,182,826,280,INK),poly([(355,462),(520,290),(800,400),(1181,258),(1181,462)],'#78665c')]
for x in range(285,1280,120):courtback.extend([rect(x,120,24,395,STONE),rect(x-10,119,44,21,GOLD),rect(x-8,495,40,18,GOLD)])
courtback.extend([rect(700,465,175,10,GOLD),rect(709,458,157,8,LIGHT)])
courtcrew={'kit':(31,28),'orrin':(28,29),'petra':(34,29),'celia':(30,31),'samira':(32,23),'sahir':(39,25),'amal':(22,29)}
world('sunpalace','Namar · the open court','The queen receives visitors beneath the northern colonnade. The postal stair is west of the fountain.',[(10,22,45,11),(27,33,9,3),(20,18,24,5),(8,27,5,6)],[(22,24,3,3),(41,24,3,3)], [
 obj('palace-audience',32,24,'Queen Samira · revoke the pact',sprite='samira',storyUntil='palaceCoup',hiddenFlag='palaceEscaped'),obj('palace-route',22,29,'Postal stair · escape the palace',requiredFlag='palaceCoup',doneFlag='palaceEscaped',sign=True),obj('palace-supply',15,31,'Shaded fountain · rest and supplies',kind='optional',sign=True),obj('palace-city',31,34,'Evening exchange · palace gate',kind='exit',sign=True),obj('palace-roofs',10,29,'Postal stair · the observatory terraces',requiredFlag='palaceEscapeWon',kind='exit',sign=True)],
 {'start':(31,31),'audience':(31,28),'escape':(20,29),'roofs':(13,29)}, {'six-court':courtcrew,'six-coup':courtcrew,'six-escape':courtcrew},
 [point('court-attendant',19,25,sprite='civilian-traveler-blue'),point('court-attendant-two',46,28,sprite='civilian-traveler')],
 [('palace-fountain',astrolabe(38,51,34)+[rect(28,49,20,60,TEAL)],82,114,532,535,649,{}),('palace-vase',[rect(20,34,28,45,TEAL),ellipse(34,38,23,15,TEAL)]+palm(23,-36,.7),88,115,983,542,657,{}),('palace-bar',[rect(0,0,192,54,INK),line([(0,18),(192,18)],GOLD,7),line([(0,40),(192,40)],GOLD,7)],192,60,660,790,850,{'requiredFlag':'palaceCoup','hiddenFlag':'palaceEscaped'})],courtback)

roofback=dunes()
for x,y,w,h in [(30,580,280,250),(380,710,225,220),(1080,555,360,300),(880,710,150,242)]:roofback.extend(building(x,y,w,h,True))
roofback.extend(building(930,105,310,274,True))
rooffloor=[(8,28,23,7),(27,24,9,8),(32,20,22,7),(46,15,9,9)]
world('skywalk','Namar · above the roofs','The observatory stair rises eastward. Postal water jars mark the sheltered landing.',rooffloor,[(33,20,3,2),(48,15,4,2)], [
 obj('roof-guard',32,26,'Upper terrace · glasswings',doneFlag='desertAscentWon',sprite='glasswing',spriteHiddenFlag='desertAscentWon'),obj('roof-observatory',50,18,'Royal observatory · the bronze seal',kind='exit',accessFlag='desertAscentWon',sign=True),obj('roof-palace',10,31,'Postal stair · return to the palace',kind='exit',sign=True),obj('roof-rest',23,30,'Postal shelter · rest and supplies',kind='optional',sign=True),obj('roof-chest',39,24,'Instrument case · medical lens',kind='optional',doneFlag='desertFocusTaken',sign=True)],
 {'start':(15,31),'terrace':(28,29),'observatory':(48,20)}, {'six-roofs':{'kit':(25,29),'orrin':(23,30),'petra':(28,30),'celia':(26,31),'samira':(27,28),'amal':(22,29)}},
 [point('sheltered-courier',18,30,sprite='civilian-traveler-blue')],
 [('roof-rest',bench(),168,86,448,641,727,{}),('roof-chest',chest(),60,48,931,510,558,{}),('roof-railing',[line([(194,674),(650,674),(650,578),(770,578)],GOLD,4),line([(866,482),(1120,482)],GOLD,4)],1160,710,0,0,-997,{})],roofback)

obsback=dunes()+[poly([(160,780),(160,320),(350,100),(1180,100),(1376,320),(1376,780)],INK),poly([(195,780),(195,332),(370,134),(1160,134),(1340,332),(1340,780)],'#6b6358')]
obsback.extend(astrolabe(768,360,253))
world('observatory','Namar · the royal observatory','The sun serpent holds the bronze release. Supplies wait under the southern arch.',[(12,23,40,13),(22,18,20,6)],[(27,18,11,4)], [
 obj('sun-serpent',32,24,'The sun serpent · defend the bronze release',doneFlag='sunSerpentWon',sign=True),control('desert-release',32,22,(27,14,11,8),'Bronze release · break the western seal',doneFlag='desertSealBroken',sign=True),obj('observatory-rest',19,31,'Southern arch · rest and bandages',kind='optional',sign=True),obj('observatory-roofs',15,33,'Terrace stair · return to the city',kind='exit',sign=True),obj('observatory-sahir',46,27,'Minister Sahir',kind='talk',sprite='sahir',hiddenFlag='desertReleaseReady')],
 {'start':(32,31),'stand':(32,27),'release':(32,24)}, {'six-serpent':{'kit':(31,27),'orrin':(28,29),'petra':(35,29),'celia':(30,30),'samira':(29,26),'sahir':(44,26)},'six-release':{'kit':(32,27),'orrin':(29,28),'petra':(35,28),'celia':(30,30),'samira':(32,23),'sahir':(44,26)}},
 [],[('observatory-bench',bench(),168,86,366,687,773,{}),('observatory-serpent',[poly([(23,190),(12,142),(49,93),(83,138),(66,203),(148,236),(235,183),(262,116),(302,50),(342,37),(364,59),(352,87),(312,92),(294,140),(283,213),(222,264),(126,279),(52,247)],GOLD),poly([(64,202),(148,236),(235,183),(262,116),(280,136),(263,215),(209,247),(126,261)],LIGHT),poly([(326,52),(353,52),(350,60),(327,60)],INK)],390,292,573,275,550,{'hiddenFlag':'sunSerpentWon'}),('observatory-released',[line([(663,424),(768,360),(872,424)],'#e1d9ab',7)],1000,470,0,0,-997,{'requiredFlag':'desertSealBroken'})],obsback)

for id,title in [('palace-gallery','Palace gallery cordon'),('palace-channel','Palace service channel'),('desert-ascent','Above the postal roofs'),('sun-serpent','The royal observatory')]:
 back=[rect(0,0,1008,480,NIGHT),poly([(0,90),(240,48),(500,111),(800,54),(1008,84),(1008,480),(0,480)],'#8b7869')]
 if id=='sun-serpent':back.extend(astrolabe(470,116,215))
 else:
  for x in (0,810):back.extend(building(x,-25,180,170,True))
 floor=[(3,3,34,16)]
 world('battle-'+id,title,'',floor,[],[],{'start':(20,17)},{},[],[],back,w=42,h=20)

(ROOT/'src/content/chapter-six/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Exported {len(manifest)} Chapter Six SVG scenes and Tiled layouts.')
