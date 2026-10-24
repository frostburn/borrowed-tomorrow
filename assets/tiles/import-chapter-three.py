#!/usr/bin/env python3
"""Append native conduit modules; authoring inputs stay outside git.
Usage: python3 assets/tiles/import-chapter-three.py GATE.png CONTROLS.png VESSEL.png
"""
import json, math, sys
from collections import deque
from pathlib import Path
from PIL import Image
from native_tiles import load_tiles, write_pages

root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'assets/tiles/chapter-three-scenery.json').read_text())
modules=json.loads((root/'assets/tiles/modules.json').read_text());tiles=load_tiles(root)
byname={t['type']:i for i,(_,t) in enumerate(tiles)}
for item in manifest:
    source=Image.open(sys.argv[item['input']+1]).convert('RGBA')
    # Canonical binary alpha and the largest silhouette remove detached specks.
    mask=source.getchannel('A').point(lambda a:255 if a>=128 else 0);pixels=mask.tobytes()
    seen=bytearray(len(pixels));largest=[]
    for i,a in enumerate(pixels):
        if not a or seen[i]:continue
        todo=deque([i]);seen[i]=1;component=[]
        while todo:
            at=todo.popleft();component.append(at);x,y=at%source.width,at//source.width
            for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if not(0<=xx<source.width and 0<=yy<source.height):continue
                k=yy*source.width+xx
                if pixels[k] and not seen[k]:seen[k]=1;todo.append(k)
        if len(component)>len(largest):largest=component
    alpha=bytearray(len(pixels))
    for i in largest:alpha[i]=255
    source.putalpha(Image.frombytes('L',source.size,bytes(alpha)));source=source.crop(source.getbbox())
    scale=min(item['size'][0]/source.width,item['size'][1]/source.height)
    source=source.resize((round(source.width*scale),round(source.height*scale)),Image.Resampling.NEAREST)
    w,h=math.ceil(source.width/24),math.ceil(source.height/24);image=Image.new('RGBA',(w*24,h*24))
    image.paste(source,((image.width-source.width)//2,image.height-source.height))
    ax,ay=w//2,h-1;first=byname.get(item['name']+'-0-0',len(tiles))+1
    module=dict(firstgid=first,width=w,height=h,anchorX=ax,anchorY=ay)
    if item['name'] in modules and modules[item['name']]!=module:raise ValueError('Module dimensions changed; re-stamp affected maps explicitly')
    modules[item['name']]=module
    for y in range(h):
        for x in range(w):
            name=f"{item['name']}-{x}-{y}";ident=byname.get(name,len(tiles));piece=image.crop((x*24,y*24,(x+1)*24,(y+1)*24))
            props=dict(name=name,sortOffset=(ay-y)*24+19,empty=piece.getchannel('A').getbbox() is None)
            bw,up=item['block']
            if ax-bw//2<=x<ax-bw//2+bw and ay-up<=y<=ay:props['walkable']=False
            if x==0 and y==0:props.update(module=item['name'],moduleWidth=w,moduleHeight=h,anchorX=ax,anchorY=ay)
            definition=dict(id=ident,type=name,properties=[dict(name=k,type='bool' if isinstance(v,bool) else 'int' if isinstance(v,int) else 'string',value=v) for k,v in props.items()])
            if ident==len(tiles):tiles.append((piece,definition))
            else:tiles[ident]=(piece,definition)
pages=write_pages(root,tiles)
(root/'assets/tiles/modules.json').write_text(json.dumps(modules,indent=2)+'\n')
print(f'{len(tiles)} tiles; {len(pages)} small lossless pages')
