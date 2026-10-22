"""Author Chapter Four's SVG scenes and Tiled story layouts together.

No bitmap inputs, filters, external resources or raster exports. Whole planes
share exact 24px floor boundaries with Tiled; props sort at their sole anchors.
Run: python3 assets/vector/chapter-four.py
"""
import json, math
from pathlib import Path
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'public/art/vector/chapter-four'
MAP=ROOT/'src/content/chapter-four/maps'
ART.mkdir(parents=True,exist_ok=True); MAP.mkdir(parents=True,exist_ok=True)
manifest={}

def poly(pts,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+'" fill="'+c+'"/>'
def rect(x,y,w,h,c):return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{c}"/>'
def line(pts,c,w=3):return '<polyline points="'+' '.join(f'{x:g},{y:g}' for x,y in pts)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def ring(x,y,rx,ry,thick,c,n=16):
 def loop(a,b):return [(x+math.sin(i*2*math.pi/n)*a,y-math.cos(i*2*math.pi/n)*b) for i in range(n)]
 def path(pts):return 'M'+' L'.join(f'{xx:.1f},{yy:.1f}' for xx,yy in pts)+' Z'
 return f'<path d="{path(loop(rx,ry))} {path(loop(rx-thick,ry-thick))}" fill="{c}" fill-rule="evenodd"/>'
def svg(name,w,h,parts):
 (ART/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(name.replace("-"," "))}</title>'+''.join(parts)+'</svg>\n')
 return f'art/vector/chapter-four/{name}.svg'
def props(**kw):return [{'name':k,'type':'bool' if isinstance(v,bool) else 'int' if isinstance(v,int) else 'string','value':v} for k,v in kw.items()]
def point(name,x,y,**kw):return {'name':name,'point':True,'x':x*24+12,'y':y*24+12,'properties':props(**kw)}
def interaction(name,x,y,label,**kw):return point(name,x,y,label=label,**kw)
def control(name,x,y,label,box,**kw):
 a,b,w,h=box
 return {'name':name,'x':a*24,'y':b*24,'width':w*24,'height':h*24,'properties':props(label=label,approachX=x,approachY=y,**kw)}
def group(id,name,objects=None,**kw):return {'id':id,'name':name,'type':'objectgroup','visible':True,'objects':objects or [],'properties':props(**kw)}
def tile(id,name,data,w,h,**kw):return {'id':id,'name':name,'type':'tilelayer','width':w,'height':h,'visible':True,'data':data,'properties':props(**kw)}
def cells(rects,w,h,gid=3):
 a=[0]*(w*h)
 for x,y,rw,rh in rects:
  for yy in range(y,min(h,y+rh)):
   for xx in range(x,min(w,x+rw)):a[yy*w+xx]=gid
 return a

def capital(x,y,s=1):
 out=[poly([(x-142*s,y),(x-107*s,y-30*s),(x-80*s,y-20*s),(x-50*s,y-56*s),(x+72*s,y-51*s),(x+127*s,y-19*s),(x+148*s,y+4*s),(x+73*s,y+45*s),(x+26*s,y+90*s),(x-20*s,y+53*s),(x-78*s,y+56*s)],'#223949')]
 for xx,hh in [(-94,28),(-61,43),(-20,67),(27,54),(65,32)]:
  out.extend([rect(x+xx*s,y-(hh+39)*s,17*s,hh*s,'#314b57'),poly([(x+(xx-5)*s,y-(hh+39)*s),(x+(xx+8)*s,y-(hh+55)*s),(x+(xx+23)*s,y-(hh+39)*s)],'#566260')])
 out.extend([ring(x+2*s,y-58*s,43*s,32*s,8*s,'#8a8868'),line([(x-29*s,y+43*s),(x-10*s,y+152*s)],'#7d8e87',2*s)])
 return ''.join(out)
def seascape(w,h,temple=False):
 out=[rect(0,0,w,h,'#203a50'),rect(0,0,w,135,'#526777'),rect(0,135,w,100,'#868779'),rect(0,235,w,100,'#bd9d75'),rect(0,335,w,h-335,'#365a67')]
 out += [poly([(0,245),(150,175),(280,224),(448,158),(560,205),(730,166),(930,236),(1090,180),(1260,215),(1410,171),(w,220),(w,335),(0,335)],'#506b73'),poly([(0,300),(250,238),(393,284),(610,236),(760,299),(985,249),(1200,286),(w,244),(w,352),(0,352)],'#304f60')]
 out.append(capital(w-250,158,.7))
 for y in range(369,h,48):
  for x in range(20+(y%83),w,183):out.append(poly([(x,y),(x+104,y-4),(x+148,y),(x+42,y+4)],'#507780' if y%3 else '#67898b'))
 if temple:
  out += [poly([(0,400),(175,310),(310,357),(397,294),(540,395),(615,512),(498,h),(0,h)],'#344e59'),poly([(0,468),(178,389),(323,423),(450,369),(509,493),(406,728),(303,h),(0,h)],'#4b6263'),poly([(w,347),(1380,306),(1238,382),(1143,555),(1181,h),(w,h)],'#243e50'),poly([(1380,306),(1319,471),(1286,666),(1350,h),(w,h),(w,466)],'#53675f')]
 return out

def floor_shapes(rects,w,h,steel=False):
 # Union the navigation cells before drawing. Internal rectangle seams must not
 # become fake quay edges or cutaways across a walkable bridge.
 import importlib.util
 spec=importlib.util.spec_from_file_location('contours',ROOT/'assets/vector/chapter-one.py')
 compiler=importlib.util.module_from_spec(spec);spec.loader.exec_module(compiler)
 covered={(xx,yy) for x,y,rw,rh in rects for xx in range(x,x+rw) for yy in range(y,y+rh)}
 outlines=compiler.outline(covered)
 path=' '.join('M'+' L'.join(f'{x},{y}' for x,y in pts)+' Z' for pts in outlines)
 out=[f'<defs><clipPath id="floor"><path d="{path}" clip-rule="evenodd"/></clipPath></defs>',f'<g clip-path="url(#floor)">',rect(0,0,w,h,'#7b8278' if not steel else '#536d70')]
 out.extend([poly([(0,440),(480,400),(980,610),(w,420),(w,572),(980,754),(480,544),(0,600)],'#899083' if not steel else '#627e7b'),poly([(0,810),(590,675),(1070,830),(w,690),(w,h),(0,h)],'#697a74' if not steel else '#405d65')])
 for yy in range(24,h,72):
  out.append(line([(0,yy),(w,yy)],'#6b7971' if not steel else '#425e65',2))
  for xx in range(68+yy%101,w,168):out.append(line([(xx,yy),(xx-5,yy+72)],'#6b7971' if not steel else '#425e65',2))
 out.append('</g>')
 for pts in outlines:
  for i,(x,y) in enumerate(pts):
   nx,ny=pts[(i+1)%len(pts)]
   if y==ny and nx<x:out.extend([poly([(nx,y),(x,y),(x,y+18),(nx,y+27)],'#243f4b'),rect(nx,y-4,x-nx,4,'#b6ab88')])
   elif y==ny:out.append(line([(x,y+3),(nx,y+3)],'#a6a88c',5))
 return out

def ward():
 out=[poly([(0,206),(40,156),(580,156),(652,198),(652,264),(0,264)],'#1c3443'),rect(24,94,594,119,'#718b83'),poly([(24,94),(311,47),(618,94),(618,116),(24,116)],'#304e56'),poly([(0,92),(311,8),(652,88),(618,101),(311,47),(24,104)],'#3e615f'),poly([(0,92),(311,8),(311,24),(24,104)],'#8eaa93')]
 for x in (61,161,427,527):
  out += [rect(x,122,65,64,'#223d48'),rect(x+5,128,55,45,'#b5bb9b'),poly([(x+5,128),(x+60,128),(x+5,173)],'#d2ceaa'),rect(x+29,127,5,47,'#486863'),rect(x+3,151,60,4,'#486863')]
 out += [rect(269,117,91,97,'#1a3340'),rect(282,128,66,85,'#4d6d66'),rect(310,147,5,42,'#d7ba76'),rect(234,106,166,12,'#a1a88a'),rect(26,202,592,13,'#a4aa91')]
 for x in (41,214,411,601):out.extend([rect(x,114,8,103,'#263f4a'),rect(x+2,115,3,98,'#789481')])
 # A low wall leaves people on the apron in front of the open ward visible.
 out.extend([poly([(16,216),(620,216),(642,240),(0,240)],'#49615f'),rect(31,218,58,9,'#c9be9a'),rect(512,218,76,9,'#c9be9a')])
 return out

def ferry(opened=False):
 out=[poly([(10,134),(60,112),(298,112),(351,136),(307,181),(67,181)],'#142f40'),poly([(18,139),(343,139),(307,172),(70,172)],'#5d6d6a'),line([(28,141),(333,141)],'#c4b17e',5),poly([(78,96),(278,96),(310,115),(52,115)],'#a79878'),rect(108,54,140,48,'#94a797'),poly([(93,55),(121,39),(241,39),(264,55)],'#304f59')]
 for x in (122,164,206):out.extend([rect(x,63,28,23,'#203c4b'),rect(x+3,65,22,3,'#b8c8b4')])
 out.extend([rect(137,8,16,32,'#253f4d'),rect(135,7,20,5,'#9fa98f'),line([(289,29),(289,124)],'#283f49',4),poly([(289,30),(318,36),(289,43)],'#c69c63')])
 return out

def gate(opened):
 out=[]
 for x in (0,264):out.extend([rect(x,10,48,178,'#344b52'),poly([(x,10),(x+24,0),(x+48,10),(x+48,25),(x,25)],'#929c86'),rect(x+8,27,8,156,'#617c73'),rect(x+25,48,10,80,'#c2a46b')])
 if opened:
  for x in (41,247):out.append(poly([(x,54),(x+21,35),(x+21,166),(x,183)],'#7b937d'))
 else:
  out.extend([rect(48,51,216,130,'#365c5b'),poly([(48,51),(156,34),(264,51),(264,74),(156,56),(48,74)],'#799787')])
  for x in range(64,264,24):out.extend([rect(x,60,8,120,'#9f9e7b'),line([(x+3,63),(x+3,176)],'#bdb486',2)])
  out.extend([rect(148,51,16,130,'#b7a372'),ring(156,114,25,25,7,'#d9bb79')])
 return out

def pump_house():
 out=[rect(20,76,268,120,'#4c6968'),poly([(0,78),(139,8),(309,74),(289,91),(139,41),(20,92)],'#284753'),poly([(0,78),(139,8),(139,23),(20,92)],'#849688'),rect(36,108,74,66,'#244350'),rect(44,116,58,45,'#b9b99a'),rect(149,98,113,98,'#243e49'),rect(160,109,89,87,'#3a5a5e'),rect(27,193,263,8,'#b0aa8b')]
 for x in (23,277):out.extend([rect(x,142,7,111,'#2b424b'),rect(x+2,143,3,108,'#91a18a')])
 out.extend([poly([(11,141),(292,141),(311,166),(0,166)],'#a29a77'),poly([(11,141),(292,141),(266,150),(36,150)],'#c5b48a'),rect(0,165,311,9,'#3c5559'),rect(53,221,102,23,'#4b5653'),poly([(53,221),(70,207),(148,207),(155,221)],'#9a9678')])
 return out

def sanctuary():
 out=[poly([(0,277),(70,247),(560,247),(648,281),(648,308),(0,308)],'#1c3542'),poly([(40,261),(86,222),(553,222),(608,263)],'#9e9c80'),rect(81,183,476,43,'#4b6665')]
 for x in (109,495):out += [poly([(x-28,192),(x-22,52),(x-6,33),(x+18,49),(x+28,191)],'#485d61'),poly([(x-22,52),(x-6,33),(x-3,181),(x-28,192)],'#9c9a7b'),rect(x-22,190,51,12,'#c6b288')]
 # Faceted astronomical ring, naturally open sky through its center.
 out += [ring(322,123,121,112,25,'#263f49'),ring(317,115,116,109,19,'#b59661'),ring(317,115,96,91,4,'#e0bd77'),ring(317,115,105,99,4,'#d0af73')]
 for i in range(16):
  a=i*math.pi/8;dx=math.sin(a);dy=math.cos(a)
  out.append(line([(317+dx*98,115+dy*92),(317+dx*112,115+dy*105)],'#584f42',5))
 out += [poly([(302,193),(331,193),(344,247),(289,247)],'#345358'),poly([(302,193),(314,196),(308,242),(289,247)],'#baa370'),rect(244,232,151,24,'#7a8976'),rect(255,237,130,11,'#c8b987')]
 # Carved old hospice wings: broad arches, not a marble palace.
 for x in (3,452):
  out += [rect(x,158,184,74,'#667a70'),poly([(x-3,158),(x+86,112),(x+187,157)],'#3f5c60')]
  for xx in (x+19,x+83,x+146):out.extend([poly([(xx,220),(xx,180),(xx+12,167),(xx+25,180),(xx+25,220)],'#233e4a'),rect(xx+9,182,8,34,'#a7b69b')])
 return out

def wheel():
 return [rect(32,29,19,54,'#35555a'),poly([(11,82),(63,82),(78,95),(0,95)],'#334c54'),ring(40,33,32,30,7,'#d1aa69'),line([(8,33),(72,33)],'#d1aa69',5),line([(40,4),(40,61)],'#d1aa69',5),rect(33,26,14,14,'#3b5c5d')]
def crate():return [poly([(2,17),(48,1),(82,16),(82,56),(37,76),(2,57)],'#725d46'),poly([(2,17),(48,1),(82,16),(37,34)],'#bc9d69'),poly([(37,34),(82,16),(82,56),(37,76)],'#4f5350'),line([(10,20),(44,70)],'#b89561',5),line([(47,10),(68,61)],'#c3a371',5)]
def clamp(cut=False):
 out=[rect(0,32,144,18,'#1d3947'),rect(0,34,144,5,'#a6855e'),rect(41,14,64,58,'#344d55'),poly([(41,14),(52,4),(116,4),(105,14)],'#b29a6c'),rect(56,17,34,42,'#bb9d69')]
 out.append(line([(0,40),(52,40),(72,63 if cut else 40),(143,66 if cut else 40)],'#c1b87f',5))
 return out

def world(id,name,subtitle,floors,blocks,objects,arrivals,casts,people,decor,back=None):
 w,h=64,42;layers=[tile(1,'Sea and cliffs',[5]*(w*h),w,h),tile(2,'Continuous walking surfaces',cells(floors,w,h),w,h),tile(3,'Scenery footprints',cells(blocks,w,h,6),w,h,sort=True)]
 entries=[]
 def add(n,parts,ww=1536,hh=1008,x=0,y=0,depth=-1000,layer=1):
  entries.append({'key':f'scene-four-{n}','url':svg(n,ww,hh,parts),'x':x,'y':y,'width':ww,'height':hh,'depth':depth,'layerId':layer})
 add(id+'-coast',back if back is not None else seascape(1536,1008,id=='sanctuary'))
 add(id+'-floor',floor_shapes(floors,1536,1008,id=='breakwater'),depth=-998,layer=2)
 # Each prop has explicit unchanging ground sorting, separate from floor decks.
 for n,parts,ww,hh,x,y,depth,extra in decor:
  lid=3
  if extra:
   lid=len(layers)+1;layers.append(group(lid,n,sort=True,**extra))
  add(n,parts,ww,hh,x,y,depth,lid)
 # The unnatural raised wave disappears in all locations after the local victory.
 lid=len(layers)+1;layers.append(group(lid,'Suspended water',hiddenFlag='sanctuaryWardenWon'))
 wave=[poly([(82,388),(137,340),(156,288),(188,253),(223,264),(201,306),(172,337),(170,385),(208,411)],'#8aaca8'),poly([(156,288),(188,253),(223,264),(204,274),(180,273),(168,294)],'#d1d2b4'),line([(175,290),(173,321),(152,353)],'#bed0ba',4)]
 if id!='sanctuary':
  wave.extend([poly([(140,405),(228,405),(214,422),(154,424)],'#654f3e'),line([(145,407),(222,407)],'#c6ad7b',3),line([(168,402),(200,398)],'#9b895d',3)])
  # Keep the stranded skiff in open water, with the quay occluding sea scenery.
  shift,y_shift=(1000,0) if id=='refuge' else (480,-40)
  add(id+'-wave',[f'<g transform="translate({shift} {y_shift})">',*wave,'</g>'],depth=-999,layer=lid)
 layers.extend([group(len(layers)+1,'Interactions',objects),group(len(layers)+2,'Arrivals',[point(k,*v) for k,v in arrivals.items()]),group(len(layers)+3,'People',people)])
 for sid,cast in casts.items():layers.append(group(len(layers)+1,'Scene:'+sid,[point(k,*v) for k,v in cast.items()]))
 write_map(id,name,subtitle,w,h,layers,next(iter(arrivals)))
 manifest[id]=entries

def write_map(id,name,subtitle,w,h,layers,safe=None):
 d={'type':'map','version':'1.10','tiledversion':'1.11.2','orientation':'orthogonal','renderorder':'right-down','infinite':False,'width':w,'height':h,'tilewidth':24,'tileheight':24,'nextlayerid':len(layers)+1,'nextobjectid':1,'properties':props(name=name,subtitle=subtitle,artStyle='rotoscope',sceneArt=id,**({'safeArrival':safe} if safe else {})),'tilesets':[{'firstgid':p['firstgid'],'source':'../../../../assets/tiles/pages/'+p['name']+'.json'} for p in json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text())['pages']],'layers':layers}
 for layer in layers:
  for o in layer.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 # Rows remain readable/editable in Tiled without thousands of one-line numbers.
 text=json.dumps(d,indent=2)
 import re
 text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('        '+','.join(str(x) for x in json.loads('['+m[1]+']')[i:i+w]) for i in range(0,w*h,w))+'\n      ]',text)
 (MAP/f'{id}.json').write_text(text+'\n')

