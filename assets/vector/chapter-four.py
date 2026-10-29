"""Author Chapter Four's SVG scenes and Tiled story layouts together.

No bitmap inputs, filters, external resources or raster exports. Whole planes
preserve Tiled's 24px navigation and registered prop/actor anchors.
Run: python3 assets/vector/chapter-four.py
"""
import json, math
from pathlib import Path
from map_metadata import retain_interaction_roles
from xml.sax.saxutils import escape
from chapter_four_style import treatment, floor_paint, coastal_lamp, opal, floor_spill, drive_link, arena_lights
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
 source=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{escape(name.replace("-"," "))}</title>'+''.join(parts)+'</svg>'
 (ART/f'{name}.svg').write_text(treatment(name,source,w,h))
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
 out=[rect(0,0,w,h,'#29465c'),rect(0,0,w,135,'#53677d'),rect(0,135,w,100,'#888a88'),rect(0,235,w,100,'#c3a07a'),rect(0,335,w,h-335,'#355b6d')]
 out += [poly([(0,245),(150,175),(280,224),(448,158),(560,205),(730,166),(930,236),(1090,180),(1260,215),(1410,171),(w,220),(w,335),(0,335)],'#506b73'),poly([(0,300),(250,238),(393,284),(610,236),(760,299),(985,249),(1200,286),(w,244),(w,352),(0,352)],'#304f60')]
 out.append(capital(w-250,158,.7))
 # Sparse unequal reflections, not a repeated water-tile pattern.
 for i,y in enumerate(range(369,h,83)):
  for j,x in enumerate(range(17+(i*137)%263,w,287)):
   length=64+(i*41+j*29)%109
   out.append(poly([(x,y),(x+length*.65,y-3),(x+length,y),(x+length*.2,y+3)],'#688c96'if i%3==0 else'#527a8b'))
 if temple:
  out += [poly([(0,400),(175,310),(310,357),(397,294),(540,395),(615,512),(498,h),(0,h)],'#344e59'),poly([(0,468),(178,389),(323,423),(450,369),(509,493),(406,728),(303,h),(0,h)],'#4b6263'),poly([(w,347),(1380,306),(1238,382),(1143,555),(1181,h),(w,h)],'#243e50'),poly([(1380,306),(1319,471),(1286,666),(1350,h),(w,h),(w,466)],'#53675f')]
  for pts,color in [([(0,400),(175,310),(310,357),(220,402),(184,508),(0,564)],'#4d6668'),
   ([(175,310),(310,357),(397,294),(343,392),(420,475),(290,550),(184,508),(220,402)],'#627873'),
   ([(0,564),(184,508),(290,550),(244,708),(110,792),(0,753)],'#365560'),
   ([(290,550),(420,475),(509,493),(406,728),(334,748),(244,708)],'#3d5c62'),
   ([(0,753),(110,792),(244,708),(303,h),(0,h)],'#4c6968'),
   ([(1380,306),(1319,471),(1451,515),(w,466),(w,347)],'#70857a'),
   ([(1319,471),(1286,666),(1374,710),(1451,515)],'#3f5b61'),
   ([(1451,515),(w,466),(w,842),(1430,786),(1374,710)],'#526e6b')]:out.append(poly(pts,color))
 return out

def quay_cells(outlines,w,h):
 # Native polygon edges and Tiled footing share one source. Sample cell centers
 # so broad crooked quay faces do not conceal square invisible collision walls.
 def inside(x,y):
  result=False
  for loop in outlines:
   for (ax,ay),(bx,by) in zip(loop,loop[1:]+loop[:1]):
    if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:result=not result
  return result
 return [3 if inside(x*24+12,y*24+12)else 0 for y in range(h)for x in range(w)]

def floor_path(outlines):return ' '.join('M'+' L'.join(f'{x},{y}'for x,y in pts)+' Z'for pts in outlines)

