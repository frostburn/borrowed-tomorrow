#!/usr/bin/env python3
"""Bake reusable feathered terrain edges selected by Tiled's blendEdges property.

Usage: python3 assets/tiles/blend-terrains.py
Existing page pixels/IDs stay intact. Builds need neither Pillow nor this tool.
"""
import json,re
from pathlib import Path
from native_tiles import load_tiles,write_pages,join

root=Path(__file__).resolve().parents[2];tiles=load_tiles(root)
byname={t['type']:t['id']+1 for _,t in tiles}
pattern=re.compile(r'(grass|earth|paving|ballast|water|granite|works-stone|works-deck)-(field|join)-(\d+)-(\d+)(?:-(\d+))?')
def field(gid):
    return pattern.fullmatch(tiles[gid-1][1]['type']) if gid else None

maps=[];added=0;edges=0
for file in sorted((root/'src/content').glob('chapter-*/maps/*.json')):
    data=json.loads(file.read_text());w,h=data['width'],data['height'];below=[0]*(w*h);changed=False
    # Separate map-review layers can form one continuous material surface.
    # Group only equally visible floors; a hidden deck must not close a join.
    groups={}
    for layer in data['layers']:
        p={i['name']:i['value'] for i in layer.get('properties',[])}
        if p.get('blendEdges') and p.get('blendGroup') and not p.get('sort'):
            key=(p['blendGroup'],p.get('requiredFlag'),p.get('hiddenFlag'))
            group=groups.setdefault(key,{})
            for i,gid in enumerate(layer.get('data',[])):
                match=field(gid)
                if match:group[i]=match[1]
    for layer in data['layers']:
        cells=layer.get('data')
        if cells is None:continue
        p={i['name']:i['value'] for i in layer.get('properties',[])}
        if p.get('blendEdges'):
            original=cells.copy()
            continuous=groups.get((p.get('blendGroup'),p.get('requiredFlag'),p.get('hiddenFlag')), {})
            for i,gid in enumerate(original):
                match=field(gid)
                if not match:continue
                material,_,xx,yy,_=match.groups();mask=0;x,y=i%w,i//w
                # Quays, cutaway walls and the map boundary remain hard edges.
                under=tiles[below[i]-1][1]['type'] if below[i] else 'void'
                if under!='void' and not under.startswith('water-'):
                    for dx,dy,side in [(0,-1,1),(1,0,2),(0,1,4),(-1,0,8)]:
                        nx,ny=x+dx,y+dy
                        if not(0<=nx<w and 0<=ny<h):continue
                        other=field(original[ny*w+nx])
                        if (not other or other[1]!=material) and continuous.get(ny*w+nx)!=material:mask|=side
                name=f'{material}-join-{xx}-{yy}-{mask}' if mask else f'{material}-field-{xx}-{yy}'
                if name not in byname:
                    source=tiles[byname[f'{material}-field-{xx}-{yy}']-1][0];ident=len(tiles)
                    tiles.append((join(source,mask),dict(id=ident,type=name,properties=[dict(name='name',type='string',value=name),dict(name='walkable',type='bool',value=material!='water')])))
                    byname[name]=ident+1;added+=1
                changed|=cells[i]!=byname[name]
                cells[i]=byname[name];edges+=bool(mask)
        # Only unconditional floor layers provide the backdrop for a join.
        if not p.get('sort') and not p.get('requiredFlag') and not p.get('hiddenFlag'):
            for i,gid in enumerate(cells):
                if gid:below[i]=gid
    if changed:maps.append((file,data))

pages=write_pages(root,tiles)
for file,data in maps:
    data['tilesets']=[dict(firstgid=p['firstgid'],source=p['source']) for p in pages]
    text=json.dumps(data,indent=2)
    def rows(match):
        values=json.loads('['+match[1]+']');w=data['width']
        return '"data": [\n'+',\n'.join('        '+','.join(map(str,values[i:i+w])) for i in range(0,len(values),w))+'\n      ]'
    file.write_text(re.sub(r'"data": \[([^]]*)\]',rows,text)+'\n')
print(f'{edges} feathered cells; {added} appended tiles; {len(pages)} bounded lossless pages')