refuge_f=[(9,20,47,15),(2,25,10,7),(17,18,26,4),(50,23,14,6)]
refuge_decor=[('refuge-ward',ward(),652,264,384,240,504,{}),('refuge-ferry',ferry(),360,192,12,408,600,{'requiredFlag':'harborOpened'}),('refuge-supplies',crate(),84,80,1040,652,732,{'requiredFlag':'harborOpened'})]
# The real coal engine and coach persist on continuous railway tracks.
back=seascape(1536,1008)
for yy in (846,888):
 back.extend([rect(0,yy-5,1536,36,'#334952')])
 for x in range(0,1536,17):back.append(poly([(x,yy-3),(x+8,yy-3),(x+5,yy+27),(x-3,yy+27)],'#75654e'))
 for y in (yy,yy+18):back.extend([rect(0,y,1536,5,'#172f40'),rect(0,y,1536,2,'#a8b2a0')])
# Whole props reused at native size; no raster painting of the old ward.
world('refuge','Iron Coast · the railway refuge','The harbor path runs east. Tomas and Dena are keeping the ward open.',refuge_f,[(17,18,26,3)], [
 interaction('refuge-tomas',31,23,'Tomas · the railway messages',sprite='tomas'),interaction('refuge-rest',22,22,'Dena · supplies and rest',sprite='dena'),interaction('refuge-bram',41,27,'Bram · ferry supplies',sprite='bram',requiredFlag='harborOpened'),interaction('refuge-works',52,25,'Eastern path · Breakwater harbor',sign=True)],
 {'start':(31,28),'harbor':(48,26),'departure':(12,28)},
 {'four-home':{'nell':(31,28),'tomas':(31,25),'orrin':(34,29),'kit':(29,30),'petra':(36,29),'dena':(22,22),'bram':(42,27)},'four-choice':{'nell':(23,28),'tomas':(24,27),'orrin':(20,29),'kit':(19,31),'petra':(22,31),'celia':(17,30),'bram':(17,27)}},
 [point('ward-patient',19,23,sprite='civilian-patient'),point('medical-family',41,23,sprite='civilian-family-blue'),point('supply-worker',45,29,sprite='civilian-dockhand-rust',requiredFlag='harborOpened'),point('ferry-family',12,30,sprite='civilian-family-plum',requiredFlag='harborOpened')],refuge_decor,back)
