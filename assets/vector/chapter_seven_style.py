"""Angular domain surfaces, remembered architecture and registered lighting.

Only the outer boundary receives a cutaway. The same polygons author navigation;
small material joints belong to each place, not a common full-screen slab grid.
"""
import json,math
from pathlib import Path
from chapter_six_floors import boards,earth,ice,courses
from scene_lighting import spill
ROOT=Path(__file__).resolve().parents[2]
LIGHTS=json.loads((ROOT/'src/content/chapter-seven/lighting.json').read_text())
OUTLINES={
 'hollowsill':[(386,638),(660,620),(678,438),(882,426),(900,618),(1146,636),(1170,878),(972,904),(754,880),(546,902),(396,878)],
 'takenwater':[(216,806),(330,794),(344,666),(608,648),(624,440),(918,428),(940,644),(1194,670),(1212,880),(985,904),(754,882),(474,905),(344,878),(218,874)],
 'firstfield':[(216,806),(382,790),(398,668),(560,648),(580,438),(970,426),(994,650),(1196,674),(1214,878),(1014,902),(764,882),(474,904),(382,878),(218,872)],
 'quietward':[(244,806),(330,792),(348,620),(586,600),(604,414),(946,402),(966,600),(1194,620),(1216,880),(974,904),(746,884),(472,906),(344,884),(246,878)],
 'seasonstreet':[(194,806),(330,790),(348,644),(562,622),(580,414),(994,402),(1016,544),(1336,540),(1350,654),(1196,680),(1212,880),(982,904),(754,882),(474,904),(330,878),(196,872)],
 'lastrefuge':[(290,806),(330,788),(350,618),(634,600),(652,440),(900,428),(918,600),(1194,624),(1214,880),(986,906),(752,884),(468,906),(342,882),(292,874)],
 'sunthrone':[(290,806),(428,788),(448,618),(562,600),(580,414),(970,402),(992,600),(1122,620),(1146,878),(976,906),(754,882),(556,906),(434,878),(292,872)],
}
ARENA=[(72,78),(330,68),(510,82),(708,68),(888,82),(906,444),(704,460),(490,446),(280,462),(72,446)]
FIXTURES={
 'hollowsill':[(492,774),(1052,780)],'takenwater':[(422,790),(1114,776)],
 'firstfield':[(510,792),(1102,774)],'quietward':[(574,790),(1112,798)],
 'seasonstreet':[(460,800),(1134,796)],'lastrefuge':[(714,776),(1090,814)],
 'sunthrone':[(508,782),(1060,780)],
}
def poly(p,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in p)+f'" fill="{c}"/>'
def line(p,c,w=2):return '<polyline points="'+' '.join(f'{x:g},{y:g}'for x,y in p)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def rect(x,y,w,h,c):return poly([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],c)
def path(p):return 'M'+' L'.join(f'{x:g},{y:g}'for x,y in p)+'Z'
def inside(p,x,y):
 result=False
 for (ax,ay),(bx,by)in zip(p,p[1:]+p[:1]):
  if(ay>y)!=(by>y)and x<(bx-ax)*(y-ay)/(by-ay)+ax:result=not result
 return result
def cells(p,w=64,h=42):return [3 if inside(p,x*24+12,y*24+12)else 0 for y in range(h)for x in range(w)]
def clipped(name,p,body):return [f'<defs><clipPath id="{name}"><path d="{path(p)}"/></clipPath></defs><g clip-path="url(#{name})">',*body,'</g>']
def lean(body,ground,shear=.035):return [f'<g transform="matrix(1 0 {shear} 1 {-ground*shear} 0)">',*body,'</g>']
def masonry(w,h):
 # Split basalt plates with short, staggered seams and sparse bronze channels.
 out=courses(w,h,['#4b6470','#657e87','#6c858b','#617b86'])
 for x,y in [(390,725),(960,699),(674,820)]:out.extend([poly([(x,y),(x+100,y-8),(x+120,y+26),(x+16,y+32)],'#7c9294'),line([(x+8,y+6),(x+96,y),(x+108,y+20)],'#9ca9a2',2)])
 return out

