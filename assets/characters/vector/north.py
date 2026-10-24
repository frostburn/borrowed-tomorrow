"""Skeld's expedition cast. Compact native actors; three individual portrait geometries."""
from pathlib import Path
from draw import human, Drawing,boots,sleeve
ROOT=Path(__file__).resolve().parents[3];ART=ROOT/'public/art/vector'
def actor(name):
 d=Drawing();color={'edric':'navy','signe':'blue','egil':'plum'}[name]
 for x in (15,25):boots(d,x,60,67)
 d.cloth([(11,28),(28,28),(33,44),(30,62),(23,64),(20,60),(10,63),(7,59),(9,42)],color)
 d.poly([(12,30),(19,34),(17,56),(11,60),(9,56)],color+'-light')
 d.poly([(25,29),(29,32),(32,46),(29,60),(24,62),(23,48)],color+'-shadow')
 sleeve(d,(10,31),(6,41),(10,49),color);sleeve(d,(29,31),(34,42),(29,49),color)
 d.poly([(10,28),(19,33),(29,27),(31,32),(22,41),(10,33)],'silver');d.line([(12,46),(29,46)],'leather',2)
 head_start=len(d.shapes)
 d.poly([(11,14),(16,9),(26,10),(30,17),(28,27),(23,31),(15,29),(10,23)],'skin')
 d.poly([(24,13),(29,18),(27,26),(22,30),(20,27),(23,23)],'copper')
 if name=='signe':
  d.poly([(10,19),(9,12),(15,7),(24,6),(29,11),(31,18),(26,16),(23,12),(17,13),(12,21)],'hair');d.poly([(27,21),(30,24),(29,33),(33,38),(29,44),(26,40),(27,33),(25,27)],'hair')
  d.line([(13,20),(17,20)],'hair');d.line([(23,20),(27,21)],'hair');d.line([(14,22),(17,22)],'ink');d.line([(24,22),(26,22)],'ink');d.line([(17,27),(23,27)],'rose');d.line([(7,48),(3,65)],'steel',3)
 elif name=='edric':
  d.poly([(10,17),(9,11),(15,6),(22,8),(29,8),(31,15),(27,18),(24,12),(16,13)],'silver');d.poly([(12,25),(17,28),(23,27),(28,23),(27,31),(21,36),(14,32)],'shade');d.line([(12,20),(18,19)],'hair',2);d.line([(23,19),(29,20)],'hair',2);d.line([(14,22),(17,22)],'ink');d.line([(24,22),(27,22)],'ink');d.line([(18,29),(23,29)],'cream');d.poly([(11,10),(11,4),(15,8),(20,3),(25,8),(29,4),(29,11)],'gold')
 else:
  d.poly([(9,17),(10,8),(17,4),(27,7),(32,15),(28,20),(24,13),(16,13)],'navy');d.line([(10,15),(29,15)],'silver',3);d.poly([(10,25),(14,29),(24,29),(28,24),(28,33),(21,38),(13,34)],'cream');d.line([(12,20),(18,19)],'silver',2);d.line([(23,19),(29,20)],'silver',2);d.line([(14,22),(17,22)],'ink');d.line([(24,22),(27,22)],'ink');d.line([(18,30),(23,30)],'brown');d.line([(31,49),(35,64)],'leather',3)
 return human(d,head_start)
