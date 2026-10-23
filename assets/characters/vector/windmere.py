"""Windmere staff and patient. Native actors, independent male/female portrait planes."""
from pathlib import Path
from draw import Drawing,boots,sleeve
ROOT=Path(__file__).resolve().parents[3]
def model(name):
 d=Drawing();keeper=name=='iven';nurse=name=='sera';coat='cream' if keeper else 'teal' if nurse else 'brown'
 for x in (15,25):
  d.poly([(x-3,44),(x+3,44),(x+2,62),(x-2,64)],'navy');boots(d,x,top=62,bottom=67)
 d.poly([(12,28),(27,28),(31,40),(29,57),(22,56),(20,51),(17,57),(10,56),(8,41)],coat)
 d.poly([(12,29),(17,32),(16,54),(11,55),(9,41)],'silver' if keeper else 'green' if nurse else 'copper')
 sleeve(d,(11,31),(7,39),(9,47),coat);sleeve(d,(28,31),(33,39),(30,47),coat)
 d.poly([(16,28),(20,35),(25,28),(23,25),(18,26)],'white' if nurse else 'gold' if keeper else 'cream')
 if nurse:
  d.poly([(16,34),(24,34),(27,55),(13,55)],'cream');d.rect((27,41,34,49),'white');d.line([(29,45),(32,45)],'red',1)
 if keeper:d.rect((6,40,13,51),'green');d.line([(8,42),(11,42)],'gold',1)
 d.poly([(12,14),(17,8),(25,10),(29,18),(26,27),(20,30),(14,26),(11,20)] if nurse else [(12,14),(17,8),(25,10),(29,18),(28,25),(24,30),(17,30),(13,26),(11,20)],'skin')
 if nurse:
  d.poly([(10,19),(11,11),(18,6),(27,10),(30,18),(24,16),(19,12),(15,17),(14,29),(10,26)],'hair');d.oval((25,19,32,27),'hair');d.poly([(11,10),(19,6),(26,9),(25,12),(14,13)],'cream')
 elif keeper:
  d.poly([(11,18),(12,11),(18,6),(26,10),(30,18),(26,17),(23,12),(16,13),(14,20)],'silver');d.poly([(13,23),(17,26),(23,26),(28,23),(27,28),(24,32),(17,32),(14,28)],'silver');d.line([(13,18),(18,18)],'gold',1);d.line([(22,18),(27,18)],'gold',1)
 else:d.poly([(11,17),(12,11),(19,6),(27,10),(30,17),(24,14),(18,12),(14,19)],'hair')
 if not nurse:
  d.line([(13,16),(18,16)],'silver' if keeper else 'hair',2);d.line([(22,16),(27,17)],'silver' if keeper else 'hair',2)
  d.poly([(20,18),(18,23),(23,23)],'copper')
 d.line([(14,19),(17,19)],'ink');d.line([(23,19),(26,19)],'ink');d.line([(17,25),(23,25)],'rose' if nurse else 'hair')
 d.transform(0,.72,1,20,0,0)
 return d

def portrait(name):
 # Initial Sera seed only; Iven and Teren have hand-authored SVG originals.
 body='<path d="M0 128V110L28 91L48 82H80L104 94L128 115V128Z" fill="#4d7d79"/><path d="M41 89L63 107L84 89L96 128H31Z" fill="#ddd2ae"/><path d="M24 39L31 15L54 5L83 11L99 33L100 72L83 91L27 86L19 61Z" fill="#3e3736"/><path d="M36 33L57 20L79 29L91 49L87 73L68 91L47 82L32 59Z" fill="#ce9671"/><path d="M77 31L91 49L87 73L68 91L65 82L79 67Z" fill="#a77358"/><path d="M22 42L30 17L54 5L83 11L98 32L88 41L68 24L47 31L37 48L32 84L23 75Z" fill="#3e3736"/><path d="M26 20L53 6L82 13L92 26L65 20L35 32Z" fill="#e1d4ae"/><path d="M39 50L53 46L56 50L42 54Z M72 47L85 50L84 54L72 52Z" fill="#243e4c"/><path d="M48 50H53V55H48Z M73 51H78V56H73Z" fill="#203747"/><path d="M61 51L57 66L65 70L68 64Z" fill="#b67e5b"/><path d="M53 76L64 78L75 75L69 81L58 81Z" fill="#925c54"/>'
 return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>'+name+' portrait</title><path d="M0 0H128V128H0Z" fill="#233f4b"/>'+body+'</svg>\n'
def export():
 for name in ('iven','sera','teren'):
  (ROOT/f'public/art/vector/{name}.svg').write_text(model(name).svg())
  p=ROOT/f'public/art/vector/portrait-{name}.svg'
  if name=='sera' and not p.exists():p.write_text(portrait(name))
if __name__=='__main__':export()