def floor_shapes(outlines,w,h,steel=False,shore=False):
 path=' '.join('M'+' L'.join(f'{x},{y}' for x,y in pts)+' Z' for pts in outlines)
 out=[f'<defs><clipPath id="floor"><path d="{path}" clip-rule="evenodd"/></clipPath></defs>',f'<g clip-path="url(#floor)">',*floor_paint(w,h,steel)]
 out.append('</g>')
 for pts in outlines:
  for i,(x,y) in enumerate(pts):
   nx,ny=pts[(i+1)%len(pts)]
   if nx<x:
    out.extend([poly([(nx,ny),(x,y),(x,y+18),(nx,ny+27)],'#36515d'),poly([(nx,ny-4),(x,y-4),(x,y),(nx,ny)],'#b6ad92')])
    if shore and x-nx>=96:
     for ratio,length in [(.18,39),(.61,57),(.86,25)]:
      length=min(length,(x-nx)*(1-ratio));slope=(y-ny)/(x-nx)
      xx=nx+(x-nx)*ratio;yy=ny+(y-ny)*ratio+30
      out.append(poly([(xx,yy),(xx+length*.68,yy+slope*length*.68-3),(xx+length,yy+slope*length),(xx+length*.19,yy+slope*length*.19+2)],'#87a8ac'))
   elif nx>x:out.append(line([(x,y+3),(nx,ny+3)],'#a6ac99',4))
 return out

def ward():
 out=[poly([(0,206),(40,156),(580,156),(652,198),(652,264),(0,264)],'#1c3443'),rect(24,94,594,119,'#718b83'),poly([(24,94),(311,47),(618,94),(618,116),(24,116)],'#304e56'),poly([(0,92),(311,8),(652,88),(618,101),(311,47),(24,104)],'#3e615f'),poly([(0,92),(311,8),(311,24),(24,104)],'#8eaa93')]
 for x in (61,161,427,527):
  out += [rect(x,122,65,64,'#223d48'),rect(x+5,128,55,45,'#b5bb9b'),poly([(x+5,128),(x+60,128),(x+5,173)],'#d2ceaa'),rect(x+29,127,5,47,'#486863'),rect(x+3,151,60,4,'#486863')]
 out += [rect(269,117,91,97,'#1a3340'),rect(282,128,66,85,'#4d6d66'),rect(310,147,5,42,'#d7ba76'),rect(234,106,166,12,'#a1a88a'),rect(26,202,592,13,'#a4aa91')]
 for x in (41,214,411,601):out.extend([rect(x,114,8,103,'#263f4a'),rect(x+2,115,3,98,'#789481')])
 # A low wall leaves people on the apron in front of the open ward visible.
 out.extend([poly([(16,216),(620,216),(642,240),(0,240)],'#49615f'),rect(31,218,58,9,'#c9be9a'),rect(512,218,76,9,'#c9be9a')])
 out.extend([poly([(593,117),(618,116),(618,202),(593,207)],'#536f6b'),poly([(31,202),(594,202),(610,210),(31,210)],'#809886')])
 for x in (254,376):out.extend(opal(x,162))
 return out

def ferry(opened=False):
 out=[poly([(10,134),(60,112),(298,112),(351,136),(307,181),(67,181)],'#142f40'),poly([(18,139),(343,139),(307,172),(70,172)],'#5d6d6a'),line([(28,141),(333,141)],'#c4b17e',5),poly([(78,96),(278,96),(310,115),(52,115)],'#a79878'),rect(108,54,140,48,'#94a797'),poly([(93,55),(121,39),(241,39),(264,55)],'#304f59')]
 for x in (122,164,206):out.extend([rect(x,63,28,23,'#c5cead'),rect(x+15,64,12,20,'#8fa9a0'),rect(x+3,65,6,17,'#e5ddb3')])
 out.extend([poly([(278,139),(343,139),(307,172),(278,172)],'#45636a'),poly([(108,54),(121,58),(121,99),(108,102)],'#b4c1aa')])
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
 out.append(poly([(265,96),(288,91),(288,141),(265,141)],'#3f6063'))
 for x in (40,272):out.extend(opal(x,188))
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

