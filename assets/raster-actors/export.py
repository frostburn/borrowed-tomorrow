"""Reproducible, nearest-sampled 2px actor skin; production has no Python deps.

Canonical paintings in paint/ are already registered to the 80px actor frame.
The SVGs supply the established silhouettes, poses and equipment handedness.
No image generator is called by this export.
"""
from pathlib import Path
import difflib
import hashlib
import json
import math
import sys
import xml.etree.ElementTree as ET

import numpy as np
from PIL import Image, ImageDraw
from scipy.spatial import cKDTree
from scipy.ndimage import label

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
VECTOR = ROOT / 'public/art/vector'
OUT = ROOT / 'public/art/raster-actors'
TEMP = Path(sys.argv[1])


def clean(image):
    image = image.convert('RGBA')
    a = np.asarray(image).copy()
    a[:, :, 3] = np.where(a[:, :, 3] >= 128, 255, 0)
    a[a[:, :, 3] == 0] = 0
    return Image.fromarray(a)


def canonical(name):
    path = HERE / 'paint' / (name + '.png')
    if not path.exists():return None
    image=Image.open(path)
    return clean(image.resize((image.width//2,image.height//2),Image.Resampling.NEAREST))


def recolor(paint, reference, colors):
    """Carry existing authored enemy/civilian palettes onto the new painting.

    Use the nearest material's color delta, keeping the painting's highlights
    rather than flattening every shade to a single replacement color.
    """
    old=np.asarray(reference.convert('RGBA'))
    samples=np.unique(old[old[:,:,3]>127,:3],axis=0).astype(float)
    replacements=np.array([tuple(bytes.fromhex(colors.get('#'+''.join(f'{int(v):02x}' for v in color),'#'+''.join(f'{int(v):02x}' for v in color))[1:])) for color in samples],dtype=float)
    a=np.asarray(paint).copy();rgb=a[:,:,:3].astype(float)
    nearest=np.argmin(np.sum((rgb[:,:,None,:]-samples[None,None,:,:])**2,axis=3),axis=2)
    rgb+=replacements[nearest]-samples[nearest]
    a[:,:,:3]=np.clip(rgb,0,255).astype(np.uint8)
    return clean(Image.fromarray(a))


def points(element):
    tag = element.tag.rsplit('}', 1)[-1]
    a = element.attrib
    if tag in ('polygon', 'polyline'):
        values = a.get('points', '').replace(',', ' ').split()
        return np.array(list(zip(map(float, values[::2]), map(float, values[1::2]))))
    if tag == 'rect':
        x, y, w, h = (float(a.get(k, 0)) for k in ('x', 'y', 'width', 'height'))
        return np.array([(x, y), (x+w, y), (x+w, y+h), (x, y+h)])
    if tag == 'ellipse':
        x, y, rx, ry = (float(a[k]) for k in ('cx', 'cy', 'rx', 'ry'))
        return np.array([(x, y), (x-rx, y), (x+rx, y), (x, y-ry), (x, y+ry)])
    return np.empty((0, 2))


def shapes(svg):
    result = []
    for e in svg:
        p = points(e)
        if not len(p):
            continue
        # Lead/supporting rigs use a 40x80 viewBox stretched to 80x80.
        p[:, 0] *= 2
        result.append(((e.tag, e.get('fill'), e.get('stroke')), p / 2))
    return result


def retarget(paint, idle, frame):
    """Rigid material patches follow the original rig, including held tools.

    Match the vector drawing's ordered shapes, bind painted pixels to their
    nearest visible material, and inverse-sample each posed patch once. Unlike
    a whole-image rubber-sheet warp, straight weapons and boot soles stay rigid.
    """
    old,new=shapes(idle),shapes(frame)
    pairs={}
    matcher=difflib.SequenceMatcher(None,[s[0] for s in old],[s[0] for s in new],autojunk=False)
    for block in matcher.get_matching_blocks():
        for i in range(block.size):
            a,b=block.a+i,block.b+i
            if old[a][1].shape==new[b][1].shape:pairs[a]=b
    if not pairs:raise ValueError('No corresponding rig geometry')
    labels=Image.new('I',(40,40));draw=ImageDraw.Draw(labels)
    colors=[]
    for i,(key,p) in enumerate(old):
        tag=key[0].rsplit('}',1)[-1];coords=[tuple(x) for x in p]
        color=key[1] if key[1] and key[1]!='none' else key[2]
        colors.append(tuple(bytes.fromhex(color[1:])) if color and color.startswith('#') else (0,0,0))
        if tag=='ellipse':draw.ellipse((p[:,0].min(),p[:,1].min(),p[:,0].max(),p[:,1].max()),fill=i+1)
        elif tag=='polyline':draw.line(coords,fill=i+1,width=1)
        else:draw.polygon(coords,fill=i+1)
    labels=np.asarray(labels);ys,xs=np.where(labels>0);ids=labels[ys,xs]-1
    # Position dominates; material similarity prevents a gold tool's pixels
    # binding to the neighboring navy trousers or red sleeve.
    color=np.array(colors,dtype=float)[ids]
    tree=cKDTree(np.c_[xs+.5,ys+.5,color*.035])
    source=np.asarray(paint);py,px=np.where(source[:,:,3]>0)
    _,nearest=tree.query(np.c_[px+.5,py+.5,source[py,px,:3]*.035])
    assignments=np.full((40,40),-1);assignments[py,px]=ids[nearest]
    output=Image.new('RGBA',(40,40))
    for index in sorted(set(assignments[py,px]),key=lambda i:pairs.get(i,i)):
        target=pairs.get(index);a=old[index][1]
        b=new[target][1] if target is not None else a
        # Fit a similarity transform. It permits uniform perspective changes,
        # never the shear that made thin tools and boots turn into triangles.
        ac,bc=a.mean(axis=0),b.mean(axis=0);aa,bb=a-ac,b-bc
        u,_,vt=np.linalg.svd(aa.T@bb);rotation=u@vt
        if np.linalg.det(rotation)<0:u[:,-1]*=-1;rotation=u@vt
        denom=np.sum(aa*aa);scale=np.sum((aa@rotation)*bb)/denom if denom else 1
        scale=float(np.clip(scale,.8,1.25));matrix=rotation*scale
        shift=bc-ac@matrix
        # Keep the accepted face fixed across every phase of walking/casting.
        if a[:,1].max()<12:matrix=np.eye(2);shift=np.zeros(2)
        inverse=np.linalg.inv(matrix);offset=-shift@inverse
        piece=np.array(source);piece[assignments!=index]=0
        coeff=(inverse[0,0],inverse[1,0],offset[0],inverse[0,1],inverse[1,1],offset[1])
        posed=Image.fromarray(piece).transform((40,40),Image.Transform.AFFINE,coeff,Image.Resampling.NEAREST)
        output.alpha_composite(posed)
    # Fill only enclosed single-pixel pinholes at material joins. Never bridge
    # empty leg gaps, add silhouette outlines, or blur neighboring colors.
    pixels=np.asarray(output).copy()
    for y in range(1,39):
        for x in range(1,39):
            if pixels[y,x,3]:continue
            neighbors=[pixels[y-1,x],pixels[y+1,x],pixels[y,x-1],pixels[y,x+1]]
            if all(p[3] for p in neighbors):pixels[y,x]=neighbors[0]
    return clean(Image.fromarray(pixels))


def join_walk(image):
    """Finish pixel joints between independently posed sleeve/leg materials.

    Only local gaps of at most five native pixels can be reconstructed. Bigger
    gaps stop export for review; detached dust is removed. The connecting plane
    uses the parent material, never a new dark outline or an antialiased stroke.
    """
    pixels=np.asarray(image).copy();labels,count=label(pixels[:,:,3]>0,np.ones((3,3)))
    sizes=np.bincount(labels.ravel());sizes[0]=0
    if not count:raise ValueError('An empty walking pose')
    main=int(np.argmax(sizes));main_points=np.argwhere(labels==main);tree=cKDTree(main_points)
    for part in range(1,count+1):
        if part==main:continue
        coords=np.argwhere(labels==part)
        if len(coords)<=2:
            pixels[labels==part]=0;continue
        distances,nearest=tree.query(coords);at=int(np.argmin(distances))
        if distances[at]>5:raise ValueError('Walk material gap exceeds five pixels; review the binding')
        a,b=coords[at],main_points[nearest[at]]
        color=tuple(pixels[b[0],b[1]])
        bridge=Image.new('RGBA',image.size);draw=ImageDraw.Draw(bridge)
        draw.line([(int(b[1]),int(b[0])),(int(a[1]),int(a[0]))],fill=color,width=2 if a[0]>23 else 1)
        # Existing painted highlights and boot soles win over the underpaint.
        bridge.alpha_composite(Image.fromarray(pixels));pixels=np.asarray(bridge).copy()
    return clean(Image.fromarray(pixels))


def raster(path):
    source = clean(Image.open(TEMP / path.replace('.svg','.png')))
    w,h = source.size
    if w%2 or h%2:
        raise ValueError(f'{path}: logical dimensions must be even')
    name = path.removesuffix('.svg')
    painted = canonical(name)
    if painted is not None:
        return painted, (w,h), 'paint'
    variants=json.loads((ROOT/'src/content/enemy-variants.json').read_text())
    if name in variants:
        variant=variants[name];base=canonical(variant['kind'])
        if base is not None:
            reference=Image.open(TEMP/(variant['kind']+'.png'))
            return recolor(base,reference,variant['colors']),(w,h),'recolor'
    civilian_bases={
        'civilian-dockhand-rust':'civilian-dockhand',
        'civilian-traveler-blue':'civilian-traveler',
        'civilian-family-blue':'civilian-family',
        'civilian-family-plum':'civilian-family',
        'civilian-patient-green':'civilian-patient',
    }
    if name in civilian_bases:
        base_name=civilian_bases[name];base=canonical(base_name)
        if base is not None:
            original=np.asarray(Image.open(TEMP/(base_name+'.png')).convert('RGBA'))
            variant=np.asarray(source);mapping={}
            for a,b in zip(original.reshape(-1,4),variant.reshape(-1,4)):
                if a[3]>127 and b[3]>127 and not np.array_equal(a[:3],b[:3]):
                    mapping['#'+bytes(a[:3]).hex()]='#'+bytes(b[:3]).hex()
            return recolor(base,Image.fromarray(original),mapping),(w,h),'recolor'
    if name.startswith('animation/'):
        hero,direction = name.split('/')[1].rsplit('-',1)
        idle_name = hero + ('' if direction=='front' else '-'+direction)
        paint = canonical(idle_name)
        if paint is not None:
            idle = ET.parse(VECTOR / (idle_name+'.svg')).getroot()
            frames=list(ET.parse(VECTOR / path).getroot())
            atlas=Image.new('RGBA',(w//2,h//2))
            for i,frame in enumerate(frames):
                if frame.tag.rsplit('}',1)[-1]!='svg':continue
                authored=canonical(f'animation/{hero}-{direction}-{i}')
                pose=authored if authored is not None else retarget(paint,idle,frame)
                if i<6:pose=join_walk(pose)
                atlas.alpha_composite(pose,(i%2*40,i//2*40))
            return atlas,(w,h),'rig'
    # Bosses retain the accepted native poses and articulated parts. A common
    # native grid/palette treats them like the rest of the cast without changing
    # their tactical silhouette, atlas layout or hit-mask coordinate system.
    return source.resize((w//2,h//2),Image.Resampling.NEAREST),(w,h),'vector'


files=json.loads((TEMP/'files.json').read_text())
images=[]
for path in files:
    image,size,method=raster(path)
    images.append((path,image,size,method))

# One palette for the entire cast and every frame avoids independently moving
# quantizer choices. It compresses files; lighting still uses unrestricted RGB.
samples=Image.new('RGB',(256,math.ceil(sum(im.width*im.height for _,im,_,_ in images)/256)))
values=[]
for _,im,_,_ in images:
    a=np.asarray(im);values.extend(a[a[:,:,3]>0,:3].tolist())
pixels=np.zeros((samples.height*samples.width,3),dtype=np.uint8)
if len(values)>len(pixels):
    samples=Image.new('RGB',(256,math.ceil(len(values)/256)));pixels=np.zeros((samples.height*256,3),dtype=np.uint8)
pixels[:len(values)]=values
palette=Image.fromarray(pixels.reshape(samples.height,256,3)).quantize(colors=255,method=Image.Quantize.MEDIANCUT)
colors=palette.getpalette()[:255*3]
palette.putpalette(colors+[0,0,0])
manifest={};report=[]
for path,image,(w,h),method in images:
    p=image.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE)
    indices=np.asarray(p).copy();indices[np.asarray(image)[:,:,3]==0]=255
    p=Image.fromarray(indices,'P');p.putpalette(colors+[0,0,0]);p.info['transparency']=255
    name=path.replace('.svg','.png');target=OUT/name;target.parent.mkdir(parents=True,exist_ok=True)
    p.save(target,optimize=True,transparency=255)
    if target.stat().st_size>131072:raise ValueError(f'{name} exceeds 128 KiB')
    manifest['art/vector/'+path]={'url':'art/raster-actors/'+name,'width':w,'height':h}
    report.append({'source':path,'method':method,'native':[p.width,p.height],'logical':[w,h],'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
(ROOT/'src/content/raster-actors.json').write_text(json.dumps(manifest,indent=2)+'\n')
(HERE/'conversion.json').write_text(json.dumps({'grid':2,'colors':255,'transparentIndex':255,'assets':report},indent=2)+'\n')
print(f'{len(images)} raster actor assets / {sum(p.stat().st_size for p in OUT.rglob("*.png")):,} bytes; all files <=128 KiB')
