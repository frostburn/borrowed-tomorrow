"""Nell’s portable medical cot and faint pose, in the native actor frame."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/"public/art/vector"
def svg(w,h,body):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>\n'
def poly(pts,c):return f'<polygon points="{pts}" fill="{c}"/>'
def line(pts,c,w=2):return f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="{w}"/>'
source=(OUT/'nell.svg').read_text()
source=re.sub(r'^<svg[^>]*>|</svg>\s*$','',source)
# Change exposed skin only. Keep her cap, braids, clothes and lantern intact.
healthy=source
source=source.replace('#d49c70','#d8ae8d')
# Preserve the accepted actor's 2:1 SVG proportions before reclining it.
body='<g transform="translate(8 74) rotate(-90) scale(.72)"><g transform="scale(2 1)">'+source+'</g></g>'
(OUT/'nell-faint.svg').write_text(svg(80,80,body))
bed=poly('2,32 66,29 77,45 73,66 8,66 2,52','#9c8969')+poly('8,52 73,51 73,66 8,66','#687e78')+poly('8,66 15,66 14,75 9,75','#526a69')+poly('64,66 72,66 71,75 66,75','#526a69')+poly('4,33 64,31 72,47 67,59 9,58','#c5c6aa')
pillow=poly('6,34 26,32 31,49 8,52','#ded4b1')
blanket=poly('31,34 65,36 70,55 30,55 25,48','#607e7c')+poly('31,34 65,36 65,42 30,40','#aab9a3')
(OUT/'nell-ill.svg').write_text(svg(80,80,pillow+body+blanket))
(OUT/'nell-bed.svg').write_text(svg(80,80,bed+pillow+body+blanket+line('7,59 72,59','#b8b493',3)))
# The treatment scene restores her colour while she is still on its own cot.
recovered=body.replace(source,healthy)
(OUT/'nell-recovered.svg').write_text(svg(80,80,pillow+recovered+blanket))

# Derive illness variants without rewriting any editable portrait original.
skin={'#b58261':'#bd9275','#96674f':'#a07b63','#c99571':'#d1a585',
      '#a7745a':'#b18a71','#e1b68c':'#e6c4a4','#ce9872':'#d0a183',
      '#b17b5c':'#b98e72','#895d49':'#916f5b','#975f51':'#a17568'}
for expression in ('','happy','worried','sad','angry','surprised','bashful'):
 suffix=f'-{expression}' if expression else ''
 portrait=(OUT/f'portrait-nell{suffix}.svg').read_text()
 portrait=re.sub(r'#[0-9a-fA-F]{6}',lambda m:skin.get(m[0],m[0]),portrait)
 # Broad, low-contrast planes below the lower lids; no dark eye outlines.
 # Follow the open-eye height so surprise and smiling faces keep their shape.
 lower=57 if expression=='surprised' else 56 if expression in ('happy','bashful') else 55
 bags=f'<path data-part="under-eye-fatigue" d="M46 {lower+1}L56 {lower} 55 {lower+2} 48 {lower+3}Z M73 {lower+1}L80 {lower} 79 {lower+2} 74 {lower+3}Z" fill="#a58b83" opacity=".45"/>\n'
 portrait=portrait.replace('<path d="M64 51',bags+'<path d="M64 51')
 (OUT/f'portrait-nell-ill{suffix}.svg').write_text(portrait)

# A matching empty cot and unarmed carrying poses for the Iria treatment.
(OUT/'treatment-cot.svg').write_text(svg(80,80,bed))
import runpy
hero=runpy.run_path(str(Path(__file__).with_name('chapter-two.py')))['hero']
for name in ('kit','petra'):
 (OUT/f'{name}-carry.svg').write_text(hero(name,'front',carry=True).svg())
