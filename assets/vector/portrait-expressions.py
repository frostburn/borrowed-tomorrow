"""Rebuild small expression SVGs from independent neutral portraits.

Run from the repository root: python assets/vector/portrait-expressions.py
Only named facial paths change; costume, face planes, hair, neck and glasses
remain the portrait artist's original drawing. No bitmap resampling is used.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'public/art/vector'
# Local eye/brow anchors follow each independently drawn head, not a new face.
FACES = {
 'nell': dict(brows='M43 45', eyes='M46 52', pupils='M52 51', mouth='M54 77', lip='M58 78', near=(46,57,52), far=(72,80,52), brow=(43,59,69,82,45),
  mouths=dict(happy='M54 76L63 79 74 75 71 80 64 83 57 81Z', worried='M58 79L65 77 72 79 71 81 64 80 58 81Z', sad='M55 81L63 77 69 78 74 81 70 81 64 80 58 83Z', angry='M55 78L72 76 72 79 56 81Z', surprised='M60 76L66 75 70 79 68 84 62 84 59 80Z', bashful='M55 78L62 80 71 77 69 81 63 83 57 82Z')),
 'orrin': dict(brows='M41 44', eyes='M44 52', pupils='M50 51', mouth='M57 79', lip=None, near=(44,55,52), far=(73,83,53), brow=(41,59,70,87,44),
  mouths=dict(happy='M56 78L63 80 74 77 72 80 64 83 58 81Z', worried='M59 80L65 79 72 80 71 82 59 82Z', sad='M57 81L65 78 72 80 72 82 65 81 58 83Z', angry='M57 79L73 78 73 81 58 82Z', surprised='M61 79L67 78 70 81 68 85 62 84Z')),
 'kit': dict(brows='M40 45', eyes='M44 52', pupils='M49 50', mouth='M52 77', lip='M57 78', near=(44,55,52), far=(72,81,52), brow=(40,57,69,83,44),
  mouths=dict(happy='M52 76L63 79 75 74 72 80 64 83 55 81Z', worried='M56 79L63 77 71 78 72 81 65 80 57 82Z', sad='M53 81L62 77 69 78 75 81 72 82 63 80 56 83Z', angry='M53 78L74 76 73 79 55 81Z', surprised='M59 76L65 75 70 78 69 83 63 85 59 82Z', bashful='M53 79L61 81 72 77 70 81 63 83 56 82Z')),
 'celia': dict(brows='M42 45', eyes='M46 53', pupils='M50 52', mouth='M53 79', lip='M58 80', near=(46,55,54), far=(72,80,54), brow=(42,59,69,84,45),
  mouths=dict(happy='M54 79L63 81 75 77 72 82 64 85 57 83Z', worried='M57 82L64 80 72 81 73 83 64 82 58 84Z', sad='M54 83L63 79 70 80 75 83 71 84 64 82 57 85Z', angry='M54 81L75 79 74 82 56 84Z', surprised='M60 79L66 78 70 82 68 87 62 87 59 83Z')),
 'petra': dict(brows='M42 44', eyes='M46 52', pupils='M51 51', mouth='M53 79', lip='M59 84', near=(46,56,52), far=(73,82,53), brow=(42,60,70,86,44),
  mouths=dict(happy='M54 78L64 80 76 77 73 81 65 84 57 82Z', worried='M57 81L65 79 73 80 74 82 64 81 58 83Z', sad='M54 83L63 79 71 80 76 82 73 84 65 82 57 85Z', angry='M54 80L76 78 75 81 56 83Z', surprised='M60 78L67 77 71 81 69 86 63 86 60 83Z')),
 'tomas': dict(brows='M41 45', eyes='M44 52', pupils='M50 51', detail='M52 52', mouth='M52 79', lip='M58 81', near=(44,55,52), far=(73,82,53), brow=(41,59,71,86,44),
  mouths=dict(happy='M52 78L61 81 69 80 78 75 75 81 68 85 59 85 54 82Z', worried='M56 82L63 80 72 80 76 82 74 84 64 82 57 84Z', sad='M53 84L62 80 69 80 77 83 75 85 67 82 60 83 55 86Z', angry='M53 80L76 78 76 81 55 84Z', surprised='M60 78L67 77 72 81 70 87 63 88 59 83Z')),
}

def replace_path(svg, prefix, d):
 pattern = r'<path\b[^>]*\bd="' + re.escape(prefix) + r'[^\"]*"[^>]*/>'
 matches = list(re.finditer(pattern, svg))
 if len(matches) != 1:
  raise ValueError(f'Expected one facial path for {prefix!r}; got {len(matches)}')
 tag = matches[0].group()
 new = re.sub(r'\bd="[^"]*"', lambda _: f'd="{d}"', tag) if d else ''
 return svg[:matches[0].start()] + new + svg[matches[0].end():]

def brow_path(face, emotion):
 a,b,c,d,y=face['brow']
 # A furrow points down toward the nose; worry and grief lift the inner ends.
 if emotion=='angry':
  return f'M{a} {y}L{b} {y+5}V{y+8}L{a+1} {y+3}Z M{c} {y+5}L{d} {y}V{y+3}L{c} {y+8}Z'
 if emotion in ('worried','sad'):
  lift=3 if emotion=='worried' else 5
  return f'M{a} {y+3}L{b-2} {y-lift} {b} {y-lift+3} {a+1} {y+6}Z M{c} {y-lift}L{d} {y+2}V{y+5}L{c} {y-lift+3}Z'
 return f'M{a} {y-1}L{(a+b)//2} {y-3} {b-1} {y-1}V{y+2}L{(a+b)//2} {y} {a+1} {y+2}Z M{c} {y-1}L{(c+d)//2} {y-3} {d} {y}V{y+3}L{(c+d)//2} {y} {c} {y+2}Z'

def eye_paths(face,emotion):
 eyes=[];pupils=[]
 for x,right,y in (face['near'],face['far']):
  if emotion=='surprised': top,bottom=y-3,y+4
  elif emotion in ('happy','bashful'): top,bottom=y,y+2
  else: top,bottom=y-1,y+2
  eyes.append(f'M{x} {top+1}L{right-1} {top} {right} {bottom}H{x+1}Z')
  center=(x+right)//2+(0 if emotion=='bashful' else 1)
  pupils.append(f'M{center-1} {top}H{center+2}V{bottom+1}H{center-1}Z')
 return ' '.join(eyes),' '.join(pupils)

for hero,face in FACES.items():
 source=(ART/f'portrait-{hero}.svg').read_text()
 for emotion,mouth in face['mouths'].items():
  out=replace_path(source,face['brows'],brow_path(face,emotion))
  eyes,pupils=eye_paths(face,emotion)
  out=replace_path(out,face['eyes'],eyes)
  out=replace_path(out,face['pupils'],pupils)
  if face.get('detail'):
   detail=[]
   for x,right,y in (face['near'],face['far']):
    center=(x+right)//2+1
    top,bottom=(y-3,y+4) if emotion=='surprised' else (y,y+2) if emotion=='happy' else (y-1,y+2)
    detail.append(f'M{center+1} {top+1}H{center+2}V{bottom+1}H{center+1}Z')
   out=replace_path(out,face['detail'],' '.join(detail))
  out=replace_path(out,face['mouth'],mouth)
  if face['lip']:out=replace_path(out,face['lip'],'')
  if emotion=='bashful':
   blush='<path d="M43 66L50 65 53 69 46 71Z M74 65L81 65 81 69 75 70Z" fill="#b57264" opacity=".55"/>'
   out=out.replace('</svg>',blush+'\n</svg>')
  out=re.sub(r'<title>(.*?)</title>',lambda m:f'<title>{m[1]} — {emotion}</title>',out)
  out=out.replace('<metadata>',f'<!-- Expression: {emotion}; derived by assets/vector/portrait-expressions.py -->\n<metadata>',1)
  (ART/f'portrait-{hero}-{emotion}.svg').write_text(out)
print(f'Wrote {sum(len(f["mouths"]) for f in FACES.values())} facial-expression variants; {len(FACES)} neutral originals unchanged.')
