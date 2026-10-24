#!/usr/bin/env python3
"""Export the imperial exterior without repacking accepted tiles.

Usage: python3 assets/tiles/import-conduit-exterior.py HALL.png WING.png PAVILION.png
Authoring images stay outside git; runtime uses the bounded lossless tile pages.
"""
import json
import sys
from pathlib import Path
from PIL import Image
from native_tiles import load_tiles, write_pages, clean_cutout

S = 24
root = Path(__file__).resolve().parents[2]
manifest = json.loads((root / 'assets/tiles/conduit-exterior.json').read_text())
modules = json.loads((root / 'assets/tiles/modules.json').read_text())
tiles = load_tiles(root)
byname = {t['type']: i for i, (_, t) in enumerate(tiles)}


def add(name, image, **properties):
    ident = byname.get(name, len(tiles))
    properties = dict(name=name, **properties)
    definition = dict(id=ident, type=name, properties=[
        dict(name=k, type='bool' if isinstance(v, bool) else 'int' if isinstance(v, int) else 'string', value=v)
        for k, v in properties.items()
    ])
    if ident == len(tiles):
        tiles.append((image, definition))
    else:
        tiles[ident] = image, definition
    return ident + 1


for item in manifest:
    source = Image.open(sys.argv[item['input'] + 1]).convert('RGBA')
    width, height = item['size']
    w, h = width // S, height // S
    source = clean_cutout(source)
    source = source.crop(source.getbbox())
    fit_width, fit_height = item.get('contentSize', item['size'])
    if not (0 < fit_width <= width and 0 < fit_height <= height):
        raise ValueError('Content budget must fit the fixed module canvas')
    scale = min(fit_width / source.width, fit_height / source.height)
    source = clean_cutout(source.resize((round(source.width*scale), round(source.height*scale)), Image.Resampling.NEAREST))
    image = Image.new('RGBA', (width, height))
    image.paste(source, ((width-source.width)//2, height-source.height))
    ax, ay = w // 2, h - 1
    first = byname.get(item['name'] + '-0-0', len(tiles)) + 1
    module = dict(firstgid=first, width=w, height=h, anchorX=ax, anchorY=ay)
    if item['name'] in modules and modules[item['name']] != module:
        raise ValueError('Module dimensions changed; re-stamp affected maps explicitly')
    modules[item['name']] = module
    for y in range(h):
        for x in range(w):
            piece = image.crop((x*S, y*S, (x+1)*S, (y+1)*S))
            props = dict(sortOffset=(ay-y)*S+19, empty=piece.getchannel('A').getbbox() is None)
            bw, up = item['block']
            if ax-bw//2 <= x < ax-bw//2+bw and ay-up <= y <= ay:
                props['walkable'] = False
            if x == 0 and y == 0:
                props.update(module=item['name'], moduleWidth=w, moduleHeight=h, anchorX=ax, anchorY=ay)
            add(f"{item['name']}-{x}-{y}", piece, **props)

pages = write_pages(root, tiles)
(root / 'assets/tiles/modules.json').write_text(json.dumps(modules, indent=2) + '\n')
print(f'{len(tiles)} tiles; {len(pages)} bounded lossless pages')
