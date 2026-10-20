#!/usr/bin/env python3
"""Export isolated harbor/ward props into small native pages. Source stays outside git.
Usage: python3 assets/tiles/import-chapter-two.py SCENERY.png
"""
import json, math, sys
from collections import deque
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter
from native_tiles import load_tiles, write_pages

root=Path(__file__).resolve().parents[2]
source=Image.open(sys.argv[1]).convert('RGBA');tiles=load_tiles(root)
manifest=json.loads((root/'assets/tiles/chapter-two-scenery.json').read_text())
modules=json.loads((root/'assets/tiles/modules.json').read_text())
byname={t['type']:i for i,(_,t) in enumerate(tiles)}
for item in manifest:
    crop=source.crop(item['crop']);alpha=crop.getchannel('A')
    mask=alpha.point(lambda a:255 if a>=20 else 0);pixels=mask.tobytes()
    seen=bytearray(len(pixels));largest=[]
    for i,a in enumerate(pixels):
        if not a or seen[i]:continue
        todo=deque([i]);seen[i]=1;component=[]
        while todo:
            at=todo.popleft();component.append(at);x,y=at%crop.width,at//crop.width
            for xx,yy in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
                if not(0<=xx<crop.width and 0<=yy<crop.height):continue
                k=yy*crop.width+xx
                if pixels[k] and not seen[k]:seen[k]=1;todo.append(k)
        if len(component)>len(largest):largest=component
    clean=bytearray(len(pixels))
    for i in largest:clean[i]=255
    clean=Image.frombytes('L',crop.size,bytes(clean)).filter(ImageFilter.MaxFilter(5))
    alpha=ImageChops.multiply(alpha,clean);crop.putalpha(alpha)
    crop=crop.crop(alpha.point(lambda a:255 if a>=20 else 0).getbbox())
    scale=min(item['size'][0]/crop.width,item['size'][1]/crop.height)
    crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.NEAREST)
    w,h=math.ceil(crop.width/24),math.ceil(crop.height/24)
    image=Image.new('RGBA',(w*24,h*24));image.paste(crop,((image.width-crop.width)//2,image.height-crop.height))
    ax,ay=w//2,h-1;first=byname.get(item['name']+'-0-0',len(tiles))+1
    module=dict(firstgid=first,width=w,height=h,anchorX=ax,anchorY=ay)
    if item['name'] in modules and modules[item['name']]!=module:
        raise ValueError('Native dimensions changed; explicitly re-stamp affected maps first')
    modules[item['name']]=module
    for y in range(h):
        for x in range(w):
            name=f"{item['name']}-{x}-{y}";ident=byname.get(name,len(tiles))
            piece=image.crop((x*24,y*24,(x+1)*24,(y+1)*24))
            props=dict(sortOffset=(ay-y)*24+19,empty=piece.getchannel('A').getbbox() is None)
            bw,up=item['block']
            if ax-bw//2<=x<ax-bw//2+bw and ay-up<=y<=ay:props['walkable']=False
            if x==0 and y==0:props.update(module=item['name'],moduleWidth=w,moduleHeight=h,anchorX=ax,anchorY=ay)
            definition=dict(id=ident,type=name,properties=[dict(name=k,type='bool' if isinstance(v,bool) else 'int' if isinstance(v,int) else 'string',value=v) for k,v in dict(name=name,**props).items()])
            if ident==len(tiles):tiles.append((piece,definition))
            else:tiles[ident]=(piece,definition)
pages=write_pages(root,tiles)
(root/'assets/tiles/modules.json').write_text(json.dumps(modules,indent=2)+'\n')
print(f'{len(tiles)} tiles; {len(pages)} bounded lossless pages')