# Reuse engine/coach SVGs without reauthoring accepted Chapter One art.
for module,x in [('engine',1080),('coach',660)]:
 import re
 url=f'art/vector/scenery/{module}.svg';src=(ROOT/'public'/url).read_text();ww,hh=map(int,re.search(r'width="(\d+)" height="(\d+)"',src).groups())
 manifest['refuge'].append({'key':f'scenery-{module}','url':url,'x':x,'y':846-hh+8,'width':ww,'height':hh,'depth':854,'layerId':3})

harbor_f=[(9,25,45,11),(23,21,18,5),(28,17,14,5),(39,18,19,5),(11,22,14,5),(4,29,9,5),(50,23,14,5)]
decor=[('harbor-pumphouse',pump_house(),312,264,300,312,576,{}),('harbor-ferry-out',ferry(),360,192,1038,378,570,{'hiddenFlag':'harborOpened'}),('harbor-ferry-in',ferry(),360,192,139,630,822,{'requiredFlag':'harborOpened'}),('harbor-gate-closed',gate(False),312,192,912,264,456,{'hiddenFlag':'harborOpened'}),('harbor-gate-open',gate(True),312,192,912,264,456,{'requiredFlag':'harborOpened'}),('harbor-wheel',wheel(),80,96,788,456,552,{}),('harbor-survey',crate(),84,80,244,613,693,{})]
world('breakwater','Breakwater · the sea gate','The winding wheel is on the middle pier. A service stair climbs east.',harbor_f,[(13,19,12,5),(43,17,5,2)],[
 interaction('works-approach',33,18,'Chain walk · choose an approach',sprite='guardian',hiddenFlag='worksGateWon'),control('works-wheel',34,23,'Winding wheel · open the sea gate',(32,19,5,4),sign=True,doneFlag='harborOpened'),control('works-cart',12,29,'Survey cart · folding range sight',(10,25,4,4),sign=True,doneFlag='worksStoresWon'),interaction('works-bram',27,24,'Bram · ferry crews',sprite='bram',hiddenFlag='harborOpened'),interaction('works-bench',17,26,'Pump-house bench · rest',sign=True),interaction('works-refuge',6,31,'West path · railway refuge',sign=True),interaction('works-sanctuary',54,20,'Service stair · signal sanctuary',sign=True,accessFlag='harborOpened')],
 {'refuge':(25,29),'gate':(34,25),'sanctuary':(50,21)},
 {'four-harbor':{'nell':(28,27),'orrin':(31,28),'kit':(26,28),'petra':(33,27),'celia':(24,24),'bram':(25,25)},'four-gate':{'nell':(32,25),'orrin':(31,24),'kit':(37,25),'petra':(38,27),'celia':(30,26),'bram':(29,28)}},
 [point('ferry-injury',22,24,sprite='civilian-patient-green',hiddenFlag='harborOpened'),point('deck-worker',30,20,sprite='civilian-dockhand',hiddenFlag='harborOpened'),point('returning-worker',17,32,sprite='civilian-dockhand-rust',requiredFlag='harborOpened')],decor)

