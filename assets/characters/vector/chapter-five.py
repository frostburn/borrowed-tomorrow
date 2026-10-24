"""Native Chapter Five cast. Each person has an independent silhouette and portrait."""
from pathlib import Path
from draw import human, Drawing, boots, sleeve
ROOT=Path(__file__).resolve().parents[3]

def alda():
 d=Drawing()
 for x in (15,25):
  d.poly([(x-3,44),(x+3,44),(x+2,62),(x-2,63)],'navy');boots(d,x,top=61,bottom=67)
 d.cloth([(12,27),(27,27),(31,39),(29,52),(25,57),(13,55),(9,41)],'blue')
 d.poly([(13,28),(19,31),(17,51),(12,54),(9,41)],'blue-light')
 d.poly([(22,28),(27,28),(29,49),(24,54),(23,39)],'blue-shadow')
 sleeve(d,(11,30),(7,38),(9,46),'blue');sleeve(d,(28,30),(32,38),(30,45),'blue')
 d.poly([(12,31),(19,37),(29,29),(25,25),(19,29)],'cream')
 d.line([(15,45),(27,44)],'hair',2);d.rect((18,44,23,47),'gold')
 head_start=len(d.shapes)
 d.poly([(12,12),(17,6),(26,8),(29,18),(26,29),(15,29),(11,22)],'silver')
 d.poly([(15,13),(24,12),(27,19),(24,26),(18,27),(13,21)],'skin')
 d.poly([(12,13),(15,6),(25,8),(28,14),(21,12),(17,16)],'slate')
 d.poly([(12,14),(15,17),(14,25),(11,22)],'silver');d.poly([(26,16),(28,19),(27,27),(25,25)],'shade')
 d.line([(15,18),(18,18)],'ink');d.line([(22,18),(25,18)],'ink')
 d.line([(18,24),(22,24)],'rose');d.poly([(10,10),(15,5),(26,7),(28,12),(13,14)],'navy');d.rect((17,9,22,11),'gold')
 return human(d,head_start)

def hester():
 d=Drawing()
 for x in (15,25):
  d.poly([(x-4,43),(x+4,43),(x+3,62),(x-2,63)],'navy');boots(d,x,top=61,bottom=67)
 d.cloth([(10,27),(28,27),(32,40),(28,53),(12,53),(8,40)],'cream')
 d.poly([(14,26),(26,26),(28,55),(22,61),(12,56)],'brown');d.poly([(15,28),(19,30),(17,51),(13,55)],'copper')
 sleeve(d,(10,30),(6,38),(9,46),'cream');sleeve(d,(29,30),(34,37),(31,45),'cream')
 d.line([(15,45),(28,46)],'hair',2);d.rect((17,39,24,45),'leather')
 d.line([(31,44),(34,24)],'steel',2);d.poly([(32,22),(37,21),(38,27),(34,29)],'gold')
 head_start=len(d.shapes)
 d.poly([(12,12),(18,7),(26,10),(29,18),(26,28),(17,29),(12,22)],'hair')
 d.poly([(15,13),(24,13),(27,19),(24,26),(18,27),(14,21)],'skin')
 d.poly([(12,13),(17,6),(26,8),(29,15),(22,13),(18,16)],'copper')
 d.poly([(13,12),(16,9),(27,12),(28,15),(15,14)],'red');d.oval((8,16,14,23),'hair')
 d.line([(15,18),(18,18)],'ink');d.line([(23,18),(26,18)],'ink');d.line([(18,24),(23,24)],'rose')
 d.poly([(13,22),(16,23),(16,25),(13,24)],'shade')
 return human(d,head_start)

def durn():
 d=Drawing()
 for x in (15,25):
  d.poly([(x-3,44),(x+3,44),(x+2,61),(x-2,64)],'navy');boots(d,x,top=61,bottom=67)
 d.cloth([(12,26),(27,26),(30,37),(30,58),(23,57),(20,48),(16,57),(9,55),(10,37)],'green')
 d.poly([(13,28),(18,30),(16,50),(10,54),(11,38)],'green-light');d.poly([(23,28),(28,29),(29,55),(24,53)],'green-shadow')
 sleeve(d,(11,29),(7,37),(9,45),'green');sleeve(d,(28,29),(32,36),(30,44),'green')
 d.poly([(15,25),(20,33),(26,25),(22,24),(19,28)],'gold');d.line([(13,43),(28,43)],'hair',2)
 d.rect((27,42,33,49),'gold');d.rect((28,43,32,46),'white')
 head_start=len(d.shapes)
 d.poly([(13,11),(24,10),(28,17),(27,25),(23,30),(18,30),(13,25),(11,18)],'skin')
 d.poly([(12,12),(17,6),(25,8),(29,15),(26,17),(23,11),(15,13),(13,19)],'hair')
 d.poly([(23,17),(27,18),(25,26),(20,29),(21,25)],'brown')
 d.line([(14,16),(18,16)],'hair',2);d.line([(22,16),(26,17)],'hair',2)
 d.line([(14,19),(17,19)],'ink');d.line([(23,19),(26,19)],'ink')
 d.poly([(20,18),(18,23),(22,23)],'copper');d.line([(17,26),(23,26)],'hair')
 return human(d,head_start)

