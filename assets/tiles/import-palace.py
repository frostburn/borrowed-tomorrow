#!/usr/bin/env python3
"""Append palace architecture and a dedicated marble material without repacking.

Usage: python3 assets/tiles/import-palace.py PORTICO.png WING.png WALL.png FLOOR.png
Authoring images stay outside git; runtime uses the bounded lossless tile pages.
"""
import json
import sys
from collections import deque
from pathlib import Path
from PIL import Image
from native_tiles import load_tiles, write_pages

S = 24
root = Path(__file__).resolve().parents[2]
manifest = json.loads((root / 'assets/tiles/palace.json').read_text())
modules = json.loads((root / 'assets/tiles/modules.json').read_text())
tiles = load_tiles(root)
byname = {t['type']: i for i, (_, t) in enumerate(tiles)}


def silhouette(image):
    """Binary alpha and one connected silhouette, including after sampling."""
    pixels = image.getchannel('A').point(lambda a: 255 if a >= 128 else 0).tobytes()
    seen = bytearray(len(pixels))
    largest = []
    for i, alpha in enumerate(pixels):
        if not alpha or seen[i]:
            continue
        todo = deque([i])
        seen[i] = 1
        component = []
        while todo:
            at = todo.popleft()
            component.append(at)
            x, y = at % image.width, at // image.width
            for xx, yy in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= xx < image.width and 0 <= yy < image.height:
                    k = yy * image.width + xx
                    if pixels[k] and not seen[k]:
                        seen[k] = 1
                        todo.append(k)
        if len(component) > len(largest):
            largest = component
    if not largest:
        raise ValueError('Source contains no opaque architecture')
    alpha = bytearray(len(pixels))
    for i in largest:
        alpha[i] = 255
    image.putalpha(Image.frombytes('L', image.size, bytes(alpha)))
    return image


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
    if item.get('floor'):
        source = source.resize((width, height), Image.Resampling.NEAREST)
        source.putalpha(255)
        for y in range(h):
            for x in range(w):
                add(f"{item['name']}-field-{x}-{y}", source.crop((x*S, y*S, (x+1)*S, (y+1)*S)), walkable=True)
        continue
    source = silhouette(source)
    source = source.crop(source.getbbox())
    scale = min(width / source.width, height / source.height)
    source = silhouette(source.resize((round(source.width*scale), round(source.height*scale)), Image.Resampling.NEAREST))
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
    if item['name'] == 'palace-marble-wall':
        # Native dado pixels form a short repeatable cutaway, below the actors.
        # The central span has no projecting column or transparent side edge.
        for y in range(2):
            for x in range(2):
                add(f'palace-marble-cutaway-{x}-{y}', image.crop((72+x*S, height-48+y*S, 96+x*S, height-24+y*S)), walkable=False)

pages = write_pages(root, tiles)
(root / 'assets/tiles/modules.json').write_text(json.dumps(modules, indent=2) + '\n')
print(f'{len(tiles)} tiles; {len(pages)} bounded lossless pages')
