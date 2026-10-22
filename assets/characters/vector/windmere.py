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
 d.poly([(12,14),(17,8),(25,10),(29,18),(26,27),(20,30),(14,26),(11,20)],'skin')
 if nurse:
  d.poly([(10,19),(11,11),(18,6),(27,10),(30,18),(24,16),(19,12),(15,17),(14,29),(10,26)],'hair');d.oval((25,19,32,27),'hair');d.poly([(11,10),(19,6),(26,9),(25,12),(14,13)],'cream')
 elif keeper:
  d.poly([(11,18),(12,11),(18,6),(26,10),(30,18),(26,17),(23,12),(16,13),(14,20)],'silver');d.poly([(14,24),(20,26),(26,23),(25,28),(20,32),(15,28)],'silver');d.line([(13,18),(18,18)],'gold',1);d.line([(22,18),(27,18)],'gold',1)
 else:d.poly([(11,17),(12,11),(19,6),(27,10),(30,17),(24,14),(18,12),(14,19)],'hair')
 d.line([(14,19),(17,19)],'ink');d.line([(23,19),(26,19)],'ink');d.line([(17,25),(23,25)],'rose')
 d.transform(0,.72,1,20,0,0)
 return d

def portrait(name):
 if name=='sera':
  body='<path d="M0 128V110L28 91L48 82H80L104 94L128 115V128Z" fill="#4d7d79"/><path d="M41 89L63 107L84 89L96 128H31Z" fill="#ddd2ae"/><path d="M24 39L31 15L54 5L83 11L99 33L100 72L83 91L27 86L19 61Z" fill="#3e3736"/><path d="M36 33L57 20L79 29L91 49L87 73L68 91L47 82L32 59Z" fill="#ce9671"/><path d="M77 31L91 49L87 73L68 91L65 82L79 67Z" fill="#a77358"/><path d="M22 42L30 17L54 5L83 11L98 32L88 41L68 24L47 31L37 48L32 84L23 75Z" fill="#3e3736"/><path d="M26 20L53 6L82 13L92 26L65 20L35 32Z" fill="#e1d4ae"/><path d="M39 50L53 46L56 50L42 54Z M72 47L85 50L84 54L72 52Z" fill="#243e4c"/><path d="M48 50H53V55H48Z M73 51H78V56H73Z" fill="#203747"/><path d="M61 51L57 66L65 70L68 64Z" fill="#b67e5b"/><path d="M53 76L64 78L75 75L69 81L58 81Z" fill="#925c54"/>'
 elif name=='iven':
  body='<path d="M0 128V112L25 91L48 83H82L110 100L128 120V128Z" fill="#cbc7a8"/><path d="M42 88L64 106L84 88L90 112L65 126L35 108Z" fill="#a58f62"/><path d="M29 36L39 16L64 8L89 21L99 44L91 73L76 93L56 95L36 76L25 54Z" fill="#d1a17f"/><path d="M76 30L99 44L91 73L76 93L63 94L66 81L80 67Z" fill="#a17e67"/><path d="M26 45L29 26L40 11L64 5L91 20L100 40L94 47L83 29L60 19L39 32L35 53Z" fill="#b8c4b7"/><path d="M35 70L51 80L65 83L83 71L87 76L75 97L56 99L39 83Z" fill="#c3cbb9"/><path d="M35 48H55V61H35Z M73 48H93V61H73Z M55 52H73" fill="none" stroke="#a48f64" stroke-width="3"/><path d="M44 51H50V56H44Z M77 51H83V56H77Z" fill="#263d4b"/><path d="M63 50L57 68L67 72L71 65Z" fill="#b98363"/><path d="M52 78L66 80L76 77L71 83L58 83Z" fill="#765447"/><path d="M16 104L35 98L44 128H18Z" fill="#4d776b"/>'
 else:
  body='<path d="M0 128V111L27 93L47 84H79L104 97L128 117V128Z" fill="#8a6951"/><path d="M40 88L63 108L84 88L95 104L65 126L30 103Z" fill="#d6c6a1"/><path d="M31 35L41 16L63 9L86 21L96 44L90 69L75 89L57 93L38 77L28 55Z" fill="#c88e68"/><path d="M75 31L96 44L90 69L75 89L61 92L65 80L79 64Z" fill="#a16d52"/><path d="M28 43L31 26L42 12L65 5L88 18L99 40L90 46L80 29L62 24L41 33L36 53Z" fill="#453b36"/><path d="M38 47L54 44L56 49L40 52Z M72 46L87 50L84 54L72 51Z" fill="#263e4b"/><path d="M46 49H52V55H46Z M75 50H81V56H75Z" fill="#263e4b"/><path d="M62 51L57 67L66 70L69 65Z" fill="#ad7454"/><path d="M50 76L64 79L77 74L70 82L58 83Z" fill="#86554b"/>'
 return '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><title>'+name+' portrait</title><path d="M0 0H128V128H0Z" fill="#233f4b"/>'+body+'</svg>\n'
def export():
 for name in ('iven','sera','teren'):
  (ROOT/f'public/art/vector/{name}.svg').write_text(model(name).svg())
  p=ROOT/f'public/art/vector/portrait-{name}.svg'
  if not p.exists():p.write_text(portrait(name))
if __name__=='__main__':export()