def aurel():
 d=Drawing()
 for x in (14,26):
  d.poly([(x-4,43),(x+4,43),(x+2,62),(x-2,64)],'navy');boots(d,x,top=61,bottom=67)
 d.cloth([(9,27),(30,27),(34,39),(31,58),(23,56),(20,49),(16,56),(6,57),(7,39)],'plum')
 d.poly([(9,28),(17,32),(14,53),(7,56),(7,38)],'plum-light');d.poly([(25,29),(30,29),(32,51),(27,55)],'plum-shadow')
 d.poly([(8,27),(14,26),(17,33),(6,33)],'gold');d.poly([(25,26),(31,27),(34,33),(25,32)],'gold')
 sleeve(d,(8,33),(4,40),(7,47),'plum');sleeve(d,(31,33),(35,40),(32,46),'plum')
 d.line([(7,47),(6,30)],'steel',2);d.line([(2,45),(11,45)],'gold',2)
 d.cloth([(12,27),(20,35),(27,27),(24,24),(19,30)],'cream');d.line([(10,44),(30,44)],'hair',2);d.rect((18,42,23,46),'gold')
 head_start=len(d.shapes)
 d.poly([(11,13),(16,7),(26,9),(30,17),(28,26),(24,31),(16,31),(11,26),(9,18)],'skin')
 d.poly([(10,14),(13,7),(24,6),(29,11),(30,16),(27,18),(25,12),(15,12),(12,17),(12,20),(10,19)],'silver')
 d.poly([(24,17),(29,18),(28,26),(24,31),(20,31),(20,28),(25,25)],'copper')
 d.line([(12,16),(17,16)],'shade',2);d.line([(22,16),(27,16)],'shade',2)
 d.line([(13,19),(17,19)],'ink');d.line([(23,19),(27,19)],'ink')
 d.poly([(20,18),(18,23),(23,23),(21,21)],'copper');d.line([(15,26),(24,26)],'hair')
 d.poly([(12,22),(14,23),(15,27),(13,26)],'cream')
 return human(d,head_start)

def watch_soldier(gunner=False,enna=False):
 d=Drawing()
 for x in (14,26):
  d.poly([(x-3,44),(x+3,44),(x+2,62),(x-2,63)],'navy');boots(d,x,top=61,bottom=67)
 d.poly([(11,28),(28,28),(31,40),(28,55),(13,55),(8,41)],'teal' if enna else 'slate')
 d.poly([(11,29),(17,31),(16,53),(10,52),(8,40)],'green' if enna else 'blue')
 sleeve(d,(10,31),(6,39),(9,47),'teal' if enna else 'slate');sleeve(d,(29,31),(33,39),(30,47),'teal' if enna else 'slate')
 d.line([(12,45),(28,45)],'hair',2);d.rect((18,44,23,47),'gold')
 if gunner:
  d.rect((5,42,29,46),'brown');d.line([(13,43),(13,35),(24,35),(24,44)],'steel',2);d.line([(28,40),(35,39)],'steel',2)
 else:
  d.poly([(2,34),(11,32),(15,38),(14,54),(8,59),(1,51)],'steel');d.poly([(3,36),(9,35),(10,53),(7,55),(3,49)],'navy')
  d.line([(31,47),(33,28)],'steel',2);d.line([(28,43),(36,43)],'gold',2)
 head_start=len(d.shapes)
 d.poly([(12,13),(18,8),(26,11),(29,19),(25,28),(17,28),(11,20)],'skin')
 if enna:
  d.poly([(10,18),(11,11),(18,6),(26,8),(30,16),(25,15),(19,11),(15,18),(15,29),(10,26)],'hair');d.poly([(25,18),(28,17),(28,27),(25,29)],'hair')
  d.poly([(12,28),(19,31),(26,27),(27,32),(20,36),(11,32)],'leaf')
 else:
  d.poly([(9,17),(12,8),(21,5),(29,11),(31,19),(22,17),(14,19)],'navy' if gunner else 'steel');d.line([(12,17),(28,17)],'gold',2)
 d.line([(14,20),(17,20)],'ink');d.line([(23,20),(26,20)],'ink');d.line([(17,25),(22,25)],'rose')
 return human(d,head_start)

