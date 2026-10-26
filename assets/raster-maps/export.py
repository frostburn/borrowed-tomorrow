"""Split curated, palette-indexed paintings into story-aware native map layers.

Called by scripts/export-raster-maps.mjs after offline Chromium SVG mask decode.
Only Pillow is needed in the authoring environment. No production dependency.
"""
import io, json, math, sys
from pathlib import Path
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[2]
TEMP=Path(sys.argv[1])
CONFIG=json.loads((Path(__file__).with_name('maps.json')).read_text())
INPUTS=json.loads((TEMP/'pieces.json').read_text())
manifest={}

def save_piece(piece,image,path,result,ox=0,oy=0):
 data=io.BytesIO();image.save(data,format='PNG',optimize=True)
 if data.tell()>96*1024 or image.width>384 or image.height>252:
  # Modest connector payloads even though the authorized guard permits 256 KiB.
  width,height=image.size
  horizontal=width>384 or height<=252 and width>=height
  boxes=[(0,0,width//2,height),(width//2,0,width,height)]if horizontal else [(0,0,width,height//2),(0,height//2,width,height)]
  for left,top,right,bottom in boxes:
   save_piece(piece,image.crop((left,top,right,bottom)),path,result,ox+left,oy+top)
  return
 suffix=f'-{ox}-{oy}'if ox or oy or image.size!=(piece['width']//2,piece['height']//2)else''
 dest=path.with_name(path.stem+suffix+'.png');dest.parent.mkdir(exist_ok=True);dest.write_bytes(data.getvalue())
 result.append({**piece,'key':piece['key']+suffix,'url':str(dest.relative_to(ROOT/'public')),'x':piece['x']+ox*2,'y':piece['y']+oy*2,'width':image.width*2,'height':image.height*2})

def indexed(image,mask,palette):
 # Keep one exact palette across every fragment; slot zero is transparent.
 out=Image.new('P',image.size);out.putpalette([0,0,0]+palette[:765])
 out.paste(image.point(lambda i:i+1),mask=mask)
 out.info['transparency']=0
 return out

for id,config in CONFIG.items():
 w,h=config['size'];size=(w//2,h//2)
 panels=sorted(Path(__file__).with_name(id).glob('painting-*.png'))
 painting=Image.new('P',size);painting.putpalette(Image.open(panels[0]).getpalette())
 for panel in panels:
  x,y=map(int,panel.stem.split('-')[1:]);tile=Image.open(panel)
  assert tile.getpalette()==painting.getpalette()
  painting.paste(tile,(x,y))
 assert painting.mode=='P' and painting.size==size
 assert painting.getextrema()[1]<255, 'Reserve palette slot zero for alpha'
 palette=painting.getpalette();pieces=[];masks=[];result=[];patches={}
 folder=ROOT/'public/art/raster-maps'/id;folder.mkdir(parents=True,exist_ok=True)
 for obsolete in folder.glob('*/*.png'):obsolete.unlink()
 for i,original in enumerate(INPUTS[id]):
  if '/light-'in original['url']:continue  # Spill is already in the painting.
  if original['layerId']in config['independent']:
   # Conditional art was excluded from the reference and painting. Never bake
   # departing coaches, gates or aftermath into the persistent floor.
   image=Image.open(TEMP/f'{id}-{i}.png').convert('RGBA')
   curated=Path(__file__).with_name(id)/(Path(original['url']).stem+'.png')
   if curated.exists():image=Image.open(curated).convert('RGBA')
   image=image.resize((math.ceil(original['width']/2),math.ceil(original['height']/2)),Image.Resampling.NEAREST)
   alpha=image.getchannel('A').point(lambda v:255 if v>=128 else 0)
   colour=image.convert('RGB').quantize(palette=painting,dither=Image.Dither.NONE)
   out=indexed(colour,alpha,palette);p={**original,'width':image.width*2,'height':image.height*2}
  else:
   key=original['key'];cutouts=config['cutouts']
   spec=cutouts.get(f'{key}@{original["x"]}',cutouts.get(key,cutouts.get(str(original['layerId']),{})))
   x,y,pw,ph=spec.get('bounds',[original[k]for k in ('x','y','width','height')])
   left,top=math.floor(x/2)*2,math.floor(y/2)*2
   right,bottom=math.ceil((x+pw)/2)*2,math.ceil((y+ph)/2)*2
   p={**original,'x':left,'y':top,'width':right-left,'height':bottom-top,'depth':spec.get('depth',original['depth'])}
   mask=Image.new('L',size)
   if 'polygon'in spec:
    ImageDraw.Draw(mask).polygon([(round(x/2),round(y/2))for x,y in spec['polygon']],fill=255)
   else:
    source=Image.open(TEMP/f'{id}-{i}.png').getchannel('A').resize((math.ceil(original['width']/2),math.ceil(original['height']/2)),Image.Resampling.NEAREST).point(lambda v:255 if v>=128 else 0)
    mask.paste(source,(math.floor(original['x']/2),math.floor(original['y']/2)))
   # The full background owns all unassigned pixels, including small details
   # outside a prop's occluding silhouette. Every other pixel has one owner.
   box=(left//2,top//2,right//2,bottom//2)
   clipped=Image.new('L',size);clipped.paste(mask.crop(box),(left//2,top//2))
   if 'underpaint'in spec:patches[i]=(clipped,spec['underpaint'])
   pieces.append((i,p,box));masks.append(clipped)
   continue
  name=Path(original['url']).stem
  p['key']=f'scene-raster-{id}-{i}-{name}'
  save_piece(p,out,folder/str(i)/f'{name}.png',result)
 # Partition the painting, keeping independent real layers and depth sorting.
 owners=Image.new('L',size,0)
 floor=painting.copy()
 for mask,(dx,dy)in patches.values():
  dx,dy=dx//2,dy//2
  floor.paste(painting.crop((dx,dy,size[0]+dx,size[1]+dy)),mask=mask)
 for (i,p,box),mask in sorted(zip(pieces,masks),key=lambda row:row[0][1]['depth']):
  if i and i not in patches:owners.paste(i,mask=mask)
 for i,p,box in pieces:
  mask=(patches[i][0]if i in patches else owners.point(lambda v:255 if v==i else 0)).crop(box)
  out=indexed((floor if p['depth']<0 else painting).crop(box),mask,palette)
  name=Path(p['url']).stem
  p['key']=f'scene-raster-{id}-{i}-{name}'
  save_piece(p,out,folder/str(i)/f'{name}.png',result)
 result.sort(key=lambda p:p['depth']);manifest[id]=result
 for file in folder.glob('*/*.png'):
  assert file.stat().st_size<=262144,(file,file.stat().st_size)
 print(f'{id}: {size[0]}x{size[1]} native, {len(result)} indexed layers, {sum(p.stat().st_size for p in folder.glob("*/*.png"))} bytes')
(ROOT/'src/content/raster-map-art.json').write_text(json.dumps(manifest,indent=2)+'\n')
