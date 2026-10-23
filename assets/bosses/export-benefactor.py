#!/usr/bin/env python3
"""Derive a vector portrait and articulated motion from the editable boss SVG.

Usage: python3 assets/bosses/export-benefactor.py
No bitmap input, panel assembly or resizing is involved. The boss and domain
SVGs are editable originals and this exporter never overwrites them.
"""
from pathlib import Path
from xml.etree import ElementTree as ET
from copy import deepcopy

root=Path(__file__).resolve().parents[2]
art=root/'public/art/vector/benefactor'
source=(art/'benefactor.svg').read_text()
svg=ET.fromstring(source)
assert (svg.attrib['width'],svg.attrib['height'])==('360','288')
# Keep the same native face/chest framing as the approved preview.
portrait=source.replace('width="360" height="288" viewBox="0 0 360 288"',
                        'width="128" height="128" viewBox="116 20 128 128"',1)
assert portrait!=source
portrait=portrait.replace('<title>The Benefactor</title>', '<title>The Benefactor, portrait</title>',1)
target=art/'benefactor-portrait.svg'
target.write_text(portrait)
assert target.stat().st_size<=131072
print(f'{target.relative_to(root)}: {target.stat().st_size} bytes; vector viewBox crop, no raster conversion')

# Every pose references the same editable geometry. No repeated source panels.
ET.register_namespace('','http://www.w3.org/2000/svg')
ns='{http://www.w3.org/2000/svg}'
parts=[e for e in svg if e.get('id')]
assert len(parts)==11
page=ET.Element(ns+'svg',{'width':'720','height':'1728','viewBox':'0 0 720 1728'})
ET.SubElement(page,ns+'title').text='The Benefactor: eight breathing and four judgment poses'
defs=ET.SubElement(page,ns+'defs');defs.extend(deepcopy(parts))
# rise, mantle opening, forearm rotation, hand follow-through
poses=[(r,s,-s*.8,0)for r,s in [(0,0),(-1,.4),(-2,.8),(-3,1.2),(-4,1.6),(-3,1.2),(-2,.8),(-1,.4)]]
poses += [(-2,1,-35,0),(-4,2,-85,0),(0,2,0,5),(-1,.8,-20,2)]
for i,(rise,spread,angle,drop) in enumerate(poses):
    frame=ET.SubElement(page,ns+'svg',{'x':str(i%2*360),'y':str(i//2*288),'width':'360','height':'288','viewBox':'0 0 360 288'})
    for part in parts:
        name=part.get('id');transform=''
        if name=='halo' and rise:transform=f'translate(0 {rise*.5:g})'
        elif name=='body-back' and rise:transform=f'translate(0 282) scale(1 {1-rise/177:g}) translate(0 -282)'
        elif name in ('cowl','heart') and rise:transform=f'translate(0 {rise*(.8 if name=="heart" else 1):g})'
        elif name=='vestment' and rise:transform=f'translate(180 282) scale({1-rise*.001:g} {1-rise/177:g}) translate(-180 -282)'
        elif name.startswith('mantle-') and spread:transform=f'translate({-spread if name.endswith("left") else spread:g} 0)'
        elif name.startswith('arm-') and rise:transform=f'translate(0 {rise*.35:g})'
        elif name.startswith('forearm-'):
            left=name.endswith('left')
            if rise or drop:transform=f'translate(0 {rise*.35+drop:g})'
            if angle:transform+=f' rotate({angle if left else -angle:g} {62 if left else 298} 184)'
        use=ET.SubElement(frame,ns+'use',{'href':'#'+name})
        if transform:use.set('transform',transform.strip())
ET.indent(page,space=' ')
target=art/'benefactor-motion.svg';target.write_text(ET.tostring(page,encoding='unicode')+'\n')
assert target.stat().st_size<=131072
print(f'{target.relative_to(root)}: {target.stat().st_size} bytes; 12 native vector poses, shared part definitions')

# Compact registered world actor and editable portrait are seeded only once.
actor=root/'public/art/vector/benefactor.svg'
actor.write_text(source.replace('width="360" height="288"','width="80" height="80"',1))
registered=root/'public/art/vector/portrait-benefactor.svg'
if not registered.exists():registered.write_text(portrait)
