"""Regional surface materials. Geometry is native SVG; no image resampling.

The court/observatory courses radiate from their actual instruments. Circular
courses replace straight joints rather than drawing rings over a brick grid.
"""
import math

def poly(p,c):return '<polygon points="'+' '.join(f'{x:.1f},{y:.1f}'for x,y in p)+f'" fill="{c}"/>'
def line(p,c,w=2):return '<polyline points="'+' '.join(f'{x:.1f},{y:.1f}'for x,y in p)+f'" fill="none" stroke="{c}" stroke-width="{w}"/>'
def rect(x,y,w,h,c):return poly([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],c)

def courses(w,h,palette):
 # Small dressed stones, straight courses and skewed ends, without a giant grid.
 out=[rect(0,0,w,h,palette[0])]
 for row,y in enumerate(range(0,h,54)):
  for col,x in enumerate(range(-90+(row%2)*45,w,91)):
   d=((row*7+col*11)%9)-4
   out.append(poly([(x+3,y+2),(x+86,y+2),(x+88+d,y+51),(x+5+d,y+51)],palette[1+(row*3+col*5)%3]))
 return out

def radial(w,h,cx,cy,palette):
 out=[rect(0,0,w,h,palette[0])]
 # Elliptical perspective is shared by the instrument base and its masonry.
 for ring in range(0,22):
  inner=ring*66;outer=inner+64;count=max(8,round((inner+33)*math.tau/100));offset=(ring%2)*math.pi/count
  for i in range(count):
   a=i*math.tau/count+offset+.009;b=(i+1)*math.tau/count+offset-.009
   pts=[(cx+math.cos(t)*r,cy+math.sin(t)*r*.58)for r,t in [(inner,a),(outer,a),(outer,b),(inner,b)]]
   # Omit pieces wholly outside the image, keeping the authored SVG small.
   if max(p[0]for p in pts)<0 or min(p[0]for p in pts)>w or max(p[1]for p in pts)<0 or min(p[1]for p in pts)>h:continue
   out.append(poly(pts,palette[1+(ring+i*3)%3]))
 return out

def boards(w,h,frost=False,bamboo=False):
 colors=['#967d55','#ad9165','#a0895e']if not frost else ['#8a9d9e','#9dadac','#879b9f']
 out=[rect(0,0,w,h,'#61705e'if bamboo else'#657778')]
 for i,y in enumerate(range(-24,h+40,29 if bamboo else 34)):
  step=29 if bamboo else 34
  for j,x in enumerate(range(-220+(i%3)*68,w,218)):
   a=y-x*.018;b=y-(x+218)*.018
   out.append(poly([(x+2,a),(x+216,b),(x+216,b+step-2),(x+2,a+step-2)],colors[(i+j)%3]))
   if (i+j)%3==0:out.append(line([(x+38,a+14),(x+112,a+12),(x+152,a+13)],'#81938c'if frost else'#b49a6a',1.5))
 if bamboo:
  for x in range(70,w,220):out.append(line([(x,0),(x+30,h)],'#b7aa7b',3))
 return out

def earth(w,h):
 out=[rect(0,0,w,h,'#788463')]
 for i in range(23):
  x=(i*257+60)%w;y=(i*173+130)%h
  out.extend([poly([(x-73,y),(x-20,y-34),(x+84,y-12),(x+48,y+23),(x-49,y+28)],['#7f8964','#8d9470','#6e7e5c'][i%3]),line([(x-40,y+18),(x+13,y+4),(x+46,y+8)],'#9da07a',2)])
 return out

def ice(w,h,snow=False):
 out=[rect(0,0,w,h,'#c6d9d9'if snow else'#9fbfc8')]
 # Broad offset facets, with sparse fractures rather than a rectangular slab grid.
 for row,y in enumerate(range(-120,h,170)):
  for col,x in enumerate(range(-200,w,240)):
   dx=55 if row%2 else-32
   out.append(poly([(x+dx,y),(x+236+dx,y+13),(x+270-dx,y+163),(x+31-dx,y+150)],['#cedddc','#bfd4d7','#d9e3dd'][col%3]if snow else['#a8cbd0','#b6d4d7','#96bbc7'][(row+col)%3]))
 for i in range(8):
  x=(i*197+100)%w;y=(i*113+40)%h
  out.extend([line([(x-40,y-15),(x,y),(x+19,y+27),(x+71,y+43)],'#e5eae1',3),line([(x,y),(x+28,y-18)],'#7cabbc',1.5)])
 if snow:
  for x,y in [(150,660),(660,800),(1000,460),(1280,730)]:out.append(poly([(x-65,y),(x,y-23),(x+98,y-12),(x+72,y+16),(x-30,y+20)],'#e5e9de'))
 return out

