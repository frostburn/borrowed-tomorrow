"""The old raster's hollow sun: one missing wedge and smaller closed fractures.

All in-world emblems and boss halos share the geometry. Only the sun-form boss
has a suspended shard; surrounding bodies and mechanical housings stay separate.
"""
import json,math
from pathlib import Path

GEOMETRY=json.loads((Path(__file__).resolve().parents[2]/'src/content/hollow-sun.json').read_text())

def edge_polar(angle,outer,inner):
 profile=next((p for p in GEOMETRY['breakEdges']if p[0][0]==angle),None)
 if profile is None:return [(angle,outer),(angle,inner)]
 def at(radius):
  for (a,r),(b,s)in zip(profile,profile[1:]):
   if s<=radius<=r:return (a+(b-a)*(r-radius)/(r-s),radius)
  return (angle,radius)
 return [at(outer)]+[(a,r)for a,r in profile if inner<r<outer]+[at(inner)]

def band_polar(start,end,outer,inner):
 angles=[start]+[a for a in range(-90,361,15)if start<a<end]+[end]
 first=edge_polar(start,outer,inner);last=edge_polar(end,outer,inner)
 return [first[0]]+[(a,outer)for a in angles[1:-1]]+[last[0]]+last[1:-1]+[last[-1]]+[(a,inner)for a in reversed(angles[1:-1])]+[first[-1]]+list(reversed(first[1:-1]))

def ray_angles():
 start,end=GEOMETRY['rimArc']
 # The ray rooted in the missing wedge is missing too; it must not bridge it.
 return [(j,-90+j*360/GEOMETRY['rays'])for j in range(GEOMETRY['rays'])if(-90+j*360/GEOMETRY['rays']-start)%360<=end-start]

def emblem(cx,cy,r,gold='#c2a16b',shade='#967e55',light='#e4cf94',aspect=1):
 def at(a,radius):
  a=math.radians(a)
  return (round(cx+math.cos(a)*radius*r,2),round(cy+math.sin(a)*radius*r*aspect,2))
 def poly(points,color):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="{color}"/>'
 def band(a,b,outer,inner):return [at(angle,radius)for angle,radius in band_polar(a,b,outer,inner)]
 out=['<g data-symbol="hollow-sun">']
 for j,a in ray_angles():
  tip=at(a+GEOMETRY['rayTipOffset'],GEOMETRY['longRayTip']if j%3==0 else GEOMETRY['rayTip'])
  left=at(a-GEOMETRY['rayHalfAngle'],GEOMETRY['rayRoot']);right=at(a+GEOMETRY['rayHalfAngle'],GEOMETRY['rayRoot'])
  out += [poly([left,tip,right],gold),poly([tip,right,at(a+1,1)],shade)]
 start,end=GEOMETRY['rimArc'];divisions=[start]+[a for a in (0,90,180)if start<a<end]+[end]
 for a,b in zip(divisions,divisions[1:]):
  out += [poly(band(a,b,1,GEOMETRY['innerRadius']),gold),poly(band(a,b,1,.94),light if math.cos(math.radians((a+b)/2+135))>.1 else shade)]
 for crack in GEOMETRY['fractures']:
  points=' '.join(f'{x:g},{y:g}'for x,y in [at(a,radius)for a,radius in crack])
  out.append(f'<polyline data-fracture="closed" points="{points}" fill="none" stroke="{shade}" stroke-width="{max(.8,r*GEOMETRY["fractureWidth"]):g}" stroke-linejoin="bevel"/>')
 return ''.join(out)+'</g>'
