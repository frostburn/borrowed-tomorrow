"""Small native SVG UI objects. Run: python3 assets/ui/export-icons.py.

32px inventory icons and 128px dialogue cards share broad material planes,
with colored undersides instead of black outlines. No raster dependencies.
"""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/art/vector/ui'

def path(d, c): return f'<path d="{d}" fill="{c}"/>'
def rect(x,y,w,h,c): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}"/>'
def circle(x,y,r,c): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
gold, brass, shade, pale = '#e1bd77', '#af814c', '#645343', '#f2dfb5'
steel, blue, dark = '#b4c6ca', '#6a8999', '#3e5868'
ART={}
ART['marks']=circle(12,21,8,brass)+circle(12,19,8,gold)+circle(22,15,8,brass)+circle(22,12,8,gold)+circle(22,12,5,brass)+path('M22 7L24 10L27 12L24 14L22 17L20 14L17 12L20 10Z',pale)+rect(8,16,4,6,pale)
ART['reflector']=path('M4 7L21 3L28 9L26 22L12 27L4 21Z',brass)+path('M6 8L20 5L25 10L23 20L12 24L6 20Z',gold)+path('M10 10L20 7L23 11L20 18L12 21L9 18Z',steel)+path('M10 10L20 7L15 17L9 18Z',pale)+path('M12 24L18 23L20 30L13 30Z',shade)
ART['prism']=path('M16 2L29 12L21 28L10 26L3 13Z',blue)+path('M16 2L18 14L3 13Z',pale)+path('M18 14L29 12L21 28Z','#88c6c5')+path('M3 13L18 14L10 26Z',steel)+path('M10 26L21 28L21 31L8 29Z',brass)
ART['nozzle']=path('M3 20L6 13L21 7L27 10L29 18L22 23L8 28Z',brass)+path('M6 13L21 7L24 11L9 18Z',gold)+path('M9 18L24 11L26 18L11 25Z',steel)+path('M21 7L27 10L29 18L24 21L22 14Z',dark)+path('M6 15L9 18L11 25L8 28L3 20Z',shade)+rect(13,7,4,6,brass)+rect(11,5,8,3,gold)
ART['valve']=rect(10,11,12,16,brass)+rect(12,11,6,16,steel)+rect(4,20,24,6,brass)+rect(4,20,24,2,gold)+rect(14,5,4,14,dark)+circle(16,7,7,brass)+circle(16,6,5,gold)+circle(16,6,2,dark)+rect(3,27,8,3,shade)+rect(22,27,8,3,shade)
ART['ring']=circle(16,15,12,brass)+circle(16,13,12,gold)+circle(16,13,7,dark)+circle(16,13,4,'#182b32')+path('M7 4L15 1L15 5L9 8Z',pale)+rect(14,23,5,7,steel)
ART['sight']=path('M4 22L25 14L29 18L8 27Z',shade)+path('M6 11L22 5L28 8L29 16L12 23L7 19Z',brass)+path('M6 11L22 5L28 8L11 15Z',gold)+path('M11 15L28 8L29 16L12 23Z',blue)+circle(10,17,5,dark)+circle(10,17,3,steel)+rect(14,21,5,7,brass)+rect(10,27,14,3,gold)
ART['stock']=path('M3 19L11 12L17 15L26 4L30 7L21 20L15 20L9 29L3 26Z','#8e634b')+path('M3 19L11 12L17 15L26 4L28 5L18 18L11 16L5 22Z','#c49466')+path('M4 25L9 27L8 31L2 29Z',shade)+path('M19 12L22 14L25 10L22 8Z',steel)
ART['focus']=path('M11 20L15 22L9 31L5 28Z',brass)+circle(18,12,11,brass)+circle(18,11,9,gold)+circle(18,11,6,blue)+path('M14 6L22 6L16 16L12 13Z','#b2d6d2')+circle(21,12,2,pale)
ART['clasp']=path('M3 9L10 5L14 9L25 5L29 10L27 24L19 27L13 23L5 27Z',blue)+path('M9 10L23 8L25 21L12 24Z',steel)+rect(13,12,8,7,gold)+rect(15,13,4,4,dark)+path('M4 9L9 8L10 24L5 27Z',dark)
ART['hilt']=path('M14 15L19 14L24 27L19 30Z','#8e634b')+path('M12 3L15 2L19 16L14 18Z',steel)+path('M5 16L12 18L23 10L28 9L29 14L23 13L14 22L6 21Z',gold)+path('M6 21L14 22L23 13L29 14L26 17L22 17L15 25L8 24Z',brass)+path('M18 28L24 25L27 29L21 32Z',brass)
ART['brace']=path('M5 4L24 3L28 10L26 24L17 30L7 24L3 12Z',blue)+path('M7 6L22 5L25 11L23 22L16 26L9 21L6 12Z',steel)+path('M12 8L18 7L21 23L16 27Z',brass)+path('M5 13L25 10L25 14L6 18Z',gold)
ART['coat']=path('M9 3L14 2L17 6L20 2L25 4L31 15L26 19L24 13L25 30L7 30L8 13L5 20L1 17Z','#658385')+path('M9 3L14 2L17 6L12 12L8 9Z','#bdd1bf')+path('M17 6L20 2L25 4L24 9L20 12Z','#a0b7ac')+path('M8 13L11 15L10 27L17 27L17 30L7 30Z','#3f6068')+rect(17,12,2,16,gold)+rect(21,20,3,2,brass)
ART['heavy-coat']=ART['coat'].replace('#658385','#6b6a7c').replace('#bdd1bf','#c2b4a1').replace('#a0b7ac','#a6998e')+path('M7 24L16 25L17 30L7 30Z',shade)+rect(20,25,5,5,shade)
ART['harness']=path('M7 3L13 2L28 28L22 31Z','#ae835b')+path('M23 2L28 4L10 31L4 28Z','#c09b6c')+path('M9 13L24 13L26 26L8 27Z',shade)+rect(11,14,11,10,brass)+rect(14,17,5,4,gold)
# Plain adhesive strip; field dressings keep their larger wrapped packet.
ART['bandage']='<g transform="rotate(-32 16 16)"><rect x="2" y="10" width="28" height="12" rx="5" fill="#c4a786"/><rect x="2" y="9" width="28" height="12" rx="5" fill="#edcfa5"/><rect x="12" y="10" width="8" height="10" rx="1" fill="#bb926d"/>'+rect(5,12,2,2,pale)+rect(5,16,2,2,pale)+rect(23,12,2,2,pale)+rect(23,16,2,2,pale)+'</g>'
ART['field-bandage']=path('M3 10L20 5L28 11L27 25L10 29L3 24Z','#baaa8d')+path('M3 10L20 5L28 11L10 17Z',pale)+path('M10 17L28 11L27 25L10 29Z','#ded4b4')+path('M13 15L17 14L17 27L13 28Z','#779f9c')+path('M21 13L24 12L23 26L20 27Z','#f6ead0')+rect(18,17,7,4,'#52797e')+rect(20,15,3,8,'#52797e')
ART['tonic']=rect(12,2,9,4,brass)+rect(13,6,7,6,steel)+path('M13 10L20 10L26 16L26 28L22 31L9 31L6 28L6 17Z',blue)+path('M9 19L23 19L23 27L20 29L10 29L9 27Z','#89b9af')+rect(12,21,8,5,pale)+rect(9,15,3,10,steel)
ART['letter']=path('M4 6L24 3L28 26L7 29Z','#b9a789')+path('M4 6L23 4L25 25L7 27Z',pale)+path('M7 10L20 8L20 10L7 12ZM8 15L21 13L21 15L8 17ZM9 20L16 19L16 21L9 22Z','#8c8674')+circle(23,24,5,'#a65345')+circle(23,23,2,'#da9b68')
ART['ledger']=path('M3 5L17 3L29 6L28 29L16 27L3 30Z',shade)+path('M4 4L16 2L16 25L5 28Z',pale)+path('M16 2L28 5L27 27L16 25Z','#d1c39f')+path('M7 8L13 7L13 9L7 10ZM7 13L13 12L13 14L7 15ZM19 8L25 9L25 11L19 10ZM19 13L25 14L25 16L19 15ZM19 18L24 19L24 21L19 20Z','#8c8674')+path('M13 3L16 2L16 25L13 26Z','#b8a781')
ART['chart']=path('M3 5L11 2L21 5L29 2L28 27L20 30L11 27L3 30Z',pale)+path('M11 2L21 5L20 30L11 27Z','#c4bc9b')+path('M5 21L10 15L16 18L23 9L26 11L24 15L19 20L13 21L8 25Z',blue)+circle(9,12,2,brass)+circle(23,23,2,brass)
ART['mural']=path('M3 3L25 2L30 10L27 29L5 30L2 21Z','#526876')+path('M4 5L23 4L27 11L24 26L6 28L4 20Z','#87938d')+circle(19,11,6,gold)+circle(19,11,3,'#87938d')+path('M8 12L11 12L13 18L20 18L20 21L12 21L10 17L9 26L5 26Z',shade)+path('M8 5L11 10L8 14L11 22L9 29L6 29L8 22L6 14L9 10L6 5Z','#526876')
ART['lantern']=path('M9 5L12 1L20 1L23 5L21 9L19 8L20 5L18 3L14 3L12 5L13 8L11 9Z',brass)+path('M7 9L24 7L28 13L25 29L7 30L4 14Z',brass)+path('M8 12L23 10L24 25L9 27Z',gold)+path('M12 13L21 12L20 23L13 25Z','#f5df9c')+path('M6 9L24 7L28 13L5 16Z',dark)+path('M7 27L25 25L26 30L7 32Z',dark)
ART['horn']=path('M3 19L15 13L25 2L28 3L29 15L18 18L7 25Z',brass)+path('M3 19L15 13L25 2L26 5L16 16L5 22Z',gold)+path('M25 2L28 3L29 15L26 14Z',shade)+path('M11 22L15 20L19 27L16 30Z',brass)
ART['light']=path('M13 1L19 1L18 31L14 31Z',pale)+path('M14 4L8 7L3 24L14 19Z',gold)+path('M18 4L25 7L30 23L18 19Z',brass)
ART['speaker']=path('M4 32L5 24L12 20L22 20L28 25L30 32Z',blue)+path('M12 18L12 24L18 27L22 23L21 17Z','#b69c80')+path('M9 6L16 2L23 6L24 14L20 21L13 20L8 14Z','#d2baa0')+path('M8 12L8 5L14 1L21 2L25 6L24 12L20 8L14 7L11 12Z',shade)+rect(11,12,3,1,'#594e45')+rect(19,12,3,1,'#594e45')+path('M16 13L18 16L15 16Z','#bba287')+rect(14,18,5,1,'#997563')

