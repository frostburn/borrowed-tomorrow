#!/usr/bin/env python3
"""Derive native vector pressure/attack poses; never overwrite the originals."""
from pathlib import Path
from xml.etree import ElementTree as ET
from copy import deepcopy

root=Path(__file__).resolve().parents[2]
art=root/'src/dev/art'
source=(art/'conduit-regulator.svg').read_text()
portrait=source.replace('width="256" height="240" viewBox="0 0 256 240"','width="128" height="128" viewBox="64 34 128 128"',1)
assert portrait!=source
(art/'conduit-regulator-portrait.svg').write_text(portrait)
ET.register_namespace('','http://www.w3.org/2000/svg')
ns='{http://www.w3.org/2000/svg}'
parts=[e for e in ET.fromstring(source) if e.get('id')]
assert len(parts)==9
page=ET.Element(ns+'svg',{'width':'512','height':'1440','viewBox':'0 0 512 1440'})
ET.SubElement(page,ns+'title').text='Heart regulator: eight pressure-cycle and four discharge poses'
defs=ET.SubElement(page,ns+'defs');defs.extend(deepcopy(parts))
for part in defs:
    if part.get('id')=='dial':
        for child in list(part):
            if child.get('id')=='needle':part.remove(child)
for i in range(12):
    rise=[0,-1,-2,-3,-4,-3,-2,-1,-2,-4,1,0][i]
    angle=[0,0,0,0,0,0,0,0,-12,-25,12,5][i]
    frame=ET.SubElement(page,ns+'svg',{'x':str(i%2*256),'y':str(i//2*240),'width':'256','height':'240','viewBox':'0 0 256 240'})
    for part in parts:
        name=part.get('id');transform=''
        if name in ('boiler','cowl','dial'):transform=f'translate(0 {rise})'
        elif name in ('left-arm','right-arm'):
            left=name=='left-arm';transform=f'translate(0 {rise/2:g}) rotate({angle if left else -angle} {66 if left else 190} 110)'
        elif name=='exhaust':transform=f'translate({i%3-1} {-i%4})'
        use=ET.SubElement(frame,ns+'use',{'href':'#'+name})
        if transform:use.set('transform',transform)
    # The needle rocks in the dial; the three supporting feet stay fixed.
    ET.SubElement(frame,ns+'path',{'d':'M128 112 139 104 132 115Z','fill':'#a95035','transform':f'translate(0 {rise}) rotate({[0,4,8,12,16,12,8,4,20,34,-20,-8][i]} 130 112)'})
    ET.SubElement(frame,ns+'path',{'d':'M127 110H132V115H127Z','fill':'#294b4e','transform':f'translate(0 {rise})'})
ET.indent(page,space=' ')
(art/'conduit-regulator-motion.svg').write_text(ET.tostring(page,encoding='unicode')+'\n')
for name in ['conduit-regulator-portrait.svg','conduit-regulator-motion.svg']:
    size=(art/name).stat().st_size;assert size<=131072;print(f'{name}: {size} bytes')
