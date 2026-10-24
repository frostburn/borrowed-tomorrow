"""Native hollow-sun and exposed-heart atlases, sharing a 360x288 frame."""
import math
from pathlib import Path
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'public/art/vector/benefactor'
GOLD='#c2a16b';PALE='#e2e3cf';INK='#152937';TEAL='#8dc7be';BLUE='#4f7385'
def poly(points,c):return '<polygon points="'+' '.join(f'{x:g},{y:g}'for x,y in points)+f'" fill="{c}"/>'
def ring(cx,cy,r,w,c):return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{c}" stroke-width="{w}"/>'
for form in ['sun','heart']:
 frames=[]
 for i in range(12):
  rise=math.sin(i/8*math.tau)*2 if i<8 else [-3,-6,2,0][i-8];cx=180;cy=139+rise;out=[]
  if form=='sun':
   for j in range(12):
    a=j*math.tau/12+(math.sin(i/8*math.tau)*.04 if i<8 else [0,-.07,.04,0][i-8]);x=math.cos(a);y=math.sin(a);u=(-y,x);r=93
    out += [poly([(cx+x*r+u[0]*13,cy+y*r+u[1]*13),(cx+x*(r+42),cy+y*(r+42)),(cx+x*r-u[0]*13,cy+y*r-u[1]*13)],GOLD)]
   out += [ring(cx,cy,88,19,GOLD),ring(cx-1,cy-3,84,3,PALE),ring(cx,cy,65,4,BLUE),poly([(221,43),(240,59),(191,169),(179,159)],INK),poly([(94,164),(109,152),(157,232),(146,240)],INK)]
   out += [poly([(164,117),(190,106),(207,131),(201,158),(177,175),(155,150)],'#385b6c'),poly([(164,117),(190,106),(176,145),(155,150)],TEAL)]
  else:
   for j in range(8):
    a=j*math.tau/8;x=math.cos(a);y=math.sin(a);out.append(poly([(cx+x*82,cy+y*82),(cx+x*119-y*8,cy+y*119+x*8),(cx+x*126+y*6,cy+y*126-x*6)],GOLD))
   out += [poly([(177,71),(214,99),(226,139),(207,183),(177,210),(143,174),(132,129),(151,92)],BLUE),poly([(177,71),(186,130),(177,210),(143,174),(132,129),(151,92)],TEAL),poly([(177,71),(214,99),(186,130)],PALE),poly([(186,130),(226,139),(207,183),(177,210)],'#476a7b'),poly([(177,80),(184,127),(170,144),(186,161),(178,204),(171,160),(156,140),(171,124)],INK)]
  if i==10:out += [ring(cx,cy,122,4,PALE),ring(cx,cy,134,2,TEAL)]
  frames.append(f'<svg x="{i%2*360}" y="{i//2*288}" width="360" height="288" viewBox="0 0 360 288">'+''.join(out)+'</svg>')
 text='<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1728" viewBox="0 0 720 1728"><title>'+escape('The Benefactor '+form)+'</title>'+''.join(frames)+'</svg>\n'
 (ART/f'benefactor-{form}-motion.svg').write_text(text)
 assert len(text.encode())<131072
 print(form,len(text.encode()),'bytes')