def service_bridge():
 # A broad gate threshold recedes to a narrow landing on the far headland.
 # Deck joints, parapets and posts all use the same two converging edges.
 near=((970,432),(1172,406));far=((1040,174),(1090,174))
 def edges(t):return [tuple(a+(b-a)*t for a,b in zip(n,f))for n,f in zip(near,far)]
 out=[poly([(990,186),(1056,143),(1110,168),(1180,280),(1350,295),(1536,300),(1536,380),(1320,350),(1200,320),(1105,286),(1020,232)],'#476466'),
  poly([(1020,232),(1105,286),(1200,320),(1320,350),(1536,380),(1536,400),(1320,373),(1200,345),(1100,310)],'#304e5b'),
  poly([near[0],far[0],far[1],near[1]],'#8b9b8a')]
 for side,color in [(0,'#496769'),(1,'#36565f')]:
  n,f=near[side],far[side];out.append(poly([n,f,(f[0]+3,f[1]+7),(n[0]+8,n[1]+19)],color))
 for t in (0,.14,.28,.41,.53,.64,.73,.81,.88,.94):
  left,right=edges(t);out.append(line([left,right],'#637b75',max(1,4*(1-t))))
 for side in (0,1):
  tops=[]
  for t in (0,.18,.36,.53,.68,.80,.90,1):
   p=edges(t)[side];height=32*(1-t)+6*t;top=(p[0],p[1]-height);tops.append(top)
   out.extend([line([p,top],'#4a6465',max(2,7*(1-t))),line([(p[0]-1,p[1]),(top[0]-1,top[1])],'#acaf8d',max(1,2*(1-t)))])
  out.extend([line(tops,'#3d5b60',6),line([(x,y-3)for x,y in tops],'#b2b694',3)])
 return out

def sanctuary_launch():
 # A small sheltered passenger launch; the starboard bow meets the gangplank.
 out=[poly([(4,94),(28,82),(162,82),(188,98),(163,130),(42,132)],'#35535e'),
  poly([(12,99),(179,101),(161,125),(43,127)],'#6b7e75'),
  poly([(28,83),(156,83),(175,99),(38,109)],'#c2ac7e'),
  line([(17,99),(178,101)],'#d2be8c',3),
  poly([(57,42),(119,42),(127,84),(52,88)],'#708d7f'),
  poly([(48,42),(87,27),(131,42),(124,49),(57,48)],'#3d5c63')]
 for x in (65,96):out.extend([rect(x,54,22,23,'#36555c'),rect(x+3,57,16,16,'#dfd4a4')])
 out.extend([rect(64,16,10,19,'#49676b'),rect(62,14,14,4,'#a8ae93'),
  line([(151,19),(153,90)],'#61756b',4),poly([(152,20),(173,24),(152,30)],'#c29e64'),
  poly([(151,106),(179,101),(161,125),(146,127)],'#4d6c6b')])
 return out

