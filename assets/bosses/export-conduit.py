#!/usr/bin/env python3
"""Derive native vector pressure/attack poses; never overwrite the originals."""
from pathlib import Path
from xml.etree import ElementTree as ET
from copy import deepcopy
from math import sin, cos, sqrt, atan2, degrees, pi, hypot

root=Path(__file__).resolve().parents[2]
art=root/'src/dev/art'
source=(art/'conduit-regulator.svg').read_text()
portrait=source.replace('width="256" height="240" viewBox="0 0 256 240"','width="128" height="128" viewBox="64 34 128 128"',1)
assert portrait!=source
(art/'conduit-regulator-portrait.svg').write_text(portrait)
ET.register_namespace('','http://www.w3.org/2000/svg')
ns='{http://www.w3.org/2000/svg}'
parts=[e for e in ET.fromstring(source) if e.get('id')]
assert len(parts)==15
page=ET.Element(ns+'svg',{'width':'512','height':'1440','viewBox':'0 0 512 1440'})
ET.SubElement(page,ns+'title').text='Heart regulator: eight pressure-cycle and four discharge poses'
defs=ET.SubElement(page,ns+'defs');defs.extend(deepcopy(parts))
for part in defs:
    if part.get('id')=='dial':
        for child in list(part):
            if child.get('id')=='needle':part.remove(child)
for i in range(12):
    angle=[0,0,0,0,0,0,0,0,-12,-25,12,5][i]
    crank=45*i if i<8 else [0,90,180,270][i-8]
    joints={}
    for side,x,phase,old_pin in [('left',113,0,135),('right',143,pi,121)]:
        a=crank*pi/180+phase;px=128+7*cos(a);py=190+7*sin(a)
        y=py+sqrt(28**2-(px-x)**2)
        assert abs(hypot(x-px,y-py)-28)<1e-8
        joints[side]=(px,py,y,old_pin)
    frame=ET.SubElement(page,ns+'svg',{'x':str(i%2*256),'y':str(i//2*240),'width':'256','height':'240','viewBox':'0 0 256 240'})
    for part in parts:
        name=part.get('id');transform=''
        # The boiler, cowl, dial face, chassis, feet and idle arms are rigid.
        if name in ('left-arm','right-arm') and angle:
            left=name=='left-arm';transform=f'rotate({angle if left else -angle} {66 if left else 190} 110)'
        elif name=='crank':transform=f'rotate({crank} 128 190)'
        elif name.startswith('piston-'):
            y=joints[name.split('-')[1]][2];transform=f'translate(0 {y-207.320508:.5f})'
        elif name.startswith('rod-'):
            side=name.split('-')[1];px,py,y,old_pin=joints[side];x=113 if side=='left' else 143
            rotation=degrees(atan2(y-py,x-px)-atan2(17.320508,x-old_pin))
            transform=f'translate({px:.5f} {py:.5f}) rotate({rotation:.5f}) translate({-old_pin} -190)'
        elif name=='exhaust':
            phase=i%4;transform=f'translate(0 {-phase*2}) translate(204 15) scale({1+phase*.2:g}) translate(-204 -15)'
        use=ET.SubElement(frame,ns+'use',{'href':'#'+name})
        if transform:use.set('transform',transform)
        if name=='exhaust':use.set('opacity',str(1-(i%4)*.23))
    # The needle ticks with pressure in a stationary dial face.
    ET.SubElement(frame,ns+'path',{'d':'M128 112 139 104 132 115Z','fill':'#a95035','transform':f'rotate({[0,8,16,24,-16,-12,-8,-4,20,34,-20,-8][i]} 130 112)'})
    ET.SubElement(frame,ns+'path',{'d':'M127 110H132V115H127Z','fill':'#294b4e'})
ET.indent(page,space=' ')
(art/'conduit-regulator-motion.svg').write_text(ET.tostring(page,encoding='unicode')+'\n')
for name in ['conduit-regulator-portrait.svg','conduit-regulator-motion.svg']:
    size=(art/name).stat().st_size;assert size<=131072;print(f'{name}: {size} bytes')
