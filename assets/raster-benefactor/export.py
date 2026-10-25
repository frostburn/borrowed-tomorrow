"""Bake bounded painted boss atlas pages and arena panels, using no image API."""
from pathlib import Path
import hashlib
import json
import math
import numpy as np
from PIL import Image,ImageDraw,ImageEnhance

ROOT=Path(__file__).resolve().parents[2];HERE=Path(__file__).resolve().parent
ACTORS=ROOT/'public/art/raster-actors/benefactor';MAPS=ROOT/'public/art/raster-maps/benefactor'
ACTORS.mkdir(parents=True,exist_ok=True);MAPS.mkdir(parents=True,exist_ok=True)

def source(name):
    a=np.asarray(Image.open(HERE/'paint'/f'{name}.png').convert('RGBA')).copy()
    a[:,:,3]=np.where(a[:,:,3]>=128,255,0);a[a[:,:,3]==0]=0
    return Image.fromarray(a)

def anchored_scale(image,sx,sy,cx=90,cy=140,dy=0):
    return image.transform(image.size,Image.Transform.AFFINE,(1/sx,0,cx-cx/sx,0,1/sy,cy-(cy+dy)/sy),Image.Resampling.NEAREST)

def frame(form,i):
    rest=source(form+'-rest')
    if i<8:
        breath=(1-math.cos(i/8*math.tau))/2
        if form=='body':
            image=anchored_scale(rest,1+breath*.004,1+breath*.014)
            # The mantle's sole stays fixed while the shoulders/chest rise.
            image.paste(rest.crop((0,136,180,144)),(0,136))
        elif form=='sun':image=rest.rotate(math.sin(i/8*math.tau)*1.0,Image.Resampling.NEAREST,center=(90,70))
        else:image=anchored_scale(rest,1+breath*.012,1+breath*.012,cy=70,dy=-breath)
        return image
    if form=='body':
        image=source('body-gather' if i in (8,9) else 'body-release' if i==10 else 'body-rest')
        if i==8:image=anchored_scale(image,1,1,dy=1)
    else:
        image=rest.copy()
        if i in (8,9):image=ImageEnhance.Brightness(image).enhance(1.04 if i==8 else 1.13)
        if i==10:
            draw=ImageDraw.Draw(image)
            for radius,color in [(61,'#e2e3cf'),(67,'#8dc7be')]:
                draw.ellipse((90-radius,70-radius,90+radius,70+radius),outline=color,width=1)
    if i==10 and form=='body':
        # Brighten the existing chest facets without a soft resampling halo.
        a=np.asarray(image).copy();yy,xx=np.mgrid[:144,:180]
        field=np.maximum(0,1-((xx-90)/13)**2-((yy-65)/18)**2)*.3
        a[:,:,:3]=np.clip(a[:,:,:3]*(1+field[:,:,None]),0,255).astype(np.uint8);image=Image.fromarray(a)
    return image

frames={form:[frame(form,i) for i in range(12)] for form in ['body','sun','heart']}
# A boss-local palette keeps unrelated actor assets byte-identical on rebuild.
strip=Image.new('RGB',(180,144*36));row=0
for poses in frames.values():
    for image in poses:strip.paste(image.convert('RGB'),(0,row*144));row+=1
palette=strip.quantize(colors=255,method=Image.Quantize.MEDIANCUT)
colors=palette.getpalette()[:765];palette.putpalette(colors+[0,0,0])

def indexed(image,path):
    rgba=np.asarray(image.convert('RGBA'));p=image.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE)
    indices=np.asarray(p).copy();indices[rgba[:,:,3]<128]=255
    p=Image.fromarray(indices,'P');p.putpalette(colors+[0,0,0]);p.save(path,optimize=True,transparency=255)

def audit(path):
    image=Image.open(path);data=path.read_bytes()
    if len(data)>131072:raise ValueError(f'{path}: exceeds unchanged 128 KiB guard')
    return {'url':str(path.relative_to(ROOT/'public')),'native':[image.width,image.height],'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}

manifest=json.loads((ROOT/'src/content/raster-actors.json').read_text())
report=json.loads((ROOT/'assets/raster-actors/conversion.json').read_text())
audits=[]
for form,poses in frames.items():
    stem='benefactor'+(''if form=='body'else'-'+form)+'-motion';pages=[]
    for page_index in range(3):
        page=Image.new('RGBA',(360,288))
        for j in range(4):page.alpha_composite(poses[page_index*4+j],(j%2*180,j//2*144))
        path=ACTORS/(stem+(''if page_index==0 else'-'+str(page_index))+'.png');indexed(page,path)
        item=audit(path);audits.append(item)
        pages.append({'url':item['url'],'x':0,'y':page_index*576,'width':720,'height':576})
    vector='art/vector/benefactor/'+stem+'.svg'
    manifest[vector]={'url':pages[0]['url'],'width':720,'height':1728,'pages':pages}
    entry=next(a for a in report['assets'] if a['source']=='benefactor/'+stem+'.svg')
    entry.update({'method':'painted-boss','native':[360,288],'logical':[720,1728],'bytes':audits[-3]['bytes'],'sha256':audits[-3]['sha256'],'pages':audits[-3:]})

pieces=[]
for i,side in enumerate(['left','right']):
    source_path=HERE/'paint'/f'arena-{side}.png';path=MAPS/f'arena-{side}.png'
    Image.open(source_path).save(path,optimize=True)
    item=audit(path);audits.append(item)
    pieces.append({'key':f'benefactor-domain-raster-{side}','url':item['url'],'x':i*512,'y':0,'width':512,'height':480,'depth':-1000,'layerId':1})
(ROOT/'src/content/raster-actors.json').write_text(json.dumps(manifest,indent=2)+'\n')
(ROOT/'assets/raster-actors/conversion.json').write_text(json.dumps(report,indent=2)+'\n')
(ROOT/'src/content/benefactor-domain-art.json').write_text(json.dumps(pieces,indent=2)+'\n')
(HERE/'conversion.json').write_text(json.dumps({'grid':2,'frames':12,'idleFrames':8,'assets':audits},indent=2)+'\n')
print(f'Painted Benefactor: 9 atlas pages + 2 arena panels; largest {max(a["bytes"] for a in audits):,} bytes')
