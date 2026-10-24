"""Native Chapter Five materials; scenery, not another map-wide slab grid.

Individual stones/bricks have short broken joints. Larger patches, working
surfaces and inlays give each location its own construction and wear. Nothing
here changes footing, casts or tactical cells. All variation is deterministic.
"""
import math

def poly(points,color):
 return '<polygon points="'+' '.join(f'{round(x,1):g},{round(y,1):g}'for x,y in points)+f'" fill="{color}"/>'
def line(points,color,width=2):
 return '<polyline points="'+' '.join(f'{round(x,1):g},{round(y,1):g}'for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}"/>'
def ellipse(x,y,rx,ry,color):return f'<ellipse cx="{x:g}" cy="{y:g}" rx="{rx:g}" ry="{ry:g}" fill="{color}"/>'
def rect(x,y,w,h,color):return f'<path d="M{x:g} {y:g}h{w:g}v{h:g}h{-w:g}Z" fill="{color}"/>'
def variation(i,j,n):return ((i*73856093)^(j*19349663)^91771)%n

MATERIALS={
 'airfield':'packed-cinder','airship':'ship-timber','hammerplain':'casting-yard',
 'coolingworks':'waterworks-grating','anchorforge':'heat-brick',
 'dawnwatch':'town-cobbles','watchbarracks':'gun-terrace','signalwall':'watch-slate',
 'observation':'cabin-parquet','windmere':'garden-stone','dispensary':'ward-ceramic',
 'mirrorward':'optical-terrazzo','flagship':'naval-armor',
}

def stones(w,top,bottom,palette,sx=78,sy=42):
 out=[]
 for row,y in enumerate(range(int(top)-sy,int(bottom)+sy,sy)):
  for col,x in enumerate(range(-sx,w+sx,sx)):
   x+=sx//2*(row%2);j=variation(col,row,9)-4
   pts=[(x+4,y+5+j),(x+sx-12,y+2-j),(x+sx-3,y+12),(x+sx-5,y+sy-7),(x+12,y+sy-2),(x+2,y+sy-12)]
   out.append(poly(pts,palette[variation(col,row,len(palette))]))
   if variation(row,col,3)==0:out.append(poly([pts[0],pts[1],pts[2],(x+sx-15,y+8-j),(x+9,y+10+j)],palette[-1]))
 return out

def chips(w,top,bottom,palette,count=130):
 out=[];height=max(1,int(bottom-top))
 for i in range(count):
  x=variation(i,3,max(1,w-20))+10;y=top+variation(i,9,height);s=3+variation(i,5,6)
  out.append(poly([(x,y),(x+s,y-2),(x+s+3,y+2),(x+2,y+5)],palette[i%len(palette)]))
 return out

def radial_paving(cx,cy,edges,palette,grout,yscale=.62,span=math.tau,start=0,block=43):
 """Replace the underlying bond, including its joints, with curved courses."""
 full=span==math.tau;out=[f'<g transform="translate({cx:g} {cy:g}) scale(1 {yscale:g})">']
 # The opaque mortar bed prevents straight brick joints showing through the fan.
 angles=[start+span*i/64 for i in range(65)]
 out.append(poly([(0,0)]+[(math.cos(a)*edges[-1],math.sin(a)*edges[-1])for a in angles],grout))
 for row,(inner,outer)in enumerate(zip(edges,edges[1:])):
  middle=(inner+outer)/2;count=max(5,round(span*middle/block));pitch=span/count
  if full:cuts=[start+(i+(row%2)*.5)*pitch for i in range(count+1)]
  elif row%2:cuts=[start]+[start+(i+.5)*pitch for i in range(count)]+[start+span]
  else:cuts=[start+i*pitch for i in range(count+1)]
  gap=min(.06,1.2/max(12,middle))
  for i,(a,b)in enumerate(zip(cuts,cuts[1:])):
   a+=gap;b-=gap
   if a>=b:continue
   # Several points per edge make a curved brick rather than a straight tile
   # with a decorative circle painted over it. Courses stagger their joints.
   divisions=max(2,math.ceil((b-a)/.14));arc=[a+(b-a)*j/divisions for j in range(divisions+1)]
   pts=[(math.cos(t)*(outer-1.5),math.sin(t)*(outer-1.5))for t in arc]
   pts += [(math.cos(t)*(inner+1.5),math.sin(t)*(inner+1.5))for t in reversed(arc)]
   out.append(poly(pts,palette[variation(i,row,len(palette))]))
 return out+['</g>']

