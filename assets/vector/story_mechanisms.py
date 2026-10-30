"""Native mechanism poses derived from the shipped SVGs, never bitmap substitutes.
Run after regional art exports: npm run art:mechanisms.
"""
from pathlib import Path
import copy, json, math, xml.etree.ElementTree as ET
from gate_pose import folded_leaves
ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'public/art/vector/story-mechanisms';ART.mkdir(exist_ok=True)
NS='{http://www.w3.org/2000/svg}'
ET.register_namespace('',NS[1:-1]);COUNT=17

def source(path):
 root=ET.parse(ROOT/'public/art/vector'/path).getroot()
 return [copy.deepcopy(e) for e in root if e.tag not in (NS+'title',NS+'metadata')]
def xml(e):return ET.tostring(e,encoding='unicode')
def group(parts,transform='',extra=''):return f'<g transform="{transform}" {extra}>'+''.join(xml(e)if isinstance(e,ET.Element)else e for e in parts)+'</g>'
def svg(name,w,h,body):
 text=f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{name}</title><metadata>Native source: assets/vector/story_mechanisms.py; derived from the shipped regional SVG geometry.</metadata>{body}</svg>\n'
 assert len(text.encode())<128*1024,name
 (ART/f'{name}.svg').write_text(text)
def sheet(name,w,h,draw):
 poses=[draw(i/(COUNT-1))for i in range(COUNT)]
 svg(name,w*COUNT,h,''.join(group([p],f'translate({i*w} 0)')for i,p in enumerate(poses)))
 return poses

def wheel(name,path,center,stand_count=2):
 parts=source(path);cx,cy=center
 sheet(name,*({'harbor-wheel':(80,96)}.get(name,(90,100))),lambda p:group(parts[:stand_count])+group(parts[stand_count:],f'rotate({p*360:g} {cx} {cy})'))
wheel('harbor-wheel','chapter-four/harbor-wheel.svg',(40,33))
wheel('cooling-wheel','chapter-five/cooling-wheel.svg',(43,35))
wheel('ward-wheel','chapter-five/windmere-lift-wheel.svg',(43,35))

closed=source('chapter-four/harbor-gate-closed.svg')
def gate(p,season=False):
 # Gate leaves hinge independently; the stone piers and their feet stay fixed.
 body=group(closed[:8])+folded_leaves(group(closed[8:]),p,f'leaf-{round(p*16)}'+('-snow'if season else ''))
 return body+(season_details(p)if season else '')
snow='<path d="M0 10 24 0 48 10 44 17 28 12 10 19ZM264 10 288 0 312 10 306 18 288 12 274 19Z" fill="#dce4db"/>'
def season_details(p):
 wheel='<circle cx="288" cy="166" r="17" fill="#35555a" stroke="#c8ab75" stroke-width="4"/>'
 wheel+=group(['<path d="M273 166h30M288 151v30" stroke="#dce4db" stroke-width="3"/>'],f'rotate({p*360:g} 288 166)')
 ice=group(['<path d="M53 98 97 83 122 103 155 92 198 107 256 86 253 111 203 131 155 114 111 124 80 112 53 125Z" fill="#c3d9d9"/>'],f'translate(0 {p*14:g})',f'opacity="{1-p:g}"')
 return snow+wheel+ice
sheet('harbor-gate',312,192,gate)
poses=sheet('season-gate',312,192,lambda p:gate(p,True))
svg('season-gate-closed',312,192,poses[0]);svg('season-gate-open',312,192,poses[-1])

parts=source('chapter-four/sanctuary-clamp-live.svg');cut=source('chapter-four/sanctuary-clamp-cut.svg')
def clamp(p):
 if p==1:return group(cut)
 # The clamp shoe lifts, then drops back after the freed cable sags.
 lift=math.sin(math.pi*p)*10
 return group(parts[:2])+group(parts[2:5],f'translate(0 {-lift:g})')+f'<polyline points="0,40 52,40 72,{40+23*p:g} 143,{40+26*p:g}" fill="none" stroke="#c1b87f" stroke-width="5"/>'
sheet('sanctuary-clamp',144,96,clamp)

