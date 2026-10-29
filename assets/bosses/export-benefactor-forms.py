"""Native hollow-sun and exposed-heart atlases, sharing a 360x288 frame."""
import math,sys
from pathlib import Path
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'public/art/vector/benefactor'
sys.path.insert(0,str(ROOT/'assets/vector'))
from hollow_sun import GEOMETRY,band_polar,edge_polar,ray_angles
GOLD='#c2a16b';PALE='#e2e3cf';INK='#152937';TEAL='#8dc7be';BLUE='#4f7385'
def poly(points,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="{c}"/>'
def ring(cx,cy,r,w,c):return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{c}" stroke-width="{w}"/>'
def hollow_sun(i,cx,cy):
 """A deep broken corona: gaps are transparent, never painted-on slashes."""
 pulse=math.sin(i/8*math.tau) if i<8 else [-.5,-1,1,0][i-8]
 radius=1+pulse*.012;inner=100*GEOMETRY['innerRadius']
 def at(a,r):
  a=math.radians(a)
  return (round(cx+math.cos(a)*r*radius,1),round(cy+math.sin(a)*r*radius,1))
 def band(start,end,outer,inner,shift=(0,0)):
  points=[at(a,r*100)for a,r in band_polar(start,end,outer/100,inner/100)]
  return [(round(x+shift[0],1),round(y+shift[1],1))for x,y in points]
 out=[];arcs=[GEOMETRY['rimArc']]
 # A back plane and fracture end faces give the ring material thickness.
 for start,end in arcs:
  out.append(poly(band(start,end,100,inner,(4,6)),'#665c4b'))
 for j,a in ray_angles():
  root=at(a-GEOMETRY['rayHalfAngle'],GEOMETRY['rayRoot']*100);tip=at(a+GEOMETRY['rayTipOffset'],100*(GEOMETRY['longRayTip']if j%3==0 else GEOMETRY['rayTip']));end=at(a+GEOMETRY['rayHalfAngle'],GEOMETRY['rayRoot']*100)
  out += [poly([(x+3,y+5)for x,y in [root,tip,end]],'#78664a'),poly([root,tip,end],GOLD),poly([tip,end,at(a+1,100)],'#967e55')]
 for start,end in arcs:
  for a in [start,end]:
   edge=[at(angle,r*100)for angle,r in edge_polar(a,1,GEOMETRY['innerRadius'])]
   out.append(poly(edge+[(x+4,y+6)for x,y in reversed(edge)],'#8b7b60'))
  # Broad angled sectors retain planar lighting, without tracing every facet.
  divisions=[start]+[a for a in [0,90,180,270]if start<a<end]+[end]
  for a,b in zip(divisions,divisions[1:]):
   lit=math.cos(math.radians((a+b)/2+135))>.1
   out += [poly(band(a,b,100,94),'#e4cf94'if lit else '#aa8e5f'),poly(band(a,b,94,78),'#ceb17a'if lit else '#ac8f60'),poly(band(a,b,78,inner),'#727d78'if lit else '#465a63')]
 # Fine closed seams weather a continuous rim, instead of removing whole sectors.
 for crack in GEOMETRY['fractures']:
  points=' '.join(f'{x:g},{y:g}'for x,y in [at(a,r*100)for a,r in crack])
  out.append(f'<polyline data-fracture="closed" points="{points}" fill="none" stroke="#756e60" stroke-width="{100*GEOMETRY["fractureWidth"]:g}" stroke-linejoin="bevel"/>')
 # A small suspended fragment, with a recessed fracture, leaves the aperture hollow.
 dy=pulse*1.5
 def shard(points,c):return poly([(x,y+dy)for x,y in points],c)
 out += [shard([(176,111),(194,122),(202,143),(184,166),(163,149),(161,131)],'#4f7385'),shard([(176,111),(181,137),(163,149),(161,131)],TEAL),shard([(176,111),(194,122),(181,137)],PALE),shard([(181,137),(194,122),(202,143),(184,166)],'#385768'),shard([(181,126),(178,139),(183,145),(180,155),(174,144)],'#294453')]
 return out

# Eight native poses: a strong beat, a smaller answering beat, then rest.
HEART_BEATS=[0,1,.2,.6,.1,0,0,0]
def exposed_heart(i):
 beat=HEART_BEATS[i] if i<8 else [.3,1.3,1,.2][i-8]
 # Each rigid half rocks subtly about its own center of mass.
 # Distinct central pivots let the crack shear rather than hinge at one tip.
 angle=round(2*beat,3)
 left=[poly([(177,71),(151,92),(132,129),(143,174),(177,210),(178,204),(171,160),(156,140),(171,124),(177,80)],TEAL),poly([(177,80),(171,124),(156,140),(171,160),(178,204),(173,163),(161,140),(175,124)],'#385b6c')]
 right=[poly([(177,71),(214,99),(226,139),(207,183),(177,210),(178,204),(186,161),(170,144),(184,127),(177,80)],BLUE),poly([(177,71),(214,99),(184,127),(177,80)],PALE),poly([(184,127),(226,139),(207,183),(177,210),(178,204),(186,161),(170,144)],'#476a7b')]
 return [f'<g data-heart-half="left" transform="rotate({-angle:g} 155 138)">'+''.join(left)+'</g>',f'<g data-heart-half="right" transform="rotate({angle:g} 199 148)">'+''.join(right)+'</g>']

for form in ['sun','heart']:
 frames=[]
 for i in range(12):
  rise=math.sin(i/8*math.tau)*2 if i<8 else [-3,-6,2,0][i-8];cx=180;cy=139+(rise if form=='sun' or i>=8 else 0);out=[]
  if form=='sun':
   out += hollow_sun(i,cx,cy)
  else:
   for j in range(8):
    a=j*math.tau/8;x=math.cos(a);y=math.sin(a);out.append(poly([(cx+x*82,cy+y*82),(cx+x*119-y*8,cy+y*119+x*8),(cx+x*126+y*6,cy+y*126-x*6)],GOLD))
   out += exposed_heart(i)
  if i==10:out += [ring(cx,cy,122,4,PALE),ring(cx,cy,134,2,TEAL)]
  frames.append(f'<svg x="{i%2*360}" y="{i//2*288}" width="360" height="288" viewBox="0 0 360 288">'+''.join(out)+'</svg>')
 text='<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1728" viewBox="0 0 720 1728"><title>'+escape('The Benefactor '+form)+'</title>'+''.join(frames)+'</svg>\n'
 (ART/f'benefactor-{form}-motion.svg').write_text(text)
 assert len(text.encode())<131072
 print(form,len(text.encode()),'bytes')