def world(id,name,subtitle,outlines,blocks,objects,arrivals,casts,people,decor,back=None):
 w,h=64,42;layers=[tile(1,'Sea and cliffs',[5]*(w*h),w,h),tile(2,'Continuous walking surfaces',quay_cells(outlines,w,h),w,h),tile(3,'Scenery footprints',cells(blocks,w,h,6),w,h,sort=True)]
 entries=[]
 def add(n,parts,ww=1536,hh=1008,x=0,y=0,depth=-1000,layer=1):
  entries.append({'key':f'scene-four-{n}','url':svg(n,ww,hh,parts),'x':x,'y':y,'width':ww,'height':hh,'depth':depth,'layerId':layer})
 add(id+'-coast',back if back is not None else seascape(1536,1008,id=='sanctuary'))
 add(id+'-floor',floor_shapes(outlines,1536,1008,id=='breakwater',id!='refuge'),depth=-998,layer=2)
 if id=='breakwater':
  add('harbor-drive',drive_link(),depth=-997,layer=2)
  add('harbor-service-stair',service_bridge(),depth=-996,layer=2)
 if id=='sanctuary':
  path=[poly([(660,840),(912,845),(952,1008),(642,1008)],'#839184')]
  for y in (862,891,923,959,999):
   t=(y-840)/168;left=660-18*t;right=912+40*t
   path.extend([line([(left,y),(right,y+4)],'#5b7470',4),line([(left,y-3),(right,y+1)],'#acb098',2)])
  path.extend([poly([(184,778),(231,769),(237,791),(182,799)],'#526665'),poly([(184,775),(231,766),(237,786),(182,794)],'#b19b71')])
  for x in (190,202,214,226):path.append(line([(x,774-(x-184)*.2),(x+2,791-(x-184)*.17)],'#7a765e',2))
  add('sanctuary-departures',path,depth=-996,layer=2)
 lamp_positions={'refuge':[(264,576),(600,552),(912,576)],'breakwater':[(432,552),(816,576),(840,312)],'sanctuary':[(360,648),(600,600),(912,624)]}
 decor=decor+[('coastal-lamp',coastal_lamp(),48,144,x,y,y+139,{})for x,y in lamp_positions[id]]
 # Each prop has explicit unchanging ground sorting, separate from floor decks.
 for n,parts,ww,hh,x,y,depth,extra in decor:
  lid=3
  if extra:
   lid=len(layers)+1
   # The painted closed-gate layer also blocks its upper service stair. Its
   # existing visibility flag opens both together, without a side-route bypass.
   if n=='harbor-gate-closed':layers.append(tile(lid,n,cells([(40,11,9,8)],w,h,6),w,h,sort=True,**extra))
   else:layers.append(group(lid,n,sort=True,**extra))
  add(n,parts,ww,hh,x,y,depth,lid)
 # Ground spill inherits the emitter's exact visibility layer, including ferries.
 for lid in sorted({e['layerId']for e in entries}):
  emitters=[e for e in entries if e['layerId']==lid];light=floor_spill(emitters)
  if light:
   clipped=f'<defs><clipPath id="light-floor"><path d="'+floor_path(outlines)+'" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#light-floor)">'+light+'</g>'
   add(f'light-{id}-{lid}',[clipped],depth=-950,layer=lid)
 # The unnatural raised wave disappears in all locations after the local victory.
 lid=len(layers)+1;layers.append(group(lid,'Suspended water',hiddenFlag='sanctuaryWardenWon'))
 wave=[poly([(82,388),(137,340),(156,288),(188,253),(223,264),(201,306),(172,337),(170,385),(208,411)],'#8aaca8'),poly([(156,288),(188,253),(223,264),(204,274),(180,273),(168,294)],'#d1d2b4'),line([(175,290),(173,321),(152,353)],'#bed0ba',4)]
 if id!='sanctuary':
  wave.extend([line([(173,240),(173,412)],'#6d5845',5),line([(172,242),(172,408)],'#c6af7b',2),line([(173,245),(222,405)],'#a9a88a',1.5),poly([(140,405),(228,405),(214,422),(154,424)],'#654f3e'),line([(145,407),(222,407)],'#c6ad7b',3),line([(173,399),(217,397)],'#9b895d',3)])
  # Keep the stranded skiff in open water, with the quay occluding sea scenery.
  shift,y_shift=(1000,0) if id=='refuge' else (480,-40)
  add(id+'-wave',[f'<g transform="translate({shift} {y_shift})">',*wave,'</g>'],depth=-999,layer=lid)
 layers.extend([group(len(layers)+1,'Interactions',objects),group(len(layers)+2,'Arrivals',[point(k,*v) for k,v in arrivals.items()]),group(len(layers)+3,'People',people)])
 for sid,cast in casts.items():layers.append(group(len(layers)+1,'Scene:'+sid,[point(k,*v) for k,v in cast.items()]))
 write_map(id,name,subtitle,w,h,layers,next(iter(arrivals)))
 manifest[id]=entries

