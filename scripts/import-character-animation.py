#!/usr/bin/env python3
"""Export six walk poses into bounded native pages, retaining native attacks.
Usage: python3 scripts/import-character-animation.py GENERATED_SOURCE_DIRECTORY
Requires Pillow; source sheets stay outside git.
"""
import json,sys
from pathlib import Path
from collections import deque
from statistics import median
from PIL import Image
root=Path(__file__).resolve().parents[1];sources=Path(sys.argv[1]);manifest=json.loads((root/'assets/characters/animation-sources.json').read_text())
out=root/'public/art/animation';out.mkdir(exist_ok=True)
def isolate(image):
    image=image.copy();alpha=image.getchannel('A');p=bytes(a if a>=128 else 0 for a in alpha.tobytes());seen=bytearray(len(p));largest=[]
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
    for direction,source in manifest[hero]['walkSources'].items():
      sheet=Image.open(sources/source).convert('RGBA')
      idle=Image.open(root/f"public/art/{hero}{'' if direction=='front' else '-'+direction}.png").convert('RGBA')
      cap=idle.getchannel('A').crop((0,0,80,18)).point(lambda a:255 if a>127 else 0).getbbox();head=(cap[0]+cap[2])/2;top=cap[1]
      poses=[]
      for index in range(6):
        col,row=index%3,index//3
        cell=isolate(sheet.crop((round(col*sheet.width/3),round(row*sheet.height/2),round((col+1)*sheet.width/3),round((row+1)*sheet.height/2))))
        bbox=cell.getchannel('A').point(lambda a:255 if a>127 else 0).getbbox();poses.append(cell.crop(bbox))
      # Use one scale and a fixed hat baseline for the entire direction. Fitting
      # each silhouette to the feet makes the upper body wobble between poses.
      scale=min((68-top)/median(im.height for im in poses),76/max(im.width for im in poses),(79-top)/max(im.height for im in poses))
      path=out/f'{hero}-{direction}.png';previous=Image.open(path).convert('RGBA')
      # The final native row is the retained wind-up/contact pair; never redraw it.
      attacks=previous.crop((0,previous.height-80,160,previous.height))
      page=Image.new('RGBA',(160,320));page.paste(attacks,(0,240))
      for col,source in enumerate(poses):
        w,h=round(source.width*scale),round(source.height*scale);image=source.resize((w,h),Image.Resampling.NEAREST)
        cap=image.getchannel('A').crop((0,0,w,max(1,round(h*.2)))).point(lambda a:255 if a>127 else 0).getbbox()
        center=(cap[0]+cap[2])/2;left=max(0,min(80-w,round(head-center)))
        frame=Image.new('RGBA',(80,80));frame.paste(image,(left,top));frame=isolate(frame)
        page.paste(frame,(col%2*80,col//2*80))
      page.save(path,optimize=True)
      assert path.stat().st_size<=131072
      print(path.relative_to(root),path.stat().st_size,'bytes',f'scale {scale:.4f}')
