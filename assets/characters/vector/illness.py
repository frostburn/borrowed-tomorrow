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
 if not expression:
  # Slightly lift the inner brow ends on her default face for discomfort.
  portrait=portrait.replace('M43 45L52 43 58 45 59 48 51 47 44 49Z M69 45L77 44 82 47 82 49 72 48Z',
                            'M43 45L52 43 58 41 59 44 51 47 44 49Z M69 42L77 44 82 47 82 49 72 46Z')
 # Lift the lower lids into a mild pained squint. The eye bags span four
 # native rows so they remain visible after the game's two-pixel sampling.
 lower=57 if expression=='surprised' else 56 if expression in ('happy','bashful') else 55
 lid=lower-2
 lids=f'<g data-part="raised-lower-eyelids"><path d="M46 {lid+1}L51 {lid} 56 {lid} 58 {lid+1} 58 {lower+1}H46Z" fill="#d1a585"/><path d="M71 {lid+1}L75 {lid} 79 {lid} 81 {lid+1} 81 {lower+1}H71Z" fill="#bd9275"/></g>\n'
 bags=f'<g data-part="under-eye-fatigue"><path d="M46 {lower+1}L50 {lower+2} 56 {lower+1} 58 {lower+2} 55 {lower+5} 49 {lower+5} 46 {lower+3}Z" fill="#b18d7e"/><path d="M72 {lower+1}L76 {lower+2} 80 {lower+1} 81 {lower+3} 78 {lower+5} 74 {lower+5} 72 {lower+3}Z" fill="#997c70"/></g>\n'
 portrait=portrait.replace('<path d="M64 51',lids+bags+'<path d="M64 51')
 (OUT/f'portrait-nell-ill{suffix}.svg').write_text(portrait)

# A matching empty cot and unarmed carrying poses for the Iria treatment.
(OUT/'treatment-cot.svg').write_text(svg(80,80,bed))
import runpy
hero=runpy.run_path(str(Path(__file__).with_name('chapter-two.py')))['hero']
for name in ('kit','petra'):
 (OUT/f'{name}-carry.svg').write_text(hero(name,'front',carry=True).svg())