def write_map(id,name,subtitle,w,h,layers,safe=None):
 d={'type':'map','version':'1.10','tiledversion':'1.11.2','orientation':'orthogonal','renderorder':'right-down','infinite':False,'width':w,'height':h,'tilewidth':24,'tileheight':24,'nextlayerid':len(layers)+1,'nextobjectid':1,'properties':props(name=name,subtitle=subtitle,artStyle='rotoscope',sceneArt=id,**({'safeArrival':safe} if safe else {})),'tilesets':[{'firstgid':p['firstgid'],'source':'../../../../assets/tiles/pages/'+p['name']+'.json'} for p in json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text())['pages']],'layers':layers}
 retain_interaction_roles(MAP/f'{id}.json', layers)
 for layer in layers:
  for o in layer.get('objects',[]):o['id']=d['nextobjectid'];d['nextobjectid']+=1
 # Rows remain readable/editable in Tiled without thousands of one-line numbers.
 text=json.dumps(d,indent=2)
 import re
 text=re.sub(r'"data": \[\n([\s\d,]+?)\n      \]',lambda m:'"data": [\n'+',\n'.join('        '+','.join(str(x) for x in json.loads('['+m[1]+']')[i:i+w]) for i in range(0,w*h,w))+'\n      ]',text)
 (MAP/f'{id}.json').write_text(text+'\n')

refuge_f=[[(48,612),(207,586),(226,484),(399,462),(414,428),(1029,439),(1044,468),(1332,494),(1357,552),(1536,570),(1536,708),(1326,683),(1344,800),(948,806),(676,790),(400,806),(226,792),(203,775),(55,789)]]
refuge_decor=[('refuge-ward',ward(),652,264,384,240,504,{}),('refuge-ferry',ferry(),360,192,12,408,600,{'requiredFlag':'harborOpened'}),('refuge-supplies',crate(),84,80,1040,652,732,{'requiredFlag':'harborOpened'})]
# The real coal engine and coach persist on continuous railway tracks.
back=seascape(1536,1008)
# Raised harbor paving ends before a lower, continuous railway embankment.
# Its cutaway stops above the first ballast bed: no paving face covers a rail.
back.extend([rect(0,811,1536,197,'#586968'),rect(0,833,1536,92,'#637370'),
 poly([(0,928),(1536,928),(1536,1008),(0,1008)],'#415b60')])
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
for module,x in [('engine',948),('coach',660)]:
 import re
 url=f'art/vector/scenery/{module}.svg';src=(ROOT/'public'/url).read_text();ww,hh=map(int,re.search(r'width="(\d+)" height="(\d+)"',src).groups())
 key=f'scenery-{module}'
 if module=='engine':
  from railway import engine_right
  key,url=engine_right(key,url)
 manifest['refuge'].append({'key':key,'url':url,'x':x,'y':846-hh+8,'width':ww,'height':hh,'depth':854,'layerId':3})

harbor_f=[[(96,704),(210,682),(238,600),(270,572),(284,530),(548,514),(566,492),(660,510),(678,420),(920,414),(970,432),(1040,174),(1090,174),(1172,406),(1390,452),(1406,550),(1536,570),(1536,682),(1312,660),(1280,858),(1024,882),(760,852),(500,876),(222,850),(206,809),(100,830)],[(990,552),(982,600),(1194,612),(1200,568)]]
decor=[('harbor-pumphouse',pump_house(),312,264,300,312,576,{}),('harbor-ferry-out',ferry(),360,192,1170,228,420,{'hiddenFlag':'harborOpened'}),('harbor-ferry-in',ferry(),360,192,36,768,960,{'requiredFlag':'harborOpened'}),('harbor-gate-closed',gate(False),312,192,912,264,456,{'hiddenFlag':'harborOpened'}),('harbor-gate-open',gate(True),312,192,912,264,456,{'requiredFlag':'harborOpened'}),('harbor-wheel',wheel(),80,96,788,456,552,{}),('harbor-survey',crate(),84,80,244,613,693,{})]
world('breakwater','Breakwater · the sea gate','The winding wheel operates the gate. Its service stair climbs to the sanctuary.',harbor_f,[(13,19,12,5),(38,17,2,2),(49,17,2,2)],[
 interaction('works-approach',33,18,'Chain walk · choose an approach',sprite='guardian-dusk',hiddenFlag='worksGateWon'),control('works-wheel',34,23,'Winding wheel · open the sea gate',(32,19,5,4),sign=True,accessFlag='worksGateWon',doneFlag='harborOpened'),control('works-cart',12,29,'Survey cart · folding range sight',(10,25,4,4),sign=True,doneFlag='worksStoresWon'),interaction('works-bram',27,24,'Bram · ferry crews',sprite='bram',hiddenFlag='harborOpened'),interaction('works-bench',17,26,'Pump-house bench · rest',sign=True),interaction('works-refuge',6,31,'West path · railway refuge',sign=True),interaction('works-sanctuary',45,13,'Through the gate · sanctuary bridge',sign=True,accessFlag='harborOpened')],
 {'refuge':(25,29),'gate':(34,25),'sanctuary':(45,20)},
 {'four-harbor':{'nell':(28,27),'orrin':(31,28),'kit':(26,28),'petra':(33,27),'celia':(24,24),'bram':(25,25)},'four-gate':{'nell':(32,25),'orrin':(31,24),'kit':(37,25),'petra':(38,27),'celia':(30,26),'bram':(29,28)}},
 [point('ferry-injury',22,24,sprite='civilian-patient-green',hiddenFlag='harborOpened'),point('deck-worker',30,20,sprite='civilian-dockhand',hiddenFlag='harborOpened'),point('returning-worker',17,32,sprite='civilian-dockhand-rust',requiredFlag='harborOpened')],decor)

