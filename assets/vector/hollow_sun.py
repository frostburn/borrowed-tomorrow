"""Shared hollow-sun emblem: open aperture, twelve broad rays, optional fractures.

Geometry is shared with the live capital reveal and the accepted sun-form boss.
Radii are relative to the outer ring; the suspended boss shard is not an emblem.
"""
import json,math
from pathlib import Path

GEOMETRY=json.loads((Path(__file__).resolve().parents[2]/'src/content/hollow-sun.json').read_text())

def emblem(cx,cy,r,gold='#c2a16b',shade='#967e55',light='#e4cf94',broken=False,aspect=1):
 def at(a,radius):
  a=math.radians(a)
  return (round(cx+math.cos(a)*radius*r,2),round(cy+math.sin(a)*radius*r*aspect,2))
 def poly(points,color):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="{color}"/>'
 def band(start,end,outer,inner):
  angles=[start]+[a for a in range(-90,361,15)if start<a<end]+[end]
  return [at(a,outer)for a in angles]+[at(a,inner)for a in reversed(angles)]
 out=['<g data-symbol="hollow-sun">']
 for j in range(GEOMETRY['rays']):
  a=-90+j*360/GEOMETRY['rays'];tip=at(a+GEOMETRY['rayTipOffset'],GEOMETRY['longRayTip']if j%3==0 else GEOMETRY['rayTip'])
  left=at(a-GEOMETRY['rayHalfAngle'],GEOMETRY['rayRoot']);right=at(a+GEOMETRY['rayHalfAngle'],GEOMETRY['rayRoot'])
  out += [poly([left,tip,right],gold),poly([tip,right,at(a+1,1)],shade)]
 for start,end in GEOMETRY['fracturedArcs']if broken else [(-90,270)]:
  divisions=[start]+[a for a in (0,90,180)if start<a<end]+[end]
  for a,b in zip(divisions,divisions[1:]):
   out += [poly(band(a,b,1,GEOMETRY['innerRadius']),gold),poly(band(a,b,1,.94),light if math.cos(math.radians((a+b)/2+135))>.1 else shade)]
 return ''.join(out)+'</g>'
