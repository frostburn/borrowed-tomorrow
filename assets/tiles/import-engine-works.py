#!/usr/bin/env python3
"""Export vessel-derived engine-works art as native bounded tile pages.

Usage: python3 assets/tiles/import-engine-works.py WALL.png STONE.png DECK.png STAIRS.png PIPES.png
The rejected marble slots become stone/iron; exterior and earlier art pixels stay intact.
"""
import json,sys
from pathlib import Path
from PIL import Image
from native_tiles import load_tiles,write_pages,clean_cutout

root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'assets/tiles/engine-works.json').read_text())
tiles=load_tiles(root);modules=json.loads((root/'assets/tiles/modules.json').read_text())
byname={t['type']:i for i,(_,t) in enumerate(tiles)}

def add(name,piece,slot=None,**props):
    ident=slot-1 if slot else byname.get(name,len(tiles))
    if slot:
        previous=tiles[ident][1]['type']
        if not(previous.startswith('palace-marble') or previous==name):raise ValueError(f'Cannot replace accepted tile {previous}')
    definition=dict(id=ident,type=name,properties=[dict(name=k,type='bool' if isinstance(v,bool) else 'int' if isinstance(v,int) else 'string',value=v) for k,v in dict(name=name,**props).items()])
    if ident==len(tiles):tiles.append((piece,definition))
    else:tiles[ident]=(piece,definition)
    return ident+1

for key in ['wall','stone','deck','stairs']:
    item=manifest[key];source=Image.open(sys.argv[item['input']+1]).convert('RGBA');width,height=item['size'];w,h=width//24,height//24
    floor=key in ['stone','deck']
    if floor:
        image=source.resize((width,height),Image.Resampling.NEAREST);image.putalpha(255)
    else:
        source=clean_cutout(source);source=source.crop(source.getbbox());scale=min(width/source.width,height/source.height)
        source=clean_cutout(source.resize((round(source.width*scale),round(source.height*scale)),Image.Resampling.NEAREST))
        image=Image.new('RGBA',(width,height));image.paste(source,((width-source.width)//2,height-source.height))
        first=item.get('firstgid') or byname.get(item['name']+'-0-0',len(tiles))+1
        modules[item['name']]=dict(firstgid=first,width=w,height=h,anchorX=w//2,anchorY=h-1)
    for y in range(h):
        for x in range(w):
            piece=image.crop((x*24,y*24,(x+1)*24,(y+1)*24));props={}
            if floor or key=='stairs':props['walkable']=True
            else:
                props.update(sortOffset=(h-1-y)*24+19,empty=piece.getchannel('A').getbbox() is None)
                if y==h-1:props['walkable']=False
            if not floor and x==0 and y==0:props.update(module=item['name'],moduleWidth=w,moduleHeight=h,anchorX=w//2,anchorY=h-1)
            name=f"{item['name']}-{'field-' if floor else ''}{x}-{y}"
            add(name,piece,item['firstgid']+y*w+x if 'firstgid' in item else None,**props)
    if key=='wall':
        cut=manifest['cutaway'];base=image.crop(tuple(cut['crop']))
        for y in range(2):
            for x in range(2):add(f"{cut['name']}-{x}-{y}",base.crop((x*24,y*24,(x+1)*24,(y+1)*24)),cut['firstgid']+y*2+x,walkable=False)
modules.pop('palace-marble-wall',None)

sheet=Image.open(sys.argv[5]).convert('RGBA')
for item in manifest['pipes']:
    source=clean_cutout(sheet.crop(tuple(item['crop'])));mask=source.getchannel('A');w,h=source.size;ports=item['ports']
    def center(side):
        points=([x for x in range(w) if mask.getpixel((x,2 if side=='N' else h-3))] if side in 'NS' else [y for y in range(h) if mask.getpixel((2 if side=='W' else w-3,y))])
        if not points:raise ValueError(f'Missing {side} port on {item["name"]}')
        return (min(points)+max(points))/2
    # Register connection centerlines at cell-edge midpoints. This samples source
    # RGB once with nearest-neighbor; no procedural pipe paint or palette change.
    if ports=='WE':sx=sy=24/w;left=0;top=(center('W')+center('E'))/2-12/sy
    elif ports=='NS':sx=sy=24/h;left=(center('N')+center('S'))/2-12/sx;top=0
    elif ports=='NE':sx=12/(w-center('N'));sy=12/center('E');left=center('N')-12/sx;top=0
    elif ports=='NW':sx=12/center('N');sy=12/center('W');left=top=0
    elif ports=='SE':sx=12/(w-center('S'));sy=12/(h-center('E'));left=center('S')-12/sx;top=center('E')-12/sy
    elif ports=='SW':sx=12/center('S');sy=12/(h-center('W'));left=0;top=center('W')-12/sy
    elif ports=='WES':sx=24/w;sy=12/(h-(center('W')+center('E'))/2);left=0;top=(center('W')+center('E'))/2-12/sy
    else:sx=24/w;sy=24/h;left=top=0
    tile=clean_cutout(source.transform((24,24),Image.Transform.AFFINE,(1/sx,0,left,0,1/sy,top),resample=Image.Resampling.NEAREST))
    add(item['name'],tile)

pages=write_pages(root,tiles)
(root/'assets/tiles/modules.json').write_text(json.dumps(modules,indent=2)+'\n')
print(f'{len(tiles)} native tiles; {len(pages)} bounded lossless pages')