sanctuary_f=[[(192,732),(330,712),(350,650),(462,632),(494,450),(616,438),(642,336),(802,320),(986,344),(998,430),(1044,460),(1316,492),(1336,590),(1264,616),(1288,736),(1052,758),(1018,832),(936,856),(958,1008),(640,1008),(608,850),(398,862),(204,826)]]
decor=[('sanctuary-ring',sanctuary(),648,312,456,132,444,{}),('sanctuary-clamp-live',clamp(),144,96,984,504,600,{'hiddenFlag':'signalCut'}),('sanctuary-clamp-cut',clamp(True),144,96,984,504,600,{'requiredFlag':'signalCut'}),('sanctuary-fieldchest',crate(),84,80,482,616,696,{}),('sanctuary-ferry',sanctuary_launch(),192,144,0,688,832,{})]
back=seascape(1536,1008,True)
# Imperial cable rises from the mainland over the eastern bridge.
back.extend([line([(1536,540),(1250,535),(1080,540),(1050,432),(960,410),(850,377)],'#182f41',13),line([(1536,536),(1250,531),(1080,536),(1050,428),(960,406),(850,373)],'#a08e63',5)])
world('sanctuary','The signal sanctuary · the hollow sun','The eastern bridge carries the palace line. The bronze ring watches the coast.',sanctuary_f,[(26,14,15,4)], [
 interaction('sanctuary-patrol',44,28,'Eastern bridge · return-line guards',sprite='guardian-dusk',hiddenFlag='roadGuardWon'),control('sanctuary-cable',43,26,'Copper clamp · disconnect the return line',(41,21,6,4),sign=True,accessFlag='roadGuardWon',doneFlag='signalCut'),interaction('sanctuary-warden',32,19,'The Sanctuary Warden',sprite='sluice-keeper',accessFlag='signalCut',hiddenFlag='sanctuaryWardenWon'),control('sanctuary-record',32,18,'Bronze ring · the covered chart',(29,15,7,3),sign=True,requiredFlag='sanctuaryWardenWon',doneFlag='anchorsKnown'),control('sanctuary-chest',22,29,'Hospice field chest · silver clasp',(20,26,4,3),sign=True,doneFlag='sanctuaryCache'),interaction('sanctuary-bench',17,31,'Old hospice bench · rest',sign=True),interaction('sanctuary-harbor',32,39,'Descending stair · Breakwater harbor',sign=True),control('sanctuary-refuge',11,32,'Ferry landing · railway refuge',(0,29,13,6),sign=True)],
 {'harbor':(32,38),'cable':(40,27)},
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
 bg.extend(arena_lights())
 floor=['<defs><clipPath id="arena-floor"><path d="M0 113H1008V624H0Z"/></clipPath></defs><g clip-path="url(#arena-floor)">',*floor_paint(1008,624,not temple),'</g>']
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
