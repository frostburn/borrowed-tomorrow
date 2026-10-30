"""Fold native gate leaves toward the passage, keeping both hinges fixed."""
def folded_leaves(leaves, progress, key):
 if not progress:return leaves
 scale=1-progress*7/9
 out=[]
 for side,x,pivot,direction in [('left',48,48,-1),('right',156,264,1)]:
  # Both free edges recede uphill into the passage: right is the mirror of left.
  shear=direction*progress*2/9
  matrix=' '.join(f'{v:.4f}'.rstrip('0').rstrip('.') for v in (scale,shear,0,1,(1-scale)*pivot,-shear*pivot))
  clip=f'{key}-{side}'
  out.append(f'<defs><clipPath id="{clip}"><rect x="{x}" y="30" width="108" height="154"/></clipPath></defs><g transform="matrix({matrix})"><g clip-path="url(#{clip})">{leaves}</g></g>')
 return ''.join(out)
