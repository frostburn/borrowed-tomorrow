#!/usr/bin/env python3
"""Export the development boss into small native pages, never the source sheet.
Usage: python3 assets/bosses/export-benefactor.py SOURCE.png
"""
import sys
from io import BytesIO
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(root/'assets/tiles'))
from native_tiles import clean_cutout

source=clean_cutout(Image.open(sys.argv[1]).convert('RGBA'))
# Keep the source's pixel spacing: never crop and stretch its opaque bounds.
# Image Gen may trim the requested 1440 x 1152 canvas. Restore transparent
# margins without scaling, then sample once at a fixed integer ratio.
factor=4
canvas_size=(360*factor,288*factor)
if source.width>canvas_size[0] or source.height>canvas_size[1]:
    raise ValueError(f'Source {source.size} exceeds {canvas_size}; regenerate instead of fitting it')
canvas=Image.new('RGBA',canvas_size)
offset=((canvas.width-source.width)//2,(canvas.height-source.height)//2)
canvas.paste(source,offset)
image=clean_cutout(canvas.resize((360,288),Image.Resampling.NEAREST))
print(f'Source {source.size}; transparent padding at {offset}; exact {factor}:1 reduction')
out=root/'src/dev/art';out.mkdir(exist_ok=True)
def save(piece,name):
    data=BytesIO();piece.save(data,format='WEBP',lossless=True,quality=75,method=2,exact=True)
    assert len(data.getvalue())<=131072
    assert Image.open(BytesIO(data.getvalue())).convert('RGBA').tobytes()==piece.tobytes()
    (out/name).write_bytes(data.getvalue());print(f'{name}: {len(data.getvalue())} bytes')
for y in range(2):
    for x in range(3):save(image.crop((x*120,y*144,(x+1)*120,(y+1)*144)),f'benefactor-{x}-{y}.webp')
save(image.crop((116,20,244,148)),'benefactor-portrait.webp')
