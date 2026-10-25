"""Native planar minions and two Nell illness poses. No god body is depicted."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/art/vector'
def svg(w,h,body,view=None):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{view or f"0 0 {w} {h}"}">{body}</svg>\n'
def poly(pts,c):return f'<polygon points="{pts}" fill="{c}"/>'
def line(pts,c,w=2):return f'<polyline points="{pts}" fill="none" stroke="{c}" stroke-width="{w}"/>'
herald=poly('25,33 34,27 45,27 55,34 58,54 51,67 30,67 22,55','#314957')
herald+=poly('25,33 34,27 40,35 37,60 29,64 26,49','#a7c1b3')
herald+=poly('40,35 45,27 55,34 53,50 48,63 37,60','#e0d8ae')
herald+=poly('34,27 30,18 35,8 45,8 50,18 45,27 40,31','#5b8184')
herald+=poly('35,10 43,10 45,20 40,26 34,21','#d8ece0')
herald+=poly('31,17 39,15 48,16 48,19 39,20 31,19','#253f51')
herald+=poly('24,32 29,39 19,54 12,51 16,42','#b8bf9b')+poly('53,32 59,39 64,51 58,55 49,42','#7ba4a0')
herald+=line('12,43 13,66','#c7b37a',3)+poly('9,36 14,30 18,37 14,47','#d9eee1')
herald+=poly('31,66 38,63 37,69 28,69','#203a4a')+poly('43,63 50,65 53,69 42,69','#203a4a')
wing=poly('34,33 20,9 5,16 10,42 27,53 37,44','#456d79')+poly('44,33 61,8 75,18 69,42 52,54 40,44','#9fbbaf')
wing+=poly('20,12 9,19 14,35 31,44','#d5e7d7')+poly('60,12 70,20 65,36 48,45','#ece0b4')
wing+=line('10,20 26,28 16,34 31,44','#78a3a3')+line('69,21 55,29 64,35 48,45','#7d9990')
wing+=poly('34,23 44,23 49,41 43,58 37,63 30,45','#254653')+poly('36,26 42,25 44,41 38,54 35,42','#cbdcbd')
wing+=poly('33,24 30,17 36,11 43,12 47,20 44,25','#789d99')+line('35,20 42,20','#e9ddb0')
for name,body in [('herald',herald),('glasswing',wing)]:
 (OUT/f'{name}.svg').write_text(svg(80,80,body))
 (OUT/f'portrait-{name}.svg').write_text(svg(128,128,body,'0 0 80 80'))
import runpy
runpy.run_path(str(Path(__file__).with_name('illness.py')))
print('Exported two divine minions, matching portraits and Nell’s illness poses.')