portraits={
'edric':'''<path d="M0 128V106L30 87L48 79H84L110 96L128 115V128Z" fill="#263e53"/><path d="M23 40L31 22L55 14L83 20L100 40L98 68L85 91L70 105L48 98L29 80L20 55Z" fill="#c18c69"/><path d="M78 25L99 41L96 69L81 91L66 102L62 87L80 72Z" fill="#966a53"/><path d="M21 44L25 27L38 16L56 12L83 17L101 33L99 48L85 37L78 28L47 29L32 43Z" fill="#b7c1b8"/><path d="M24 33L22 15L33 22L45 6L58 21L74 8L86 23L99 17L97 36L65 30Z" fill="#c8ab75"/><path d="M30 53L52 48L55 54L31 60Z M73 48L94 52L93 59L72 54Z" fill="#5b5d5b"/><path d="M39 57H47V62H39Z M79 56H87V61H79Z" fill="#233b55"/><path d="M62 53L55 76L67 81L73 74Z" fill="#a16e55"/><path d="M30 77L48 86L75 86L94 71L89 94L72 112L47 104L32 91Z" fill="#8c9999"/><path d="M49 87L63 90L77 85L72 93L57 95Z" fill="#e5d1af"/><path d="M22 99L42 89L64 118L87 91L112 103L89 128H42Z" fill="#b7c1b8"/><path d="M63 115L71 128H57Z" fill="#c8ab75"/>''',
'signe':'''<path d="M0 128V110L28 91L46 82H83L108 98L128 118V128Z" fill="#547a96"/><path d="M47 72L45 96L63 108L81 95L77 71Z" fill="#b47d60"/><path d="M23 39L31 18L55 10L80 14L97 34L100 64L89 85L73 94L30 88L20 65Z" fill="#593e35"/><path d="M36 37L52 24L76 27L89 45L86 68L72 87L55 90L39 76L31 57Z" fill="#d49c70"/><path d="M77 30L89 45L86 68L72 87L63 89L63 80L77 65Z" fill="#af775a"/><path d="M21 45L26 25L44 10L65 7L88 20L100 43L94 51L79 35L69 24L49 27L34 44L28 64Z" fill="#68483b"/><path d="M89 65L101 77L96 96L109 106L99 120L88 112L91 98L84 83Z" fill="#593e35"/><path d="M36 50L52 46L56 50L38 55Z M70 46L85 49L85 54L71 50Z" fill="#593e35"/><path d="M43 55H50V59H43Z M75 54H81V58H75Z" fill="#233b55"/><path d="M59 55L54 70L62 74L67 70Z" fill="#b47d60"/><path d="M50 80L61 82L73 77L68 85L58 87Z" fill="#a96760"/><path d="M24 98L43 87L64 111L83 87L111 103L81 128H47Z" fill="#b7c1b8"/><path d="M104 107L114 114L97 128H87Z" fill="#725a4d"/>''',
'egil':'''<path d="M0 128V109L24 91L46 80H86L115 98L128 115V128Z" fill="#825875"/><path d="M23 41L33 21L61 17L87 23L104 45L98 74L84 96L64 105L42 98L26 79L19 58Z" fill="#c18f6e"/><path d="M81 29L102 45L97 72L81 95L66 102L62 91L82 74Z" fill="#9b7058"/><path d="M17 46L18 27L32 9L64 4L95 16L108 39L99 50L80 35L47 34L29 49Z" fill="#263e53"/><path d="M19 34L45 25L80 28L104 39L101 50L78 39L47 37L23 47Z" fill="#8b9b9b"/><path d="M28 54L50 49L53 55L30 61Z M73 50L94 55L92 61L72 55Z" fill="#b7c1b8"/><path d="M36 59H44V64H36Z M79 60H87V65H79Z" fill="#233b55"/><path d="M60 56L53 77L65 82L72 74Z" fill="#a57256"/><path d="M26 76L45 87L74 89L97 73L94 96L77 113L48 113L30 97Z" fill="#c4c8b7"/><path d="M46 88L61 93L79 87L73 96L56 99Z" fill="#80553d"/><path d="M19 99L41 91L64 120L89 92L113 103L89 128H37Z" fill="#687478"/><path d="M24 107L37 104L49 128H32Z" fill="#c8ab75"/>'''
}
for name in portraits:
 (ART/f'{name}.svg').write_text(actor(name).svg())
 p=ART/f'portrait-{name}.svg'
 if not p.exists():p.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>{name} portrait</title><path d="M0 0H128V128H0Z" fill="#3a5368"/>{portraits[name]}</svg>\n')
print('Exported Edric, Signe and Egil; retained editable portraits.')