def marble(w,h,center=None):
 colors=['#bac9ca','#dce2d9','#e7e8df','#d5ded7']
 out=radial(w,h,*center,colors)if center else courses(w,h,colors)
 for i in range(12):
  x=(i*223+70)%w;y=(i*139+80)%h
  out.append(line([(x-37,y),(x-6,y+11),(x+13,y+6),(x+55,y+28)],'#c3d0ca',1.4))
 return out

def floor_paint(w,h,scene,arena=False):
 name=scene.removeprefix('battle-')
 if name in ('outermooring','riverhaven','river-patrol','river-cache'):return boards(w,h,bamboo=name!='outermooring')
 if name in ('rainhouse','rainhouse-guard'):
  out=boards(w,h,bamboo=True)
  out.extend([poly([(565,520),(995,502),(1051,678),(603,701)],'#75836a'),line([(585,534),(981,518),(1027,664),(615,685),(585,534)],'#b4b390',5)]if not arena else[])
  return out
 if name=='canopy':
  return earth(w,h)+['<defs><clipPath id="bridge"><path d="M624 648H960V744H624Z"/></clipPath></defs><g clip-path="url(#bridge)">',*boards(w,h,bamboo=True),'</g>']
 if name in ('bellharbor','north-watch'):return boards(w,h,frost=True)
 if name in ('glacier','north-hunters','north-cache'):return ice(w,h)
 if name=='frostwatch':return ice(w,h,True)
 if name in ('wintershrine','winter-dragon'):
  return ice(w,h)+[line([(w*.5-110,190 if arena else 489),(w*.5,154 if arena else 449),(w*.5+105,194 if arena else 489)],'#dfebe2',5)]
 if name in ('capitalquay','stillcity','lastpalace','crown','capital-procession','palace-command','capital-hunters','imperial-vessel','lightbearer'):
  center=(w*.5,142)if arena else(780,500)if name=='crown'else(780,348)if name=='lastpalace'else None
  out=marble(w,h,center)
  if name in ('lastpalace','crown'):
   out.extend([line([(620,440),(624,586),(544,798),(782,840),(1032,794),(936,586),(936,440)],'#b9ae89',4),line([(634,442),(638,588),(565,786),(782,826),(1011,782),(922,588),(922,442)],'#eef0e3',3)])
  return out
 sand=['#9b7e5c','#bd9c70','#c6a77d','#b99a70']
 if name=='namar':
  out=earth(w,h)
  out=[p.replace('#788463','#c0a47c').replace('#7f8964','#c8ad83').replace('#8d9470','#cab38b').replace('#6e7e5c','#b99b74').replace('#9da07a','#d6bd94')for p in out]
  # Dressed stone belongs to the upper exchange and canal crossing. The market
  # apron stays sand-scoured, with local paving and woven awning-side mats.
  out.extend(['<defs><clipPath id="exchange"><path d="M460 390H1460V545H862V722H696V545H460Z"/></clipPath></defs><g clip-path="url(#exchange)">',*courses(w,h,sand),'</g>'])
  for x,y in [(134,561),(315,558)]:
   out.extend([poly([(x,y),(x+136,y-5),(x+142,y+70),(x+4,y+76)],'#9f755a'),line([(x+8,y+8),(x+128,y+4),(x+133,y+61),(x+12,y+67),(x+8,y+8)],'#d4b584',3)])
  return out
 if name in ('observatory','sun-serpent'):return radial(w,h,470 if arena else 768,116 if arena else 360,sand)
 if name in ('sunpalace','palace-gallery'):
  out=radial(w,h,570 if not arena else 504,649 if not arena else 220,['#a18e70','#d3ba8b','#c8ae7f','#d9c294'])
  # Glazed geometric border, fitted to the court rather than floating ornament.
  if not arena:
   out.extend([line([(306,558),(492,472),(1030,472),(1242,570),(1224,746),(902,758),(762,830),(622,762),(292,750),(306,558)],'#63918a',7)])
  return out
 if name in ('skywalk','desert-ascent'):
  return courses(w,h,['#996f59','#b98162','#c58e6c','#ba8465'])+[poly([(336,684),(523,675),(567,775),(332,792)],'#c5a37b')]if not arena else courses(w,h,['#996f59','#b98162','#c58e6c','#ba8465'])
 return courses(w,h,sand)
