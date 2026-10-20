#!/usr/bin/env python3
"""Export the cave material sheet into native tiles; keep source sheets outside git.
Usage: python3 assets/tiles/import-caves.py CAVE_MATERIALS.png
"""
import json,sys
from pathlib import Path
from PIL import Image
from native_tiles import load_tiles,write_pages
root=Path(__file__).resolve().parents[2]
source=Image.open(sys.argv[1]).convert('RGBA');tiles=load_tiles(root)
manifest=json.loads((root/'assets/tiles/caves.json').read_text())
byname={t['type']:i for i,(_,t) in enumerate(tiles)}
for field in manifest['fields']:
    column,row=field['quadrant'];n,h=field['size'];overlap=32
    crop=source.crop((column*source.width//2,row*source.height//2,(column+1)*source.width//2,(row+1)*source.height//2))
    image=crop.resize((n+overlap,h+overlap if field['repeatY'] else h),Image.Resampling.NEAREST)
    # Cyclic crossfade, shared with the railway terrain import: opposite edges
    # meet continuously instead of exposing the source panel's crop boundary.
    for axis in ([0,1] if field['repeatY'] else [0]):
      period=n if axis==0 else h
      for i in range(overlap):
        a=(i,0,i+1,image.height) if axis==0 else (0,i,image.width,i+1)
        b=(period+i,0,period+i+1,image.height) if axis==0 else (0,period+i,image.width,period+i+1)
        mask=Image.new('L',(1,image.height) if axis==0 else (image.width,1),round(i/overlap*255))
        blend=Image.composite(image.crop(a),image.crop(b),mask);image.paste(blend,a[:2]);image.paste(blend,b[:2])
    image=image.crop((16,16 if field['repeatY'] else 0,n+16,h+16 if field['repeatY'] else h))
    if field['name']=='cave-ledge':
        # Let the foot of the cutaway merge into the shadowed rock below.
        alpha=image.getchannel('A')
        for y in range(h-16,h):
            alpha.paste(round((h-1-y)/15*255),(0,y,n,y+1))
        image.putalpha(alpha)
    for y in range(h//24):
      for x in range(n//24):
        name=f"{field['name']}-{x}-{y}";ident=byname.get(name,len(tiles))
        walkable=field['walkable'] if isinstance(field['walkable'],bool) else y==0
        tile=(image.crop((x*24,y*24,(x+1)*24,(y+1)*24)),dict(id=ident,type=name,properties=[dict(name='name',type='string',value=name),dict(name='walkable',type='bool',value=walkable)]))
        if ident==len(tiles):tiles.append(tile)
        else:tiles[ident]=tile
write_pages(root,tiles)
print(f'{len(tiles)} tiles; native cave materials appended without repacking existing pages')
