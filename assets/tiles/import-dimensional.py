#!/usr/bin/env python3
"""Extract the supplied modular art into small, lossless native tile pages.

Requires Pillow. Run only for authoring; builds use the checked-in pages.
Usage: python3 assets/tiles/import-dimensional.py SCENERY.png TERRAIN.png
The input sheets remain outside git. No source sheet is copied or uploaded.
"""
import sys,json,math,re
from pathlib import Path
from PIL import Image,ImageChops,ImageFilter
from collections import deque
from native_tiles import load_tiles,write_pages,join
S=24
root=Path(__file__).resolve().parents[2]
manifest=json.loads((root/'assets/tiles/scenery.json').read_text())
source=Image.open(sys.argv[1]).convert('RGBA');terrain=Image.open(sys.argv[2]).convert('RGBA')
old=load_tiles(root);tiles=list(old[:161]);modules={};foreground=[]
def add(name,image,**props):
    ident=len(tiles);tiles.append((image,dict(id=ident,type=name,properties=[dict(name='name',type='string',value=name)]+[dict(name=k,type='bool' if isinstance(v,bool) else 'int' if isinstance(v,int) else 'string',value=v) for k,v in props.items()])))
    return ident+1
for item in manifest:
    crop=source.crop(tuple(item['crop']))
    # Ignore faint distant alpha when finding the crop, retaining the original
    # alpha/colors inside that crop rather than thresholding the actual artwork.
    mask=crop.getchannel('A').point(lambda a:255 if a>=20 else 0)
    pixels=mask.tobytes();seen=bytearray(len(pixels));largest=[]
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
    crop.putalpha(ImageChops.multiply(crop.getchannel('A'),clean))
    bounds=mask.getbbox()
    crop=crop.crop(bounds);budget=item['size'];scale=min(budget[0]/crop.width,budget[1]/crop.height)
    crop=crop.resize((round(crop.width*scale),round(crop.height*scale)),Image.Resampling.NEAREST)
    w,h=math.ceil(crop.width/S),math.ceil(crop.height/S);image=Image.new('RGBA',(w*S,h*S));image.paste(crop,((image.width-crop.width)//2,image.height-crop.height))
    ax,ay=w//2,h-1;first=1+len(tiles);modules[item['name']]=dict(firstgid=first,width=w,height=h,anchorX=ax,anchorY=ay)
    if item.get('foreground'):
        foreground.append((item,image.copy(),ay));alpha=image.getchannel('A');mask=alpha.load();f=item['foreground']
        for yy in range(image.height):
          for xx in range(image.width):
            if yy>=(f['postY'] if xx<f['postWidth'] or xx>=image.width-f['postWidth'] else f['railY']):mask[xx,yy]=0
        image.putalpha(alpha)
    for y in range(h):
      for x in range(w):
        piece=image.crop((x*S,y*S,(x+1)*S,(y+1)*S));p=dict(sortOffset=(ay-y)*S+19,empty=piece.getchannel('A').getbbox() is None)
        if item.get('floor') or y in item.get('floorRows',[]):p['walkable']=True
        elif item.get('block'):
          bw,up=item['block']
          if ax-bw//2<=x<ax-bw//2+bw and ay-up<=y<=ay:p['walkable']=False
        if x==0 and y==0:p.update(module=item['name'],moduleWidth=w,moduleHeight=h,anchorX=ax,anchorY=ay)
        add(f"{item['name']}-{x}-{y}",piece,**p)
# Material fields are real reusable tiles, never samples of a whole map.
# A cyclic crossfade across 32px overlap prevents borders at each repeat.
for index,name in enumerate(['grass','earth','paving','ballast','water','granite']):
    n=192 if name in ['paving','ballast'] else 240
    period=96 if name=='paving' else n
    patch=terrain.crop((index%3*512,index//3*512,index%3*512+512,index//3*512+512)).resize((period+32,period+32),Image.Resampling.NEAREST)
    # Seam at the cropped repeat boundary blends the same two edge strips.
    for axis in [0,1]:
      for i in range(32):
        mask=Image.new('L',(1,patch.height) if axis==0 else (patch.width,1),round(i/32*255))
        a=(i,0,i+1,patch.height) if axis==0 else (0,i,patch.width,i+1)
        b=(period+i,0,period+i+1,patch.height) if axis==0 else (0,period+i,patch.width,period+i+1)
        blend=Image.composite(patch.crop(a),patch.crop(b),mask);patch.paste(blend,a[:2]);patch.paste(blend,b[:2])
    patch=patch.crop((16,16,period+16,period+16));count=n//S
    for y in range(count):
      for x in range(count):add(f'{name}-field-{x}-{y}',patch.crop((x*S%period,y*S%period,x*S%period+S,y*S%period+S)),walkable=name!='water')
# Rebuild every previously authored join in stable order, preserving map IDs.
byname={t['type']:t['id']+1 for _,t in tiles}
legacy_end=json.loads((root/'assets/tiles/modules.json').read_text())['footbridge-front']['firstgid']-1
for _,tile in old[:legacy_end]:
    match=re.fullmatch(r'(grass|earth|paving|ballast|water|granite)-join-(\d+)-(\d+)-(\d+)',tile['type'])
    if not match:continue
    name,x,y,mask=match.groups();source=tiles[byname[f'{name}-field-{x}-{y}']-1][0]
    gid=add(tile['type'],join(source,int(mask)),walkable=name!='water');byname[tile['type']]=gid
# Bridge decks render below actors. Split the near rail and posts
# into a sorted foreground module; every retained pixel comes from the source.
for item,image,ay in foreground:
    f=item['foreground'];front=image.copy();alpha=front.getchannel('A');mask=alpha.load()
    for y in range(image.height):
      for x in range(image.width):
        if y<(f['postY'] if x<f['postWidth'] or x>=image.width-f['postWidth'] else f['railY']):mask[x,y]=0
    front.putalpha(alpha);w,h=image.width//S,image.height//S
    name=item['name']+'-front';modules[name]=dict(firstgid=len(tiles)+1,width=w,height=h,anchorX=w//2,anchorY=ay)
    for y in range(h):
      for x in range(w):
        piece=front.crop((x*S,y*S,(x+1)*S,(y+1)*S))
        add(f'{name}-{x}-{y}',piece,sortOffset=(ay-y)*S+19,empty=piece.getchannel('A').getbbox() is None)
# Preserve every later vocabulary entry in order. Appended joins are rebuilt
# from the refreshed fields in their original slots, after the newer scenery.
for image,tile in old[len(tiles):]:
    match=re.fullmatch(r'(grass|earth|paving|ballast|water|granite)-join-(\d+)-(\d+)-(\d+)',tile['type'])
    if match:
        name,x,y,mask=match.groups();image=join(tiles[byname[f'{name}-field-{x}-{y}']-1][0],int(mask))
    tiles.append((image,dict(tile,id=len(tiles))))
for name,module in json.loads((root/'assets/tiles/modules.json').read_text()).items():
    if name.startswith(('coast-','ward-')):modules[name]=module
# Artwork dimensions are part of the map vocabulary. Catch source/crop changes
# that would require deliberately re-stamping a map instead of corrupting IDs.
if len(tiles)!=len(old) or any(a[1]['type']!=b[1]['type'] for a,b in zip(tiles,old)):
    raise ValueError('The import changed tile dimensions/IDs. Re-stamp affected modules before exporting maps.')
pages=write_pages(root,tiles)
(root/'assets/tiles/modules.json').write_text(json.dumps(modules,indent=2)+'\n')
print(f'{len(tiles)} native tiles; {len(pages)} pages; every image <= 128 KB')
