"""Native Chapter Four supporting actors; portraits are separate SVG originals."""
from pathlib import Path
from draw import human, Drawing, boots, sleeve

def bram():
 d=Drawing()
 for x in (16,24):
  d.poly([(x-3,45),(x+3,45),(x+2,61),(x-2,63)],'navy');boots(d,x,top=60,bottom=67)
 d.cloth([(12,26),(27,26),(31,36),(29,51),(12,51),(9,36)],'blue')
 d.poly([(15,27),(25,27),(28,51),(24,58),(12,55),(13,40)],'leather')
 d.poly([(15,28),(18,30),(16,48),(13,53),(12,43)],'copper')
 d.line([(13,49),(27,49)],'hair');d.rect((17,40,24,45),'brown')
 sleeve(d,(12,29),(8,37),(9,45),'blue');sleeve(d,(28,30),(32,36),(30,42),'blue')
 # A light mallet belongs to the anatomical right hand (screen left).
 d.line([(8,43),(6,28)],'brown',2);d.poly([(2,24),(8,22),(11,26),(9,31),(3,32)],'steel')
 head_start=len(d.shapes)
 d.poly([(14,12),(24,11),(28,17),(26,24),(22,29),(16,27),(12,21)],'brown')
 d.poly([(16,13),(24,13),(26,18),(23,25),(17,24),(14,19)],'skin')
 d.poly([(12,17),(14,12),(17,14),(15,22),(18,27),(24,26),(26,21),(27,25),(23,31),(16,30),(12,25)],'shade')
 d.poly([(17,25),(22,27),(25,24),(23,29),(18,28)],'silver')
 d.line([(16,18),(18,18)],'ink');d.line([(23,18),(25,17)],'ink')
 d.poly([(12,13),(13,8),(18,5),(25,7),(28,13),(30,15),(10,16)],'gold')
 d.poly([(14,10),(18,6),(21,7),(19,12),(13,13)],'white')
 d.rect((19,7,21,14),'copper');d.line([(10,16),(29,15)],'hair')
 return human(d,head_start,width=.85)

def warden():
 d=Drawing()
 # A hollow ring, hinged bronze limbs, stone-dark robe: no borrowed human face.
 d.oval((7,5,33,31),'gold');d.oval((10,8,30,28),'ink')
 for x in (15,25):
  d.poly([(x-3,45),(x+3,45),(x+4,61),(x+1,65),(x-4,61)],'shade');d.poly([(x-4,61),(x+3,61),(x+6,68),(x-5,68)],'navy')
 d.poly([(13,24),(27,24),(29,40),(31,57),(24,60),(20,53),(15,59),(9,55),(12,39)],'green')
 d.poly([(13,26),(18,28),(17,45),(12,55),(9,55),(12,39)],'teal')
 d.poly([(24,26),(27,28),(29,51),(24,57),(22,43)],'navy')
 d.poly([(13,25),(20,22),(27,25),(25,36),(20,40),(14,35)],'gold')
 d.poly([(16,27),(23,27),(23,33),(20,36),(17,33)],'ice')
 d.line([(20,40),(20,52)],'gold',2)
 for x,dx in [(10,-1),(30,1)]:
  d.oval((x-3,26,x+3,32),'gold');d.line([(x,32),(x+dx*3,41),(x+dx*2,48)],'shade',4);d.line([(x,32),(x+dx*3,41)],'steel',2);d.poly([(x-3,46),(x+3,46),(x+3,52),(x,55),(x-3,52)],'gold')
 d.poly([(15,13),(25,13),(27,17),(25,23),(20,26),(14,22),(13,17)],'steel')
 d.poly([(15,13),(21,13),(18,18),(14,21),(13,17)],'silver')
 d.poly([(17,17),(23,17),(24,19),(21,21),(16,20)],'navy');d.line([(17,18),(23,18)],'ice')
 # Right-hand hooked signal staff, distinct from the Emperor's machinery.
 d.line([(7,38),(6,65)],'gold',2);d.line([(7,39),(3,35),(3,30),(7,27)],'gold',2)
 return d

def export():
 out=Path(__file__).resolve().parents[3]/'public/art/vector'
 for name,model in [('bram',bram),('sluice-keeper',warden)]:
  (out/f'{name}.svg').write_text(model().svg())
 print('Exported Bram and Sanctuary Warden SVG actors')
if __name__=='__main__':export()
