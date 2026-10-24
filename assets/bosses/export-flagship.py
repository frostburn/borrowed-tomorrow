"""Rebuild the flagship's native SVG originals; no raster source or resampling."""
from pathlib import Path
from math import sin, cos, pi
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/art/vector/bosses'
OUT.mkdir(parents=True, exist_ok=True)

def svg(w,h,body,view=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{view or f"0 0 {w} {h}"}"><title>Imperial flagship — editable polygonal vector artwork</title>{body}</svg>\n'
def poly(points,color):
    return f'<path d="M{points}Z" fill="{color}"/>'
def rect(x,y,w,h,color):return f'<path d="M{x} {y}h{w}v{h}h-{w}Z" fill="{color}"/>'
def sun(x,y,r):
    pts=' '.join(f'{x+cos(-pi/2+i*pi/12)*(r if i%2==0 else r*.58):.1f} {y+sin(-pi/2+i*pi/12)*(r if i%2==0 else r*.58):.1f}' for i in range(24))
    return f'<polygon points="{pts}" fill="#d5b875"/><circle cx="{x}" cy="{y}" r="{r*.29}" fill="#34464a"/>'

sky=rect(0,0,1008,480,'#344856')
sky+=poly('0 72 220 24 438 92 680 38 1008 58 1008 174 800 142 526 178 244 120 0 150','#4b626c')
sky+=poly('0 180 120 162 296 205 460 166 690 214 870 172 1008 188 1008 308 860 256 602 278 346 242 106 288 0 266','#71878b')
# Distant suspended masonry, far below the cordon.
sky+=poly('42 164 70 144 112 152 130 136 180 152 192 166 166 190 94 204 72 192','#3f515a')
sky+=rect(92,116,20,43,'#5b6a70')+poly('86 118 101 104 119 116 112 124 92 126','#78888b')
sky+=poly('0 302 172 282 284 300 464 272 706 310 1008 270 1008 480 0 480','#9aa7a0')
# Survey deck: continuous broad planks, a low bow rail, and brass framing.
sky+=poly('100 274 852 274 994 480 0 480','#182c33')
sky+=poly('110 292 842 292 958 480 10 480','#806c51')
sky+=poly('110 292 842 292 874 348 74 348','#927c59')
sky+=poly('74 348 874 348 958 480 10 480','#73634e')
sky+='<defs><clipPath id="deck-planks"><path d="M110 292H842L958 480H10Z"/></clipPath></defs><g clip-path="url(#deck-planks)">'
for y in range(312,481,24):sky+=rect(64,y,844,2,'#4c4b43')
for x in range(160,850,112):sky+=poly(f'{x} 292 {x+2} 292 {x+int((x-480)*.15)+2} 480 {x+int((x-480)*.15)} 480','#5e5647')
sky+='</g>'
sky+=poly('96 274 856 274 868 290 86 290','#c1aa74')+rect(104,290,744,7,'#3f493f')
for x in (80,916):
    sky+=poly(f'{x} 330 {x+10} 330 {x+38} 480 {x+22} 480','#b69a62')
sky+=poly('0 464 958 464 994 480 0 480','#25363a')
OUT.joinpath('flagship-deck.svg').write_text(svg(1008,480,sky))

# Whole armored hull. Lower edges stop above the heroes' deck.
hull=poly('44 102 172 44 366 26 476 46 586 26 780 44 908 102 816 188 658 214 476 242 294 214 136 188','#3c555c')
hull+=poly('44 102 172 44 366 26 476 46 586 26 780 44 908 102 738 136 476 170 214 136','#708782')
hull+=poly('44 102 214 136 476 170 476 242 294 214 136 188','#334e53')
hull+=poly('908 102 738 136 476 170 476 242 658 214 816 188','#233e48')
# The suspended belly and far side turn away from the upper-left sky light.
hull+=poly('44 102 136 188 294 214 476 242 476 216 306 191 160 170 98 125','#243e46')
hull+=poly('908 102 816 188 658 214 476 242 476 216 646 191 792 169 858 126','#192f3d')
hull+=poly('172 44 366 26 476 46 586 26 780 44 742 64 584 50 476 68 368 50 210 64','#b49b66')
hull+=poly('136 168 294 192 476 222 658 192 816 168 800 184 476 240 152 184','#aa8d55')
hull+=poly('268 82 476 108 684 82 650 104 476 132 302 104','#c3b48c')
hull+=poly('214 136 476 170 738 136 718 146 476 182 234 146','#29454e')
# Broad armor panels share the same light direction as the smaller machinery.
hull+=poly('150 112 222 126 213 153 158 141','#738d86')
hull+=poly('226 128 299 139 294 171 219 157','#607d79')
hull+=poly('308 141 397 155 394 191 302 176','#4d6b6b')
hull+=poly('799 114 733 127 741 153 791 142','#405e64')
hull+=poly('725 130 652 141 657 173 734 157','#344f58')
hull+=poly('643 143 555 156 559 190 650 176','#29434f')
for x,y in [(160,122),(230,139),(312,153),(790,124),(720,141),(638,155)]:
    hull+=rect(x,y,5,4,'#bca675')
for x in (194,270,346,606,682,758):
    hull+=poly(f'{x} 124 {x+7} 125 {x+1} 184 {x-6} 182','#93a39a')
for x in (64,818):
    hull+=poly(f'{x} 74 {x+36} 54 {x+70} 76 {x+78} 162 {x+44} 192 {x+4} 164','#162a35')
    hull+=poly(f'{x+6} 78 {x+34} 66 {x+58} 82 {x+60} 150 {x+36} 164 {x+10} 146','#597473')
    hull+=poly(f'{x+8} 154 {x+38} 172 {x+70} 154 {x+60} 176 {x+40} 188 {x+16} 176','#c0a26a')
    for y in (94,110,126):hull+=rect(x+16,y,34,5,'#253d45')
# Imperial pennants and a central armored keel.
hull+=poly('246 134 286 140 286 205 268 190 246 207','#803c38')
hull+=poly('666 140 706 134 706 207 686 190 666 205','#803c38')
hull+=poly('446 164 476 178 506 164 504 224 476 246 448 224','#1c343e')+sun(476,194,23)
OUT.joinpath('flagship-hull.svg').write_text(svg(952,256,hull))

# Independent gun housings share geometry, but are built with distinct side lighting.
for side in ('port','starboard'):
    for fire in (False,True):
        body=poly('22 78 40 44 134 40 172 70 180 132 160 168 94 184 28 160 12 126','#4d6867')
        body+=poly('22 78 40 44 134 40 172 70 132 96 62 100','#798c83')
        body+=poly('22 78 62 100 94 184 28 160 12 126','#3d5e60' if side=='port' else '#2b474e')
        body+=poly('62 100 132 96 172 70 180 132 160 168 94 184','#2f4a51' if side=='port' else '#486568')
        body+=poly('28 150 94 172 162 150 160 164 94 184 28 160','#b49a62')
        body+=poly('54 46 64 20 128 20 140 44 128 80 64 84','#536b68')
        body+=poly('64 20 128 20 134 32 72 38','#b4b69a')+poly('72 38 134 32 128 80 76 84','#536e6e')
        # Two forward-pointing barrels recoil into a rigid turret, with no body deformation.
        recoil=12 if fire else 0
        for x in (66,104):
            body+=poly(f'{x} 74 {x+18} 72 {x+20} {144-recoil} {x+2} {152-recoil} {x-4} {143-recoil}','#546e71')
            body+=poly(f'{x+2} 76 {x+10} 76 {x+12} {140-recoil} {x+4} {144-recoil}','#81988d')
            body+=poly(f'{x-4} {132-recoil} {x+19} {130-recoil} {x+20} {144-recoil} {x+1} {153-recoil} {x-5} {144-recoil}','#b09a67')
            body+=poly(f'{x+1} {139-recoil} {x+14} {135-recoil} {x+16} {142-recoil} {x+3} {148-recoil}','#111f29')
        body+=sun(96,55,13)
        for x in (34,148):body+=rect(x,98,6,12,'#c0af7a')+rect(x,122,6,6,'#192e36')
        if fire:body+=rect(84,30,8,4,'#e0a66c')
        OUT.joinpath(f'flagship-{side}{"-fire" if fire else ""}.svg').write_text(svg(192,184,body))

for fire in (False,True):
    body=poly('36 152 42 116 62 110 62 62 80 38 144 38 164 62 164 110 182 116 188 152 162 204 112 232 62 204','#4b6569')
    body+=poly('62 62 80 38 144 38 164 62 142 80 82 80','#a6ad95')
    body+=poly('62 62 82 80 112 174 62 204 36 152 42 116 62 110','#4c6b6b')
    body+=poly('164 62 142 80 112 174 162 204 188 152 182 116 164 110','#2e4a54')
    body+=poly('62 110 82 120 142 120 164 110 160 134 112 154 66 134','#bda16b')
    body+=poly('70 76 86 87 138 87 154 76 150 106 138 114 86 114 74 106','#101f2b')
    for x in (80,96,112,128,144):body+=poly(f'{x} 86 {x+7} 84 {x+7} 104 {x} 106','#718f8d')
    body+=poly('80 38 92 20 132 20 144 38 128 46 96 46','#263f48')+rect(109,0,6,26,'#bda16b')
    body+=poly('115 2 168 12 144 24 115 18','#853f3c')
    body+=poly('74 152 112 168 150 152 144 198 112 222 80 198','#1a303b')+sun(112,184,23)
    for x in (48,164):
        body+=poly(f'{x} 130 {x+14} 134 {x+12} 164 {x-2} 164','#152a35')
        body+=rect(x,138,10,18,'#edd59a' if fire else '#8da49a')
    OUT.joinpath(f'flagship-bridge{"-fire" if fire else ""}.svg').write_text(svg(224,232,body))

# Anonymous boarding marine. 80px actor, soles at y=68, distinct from named soldiers.
marine='<ellipse cx="40" cy="68" rx="17" ry="4" fill="#14262d" opacity=".55"/>'
marine+=poly('29 45 38 45 38 65 27 68 24 65','#172c39')+poly('43 45 51 44 54 65 44 68 41 64','#213c48')
marine+=poly('25 29 38 23 50 26 56 43 49 52 29 50 22 41','#425d61')
marine+=poly('30 29 39 27 47 31 47 47 31 46','#919b89')+poly('24 32 29 34 26 48 20 47 19 38','#536f71')
marine+=poly('48 30 55 31 59 45 53 49 48 40','#304b56')
marine+=poly('32 14 46 12 51 20 48 29 38 31 30 25','#baa082')
marine+=poly('29 14 35 9 47 10 52 16 51 21 29 21','#657c7b')+rect(29,19,23,4,'#1e333e')
marine+=poly('39 23 48 22 47 27 41 28','#283d44')
unarmed=marine
marine+=poly('56 36 59 36 64 61 61 63 57 52','#b8bba6')+rect(53,47,11,3,'#b79b68')
marine+=rect(29,45,23,4,'#72563e')+rect(38,45,6,4,'#c4ab70')
(ROOT/'public/art/vector/flagship-marine.svg').write_text(svg(80,80,marine))
(ROOT/'public/art/vector/flagship-crew.svg').write_text(svg(80,80,unarmed+rect(29,45,23,4,'#72563e')+rect(38,45,6,4,'#c4ab70')))
OUT.joinpath('flagship-portrait.svg').write_text(svg(128,128,hull,'276 20 400 240'))
print('Exported 11 shared flagship SVGs (native vectors).')