def dawn_portrait(name):
 # Initial Enna seed only; Aurel's portrait is a hand-authored SVG original.
 body='<path d="M0 128V110L23 91L47 82H80L106 94L128 118V128Z" fill="#638487"/><path d="M43 79L44 100L63 111L83 96L79 79Z" fill="#a96f50"/><path d="M26 35L36 14L59 5L87 13L101 36L96 88L82 95L29 85L21 62Z" fill="#453a37"/><path d="M38 30L60 19L82 30L92 54L85 77L66 91L46 80L33 57Z" fill="#ce9471"/><path d="M80 34L92 54L85 77L66 91L66 82L78 69Z" fill="#a56e55"/><path d="M26 43L35 15L59 5L87 13L101 36L89 44L70 24L48 30L39 47L34 84L25 77L21 60Z" fill="#453a37"/><path d="M40 49L53 46L55 50L42 53Z M73 47L86 50L85 54L72 51Z" fill="#233543"/><path d="M48 49H53V54H48Z M74 50H79V55H74Z" fill="#263e53"/><path d="M62 50L57 67L65 70L67 65Z" fill="#b37b5a"/><path d="M53 76L64 78L75 75L69 81L59 81Z" fill="#9e6157"/><path d="M23 94L46 86L64 107L82 87L107 99L72 121L48 115Z" fill="#8ca66d"/>'
 return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>'+name+' portrait</title><path d="M0 0H128V128H0Z" fill="#203b49"/>'+body+'</svg>\n'

def portrait(name):
 # Initial female seeds only; the published portrait SVGs remain editable originals.
 hair='#707b88' if name=='alda' else '#8e5239'
 coat='#4e738a' if name=='alda' else '#7e573e'
 body=f'<path d="M0 128V109L24 88L49 80H79L104 91L128 116V128Z" fill="{coat}"/>'
 body+='<path d="M47 78L47 98L64 111L82 96L79 77Z" fill="#b77b59"/>'
 body+=f'<path d="M27 36L33 14L57 5L85 13L100 34L98 80L85 93L30 84L22 61Z" fill="{hair}"/>'
 body+='<path d="M37 31L60 18L83 31L92 55L86 77L68 92L48 81L34 59Z" fill="#d6a27d"/>'
 body+='<path d="M79 34L92 54L86 77L68 92L65 84L78 71Z" fill="#ae775c"/>'
 body+=f'<path d="M28 40L35 15L57 5L85 13L98 32L85 39L69 24L48 30L39 45Z" fill="{hair}"/>'
 if name=='alda':body+='<path d="M28 29L39 9L63 3L88 16L97 35L67 23L34 37Z" fill="#263e53"/><path d="M54 15H73V23H54Z" fill="#d9ae62"/><path d="M29 40L39 44L34 67L39 84L29 77L23 59Z" fill="#b7c1b8"/><path d="M20 91L47 87L64 110L80 87L107 97L72 121L51 114Z" fill="#d8c59b"/>'
 if name=='hester':body+='<path d="M28 25L43 14L87 23L96 37L48 28L30 36Z" fill="#ac5c48"/><path d="M17 48L31 39L33 67L24 82L14 70Z" fill="#593e35"/><path d="M35 98L46 87L53 117L84 128H39Z" fill="#b7784e"/><path d="M35 64L43 65L45 73L37 71Z" fill="#77766c"/>'
 body+='<path d="M41 48L53 46L55 50L42 52Z M72 47L86 49L85 53L72 51Z" fill="#233543"/><path d="M48 49H53V53H48Z M74 50H79V54H74Z" fill="#243c4c"/>'
 body+='<path d="M61 49L57 67L65 69L67 65Z" fill="#bc825f"/><path d="M52 76L64 78L75 75L68 81L59 81Z" fill="#9e6157"/>'
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>{name} portrait</title><path d="M0 0H128V128H0Z" fill="#203b49"/>{body}</svg>\n'

def export():
 for name,model in [('alda',alda),('hester',hester),('durn',durn),('aurel',aurel),('enna',lambda:watch_soldier(enna=True)),('dawn-soldier',watch_soldier),('dawn-gunner',lambda:watch_soldier(gunner=True))]:
  (ROOT/f'public/art/vector/{name}.svg').write_text(model().svg())
  # Portraits become editable originals after their initial seed.
  path=ROOT/f'public/art/vector/portrait-{name}.svg'
  if name in ('alda','hester','enna') and not path.exists():path.write_text(dawn_portrait(name) if name=='enna' else portrait(name))
 print('Exported Chapter Five cast and Dawnwatch troops with native SVG actors; retained editable portrait originals.')
if __name__=='__main__':
 export()
 from windmere import export as export_windmere
 export_windmere()