def fan(cx,cy,radius,palette):
 return radial_paving(cx,cy,[*range(0,radius,35),radius],palette,'#777a66',span=math.pi,start=math.pi)

def herringbone(w,top,bottom,palette,ux=34,uy=23):
 # Two perpendicular bricks repeated on the (2,2),(1,-1) lattice.
 out=[]
 for i in range(-30,65):
  for j in range(-70,70):
   x=(2*i+j)*ux;y=(2*i-j)*uy
   if x<-ux*3 or x>w+ux or y<top-uy*3 or y>bottom+uy:continue
   for xx,yy,ww,hh in [(x,y,2*ux,uy),(x+ux,y+uy,ux,2*uy)]:
    out.append(poly([(xx+3,yy+2),(xx+ww-5,yy),(xx+ww-2,yy+4),(xx+ww-3,yy+hh-3),(xx+4,yy+hh-1),(xx+1,yy+hh-6)],palette[variation(i,j+(yy!=y),len(palette))]))
 return out

def plates(w,top,bottom,palette,seed=0):
 out=[];sy=112;sx=236
 for row,y in enumerate(range(int(top)-sy,int(bottom)+sy,sy)):
  for col,x in enumerate(range(-sx,w+sx,sx)):
   x+=82*(row%2);s=variation(row,col+seed,23)-11
   pts=[(x+10,y+10),(x+sx-35,y+2),(x+sx-5,y+26+s),(x+sx-17,y+sy-13),(x+32,y+sy-3),(x+3,y+sy-27)]
   out.append(poly(pts,palette[variation(row,col+seed,len(palette))]))
   out.append(line([pts[0],pts[1],pts[2]],palette[-1],2))
   for xx,yy in [(x+21,y+20),(x+sx-37,y+19),(x+39,y+sy-15),(x+sx-32,y+sy-23)]:out.append(ellipse(xx,yy,2.5,2,palette[-1]))
 return out

def grate(x,y,w,h):
 out=[poly([(x,y),(x+w,y-8),(x+w+14,y+h-8),(x+14,y+h)],'#81958b'),poly([(x+7,y+6),(x+w-5,y-2),(x+w+7,y+h-14),(x+19,y+h-6)],'#46656a')]
 for i in range(12,int(w)-8,14):out.append(line([(x+i,y+7),(x+i+11,y+h-13)],'#8b9e8f',4))
 return out

def timber(w,top,bottom):
 out=[];cx=w*.51;span=bottom-top
 colors=['#967e59','#a28b63','#8d7959','#aa9065','#9c855f']
 for i in range(-24,25):
  near=cx+i*48;far=cx+i*31
  out.append(poly([(far+1,top),(far+29,top+1),(near+46,bottom),(near+2,bottom)],colors[(i+25)%len(colors)]))
  for j in range(2):
   t=.18+j*.48+variation(i,j,8)*.012;yy=top+span*t;xx=far+(near-far)*t
   out.append(line([(xx+4,yy),(xx+35,yy+1)],'#695f49',2))
   out.append(line([(xx+12,yy+13),(xx+10,yy+38),(xx+15,yy+65)],'#b59b6c',1.5))
  if i%4==0:
   yy=top+span*.72;xx=far+(near-far)*.72
   out.append(ellipse(round(xx+23,1),round(yy,1),5,2.5,'#7d6a4e'))
 return out

def crest(cx,cy,r=105):
 out=[ellipse(cx,cy,r,r*.5,'#6e8680'),ellipse(cx,cy,r-7,(r-7)*.5,'#a9a07b'),ellipse(cx,cy,r-12,(r-12)*.5,'#718780')]
 for i in range(8):
  a=i*math.pi/4;c=math.cos(a);s=math.sin(a)
  out.append(poly([(cx+c*(r-20),cy+s*(r-20)*.5),(cx+c*32-s*7,cy+(s*32+c*7)*.5),(cx+c*32+s*7,cy+(s*32-c*7)*.5)],'#b9ab7e'))
 out += [ellipse(cx,cy,22,11,'#b9ab7e'),ellipse(cx,cy,14,7,'#718780')]
 return out

