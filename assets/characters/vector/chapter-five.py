"""Native Act I cast. Each person has an independent silhouette and portrait."""
from pathlib import Path
from draw import Drawing, boots, sleeve
ROOT=Path(__file__).resolve().parents[3]

def alda():
 d=Drawing()
 for x in (15,25):
  d.poly([(x-3,44),(x+3,44),(x+2,62),(x-2,63)],'navy');boots(d,x,top=61,bottom=68)
 d.poly([(12,27),(27,27),(31,39),(29,52),(25,57),(13,55),(9,41)],'blue')
 d.poly([(13,28),(19,31),(17,51),(12,54),(9,41)],'teal')
 d.poly([(22,28),(27,28),(29,49),(24,54),(23,39)],'navy')
 sleeve(d,(11,30),(7,38),(9,46),'blue');sleeve(d,(28,30),(32,38),(30,45),'blue')
 d.poly([(12,31),(19,37),(29,29),(25,25),(19,29)],'cream')
 d.line([(15,45),(27,44)],'hair',2);d.rect((18,44,23,47),'gold')
 d.poly([(12,12),(17,6),(26,8),(29,18),(26,29),(15,29),(11,22)],'silver')
 d.poly([(15,13),(24,12),(27,19),(24,26),(18,27),(13,21)],'skin')
 d.poly([(12,13),(15,6),(25,8),(28,14),(21,12),(17,16)],'slate')
 d.poly([(12,14),(15,17),(14,25),(11,22)],'silver');d.poly([(26,16),(28,19),(27,27),(25,25)],'shade')
 d.line([(15,18),(18,18)],'ink');d.line([(22,18),(25,18)],'ink')
 d.line([(18,24),(22,24)],'rose');d.poly([(10,10),(15,5),(26,7),(28,12),(13,14)],'navy');d.rect((17,9,22,11),'gold')
 return d

def hester():
 d=Drawing()
 for x in (15,25):
  d.poly([(x-4,43),(x+4,43),(x+3,62),(x-2,63)],'navy');boots(d,x,top=61,bottom=68)
 d.poly([(10,27),(28,27),(32,40),(28,53),(12,53),(8,40)],'cream')
 d.poly([(14,26),(26,26),(28,55),(22,61),(12,56)],'brown');d.poly([(15,28),(19,30),(17,51),(13,55)],'copper')
 sleeve(d,(10,30),(6,38),(9,46),'cream');sleeve(d,(29,30),(34,37),(31,45),'cream')
 d.line([(15,45),(28,46)],'hair',2);d.rect((17,39,24,45),'leather')
 d.line([(31,44),(34,24)],'steel',2);d.poly([(32,22),(37,21),(38,27),(34,29)],'gold')
 d.poly([(12,12),(18,7),(26,10),(29,18),(26,28),(17,29),(12,22)],'hair')
 d.poly([(15,13),(24,13),(27,19),(24,26),(18,27),(14,21)],'skin')
 d.poly([(12,13),(17,6),(26,8),(29,15),(22,13),(18,16)],'copper')
 d.poly([(13,12),(16,9),(27,12),(28,15),(15,14)],'red');d.oval((8,16,14,23),'hair')
 d.line([(15,18),(18,18)],'ink');d.line([(23,18),(26,18)],'ink');d.line([(18,24),(23,24)],'rose')
 d.poly([(13,22),(16,23),(16,25),(13,24)],'shade')
 return d