def material(scene,w,h,arena=False):
 if scene in ('hollowsill','takenwater'):
  out=boards(w,h,frost=True)
  # Reclaimed deck planks meet the suspended stone approach, with real rails.
  if not arena:
   out.extend(clipped('pier-stone',[(600,380),(958,380),(958,678),(600,678)],masonry(w,h)))
  else:out=masonry(w,h)
  if scene=='takenwater':
   y=310 if arena else 735
   for x in range(80 if arena else 290,w-140,72):out.append(poly([(x,y-11),(x+37,y-15),(x+48,y+34),(x+8,y+38)],'#625d55'))
   for yy in (y,y+28):out.extend([line([(80 if arena else 270,yy+12),(w-130,yy-7)],'#38505d',7),line([(80 if arena else 270,yy+8),(w-130,yy-11)],'#a4b6b2',3)])
  return out
 if scene=='firstfield':
  out=[p.replace('#788463','#9c966d').replace('#7f8964','#aaa179').replace('#8d9470','#b2aa80').replace('#6e7e5c','#8e926e').replace('#9da07a','#c4b88a')for p in earth(w,h)]
  # A harvested track; remaining furrows bend as straight facets around it.
  if arena:out.extend(clipped('frost',[(0,0),(420,0),(376,260),(128,352),(0,328)],ice(w,h,True)))
  for i in range(8):
   y=(145 if arena else 640)+i*25
   out.extend([line([(80,y+20),(w*.31,y+5),(w*.44,y-14)],'#898867',2),line([(w*.62,y),(w-85,y-23)],'#c0b78c',2)])
  return out
 if scene=='quietward':
  out=courses(w,h,['#839b98','#adbdb1','#b9c6b6','#b1bfb0'])
  # Small glazed tesserae frame a clear treatment aisle, not enormous slabs.
  for x in (128,w-144)if arena else(540,990):
   for y in range(40,h,25):out.extend([poly([(x,y),(x+12,y+6),(x,y+13),(x-12,y+7)],'#718f88'),poly([(x,y+3),(x+5,y+6),(x,y+10),(x-5,y+7)],'#d4cfac')])
  return out
 if scene=='seasonstreet':
  # A sharp diagonal join of actual ice and terracotta materials. No flat patches.
  out=courses(w,h,['#93755e','#b68d6b','#c19a77','#ae8769'])
  boundary=[(0,0),(w*.57,0),(w*.49,h*.48),(w*.60,h*.68),(w*.40,h),(0,h)]
  out.extend(clipped('winter',boundary,ice(w,h,True)))
  out.append(line([(w*.49,h*.48),(w*.60,h*.68),(w*.40,h)],'#edf0de',4))
  # The courier stair is bamboo, carried in from Iria with its ropes.
  if not arena:out.extend(clipped('river-stair',[(1016,544),(1336,540),(1350,654),(1196,680),(1020,661)],boards(w,h,bamboo=True)))
  return out
 if scene=='lastrefuge':
  out=[p.replace('#ad9165','#a78f68').replace('#967d55','#a08a65')for p in boards(w,h)]
  for i in range(30):
   x=(i*179+40)%w;y=(i*137+20)%h;out.extend([line([(x,y),(x+28,y-1),(x+46,y+2)],'#c0a67c',1.5),rect(x+3,y+5,2,2,'#746e57')])
  for x,y in [(400,690),(760,780),(1040,774)]:out.extend([poly([(x,y),(x+120,y-6),(x+130,y+55),(x+8,y+62)],'#84988a'),line([(x+9,y+7),(x+112,y+2),(x+120,y+48),(x+16,y+54),(x+9,y+7)],'#d1bb8c',3)])
  return out
 # The throne's facets converge at the god's own mounting, without a brick grid.
 cx,cy=(482,188)if arena else(768,566)
 out=[rect(0,0,w,h,'#5d7882')]
 for i in range(12):
  a=i*math.tau/12;b=(i+1)*math.tau/12
  out.append(poly([(cx,cy),(cx+math.cos(a)*1800,cy+math.sin(a)*1000),(cx+math.cos(b)*1800,cy+math.sin(b)*1000)],['#657e87','#718b91','#5f7a85'][i%3]))
 for dx in (-118,118):out.append(line([(cx+dx,cy+26),(cx+dx*1.8,h)],'#9f9f87',3))
 return out

def floor_art(scene,arena=False):
 pts=ARENA if arena else OUTLINES[scene];w,h=(1024,480)if arena else(1536,1008)
 out=[]
 # Depth faces go behind the top surface and only along the outer lower edge.
 for a,b in zip(pts,pts[1:]+pts[:1]):
  if b[0]<a[0]:out.extend([poly([b,a,(a[0]-7,a[1]+24),(b[0]+7,b[1]+24)],'#726951'if scene=='firstfield'else'#36505f'),poly([b,(b[0]+7,b[1]+24),(b[0]+16,b[1]+17)],'#597580')])
 out.extend(clipped('floor',pts,material(scene,w,h,arena)))
 for a,b in zip(pts,pts[1:]+pts[:1]):
  if b[0]<a[0]:out.append(line([a,b],'#abb6a6',3))
 return out

def fixture(indoor=False):
 out=[poly([(4,143),(35,141),(44,148),(1,148)],'#5e787b'),line([(23,141),(19,45)],'#7c9290',5),line([(21,140),(17,45)],'#a9b7a2',2)]
 if not indoor:out.extend([poly([(8,42),(14,15),(31,12),(39,38),(32,56),(14,55)],'#a4ac8e'),poly([(13,40),(17,22),(28,20),(33,40),(28,49),(18,49)],'#f1d3a2')])
 else:out.extend(['<ellipse cx="23" cy="30" rx="13" ry="20" fill="#dadac0"/>',poly([(17,20),(23,12),(22,42),(17,41)],'#fff1cf'),line([(11,51),(36,49)],'#b7b397',4)])
 return out

def spill_art(entries,pts):return clipped('light-floor',pts,[spill([(Path(e['url']).stem,e['x'],e['y'])for e in entries],LIGHTS['props'])])

def arena(scene):
 out=[rect(0,0,1024,480,'#243c50'),poly([(0,0),(1024,0),(1024,135),(831,93),(681,136),(470,92),(244,123),(0,88)],'#36596c')]
 if scene=='firstfield':
  for x in range(20,1024,35):out.extend([line([(x,115),(x+9,39)],'#b7aa7e',3),poly([(x+9,39),(x,58),(x+10,54),(x+17,65)],'#d6c192')])
 if scene=='quietward':
  for x in (18,912):out.extend([rect(x,0,94,172,'#72958e'),poly([(x,3),(x+44,19),(x+94,0),(x+90,11),(x+44,29),(x+3,13)],'#b9c8b6'),rect(x+12,41,15,94,'#b0c5b4')])
 out.extend(floor_art(scene,True))
 for x in (104,870):
  out.extend([f'<g transform="translate({x-23} 14)">',*fixture(scene=='quietward'),'</g>'])
  out.append(f'<ellipse cx="{x}" cy="172" rx="64" ry="20" fill="#d7bf8d" opacity=".12"/>')
 return out
