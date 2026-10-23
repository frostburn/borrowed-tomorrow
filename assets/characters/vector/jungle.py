"""Iria's healer and river pilot: native planar actors and editable portraits."""
from pathlib import Path
from draw import Drawing,boots,sleeve
ROOT=Path(__file__).resolve().parents[3]; ART=ROOT/'public/art/vector'
def ines():
 d=Drawing()
 for x in (15,25):boots(d,x,61,68)
 d.poly([(12,28),(28,28),(32,43),(32,63),(23,65),(19,61),(10,65),(7,61),(9,42)],'green')
 d.poly([(14,30),(20,34),(17,56),(11,62),(9,59),(11,42)],'leaf')
 d.poly([(24,29),(28,31),(31,62),(25,63),(23,50)],'teal')
 sleeve(d,(10,31),(5,40),(10,47),'green');sleeve(d,(29,31),(34,40),(30,47),'green')
 d.poly([(11,27),(20,33),(28,26),(30,31),(21,40),(11,33)],'cream')
 d.line([(14,45),(29,45)],'leather',2);d.rect((26,43,33,53),'leather');d.line([(28,47),(31,47)],'cream')
 d.poly([(10,15),(14,8),(25,8),(30,15),(27,28),(21,31),(13,27),(10,21)],'silver')
 d.poly([(13,16),(19,12),(26,16),(26,24),(22,29),(15,26),(12,21)],'copper')
 d.poly([(23,15),(27,19),(25,25),(22,29),(20,27),(23,23)],'brown')
 d.poly([(9,17),(12,9),(20,6),(27,10),(30,17),(25,16),(20,12),(14,17),(12,25),(9,23)],'silver')
 d.poly([(10,24),(14,28),(12,35),(15,39),(12,43),(8,38),(10,32),(8,28)],'shade')
 d.line([(13,19),(17,18)],'cream');d.line([(22,18),(26,19)],'cream')
 d.line([(14,21),(17,21)],'ink');d.line([(23,21),(25,21)],'ink');d.line([(17,26),(22,26)],'rose')
 d.line([(14,24),(16,24)],'brown');d.line([(24,24),(26,24)],'brown')
 return d
def tavi():
 d=Drawing()
 for x in (14,26):
  d.poly([(x-3,46),(x+4,46),(x+3,62),(x-2,63)],'navy');boots(d,x,61,68)
 d.poly([(9,29),(30,29),(34,42),(31,56),(11,56),(6,43)],'red')
 d.poly([(10,31),(19,33),(17,53),(10,55),(7,43)],'copper')
 d.poly([(25,30),(30,31),(33,43),(30,54),(24,54)],'plum')
 d.line([(9,43),(6,51),(12,53)],'brown',4);d.line([(32,43),(36,51),(30,53)],'brown',4)
 d.poly([(10,28),(19,34),(29,28),(30,33),(20,40),(10,32)],'cream');d.line([(11,48),(30,48)],'gold',2)
 d.poly([(10,15),(16,9),(26,10),(30,18),(28,29),(23,33),(14,31),(9,25)],'brown')
 d.poly([(12,16),(19,13),(26,17),(27,24),(22,29),(14,27),(11,22)],'copper')
 d.poly([(9,18),(10,11),(15,6),(23,8),(28,7),(31,14),(30,19),(25,16),(22,13),(17,15),(13,19)],'hair')
 d.line([(12,20),(17,19)],'hair',2);d.line([(23,19),(28,20)],'hair',2)
 d.line([(13,22),(17,22)],'ink');d.line([(24,22),(27,22)],'ink');d.poly([(19,21),(18,26),(21,26)],'brown');d.line([(16,29),(23,29)],'hair',2)
 # A coiled painter and a short pole, both anchored to the right grip.
 d.line([(11,51),(4,36),(2,25)],'leather',3);d.oval((29,45,35,55),'gold');d.oval((30,47,34,53),'leather',None)
 return d
portraits={
 'ines':'''<path d="M0 128V109L27 91L48 82H82L110 98L128 115V128Z" fill="#385d4a"/><path d="M46 73L44 94L63 109L82 93L77 72Z" fill="#995f49"/><path d="M20 37L30 15L55 5L83 13L101 37L97 75L83 94L26 87L17 61Z" fill="#b7c1b8"/><path d="M34 36L54 23L79 29L91 51L85 73L67 91L48 84L34 66L30 49Z" fill="#b7784e"/><path d="M77 31L91 51L85 73L67 91L63 83L78 65Z" fill="#895644"/><path d="M20 40L30 18L56 5L82 14L100 35L96 48L80 33L57 23L40 35L29 57Z" fill="#d6d5bf"/><path d="M23 61L32 68L28 82L34 94L28 108L16 96L22 83L17 70Z" fill="#879b95"/><path d="M38 48L53 45L56 49L40 52Z M71 46L85 50L84 54L70 50Z" fill="#d3cda9"/><path d="M44 53H50V57H44Z M75 54H81V58H75Z" fill="#233d3c"/><path d="M61 52L55 69L64 73L68 68Z" fill="#9a6148"/><path d="M43 63L50 65 M76 65L83 63" fill="none" stroke="#8f5b48" stroke-width="2"/><path d="M51 78L63 80L74 77L68 84L59 84Z" fill="#784e45"/><path d="M25 99L44 86L63 111L82 86L110 102L76 128H49Z" fill="#d8c59b"/><path d="M15 113L29 106L49 128H35Z" fill="#9a7151"/>''',
 'tavi':'''<path d="M0 128V109L26 90L42 81H85L114 98L128 115V128Z" fill="#a95243"/><path d="M43 70L42 94L62 110L84 93L79 70Z" fill="#85573f"/><path d="M24 34L38 15L75 13L97 34L100 57L92 80L76 98L47 97L28 82L20 57Z" fill="#ae724e"/><path d="M78 31L98 47L93 77L76 97L61 94L65 83L81 69Z" fill="#80553d"/><path d="M18 43L22 23L38 9L53 13L70 6L91 15L103 32L99 49L84 41L77 29L62 33L48 27L35 40L29 51Z" fill="#493c33"/><path d="M28 51L48 46L53 51L29 57Z M72 46L93 51L92 57L72 52Z" fill="#493c33"/><path d="M36 55H44V61H36Z M79 55H87V61H79Z" fill="#233d3c"/><path d="M60 50L53 71L65 76L70 69Z" fill="#8b583f"/><path d="M34 77L49 86L72 87L89 74L85 90L74 101L48 100L34 88Z" fill="#6f503b"/><path d="M50 84L63 86L77 82L72 88L56 90Z" fill="#d8b287"/><path d="M23 97L42 85L64 111L85 85L113 102L78 128H49Z" fill="#c9b98e"/><path d="M97 102L109 109L89 128H76Z" fill="#d9ae62"/>'''
}
for name,fn in [('ines',ines),('tavi',tavi)]:
 (ART/f'{name}.svg').write_text(fn().svg())
 p=ART/f'portrait-{name}.svg'
 if not p.exists():p.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>{name} portrait</title><path d="M0 0H128V128H0Z" fill="#334b47"/>{portraits[name]}</svg>\n')
print('Exported Ines and Tavi; retained editable portraits.')
