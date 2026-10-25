"""Namar cast: original native actors, distinct female/male portrait planes.
Portraits are seeded once, then retained as editable SVG originals.
"""
from pathlib import Path
from draw import human, Drawing,boots,sleeve
ROOT=Path(__file__).resolve().parents[3]
ART=ROOT/'public/art/vector'
def samira():
 d=Drawing()
 for x in (15,25):boots(d,x,top=61,bottom=67)
 d.cloth([(12,27),(28,27),(32,41),(34,64),(25,65),(20,61),(12,65),(6,62),(9,40)],'teal')
 d.poly([(15,29),(21,33),(19,55),(12,62),(8,61),(10,41)],'teal-shadow')
 d.poly([(23,29),(28,30),(32,61),(26,63),(23,51)],'teal-shadow')
 sleeve(d,(10,30),(6,40),(10,46),'teal');sleeve(d,(29,30),(33,40),(30,46),'teal')
 d.poly([(12,26),(20,32),(28,26),(29,31),(20,38),(10,31)],'gold')
 d.line([(13,46),(27,46)],'gold',2);d.line([(16,48),(14,60)],'cream',1)
 head_start=len(d.shapes)
 d.poly([(11,14),(15,7),(25,8),(29,15),(28,30),(25,33),(12,31),(9,24)],'hair')
 d.poly([(14,14),(23,12),(27,18),(25,25),(20,29),(14,25),(12,20)],'copper')
 d.poly([(23,17),(27,18),(25,25),(20,29),(20,25)],'brown')
 d.poly([(10,16),(14,7),(25,8),(29,16),(25,17),(21,12),(15,16),(13,28),(10,25)],'navy')
 d.poly([(12,12),(14,8),(19,12),(23,8),(28,12),(27,16),(12,16)],'gold')
 d.line([(14,20),(17,20)],'ink');d.line([(22,20),(25,20)],'ink');d.line([(17,25),(22,25)],'rose')
 d.oval((10,23,13,27),'gold');d.oval((26,23,29,27),'gold')
 return human(d,head_start,complexion='copper')
def sahir():
 d=Drawing()
 for x in (14,26):boots(d,x,top=61,bottom=67)
 d.cloth([(10,27),(30,27),(34,43),(33,62),(24,63),(20,55),(16,63),(7,61),(7,42)],'plum')
 d.poly([(11,29),(18,32),(16,57),(9,60),(8,42)],'plum-light');d.poly([(24,30),(30,31),(33,61),(26,61)],'plum-shadow')
 sleeve(d,(8,31),(5,41),(10,47),'plum');sleeve(d,(31,31),(35,41),(31,46),'plum')
 d.poly([(11,27),(20,35),(30,27),(26,24),(20,29),(15,25)],'cream');d.line([(12,46),(30,46)],'gold',2)
 head_start=len(d.shapes)
 d.poly([(11,13),(17,8),(26,10),(30,17),(28,28),(24,33),(16,32),(11,26),(9,18)],'skin')
 d.poly([(23,16),(29,17),(28,26),(24,31),(20,31),(20,27),(25,24)],'copper')
 d.poly([(11,22),(15,25),(24,25),(29,22),(27,31),(23,35),(15,31)],'hair')
 d.poly([(8,16),(12,7),(25,5),(31,12),(31,18),(23,15),(13,18)],'cream');d.line([(12,13),(29,11)],'gold',2)
 d.line([(12,19),(17,19)],'hair',2);d.line([(23,19),(28,19)],'hair',2)
 d.line([(13,21),(16,21)],'ink');d.line([(24,21),(27,21)],'ink')
 head_end=len(d.shapes)
 d.rect((28,44,35,51),'gold')
 return human(d,head_start,head_end)
def amal():
 d=Drawing()
 for x in (14,25):
  d.poly([(x-3,45),(x+4,45),(x+2,63),(x-2,64)],'navy');boots(d,x,top=61,bottom=67)
 d.cloth([(10,28),(28,28),(31,41),(28,56),(20,52),(13,56),(8,43)],'blue')
 d.poly([(11,30),(17,34),(15,51),(10,54)],'blue-light');d.poly([(24,30),(28,30),(30,48),(26,53)],'blue-shadow')
 sleeve(d,(10,32),(6,40),(9,48),'blue');sleeve(d,(28,32),(33,40),(30,47),'blue')
 d.line([(12,28),(28,47)],'gold',3);d.poly([(23,42),(33,40),(35,51),(26,55)],'leather');d.rect((27,45,31,48),'cream')
 head_start=len(d.shapes)
 d.poly([(11,13),(17,7),(25,9),(29,17),(26,28),(17,29),(11,22)],'hair')
 d.poly([(14,14),(23,12),(27,18),(24,26),(18,27),(13,21)],'skin')
 d.poly([(24,17),(27,18),(25,25),(21,28),(20,25)],'copper')
 d.poly([(9,17),(12,9),(19,5),(27,10),(31,17),(26,16),(20,11),(15,16),(12,25),(9,22)],'cream')
 d.poly([(12,24),(16,29),(14,36),(18,39),(14,43),(10,37),(12,32),(9,28)],'hair')
 d.line([(14,19),(18,19)],'ink');d.line([(23,19),(26,20)],'ink');d.line([(18,24),(23,24)],'rose')
 d.poly([(12,29),(20,34),(27,28),(28,32),(20,39),(12,34)],'cream')
 return human(d,head_start)