sanctuary_f=[(20,18,23,17),(14,27,9,8),(38,24,15,7),(40,20,15,5),(26,14,15,5),(26,34,13,7),(8,30,10,5)]
decor=[('sanctuary-ring',sanctuary(),648,312,456,132,444,{}),('sanctuary-clamp-live',clamp(),144,96,984,504,600,{'hiddenFlag':'signalCut'}),('sanctuary-clamp-cut',clamp(True),144,96,984,504,600,{'requiredFlag':'signalCut'}),('sanctuary-fieldchest',crate(),84,80,482,616,696,{})]
back=seascape(1536,1008,True)
# Imperial cable rises from the mainland over the eastern bridge.
back.extend([line([(1536,540),(1250,535),(1080,540),(1050,432),(960,410),(850,377)],'#182f41',13),line([(1536,536),(1250,531),(1080,536),(1050,428),(960,406),(850,373)],'#a08e63',5)])
world('sanctuary','The signal sanctuary · the hollow sun','The eastern bridge carries the palace line. The bronze ring watches the coast.',sanctuary_f,[(26,14,15,4)], [
 interaction('sanctuary-patrol',44,28,'Eastern bridge · return-line guards',sprite='guardian',hiddenFlag='roadGuardWon'),control('sanctuary-cable',43,26,'Copper clamp · disconnect the return line',(41,21,6,4),sign=True,doneFlag='signalCut'),interaction('sanctuary-warden',32,19,'The Sanctuary Warden',sprite='sluice-keeper',hiddenFlag='sanctuaryWardenWon'),control('sanctuary-record',32,18,'Bronze ring · the covered chart',(29,15,7,3),sign=True,requiredFlag='sanctuaryWardenWon',doneFlag='anchorsKnown'),control('sanctuary-chest',22,29,'Hospice field chest · silver clasp',(20,26,4,3),sign=True,doneFlag='sanctuaryCache'),interaction('sanctuary-bench',17,31,'Old hospice bench · rest',sign=True),interaction('sanctuary-harbor',32,38,'Service stair · Breakwater harbor',sign=True),interaction('sanctuary-refuge',11,32,'Coastal path · railway refuge',sign=True)],
 {'harbor':(32,32),'cable':(40,27)},
 {'four-terrace':{'nell':(31,30),'orrin':(34,31),'kit':(29,32),'petra':(36,30),'celia':(29,29),'sanctuaryWarden':(32,19)},'four-cable':{'nell':(40,28),'orrin':(42,28),'kit':(39,30),'petra':(43,29),'celia':(38,28),'sanctuaryWarden':(32,19)},'four-chart':{'nell':(31,21),'orrin':(35,21),'kit':(30,23),'petra':(37,23),'celia':(33,19)}},[],decor,back)

