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
   'cave-floor':'#49565a','cave-wall':'#2d404a','cave-roof':'#101f2d','cave-ledge':'#263b47','granite':'#334a58','void':'#0a1724',
   'works-stone':'#858e85','works-deck':'#607c78'}

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

def field(kind,cells,w,h,scene=''):
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
    if kind=='void':pass
    elif kind=='granite':
        out.extend([polygon([(0,0),(w,0),(w,h*.3),(w*.7,h*.2),(w*.5,h*.34),(w*.22,h*.15),(0,h*.3)],'#405864'),polygon([(0,h*.77),(w*.2,h*.7),(w*.55,h*.88),(w*.8,h*.65),(w,h*.78),(w,h),(0,h)],'#203b4b')])
    elif kind in ('works-stone','works-deck'):
        steel=kind=='works-deck'
        out += [polygon([(0,0),(w,0),(w,h*.2),(w*.3,h*.65),(0,h*.47)],'#738b7e' if steel else '#989e90'),polygon([(0,h*.8),(w*.4,h*.6),(w,h*.77),(w,h),(0,h)],'#4d686b' if steel else '#75857f')]
        # Large plates/slabs share world coordinates, including the two connected
        # service-deck layers. No tile repetition or resampling of old textures.
        seam='#48646b' if steel else '#7a8981'
        for y in range(24,h,96 if steel else 120):
            out.append(line([(0,y),(w,y)],seam,2))
            for x in range(48+(y//96%2)*144,w,288):
                out.append(line([(x,y),(x,y+(96 if steel else 120))],seam,2))
                if steel:out.extend([rect(x+5,y+5,3,3,'#b3a77c'),rect(x-8,y+87,3,3,'#b3a77c')])
    elif scene in ('conduit','battle-heart-feeds','battle-heart-pressure') and kind.startswith('cave-'):
        # Cavern planes span this chamber's full canvas, rather than reusing
        # Chapter One's smaller tunnel drawing. The servicing floor stays clear.
        if kind=='cave-roof':
            out.extend([polygon([(0,0),(w,0),(w,h*.12),(w*.8,h*.04),(w*.67,h*.16),(w*.48,h*.06),(w*.3,h*.13),(w*.12,h*.04),(0,h*.2)],'#1b303d'),polygon([(0,h*.65),(w*.16,h*.71),(w*.3,h*.95),(w*.55,h*.89),(w*.7,h*.97),(w,h*.7),(w,h),(0,h)],'#152c3b')])
        elif kind=='cave-floor':
            out.extend([polygon([(0,h*.44),(w*.3,h*.35),(w*.58,h*.57),(w,h*.4),(w,h*.7),(w*.56,h*.73),(w*.24,h*.59),(0,h*.64)],'#566a6b'),polygon([(0,h*.83),(w*.2,h*.7),(w*.5,h*.91),(w*.76,h*.77),(w,h*.86),(w,h),(0,h)],'#2f4956')])
        else:
            for pts,c in [([(0,.08),(.15,.03),(.19,.15),(.12,.35),(0,.31)],'#425963'),([(.15,.03),(.32,.08),(.36,.18),(.29,.37),(.12,.35),(.19,.15)],'#294450'),([(.32,.08),(.47,.02),(.53,.15),(.45,.34),(.29,.37),(.36,.18)],'#53676a'),([(.47,.02),(.64,.1),(.62,.27),(.69,.36),(.45,.34),(.53,.15)],'#263e4b'),([(.64,.1),(.8,.03),(.85,.17),(.76,.35),(.69,.36),(.62,.27)],'#3d5862'),([(.8,.03),(1,.09),(1,.35),(.91,.31),(.76,.35),(.85,.17)],'#4a6369')]:
                out.append(polygon([(w*x,h*y) for x,y in pts],c))
            if kind=='cave-ledge':
                for pts in contours:
                    for i,(x,y) in enumerate(pts):
                        xx,yy=pts[(i+1)%len(pts)]
                        if xx>x and yy==y:out.extend([polygon([(x,y),(xx,y),(xx,y+6),(x,y+10)],'#7d8a85'),polygon([(x,y+10),(xx,y+6),(xx,y+24),(x,y+36)],'#36505c')])
    elif kind=='grass':
        for pts,c in [([(0,0),(w,0),(w,80),(w*.7,138),(w*.41,64),(0,112)],'#1e3c36'),([(0,h*.7),(w*.21,h*.53),(w*.49,h*.69),(w*.76,h*.56),(w,h*.68),(w,h),(0,h)],'#233e36'),([(w*.08,h*.4),(w*.4,h*.18),(w*.57,h*.27),(w*.27,h*.52)],'#315044'),([(w*.58,h*.8),(w*.71,h*.66),(w*.9,h*.72),(w,h*.9),(w*.77,h*.86)],'#385546')]:out.append(polygon(pts,c))
    elif kind in ('earth','paving','ballast','cave-floor'):
        colors={'earth':['#827966','#696956','#91836a'],'paving':['#80877d','#5f7070','#969789'],'ballast':['#50605e','#39484c','#62716a'],'cave-floor':['#586267','#3d4f55','#667172']}[kind]
        if scene=='infirmary' and kind=='paving':colors=['#9c9e8a','#7e8c84','#b0b09a']
        elif (scene in ('coast','cinderbank') or scene.startswith('battle-coast')) and kind=='paving':colors=['#819398','#5e7580','#9ba9a6']
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
    if scene=='coast' and kind=='water':
        out.extend([rect(0,0,w,169,'#788e9c'),rect(0,76,w,68,'#9da395'),polygon([(0,67),(96,5),(179,44),(269,4),(360,69),(448,38),(554,95),(668,33),(764,81),(873,8),(989,54),(1094,17),(1220,71),(1335,22),(w,71),(w,151),(0,151)],'#34566e'),polygon([(0,112),(167,61),(278,99),(428,75),(574,124),(746,91),(915,120),(1076,73),(1259,111),(w,84),(w,169),(0,169)],'#23465e')])
        for x in (137,423,1001,1280):out.append(line([(x,95),(x,215)],'#7897a1',3));out.append(polygon([(x-32,212),(x+37,211),(x+22,225),(x-20,225)],'#18394c'))
    if scene=='northglass' and kind=='granite':
        out.extend([rect(0,0,w,136,'#829698'),polygon([(0,87),(w*.13,38),(w*.26,94),(w*.43,47),(w*.61,107),(w*.78,40),(w,89),(w,160),(0,160)],'#536e79'),polygon([(0,134),(w*.19,82),(w*.35,121),(w*.51,80),(w*.75,136),(w,98),(w,182),(0,182)],'#304f60')])
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
    if kind=='works-cutaway':
        for x,y,w in runs(cells):out.extend([rect(x,y,w,24,'#29434f'),rect(x,y,w,5,'#8b9a8c'),rect(x,y+5,w,3,'#b69b69'),rect(x,y+20,w,4,'#142a37')])
    elif kind.startswith('works-pipe-'):
        ports={'h':'WE','v':'NS','ne':'NE','nw':'NW','se':'SE','sw':'SW','t':'WES','cross':'NWES'}[kind.removeprefix('works-pipe-')]
        ends={'N':(12,0),'S':(12,24),'W':(0,12),'E':(24,12)}
        for x,y in sorted(cells):
            x*=24;y*=24
            for color,width in [('#183340',11),('#45675f',7),('#9aaf96',2)]:
                for port in ports:
                    xx,yy=ends[port];out.append(line([(x+12,y+12),(x+xx,y+yy)],color,width))
            if len(ports)>2:out.extend([rect(x+8,y+8,8,8,'#b39660'),rect(x+10,y+10,4,4,'#45675f')])
    elif kind in ('rail-h','platform-edge','steps'):
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

def export(chapter='one', only=None):
    if only and not (ROOT/f'src/content/chapter-{chapter}/maps/{only}.json').is_file():raise ValueError(f'Unknown Chapter {chapter} map: {only}')
    OUT.mkdir(parents=True,exist_ok=True)
    tileset=json.loads((ROOT/'assets/tiles/chapter-one.tileset.json').read_text());defs={}
    for page in tileset['pages']:
        data=json.loads((ROOT/'assets/tiles/pages'/f'{page["name"]}.json').read_text())
        defs.update({page['firstgid']+t['id']:t for t in data['tiles']})
    manifest_path=ROOT/f'src/content/chapter-{chapter}/scene-art.json'
    manifest=json.loads(manifest_path.read_text()) if only else {}
    if chapter=='two':C.update(water='#25465c',paving='#71838a',earth='#657374',ballast='#3c5261')
    if chapter=='three':C.update(grass='#384f43',paving='#8a9690',ballast='#40575d')
    modules={p.stem:p for p in KIT.glob('*.svg')}
    for file in sorted((ROOT/f'src/content/chapter-{chapter}/maps').glob('*.json')):
        if only and file.stem!=only:continue
        data=json.loads(file.read_text());w=data['width']*24;h=data['height']*24;entries=[];floor_depth=-1000;light_floor=[]
        folder=OUT/file.stem;folder.mkdir(exist_ok=True)
        for layer in data['layers']:
            if not layer.get('data'):continue
            fields=defaultdict(set);instances={}
            for i,gid in enumerate(layer['data']):
                if not gid:continue
                t=defs[gid];name=t['type'];x=i%data['width'];y=i//data['width'];m=re.fullmatch(r'(.+)-(\d+)-(\d+)',name)
                if m and m[1] in modules:
                    module,xx,yy=m.groups();module='miners-cottage' if file.stem=='cinderbank' and module=='shelter' else module;ox=(x-int(xx))*24;oy=(y-int(yy))*24
                    depth=y*24+int(prop(t).get('sortOffset',24)) if prop(layer).get('sort') else floor_depth
                    key=f'scenery-{module}';url=f'art/vector/scenery/{module}.svg'
                    if chapter=='one' and file.stem=='station':
                        from station import scenery
                        variant=scenery(module,modules[module],folder,ox)
                        if variant:key,url=variant
                    elif chapter=='one':
                        from chapter_one_style import scenery
                        key,url=scenery(module,modules[module])
                    elif chapter=='two':
                        from chapter_two_style import scenery
                        key,url=scenery(module,modules[module],file.stem,ox)
                    elif chapter=='three':
                        from chapter_three_style import scenery
                        key,url=scenery(module,modules[module],file.stem,ox)
                    if module=='engine' and prop(layer).get('railFacing')=='right':
                        from railway import engine_right
                        key,url=engine_right(key,url)
                    instances[(module,ox,oy)]={'key':key,'url':url,'x':ox,'y':oy,'depth':depth,'layerId':layer['id']}
                else:
                    kind=re.sub(r'-(?:field|join)-.*$','',name)
                    if kind not in C:kind=re.sub(r'-\d+-\d+$','',kind)
                    if chapter=='two' and kind=='cave-roof':kind='granite'
                    fields[kind].add((x,y))
            if fields:
                parts=[]
                for kind,cells in fields.items():
                    art=field(kind,cells,w,h,file.stem) if kind in C else fittings(kind,cells)
                    if chapter=='one' and file.stem=='station':
                        from station import terrain
                        art=terrain(kind,art,w,h)
                    elif chapter=='one':
                        from chapter_one_style import terrain
                        art=terrain(kind,art,w,h,file.stem,layer['id'])
                    elif chapter=='two':
                        from chapter_two_style import terrain
                        art=terrain(kind,art,w,h,file.stem)
                        if kind in ('paving','earth','ballast'):
                            clip=re.search(r'<clipPath[^>]*>(.*?)</clipPath>',art)
                            if clip:light_floor.append(clip[1])
                    elif chapter=='three':
                        from chapter_three_style import terrain
                        art=terrain(kind,art,w,h,file.stem)
                        if kind in ('paving','ballast','works-stone','works-deck','cave-floor'):
                            clip=re.search(r'<clipPath[^>]*>(.*?)</clipPath>',art)
                            if clip:light_floor.append(clip[1])
                    parts.append(art)
                # Registered pools of lamplight belong to the floor, not the lamp's sort plane.
                if layer['name']=='Paths and platforms' and (chapter!='one' or file.stem=='station'):
                    lamps=set()
                    for l in data['layers']:
                        for i,g in enumerate(l.get('data',[])):
                            if g and defs[g]['type']=='lamp-0-0':lamps.add((i%data['width']*24+24,i//data['width']*24+134))
                    for x,y in sorted(lamps):
                        if chapter=='one' and file.stem=='station':
                            from station import lamplight
                            parts.append(lamplight(x,y))
                        else:parts.append(polygon([(x-63,y),(x-33,y-14),(x+26,y-18),(x+69,y-3),(x+45,y+18),(x-21,y+23)],'#8c8667'))
                url=f'art/vector/scenes/{file.stem}/layer-{layer["id"]}.svg'
                title=layer['name'].replace('&','&amp;')
                (ROOT/'public'/url).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>{title}</title>'+''.join(parts)+'</svg>\n')
                entries.append({'key':f'scene-{file.stem}-{layer["id"]}','url':url,'x':0,'y':0,'depth':floor_depth,'layerId':layer['id']})
            entries.extend(instances.values());floor_depth+=1
        # Dimensions allow picking exact source pieces in the Maps inspector.
        if (chapter=='one' and file.stem!='station')or chapter in ('two','three'):
            if chapter=='one':from chapter_one_style import spill
            elif chapter=='two':from chapter_two_style import spill
            else:from chapter_three_style import spill
            # Spill inherits the emitter's visibility layer, including the
            # collector's shutdown. Ground light stays below actor shadows.
            for layer in data['layers']:
                props=[(e['url'].split('/')[-1][:-4],e['x'],e['y'])for e in entries if e['layerId']==layer['id'] and f'/chapter-{chapter}-kit/'in e['url']]
                light=spill(props,file.stem)if chapter=='three'else spill(props)
                if not light:continue
                if chapter in ('two','three'):
                    light='<defs><clipPath id="light-floor">'+''.join(light_floor)+'</clipPath></defs><g clip-path="url(#light-floor)">'+light+'</g>'
                url=f'art/vector/scenes/{file.stem}/light-{layer["id"]}.svg'
                (ROOT/'public'/url).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><title>Ground light</title>'+light+'</svg>\n')
                entries.append({'key':f'scene-{file.stem}-light-{layer["id"]}','url':url,'x':0,'y':0,'depth':-950,'layerId':layer['id']})
        for e in entries:
            source=(ROOT/'public'/e['url']).read_text();m=re.search(r'width="(\d+)" height="(\d+)"',source)
            e.update(width=int(m[1]),height=int(m[2]))
        manifest[file.stem]=entries
    (ROOT/f'src/content/chapter-{chapter}/scene-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Compiled {len(manifest)} SVG scenes; {len(list(OUT.glob("*/*.svg")))} continuous layers and {len(modules)} traced scenery originals')

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--chapter',choices=('one','two','three'),default='one');parser.add_argument('--map',dest='only',help='Rebuild one map while retaining the other manifest entries')
    args=parser.parse_args();export(args.chapter,args.only)
