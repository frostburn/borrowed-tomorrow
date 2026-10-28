"""Organic sun-serpent geometry at native battle scale. SVG only."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'public/art/vector/chapter-six'
ART.mkdir(parents=True,exist_ok=True)
def svg(name,w,h,body):
 (ART/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{name}</title>{body}</svg>\n')
import sys
sys.path.insert(0,str(ROOT/'assets/vector'))
from sun_serpent import body,spines,head,coil
for name,shift,jaw in [('serpent-head',0,''),('serpent-inhale',-2,'<path d="M143 89L160 91L155 101L147 101Z" fill="#c7b789"/>'),('serpent-fire',-1,'<path d="M139 86L163 86L159 101L145 101Z" fill="#f4deaa"/><path d="M147 100L155 100L163 133L143 133Z" fill="#dfb25f"/>')]:
 svg(name,296,244,body+spines+f'<g transform="translate(0 {shift})">'+head+jaw+'</g>')
svg('serpent-west',128,112,coil)
svg('serpent-east',128,112,'<g transform="translate(128 0) scale(-1 1)">'+coil+'</g>')
svg('serpent-portrait',128,128,'<path d="M0 0H128V128H0Z" fill="#33434f"/><g transform="translate(-102 -15) scale(1.12)">'+head+'</g>')
print('Exported three native serpent head poses, two coils and a portrait.')
