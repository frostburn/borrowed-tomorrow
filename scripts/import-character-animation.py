#!/usr/bin/env python3
"""Export work-chat animation poses into bounded native pages.
Usage: python3 scripts/import-character-animation.py GENERATED_SOURCE_DIRECTORY
Requires Pillow; source sheets stay outside git.
"""
import json,sys,math
from pathlib import Path
from collections import deque
from statistics import median
from PIL import Image
root=Path(__file__).resolve().parents[1];sources=Path(sys.argv[1]);manifest=json.loads((root/'assets/characters/animation-sources.json').read_text())
out=root/'public/art/animation';out.mkdir(exist_ok=True)
def isolate(image):
    image=image.copy();alpha=image.getchannel('A');p=alpha.tobytes();seen=bytearray(len(p));largest=[]
    for seed,a in enumerate(p):
      if not a or seen[seed]:continue
      todo=deque([seed]);seen[seed]=1;component=[]
      while todo:
        i=todo.popleft();component.append(i);x,y=i%image.width,i//image.width
        for dy in [-1,0,1]:
          for dx in [-1,0,1]:
            xx,yy=x+dx,y+dy
            if not(0<=xx<image.width and 0<=yy<image.height):continue
            j=yy*image.width+xx
            if p[j] and not seen[j]:seen[j]=1;todo.append(j)
      if len(component)>len(largest):largest=component
    mask=bytearray(len(p))
    for i in largest:mask[i]=p[i]
    image.putalpha(Image.frombytes('L',image.size,bytes(mask)));return image
for hero in ['nell','orrin']:
    config=manifest[hero];original=Image.open(sources/config['original']).convert('RGBA');revision=Image.open(sources/config['revision']).convert('RGBA');chosen=set(map(tuple,config['revisedCells']))
    for row,direction in enumerate(manifest['layout']['rows']):
      idle=Image.open(root/f"public/art/{hero}{'' if direction=='front' else '-'+direction}.png").convert('RGBA')
      cap=idle.getchannel('A').crop((0,0,80,18)).point(lambda a:255 if a>127 else 0).getbbox();head=(cap[0]+cap[2])/2
      poses=[]
      for col in range(4):
        sheet=revision if (row,col) in chosen else original
        cell=isolate(sheet.crop((round(col*sheet.width/4),round(row*sheet.height/4),round((col+1)*sheet.width/4),round((row+1)*sheet.height/4))))
        bbox=cell.getchannel('A').point(lambda a:255 if a>127 else 0).getbbox();poses.append(cell.crop(bbox))
      scale=min(64/median(im.height for im in poses[:2]),76/max(im.width for im in poses),68/max(im.height for im in poses))
      page=Image.new('RGBA',(160,160))
      for col,source in enumerate(poses):
        w,h=round(source.width*scale),round(source.height*scale);image=source.resize((w,h),Image.Resampling.NEAREST)
        cap=image.getchannel('A').crop((0,0,w,max(1,round(h*.2)))).point(lambda a:255 if a>127 else 0).getbbox()
        center=(cap[0]+cap[2])/2;left=max(0,min(80-w,round(head-center)));top=68-h
        frame=Image.new('RGBA',(80,80));frame.paste(image,(left,top));frame=isolate(frame)
        page.paste(frame,(col%2*80,col//2*80))
      path=out/f'{hero}-{direction}.png';page.save(path,optimize=True)
      assert path.stat().st_size<=131072
      print(path.relative_to(root),path.stat().st_size,'bytes',f'scale {scale:.4f}')