portraits={
 'samira':'''<path d="M0 128V112L24 94L45 85H80L110 98L128 119V128Z" fill="#497c7b"/><path d="M48 76L46 96L63 108L82 94L78 74Z" fill="#9a654e"/><path d="M27 31L40 9L72 5L94 22L102 55L94 90L75 98L28 91L18 61Z" fill="#303e49"/><path d="M35 39L53 22L79 30L91 52L85 75L67 91L48 83L34 63Z" fill="#bb805c"/><path d="M77 32L91 52L85 75L67 91L65 83L77 66Z" fill="#8f5b4c"/><path d="M28 38L33 19L46 26L58 13L71 24L86 15L97 34L94 43L74 38L52 32L34 45Z" fill="#cba35b"/><path d="M39 52L53 48L56 51L42 55Z M72 49L85 52L84 56L71 53Z" fill="#293743"/><path d="M47 53H52V57H47Z M75 54H80V58H75Z" fill="#142536"/><path d="M63 54L58 69L65 72L68 68Z" fill="#a56b4f"/><path d="M52 78L64 79L75 76L69 83L60 84Z" fill="#794e48"/><path d="M35 70L30 82L35 88L40 80Z M89 70L86 82L91 87L96 78Z" fill="#e2b86b"/><path d="M21 101L42 90L64 112L85 90L112 103L78 127H49Z" fill="#bd9654"/><path d="M60 106L64 117L69 106Z" fill="#6fa8a1"/>''',
 'sahir':'''<path d="M0 128V107L27 88L44 80H83L113 96L128 112V128Z" fill="#795165"/><path d="M45 70L43 93L62 107L85 91L80 69Z" fill="#ab775a"/><path d="M26 32L41 14L77 14L96 34L98 59L89 83L73 97L48 96L29 81L21 55Z" fill="#ce936a"/><path d="M78 33L98 48L91 77L75 95L60 94L63 84L79 72Z" fill="#a56e52"/><path d="M22 65L39 77L59 80L80 74L96 59L92 89L74 108L49 105L28 89Z" fill="#503c36"/><path d="M17 37L24 15L52 2L81 4L103 24L106 42L79 35L52 39L28 47Z" fill="#d8c59b"/><path d="M23 29L54 18L98 22L103 29L57 25L23 36Z" fill="#a6855a"/><path d="M29 50L48 46L52 51L30 55Z M72 46L92 50L91 56L72 52Z" fill="#503c36"/><path d="M37 53H44V58H37Z M78 53H85V58H78Z" fill="#142536"/><path d="M60 50L53 70L65 73L68 68Z" fill="#ae7253"/><path d="M51 85H73L68 88H55Z" fill="#bb8870"/><path d="M27 94L44 85L64 110L83 85L109 99L73 126H51Z" fill="#d2bb8a"/>''',
 'amal':'''<path d="M0 128V111L25 92L46 83H79L108 99L128 116V128Z" fill="#547a96"/><path d="M45 74L44 96L61 110L80 93L77 72Z" fill="#b27b58"/><path d="M23 36L32 14L58 4L86 14L101 37L96 81L83 94L28 86L19 60Z" fill="#593e35"/><path d="M35 33L56 21L81 29L91 53L82 77L64 92L44 81L31 57Z" fill="#d49c70"/><path d="M79 33L91 53L82 77L64 92L62 83L77 66Z" fill="#b57c59"/><path d="M20 39L27 17L51 2L81 8L101 29L101 41L77 29L54 17L36 32L27 54Z" fill="#dfcda0"/><path d="M21 51L32 50L34 76L29 87L36 99L27 110L16 96L23 86L18 73Z" fill="#593e35"/><path d="M38 49L52 47L55 51L40 54Z M71 47L86 51L84 55L70 52Z" fill="#293b49"/><path d="M46 51H51V56H46Z M75 52H80V57H75Z" fill="#142536"/><path d="M61 53L56 68L64 71L67 66Z" fill="#ba805b"/><path d="M51 76L63 78L75 74L69 81L59 83Z" fill="#ad6b5c"/><path d="M35 92L46 87L62 110L81 88L104 100L72 126H49Z" fill="#d8c59b"/><path d="M18 112L27 101L58 128H43Z" fill="#b28b53"/>'''
}
for name,model in [('samira',samira),('sahir',sahir),('amal',amal)]:
 (ART/f'{name}.svg').write_text(model().svg())
 path=ART/f'portrait-{name}.svg'
 if not path.exists():path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>{name} portrait</title><path d="M0 0H128V128H0Z" fill="#33434f"/>{portraits[name]}</svg>\n')
print('Exported Samira, Sahir and Amal. Retained editable portrait originals.')

# The city watch retains its own uniform while sharing the established human outline.
source=(ART/'dawn-soldier.svg').read_text()
colours={'#8b9b9b':'#b6a079','#263e53':'#385e61','#626d7f':'#608c80','#d9ae62':'#e3bf78'}
import re
(ART/'namar-watch.svg').write_text(re.sub(r'#[0-9a-f]{6}',lambda m:colours.get(m[0],m[0]),source))