def ceramic(w,top,bottom):
 out=[];sy=40
 colors=['#b5bca5','#afb8a1','#c0c3aa','#a5b39f','#b8bea5']
 for col,x in enumerate(range(-42,w+42,42)):
  for row,y in enumerate(range(int(top)-sy,int(bottom)+sy,sy)):
   y+=(col%2)*sy/2
   pts=[(x-26,y),(x-13,y-18),(x+13,y-18),(x+26,y),(x+13,y+18),(x-13,y+18)]
   out.append(poly(pts,colors[variation(col,row,len(colors))]))
   if variation(col,row,19)==0:out.append(poly([(x-9,y),(x,y-8),(x+9,y),(x,y+8)],'#8da393'))
 return out

def floor_paint(w,h,scene,points,arena=False):
 material=MATERIALS[scene];top=min(p[1]for p in points);bottom=max(p[1]for p in points)
 bases={'packed-cinder':'#7b8273','casting-yard':'#636b60','waterworks-grating':'#566e6c','heat-brick':'#665e50',
  'town-cobbles':'#797d6c','gun-terrace':'#4f6668','watch-slate':'#687775','garden-stone':'#657e6b',
  'ward-ceramic':'#80988b','optical-terrazzo':'#8da69a','ship-timber':'#75684e','cabin-parquet':'#6e6650','naval-armor':'#435d65'}
 out=[f'<desc>{material}: authored working surfaces and short material joints</desc>',rect(0,0,w,h,bases[material])]
 if material=='packed-cinder':
  out += [poly([(0,top+35),(w*.43,top+16),(w*.56,bottom-45),(w*.29,bottom),(0,bottom-35)],'#8b8c77'),poly([(w*.58,top),(w,top+12),(w,bottom),(w*.68,bottom-22)],'#727e70')]
  out += chips(w,top,bottom,['#9c9c83','#667366','#a7a08a','#6f7a6a'],175)
  for x,y in [(w*.28,bottom-90),(w*.69,bottom-170),(w*.8,top+65)]:
   out += [ellipse(x,y,17,7,'#556a65'),ellipse(x,y-1,11,4,'#a6a487'),line([(x-26,y+19),(x+34,y+6),(x+85,y+11)],'#a6a28a',3)]
 elif material=='casting-yard':
  out += herringbone(w,top,bottom,['#7d7e66','#8a826b','#737661','#8d8a70'],40,25)
  out += [poly([(w*.3,top),(w*.54,top+18),(w*.69,bottom),(w*.4,bottom-30)],'#666c5d')]
  out += chips(w,top,bottom,['#555f55','#92917a','#9b8c6c'],85)
  out += fan(w*.23,bottom-28,210,['#9a9478','#a39a7c','#8d8a70'])
 elif material=='waterworks-grating':
  out += plates(w,top,bottom,['#6e8279','#748a80','#627d76','#8c9d89'])
  for x,y,ww,hh in [(w*.17,top+100,250,80),(w*.4,top+185,220,66),(w*.63,top+260,240,85),(w*.78,top+70,190,65)]:out += grate(x,y,ww,hh)
  out += chips(w,top,bottom,['#a3a28a','#7f9b8a','#415f60'],55)
 elif material=='heat-brick':
  out += herringbone(w,top,bottom,['#917a5e','#806c57','#a08867','#8b775e'],35,23)
  # The exploration gantry has a turntable; combat has straight casting rails.
  if not arena:
   cx=w*.52;cy=top+(bottom-top)*.54
   out += radial_paving(cx,cy,[0,42,84,126,168,210,258],['#917a5e','#806c57','#a08867','#8b775e'],'#665e50',yscale=.32)
   for r in (200,240):
    pts=[(cx+math.cos(a/12*math.pi)*r,cy+math.sin(a/12*math.pi)*r*.32)for a in range(25)]
    out += [line(pts,'#59655d',10),line([(x,y-3)for x,y in pts],'#aaa080',3)]
  out += chips(w,top,bottom,['#605c50','#5c6053','#b09a74'],75)
 elif material=='town-cobbles':
  out += stones(w,top,bottom,['#929580','#9e9c83','#a8a187','#898f7a'],64,36)
  for x,y,r in [(w*.23,bottom-15,220),(w*.53,bottom-160,240),(w*.83,bottom-55,180)]:out += fan(x,y,r,['#a29e83','#b1a88c','#97987e'])
 elif material=='gun-terrace':
  out += ['<g transform="skewX(-18)">',*herringbone(round(w+bottom*.33),top,bottom,['#687d78','#738780','#5d7674','#7e8b80'],40,24),'</g>']
  for x in (w*.22,w*.77):
   out += radial_paving(x,top+62,[0,105,139],['#687d78','#738780','#5d7674','#7e8b80'],'#4f6668',yscale=36/105)
   out += [ellipse(x,top+62,105,36,'#4f696b'),ellipse(x,top+59,92,29,'#819085'),line([(x-64,top+61),(x+67,top+55)],'#a6a489',3)]
  out += grate(w*.58,bottom-70,190,36)
 elif material=='watch-slate':
  out += stones(w,top,bottom,['#81918a','#8c998e','#788d85','#9aa18e'],93,48)
  cx=w*.51;cy=top+(bottom-top)*.68;r=88 if arena else 121
  out += radial_paving(cx,cy,[0,r,r+34,r+68],['#81918a','#8c998e','#788d85','#9aa18e'],'#687775',yscale=.5)
  out += crest(cx,cy,r)
 elif material=='garden-stone':
  out += stones(w,top,bottom,['#98aa8e','#a2af91','#92a287','#b0b69a'],76,43)
  for x,y in [(w*.23,bottom-32),(w*.69,bottom-10),(w*.9,top+130)]:
   out += [poly([(x-95,y),(x-57,y-25),(x-10,y-18),(x+47,y-4),(x+84,y+17),(x+20,y+30),(x-55,y+19)],'#7d9778')]
  out += chips(w,top,bottom,['#b7bca1','#c3c6ac','#849d81'],90)
 elif material=='ward-ceramic':
  out += ceramic(w,top,bottom)
  out += [poly([(w*.4,top+140),(w*.61,top+123),(w*.69,bottom-56),(w*.5,bottom-38)],'#8aa493'),line([(w*.42,top+151),(w*.51,bottom-53),(w*.67,bottom-70)],'#c5c7ab',4)]
 elif material=='optical-terrazzo':
  # Arena: col 5 / row 2, with lower footprint contacts on row 3. The
  # renderer's body anchor is (463,286). Its native base center is 23px above it.
  # Exploration: the native engine's base at (684+128,198+217).
  cx,cy=(463,263)if arena else(812,415)
  out += radial_paving(cx,cy,[0,185,330,475,1100],['#a5b8a5','#9bb2a2','#9fb5a2','#aabca7'],'#8da69a',yscale=.65,block=180)
  out += chips(w,top,bottom,['#6c9089','#c7c8ac','#8b9e8d','#b3bca0'],210)
  out.append(f'<g id="ward-floor-inlays" transform="translate({cx:g} {cy:g})">')
  for r in (185,330,475):
   pts=[(math.cos(a/18*math.pi)*r,math.sin(a/18*math.pi)*r*.65)for a in range(37)]
   out += [line(pts,'#6c8d82',8),line(pts,'#c4b98c',3)]
  out.append('</g>')
 elif material=='ship-timber':
  out += timber(w,top,bottom)
  for x,y in [(w*.35,bottom-130),(w*.64,top+130)]:out += [poly([(x-68,y),(x+51,y-4),(x+70,y+66),(x-55,y+75)],'#69776b'),line([(x-57,y+8),(x+42,y+4),(x+59,y+56)],'#c2ae7f',3)]
 elif material=='cabin-parquet':
  out += herringbone(w,top,bottom,['#a28b64','#9a845f','#ad966c','#8e7b5c'],36,24)
  x=w*.52;y=top+(bottom-top)*.55
  out += [poly([(x-210,y),(x+230,y-18),(x+249,y+109),(x-190,y+132)],'#557a77'),poly([(x-194,y+12),(x+216,y-3),(x+233,y+96),(x-179,y+115)],'#aaa17b'),poly([(x-181,y+24),(x+204,y+9),(x+220,y+86),(x-169,y+102)],'#63857c')]
  for i in range(11):out.append(poly([(x-157+i*32,y+47),(x-143+i*32,y+35),(x-128+i*32,y+46),(x-141+i*32,y+58)],'#c3b68c'))
 elif material=='naval-armor':
  out += plates(w,top,bottom,['#718a85','#7d948b','#657f7d','#9aa692'],7)
  out += [poly([(w*.19,bottom-30),(w*.44,bottom-105),(w*.7,bottom-64),(w*.92,bottom-95),(w*.94,bottom-63),(w*.71,bottom-32),(w*.44,bottom-76),(w*.21,bottom)],'#536e76')]
  out += crest(w*.72,top+(bottom-top)*.59,73)
 return out
