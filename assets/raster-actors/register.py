"""Optional recovery of reviewed painting panels from a matching AI master.

Full generator sheets stay outside git. Run this only with the exact reviewed
source SHA recorded in generation.json; ordinary exports use committed paint/.
"""
from pathlib import Path
import hashlib
import json
import re
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import label

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
source=Path(sys.argv[1]);sha=hashlib.sha256(source.read_bytes()).hexdigest()
entries=[a for a in json.loads((HERE/'generation.json').read_text())['sources'] if a['sourceSha256']==sha]
if not entries:raise ValueError('Unreviewed source: no matching SHA in generation.json')
master=Image.open(source).convert('RGBA')
for entry in entries:
    name=entry['name'];cell=master.crop(entry['cell']);a=np.asarray(cell).copy()
    labels,n=label(a[:,:,3]>=128,np.ones((3,3)));sizes=np.bincount(labels.ravel());largest=np.argmax(sizes[1:])+1
    if name in ('nell-rest','pair-hug','pair-hands'):
        keep=np.isin(labels,[i for i in range(1,n+1) if sizes[i]>=max(8,sizes[largest]*.01)])
    else:keep=labels==largest
    a[~keep]=0
    sprite=Image.fromarray(a).crop(entry['alphaCrop']).resize(entry['registeredSize'],Image.Resampling.BOX)
    if name.startswith('animation/'):size=(80,80)
    else:
        svg=(ROOT/'public/art/vector'/f'{name}.svg').read_text()
        size=tuple(map(int,re.search(r'width="(\d+)" height="(\d+)"',svg).groups()))
    panel=Image.new('RGBA',size);panel.alpha_composite(sprite,entry['registeredAt'])
    target=HERE/'paint'/f'{name}.png';target.parent.mkdir(parents=True,exist_ok=True);panel.save(target,optimize=True)
print(f'Recovered {len(entries)} registered panels')