def speaker_portrait():
 # Draw at the portrait's own resolution: readable eyes, a small nose and a
 # relaxed closed mouth. Neck behind the collar, no beard-shaped face patch.
 skin,shadow,hair='#d2baa0','#bba287','#645343'
 return ''.join([
  path('M48 72L47 99L65 113L84 95L81 69Z',shadow),
  path('M50 78L51 95L65 103L76 93L76 77Z',skin),
  path('M9 128L13 103L44 90L63 104L85 89L112 102L121 128Z','#6a8999'),
  path('M9 128L13 103L27 97L25 128Z','#506e80'),
  path('M44 89L63 104L53 113L35 95Z','#b4c6ca'),
  path('M83 89L63 104L74 114L94 95Z','#93adb3'),
  path('M36 46L32 48L34 61L42 65L43 48Z',shadow),
  path('M88 45L94 48L92 61L86 65Z',shadow),
  path('M39 26L61 16L83 24L91 44L86 69L76 83L61 88L47 81L38 65L35 44Z',skin),
  path('M80 27L91 44L86 69L76 83L61 88L60 83L74 78L82 62L84 44Z',shadow),
  path('M35 49L32 36L36 19L52 11L72 13L89 23L94 39L88 52L82 36L69 32L57 24L46 35L42 50Z',hair),
  path('M36 24L52 13L71 15L84 23L69 21L56 20L45 29L36 38Z','#85735e'),
  path('M44 43L54 42L56 45L44 46Z','#82705d'),
  path('M70 43L80 44L81 47L69 46Z','#82705d'),
  path('M44 49L53 49L56 53L45 54Z','#eee0c9'),
  path('M69 50L79 50L80 54L69 54Z','#eee0c9'),
  rect(49,49,4,5,'#596b69'),rect(72,50,4,4,'#596b69'),
  path('M61 50L66 61L60 63L57 60Z','#c3a78a'),
  path('M54 71L62 72L71 70L69 73L61 75L55 73Z','#9e7867'),
  path('M58 77L65 78L69 76L65 80L60 80Z','#dbc3a7'),
 ])

def svg(body,size): return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">{body}</svg>\n'

def export():
 OUT.mkdir(parents=True,exist_ok=True)
 for name,body in ART.items():
  (OUT/f'{name}.svg').write_text(svg(body,32))
 for name in ('letter','ledger','chart','mural','lantern','horn','speaker','bandage','light'):
  body=rect(0,0,128,128,'#182b32')+path('M0 103L128 78L128 128L0 128Z','#25404a')+(speaker_portrait() if name=='speaker' else f'<g transform="translate(16 12) scale(3)">{ART[name]}</g>')
  (OUT/f'portrait-{name}.svg').write_text(svg(body,128))
 print(f'Exported {len(ART)} icons and 9 object/speaker cards')
if __name__=='__main__':export()
