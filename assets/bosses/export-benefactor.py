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
source=source.crop(source.getbbox());scale=min(360/source.width,288/source.height)
source=clean_cutout(source.resize((round(source.width*scale),round(source.height*scale)),Image.Resampling.NEAREST))
image=Image.new('RGBA',(360,288));image.paste(source,((360-source.width)//2,288-source.height))
out=root/'src/dev/art';out.mkdir(exist_ok=True)
def save(piece,name):
    data=BytesIO();piece.save(data,format='WEBP',lossless=True,quality=75,method=2,exact=True)
    assert len(data.getvalue())<=131072
    assert Image.open(BytesIO(data.getvalue())).convert('RGBA').tobytes()==piece.tobytes()
    (out/name).write_bytes(data.getvalue());print(f'{name}: {len(data.getvalue())} bytes')
for y in range(2):
    for x in range(3):save(image.crop((x*120,y*144,(x+1)*120,(y+1)*144)),f'benefactor-{x}-{y}.webp')
save(image.crop((116,20,244,148)),'benefactor-portrait.webp')
