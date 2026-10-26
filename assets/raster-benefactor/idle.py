"""Pixel-registered sun/heart motion. The body's poses are dedicated paintings."""
import numpy as np
from PIL import Image,ImageDraw

SUN_CRYSTAL=[(82,46),(96,44),(108,63),(102,83),(88,96),(70,76),(71,58)]

def mask(image,polygon):
    m=Image.new('L',image.size);ImageDraw.Draw(m).polygon(polygon,fill=255)
    return np.asarray(m)>0

def shift(image,dx,dy):
    """An exact blit: no transforms and no fractional positions."""
    assert isinstance(dx,int) and isinstance(dy,int)
    canvas=Image.new('RGBA',image.size);canvas.paste(image,(dx,dy));return canvas

def cutout(image,polygon,dx,dy,under=None,crystal=False):
    if dx==dy==0:return image.copy()
    pixels=np.asarray(image).copy();selected=mask(image,polygon)&(pixels[:,:,3]>0)
    if crystal:selected&=pixels[:,:,1]>35
    part=pixels.copy();part[~selected]=0
    pixels[selected]=(0,0,0,0)if under is None else under
    canvas=Image.fromarray(pixels)
    canvas.alpha_composite(shift(Image.fromarray(part),dx,dy));return canvas

def crystal_light(image,polygon,strength):
    """Change crystal illumination, never its edges or the surrounding metal."""
    if strength==0:return image
    pixels=np.asarray(image).copy();rgb=pixels[:,:,:3].astype(float)
    selected=mask(image,polygon)&(pixels[:,:,3]>0)&(rgb[:,:,1]>45)&(rgb[:,:,2]>rgb[:,:,0]*1.15)&(rgb[:,:,1]>rgb[:,:,0]*1.15)
    rgb[selected]=rgb[selected]*(1-strength)+np.array([185,246,246])*strength
    pixels[:,:,:3]=np.clip(rgb,0,255).astype(np.uint8);return Image.fromarray(pixels)

def idle(form,rest,i):
    light=[0,1,2,3,4,3,2,1][i]*.035
    if form=='body':raise ValueError('Body breathing must use its painted key poses')
    if form=='sun':
        # The ring, rays and aperture remain perfectly still. Only the small
        # crystal floats inside the opaque dark aperture, with no rotation.
        lift=[0,0,-1,-1,-2,-1,-1,0][i]
        image=cutout(rest,SUN_CRYSTAL,0,lift,under=(7,10,16,255),crystal=True)
        return crystal_light(image,[(68,40),(110,40),(110,99),(68,99)],light)
    # A free crystal may bob as one rigid sprite; no facet changes shape.
    lift=[0,0,-1,-1,-2,-1,-1,0][i]
    image=crystal_light(rest,[(61,30),(90,27),(121,66),(100,107),(84,115),(62,92)],light)
    return shift(image,0,lift)
