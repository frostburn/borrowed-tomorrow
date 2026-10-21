"""Compile story layouts into continuous SVG planes and whole traced scenery.

The SVGs in public/art/vector/scenery are editable originals. This compiler never
resamples a painting or slices a module into tiles. Tiled still owns navigation,
layer visibility, staging and the modules' registered ground anchors.
"""
import json, re, math
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/art/vector/scenes'
KIT=ROOT/'public/art/vector/scenery'
C={'grass':'#29483e','earth':'#756e5b','paving':'#737c76','ballast':'#424e50','water':'#294858',
   'cave-floor':'#49565a','cave-wall':'#2d404a','cave-roof':'#101f2d','cave-ledge':'#263b47'}

def prop(obj):return {p['name']:p['value'] for p in obj.get('properties',[])}
def polygon(points,color):return '<polygon points="'+' '.join(f'{x:g},{y:g}' for x,y in points)+'" fill="'+color+'"/>'
def rect(x,y,w,h,color):return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{color}"/>'
def line(points,color,width=2):return '<polyline points="'+' '.join(f'{x:g},{y:g}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}"/>'

def outline(cells):
    """Union grid cells; retain boundary turns, discard interior edges/seams."""
    edges=set()
    for x,y in cells:
        for a,b,n in [((x,y),(x+1,y),(x,y-1)),((x+1,y),(x+1,y+1),(x+1,y)),((x+1,y+1),(x,y+1),(x,y+1)),((x,y+1),(x,y),(x-1,y))]:
            if n not in cells:edges.add((a,b))
    paths=[]
    while edges:
        start=min(edges);a,b=start;edges.remove(start);points=[a];previous=a
        while b!=points[0]:
            points.append(b);choices=sorted(e for e in edges if e[0]==b)
            # At diagonally touching cells follow the right-hand boundary.
            dx,dy=b[0]-previous[0],b[1]-previous[1]
            choices.sort(key=lambda e: -(dx*(e[1][1]-b[1])-dy*(e[1][0]-b[0])))
            if not choices:raise ValueError('Open terrain contour')
            edge=choices[0];edges.remove(edge);previous,b=b,edge[1]
        simple=[]
        for i,p in enumerate(points):
            prev=points[i-1];nxt=points[(i+1)%len(points)]
            if (p[0]-prev[0])*(nxt[1]-p[1])!=(p[1]-prev[1])*(nxt[0]-p[0]):simple.append((p[0]*24,p[1]*24))
        paths.append(simple)
    return paths

def field(kind,cells,w,h):
    contours=outline(cells)
    # Chamfer organic material boundaries once at contour turns, not per cell.
    # Centers and all navigation IDs stay aligned; masonry/rail fixtures stay square.
    paths=[]
    for pts in contours:
        corners=[]
        for i,(x,y) in enumerate(pts):
            a=pts[i-1];b=pts[(i+1)%len(pts)];cut=8 if kind in ('earth','paving','ballast','water','cave-floor') else 0
            for q in (a,b):
                length=abs(q[0]-x)+abs(q[1]-y);t=min(cut,length/3)/length
                corners.append((round(x+(q[0]-x)*t),round(y+(q[1]-y)*t)))
        paths.append('M'+' L'.join(f'{x},{y}' for x,y in corners)+' Z')
    path=' '.join(paths)
    out=[f'<defs><clipPath id="{kind}"><path d="{path}" clip-rule="evenodd"/></clipPath></defs>',f'<g clip-path="url(#{kind})">',rect(0,0,w,h,C[kind])]
    if kind=='grass':
        for pts,c in [([(0,0),(w,0),(w,80),(w*.7,138),(w*.41,64),(0,112)],'#1e3c36'),([(0,h*.7),(w*.21,h*.53),(w*.49,h*.69),(w*.76,h*.56),(w,h*.68),(w,h),(0,h)],'#233e36'),([(w*.08,h*.4),(w*.4,h*.18),(w*.57,h*.27),(w*.27,h*.52)],'#315044'),([(w*.58,h*.8),(w*.71,h*.66),(w*.9,h*.72),(w,h*.9),(w*.77,h*.86)],'#385546')]:out.append(polygon(pts,c))
    elif kind in ('earth','paving','ballast','cave-floor'):
        colors={'earth':['#827966','#696956','#91836a'],'paving':['#80877d','#5f7070','#969789'],'ballast':['#50605e','#39484c','#62716a'],'cave-floor':['#586267','#3d4f55','#667172']}[kind]
        out += [polygon([(0,h*.3),(w*.27,h*.2),(w*.57,h*.52),(w,h*.32),(w,h*.6),(w*.55,h*.65),(w*.25,h*.33)],colors[0]),polygon([(0,h*.72),(w*.3,h*.59),(w*.6,h*.79),(w,h*.61),(w,h),(0,h)],colors[1]),polygon([(w*.51,0),(w*.72,0),(w*.42,h*.47),(w*.35,h*.53)],colors[2])]
        # Sparse, long seams: stone slabs and fractured rock, not tile outlines.
        if kind=='paving':
            for y in range(54,h,74):
                out.append(line([(0,y+12),(w*.3,y),(w*.64,y+9),(w,y-6)],'#667572',2))
                for x in range(67+(y%111),w,155):out.append(line([(x,y+4),(x-7,y+52)],'#667572',2))
        if kind=='cave-floor':
            for x,y in [(70,300),(290,410),(570,208),(760,350),(340,120),(880,540)]:out.append(polygon([(x,y),(x+84,y-11),(x+117,y+17),(x+42,y+8)],'#536369'))
    elif kind=='water':
        out += [polygon([(0,0),(w*.6,0),(w*.5,h),(0,h)],'#203b4b'),polygon([(w*.38,0),(w*.55,0),(w*.51,h),(w*.32,h)],'#385b65')]
        for y in range(17,h,36):
            for x in range(5+(y%59),w,101):out.append(polygon([(x,y),(x+54,y-3),(x+70,y),(x+12,y+3)],'#55777a'))
    else:
        # Long geological planes traced around the painting's northern recess
        # and southern storage cutaway. No repeated rock stamp or tile texture.
        if kind=='cave-roof':
            faces=[([(0,0),(181,0),(226,48),(112,91),(0,67)],'#172d3b'), ([(250,0),(438,0),(393,63),(326,105),(286,67)],'#1b303d'), ([(687,0),(842,0),(914,53),(808,97),(724,47)],'#172d3b'), ([(0,542),(126,523),(243,589),(224,h),(0,h)],'#172d3b'), ([(752,571),(865,530),(w,556),(w,h),(710,h)],'#1b303d')]
        else:
            faces=[([(0,88),(104,73),(151,125),(112,204),(0,229)],'#43575f'), ([(106,73),(213,78),(243,125),(176,164),(112,204),(151,125)],'#354953'), ([(212,78),(316,87),(352,149),(313,223),(210,232),(176,164),(243,125)],'#4d6066'), ([(317,83),(405,72),(425,126),(388,208),(313,223),(352,149)],'#2a424e'), ([(405,72),(590,72),(604,110),(575,218),(401,229),(388,208),(425,126)],'#1c3340'), ([(591,77),(684,87),(735,145),(686,224),(576,225),(604,110)],'#465a62'), ([(686,89),(803,77),(824,142),(771,223),(686,224),(735,145)],'#304853'), ([(803,77),(927,84),(w,120),(w,216),(880,232),(771,223),(824,142)],'#4b5e64'), ([(0,393),(116,398),(159,459),(124,532),(0,558)],'#4d6067'), ([(116,398),(252,385),(272,443),(223,535),(124,532),(159,459)],'#263f4c'), ([(252,385),(372,404),(403,474),(353,546),(223,535),(272,443)],'#3f555f'), ([(374,404),(484,396),(534,467),(485,558),(353,546),(403,474)],'#52646a'), ([(485,396),(603,390),(643,454),(611,532),(485,558),(534,467)],'#28434f'), ([(603,390),(726,395),(763,448),(713,542),(611,532),(643,454)],'#4a5f67'), ([(727,395),(870,383),(w,413),(w,500),(913,547),(713,542),(763,448)],'#354f5c')]
        for pts,color in faces:out.append(polygon(pts,color))
        if kind=='cave-ledge':
            # Light only the actual cutaway boundary, never a repeat per tile.
            for pts in contours:
                for i,(x,y) in enumerate(pts):
                    xx,yy=pts[(i+1)%len(pts)]
                    if xx>x and yy==y:out.append(polygon([(x,y),(xx,y),(xx,y+6),(x,y+9)],'#7b8580'))
    out.append('</g>');return ''.join(out)

def runs(cells):
    for y in sorted({y for x,y in cells}):
        xs=sorted(x for x,yy in cells if yy==y);start=last=xs[0]
        for x in xs[1:]:
            if x!=last+1:yield start*24,y*24,(last-start+1)*24;start=x
            last=x
        yield start*24,y*24,(last-start+1)*24

def fittings(kind,cells):
    out=[]
    if kind in ('rail-h','platform-edge','steps'):
        for x,y,w in runs(cells):
            if kind=='rail-h':
                for xx in range(x+3,x+w,13):out.append(polygon([(xx,y),(xx+6,y),(xx+5,y+24),(xx-1,y+24)],'#5e594b'))
                for yy in (y+5,y+18):out.extend([rect(x,yy,w,4,'#172d38'),rect(x,yy,w,2,'#97a49b')])
            elif kind=='platform-edge':out.extend([rect(x,y,w,24,'#344b54'),rect(x,y,w,5,'#a2a38c'),polygon([(x,y+5),(x+w,y+5),(x+w,y+8),(x,y+10)],'#1c3442')])
            else:
                for yy in range(y,y+24,8):out.extend([rect(x,yy,w,8,'#344b54'),rect(x,yy,w,3,'#89938b')])
    else:
        for x,y in sorted(cells):
            x*=24;y*=24
            if kind=='cap':out.extend([polygon([(x+3,y+15),(x+8,y+7),(x+18,y+6),(x+21,y+14),(x+16,y+17)],'#213949'),line([(x+6,y+12),(x+19,y+11)],'#b99862')])
            elif kind=='thread':out.append(line([(x+11,y),(x+12,y+24)],'#c7c9a5',2))
            elif kind=='drops':out.append(polygon([(x+11,y+3),(x+7,y+13),(x+11,y+17),(x+15,y+12)],'#b3c3b2'))
            elif kind=='motes':out.append(rect(x+11,y+10,2,2,'#e0c791'))
            else:raise ValueError(kind)
    return ''.join(out)

def export():
    OUT.mkdir(parents=True,exist_ok=True)
    tileset=json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text());defs={}
    for page in tileset['pages']:
        data=json.loads((ROOT/'assets/tiles/pages'/f'{page["name"]}.json').read_text())
        defs.update({page['firstgid']+t['id']:t for t in data['tiles']})
    manifest={}
    modules={p.stem:p for p in KIT.glob('*.svg')}
    for file in sorted((ROOT/'src/content/chapter-one/maps').glob('*.json')):
        data=json.loads(file.read_text());w=data['width']*24;h=data['height']*24;entries=[];floor_depth=-1000
        folder=OUT/file.stem;folder.mkdir(exist_ok=True)
        for layer in data['layers']:
            if not layer.get('data'):continue
            fields=defaultdict(set);instances={}
            for i,gid in enumerate(layer['data']):
                if not gid:continue
                t=defs[gid];name=t['type'];x=i%data['width'];y=i//data['width'];m=re.fullmatch(r'(.+)-(\d+)-(\d+)',name)
                if m and m[1] in modules:
                    module,xx,yy=m.groups();ox=(x-int(xx))*24;oy=(y-int(yy))*24
                    depth=y*24+int(prop(t).get('sortOffset',24)) if prop(layer).get('sort') else floor_depth
                    instances[(module,ox,oy)]={'key':f'scenery-{module}','url':f'art/vector/scenery/{module}.svg','x':ox,'y':oy,'depth':depth,'layerId':layer['id']}
                else:
                    kind=re.sub(r'-(?:field|join)-.*$','',name)
                    if kind not in C:kind=re.sub(r'-\d+-\d+$','',kind)
                    fields[kind].add((x,y))
            if fields:
                parts=[]
                for kind,cells in fields.items():parts.append(field(kind,cells,w,h) if kind in C else fittings(kind,cells))
                # Registered pools of lamplight belong to the floor, not the lamp's sort plane.
                if layer['name']=='Paths and platforms':
                    lamps=set()
                    for l in data['layers']:
                        for i,g in enumerate(l.get('data',[])):
                            if g and defs[g]['type']=='lamp-0-0':lamps.add((i%data['width']*24+24,i//data['width']*24+134))
                    for x,y in sorted(lamps):parts.append(polygon([(x-63,y),(x-33,y-14),(x+26,y-18),(x+69,y-3),(x+45,y+18),(x-21,y+23)],'#8c8667'))
                url=f'art/vector/scenes/{file.stem}/layer-{layer["id"]}.svg'
                title=layer['name'].replace('&','&amp;')
                (ROOT/'public'/url).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{title}</title>'+''.join(parts)+'</svg>\n')
                entries.append({'key':f'scene-{file.stem}-{layer["id"]}','url':url,'x':0,'y':0,'depth':floor_depth,'layerId':layer['id']})
            entries.extend(instances.values());floor_depth+=1
        # Dimensions allow picking exact source pieces in the Maps inspector.
        for e in entries:
            source=(ROOT/'public'/e['url']).read_text();m=re.search(r'width="(\d+)" height="(\d+)"',source)
            e.update(width=int(m[1]),height=int(m[2]))
        manifest[file.stem]=entries
    (ROOT/'src/content/chapter-one/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Compiled {len(manifest)} SVG scenes; {len(list(OUT.glob("*/*.svg")))} continuous layers and {len(modules)} traced scenery originals')

if __name__=='__main__':export()
