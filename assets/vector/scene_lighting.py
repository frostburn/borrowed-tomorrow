"""Ground spill shared by scene compilers; emitters live in chapter registries."""

def spill(pieces,props):
 out=[]
 for name,x,y in pieces:
  for light in props.get(name,[]):
   cx,cy=x+light['x'],y+light['y'];beam=light.get('beam');color='#9ac9c5'if light.get('color')else'#efbd82'
   if beam:
    a=beam['width'];r=beam['reach'];b=a+r*beam['spread']
    out.append(f'<path d="M{cx-a} {cy} L{cx+a} {cy} L{cx+r*.1+b} {cy+r} L{cx+r*.1-b} {cy+r}Z" fill="{color}" opacity=".12"/>')
   else:
    out.append(f'<ellipse cx="{cx}" cy="{cy}" rx="91" ry="32" fill="{color}" opacity=".08"/><ellipse cx="{cx}" cy="{cy}" rx="48" ry="18" fill="{color}" opacity=".12"/>')
 return ''.join(out)
