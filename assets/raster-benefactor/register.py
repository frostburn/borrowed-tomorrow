"""Register reviewed ImageGen paintings; never put the full masters in git.

Usage: python3 assets/raster-benefactor/register.py boss-sheet.png arena.png
The reviewed sheet has uneven horizontal spacing, so use explicit crops rather
than cutting fingertips at nominal equal-cell boundaries.
"""
from pathlib import Path
import hashlib
import json
import sys
import numpy as np
from PIL import Image
from scipy.ndimage import label

HERE=Path(__file__).resolve().parent
OUT=HERE/'paint';OUT.mkdir(parents=True,exist_ok=True)
boss_path,arena_path=map(Path,sys.argv[1:3])
record=json.loads((HERE/'generation.json').read_text())
for path,key in [(boss_path,'bossSha256'),(arena_path,'arenaSha256')]:
    if hashlib.sha256(path.read_bytes()).hexdigest()!=record[key]:
        raise ValueError(f'{path}: unreviewed master; register new crops deliberately')
boss=Image.open(boss_path).convert('RGBA')
assert boss.size==(1402,1122), 'Review and register crops for a different sheet'
specs={
    'body-rest':((0,0,525,374),(2,8,178,140),'body'),
    'body-gather':((0,374,525,748),(27,8,153,140),'body'),
    'body-release':((0,748,525,1122),(2,8,178,140),'body'),
    'sun-rest':((530,0,968,374),(22,2,158,138),'sun'),
    'heart-rest':((978,0,1402,374),(26,6,154,134),'heart'),
}
records=[]
for name,(crop,target,form) in specs.items():
    cell=boss.crop(crop);a=np.asarray(cell).copy()
    labels,n=label(a[:,:,3]>=128,np.ones((3,3)));sizes=np.bincount(labels.ravel())
    largest=max(sizes[1:]);keep=np.isin(labels,[i for i in range(1,n+1) if sizes[i]>=max(10,largest*.002)])
    a[~keep]=0;image=Image.fromarray(a);bounds=image.getbbox();image=image.crop(bounds)
    # Keep the rays circular, and register all body's head/base anchors equally.
    image=image.resize((target[2]-target[0],target[3]-target[1]),Image.Resampling.BOX)
    canvas=Image.new('RGBA',(180,144));canvas.alpha_composite(image,target[:2]);canvas.save(OUT/f'{name}.png',optimize=True)
    records.append({'name':name,'form':form,'crop':crop,'alphaCrop':bounds,'target':target})

arena=Image.open(arena_path).convert('RGB').resize((512,240),Image.Resampling.BOX)
# Align the painted floor's top, front walking edge and cutaway to the accepted
# world coordinates. This keeps the bottom combat row on the top surface.
ys=np.interp(np.arange(240)+.5,[0,36,221.5,231,239,240],[0,33,189,201,217.5,240])
pixels=np.asarray(arena)[np.clip(np.floor(ys).astype(int),0,239)]
arena=Image.fromarray(pixels).quantize(colors=255,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
for side,x in [('left',0),('right',256)]:arena.crop((x,0,x+256,240)).save(OUT/f'arena-{side}.png',optimize=True)
(HERE/'generation.json').write_text(json.dumps({
    'tool':'built-in image_gen.imagegen','bossSha256':hashlib.sha256(boss_path.read_bytes()).hexdigest(),
    'arenaSha256':hashlib.sha256(arena_path.read_bytes()).hexdigest(),'panels':records,
    'arena':{'native':[512,240],'targetRows':[0,36,221.5,231,239,240],'sourceRows':[0,33,189,201,217.5,240]},
},indent=2)+'\n')
print('Registered five boss key poses and two arena panels')
