"""Create registration and joint-position references for Image Gen, not game art.
Usage: python3 scripts/character-walk-guides.py OUTPUT_DIRECTORY
"""
import sys
from PIL import Image, ImageDraw
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'public/art'
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
# Six explicit joint layouts, in anatomical left/right order. These are pose diagrams,
# not game art. Art is supplied by Image Gen against this registration reference.
side=[([(40,44),(32,54),(25,65)],[(40,44),(47,55),(53,65)]), ([(40,44),(36,55),(36,65)],[(40,44),(48,52),(48,59)]), ([(40,44),(45,55),(49,65)],[(40,44),(35,52),(38,59)]), ([(40,44),(47,55),(53,65)],[(40,44),(32,54),(25,65)]), ([(40,44),(48,52),(48,59)],[(40,44),(36,55),(36,65)]), ([(40,44),(35,52),(38,59)],[(40,44),(45,55),(49,65)])]
front=[([(44,43),(45,54),(45,65)],[(35,43),(34,51),(34,55)]), ([(44,43),(44,54),(44,64)],[(35,43),(33,51),(32,57)]), ([(44,43),(44,54),(45,65)],[(35,43),(36,48),(36,57)]), ([(44,43),(45,51),(45,55)],[(35,43),(34,54),(34,65)]), ([(44,43),(46,51),(47,57)],[(35,43),(35,54),(35,64)]), ([(44,43),(43,48),(43,57)],[(35,43),(35,54),(34,65)])]
for hero in ('nell','orrin'):
 for direction in ('front','left','right','back'):
  idle=Image.open(root/f"{hero}{'' if direction=='front' else '-'+direction}.png").convert('RGBA')
  body=idle.copy();erase=ImageDraw.Draw(body);erase.rectangle((31,44,49,79),fill=(0,0,0,0))
  sheet=Image.new('RGBA',(960,640))
  for phase in range(6):
   frame=Image.new('RGBA',(80,80));d=ImageDraw.Draw(frame)
   legs=side[phase] if direction in ('left','right') else front[phase]
   order=(1,0) if direction in ('left','front') else (0,1)
   for leg in order:
    points=legs[leg]
    if direction=='right':points=[(80-x,y) for x,y in points]
    if direction=='back':points=[(80-x,y) for x,y in front[(phase+3)%6][leg]]
    hip,knee,ankle=points;near=leg==order[-1]
    color='#384657' if near else '#27313d';boot='#9a5c2d' if near else '#653b22'
    d.line((hip,knee),fill=color,width=8);d.ellipse((knee[0]-3,knee[1]-3,knee[0]+3,knee[1]+3),fill=color)
    bootstart=(round(knee[0]+(ankle[0]-knee[0])*.45),round(knee[1]+(ankle[1]-knee[1])*.45))
    d.line((knee,ankle),fill=color,width=7);d.line((bootstart,ankle),fill=boot,width=7)
    ax,ay=ankle
    if direction=='left':d.rectangle((ax-6,ay-2,ax+3,ay+2),fill=boot)
    elif direction=='right':d.rectangle((ax-3,ay-2,ax+6,ay+2),fill=boot)
    else:d.rectangle((ax-4,ay-2,ax+3,ay+2),fill=boot)
   frame.alpha_composite(body)
   sheet.alpha_composite(frame.resize((240,240),Image.Resampling.NEAREST),(phase%3*320+40,phase//3*320+40))
  sheet.save(out/f'{hero}-{direction}-guide.png')
