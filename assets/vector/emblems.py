"""Refresh only the registered emblems inside editable Chapter One originals.

Run before compiling the affected chapter maps; surrounding traced art stays put.
"""
import re
from pathlib import Path
from hollow_sun import emblem

ART=Path(__file__).resolve().parents[2]/'public/art/vector/scenery'
for name,id,cx,cy,r in [('collector-machine','collector-sun',60,32,18.5),('sun-mural','mural-sun',72,66,24)]:
 path=ART/f'{name}.svg';source=path.read_text()
 symbol=emblem(cx,cy,r,gold='#bd945a',shade='#895e48',light='#d5c9a0').replace('<g data-symbol=',f'<g id="{id}" data-symbol=')
 if name=='collector-machine':
  # This is a cut-out in a brass housing, with a dark mechanical recess behind
  # it. Without that recess the same-color housing visually fills the aperture.
  symbol=symbol.replace('>',f'><ellipse cx="{cx}" cy="{cy}" rx="20" ry="20" fill="#253e48"/>',1)
 updated,count=re.subn(rf'<g id="{id}" data-symbol="hollow-sun">.*?</g>',symbol,source,flags=re.S)
 assert count==1,f'Missing unique emblem slot: {path}'
 path.write_text(updated)

# Change only the halo in the editable god/registered portrait. All other named
# body parts, identity, articulation and the original portrait framing survive.
root=Path(__file__).resolve().parents[2]
for relative in ['public/art/vector/benefactor/benefactor.svg','public/art/vector/portrait-benefactor.svg']:
 path=root/relative;source=path.read_text()
 halo=' <g id="halo">\n  '+emblem(180,90,64,gold='#d0ab68',shade='#a58050',light='#edcf8c')+'\n </g>'
 updated,count=re.subn(r' <g id="halo">.*?(?=\n <g id="body-back">)',halo,source,flags=re.S)
 assert count==1,f'Missing unique halo: {path}'
 path.write_text(updated)
