"""Recover five reviewed, independently painted inhalation poses.

Usage: python3 assets/raster-benefactor/register-breath.py /path/to/master.png
Only small native panels are committed; the generated sheet stays outside git.
"""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import label

HERE=Path(__file__).resolve().parent
record=json.loads((HERE/'breathing.json').read_text())
path=Path(sys.argv[1])
if hashlib.sha256(path.read_bytes()).hexdigest()!=record['masterSha256']:
    raise ValueError('Unreviewed breathing sheet: register its poses deliberately')
master=Image.open(path).convert('RGBA')
assert list(master.size)==record['masterSize']
colors=json.loads((HERE/'palette.json').read_text())
palette=Image.new('P',(1,1));palette.putpalette(colors+[0,0,0])
for frame in record['frames']:
    pixels=np.asarray(master.crop(frame['crop'])).copy()
    # Reject the unwanted translucent outer haze, keeping the opaque body.
    pixels[pixels[:,:,3]<record['alphaCutoff']]=0
    labels,n=label(pixels[:,:,3]>0,np.ones((3,3)))
    areas=np.bincount(labels.ravel());pixels[labels!=1+areas[1:].argmax()]=0
    image=Image.fromarray(pixels);assert list(image.getbbox())==frame['alphaCrop']
    x,y,w,h=frame['target']
    # One uniform source registration per newly drawn pose. The exporter
    # subsequently copies these final native pixels without any transforms.
    image=image.crop(frame['alphaCrop']).resize((w,h),Image.Resampling.BOX)
    canvas=Image.new('RGBA',record['native']);canvas.alpha_composite(image,(x,y))
    rgba=np.asarray(canvas)
    indexed=canvas.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE)
    indices=np.asarray(indexed).copy();indices[rgba[:,:,3]<128]=255
    indexed=Image.fromarray(indices,'P');indexed.putpalette(colors+[0,0,0])
    aligned=Image.new('P',record['native'],255);aligned.putpalette(colors+[0,0,0])
    aligned.paste(indexed,tuple(frame['align']))
    aligned.save(HERE/frame['source'],optimize=True,transparency=255)
print('Registered five native painted breathing poses; base anchor (90,139)')