for name,path in [('forge-anchor','chapter-five/forge-anchor.svg'),('watch-anchor','chapter-five/watch-anchor.svg')]:
 parts=source(path)
 def anchor(p):
  # The heavy contacts part; the crystal dims as the return is disconnected.
  body=group(parts[:4])+group(parts[4:6],extra=f'opacity="{1-p*.94:g}"')+group([parts[6]],f'translate(0 {p*18:g})')
  body+=group(parts[7:9],f'translate({-p*10:g} 0)')+group(parts[9:11],f'translate({p*10:g} 0)')
  if name=='watch-anchor':
   body+='<rect x="155" y="211" width="14" height="30" fill="#35555a"/>'
   body+=group(['<circle cx="162" cy="213" r="22" fill="#3b5b60" stroke="#d1aa69" stroke-width="5"/><path d="M142 213h40M162 193v40" stroke="#d1aa69" stroke-width="4"/>'],f'rotate({p*360:g} 162 213)')
  return body
 sheet(name,320,286,anchor)

parts=source('chapter-five/windmere-engine.svg')
def shutters(p):
 body=group(parts);clip=f'ward-aperture-{round(p*16)}'
 body+=f'<defs><clipPath id="{clip}"><polygon points="93,81 112,65 144,65 164,83 164,143 143,162 113,162 93,143"/></clipPath></defs>'
 panels=[]
 for side in [-1,1]:
  width=(36 if side<0 else 37)*p;x=128-width if side<0 else 128
  panels.append(f'<path d="M{x:g} 64h{width:g}v100h{-width:g}Z" fill="{("#2d4d4e"if side>0 else "#74958c")}"/>')
 if p:panels.append(f'<path d="M128 64v100" stroke="#cbb784" stroke-width="{2*p:g}"/>')
 return body+group(panels,extra=f'clip-path="url(#{clip})"')
sheet('ward-shutters',256,240,shutters)
parts=source('chapter-six/watch-windlass.svg')
def windlass(p):
 a=p*math.tau;cx,cy=39,24
 handle=f'<path d="M{cx-33*math.cos(a):g} {cy-9*math.sin(a):g} {cx+33*math.cos(a):g} {cy+9*math.sin(a):g}" stroke="#b0cdd5" stroke-width="5"/>'
 return group(parts[:2]+parts[3:])+handle
sheet('north-windlass',80,66,windlass)

parts=source('chapter-two-kit/coast/prison-coach.svg')
# The last three polygons form the door. Keep the sill, wheels and coach still.
door=next(i for i,e in enumerate(parts)if e.get('points','').startswith('213.00,64.00'))
def coach(p):
 body=group(parts[:door])+group(parts[door+3:])
 body+='<polygon points="213,64 243,63 243,126 213,127" fill="#101d28"/>'
 return body+group(parts[door:door+3],f'translate({-p*42:g} 0)')
sheet('coach-door',264,168,coach)

# Append the narrated season-street gate without renumbering existing Tiled IDs,
# changing collision or moving any interaction/arrival anchor.
mapfile=ROOT/'src/content/chapter-seven/maps/seasonstreet.json';data=json.loads(mapfile.read_text())
manifestfile=ROOT/'src/content/chapter-seven/scene-art.json';manifest=json.loads(manifestfile.read_text())
for pose,flag in [('closed','hiddenFlag'),('open','requiredFlag')]:
 name='season-return-gate-'+pose
 layer=next((l for l in data['layers']if l['name']==name),None)
 if not layer:
  lid=max(l['id']for l in data['layers'])+1
  layer={'id':lid,'name':name,'type':'objectgroup','visible':True,'objects':[],'properties':[{'name':flag,'type':'string','value':'seasonsFreed'},{'name':'sort','type':'bool','value':True}]}
  data['layers'].append(layer);data['nextlayerid']=lid+1
 entry={'key':'scene-mechanism-season-gate-'+pose,'url':f'art/vector/story-mechanisms/season-gate-{pose}.svg','x':624,'y':380,'width':312,'height':192,'depth':572,'layerId':layer['id']}
 manifest['seasonstreet']=[e for e in manifest['seasonstreet']if e['key']!=entry['key']]+[entry]
# Preserve readable tile rows and source formatting outside the appended layers.
text=mapfile.read_text();old=json.loads(text)
if old!=data:
 import re
 for layer in data['layers'][len(old['layers']):]:
  match=list(re.finditer(r'\n  \]',text))[-1];text=text[:match.start()]+',\n'+ '\n'.join('    '+line for line in json.dumps(layer,indent=2).splitlines())+text[match.start():]
 text=re.sub(r'"nextlayerid": \d+',f'"nextlayerid": {data["nextlayerid"]}',text)
 mapfile.write_text(text)
manifestfile.write_text(json.dumps(manifest,indent=2)+'\n')
print('Story mechanisms: native 17-pose SVG sheets and season-street gate')