def durn():
 d=Drawing()
 for x in (15,25):
  d.poly([(x-3,44),(x+3,44),(x+2,61),(x-2,64)],'navy');boots(d,x,top=61,bottom=68)
 d.poly([(12,26),(27,26),(30,37),(30,58),(23,57),(20,48),(16,57),(9,55),(10,37)],'green')
 d.poly([(13,28),(18,30),(16,50),(10,54),(11,38)],'teal');d.poly([(23,28),(28,29),(29,55),(24,53)],'navy')
 sleeve(d,(11,29),(7,37),(9,45),'green');sleeve(d,(28,29),(32,36),(30,44),'green')
 d.poly([(15,25),(20,33),(26,25),(22,24),(19,28)],'gold');d.line([(13,43),(28,43)],'hair',2)
 d.rect((27,42,33,49),'gold');d.rect((28,43,32,46),'white')
 d.poly([(13,11),(24,10),(28,17),(26,27),(20,31),(14,25),(11,18)],'skin')
 d.poly([(12,12),(17,6),(25,8),(29,15),(26,17),(23,11),(15,13),(13,19)],'hair')
 d.poly([(23,17),(27,18),(25,26),(20,29),(21,25)],'brown')
 d.line([(14,18),(18,17)],'ink');d.line([(22,17),(26,18)],'ink');d.line([(17,25),(23,25)],'hair')
 return d

def portrait(name):
 # Broad female face planes for Alda/Hester; Durn has a narrower angular construction.
 female=name!='durn';hair='#707b88' if name=='alda' else '#8e5239' if name=='hester' else '#403934'
 coat='#4e738a' if name=='alda' else '#7e573e' if name=='hester' else '#365c50'
 body=f'<path d="M0 128V109L24 88L49 80H79L104 91L128 116V128Z" fill="{coat}"/>'
 body+='<path d="M47 78L47 98L64 111L82 96L79 77Z" fill="#b77b59"/>'
 body+=f'<path d="M27 36L33 14L57 5L85 13L100 34L98 80L85 93L30 84L22 61Z" fill="{hair}"/>'
 body+='<path d="M37 31L60 18L83 31L92 55L86 77L68 92L48 81L34 59Z" fill="#d6a27d"/>' if female else '<path d="M39 30L66 20L89 37L91 61L79 85L62 94L44 76L35 52Z" fill="#c9956d"/>'
 body+='<path d="M79 34L92 54L86 77L68 92L65 84L78 71Z" fill="#ae775c"/>'
 body+=f'<path d="M28 40L35 15L57 5L85 13L98 32L85 39L69 24L48 30L39 45Z" fill="{hair}"/>'
 if name=='alda':body+='<path d="M28 29L39 9L63 3L88 16L97 35L67 23L34 37Z" fill="#263e53"/><path d="M54 15H73V23H54Z" fill="#d9ae62"/><path d="M29 40L39 44L34 67L39 84L29 77L23 59Z" fill="#b7c1b8"/><path d="M20 91L47 87L64 110L80 87L107 97L72 121L51 114Z" fill="#d8c59b"/>'
 if name=='hester':body+='<path d="M28 25L43 14L87 23L96 37L48 28L30 36Z" fill="#ac5c48"/><path d="M17 48L31 39L33 67L24 82L14 70Z" fill="#593e35"/><path d="M35 98L46 87L53 117L84 128H39Z" fill="#b7784e"/><path d="M35 64L43 65L45 73L37 71Z" fill="#77766c"/>'
 if name=='durn':body+='<path d="M30 36L40 13L68 7L88 19L97 38L83 35L69 22L43 31L36 52Z" fill="#403934"/><path d="M45 92L63 106L81 90L91 97L65 121L38 102Z" fill="#d9ae62"/>'
 body+='<path d="M41 48L53 46L55 50L42 52Z M72 47L86 49L85 53L72 51Z" fill="#233543"/><path d="M48 49H53V53H48Z M74 50H79V54H74Z" fill="#243c4c"/>'
 body+='<path d="M61 49L57 67L65 69L67 65Z" fill="#bc825f"/><path d="M52 76L64 78L75 75L68 81L59 81Z" fill="#9e6157"/>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>{name} portrait</title><path d="M0 0H128V128H0Z" fill="#203b49"/>{body}</svg>\n'

def export():
 for name,model in [('alda',alda),('hester',hester),('durn',durn)]:
  (ROOT/f'public/art/vector/{name}.svg').write_text(model().svg())
  # Portraits become editable originals after their initial seed.
  path=ROOT/f'public/art/vector/portrait-{name}.svg'
  if not path.exists():path.write_text(portrait(name))
 print('Exported Alda, Hester and Durn with native SVG actors; retained editable portrait originals.')
if __name__=='__main__':export()