# Clear, whole SVG tactical floors at the engine's normal 1008x624 viewport.
for id in ['works-dry','works-wet','works-survey','sanctuary-road','sanctuary-warden']:
 key='battle-'+id;temple=id.startswith('sanctuary');w,h=42,26
 bg=seascape(1008,624,temple)
 # Distant structures end above the tactical cell centers. No scenery crosses them.
 bg.extend([rect(0,85,1008,28,'#263f49'),rect(0,85,1008,5,'#b1aa87')])
 if temple:
  # A separate distant ring gives the boss arena its own silhouette.
  bg.extend([ring(785,50,84,77,13,'#b99961'),rect(763,91,45,30,'#4e6967')])
 else:
  for x in range(0,1008,144):bg.extend([rect(x,8,11,77,'#344e57'),line([(x,20),(x+110,82)],'#9c997b',4)])
 floor=[rect(0,113,1008,511,'#647a76' if temple else '#526b70'),poly([(0,113),(1008,113),(1008,253),(760,223),(512,287),(270,205),(0,260)],'#72877d' if temple else '#607b7b'),poly([(0,511),(250,466),(570,550),(1008,481),(1008,624),(0,624)],'#405c62')]
 for yy in range(140,624,76):
  floor.append(line([(0,yy),(1008,yy)],'#526c69' if temple else '#3e5b63',2))
  for xx in range(55+yy%77,1008,148):floor.append(line([(xx,yy),(xx-6,yy+76)],'#526c69' if temple else '#3e5b63',2))
 if id=='works-wet':
  for x in (388,484):floor.extend([poly([(x,179),(x+100,170),(x+115,440),(x-12,456)],'#547c83'),line([(x+11,251),(x+76,247)],'#9cb4aa',3),line([(x+9,389),(x+86,384)],'#9cb4aa',3)])
 url1=svg(key+'-coast',1008,624,bg);url2=svg(key+'-floor',1008,624,floor)
 layers=[tile(1,'Distant coast',[5]*(w*h),w,h),tile(2,'Clear tactical floor',[3]*(w*h),w,h)]
 write_map(key,('Signal terrace' if temple else 'Breakwater')+' · '+id,'Tactical arena',w,h,layers)
 manifest[key]=[{'key':f'scene-four-{key}-{i}','url':url,'x':0,'y':0,'width':1008,'height':624,'depth':-1001+i,'layerId':i} for i,url in enumerate([url1,url2],1)]
# This directory contains generated SVGs only. Retire outputs no longer registered.
used={Path(e['url']).name for entries in manifest.values() for e in entries if e['url'].startswith('art/vector/chapter-four/')}
for file in ART.glob('*.svg'):
 if file.name not in used:file.unlink()
(ROOT/'src/content/chapter-four/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Exported 3 story maps, 5 battle maps and native SVG artwork for Chapter Four')
